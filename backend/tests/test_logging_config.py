"""PII redaction log filter."""

import logging

from app.logging_config import RedactPIIFilter, configure_logging


def _record(msg, *args):
    return logging.LogRecord("t", logging.INFO, __file__, 1, msg, args, None)


def test_email_is_redacted():
    rec = _record("contacting priya.menon@example.com now")
    RedactPIIFilter().filter(rec)
    assert "[email redacted]" in rec.getMessage()
    assert "priya.menon@example.com" not in rec.getMessage()


def test_phone_is_redacted():
    rec = _record("call +44 20 7946 0958 back")
    RedactPIIFilter().filter(rec)
    assert "[phone redacted]" in rec.getMessage()


def test_short_integers_not_treated_as_phone():
    rec = _record("processed 42 records on port 8000")
    RedactPIIFilter().filter(rec)
    assert rec.getMessage() == "processed 42 records on port 8000"


def test_interpolated_args_are_redacted():
    rec = _record("user %s signed up", "joe@example.com")
    RedactPIIFilter().filter(rec)
    assert "[email redacted]" in rec.getMessage()
    # Args were cleared after redaction so the message does not re-interpolate.
    assert rec.args == ()


def test_broken_format_string_does_not_break_logging():
    rec = _record("%s %s needs two", "only-one")
    # Must return True (keep the record) rather than raise.
    assert RedactPIIFilter().filter(rec) is True


def test_configure_logging_attaches_filter():
    configure_logging(debug=False)
    root = logging.getLogger()
    assert any(
        isinstance(f, RedactPIIFilter) for h in root.handlers for f in h.filters
    )
