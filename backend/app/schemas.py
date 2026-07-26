"""
Pydantic schemas — request bodies, response models, and validation.
"""

import re
from datetime import datetime
from typing import Annotated, Literal, get_args

from pydantic import BaseModel, EmailStr, Field, StringConstraints, field_validator

#: Longest free-text body accepted on either public form.
MAX_MESSAGE_LENGTH = 4000

#: Shortest free-text body. Mirrored by the client-side validator; enforced here
#: because client-side validation is a UX affordance, not a control.
MIN_MESSAGE_LENGTH = 10

#: Control characters are rejected everywhere. NUL truncates strings in some C
#: extensions, and CR/LF are the payload shape for header-injection attempts
#: against the notification email. Tab, CR and LF stay legal inside message
#: bodies (see _reject_control_characters) but never in single-line fields.
_FORBIDDEN_CONTROL = {chr(c) for c in range(0x20)} | {chr(0x7F)}

#: Single-line text: trimmed, no control characters at all.
ShortText = Annotated[str, StringConstraints(strip_whitespace=True)]

#: Free-text body: trimmed, but newlines and tabs survive inside it.
BodyText = Annotated[str, StringConstraints(strip_whitespace=True)]


def _reject_control_characters(value: str | None, *, allow_newlines: bool) -> str | None:
    if value is None:
        return None
    allowed = {"\t", "\r", "\n"} if allow_newlines else set()
    if any(ch in _FORBIDDEN_CONTROL and ch not in allowed for ch in value):
        raise ValueError("must not contain control characters")
    return value


# ─── Phone ───
#
# Deliberately shape-only, not carrier-real. The goal is to reject input the
# trade team demonstrably cannot dial ("not-a-phone!!!", a stray sentence) while
# staying permissive about how international numbers are actually written —
# spaces, dashes, parens, dots and a leading +/00 are all normal.
#
# 7–15 digits is the E.164 range: 15 is the ITU-T maximum, and 7 is below any
# real international number but above a typo. Extensions are not accepted; put
# those in the notes field.
_PHONE_ALLOWED = re.compile(r"^[+(0-9][0-9\s().\-/]*$")
_PHONE_MIN_DIGITS = 7
_PHONE_MAX_DIGITS = 15


def _validate_phone(value: str | None) -> str | None:
    """Validate the *shape* of a phone number, preserving the caller's own
    formatting — normalising to bare E.164 would require guessing a country
    code we were never given."""
    if value is None or value == "":
        return None

    if not _PHONE_ALLOWED.match(value):
        raise ValueError(
            "must be a phone number — digits, optionally with '+', spaces, "
            "dashes, dots or parentheses"
        )

    digits = sum(ch.isdigit() for ch in value)
    if not _PHONE_MIN_DIGITS <= digits <= _PHONE_MAX_DIGITS:
        raise ValueError(
            f"must contain between {_PHONE_MIN_DIGITS} and {_PHONE_MAX_DIGITS} digits"
        )

    return value


# ─── Quote vocabulary ───
#
# The UI presents these as fixed choices, so the API accepts exactly these and
# nothing else: an allow-list is the only thing that makes the stored values
# usable for routing or reporting later. Mirrored verbatim in
# frontend/src/constants/quoteForm.js — the two lists must stay in step.
#
# The en dashes in VOLUMES are written as – escapes on purpose: they are
# part of the matched value, and an editor silently rewriting one to a hyphen
# would turn every quote submission into a 422.
Sector = Literal[
    "Ethnic Food & Grocery",
    "Vehicle Parts & Accessories",
    "Pharmaceuticals & Healthcare",
    "Multiple / Other",
]
Volume = Literal[
    "< 1 MT / small consignment",
    "1 – 5 MT",
    "5 – 20 MT",
    "20 – 100 MT",
    "100+ MT / contract supply",
]
Frequency = Literal[
    "One-time",
    "Monthly",
    "Quarterly",
    "Ongoing contract",
]

#: Tuple forms, derived from the Literals so there is exactly one source of
#: truth. Useful for tests and for anything that needs to enumerate the options.
QUOTE_SECTORS = get_args(Sector)
QUOTE_VOLUMES = get_args(Volume)
QUOTE_FREQUENCIES = get_args(Frequency)


# ─── Quote Request ───

class QuoteCreate(BaseModel):
    name: ShortText = Field(..., min_length=2, max_length=150)
    email: EmailStr
    company: ShortText | None = Field(None, max_length=255)
    phone: ShortText | None = Field(None, max_length=50)
    # Closed vocabulary: the UI offers exactly these, so the API accepts exactly
    # these. Previously free text, which let a direct POST store anything at all
    # in the JSON column. `max_length=1` because the form maps the single chosen
    # sector into this list; the plural name is retained because it is the
    # existing column name and wire field.
    products: list[Sector] = Field(..., min_length=1, max_length=1)
    volume: Volume | None = None
    frequency: Frequency | None = None
    destination: ShortText | None = Field(None, max_length=255)
    # Required, and bounded on both ends. This is the form's "What do you need?"
    # field: the UI marks it required, so the server has to be the one enforcing
    # that — previously it was `None`-able with no floor, and an empty quote
    # request was accepted.
    message: BodyText = Field(..., min_length=MIN_MESSAGE_LENGTH, max_length=MAX_MESSAGE_LENGTH)

    # Honeypot. Never rendered to a human, so any value at all means a bot
    # filled every field it could find. Accepted (rather than rejected) at the
    # schema layer so the route can decide how to respond — see routes_quotes.
    website: str | None = Field(None, max_length=255)

    @field_validator("name", "company", "destination")
    @classmethod
    def _no_control_chars(cls, v: str | None) -> str | None:
        return _reject_control_characters(v, allow_newlines=False)

    @field_validator("phone")
    @classmethod
    def _check_phone(cls, v: str | None) -> str | None:
        return _validate_phone(_reject_control_characters(v, allow_newlines=False))

    @field_validator("message")
    @classmethod
    def _message_no_control_chars(cls, v: str) -> str:
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
    message: BodyText = Field(..., min_length=MIN_MESSAGE_LENGTH, max_length=MAX_MESSAGE_LENGTH)

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