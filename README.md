# AstroPath

AstroPath is a mobile-only astrology product being developed as a split-ownership project:

- Codex owns mobile UI/UX development
- Claude owns backend development
- Shared API contracts live separately so both sides can work without conflicts

## Workspace Layout

- [AstroPath_PRD.md](/C:/Users/Vihaan/AstroPath/AstroPath_PRD.md): Product requirements document
- [docs/DEVELOPMENT_BOUNDARIES.md](/C:/Users/Vihaan/AstroPath/docs/DEVELOPMENT_BOUNDARIES.md): Ownership rules and collaboration boundaries
- [contracts/README.md](/C:/Users/Vihaan/AstroPath/contracts/README.md): Shared frontend/backend contract notes
- [contracts/API_PAYLOADS.md](/C:/Users/Vihaan/AstroPath/contracts/API_PAYLOADS.md): Full request/response payload reference
- [mobile_app/README.md](/C:/Users/Vihaan/AstroPath/mobile_app/README.md): Frontend mobile app scaffold
- [backend/README.md](/C:/Users/Vihaan/AstroPath/backend/README.md): Node.js + Express + Firestore backend

## Current Assumption

The mobile frontend is scaffolded in Flutter so Codex can move quickly on UI/UX while Claude develops the backend separately.

## Important Boundary

This workspace intentionally starts with frontend-first structure. Backend services, cloud functions, database migrations, and server-side integrations should be added in a separate backend-owned area after the shared contracts are agreed.
