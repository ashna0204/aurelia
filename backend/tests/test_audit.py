"""Append-only admin-access audit log."""

import json

import pytest

import app.audit as audit_module
from app.audit import audit_logger, record_admin_access


@pytest.fixture(autouse=True)
def reset_audit_config():
    """The module configures its handler once and caches it. Reset around every
    test so each can choose file vs stream output deterministically."""
    audit_module._configured = False
    saved = list(audit_logger.handlers)
    for h in list(audit_logger.handlers):
        audit_logger.removeHandler(h)
    yield
    for h in list(audit_logger.handlers):
        audit_logger.removeHandler(h)
    for h in saved:
        audit_logger.addHandler(h)
    audit_module._configured = True


def test_record_writes_json_line_to_file(tmp_path, monkeypatch):
    log_path = tmp_path / "audit" / "access.log"
    settings = audit_module.get_settings()
    monkeypatch.setattr(settings, "audit_log_path", str(log_path))

    record_admin_access(
        path="/api/quotes/",
        method="GET",
        client_ip="203.0.113.5",
        outcome="granted",
        key_fingerprint="abc123",
    )

    line = log_path.read_text(encoding="utf-8").strip()
    record = json.loads(line)
    assert record["event"] == "admin_access"
    assert record["method"] == "GET"
    assert record["path"] == "/api/quotes/"
    assert record["client_ip"] == "203.0.113.5"
    assert record["outcome"] == "granted"
    assert record["key_fp"] == "abc123"
    assert "ts" in record


def test_record_falls_back_to_stream_without_path(capsys, monkeypatch):
    settings = audit_module.get_settings()
    monkeypatch.setattr(settings, "audit_log_path", "")

    record_admin_access(path="/api/contact/", method="POST", client_ip=None, outcome="denied_missing_key")

    err = capsys.readouterr().err
    record = json.loads(err.strip().splitlines()[-1])
    assert record["outcome"] == "denied_missing_key"
    assert record["client_ip"] is None
    assert record["key_fp"] is None


def test_auth_flow_records_audit_entry(client, capsys, monkeypatch):
    """A denied admin request produces an audit record via the real auth path."""
    settings = audit_module.get_settings()
    monkeypatch.setattr(settings, "audit_log_path", "")

    client.get("/api/quotes/")  # no key → denied

    err = capsys.readouterr().err
    assert "admin_access" in err
    assert "denied_missing_key" in err
