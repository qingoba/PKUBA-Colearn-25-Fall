from __future__ import annotations

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from backend.services.payments.mock_gateway import MockPaymentGateway
from backend.services.payments.payment_gateway import PaymentRequiredError
from backend.services.premium.premium_report_service import PremiumReportService
from backend.services.premium.report_formatter import ReportFormatter

router = APIRouter(prefix="/api/premium", tags=["premium"])

gateway = MockPaymentGateway()
report_service = PremiumReportService()
formatter = ReportFormatter()


class PremiumAddressReportRequest(BaseModel):
    address: str
    window_days: int = 7
    include_counterparty_analysis: bool = True
    include_risk_summary: bool = True


@router.post("/address-report")
def premium_address_report(
    request: PremiumAddressReportRequest,
    x_demo_payment: str | None = Header(default=None),
):
    try:
        gateway.require_payment(
            resource="/api/premium/address-report",
            amount="5",
            currency="USDT",
            metadata={
                "product": "premium_address_report",
                "address": request.address,
                "window_days": request.window_days,
            },
            payment_header=x_demo_payment,
        )
    except PaymentRequiredError as exc:
        raise HTTPException(status_code=402, detail=exc.payment_payload)

    report = report_service.generate_address_report(
        address=request.address,
        window_days=request.window_days,
        include_counterparty_analysis=request.include_counterparty_analysis,
        include_risk_summary=request.include_risk_summary,
    )
    return formatter.format_address_report(report)