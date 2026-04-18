import 'dart:math' as math;

import 'package:astropath_mobile/app/localization/app_strings.dart';
import 'package:astropath_mobile/app/theme/app_theme.dart';
import 'package:astropath_mobile/features/dashboard/presentation/widgets/section_card.dart';
import 'package:astropath_mobile/features/shared/presentation/cosmic_backdrop.dart';
import 'package:flutter/material.dart';

class KundliScreen extends StatefulWidget {
  const KundliScreen({
    super.key,
    required this.locale,
  });

  final Locale locale;

  @override
  State<KundliScreen> createState() => _KundliScreenState();
}

class _KundliScreenState extends State<KundliScreen> {
  late final TextEditingController _nameController;
  late final TextEditingController _placeController;

  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  _KundliPreview? _preview;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _placeController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _placeController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime(now.year - 24, now.month, now.day),
      firstDate: DateTime(1940),
      lastDate: DateTime(now.year),
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime ?? const TimeOfDay(hour: 7, minute: 30),
    );

    if (picked != null) {
      setState(() {
        _selectedTime = picked;
      });
    }
  }

  bool get _canGenerate =>
      _nameController.text.trim().isNotEmpty &&
      _placeController.text.trim().isNotEmpty &&
      _selectedDate != null &&
      _selectedTime != null;

  _KundliPreview get _activePreview =>
      _preview ??
      const _KundliPreview(
        lagna: 'Aries',
        moonSign: 'Scorpio',
        nakshatra: 'Anuradha',
        dasha: 'Venus Mahadasha',
        dosha: 'Manglik Watch',
        primaryPlanet: 'Sun',
        secondaryPlanet: 'Mars',
      );

  void _generatePreview() {
    if (!_canGenerate) {
      return;
    }

    final seed = _buildSeed();
    final lagnaOptions = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra'];
    final moonOptions = ['Scorpio', 'Pisces', 'Capricorn', 'Aquarius', 'Sagittarius'];
    final nakshatraOptions = ['Rohini', 'Ashwini', 'Magha', 'Anuradha', 'Shravana'];
    final dashaOptions = ['Venus Mahadasha', 'Moon Mahadasha', 'Jupiter Mahadasha'];
    final doshaOptions = ['Manglik Watch', 'Balanced Dosha Pattern', 'Mild Pitra Influence'];

    setState(() {
      _preview = _KundliPreview(
        lagna: lagnaOptions[seed % lagnaOptions.length],
        moonSign: moonOptions[(seed ~/ 2) % moonOptions.length],
        nakshatra: nakshatraOptions[(seed ~/ 3) % nakshatraOptions.length],
        dasha: dashaOptions[(seed ~/ 4) % dashaOptions.length],
        dosha: doshaOptions[(seed ~/ 5) % doshaOptions.length],
        primaryPlanet: ['Moon', 'Saturn', 'Venus', 'Jupiter'][seed % 4],
        secondaryPlanet: ['Mercury', 'Mars', 'Sun', 'Rahu'][(seed ~/ 2) % 4],
      );
    });
  }

  int _buildSeed() {
    final name = _nameController.text.trim();
    final place = _placeController.text.trim();
    final date = _selectedDate!;
    final time = _selectedTime!;
    final raw =
        '$name|$place|${date.year}${date.month}${date.day}|${time.hour}${time.minute}';

    return raw.codeUnits.fold<int>(0, (sum, unit) => sum + unit);
  }

  String _formatDate() {
    final date = _selectedDate;
    if (date == null) {
      return '';
    }

    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  String _formatTime() {
    final time = _selectedTime;
    if (time == null) {
      return '';
    }

    final hour = time.hourOfPeriod == 0 ? 12 : time.hourOfPeriod;
    final minute = time.minute.toString().padLeft(2, '0');
    final suffix = time.period == DayPeriod.am ? 'AM' : 'PM';
    return '$hour:$minute $suffix';
  }

  @override
  Widget build(BuildContext context) {
    final strings = AstroStrings(widget.locale);
    final preview = _activePreview;
    final placements = [
      _PlanetPlacement(
        title: '${preview.primaryPlanet} in ${preview.lagna}',
        body: 'Purpose, identity, and how you lead when the energy is high.',
      ),
      _PlanetPlacement(
        title: 'Moon in ${preview.nakshatra}',
        body: 'Emotional rhythm, intuition, and the patterns you return to.',
      ),
      _PlanetPlacement(
        title: '${preview.secondaryPlanet} in ${preview.moonSign}',
        body: 'Action timing, pressure points, and how to move with intention.',
      ),
    ];

    return CosmicBackdrop(
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 120),
          children: [
            const _ScreenBadge(label: 'KUNDLI ATLAS'),
            const SizedBox(height: 16),
            Text(
              strings.kundliEntryTitle,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    height: 1.06,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'A celestial view of your chart with key placements, strengths, and karmic patterns.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.white70,
                    height: 1.42,
                  ),
            ),
            const SizedBox(height: 22),
            SectionCard(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF152B4B),
                  Color(0xFF2A1C4A),
                  Color(0xFF0E1730),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    strings.kundliPreviewTitle,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    strings.kundliPreviewBody,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Colors.white.withOpacity(0.82),
                          height: 1.42,
                        ),
                  ),
                  const SizedBox(height: 20),
                  _KundliWheel(preview: preview),
                  const SizedBox(height: 20),
                  ...placements.map(
                    (placement) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _PlacementTile(placement: placement),
                    ),
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: _StatCard(
                          label: strings.nakshatraLabel,
                          value: preview.nakshatra,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _StatCard(
                          label: strings.doshaLabel,
                          value: preview.dosha,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            SectionCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    strings.birthDetailsSection,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    strings.kundliEntryBody,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white70,
                          height: 1.4,
                        ),
                  ),
                  const SizedBox(height: 18),
                  _FieldLabel(text: strings.fullNameLabel),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _nameController,
                    onChanged: (_) => setState(() {}),
                    style: const TextStyle(color: Colors.white),
                    decoration: _inputDecoration(strings.fullNameLabel),
                  ),
                  const SizedBox(height: 16),
                  _FieldLabel(text: strings.dateOfBirthLabel),
                  const SizedBox(height: 8),
                  _PickerField(
                    value: _formatDate(),
                    placeholder: strings.selectDate,
                    onTap: _pickDate,
                  ),
                  const SizedBox(height: 16),
                  _FieldLabel(text: strings.timeOfBirthLabel),
                  const SizedBox(height: 8),
                  _PickerField(
                    value: _formatTime(),
                    placeholder: strings.selectTime,
                    onTap: _pickTime,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    strings.unknownTimeHint,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.white54,
                        ),
                  ),
                  const SizedBox(height: 16),
                  _FieldLabel(text: strings.placeOfBirthLabel),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _placeController,
                    onChanged: (_) => setState(() {}),
                    style: const TextStyle(color: Colors.white),
                    decoration: _inputDecoration(strings.placeOfBirthLabel),
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _canGenerate ? _generatePreview : null,
                      child: Text(
                        _preview == null
                            ? strings.generateKundliPreview
                            : strings.updatePreview,
                      ),
                    ),
                  ),
                  if (!_canGenerate) ...[
                    const SizedBox(height: 10),
                    Text(
                      strings.incompleteBirthDetails,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.white54,
                          ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),
            SectionCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    strings.remediesSection,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    strings.demoRemedy,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Colors.white70,
                          height: 1.46,
                        ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {},
                          child: Text(strings.saveFamilyProfile),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: FilledButton(
                          onPressed: () {},
                          child: Text(strings.askAiAboutChart),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.white38),
      filled: true,
      fillColor: Colors.white.withOpacity(0.05),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(18),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(18),
        borderSide: const BorderSide(color: Color(0xFFE6C36A)),
      ),
    );
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

class _FieldLabel extends StatelessWidget {
  const _FieldLabel({
    required this.text,
  });

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
          ),
    );
  }
}

class _PickerField extends StatelessWidget {
  const _PickerField({
    required this.value,
    required this.placeholder,
    required this.onTap,
  });

  final String value;
  final String placeholder;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          color: Colors.white.withOpacity(0.05),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                value.isEmpty ? placeholder : value,
                style: TextStyle(
                  color: value.isEmpty ? Colors.white38 : Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const Icon(Icons.keyboard_arrow_down, color: Colors.white70),
          ],
        ),
      ),
    );
  }
}

class _KundliWheel extends StatelessWidget {
  const _KundliWheel({
    required this.preview,
  });

  final _KundliPreview preview;

  @override
  Widget build(BuildContext context) {
    final labels = <String>{
      'Sun',
      'Moon',
      'Mercury',
      'Venus',
      'Jupiter',
      'Saturn',
      preview.primaryPlanet,
      preview.secondaryPlanet,
    }.toList();

    const angles = <double>[
      -math.pi / 2,
      -math.pi / 5,
      math.pi / 14,
      math.pi / 2.9,
      math.pi / 1.65,
      math.pi * 0.92,
      math.pi * 1.25,
      math.pi * 1.62,
    ];

    return AspectRatio(
      aspectRatio: 1,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final size = constraints.biggest.shortestSide;
          final center = size / 2;
          final labelRadius = size * 0.34;

          return TweenAnimationBuilder<double>(
            tween: Tween(begin: 0.96, end: 1),
            duration: const Duration(milliseconds: 1100),
            curve: Curves.easeOutBack,
            builder: (context, scale, child) {
              return Transform.scale(scale: scale, child: child);
            },
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const RadialGradient(
                  colors: [
                    Color(0xFF20375E),
                    Color(0xFF1B2246),
                    Color(0xFF0B1226),
                  ],
                  stops: [0.1, 0.58, 1],
                ),
                border: Border.all(color: Colors.white.withOpacity(0.09)),
                boxShadow: [
                  BoxShadow(
                    color: AstroPathTheme.starlight.withOpacity(0.12),
                    blurRadius: 26,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Stack(
                children: [
                  Positioned.fill(
                    child: Padding(
                      padding: const EdgeInsets.all(22),
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.white.withOpacity(0.08),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Positioned.fill(
                    child: IgnorePointer(
                      child: Stack(
                        children: List.generate(12, (index) {
                          return Center(
                            child: Transform.rotate(
                              angle: math.pi / 6 * index,
                              child: Container(
                                width: 2,
                                height: size * 0.66,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      Colors.transparent,
                                      Colors.white.withOpacity(0.1),
                                      Colors.transparent,
                                    ],
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                  ),
                                ),
                              ),
                            ),
                          );
                        }),
                      ),
                    ),
                  ),
                  Positioned.fill(
                    child: Padding(
                      padding: const EdgeInsets.all(58),
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: AstroPathTheme.starlight.withOpacity(0.24),
                          ),
                        ),
                      ),
                    ),
                  ),
                  ...List.generate(labels.length, (index) {
                    final angle = angles[index % angles.length];
                    final dx = center + math.cos(angle) * labelRadius;
                    final dy = center + math.sin(angle) * labelRadius;
                    final highlight = labels[index] == preview.primaryPlanet ||
                        labels[index] == preview.secondaryPlanet;

                    return Positioned(
                      left: dx - 34,
                      top: dy - 12,
                      child: SizedBox(
                        width: 68,
                        child: Text(
                          labels[index],
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                color: highlight
                                    ? AstroPathTheme.starlight
                                    : Colors.white70,
                                fontWeight:
                                    highlight ? FontWeight.w800 : FontWeight.w600,
                              ),
                        ),
                      ),
                    );
                  }),
                  Center(
                    child: Container(
                      width: size * 0.34,
                      height: size * 0.34,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const RadialGradient(
                          colors: [
                            Color(0xFFFFEDB8),
                            AstroPathTheme.starlight,
                            Color(0xFF8A6533),
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AstroPathTheme.starlight.withOpacity(0.34),
                            blurRadius: 28,
                            spreadRadius: 4,
                          ),
                        ],
                      ),
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              preview.lagna,
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    color: AstroPathTheme.midnight,
                                    fontWeight: FontWeight.w800,
                                  ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              preview.nakshatra,
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                    color: AstroPathTheme.midnight,
                                    fontWeight: FontWeight.w700,
                                  ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _PlacementTile extends StatelessWidget {
  const _PlacementTile({
    required this.placement,
  });

  final _PlanetPlacement placement;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: Colors.white.withOpacity(0.05),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              color: AstroPathTheme.starlight.withOpacity(0.12),
            ),
            child: const Icon(
              Icons.auto_graph_rounded,
              color: AstroPathTheme.starlight,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  placement.title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  placement.body,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white70,
                        height: 1.35,
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

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: Colors.white.withOpacity(0.05),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
        ],
      ),
    );
  }
}

class _PlanetPlacement {
  const _PlanetPlacement({
    required this.title,
    required this.body,
  });

  final String title;
  final String body;
}

class _KundliPreview {
  const _KundliPreview({
    required this.lagna,
    required this.moonSign,
    required this.nakshatra,
    required this.dasha,
    required this.dosha,
    required this.primaryPlanet,
    required this.secondaryPlanet,
  });

  final String lagna;
  final String moonSign;
  final String nakshatra;
  final String dasha;
  final String dosha;
  final String primaryPlanet;
  final String secondaryPlanet;
}
