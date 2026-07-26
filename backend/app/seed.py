"""
Seed the database with the initial product catalog.
Run: python -m app.seed
"""

from app.database import SessionLocal, init_db
from app.models import Product


SEED_PRODUCTS = [
    {
        "name": "Black Pepper",
        "slug": "black-pepper",
        "origin": "Kerala",
        "description": "The king of spices — bold, pungent, and aromatic. Sourced from the Malabar Coast.",
        "image_url": "https://images.unsplash.com/photo-1599909533601-fc09b31a6e4e?w=600&q=80",
        "grade": "TGSEB / FAQ / UG",
        "packaging": "25kg / 50kg PP bags, vacuum sealed",
        "moq": "1 MT",
        "moisture": "≤ 12%",
        "shelf_life": "24 months",
        "sort_order": 1,
    },
    {
        "name": "Cardamom",
        "slug": "cardamom",
        "origin": "Western Ghats",
        "description": "Queen of spices — intensely fragrant with sweet, floral complexity.",
        "image_url": "https://images.unsplash.com/photo-1603903631918-43e68e845651?w=600&q=80",
        "grade": "AGG / AGB / AGS",
        "packaging": "5kg / 10kg / 25kg cartons",
        "moq": "500 kg",
        "moisture": "≤ 10%",
        "shelf_life": "18 months",
        "sort_order": 2,
    },
    {
        "name": "Cinnamon",
        "slug": "cinnamon",
        "origin": "Sri Lanka & Kerala",
        "description": "True Ceylon cinnamon — delicate, warm, and unmistakably refined.",
        "image_url": "https://images.unsplash.com/photo-1474979266404-7eaacdc50f73?w=600&q=80",
        "grade": "C4 / C5 / Quillings / Chips",
        "packaging": "Bales / 25kg cartons",
        "moq": "500 kg",
        "moisture": "≤ 13%",
        "shelf_life": "24 months",
        "sort_order": 3,
    },
    {
        "name": "Sesame",
        "slug": "sesame",
        "origin": "Rajasthan",
        "description": "Nutty, rich, and versatile — premium white and black sesame seeds.",
        "image_url": "https://images.unsplash.com/photo-1612187209234-a5a2e4fae09e?w=600&q=80",
        "grade": "99/1 / 99.5/0.5 / Sortex Clean",
        "packaging": "25kg / 50kg PP bags",
        "moq": "5 MT",
        "moisture": "≤ 6%",
        "shelf_life": "12 months",
        "sort_order": 4,
    },
    {
        "name": "Chilli",
        "slug": "chilli",
        "origin": "Andhra Pradesh",
        "description": "From Guntur's fiery reds to Kashmiri's vivid crimson — heat with character.",
        "image_url": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&q=80",
        "grade": "S4 / S17 / Teja / 334",
        "packaging": "10kg / 25kg PP bags",
        "moq": "2 MT",
        "moisture": "≤ 12%",
        "shelf_life": "18 months",
        "sort_order": 5,
    },
    {
        "name": "Ginger",
        "slug": "ginger",
        "origin": "Kerala & Assam",
        "description": "Fresh, dried, and powdered — sharp warmth with citrus undertones.",
        "image_url": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&q=80",
        "grade": "Cochin / Calicut / Bleached / Unbleached",
        "packaging": "25kg / 50kg jute bags",
        "moq": "2 MT",
        "moisture": "≤ 12%",
        "shelf_life": "24 months",
        "sort_order": 6,
    },
    {
        "name": "Turmeric",
        "slug": "turmeric",
        "origin": "Tamil Nadu",
        "description": "Golden root of wellness — deep colour, earthy flavour, ancient heritage.",
        "image_url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80",
        "grade": "Erode / Salem / Finger / Bulb",
        "packaging": "25kg / 50kg PP bags",
        "moq": "2 MT",
        "moisture": "≤ 10%",
        "shelf_life": "24 months",
        "sort_order": 7,
    },
]


def seed():
    init_db()
    db = SessionLocal()

    try:
        existing = db.query(Product).count()
        if existing > 0:
            print(f"Database already has {existing} products — skipping seed.")
            return

        for product_data in SEED_PRODUCTS:
            product = Product(**product_data)
            db.add(product)

        db.commit()
        print(f"Seeded {len(SEED_PRODUCTS)} products successfully.")

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()