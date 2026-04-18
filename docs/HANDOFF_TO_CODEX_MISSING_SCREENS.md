# Handoff to Codex — Missing Screens Blocking `flutter run`

**Date:** 2026-04-17
**From:** Claude (backend)
**For:** Codex (Flutter frontend)
**Scope:** `mobile_app/lib/` (Codex-owned)

---

## The blocker

When the user runs:

```
cd C:\Users\Vihaan\AstroPath\mobile_app
flutter create .
flutter pub get
flutter run -d chrome
```

Flutter fails to compile with:

```
lib/features/shell/presentation/app_shell.dart:5:8: Error: Error when reading
'lib/features/assistant/presentation/assistant_screen.dart': The system cannot find the path specified

lib/features/shell/presentation/app_shell.dart:6:8: Error: Error when reading
'lib/features/consultation/presentation/consultation_marketplace_screen.dart': The system cannot find the path specified

lib/features/shell/presentation/app_shell.dart:49:7: Error: The method 'ConsultationMarketplaceScreen' isn't defined
lib/features/shell/presentation/app_shell.dart:54:7: Error: The method 'AssistantScreen' isn't defined
```

Your 2026-04-17 session handoff at `docs/SESSION_HANDOFF_2026-04-17.md` explicitly flagged these as "placeholder tabs still remaining for: Consultation marketplace, AI assistant." Time to build them properly.

---

## Files to create

1. `mobile_app/lib/features/consultation/presentation/consultation_marketplace_screen.dart`
2. `mobile_app/lib/features/assistant/presentation/assistant_screen.dart`

---

## Constructor signatures `app_shell.dart` expects

Exact match required — the shell passes these args:

```dart
// consultation_marketplace_screen.dart
class ConsultationMarketplaceScreen extends StatefulWidget {
  const ConsultationMarketplaceScreen({
    super.key,
    required this.api,
    required this.locale,
    required this.preferencesController,
  });
  final MockAstroApi api;
  final Locale locale;
  final UserPreferencesController preferencesController;
  ...
}

// assistant_screen.dart
class AssistantScreen extends StatefulWidget {
  const AssistantScreen({
    super.key,
    required this.api,
    required this.locale,
    required this.preferencesController,
  });
  final MockAstroApi api;
  final Locale locale;
  final UserPreferencesController preferencesController;
  ...
}
```

Imports to use:

```dart
import 'package:astropath_mobile/app/state/user_preferences_controller.dart';
import 'package:astropath_mobile/core/network/mock_astro_api.dart';
import 'package:flutter/material.dart';
```

---

## Mock data already wired (reuse these — do not change shapes)

### `api.fetchConsultationHub(locale)` → `ConsultationHubData`

Located in `lib/core/models/consultation_hub_data.dart`. Contains:

- `walletBalance`, `walletBonus` (ints)
- `walletHeadline`, `walletBody` (localized strings)
- `categories: List<ConsultationCategory>` — 4 items with `title`, `subtitle`, `icon`
- `astrologers: List<AstrologerListing>` — 3 items with `id`, `name`, `specialty`, `pricePerMinute`, `rating`, `experienceYears`, `waitMinutes`, `languages`, `focusLine`, `isOnline`, `modes: List<ConsultationListingMode>` (chat/call/video)
- `reviews: List<ConsultationReview>` — 2 items with `author`, `headline`, `quote`

### `api.fetchAssistantSnapshot(locale)` → `AssistantSnapshot`

Located in `lib/core/models/assistant_snapshot.dart`. Contains:

- `welcomeTitle`, `welcomeBody`, `disclaimer` (localized strings)
- `suggestions: List<AssistantSuggestion>` — 4 items with `label`, `prompt`
- `starterMessages: List<AssistantMessageSeed>` — 2 items with `text`, `isUser`

---

## Design direction

Match `dashboard_screen.dart`:

- Cosmic dark gradient background (same `BoxDecoration` as `feature_placeholder_screen.dart`)
- `ListView` of `SectionCard` widgets from `lib/features/dashboard/presentation/widgets/section_card.dart`
- Hero header at top, section cards below
- Use the theme from `app_theme.dart` — do not introduce new colors
- Follow the loading/error pattern from `dashboard_screen.dart` (FutureBuilder against the mock API)

### Consultation Marketplace screen sections

1. Hero — `walletHeadline`, wallet balance + bonus pill, `walletBody`
2. Categories — 2x2 grid of `SectionCard` with `title`/`subtitle`/`icon`
3. Astrologers — list of cards, each showing name + rating, specialty, price per minute, experience, wait minutes, online/offline chip, mode chips (chat/call/video), focus line, and a primary "Book" button
4. Reviews — vertical list of 2 quote cards

### Assistant screen sections

1. Welcome panel — `welcomeTitle` in heading style, `welcomeBody` body copy
2. Disclaimer pill — `disclaimer` text in a muted pill
3. Suggestion chips — horizontal scroll of 4 chips; tap fills the prompt input
4. Starter message bubbles — the 2 starter messages rendered as assistant-side chat bubbles
5. Input row — text field + send button. On send, append user bubble + stub assistant reply (localized); real LLM call will come from the backend later

---

## Localized strings

Add to `lib/app/localization/app_strings.dart` in all three languages (en / hi / mr). The backend already supports Marathi, so the frontend should too.

Consultation strings:
- `consultWalletTitle`, `consultCategoriesTitle`, `consultAstrologersTitle`, `consultReviewsTitle`
- `consultBookCta`, `consultModeChat`, `consultModeCall`, `consultModeVideo`
- `consultOnline`, `consultOffline`

Assistant strings:
- `assistantSuggestionsHeading`, `assistantStarterHeading`
- `assistantInputPlaceholder`, `assistantSendCta`, `assistantStubReply`

---

## Side note: backend is live with 3-language API

When you are done with these screens and ready to move past the MockAstroApi, the backend is ready. All endpoints return `en` / `hi` / `mr` payloads with the same shapes the Dart models already expect. Contract reference: `contracts/API_PAYLOADS.md`. Run the backend locally with `cd backend && npm install && npm start` — it listens on `http://localhost:8080`.

Swapping `MockAstroApi` for an `HttpAstroApi` is a drop-in in `lib/core/network/`.

---

## Acceptance

- `cd mobile_app && flutter run -d chrome` compiles and launches
- All 5 bottom-nav tabs (Home, Kundli, Consult, AI, Settings) render without errors
- Language switch in Settings still works across the new screens
- No change to `app_shell.dart` constructor signatures
- No change to the mock API or data model shapes

---

## After your fix

Please update `docs/SESSION_HANDOFF_2026-04-17.md` (or write a new handoff) marking "Consultation marketplace" and "AI assistant" as completed, and note any new strings added to `app_strings.dart`.
