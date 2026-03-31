from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field

from pydantic import BaseModel

class WhaleEventResponse(BaseModel):
    tx_hash: str
    timestamp: int
    from_address: str
    to_address: str
    token: str
    amount: float
    contract_address: str
    whale_level: str


class WhaleListResponse(BaseModel):
    hours: int
    token_filter: str | None = None
    count: int
    largest_transfer: float
    events: list[WhaleEventResponse]

class TokenSymbol(str, Enum):
    USDT = "USDT"
    USDD = "USDD"
    UNKNOWN = "UNKNOWN"


class WhaleLevel(str, Enum):
    MEDIUM = "medium_whale"
    LARGE = "large_whale"
    MEGA = "mega_whale"


class TransferRecord(BaseModel):
    tx_hash: str
    timestamp: int
    from_address: str
    to_address: str
    token: TokenSymbol = TokenSymbol.UNKNOWN
    amount: float = Field(ge=0)
    contract_address: str | None = None
    network: str = "TRON"


class WhaleEvent(BaseModel):
    type: str = "whale_transfer"
    level: WhaleLevel
    token: TokenSymbol
    amount: float
    from_address: str
    to_address: str
    timestamp: int
    tx_hash: str


class AddressFeatures(BaseModel):
    tx_count: int = 0
    inflow_usdt: float = 0.0
    outflow_usdt: float = 0.0
    max_transfer: float = 0.0
    avg_transfer: float = 0.0
    counterparty_count: int = 0
    in_out_ratio: float = 0.0
    stablecoin_ratio: float = 0.0


class AddressProfile(BaseModel):
    address: str
    features: AddressFeatures
    labels: list[str]
    risk_signals: list[str]
    recent_transfers: list[TransferRecord]


class QueryRequest(BaseModel):
    question: str = Field(min_length=3)


class InsightResponse(BaseModel):
    summary: str
    key_signals: list[str]
    interpretation: str
    risk_note: str
    raw_data: dict[str, Any] | None = None


class QueryResponse(BaseModel):
    query_type: str
    answer: InsightResponse
    sources: list[str] = Field(default_factory=list)
