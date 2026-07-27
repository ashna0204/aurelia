# Aurelia — VPS Deployment Guide (UK Region)

Deploy the Aurelia Logistics site — **React/Vite frontend + FastAPI backend + PostgreSQL
+ Redis** — onto a single Ubuntu VPS in the **UK (London)**, behind Nginx with HTTPS.

- **Part A** — [Cost comparison (INR)](#part-a--cost-comparison-inr)
- **Part B** — [Step‑by‑step deployment](#part-b--step-by-step-deployment)

---

## Architecture on one box

```
                    ┌──────────────────────── VPS (Ubuntu 24.04, London) ─────────────────────┐
   Internet ──443──▶│  Nginx  ──/──▶  /var/www/aurelia (Vite static build)                    │
                    │           └──/api/──▶ 127.0.0.1:8000  Gunicorn+Uvicorn (FastAPI)         │
                    │                              │                                           │
                    │                              ├──▶ PostgreSQL 127.0.0.1:5432              │
                    │                              └──▶ Redis      127.0.0.1:6379 (rate limit) │
                    └──────────────────────────────────────────────────────────────────────────┘
```

The frontend calls the API with **relative paths** (`VITE_API_BASE_URL` defaults to empty),
so serving both from one domain and proxying `/api/` is the simplest correct setup — no CORS
juggling needed.

---

## Recommended size

**2 vCPU / 2 GB RAM / ~50 GB SSD.** Runs Nginx + FastAPI + PostgreSQL + Redis and can build
the frontend on‑box. 1 GB works only if you add swap and build the frontend elsewhere.

---

## Part A — Cost comparison (INR)

All providers below have a **real London datacenter**. Specs are the closest match to the
recommended **2 vCPU / 2 GB** tier.

> 💱 INR figures are **approximate** conversions (early 2026: ~₹88/USD, ~₹112/GBP). Provider
> pricing and forex move — verify before buying. Prices exclude **18% GST** (India billing)
> and any card forex markup (~1–3.5%).

| Provider | Plan | vCPU | RAM | Storage | Transfer | ≈ Monthly (INR) | ≈ Annual (INR) | UK DC |
|----------|------|-----:|----:|---------|----------|----------------:|---------------:|:-----:|
| **Contabo** | Cloud VPS 10 | 3 | 8 GB | 75 GB NVMe | 32 TB | **₹670** | ₹8,000 | London |
| **OVHcloud** | VPS‑2 | 2 | 4 GB | 80 GB SSD | Unmetered* | **₹730** | ₹8,800 | London |
| **IONOS** | VPS Linux M/L | 2 | 2–4 GB | 80 GB SSD | Unlimited | **₹450–780** (intro) | ₹5,400–9,400 | UK |
| **Hostinger** | KVM 2 | 2 | 8 GB | 100 GB NVMe | 2 TB | **₹790** (intro) | ₹9,500 | UK (London) |
| **Linode / Akamai** | Shared 2 GB | 1 | 2 GB | 50 GB SSD | 2 TB | **₹1,055** | ₹12,700 | London |
| **Vultr** | Cloud Compute | 1 | 2 GB | 55 GB SSD | 2 TB | **₹1,055** | ₹12,700 | London |
| **AWS Lightsail** | 2 GB plan | 2 | 2 GB | 60 GB SSD | 3 TB | **₹1,055** | ₹12,700 | London (eu‑west‑2) |
| **DigitalOcean** | Basic Droplet | 2 | 2 GB | 50 GB SSD | 2 TB | **₹1,585** | ₹19,000 | London (LON1) |
| **UpCloud** | 2 GB plan | 1 | 2 GB | 50 GB SSD | 2 TB | **₹1,585** | ₹19,000 | London |

\* "Unmetered/unlimited" is subject to fair‑use policies.

> **Intro vs. renewal (IONOS, Hostinger):** the low prices are **promotional** and require a
> long upfront term (often **12–24 months**). They **renew 20–40% higher** — Hostinger's KVM 2
> renews around **₹1,250/mo**. Budget for the renewal rate, not just the first term.

> **Hetzner Cloud** is the European value leader (CX22: 2 vCPU / 4 GB ≈ **₹435/mo**) but has
> **no UK datacenter** (Germany/Finland only). Exclude it if UK data residency or lowest UK
> latency matters — this app stores customer PII, so residency usually does.

**Add‑ons (budget for these):** off‑site **backups/snapshots** typically **+20–30%** of the
instance price — strongly recommended since the box holds customer data.

### Which to pick

| Priority | Pick | Why |
|----------|------|-----|
| ✅ Balance (default) | **Linode or Vultr, ~₹1,055/mo** | Clean tooling, snapshots, reliable London network |
| Lowest cost, UK DC | **OVHcloud VPS‑2 (~₹730) / Contabo (~₹670)** | Big specs, cheap; shared/oversold CPU, slower support |
| Generous RAM, intro price | **Hostinger KVM 2 (~₹790 intro)** | 2 vCPU / 8 GB, easy panel; watch the renewal jump + long‑term lock‑in |
| Smoothest ops | **DigitalOcean (~₹1,585)** | Best docs & managed‑DB upgrade path, ~50% pricier |

---

## Part B — Step‑by‑step deployment

Assumes **Ubuntu 24.04 LTS**, a domain (e.g. `aurelia.example.com`) with an **A record**
pointing at the VPS IP, and SSH access. Replace `aurelia.example.com` and passwords throughout.

### 1. Create a VPS

Pick a provider from Part A, choose **Ubuntu 24.04**, **London** region, size **2 vCPU / 2 GB**,
and add your SSH key. Note the public IP and point your domain's A record at it.

### 2. Initial server hardening

```bash
ssh root@YOUR_SERVER_IP

# Create a non-root sudo user
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy   # copy your SSH key

# Update the system
apt update && apt upgrade -y

# Firewall: allow SSH + HTTP/HTTPS only
apt install -y ufw
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

From here on, log in as `deploy` (`ssh deploy@YOUR_SERVER_IP`) and prefix commands with `sudo`.

### 3. Install packages

```bash
sudo apt install -y python3 python3-venv python3-pip \
                    postgresql postgresql-contrib redis-server \
                    nginx git curl

# Node.js 20 LTS (for building the frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4. PostgreSQL

```bash
sudo -u postgres psql <<'SQL'
CREATE DATABASE aurelia;
CREATE USER aurelia WITH PASSWORD 'CHANGE_ME_STRONG_DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE aurelia TO aurelia;
ALTER DATABASE aurelia OWNER TO aurelia;
SQL
```

Redis is already running after install (localhost:6379) — no config needed for a single box.

### 5. Get the code

```bash
sudo mkdir -p /opt/aurelia && sudo chown deploy:deploy /opt/aurelia
git clone https://github.com/ashna0204/aurelia.git /opt/aurelia
cd /opt/aurelia
```

### 6. Backend — virtualenv, config, migrations

```bash
cd /opt/aurelia/backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r app/requirements.txt
pip install gunicorn psycopg2-binary redis   # WSGI runner + Postgres driver + Redis client
# `redis` is NOT in requirements.txt but is needed for the rate limiter's
# RATE_LIMIT_STORAGE_URI (redis://...) — mandatory when ENV=production.
```

Create `/opt/aurelia/backend/.env` (production values — **every one of these is enforced at
startup when `ENV=production`**):

```ini
APP_NAME=Aurelia Logistics API
ENV=production
DEBUG=false

# Your public site origin(s), comma-separated. Used for CORS.
ALLOWED_ORIGINS=https://aurelia.example.com

# PostgreSQL
DATABASE_URL=postgresql+psycopg2://aurelia:CHANGE_ME_STRONG_DB_PASSWORD@127.0.0.1:5432/aurelia

# SMTP — MANDATORY in production (enquiries are dropped silently without it)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-sending-address@domain.com
SMTP_PASSWORD=your-app-password
NOTIFICATION_EMAIL=where-enquiries-should-land@domain.com

# Admin API key — REQUIRED, min 32 bytes entropy. Generate below.
API_KEY=PASTE_GENERATED_KEY_HERE

# Append-only admin-access audit log (GDPR Art. 33)
AUDIT_LOG_PATH=/var/log/aurelia/audit.log

# Rate limiting
RATE_LIMIT_PER_MINUTE=5
ADMIN_RATE_LIMIT_PER_MINUTE=30
# REQUIRED in production — shared counter store so multiple workers agree
RATE_LIMIT_STORAGE_URI=redis://127.0.0.1:6379/0

# Nginx runs on the same host and terminates TLS; trust it for X-Forwarded-For
TRUSTED_PROXIES=127.0.0.1
```

Generate the API key and lock down the files:

```bash
# Admin API key (>= 32 bytes)
openssl rand -hex 32          # paste the output into API_KEY above

# Audit log destination
sudo mkdir -p /var/log/aurelia && sudo chown deploy:deploy /var/log/aurelia

# .env holds DB + SMTP + admin secrets — restrict it
chmod 600 /opt/aurelia/backend/.env

# Apply DB schema (Alembic is the source of truth; app refuses to start if behind)
alembic upgrade head
```

### 7. Backend — run as a service

Create `/etc/systemd/system/aurelia.service`:

```ini
[Unit]
Description=Aurelia FastAPI backend
After=network.target postgresql.service redis-server.service

[Service]
User=deploy
Group=deploy
WorkingDirectory=/opt/aurelia/backend
Environment="PATH=/opt/aurelia/backend/.venv/bin"
ExecStart=/opt/aurelia/backend/.venv/bin/gunicorn app.main:app \
          -k uvicorn.workers.UvicornWorker \
          -w 2 --bind 127.0.0.1:8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now aurelia
sudo systemctl status aurelia            # should be active (running)
curl http://127.0.0.1:8000/health        # {"status":"ok"} or similar
```

> `WorkingDirectory` is `backend/` because the app imports as `app.main:app` and `alembic.ini`
> lives there. `-w 2` is safe because Redis backs the rate limiter.

### 8. Frontend — build the static site

```bash
cd /opt/aurelia/frontend
npm ci
# Same-domain deploy → leave VITE_API_BASE_URL empty so the app uses relative /api paths
npm run build                            # outputs to frontend/dist

sudo mkdir -p /var/www/aurelia
sudo cp -r dist/* /var/www/aurelia/
sudo chown -R www-data:www-data /var/www/aurelia
```

> On a 1 GB box the build may OOM — either add swap (`fallocate -l 2G /swapfile` …) or run
> `npm run build` locally and copy `dist/` up with `scp`.

### 9. Nginx — serve frontend, proxy the API

Create `/etc/nginx/sites-available/aurelia`:

```nginx
server {
    listen 80;
    server_name aurelia.example.com;

    root /var/www/aurelia;
    index index.html;

    # SPA: serve files, fall back to index.html for client-side routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API → FastAPI backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/aurelia /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

`X-Forwarded-For` from Nginx (127.0.0.1) is trusted because `TRUSTED_PROXIES=127.0.0.1`, so
per‑IP rate limiting sees the real client address.

### 10. HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d aurelia.example.com --redirect --agree-tos -m you@example.com
```

Certbot edits the Nginx config for TLS + HTTP→HTTPS redirect and installs an auto‑renew timer.

### 11. Verify

```bash
curl -I  https://aurelia.example.com/           # 200, serves the SPA
curl     https://aurelia.example.com/api/../health   # backend reachable via proxy
# Submit a test enquiry from the site and confirm the notification email arrives.
```

Check `sudo journalctl -u aurelia -f` while submitting to watch requests.

---

## Updating a deployed site

```bash
cd /opt/aurelia && git pull

# Backend
cd backend && source .venv/bin/activate
pip install -r app/requirements.txt
alembic upgrade head
sudo systemctl restart aurelia

# Frontend
cd ../frontend && npm ci && npm run build
sudo cp -r dist/* /var/www/aurelia/ && sudo chown -R www-data:www-data /var/www/aurelia
```

---

## Backups (do this)

```bash
# Nightly Postgres dump at 02:30 — add to `crontab -e`
30 2 * * * pg_dump -U aurelia -h 127.0.0.1 aurelia | gzip > /var/backups/aurelia-$(date +\%F).sql.gz
```

Also enable your provider's **snapshot/backup** add‑on (Part A) for full‑disk recovery, and
copy dumps off‑box (object storage) so a lost VPS doesn't take the data with it.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| `aurelia.service` won't start | `journalctl -u aurelia -e`. Usually a missing/invalid `.env` value — `ENV=production` requires `API_KEY` (≥32 bytes), SMTP creds, `NOTIFICATION_EMAIL`, and `RATE_LIMIT_STORAGE_URI`. |
| "Database schema is out of date" | Run `alembic upgrade head` in `backend/` with the venv active. |
| Startup rejects `DEBUG=true` | Intentional in production (it logs PII + exposes /docs). Set `DEBUG=false`. |
| API 502 in browser | Backend down or not on `127.0.0.1:8000` — check `systemctl status aurelia`. |
| Enquiry accepted but no email | SMTP creds wrong, or provider **blocks outbound port 587** (common on new accounts). Test with `swaks`, or switch to an API‑based mail provider. |
| Rate limit off / inconsistent | `RATE_LIMIT_STORAGE_URI` must point at Redis; confirm `redis-server` is running. |
| Wrong client IPs in limiter | `TRUSTED_PROXIES` must list Nginx's IP (`127.0.0.1` for same‑host). |

---

*Verify current provider pricing before purchase; INR figures are indicative, exclude GST,
and depend on the USD/GBP→INR rate at billing time.*
