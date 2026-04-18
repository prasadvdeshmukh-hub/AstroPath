import 'package:flutter/foundation.dart';

enum GuidanceFocus {
  career,
  love,
  finance,
  spiritual,
}

enum ConsultationMode {
  chat,
  call,
  video,
}

class UserPreferencesController extends ChangeNotifier {
  bool hasCompletedOnboarding = true;

  final Set<GuidanceFocus> selectedFocuses = {
    GuidanceFocus.career,
    GuidanceFocus.spiritual,
  };

  bool dailyHoroscopeReminders = true;
  bool consultationAlerts = true;
  bool aiInsightCards = true;
  bool remedySuggestions = true;

  ConsultationMode preferredConsultationMode = ConsultationMode.chat;

  void setOnboardingComplete() {
    hasCompletedOnboarding = true;
    notifyListeners();
  }

  void toggleFocus(GuidanceFocus focus) {
    if (selectedFocuses.contains(focus)) {
      if (selectedFocuses.length == 1) {
        return;
      }
      selectedFocuses.remove(focus);
    } else {
      selectedFocuses.add(focus);
    }
    notifyListeners();
  }

  void setDailyHoroscopeReminders(bool value) {
    dailyHoroscopeReminders = value;
    notifyListeners();
  }

  void setConsultationAlerts(bool value) {
    consultationAlerts = value;
    notifyListeners();
  }

  void setAiInsightCards(bool value) {
    aiInsightCards = value;
    notifyListeners();
  }

  void setRemedySuggestions(bool value) {
    remedySuggestions = value;
    notifyListeners();
  }

  void setPreferredConsultationMode(ConsultationMode mode) {
    preferredConsultationMode = mode;
    notifyListeners();
  }
}
