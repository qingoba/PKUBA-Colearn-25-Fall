from __future__ import annotations

from backend.services.bank_ai.schemas import ToolDefinition


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, ToolDefinition] = {}
        self._register_defaults()

    def _register_defaults(self) -> None:
        self.register(
            ToolDefinition(
                name="get_recent_whale_transfers",
                description="Get recent whale transfers on TRON with time window, limit, and optional token filter.",
                provider="local",
                input_schema={
                    "type": "object",
                    "properties": {
                        "hours": {"type": "integer", "default": 24},
                        "limit": {"type": "integer", "default": 10},
                        "token": {"type": "string"},
                    },
                },
            )
        )

        self.register(
            ToolDefinition(
                name="analyze_tron_address",
                description="Analyze a TRON address and return profile and AI insight.",
                provider="local",
                input_schema={
                    "type": "object",
                    "properties": {
                        "address": {"type": "string"},
                    },
                    "required": ["address"],
                },
            )
        )

        self.register(
            ToolDefinition(
                name="summarize_recent_tron_activity",
                description="Summarize recent TRON whale activity in a given time window.",
                provider="local",
                input_schema={
                    "type": "object",
                    "properties": {
                        "hours": {"type": "integer", "default": 24},
                        "limit": {"type": "integer", "default": 5},
                    },
                },
            )
        )

        self.register(
            ToolDefinition(
                name="get_premium_address_report",
                description="Generate a premium deep report for a TRON address. This tool is payment-gated and x402-compatible.",
                provider="local",
                input_schema={
                    "type": "object",
                    "properties": {
                        "address": {"type": "string"},
                        "window_days": {"type": "integer", "default": 7},
                        "include_counterparty_analysis": {"type": "boolean", "default": True},
                        "include_risk_summary": {"type": "boolean", "default": True},
                    },
                    "required": ["address"],
                },
            )
        )

    def register(self, tool: ToolDefinition) -> None:
        self._tools[tool.name] = tool

    def get(self, name: str) -> ToolDefinition | None:
        return self._tools.get(name)

    def list_tools(self) -> list[ToolDefinition]:
        return list(self._tools.values())