"""
Application configuration — loads from .env file or environment variables.

Secrets are typed as SecretStr so they never render in a repr(), a debugger
frame, or an exception context. None of them carry a default: a missing secret
is a startup failure, not a silently degraded runtime.
"""

import base64
import binascii
from functools import lru_cache
from typing import Literal

from pydantic import SecretStr, model_validator
from pydantic_settings import BaseSettings

#: Minimum decoded entropy for the admin API key. 32 bytes = 256 bits.
MIN_API_KEY_BYTES = 32


def _decoded_entropy_bytes(value: str) -> int:
    """Best-effort decoded length of a key, in bytes.

    Accepts the two shapes an operator is likely to produce —
    ``openssl rand -hex 32`` (64 hex chars) and ``openssl rand -base64 32``
    (44 chars) — and falls back to the raw character count for anything else,
    which is the conservative reading for a hand-typed passphrase.
    """
    candidate = value.strip()

    try:
        return len(bytes.fromhex(candidate))
    except (ValueError, binascii.Error):
        pass

    try:
        # validate=True so ordinary ASCII text isn't silently treated as base64
        return len(base64.b64decode(candidate, validate=True))
    except (ValueError, binascii.Error):
        pass

    return len(candidate.encode("utf-8"))


class Settings(BaseSettings):
    # ─── App ───
    app_name: str = "Aurelia Logistics API"

    # Deployment environment. Drives the DEBUG guard, the /docs gate, and which
    # settings are mandatory.
    env: Literal["local", "staging", "production"] = "local"

    # Debug is opt-in and must never be enabled in production: it turns on
    # SQLAlchemy echo (which logs customer PII verbatim) and exposes the
    # interactive API docs.
    debug: bool = False

    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # ─── Database ───
    database_url: str = "sqlite:///./aurelia.db"

    # ─── SMTP ───
    # Credentials are optional in local development (the notifier no-ops with a
    # warning) but mandatory anywhere else — see _require_deployment_settings.
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: SecretStr = SecretStr("")
    # No default. A hardcoded fallback here previously meant that an unset
    # NOTIFICATION_EMAIL silently routed customer enquiries to a personal inbox.
    notification_email: str = ""

    # ─── Admin ───
    # Guards every endpoint that returns customer PII. Required in all
    # environments; validated for entropy below.
    api_key: SecretStr = SecretStr("")

    # ─── Audit ───
    # Destination for the append-only admin-access log. Empty logs to stdout,
    # which is fine for containers that ship stdout, but a real deployment
    # should point this at a durable append-only path or volume.
    audit_log_path: str = ""

    # ─── Rate limiting ───
    # Public submission endpoints, per client IP.
    rate_limit_per_minute: int = 5
    # Admin endpoints, per client IP.
    admin_rate_limit_per_minute: int = 30

    # Shared counter store. Empty means in-process memory, which is per-worker
    # and cleared on restart — permitted only when ENV=local (see limiter.py).
    #   e.g. redis://localhost:6379/0
    rate_limit_storage_uri: str = ""

    # Comma-separated IPs or CIDR blocks of reverse proxies permitted to set
    # X-Forwarded-For. Empty means "trust nothing" and fall back to the socket
    # peer, which is the safe default for a directly-exposed app.
    trusted_proxies: str = ""

    @property
    def trusted_proxy_list(self) -> list[str]:
        return [p.strip() for p in self.trusted_proxies.split(",") if p.strip()]

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

    @model_validator(mode="after")
    def _require_api_key(self) -> "Settings":
        """The admin key is the only control protecting stored customer PII.

        An empty key previously let the app boot "healthy" while every admin
        endpoint returned 503 — a misconfiguration that only surfaced when the
        operator tried to read their enquiries. Fail at startup instead.
        """
        key = self.api_key.get_secret_value()

        if not key:
            raise ValueError(
                "API_KEY is required. It protects every endpoint that returns "
                "customer personal data. Generate one with: openssl rand -hex 32"
            )

        entropy = _decoded_entropy_bytes(key)
        if entropy < MIN_API_KEY_BYTES:
            raise ValueError(
                f"API_KEY is too weak: {entropy} bytes of entropy, minimum is "
                f"{MIN_API_KEY_BYTES}. Generate one with: openssl rand -hex 32"
            )

        return self

    @model_validator(mode="after")
    def _require_deployment_settings(self) -> "Settings":
        """Outside local development, mail delivery must actually be configured.

        Locally, an unconfigured notifier is a convenience — the API still
        works and the send is skipped with a warning. In staging or production
        it means enquiries are accepted and silently never delivered, so the
        same condition has to be fatal.
        """
        if self.env == "local":
            return self

        missing = [
            name
            for name, value in (
                ("SMTP_USER", self.smtp_user),
                ("SMTP_PASSWORD", self.smtp_password.get_secret_value()),
                ("NOTIFICATION_EMAIL", self.notification_email),
            )
            if not value
        ]
        if missing:
            raise ValueError(
                f"{', '.join(missing)} must be set when ENV={self.env}. "
                "Without them, enquiries are accepted but the notification "
                "email is silently dropped."
            )

        return self

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
