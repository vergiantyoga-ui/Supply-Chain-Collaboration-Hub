# Paragon Supply Collaboration Hub

Production-oriented implementation of the Login, Forgot Password, Supplier
Registration, and Internal Approval Panel features described in
`PRD-Paragon-Supply-Collaboration-Hub.docx`.

- **Frontend:** React 18 + Vite (JavaScript, no TypeScript), plain CSS Modules
- **Backend:** Next.js 14 (App Router, API routes only — no server-rendered pages)
- **Database:** PostgreSQL (schema + seed provided). Ships with an in-memory
  mock data layer enabled by default, so **every page works out of the box
  with mock data and no database setup required.**

```
paragon-supply-hub/
├── backend/     Next.js API (auth, lookups, supplier submissions, approvals)
│   ├── app/api/...        Route handlers
│   ├── lib/                Repository layer, validators, mock data, pg pool
│   └── db/                 schema.sql + seed.sql (PostgreSQL DDL)
└── frontend/    React + Vite SPA
    └── src/
        ├── api/            fetch wrappers calling the backend
        ├── components/     ui / layout / register / internal
        ├── context/         Auth, Toast
        ├── i18n/            ID / EN / ZH translations
        ├── pages/           Login, ForgotPassword, Register (3 tabs), Internal review, ...
        └── utils/           lookups hook, client-side validation
```

## 1. Quick start (mock data, no database)

Two terminals:

```bash
# Terminal 1 — backend API (http://localhost:4000)
cd backend
cp .env.example .env      # DATABASE_URL stays unset → mock data mode
npm install
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173**.

### Demo accounts (mock mode)

Any email/password combination signs in successfully in mock mode **except**
for accounts that already have a generated password (see "Approval → account
creation" below), which now require the exact password. The **role** is
what changes the experience:

| To sign in as...     | Use an email like...            | You land on            |
|-----------------------|----------------------------------|-------------------------|
| Internal Paragon staff | `reviewer@paragon-corp.com`     | Internal Approval Panel (`/internal`) |
| A pre-approved supplier | `bayu.p@mitrakantor.co.id` / password `Paragon123!` | Supplier Dashboard (`/supplier/profile`), pre-populated with sample tax/document/license/bank/contact data, 2 RFx, 1 quotation |
| Any other supplier      | anything else, e.g. `supplier@company.com` | Supplier Dashboard, empty profile |

The "Sign in with Company SSO" button always simulates an internal-staff
login (`reviewer@paragon-corp.com` / Nadia Putri), matching PRD section 6.

There is intentionally **no public link** to the Internal Approval Panel —
per the PRD, staff only reach it by logging in and being routed there by
role, exactly like a real deployment would do via the IdP/directory.

### Approval → account creation → welcome email (new)

When an internal reviewer approves a pending submission in `/internal`:

1. A supplier account is created (or reactivated) using the **contact
   email from Tab 3 of the registration form** — not the general company
   email — with a freshly generated password.
2. A welcome email containing those credentials is "sent" — in this build
   that means it's appended to an in-memory outbox, since no real email
   provider is wired up. **View it at `GET /api/dev/email-outbox`** (dev/QA
   only — remove or protect this route before any real deployment).
3. The Internal Review UI also surfaces the email + generated password
   directly in a toast, purely so the flow is testable without a mailbox.
4. That supplier can now log in with the emailed credentials and lands on
   the Supplier Dashboard to complete their profile.

### Supplier Dashboard (new)

After a supplier logs in, they land on `/supplier/profile` inside a
persistent layout (`SupplierLayout`) with three sections:

- **Company Profile** (`/supplier/profile`) — five tabs:
  - **Tax Detail** — NIK, NPWP, KTP, SIUP
  - **Legal Documents** — upload Akta Pendirian, SK Pendirian, Surat Izin
    Usaha (demo mode: only the file name is stored, no real file storage)
  - **Licenses & Certificates** — GMP, CPKB, Halal, with certificate
    number and validity dates
  - **Purchase & Invoicing** — one or more bank accounts (bank name,
    account number, holder name, currency, terms of payment)
  - **Contacts** — up to **10** additional contacts beyond the one
    collected at registration
- **RFx** (`/supplier/rfx`) — read-only list of RFI/RFP/RFQ issued by
  Paragon procurement to this supplier, with an inline detail panel
- **Quotations** (`/supplier/quotations`) — submission history plus a form
  to submit a new quotation (multiple line items) against any currently
  **open** RFx; the backend rejects quotations against closed RFx

## 2. Switching to a real PostgreSQL database

The backend is written so the mock data layer and PostgreSQL are two
implementations of the same `lib/repository.js` interface — no route
handler code needs to change.

```bash
createdb paragon_supply_hub
psql postgresql://localhost/paragon_supply_hub -f backend/db/schema.sql
psql postgresql://localhost/paragon_supply_hub -f backend/db/seed.sql
```

Then in `backend/.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/paragon_supply_hub
```

Restart `npm run dev` in `backend/`. Every endpoint now reads/writes the
real database. See `backend/lib/repository.js` for the exact SQL used per
endpoint, and `backend/db/schema.sql` for table definitions (mirrors the
field dictionary in PRD section 11).

## 3. Authentication (important — read before deploying)

This build intentionally does **not** implement real password hashing.
`backend/lib/repository.js#authenticate()`:
- Accepts **any** password for accounts that don't have one set (the two
  original seed accounts, and any brand-new email not yet in the system —
  role is inferred from whether the email ends in `@paragon-corp.com`).
- **Validates the password exactly** for accounts that do have one — namely
  the pre-seeded supplier `bayu.p@mitrakantor.co.id` and any account created
  by the approval flow (see above). This closes the loop end-to-end for
  demo purposes, but the password itself is still stored in plaintext in
  memory, never hashed.

**Before production use**, replace `authenticate()` with:
- Real credential verification (bcrypt/argon2 hash comparison against
  `users.password_hash`) for every account, and
- Real session/JWT issuance, and
- A real SSO integration (SAML 2.0 / OpenID Connect) behind
  `/api/auth/sso`, and
- A real transactional email provider behind the approval flow, per PRD
  section 6 and 9.8.

PRD section 5.4 documents this exact requirement — role must come from the
IdP/directory, never from an email-domain heuristic, in production.

## 4. Feature coverage (maps to the PRD)

| PRD section | Where it lives |
|---|---|
| 5. Login | `frontend/src/pages/LoginPage.jsx`, `backend/app/api/auth/login` |
| 6. SSO | Login page "Company SSO" button, `backend/app/api/auth/sso` |
| 7. Forgot Password | `frontend/src/pages/ForgotPasswordPage.jsx`, `backend/app/api/auth/forgot-password` |
| 8. Supplier Registration (3 tabs) | `frontend/src/pages/RegisterPage.jsx` + `components/register/*` |
| 9. Internal Approval Panel | `frontend/src/pages/InternalReviewPage.jsx` + `components/internal/*` |
| 9.8 Approval notification | `backend/lib/repository.js#approveSubmission`, `GET /api/dev/email-outbox` |
| Supplier Dashboard (Profile/RFx/Quotations) | `frontend/src/pages/supplier/*`, `components/supplier/*` |
| 10. Non-functional (i18n, responsive) | `frontend/src/i18n/*`, CSS Modules with mobile breakpoints throughout |
| 11. Field dictionary | `backend/db/schema.sql`, `backend/lib/mockData.js` |

Behaviors implemented as specified:
- Legal Status → Title conditional field; Vendor Type → Vendor Type Detail
  cascading dropdown; Company multi-select chips; Country → State → City
  cascading dropdowns (client validated + server validated).
- Forgot Password returns a generic message regardless of whether the email
  is registered (anti-enumeration, PRD 7.3).
- Internal reviewers must open all three read-only tabs (General, Address,
  Contact) before the Approve/Reject buttons unlock (PRD 9.4).
- Rejecting a submission requires a non-empty reason, sent back with the
  decision so the supplier understands why (PRD 9.6).
- Full UI in Bahasa Indonesia, English, and Simplified Chinese, switchable
  at any time without losing in-progress form data.

## 5. Known gaps / next steps (see PRD "Open Questions")

- Document/license "upload" only stores the selected file's name — no real
  object storage (S3 / Vercel Blob) is wired up yet.
- No real outbound email provider — approval emails only land in the
  in-memory dev outbox (`GET /api/dev/email-outbox`).
- RFx and quotations are supplier-facing only; there is no internal-staff
  UI yet for issuing new RFx or reviewing incoming quotations.
- No automated test suite included; add Vitest + React Testing Library for
  the frontend and a route-handler test harness for the backend as a next
  step.

## 6. Scripts reference

```bash
# backend/
npm run dev     # next dev -p 4000
npm run build   # next build
npm run start   # next start -p 4000 (after build)

# frontend/
npm run dev      # vite (http://localhost:5173)
npm run build    # vite build → dist/
npm run preview  # serve the production build locally
```
