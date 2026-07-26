"""
Contact message routes — submit and list.
"""

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.auth import require_api_key
from app.config import get_settings
from app.database import get_db
from app.limiter import limiter
from app.models import ContactMessage
from app.schemas import ContactCreate, ContactResponse, SuccessResponse
from app.email_service import notify_new_contact

router = APIRouter(prefix="/api/contact", tags=["Contact"])
settings = get_settings()


# Sync handler on purpose — see the note in routes_quotes.create_quote.
@router.post("/", response_model=SuccessResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
def create_contact(
    request: Request,
    data: ContactCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    contact = ContactMessage(
        name=data.name,
        email=data.email,
        company=data.company,
        subject=data.subject,
        message=data.message,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)

    background_tasks.add_task(
        notify_new_contact,
        {
            "name": contact.name,
            "email": contact.email,
            "company": contact.company,
            "subject": contact.subject,
            "message": contact.message,
        },
    )

    return SuccessResponse(
        message="Message received. We'll get back to you shortly.",
        id=contact.id,
    )


@router.get("/", response_model=list[ContactResponse], dependencies=[Depends(require_api_key)])
def list_contacts(
    is_read: bool | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(ContactMessage)
    if is_read is not None:
        query = query.filter(ContactMessage.is_read == is_read)
    return query.order_by(desc(ContactMessage.created_at)).offset(skip).limit(limit).all()


@router.patch("/{message_id}/read", response_model=ContactResponse, dependencies=[Depends(require_api_key)])
def mark_as_read(message_id: int, db: Session = Depends(get_db)):
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    db.commit()
    db.refresh(msg)
    return msg
