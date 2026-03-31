from __future__ import annotations

import time
from typing import Any

from backend.services.address_profiler import AddressProfiler
from backend.services.insight_agent import InsightAgent
from backend.services.tron_adapter import TronDataAdapter
from backend.services.whale_detector import WhaleDetector
from backend.services.premium.premium_report_service import PremiumReportService
from backend.services.premium.report_formatter import ReportFormatter
from backend.services.payments.mock_gateway import MockPaymentGateway
from backend.services.payments.payment_gateway import PaymentRequiredError

class LocalToolService:
    def __init__(self) -> None:
        self.adapter = TronDataAdapter()
        self.profiler = AddressProfiler()
        self.insight_agent = InsightAgent()
        self.whale_detector = WhaleDetector()
        self.premium_report_service = PremiumReportService()
        self.report_formatter = ReportFormatter()
        self.payment_gateway = MockPaymentGateway()

        def get_premium_address_report(
            self,
            address: str,
            window_days: int = 7,
            include_counterparty_analysis: bool = True,
            include_risk_summary: bool = True,
            payment_header: str | None = None,
        ) -> dict[str, Any]:
            try:
                self.payment_gateway.require_payment(
                    resource="/api/premium/address-report",
                    amount="5",
                    currency="USDT",
                    metadata={
                        "product": "premium_address_report",
                        "address": address,
                        "window_days": window_days,
                    },
                    payment_header=payment_header,
                )
            except PaymentRequiredError as exc:
                return exc.payment_payload

            report = self.premium_report_service.generate_address_report(
                address=address,
                window_days=window_days,
                include_counterparty_analysis=include_counterparty_analysis,
                include_risk_summary=include_risk_summary,
            )
            return self.report_formatter.format_address_report(report)
        
    def get_recent_whale_transfers(
        self,
        hours: int = 24,
        limit: int = 10,
        token: str | None = None,
    ) -> dict[str, Any]:
        now_ts = int(time.time())
        min_ts = now_ts - hours * 3600

        raw_fetch_limit = max(limit * 20, 200)
        raw_transfers = self.adapter.get_latest_transfers(limit=raw_fetch_limit)

        filtered = []
        for record in raw_transfers:
            if record.timestamp < min_ts:
                continue
            if token and str(record.token).replace("TokenSymbol.", "").upper() != token.upper():
                continue
            filtered.append(record)

        whale_events = self.whale_detector.detect_whale_events(filtered)
        whale_events = self.whale_detector.deduplicate_events(whale_events)
        whale_events = sorted(
            whale_events,
            key=lambda x: (x.amount, x.timestamp),
            reverse=True,
        )[:limit]

        return {
            "hours": hours,
            "count": len(whale_events),
            "largest_transfer": max((e.amount for e in whale_events), default=0.0),
            "events": [
                {
                    "tx_hash": e.tx_hash,
                    "timestamp": e.timestamp,
                    "from_address": e.from_address,
                    "to_address": e.to_address,
                    "token": e.token,
                    "amount": e.amount,
                    "contract_address": e.contract_address,
                    "whale_level": e.whale_level,
                }
                for e in whale_events
            ],
        }

    def analyze_tron_address(self, address: str) -> dict[str, Any]:
        history = self.adapter.get_address_history(address, limit=200)
        profile = self.profiler.build_profile(address, history)
        insight = self.insight_agent.generate_address_insight(profile)

        return {
            "profile": profile,
            "insight": insight,
        }

    def summarize_recent_tron_activity(
        self,
        hours: int = 24,
        limit: int = 5,
    ) -> dict[str, Any]:
        whale_data = self.get_recent_whale_transfers(hours=hours, limit=limit)

        count = whale_data["count"]
        largest_transfer = whale_data["largest_transfer"]
        events = whale_data["events"]

        if count == 0:
            summary = f"No whale transfers detected on TRON in the last {hours} hours."
        else:
            top_token = "-"
            if events:
                token_counts: dict[str, int] = {}
                for e in events:
                    token = str(e["token"]).replace("TokenSymbol.", "")
                    token_counts[token] = token_counts.get(token, 0) + 1
                top_token = sorted(token_counts.items(), key=lambda x: x[1], reverse=True)[0][0]

            summary = (
                f"Detected {count} whale transfers on TRON in the last {hours} hours. "
                f"The largest transfer reached {largest_transfer:,.2f}, "
                f"and activity was dominated by {top_token}."
            )

        return {
            "summary": summary,
            "top_events": events,
        }