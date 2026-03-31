from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.address import router as address_router
from backend.api.query import router as query_router
from backend.api.report import router as report_router
from backend.api.whales import router as whales_router
from backend.api.premium import router as premium_router



app = FastAPI(title="TRON Whale Insight Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(whales_router)
app.include_router(address_router)
app.include_router(query_router)
app.include_router(report_router)
app.include_router(premium_router)
@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Tron Whale Insight Agent API"
    }

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://tron-whale-insight-agent-1.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)