"""
Aurelia Logistics — FastAPI Backend
====================================
Run:  uvicorn app.main:app --reload
Docs: http://localhost:8000/docs
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.database import init_db
from app.limiter import limiter
from app.middleware import SecurityHeadersMiddleware, unhandled_exception_handler
from app.routes_quotes import router as quotes_router
from app.routes_contact import router as contact_router

# ─── Logging ───
logging.basicConfig(
    level=logging.DEBUG if get_settings().debug else logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


# ─── Lifespan (startup / shutdown) ───
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Aurelia Logistics API...")
    init_db()
    logger.info("Database ready.")
    yield
    logger.info("Shutting down.")


# ─── App ───
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Backend API for Aurelia Logistics — trade enquiries and quote requests.",
    version="1.0.0",
    lifespan=lifespan,
    # Interactive docs are development-only. In production they would expose the
    # full API surface (and invite the stray "string" submissions that Swagger's
    # "Try it out" produces) to anyone who finds the host.
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Anything that escapes a route handler becomes an opaque 500 with a
# correlation ID; the traceback stays server-side.
app.add_exception_handler(Exception, unhandled_exception_handler)

# ─── Security headers ───
# Registered before CORS so that it runs *outermost* (Starlette applies
# middleware in reverse order of addition), letting it stamp headers onto CORS
# preflight responses too.
app.add_middleware(SecurityHeadersMiddleware)

# ─── CORS ───
# allow_credentials is False by design: this API authenticates admin calls with
# an X-API-Key header, never a cookie or session, so credentialed cross-origin
# requests grant nothing and only widen the surface.
# Methods and headers are enumerated rather than "*" for the same reason.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
    max_age=600,
)


# ─── Routes ───
app.include_router(quotes_router)
app.include_router(contact_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "name": settings.app_name,
        "status": "running",
        "docs": "/docs" if settings.debug else None,
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}