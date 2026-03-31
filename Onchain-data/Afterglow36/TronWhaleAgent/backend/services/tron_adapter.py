from __future__ import annotations

import hashlib
import logging
import os
from decimal import Decimal, InvalidOperation
from typing import Any, Iterable

import requests

from backend.models.schemas import TokenSymbol, TransferRecord
from backend.utils.config import get_settings

logger = logging.getLogger(__name__)


class TronDataAdapter:
    """TRON data adapter.

    Behavior:
    - If settings.use_mock_data is True: return local mock data.
    - Otherwise:
        * get_latest_transfers() fetches recent Transfer events from tracked TRC20 contracts
          (USDT / USDD by default) via TronGrid contract event APIs.
        * get_address_history() fetches TRC20 transfer history for an address via
          TronGrid account TRC20 transaction APIs.
    """

    DEFAULT_API_BASE = "https://api.trongrid.io/v1"

    # TRON mainnet token contracts
    USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
    USDD_CONTRACT = "TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn"

    BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

    def __init__(self) -> None:
        self.settings = get_settings()

        self.api_base = (
            getattr(self.settings, "tron_api_base_url", None)
            or os.getenv("TRON_API_BASE_URL")
            or self.DEFAULT_API_BASE
        ).rstrip("/")

        self.api_key = (
            getattr(self.settings, "trongrid_api_key", None)
            or os.getenv("TRONGRID_API_KEY")
            or os.getenv("TRON_API_KEY")
        )

        timeout = getattr(self.settings, "tron_api_timeout_seconds", None) or os.getenv(
            "TRON_API_TIMEOUT_SECONDS"
        )
        self.timeout = float(timeout) if timeout else 15.0

        self.session = requests.Session()
        self.session.headers.update({"Accept": "application/json"})
        if self.api_key:
            self.session.headers.update({"TRON-PRO-API-KEY": self.api_key})

        self.tracked_contracts: dict[str, TokenSymbol] = {
            self.USDT_CONTRACT: TokenSymbol.USDT,
            self.USDD_CONTRACT: TokenSymbol.USDD,
        }

    def get_latest_transfers(self, limit: int = 100) -> list[TransferRecord]:
        if getattr(self.settings, "use_mock_data", True):
            return self._mock_transfers()[:limit]

        records: list[TransferRecord] = []
        per_contract_limit = min(max(limit, 20), 200)

        for contract_address, token_symbol in self.tracked_contracts.items():
            try:
                events = self._fetch_contract_transfer_events(
                    contract_address=contract_address,
                    limit=per_contract_limit,
                )
                for event in events:
                    record = self._parse_contract_event(event, contract_address, token_symbol)
                    if record is not None:
                        records.append(record)
            except Exception as exc:  # noqa: BLE001
                logger.exception(
                    "Failed to fetch TRC20 contract events for %s: %s",
                    contract_address,
                    exc,
                )

        deduped: dict[tuple[str, str, float], TransferRecord] = {}
        for record in records:
            key = (record.tx_hash, record.contract_address, float(record.amount))
            deduped[key] = record

        merged = sorted(deduped.values(), key=lambda r: r.timestamp, reverse=True)
        return merged[:limit]

    def get_large_usdt_transfers(self, min_amount: float = 100_000, limit: int = 100) -> list[TransferRecord]:
        records = [
            record
            for record in self.get_latest_transfers(limit=max(limit * 3, 100))
            if record.token == TokenSymbol.USDT and record.amount >= min_amount
        ]
        return records[:limit]

    def get_address_history(self, address: str, limit: int = 200) -> list[TransferRecord]:
        normalized_address = self._normalize_tron_address(address)

        if getattr(self.settings, "use_mock_data", True):
            address_lower = normalized_address.lower()
            return [
                record
                for record in self.get_latest_transfers(limit=500)
                if record.from_address.lower() == address_lower or record.to_address.lower() == address_lower
            ][:limit]

        try:
            raw_items = self._fetch_account_trc20_history(address=normalized_address, limit=min(limit, 200))
        except Exception as exc:  # noqa: BLE001
            logger.exception("Failed to fetch address history for %s: %s", normalized_address, exc)
            return []

        records: list[TransferRecord] = []
        for item in raw_items:
            record = self._parse_account_trc20_item(item)
            if record is not None:
                records.append(record)

        return sorted(records, key=lambda r: r.timestamp, reverse=True)[:limit]

    def get_counterparties(self, address: str, history: Iterable[TransferRecord]) -> set[str]:
        address_lower = self._normalize_tron_address(address).lower()
        counterparties: set[str] = set()
        for record in history:
            if record.from_address.lower() == address_lower:
                counterparties.add(record.to_address)
            elif record.to_address.lower() == address_lower:
                counterparties.add(record.from_address)
        return counterparties

    # -------------------------------------------------------------------------
    # TronGrid fetch helpers
    # -------------------------------------------------------------------------

    def _fetch_contract_transfer_events(self, contract_address: str, limit: int = 100) -> list[dict[str, Any]]:
        url = f"{self.api_base}/contracts/{contract_address}/events"
        params = {
            "event_name": "Transfer",
            "only_confirmed": "true",
            "order_by": "block_timestamp,desc",
            "limit": min(limit, 200),
        }
        payload = self._get_json(url, params=params)
        return payload.get("data", []) or []

    def _fetch_account_trc20_history(self, address: str, limit: int = 200) -> list[dict[str, Any]]:
        url = f"{self.api_base}/accounts/{address}/transactions/trc20"
        params = {
            "only_confirmed": "true",
            "order_by": "block_timestamp,desc",
            "limit": min(limit, 200),
        }
        payload = self._get_json(url, params=params)
        return payload.get("data", []) or []

    def _get_json(self, url: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        response = self.session.get(url, params=params, timeout=self.timeout)
        response.raise_for_status()
        data = response.json()
        if not isinstance(data, dict):
            raise ValueError(f"Unexpected response shape from {url}: {type(data)}")
        return data

    # -------------------------------------------------------------------------
    # Parsers
    # -------------------------------------------------------------------------

    def _parse_contract_event(
        self,
        event: dict[str, Any],
        contract_address: str,
        default_token: TokenSymbol,
    ) -> TransferRecord | None:
        result = event.get("result") or {}
        token_info = event.get("token_info") or {}

        tx_hash = (
            event.get("transaction_id")
            or event.get("transaction")
            or event.get("tx_id")
            or event.get("id")
        )
        if not tx_hash:
            return None

        from_address = (
            result.get("from")
            or result.get("_from")
            or result.get("src")
            or result.get("owner")
        )
        to_address = (
            result.get("to")
            or result.get("_to")
            or result.get("dst")
            or result.get("spender")
        )
        raw_value = (
            result.get("value")
            or result.get("_value")
            or result.get("amount")
        )

        if not from_address or not to_address or raw_value is None:
            return None

        decimals = self._extract_decimals(token_info, contract_address)
        amount = self._normalize_amount(raw_value, decimals)
        token = self._infer_token_symbol(contract_address, token_info, default_token)
        timestamp = self._extract_timestamp(event)

        return TransferRecord(
            tx_hash=str(tx_hash),
            timestamp=timestamp,
            from_address=self._normalize_tron_address(str(from_address)),
            to_address=self._normalize_tron_address(str(to_address)),
            token=token,
            amount=float(amount),
            contract_address=contract_address,
        )

    def _parse_account_trc20_item(self, item: dict[str, Any]) -> TransferRecord | None:
        token_info = item.get("token_info") or {}
        contract_address = (
            item.get("token_info", {}).get("address")
            or item.get("contract_address")
            or item.get("token_id")
            or item.get("contract")
        )

        tx_hash = (
            item.get("transaction_id")
            or item.get("transaction")
            or item.get("tx_id")
            or item.get("id")
        )
        from_address = item.get("from")
        to_address = item.get("to")
        raw_value = item.get("value")

        if not tx_hash or not from_address or not to_address or raw_value is None:
            return None

        decimals = self._extract_decimals(token_info, contract_address)
        amount = self._normalize_amount(raw_value, decimals)
        token = self._infer_token_symbol(contract_address, token_info, fallback=None)

        if token is None:
            return None

        timestamp = self._extract_timestamp(item)
        return TransferRecord(
            tx_hash=str(tx_hash),
            timestamp=timestamp,
            from_address=self._normalize_tron_address(str(from_address)),
            to_address=self._normalize_tron_address(str(to_address)),
            token=token,
            amount=float(amount),
            contract_address=str(contract_address or ""),
        )

    def _extract_timestamp(self, item: dict[str, Any]) -> int:
        raw_ts = (
            item.get("block_timestamp")
            or item.get("timestamp")
            or item.get("time")
            or 0
        )
        try:
            ts = int(raw_ts)
        except (TypeError, ValueError):
            return 0

        if ts > 10_000_000_000:
            ts //= 1000
        return ts

    def _extract_decimals(self, token_info: dict[str, Any], contract_address: str | None) -> int:
        decimals = token_info.get("decimals")
        if decimals is not None:
            try:
                return int(decimals)
            except (TypeError, ValueError):
                pass

        if contract_address == self.USDT_CONTRACT:
            return 6
        if contract_address == self.USDD_CONTRACT:
            return 18
        return 6

    def _normalize_amount(self, raw_value: Any, decimals: int) -> Decimal:
        try:
            value = Decimal(str(raw_value))
        except (InvalidOperation, TypeError, ValueError):
            return Decimal("0")

        if decimals < 0:
            decimals = 0

        scale = Decimal(10) ** decimals
        if scale == 0:
            return value
        return value / scale

    def _infer_token_symbol(
        self,
        contract_address: str | None,
        token_info: dict[str, Any],
        fallback: TokenSymbol | None,
    ) -> TokenSymbol | None:
        if contract_address in self.tracked_contracts:
            return self.tracked_contracts[contract_address]

        symbol = str(token_info.get("symbol") or "").upper()
        if symbol == "USDT":
            return TokenSymbol.USDT
        if symbol == "USDD":
            return TokenSymbol.USDD

        return fallback

    # -------------------------------------------------------------------------
    # Address normalization
    # -------------------------------------------------------------------------

    def _normalize_tron_address(self, address: str) -> str:
        """
        Normalize TRON addresses into Base58Check form (T...).

        Handles:
        - already-normalized Base58 addresses: T...
        - hex with 0x prefix
        - hex starting with 41
        """
        if not address:
            return address

        addr = address.strip()
        if addr.startswith("T"):
            return addr

        hex_addr = addr.lower()
        if hex_addr.startswith("0x"):
            hex_addr = hex_addr[2:]

        # Ethereum-like 20-byte hex => prepend TRON mainnet prefix 41
        if len(hex_addr) == 40:
            hex_addr = "41" + hex_addr

        if len(hex_addr) != 42 or not self._is_hex(hex_addr):
            return address

        try:
            payload = bytes.fromhex(hex_addr)
            return self._base58check_encode(payload)
        except Exception:  # noqa: BLE001
            logger.warning("Failed to normalize TRON address: %s", address)
            return address

    def _is_hex(self, value: str) -> bool:
        try:
            int(value, 16)
            return True
        except ValueError:
            return False

    def _base58check_encode(self, payload: bytes) -> str:
        checksum = hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4]
        raw = payload + checksum
        return self._base58_encode(raw)

    def _base58_encode(self, data: bytes) -> str:
        num = int.from_bytes(data, "big")
        encoded = ""

        while num > 0:
            num, rem = divmod(num, 58)
            encoded = self.BASE58_ALPHABET[rem] + encoded

        # preserve leading zero bytes
        pad = 0
        for b in data:
            if b == 0:
                pad += 1
            else:
                break

        return "1" * pad + (encoded or "1")

    # -------------------------------------------------------------------------
    # Mock data
    # -------------------------------------------------------------------------

    def _mock_transfers(self) -> list[TransferRecord]:
        return [
            TransferRecord(
                tx_hash="0xtron001",
                timestamp=1710000001,
                from_address="TWhaleAlpha1111111111111111111111",
                to_address="TExchangeHot999999999999999999999",
                token=TokenSymbol.USDT,
                amount=1_500_000,
                contract_address=self.USDT_CONTRACT,
            ),
            TransferRecord(
                tx_hash="0xtron002",
                timestamp=1710000400,
                from_address="TWhaleBeta2222222222222222222222",
                to_address="TDeskWallet888888888888888888888",
                token=TokenSymbol.USDT,
                amount=620_000,
                contract_address=self.USDT_CONTRACT,
            ),
            TransferRecord(
                tx_hash="0xtron003",
                timestamp=1710000800,
                from_address="TRetail3333333333333333333333333",
                to_address="TWhaleAlpha1111111111111111111111",
                token=TokenSymbol.USDT,
                amount=120_000,
                contract_address=self.USDT_CONTRACT,
            ),
            TransferRecord(
                tx_hash="0xtron004",
                timestamp=1710001200,
                from_address="TWhaleAlpha1111111111111111111111",
                to_address="TResearch77777777777777777777777",
                token=TokenSymbol.USDD,
                amount=88_000,
                contract_address=self.USDD_CONTRACT,
            ),
            TransferRecord(
                tx_hash="0xtron005",
                timestamp=1710001600,
                from_address="TExchangeHot999999999999999999999",
                to_address="TMarketMaker66666666666666666666",
                token=TokenSymbol.USDT,
                amount=430_000,
                contract_address=self.USDT_CONTRACT,
            ),
            TransferRecord(
                tx_hash="0xtron006",
                timestamp=1710002000,
                from_address="TWhaleAlpha1111111111111111111111",
                to_address="TExchangeHot999999999999999999999",
                token=TokenSymbol.USDT,
                amount=510_000,
                contract_address=self.USDT_CONTRACT,
            ),
            TransferRecord(
                tx_hash="0xtron007",
                timestamp=1710002400,
                from_address="TFund55555555555555555555555555",
                to_address="TWhaleBeta2222222222222222222222",
                token=TokenSymbol.USDT,
                amount=75_000,
                contract_address=self.USDT_CONTRACT,
            ),
        ]