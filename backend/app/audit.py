"""
Append-only audit log for admin access.

Every request that passes (or fails) admin authentication is recorded. Without
this there is no way to answer the only question that matters after a key
leak — *was customer data actually read?* — which is precisely what GDPR
Art. 33 requires the controller to assess within 72 hours.

Written as line-delimited JSON to a dedicated logger so the operator can ship
it somewhere durable and append-only (see DEPLOYMENT.md). Deliberately kept
separate from the application log, which is noisy and routinely rotated.
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path

from app.config import get_settings

#: Dedicated logger. Does not propagate to the root logger, so audit records
#: never leak into the general application log or its shipping pipeline.
audit_logger = logging.getLogger("aurelia.audit")
audit_logger.propagate = False

_configured = False


def _configure() -> None:
    global _configured
    if _configured:
        return

    settings = get_settings()
    audit_logger.setLevel(logging.INFO)

    if settings.audit_log_path:
        path = Path(settings.audit_log_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        # Append mode, never truncate.
        handler: logging.Handler = logging.FileHandler(path, mode="a", encoding="utf-8")
    else:
        handler = logging.StreamHandler()

    # The record is already JSON; no prefix, so the file is directly parseable.
    handler.setFormatter(logging.Formatter("%(message)s"))
    audit_logger.addHandler(handler)
    _configured = True


def record_admin_access(
    *,
    path: str,
    method: str,
    client_ip: str | None,
    outcome: str,
    key_fingerprint: str | None = None,
) -> None:
    """Append one admin-access record.

    ``key_fingerprint`` is a truncated SHA-256 of the presented key, never the
    key itself — enough to distinguish which credential was used once multiple
    keys exist, useless to an attacker who reads the log.
    """
    _configure()

    audit_logger.info(
        json.dumps(
            {
                "ts": datetime.now(timezone.utc).isoformat(),
                "event": "admin_access",
                "method": method,
                "path": path,
                # Source IP is itself personal data under GDPR; it falls under
                # the same retention policy as the enquiry records.
                "client_ip": client_ip,
                "outcome": outcome,
                "key_fp": key_fingerprint,
            },
            separators=(",", ":"),
        )
    )
