from __future__ import annotations

from fastapi import APIRouter

from backend.services.report_generator import ReportGenerator

router = APIRouter(prefix="/api/report", tags=["report"])
generator = ReportGenerator()


@router.get("/daily")
def get_daily_report():
    return generator.generate_daily_report()
