"""
Application configuration — loads from .env file or environment variables.
"""

from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "Aurelia Logistics API"

    # Deployment environment. Drives the DEBUG guard below and, from Phase 2,
    # the gating of /docs and the CORS origin list.
    env: Literal["local", "staging", "production"] = "local"

    # Debug is opt-in and must never be enabled in production: it turns on
    # SQLAlchemy echo (which logs customer PII verbatim) and exposes the
    # interactive API docs.
    debug: bool = False

    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # Database
    database_url: str = "sqlite:///./aurelia.db"

    # SMTP for email notifications
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    notification_email: str = "ashnacp0225@gmail.com"

    # Admin API key — required to access admin endpoints
    api_key: str = ""

    # Rate limiting (applied to public submission endpoints)
    rate_limit_per_minute: int = 5

    @model_validator(mode="after")
    def _forbid_debug_in_production(self) -> "Settings":
        """Refuse to start a production server with debug enabled.

        DEBUG=true sets SQLAlchemy echo=True, which writes every bound
        parameter — customer names, emails and phone numbers — into the
        application log, and it unblinds /docs. Both are unacceptable in
        production, so this fails at import time rather than at first request.
        """
        if self.debug and self.env == "production":
            raise ValueError(
                "DEBUG=true is not permitted when ENV=production: it enables "
                "SQLAlchemy statement logging (customer PII leaks into logs) "
                "and exposes the interactive API docs. Set DEBUG=false."
            )
        return self

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()