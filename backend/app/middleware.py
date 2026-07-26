"""
Response-hygiene middleware — security headers and a catch-all error handler.
"""

import logging
import uuid

from fastapi import Request
from fastapi.responses import JSONResponse
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
