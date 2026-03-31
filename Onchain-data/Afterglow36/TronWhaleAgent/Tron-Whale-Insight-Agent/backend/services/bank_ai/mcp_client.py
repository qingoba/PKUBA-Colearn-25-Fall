from __future__ import annotations

import os
from typing import Any

import requests


class BankAIMCPClient:
    def __init__(self) -> None:
        self.enabled = self._get_bool("ENABLE_BANKAI_MCP", default=False)
        self.base_url = os.getenv("BANKAI_MCP_BASE_URL", "").rstrip("/")
        self.api_key = os.getenv("BANKAI_MCP_API_KEY", "")
        self.timeout = float(os.getenv("BANKAI_MCP_TIMEOUT_SECONDS", "15"))

        self.session = requests.Session()
        self.session.headers.update({"Accept": "application/json"})
        if self.api_key:
            self.session.headers.update({"Authorization": f"Bearer {self.api_key}"})

    def is_available(self) -> bool:
        return self.enabled and bool(self.base_url)

    def call_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """
        Expected MCP-style request:
        POST {BANKAI_MCP_BASE_URL}/tools/call
        {
          "tool_name": "...",
          "arguments": {...}
        }

        Expected response:
        {
          "success": true,
          "result": {...}
        }
        """
        if not self.is_available():
            raise RuntimeError("Bank AI MCP client is not enabled or base URL is missing.")

        url = f"{self.base_url}/tools/call"
        payload = {
            "tool_name": tool_name,
            "arguments": arguments,
        }

        response = self.session.post(url, json=payload, timeout=self.timeout)
        response.raise_for_status()

        data = response.json()
        if not isinstance(data, dict):
            raise RuntimeError("Invalid MCP response format.")

        success = data.get("success", True)
        if not success:
            raise RuntimeError(data.get("error", "Unknown MCP tool execution error."))

        return data.get("result", {})

    def _get_bool(self, name: str, default: bool = False) -> bool:
        value = os.getenv(name)
        if value is None:
            return default
        return value.strip().lower() in {"1", "true", "yes", "on"}