"""Rate-limiter internals — trusted-proxy handling and storage selection."""

from types import SimpleNamespace

import pytest
from slowapi import Limiter
from starlette.requests import Request

import app.limiter as limiter_module
from app.limiter import _build_limiter, _is_trusted_proxy, client_ip


def make_request(client_host, xff=None):
    headers = [(b"x-forwarded-for", xff.encode())] if xff else []
    scope = {
        "type": "http",
        "client": (client_host, 12345) if client_host else None,
        "headers": headers,
    }
    return Request(scope)


def test_is_trusted_proxy_true_for_matching_cidr():
    assert _is_trusted_proxy("10.1.2.3", ["10.0.0.0/8"]) is True


def test_is_trusted_proxy_false_outside_cidr():
    assert _is_trusted_proxy("192.168.1.1", ["10.0.0.0/8"]) is False


def test_is_trusted_proxy_false_for_none_or_empty():
    assert _is_trusted_proxy(None, ["10.0.0.0/8"]) is False
    assert _is_trusted_proxy("10.0.0.1", []) is False


def test_is_trusted_proxy_false_for_malformed_host():
    assert _is_trusted_proxy("not-an-ip", ["10.0.0.0/8"]) is False


def test_is_trusted_proxy_ignores_malformed_entry(caplog):
    assert _is_trusted_proxy("10.0.0.1", ["garbage-cidr"]) is False


def test_client_ip_uses_xff_from_trusted_proxy(monkeypatch):
    monkeypatch.setattr(
        limiter_module, "get_settings", lambda: SimpleNamespace(trusted_proxy_list=["10.0.0.0/8"])
    )
    req = make_request("10.0.0.1", xff="203.0.113.9, 10.0.0.1")
    # Right-most hop appended by our own proxy is trusted.
    assert client_ip(req) == "10.0.0.1"


def test_client_ip_ignores_spoofed_xff_from_untrusted_peer(monkeypatch):
    monkeypatch.setattr(
        limiter_module, "get_settings", lambda: SimpleNamespace(trusted_proxy_list=["10.0.0.0/8"])
    )
    req = make_request("198.51.100.7", xff="1.2.3.4")
    # Peer is not a trusted proxy → the header is disregarded, socket peer wins.
    assert client_ip(req) == "198.51.100.7"


def test_client_ip_falls_back_when_trusted_but_no_xff(monkeypatch):
    monkeypatch.setattr(
        limiter_module, "get_settings", lambda: SimpleNamespace(trusted_proxy_list=["10.0.0.0/8"])
    )
    req = make_request("10.0.0.1")
    assert client_ip(req) == "10.0.0.1"


def _settings(env, storage):
    return SimpleNamespace(env=env, rate_limit_storage_uri=storage, trusted_proxy_list=[])


def test_build_limiter_memory_in_local(monkeypatch):
    monkeypatch.setattr(limiter_module, "get_settings", lambda: _settings("local", ""))
    assert isinstance(_build_limiter(), Limiter)


def test_build_limiter_rejects_memory_outside_local(monkeypatch):
    monkeypatch.setattr(limiter_module, "get_settings", lambda: _settings("production", ""))
    with pytest.raises(RuntimeError, match="RATE_LIMIT_STORAGE_URI must be set"):
        _build_limiter()


def test_build_limiter_uses_configured_storage(monkeypatch):
    monkeypatch.setattr(limiter_module, "get_settings", lambda: _settings("production", "memory://"))
    assert isinstance(_build_limiter(), Limiter)
