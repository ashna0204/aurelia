"""Rate limiting (slowapi) — requests under the limit pass, past it get 429.

The limiter is reset by the ``client`` fixture around every test, so counts do
not leak between cases.
"""

from tests.conftest import TEST_API_KEY
from tests.factories import contact_payload, quote_payload

# Mirrors RATE_LIMIT_PER_MINUTE / ADMIN_RATE_LIMIT_PER_MINUTE pinned in conftest.
PUBLIC_LIMIT = 5
ADMIN_LIMIT = 30


def test_public_quote_endpoint_allows_up_to_limit(client):
    for i in range(PUBLIC_LIMIT):
        resp = client.post("/api/quotes/", json=quote_payload(message=f"Enquiry number {i} here."))
        assert resp.status_code == 200, f"request {i} should be under the limit"


def test_public_quote_endpoint_blocks_past_limit(client):
    for _ in range(PUBLIC_LIMIT):
        client.post("/api/quotes/", json=quote_payload())

    resp = client.post("/api/quotes/", json=quote_payload())
    assert resp.status_code == 429
    assert "Too many requests" in resp.json()["detail"]
    # The 429 carries an actionable Retry-After computed by the handler.
    assert int(resp.headers["Retry-After"]) >= 1


def test_public_contact_endpoint_blocks_past_limit(client):
    for _ in range(PUBLIC_LIMIT):
        client.post("/api/contact/", json=contact_payload())

    resp = client.post("/api/contact/", json=contact_payload())
    assert resp.status_code == 429


def test_admin_endpoint_blocks_past_its_own_limit(client):
    headers = {"X-API-Key": TEST_API_KEY}
    for _ in range(ADMIN_LIMIT):
        assert client.get("/api/quotes/", headers=headers).status_code == 200

    assert client.get("/api/quotes/", headers=headers).status_code == 429


def test_limit_resets_between_tests(client):
    # If reset were not happening, earlier tests would have exhausted the bucket.
    resp = client.post("/api/quotes/", json=quote_payload())
    assert resp.status_code == 200
