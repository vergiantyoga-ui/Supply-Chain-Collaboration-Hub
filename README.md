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

Any email/password combination signs in successfully in mock mode (see
"Authentication" below). The **role** is what changes the experience:

| To sign in as...     | Use an email like...            | You land on            |
|-----------------------|----------------------------------|-------------------------|
| Internal Paragon staff | `reviewer@paragon-corp.com`     | Internal Approval Panel (`/internal`) |
| Supplier                | anything else, e.g. `supplier@company.com` | Supplier placeholder home (`/supplier/home`) |

The "Sign in with Company SSO" button always simulates an internal-staff
login (`reviewer@paragon-corp.com` / Nadia Putri), matching PRD section 6.

There is intentionally **no public link** to the Internal Approval Panel —
per the PRD, staff only reach it by logging in and being routed there by
role, exactly like a real deployment would do via the IdP/directory.

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

This build intentionally does **not** implement real password verification.
`backend/lib/repository.js#authenticate()` accepts any password and derives
the user's role either from the seeded `users` table (if `DATABASE_URL` is
set) or, as a fallback, from whether the email ends in `@paragon-corp.com`.
This mirrors the interactive HTML mockup delivered earlier in this project
and exists purely so every page is reachable without standing up an
identity provider.

**Before production use**, replace `authenticate()` with:
- Real credential verification (bcrypt/argon2 hash comparison against
  `users.password_hash`), and
- Real session/JWT issuance, and
- A real SSO integration (SAML 2.0 / OpenID Connect) behind
  `/api/auth/sso`, per PRD section 6.

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

- No document upload (NPWP/NIB, etc.) yet.
- No outbound email/SMS notifications — endpoints return data only.
- No supplier-facing dashboard beyond a placeholder screen.
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
