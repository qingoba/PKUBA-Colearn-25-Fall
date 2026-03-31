from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from backend.models.schemas import TransferRecord


@dataclass
class WhaleEvent:
    tx_hash: str
    timestamp: int
    from_address: str
    to_address: str
    token: str
    amount: float
    contract_address: str
    whale_level: str


class WhaleDetector:
    def __init__(
        self,
        medium_threshold: float = 100_000,
        large_threshold: float = 500_000,
        mega_threshold: float = 1_000_000,
    ) -> None:
        self.medium_threshold = medium_threshold
        self.large_threshold = large_threshold
        self.mega_threshold = mega_threshold

    def classify_whale_level(self, amount: float) -> str | None:
        if amount >= self.mega_threshold:
            return "mega_whale"
        if amount >= self.large_threshold:
            return "large_whale"
        if amount >= self.medium_threshold:
            return "medium_whale"
        return None

    def detect_whale_events(self, transfers: Iterable[TransferRecord]) -> list[WhaleEvent]:
        events: list[WhaleEvent] = []

        for record in transfers:
            level = self.classify_whale_level(float(record.amount))
            if level is None:
                continue

            events.append(
                WhaleEvent(
                    tx_hash=record.tx_hash,
                    timestamp=record.timestamp,
                    from_address=record.from_address,
                    to_address=record.to_address,
                    token=str(record.token),
                    amount=float(record.amount),
                    contract_address=record.contract_address,
                    whale_level=level,
                )
            )

        return events

    def deduplicate_events(self, events: Iterable[WhaleEvent]) -> list[WhaleEvent]:
        dedup: dict[tuple[str, str, float], WhaleEvent] = {}

        for event in events:
            key = (event.tx_hash, event.contract_address, float(event.amount))
            if key not in dedup:
                dedup[key] = event

        return list(dedup.values())