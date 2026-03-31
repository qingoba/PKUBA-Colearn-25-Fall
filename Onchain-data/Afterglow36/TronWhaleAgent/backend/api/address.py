from __future__ import annotations

from fastapi import APIRouter

from backend.services.address_profiler import AddressProfiler
from backend.services.insight_agent import InsightAgent
from backend.services.tron_adapter import TronDataAdapter

router = APIRouter(prefix="/api/address", tags=["address"])

adapter = TronDataAdapter()
profiler = AddressProfiler()
insight_agent = InsightAgent()


@router.get("/{address}")
def get_address_profile(address: str):
    history = adapter.get_address_history(address, limit=200)
    profile = profiler.build_profile(address, history)
    insight = insight_agent.generate_address_insight(profile)

    return {
        "profile": profile,
        "insight": insight,
    }