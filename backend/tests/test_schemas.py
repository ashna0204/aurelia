"""Pydantic schema edge cases — validators, bounds, serialization."""

from datetime import datetime

import pytest
from pydantic import ValidationError

from app.schemas import (
    ContactCreate,
    QuoteCreate,
    QuoteResponse,
    QuoteStatusUpdate,
    SuccessResponse,
    _validate_phone,
    _reject_control_characters,
)
from tests.factories import contact_payload, quote_payload


def test_quotecreate_accepts_valid_payload():
    model = QuoteCreate(**quote_payload())
    assert model.products == ["Food & Grocery"]
    assert model.website is None


def test_quotecreate_trims_whitespace_on_short_text():
    model = QuoteCreate(**quote_payload(name="  Priya  "))
    assert model.name == "Priya"


@pytest.mark.parametrize("phone", ["+44 20 7946 0958", "(020) 7946-0958", "007946095811"])
def test_valid_phone_shapes_pass(phone):
    assert _validate_phone(phone) == phone


@pytest.mark.parametrize("phone", ["abc", "12345", "+" + "9" * 16])
def test_invalid_phone_shapes_raise(phone):
    with pytest.raises(ValueError):
        _validate_phone(phone)


def test_empty_phone_normalizes_to_none():
    assert _validate_phone("") is None
    assert _validate_phone(None) is None


def test_reject_control_characters_blocks_nul():
    with pytest.raises(ValueError):
        _reject_control_characters("bad\x00value", allow_newlines=False)


def test_reject_control_characters_allows_newlines_when_permitted():
    assert _reject_control_characters("line1\nline2", allow_newlines=True) == "line1\nline2"


def test_reject_control_characters_passes_through_none():
    assert _reject_control_characters(None, allow_newlines=False) is None


def test_quotecreate_rejects_control_char_in_name():
    with pytest.raises(ValidationError):
        QuoteCreate(**quote_payload(name="Priya\x07Menon"))


def test_quotecreate_message_allows_newlines():
    model = QuoteCreate(**quote_payload(message="Line one here.\nLine two here."))
    assert "\n" in model.message


def test_quotecreate_rejects_unknown_volume():
    with pytest.raises(ValidationError):
        QuoteCreate(**quote_payload(volume="loads"))


def test_quotecreate_requires_min_message_length():
    with pytest.raises(ValidationError):
        QuoteCreate(**quote_payload(message="tiny"))


def test_contactcreate_valid():
    model = ContactCreate(**contact_payload())
    assert model.subject == "Partnership enquiry"


def test_contactcreate_optional_subject_may_be_omitted():
    payload = contact_payload()
    del payload["subject"]
    del payload["company"]
    model = ContactCreate(**payload)
    assert model.subject is None
    assert model.company is None


def test_quotestatusupdate_pattern_enforced():
    QuoteStatusUpdate(status="reviewed")
    with pytest.raises(ValidationError):
        QuoteStatusUpdate(status="invalid")


def test_quotestatusupdate_notes_length_bounded():
    with pytest.raises(ValidationError):
        QuoteStatusUpdate(status="new", internal_notes="x" * 4001)


def test_quoteresponse_serializes_from_attributes():
    class Row:
        id = 7
        name = "Priya"
        email = "p@example.com"
        company = None
        phone = None
        products = ["Food & Grocery"]
        volume = None
        frequency = None
        destination = None
        message = "hello there general"
        status = "new"
        created_at = datetime(2026, 7, 27, 12, 0, 0)

    model = QuoteResponse.model_validate(Row())
    assert model.id == 7
    assert model.products == ["Food & Grocery"]


def test_successresponse_defaults():
    resp = SuccessResponse(message="ok")
    assert resp.success is True
    assert resp.id is None
