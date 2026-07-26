"""
Pydantic schemas — request bodies, response models, and validation.
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# ─── Quote Request ───

class QuoteCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    company: str | None = Field(None, max_length=255)
    phone: str | None = Field(None, max_length=50)
    products: list[str] = Field(..., min_length=1)
    volume: str | None = Field(None, max_length=50)
    frequency: str | None = Field(None, max_length=50)
    destination: str | None = Field(None, max_length=255)
    message: str | None = Field(None, max_length=2000)


class QuoteResponse(BaseModel):
    id: int
    name: str
    email: str
    company: str | None
    phone: str | None
    products: list[str]
    volume: str | None
    frequency: str | None
    destination: str | None
    message: str | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class QuoteStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(new|reviewed|quoted|closed)$")
    internal_notes: str | None = None


# ─── Contact ───

class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    company: str | None = Field(None, max_length=255)
    subject: str | None = Field(None, max_length=255)
    message: str = Field(..., min_length=10, max_length=5000)


class ContactResponse(BaseModel):
    id: int
    name: str
    email: str
    company: str | None
    subject: str | None
    message: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Products ───

class ProductBase(BaseModel):
    name: str = Field(..., max_length=100)
    slug: str = Field(..., max_length=100)
    origin: str = Field(..., max_length=150)
    description: str | None = None
    image_url: str | None = None
    grade: str | None = None
    packaging: str | None = None
    moq: str | None = None
    moisture: str | None = None
    shelf_life: str | None = None
    is_active: bool = True
    sort_order: int = 0


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Generic ───

class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    id: int | None = None