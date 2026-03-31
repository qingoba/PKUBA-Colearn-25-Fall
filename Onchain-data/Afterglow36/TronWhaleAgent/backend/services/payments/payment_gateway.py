from __future__ import annotations

from typing import Any


class PaymentRequiredError(Exception):
    def __init__(self, payment_payload: dict[str, Any]) -> None:
        self.payment_payload = payment_payload
        super().__init__("Payment required")


class PaymentGateway:
    def require_payment(
        self,
        resource: str,
        amount: str,
        currency: str,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        raise NotImplementedError