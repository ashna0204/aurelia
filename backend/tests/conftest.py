"""Shared pytest fixtures.

Environment is pinned *before* any ``app`` import: ``app.config`` refuses to
start without a strong ``API_KEY`` and caches ``Settings`` via ``lru_cache``, so
the values have to be in ``os.environ`` the first time the module is imported.
"""

import os

# 64 hex chars = 32 decoded bytes — exactly the entropy floor config enforces.
TEST_API_KEY = "0123456789abcdef" * 4

os.environ.setdefault("ENV", "local")
os.environ.setdefault("API_KEY", TEST_API_KEY)
# An in-memory URL for the *module* engine so nothing ever touches aurelia.db.
# Tests never use this engine — they build their own StaticPool engine below —
# but the module must construct *something* at import time.
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("RATE_LIMIT_PER_MINUTE", "5")
os.environ.setdefault("ADMIN_RATE_LIMIT_PER_MINUTE", "30")

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.limiter import limiter
from app.main import app


@pytest.fixture
def engine():
    """A fresh in-memory SQLite DB per test, schema built from the ORM metadata.

    ``StaticPool`` keeps a single shared connection so that a session opened in
    the test and a session opened inside a request handler (a different thread,
    since the routes are ``def`` handlers run in FastAPI's threadpool) see the
    same data.
    """
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(eng)
    yield eng
    Base.metadata.drop_all(eng)
    eng.dispose()


@pytest.fixture
def SessionLocal(engine):
    return sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture
def db_session(SessionLocal):
    """A session for arranging fixtures and asserting DB side effects directly."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(SessionLocal):
    """A ``TestClient`` with the DB dependency overridden onto the test engine.

    Constructed *without* the ``with`` context manager on purpose: entering it
    would fire the app lifespan, whose ``check_migrations()`` runs against the
    (unmigrated) module engine and raises. Background tasks still execute.
    """

    def override_get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    limiter.reset()

    test_client = TestClient(app)
    yield test_client

    app.dependency_overrides.clear()
    limiter.reset()


@pytest.fixture
def admin_headers():
    """Valid admin credentials for the protected endpoints."""
    return {"X-API-Key": TEST_API_KEY}


@pytest.fixture
def sent_emails(monkeypatch):
    """Configure SMTP and capture every message that would have been sent.

    Returns a list; each entry is the ``email.message.Message`` handed to
    ``aiosmtplib.send``. No network is touched. SMTP settings are populated so
    ``send_email`` proceeds past its "not configured" guard.
    """
    import aiosmtplib

    from app.config import get_settings

    settings = get_settings()
    monkeypatch.setattr(settings, "smtp_user", "sender@aurelia.test")
    monkeypatch.setattr(settings, "smtp_password", SecretStr("app-password"))
    monkeypatch.setattr(settings, "notification_email", "ops@aurelia.test")

    captured = []

    async def fake_send(message, **kwargs):
        captured.append(message)
        return {}

    monkeypatch.setattr(aiosmtplib, "send", fake_send)
    return captured


def email_text(message):
    """Flatten a captured MIME message to a single searchable string."""
    parts = []
    for part in message.walk():
        payload = part.get_payload(decode=True)
        if payload:
            parts.append(payload.decode("utf-8", "replace"))
    return "\n".join(parts)
