class AssistantSnapshot {
  const AssistantSnapshot({
    required this.welcomeTitle,
    required this.welcomeBody,
    required this.disclaimer,
    required this.suggestions,
    required this.starterMessages,
  });

  final String welcomeTitle;
  final String welcomeBody;
  final String disclaimer;
  final List<AssistantSuggestion> suggestions;
  final List<AssistantMessageSeed> starterMessages;
}

class AssistantSuggestion {
  const AssistantSuggestion({
    required this.label,
    required this.prompt,
  });

  final String label;
  final String prompt;
}

class AssistantMessageSeed {
  const AssistantMessageSeed({
    required this.text,
    required this.isUser,
  });

  final String text;
  final bool isUser;
}
