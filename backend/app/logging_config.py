"""
Logging setup with defensive PII redaction.

Removing the one log statement that wrote a customer name is necessary but not
sufficient — the next careless f-string reintroduces the problem. This filter
masks anything that *looks* like an email address or phone number on its way
out, so a mistake degrades to a redacted line instead of a GDPR incident.

It is a backstop, not a licence to log PII deliberately.
"""

import logging
import re

#: Matches ordinary addresses; deliberately broad rather than RFC-exact.
_EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")

#: International and grouped national numbers, 9+ digits so that ordinary
#: integers (IDs, counts, ports, timestamps) are left alone.
_PHONE_RE = re.compile(r"(?<![\w.])\+?\d[\d\s().-]{8,}\d(?![\w.])")


class RedactPIIFilter(logging.Filter):
    """Mask email addresses and phone numbers in log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        # Render args into the message first, then redact the result — args are
        # where interpolated PII actually arrives.
        try:
            message = record.getMessage()
        except Exception:  # noqa: BLE001 — a broken format string must not kill logging
            return True

        redacted = _EMAIL_RE.sub("[email redacted]", message)
        redacted = _PHONE_RE.sub("[phone redacted]", redacted)

        if redacted != message:
            record.msg = redacted
            record.args = ()

        return True


def configure_logging(*, debug: bool) -> None:
    """Configure root logging and attach the redaction filter to every handler."""
    logging.basicConfig(
        level=logging.DEBUG if debug else logging.INFO,
        format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    )

    pii_filter = RedactPIIFilter()
    for handler in logging.getLogger().handlers:
        handler.addFilter(pii_filter)
