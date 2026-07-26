"""
Admin authentication — API key via X-API-Key header.
"""

import secrets

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.config import get_settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid or missing API key.",
    headers={"WWW-Authenticate": "ApiKey"},
)


async def require_api_key(key: str = Security(api_key_header)) -> str:
    settings = get_settings()

    # A missing header short-circuits before compare_digest, which needs a str.
    # The "not configured" 503 branch is gone: config now refuses to start
    # without a sufficiently strong API_KEY, so an empty key is unreachable.
    if not key:
        raise _UNAUTHORIZED

    # compare_digest, not ==. Python's string equality returns as soon as two
    # bytes differ, so response timing leaks how much of the key was guessed
    # correctly, one byte at a time.
    if not secrets.compare_digest(key, settings.api_key.get_secret_value()):
        raise _UNAUTHORIZED

    return key
