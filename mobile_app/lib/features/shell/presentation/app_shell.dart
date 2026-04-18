import 'package:astropath_mobile/app/localization/app_locale_controller.dart';
import 'package:astropath_mobile/app/state/user_preferences_controller.dart';
import 'package:astropath_mobile/app/theme/app_theme.dart';
import 'package:astropath_mobile/core/network/mock_astro_api.dart';
import 'package:astropath_mobile/features/consultation/presentation/consultation_marketplace_screen.dart';
import 'package:astropath_mobile/features/dashboard/presentation/dashboard_screen.dart';
import 'package:astropath_mobile/features/kundli/presentation/kundli_screen.dart';
import 'package:flutter/material.dart';

class AppShell extends StatefulWidget {
  const AppShell({
    super.key,
    required this.locale,
    required this.localeController,
    required this.preferencesController,
  });

  final Locale locale;
  final AppLocaleController localeController;
  final UserPreferencesController preferencesController;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _selectedIndex = 0;
  late final MockAstroApi _api;

  @override
  void initState() {
    super.initState();
    _api = MockAstroApi();
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      DashboardScreen(
        api: _api,
        locale: widget.locale,
      ),
      KundliScreen(
        locale: widget.locale,
      ),
      ConsultationMarketplaceScreen(
        api: _api,
        locale: widget.locale,
        preferencesController: widget.preferencesController,
      ),
    ];

    return Scaffold(
      extendBody: true,
      backgroundColor: AstroPathTheme.midnight,
      body: IndexedStack(
        index: _selectedIndex,
        children: pages,
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(12, 0, 12, 12),
        child: DecoratedBox(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(30),
            color: AstroPathTheme.deepSpace.withOpacity(0.9),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.32),
                blurRadius: 24,
                offset: const Offset(0, 14),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(30),
            child: NavigationBar(
              backgroundColor: Colors.transparent,
              height: 70,
              labelBehavior: NavigationDestinationLabelBehavior.alwaysHide,
              selectedIndex: _selectedIndex,
              onDestinationSelected: (index) {
                setState(() {
                  _selectedIndex = index;
                });
              },
              destinations: const [
                NavigationDestination(
                  icon: Icon(Icons.home_outlined),
                  selectedIcon: Icon(Icons.home_rounded),
                  label: 'Home',
                ),
                NavigationDestination(
                  icon: Icon(Icons.travel_explore_outlined),
                  selectedIcon: Icon(Icons.travel_explore_rounded),
                  label: 'Kundli',
                ),
                NavigationDestination(
                  icon: Icon(Icons.auto_awesome_outlined),
                  selectedIcon: Icon(Icons.auto_awesome_rounded),
                  label: 'Advisor',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
