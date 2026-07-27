"""Admin authentication via the X-API-Key header."""

from tests.conftest import TEST_API_KEY
from tests.factories import quote_payload


def test_no_key_is_rejected(client):
    resp = client.get("/api/quotes/")
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid or missing API key."
    assert resp.headers["WWW-Authenticate"] == "ApiKey"


def test_wrong_key_is_rejected(client):
    resp = client.get("/api/quotes/", headers={"X-API-Key": "wrong-key"})
    assert resp.status_code == 401


def test_correct_key_is_accepted(client):
    resp = client.get("/api/quotes/", headers={"X-API-Key": TEST_API_KEY})
    assert resp.status_code == 200


def test_empty_key_header_is_rejected(client):
    resp = client.get("/api/quotes/", headers={"X-API-Key": ""})
    assert resp.status_code == 401


def test_public_quote_post_needs_no_key(client):
    assert client.post("/api/quotes/", json=quote_payload()).status_code == 200


def test_public_contact_post_needs_no_key(client):
    from tests.factories import contact_payload

    assert client.post("/api/contact/", json=contact_payload()).status_code == 200


def test_all_admin_routes_reject_missing_key(client):
    assert client.get("/api/quotes/").status_code == 401
    assert client.get("/api/quotes/1").status_code == 401
    assert client.patch("/api/quotes/1/status", json={"status": "new"}).status_code == 401
    assert client.get("/api/contact/").status_code == 401
    assert client.patch("/api/contact/1/read").status_code == 401
