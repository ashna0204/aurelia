# SECRETS ROTATION CHECKLIST

**Status:** OPEN
**Raised:** 2026-07-26
**Owner:** repository operator (human) — Claude did not and must not rotate these
**Scope:** all credentials reachable from the `aurelia` repository or its working tree

---

## 0. Headline finding — corrects the incident brief

The incident brief stated that `backend/.env` is *"tracked in HEAD"* and that there are
*"two distinct sets of live SMTP credentials in play."*

**Both statements are false.** Verified as follows:

| Check | Command | Result |
|---|---|---|
| `.env` in HEAD | `git ls-tree -r HEAD --name-only \| grep '\.env$'` | not present |
| `.env` in *any* commit tree | loop over `git rev-list --all` + `git ls-tree -r` | **not present in any commit** |
| Live SMTP password in any history blob | brute-force `git cat-file blob` over all 3,652 blobs, `grep -F` | **0 hits** |
| Live `API_KEY` in any history blob | same sweep | **0 hits** |
| Live `SMTP_USER` in any history blob | same sweep | **0 hits** |

`backend/.env` has **never been committed**. It exists only in the untracked working
tree and is correctly matched by both `.gitignore` files. There is exactly **one** set
of live SMTP credentials, not two.

### What this changes

These credentials are **not git-exposed**. They have not been published through this
repository. Rotation is therefore **precautionary hygiene, not incident response** —
with one exception, noted in §1.1, where local-workstation exposure is the live concern.

This materially lowers the urgency versus the brief's assumption. It does **not**
lower it to zero: see §3.

---

## 1. Credential inventory

Every secret below lives in `backend/.env` (untracked) and/or is defaulted in tracked
source. Values are redacted here by design — this file is committed.

### 1.1 Gmail SMTP app password — **ROTATE**

| Field | Value |
|---|---|
| Variable | `SMTP_PASSWORD` |
| Location | `backend/.env` (untracked, working tree only) |
| Shape | 16-char Google App Password, stored with spaces stripped (19 chars incl. separators) |
| Account | `SMTP_USER` — a personal `@gmail.com` address (see §1.2) |
| Git-exposed | **No** — confirmed by full-history blob sweep |
| Transport | `smtp.gmail.com:587` |

**Why rotate anyway:**
1. It is a **Google account app password**, which grants full SMTP send rights *as that
   human's personal identity*. Blast radius is the person's whole mail reputation, not
   just this app.
2. It has been sitting in plaintext on a developer workstation for an unknown period
   and was pasted through at least one AI-assisted tooling session.
3. `backend/.env.example` documents `SMTP_HOST=smtp.office365.com` while the live
   `.env` uses `smtp.gmail.com`. The divergence suggests the credential was
   hand-carried between environments — provenance is not clean.

**Rotation action — performed by the account owner:**
1. Google Account → Security → 2-Step Verification → App passwords.
2. **Revoke** the existing app password for this application.
3. Generate a new one; store it in the deployment secret store (see `DEPLOYMENT.md`),
   **not** in a committed file.
4. Review Google Account → Security → *Recent security activity* and *Your devices*
   for unrecognised SMTP sessions.
5. Confirm here: `[ ] rotated  by ______  on ________`

> **Recommendation (needs client decision — see `SECURITY_AUDIT.md` § Open Questions):**
> Stop sending production mail through a personal Gmail account entirely. A personal
> app password is not an appropriate production credential: it cannot be scoped,
> cannot be audited per-application, dies with the individual's account, and puts
> business mail deliverability on a consumer reputation. Move to a transactional
> provider (Postmark / SES / Resend) or a domain mailbox with SPF, DKIM and DMARC
> configured on the `aurelia` sending domain.

### 1.2 SMTP sending identity — **REVIEW**

| Field | Value |
|---|---|
| Variables | `SMTP_USER`, `NOTIFICATION_EMAIL` |
| Value | a personal `@gmail.com` address |
| Git-exposed | **No** for the `.env` value |

### 1.3 Hardcoded notification address in tracked source — **REMOVE**

| Field | Value |
|---|---|
| Location | [backend/app/config.py:24](backend/app/config.py#L24) |
| Content | `notification_email: str = "ashnacp0225@gmail.com"` |
| Git-exposed | **Yes** — committed, in HEAD, pushed to `origin` |

This is a real personal email address baked in as a default in tracked source. It is
not a credential, so it needs no rotation, but it *is* committed personal data and it
is a silent-failure trap: if `NOTIFICATION_EMAIL` is unset in production, quote
notifications route to a personal inbox instead of erroring.

**Action:** remove the default; make it a required setting that fails loudly at
startup. Scheduled for Phase 2 §1. `[ ] done`

### 1.4 Admin `API_KEY` — **ROTATE**

| Field | Value |
|---|---|
| Variable | `API_KEY` |
| Location | `backend/.env` (untracked) |
| Shape | 64 hex chars = **32 bytes of entropy** — meets the ≥32-byte bar |
| Git-exposed | **No** — confirmed by blob sweep |
| Grants | `GET /api/quotes/`, `GET /api/contact/` — i.e. **read access to every stored customer enquiry** |

Entropy is fine. Rotate on the same precautionary grounds as §1.1, and because this
single static key is the *only* control protecting the PII store.

**Rotation action:**
1. Generate: `openssl rand -hex 32`
2. Update the deployment secret store and any operator client (Postman, curl scripts).
3. Confirm: `[ ] rotated  by ______  on ________`

**Comparison is currently non-constant-time** — [backend/app/auth.py:20](backend/app/auth.py#L20)
uses `key != settings.api_key`. Fix with `secrets.compare_digest` in Phase 2 §2.

### 1.5 Secrets with no fail-loud guard — **FIX**

[backend/app/config.py](backend/app/config.py) defaults `smtp_user`, `smtp_password`
and `api_key` to `""`. An empty `API_KEY` causes `require_api_key` to return **503**
rather than failing at startup, so a misconfigured production deploy boots "healthy"
with admin endpoints silently unreachable. Empty SMTP credentials mean quote
notifications fail silently.

**Action:** `SecretStr` + no defaults + startup validation. Phase 2 §1. `[ ] done`

---

## 2. Credentials explicitly checked and **not** found

Verified absent — no rotation required:

- No AWS / GCP / Azure keys
- No Stripe or payment-processor keys
- No JWT `SECRET_KEY` (the app has no session/token layer yet)
- No database password (SQLite, file-backed, no auth)
- No third-party API keys in the frontend bundle
- No Unsplash API key — images are hotlinked by plain URL, unauthenticated

---

## 3. Residual risk after rotation

Rotating the above does **not** close the repository's actual exposure. The real
committed-data problem is **`backend/aurelia.db`**, which *was* committed and pushed
and *does* contain enquiry rows. Credentials were never in git; **the database was**.

See **`PII_INCIDENT.md`** — that is the live item.

---

## 4. Sign-off

| Item | Action | Owner | Done |
|---|---|---|---|
| 1.1 Gmail SMTP app password | Revoke + reissue | account owner | `[ ]` |
| 1.2 Sending identity | Review; migrate off personal Gmail | client | `[ ]` |
| 1.3 Hardcoded email in `config.py` | Remove default | dev | `[ ]` |
| 1.4 Admin `API_KEY` | Reissue via `openssl rand -hex 32` | operator | `[ ]` |
| 1.5 Fail-loud secret loading | Implement | dev | `[ ]` |
| — | Confirm no new secret committed (`gitleaks --no-git`) | dev | `[ ]` |
