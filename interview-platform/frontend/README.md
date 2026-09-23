# Mock Interview Tracker

A full-stack web application for creating, conducting, and reviewing mock technical interviews — track candidates, schedule sessions, record structured feedback, and see progress trends over time.

**Live app:** _[add deployed frontend URL here]_
**Live API:** _[add deployed backend URL here]_

---

## Table of Contents
- [Solution Overview](#solution-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Overview](#api-overview)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)

---

## Solution Overview

The app supports the full lifecycle of a mock interview:

1. **Auth** — register/login with email + password (JWT-based).
2. **Candidates** — add people you're interviewing, search/browse them, view their full interview history in one place.
3. **Sessions** — schedule an interview session tied to a candidate (title, role, level, date/time, duration), edit it, mark it complete.
4. **Feedback** — record strengths, areas for improvement, and a hire/no-hire recommendation against a session. Submitting feedback automatically marks the session complete.
5. **Dashboard/Reporting** — aggregate stats (total sessions, completion rate, candidates tracked), a recommendation breakdown, and a sessions-per-week trend chart.
6. **Search** — candidates searchable by name/email; sessions filterable by status and searchable by title/candidate name.

## Tech Stack

| Layer      | Choice                                      | Why |
|------------|----------------------------------------------|-----|
| Frontend   | Angular 18 (standalone components) + Angular Material | Team familiarity, fast to build clean CRUD UIs, Material gives consistent UX for free |
| Backend    | Node.js + Express + TypeScript              | Lightweight, fast to scaffold, type safety end-to-end |
| ORM        | Prisma (pinned to v5.x)                     | Type-safe queries, easy migrations, readable schema |
| Database   | PostgreSQL (Neon)                            | Relational data (candidates → sessions → feedback) fits SQL naturally; Neon gives free instant provisioning |
| Auth       | JWT (jsonwebtoken + bcryptjs)                | Simple, stateless, easy to reason about for an assignment-scoped app |
| Validation | Zod (backend), Angular Reactive Forms (frontend) | Schema validation shared conceptually on both ends |

## Architecture

```
┌─────────────────┐         HTTPS/JSON        ┌──────────────────┐         SQL        ┌─────────────┐
│  Angular SPA     │  ───────────────────────▶ │  Express API      │ ─────────────────▶ │  PostgreSQL  │
│  (Vercel/Netlify)│  ◀─────────────────────── │  (Render/Railway) │ ◀───────────────── │  (Neon)      │
└─────────────────┘        JWT in header       └──────────────────┘                     └─────────────┘
```

**Data flow (example — submitting feedback):**
1. User fills the feedback form on the session detail page.
2. Angular's `FeedbackService` POSTs to `/api/feedback` with the JWT in the `Authorization` header (attached automatically via an HTTP interceptor).
3. Express validates the payload with Zod, checks the JWT via `requireAuth` middleware.
4. Prisma upserts the `Feedback` row and, if the session wasn't already `COMPLETED`, updates its status.
5. Response flows back to Angular, which re-fetches the session to show the saved state.

**Deployment approach:**
- Frontend and backend are deployed independently (separate services), communicating over HTTPS. This keeps them scalable independently — e.g. the API can scale horizontally behind a load balancer without touching the frontend, and the SPA is served from a CDN edge network regardless of API load.
- The database is a managed, separately-scalable Postgres instance (Neon), not co-located with the API process — standard practice for stateless app servers.

## Data Model

```
User (interviewer/account)
  └─< Candidate (created_by)
        └─< InterviewSession (candidate_id, created_by)
              └── Feedback (session_id, unique — one feedback per session)
```

- A `Candidate` can have many `InterviewSession`s (their full interview history).
- Each `InterviewSession` has at most one `Feedback` record — resubmitting feedback updates the existing record (upsert) rather than creating duplicates.
- `InterviewSession.status` is an enum (`SCHEDULED` / `COMPLETED` / `CANCELLED`); submitting feedback or explicitly marking complete transitions it to `COMPLETED`.

See `backend/prisma/schema.prisma` for the full schema with indexes.

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- A PostgreSQL database (free options: [Neon](https://neon.tech), [Supabase](https://supabase.com))
- Angular CLI: `npm install -g @angular/cli@18`

### Clone the repo

```bash
git clone <your-repo-url>
cd interview-platform
```

This is a **monorepo**: `frontend/` (Angular) and `backend/` (Express + Prisma) are separate projects sharing one git history.

### Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `DATABASE_URL` — your Postgres connection string (see [Environment Variables](#environment-variables) below)
- `JWT_SECRET` — generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

Then run migrations and generate the Prisma client:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Frontend setup

```bash
cd ../frontend
npm install
```

Check `src/environments/environment.ts` points to your backend (default `http://localhost:4000/api` for local dev).

## Environment Variables

`.env` files are **never committed** — only `.env.example` (with placeholder values) is tracked in git. This is standard practice: real credentials in version control is a security risk, and every environment (your machine, a teammate's machine, CI, production) needs its own values anyway.

**To set up your own `.env`:**
```bash
cd backend
cp .env.example .env
# then edit .env with real values
```

**`backend/.env.example`:**
```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="replace-with-a-long-random-string"
PORT=4000
CORS_ORIGIN="http://localhost:4200"
```

| Variable       | Description | Where to get it |
|----------------|-------------|------------------|
| `DATABASE_URL` | Postgres connection string | Neon/Supabase dashboard after creating a free project |
| `JWT_SECRET`   | Signing key for auth tokens | Generate locally (see command above) — must be identical across restarts of the same deployment, but can differ between environments |
| `PORT`         | Port the API listens on | Defaults to `4000`; hosting providers (Render/Railway) usually inject their own `PORT` automatically in production |
| `CORS_ORIGIN`  | Allowed frontend origin | `http://localhost:4200` locally; your deployed frontend URL in production |

## Running the App

Two terminals, from repo root:

```bash
# Terminal 1 — backend
cd backend
npm run dev
# → API on http://localhost:4000, health check at /health

# Terminal 2 — frontend
cd frontend
ng serve
# → App on http://localhost:4200
```

Open `http://localhost:4200`, register an account, and start creating candidates and sessions.

## API Overview

All routes except `/api/auth/*` require `Authorization: Bearer <token>`.

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account, returns JWT |
| POST | `/api/auth/login` | Authenticate, returns JWT |
| GET | `/api/candidates` | List candidates (search, pagination) |
| GET | `/api/candidates/:id` | Candidate detail + full session history |
| POST/PUT/DELETE | `/api/candidates/:id` | Create/update/delete |
| GET | `/api/sessions` | List sessions (filter by status, search) |
| GET | `/api/sessions/:id` | Session detail |
| POST/PUT/DELETE | `/api/sessions/:id` | Create/update/delete |
| PATCH | `/api/sessions/:id/complete` | Mark session completed |
| POST | `/api/feedback` | Submit/update feedback for a session |
| GET | `/api/reports/summary` | Aggregate stats |
| GET | `/api/reports/trend` | Sessions-per-week trend |

## Design Decisions

- **JWT over session cookies** — simpler to reason about for a scoped assignment, no server-side session store needed, works cleanly with a decoupled SPA + API deployment.
- **One feedback record per session (upsert, not append)** — a session represents one interview attempt; re-submitting corrected feedback should replace, not create a confusing duplicate history.
- **Feedback submission auto-completes the session** — recording feedback implies the interview happened; this avoids the user having to do two separate actions for one real-world event, while `markComplete` still exists as an explicit manual action for sessions that don't need feedback recorded.
- **Monorepo, independently deployable services** — keeps one PR/review flow while still letting frontend and backend scale and deploy independently, which is the more realistic production pattern than a single coupled server.
- **Zod for backend validation** — schema-first validation that fails loudly and consistently, rather than scattered manual checks.

## Assumptions

- Single-tenant per interviewer: each `User` sees all candidates/sessions they created; there's no team/organization sharing layer (see Future Improvements).
- Interview "outcome" is captured as a single `recommendation` enum (Strong Hire / Hire / No Hire / Strong No Hire) rather than a more complex scoring rubric — reasonable for a mock-interview practice tool.
- No file/document uploads (résumés, recordings) — out of scope for the assignment's stated requirements.
- Password policy is length-only (8+ characters), no complexity rules — appropriate for a practice tool, not a system holding sensitive real candidate data.

## Known Limitations

- **No automated test suite** — given the time constraints, manual end-to-end testing was prioritized over test coverage. A real next step would be Jest/Supertest for the API and Jasmine/Karma or Playwright for the frontend.
- **Loosely-typed request payloads** — some frontend service calls cast to `any` at the API boundary rather than using dedicated request/response DTO interfaces separate from the Prisma-derived entity types; a cleaner API layer would define these explicitly.
- **No rate limiting or request throttling** on the API.
- **Toolchain version pinning** — `prisma` and `typescript` are pinned to stable major versions (v5.x); unpinned installs during setup pulled in bleeding-edge prereleases (Prisma 7, TypeScript 7) that broke `ts-node` and the Prisma CLI respectively.
- **`npm audit` reports vulnerabilities** on a fresh install — these are in dev-tooling transitive dependencies (build tools, test runners), not runtime-shipped packages; `npm audit fix` was run to resolve what's safely fixable.
- **No pagination on session list UI** (backend supports it, frontend doesn't yet expose page controls for sessions — only candidates).

## Future Improvements

- Multi-tenant support: teams/organizations sharing candidate pools and interview calendars, with role-based permissions.
- Full-text search via Postgres extensions or a dedicated search service, rather than `ILIKE` matching, as data volume grows.
- Calendar integration for scheduling sessions.
- Structured interview scorecards (per-competency scoring) instead of a single recommendation enum.
- Automated test coverage (unit + integration + e2e).
- Refresh tokens / shorter-lived access tokens instead of a single 7-day JWT.
- Caching layer (Redis) for dashboard aggregate queries as data grows.
