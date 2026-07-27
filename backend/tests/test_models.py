"""ORM model repr helpers."""

from app.models import ContactMessage, QuoteRequest


def test_quote_repr_includes_id_name_status():
    quote = QuoteRequest(id=5, name="Priya", status="new")
    assert repr(quote) == "<Quote #5 — Priya (new)>"


def test_contact_repr_includes_id_and_name():
    contact = ContactMessage(id=3, name="Sam")
    assert repr(contact) == "<Contact #3 — Sam>"
