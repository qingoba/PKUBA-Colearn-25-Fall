from __future__ import annotations

from collections import defaultdict
from typing import Any

from backend.services.address_profiler import AddressProfiler
from backend.services.insight_agent import InsightAgent
from backend.services.tron_adapter import TronDataAdapter


class PremiumReportService:
    def __init__(self) -> None:
        self.adapter = TronDataAdapter()
        self.profiler = AddressProfiler()
        self.insight_agent = InsightAgent()

    def generate_address_report(
        self,
        address: str,
        window_days: int = 7,
        include_counterparty_analysis: bool = True,
        include_risk_summary: bool = True,
    ) -> dict[str, Any]:
        history = self.adapter.get_address_history(address, limit=500)
        profile = self.profiler.build_profile(address, history)
        insight = self.insight_agent.generate_address_insight(profile)

        report = {
            "address": address,
            "window_days": window_days,
            "profile": profile,
            "insight": insight,
            "deep_metrics": self._build_deep_metrics(profile),
        }

        if include_counterparty_analysis:
            report["counterparty_analysis"] = self._build_counterparty_analysis(profile)

        if include_risk_summary:
            report["risk_summary"] = self._build_risk_summary(profile, insight)

        report["executive_summary"] = self._build_executive_summary(report)
        return report

    def _build_deep_metrics(self, profile: dict[str, Any]) -> dict[str, Any]:
        features = profile.get("features", {})
        recent_transfers = profile.get("recent_transfers", [])

        total_volume = sum(float(x.get("amount", 0)) for x in recent_transfers)
        avg_recent_transfer = total_volume / len(recent_transfers) if recent_transfers else 0.0

        inflow = float(features.get("inflow_usdt", 0))
        outflow = float(features.get("outflow_usdt", 0))
        netflow = inflow - outflow

        return {
            "recent_transfer_count": len(recent_transfers),
            "recent_total_volume": round(total_volume, 4),
            "average_recent_transfer": round(avg_recent_transfer, 4),
            "netflow_usdt": round(netflow, 4),
            "activity_intensity_score": self._activity_intensity_score(features),
        }

    def _build_counterparty_analysis(self, profile: dict[str, Any]) -> dict[str, Any]:
        counterparties = profile.get("top_counterparties", []) or []
        total_counterparty_volume = sum(float(x.get("total_amount", 0)) for x in counterparties)

        concentration_ratio = 0.0
        if counterparties and total_counterparty_volume > 0:
            top1 = float(counterparties[0].get("total_amount", 0))
            concentration_ratio = top1 / total_counterparty_volume

        return {
            "top_counterparties": counterparties,
            "counterparty_concentration_ratio": round(concentration_ratio, 4),
            "counterparty_count": profile.get("features", {}).get("counterparty_count", 0),
        }

    def _build_risk_summary(self, profile: dict[str, Any], insight: dict[str, Any]) -> dict[str, Any]:
        labels = profile.get("labels", [])
        risk_signals = profile.get("risk_signals", [])

        severity = "low"
        if "very_large_single_transfer" in risk_signals or "recent_large_outflows" in risk_signals:
            severity = "high"
        elif risk_signals or labels:
            severity = "medium"

        return {
            "severity": severity,
            "labels": labels,
            "risk_signals": risk_signals,
            "risk_note": insight.get("risk_note", ""),
        }

    def _build_executive_summary(self, report: dict[str, Any]) -> str:
        profile = report.get("profile", {})
        features = profile.get("features", {})
        risk_summary = report.get("risk_summary", {})
        deep_metrics = report.get("deep_metrics", {})

        return (
            f"This premium report analyzes address {report.get('address')} over the last "
            f"{report.get('window_days')} days. The address recorded "
            f"{features.get('tx_count', 0)} transactions, with max transfer "
            f"{features.get('max_transfer', 0)}, netflow USDT "
            f"{deep_metrics.get('netflow_usdt', 0)}, and risk severity "
            f"{risk_summary.get('severity', 'unknown')}."
        )

    def _activity_intensity_score(self, features: dict[str, Any]) -> float:
        tx_count = float(features.get("tx_count", 0))
        max_transfer = float(features.get("max_transfer", 0))
        counterparty_count = float(features.get("counterparty_count", 0))

        score = tx_count * 0.4 + counterparty_count * 0.3 + min(max_transfer / 100000, 20) * 0.3
        return round(score, 4)