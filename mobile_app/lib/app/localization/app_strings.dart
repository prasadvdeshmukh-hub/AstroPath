import 'package:flutter/material.dart';

class AstroStrings {
  AstroStrings(this.locale);

  final Locale locale;

  String _select({
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

  String labelForLanguageCode(String code) {
    switch (code) {
      case 'hi':
        return hindiLabel;
      case 'mr':
        return marathiLabel;
      default:
        return englishLabel;
    }
  }

  String get appTitle => 'AstroPath';
  String get tagline => _select(
        en: 'Decode Your Destiny, Daily.',
        hi: 'अपनी नियति को हर दिन समझें।',
        mr: 'तुमचे भाग्य रोज उलगडा.',
      );
  String get navHome => _select(en: 'Home', hi: 'होम', mr: 'होम');
  String get navKundli => _select(en: 'Kundli', hi: 'कुंडली', mr: 'कुंडली');
  String get navConsult => _select(en: 'Consult', hi: 'परामर्श', mr: 'सल्ला');
  String get navAi => _select(en: 'AI', hi: 'एआई', mr: 'एआय');
  String get navSettings => _select(
        en: 'Settings',
        hi: 'सेटिंग्स',
        mr: 'सेटिंग्ज',
      );

  String get onboardingWelcomeTitle => _select(
        en: 'Welcome to your cosmic operating system',
        hi: 'आपके कॉस्मिक ऑपरेटिंग सिस्टम में स्वागत है',
        mr: 'तुमच्या कॉस्मिक ऑपरेटिंग सिस्टममध्ये स्वागत आहे',
      );
  String get onboardingWelcomeBody => _select(
        en:
            'AstroPath brings your daily guidance, kundli, consultations, and AI-powered spiritual insight into one refined mobile experience.',
        hi:
            'AstroPath आपकी दैनिक दिशा, कुंडली, परामर्श और एआई-आधारित आध्यात्मिक मार्गदर्शन को एक ही सुंदर मोबाइल अनुभव में लाता है।',
        mr:
            'AstroPath तुमचे दैनंदिन मार्गदर्शन, कुंडली, सल्लामसलत आणि AI-आधारित आध्यात्मिक अंतर्दृष्टी एकाच सुंदर मोबाइल अनुभवात आणते.',
      );
  String get onboardingFocusTitle => _select(
        en: 'What guidance matters most to you?',
        hi: 'आप किन क्षेत्रों में मार्गदर्शन चाहते हैं?',
        mr: 'तुमच्यासाठी कोणते मार्गदर्शन सर्वात महत्त्वाचे आहे?',
      );
  String get onboardingFocusBody => _select(
        en:
            'Choose at least one focus area so the experience feels personal from day one.',
        hi: 'अपने अनुभव को अधिक व्यक्तिगत बनाने के लिए कम से कम एक फोकस चुनें।',
        mr:
            'अनुभव पहिल्याच दिवसापासून वैयक्तिक वाटावा यासाठी किमान एक फोकस निवडा.',
      );
  String get onboardingLanguageTitle => _select(
        en: 'Choose your app language',
        hi: 'अपनी ऐप भाषा चुनें',
        mr: 'तुमची अॅप भाषा निवडा',
      );
  String get onboardingLanguageBody => _select(
        en:
            'The full app will adapt to your choice. You can still change it later in Settings.',
        hi: 'आपकी पसंद के अनुसार पूरा ऐप बदलेगा। आप इसे बाद में सेटिंग्स में भी बदल सकते हैं।',
        mr: 'तुमच्या निवडीनुसार संपूर्ण अॅप बदलेल. नंतर सेटिंग्जमध्येही ते बदलू शकता.',
      );
  String get onboardingAlertsTitle => _select(
        en: 'Set your daily rhythm',
        hi: 'अपने दैनिक रिदम को सेट करें',
        mr: 'तुमची दैनंदिन लय ठरवा',
      );
  String get onboardingAlertsBody => _select(
        en:
            'Decide what AstroPath should remind you about and which guidance should stay front and center.',
        hi: 'तय करें कि AstroPath आपको क्या याद दिलाए और किस तरह के मार्गदर्शन को प्राथमिकता दे।',
        mr:
            'AstroPath ने तुम्हाला काय आठवण करून द्यावी आणि कोणते मार्गदर्शन पुढे ठेवावे ते ठरवा.',
      );
  String get onboardingStartTitle => _select(
        en: 'Your cosmic journey is ready',
        hi: 'आपकी कॉस्मिक यात्रा तैयार है',
        mr: 'तुमचा कॉस्मिक प्रवास तयार आहे',
      );
  String get onboardingStartBody => _select(
        en:
            'Your dashboard, kundli, consultation, and AI experience are now tuned around your choices.',
        hi: 'डैशबोर्ड, कुंडली, परामर्श और एआई अनुभव अब आपकी पसंद के आधार पर तैयार हैं।',
        mr: 'तुमचा डॅशबोर्ड, कुंडली, सल्लामसलत आणि AI अनुभव आता तुमच्या निवडींनुसार तयार आहे.',
      );
  String readySummary(int focusCount) => _select(
        en: 'Your experience is tuned with $focusCount primary focus areas.',
        hi: '$focusCount प्राथमिक फोकस क्षेत्रों के साथ आपका अनुभव तैयार है।',
        mr: '$focusCount मुख्य फोकस क्षेत्रांसह तुमचा अनुभव तयार आहे.',
      );
  String get skip => _select(en: 'Skip', hi: 'स्किप', mr: 'वगळा');
  String get back => _select(en: 'Back', hi: 'वापस', mr: 'मागे');
  String get next => _select(en: 'Next', hi: 'आगे', mr: 'पुढे');
  String get finish => _select(
        en: 'Enter AstroPath',
        hi: 'AstroPath खोलें',
        mr: 'AstroPath उघडा',
      );

  String get focusCareer => _select(en: 'Career', hi: 'करियर', mr: 'करिअर');
  String get focusLove => _select(en: 'Love', hi: 'प्रेम', mr: 'प्रेम');
  String get focusFinance => _select(en: 'Finance', hi: 'वित्त', mr: 'आर्थिक');
  String get focusSpiritual => _select(
        en: 'Spiritual',
        hi: 'आध्यात्मिक',
        mr: 'आध्यात्मिक',
      );

  String get onboardingCardKundliTitle => _select(
        en: 'Accurate Kundli',
        hi: 'सटीक कुंडली',
        mr: 'अचूक कुंडली',
      );
  String get onboardingCardKundliBody => _select(
        en: 'Detailed planetary positions, dosha scans, and dasha insights.',
        hi: 'विस्तृत ग्रह स्थिति, दोष और दशा व्याख्या।',
        mr: 'सविस्तर ग्रहस्थिती, दोष स्कॅन आणि दशा अंतर्दृष्टी.',
      );
  String get onboardingCardConsultTitle => _select(
        en: 'Instant Consultation',
        hi: 'तुरंत परामर्श',
        mr: 'त्वरित सल्लामसलत',
      );
  String get onboardingCardConsultBody => _select(
        en: 'Connect with astrologers over chat, call, or video.',
        hi: 'ज्योतिषियों से चैट, कॉल या वीडियो पर जुड़ें।',
        mr: 'ज्योतिषांशी चॅट, कॉल किंवा व्हिडिओवर जोडा.',
      );
  String get onboardingCardAiTitle => _select(
        en: 'AI Guidance',
        hi: 'एआई मार्गदर्शन',
        mr: 'AI मार्गदर्शन',
      );
  String get onboardingCardAiBody => _select(
        en: 'Advisory, non-deterministic insights for daily decisions.',
        hi: 'दैनिक निर्णयों के लिए सलाहपूर्ण, गैर-नियतात्मक इनसाइट्स।',
        mr: 'दैनंदिन निर्णयांसाठी मार्गदर्शक, non-deterministic अंतर्दृष्टी.',
      );

  String get alertsDailyHoroscope => _select(
        en: 'Daily horoscope reminders',
        hi: 'दैनिक राशिफल रिमाइंडर',
        mr: 'दैनिक राशिभविष्य स्मरणपत्रे',
      );
  String get alertsConsultation => _select(
        en: 'Astrologer availability alerts',
        hi: 'ज्योतिषी उपलब्धता अलर्ट',
        mr: 'ज्योतिष उपलब्धता अलर्ट',
      );
  String get alertsAiCards => _select(
        en: 'AI insight cards',
        hi: 'एआई इनसाइट कार्ड',
        mr: 'AI इनसाइट कार्ड',
      );
  String get alertsRemedies => _select(
        en: 'Remedy suggestions',
        hi: 'उपाय सुझाव',
        mr: 'उपाय सूचना',
      );
  String get preferredConsultMode => _select(
        en: 'Preferred consultation mode',
        hi: 'पसंदीदा परामर्श मोड',
        mr: 'आवडता सल्लामसलत मोड',
      );
  String get consultChat => _select(en: 'Chat', hi: 'चैट', mr: 'चॅट');
  String get consultCall => _select(en: 'Call', hi: 'कॉल', mr: 'कॉल');
  String get consultVideo => _select(en: 'Video', hi: 'वीडियो', mr: 'व्हिडिओ');

  String get greeting => _select(
        en: 'Good evening, seeker.',
        hi: 'शुभ संध्या, साधक।',
        mr: 'शुभ संध्या, साधका.',
      );
  String get sunSign => _select(
        en: 'Scorpio Rising',
        hi: 'वृश्चिक लग्न',
        mr: 'वृश्चिक लग्न',
      );
  String get horoscopeHeadline => _select(
        en: 'Cosmic timing is in your favor today.',
        hi: 'आज आपका समय ग्रहों के साथ है।',
        mr: 'आज तुमची वेळ ग्रहांशी सुसंगत आहे.',
      );
  String get horoscopeBody => _select(
        en:
            'Lead with clarity in work, move gently in relationships, and avoid rushed money decisions after sunset.',
        hi:
            'काम में स्पष्टता रखें, रिश्तों में नरमी रखें, और सूर्यास्त के बाद धन संबंधी निर्णयों में जल्दबाजी न करें।',
        mr:
            'कामात स्पष्टता ठेवा, नात्यांत मृदुता ठेवा आणि सूर्यास्तानंतर पैशांचे निर्णय घाईत घेऊ नका.',
      );
  String get moonPhaseLabel => _select(
        en: 'Moon Phase',
        hi: 'चंद्र चरण',
        mr: 'चंद्र अवस्था',
      );
  String get moonPhase => _select(
        en: 'Waxing Gibbous',
        hi: 'शुक्ल पक्ष, गिबस',
        mr: 'शुक्ल पक्ष, गिबस',
      );
  String get moonPhaseBody => _select(
        en: 'Use tonight for reflection, journaling, and planning your next move.',
        hi: 'आज की रात चिंतन, लेखन और अगले कदम की योजना के लिए शुभ है।',
        mr: 'आजची रात्र चिंतन, लेखन आणि पुढचा टप्पा ठरवण्यासाठी अनुकूल आहे.',
      );
  String get premiumLabel => _select(
        en: 'Premium',
        hi: 'प्रीमियम',
        mr: 'प्रीमियम',
      );
  String get premiumBody => _select(
        en: 'Unlock AI-guided reports and deeper life insights.',
        hi: 'एआई-आधारित रिपोर्ट और गहरे जीवन-सूत्र अनलॉक करें।',
        mr: 'AI-आधारित अहवाल आणि अधिक सखोल जीवन-अंतर्दृष्टी अनलॉक करा.',
      );
  String get explorePlans => _select(
        en: 'Explore Plans',
        hi: 'प्लान देखें',
        mr: 'प्लॅन्स पाहा',
      );
  String get quickActions => _select(
        en: 'Quick Actions',
        hi: 'त्वरित क्रियाएं',
        mr: 'त्वरित कृती',
      );
  String get topAstrologers => _select(
        en: 'Top Astrologers',
        hi: 'शीर्ष ज्योतिषी',
        mr: 'शीर्ष ज्योतिष',
      );
  String get energySuffix => _select(en: 'Energy', hi: 'ऊर्जा', mr: 'ऊर्जा');
  String get perMinute => _select(en: '/min', hi: '/मिनट', mr: '/मिनिट');

  String get q1Title => _select(
        en: 'Generate Kundli',
        hi: 'कुंडली बनाएं',
        mr: 'कुंडली तयार करा',
      );
  String get q1Subtitle => _select(
        en: 'Birth chart and dosha scan',
        hi: 'जन्म कुंडली और दोष विश्लेषण',
        mr: 'जन्मकुंडली आणि दोष विश्लेषण',
      );
  String get q2Title => _select(
        en: 'Find Muhurat',
        hi: 'मुहूर्त खोजें',
        mr: 'मुहूर्त शोधा',
      );
  String get q2Subtitle => _select(
        en: 'Marriage, travel, business',
        hi: 'विवाह, यात्रा, व्यवसाय',
        mr: 'विवाह, प्रवास, व्यवसाय',
      );
  String get q3Title => _select(
        en: 'Match Compatibility',
        hi: 'अनुकूलता मिलाएं',
        mr: 'सुसंगती तपासा',
      );
  String get q3Subtitle => _select(
        en: 'Guna and emotional fit',
        hi: 'गुण और भावनात्मक मेल',
        mr: 'गुण आणि भावनिक जुळवण',
      );
  String get q4Title => _select(
        en: 'Talk to Astrologer',
        hi: 'ज्योतिषी से बात करें',
        mr: 'ज्योतिषाशी बोला',
      );
  String get q4Subtitle => _select(
        en: 'Chat, call, or video',
        hi: 'चैट, कॉल, या वीडियो',
        mr: 'चॅट, कॉल किंवा व्हिडिओ',
      );

  String get astrologer1Specialty => _select(
        en: 'Career and finance guidance',
        hi: 'करियर और वित्त मार्गदर्शन',
        mr: 'करिअर आणि आर्थिक मार्गदर्शन',
      );
  String get astrologer2Specialty => _select(
        en: 'Marriage and relationship insight',
        hi: 'विवाह और संबंध मार्गदर्शन',
        mr: 'विवाह आणि नातेसंबंध अंतर्दृष्टी',
      );

  String get kundliTitle => _select(
        en: 'Kundli Journey',
        hi: 'कुंडली यात्रा',
        mr: 'कुंडली प्रवास',
      );
  String get kundliBody => _select(
        en:
            'Birth details, chart generation, dosha analysis, and life pattern insights will live here.',
        hi: 'जन्म विवरण, चार्ट निर्माण, दोष विश्लेषण और जीवन-पैटर्न अंतर्दृष्टि यहां आएगी।',
        mr:
            'जन्म तपशील, चार्ट निर्मिती, दोष विश्लेषण आणि जीवन-पॅटर्न अंतर्दृष्टी येथे दिसेल.',
      );
  String get kundliEntryTitle => _select(
        en: 'Begin your birth chart journey',
        hi: 'अपनी जन्म-कुंडली की शुरुआत करें',
        mr: 'तुमचा जन्मकुंडली प्रवास सुरू करा',
      );
  String get kundliEntryBody => _select(
        en:
            'Enter your birth details to prepare your kundli experience, dosha scan, and first insights.',
        hi:
            'जन्म विवरण दर्ज करें ताकि आपका कुंडली अनुभव, दोष स्कैन और प्रारंभिक अंतर्दृष्टि तैयार हो सके।',
        mr:
            'तुमचा कुंडली अनुभव, दोष स्कॅन आणि सुरुवातीच्या अंतर्दृष्टीसाठी जन्म तपशील भरा.',
      );
  String get birthDetailsSection => _select(
        en: 'Birth Details',
        hi: 'जन्म विवरण',
        mr: 'जन्म तपशील',
      );
  String get fullNameLabel => _select(
        en: 'Full Name',
        hi: 'पूरा नाम',
        mr: 'पूर्ण नाव',
      );
  String get dateOfBirthLabel => _select(
        en: 'Date of Birth',
        hi: 'जन्म तिथि',
        mr: 'जन्मतारीख',
      );
  String get timeOfBirthLabel => _select(
        en: 'Time of Birth',
        hi: 'जन्म समय',
        mr: 'जन्मवेळ',
      );
  String get placeOfBirthLabel => _select(
        en: 'Place of Birth',
        hi: 'जन्म स्थान',
        mr: 'जन्मस्थान',
      );
  String get selectDate => _select(
        en: 'Select Date',
        hi: 'तिथि चुनें',
        mr: 'तारीख निवडा',
      );
  String get selectTime => _select(
        en: 'Select Time',
        hi: 'समय चुनें',
        mr: 'वेळ निवडा',
      );
  String get unknownTimeHint => _select(
        en: 'If the time is not exact, it can be refined later.',
        hi: 'यदि समय सटीक नहीं है, तो बाद में सुधार किया जा सकता है।',
        mr: 'वेळ अचूक नसेल तर ती नंतर सुधारता येऊ शकते.',
      );
  String get generateKundliPreview => _select(
        en: 'Generate Kundli Preview',
        hi: 'कुंडली प्रीव्यू बनाएं',
        mr: 'कुंडली प्रीव्ह्यू तयार करा',
      );
  String get updatePreview => _select(
        en: 'Refresh Preview',
        hi: 'प्रीव्यू अपडेट करें',
        mr: 'प्रीव्ह्यू रीफ्रेश करा',
      );
  String get kundliPreviewTitle => _select(
        en: 'Kundli Preview',
        hi: 'कुंडली प्रीव्यू',
        mr: 'कुंडली प्रीव्ह्यू',
      );
  String get kundliPreviewBody => _select(
        en: 'This is a UI-level preview. Accurate calculations will come from the backend astrology engine.',
        hi: 'यह UI-स्तरीय प्रीव्यू है। सटीक गणना बैकएंड ज्योतिष इंजन से आएगी।',
        mr: 'हा UI-स्तरीय प्रीव्ह्यू आहे. अचूक गणना बॅकएंड ज्योतिष इंजिनकडून येईल.',
      );
  String get chartSummarySection => _select(
        en: 'Chart Summary',
        hi: 'चार्ट सारांश',
        mr: 'चार्ट सारांश',
      );
  String get planetaryHighlightsSection => _select(
        en: 'Planetary Highlights',
        hi: 'ग्रह मुख्य बिंदु',
        mr: 'ग्रह मुख्य मुद्दे',
      );
  String get remediesSection => _select(
        en: 'Remedies and Direction',
        hi: 'उपाय और दिशा',
        mr: 'उपाय आणि दिशा',
      );
  String get lagnaLabel => _select(en: 'Lagna', hi: 'लग्न', mr: 'लग्न');
  String get moonSignLabel => _select(
        en: 'Moon Sign',
        hi: 'चंद्र राशि',
        mr: 'चंद्र राशि',
      );
  String get nakshatraLabel => _select(
        en: 'Nakshatra',
        hi: 'नक्षत्र',
        mr: 'नक्षत्र',
      );
  String get dashaLabel => _select(en: 'Dasha', hi: 'दशा', mr: 'दशा');
  String get doshaLabel => _select(en: 'Dosha', hi: 'दोष', mr: 'दोष');
  String get saveFamilyProfile => _select(
        en: 'Save to Family Profile',
        hi: 'फैमिली प्रोफाइल में सेव करें',
        mr: 'फॅमिली प्रोफाइलमध्ये सेव्ह करा',
      );
  String get askAiAboutChart => _select(
        en: 'Ask AI to Explain Chart',
        hi: 'एआई से कुंडली समझें',
        mr: 'AI कडून कुंडली समजून घ्या',
      );
  String get demoInsightCareer => _select(
        en: 'Career: structured decisions over the next 90 days look more rewarding.',
        hi: 'करियर: अगले 90 दिनों में संरचित निर्णय अधिक लाभ देंगे।',
        mr: 'करिअर: पुढील 90 दिवसांत रचलेले निर्णय अधिक फलदायी दिसतात.',
      );
  String get demoInsightRelationships => _select(
        en: 'Relationships: clear conversations will help more than reactive emotion.',
        hi: 'संबंध: भावनात्मक प्रतिक्रियाओं से पहले स्पष्ट बातचीत लाभकारी होगी।',
        mr: 'नातेसंबंध: भावनिक प्रतिक्रियेपेक्षा स्पष्ट संवाद अधिक उपयोगी ठरेल.',
      );
  String get demoRemedy => _select(
        en: 'Remedy: keep one weekly ritual of meditation, donation, and moon-focused journaling.',
        hi: 'उपाय: सप्ताह में एक बार ध्यान, दान, और चंद्र-संबंधित जर्नलिंग रखें।',
        mr: 'उपाय: आठवड्यातून एकदा ध्यान, दान आणि चंद्र-केंद्रित जर्नलिंग ठेवा.',
      );
  String get incompleteBirthDetails => _select(
        en: 'Fill name, date, time, and place to unlock the preview.',
        hi: 'प्रीव्यू के लिए नाम, तिथि, समय और स्थान भरें।',
        mr: 'प्रीव्ह्यूसाठी नाव, तारीख, वेळ आणि स्थान भरा.',
      );

  String get consultTitle => _select(
        en: 'Consult Marketplace',
        hi: 'परामर्श मार्केटप्लेस',
        mr: 'सल्लामसलत मार्केटप्लेस',
      );
  String get consultBody => _select(
        en:
            'Explore astrologers, compare modes, and move from wallet to booking with confidence.',
        hi: 'ज्योतिषियों को खोजें, मोड की तुलना करें और वॉलेट से बुकिंग तक सहजता से जाएँ।',
        mr: 'ज्योतिषांचा शोध घ्या, मोडची तुलना करा आणि वॉलेटपासून बुकिंगपर्यंत सहज जा.',
      );
  String get consultWalletTitle => _select(
        en: 'Wallet and Credits',
        hi: 'वॉलेट और क्रेडिट्स',
        mr: 'वॉलेट आणि क्रेडिट्स',
      );
  String get consultCategoriesTitle => _select(
        en: 'Browse Categories',
        hi: 'श्रेणियां देखें',
        mr: 'श्रेणी ब्राउज करा',
      );
  String get consultAstrologersTitle => _select(
        en: 'Available Astrologers',
        hi: 'उपलब्ध ज्योतिषी',
        mr: 'उपलब्ध ज्योतिष',
      );
  String get consultReviewsTitle => _select(
        en: 'Client Reviews',
        hi: 'क्लाइंट रिव्यू',
        mr: 'क्लायंट रिव्ह्यू',
      );
  String get consultBookCta => _select(
        en: 'Book',
        hi: 'बुक करें',
        mr: 'बुक करा',
      );
  String get consultModeChat => _select(en: 'Chat', hi: 'चैट', mr: 'चॅट');
  String get consultModeCall => _select(en: 'Call', hi: 'कॉल', mr: 'कॉल');
  String get consultModeVideo => _select(
        en: 'Video',
        hi: 'वीडियो',
        mr: 'व्हिडिओ',
      );
  String get consultOnline => _select(
        en: 'Online',
        hi: 'ऑनलाइन',
        mr: 'ऑनलाइन',
      );
  String get consultOffline => _select(
        en: 'Offline',
        hi: 'ऑफलाइन',
        mr: 'ऑफलाइन',
      );

  String get assistantTitle => _select(
        en: 'AI Assistant',
        hi: 'एआई सहायक',
        mr: 'AI सहाय्यक',
      );
  String get assistantBody => _select(
        en:
            'Use the AI assistant for grounded, non-deterministic guidance about your chart, timing, and remedies.',
        hi:
            'अपनी कुंडली, timing और उपायों पर grounded, non-deterministic guidance के लिए AI assistant का उपयोग करें।',
        mr:
            'तुमच्या कुंडली, timing आणि उपायांबद्दल grounded, non-deterministic guidance साठी AI assistant वापरा.',
      );
  String get assistantSuggestionsHeading => _select(
        en: 'Try a Prompt',
        hi: 'एक प्रॉम्प्ट आज़माएँ',
        mr: 'एक प्रॉम्प्ट वापरून पाहा',
      );
  String get assistantStarterHeading => _select(
        en: 'Conversation',
        hi: 'बातचीत',
        mr: 'संवाद',
      );
  String get assistantInputPlaceholder => _select(
        en: 'Ask about your chart, timing, or remedies...',
        hi: 'अपनी कुंडली, timing या उपायों के बारे में पूछें...',
        mr: 'तुमच्या कुंडली, timing किंवा उपायांबद्दल विचारा...',
      );
  String get assistantSendCta => _select(
        en: 'Send',
        hi: 'भेजें',
        mr: 'पाठवा',
      );
  String get assistantStubReply => _select(
        en:
            'I can help you reflect on that gently. This is a placeholder reply until the live assistant connection is wired in.',
        hi:
            'मैं इस पर शांत और स्पष्ट तरीके से सोचने में आपकी मदद कर सकता हूँ। यह placeholder reply है जब तक live assistant connection जुड़ नहीं जाता।',
        mr:
            'मी यावर शांत आणि स्पष्टपणे विचार करण्यात मदत करू शकतो. live assistant connection जोडला जाईपर्यंत हा placeholder reply आहे.',
      );

  String get settingsTitle => _select(
        en: 'App Settings',
        hi: 'ऐप सेटिंग्स',
        mr: 'अॅप सेटिंग्ज',
      );
  String get settingsBody => _select(
        en:
            'Adjust language, personalization, and experience controls so the full app fits your preference.',
        hi:
            'भाषा, निजीकरण और अनुभव नियंत्रण बदलें ताकि पूरा ऐप आपकी पसंद के अनुसार ढल जाए।',
        mr:
            'भाषा, वैयक्तिकरण आणि अनुभव नियंत्रण बदला जेणेकरून संपूर्ण अॅप तुमच्या पसंतीला जुळेल.',
      );
  String get languageSection => _select(
        en: 'Language',
        hi: 'भाषा',
        mr: 'भाषा',
      );
  String get languageHelp => _select(
        en: 'This selection applies across home, kundli, consult, and AI experiences.',
        hi: 'यह चयन होम, कुंडली, परामर्श और एआई अनुभवों पर लागू होगा।',
        mr: 'ही निवड होम, कुंडली, सल्लामसलत आणि AI अनुभवांवर लागू होईल.',
      );
  String get englishLabel => 'English';
  String get hindiLabel => 'हिंदी';
  String get marathiLabel => 'मराठी';
  String get currentLanguage => _select(
        en: 'Current Language',
        hi: 'वर्तमान भाषा',
        mr: 'सध्याची भाषा',
      );
  String get personalizationSection => _select(
        en: 'Personalization',
        hi: 'व्यक्तिगत अनुभव',
        mr: 'वैयक्तिक अनुभव',
      );
  String get personalizationBody => _select(
        en: 'The preferences here shape your dashboard and the guidance you see first.',
        hi: 'यहां चुनी गई प्राथमिकताएं आपके डैशबोर्ड और मार्गदर्शन की दिशा तय करती हैं।',
        mr: 'इथल्या पसंती तुमचा डॅशबोर्ड आणि तुम्हाला आधी दिसणारे मार्गदर्शन ठरवतात.',
      );
  String get consultationSection => _select(
        en: 'Consultation Preferences',
        hi: 'परामर्श प्राथमिकताएं',
        mr: 'सल्लामसलत प्राधान्ये',
      );
  String get consultationBody => _select(
        en: 'Control the type of consultation experience you want to prioritize.',
        hi: 'तय करें कि आप किस तरह के परामर्श अनुभव को प्राथमिकता देते हैं।',
        mr: 'तुम्हाला कोणत्या प्रकारच्या सल्लामसलत अनुभवाला प्राधान्य द्यायचे ते ठरवा.',
      );
  String get experienceSection => _select(
        en: 'Experience Controls',
        hi: 'अनुभव नियंत्रण',
        mr: 'अनुभव नियंत्रण',
      );
  String get experienceBody => _select(
        en: 'Control which daily support and insight modules AstroPath should emphasize.',
        hi: 'AstroPath किस तरह की दैनिक सहायता और इनसाइट दिखाए, यह यहां नियंत्रित करें।',
        mr: 'AstroPath ने कोणते दैनंदिन समर्थन आणि इनसाइट मॉड्यूल पुढे आणावेत ते येथे नियंत्रित करा.',
      );
  String get trustSection => _select(
        en: 'Trust and Privacy',
        hi: 'विश्वास और गोपनीयता',
        mr: 'विश्वास आणि गोपनीयता',
      );
  String get trustBody => _select(
        en: 'This app provides spiritual guidance and not medical, legal, or financial advice.',
        hi: 'यह ऐप आध्यात्मिक मार्गदर्शन देता है, चिकित्सा, कानूनी या वित्तीय सलाह नहीं।',
        mr: 'हे अॅप आध्यात्मिक मार्गदर्शन देते, वैद्यकीय, कायदेशीर किंवा आर्थिक सल्ला नाही.',
      );
}
