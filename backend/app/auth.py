"""
Admin authentication — API key via X-API-Key header.
"""

import hashlib
import secrets

from fastapi import HTTPException, Request, Security, status
from fastapi.security import APIKeyHeader

from app.audit import record_admin_access
from app.config import get_settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid or missing API key.",
    headers={"WWW-Authenticate": "ApiKey"},
)


def _fingerprint(key: str) -> str:
    """Short SHA-256 prefix — identifies a credential without revealing it."""
    return hashlib.sha256(key.encode("utf-8")).hexdigest()[:12]


async def require_api_key(
    request: Request,
    key: str = Security(api_key_header),
) -> str:
    settings = get_settings()
    client_ip = request.client.host if request.client else None

    def audit(outcome: str, fingerprint: str | None = None) -> None:
        record_admin_access(
            path=request.url.path,
            method=request.method,
            client_ip=client_ip,
            outcome=outcome,
            key_fingerprint=fingerprint,
        )

    # A missing header short-circuits before compare_digest, which needs a str.
    # The "not configured" 503 branch is gone: config now refuses to start
    # without a sufficiently strong API_KEY, so an empty key is unreachable.
    if not key:
        audit("denied_missing_key")
        raise _UNAUTHORIZED

    # compare_digest, not ==. Python's string equality returns as soon as two
    # bytes differ, so response timing leaks how much of the key was guessed
    # correctly, one byte at a time.
    if not secrets.compare_digest(key, settings.api_key.get_secret_value()):
        audit("denied_invalid_key", _fingerprint(key))
        raise _UNAUTHORIZED

    audit("granted", _fingerprint(key))
    return key
