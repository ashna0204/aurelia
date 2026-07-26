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

The API will be live at **http://localhost:8000**.

Interactive docs at **/docs** and **/redoc** are served **only when `DEBUG=true`**. With
`DEBUG=false` they return 404, along with `/openapi.json`, so the API surface isn't
advertised in production.

On first launch, the database and its tables are created automatically.

---

## API Endpoints

### Public (frontend uses these)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/quotes/` | Submit a quote request |
| `POST` | `/api/contact/` | Submit a contact message |

Both are rate limited to `RATE_LIMIT_PER_MINUTE` submissions per IP per minute.

### Admin — requires `X-API-Key` header

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/quotes/` | List all quotes (filter by status) |
| `GET` | `/api/quotes/{id}` | Get quote details |
| `PATCH` | `/api/quotes/{id}/status` | Update quote status |
| `GET` | `/api/contact/` | List all messages |
| `PATCH` | `/api/contact/{id}/read` | Mark message as read |

Set `API_KEY` in `.env` to a strong random value (`openssl rand -hex 32`). If it is
left blank, every admin endpoint returns **503** — they are never open.

> **Note:** product catalog endpoints (`/api/products/`) were removed. The frontend
> renders its catalog from `frontend/src/data.js`; the API was never called by it.

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
│   ├── auth.py              # X-API-Key admin authentication
│   ├── limiter.py           # Shared slowapi rate limiter
│   ├── email_service.py     # SMTP email notifications
│   ├── routes_quotes.py     # /api/quotes endpoints
│   └── routes_contact.py    # /api/contact endpoints
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

- **Secrets**: never commit `.env`. Both `.gitignore` files exclude it — keep it that way.
- **`DEBUG`**: must be `false` in production. It also controls SQLAlchemy `echo`, which
  would otherwise log every customer submission in plaintext.
- **Database**: swap `DATABASE_URL` from SQLite to PostgreSQL. The SQLite file contains
  customer PII and is gitignored.
- **Rate limiting**: `slowapi` currently uses in-memory storage — it resets on restart and
  is per-process, so it gives no protection behind multiple workers. Point it at Redis
  before running more than one worker.
- **Migrations**: the single Alembic revision is a no-op; the schema is created by
  `Base.metadata.create_all()` at startup. Generate a real baseline before relying on Alembic.
- **HTTPS**: use a reverse proxy (Nginx, Caddy) with TLS.
- **Hosting**: works on Railway, Render, DigitalOcean, or any VPS with Python 3.11+
