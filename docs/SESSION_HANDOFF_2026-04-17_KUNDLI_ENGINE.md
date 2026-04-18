# AstroPath Backend Session Handoff - Kundli Engine

**Date:** 2026-04-17 (follow-on session)

**Project:** AstroPath backend

**Working model split:** unchanged — Codex owns mobile UI/UX, Claude owns backend.

---

## What Was Completed In This Session

Replaced the deterministic hash-based mock in `kundliService.js` with a real
astronomy pipeline. The response shape is unchanged from the previous scaffold
so the Flutter frontend needs no adjustments — `engineVersion` simply flips
from `mock-0.1.0` to `astropath-meeus-0.2.0`, and a new `engineAccuracy`
string documents the precision.

### New modules (all under [backend/src/services/astronomy/](/C:/Users/Vihaan/AstroPath/backend/src/services/astronomy/))

- [common.js](/C:/Users/Vihaan/AstroPath/backend/src/services/astronomy/common.js) — degree/radian math, Julian centuries, DMS formatting
- [julianDate.js](/C:/Users/Vihaan/AstroPath/backend/src/services/astronomy/julianDate.js) — Meeus Julian Date + timezone handling
- [ayanamsa.js](/C:/Users/Vihaan/AstroPath/backend/src/services/astronomy/ayanamsa.js) — Lahiri ayanamsa (J2000 baseline + IAU-2006 drift), mean obliquity, tropical→sidereal shift
- [sunMoon.js](/C:/Users/Vihaan/AstroPath/backend/src/services/astronomy/sunMoon.js) — Sun (Meeus Ch 25, ±0.01°) and Moon (Meeus Ch 47 simplified, ±0.5°) longitudes
- [planets.js](/C:/Users/Vihaan/AstroPath/backend/src/services/astronomy/planets.js) — Mercury/Venus/Mars/Jupiter/Saturn via JPL 1800-2050 Keplerian elements + `atan2` geocentric shift
- [nodes.js](/C:/Users/Vihaan/AstroPath/backend/src/services/astronomy/nodes.js) — mean Rahu (Meeus Ch 47), Ketu = Rahu + 180°
- [lagna.js](/C:/Users/Vihaan/AstroPath/backend/src/services/astronomy/lagna.js) — Greenwich mean sidereal time + tropical ascendant
- [rashi.js](/C:/Users/Vihaan/AstroPath/backend/src/services/astronomy/rashi.js) — sign lookup, whole-sign house from Lagna
- [nakshatra.js](/C:/Users/Vihaan/AstroPath/backend/src/services/astronomy/nakshatra.js) — 27 nakshatras + padas + Vimshottari lord mapping
- [dasha.js](/C:/Users/Vihaan/AstroPath/backend/src/services/astronomy/dasha.js) — Vimshottari mahadasha timeline with birth-balance
- [doshas.js](/C:/Users/Vihaan/AstroPath/backend/src/services/astronomy/doshas.js) — Manglik, Kaal Sarp, Pitra detection with explanation strings

### Service rewrite

- [kundliService.js](/C:/Users/Vihaan/AstroPath/backend/src/services/kundliService.js) — orchestrates the full pipeline, returns the same response shape as before plus `ayanamsa`, `nakshatra.lord`, `doshas.explanations`, and `engineAccuracy`.

### Route update

- [routes/kundli.js](/C:/Users/Vihaan/AstroPath/backend/src/routes/kundli.js) now accepts optional `tzOffsetMinutes` (east-of-UTC, default 0). Validation range: `-840..840`.

### Contracts

- [contracts/API_PAYLOADS.md](/C:/Users/Vihaan/AstroPath/contracts/API_PAYLOADS.md) updated with the new request/response shape, including `ayanamsa`, `dasha.current.balanceYears`, `doshas.explanations`, and `engineAccuracy`.

### Tests

- New reference-position suite in [test/astronomy.js](/C:/Users/Vihaan/AstroPath/backend/test/astronomy.js). 21 tests covering Julian Date, Lahiri ayanamsa, obliquity, Sun & Moon at equinox/solstice/arbitrary, Mars/Jupiter/Saturn at J2000 (JPL Horizons references), node axis, GMST, ascendant, nakshatra lookup, Vimshottari 120-year invariant, and end-to-end kundliService output.
- New script: `npm run smoke:astronomy`.

### Test results

```
astronomy  21/21 passed
logic      12/12 passed
```

The HTTP smoke test (`npm run smoke`) still requires `npm install` for express/cors.

---

## Accuracy

| Component | Method | Target accuracy |
| --- | --- | --- |
| Julian Date | Meeus exact algorithm | machine precision |
| Lahiri ayanamsa | J2000 baseline + linear precession | ±0.01° over ±100 years |
| Obliquity of ecliptic | IAU 2006 mean obliquity series | ≤0.001° |
| Sun longitude | Meeus Ch 25 | ±0.01° |
| Moon longitude | Meeus Ch 47 main terms (top ~30) | ±0.5° |
| Mars/Jupiter/Saturn/Mercury/Venus | JPL 1800-2050 Keplerian elements | ±0.3-0.5° |
| Rahu/Ketu | Mean ascending node (Meeus) | ~1′ |
| Lagna | GMST + ecliptic east-point | driven by input precision |
| Whole-sign houses | Rashi-from-Lagna arithmetic | exact |
| Vimshottari dasha | Nakshatra lord + balance + 9-planet cycle | exact modulo epoch |

These accuracies are well inside rashi boundaries (30°) and nakshatra
boundaries (13°20′), which is what the kundli classifies on. For
arcsecond-level output (divisional charts, bhava-madhya), swap
`geocentricLongitude` in `astronomy/planets.js` for a Swiss Ephemeris binding.
The rest of the pipeline is ephemeris-agnostic.

---

## Sample output (Prasad, 1992-05-17 06:12 IST, Pune)

```
Lagna: Taurus 4°46′
Moon:  Scorpio, Anuradha nakshatra pada 2 (lord Saturn)
Sun:   Taurus, house 1
Dasha: Saturn mahadasha 1992-05-17 → 2006-03-19 (balance 13.84y of 19y)
         then Mercury, Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter
Doshas: none (Mars in 11th, planets straddle Rahu-Ketu axis)
```

---

## Known Caveats

- Mercury and Venus are computed with the same JPL Keplerian approach. Near
  inferior conjunction, the geocentric longitude can swing quickly and the
  ±0.5° tolerance may occasionally miss a nakshatra boundary. The swisseph
  upgrade removes this.
- Manglik rule used is the widely-taught "Mars in 1, 2, 4, 7, 8, 12 from
  Lagna". Some lineages use additional references from Moon and Venus. Easy
  to add without changing the contract.
- Kaal Sarp is strict: all 7 planets must be on one side of the Rahu-Ketu
  axis, no planet *on* the axis. We do not currently classify the 12 named
  variants (Anant, Kulik, etc.) — future enhancement.
- Pitra is simplified: Sun within 10° of Rahu/Saturn OR 9th-house stack.
  Classical sources include more affliction patterns.

---

## How To Run

```bash
cd backend
npm run smoke:astronomy    # 21 astronomy reference tests
npm run smoke:logic        # 12 service/repository tests
npm run smoke              # full HTTP coverage (needs npm install)
npm start                  # server on :8080
```

---

## Boundary Compliance

- All new code is inside `backend/src/services/astronomy/`, `backend/src/services/kundliService.js`, `backend/src/routes/kundli.js`, and `backend/test/`.
- Shared contract changes live in `contracts/API_PAYLOADS.md`.
- No file in `mobile_app/` was touched.

---

## Suggested Next Milestones

1. **Swiss Ephemeris plug-in** — add `swisseph` as an optional dependency; if present, route `geocentricLongitude` / `moonLongitude` / `sunLongitude` through it. Bump `engineVersion` to `astropath-swisseph-0.3.0`.
2. **Antardashas (sub-periods)** — extend `dasha.js` to produce antardasha timelines inside each mahadasha. Contract field `dasha.current.antardashas`.
3. **Divisional charts (Navamsa D9, D10)** — compute standard divisional charts. Add `navamsa` and `dasamsa` blocks to the response.
4. **Transits endpoint** — `GET /v1/transits?date=...` returning current planet placements for the signed-in user's lagna and moon, which powers daily horoscope personalization.
5. **Panchang upgrade** — replace today's mock in `routes/panchang.js` with real tithi/nakshatra/yoga/karana computation from the same astronomy core.
