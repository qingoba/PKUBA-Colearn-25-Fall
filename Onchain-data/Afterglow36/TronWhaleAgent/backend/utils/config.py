from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic import BaseModel


load_dotenv()


class Settings(BaseModel):
    app_name: str = "TRON Whale Insight Agent API"
    app_env: str = os.getenv("APP_ENV", "dev")
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-5-mini")
    tron_api_base: str | None = os.getenv("TRON_API_BASE")
    use_mock_data: bool = os.getenv("USE_MOCK_DATA", "true").lower() == "true"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
