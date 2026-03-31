from __future__ import annotations

from typing import Any

from backend.services.payments.payment_gateway import PaymentGateway, PaymentRequiredError


class MockPaymentGateway(PaymentGateway):
    """
    x402-compatible mock gateway for development.

    Current rule:
    - if request does not include `x-demo-payment: paid`
      then payment is considered missing
    """

    def require_payment(
        self,
        resource: str,
        amount: str,
        currency: str,
        metadata: dict[str, Any] | None = None,
        payment_header: str | None = None,
    ) -> None:
        if payment_header == "paid":
            return

        raise PaymentRequiredError(
            {
                "payment_required": True,
                "payment_scheme": "x402-compatible",
                "resource": resource,
                "amount": amount,
                "currency": currency,
                "metadata": metadata or {},
                "message": "Payment required to unlock premium report.",
            }
        )