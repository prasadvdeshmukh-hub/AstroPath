# AstroPath — Go-Live Release Notes

Version: **1.0.0**
Release date: **April 18, 2026**
Owner: Claude for Prasad / Vihaan

## 1. What ships in v1.0

A full-stack Vedic astrology experience: onboarding → kundli → dashboard → horoscope → panchang → consultation marketplace → AI assistant → settings. Wired to a Node + Express backend with an in-memory Firestore shim (drop-in Firestore replaceable) and a dev-bypass auth flow (swap to Firebase ID tokens for production).

### Front-end (HTML / CSS / vanilla JS, no build step)

- `index.html` — portal landing with embedded cosmic artwork.
- `login.html` — auth gateway; social + email handlers call `POST /v1/auth/session`.
- `ui/onboarding.html` — birth details + focus picker; generates the first kundli.
- `ui/dashboard.html` — greeting, horoscope headline, energy gauge, moon phase.
- `ui/kundli.html` — sign chart, Lagna / Moon / Sun, dasha preview.
- `ui/horoscope.html` — tabbed daily / weekly / monthly / yearly with category scores.
- `ui/panchang.html` — sunrise arc, 5-limb panchang, muhurat finder.
- `ui/consultation.html` — wallet, astrologer marketplace, booking flow.
- `ui/assistant.html` — conversational AI with intent-aware grounding.
- `ui/settings.html` — language, notifications, consultation mode, sign-out.
- `ui/guidelines.html` — terms, privacy, AI disclaimer, wellbeing, refunds.
- `ui/hub.html` — internal preview index.
- `ui/app.js` — shared client (`window.AstroPath`): typed API, state, auth guard, bottom-nav helpers, splash overlay.
- `ui/shared.css` — cosmic theme tokens and components reused across all pages.

### Back-end (`backend/`, Node ≥ 18.17)

Endpoints under `/v1`:

- `POST /v1/auth/session`
- `GET /v1/dashboard`
- `GET | PATCH /v1/profile/preferences`
- `POST /v1/kundli/generate`
- `GET /v1/horoscope/:range` (daily|weekly|monthly|yearly)
- `GET /v1/panchang/today`
- `POST /v1/muhurat/search`
- `POST /v1/compatibility/match`
- `GET /v1/consultations/hub`
- `POST /v1/consultations/session`
- `GET /v1/assistant/snapshot`
- `POST /v1/assistant/query`
- `POST /v1/assistant/reset`
- `GET /v1/transits`
- `GET /health`

Cross-cutting: request IDs, structured logging, `{ data, meta }` envelope, locale middleware (Accept-Language + `?lang=`), error handler with friendly codes.

## 2. Local run (memory mode)

```bash
cd backend
npm install                # one-time
PORT=8080 \
FIRESTORE_MODE=memory \
AUTH_MODE=bypass \
PUBLIC_UI_DIR=/absolute/path/to/AstroPath \
node src/index.js
```

Open `http://localhost:8080/` — it redirects to `/app/` (the cosmic UI). The API lives at `/v1/...` on the same origin, so no CORS headaches. Test memory persists for the life of the process.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | HTTP port |
| `NODE_ENV` | `development` | Log verbosity / error shape |
| `CORS_ORIGINS` | `*` | Comma-separated allow-list |
| `FIRESTORE_MODE` | `memory` | `memory` or `firestore` |
| `FIREBASE_PROJECT_ID` | — | Required when `FIRESTORE_MODE=firestore` |
| `GOOGLE_APPLICATION_CREDENTIALS` | — | Path to service-account JSON |
| `AUTH_MODE` | `bypass` | `bypass` for dev, `firebase` for prod |
| `DEV_USER_ID` / `DEV_USER_EMAIL` | `dev-user-001` / `dev@astropath.local` | Synthetic dev identity |
| `PUBLIC_UI_DIR` | — | Mount the UI at `/app/` |

## 3. Switching on Firebase + Firestore

1. `npm install firebase-admin` (already in `dependencies`).
2. Create a service account, download the JSON key.
3. Export:

   ```bash
   export AUTH_MODE=firebase
   export FIRESTORE_MODE=firestore
   export FIREBASE_PROJECT_ID=astropath-prod
   export GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/firebase-admin.json
   ```

4. On the client, exchange a Firebase ID token and set `localStorage.setItem('astropath.token', token)` — the shared client forwards it as `Authorization: Bearer <token>`.
5. Firestore collections used: `users`, `kundlis`, `consultations`. The in-memory shim mirrors the Firestore Admin surface we actually consume (`doc`, `get`, `set`, `update`, `add`, `collection`), so the repos work unchanged.

## 4. Local + server memory model

- **Client (`localStorage`)** — `astropath.token`, `astropath.user`, `astropath.profile`, `astropath.onboarding`, `astropath.locale`, `astropath.lastKundli`, `astropath.birthInfo`, `astropath.chat` (last 50 messages), `astropath.bootstrapped`. Clearing via Settings wipes everything.
- **Server (in-memory for dev)** — dev user profile, generated kundlis, booked consultations, assistant conversation memory (20 turns per user, bounded).
- **Server (Firestore for prod)** — same shape, persistent.

## 5. AI Assistant guardrails

The assistant (`backend/src/services/assistantService.js`) applies four guardrails before composing a reply:

1. **Self-harm** — replies with a warm decline and Indian helpline numbers (iCall, Vandrevala, 112). Critical severity.
2. **Medical** — declines diagnosis / medication questions; points to a doctor.
3. **Legal** — declines legal strategy; points to a qualified lawyer.
4. **Financial** — declines specific stock / crypto / trade tips; points to a SEBI-registered advisor and offers muhurat help instead.

Non-guardrail prompts are classified into one of eight intents (career, marriage, relationship, kundli, remedy, muhurat, travel, horoscope, general) and grounded with the user's latest kundli snapshot (Lagna, Moon sign, Sun sign). Responses localize to `en`, `hi`, `mr`. The server also maintains a per-user conversation memory (20 turns) and skips guardrail-flagged turns when echoing prior context, so sensitive phrases are never repeated back at the user.

## 6. Routing & page-break shell

`ui/app.js` exposes `window.AstroPath.guard(page)` with three tiers:

- `public` — accessible without auth (index, login, guidelines).
- `onboarding` — requires auth, allows onboarding.
- `app` — requires auth + completed onboarding.

While the guard is resolving, a cosmic splash overlay (pulsing orb + "Aligning the stars…") is rendered so there is no flash of unauthed content. Bottom-nav clicks trigger the same splash for a brief page-break effect. Active-nav is computed from the current pathname.

## 7. Smoke-test checklist (executed)

1. `GET /app/` → 200 (landing)
2. `GET /app/login.html` → 200
3. `POST /v1/auth/session` → dev user + default preferences
4. `POST /v1/kundli/generate` → kundli saved, Lagna / Moon / Sun returned
5. `GET /v1/dashboard` → greeting + energy score
6. `GET /v1/horoscope/{daily,weekly,monthly,yearly}` → 4 categories each
7. `GET /v1/panchang/today` → full panchang
8. `GET /v1/consultations/hub` → wallet + 3 astrologers
9. `GET /v1/assistant/snapshot` + `POST /v1/assistant/query` → grounded reply with chart line
10. `PATCH /v1/profile/preferences` → language / notifications / mode updates
11. `POST /v1/assistant/reset` → memory cleared

All guardrails (self-harm, medical, legal, financial) verified to fire and to NOT leak into subsequent replies.

## 8. Known limitations at go-live

- **Astronomy engine.** Positions use Meeus simplified theory + JPL low-precision Keplerian elements (±0.05° for Sun / Moon, ±0.3–0.5° for Mars–Saturn). For arcsecond precision, swap `geocentricLongitude` with a Swiss Ephemeris binding.
- **Geocoding.** Onboarding currently defaults to Pune (18.5204, 73.8567) for latitude / longitude. Integrate a geocoder (Google / OpenCage) in a follow-up sprint.
- **Compatibility match schema.** Accepts `personA` / `personB` on the backend; the UI entry point is not wired in v1.0 (reserved for v1.1).
- **AI assistant.** Rule-based deterministic reply engine. Swap `composeReply()` with an LLM call (Claude / GPT) in v1.1 — the route already plumbs prompt + history + kundli context.
- **Consultation sessions.** Booking is stubbed at the queued state; real chat / call / video integration (Agora / Twilio) is a v1.1 scope.
- **Locale of saved kundli.** Signs persist in the locale of the first generation. If the user switches to Hindi / Marathi later, surrounding copy localizes but sign names stay in the original language. Fix: regenerate kundli on locale change, or store canonical English keys + render localized at read time.

## 9. Day-1 operations

- **Logs.** Structured JSON on stdout. Pipe to your log aggregator of choice.
- **Metrics.** Start with `/health` uptime + HTTP error rate. Add assistant guardrail counters (they are already tagged with `guardrail=<id>`).
- **Support contacts.** `hello@astropath.app` (general) and `trust@astropath.app` (refunds, abuse, safety) — referenced in `ui/guidelines.html`.
- **Wellbeing escalation.** If a user triggers the self-harm guardrail more than twice in a session, flag the session for manual review; the helpline pointer has already been served.

## 10. Post-launch v1.1 backlog

1. Real LLM call for the assistant with a system prompt that enforces the same guardrails.
2. Swiss Ephemeris bindings for arcsecond-accurate positions.
3. Geocoder integration in onboarding.
4. Compatibility match UI surface.
5. Live consultation (chat + call + video) via Agora.
6. Push notifications for horoscope / transit alerts.
7. Wallet top-up flow with Razorpay.
8. Flutter mobile app parity (structure already mirrored under `mobile_app/lib/features/`).

## 11. Rollback plan

Everything in v1.0 is stateless except the kundli + consultation collections. To roll back:

1. Tag current main as `v1.0.0` before cutting the release branch.
2. Deploy previous release tag.
3. Firestore collections are additive — no schema migration, no data loss.
4. Communicate to users via the in-app `guidelines.html` banner if an extended outage is expected.

---

Shipped with the help of Claude. Non-deterministic. Advisory only. For real trouble — medical, legal, or personal — please talk to a human who can help.
