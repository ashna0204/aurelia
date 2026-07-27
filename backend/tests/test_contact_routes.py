"""Contact routes — happy path, persistence, admin list/mark-read, 404, 405."""

from app.models import ContactMessage
from tests.factories import contact_payload


def test_create_contact_persists_and_returns_id(client, db_session):
    resp = client.post("/api/contact/", json=contact_payload())

    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert isinstance(body["id"], int)

    row = db_session.query(ContactMessage).filter_by(id=body["id"]).one()
    assert row.name == "Sam Okafor"
    assert row.subject == "Partnership enquiry"
    assert row.is_read is False


def test_create_contact_sends_one_email(client, sent_emails):
    client.post("/api/contact/", json=contact_payload())

    assert len(sent_emails) == 1
    msg = sent_emails[0]
    assert msg["To"] == "ops@aurelia.test"
    assert "Contact" in msg["Subject"]
    assert "Sam Okafor" in msg["Subject"]


def test_list_contacts_requires_admin_key(client):
    assert client.get("/api/contact/").status_code == 401


def test_list_contacts_returns_rows(client, admin_headers):
    client.post("/api/contact/", json=contact_payload())
    resp = client.get("/api/contact/", headers=admin_headers)

    assert resp.status_code == 200
    rows = resp.json()
    assert len(rows) == 1
    assert {"id", "name", "email", "message", "is_read", "created_at"} <= rows[0].keys()


def test_list_contacts_filters_by_is_read(client, admin_headers, db_session):
    client.post("/api/contact/", json=contact_payload())
    assert client.get("/api/contact/?is_read=false", headers=admin_headers).json()
    assert client.get("/api/contact/?is_read=true", headers=admin_headers).json() == []


def test_mark_contact_as_read(client, admin_headers, db_session):
    created = client.post("/api/contact/", json=contact_payload()).json()

    resp = client.patch(f"/api/contact/{created['id']}/read", headers=admin_headers)

    assert resp.status_code == 200
    assert resp.json()["is_read"] is True
    row = db_session.query(ContactMessage).filter_by(id=created["id"]).one()
    assert row.is_read is True


def test_mark_unknown_contact_returns_404(client, admin_headers):
    resp = client.patch("/api/contact/999999/read", headers=admin_headers)
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Message not found"


def test_mark_read_requires_admin_key(client):
    assert client.patch("/api/contact/1/read").status_code == 401


def test_wrong_verb_on_contact_collection_returns_405(client):
    assert client.delete("/api/contact/").status_code == 405
