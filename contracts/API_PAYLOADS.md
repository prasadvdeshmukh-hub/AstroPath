# AstroPath API Payload Reference

This document is the authoritative request/response reference for the backend
scaffold shipped on 2026-04-17. Every shape here matches the Express server in
`backend/` and the frontend mocks in `mobile_app/lib/core/network/mock_astro_api.dart`.

Rules:

- All successful responses use the envelope `{ "data": ... , "meta": { ... } }`.
- All error responses use `{ "error": { code, message }, "requestId": "..." }`.
- Locale can be passed as `?lang=en` / `?lang=hi` or via `Accept-Language`.
- All `/v1/**` endpoints (except `/v1/auth/session`) require auth. In development
  the backend can run in bypass mode, which treats every request as a synthetic
  dev user. In production, pass a Firebase ID token as `Authorization: Bearer <token>`.

---

## Auth

### POST `/v1/auth/session`

Ensures the caller has a profile document and returns the current user.

Request: empty body (bypass mode) or `Authorization: Bearer <firebase_id_token>`.

Response `200`:

```json
{
  "data": {
    "user": {
      "id": "dev-user-001",
      "email": "dev@astropath.local",
      "provider": "dev-bypass"
    },
    "profile": {
      "id": "dev-user-001",
      "userId": "dev-user-001",
      "preferences": {
        "languageCode": "en",
        "notificationsEnabled": true,
        "consultationMode": "chat",
        "focusArea": "balance"
      },
      "createdAt": "2026-04-17T00:00:00.000Z",
      "updatedAt": "2026-04-17T00:00:00.000Z"
    }
  }
}
```

---

## Dashboard

### GET `/v1/dashboard`

Matches `DashboardSnapshot` from the frontend.

Response `200`:

```json
{
  "data": {
    "greeting": "Good evening, seeker.",
    "sunSign": "Scorpio Rising",
    "horoscopeHeadline": "Cosmic timing is in your favor today.",
    "horoscopeBody": "Lead with clarity in work...",
    "moonPhase": "Waxing Gibbous",
    "energyScore": 82,
    "quickActions": [
      { "id": "generate-kundli", "title": "Generate Kundli", "subtitle": "...", "icon": "auto_awesome" }
    ],
    "featuredAstrologers": [
      { "id": "dev-mehta", "name": "Acharya Dev Mehta", "specialty": "...", "ratePerMinute": 25, "rating": 4.9 }
    ]
  },
  "meta": { "locale": "en", "userId": "dev-user-001" }
}
```

---

## Preferences

### GET `/v1/profile/preferences`

Response `200`:

```json
{
  "data": {
    "languageCode": "en",
    "notificationsEnabled": true,
    "consultationMode": "chat",
    "focusArea": "balance"
  }
}
```

### PATCH `/v1/profile/preferences`

Request body (any subset):

```json
{
  "languageCode": "hi",
  "notificationsEnabled": true,
  "consultationMode": "video",
  "focusArea": "career"
}
```

Validation:

- `languageCode` ∈ `{ "en", "hi" }`
- `notificationsEnabled` is boolean
- `consultationMode` ∈ `{ "chat", "call", "video" }`
- `focusArea` ∈ `{ "career", "love", "finance", "spiritual", "balance" }`

Response `200`: the full updated preferences object.

---

## Kundli

### POST `/v1/kundli/generate`

Request:

```json
{
  "name": "Prasad",
  "birthDate": "1992-05-17",
  "birthTime": "06:12",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "tzOffsetMinutes": 330
}
```

`tzOffsetMinutes` is the east-of-UTC offset at the place/time of birth
(e.g. IST = 330). Optional; defaults to 0. The backend performs the UT
conversion internally so `birthTime` can be expressed as local clock time.

Response `201`:

```json
{
  "data": {
    "id": "abc123...",
    "input": {
      "name": "Prasad", "birthDate": "1992-05-17", "birthTime": "06:12",
      "latitude": 18.5204, "longitude": 73.8567, "tzOffsetMinutes": 330
    },
    "ayanamsa": 23.7463,
    "lagna": {
      "sign": "Taurus", "degrees": 4.76, "siderealLong": 34.756,
      "navamsaSign": "Aquarius", "dasamsaSign": "Aquarius"
    },
    "moonSign": "Scorpio",
    "sunSign": "Taurus",
    "nakshatra": { "name": "Anuradha", "pada": 2, "lord": "Saturn" },
    "planetPositions": [
      {
        "planet": "Sun", "sign": "Taurus", "house": 1, "degrees": 2.63,
        "navamsaSign": "Capricorn", "dasamsaSign": "Capricorn"
      }
    ],
    "dasha": {
      "current": {
        "planet": "Saturn",
        "startedOn": "1992-05-17",
        "endsOn": "2006-03-19",
        "totalYears": 19,
        "balanceYears": 13.838,
        "antardashas": [
          {
            "planet": "Saturn", "startedOn": "1992-05-17",
            "endsOn": "1994-07-26", "totalYears": 2.191
          }
        ]
      },
      "upcoming": [
        {
          "planet": "Mercury", "endsOn": "2023-03-19", "totalYears": 17,
          "antardashas": [
            { "planet": "Mercury", "startedOn": "2006-03-19", "endsOn": "2008-08-16", "totalYears": 2.408 }
          ]
        }
      ],
      "currentAntardasha": {
        "planet": "Saturn", "startedOn": "1992-05-17",
        "endsOn": "1994-07-26", "totalYears": 2.191
      }
    },
    "doshas": {
      "manglik": false,
      "kaalSarp": false,
      "pitra": false,
      "explanations": {
        "manglik": "Mars is in house 11, outside the Manglik houses.",
        "kaalSarp": "Planets straddle the Rahu-Ketu axis; no Kaal Sarp.",
        "pitra": "No classical Pitra affliction detected."
      }
    },
    "summary": "Prasad, your rising sign is Taurus and the Moon sits in Scorpio in the Anuradha nakshatra (pada 2). Current Vimshottari mahadasha is Saturn (antardasha Saturn) until 2006-03-19.",
    "generatedAt": "2026-04-17T00:00:00.000Z",
    "engineVersion": "astropath-meeus-0.3.0",
    "engineAccuracy": "Meeus Sun/Moon (±0.05°) + JPL Keplerian Mars-Saturn (±0.3-0.5°). Lahiri ayanamsa, whole-sign houses, antardashas, D9/D10 divisional placements."
  }
}
```

**New in 0.3.0:**
- `lagna.navamsaSign`, `lagna.dasamsaSign` (Navamsa D9 and Dasamsa D10 placements for the ascendant).
- Each entry in `planetPositions[]` gains `navamsaSign` and `dasamsaSign`.
- `dasha.current.antardashas` — 9 Vimshottari sub-periods inside the birth mahadasha, clipped so the first antardasha starts at the birth moment.
- Each `dasha.upcoming[].antardashas` — full 9-antardasha timeline for every future mahadasha.
- `dasha.currentAntardasha` — convenience pointer to the first entry of `current.antardashas`.
- `engineVersion` bumped to `astropath-meeus-0.3.0`.

**Engine notes:**
- Sidereal longitudes use the Lahiri (Chitra Paksha) ayanamsa.
- Houses are whole-sign, counted from the Lagna rashi.
- Planetary positions are computed from Meeus' solar/lunar theory and JPL's
  1800-2050 orbit elements. Accuracy is sufficient for sign/nakshatra
  placement and whole-sign houses. For arcsecond precision (important for
  bhava-madhya or divisional charts) swap `geocentricLongitude` in
  `astronomy/planets.js` for a Swiss Ephemeris binding — the rest of the
  pipeline is ephemeris-agnostic.
- Dasha is Vimshottari; `current.balanceYears` carries the birth-dasha
  remainder so the frontend can show a progress bar.

---

## Horoscope

### GET `/v1/horoscope/:range`

`range` ∈ `{ daily, weekly, monthly, yearly }`. Also supported: `GET /v1/horoscope?range=daily`.

Response `200`:

```json
{
  "data": {
    "range": "daily",
    "asOf": "2026-04-17T00:00:00.000Z",
    "categories": [
      { "category": "love",    "headline": "Today's signal", "body": "...", "score": 76 },
      { "category": "career",  "headline": "Today's signal", "body": "...", "score": 81 },
      { "category": "finance", "headline": "Today's signal", "body": "...", "score": 69 },
      { "category": "health",  "headline": "Today's signal", "body": "...", "score": 88 }
    ]
  }
}
```

---

## Panchang

### GET `/v1/panchang/today`, GET `/v1/panchang?date=YYYY-MM-DD`

Real astronomically-computed panchang. Both endpoints accept optional `latitude`,
`longitude`, `tzOffsetMinutes` query params (defaults: Pune, IST). `/today` uses
the server's current date; the root path requires `date=YYYY-MM-DD`.

Response `200`:

```json
{
  "data": {
    "date": "2020-01-01",
    "vara": "Wednesday",
    "paksha": "Shukla",
    "tithi": "Shashthi",
    "tithiIndex": 5,
    "nakshatra": "Purva Bhadrapada",
    "yoga": "Vyatipata",
    "karana": "Taitila",
    "sunrise": "07:07",
    "sunset": "18:09",
    "moonrise": "11:11",
    "moonset": "22:55",
    "rahuKalam": { "start": "12:38", "end": "14:01" },
    "auspicious": "Inauspicious period; defer important actions."
  }
}
```

Notes:
- Tithi derived from (Moon − Sun) sidereal separation in 12° blocks. `paksha`
  = "Shukla" when `tithiIndex < 15`, otherwise "Krishna". Tithi index 29 =
  "Amavasya"; tithi index 14 in Shukla = "Purnima".
- Yoga = 27 equal divisions of (Sun + Moon) sidereal sum.
- Karana = half-tithi; fixed mapping (Kimstughna/Shakuni/Chatushpada/Naga) for
  the edges plus a 7-entry cycle (Bava..Vishti) for the interior 56 half-tithis.
- Sunrise/sunset use a Meeus-based solar hour-angle computation with standard
  atmospheric refraction (h₀ = −0.833°). Moonrise/moonset use a similar method
  with h₀ = +0.125°; `null` when the Moon doesn't rise that day.
- Rahu Kalam is 1/8 of daylight; slot per weekday follows the standard
  [Sun=8, Mon=2, Tue=7, Wed=5, Thu=6, Fri=4, Sat=3] mapping.

---

## Muhurat

### POST `/v1/muhurat/search`

Request:

```json
{
  "purpose": "marriage",
  "from": "2026-05-01",
  "to": "2026-05-08"
}
```

`purpose` ∈ `{ marriage, business, griha_pravesh, travel, naming }`.

Response `200`:

```json
{
  "data": {
    "purpose": "marriage",
    "from": "2026-05-01T00:00:00.000Z",
    "to": "2026-05-08T00:00:00.000Z",
    "windows": [
      { "date": "2026-05-02", "window": "09:40 - 11:10", "quality": "excellent", "note": "..." }
    ]
  }
}
```

---

## Compatibility

### POST `/v1/compatibility/match`

Request:

```json
{
  "personA": { "name": "Rhea",  "birthDate": "1994-02-10", "birthTime": "09:30" },
  "personB": { "name": "Arjun", "birthDate": "1992-11-21", "birthTime": "14:05" }
}
```

Response `200`:

```json
{
  "data": {
    "personA": { "name": "Rhea", "birthDate": "1994-02-10", "birthTime": "09:30" },
    "personB": { "name": "Arjun", "birthDate": "1992-11-21", "birthTime": "14:05" },
    "gunaMilan": {
      "total": 28,
      "outOf": 36,
      "breakdown": [
        { "category": "Varna", "score": 1, "outOf": 1 }
      ]
    },
    "emotional": { "score": 78, "summary": "..." },
    "longTerm":  { "score": 71, "summary": "..." }
  }
}
```

---

## Consultations

### GET `/v1/consultations/hub`

Mirrors `ConsultationHubData` from the frontend: wallet, categories, astrologers, reviews.

### POST `/v1/consultations/session`

Request:

```json
{ "astrologerId": "dev-mehta", "mode": "chat" }
```

`mode` ∈ `{ chat, call, video }`.

Response `201`:

```json
{
  "data": {
    "id": "gen-id",
    "astrologerId": "dev-mehta",
    "mode": "chat",
    "status": "queued",
    "estimatedWaitMinutes": 3,
    "joinUrl": "astropath://consultation/gen-id"
  }
}
```

---

## AI Assistant

### GET `/v1/assistant/snapshot`

Mirrors `AssistantSnapshot`: welcome, disclaimer, suggestions, starter messages.

### POST `/v1/assistant/query`

Request:

```json
{ "prompt": "What should I focus on this week?" }
```

Response `200`:

```json
{
  "data": {
    "prompt": "What should I focus on this week?",
    "reply": "This guidance is advisory...",
    "nonDeterministic": true,
    "suggestedActions": [
      { "id": "read-horoscope", "label": "Read today's full horoscope" }
    ]
  }
}
```

The `nonDeterministic: true` flag is intentional per the PRD — the frontend
should surface it so users understand the assistant gives advisory, not
deterministic, guidance.

---

## Transits

### GET `/v1/transits?date=YYYY-MM-DD[&natalLagna=&natalMoon=]`

Current planetary placements for a given date (computed at noon UT for a daily
snapshot), optionally relative to a user's natal chart.

Query params:
- `date` (required): `YYYY-MM-DD`.
- `natalLagna` (optional): sidereal longitude of the natal ascendant, 0 ≤ value < 360. When provided, every planet in the response carries `houseFromLagna` (1..12).
- `natalMoon` (optional): sidereal longitude of the natal Moon, same range. When provided, every planet carries `houseFromMoon` (1..12).

Response `200`:

```json
{
  "data": {
    "asOf": "2026-04-17T12:00:00.000Z",
    "date": "2026-04-17",
    "JD": 2461148,
    "ayanamsa": 24.2201,
    "planets": [
      {
        "planet": "Sun",
        "sign": "Aries",
        "siderealLong": 3.5421,
        "degreesInSign": 3.54,
        "nakshatra": { "name": "Ashwini", "pada": 1 },
        "houseFromLagna": 12,
        "houseFromMoon": 6
      }
    ]
  },
  "meta": { "locale": "en" }
}
```

Intended use: power the daily horoscope personalization loop on the dashboard
by passing the user's saved `natalLagna` + `natalMoon` from their kundli.
