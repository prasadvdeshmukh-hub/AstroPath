import 'package:flutter/material.dart';

class DashboardSnapshot {
  const DashboardSnapshot({
    required this.greeting,
    required this.sunSign,
    required this.horoscopeHeadline,
    required this.horoscopeBody,
    required this.moonPhase,
    required this.energyScore,
    required this.quickActions,
    required this.featuredAstrologers,
  });

  final String greeting;
  final String sunSign;
  final String horoscopeHeadline;
  final String horoscopeBody;
  final String moonPhase;
  final int energyScore;
  final List<QuickActionItem> quickActions;
  final List<FeaturedAstrologer> featuredAstrologers;
}

class QuickActionItem {
  const QuickActionItem({
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final IconData icon;
}

class FeaturedAstrologer {
  const FeaturedAstrologer({
    required this.name,
    required this.specialty,
    required this.ratePerMinute,
    required this.rating,
  });

  final String name;
  final String specialty;
  final int ratePerMinute;
  final double rating;
}
