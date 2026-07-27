"""Security-relevant input — rejected outright or stored verbatim, never crashing.

The DB layer uses parameterised queries throughout, so hostile strings that pass
schema validation must round-trip byte-for-byte with no injection and no 500.
"""

from app.models import ContactMessage, QuoteRequest
from tests.factories import contact_payload, quote_payload


def test_script_tag_in_message_is_stored_verbatim(client, db_session):
    payload = quote_payload(message="<script>alert('xss')</script> please quote this order")
    resp = client.post("/api/quotes/", json=payload)

    assert resp.status_code == 200
    row = db_session.query(QuoteRequest).one()
    # Stored exactly as sent — no stripping, no mangling.
    assert row.message == "<script>alert('xss')</script> please quote this order"


def test_sql_metacharacters_are_stored_not_executed(client, db_session):
    injection = "Robert'); DROP TABLE quote_requests;-- OR 1=1"
    resp = client.post("/api/quotes/", json=quote_payload(name="Bobby", message=injection))

    assert resp.status_code == 200
    # The table still exists and the value round-trips exactly.
    row = db_session.query(QuoteRequest).one()
    assert row.message == injection
    assert db_session.query(QuoteRequest).count() == 1


def test_sql_metacharacters_in_name_field(client, db_session):
    resp = client.post("/api/quotes/", json=quote_payload(name="' OR 1=1 --"))
    assert resp.status_code == 200
    assert db_session.query(QuoteRequest).one().name == "' OR 1=1 --"


def test_null_byte_in_single_line_field_is_rejected(client, db_session):
    resp = client.post("/api/quotes/", json=quote_payload(name="Priya\x00Menon"))
    assert resp.status_code == 422
    assert db_session.query(QuoteRequest).count() == 0


def test_null_byte_in_message_is_rejected(client, db_session):
    resp = client.post("/api/quotes/", json=quote_payload(message="hello\x00 there general"))
    assert resp.status_code == 422
    assert db_session.query(QuoteRequest).count() == 0


def test_extremely_long_message_is_rejected(client, db_session):
    resp = client.post("/api/quotes/", json=quote_payload(message="A" * 50_000))
    assert resp.status_code == 422
    assert db_session.query(QuoteRequest).count() == 0


def test_unicode_and_apostrophes_round_trip(client, db_session):
    payload = contact_payload(name="Siobhán O'Brien", message="Café order — jalapeño crates 日本語")
    resp = client.post("/api/contact/", json=payload)

    assert resp.status_code == 200
    row = db_session.query(ContactMessage).one()
    assert row.name == "Siobhán O'Brien"
    assert row.message == "Café order — jalapeño crates 日本語"


def test_hostile_input_still_triggers_clean_email(client, sent_emails):
    client.post("/api/quotes/", json=quote_payload(message="<script>evil()</script> quote please now"))

    assert len(sent_emails) == 1
    from tests.conftest import email_text

    # The script payload is HTML-escaped in the notification body, not executed.
    body = email_text(sent_emails[0])
    assert "&lt;script&gt;" in body
    assert "<script>evil()</script>" not in body
