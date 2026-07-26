"""
Application configuration — loads from .env file or environment variables.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "Aurelia Logistics API"
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

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()