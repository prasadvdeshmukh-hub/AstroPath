import 'package:astropath_mobile/core/models/assistant_snapshot.dart';
import 'package:astropath_mobile/core/models/consultation_hub_data.dart';
import 'package:astropath_mobile/core/models/dashboard_snapshot.dart';
import 'package:astropath_mobile/core/network/astro_api.dart';
import 'package:flutter/material.dart';

class MockAstroApi implements AstroApi {
  String _t(
    Locale locale, {
    required String en,
    required String hi,
    String? mr,
  }) {
    switch (locale.languageCode) {
      case 'hi':
        return hi;
      case 'mr':
        return mr ?? en;
      default:
        return en;
    }
  }

  @override
  Future<DashboardSnapshot> fetchDashboard(Locale locale) async {
    await Future<void>.delayed(const Duration(milliseconds: 450));

    return DashboardSnapshot(
      greeting: _t(
        locale,
        en: 'Welcome, Emily',
        hi: 'शुभ संध्या, साधक।',
        mr: 'शुभ संध्या, साधका.',
      ),
      sunSign: _t(
        locale,
        en: 'Sagittarius',
        hi: 'वृश्चिक लग्न',
        mr: 'वृश्चिक लग्न',
      ),
      horoscopeHeadline: _t(
        locale,
        en: 'Trust your intuition today.',
        hi: 'आज आपका समय ग्रहों के साथ है।',
        mr: 'आज तुमची वेळ ग्रहांशी सुसंगत आहे.',
      ),
      horoscopeBody: _t(
        locale,
        en: 'New opportunities are on the horizon.',
        hi:
            'काम में स्पष्टता रखें, रिश्तों में नरमी रखें, और सूर्यास्त के बाद धन संबंधी निर्णयों में जल्दबाजी न करें।',
        mr:
            'कामात स्पष्टता ठेवा, नात्यांत मृदुता ठेवा आणि सूर्यास्तानंतर पैशांचे निर्णय घाईत घेऊ नका.',
      ),
      moonPhase: _t(
        locale,
        en: 'Waxing Gibbous',
        hi: 'शुक्ल पक्ष, गिबस',
        mr: 'शुक्ल पक्ष, गिबस',
      ),
      energyScore: 82,
      quickActions: [
        QuickActionItem(
          title: _t(
            locale,
            en: 'Daily Tarot',
            hi: 'कुंडली बनाएं',
            mr: 'कुंडली तयार करा',
          ),
          subtitle: _t(
            locale,
            en: 'Pull a card for today',
            hi: 'जन्म कुंडली और दोष विश्लेषण',
            mr: 'जन्मकुंडली आणि दोष विश्लेषण',
          ),
          icon: Icons.mail_outline_rounded,
        ),
        QuickActionItem(
          title: _t(
            locale,
            en: 'Love Compatibility',
            hi: 'मुहूर्त खोजें',
            mr: 'मुहूर्त शोधा',
          ),
          subtitle: _t(
            locale,
            en: 'Check your bond',
            hi: 'विवाह, यात्रा, व्यवसाय',
            mr: 'विवाह, प्रवास, व्यवसाय',
          ),
          icon: Icons.favorite_rounded,
        ),
        QuickActionItem(
          title: _t(
            locale,
            en: 'Numerology',
            hi: 'अनुकूलता मिलाएं',
            mr: 'सुसंगती तपासा',
          ),
          subtitle: _t(
            locale,
            en: 'See your number vibe',
            hi: 'गुण और भावनात्मक मेल',
            mr: 'गुण आणि भावनिक जुळवण',
          ),
          icon: Icons.arrow_circle_down_rounded,
        ),
        QuickActionItem(
          title: _t(
            locale,
            en: 'Birth Chart',
            hi: 'ज्योतिषी से बात करें',
            mr: 'ज्योतिषाशी बोला',
          ),
          subtitle: _t(
            locale,
            en: 'Open your full kundli',
            hi: 'चैट, कॉल, या वीडियो',
            mr: 'चॅट, कॉल किंवा व्हिडिओ',
          ),
          icon: Icons.hub_outlined,
        ),
      ],
      featuredAstrologers: [
        FeaturedAstrologer(
          name: 'Sophia Sharma',
          specialty: _t(
            locale,
            en: 'Vedic and relationship astrology',
            hi: 'करियर और वित्त मार्गदर्शन',
            mr: 'करिअर आणि आर्थिक मार्गदर्शन',
          ),
          ratePerMinute: 4,
          rating: 4.9,
        ),
        FeaturedAstrologer(
          name: 'Daniel Cohen',
          specialty: _t(
            locale,
            en: 'Career and life path astrology',
            hi: 'विवाह और संबंध मार्गदर्शन',
            mr: 'विवाह आणि नातेसंबंध अंतर्दृष्टी',
          ),
          ratePerMinute: 5,
          rating: 4.8,
        ),
      ],
    );
  }

  @override
  Future<ConsultationHubData> fetchConsultationHub(Locale locale) async {
    await Future<void>.delayed(const Duration(milliseconds: 280));

    final code = locale.languageCode;

    return ConsultationHubData(
      walletBalance: 840,
      walletBonus: 120,
      walletHeadline: _t(
        locale,
        en: 'Top astrologers are live for real-time guidance.',
        hi: 'आज शाम करियर और विवाह विशेषज्ञ ऑनलाइन हैं।',
        mr: 'आज संध्याकाळी करिअर आणि नातेसंबंध तज्ञ ऑनलाइन आहेत.',
      ),
      walletBody: _t(
        locale,
        en: 'Start with chat preview, then move into live chat when you want deeper clarity.',
        hi: 'चैट से शुरुआत करें, फिर ज़रूरत हो तो कॉल या वीडियो पर स्विच करें।',
        mr: 'चॅटने सुरुवात करा, आणि अधिक स्पष्टता हवी असल्यास कॉल किंवा व्हिडिओकडे जा.',
      ),
      categories: [
        ConsultationCategory(
          title: _t(
            locale,
            en: 'Career Timing',
            hi: 'करियर टाइमिंग',
            mr: 'करिअर टाइमिंग',
          ),
          subtitle: _t(
            locale,
            en: 'Role changes, promotions, decisions',
            hi: 'भूमिका बदलाव, प्रमोशन, निर्णय',
            mr: 'भूमिका बदल, प्रमोशन, निर्णय',
          ),
          icon: Icons.work_outline,
        ),
        ConsultationCategory(
          title: _t(
            locale,
            en: 'Marriage and Relationships',
            hi: 'विवाह और रिश्ते',
            mr: 'विवाह आणि नातेसंबंध',
          ),
          subtitle: _t(
            locale,
            en: 'Compatibility, conversations, next steps',
            hi: 'संगति, बातचीत, अगला कदम',
            mr: 'सुसंगती, संवाद, पुढचा टप्पा',
          ),
          icon: Icons.favorite_outline,
        ),
        ConsultationCategory(
          title: _t(
            locale,
            en: 'Finance and Business',
            hi: 'धन और व्यवसाय',
            mr: 'आर्थिक आणि व्यवसाय',
          ),
          subtitle: _t(
            locale,
            en: 'Cash flow, investments, launch muhurat',
            hi: 'कैश फ्लो, निवेश, लॉन्च मुहूर्त',
            mr: 'कॅश फ्लो, गुंतवणूक, लॉन्च मुहूर्त',
          ),
          icon: Icons.account_balance_wallet_outlined,
        ),
        ConsultationCategory(
          title: _t(
            locale,
            en: 'Spiritual Remedies',
            hi: 'आध्यात्मिक उपाय',
            mr: 'आध्यात्मिक उपाय',
          ),
          subtitle: _t(
            locale,
            en: 'Remedies, rituals, discipline',
            hi: 'उपाय, पूजा, अनुशासन',
            mr: 'उपाय, पूजा, शिस्त',
          ),
          icon: Icons.self_improvement_outlined,
        ),
      ],
      astrologers: [
        AstrologerListing(
          id: 'sophia-sharma',
          name: 'Sophia Sharma',
          specialty: _t(
            locale,
            en: 'Vedic Astrology',
            hi: 'करियर और वित्त मार्गदर्शन',
            mr: 'करिअर आणि आर्थिक मार्गदर्शन',
          ),
          pricePerMinute: 4,
          rating: 4.9,
          experienceYears: 12,
          waitMinutes: 2,
          languages: code == 'hi'
              ? const ['हिंदी', 'English']
              : code == 'mr'
                  ? const ['मराठी', 'English']
                  : const ['English', 'Hindi'],
          focusLine: _t(
            locale,
            en: 'Expert in Vedic and relationship astrology with a warm, modern reading style.',
            hi: 'करियर बदलाव और निर्णय समय पर सटीक, संरचित मार्गदर्शन।',
            mr: 'करिअर बदल आणि महत्त्वाच्या timing साठी संरचित मार्गदर्शन.',
          ),
          isOnline: true,
          modes: const [
            ConsultationListingMode.chat,
            ConsultationListingMode.call,
          ],
        ),
        AstrologerListing(
          id: 'daniel-cohen',
          name: 'Daniel Cohen',
          specialty: _t(
            locale,
            en: 'Western Astrology',
            hi: 'विवाह और संबंध अंतर्दृष्टि',
            mr: 'विवाह आणि नातेसंबंध अंतर्दृष्टी',
          ),
          pricePerMinute: 5,
          rating: 4.8,
          experienceYears: 10,
          waitMinutes: 5,
          languages: code == 'hi'
              ? const ['हिंदी', 'English']
              : code == 'mr'
                  ? const ['मराठी', 'English']
                  : const ['Hindi', 'English'],
          focusLine: _t(
            locale,
            en: 'Specialist in career and life path guidance with practical next-step advice.',
            hi: 'गुण मिलान और भावनात्मक स्पष्टता के लिए शांत, आधुनिक मार्गदर्शन।',
            mr: 'गुण जुळवणी आणि भावनिक स्पष्टतेसाठी शांत, आधुनिक मार्गदर्शन.',
          ),
          isOnline: true,
          modes: const [
            ConsultationListingMode.chat,
            ConsultationListingMode.video,
          ],
        ),
        AstrologerListing(
          id: 'rishi-sen',
          name: 'Rishi Sen',
          specialty: _t(
            locale,
            en: 'Business launches and muhurat',
            hi: 'व्यवसाय, लॉन्च और मुहूर्त',
            mr: 'व्यवसाय, लॉन्च आणि मुहूर्त',
          ),
          pricePerMinute: 35,
          rating: 4.7,
          experienceYears: 15,
          waitMinutes: 11,
          languages: code == 'mr'
              ? const ['English', 'मराठी']
              : code == 'hi'
                  ? const ['English', 'हिंदी']
                  : const ['English', 'Hindi'],
          focusLine: _t(
            locale,
            en: 'Fast advice for launches, travel windows, and signing decisions.',
            hi: 'व्यवसाय शुरू करने, यात्रा और साइनिंग विंडो पर तेज़ सलाह।',
            mr: 'लॉन्च, प्रवास विंडो आणि साइनिंग निर्णयांसाठी जलद सल्ला.',
          ),
          isOnline: false,
          modes: const [
            ConsultationListingMode.call,
            ConsultationListingMode.video,
          ],
        ),
      ],
      reviews: [
        ConsultationReview(
          author: _t(
            locale,
            en: 'Rima, Delhi',
            hi: 'रीमा, दिल्ली',
            mr: 'रीमा, दिल्ली',
          ),
          headline: _t(
            locale,
            en: 'Gave me clarity on a career decision',
            hi: 'करियर निर्णय में स्पष्टता मिली',
            mr: 'करिअर निर्णयात स्पष्टता मिळाली',
          ),
          quote: _t(
            locale,
            en:
                'I started on chat and moved to a call. The reading felt practical, not fear-based.',
            hi:
                'मैंने चैट से शुरुआत की और फिर कॉल पर गई। सलाह व्यावहारिक लगी, डराने वाली नहीं।',
            mr:
                'मी चॅटने सुरुवात केली आणि मग कॉलवर गेले. मार्गदर्शन व्यवहार्य वाटले, घाबरवणारे नाही.',
          ),
        ),
        ConsultationReview(
          author: _t(
            locale,
            en: 'Arun, Pune',
            hi: 'अरुण, पुणे',
            mr: 'अरुण, पुणे',
          ),
          headline: _t(
            locale,
            en: 'The video session felt very grounded',
            hi: 'वीडियो सत्र बहुत grounded था',
            mr: 'व्हिडिओ सत्र खूप grounded वाटले',
          ),
          quote: _t(
            locale,
            en: 'It was not just prediction, it helped me think through my next step.',
            hi: 'सिर्फ भविष्यवाणी नहीं, बल्कि निर्णय लेने की दिशा मिली।',
            mr: 'फक्त भविष्यवाणी नव्हती, पुढचा टप्पा विचारात घेण्यास मदत झाली.',
          ),
        ),
      ],
    );
  }

  @override
  Future<AssistantSnapshot> fetchAssistantSnapshot(Locale locale) async {
    await Future<void>.delayed(const Duration(milliseconds: 220));

    return AssistantSnapshot(
      welcomeTitle: _t(
        locale,
        en: 'Ask the AI assistant for guidance',
        hi: 'AI सहायक से मार्गदर्शन लें',
        mr: 'AI सहाय्यकाकडून मार्गदर्शन घ्या',
      ),
      welcomeBody: _t(
        locale,
        en:
            'This assistant offers advisory guidance about your chart, career, relationships, and remedies.',
        hi: 'यह सहायक आपकी कुंडली, करियर, रिश्तों और उपायों पर advisory guidance देता है।',
        mr: 'हा सहाय्यक तुमच्या कुंडली, करिअर, नातेसंबंध आणि उपायांबद्दल advisory guidance देतो.',
      ),
      disclaimer: _t(
        locale,
        en:
            'This experience is for spiritual guidance, not deterministic prediction or medical/legal advice.',
        hi:
            'यह अनुभव आध्यात्मिक मार्गदर्शन के लिए है, निश्चित भविष्यवाणी या चिकित्सा/कानूनी सलाह नहीं।',
        mr:
            'हा अनुभव आध्यात्मिक मार्गदर्शनासाठी आहे, निश्चित भविष्यवाणी किंवा वैद्यकीय/कायदेशीर सल्ला नाही.',
      ),
      suggestions: [
        AssistantSuggestion(
          label: _t(
            locale,
            en: 'Career timing',
            hi: 'करियर timing',
            mr: 'करिअर timing',
          ),
          prompt: _t(
            locale,
            en: 'Help me understand the next 90 days for a career decision.',
            hi: 'मेरे करियर निर्णय के लिए आने वाले 90 दिनों की energy समझाओ।',
            mr: 'माझ्या करिअर निर्णयासाठी पुढील 90 दिवसांची ऊर्जा समजावून सांग.',
          ),
        ),
        AssistantSuggestion(
          label: _t(
            locale,
            en: 'Relationship clarity',
            hi: 'रिश्ता clarity',
            mr: 'नातेसंबंध clarity',
          ),
          prompt: _t(
            locale,
            en: 'What energy should I bring into an important relationship conversation?',
            hi: 'रिश्तों में बातचीत शुरू करने के लिए मुझे किस तरह की ऊर्जा रखनी चाहिए?',
            mr: 'महत्त्वाच्या नातेसंबंधातील संवादात मला कोणती ऊर्जा घेऊन जावे?',
          ),
        ),
        AssistantSuggestion(
          label: _t(
            locale,
            en: 'Explain my chart',
            hi: 'कुंडली समझाओ',
            mr: 'माझी कुंडली समजावून सांगा',
          ),
          prompt: _t(
            locale,
            en: 'Explain the signals from my kundli preview in simple language.',
            hi: 'कुंडली preview में दिख रहे संकेतों को आसान भाषा में समझाओ।',
            mr: 'माझ्या कुंडली preview मधील संकेत सोप्या भाषेत समजावून सांग.',
          ),
        ),
        AssistantSuggestion(
          label: _t(
            locale,
            en: 'Remedy ideas',
            hi: 'उपाय सुझाव',
            mr: 'उपाय कल्पना',
          ),
          prompt: _t(
            locale,
            en: 'Suggest gentle remedies that can keep me grounded this week.',
            hi: 'इस सप्ताह मुझे grounded रखने के लिए gentle remedies सुझाओ।',
            mr: 'या आठवड्यात मला grounded ठेवणारे gentle remedies सुचवा.',
          ),
        ),
      ],
      starterMessages: [
        AssistantMessageSeed(
          text: _t(
            locale,
            en:
                'Hello, I am AstroPath AI. You can ask about career, relationships, your kundli preview, or remedies.',
            hi:
                'नमस्ते, मैं AstroPath AI हूँ। आप करियर, रिश्ते, कुंडली preview या उपायों से जुड़ा सवाल पूछ सकते हैं।',
            mr:
                'नमस्कार, मी AstroPath AI आहे. तुम्ही करिअर, नातेसंबंध, कुंडली preview किंवा उपायांबद्दल प्रश्न विचारू शकता.',
          ),
          isUser: false,
        ),
        AssistantMessageSeed(
          text: _t(
            locale,
            en:
                'I will keep the guidance grounded and non-deterministic so it supports your decisions.',
            hi:
                'मैं guidance को grounded और non-deterministic रखूँगा ताकि आपके निर्णय स्पष्ट हों।',
            mr:
                'मी guidance grounded आणि non-deterministic ठेवेन जेणेकरून तुमचे निर्णय अधिक स्पष्ट होतील.',
          ),
          isUser: false,
        ),
      ],
    );
  }
}
