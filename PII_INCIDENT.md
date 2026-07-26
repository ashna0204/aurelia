# PII EXPOSURE INCIDENT RECORD — `backend/aurelia.db`

**Incident ID:** AUR-INC-001
**Classification:** Personal data exposure via version control — **scope limited, notifiability undetermined**
**Date of awareness:** 2026-07-26
**Record status:** OPEN — pending two operator answers (§7)
**Prepared by:** security review pass
**Article 33 assessment:** see §5. **This record does not, on current evidence, establish a notifiable personal data breach.**

---

## 1. Executive summary

A SQLite database containing website enquiry submissions was committed to git and
pushed to a GitHub remote. It was removed from the repository tip approximately one
hour later, but **remains permanently recoverable from the remote's commit history**.

The exposure is real and must be remediated by history rewrite. However, the content
is far narrower than the incident brief assumed:

- **At most one identifiable natural person** appears in the committed data.
- That person's rows carry hallmarks of **developer self-testing**, not customer traffic.
- The `contact_messages` table was **empty** at time of commit.
- **No credentials were exposed** — see `SECRETS_ROTATION.md` §0.
- The remote is **not publicly readable** as of this assessment.

The brief's framing — *"real EU/UK customers whose PII was committed to git"* — is not
supported by the evidence. Treating this as a confirmed customer breach would be
inaccurate and would trigger notification obligations that the facts do not currently
justify. Treating it as nothing would be equally wrong: the data is still in the remote.

---

## 2. What was exposed

**Artefact:** `backend/aurelia.db` — SQLite, 53,248 bytes
**Blob SHA:** `f9fdbfb5d6729fff6795574156a3429ac4a8fd49`
**Introduced:** commit `a4eb6f8` ("initial commit")
**Removed from tip:** commit `9ae4d16` — *deletion only; the blob remains in history*

### Table contents at time of commit

| Table | Rows | Assessment |
|---|---|---|
| `quote_requests` | **11** | see triage below |
| `contact_messages` | **0** | empty — no exposure |
| `products` | 7 | seeded business catalogue, not personal data |
| `alembic_version` | 1 | schema metadata |

### Personal-data columns present in `quote_requests`

`name`, `email`, `company`, `phone`, `products`, `volume`, `frequency`,
`destination`, `message`, `status`, `internal_notes`, `created_at`, `updated_at`

No special-category data (GDPR Art. 9). No financial or authentication data.

---

## 3. Row-level triage — apparent real PII vs test junk

| ID | Classification | Basis |
|---|---|---|
| 1 | **Apparent real PII** | Named individual, live-format Gmail address, valid **UK mobile** (`+44 7…`), company `al bidAYA`, destination `UNITED KINGDOM`, free-text message |
| 2 | **Apparent real PII** — same subject | Identical email + phone to row 1; nonsense name/company (`meowq`, `mowow`) |
| 3 | **Apparent real PII** — same subject | Identical email + phone; nonsense company `buifafa` |
| 4 | **Apparent real PII** — same subject | Identical email + phone; nonsense company `bbbb` |
| 5 | Swagger test junk | Every field literally `"string"`, email `user@example.com` |
| 6 | Swagger test junk | as above |
| 7 | Swagger test junk | as above |
| 8 | Swagger test junk | as above |
| 9 | Swagger test junk | as above |
| 10 | Test junk | `askdf` / `test@gmail.com` / keyboard-mash message |
| 11 | Test junk | `test` / `test@exampl.com` (misspelled TLD) / keyboard-mash |

### Distinct data subjects: **1 (at most)**

Rows 1–4 share **one email address and one phone number**. They are four submissions
from a single identity, made within a 72-minute window (00:39–01:51 on 2026-03-23),
with the name and company fields degrading into nonsense across the sequence
(`al bidAYA` → `mowow` → `buifafa` → `bbbb`).

**That pattern is form-testing, not four customer enquiries.** A genuine trade
enquirer does not submit four times in an hour with a deteriorating company name.

Rows 5–9 confirm the brief's separate claim that **Swagger UI "Try it out" polluted the
datastore** — five identical `"string"` records, timestamped across a 33-minute
session. This is evidence for the `/docs`-exposure finding (`AUR-SEC-###`, Phase 1).

### Categories of personal data actually exposed

For the single subject: **name, email address, UK mobile number, stated company,
destination country, free-text message, submission timestamps.**

---

## 4. Evidence of publication

Reconstructed from `git reflog` (local, authoritative for this workstation):

| Time (IST, 2026-07-26) | Event |
|---|---|
| 22:20:56 | `a4eb6f8` committed — **database enters git** |
| 22:21:01 | branch `master` renamed to `main` |
| **22:21:33** | **`git push` → `origin/main`** — database published to remote |
| 22:48:59 | local branch `backup-pre-cleanup` created at `a4eb6f8` |
| 23:16:07 | `9ae4d16` committed — database deleted from tip |
| **23:21:06** | **`git push` → `origin/main`** — deletion published |

**Remote:** `https://github.com/ashna0204/aurelia.git`
**Window during which the DB was the remote's tip state:** ~60 minutes
**Window during which the DB is recoverable from remote history:** **ongoing — from 22:21:33 until a history rewrite is force-pushed.**

### Is the remote public?

**Unauthenticated probe on 2026-07-26:**

```
GET https://github.com/ashna0204/aurelia      → HTTP 404
GET https://api.github.com/repos/ashna0204/aurelia → HTTP 404 "Not Found"
```

GitHub returns `404` (not `403`) for private repositories to unauthenticated callers,
so this result is consistent with **either** a private repository **or** a deleted one.
It is **not** consistent with a public repository.

**Assessment:** on available evidence the data was **not** published to the open
internet. It was pushed to a remote under the developer's own account
(`ashna0204`; commits authored by `ashnacp0204@gmail.com` — the same identity).

**This must still be confirmed by the operator** — see §7 Q1. Repository visibility can
have been changed since the push, and GitHub's `404` does not distinguish the cases.

### Additional exposure vectors to check

- [ ] Was the repository ever **forked**, or its visibility ever set to public, even briefly?
- [ ] Are there **collaborators** on the repo who could have cloned it?
- [ ] Does any **CI/CD integration, GitHub App, or third-party scanner** have read access?
- [ ] Is the repo mirrored anywhere (backup service, another remote)?
- [ ] **`backup-pre-cleanup`** — local branch pinned to `a4eb6f8`. Confirm it was never pushed. *(Reflog shows no push for this ref; it is local-only.)*

---

## 5. GDPR Article 33 assessment

### 5.1 Is this a "personal data breach"?

Art. 4(12) defines a breach as a security incident leading to *"accidental or unlawful
destruction, loss, alteration, unauthorised disclosure of, or access to"* personal data.

Committing personal data to a repository and pushing it to a remote is an
**unauthorised disclosure** *if* it reached parties not authorised to receive it. On
current evidence the remote is private and under the data controller's own account,
so **no disclosure to an unauthorised third party is established**.

**Provisional classification: security incident, not a confirmed notifiable breach.**

### 5.2 The 72-hour clock

Art. 33(1) requires notification to the supervisory authority *"without undue delay
and, where feasible, not later than 72 hours after having become aware of it"* —
**unless** the breach is *"unlikely to result in a risk to the rights and freedoms of
natural persons."*

| Field | Value |
|---|---|
| Awareness established | **2026-07-26** |
| 72-hour deadline **if notifiable** | **2026-07-29, ~23:21 IST** |
| Currently assessed as notifiable? | **No** — pending §7 Q1 and Q2 |

**The clock is recorded, not started.** If Q1 returns *"the repository was public at any
point"*, this record converts to a live breach notification and the deadline above
becomes binding — act immediately.

### 5.3 Risk-to-rights assessment (Art. 33(1) exemption test)

| Factor | Assessment |
|---|---|
| Volume | 1 data subject |
| Sensitivity | Ordinary contact data; **no** Art. 9 special categories |
| Identifiability | High — name + email + mobile directly identify |
| Likelihood of access by unauthorised party | **Low** — remote not publicly readable |
| Potential harm | Low: spam/phishing to one address; no credential or financial exposure |
| Data subject is likely | **The developer themselves or a close associate**, not a customer |

**Conclusion:** *unlikely to result in a risk to the rights and freedoms of natural
persons* — the Art. 33(1) exemption plausibly applies. **Document the reasoning and
retain this record under Art. 33(5) regardless.** Art. 33(5) requires the controller to
document *all* breaches, including non-notifiable ones.

### 5.4 Art. 34 (communication to the data subject)

Not triggered — Art. 34 applies only where the breach is *"likely to result in a **high**
risk."* It is not, on current evidence.

Notwithstanding, if the subject of rows 1–4 is a genuine third party rather than the
developer, **a courtesy notification is recommended** on Art. 5(1)(a) transparency
grounds. Template in §8.

---

## 6. Remediation plan

### 6.1 Immediate — already complete

- [x] `backend/aurelia.db` removed from repository tip (`9ae4d16`)
- [x] Root `.gitignore` covering `.env*`, `*.db`, `*.sqlite*`, `venv/`, `__pycache__/`, `dist/`, `build/`, `node_modules/`, `.DS_Store`, `.idea/`, `.vscode/`, `*.log`
- [x] `backend/.gitignore` with the same protections, annotated
- [x] Confirmed nothing matching those rules remains tracked in `HEAD`
- [x] `DEBUG=false` is the default in both `.env.example` and the settings loader
- [x] `/docs`, `/redoc`, `/openapi.json` gated behind `DEBUG` ([backend/app/main.py:49-51](backend/app/main.py#L49-L51))

### 6.2 Outstanding — **operator must execute**

The blob is still in the remote. Deleting a file in a later commit does not remove it
from history. **This is the open item.**

#### Step 1 — Preserve evidence before rewriting

Do this first. History rewrite is destructive and this record depends on the evidence.

```bash
cd /home/ashna/Documents/aurelia
git bundle create ../aurelia-preincident-evidence.bundle --all
sha256sum ../aurelia-preincident-evidence.bundle > ../aurelia-preincident-evidence.sha256
```

Store the bundle **encrypted, offline, access-logged**, under legal hold. It is the
Art. 33(5) evidence record. Do not leave it in the working directory.

#### Step 2 — Delete the local branch that pins the bad commit

`backup-pre-cleanup` points at `a4eb6f8`. `git filter-repo` rewrites all refs, but this
branch will otherwise carry the blob forward.

```bash
git branch -D backup-pre-cleanup
```

#### Step 3 — Rewrite history

```bash
pip install git-filter-repo   # or: brew install git-filter-repo

cd /home/ashna/Documents/aurelia

git filter-repo --force \
  --invert-paths \
  --path        backend/aurelia.db \
  --path        backend/.env \
  --path-glob  'backend/venv/*' \
  --path-glob  '**/__pycache__/*' \
  --path-glob  '**/*.pyc'
```

> `backend/.env` is included **defensively only** — it was verified absent from all
> history (`SECRETS_ROTATION.md` §0). Listing a non-existent path is a no-op.

#### Step 4 — Verify the rewrite

```bash
# Expect NO output from all three:
git log --all --oneline -- backend/aurelia.db
git rev-list --all --objects | grep -E 'aurelia\.db|backend/venv/|__pycache__'
git cat-file -e f9fdbfb5d6729fff6795574156a3429ac4a8fd49 2>&1   # expect: not found
```

#### Step 5 — Force-push

`filter-repo` removes the `origin` remote by design. Re-add and overwrite:

```bash
git remote add origin https://github.com/ashna0204/aurelia.git
git push --force --all origin
git push --force --tags origin
```

#### Step 6 — Purge the remote's own copies

**Critical and frequently missed.** GitHub retains unreachable objects and serves them
by SHA indefinitely. `f9fdbfb…` stays fetchable after a force-push.

- [ ] Open a **GitHub Support** request citing this incident ID, asking them to garbage-collect unreachable objects and expire cached views for `ashna0204/aurelia`.
- [ ] Delete every **fork** (if any exist).
- [ ] Delete stale **pull requests** — PR refs preserve blobs independently of branches.
- [ ] **Alternative, faster, strongly recommended given the repo has one contributor and two commits:** delete the GitHub repository outright and re-push the rewritten history to a fresh one. This is the only method that removes the object with certainty.

#### Step 7 — Local hygiene

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

Also purge the working-tree DB if it is not needed — it now holds **14 quote rows and
1 contact message**, having grown since the commit. It is correctly gitignored, but it
is unencrypted PII at rest on a developer workstation.

---

## 7. Open questions — blocking full closure

**Q1. Was `github.com/ashna0204/aurelia` public at any point between 22:21 and 23:21 IST on 2026-07-26?**
Check Settings → General → Danger Zone → *Change visibility*, and the repo's audit log.
→ **If yes:** this becomes a confirmed breach. Notify the ICO within 72 hours of
awareness (deadline **2026-07-29 23:21 IST**) and reassess Art. 34.
→ **If no:** the Art. 33(1) exemption applies; retain this record under Art. 33(5) and close.

**Q2. Is the subject of rows 1–4 a genuine third party, or the developer / a close associate?**
The email and UK mobile are consistent across all four rows.
→ **If developer/associate:** no external data subject; no notification. Close.
→ **If genuine third party:** send the §8 courtesy notification.

**Q3. Is Aurelia Logistics a UK- or EU-registered entity?** Determines whether UK GDPR
(ICO) or EU GDPR (a lead supervisory authority) applies, and whether an Art. 30 record
of processing and an ICO registration fee are required. *Do not assume — the site copy
references UK operations but incorporation status is unverified.*

**Q4. Has a DPO been appointed, or is one required?** Likely not required under
Art. 37 at this scale, but the decision should be recorded.

---

## 8. Draft data-subject notification

**Send only if §7 Q1 = yes, or Q2 = genuine third party.** Legal review before sending.
Placeholders in `[BRACKETS]` must be completed — **do not send with any placeholder intact.**

> **Subject:** Important notice regarding your enquiry to Aurelia Logistics
>
> Dear [NAME],
>
> I am writing to inform you of an incident affecting personal data you provided to us
> through our website enquiry form on [DATE].
>
> **What happened.** On 26 July 2026, during development work, a database file
> containing website enquiry submissions was mistakenly included in our source code
> repository and uploaded to our code hosting provider. We identified this on the same
> day and removed the file within approximately one hour. We are now permanently
> erasing it from our repository history.
>
> **What information was involved.** Your name, email address, telephone number, the
> company name you provided, your stated destination country, and the content of your
> enquiry message. **No passwords, payment details, or financial information were
> involved** — we do not collect these.
>
> **Who could have seen it.** [SELECT ONE:]
> [a] Our repository was configured as private throughout. We have no evidence that
>     any unauthorised person accessed it. We are notifying you as a precaution and in
>     the interest of transparency.
> [b] Our repository was publicly accessible for approximately [DURATION]. We cannot
>     rule out that it was accessed during this period.
>
> **What we have done.** We removed the file immediately; we are erasing it from all
> historical records; we have added automated safeguards preventing any database or
> credentials file from being included in our code repository again; and we have
> commissioned a full security review of our systems.
>
> **What you may wish to do.** The information involved does not put your accounts at
> risk. As a general precaution, please be alert to unexpected emails or calls
> referencing Aurelia Logistics or your enquiry, and do not share personal or financial
> details in response to unsolicited contact.
>
> **Your rights.** You have the right to request a copy of the personal data we hold
> about you, to have it corrected, and to request its erasure. To exercise any of these
> rights, or if you have questions, contact us at [DPO/CONTACT EMAIL].
>
> You also have the right to lodge a complaint with the Information Commissioner's
> Office (ICO) at ico.org.uk or on 0303 123 1113. [ADJUST IF THE LEAD AUTHORITY IS NOT THE ICO.]
>
> I am sorry that this happened. We take responsibility for it and have acted to
> ensure it cannot recur.
>
> Yours sincerely,
> [NAME], [ROLE]
> Aurelia Logistics
> [CONTACT DETAILS]

---

## 9. Lessons / preventive controls

| Control | Status |
|---|---|
| `.gitignore` blocking `*.db`, `.env*`, `venv/`, `__pycache__/` | **Done** |
| Pre-commit secret scanning (`gitleaks`) | Phase 2 §11 |
| CI secret + dependency scanning on every PR | Phase 2 §11 |
| `/docs` not public in production *(source of the 5 `"string"` rows)* | **Done** — gated behind `DEBUG` |
| Production DB not file-based on the app host (→ PostgreSQL) | Phase 2 §8 |
| Encryption at rest for the PII store | Phase 4 |
| Retention policy + automated deletion | Phase 2 §12 |
| DSAR export/erasure endpoints | Phase 2 §12 |
| Never log PII (`echo=False` unconditionally in production) | Phase 2 §8 |

---

## 10. Record retention

Retain under **GDPR Art. 33(5)** for a minimum of **6 years**, together with the
evidence bundle from §6.2 Step 1, whether or not the incident is ultimately notified.
