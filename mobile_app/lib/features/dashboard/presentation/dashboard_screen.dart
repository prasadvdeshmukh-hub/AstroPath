import 'package:astropath_mobile/app/localization/app_strings.dart';
import 'package:astropath_mobile/app/theme/app_theme.dart';
import 'package:astropath_mobile/core/models/dashboard_snapshot.dart';
import 'package:astropath_mobile/core/network/astro_api.dart';
import 'package:astropath_mobile/features/dashboard/presentation/widgets/section_card.dart';
import 'package:astropath_mobile/features/shared/presentation/cosmic_backdrop.dart';
import 'package:flutter/material.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({
    super.key,
    required this.api,
    required this.locale,
  });

  final AstroApi api;
  final Locale locale;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<DashboardSnapshot> _snapshot;

  @override
  void initState() {
    super.initState();
    _snapshot = widget.api.fetchDashboard(widget.locale);
  }

  @override
  void didUpdateWidget(covariant DashboardScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.locale.languageCode != widget.locale.languageCode) {
      setState(() {
        _snapshot = widget.api.fetchDashboard(widget.locale);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final strings = AstroStrings(widget.locale);

    return CosmicBackdrop(
      child: SafeArea(
        child: FutureBuilder<DashboardSnapshot>(
          future: _snapshot,
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }

            final data = snapshot.data!;
            final actions = data.quickActions.take(4).toList();
            final guides = data.featuredAstrologers.take(2).toList();

            return ListView(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 120),
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(999),
                        color: Colors.white.withOpacity(0.08),
                        border: Border.all(color: Colors.white.withOpacity(0.08)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(
                            Icons.auto_awesome,
                            size: 16,
                            color: AstroPathTheme.starlight,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'ASTROPATH',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1.6,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    _CircleIconButton(
                      icon: Icons.notifications_none_rounded,
                      onPressed: () {},
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Text(
                  data.greeting,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                        height: 1.05,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  _todayLabel(context),
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Colors.white70,
                      ),
                ),
                const SizedBox(height: 22),
                SectionCard(
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFF102D52),
                      Color(0xFF2D1D53),
                      Color(0xFF101A30),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const _Eyebrow(label: "TODAY'S HOROSCOPE"),
                                const SizedBox(height: 12),
                                _OrbitChip(
                                  icon: Icons.travel_explore_rounded,
                                  label: data.sunSign,
                                ),
                                const SizedBox(height: 14),
                                Text(
                                  data.horoscopeHeadline,
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineSmall
                                      ?.copyWith(
                                        fontWeight: FontWeight.w800,
                                        height: 1.12,
                                      ),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  data.horoscopeBody,
                                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                        color: Colors.white.withOpacity(0.84),
                                        height: 1.48,
                                      ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          const CosmicHeroGlyph(size: 118),
                        ],
                      ),
                      const SizedBox(height: 18),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: const [
                          _OrbitChip(
                            icon: Icons.schedule_rounded,
                            label: 'Best window 7:10 PM',
                          ),
                          _OrbitChip(
                            icon: Icons.star_rate_rounded,
                            label: 'Alignment strong',
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Expanded(
                      child: _MiniInsightCard(
                        icon: Icons.bolt_rounded,
                        title: 'Energy Score',
                        value: '${data.energyScore}',
                        body: 'Strong momentum for focused work and bold decisions.',
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: _MiniInsightCard(
                        icon: Icons.dark_mode_rounded,
                        title: strings.moonPhaseLabel,
                        value: data.moonPhase,
                        body: strings.moonPhaseBody,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 22),
                Text(
                  strings.quickActions,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 14),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: actions.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 14,
                    crossAxisSpacing: 14,
                    childAspectRatio: 0.94,
                  ),
                  itemBuilder: (context, index) {
                    return _QuickActionTile(action: actions[index]);
                  },
                ),
                const SizedBox(height: 22),
                SectionCard(
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFF36254E),
                      Color(0xFF162840),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              strings.premiumLabel,
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.w800,
                                  ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              strings.premiumBody,
                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                    color: Colors.white.withOpacity(0.82),
                                    height: 1.42,
                                  ),
                            ),
                            const SizedBox(height: 16),
                            FilledButton(
                              onPressed: () {},
                              child: Text(strings.explorePlans),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14),
                      Container(
                        width: 78,
                        height: 78,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withOpacity(0.16)),
                          gradient: RadialGradient(
                            colors: [
                              AstroPathTheme.starlight.withOpacity(0.28),
                              Colors.transparent,
                            ],
                          ),
                        ),
                        child: const Icon(
                          Icons.workspace_premium_rounded,
                          color: AstroPathTheme.starlight,
                          size: 34,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 22),
                Text(
                  strings.topAstrologers,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: guides
                      .map(
                        (guide) => Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(
                              right: guide == guides.first && guides.length > 1 ? 12 : 0,
                            ),
                            child: _GuideCard(astrologer: guide),
                          ),
                        ),
                      )
                      .toList(),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  String _todayLabel(BuildContext context) {
    final localizations = MaterialLocalizations.of(context);
    return localizations.formatMediumDate(DateTime.now());
  }
}

class _Eyebrow extends StatelessWidget {
  const _Eyebrow({
    required this.label,
  });

  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: Theme.of(context).textTheme.labelMedium?.copyWith(
            color: AstroPathTheme.starlight,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.4,
          ),
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({
    required this.icon,
    required this.onPressed,
  });

  final IconData icon;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white.withOpacity(0.08),
      shape: const CircleBorder(),
      child: IconButton(
        onPressed: onPressed,
        icon: Icon(icon, color: Colors.white),
      ),
    );
  }
}

class _OrbitChip extends StatelessWidget {
  const _OrbitChip({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: Colors.white.withOpacity(0.09),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AstroPathTheme.starlight),
          const SizedBox(width: 8),
          Text(
            label,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ),
    );
  }
}

class _MiniInsightCard extends StatelessWidget {
  const _MiniInsightCard({
    required this.icon,
    required this.title,
    required this.value,
    required this.body,
  });

  final IconData icon;
  final String title;
  final String value;
  final String body;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              color: AstroPathTheme.starlight.withOpacity(0.12),
            ),
            child: Icon(icon, color: AstroPathTheme.starlight),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  height: 1.05,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white70,
                  height: 1.38,
                ),
          ),
        ],
      ),
    );
  }
}

class _QuickActionTile extends StatelessWidget {
  const _QuickActionTile({
    required this.action,
  });

  final QuickActionItem action;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: Colors.white.withOpacity(0.08),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Icon(action.icon, color: AstroPathTheme.starlight),
          ),
          const Spacer(),
          Text(
            action.title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  height: 1.18,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            action.subtitle,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white70,
                  height: 1.38,
                ),
          ),
        ],
      ),
    );
  }
}

class _GuideCard extends StatelessWidget {
  const _GuideCard({
    required this.astrologer,
  });

  final FeaturedAstrologer astrologer;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFF63419B),
                      Color(0xFF1A2741),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: const Icon(
                  Icons.person_rounded,
                  color: Colors.white,
                ),
              ),
              const Spacer(),
              Text(
                '${astrologer.rating.toStringAsFixed(1)}',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: AstroPathTheme.starlight,
                      fontWeight: FontWeight.w800,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            astrologer.name,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  height: 1.15,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            astrologer.specialty,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white70,
                  height: 1.34,
                ),
          ),
          const SizedBox(height: 16),
          Text(
            'Rs ${astrologer.ratePerMinute}/min',
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ),
    );
  }
}
