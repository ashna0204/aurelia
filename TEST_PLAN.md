# Test Plan — Aurelia Logistics

Automated test suite for the React 19 + FastAPI brochure site. Target: **≥90%
line coverage on both frontend and backend**, enforced in CI.

Generated during Phase 0 (repo mapping) before any tests were written, then kept
current as coverage was driven up.

---

## Backend (FastAPI) — `backend/`

### Repo map

| Kind | File | Responsibility |
| --- | --- | --- |
| App | `app/main.py` | App factory, middleware wiring, lifespan, `/` and `/health` |
| Routes | `app/routes_quotes.py` | `POST/GET /api/quotes/`, `GET /{id}`, `PATCH /{id}/status` |
| Routes | `app/routes_contact.py` | `POST/GET /api/contact/`, `PATCH /{id}/read` |
| Schemas | `app/schemas.py` | Pydantic request/response models + validators (phone, control chars, vocab) |
| Models | `app/models.py` | `QuoteRequest`, `ContactMessage` ORM tables |
| Auth | `app/auth.py` | `X-API-Key` admin auth (`require_api_key`) |
| Config | `app/config.py` | `Settings` + startup validators (API key entropy, debug guard, deploy reqs) |
| DB | `app/database.py` | Engine/session, `get_db`, `check_migrations` |
| Email | `app/email_service.py` | `send_email`, `notify_new_quote`, `notify_new_contact` |
| Limiter | `app/limiter.py` | slowapi limiter, trusted-proxy client-IP resolution |
| Middleware | `app/middleware.py` | Security headers, 429 handler, 500 handler |
| Logging | `app/logging_config.py` | PII-redaction log filter |
| Audit | `app/audit.py` | Append-only admin-access audit log |

### Test files (`backend/tests/`)

| File | Covers |
| --- | --- |
| `conftest.py` | In-memory SQLite (StaticPool) per test, `get_db` override, `TestClient`, admin headers, aiosmtplib mock, limiter reset |
| `factories.py` | `faker`-seeded builders for valid quote/contact payloads |
| `test_quotes_routes.py` | Quote happy path + DB side effect, honeypot, list/get/patch, 404, 405 |
| `test_contact_routes.py` | Contact happy path + DB side effect, list/get/patch, 404, 405 |
| `test_validation.py` | 422 on missing/oversized/malformed fields; asserts nothing persisted |
| `test_auth.py` | Missing/wrong/correct `X-API-Key`; public routes need no key; audit outcomes |
| `test_rate_limit.py` | Public + admin endpoints return 429 past the limit; under-limit succeeds |
| `test_email_service.py` | One email per submission w/ right recipient/subject/body; SMTP-failure handling; not-configured skips |
| `test_schemas.py` | Phone/control-char/vocab validators, message bounds, response serialization |
| `test_security_inputs.py` | `<script>`, `' OR 1=1 --`, null bytes, huge strings — rejected or stored verbatim |
| `test_config.py` | API-key entropy (hex/base64/raw), debug-in-prod guard, deploy-required guard, cors/proxy props |
| `test_limiter.py` | `_is_trusted_proxy`, `client_ip` (spoofed vs trusted XFF), `_build_limiter` branches |
| `test_middleware.py` | Security headers on responses; 429 + 500 handlers directly |
| `test_logging_config.py` | Email/phone redaction filter |
| `test_audit.py` | Record shape, key fingerprint, file vs stream handler |
| `test_database.py` | `check_migrations` raises on drift / passes at head; `get_db` closes |
| `test_main.py` | `/`, `/health`, lifespan enter/exit (migrations mocked) |

### Per-route matrix (Phase 2)

- **Happy path** — valid payload → status/schema + row queried back from DB.
- **Validation** — missing required, wrong type, oversized, bad email/phone → 422; DB unchanged.
- **Auth** — admin routes: no key / wrong key → 401; correct → 200. Public POSTs need no key.
- **Not found / method** — unknown id → 404; wrong verb → 405.
- **Rate limiting** — loop past limit → 429; limiter reset between tests.
- **Email** — exactly one send with expected recipient/subject/body; SMTP failure behavior (see notes).
- **Security input** — script/SQL/null-byte/huge payloads rejected or round-trip verbatim.

### Coverage config

`backend/pyproject.toml`: `--cov=app --cov-report=term-missing --cov-report=html
--cov-fail-under=90`. Omits `alembic/*` and `app/__init__.py`; `exclude_lines`
drops `if __name__ == "__main__"` and `TYPE_CHECKING` blocks.

---

## Frontend (React 19 + Vite) — `frontend/`

### Repo map

| Kind | File | Responsibility |
| --- | --- | --- |
| Entry | `src/App.jsx` | Router, routes, `ScrollToTop`, layout (Navbar/Footer) |
| API | `src/api/client.js` | `postJson`, 422 formatting, `submitQuote`, `submitContact` |
| Utils | `src/utils/validation.js` | Client-side quote/contact validators, phone/email |
| Constants | `src/constants/quoteForm.js` | Sectors/volumes/limits, `composeMessage`, honeypot |
| Hooks | `src/hooks/useFormSubmit.js` | Submit lifecycle (validate→loading→submit→error) |
| Hooks | `src/components/FadeIn.jsx` | `useInView` + fade wrapper |
| Hooks | `src/hooks/useSmartNavigate.js` | Route vs in-page-anchor navigation |
| Pages | `Home.jsx` | Hero, scroll journey, about, previews, contact form |
| Pages | `QuotePage.jsx` | Quote request form |
| Pages | `Specialisations.jsx`, `EthnicFood.jsx`, `VehicleParts.jsx`, `Pharmaceuticals.jsx` | Vertical pages |
| Pages | `NotFound.jsx` | 404 fallback |
| Components | `Navbar.jsx`, `Footer.jsx`, `SectionTag.jsx` | Chrome |
| Data | `src/data.js` | Product catalogue data |

### Test files (`src/tests/` + colocated `*.test.jsx`)

| File | Covers |
| --- | --- |
| `tests/setup.js` | jest-dom, MSW server lifecycle, IntersectionObserver/scrollTo/matchMedia stubs |
| `tests/handlers.js` | MSW success handlers + per-test error overrides (422/429/500/network) |
| `tests/renderWithProviders.jsx` | `MemoryRouter`-wrapped render at a given route |
| `routing.test.jsx` | Each route renders; unknown → 404; nav links navigate |
| `quoteForm.test.jsx` | Labels, empty→inline errors (no API call), valid submit body, success UI, honeypot bot-speed |
| `quoteForm.errors.test.jsx` | 422/500/429/network → visible error, data preserved, no crash |
| `contactForm.test.jsx` | Contact critical path + error states |
| `api-client.test.js` | `postJson` base URL, 422 array formatting, string detail, network error, `omitBlank` |
| `validation.test.js` | quote/contact validators, phone/email edge cases, composeMessage ceiling |
| `useFormSubmit.test.jsx` | `renderHook`: validation short-circuit, revalidate gating, error surfacing |
| `useSmartNavigate.test.jsx` | Same-page anchor, cross-page anchor, plain route |
| `components.test.jsx` | Navbar links/active, Footer modals + mailto, SectionTag, FadeIn |
| `pages.test.jsx` | Vertical pages render, category expand/collapse, images have alt, single `h1` |
| `constants.test.js` / `theme.test.js` | Data invariants, design-token values |

### Coverage config

`vite.config.js` `test.coverage`: v8 provider, thresholds
`lines/functions/statements: 90`, `branches: 85`; excludes `src/main.*`,
`**/*.d.ts`, `src/tests/**`, `**/vite-env*`.

---

## Notes, findings & flags

### Email failure handling (Phase 2 item 6)
`email_service.send_email` swallows any exception and returns `False`; it is
invoked from a **FastAPI `BackgroundTask`** scheduled *after* the DB commit and
*after* the response is returned. Therefore:
- An SMTP failure **cannot** lose the DB record (commit already happened) and
  **cannot** turn the user's response into a 500 (response already sent).
- This is correct, resilient behavior — tests assert it. **No production bug.**
- Trade-off worth noting (not a bug): a failed notification is only logged, not
  retried or queued, so a persistent SMTP outage silently drops operator
  alerts while still accepting enquiries. Out of scope for this suite.

### Dead code found
- **Backend:** none. Every branch in the `app` package is reachable and exercised.
- **Frontend:** `src/utils/validation.js` — the combined description+notes ceiling
  branch (the `errors.description = "…too long together…"` assignment) is
  **defensively unreachable** under the current constants: `DESCRIPTION_MAX (3000)
  + "\n\nNotes: " (9) + NOTES_MAX (900) = 3909 < MESSAGE_MAX (4000)`, so no valid
  pair of inputs can breach the ceiling. It is deliberate defence against a
  future constant change (see the comment there) and is left in place, not
  `pragma`-annotated. `constants.test.js` asserts the invariant that keeps it
  unreachable.

### Production bugs discovered
None. No production code was modified to make tests pass.
