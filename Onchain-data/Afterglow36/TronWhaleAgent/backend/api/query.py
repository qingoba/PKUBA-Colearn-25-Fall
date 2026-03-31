from __future__ import annotations

from fastapi import APIRouter, Header
from pydantic import BaseModel

from backend.services.query_service import QueryService

router = APIRouter(prefix="/api/query", tags=["query"])

service = QueryService()


class QueryRequest(BaseModel):
    question: str


@router.post("")
def query_agent(
    request: QueryRequest,
    x_demo_payment: str | None = Header(default=None),
):
    return service.run(request.question, payment_header=x_demo_payment)