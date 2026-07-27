# Aurelia — VPS Deployment Sizing & Provider Comparison (UK Region)

> Goal: host the Aurelia Logistics site (React/Vite frontend + FastAPI backend) on a
> single VPS located in the **UK (London)**, with room for PostgreSQL and Redis.
>
> ⚠️ **Prices below are indicative** (as of early 2026, ex‑VAT unless noted). VPS pricing
> changes often — treat this as a shortlist to verify on each provider's pricing page.
> UK B2B customers add **20% VAT** unless you supply a valid VAT number where the
> provider is outside the UK.

---

## 1. What actually runs on the box

| Component | Role | Typical RAM | Typical CPU |
|-----------|------|-------------|-------------|
| Nginx | Reverse proxy + serves the static Vite build | 20–50 MB | negligible |
| Uvicorn/Gunicorn (FastAPI) | API — contact & quote form endpoints | 150–300 MB (2 workers) | low, spiky |
| PostgreSQL | Production DB (replaces default SQLite) | 100–250 MB | low |
| Redis (optional) | Shared rate‑limit counter store (needed once >1 worker) | 10–30 MB | negligible |
| OS + journald + misc | Ubuntu/Debian base | 200–400 MB | negligible |

**Total steady‑state footprint: ~0.7–1.1 GB RAM.** This is a form‑driven marketing
site, not a heavy compute or high‑QPS workload — CPU is almost never the bottleneck;
RAM and the Vite build step are.

> 💡 **Build tip:** `vite build` (esp. React 19) can transiently use 0.5–1 GB. Either
> build on a 2 GB box, add swap, or build in CI/locally and ship only the `dist/` folder.
> If you build on the server, **2 GB RAM avoids OOM.**

---

## 2. Recommended machine size

| Tier | Spec | Fits? | Use when |
|------|------|-------|----------|
| Minimum | **1 vCPU / 1 GB / 25 GB SSD** | Tight — add 1–2 GB swap; build `dist/` off‑box | Lowest cost, very low traffic, external DB |
| ✅ **Recommended** | **2 vCPU / 2 GB / ~50 GB SSD** | Comfortable — app + Postgres + Redis + on‑box build | Default choice for this site |
| Comfortable | **2 vCPU / 4 GB / ~80 GB SSD** | Lots of headroom | Growth, staging+prod on one box, heavier DB |

**Bottom line:** start on **2 vCPU / 2 GB / 50 GB SSD**. It runs the whole stack
(Nginx + FastAPI + PostgreSQL + Redis) with headroom to run the Vite build on‑server,
and it's the cheapest tier that won't fight you.

---

## 3. Provider comparison — UK (London) region

All providers below have a **genuine London datacenter**. Specs shown are the closest
match to the recommended **2 vCPU / 2 GB** tier.

| Provider | Plan | vCPU | RAM | Storage | Transfer | Approx. price (ex‑VAT) | UK DC |
|----------|------|-----:|----:|---------|----------|------------------------|:-----:|
| **DigitalOcean** | Basic Droplet (2 GB) | 2 | 2 GB | 50 GB SSD | 2 TB | **$18/mo (~£14)** | London (LON1) |
| **Linode / Akamai** | Shared 2 GB | 1 | 2 GB | 50 GB SSD | 2 TB | **$12/mo (~£9.50)** | London |
| **Vultr** | Cloud Compute (Regular) | 1 | 2 GB | 55 GB SSD | 2 TB | **$12/mo (~£9.50)** | London |
| **AWS Lightsail** | 2 GB plan | 2 | 2 GB | 60 GB SSD | 3 TB | **$12/mo (~£9.50)** | London (eu‑west‑2) |
| **OVHcloud** | VPS‑2 | 2 | 4 GB | 80 GB SSD | Unmetered* | **~£6–7/mo** | London (UK) |
| **Contabo** | Cloud VPS 10 | 3 | 8 GB | 75 GB NVMe | 32 TB | **~£6/mo** | London (UK) |
| **IONOS** | VPS Linux M/L | 2 | 2–4 GB | 80 GB SSD | Unlimited | **~£4–7/mo** (intro) | UK |
| **Hostinger** | KVM 2 | 2 | 8 GB | 100 GB NVMe | 2 TB | **~£7/mo** (intro) | UK (London) |
| **UpCloud** | 2 GB plan | 1 | 2 GB | 50 GB SSD | 2 TB | **~$18/mo (~£14)** | London |

\* "Unmetered/unlimited" transfer is subject to fair‑use policies.

> **Intro pricing caveat (IONOS, Hostinger):** headline prices are promotional and require a
> long upfront term (**12–24 months**), then **renew ~20–40% higher** (Hostinger KVM 2 renews
> around **~£11/mo**). Hostinger throws in generous RAM (8 GB) and NVMe, but plan for the
> renewal rate and the lock‑in.

> **Not in this table but worth knowing — Hetzner Cloud.** Best price/performance in
> Europe by a wide margin (CX22: **2 vCPU / 4 GB / 40 GB ≈ €4.59/mo**), but its nearest
> DCs are **Germany & Finland — no UK datacenter**. If a physical UK location is a hard
> requirement (data residency, ~5–10 ms lower latency to UK users), skip it; if "close to
> the UK / EU" is good enough, it's the value leader.

---

## 4. How to read this

- **Cheapest with a real UK DC + big specs:** **Contabo** and **OVHcloud**. Great £/GB,
  but shared/oversold CPU and slower support — fine for a low‑traffic marketing site,
  less ideal if you want predictable performance.
- **Best balance of price, tooling & reliability:** **Linode/Akamai** or **Vultr** at
  **~$12/mo** — clean dashboards, snapshots, good London network, mainstream docs.
- **Most polished ecosystem / easiest ops:** **DigitalOcean** — best docs, one‑click
  stacks, managed DB upsell path, but ~50% pricier than Linode/Vultr for the same tier.
- **Already in AWS?** **Lightsail** gives a fixed‑price on‑ramp in eu‑west‑2 and an easy
  path to RDS/S3 later.

### Recommendation for Aurelia

> **Primary pick: Linode (Akamai) or Vultr — 2 GB London plan, ~$12/mo (~£9.50 ex‑VAT).**
> The 1 vCPU is plenty for this API; add **1 GB swap** and build the frontend off‑box (or
> bump to their 2 vCPU / 4 GB tier at ~$24/mo if you build on the server).
>
> **Value pick: OVHcloud VPS‑2 (2 vCPU / 4 GB, UK)** at ~£6–7/mo if budget is the priority
> and you accept shared‑CPU tradeoffs.
>
> **Polish pick: DigitalOcean 2 GB Droplet (2 vCPU)** at $18/mo if you want the smoothest
> tooling and managed‑DB upgrade path.

---

## 5. Cost of running (12‑month view, ex‑VAT)

| Provider (recommended tier) | Monthly | Annual |
|-----------------------------|--------:|-------:|
| Contabo VPS 10 | ~£6 | ~£72 |
| OVHcloud VPS‑2 | ~£6.5 | ~£78 |
| Hostinger KVM 2 (intro) | ~£7 | ~£84 |
| Linode / Vultr 2 GB | ~£9.5 | ~£114 |
| AWS Lightsail 2 GB | ~£9.5 | ~£114 |
| DigitalOcean 2 GB | ~£14 | ~£168 |

Add **20% VAT** for UK billing. Backups/snapshots are typically **+20–30%** of the
instance price and are strongly recommended given the box holds customer PII.

---

## 6. Notes specific to this app

- **Switch off SQLite for production.** `database.py` defaults to SQLite but the code is
  written for a `DATABASE_URL` swap to PostgreSQL — install Postgres on the same box (cheap
  path) or use a managed DB (DigitalOcean/Linode/AWS offer one nearby) for durability.
- **Redis is optional but recommended** once you run more than one Uvicorn worker, so the
  slowapi rate limiter shares one counter (`RATE_LIMIT_STORAGE_URI=redis://...`). A single
  box comfortably co‑hosts Redis.
- **Set `TRUSTED_PROXIES`** to Nginx's IP (e.g. `127.0.0.1`) so client‑IP rate limiting
  reads `X-Forwarded-For` correctly behind the reverse proxy.
- **Outbound SMTP (port 587)** must be allowed — some providers block outbound mail ports
  by default (notably on new accounts). Confirm before relying on the email notifier, or
  use an API‑based mail provider.
- **UK data residency:** if customer PII must stay in the UK, this rules out Hetzner and
  makes a London‑DC provider mandatory (all Section 3 options qualify).

---

*Generated for the Aurelia deployment. Verify current pricing on each provider's site
before purchase; figures are indicative and exclude VAT unless stated.*
