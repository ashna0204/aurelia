"""Deterministic payload builders for the two public forms.

``faker`` is seeded once at import so every run produces identical data — a
requirement for asserting on stored values. Callers override any field via
keyword; defaults are always valid against the Pydantic schemas.
"""

from faker import Faker

fake = Faker()
Faker.seed(20260727)

# The closed sector vocabulary the API accepts (mirrors schemas.Sector).
VALID_SECTOR = "Food & Grocery"
VALID_VOLUME = "5 – 20 MT"
VALID_FREQUENCY = "Monthly"


def quote_payload(**overrides):
    """A valid ``POST /api/quotes/`` body."""
    payload = {
        "name": "Priya Menon",
        "email": "priya.menon@example.com",
        "company": "Menon Imports Ltd",
        "phone": "+44 20 7946 0958",
        "products": [VALID_SECTOR],
        "volume": VALID_VOLUME,
        "frequency": VALID_FREQUENCY,
        "destination": "Mombasa, Kenya",
        "message": "Please quote 500kg Matta Rice and 200kg Toor Dall, FOB Kochi.",
    }
    payload.update(overrides)
    return payload


def contact_payload(**overrides):
    """A valid ``POST /api/contact/`` body."""
    payload = {
        "name": "Sam Okafor",
        "email": "sam.okafor@example.com",
        "company": "Okafor Trading",
        "subject": "Partnership enquiry",
        "message": "We would like to discuss a recurring supply arrangement.",
    }
    payload.update(overrides)
    return payload


def fake_quote_payload():
    """A valid quote body with faker-generated (but seeded) contact details."""
    return quote_payload(
        name=fake.name(),
        email=fake.email(),
        company=fake.company(),
        message=f"Requirement reference {fake.bothify('REF-####')}: bulk order please.",
    )
