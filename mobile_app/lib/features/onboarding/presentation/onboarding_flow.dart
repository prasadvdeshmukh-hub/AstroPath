import 'package:astropath_mobile/app/localization/app_locale_controller.dart';
import 'package:astropath_mobile/app/localization/app_strings.dart';
import 'package:astropath_mobile/app/state/user_preferences_controller.dart';
import 'package:astropath_mobile/features/dashboard/presentation/widgets/section_card.dart';
import 'package:astropath_mobile/features/shared/presentation/cosmic_backdrop.dart';
import 'package:flutter/material.dart';

class OnboardingFlow extends StatefulWidget {
  const OnboardingFlow({
    super.key,
    required this.locale,
    required this.localeController,
    required this.preferencesController,
    required this.onComplete,
  });

  final Locale locale;
  final AppLocaleController localeController;
  final UserPreferencesController preferencesController;
  final VoidCallback onComplete;

  @override
  State<OnboardingFlow> createState() => _OnboardingFlowState();
}

class _OnboardingFlowState extends State<OnboardingFlow> {
  late final PageController _pageController;
  int _pageIndex = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _goNext() {
    if (_pageIndex == 4) {
      widget.preferencesController.setOnboardingComplete();
      widget.onComplete();
      return;
    }

    _pageController.nextPage(
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeOutCubic,
    );
  }

  void _goBack() {
    if (_pageIndex == 0) {
      return;
    }

    _pageController.previousPage(
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeOutCubic,
    );
  }

  void _skipToEnd() {
    _pageController.animateToPage(
      4,
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    final strings = AstroStrings(widget.locale);

    return Scaffold(
      body: CosmicBackdrop(
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                child: Row(
                  children: [
                    Text(
                      strings.appTitle,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const Spacer(),
                    if (_pageIndex < 4)
                      TextButton(
                        onPressed: _skipToEnd,
                        child: Text(strings.skip),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: List.generate(
                    5,
                    (index) => Expanded(
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        margin: EdgeInsets.only(right: index == 4 ? 0 : 8),
                        height: 4,
                        decoration: BoxDecoration(
                          color: index <= _pageIndex
                              ? const Color(0xFFE6C36A)
                              : Colors.white.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: PageView(
                  controller: _pageController,
                  onPageChanged: (index) {
                    setState(() {
                      _pageIndex = index;
                    });
                  },
                  children: [
                    _WelcomeStep(strings: strings),
                    _FocusStep(
                      strings: strings,
                      preferencesController: widget.preferencesController,
                    ),
                    _LanguageStep(
                      strings: strings,
                      locale: widget.locale,
                      localeController: widget.localeController,
                    ),
                    _RhythmStep(
                      strings: strings,
                      preferencesController: widget.preferencesController,
                    ),
                    _ReadyStep(
                      strings: strings,
                      preferencesController: widget.preferencesController,
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
                child: Row(
                  children: [
                    if (_pageIndex > 0)
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _goBack,
                          child: Text(strings.back),
                        ),
                      )
                    else
                      const Spacer(),
                    const SizedBox(width: 14),
                    Expanded(
                      flex: 2,
                      child: FilledButton(
                        onPressed: _goNext,
                        child: Text(_pageIndex == 4 ? strings.finish : strings.next),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _WelcomeStep extends StatelessWidget {
  const _WelcomeStep({
    required this.strings,
  });

  final AstroStrings strings;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
      children: [
        const SizedBox(height: 8),
        Text(
          strings.onboardingWelcomeTitle,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.w800,
                height: 1.1,
              ),
        ),
        const SizedBox(height: 12),
        Text(
          strings.tagline,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: const Color(0xFFE6C36A),
                fontWeight: FontWeight.w700,
              ),
        ),
        const SizedBox(height: 12),
        Text(
          strings.onboardingWelcomeBody,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.white70,
                height: 1.5,
              ),
        ),
        const SizedBox(height: 24),
        _HeroPanel(strings: strings),
        const SizedBox(height: 18),
        _FeatureMiniCard(
          title: strings.onboardingCardKundliTitle,
          body: strings.onboardingCardKundliBody,
          icon: Icons.auto_graph,
        ),
        const SizedBox(height: 14),
        _FeatureMiniCard(
          title: strings.onboardingCardConsultTitle,
          body: strings.onboardingCardConsultBody,
          icon: Icons.support_agent,
        ),
        const SizedBox(height: 14),
        _FeatureMiniCard(
          title: strings.onboardingCardAiTitle,
          body: strings.onboardingCardAiBody,
          icon: Icons.auto_awesome,
        ),
      ],
    );
  }
}

class _FocusStep extends StatelessWidget {
  const _FocusStep({
    required this.strings,
    required this.preferencesController,
  });

  final AstroStrings strings;
  final UserPreferencesController preferencesController;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: preferencesController,
      builder: (context, _) {
        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          children: [
            Text(
              strings.onboardingFocusTitle,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 12),
            Text(
              strings.onboardingFocusBody,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.white70,
                    height: 1.5,
                  ),
            ),
            const SizedBox(height: 24),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _FocusChip(
                  label: strings.focusCareer,
                  selected:
                      preferencesController.selectedFocuses.contains(GuidanceFocus.career),
                  onTap: () => preferencesController.toggleFocus(GuidanceFocus.career),
                ),
                _FocusChip(
                  label: strings.focusLove,
                  selected:
                      preferencesController.selectedFocuses.contains(GuidanceFocus.love),
                  onTap: () => preferencesController.toggleFocus(GuidanceFocus.love),
                ),
                _FocusChip(
                  label: strings.focusFinance,
                  selected:
                      preferencesController.selectedFocuses.contains(GuidanceFocus.finance),
                  onTap: () => preferencesController.toggleFocus(GuidanceFocus.finance),
                ),
                _FocusChip(
                  label: strings.focusSpiritual,
                  selected: preferencesController.selectedFocuses
                      .contains(GuidanceFocus.spiritual),
                  onTap: () => preferencesController.toggleFocus(GuidanceFocus.spiritual),
                ),
              ],
            ),
            const SizedBox(height: 24),
            SectionCard(
              child: Text(
                preferencesController.selectedFocuses.length > 1
                    ? strings.onboardingStartBody
                    : strings.onboardingFocusBody,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.white70,
                      height: 1.45,
                    ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _LanguageStep extends StatelessWidget {
  const _LanguageStep({
    required this.strings,
    required this.locale,
    required this.localeController,
  });

  final AstroStrings strings;
  final Locale locale;
  final AppLocaleController localeController;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
      children: [
        Text(
          strings.onboardingLanguageTitle,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
        const SizedBox(height: 12),
        Text(
          strings.onboardingLanguageBody,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.white70,
                height: 1.5,
              ),
        ),
        const SizedBox(height: 24),
        _LocaleCard(
          label: strings.englishLabel,
          preview: 'Daily insights, consultations, and chart guidance.',
          selected: locale.languageCode == 'en',
          onTap: () => localeController.updateLocale(const Locale('en')),
        ),
        const SizedBox(height: 14),
        _LocaleCard(
          label: strings.hindiLabel,
          preview: 'दैनिक इनसाइट्स, परामर्श और कुंडली मार्गदर्शन।',
          selected: locale.languageCode == 'hi',
          onTap: () => localeController.updateLocale(const Locale('hi')),
        ),
        const SizedBox(height: 14),
        _LocaleCard(
          label: strings.marathiLabel,
          preview: 'दैनिक इनसाइट्स, सल्लामसलत आणि कुंडली मार्गदर्शन.',
          selected: locale.languageCode == 'mr',
          onTap: () => localeController.updateLocale(const Locale('mr')),
        ),
      ],
    );
  }
}

class _RhythmStep extends StatelessWidget {
  const _RhythmStep({
    required this.strings,
    required this.preferencesController,
  });

  final AstroStrings strings;
  final UserPreferencesController preferencesController;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: preferencesController,
      builder: (context, _) {
        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          children: [
            Text(
              strings.onboardingAlertsTitle,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 12),
            Text(
              strings.onboardingAlertsBody,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.white70,
                    height: 1.5,
                  ),
            ),
            const SizedBox(height: 24),
            SectionCard(
              child: Column(
                children: [
                  _PreferenceSwitchTile(
                    label: strings.alertsDailyHoroscope,
                    value: preferencesController.dailyHoroscopeReminders,
                    onChanged: preferencesController.setDailyHoroscopeReminders,
                  ),
                  const SizedBox(height: 10),
                  _PreferenceSwitchTile(
                    label: strings.alertsConsultation,
                    value: preferencesController.consultationAlerts,
                    onChanged: preferencesController.setConsultationAlerts,
                  ),
                  const SizedBox(height: 10),
                  _PreferenceSwitchTile(
                    label: strings.alertsAiCards,
                    value: preferencesController.aiInsightCards,
                    onChanged: preferencesController.setAiInsightCards,
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class _ReadyStep extends StatelessWidget {
  const _ReadyStep({
    required this.strings,
    required this.preferencesController,
  });

  final AstroStrings strings;
  final UserPreferencesController preferencesController;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: preferencesController,
      builder: (context, _) {
        final focusCount = preferencesController.selectedFocuses.length;

        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          children: [
            Text(
              strings.onboardingStartTitle,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 12),
            Text(
              strings.onboardingStartBody,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.white70,
                    height: 1.5,
                  ),
            ),
            const SizedBox(height: 24),
            SectionCard(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF162543),
                  Color(0xFF35235E),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    strings.currentLanguage,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    Localizations.localeOf(context).languageCode == 'hi'
                        ? strings.hindiLabel
                        : strings.englishLabel,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: const Color(0xFFE6C36A),
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 18),
                  Text(
                    strings.readySummary(focusCount),
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white70,
                        ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class _HeroPanel extends StatelessWidget {
  const _HeroPanel({
    required this.strings,
  });

  final AstroStrings strings;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.96, end: 1),
      duration: const Duration(milliseconds: 900),
      curve: Curves.easeOutBack,
      builder: (context, scale, child) {
        return Transform.scale(
          scale: scale,
          child: child,
        );
      },
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          gradient: const LinearGradient(
            colors: [
              Color(0xFF1B2A47),
              Color(0xFF29174A),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x221A6BFF),
              blurRadius: 34,
              offset: Offset(0, 14),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const CosmicHeroGlyph(size: 102),
            const SizedBox(height: 18),
            Text(
              strings.appTitle,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              strings.tagline,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Colors.white70,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeatureMiniCard extends StatelessWidget {
  const _FeatureMiniCard({
    required this.title,
    required this.body,
    required this.icon,
  });

  final String title;
  final String body;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: Theme.of(context).colorScheme.secondary.withOpacity(0.2),
            ),
            child: Icon(icon),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 6),
                Text(
                  body,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white70,
                        height: 1.45,
                      ),
                ),
              ],
            ),
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

class _LocaleCard extends StatelessWidget {
  const _LocaleCard({
    required this.label,
    required this.preview,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final String preview;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          color: selected
              ? const Color(0xFFE6C36A).withOpacity(0.12)
              : Theme.of(context).colorScheme.surface,
          border: Border.all(
            color: selected ? const Color(0xFFE6C36A) : Colors.white.withOpacity(0.08),
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    preview,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white70,
                          height: 1.4,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Icon(
              selected ? Icons.check_circle : Icons.circle_outlined,
              color: selected ? const Color(0xFFE6C36A) : Colors.white38,
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
