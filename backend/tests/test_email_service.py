"""Email service — content, escaping, and failure handling. No real SMTP."""

import pytest
from pydantic import SecretStr

from app.config import get_settings
from app.email_service import notify_new_contact, notify_new_quote, send_email
from tests.conftest import email_text


async def test_notify_new_quote_sends_expected_recipient_and_subject(sent_emails):
    ok = await notify_new_quote(
        {
            "name": "Priya Menon",
            "email": "priya@example.com",
            "products": ["Food & Grocery"],
            "message": "Need Matta Rice.",
        }
    )

    assert ok is True
    assert len(sent_emails) == 1
    msg = sent_emails[0]
    assert msg["To"] == "ops@aurelia.test"
    assert "Priya Menon" in msg["Subject"]
    assert "Food & Grocery" in msg["Subject"]
    body = email_text(msg)
    assert "priya@example.com" in body
    assert "Need Matta Rice." in body


async def test_notify_new_quote_keeps_apostrophe_raw_in_subject(sent_emails):
    await notify_new_quote({"name": "O'Brien", "email": "o@x.com", "products": [], "message": "Hi there team"})

    msg = sent_emails[0]
    # Subject is plain text — the apostrophe is not HTML-escaped there.
    assert "O'Brien" in msg["Subject"]
    # Body is HTML — it is escaped.
    assert "O&#x27;Brien" in email_text(msg)


async def test_notify_new_quote_handles_missing_optional_fields(sent_emails):
    await notify_new_quote({"name": "Sam", "email": "s@x.com", "products": [], "message": ""})

    msg = sent_emails[0]
    assert "Not specified" in email_text(msg)


async def test_notify_new_contact_sends_expected_content(sent_emails):
    ok = await notify_new_contact(
        {
            "name": "Sam Okafor",
            "email": "sam@example.com",
            "company": "Okafor Trading",
            "subject": "Partnership",
            "message": "Let us talk.",
        }
    )

    assert ok is True
    msg = sent_emails[0]
    assert "Sam Okafor" in msg["Subject"]
    assert "Partnership" in msg["Subject"]
    assert "Let us talk." in email_text(msg)


async def test_notify_new_contact_default_subject_when_missing(sent_emails):
    await notify_new_contact({"name": "Sam", "email": "s@x.com", "message": "Hello there team"})
    assert "General Enquiry" in sent_emails[0]["Subject"]


async def test_send_email_returns_false_when_smtp_unconfigured(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "smtp_user", "")
    monkeypatch.setattr(settings, "smtp_password", SecretStr(""))

    result = await send_email("to@x.com", "subject", "<p>body</p>")
    assert result is False


async def test_send_email_returns_false_when_recipient_missing(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "smtp_user", "sender@x.com")
    monkeypatch.setattr(settings, "smtp_password", SecretStr("pw"))

    result = await send_email("", "subject", "<p>body</p>")
    assert result is False


async def test_send_email_success_path(sent_emails):
    result = await send_email("dest@x.com", "Hi", "<p>hello</p>")

    assert result is True
    msg = sent_emails[0]
    assert msg["To"] == "dest@x.com"
    assert msg["Subject"] == "Hi"
    assert "sender@aurelia.test" in msg["From"]


async def test_smtp_failure_is_swallowed_and_returns_false(monkeypatch):
    """An SMTP error must not propagate: the caller is a fire-and-forget
    background task, so it returns False rather than raising."""
    import aiosmtplib

    settings = get_settings()
    monkeypatch.setattr(settings, "smtp_user", "sender@x.com")
    monkeypatch.setattr(settings, "smtp_password", SecretStr("pw"))
    monkeypatch.setattr(settings, "notification_email", "ops@x.com")

    async def boom(*args, **kwargs):
        raise ConnectionError("smtp down")

    monkeypatch.setattr(aiosmtplib, "send", boom)

    result = await send_email("dest@x.com", "Hi", "<p>hello</p>")
    assert result is False


def test_smtp_failure_does_not_lose_db_record_or_500(client, db_session, monkeypatch):
    """End-to-end: a submission whose notification email fails still persists the
    row and returns 200 to the user (the send runs after the response)."""
    import aiosmtplib

    from app.models import QuoteRequest
    from tests.factories import quote_payload

    settings = get_settings()
    monkeypatch.setattr(settings, "smtp_user", "sender@x.com")
    monkeypatch.setattr(settings, "smtp_password", SecretStr("pw"))
    monkeypatch.setattr(settings, "notification_email", "ops@x.com")

    async def boom(*args, **kwargs):
        raise ConnectionError("smtp down")

    monkeypatch.setattr(aiosmtplib, "send", boom)

    resp = client.post("/api/quotes/", json=quote_payload())

    assert resp.status_code == 200
    assert db_session.query(QuoteRequest).count() == 1
