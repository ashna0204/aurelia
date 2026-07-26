"""
Quote request routes — submit, list, get, update status.
"""

import asyncio
from fastapi import APIRouter, Depends, HTTPException, Query, Request
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


@router.post("/", response_model=SuccessResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def create_quote(request: Request, data: QuoteCreate, db: Session = Depends(get_db)):
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

    asyncio.create_task(notify_new_quote(quote))

    return SuccessResponse(
        message="Quote request submitted successfully. We'll be in touch within 24 hours.",
        id=quote.id,
    )


@router.get("/", response_model=list[QuoteResponse], dependencies=[Depends(require_api_key)])
def list_quotes(
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
def get_quote(quote_id: int, db: Session = Depends(get_db)):
    quote = db.query(QuoteRequest).filter(QuoteRequest.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return quote


@router.patch("/{quote_id}/status", response_model=QuoteResponse, dependencies=[Depends(require_api_key)])
def update_quote_status(quote_id: int, data: QuoteStatusUpdate, db: Session = Depends(get_db)):
    quote = db.query(QuoteRequest).filter(QuoteRequest.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    quote.status = data.status
    if data.internal_notes is not None:
        quote.internal_notes = data.internal_notes

    db.commit()
    db.refresh(quote)
    return quote
