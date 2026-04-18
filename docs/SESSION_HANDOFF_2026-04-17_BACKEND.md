# AstroPath Backend Session Handoff

**Date:** 2026-04-17 (same day, later session)

**Project:** AstroPath mobile app

**Working model split:** unchanged — Codex owns mobile UI/UX, Claude owns backend.

---

## What Was Completed In This Session

### Decision

- Chose **Node.js + Express + Firestore** as the backend stack (user confirmed).
- Chose to **scaffold the full backend in one pass** (user confirmed).

### Backend scaffold (new, Claude-owned)

- Full project created at [backend/](/C:/Users/Vihaan/AstroPath/backend/)
  - [backend/package.json](/C:/Users/Vihaan/AstroPath/backend/package.json) — Node 18+, Express 4, firebase-admin 12
  - [backend/.env.example](/C:/Users/Vihaan/AstroPath/backend/.env.example) — runnable defaults (memory Firestore + auth bypass) so the frontend team can hit it without credentials
  - [backend/README.md](/C:/Users/Vihaan/AstroPath/backend/README.md) — complete usage guide
- Core runtime in [backend/src/](/C:/Users/Vihaan/AstroPath/backend/src/):
  - [index.js](/C:/Users/Vihaan/AstroPath/backend/src/index.js), [app.js](/C:/Users/Vihaan/AstroPath/backend/src/app.js)
  - Config: [env.js](/C:/Users/Vihaan/AstroPath/backend/src/config/env.js), [firestore.js](/C:/Users/Vihaan/AstroPath/backend/src/config/firestore.js) (real + in-memory fallback)
  - Middleware: auth, error, locale, logger, requestId
  - Data layer: `collections`, `userRepository`, `kundliRepository`, `consultationRepository`
  - Services: `contentService` (mirrors `mock_astro_api.dart`), `kundliService` (deterministic mock)
  - Utils: `envelope`, `errors`, `validate`
- Endpoint coverage (every PRD feature area):
  - GET `/health`, GET `/`
  - POST `/v1/auth/session`
  - GET `/v1/dashboard`
  - GET/PATCH `/v1/profile/preferences`
  - POST `/v1/kundli/generate`
  - GET `/v1/horoscope/:range` (daily|weekly|monthly|yearly)
  - GET `/v1/panchang/today`
  - POST `/v1/muhurat/search`
  - POST `/v1/compatibility/match`
  - GET `/v1/consultations/hub`, POST `/v1/consultations/session`
  - GET `/v1/assistant/snapshot`, POST `/v1/assistant/query`

### Shared contracts (both-owned)

- New [contracts/API_PAYLOADS.md](/C:/Users/Vihaan/AstroPath/contracts/API_PAYLOADS.md) with request/response examples for every endpoint
- Updated [contracts/README.md](/C:/Users/Vihaan/AstroPath/contracts/README.md) to link the new payload reference

### Smoke test

- [backend/test/smoke.js](/C:/Users/Vihaan/AstroPath/backend/test/smoke.js) — boots the Express app in-process against the in-memory Firestore, calls every endpoint end-to-end, prints a pass/fail summary. No network, no credentials needed.

---

## How To Run

```bash
cd backend
npm install
cp .env.example .env
npm run smoke     # end-to-end test
npm start         # server on :8080
```

With the default `.env.example`, the server runs with:

- `FIRESTORE_MODE=memory` — in-memory Firestore, no creds needed
- `AUTH_MODE=bypass` — every request uses a synthetic dev user (`dev-user-001`)
- `CORS_ORIGINS=*` — any origin

This is the mode the frontend should point at during UI integration. Switch to
`firestore` / `firebase` modes when real Firebase is provisioned.

---

## Boundary Compliance

- All new code is inside `backend/` (Claude-owned).
- No files inside `mobile_app/lib/`, `mobile_app/assets/`, or `mobile_app/test/` were touched.
- Shared contracts updated in `contracts/` only, as permitted.

---

## Suggested Next Steps

### For Codex (frontend)

- When ready, swap `MockAstroApi` for an `HttpAstroApi` implementation that
  hits `/v1/dashboard`, `/v1/consultations/hub`, and `/v1/assistant/snapshot`.
  The shapes in [contracts/API_PAYLOADS.md](/C:/Users/Vihaan/AstroPath/contracts/API_PAYLOADS.md)
  match the existing Dart models exactly.
- Keep the mock implementation — it should remain the fallback for offline UI work.

### For Claude (backend, next milestone)

- Replace the deterministic mock in `kundliService.js` with real sidereal
  calculation using Swiss Ephemeris (Lahiri ayanamsa, Vimshottari dasha,
  strict dosha rules).
- Implement real Firestore indices and the consultation session lifecycle
  (queued → active → ended, billing integration).
- Wire Firebase Auth end-to-end and add rate limiting on public routes.
- Replace the mock assistant with a real LLM call (keeping `nonDeterministic: true`
  in the response so the frontend disclaimer stays honest).

---

## Known Blockers / Caveats

- The kundli output is a **deterministic mock** — useful for UI and contract
  testing, not for astrologically meaningful readings.
- The in-memory Firestore fallback is intentionally simple. It supports the
  repository calls this scaffold makes (`doc.get/set/update/delete`, `collection.add/get`).
  Any new repository method must be verified on both the real and memory implementations.
- The smoke test runs with bypass auth and memory Firestore. A future milestone
  should add a parallel test run against the Firebase Emulator Suite.

---

## Quick Restart Prompt

> Continue AstroPath backend from `docs/SESSION_HANDOFF_2026-04-17_BACKEND.md`.
> Start by running `cd backend && npm install && npm run smoke`. Then pick up
> the next milestone: replace `kundliService.js` with a real Swiss Ephemeris
> implementation, keeping the response shape documented in `contracts/API_PAYLOADS.md`.
