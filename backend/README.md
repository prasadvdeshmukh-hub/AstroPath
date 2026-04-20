# AstroPath Backend

Node.js + Express + Firestore. Claude-owned per the project's split.

- Runtime: Node 18.17+
- Framework: Express 4
- Data store: Firestore (real) with an **in-memory Firestore fallback** so the
  frontend team can hit the API locally without any Firebase credentials.
- Auth: Firebase Auth ID tokens (real) with a **dev bypass mode** for local UI work.

---

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
npm run smoke      # end-to-end test against in-memory Firestore, no network
npm start          # starts the server on :8080
```

Health check:

```bash
curl http://localhost:8080/health
```

While `AUTH_MODE=bypass` and `FIRESTORE_MODE=memory` (the default `.env.example`)
the server needs no external services and every endpoint is callable by the
Flutter app immediately.

---

## Configuration

See `.env.example` for the full list. Key flags:

| Variable | Values | Purpose |
| --- | --- | --- |
| `PORT` | number | HTTP port. Default 8080. |
| `FIRESTORE_MODE` | `memory` \| `firestore` | In-memory mock vs real Firestore. |
| `AUTH_MODE` | `bypass` \| `firebase` | Dev bypass (synthetic user) vs Firebase ID-token verification. |
| `CORS_ORIGINS` | csv | Comma-separated allowed origins. `*` allows all. |
| `FIREBASE_PROJECT_ID` | string | Required when `FIRESTORE_MODE=firestore` or `AUTH_MODE=firebase`. |
| `FIREBASE_API_KEY` | string | Public web API key used by the login page for Firebase email/password auth. |
| `FIREBASE_AUTH_DOMAIN` | string | Optional Firebase auth domain exposed to the web client for future provider flows. |
| `FIREBASE_APP_ID` | string | Optional Firebase app id exposed to the web client. |
| `GOOGLE_APPLICATION_CREDENTIALS` | path | Service account JSON for firebase-admin. |

---

## Project Layout

```
backend/
  src/
    index.js                 # entry point
    app.js                   # express wiring
    config/
      env.js                 # .env loader
      firestore.js           # real + in-memory Firestore
    middleware/
      auth.js                # Firebase token or dev bypass
      error.js               # unified error envelope
      locale.js              # en/hi resolution
      logger.js              # JSON access log
      requestId.js           # x-request-id propagation
    data/                    # repository layer
      collections.js
      userRepository.js
      kundliRepository.js
      consultationRepository.js
    services/
      contentService.js      # localized mock content (mirrors frontend mock)
      kundliService.js       # deterministic mock kundli; real swisseph-based engine planned
    routes/
      health.js
      auth.js
      dashboard.js
      preferences.js
      kundli.js
      horoscope.js
      panchang.js
      muhurat.js
      compatibility.js
      consultations.js
      assistant.js
    utils/
      envelope.js
      errors.js
      validate.js
  test/
    smoke.js                 # end-to-end smoke test (no external deps)
  .env.example
  package.json
```

---

## Response Envelope

Every successful response:

```json
{ "data": { ... }, "meta": { "locale": "en" } }
```

Every error:

```json
{
  "error": { "code": "bad_request", "message": "...", "details": { ... } },
  "requestId": "uuid"
}
```

`requestId` is echoed from the `x-request-id` request header, or generated if missing.

---

## Endpoint Map

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness + firestore mode |
| GET | `/` | Service summary |
| POST | `/v1/auth/session` | Bootstrap user + profile |
| GET | `/v1/dashboard` | Greeting, horoscope, quick actions, featured astrologers |
| GET | `/v1/profile/preferences` | Read preferences |
| PATCH | `/v1/profile/preferences` | Update `languageCode`, `notificationsEnabled`, `consultationMode`, `focusArea` |
| POST | `/v1/kundli/generate` | Generate a kundli preview from birth details |
| GET | `/v1/horoscope/:range` | Daily / weekly / monthly / yearly horoscope |
| GET | `/v1/panchang/today` | Today's panchang |
| POST | `/v1/muhurat/search` | Auspicious windows for a purpose |
| POST | `/v1/compatibility/match` | Guna Milan + emotional + long-term compatibility |
| GET | `/v1/consultations/hub` | Consultation marketplace snapshot |
| POST | `/v1/consultations/session` | Queue a consultation session |
| GET | `/v1/assistant/snapshot` | Assistant welcome + suggestions |
| POST | `/v1/assistant/query` | Advisory assistant reply |

See `contracts/` for request/response payload examples.

---

## Localization

The server resolves locale from (in order): `?lang=xx`, `Accept-Language` header,
and finally `en`. Currently `en` and `hi` are honored; other codes fall through
to the default so we never ship partially-translated strings. Responses echo
the resolved locale in `meta.locale`.

---

## Testing

```bash
npm run smoke         # full end-to-end HTTP coverage of every endpoint
npm run smoke:logic   # logic-only suite (no express needed)
```

`npm run smoke` boots the Express app in-process against the in-memory
Firestore and calls every endpoint. It needs no network and no credentials —
but it does require `npm install` to have completed (so express + cors are
available locally). This is the canonical "does the scaffold work?" check.

`npm run smoke:logic` exercises the Firestore memory layer, repositories,
services, and validators with only Node built-ins. Useful when running in
environments without npm registry access.

---

## Boundary Reminder

Per `docs/DEVELOPMENT_BOUNDARIES.md`, this folder and shared contract files
are Claude-owned. Frontend components in `mobile_app/` should stay untouched
by backend work.
