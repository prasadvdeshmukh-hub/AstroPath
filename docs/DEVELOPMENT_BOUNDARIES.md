# Development Boundaries

This document exists to prevent conflicts while two tools work on the same product.

## Ownership

- Codex owns mobile UI, UX, design systems, animations, navigation, frontend state, local mocks, and API client interfaces
- Claude owns backend services, authentication flows on the server, database schema implementation, payment server logic, consultation infrastructure, notifications, and production AI orchestration

## Codex-Owned Paths

- `mobile_app/lib/`
- `mobile_app/assets/`
- `mobile_app/test/`
- `mobile_app/README.md`

## Claude-Owned Paths

- Future `backend/` folder
- Future cloud functions or Node services
- Database migrations and schema execution files
- Production environment configuration
- Server-side payment and subscription logic

## Shared Paths

- `contracts/`
- `AstroPath_PRD.md`
- `docs/`

## Working Agreement

1. Codex builds UI against mock repositories and stable interfaces first.
2. Claude implements backend endpoints and response formats based on the shared contract.
3. Shared models should be discussed in `contracts/` before either side introduces breaking changes.
4. Frontend should avoid embedding backend business rules that belong on the server.
5. Backend should avoid changing user-facing copy, navigation, or visual interaction patterns without syncing on requirements.

## Integration Rule

When backend APIs are ready, frontend should replace mock implementations only inside adapter or repository layers, not inside presentation widgets. This keeps the UI stable while services evolve.
