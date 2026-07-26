"""
Shared rate limiter instance — imported by routes and registered on the app.

Two defects this module exists to avoid:

1. **Per-worker counters.** slowapi defaults to in-process memory, so under
   ``uvicorn --workers 4`` the effective limit is 4x the configured rate and
   every restart clears it. Set ``RATE_LIMIT_STORAGE_URI`` to a Redis URL for
   any multi-worker deployment; startup refuses memory storage outside local.

2. **Proxy-blind client identification.** ``get_remote_address`` reads the
   socket peer, which behind a reverse proxy is the *proxy*. Every visitor
   would then share one bucket, turning the limiter into a global throttle that
   a single abuser can exhaust for everybody. ``client_ip`` reads
   ``X-Forwarded-For`` instead — but only when the immediate peer is a trusted
   proxy, since that header is attacker-controlled and trusting it
   unconditionally makes the limit trivially bypassable with a spoofed value.
"""

import ipaddress
import logging

from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request

from app.config import get_settings

logger = logging.getLogger(__name__)


def _is_trusted_proxy(host: str | None, trusted: list[str]) -> bool:
    if not host or not trusted:
        return False
    try:
        addr = ipaddress.ip_address(host)
    except ValueError:
        return False
    for entry in trusted:
        try:
            if addr in ipaddress.ip_network(entry, strict=False):
                return True
        except ValueError:
            logger.warning("Ignoring malformed TRUSTED_PROXIES entry: %r", entry)
    return False


def client_ip(request: Request) -> str:
    """Identify the caller for rate-limiting purposes.

    Falls back to the socket peer whenever that peer is not a configured
    trusted proxy, so a spoofed X-Forwarded-For from a direct client is ignored.
    """
    settings = get_settings()
    peer = request.client.host if request.client else None

    if _is_trusted_proxy(peer, settings.trusted_proxy_list):
        forwarded = request.headers.get("x-forwarded-for", "")
        hops = [h.strip() for h in forwarded.split(",") if h.strip()]
        if hops:
            # Right-most entry is the one appended by our own trusted proxy;
            # anything further left may have been forged by the client.
            return hops[-1]

    return get_remote_address(request)


def _build_limiter() -> Limiter:
    settings = get_settings()
    storage_uri = settings.rate_limit_storage_uri

    if not storage_uri:
        if settings.env != "local":
            raise RuntimeError(
                "RATE_LIMIT_STORAGE_URI must be set when ENV is staging or "
                "production. In-memory rate limiting is per-worker, so it is "
                "silently bypassed by any multi-worker deployment and reset by "
                "every restart. Point it at Redis, e.g. redis://localhost:6379."
            )
        logger.warning(
            "Rate limiting is using in-process memory storage: per-worker and "
            "reset on restart. Acceptable for local development only."
        )
        return Limiter(key_func=client_ip)

    return Limiter(key_func=client_ip, storage_uri=storage_uri)


limiter = _build_limiter()
