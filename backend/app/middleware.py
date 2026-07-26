"""
Response-hygiene middleware — security headers and a catch-all error handler.
"""

import logging
import time
import uuid

from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

#: Applied to every response, including errors and 404s.
#:
#: HSTS is set by the application as a backstop; the edge should set it too
#: (see DEPLOYMENT.md). It is inert over plain HTTP, so it is safe to emit in
#: local development.
SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    # Belt and braces with the CSP frame-ancestors directive served by the SPA
    # host: X-Frame-Options covers clients that predate CSP Level 2.
    "X-Frame-Options": "DENY",
    # This API serves JSON, never documents. Nothing here should ever be
    # treated as a page, framed, or used as a base for relative URLs.
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Attach the standard security headers to every outgoing response."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        for header, value in SECURITY_HEADERS.items():
            # setdefault semantics: never clobber a header a route set itself.
            if header not in response.headers:
                response.headers[header] = value
        return response


async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Return 429 with a Retry-After the client can actually act on.

    slowapi's bundled handler emits Retry-After only when the Limiter is built
    with ``headers_enabled=True`` — but that mode also tries to inject headers
    into whatever the endpoint returned, which raises for any handler returning
    a Pydantic model rather than a Response. Computing the value here keeps the
    header without constraining every handler's return type or signature.
    """
    retry_after = 60

    try:
        limiter = request.app.state.limiter
        limit, scope = request.state.view_rate_limit
        reset_at, _remaining = limiter.limiter.get_window_stats(limit, *scope)
        retry_after = max(1, int(reset_at - time.time()))
    except Exception:  # noqa: BLE001 — never let header computation break the 429
        logger.debug("Could not compute Retry-After; using default", exc_info=True)

    return JSONResponse(
        status_code=429,
        content={
            "detail": (
                "Too many requests. Please wait a moment and try again."
            )
        },
        headers={**SECURITY_HEADERS, "Retry-After": str(retry_after)},
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Return an opaque error with a correlation ID; log the detail server-side.

    FastAPI's default 500 body does not leak a traceback, so this is not
    plugging a disclosure hole. It exists so that a customer reporting "it
    failed" can quote an ID that ties directly to a server-side log entry —
    without which unhandled errors are effectively uninvestigable.
    """
    correlation_id = str(uuid.uuid4())

    logger.exception(
        "Unhandled exception [%s] on %s %s",
        correlation_id,
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal error occurred. Quote the reference below if you contact us.",
            "correlation_id": correlation_id,
        },
        headers=dict(SECURITY_HEADERS),
    )
