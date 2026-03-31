from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


ToolProvider = Literal["local", "bankai_mcp"]
ToolStatus = Literal["success", "error"]


class ToolDefinition(BaseModel):
    name: str
    description: str
    provider: ToolProvider = "local"
    input_schema: dict[str, Any] = Field(default_factory=dict)


class ToolCall(BaseModel):
    tool_name: str
    arguments: dict[str, Any] = Field(default_factory=dict)


class ToolResult(BaseModel):
    tool_name: str
    provider: ToolProvider
    status: ToolStatus
    arguments: dict[str, Any] = Field(default_factory=dict)
    result: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None


class ToolTraceEntry(BaseModel):
    tool_name: str
    provider: ToolProvider
    arguments: dict[str, Any] = Field(default_factory=dict)
    status: ToolStatus
    error: str | None = None