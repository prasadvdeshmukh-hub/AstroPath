/*
 * AstroPath i18n
 * --------------
 * A lightweight translation layer for static HTML pages. Pages tag every
 * translatable string with `data-i18n="key"`. On load (and whenever the
 * locale changes) we walk those nodes and swap textContent. For <input>
 * placeholders, use `data-i18n-placeholder`. For HTML attributes like
 * `aria-label`, use `data-i18n-attr="aria-label:nav.home"`.
 *
 * Keeping the dictionary inline (no build step) so the UI ships as plain
 * static files under /app. Hindi + Marathi are first-class; Tamil is a
 * stub marked "coming soon" (still falls back to English on unknown keys).
 */

(function () {
  'use strict';

  const DICT = {
    en: {
      // Nav
      'nav.home': 'Home',
      'nav.kundli': 'Kundli',
      'nav.consult': 'Consult',
      'nav.ai': 'AI',
      'nav.settings': 'Settings',
      'nav.panchang': 'Panchang',
      'nav.horoscope': 'Horoscope',
      'nav.learn': 'Learn',

      // Common buttons
      'btn.next': 'Next',
      'btn.back': 'Back',
      'btn.save': 'Save',
      'btn.edit': 'Edit',
      'btn.logout': 'Log out',
      'btn.signout': 'Sign out',
      'btn.generate': 'Generate Kundli',
      'btn.match': 'Match Kundli',
      'btn.learn': 'Learn Jyotish Vidya',
      'btn.subscribe': 'Subscribe',
      'btn.cancel': 'Cancel',

      // Onboarding
      'onb.step': 'Step',
      'onb.of': 'of',
      'onb.welcome.title': 'Welcome,\nseeker.',
      'onb.welcome.sub': 'AstroPath turns your birth chart into a living daily guide — horoscope, panchang, rituals, and real astrologers. Ready to decode your destiny?',
      'onb.welcome.threeTitle': 'Three things this week',
      'onb.welcome.threeBody': 'Personalised kundli · Daily cosmic energy · One free AI consult to try.',
      'onb.focus.title': 'Where do you seek guidance?',
      'onb.focus.sub': "Pick one or more focus areas — we'll tune horoscopes, reminders, and rituals around them.",
      'onb.focus.career': 'Career',
      'onb.focus.career.sub': 'Direction & growth',
      'onb.focus.love': 'Love',
      'onb.focus.love.sub': 'Relationships & match',
      'onb.focus.finance': 'Finance',
      'onb.focus.finance.sub': 'Wealth & decisions',
      'onb.focus.spiritual': 'Spiritual',
      'onb.focus.spiritual.sub': 'Rituals & practice',
      'onb.lang.title': 'Choose your language',
      'onb.lang.sub': 'The whole app will switch to your pick. Change any time from Settings.',
      'onb.birth.title': 'Your birth moment',
      'onb.birth.sub': 'The kundli engine uses Lahiri Ayanamsa and your exact time + place to compute Lagna, nakshatra, and dashas.',
      'onb.field.name': 'Full Name',
      'onb.field.dob': 'Date of Birth',
      'onb.field.tob': 'Time of Birth',
      'onb.field.country': 'Country',
      'onb.field.pincode': 'Postal Code (PIN)',
      'onb.field.state': 'State',
      'onb.field.city': 'City / District',
      'onb.field.pincode.help': 'Enter a 6-digit Indian PIN — state & city auto-fill.',
      'onb.locked': '🔒 Locked inside your profile. Used only for kundli & horoscope computations.',
      'onb.validation.name': 'Please enter your full name.',
      'onb.validation.dob': 'Please pick your date of birth.',
      'onb.validation.tob': 'Please pick hour, minute, and AM/PM.',
      'onb.validation.pincode': 'Please enter a valid 6-digit Indian PIN code.',
      'onb.validation.state': 'Please pick a state.',
      'onb.validation.city': 'Please pick a city.',
      'onb.validation.focus': 'Please pick at least one focus area.',
      'onb.validation.lang': 'Please choose a language.',
      'onb.pincode.notfound': 'PIN code not in directory — pick state & city manually.',

      // Dashboard
      'dash.todayHoroscope': "Today's Horoscope",
      'dash.readFull': 'Read full horoscope →',
      'dash.cosmicEnergy': 'Cosmic Energy',
      'dash.quickActions': 'Quick Actions',
      'dash.qa.kundli': 'Kundli',
      'dash.qa.panchang': 'Panchang',
      'dash.qa.consult': 'Consult',
      'dash.qa.ai': 'AI Guru',
      'dash.qa.learn': 'Learn',
      'dash.qa.match': 'Match',
      'dash.moonPhase': 'Moon Phase',
      'dash.recent': 'Recent',
      'dash.seeAll': 'See all',
      'dash.customize': 'Customize',
      'dash.greeting.morning': 'Good morning',
      'dash.greeting.afternoon': 'Good afternoon',
      'dash.greeting.evening': 'Good evening',
      'dash.greeting.night': 'Good night',

      // Horoscope
      'horo.title': 'HOROSCOPE',
      'horo.sub': 'For your Moon sign',
      'horo.tab.day': 'Day',
      'horo.tab.week': 'Week',
      'horo.tab.month': 'Month',
      'horo.tab.year': 'Year',
      'horo.areas': 'Areas',
      'horo.lucky': 'Lucky for today',
      'horo.cat.love': 'Love',
      'horo.cat.career': 'Career',
      'horo.cat.finance': 'Finance',
      'horo.cat.health': 'Health',
      'horo.meta.energy': 'Energy',
      'horo.meta.focus': 'Focus',
      'horo.meta.peak': 'Peak hour',

      // Kundli
      'kundli.title': 'KUNDLI',
      'kundli.generate': 'Generate Kundli',
      'kundli.match': 'Match Kundli',
      'kundli.planets': 'Planet Positions',
      'kundli.dasha': 'Vimshottari Dasha',
      'kundli.doshas': 'Doshas',
      'kundli.tab.lagna': 'Lagna',
      'kundli.tab.navamsa': 'Navamsa',
      'kundli.tab.chandra': 'Chandra',
      'kundli.details': 'Details',
      'kundli.timeline': 'Full timeline',
      'kundli.remedies': 'Remedies',
      'kundli.match.title': 'Match Two Kundlis',
      'kundli.match.sub': 'Enter both partners\' birth details for Guna Milan + full compatibility.',
      'kundli.match.partnerA': 'Partner A',
      'kundli.match.partnerB': 'Partner B',

      // Panchang
      'panch.title': 'PANCHANG',
      'panch.sunrise': 'Sunrise',
      'panch.now': 'Now',
      'panch.sunset': 'Sunset',
      'panch.elements': 'Panchang elements',
      'panch.moon': 'Moon today',
      'panch.muhurat': 'Muhurat Finder',
      'panch.muhurat.date': 'Pick date(s) — up to 1 year',
      'panch.muhurat.from': 'From',
      'panch.muhurat.to': 'To',
      'panch.muhurat.find': 'Find Muhurat',
      'panch.muhurat.single': 'Single day',
      'panch.muhurat.range': 'Date range',
      'panch.type.marriage': 'Marriage',
      'panch.type.business': 'Business',
      'panch.type.griha': 'Griha',
      'panch.type.travel': 'Travel',
      'panch.type.naming': 'Naming',

      // Settings
      'settings.title': 'SETTINGS',
      'settings.sub': 'Control every cosmic preference',
      'settings.lang': 'Language',
      'settings.notif': 'Notifications',
      'settings.person': 'Personalization',
      'settings.consult': 'Default consultation mode',
      'settings.trust': 'Trust, Privacy & Disclaimer',
      'settings.plan': 'Subscription',
      'settings.plan.current': 'Current plan',
      'settings.plan.manage': 'Manage',

      // Learn
      'learn.title': 'LEARN JYOTISH VIDYA',
      'learn.sub': 'Structured modules — free preview, full access with subscription.',
      'learn.module.foundations': 'Foundations of Jyotish',
      'learn.module.rashis': '12 Rashis & Their Lords',
      'learn.module.houses': '12 Bhavas (Houses)',
      'learn.module.planets': 'Grahas & Karakas',
      'learn.module.nakshatras': '27 Nakshatras',
      'learn.module.dashas': 'Vimshottari Dasha',
      'learn.module.yogas': 'Raja Yogas & Doshas',
      'learn.module.remedies': 'Remedies & Rituals',
      'learn.preview': 'Preview',
      'learn.locked': 'Subscribers only',

      // Subscription
      'sub.title': 'SUBSCRIPTION',
      'sub.sub': 'Unlock the full AstroPath experience.',
      'sub.free': 'Free',
      'sub.bronze': 'Bronze',
      'sub.silver': 'Silver',
      'sub.gold': 'Gold',
      'sub.perMonth': '/mo',
      'sub.current': 'Current plan',
      'sub.choose': 'Choose',
      'sub.processing': 'Processing payment…',
      'sub.success': 'Subscription activated!',
    },

    hi: {
      'nav.home': 'होम',
      'nav.kundli': 'कुंडली',
      'nav.consult': 'सलाह',
      'nav.ai': 'एआई',
      'nav.settings': 'सेटिंग्स',
      'nav.panchang': 'पंचांग',
      'nav.horoscope': 'राशिफल',
      'nav.learn': 'सीखें',

      'btn.next': 'आगे',
      'btn.back': 'वापस',
      'btn.save': 'सहेजें',
      'btn.edit': 'संपादित करें',
      'btn.logout': 'लॉग आउट',
      'btn.signout': 'साइन आउट',
      'btn.generate': 'कुंडली बनाएं',
      'btn.match': 'कुंडली मिलान',
      'btn.learn': 'ज्योतिष विद्या सीखें',
      'btn.subscribe': 'सदस्यता लें',
      'btn.cancel': 'रद्द करें',

      'onb.step': 'चरण',
      'onb.of': 'का',
      'onb.welcome.title': 'स्वागत है,\nसाधक।',
      'onb.welcome.sub': 'एस्ट्रोपाथ आपकी जन्म कुंडली को रोज़ाना के मार्गदर्शन में बदलता है — राशिफल, पंचांग, अनुष्ठान, और अनुभवी ज्योतिषी। तैयार हैं?',
      'onb.welcome.threeTitle': 'इस सप्ताह तीन चीज़ें',
      'onb.welcome.threeBody': 'व्यक्तिगत कुंडली · दैनिक ब्रह्मांडीय ऊर्जा · एक निःशुल्क एआई परामर्श।',
      'onb.focus.title': 'आप किस क्षेत्र में मार्गदर्शन चाहते हैं?',
      'onb.focus.sub': 'एक या अधिक क्षेत्र चुनें — हम राशिफल और अनुष्ठान उसी के अनुसार ढालेंगे।',
      'onb.focus.career': 'करियर',
      'onb.focus.career.sub': 'दिशा और विकास',
      'onb.focus.love': 'प्रेम',
      'onb.focus.love.sub': 'रिश्ते और मिलान',
      'onb.focus.finance': 'वित्त',
      'onb.focus.finance.sub': 'धन और निर्णय',
      'onb.focus.spiritual': 'आध्यात्मिक',
      'onb.focus.spiritual.sub': 'अनुष्ठान और साधना',
      'onb.lang.title': 'अपनी भाषा चुनें',
      'onb.lang.sub': 'पूरा ऐप आपकी पसंद पर स्विच हो जाएगा। सेटिंग्स से कभी भी बदलें।',
      'onb.birth.title': 'आपका जन्म क्षण',
      'onb.birth.sub': 'कुंडली इंजन लाहिरी अयनांश और आपके सटीक समय + स्थान का उपयोग करता है।',
      'onb.field.name': 'पूरा नाम',
      'onb.field.dob': 'जन्म तिथि',
      'onb.field.tob': 'जन्म समय',
      'onb.field.country': 'देश',
      'onb.field.pincode': 'पिन कोड',
      'onb.field.state': 'राज्य',
      'onb.field.city': 'शहर / ज़िला',
      'onb.field.pincode.help': '6-अंकीय भारतीय पिन कोड डालें — राज्य और शहर अपने-आप भरेंगे।',
      'onb.locked': '🔒 आपकी प्रोफ़ाइल में सुरक्षित। केवल कुंडली गणना के लिए उपयोग।',
      'onb.validation.name': 'कृपया अपना पूरा नाम दर्ज करें।',
      'onb.validation.dob': 'कृपया जन्म तिथि चुनें।',
      'onb.validation.tob': 'कृपया घंटा, मिनट और AM/PM चुनें।',
      'onb.validation.pincode': 'कृपया वैध 6-अंकीय भारतीय पिन कोड डालें।',
      'onb.validation.state': 'कृपया एक राज्य चुनें।',
      'onb.validation.city': 'कृपया एक शहर चुनें।',
      'onb.validation.focus': 'कृपया कम से कम एक क्षेत्र चुनें।',
      'onb.validation.lang': 'कृपया एक भाषा चुनें।',
      'onb.pincode.notfound': 'पिन कोड डायरेक्टरी में नहीं — कृपया मैन्युअल रूप से चुनें।',

      'dash.todayHoroscope': 'आज का राशिफल',
      'dash.readFull': 'पूरा राशिफल पढ़ें →',
      'dash.cosmicEnergy': 'ब्रह्मांडीय ऊर्जा',
      'dash.quickActions': 'त्वरित क्रियाएँ',
      'dash.qa.kundli': 'कुंडली',
      'dash.qa.panchang': 'पंचांग',
      'dash.qa.consult': 'सलाह',
      'dash.qa.ai': 'एआई गुरु',
      'dash.qa.learn': 'सीखें',
      'dash.qa.match': 'मिलान',
      'dash.moonPhase': 'चंद्र कला',
      'dash.recent': 'हाल ही में',
      'dash.seeAll': 'सब देखें',
      'dash.customize': 'अनुकूलित करें',
      'dash.greeting.morning': 'सुप्रभात',
      'dash.greeting.afternoon': 'शुभ दोपहर',
      'dash.greeting.evening': 'शुभ संध्या',
      'dash.greeting.night': 'शुभ रात्रि',

      'horo.title': 'राशिफल',
      'horo.sub': 'आपकी चंद्र राशि के लिए',
      'horo.tab.day': 'दिन',
      'horo.tab.week': 'सप्ताह',
      'horo.tab.month': 'महीना',
      'horo.tab.year': 'वर्ष',
      'horo.areas': 'क्षेत्र',
      'horo.lucky': 'आज के भाग्यशाली',
      'horo.cat.love': 'प्रेम',
      'horo.cat.career': 'करियर',
      'horo.cat.finance': 'वित्त',
      'horo.cat.health': 'स्वास्थ्य',
      'horo.meta.energy': 'ऊर्जा',
      'horo.meta.focus': 'एकाग्रता',
      'horo.meta.peak': 'शीर्ष समय',

      'kundli.title': 'कुंडली',
      'kundli.generate': 'कुंडली बनाएं',
      'kundli.match': 'कुंडली मिलान',
      'kundli.planets': 'ग्रह स्थिति',
      'kundli.dasha': 'विंशोत्तरी दशा',
      'kundli.doshas': 'दोष',
      'kundli.tab.lagna': 'लग्न',
      'kundli.tab.navamsa': 'नवांश',
      'kundli.tab.chandra': 'चंद्र',
      'kundli.details': 'विवरण',
      'kundli.timeline': 'पूरा समय',
      'kundli.remedies': 'उपाय',
      'kundli.match.title': 'दो कुंडली का मिलान',
      'kundli.match.sub': 'दोनों साथियों के जन्म विवरण भरें — गुण मिलान सहित।',
      'kundli.match.partnerA': 'साथी A',
      'kundli.match.partnerB': 'साथी B',

      'panch.title': 'पंचांग',
      'panch.sunrise': 'सूर्योदय',
      'panch.now': 'अभी',
      'panch.sunset': 'सूर्यास्त',
      'panch.elements': 'पंचांग तत्व',
      'panch.moon': 'आज का चंद्र',
      'panch.muhurat': 'मुहूर्त खोजक',
      'panch.muhurat.date': 'तारीख चुनें — अधिकतम 1 वर्ष',
      'panch.muhurat.from': 'से',
      'panch.muhurat.to': 'तक',
      'panch.muhurat.find': 'मुहूर्त खोजें',
      'panch.muhurat.single': 'एक दिन',
      'panch.muhurat.range': 'तिथि सीमा',
      'panch.type.marriage': 'विवाह',
      'panch.type.business': 'व्यवसाय',
      'panch.type.griha': 'गृह',
      'panch.type.travel': 'यात्रा',
      'panch.type.naming': 'नामकरण',

      'settings.title': 'सेटिंग्स',
      'settings.sub': 'हर ब्रह्मांडीय वरीयता नियंत्रित करें',
      'settings.lang': 'भाषा',
      'settings.notif': 'सूचनाएँ',
      'settings.person': 'वैयक्तिकरण',
      'settings.consult': 'डिफ़ॉल्ट परामर्श विधि',
      'settings.trust': 'विश्वास, गोपनीयता और अस्वीकरण',
      'settings.plan': 'सदस्यता',
      'settings.plan.current': 'वर्तमान योजना',
      'settings.plan.manage': 'प्रबंधित करें',

      'learn.title': 'ज्योतिष विद्या सीखें',
      'learn.sub': 'संरचित मॉड्यूल — निःशुल्क पूर्वावलोकन, पूरी पहुँच सदस्यता के साथ।',
      'learn.module.foundations': 'ज्योतिष की मूल बातें',
      'learn.module.rashis': '12 राशियाँ और उनके स्वामी',
      'learn.module.houses': '12 भाव',
      'learn.module.planets': 'ग्रह और कारक',
      'learn.module.nakshatras': '27 नक्षत्र',
      'learn.module.dashas': 'विंशोत्तरी दशा',
      'learn.module.yogas': 'राज योग और दोष',
      'learn.module.remedies': 'उपाय और अनुष्ठान',
      'learn.preview': 'पूर्वावलोकन',
      'learn.locked': 'केवल सदस्यों के लिए',

      'sub.title': 'सदस्यता',
      'sub.sub': 'पूरे एस्ट्रोपाथ अनुभव को अनलॉक करें।',
      'sub.free': 'निःशुल्क',
      'sub.bronze': 'ब्रॉन्ज़',
      'sub.silver': 'सिल्वर',
      'sub.gold': 'गोल्ड',
      'sub.perMonth': '/माह',
      'sub.current': 'वर्तमान योजना',
      'sub.choose': 'चुनें',
      'sub.processing': 'भुगतान प्रगति पर…',
      'sub.success': 'सदस्यता सक्रिय!',
    },

    mr: {
      'nav.home': 'होम',
      'nav.kundli': 'कुंडली',
      'nav.consult': 'सल्ला',
      'nav.ai': 'एआय',
      'nav.settings': 'सेटिंग्ज',
      'nav.panchang': 'पंचांग',
      'nav.horoscope': 'राशीभविष्य',
      'nav.learn': 'शिका',

      'btn.next': 'पुढे',
      'btn.back': 'मागे',
      'btn.save': 'जतन करा',
      'btn.edit': 'संपादन',
      'btn.logout': 'लॉग आउट',
      'btn.signout': 'साइन आउट',
      'btn.generate': 'कुंडली बनवा',
      'btn.match': 'कुंडली जुळवा',
      'btn.learn': 'ज्योतिष विद्या शिका',
      'btn.subscribe': 'सदस्यता घ्या',
      'btn.cancel': 'रद्द करा',

      'onb.step': 'पायरी',
      'onb.of': 'पैकी',
      'onb.welcome.title': 'स्वागत आहे,\nसाधका.',
      'onb.welcome.sub': 'एस्ट्रोपाथ तुमची जन्म कुंडली रोजच्या मार्गदर्शनात रूपांतरित करते — राशीभविष्य, पंचांग, विधी आणि अनुभवी ज्योतिषी.',
      'onb.welcome.threeTitle': 'या आठवड्यात तीन गोष्टी',
      'onb.welcome.threeBody': 'वैयक्तिक कुंडली · दैनंदिन वैश्विक ऊर्जा · एक मोफत एआय सल्ला.',
      'onb.focus.title': 'तुम्हाला कोणत्या क्षेत्रात मार्गदर्शन हवे?',
      'onb.focus.sub': 'एक किंवा अधिक क्षेत्रे निवडा — त्यानुसार राशीभविष्य अनुकूलित केले जाईल.',
      'onb.focus.career': 'करिअर',
      'onb.focus.career.sub': 'दिशा आणि वाढ',
      'onb.focus.love': 'प्रेम',
      'onb.focus.love.sub': 'नाते आणि जुळणी',
      'onb.focus.finance': 'अर्थ',
      'onb.focus.finance.sub': 'संपत्ती आणि निर्णय',
      'onb.focus.spiritual': 'आध्यात्मिक',
      'onb.focus.spiritual.sub': 'विधी आणि साधना',
      'onb.lang.title': 'तुमची भाषा निवडा',
      'onb.lang.sub': 'संपूर्ण अ‍ॅप तुमच्या निवडीवर बदलेल. सेटिंग्जमधून केव्हाही बदला.',
      'onb.birth.title': 'तुमचा जन्म क्षण',
      'onb.birth.sub': 'कुंडली इंजिन लाहिरी अयनांश आणि तुमचा अचूक वेळ + ठिकाण वापरते.',
      'onb.field.name': 'पूर्ण नाव',
      'onb.field.dob': 'जन्म तारीख',
      'onb.field.tob': 'जन्म वेळ',
      'onb.field.country': 'देश',
      'onb.field.pincode': 'पिन कोड',
      'onb.field.state': 'राज्य',
      'onb.field.city': 'शहर / जिल्हा',
      'onb.field.pincode.help': '6-अंकी भारतीय पिन कोड टाका — राज्य व शहर आपोआप भरेल.',
      'onb.locked': '🔒 तुमच्या प्रोफाइलमध्ये सुरक्षित. फक्त कुंडली गणनेसाठी वापर.',
      'onb.validation.name': 'कृपया तुमचे पूर्ण नाव प्रविष्ट करा.',
      'onb.validation.dob': 'कृपया जन्म तारीख निवडा.',
      'onb.validation.tob': 'कृपया तास, मिनिट आणि AM/PM निवडा.',
      'onb.validation.pincode': 'कृपया वैध 6-अंकी भारतीय पिन कोड टाका.',
      'onb.validation.state': 'कृपया राज्य निवडा.',
      'onb.validation.city': 'कृपया शहर निवडा.',
      'onb.validation.focus': 'कृपया किमान एक क्षेत्र निवडा.',
      'onb.validation.lang': 'कृपया भाषा निवडा.',
      'onb.pincode.notfound': 'पिन कोड डायरेक्टरीत नाही — कृपया स्वतः निवडा.',

      'dash.todayHoroscope': 'आजचे राशीभविष्य',
      'dash.readFull': 'पूर्ण राशीभविष्य वाचा →',
      'dash.cosmicEnergy': 'वैश्विक ऊर्जा',
      'dash.quickActions': 'त्वरित क्रिया',
      'dash.qa.kundli': 'कुंडली',
      'dash.qa.panchang': 'पंचांग',
      'dash.qa.consult': 'सल्ला',
      'dash.qa.ai': 'एआय गुरु',
      'dash.qa.learn': 'शिका',
      'dash.qa.match': 'जुळवा',
      'dash.moonPhase': 'चंद्र कला',
      'dash.recent': 'अलीकडील',
      'dash.seeAll': 'सर्व पहा',
      'dash.customize': 'कस्टमाइझ',
      'dash.greeting.morning': 'शुभ सकाळ',
      'dash.greeting.afternoon': 'शुभ दुपार',
      'dash.greeting.evening': 'शुभ सायंकाळ',
      'dash.greeting.night': 'शुभ रात्री',

      'horo.title': 'राशीभविष्य',
      'horo.sub': 'तुमच्या चंद्र राशीसाठी',
      'horo.tab.day': 'दिवस',
      'horo.tab.week': 'आठवडा',
      'horo.tab.month': 'महिना',
      'horo.tab.year': 'वर्ष',
      'horo.areas': 'क्षेत्रे',
      'horo.lucky': 'आजचे भाग्यवान',
      'horo.cat.love': 'प्रेम',
      'horo.cat.career': 'करिअर',
      'horo.cat.finance': 'अर्थ',
      'horo.cat.health': 'आरोग्य',
      'horo.meta.energy': 'ऊर्जा',
      'horo.meta.focus': 'एकाग्रता',
      'horo.meta.peak': 'सर्वोच्च वेळ',

      'kundli.title': 'कुंडली',
      'kundli.generate': 'कुंडली बनवा',
      'kundli.match': 'कुंडली जुळवा',
      'kundli.planets': 'ग्रह स्थिती',
      'kundli.dasha': 'विंशोत्तरी दशा',
      'kundli.doshas': 'दोष',
      'kundli.tab.lagna': 'लग्न',
      'kundli.tab.navamsa': 'नवांश',
      'kundli.tab.chandra': 'चंद्र',
      'kundli.details': 'तपशील',
      'kundli.timeline': 'संपूर्ण वेळापत्रक',
      'kundli.remedies': 'उपाय',
      'kundli.match.title': 'दोन कुंडली जुळवा',
      'kundli.match.sub': 'दोन्ही साथीदारांचे जन्म तपशील भरा — गुण मिलन.',
      'kundli.match.partnerA': 'साथीदार A',
      'kundli.match.partnerB': 'साथीदार B',

      'panch.title': 'पंचांग',
      'panch.sunrise': 'सूर्योदय',
      'panch.now': 'आता',
      'panch.sunset': 'सूर्यास्त',
      'panch.elements': 'पंचांग घटक',
      'panch.moon': 'आजचा चंद्र',
      'panch.muhurat': 'मुहूर्त शोधक',
      'panch.muhurat.date': 'तारीख निवडा — कमाल 1 वर्ष',
      'panch.muhurat.from': 'पासून',
      'panch.muhurat.to': 'पर्यंत',
      'panch.muhurat.find': 'मुहूर्त शोधा',
      'panch.muhurat.single': 'एक दिवस',
      'panch.muhurat.range': 'तारीख मर्यादा',
      'panch.type.marriage': 'विवाह',
      'panch.type.business': 'व्यवसाय',
      'panch.type.griha': 'गृह',
      'panch.type.travel': 'प्रवास',
      'panch.type.naming': 'नामकरण',

      'settings.title': 'सेटिंग्ज',
      'settings.sub': 'प्रत्येक वैश्विक पसंती नियंत्रित करा',
      'settings.lang': 'भाषा',
      'settings.notif': 'सूचना',
      'settings.person': 'वैयक्तिकरण',
      'settings.consult': 'डीफॉल्ट सल्ला पद्धत',
      'settings.trust': 'विश्वास, गोपनीयता व अस्वीकरण',
      'settings.plan': 'सदस्यता',
      'settings.plan.current': 'वर्तमान योजना',
      'settings.plan.manage': 'व्यवस्थापन',

      'learn.title': 'ज्योतिष विद्या शिका',
      'learn.sub': 'संरचित मॉड्यूल — मोफत पूर्वावलोकन, पूर्ण प्रवेश सदस्यतेसह.',
      'learn.module.foundations': 'ज्योतिषाचे मूलतत्त्व',
      'learn.module.rashis': '12 राशी व त्यांचे स्वामी',
      'learn.module.houses': '12 भाव',
      'learn.module.planets': 'ग्रह व कारक',
      'learn.module.nakshatras': '27 नक्षत्रे',
      'learn.module.dashas': 'विंशोत्तरी दशा',
      'learn.module.yogas': 'राज योग व दोष',
      'learn.module.remedies': 'उपाय व विधी',
      'learn.preview': 'पूर्वावलोकन',
      'learn.locked': 'फक्त सदस्यांसाठी',

      'sub.title': 'सदस्यता',
      'sub.sub': 'संपूर्ण एस्ट्रोपाथ अनुभव अनलॉक करा.',
      'sub.free': 'मोफत',
      'sub.bronze': 'ब्रॉन्झ',
      'sub.silver': 'सिल्व्हर',
      'sub.gold': 'गोल्ड',
      'sub.perMonth': '/महिना',
      'sub.current': 'वर्तमान योजना',
      'sub.choose': 'निवडा',
      'sub.processing': 'पेमेंट प्रगतीत…',
      'sub.success': 'सदस्यता सक्रिय!',
    },
  };

  const SUPPORTED = ['en', 'hi', 'mr'];

  function getLocale() {
    try {
      const saved = JSON.parse(localStorage.getItem('astropath.locale') || '"en"');
      return SUPPORTED.includes(saved) ? saved : 'en';
    } catch (_e) { return 'en'; }
  }

  function setLocale(loc) {
    if (!SUPPORTED.includes(loc)) loc = 'en';
    try { localStorage.setItem('astropath.locale', JSON.stringify(loc)); } catch (_e) {}
    apply();
    document.documentElement.setAttribute('lang', loc);
  }

  function t(key, fallback) {
    const loc = getLocale();
    const dict = DICT[loc] || DICT.en;
    if (dict[key]) return dict[key];
    if (DICT.en[key]) return DICT.en[key];
    return fallback !== undefined ? fallback : key;
  }

  function apply(root) {
    const scope = root || document;

    // textContent swaps
    scope.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      const val = t(key, node.textContent);
      // Preserve embedded HTML (e.g. a <span class="req">*</span>) by only
      // swapping the first text node where possible.
      const reqSpan = node.querySelector('.req');
      if (reqSpan) {
        // Wipe existing text nodes; keep the req span.
        const frag = document.createDocumentFragment();
        // Support newlines in translations (render as <br>).
        val.split('\n').forEach((line, i) => {
          if (i > 0) frag.appendChild(document.createElement('br'));
          frag.appendChild(document.createTextNode(line));
        });
        // Remove existing text nodes; keep element children.
        Array.from(node.childNodes).forEach((child) => {
          if (child.nodeType === 3 || (child.nodeType === 1 && child.tagName === 'BR')) {
            node.removeChild(child);
          }
        });
        node.insertBefore(frag, node.firstChild);
      } else if (val.indexOf('\n') !== -1) {
        node.innerHTML = '';
        val.split('\n').forEach((line, i) => {
          if (i > 0) node.appendChild(document.createElement('br'));
          node.appendChild(document.createTextNode(line));
        });
      } else {
        node.textContent = val;
      }
    });

    // placeholder swaps
    scope.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      const key = node.getAttribute('data-i18n-placeholder');
      node.setAttribute('placeholder', t(key, node.getAttribute('placeholder') || ''));
    });

    // generic attribute swaps: data-i18n-attr="aria-label:nav.home"
    scope.querySelectorAll('[data-i18n-attr]').forEach((node) => {
      const spec = node.getAttribute('data-i18n-attr') || '';
      spec.split(',').forEach((entry) => {
        const [attr, key] = entry.split(':').map((s) => (s || '').trim());
        if (attr && key) node.setAttribute(attr, t(key));
      });
    });
  }

  // Auto-apply on DOMContentLoaded so pages don't have to wire it manually.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => apply());
  } else {
    apply();
  }

  window.AstroPathI18n = Object.freeze({
    DICT,
    SUPPORTED,
    t,
    apply,
    getLocale,
    setLocale,
  });
})();
