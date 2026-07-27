"""Response-hygiene middleware — security headers and error handlers."""

import pytest
from starlette.requests import Request

from app.middleware import (
    SECURITY_HEADERS,
    rate_limit_handler,
    unhandled_exception_handler,
)


def test_security_headers_present_on_responses(client):
    resp = client.get("/health")
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert resp.headers["X-Frame-Options"] == "DENY"
    assert "default-src 'none'" in resp.headers["Content-Security-Policy"]
    assert resp.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"


def test_security_headers_on_404(client):
    resp = client.get("/no-such-path")
    assert resp.status_code == 404
    assert resp.headers["X-Content-Type-Options"] == "nosniff"


def test_security_headers_constant_is_complete():
    for key in ("Strict-Transport-Security", "X-Content-Type-Options", "X-Frame-Options"):
        assert key in SECURITY_HEADERS


def _bare_request():
    return Request({"type": "http", "method": "GET", "path": "/boom", "headers": []})


async def test_unhandled_exception_handler_returns_opaque_500():
    resp = await unhandled_exception_handler(_bare_request(), RuntimeError("kaboom"))

    assert resp.status_code == 500
    import json

    body = json.loads(resp.body)
    assert "internal error occurred" in body["detail"].lower()
    # A correlation id is present and looks like a UUID.
    assert len(body["correlation_id"]) == 36
    # Security headers are stamped even on the crash path.
    assert resp.headers["X-Content-Type-Options"] == "nosniff"


async def test_rate_limit_handler_uses_default_retry_after_when_stats_unavailable():
    """When the limiter window stats cannot be computed (bare request without
    app state), the handler still returns 429 with a sane default Retry-After."""
    # The exc is unused on the fallback path; the handler only reads request
    # state, which is absent on a bare request, forcing the except branch.
    resp = await rate_limit_handler(_bare_request(), object())

    assert resp.status_code == 429
    assert resp.headers["Retry-After"] == "60"
    import json

    assert "Too many requests" in json.loads(resp.body)["detail"]
