"""
SQLAlchemy ORM models — the database tables.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, JSON
from app.database import Base


class QuoteRequest(Base):
    __tablename__ = "quote_requests"

    id = Column(Integer, primary_key=True, index=True)

    # Contact info
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)

    # Order details
    products = Column(JSON, nullable=False)
    volume = Column(String(50), nullable=True)
    frequency = Column(String(50), nullable=True)
    destination = Column(String(255), nullable=True)
    message = Column(Text, nullable=True)

    # Internal tracking
    status = Column(String(30), default="new", index=True)
    internal_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Quote #{self.id} — {self.name} ({self.status})>"


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    subject = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)

    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Contact #{self.id} — {self.name}>"


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    origin = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)

    # Specifications
    grade = Column(String(255), nullable=True)
    packaging = Column(String(255), nullable=True)
    moq = Column(String(100), nullable=True)
    moisture = Column(String(50), nullable=True)
    shelf_life = Column(String(50), nullable=True)

    # Display
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Product: {self.name}>"