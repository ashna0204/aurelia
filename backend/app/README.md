# Aurelia Logistics — Backend API

FastAPI backend for the Aurelia Logistics website. Handles quote requests, contact form submissions, and product catalog management.

## Quick Start

```bash
# 1. Navigate to the backend directory
cd aurelia-backend

# 2. Create a virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your SMTP credentials (optional — app works without email)

# 5. Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be live at **http://localhost:8000** with interactive docs at **/docs**.

On first launch, the database is created automatically and seeded with the 7 spice products.

---

## API Endpoints

### Public (frontend uses these)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/quotes/` | Submit a quote request |
| `POST` | `/api/contact/` | Submit a contact message |
| `GET` | `/api/products/` | Get all active products |
| `GET` | `/api/products/{slug}` | Get single product by slug |

### Admin (for future admin panel)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/quotes/` | List all quotes (filter by status) |
| `GET` | `/api/quotes/{id}` | Get quote details |
| `PATCH` | `/api/quotes/{id}/status` | Update quote status |
| `GET` | `/api/contact/` | List all messages |
| `PATCH` | `/api/contact/{id}/read` | Mark message as read |
| `POST` | `/api/products/` | Add a product |
| `PUT` | `/api/products/{id}` | Update a product |
| `DELETE` | `/api/products/{id}` | Deactivate a product |

---

## Project Structure

```
aurelia-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Settings from .env
│   ├── database.py          # SQLAlchemy engine & session
│   ├── models.py            # DB table definitions
│   ├── schemas.py           # Pydantic request/response models
│   ├── seed.py              # Initial product data
│   ├── email_service.py     # SMTP email notifications
│   ├── routes_quotes.py     # /api/quotes endpoints
│   ├── routes_contact.py    # /api/contact endpoints
│   └── routes_products.py   # /api/products endpoints
├── .env.example
├── requirements.txt
└── README.md
```

---

## Email Notifications

When SMTP is configured in `.env`, the backend sends a styled HTML email to `NOTIFICATION_EMAIL` whenever:
- A new quote request is submitted
- A new contact message arrives

Works with Gmail (use an App Password), SendGrid, Mailgun, or any SMTP provider.

---

## Connecting to the Frontend

The Vite dev server runs on `http://localhost:5173` by default. CORS is already configured to allow this origin.

In your React frontend, point API calls to:

```javascript
const API_BASE = "http://localhost:8000";

// Submit a quote
const res = await fetch(`${API_BASE}/api/quotes/`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
});

// Fetch products from the API
const products = await fetch(`${API_BASE}/api/products/`).then(r => r.json());
```

---

## Production Notes

- **Database**: Swap `DATABASE_URL` from SQLite to PostgreSQL for production
- **Auth**: Admin routes currently have no authentication — add JWT or API key auth before deploying
- **HTTPS**: Use a reverse proxy (Nginx, Caddy) with TLS in production
- **Hosting**: Works great on Railway, Render, DigitalOcean, or any VPS with Python 3.11+
