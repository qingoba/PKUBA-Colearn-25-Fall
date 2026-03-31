from __future__ import annotations

import time
from typing import Optional

from fastapi import APIRouter, Query

from backend.services.tron_adapter import TronDataAdapter
from backend.services.whale_detector import WhaleDetector

router = APIRouter(prefix="/api/whales", tags=["whales"])

adapter = TronDataAdapter()
detector = WhaleDetector()
from backend.models.schemas import WhaleListResponse

@router.get("", response_model=WhaleListResponse)
def get_whales(
    hours: int = Query(24, ge=1, le=168),
    limit: int = Query(20, ge=1, le=100),
    token: Optional[str] = Query(None),
):
    now_ts = int(time.time())
    min_ts = now_ts - hours * 3600

    # 多拉一些数据，避免过滤后不够
    raw_transfers = adapter.get_latest_transfers(limit=max(limit * 5, 100))

    filtered = []
    for record in raw_transfers:
        if record.timestamp < min_ts:
            continue
        if token is not None and str(record.token).upper() != token.upper():
            continue
        filtered.append(record)

    whale_events = detector.detect_whale_events(filtered)
    whale_events = detector.deduplicate_events(whale_events)

    whale_events = sorted(
        whale_events,
        key=lambda x: (x.amount, x.timestamp),
        reverse=True,
    )[:limit]

    largest_transfer = max((event.amount for event in whale_events), default=0.0)

    return {
        "hours": hours,
        "token_filter": token,
        "count": len(whale_events),
        "largest_transfer": largest_transfer,
        "events": [
            {
                "tx_hash": event.tx_hash,
                "timestamp": event.timestamp,
                "from_address": event.from_address,
                "to_address": event.to_address,
                "token": event.token,
                "amount": event.amount,
                "contract_address": event.contract_address,
                "whale_level": event.whale_level,
            }
            for event in whale_events
        ],
    }