import 'package:astropath_mobile/app/localization/app_locale_controller.dart';
import 'package:astropath_mobile/app/localization/app_strings.dart';
import 'package:astropath_mobile/app/state/user_preferences_controller.dart';
import 'package:astropath_mobile/app/theme/app_theme.dart';
import 'package:astropath_mobile/features/dashboard/presentation/widgets/section_card.dart';
import 'package:astropath_mobile/features/shared/presentation/cosmic_backdrop.dart';
import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({
    super.key,
    required this.locale,
    required this.localeController,
    required this.preferencesController,
  });

  final Locale locale;
  final AppLocaleController localeController;
  final UserPreferencesController preferencesController;

  @override
  Widget build(BuildContext context) {
    final strings = AstroStrings(locale);

    return CosmicBackdrop(
      child: SafeArea(
        child: AnimatedBuilder(
          animation: preferencesController,
          builder: (context, _) {
            return ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
              children: [
                Text(
                  strings.settingsTitle,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 10),
                Text(
                  strings.settingsBody,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Colors.white70,
                        height: 1.45,
                      ),
                ),
                const SizedBox(height: 24),
                SectionCard(
                  gradient: AstroPathTheme.heroCardGradient,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        strings.languageSection,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        strings.languageHelp,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.white70,
                              height: 1.4,
                            ),
                      ),
                      const SizedBox(height: 18),
                      _LanguageTile(
                        label: strings.englishLabel,
                        selected: locale.languageCode == 'en',
                        onTap: () => localeController.updateLocale(const Locale('en')),
                      ),
                      const SizedBox(height: 12),
                      _LanguageTile(
                        label: strings.hindiLabel,
                        selected: locale.languageCode == 'hi',
                        onTap: () => localeController.updateLocale(const Locale('hi')),
                      ),
                      const SizedBox(height: 12),
                      _LanguageTile(
                        label: strings.marathiLabel,
                        selected: locale.languageCode == 'mr',
                        onTap: () => localeController.updateLocale(const Locale('mr')),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        '${strings.currentLanguage}: ${strings.labelForLanguageCode(locale.languageCode)}',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: const Color(0xFFE6C36A),
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                SectionCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        strings.personalizationSection,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        strings.personalizationBody,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.white70,
                              height: 1.4,
                            ),
                      ),
                      const SizedBox(height: 18),
                      Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        children: [
                          _FocusChip(
                            label: strings.focusCareer,
                            selected: preferencesController.selectedFocuses
                                .contains(GuidanceFocus.career),
                            onTap: () => preferencesController.toggleFocus(
                              GuidanceFocus.career,
                            ),
                          ),
                          _FocusChip(
                            label: strings.focusLove,
                            selected: preferencesController.selectedFocuses
                                .contains(GuidanceFocus.love),
                            onTap: () => preferencesController.toggleFocus(
                              GuidanceFocus.love,
                            ),
                          ),
                          _FocusChip(
                            label: strings.focusFinance,
                            selected: preferencesController.selectedFocuses
                                .contains(GuidanceFocus.finance),
                            onTap: () => preferencesController.toggleFocus(
                              GuidanceFocus.finance,
                            ),
                          ),
                          _FocusChip(
                            label: strings.focusSpiritual,
                            selected: preferencesController.selectedFocuses
                                .contains(GuidanceFocus.spiritual),
                            onTap: () => preferencesController.toggleFocus(
                              GuidanceFocus.spiritual,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                SectionCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        strings.experienceSection,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        strings.experienceBody,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.white70,
                              height: 1.4,
                            ),
                      ),
                      const SizedBox(height: 18),
                      _PreferenceSwitchTile(
                        label: strings.alertsDailyHoroscope,
                        value: preferencesController.dailyHoroscopeReminders,
                        onChanged: preferencesController.setDailyHoroscopeReminders,
                      ),
                      const SizedBox(height: 10),
                      _PreferenceSwitchTile(
                        label: strings.alertsAiCards,
                        value: preferencesController.aiInsightCards,
                        onChanged: preferencesController.setAiInsightCards,
                      ),
                      const SizedBox(height: 10),
                      _PreferenceSwitchTile(
                        label: strings.alertsRemedies,
                        value: preferencesController.remedySuggestions,
                        onChanged: preferencesController.setRemedySuggestions,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                SectionCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        strings.consultationSection,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        strings.consultationBody,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.white70,
                              height: 1.4,
                            ),
                      ),
                      const SizedBox(height: 18),
                      _PreferenceSwitchTile(
                        label: strings.alertsConsultation,
                        value: preferencesController.consultationAlerts,
                        onChanged: preferencesController.setConsultationAlerts,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        strings.preferredConsultMode,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        children: [
                          _ModeChip(
                            label: strings.consultChat,
                            selected: preferencesController.preferredConsultationMode ==
                                ConsultationMode.chat,
                            onTap: () => preferencesController.setPreferredConsultationMode(
                              ConsultationMode.chat,
                            ),
                          ),
                          _ModeChip(
                            label: strings.consultCall,
                            selected: preferencesController.preferredConsultationMode ==
                                ConsultationMode.call,
                            onTap: () => preferencesController.setPreferredConsultationMode(
                              ConsultationMode.call,
                            ),
                          ),
                          _ModeChip(
                            label: strings.consultVideo,
                            selected: preferencesController.preferredConsultationMode ==
                                ConsultationMode.video,
                            onTap: () => preferencesController.setPreferredConsultationMode(
                              ConsultationMode.video,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                SectionCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        strings.trustSection,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        strings.trustBody,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.white70,
                              height: 1.45,
                            ),
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _LanguageTile extends StatelessWidget {
  const _LanguageTile({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          color: selected
              ? const Color(0xFFE6C36A).withOpacity(0.14)
              : Colors.white.withOpacity(0.04),
          border: Border.all(
            color: selected ? const Color(0xFFE6C36A) : Colors.white.withOpacity(0.08),
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                label,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
              ),
            ),
            Icon(
              selected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: selected ? const Color(0xFFE6C36A) : Colors.white54,
            ),
          ],
        ),
      ),
    );
  }
}

class _PreferenceSwitchTile extends StatelessWidget {
  const _PreferenceSwitchTile({
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: Colors.white.withOpacity(0.04),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}

class _FocusChip extends StatelessWidget {
  const _FocusChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onTap(),
      selectedColor: const Color(0xFFE6C36A).withOpacity(0.18),
      backgroundColor: Colors.white.withOpacity(0.05),
      side: BorderSide(
        color: selected ? const Color(0xFFE6C36A) : Colors.white.withOpacity(0.1),
      ),
      labelStyle: TextStyle(
        color: selected ? Colors.white : Colors.white70,
        fontWeight: FontWeight.w600,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
    );
  }
}

class _ModeChip extends StatelessWidget {
  const _ModeChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onTap(),
      selectedColor: Theme.of(context).colorScheme.secondary.withOpacity(0.22),
      backgroundColor: Colors.white.withOpacity(0.04),
      side: BorderSide(
        color: selected
            ? Theme.of(context).colorScheme.secondary
            : Colors.white.withOpacity(0.08),
      ),
      labelStyle: TextStyle(
        color: selected ? Colors.white : Colors.white70,
        fontWeight: FontWeight.w600,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
    );
  }
}
