from __future__ import annotations

from typing import Any


class ReportFormatter:
    def format_address_report(self, report: dict[str, Any]) -> dict[str, Any]:
        return {
            "report_type": "premium_address_report",
            "address": report.get("address"),
            "window_days": report.get("window_days"),
            "executive_summary": report.get("executive_summary"),
            "risk_summary": report.get("risk_summary", {}),
            "deep_metrics": report.get("deep_metrics", {}),
            "counterparty_analysis": report.get("counterparty_analysis", {}),
            "profile": report.get("profile", {}),
            "insight": report.get("insight", {}),
        }