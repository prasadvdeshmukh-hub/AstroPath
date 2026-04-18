# Shared Contract Notes

This folder is the handoff layer between the mobile frontend and the backend.

## Initial Responsibility Split

- Codex defines UI-facing data needs and mock payload shapes
- Claude implements production APIs and keeps response shapes aligned with the agreed contract

## Suggested First API Surface

| Area | Suggested Endpoint | Purpose |
| --- | --- | --- |
| Dashboard | `GET /v1/dashboard` | Daily summary, horoscope, moon phase, quick actions |
| Kundli | `POST /v1/kundli/generate` | Generate kundli from birth details |
| Horoscope | `GET /v1/horoscope/daily` | Daily category insights |
| Panchang | `GET /v1/panchang/today` | Daily Panchang data |
| Muhurat | `POST /v1/muhurat/search` | Search auspicious timings |
| Compatibility | `POST /v1/compatibility/match` | Compare two profiles |
| Consultations | `POST /v1/consultations/session` | Create chat, call, or video session |
| AI Assistant | `POST /v1/assistant/query` | Personalized astrology Q&A |
| Preferences | `PATCH /v1/profile/preferences` | Save language and other user preferences |

## Contract Workflow

1. Update this folder when the app needs a new response shape.
2. Keep field names stable whenever possible.
3. Add example request and response payloads here before wiring production services.
4. Frontend should depend on interface abstractions, not raw endpoint URLs inside widgets.

See [API_PAYLOADS.md](API_PAYLOADS.md) for the complete request/response reference
covering every endpoint currently implemented in `backend/`.

## Language Preference Contract

- Persist the selected app language as a stable field such as `languageCode`
- Use standard locale-style values such as `en`, `hi`, and future variants when needed
- Backend-owned profile responses should return the user's saved language preference so the app can restore it at launch
