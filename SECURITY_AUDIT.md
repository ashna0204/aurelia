# SECURITY AUDIT — Aurelia Logistics

**Audit date:** 2026-07-26
**Commit audited:** `0611c37` (Phase 0 complete)
**Auditor:** security review pass
**Standards:** OWASP Top 10 (2021), OWASP API Security Top 10 (2023), OWASP ASVS 4.0 L2, UK/EU GDPR
**Scope:** `backend/` (FastAPI + SQLAlchemy + SQLite), `frontend/` (React 19 + Vite), repository history, deployment posture

---

## 0. Audit method and a note on the brief

Every claim in this report was verified against the code or the repository, not
inherited from the engagement brief. **This matters: the brief's premise was wrong on
several counts, and a large fraction of the issues it lists were already fixed in
commit `9ae4d16` before this audit began.** Reporting them as live findings would have
inflated the risk picture and wasted remediation effort.

Items claimed by the brief that are **already resolved or were never true** are listed
in §7 with the evidence, so they are not re-opened later.

**Verification techniques used:** full-history blob sweep (3,652 objects) for credential
material; `git reflog` reconstruction of the push timeline; SQLite row-level triage of
the committed database; live unauthenticated probe of the GitHub remote; runtime tests
of the settings guard and of email header-injection exploitability.

---

## 1. System overview

### 1.1 Components

| Component | Technology | Notes |
|---|---|---|
| Frontend | React 19.2, Vite 8, react-router-dom 7 | Static SPA, brochure site, no auth |
| Backend | FastAPI 0.115, SQLAlchemy 2.0, Python 3.12/3.13 | Two public POST endpoints, six admin endpoints |
| Datastore | SQLite (`aurelia.db`), file-backed | Holds all customer enquiry PII |
| Mail | `aiosmtplib` 3.0 → Gmail SMTP :587 STARTTLS | Personal Gmail app password |
| Rate limiting | `slowapi` 0.1.9 | **In-process memory** — no shared backend |
| Migrations | Alembic 1.13 | **Initial revision is a no-op** |
| Admin auth | `X-API-Key` header | Single static key, no audit trail |

### 1.2 Data flows

```
                         ┌───────────────────────────────────────┐
   Public browser ──1──► │  SPA (static host / CDN)              │
                         │  bundles: data.js  ⚠ FOB price sheet  │
                         └──────────────┬────────────────────────┘
                                        │ 2. fetch POST /api/{quotes,contact}/
                                        │    JSON, no auth, no CSRF token
                         ┌──────────────▼────────────────────────┐
                         │  FastAPI                              │
                         │   • CORS allow-list                   │
                         │   • slowapi (in-memory) ⚠             │
                         │   • Pydantic validation               │
                         └───┬───────────────────────────────┬───┘
                             │ 3. sync ORM (threadpool)      │ 4. BackgroundTasks
                             ▼                               ▼
                     ┌───────────────┐              ┌────────────────────┐
                     │ SQLite file   │              │ Gmail SMTP :587    │
                     │ ⚠ plaintext   │              │ ⚠ personal app pw  │
                     │   PII at rest │              │   STARTTLS         │
                     └───────────────┘              └────────────────────┘
                             ▲
                             │ 5. GET /api/{quotes,contact}/  X-API-Key
                     ┌───────┴────────┐
                     │  Operator      │  ⚠ no audit log
                     └────────────────┘

   External, unauthenticated, hotlinked at render time:
     • images.unsplash.com   (4 photos, 3 size variants)  ⚠
     • fonts.googleapis.com / fonts.gstatic.com           ⚠ GDPR
```

### 1.3 Trust boundaries

| ID | Boundary | Control today |
|---|---|---|
| **TB-1** | Public browser → FastAPI | CORS allow-list, Pydantic schemas, in-memory rate limit |
| **TB-2** | FastAPI → SQLite | None — same host, file permissions only, no encryption |
| **TB-3** | FastAPI → Gmail SMTP | STARTTLS, app password |
| **TB-4** | Operator → admin API | Single static `X-API-Key`, non-constant-time compare |
| **TB-5** | Browser → third-party CDNs | **None** — no CSP, no SRI |
| **TB-6** | Developer workstation → GitHub | `.gitignore` (added Phase 0); history still contains the PII blob |

### 1.4 External dependencies

- **Google Fonts** (`fonts.googleapis.com`, `fonts.gstatic.com`) — every visitor's IP is disclosed to Google. GDPR-relevant.
- **Unsplash** (`images.unsplash.com`) — 4 photos hotlinked. No licence record, no availability guarantee, no integrity control.
- **Gmail SMTP** — Google acts as a processor for enquiry contents. No DPA in place.
- **GitHub** — source hosting; currently holds the PII blob in history.

---

## 2. Assets

| Asset | Sensitivity | Current protection | Adequate? |
|---|---|---|---|
| Customer enquiry PII (name, email, phone, company, message) | **High** — GDPR personal data | Static API key; unencrypted SQLite | **No** |
| Supplier identity (`Unifarex`) + full FOB USD cost basis | **High** — commercial | **None — publicly served in the JS bundle** | **No** |
| Admin `API_KEY` | **High** — unlocks all PII | `.env`, untracked; 32 bytes entropy | Partially |
| Gmail SMTP app password | **High** — sends as a person | `.env`, untracked | Partially |
| Brand reputation | **High** | — | See AUR-SEC-002 |
| Product catalogue / specs | Low — public marketing | n/a | Yes |

---

## 3. Threat model (STRIDE)

### TB-1 — Public browser → API

| STRIDE | Threat | Finding | Sev |
|---|---|---|---|
| **S** | Bot floods forms with forged enquiries | No CAPTCHA, no honeypot, no min-fill-time | AUR-SEC-019 | Med |
| **T** | Oversized/crafted payload corrupts store | `products` list has no max length or per-item cap | AUR-SEC-009 | Med |
| **R** | Submitter denies sending an enquiry | No source IP / UA / timestamp audit on submissions | AUR-SEC-026 | Low |
| **I** | Stack trace or internal detail leaks in a 500 | No global exception handler or correlation ID | AUR-SEC-013 | Med |
| **D** | Rate limit bypassed → DB/SMTP exhaustion | In-memory limiter; per-worker buckets | AUR-SEC-004 | High |
| **E** | Public caller reaches admin data | Admin routes gated — no path found | — | — |

### TB-2 — API → SQLite

| STRIDE | Threat | Finding | Sev |
|---|---|---|---|
| **T** | SQL injection | ORM parameterised throughout; **no injection found** | — | — |
| **R** | Schema changes untracked | Alembic revision is `pass`; `create_all()` at startup | AUR-SEC-005 | High |
| **I** | DB file read from disk / backup | No encryption at rest; file-backed on app host | AUR-SEC-010 | Med |
| **I** | PII written to application logs | `echo=settings.debug`; `logger.info` logs customer name | AUR-SEC-011 | Med |
| **D** | Write lock contention under load | SQLite single-writer | AUR-SEC-010 | Med |

### TB-3 — API → SMTP

| STRIDE | Threat | Finding | Sev |
|---|---|---|---|
| **S** | Attacker injects SMTP headers via form fields | **Tested — not exploitable.** Python's `email` lib raises `HeaderParseError` on ASCII CRLF and RFC 2047-encodes non-ASCII. See §7.1 | — | — |
| **S** | Mail spoofed as Aurelia | SPF/DKIM/DMARC not configured on the sending domain | AUR-SEC-027 | Med |
| **R** | Notification lost without trace | `except Exception` → log + `return False`; no persistence, no alert | AUR-SEC-012 | Med |
| **I** | Enquiry contents pass through Google | No processor agreement | GDPR-04 | Med |
| **D** | SMTP outage silently drops notifications | No retry, no dead-letter queue | AUR-SEC-012 | Med |

### TB-4 — Operator → admin API

| STRIDE | Threat | Finding | Sev |
|---|---|---|---|
| **S** | Key brute-forced or guessed | 32 bytes entropy — adequate; but no rate limit on admin routes | AUR-SEC-004 | High |
| **S** | Key recovered via timing side-channel | `key != settings.api_key` — non-constant-time | AUR-SEC-007 | High |
| **R** | No record of who read customer PII | **No audit log of any admin call** | AUR-SEC-008 | High |
| **I** | Bulk PII exfiltration via `GET /api/quotes/` | Single static key is the only control | AUR-SEC-008 | High |
| **E** | Key leaked → permanent full access | No expiry, no rotation mechanism, no revocation | AUR-SEC-008 | High |

### TB-5 — Browser → third-party CDNs

| STRIDE | Threat | Finding | Sev |
|---|---|---|---|
| **T** | Compromised CDN injects script | **No CSP, no SRI** | AUR-SEC-017 | Med |
| **I** | Visitor IPs disclosed to Google | Google Fonts hotlinked | AUR-SEC-015 | Med |
| **D** | Image host outage breaks the page | Unsplash hotlinked, no fallback | AUR-SEC-016 | Med |
| **T** | Clickjacking / UI redress | No `X-Frame-Options` / `frame-ancestors` | AUR-SEC-003 | High |

### TB-6 — Workstation → GitHub

| STRIDE | Threat | Finding | Sev |
|---|---|---|---|
| **I** | PII database recoverable from history | Blob `f9fdbfb` still in remote history | **AUR-SEC-001** | **Critical** |
| **I** | Future secret committed | `.gitignore` added; no pre-commit or CI scanning yet | AUR-SEC-018 | Med |

---

## 4. Findings register

Severity: **Critical** = active exposure or trivially exploitable with high impact ·
**High** = exploitable or materially weakens a key control · **Medium** = meaningful
risk needing a fix · **Low** = hygiene/defence-in-depth.

---

### AUR-SEC-001 — Customer PII database committed and pushed to a remote
**Severity:** Critical · **OWASP:** A02:2021 Cryptographic Failures / A01 Broken Access Control · **API:** API3:2023 · **CWE:** CWE-359, CWE-212
**Files:** `backend/aurelia.db` (blob `f9fdbfb5d6729fff6795574156a3429ac4a8fd49`), introduced `a4eb6f8`, deleted from tip in `9ae4d16`

**Reproduction:**
```bash
git show a4eb6f8:backend/aurelia.db > /tmp/leak.db
sqlite3 /tmp/leak.db "SELECT name,email,phone FROM quote_requests;"
```

**Detail:** 11 `quote_requests` rows. Row-level triage: 5 Swagger `"string"` records, 2
keyboard-mash test rows, and 4 sharing one email address and one UK mobile.
`contact_messages` was empty. Upper bound **one data subject**, with a submission
pattern indicating developer self-testing. Pushed to `origin` at 22:21:33 IST; deletion
pushed at 23:21:06 IST — **~60 minutes as tip state, permanently in history since.**

Deleting a file in a later commit does not remove the blob. The remote returns HTTP 404
unauthenticated, consistent with private-or-deleted, **not** public.

**Recommendation:** Execute `PII_INCIDENT.md` §6.2 — preserve evidence, delete the
`backup-pre-cleanup` branch (it pins `a4eb6f8`), `git filter-repo`, force-push, then
**purge GitHub's unreachable objects** (support request, or delete and recreate the
repo — the latter is the only certain method). Operator action; not performable by this
review.

---

### AUR-SEC-002 — Supplier identity and full FOB cost basis served in the public JS bundle
**Severity:** High (commercial, not technical) · **OWASP:** A01:2021 · **CWE:** CWE-200
**Files:** [frontend/src/data.js:1](frontend/src/data.js#L1), [frontend/src/pages/EthnicFood.jsx:141](frontend/src/pages/EthnicFood.jsx#L141), [frontend/src/pages/EthnicFood.jsx:190](frontend/src/pages/EthnicFood.jsx#L190)

**Detail:** The bundle ships a complete per-SKU FOB price list — 60+ items with USD unit
prices and pack sizes — and names the supplier explicitly:

> `data.js:1` — `// ─── Ethnic Food — Unifarex dry goods price sheet ───`
> `EthnicFood.jsx:141` — *"FOB pricing from **Unifarex** — Aurelia's **primary Kerala supplier**."*
> `EthnicFood.jsx:190` — *"All prices FOB — Kochi, India."*

**Reproduction:** `curl https://<site>/assets/index-*.js | grep -i unifarex` — no auth required.

**Impact:** A competitor learns (a) who Aurelia's primary supplier is, (b) Aurelia's
landed cost basis on every SKU, and therefore (c) Aurelia's margin on any quote. They
can approach Unifarex directly or undercut on price. **This is the single most
commercially damaging finding in the audit** and it is not a bug — it is a deliberate
product decision that appears not to have been risk-assessed.

**Recommendation:** Requires a client decision — see §6 Q3. Options, in order of preference:
1. Replace public prices with "Request a quote"; serve real pricing from an
   authenticated buyer portal.
2. Publish indicative *band* pricing (e.g. "$1–3/kg") without the supplier name.
3. Accept the risk with written sign-off, recorded here.

**Do not change without approval** — the brief forbids altering business content
unilaterally, and this is revenue-facing copy.

---

### AUR-SEC-003 — No security headers on any response
**Severity:** High · **OWASP:** A05:2021 Security Misconfiguration · **CWE:** CWE-693, CWE-1021
**Files:** [backend/app/main.py:58-65](backend/app/main.py#L58-L65) — only `CORSMiddleware` is registered

**Missing:** `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, `X-Frame-Options` / `frame-ancestors`.

**Reproduction:** `curl -sI http://localhost:8000/health` — none present.

**Impact:** Clickjacking of the enquiry forms; MIME sniffing; referrer leakage;
downgrade to HTTP. Blocks a Mozilla Observatory grade A.

**Recommendation:** Add a middleware setting all five on every response, plus the same
at the edge (`DEPLOYMENT.md`). Phase 2 §9.

---

### AUR-SEC-004 — Rate limiting is in-process and proxy-blind
**Severity:** High · **OWASP:** A04:2021 · **API:** API4:2023 Unrestricted Resource Consumption · **CWE:** CWE-770
**Files:** [backend/app/limiter.py:8](backend/app/limiter.py#L8), [backend/app/routes_quotes.py:25](backend/app/routes_quotes.py#L25), [backend/app/routes_contact.py:23](backend/app/routes_contact.py#L23)

**Two independent defects:**
1. `Limiter(key_func=get_remote_address)` with **no `storage_uri`** → counters live in
   process memory. Under `uvicorn --workers 4` the effective limit is **4× the intended
   rate**, and every restart resets all counters.
2. `get_remote_address` reads the socket peer. Behind a reverse proxy that is the
   **proxy's** IP, so all visitors share one bucket — the limiter becomes a global
   throttle that a single abuser can exhaust for everyone (a DoS amplifier, not a
   control).

**Also:** admin endpoints have **no** rate limit at all.

**Recommendation:** Redis storage backend; trust `X-Forwarded-For` only from known
proxy IPs; separate buckets (5/min public, 30/min admin, 60/min baseline); emit
`Retry-After`. Phase 2 §3.

---

### AUR-SEC-005 — Alembic initial revision is a no-op; schema created by `create_all()`
**Severity:** High · **OWASP:** A05:2021 · **CWE:** CWE-665
**Files:** [backend/alembic/versions/d1078c1aa88a_initial.py:22-30](backend/alembic/versions/d1078c1aa88a_initial.py#L22-L30) — both `upgrade()` and `downgrade()` are `pass`; [backend/app/database.py:39-40](backend/app/database.py#L39-L40) — `Base.metadata.create_all(bind=engine)`

**Impact:** The migration chain does not describe the schema. A fresh production deploy
running `alembic upgrade head` produces an **empty database**, then `create_all()`
silently conjures tables that no migration records. `create_all()` never alters existing
tables, so any future model change silently diverges from the live schema — the failure
surfaces as a runtime `OperationalError` on a column that does not exist. This will
break the PostgreSQL migration.

**Recommendation:** Write the real `upgrade()`/`downgrade()` for both tables, remove the
`init_db()` call, and assert at startup that the DB revision matches head. Phase 2 §8.

---

### AUR-SEC-006 — Secrets have insecure defaults and no fail-loud validation
**Severity:** High · **OWASP:** A05:2021 / A07:2021 · **CWE:** CWE-1188, CWE-540
**Files:** [backend/app/config.py](backend/app/config.py) — `smtp_user: str = ""`, `smtp_password: str = ""`, `api_key: str = ""`, `notification_email: str = "ashnacp0225@gmail.com"`

**Three defects:**
1. Secrets are plain `str`, not `SecretStr` → they render in any `repr(settings)`,
   debugger frame, or exception context.
2. Empty defaults mean a misconfigured production deploy **boots successfully**. An
   empty `API_KEY` makes `require_api_key` return 503 rather than failing at startup;
   empty SMTP credentials make notifications silently no-op
   ([email_service.py:18-20](backend/app/email_service.py#L18-L20)).
3. A **real personal Gmail address is hardcoded** as the notification default. If
   `NOTIFICATION_EMAIL` is unset in production, customer enquiries route to a personal
   inbox. This is committed, in `HEAD`, and pushed.

**Recommendation:** `SecretStr`, no defaults for any secret, startup validation
(including `API_KEY` ≥ 32 bytes), remove the hardcoded address. Phase 2 §1.

---

### AUR-SEC-007 — API key compared in non-constant time
**Severity:** High · **OWASP:** A02:2021 · **CWE:** CWE-208
**Files:** [backend/app/auth.py:20](backend/app/auth.py#L20) — `if not key or key != settings.api_key:`

Python's `!=` on `str` short-circuits at the first differing byte. Remotely exploiting
this over a network is difficult but it is a textbook ASVS L2 violation (V2.10) and the
fix is one line.

**Recommendation:** `secrets.compare_digest(key, settings.api_key)`. Phase 2 §2.

---

### AUR-SEC-008 — Single static admin key, no audit trail, no revocation
**Severity:** High · **OWASP:** A01:2021 / A09:2021 · **API:** API1/API5:2023 · **CWE:** CWE-778
**Files:** [backend/app/auth.py](backend/app/auth.py), [backend/app/routes_quotes.py:71](backend/app/routes_quotes.py#L71), [backend/app/routes_contact.py:58](backend/app/routes_contact.py#L58)

One never-expiring key guards **every customer record**. `GET /api/quotes/?limit=100`
returns full PII in bulk. **No record is kept of any admin call** — if the key leaks,
there is no way to determine whether PII was accessed, which directly undermines the
GDPR Art. 33 breach-assessment capability.

**Recommendation:** Append-only audit log (timestamp, IP, path, result) on every admin
call; admin rate limit; document short-lived signed tokens as follow-up. Phase 2 §2.

---

### AUR-SEC-009 — `products` list is unbounded
**Severity:** Medium · **OWASP:** A04:2021 · **API:** API4:2023 · **CWE:** CWE-770
**Files:** [backend/app/schemas.py:16](backend/app/schemas.py#L16) — `products: list[str] = Field(..., min_length=1)`

`min_length=1` with **no `max_length`, and no length cap on the individual strings**.
A single request may carry an arbitrarily large array, stored verbatim into a JSON
column and interpolated into the notification email.

**Reproduction:** `POST /api/quotes/` with `{"products": ["x"*10000] * 10000, …}` —
accepted by the schema.

**Recommendation:** `Field(..., min_length=1, max_length=50)` with
`constr(max_length=120)` items; add a global request-body size limit at the edge.

---

### AUR-SEC-010 — SQLite holds production PII: no encryption at rest, single-writer, no backup
**Severity:** Medium · **OWASP:** A05:2021 · **CWE:** CWE-311
**Files:** [backend/app/config.py](backend/app/config.py) `database_url: str = "sqlite:///./aurelia.db"`, [backend/app/database.py:14-24](backend/app/database.py#L14-L24)

Unencrypted file on the application host, `check_same_thread=False`, single-writer
locking under concurrent submissions, and no backup or restore procedure. GDPR Art. 32
expects encryption of personal data "as appropriate".

**Recommendation:** PostgreSQL for production with encryption at rest; documented backup
cadence and a restore drill. Phase 2 §8 / Phase 4.

---

### AUR-SEC-011 — Customer PII written to application logs
**Severity:** Medium · **OWASP:** A09:2021 · **CWE:** CWE-532
**Files:** [backend/app/database.py:22](backend/app/database.py#L22) `echo=settings.debug`; [backend/app/email_service.py:43](backend/app/email_service.py#L43) `logger.info(f"Email sent to {to}: {subject}")`

The subject line embeds the customer's name
([email_service.py:94](backend/app/email_service.py#L94)), so **every successful
notification writes a customer name to the log at INFO level** — in production, not just
debug. With `DEBUG=true`, SQLAlchemy additionally echoes every bound parameter: names,
emails, phone numbers.

Phase 0 made `DEBUG=true` impossible in production, which closes the `echo` half. The
`logger.info` half is live at all times.

**Recommendation:** `echo=False` unconditionally in production; remove PII from log
messages; add a redacting formatter that masks email and phone patterns defensively.

---

### AUR-SEC-012 — Notification failures are silent and unrecoverable
**Severity:** Medium · **OWASP:** A09:2021 · **CWE:** CWE-390
**Files:** [backend/app/email_service.py:46-48](backend/app/email_service.py#L46-L48)

`except Exception as e: logger.error(...); return False` — every failure mode (SMTP
down, credentials rotated, quota exceeded) is swallowed identically. No retry, no
dead-letter store, no alert. The customer sees "We'll be in touch within 24 hours"
while the operator never learns the enquiry exists.

The record does persist in the database, so this is a **business-continuity** issue
rather than data loss — but nothing surfaces it.

**Recommendation:** Persist failures to a durable store, alert on them, add bounded
retry. Phase 2 §5.

---

### AUR-SEC-013 — No global exception handler or correlation ID
**Severity:** Medium · **OWASP:** A09:2021 / A05:2021 · **CWE:** CWE-209
**Files:** [backend/app/main.py](backend/app/main.py) — only `RateLimitExceeded` is handled

FastAPI's default 500 body does not leak a traceback, so this is **not** currently a
disclosure vulnerability. It is an operability gap: unhandled errors produce no
correlation ID, so a customer report cannot be tied to a server-side log entry.

**Recommendation:** Global handler returning `{"detail": "...", "correlation_id": …}`
with full detail logged server-side only. Phase 2 §9.

---

### AUR-SEC-014 — CORS allows credentials with wildcard methods and headers
**Severity:** Medium · **OWASP:** A05:2021 · **CWE:** CWE-942
**Files:** [backend/app/main.py:59-65](backend/app/main.py#L59-L65)

```python
allow_origins=settings.cors_origins,   # ✅ allow-list, not "*"
allow_credentials=True,                # ⚠ with…
allow_methods=["*"],                   # ⚠ …wildcards
allow_headers=["*"],
```

The origin allow-list is correct — the real defect is that `allow_credentials=True` is
enabled for an API that **uses no cookies or session credentials**. It grants nothing
and widens the surface. Defaults are also dev origins (`localhost:5173`), which must not
reach production.

**Recommendation:** `allow_credentials=False`; explicit `allow_methods=["GET","POST","PATCH"]`;
explicit `allow_headers=["Content-Type","X-API-Key"]`; environment-specific origin lists. Phase 2 §10.

---

### AUR-SEC-015 — Google Fonts hotlinked (GDPR-relevant)
**Severity:** Medium · **OWASP:** A06:2021 / A08:2021 · **CWE:** CWE-829
**Files:** [frontend/index.html:11-13](frontend/index.html#L11-L13)

Every visitor's IP address and User-Agent are transmitted to Google before any consent
interaction. A German court (LG München I, 3 O 17493/20, 2022) held that hotlinking
Google Fonts without consent violates GDPR. No SRI on the stylesheet link.

**Recommendation:** Self-host the two font families (`@fontsource` or download to
`public/`). Removes the third-party transfer, the CSP exception, and a render-blocking
dependency at once.

---

### AUR-SEC-016 — Unsplash images hotlinked
**Severity:** Medium · **OWASP:** A08:2021 · **CWE:** CWE-829
**Files:** 4 distinct photo IDs across 3 size variants in `frontend/src/`

No integrity control, no availability guarantee, no licence record retained, and
visitor IPs disclosed to a third party. If Unsplash rate-limits or removes an image the
page renders broken.

**Recommendation:** Download at build time, verify licence, commit to `public/`, and
narrow the CSP `img-src` to `'self' data:`.

---

### AUR-SEC-017 — No Content Security Policy
**Severity:** Medium · **OWASP:** A05:2021 · **CWE:** CWE-1021
**Files:** [frontend/index.html](frontend/index.html) — no CSP meta tag; no edge config exists

No `default-src`, `script-src`, `frame-ancestors`, `base-uri` or `form-action`. Any XSS
(none found today — React escapes by default and there is no `dangerouslySetInnerHTML`)
would be unconstrained, and the site can be framed for clickjacking.

**Recommendation:** Serve the Phase 3 §4 policy from the edge. Note `style-src` needs
`'unsafe-inline'` until the pervasive inline styles are extracted — document as
follow-up; it is the one unavoidable weakness in the initial policy.

---

### AUR-SEC-018 — No dependency or secret scanning
**Severity:** Medium · **OWASP:** A06:2021 · **CWE:** CWE-1104
**Files:** no `.github/workflows/`, no `pip-audit`, no `bandit`, no `gitleaks`, no lockfile for Python

`backend/app/requirements.txt` pins direct dependencies but has no hash-locked
transitive closure. Nothing prevents a repeat of AUR-SEC-001.

**Recommendation:** `.github/workflows/security.yml` running `pip-audit`, `bandit -r backend`,
`npm audit --omit=dev`, `gitleaks`; `pip-compile` lockfile; pre-commit `gitleaks` hook. Phase 2 §11.

---

### AUR-SEC-019 — No bot mitigation on public forms
**Severity:** Medium · **OWASP:** A04:2021 · **API:** API4:2023 · **CWE:** CWE-799
**Files:** [backend/app/routes_quotes.py:24](backend/app/routes_quotes.py#L24), [backend/app/routes_contact.py:22](backend/app/routes_contact.py#L22)

Rate limiting is the only control, and AUR-SEC-004 shows it is weak. Each accepted
submission triggers an outbound email — a spam amplifier against Aurelia's own SMTP
quota and sender reputation.

**Recommendation:** Honeypot field + minimum fill time (bot mitigation with no UX cost),
then Turnstile/hCaptcha behind an env flag if needed. Phase 2 §6.

---

### AUR-SEC-020 — Non-focusable `<div onClick>` used for navigation
**Severity:** Medium · **OWASP:** A05:2021 · **CWE:** CWE-1021
**Files:** [frontend/src/components/Footer.jsx:93](frontend/src/components/Footer.jsx#L93)

Footer links are `<div onClick={link.action}>` — not keyboard focusable, not announced
as links, no `role`, no `tabIndex`. Beyond the accessibility failure (WCAG 2.1 SC 2.1.1),
elements that look interactive but carry no semantic identity are the substrate for
UI-redress attacks: with no CSP `frame-ancestors` (AUR-SEC-017) an attacker can frame
the page and overlay these targets.

*(The two `onClick` handlers at [Footer.jsx:6-7](frontend/src/components/Footer.jsx#L6-L7)
are a modal backdrop and its stop-propagation guard — correct usage, not a finding.)*

**Recommendation:** Real `<button>` / `<a>` elements with the current styling preserved. Phase 3 §9.

---

### AUR-SEC-021 — `theme.js` is dead code while 65 literals are hardcoded
**Severity:** Low · **CWE:** CWE-1041
**Files:** [frontend/src/theme.js](frontend/src/theme.js) — **imported by nothing**; 65 occurrences of `#C8963E` across `src/`

The file's own docstring claims it is "the single source of truth for the brand palette."
It is not. A designer changing `theme.js` would see no effect — a correctness trap.

**Recommendation:** Adopt it or delete it. Per the brief, do not leave it decorative.
Requires a decision — §6 Q7.

---

### AUR-SEC-022 — Playwright declared but no tests exist
**Severity:** Low · **CWE:** CWE-1104
**Files:** [frontend/package.json:26](frontend/package.json#L26)

`playwright@^1.60.0` in `devDependencies`, no test directory, no test script. Dependency
surface with no benefit.

**Recommendation:** Add the Phase 5 happy-path e2e tests, or remove it.

---

### AUR-SEC-023 — Validation bounds inconsistent between client, server and DB
**Severity:** Low · **CWE:** CWE-20

| Field | Client | Pydantic | Column |
|---|---|---|---|
| quote `message` | ≥10 | ≤2000 | `Text` |
| contact `message` | ≥10 | 10–5000 | `Text` |
| `internal_notes` | — | **unbounded** | `Text` |
| `name` | ≥2 | 2–150 | `String(150)` ✅ |

Quote messages cap at 2000 while contact caps at 5000, with no stated reason; the brief
specifies ≤4000. `internal_notes` ([schemas.py:42](backend/app/schemas.py#L42)) has no
limit at all.

**Recommendation:** Harmonise to ≤4000, bound `internal_notes`, add `strip_whitespace`
and control-character rejection. Phase 2 §6.

---

### AUR-SEC-024 — No E.164 phone normalisation
**Severity:** Low · **CWE:** CWE-20
**Files:** [backend/app/schemas.py:15](backend/app/schemas.py#L15) — `phone: str | None = Field(None, max_length=50)`

Any 50-character string is accepted. The committed data shows the consequence:
`'798729834'`, `'93849873u94'`, `'32'`, `'string'` — a free-text field that is not
usable for its purpose.

**Recommendation:** `phonenumbers`, normalise to E.164, reject unparseable input. Phase 2 §6.

---

### AUR-SEC-025 — No retention policy, no DSAR capability
**Severity:** Low (technical) / **High (compliance)** · **GDPR:** Art. 5(1)(e), 15, 17

PII is retained indefinitely with no deletion mechanism and no way to service a
subject-access or erasure request other than manual SQL.

**Recommendation:** Configurable retention (default 12 months) with a scheduled hard
delete; admin-authed `/admin/dsar/export?email=` and `/admin/dsar/delete?email=`. Phase 2 §12.

---

### AUR-SEC-026 — No submission provenance recorded
**Severity:** Low · **OWASP:** A09:2021 · **CWE:** CWE-778

Neither model records source IP, User-Agent, or submission-time metadata, so abuse
cannot be investigated and a disputed submission cannot be attributed.

**Recommendation:** Record a **truncated/hashed** IP and a UA hash — note this is itself
personal data under GDPR, so it must be covered by the retention policy and the privacy
notice. Do not log full IPs indefinitely.

---

### AUR-SEC-027 — No SPF / DKIM / DMARC on the sending domain
**Severity:** Medium · **OWASP:** A05:2021 · **CWE:** CWE-290

Mail is sent via a personal Gmail account. Without SPF/DKIM/DMARC on
`aurelialogistics.co.uk`, anyone can spoof mail as Aurelia to customers, and Aurelia's
own notifications are likely to be filtered as spam.

**Recommendation:** Document required DNS records in `DEPLOYMENT.md`. **Do not modify DNS.**
Depends on §6 Q4 (migration off personal Gmail).

---

## 5. Compliance gap register (GDPR)

| ID | Article | Obligation | Current state | Gap |
|---|---|---|---|---|
| GDPR-01 | Art. 6 | Lawful basis for processing enquiries | Not documented | Legitimate interest is likely available but **is not recorded**. Needs an LIA. |
| GDPR-02 | Art. 13 | Privacy notice at collection | **No privacy notice exists.** Footer has Terms only | **Critical gap.** Forms collect name/email/phone with no notice, no purpose, no retention statement, no rights information. |
| GDPR-03 | Art. 5(1)(e) | Storage limitation | Indefinite retention | AUR-SEC-025 |
| GDPR-04 | Art. 28 | Processor agreements | None with Google (SMTP + Fonts), Unsplash, GitHub | Google processes enquiry contents and visitor IPs with no DPA. |
| GDPR-05 | Art. 15/17 | DSAR + erasure | No process, no endpoint | AUR-SEC-025 |
| GDPR-06 | Art. 32 | Security of processing | Partial | No encryption at rest (AUR-SEC-010); no access audit (AUR-SEC-008) |
| GDPR-07 | Art. 33/34 | Breach notification | Record now exists | `PII_INCIDENT.md`; **two operator answers outstanding** |
| GDPR-08 | Art. 30 | Record of processing activities | None | Required if the entity is UK/EU-established — see §6 Q2 |
| GDPR-09 | Art. 25 | Data protection by design | Weak | PII committed to git; Swagger writing to the production datastore |
| GDPR-10 | Art. 44 | International transfers | Undetermined | HQ stated as Kochi, India; data may transit/rest outside the UK/EEA. Needs a transfer assessment. |

**Note on jurisdiction:** [Footer.jsx:65](frontend/src/components/Footer.jsx#L65) states
*"Governing law: England and Wales"* and [Footer.jsx:64](frontend/src/components/Footer.jsx#L64)
refers to *"Aurelia Logistics Ltd"*, while [Home.jsx](frontend/src/pages/Home.jsx) gives
headquarters as *"Kochi, Kerala, India"* with *"Offices in Mumbai, Dubai & London"*.
**This audit does not assume any of these are accurate** — they are website copy, not
evidence of incorporation. See §6 Q2.

---

## 6. Open questions for the client

**No work proceeds on these without an answer.**

1. **Was `github.com/ashna0204/aurelia` public at any point on 2026-07-26 between 22:21 and 23:21 IST?**
   Unauthenticated probes now return 404 (private or deleted). *If it was ever public,
   `PII_INCIDENT.md` converts to a notifiable breach with an ICO deadline of
   **2026-07-29 23:21 IST**.*

2. **Is Aurelia Logistics an actual UK-registered entity — company number, ICO registration, DPO appointed?**
   Determines the supervisory authority, whether an Art. 30 record and ICO fee are
   required, and whether the Art. 44 transfer question (India HQ) is live. The site
   asserts "Ltd" and English governing law; this audit treats that as unverified copy.

3. **Should FOB USD pricing and the supplier name continue to render publicly?** (AUR-SEC-002)
   **Recommendation: no.** Gate behind an authenticated buyer portal, or publish
   indicative bands without naming Unifarex. This is the highest-value commercial
   finding and needs an explicit decision — the brief forbids changing business content
   without approval.

4. **Should production mail move off the personal Gmail app password?**
   **Recommendation: yes** — a personal app password cannot be scoped or audited, dies
   with the individual's account, and puts business deliverability on consumer
   reputation. Moving also enables SPF/DKIM/DMARC (AUR-SEC-027).

5. **Retention window for enquiry records?** Recommendation: 12 months from last contact,
   configurable. Needs confirmation against any commercial record-keeping requirement.

6. **Production hosting target** — bare VM, container platform, or PaaS? Determines the
   reverse-proxy, secrets-injection and CSP-delivery guidance in `DEPLOYMENT.md`, and
   whether the CIS Docker Benchmark applies.

7. **`theme.js`: adopt or delete?** (AUR-SEC-021) Adopting means touching 65 style
   literals — a large diff across visual code, needing design sign-off given the "do not
   change the visual language" constraint. **Recommendation: delete it**, and reintroduce
   design tokens as part of a planned styling refactor rather than a security pass.

8. **Is a responsible-disclosure policy in scope?** If yes, add `SECURITY.md` with a
   contact address.

---

## 7. Claims tested and found not to apply

Recorded so they are not re-opened. Each was verified, not assumed.

### 7.1 Email header injection — **not exploitable**

The brief requires rejecting `\r`/`\n` in header-mapped fields. `name` flows into the
`Subject` header ([email_service.py:94](backend/app/email_service.py#L94)) and
`html.escape()` does **not** strip CRLF, so the concern is well-founded — but Python's
`email` library blocks it:

| Input | Result |
|---|---|
| `"New Quote Bob\r\nBcc: attacker@evil.com"` | `HeaderParseError: header value appears to contain an embedded header` |
| `"New Quote Bob\nBcc: attacker@evil.com"` | `HeaderParseError` |
| Real template (contains an em dash) | RFC 2047 base64-encoded; `Bcc:` folded harmlessly into the subject — **no header injected** |

The real template always contains `—`, forcing RFC 2047 encoding, so injection is
structurally impossible. **No fix required.** Explicit CRLF rejection is still worth
adding as defence-in-depth if the subject template ever becomes pure ASCII — tracked as
a hardening nicety, not a vulnerability.

### 7.2 Already fixed in commit `9ae4d16` (before this audit)

| Brief claim | Actual state |
|---|---|
| Blocking sync DB calls in `async def` handlers | **Fixed** — both handlers are `def`; FastAPI threadpools them ([routes_quotes.py:21-26](backend/app/routes_quotes.py#L21-L26)) |
| `asyncio.create_task(notify_new_quote(quote))` — detached ORM access | **Fixed** — uses `BackgroundTasks` with a plain-dict snapshot ([routes_quotes.py:50-63](backend/app/routes_quotes.py#L50-L63)) |
| `/docs`, `/redoc` unconditionally public | **Fixed** — all three gated behind `DEBUG` ([main.py:49-51](backend/app/main.py#L49-L51)) |
| Dead products CRUD API | **Removed** — no `routes_products.py`; not registered |
| Weak email validation `includes("@") && includes(".")` | **Fixed** — proper regex ([validation.js:12](frontend/src/utils/validation.js#L12)) |
| Missing `<form>` semantics | **Fixed** — both forms are real `<form onSubmit>` with submit buttons |
| Missing catch-all route / 404 page | **Fixed** — [App.jsx:31](frontend/src/App.jsx#L31) + `NotFound.jsx` |
| Broken `/vite.svg` favicon reference | **Fixed** — `/favicon.svg`, file present |
| Stale committed `frontend/dist/` | **Not tracked** |
| Empty root `package-lock.json` stub | **Does not exist** |
| Unused `subject` field in contact state | **Removed** from state and payload |
| HTML built by f-string concatenation of user input | **Mitigated** — every interpolated value passes through `html.escape()`. Jinja2 with `autoescape` remains preferable for maintainability, but this is not a live XSS. |

### 7.3 Never true

| Brief claim | Evidence |
|---|---|
| `backend/.env` tracked in HEAD | Absent from **every** commit tree across all refs |
| "Two distinct sets of live SMTP credentials" | One set, working tree only. Full sweep of 3,652 history blobs for the live password, `API_KEY` and `SMTP_USER`: **zero hits** |
| "Real EU/UK customers whose PII was committed" | 11 rows → 5 Swagger junk, 2 keyboard-mash, 4 sharing one email + one phone. **Upper bound: one data subject**, pattern indicates developer self-testing. `contact_messages` empty |
| SQL injection risk | ORM parameterised throughout; no raw SQL anywhere |

### 7.4 Confirmed true

The brief's claim that **Swagger UI polluted production data** is correct and evidenced:
rows 5–9 of the committed database are five identical `"string"` records timestamped
across a 33-minute window on 2026-03-23 — the signature of Swagger's "Try it out"
against a live datastore. This is the strongest argument for AUR-SEC-006's fail-loud
posture and justifies the `/docs` gating already in place.

---

## 8. Findings summary

| Severity | Count | IDs |
|---|---|---|
| **Critical** | 1 | 001 |
| **High** | 7 | 002, 003, 004, 005, 006, 007, 008 |
| **Medium** | 12 | 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 027 |
| **Low** | 7 | 020*, 021, 022, 023, 024, 025†, 026 |

\* 020 is Medium-rated in the register (clickjacking substrate); listed here by its
primary a11y classification.
† 025 is Low technically but **High** as a compliance gap.

**Highest-priority actions:**
1. **AUR-SEC-001** — execute the history rewrite and purge GitHub's unreachable objects *(operator)*
2. **AUR-SEC-002** — decide on the public price sheet *(client)*
3. **GDPR-02** — publish a privacy notice; the forms currently collect PII with none
4. **AUR-SEC-004 / 003** — real rate limiting and security headers before any public deploy

---

## 9. Manual verification checklist

To be completed and signed at the end of Phase 5. **Not yet performed** — recorded here
so it is not mistaken for a passing result.

| Check | Status |
|---|---|
| No secrets in repo (`gitleaks --no-git` clean) | ☐ |
| `.env.example` present, `.env` untracked | ☑ verified 2026-07-26 |
| No PII in repo working tree | ☑ tip clean · ☐ **history rewrite outstanding** |
| `DEBUG=false` enforced in production | ☑ startup guard verified, 4 cases |
| `/docs` behind flag | ☑ verified |
| All security headers present on a sample response | ☐ |
| CSP scores no High severity at csp-evaluator.withgoogle.com | ☐ |
| Mozilla Observatory ≥ A | ☐ |
| securityheaders.com ≥ A | ☐ |
| Both forms submit via Enter key; focus order correct; SR labels present | ☐ partial — forms are real `<form>`; labels/`aria-describedby` outstanding |
| Rate limit persists across worker restarts | ☐ **currently fails** — AUR-SEC-004 |
| Admin audit log records every admin call | ☐ **not implemented** — AUR-SEC-008 |
| `pip-audit` / `bandit` / `npm audit` / `gitleaks` green in CI | ☐ |
| `pytest` backend route coverage ≥ 70% | ☐ no test suite exists |
