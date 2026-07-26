# Security Hardening Changelog

Reverse-chronological. Newest phase at the top.

---

## Phase 2 — Backend Hardening — 2026-07-27

- **Commits:**
  - `2feeda3` — `docs(security): add Phase 1 threat model and findings register — CWE-1053`
  - `ab82042` — `docs(security): correct Phase 1 commit SHA in changelog`
  - `26bdb61` — `security(backend): fail-loud secret loading and constant-time key compare — CWE-1188, CWE-208, CWE-540`
  - `91fea6d` — `security(backend): add security headers, error handler, tighten CORS — CWE-693, CWE-209, CWE-942`
  - `1767fc7` — `security(backend): write real migrations, drop create_all, gate startup on schema — CWE-665`
  - `89a98c4` — `security(backend): bound all input fields and reject control characters — CWE-770, CWE-20`
  - `d47562f` — `security(backend): fix rate-limit bypass, add admin buckets and Retry-After — CWE-770, CWE-348`
  - `cdf298e` — `security(backend): append-only audit log for admin access — CWE-778`
  - `15d9c03` — `security(backend): stop logging customer PII, add redacting log filter — CWE-532`

- **Findings closed:** AUR-SEC-003, 004, 005, 006, 007, 009, 011, 013, 014, 023, 024,
  and the audit half of 008.

| ID | Fix |
|---|---|
| 003 | Six security headers on every response, including 404s, 429s, 500s and CORS preflights |
| 004 | Shared rate-limit storage (refused in-memory outside local), trusted-proxy-aware client IP, separate 30/min admin bucket, `Retry-After` on 429 |
| 005 | Real Alembic `upgrade()`/`downgrade()`; `create_all()` removed; startup asserts the DB is at head |
| 006 | `SecretStr`, no secret defaults, `API_KEY` entropy floor, hardcoded personal email removed |
| 007 | `secrets.compare_digest` replaces `!=` |
| 008 | Append-only admin audit log (timestamp, IP, path, outcome, key fingerprint) |
| 009 | `products` capped at 50 items x 120 chars |
| 011 | Customer name no longer logged; redacting log filter added |
| 013 | Global exception handler with correlation ID |
| 014 | `allow_credentials=False`, enumerated methods/headers |
| 023 | Message caps harmonised to 4000; control characters rejected |
| 024 | `internal_notes` bounded |

- **Findings deferred:**
  - `AUR-SEC-010` (SQLite → PostgreSQL) — needs the hosting answer, §6 Q6.
  - `AUR-SEC-012` (silent notification failure) — needs a durable failure store; pairs with the Postgres move.
  - `AUR-SEC-019` (bot mitigation) — honeypot/min-fill-time touches the frontend forms; Phase 3.
  - `AUR-SEC-025` (retention + DSAR) — retention window is §6 Q5.
  - `AUR-SEC-027` (SPF/DKIM/DMARC) — DNS, documented in Phase 4, not touched.
  - `AUR-SEC-018` (dependency scanning CI) — next up.
  - Short-lived signed admin tokens — documented as follow-up, not required now.

- **Bug found and fixed during the work:** enabling slowapi's `headers_enabled`
  to obtain `Retry-After` broke **every** endpoint with a 500 — that mode injects
  headers into the handler's return value, which raises for any handler returning a
  Pydantic model. Caught by live testing, not by inspection. Replaced with a custom
  429 handler that computes `Retry-After` without constraining handler signatures.

- **Open questions for client:** unchanged from Phase 1 — `SECURITY_AUDIT.md` §6.
  Q5 (retention window) and Q6 (hosting target) now block the remaining Phase 2 items.

---

## Phase 1 — Threat Model + Audit Report — 2026-07-26

- **Commits:** `2feeda3` — `docs(security): add Phase 1 threat model and findings register`

- **Deliverable:** `SECURITY_AUDIT.md` — system overview and data-flow diagram, asset
  register, STRIDE tables for all six trust boundaries, 27 findings, GDPR compliance gap
  register, and the Phase 5 verification checklist.

- **Findings raised:** AUR-SEC-001 … AUR-SEC-027
  (1 Critical, 7 High, 12 Medium, 7 Low)

- **Findings deferred to a client decision:**
  - `AUR-SEC-002` — public FOB price sheet + supplier name. Highest-value commercial
    finding; the brief forbids changing business content without approval.
  - `AUR-SEC-021` — `theme.js` adopt-or-delete; touching 65 style literals needs design
    sign-off against the "do not change the visual language" constraint.

- **Notable results:**
  - **Email header injection is NOT exploitable** — tested three payload shapes. Python's
    `email` library raises `HeaderParseError` on ASCII CRLF and RFC 2047-encodes
    non-ASCII; the real subject template always contains an em dash, so it always
    encodes. Reported as tested-and-cleared rather than as a finding.
  - **Twelve brief-listed issues were already fixed** in `9ae4d16` — sync handlers,
    `BackgroundTasks`, `/docs` gating, products API removal, email regex, `<form>`
    semantics, 404 route, favicon, dead `subject` field, and more. Recorded in
    `SECURITY_AUDIT.md` §7.2 with evidence so they are not re-opened.
  - **No SQL injection** — the ORM is parameterised throughout; no raw SQL anywhere.
  - **The Swagger-pollution claim is confirmed** — rows 5-9 of the committed DB are five
    identical `"string"` records across a 33-minute window.
  - **A privacy notice does not exist** (GDPR-02). Both forms collect name, email and
    phone with no notice, purpose, retention statement or rights information. This is a
    larger compliance exposure than most of the technical findings and was not in the brief.

- **Open questions for client:** eight, in `SECURITY_AUDIT.md` §6. The four that block
  Phase 2/3 work:
  1. Was the GitHub remote ever public? (converts the incident to a notifiable breach)
  2. Is Aurelia Logistics a UK-registered entity with ICO registration?
  3. Should FOB pricing and the supplier name stay public? *(recommend: no)*
  4. Move production mail off the personal Gmail app password? *(recommend: yes)*

---

## Phase 0 — Emergency Response — 2026-07-26

- **Commits:**
  - `f76618f` — `docs(security): add Phase 0 incident records — CWE-540, CWE-359`
  - `0f1ce89` — `security(backend): reject DEBUG=true when ENV=production — CWE-489`
  - *(pre-existing, verified this phase)* `9ae4d16` — removed tracked DB, venv, `__pycache__`; gated `/docs`

- **Findings closed:**
  - Committed SQLite PII store removed from repository tip — *documented, tip-clean; **history rewrite still outstanding, operator action***
  - `.gitignore` coverage verified complete at root and `backend/` — nothing matching the ignore rules remains tracked in `HEAD`
  - `DEBUG=true` in production now impossible — startup-time rejection, not a runtime warning
  - `/docs`, `/redoc`, `/openapi.json` confirmed already gated behind `DEBUG`

- **Findings deferred:**
  - **Git history rewrite** — cannot be performed by the review pass. `git filter-repo`
    recipe, evidence-preservation step, branch-pinning trap, and the GitHub
    unreachable-object purge are specified in `PII_INCIDENT.md` §6.2 for the operator.
  - **Credential rotation** — checklist in `SECRETS_ROTATION.md`; rotation is the
    account owner's action, not the reviewer's.
  - Hardcoded personal email default in `config.py` → Phase 2 §1 (`SecretStr` + fail-loud settings)
  - Non-constant-time API key comparison → Phase 2 §2

### Premise corrections — the brief was wrong on two material points

The brief's Phase 0 was written against assumptions that do not survive verification.
Both corrections *reduce* assessed severity; both are evidenced.

1. **`backend/.env` was never committed.** The brief asserts it is "tracked in HEAD"
   and that "two distinct sets of live SMTP credentials" are in play. Every blob in
   history (3,652 objects, all refs) was searched for the live SMTP password, `API_KEY`
   and `SMTP_USER`: **zero hits**. `.env` appears in no commit tree. There is **one**
   credential set, in the untracked working tree. Rotation remains advisable as
   hygiene, but this is not a credential leak.

2. **No confirmed customer PII breach.** The brief asserts "real EU/UK customers whose
   PII was committed to git." The committed database holds 11 quote rows: 5 are Swagger
   `"string"` junk, 2 are keyboard-mash test entries, and the remaining 4 share **one**
   email address and **one** UK mobile, submitted within 72 minutes with the company
   field degrading `al bidAYA → mowow → buifafa → bbbb`. That is form-testing, not four
   customers. `contact_messages` was **empty**. Upper bound: **one** data subject,
   probably the developer. Unauthenticated probes of the remote return **HTTP 404**,
   consistent with a private or deleted repository — not a public one.

   Recorded as a **security incident under Art. 33(5)**, not a notifiable breach. The
   72-hour clock is documented and ready to start, not started. Two operator answers
   convert it either way — `PII_INCIDENT.md` §7.

- **Open questions for client:**
  1. Was `github.com/ashna0204/aurelia` public at any point between 22:21 and 23:21 IST
     on 2026-07-26? *If yes, this becomes a notifiable breach with an ICO deadline of
     2026-07-29 23:21 IST.*
  2. Is the data subject in rows 1–4 a genuine third party, or the developer? Determines
     whether the §8 courtesy notification is sent at all.
  3. Is Aurelia Logistics a UK- or EU-registered entity, with an ICO registration?
     Determines the supervisory authority and whether an Art. 30 record is required.
  4. Should production mail continue to route through a **personal Gmail app password**?
     Recommendation: no — move to a transactional provider with SPF/DKIM/DMARC on the
     Aurelia sending domain.
