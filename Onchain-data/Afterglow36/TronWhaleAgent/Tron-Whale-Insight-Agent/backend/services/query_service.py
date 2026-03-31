from __future__ import annotations

from typing import Any

from backend.services.bank_ai.schemas import ToolCall, ToolTraceEntry
from backend.services.bank_ai.tool_executor import ToolExecutor


class QueryService:
    def __init__(self) -> None:
        self.tool_executor = ToolExecutor()

    def classify_query(self, question: str) -> str:
        q = question.lower().strip()

        if "premium" in q or "deep analyze" in q or "deep report" in q:
            return "premium_address_query"

        if "address" in q or self._contains_tron_address(question):
            return "address_query"

        if "largest" in q or "whale" in q or "biggest" in q:
            return "whale_query"

        return "summary_query"

    def build_tool_plan(self, question: str, query_type: str) -> list[ToolCall]:
        if query_type == "whale_query":
            return [
                ToolCall(
                    tool_name="get_recent_whale_transfers",
                    arguments={
                        "hours": 24,
                        "limit": 10,
                    },
                )
            ]

        if query_type == "address_query":
            address = self._extract_tron_address(question)
            return [
                ToolCall(
                    tool_name="analyze_tron_address",
                    arguments={
                        "address": address,
                    },
                )
            ]

        if query_type == "premium_address_query":
            address = self._extract_tron_address(question)
            return [
                ToolCall(
                    tool_name="get_premium_address_report",
                    arguments={
                        "address": address,
                        "window_days": 7,
                        "include_counterparty_analysis": True,
                        "include_risk_summary": True,
                    },
                )
            ]

        return [
            ToolCall(
                tool_name="summarize_recent_tron_activity",
                arguments={
                    "hours": 24,
                    "limit": 5,
                },
            )
        ]

    def run(self, question: str, payment_header: str | None = None) -> dict[str, Any]:
        query_type = self.classify_query(question)
        tool_plan = self.build_tool_plan(question, query_type)

        tool_results = []
        tool_trace: list[ToolTraceEntry] = []

        for tool_call in tool_plan:
            if query_type == "premium_address_query":
                tool_call.arguments["payment_header"] = payment_header

            result = self.tool_executor.execute(tool_call)
            tool_results.append(result)

            tool_trace.append(
                ToolTraceEntry(
                    tool_name=result.tool_name,
                    provider=result.provider,
                    arguments=result.arguments,
                    status=result.status,
                    error=result.error,
                )
            )

        answer = self._compose_answer(query_type, tool_results)

        return {
            "query_type": query_type,
            "tool_trace": [entry.model_dump() for entry in tool_trace],
            "answer": answer,
        }

    def _compose_answer(self, query_type: str, tool_results: list[Any]) -> dict[str, Any]:
        if not tool_results:
            return {"error": "No tool results returned."}

        first = tool_results[0]

        if first.status == "error":
            if isinstance(first.result, dict) and first.result.get("payment_required"):
                return {
                    "payment_required": True,
                    "payment_detail": first.result,
                }
            return {
                "error": first.error or "Tool execution failed."
            }

        result = first.result or {}

        if query_type == "whale_query":
            return {
                "count": result.get("count", 0),
                "top_amount": result.get("largest_transfer", 0.0),
                "window": f"{result.get('hours', 24)}h",
                "events": result.get("events", []),
            }

        if query_type == "address_query":
            return {
                "profile": result.get("profile", {}),
                "insight": result.get("insight", {}),
            }

        if query_type == "premium_address_query":
            return {
                "report_type": result.get("report_type"),
                "address": result.get("address"),
                "window_days": result.get("window_days"),
                "executive_summary": result.get("executive_summary"),
                "risk_summary": result.get("risk_summary", {}),
                "deep_metrics": result.get("deep_metrics", {}),
                "counterparty_analysis": result.get("counterparty_analysis", {}),
                "profile": result.get("profile", {}),
                "insight": result.get("insight", {}),
            }

        return {
            "summary": result.get("summary", "No summary generated."),
            "events": result.get("top_events", []),
        }

    def _contains_tron_address(self, text: str) -> bool:
        for token in text.replace("\n", " ").split():
            token = token.strip()
            if token.startswith("T") and len(token) >= 20:
                return True
        return False

    def _extract_tron_address(self, text: str) -> str:
        for token in text.replace("\n", " ").split():
            token = token.strip().strip(",.;:()[]{}")
            if token.startswith("T") and len(token) >= 20:
                return token

        return text.strip().split()[-1]