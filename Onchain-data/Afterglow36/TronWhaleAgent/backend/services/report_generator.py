from __future__ import annotations

from backend.services.insight_agent import InsightAgent
from backend.services.tron_adapter import TronDataAdapter
from backend.services.whale_detector import WhaleDetector


class ReportGenerator:
    def __init__(self) -> None:
        self.adapter = TronDataAdapter()
        self.detector = WhaleDetector()
        self.agent = InsightAgent()

    def generate_daily_report(self) -> dict:
        transfers = self.adapter.get_latest_transfers(limit=100)
        events = self.detector.detect_whale_transfers(transfers)
        data = {
            "network": "TRON",
            "event_count": len(events),
            "largest_event": events[0].model_dump() if events else None,
            "top_events": [event.model_dump() for event in events[:5]],
        }
        insight = self.agent.generate_insight("whale_query", {
            "count": len(events),
            "top_amount": events[0].amount if events else 0,
            "window": "24h",
            "events": [event.model_dump() for event in events[:5]],
        })
        return {"report": data, "insight": insight.model_dump()}
