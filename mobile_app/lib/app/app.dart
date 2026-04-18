import 'package:astropath_mobile/app/localization/app_locale_controller.dart';
import 'package:astropath_mobile/app/state/user_preferences_controller.dart';
import 'package:astropath_mobile/app/theme/app_theme.dart';
import 'package:astropath_mobile/features/onboarding/presentation/onboarding_flow.dart';
import 'package:astropath_mobile/features/shell/presentation/app_shell.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

class AstroPathApp extends StatefulWidget {
  const AstroPathApp({super.key});

  @override
  State<AstroPathApp> createState() => _AstroPathAppState();
}

class _AstroPathAppState extends State<AstroPathApp> {
  late final AppLocaleController _localeController;
  late final UserPreferencesController _preferencesController;

  @override
  void initState() {
    super.initState();
    _localeController = AppLocaleController();
    _preferencesController = UserPreferencesController();
  }

  @override
  void dispose() {
    _localeController.dispose();
    _preferencesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<Locale>(
      valueListenable: _localeController,
      builder: (context, locale, _) {
        return MaterialApp(
          title: 'AstroPath',
          debugShowCheckedModeBanner: false,
          theme: AstroPathTheme.dark(),
          locale: locale,
          supportedLocales: AppLocaleController.supportedLocales,
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          home: AnimatedBuilder(
            animation: _preferencesController,
            builder: (context, _) {
              if (!_preferencesController.hasCompletedOnboarding) {
                return OnboardingFlow(
                  locale: locale,
                  localeController: _localeController,
                  preferencesController: _preferencesController,
                  onComplete: () {
                    setState(() {});
                  },
                );
              }

              return AppShell(
                locale: locale,
                localeController: _localeController,
                preferencesController: _preferencesController,
              );
            },
          ),
        );
      },
    );
  }
}
