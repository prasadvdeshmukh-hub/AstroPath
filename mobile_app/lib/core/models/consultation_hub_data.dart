import 'package:flutter/material.dart';

enum ConsultationListingMode {
  chat,
  call,
  video,
}

class ConsultationHubData {
  const ConsultationHubData({
    required this.walletBalance,
    required this.walletBonus,
    required this.walletHeadline,
    required this.walletBody,
    required this.categories,
    required this.astrologers,
    required this.reviews,
  });

  final int walletBalance;
  final int walletBonus;
  final String walletHeadline;
  final String walletBody;
  final List<ConsultationCategory> categories;
  final List<AstrologerListing> astrologers;
  final List<ConsultationReview> reviews;
}

class ConsultationCategory {
  const ConsultationCategory({
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final IconData icon;
}

class AstrologerListing {
  const AstrologerListing({
    required this.id,
    required this.name,
    required this.specialty,
    required this.pricePerMinute,
    required this.rating,
    required this.experienceYears,
    required this.waitMinutes,
    required this.languages,
    required this.focusLine,
    required this.isOnline,
    required this.modes,
  });

  final String id;
  final String name;
  final String specialty;
  final int pricePerMinute;
  final double rating;
  final int experienceYears;
  final int waitMinutes;
  final List<String> languages;
  final String focusLine;
  final bool isOnline;
  final List<ConsultationListingMode> modes;
}

class ConsultationReview {
  const ConsultationReview({
    required this.author,
    required this.headline,
    required this.quote,
  });

  final String author;
  final String headline;
  final String quote;
}
