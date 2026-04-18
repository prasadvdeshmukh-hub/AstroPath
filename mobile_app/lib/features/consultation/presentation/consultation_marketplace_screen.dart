import 'package:astropath_mobile/app/state/user_preferences_controller.dart';
import 'package:astropath_mobile/app/theme/app_theme.dart';
import 'package:astropath_mobile/core/models/consultation_hub_data.dart';
import 'package:astropath_mobile/core/network/mock_astro_api.dart';
import 'package:astropath_mobile/features/dashboard/presentation/widgets/section_card.dart';
import 'package:astropath_mobile/features/shared/presentation/cosmic_backdrop.dart';
import 'package:flutter/material.dart';

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

  @override
  State<ConsultationMarketplaceScreen> createState() =>
      _ConsultationMarketplaceScreenState();
}

class _ConsultationMarketplaceScreenState
    extends State<ConsultationMarketplaceScreen> {
  late Future<ConsultationHubData> _snapshot;

  @override
  void initState() {
    super.initState();
    _snapshot = widget.api.fetchConsultationHub(widget.locale);
  }

  @override
  void didUpdateWidget(covariant ConsultationMarketplaceScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.locale.languageCode != widget.locale.languageCode) {
      setState(() {
        _snapshot = widget.api.fetchConsultationHub(widget.locale);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return CosmicBackdrop(
      child: SafeArea(
        child: AnimatedBuilder(
          animation: widget.preferencesController,
          builder: (context, _) {
            return FutureBuilder<ConsultationHubData>(
              future: _snapshot,
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }

                final data = snapshot.data!;
                final astrologers = _sortAstrologers(data.astrologers).take(2).toList();
                final review = data.reviews.first;
                final preferredMode = _preferredListingMode(
                  widget.preferencesController.preferredConsultationMode,
                );

                return ListView(
                  padding: const EdgeInsets.fromLTRB(20, 18, 20, 120),
                  children: [
                    const _ScreenBadge(label: 'ASTRO AI ADVISOR'),
                    const SizedBox(height: 16),
                    Text(
                      'Guidance from AI and experts',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                            height: 1.08,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Start with a calm reading, then move into a live session with the astrologer who matches your question.',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Colors.white70,
                            height: 1.42,
                          ),
                    ),
                    const SizedBox(height: 22),
                    SectionCard(
                      gradient: const LinearGradient(
                        colors: [
                          Color(0xFF152C4C),
                          Color(0xFF33224F),
                          Color(0xFF111A30),
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
                              Container(
                                width: 54,
                                height: 54,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: const RadialGradient(
                                    colors: [
                                      Color(0x33E6C36A),
                                      Colors.transparent,
                                    ],
                                  ),
                                  border: Border.all(
                                    color: Colors.white.withOpacity(0.12),
                                  ),
                                ),
                                child: const Icon(
                                  Icons.auto_awesome_rounded,
                                  color: AstroPathTheme.starlight,
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'AstroPath AI Reading',
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleLarge
                                          ?.copyWith(
                                            fontWeight: FontWeight.w800,
                                          ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      'Grounded, non-deterministic guidance designed to support your next step.',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                            color: Colors.white70,
                                            height: 1.38,
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          _ChatBubble(
                            alignment: Alignment.centerRight,
                            background: Colors.white.withOpacity(0.1),
                            text:
                                'What should I focus on this week for career growth and emotional balance?',
                          ),
                          const SizedBox(height: 12),
                          _ChatBubble(
                            alignment: Alignment.centerLeft,
                            background: AstroPathTheme.starlight.withOpacity(0.14),
                            text:
                                'Lead with structure at work, slow down reactive conversations, and use the late evening for reflection before making decisions.',
                          ),
                          const SizedBox(height: 18),
                          FilledButton(
                            onPressed: () {},
                            child: const Text('Start guided reading'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 22),
                    Text(
                      'Popular topics',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: data.categories
                          .map((category) => _TopicChip(label: category.title))
                          .toList(),
                    ),
                    const SizedBox(height: 22),
                    Text(
                      'Available astrologers',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 14),
                    ...astrologers.map(
                      (astrologer) => Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: _AdvisorCard(
                          astrologer: astrologer,
                          preferredMode: preferredMode,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    SectionCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            review.headline,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w800,
                                ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            review.quote,
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                  color: Colors.white70,
                                  height: 1.44,
                                ),
                          ),
                          const SizedBox(height: 14),
                          Text(
                            review.author,
                            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                  color: AstroPathTheme.starlight,
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            );
          },
        ),
      ),
    );
  }

  List<AstrologerListing> _sortAstrologers(List<AstrologerListing> astrologers) {
    final sorted = List<AstrologerListing>.of(astrologers);
    final preferredMode = _preferredListingMode(
      widget.preferencesController.preferredConsultationMode,
    );

    sorted.sort((a, b) {
      final aPreferred = a.modes.contains(preferredMode) ? 0 : 1;
      final bPreferred = b.modes.contains(preferredMode) ? 0 : 1;
      if (aPreferred != bPreferred) {
        return aPreferred.compareTo(bPreferred);
      }

      final aOnline = a.isOnline ? 0 : 1;
      final bOnline = b.isOnline ? 0 : 1;
      if (aOnline != bOnline) {
        return aOnline.compareTo(bOnline);
      }

      final waitComparison = a.waitMinutes.compareTo(b.waitMinutes);
      if (waitComparison != 0) {
        return waitComparison;
      }

      return b.rating.compareTo(a.rating);
    });

    return sorted;
  }

  ConsultationListingMode _preferredListingMode(ConsultationMode mode) {
    switch (mode) {
      case ConsultationMode.chat:
        return ConsultationListingMode.chat;
      case ConsultationMode.call:
        return ConsultationListingMode.call;
      case ConsultationMode.video:
        return ConsultationListingMode.video;
    }
  }
}

class _ScreenBadge extends StatelessWidget {
  const _ScreenBadge({
    required this.label,
  });

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: Colors.white.withOpacity(0.08),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: AstroPathTheme.starlight,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.4,
            ),
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({
    required this.alignment,
    required this.background,
    required this.text,
  });

  final Alignment alignment;
  final Color background;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 300),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          color: background,
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Text(
          text,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                height: 1.4,
              ),
        ),
      ),
    );
  }
}

class _TopicChip extends StatelessWidget {
  const _TopicChip({
    required this.label,
  });

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: Colors.white.withOpacity(0.06),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelLarge?.copyWith(
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class _AdvisorCard extends StatelessWidget {
  const _AdvisorCard({
    required this.astrologer,
    required this.preferredMode,
  });

  final AstrologerListing astrologer;
  final ConsultationListingMode preferredMode;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(22),
                      gradient: const LinearGradient(
                        colors: [
                          Color(0xFF50357D),
                          Color(0xFF1A2941),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      border: Border.all(color: Colors.white.withOpacity(0.1)),
                    ),
                    child: const Icon(
                      Icons.person_rounded,
                      color: Colors.white,
                      size: 34,
                    ),
                  ),
                  Positioned(
                    right: 4,
                    bottom: 4,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: astrologer.isOnline
                            ? Colors.greenAccent.shade400
                            : Colors.white38,
                        border: Border.all(color: AstroPathTheme.midnight, width: 2),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      astrologer.name,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      astrologer.specialty,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.white70,
                          ),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _MetaPill(
                          icon: Icons.star_rounded,
                          label: astrologer.rating.toStringAsFixed(1),
                        ),
                        _MetaPill(
                          icon: Icons.schedule_rounded,
                          label: '${astrologer.waitMinutes} min',
                        ),
                        _MetaPill(
                          icon: Icons.currency_rupee_rounded,
                          label: '${astrologer.pricePerMinute}/min',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            astrologer.focusLine,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Colors.white.withOpacity(0.82),
                  height: 1.42,
                ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: astrologer.modes
                .map(
                  (mode) => _ModeChip(
                    label: _modeLabel(mode),
                    selected: mode == preferredMode,
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {},
                  child: const Text('Preview'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton(
                  onPressed: () {},
                  child: Text(_ctaLabel(preferredMode)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _modeLabel(ConsultationListingMode mode) {
    switch (mode) {
      case ConsultationListingMode.chat:
        return 'Chat';
      case ConsultationListingMode.call:
        return 'Call';
      case ConsultationListingMode.video:
        return 'Video';
    }
  }

  String _ctaLabel(ConsultationListingMode mode) {
    switch (mode) {
      case ConsultationListingMode.chat:
        return 'Start chat';
      case ConsultationListingMode.call:
        return 'Book call';
      case ConsultationListingMode.video:
        return 'Book video';
    }
  }
}

class _MetaPill extends StatelessWidget {
  const _MetaPill({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: Colors.white.withOpacity(0.06),
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

class _ModeChip extends StatelessWidget {
  const _ModeChip({
    required this.label,
    required this.selected,
  });

  final String label;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: selected
            ? AstroPathTheme.starlight.withOpacity(0.14)
            : Colors.white.withOpacity(0.06),
        border: Border.all(
          color: selected
              ? AstroPathTheme.starlight.withOpacity(0.32)
              : Colors.white.withOpacity(0.08),
        ),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelLarge?.copyWith(
              color: selected ? Colors.white : Colors.white70,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}
