"""
Pydantic schemas — request bodies, response models, and validation.
"""

from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, EmailStr, Field, StringConstraints, field_validator

#: Longest free-text body accepted on either public form.
MAX_MESSAGE_LENGTH = 4000

#: Control characters are rejected everywhere. NUL truncates strings in some C
#: extensions, and CR/LF are the payload shape for header-injection attempts
#: against the notification email. Tab, CR and LF stay legal inside message
#: bodies (see _reject_control_characters) but never in single-line fields.
_FORBIDDEN_CONTROL = {chr(c) for c in range(0x20)} | {chr(0x7F)}

#: Single-line text: trimmed, no control characters at all.
ShortText = Annotated[str, StringConstraints(strip_whitespace=True)]


def _reject_control_characters(value: str | None, *, allow_newlines: bool) -> str | None:
    if value is None:
        return None
    allowed = {"\t", "\r", "\n"} if allow_newlines else set()
    if any(ch in _FORBIDDEN_CONTROL and ch not in allowed for ch in value):
        raise ValueError("must not contain control characters")
    return value


# ─── Quote Request ───

class QuoteCreate(BaseModel):
    name: ShortText = Field(..., min_length=2, max_length=150)
    email: EmailStr
    company: ShortText | None = Field(None, max_length=255)
    phone: ShortText | None = Field(None, max_length=50)
    # Bounded on both axes. Previously `min_length=1` with no upper bound on
    # either the list or its items, so a single request could carry an
    # arbitrarily large array straight into a JSON column and the notification
    # email body.
    products: list[Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]] = Field(
        ..., min_length=1, max_length=50
    )
    volume: ShortText | None = Field(None, max_length=50)
    frequency: ShortText | None = Field(None, max_length=50)
    destination: ShortText | None = Field(None, max_length=255)
    message: str | None = Field(None, max_length=MAX_MESSAGE_LENGTH)

    @field_validator("name", "company", "phone", "volume", "frequency", "destination")
    @classmethod
    def _no_control_chars(cls, v: str | None) -> str | None:
        return _reject_control_characters(v, allow_newlines=False)

    @field_validator("products")
    @classmethod
    def _products_no_control_chars(cls, v: list[str]) -> list[str]:
        for item in v:
            _reject_control_characters(item, allow_newlines=False)
        return v

    @field_validator("message")
    @classmethod
    def _message_no_control_chars(cls, v: str | None) -> str | None:
        return _reject_control_characters(v, allow_newlines=True)


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
    # Was unbounded — an admin-authed field, but still a free write into a
    # TEXT column with no ceiling.
    internal_notes: str | None = Field(None, max_length=MAX_MESSAGE_LENGTH)


# ─── Contact ───

class ContactCreate(BaseModel):
    name: ShortText = Field(..., min_length=2, max_length=150)
    email: EmailStr
    company: ShortText | None = Field(None, max_length=255)
    subject: ShortText | None = Field(None, max_length=255)
    # Harmonised with QuoteCreate.message — these were 5000 and 2000 with no
    # stated reason for the difference.
    message: str = Field(..., min_length=10, max_length=MAX_MESSAGE_LENGTH)

    @field_validator("name", "company", "subject")
    @classmethod
    def _no_control_chars(cls, v: str | None) -> str | None:
        return _reject_control_characters(v, allow_newlines=False)

    @field_validator("message")
    @classmethod
    def _message_no_control_chars(cls, v: str | None) -> str | None:
        return _reject_control_characters(v, allow_newlines=True)


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


# ─── Generic ───

class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    id: int | None = None