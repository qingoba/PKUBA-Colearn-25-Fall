from __future__ import annotations

import os

from backend.services.bank_ai.mcp_client import BankAIMCPClient
from backend.services.bank_ai.schemas import ToolCall, ToolResult
from backend.services.bank_ai.tool_registry import ToolRegistry
from backend.services.bank_ai.tools import LocalToolService


class ToolExecutor:
    def __init__(self) -> None:
        self.registry = ToolRegistry()
        self.local_tools = LocalToolService()
        self.mcp_client = BankAIMCPClient()
        self.enable_local_fallback = self._get_bool("ENABLE_LOCAL_TOOL_FALLBACK", default=True)

    def execute(self, tool_call: ToolCall) -> ToolResult:
        tool_def = self.registry.get(tool_call.tool_name)
        if tool_def is None:
            return ToolResult(
                tool_name=tool_call.tool_name,
                provider="local",
                status="error",
                arguments=tool_call.arguments,
                result={},
                error=f"Unknown tool: {tool_call.tool_name}",
            )

        # Step 3 关键逻辑：
        # 若开启 MCP，则优先尝试 MCP；失败时可 fallback 到 local
        if self.mcp_client.is_available():
            try:
                result = self.mcp_client.call_tool(
                    tool_name=tool_call.tool_name,
                    arguments=tool_call.arguments,
                )
                return ToolResult(
                    tool_name=tool_call.tool_name,
                    provider="bankai_mcp",
                    status="success",
                    arguments=tool_call.arguments,
                    result=result,
                    error=None,
                )
            except Exception as exc:  # noqa: BLE001
                if not self.enable_local_fallback:
                    return ToolResult(
                        tool_name=tool_call.tool_name,
                        provider="bankai_mcp",
                        status="error",
                        arguments=tool_call.arguments,
                        result={},
                        error=f"MCP execution failed: {exc}",
                    )

        # fallback / default
        return self._execute_local(tool_call)

    def _execute_local(self, tool_call: ToolCall) -> ToolResult:
        try:
            if tool_call.tool_name == "get_recent_whale_transfers":
                result = self.local_tools.get_recent_whale_transfers(
                    hours=int(tool_call.arguments.get("hours", 24)),
                    limit=int(tool_call.arguments.get("limit", 10)),
                    token=tool_call.arguments.get("token"),
                )
            elif tool_call.tool_name == "analyze_tron_address":
                address = tool_call.arguments.get("address", "")
                result = self.local_tools.analyze_tron_address(address=address)
            elif tool_call.tool_name == "summarize_recent_tron_activity":
                result = self.local_tools.summarize_recent_tron_activity(
                    hours=int(tool_call.arguments.get("hours", 24)),
                    limit=int(tool_call.arguments.get("limit", 5)),
                )
            elif tool_call.tool_name == "get_premium_address_report":
                result = self.local_tools.get_premium_address_report(
                    address=tool_call.arguments.get("address", ""),
                    window_days=int(tool_call.arguments.get("window_days", 7)),
                    include_counterparty_analysis=bool(
                        tool_call.arguments.get("include_counterparty_analysis", True)
                    ),
                    include_risk_summary=bool(
                        tool_call.arguments.get("include_risk_summary", True)
                    ),
                    payment_header=tool_call.arguments.get("payment_header"),
                )
                if isinstance(result, dict) and result.get("payment_required"):
                    return ToolResult(
                        tool_name=tool_call.tool_name,
                        provider="local",
                        status="error",
                        arguments=tool_call.arguments,
                        result=result,
                        error="Payment required",
                    )
            else:
                return ToolResult(
                    tool_name=tool_call.tool_name,
                    provider="local",
                    status="error",
                    arguments=tool_call.arguments,
                    result={},
                    error=f"Unhandled local tool: {tool_call.tool_name}",
                )

            return ToolResult(
                tool_name=tool_call.tool_name,
                provider="local",
                status="success",
                arguments=tool_call.arguments,
                result=result,
                error=None,
            )

        except Exception as exc:  # noqa: BLE001
            return ToolResult(
                tool_name=tool_call.tool_name,
                provider="local",
                status="error",
                arguments=tool_call.arguments,
                result={},
                error=str(exc),
            )

    def _get_bool(self, name: str, default: bool = False) -> bool:
        value = os.getenv(name)
        if value is None:
            return default
        return value.strip().lower() in {"1", "true", "yes", "on"}