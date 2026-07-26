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
from app.seed import seed
from app.routes_quotes import router as quotes_router
from app.routes_contact import router as contact_router
from app.routes_products import router as products_router

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
    seed()
    logger.info("Database ready.")
    yield
    logger.info("Shutting down.")


# ─── App ───
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Backend API for Aurelia Logistics — spice sourcing and supply chain from the Indian subcontinent.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── CORS (allow frontend dev server) ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Routes ───
app.include_router(quotes_router)
app.include_router(contact_router)
app.include_router(products_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "name": settings.app_name,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}