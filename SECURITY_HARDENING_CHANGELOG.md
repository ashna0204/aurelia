# Security Hardening Changelog

Reverse-chronological. Newest phase at the top.

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
