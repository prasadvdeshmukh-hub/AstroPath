import 'package:astropath_mobile/app/localization/app_strings.dart';
import 'package:astropath_mobile/app/state/user_preferences_controller.dart';
import 'package:astropath_mobile/app/theme/app_theme.dart';
import 'package:astropath_mobile/core/models/assistant_snapshot.dart';
import 'package:astropath_mobile/core/network/mock_astro_api.dart';
import 'package:astropath_mobile/features/dashboard/presentation/widgets/section_card.dart';
import 'package:astropath_mobile/features/shared/presentation/cosmic_backdrop.dart';
import 'package:flutter/material.dart';

class AssistantScreen extends StatefulWidget {
  const AssistantScreen({
    super.key,
    required this.api,
    required this.locale,
    required this.preferencesController,
  });

  final MockAstroApi api;
  final Locale locale;
  final UserPreferencesController preferencesController;

  @override
  State<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends State<AssistantScreen> {
  late Future<AssistantSnapshot> _snapshot;
  late final TextEditingController _promptController;
  List<_ChatMessage> _messages = const [];

  @override
  void initState() {
    super.initState();
    _promptController = TextEditingController();
    _reloadSnapshot();
  }

  @override
  void dispose() {
    _promptController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant AssistantScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.locale.languageCode != widget.locale.languageCode) {
      _promptController.clear();
      _reloadSnapshot();
    }
  }

  void _reloadSnapshot() {
    final languageCode = widget.locale.languageCode;
    _snapshot = widget.api.fetchAssistantSnapshot(widget.locale).then((data) {
      if (mounted && widget.locale.languageCode == languageCode) {
        setState(() {
          _messages = data.starterMessages
              .map(
                (message) => _ChatMessage(
                  text: message.text,
                  isUser: message.isUser,
                ),
              )
              .toList();
        });
      }
      return data;
    });
  }

  void _fillPrompt(String prompt) {
    _promptController.value = TextEditingValue(
      text: prompt,
      selection: TextSelection.collapsed(offset: prompt.length),
    );
  }

  void _sendPrompt() {
    final prompt = _promptController.text.trim();
    if (prompt.isEmpty) {
      return;
    }

    final strings = AstroStrings(widget.locale);

    setState(() {
      _messages = [
        ..._messages,
        _ChatMessage(text: prompt, isUser: true),
        _ChatMessage(text: strings.assistantStubReply, isUser: false),
      ];
      _promptController.clear();
    });
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    final strings = AstroStrings(widget.locale);

    return CosmicBackdrop(
      child: SafeArea(
        child: FutureBuilder<AssistantSnapshot>(
          future: _snapshot,
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }

            final data = snapshot.data!;

            return ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
              children: [
                Text(
                  strings.assistantTitle,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 10),
                Text(
                  strings.assistantBody,
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
                        data.welcomeTitle,
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        data.welcomeBody,
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: Colors.white.withOpacity(0.84),
                              height: 1.45,
                            ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    color: Colors.white.withOpacity(0.08),
                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                        padding: EdgeInsets.only(top: 2),
                        child: Icon(
                          Icons.info_outline,
                          size: 18,
                          color: Color(0xFFE6C36A),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          data.disclaimer,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.white70,
                                height: 1.4,
                              ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                _SectionHeading(title: strings.assistantSuggestionsHeading),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: data.suggestions
                        .map(
                          (suggestion) => Padding(
                            padding: const EdgeInsets.only(right: 10),
                            child: ActionChip(
                              onPressed: () => _fillPrompt(suggestion.prompt),
                              backgroundColor: Theme.of(context)
                                  .colorScheme
                                  .secondary
                                  .withOpacity(0.18),
                              side: BorderSide(
                                color: Theme.of(context)
                                    .colorScheme
                                    .secondary
                                    .withOpacity(0.28),
                              ),
                              avatar: const Icon(
                                Icons.auto_awesome,
                                size: 16,
                                color: Color(0xFFE6C36A),
                              ),
                              label: Text(suggestion.label),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                ),
                const SizedBox(height: 24),
                _SectionHeading(title: strings.assistantStarterHeading),
                const SizedBox(height: 14),
                SectionCard(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: _messages
                        .map(
                          (message) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: _MessageBubble(message: message),
                          ),
                        )
                        .toList(),
                  ),
                ),
                const SizedBox(height: 20),
                SectionCard(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _promptController,
                          minLines: 1,
                          maxLines: 4,
                          textInputAction: TextInputAction.send,
                          onSubmitted: (_) => _sendPrompt(),
                          decoration: InputDecoration(
                            hintText: strings.assistantInputPlaceholder,
                            border: InputBorder.none,
                            hintStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.white54,
                                ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      FilledButton(
                        onPressed: _sendPrompt,
                        child: Text(strings.assistantSendCta),
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

class _SectionHeading extends StatelessWidget {
  const _SectionHeading({
    required this.title,
  });

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w700,
          ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({
    required this.message,
  });

  final _ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;
    final bubbleColor = isUser
        ? Theme.of(context).colorScheme.secondary.withOpacity(0.22)
        : Colors.white.withOpacity(0.06);
    final borderColor = isUser
        ? Theme.of(context).colorScheme.secondary.withOpacity(0.34)
        : Colors.white.withOpacity(0.08);

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 360),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          color: bubbleColor,
          border: Border.all(color: borderColor),
        ),
        child: Text(
          message.text,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.white.withOpacity(0.9),
                height: 1.45,
              ),
        ),
      ),
    );
  }
}

class _ChatMessage {
  const _ChatMessage({
    required this.text,
    required this.isUser,
  });

  final String text;
  final bool isUser;
}
