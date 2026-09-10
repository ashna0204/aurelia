"""Quote routes — happy path, persistence, admin list/get/patch, 404, 405."""

from app.models import QuoteRequest
from tests.factories import quote_payload


def test_create_quote_persists_row_and_returns_id(client, db_session):
    resp = client.post("/api/quotes/", json=quote_payload())

    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert isinstance(body["id"], int)
    assert "24 hours" in body["message"]

    # Query the row back — the side effect actually happened.
    row = db_session.query(QuoteRequest).filter_by(id=body["id"]).one()
    assert row.name == "Priya Menon"
    assert row.email == "priya.menon@example.com"
    assert row.products == ["Food & Grocery"]
    assert row.status == "new"


def test_create_quote_strips_optional_blank_handled(client, db_session):
    payload = quote_payload(company=None, phone=None, volume=None, frequency=None, destination=None)
    resp = client.post("/api/quotes/", json=payload)

    assert resp.status_code == 200
    row = db_session.query(QuoteRequest).one()
    assert row.company is None
    assert row.phone is None
    assert row.volume is None


def test_honeypot_submission_is_discarded_silently(client, db_session):
    resp = client.post("/api/quotes/", json=quote_payload(website="http://spam.example"))

    # Bot gets an ordinary 200 with no id, and nothing is stored.
    assert resp.status_code == 200
    assert resp.json()["id"] is None
    assert db_session.query(QuoteRequest).count() == 0


def test_create_quote_sends_one_email_with_expected_content(client, sent_emails):
    client.post("/api/quotes/", json=quote_payload())

    assert len(sent_emails) == 1
    msg = sent_emails[0]
    assert msg["To"] == "ops@aurelia.test"
    assert "New Quote" in msg["Subject"]
    assert "Priya Menon" in msg["Subject"]


def test_honeypot_submission_sends_no_email(client, sent_emails):
    client.post("/api/quotes/", json=quote_payload(website="filled"))
    assert sent_emails == []


def test_list_quotes_requires_admin_key(client):
    assert client.get("/api/quotes/").status_code == 401


def test_list_quotes_returns_rows_newest_first(client, admin_headers):
    client.post("/api/quotes/", json=quote_payload(message="First enquiry here please."))
    client.post("/api/quotes/", json=quote_payload(message="Second enquiry here please."))

    resp = client.get("/api/quotes/", headers=admin_headers)
    assert resp.status_code == 200
    rows = resp.json()
    assert len(rows) == 2
    # Both rows carry the response schema fields.
    assert {"id", "name", "email", "products", "status", "created_at"} <= rows[0].keys()


def test_list_quotes_filters_by_status(client, admin_headers, db_session):
    client.post("/api/quotes/", json=quote_payload())
    quote = db_session.query(QuoteRequest).one()
    quote.status = "closed"
    db_session.commit()

    assert client.get("/api/quotes/?status=closed", headers=admin_headers).json()
    assert client.get("/api/quotes/?status=new", headers=admin_headers).json() == []


def test_get_quote_by_id(client, admin_headers):
    created = client.post("/api/quotes/", json=quote_payload()).json()
    resp = client.get(f"/api/quotes/{created['id']}", headers=admin_headers)

    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


def test_get_unknown_quote_returns_404(client, admin_headers):
    resp = client.get("/api/quotes/999999", headers=admin_headers)
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Quote not found"


def test_update_quote_status(client, admin_headers, db_session):
    created = client.post("/api/quotes/", json=quote_payload()).json()

    resp = client.patch(
        f"/api/quotes/{created['id']}/status",
        json={"status": "reviewed", "internal_notes": "Called the customer."},
        headers=admin_headers,
    )

    assert resp.status_code == 200
    assert resp.json()["status"] == "reviewed"
    row = db_session.query(QuoteRequest).filter_by(id=created["id"]).one()
    assert row.status == "reviewed"
    assert row.internal_notes == "Called the customer."


def test_update_quote_status_without_notes_leaves_notes_untouched(client, admin_headers, db_session):
    created = client.post("/api/quotes/", json=quote_payload()).json()

    resp = client.patch(
        f"/api/quotes/{created['id']}/status",
        json={"status": "quoted"},  # no internal_notes key
        headers=admin_headers,
    )

    assert resp.status_code == 200
    row = db_session.query(QuoteRequest).filter_by(id=created["id"]).one()
    assert row.status == "quoted"
    assert row.internal_notes is None


def test_update_unknown_quote_returns_404(client, admin_headers):
    resp = client.patch(
        "/api/quotes/999999/status", json={"status": "closed"}, headers=admin_headers
    )
    assert resp.status_code == 404


def test_update_quote_rejects_invalid_status(client, admin_headers):
    created = client.post("/api/quotes/", json=quote_payload()).json()
    resp = client.patch(
        f"/api/quotes/{created['id']}/status",
        json={"status": "not-a-status"},
        headers=admin_headers,
    )
    assert resp.status_code == 422


def test_wrong_verb_on_collection_returns_405(client):
    # DELETE is not registered on the quotes collection.
    assert client.delete("/api/quotes/").status_code == 405
