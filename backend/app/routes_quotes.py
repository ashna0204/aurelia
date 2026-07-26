"""
Quote request routes — submit, list, get, update status.
"""

import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.auth import require_api_key
from app.config import get_settings
from app.database import get_db
from app.limiter import limiter
from app.models import QuoteRequest
from app.schemas import QuoteCreate, QuoteResponse, QuoteStatusUpdate, SuccessResponse
from app.email_service import notify_new_quote

router = APIRouter(prefix="/api/quotes", tags=["Quotes"])
settings = get_settings()
logger = logging.getLogger(__name__)


# Defined with `def`, not `async def`: the ORM calls below are synchronous and
# would block the event loop for every other request. FastAPI runs sync handlers
# in a threadpool instead.
@router.post("/", response_model=SuccessResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
def create_quote(
    request: Request,
    data: QuoteCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    # Honeypot: `website` is hidden from humans, so a non-empty value means an
    # automated submission. Answer with the ordinary success response instead of
    # an error — a bot that gets a 422 learns to try again without the field,
    # whereas a 200 gives it no signal. Nothing is stored and no email is sent.
    if data.website:
        logger.info("Discarded quote submission: honeypot field was filled.")
        return SuccessResponse(
            message="Quote request submitted successfully. We'll be in touch within 24 hours.",
        )

    quote = QuoteRequest(
        name=data.name,
        email=data.email,
        company=data.company,
        phone=data.phone,
        products=data.products,
        volume=data.volume,
        frequency=data.frequency,
        destination=data.destination,
        message=data.message,
    )
    db.add(quote)
    db.commit()
    db.refresh(quote)

    # Snapshot the fields into a plain dict *before* the request ends. The email
    # runs after the response is sent, by which point the session is closed and
    # the ORM instance is detached.
    background_tasks.add_task(
        notify_new_quote,
        {
            "name": quote.name,
            "email": quote.email,
            "company": quote.company,
            "phone": quote.phone,
            "products": list(quote.products or []),
            "volume": quote.volume,
            "frequency": quote.frequency,
            "destination": quote.destination,
            "message": quote.message,
        },
    )

    return SuccessResponse(
        message="Quote request submitted successfully. We'll be in touch within 24 hours.",
        id=quote.id,
    )


@router.get("/", response_model=list[QuoteResponse], dependencies=[Depends(require_api_key)])
@limiter.limit(f"{settings.admin_rate_limit_per_minute}/minute")
def list_quotes(
    request: Request,
    status: str | None = Query(None, pattern="^(new|reviewed|quoted|closed)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(QuoteRequest)
    if status:
        query = query.filter(QuoteRequest.status == status)
    return query.order_by(desc(QuoteRequest.created_at)).offset(skip).limit(limit).all()


@router.get("/{quote_id}", response_model=QuoteResponse, dependencies=[Depends(require_api_key)])
@limiter.limit(f"{settings.admin_rate_limit_per_minute}/minute")
def get_quote(request: Request, quote_id: int, db: Session = Depends(get_db)):
    quote = db.query(QuoteRequest).filter(QuoteRequest.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return quote


@router.patch("/{quote_id}/status", response_model=QuoteResponse, dependencies=[Depends(require_api_key)])
@limiter.limit(f"{settings.admin_rate_limit_per_minute}/minute")
def update_quote_status(
    request: Request,
    quote_id: int,
    data: QuoteStatusUpdate,
    db: Session = Depends(get_db),
):
    quote = db.query(QuoteRequest).filter(QuoteRequest.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    quote.status = data.status
    if data.internal_notes is not None:
        quote.internal_notes = data.internal_notes

    db.commit()
    db.refresh(quote)
    return quote
