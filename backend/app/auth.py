"""
Admin authentication — API key via X-API-Key header.
"""

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.config import get_settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def require_api_key(key: str = Security(api_key_header)) -> str:
    settings = get_settings()
    if not settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin access is not configured on this server.",
        )
    if not key or key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key.",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return key
