from __future__ import annotations

from collections import defaultdict
from typing import Any

from backend.models.schemas import TransferRecord


class AddressProfiler:
    def extract_features(self, address: str, history: list[TransferRecord]) -> dict[str, Any]:
        addr = address.lower()
        tx_count = len(history)

        inflow_usdt = 0.0
        outflow_usdt = 0.0
        max_transfer = 0.0
        total_amount = 0.0
        counterparties = set()
        stablecoin_amount = 0.0
        token_totals: dict[str, float] = defaultdict(float)
        active_days = set()

        largest_inflow = None
        largest_outflow = None

        counterparty_stats: dict[str, dict[str, Any]] = defaultdict(
            lambda: {"address": "", "tx_count": 0, "total_amount": 0.0}
        )

        recent_transfers = []

        for tx in history:
            amount = float(tx.amount)
            token = str(tx.token)
            total_amount += amount
            max_transfer = max(max_transfer, amount)
            token_totals[token] += amount
            active_days.add(tx.timestamp // 86400)

            counterparty = None

            if tx.to_address.lower() == addr:
                counterparty = tx.from_address
                if token == "USDT":
                    inflow_usdt += amount
                if largest_inflow is None or amount > largest_inflow["amount"]:
                    largest_inflow = {
                        "tx_hash": tx.tx_hash,
                        "amount": amount,
                        "from_address": tx.from_address,
                        "timestamp": tx.timestamp,
                        "token": token,
                    }

            elif tx.from_address.lower() == addr:
                counterparty = tx.to_address
                if token == "USDT":
                    outflow_usdt += amount
                if largest_outflow is None or amount > largest_outflow["amount"]:
                    largest_outflow = {
                        "tx_hash": tx.tx_hash,
                        "amount": amount,
                        "to_address": tx.to_address,
                        "timestamp": tx.timestamp,
                        "token": token,
                    }

            if counterparty:
                counterparties.add(counterparty)
                counterparty_stats[counterparty]["address"] = counterparty
                counterparty_stats[counterparty]["tx_count"] += 1
                counterparty_stats[counterparty]["total_amount"] += amount

            if token in {"USDT", "USDD"}:
                stablecoin_amount += amount

            recent_transfers.append(
                {
                    "tx_hash": tx.tx_hash,
                    "timestamp": tx.timestamp,
                    "from_address": tx.from_address,
                    "to_address": tx.to_address,
                    "token": token,
                    "amount": amount,
                    "contract_address": tx.contract_address,
                }
            )

        avg_transfer = total_amount / tx_count if tx_count else 0.0
        counterparty_count = len(counterparties)
        in_out_ratio = inflow_usdt / outflow_usdt if outflow_usdt > 0 else (1.0 if inflow_usdt > 0 else 0.0)
        stablecoin_ratio = stablecoin_amount / total_amount if total_amount > 0 else 0.0

        top_counterparties = sorted(
            counterparty_stats.values(),
            key=lambda x: (x["total_amount"], x["tx_count"]),
            reverse=True,
        )[:5]

        features = {
            "tx_count": tx_count,
            "inflow_usdt": round(inflow_usdt, 4),
            "outflow_usdt": round(outflow_usdt, 4),
            "max_transfer": round(max_transfer, 4),
            "avg_transfer": round(avg_transfer, 4),
            "counterparty_count": counterparty_count,
            "in_out_ratio": round(in_out_ratio, 4),
            "stablecoin_ratio": round(stablecoin_ratio, 4),
        }

        return {
            "address": address,
            "features": features,
            "largest_inflow": largest_inflow,
            "largest_outflow": largest_outflow,
            "top_counterparties": top_counterparties,
            "active_days": len(active_days),
            "token_breakdown": {k: round(v, 4) for k, v in token_totals.items()},
            "recent_transfers": sorted(recent_transfers, key=lambda x: x["timestamp"], reverse=True)[:20],
        }

    def label_address(self, profile: dict[str, Any]) -> list[str]:
        f = profile["features"]
        labels = []

        if f["max_transfer"] >= 100000:
            labels.append("whale_like")

        if f["tx_count"] >= 20:
            labels.append("highly_active")

        if f["counterparty_count"] <= 3 and f["outflow_usdt"] >= 200000:
            labels.append("fund_redistribution_pattern")

        if f["stablecoin_ratio"] >= 0.8:
            labels.append("stablecoin_heavy")

        return labels

    def detect_risk_signals(self, profile: dict[str, Any]) -> list[str]:
        f = profile["features"]
        signals = []

        if f["outflow_usdt"] >= 300000:
            signals.append("recent_large_outflows")

        if f["counterparty_count"] <= 2 and f["tx_count"] >= 10:
            signals.append("counterparty_concentration")

        if f["max_transfer"] >= 500000:
            signals.append("very_large_single_transfer")

        return signals

    def build_profile(self, address: str, history: list[TransferRecord]) -> dict[str, Any]:
        profile = self.extract_features(address, history)
        profile["labels"] = self.label_address(profile)
        profile["risk_signals"] = self.detect_risk_signals(profile)
        return profile