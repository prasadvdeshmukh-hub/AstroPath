# AstroPath Mobile App

This folder contains the frontend-only mobile app scaffold for AstroPath.

## Ownership

- Codex owns this folder for UI/UX development
- Claude should integrate backend connectivity through shared contracts instead of editing presentation files directly

## Included

- Flutter app structure
- Cosmic dark theme starter
- Multi-step onboarding flow with language selection and personalization
- Mobile dashboard shell
- Real Kundli entry screen with birth details and preview state
- Mock API layer for frontend progress without backend dependency
- Placeholder screens for Consult and AI Assistant flows
- Starter localization support for app-wide language switching

## Next Local Steps

When the Flutter toolchain is available locally, complete the native shell setup from this folder:

```powershell
cd C:\Users\Vihaan\AstroPath\mobile_app
flutter create --platforms=android,ios .
flutter pub get
flutter run
```

## Frontend Rule

Use `lib/core/network/astro_api.dart` for data contracts and swap the mock implementation later, instead of calling backend code directly from widgets.
