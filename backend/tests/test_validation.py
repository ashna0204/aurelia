"""Validation failures — 422 with detail, and nothing written to the DB."""

import pytest

from app.models import ContactMessage, QuoteRequest
from tests.factories import contact_payload, quote_payload


def _detail_fields(resp):
    return {tuple(err["loc"]) for err in resp.json()["detail"]}


@pytest.mark.parametrize("missing", ["name", "email", "products", "message"])
def test_quote_missing_required_field_is_422(client, db_session, missing):
    payload = quote_payload()
    del payload[missing]
    resp = client.post("/api/quotes/", json=payload)

    assert resp.status_code == 422
    assert db_session.query(QuoteRequest).count() == 0


def test_quote_malformed_email_is_422(client, db_session):
    resp = client.post("/api/quotes/", json=quote_payload(email="not-an-email"))
    assert resp.status_code == 422
    assert db_session.query(QuoteRequest).count() == 0


def test_quote_bad_phone_is_422(client, db_session):
    resp = client.post("/api/quotes/", json=quote_payload(phone="call-me-maybe"))
    assert resp.status_code == 422
    assert db_session.query(QuoteRequest).count() == 0


def test_quote_oversized_name_is_422(client, db_session):
    resp = client.post("/api/quotes/", json=quote_payload(name="x" * 151))
    assert resp.status_code == 422
    assert db_session.query(QuoteRequest).count() == 0


def test_quote_oversized_message_is_422(client, db_session):
    resp = client.post("/api/quotes/", json=quote_payload(message="x" * 4001))
    assert resp.status_code == 422
    assert db_session.query(QuoteRequest).count() == 0


def test_quote_too_short_message_is_422(client, db_session):
    resp = client.post("/api/quotes/", json=quote_payload(message="short"))
    assert resp.status_code == 422
    assert db_session.query(QuoteRequest).count() == 0


def test_quote_wrong_type_products_is_422(client, db_session):
    resp = client.post("/api/quotes/", json=quote_payload(products="not-a-list"))
    assert resp.status_code == 422
    assert db_session.query(QuoteRequest).count() == 0


def test_quote_unknown_sector_is_422(client, db_session):
    resp = client.post("/api/quotes/", json=quote_payload(products=["Fireworks"]))
    assert resp.status_code == 422
    assert db_session.query(QuoteRequest).count() == 0


@pytest.mark.parametrize("missing", ["name", "email", "message"])
def test_contact_missing_required_field_is_422(client, db_session, missing):
    payload = contact_payload()
    del payload[missing]
    resp = client.post("/api/contact/", json=payload)

    assert resp.status_code == 422
    assert db_session.query(ContactMessage).count() == 0


def test_contact_malformed_email_is_422(client, db_session):
    resp = client.post("/api/contact/", json=contact_payload(email="nope"))
    assert resp.status_code == 422
    assert db_session.query(ContactMessage).count() == 0


def test_empty_body_is_422(client):
    assert client.post("/api/quotes/", json={}).status_code == 422
    assert client.post("/api/contact/", json={}).status_code == 422
