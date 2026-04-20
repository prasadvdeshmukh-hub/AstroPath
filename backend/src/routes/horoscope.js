'use strict';

const express = require('express');
const { ok } = require('../utils/envelope');
const { badRequest } = require('../utils/errors');

const router = express.Router();

const CATEGORIES = ['love', 'career', 'finance', 'health'];

// Per-range messaging. Each range gets its own voice so the UI tabs feel
// meaningfully distinct — otherwise weekly/monthly/yearly look identical.
const MESSAGES = {
  daily: {
    love:    { en: 'Emotional currents run warm — listen more than you explain.',    hi: 'भावनात्मक ऊर्जा कोमल है — समझाने से अधिक सुनें।',               mr: 'भावना सौम्य आहेत — समजावण्यापेक्षा ऐका.' },
    career:  { en: 'Good timing for visible decisions — document your reasoning.',     hi: 'स्पष्ट निर्णयों के लिए उपयुक्त समय — अपने कारण लिखकर रखें।',   mr: 'स्पष्ट निर्णयांसाठी योग्य वेळ — कारणे नोंदवा.' },
    finance: { en: 'Avoid rushed commitments after sunset; morning reviews favor you.', hi: 'सूर्यास्त के बाद जल्दबाजी से बचें; सुबह की समीक्षा आपके पक्ष में है।', mr: 'सूर्यास्तानंतर घाई टाळा; सकाळचा आढावा तुमच्या बाजूने.' },
    health:  { en: 'Hydrate, rest early, and guard against over-committing your calendar.', hi: 'हाइड्रेट रहें, जल्दी आराम करें, और अधिक commitments से बचें।',  mr: 'पाणी प्या, लवकर विश्रांती घ्या, अधिक बांधिलकी टाळा.' },
  },
  weekly: {
    love:    { en: 'Mid-week brings a warm conversation; Thursday favors reconciliation.', hi: 'सप्ताह के मध्य में आत्मीय बातचीत; गुरुवार सुलह के अनुकूल है।', mr: 'आठवड्याच्या मध्यात उबदार संवाद; गुरुवार सलोख्यासाठी शुभ.' },
    career:  { en: 'Launch windows open Tue and Fri; defer big pitches to Fri afternoon.',  hi: 'मंगल और शुक्र को लॉन्च के अवसर; बड़ी पेशकशें शुक्र दोपहर को करें।', mr: 'मंगळ व शुक्रवारी लाँचसाठी खिडकी; मोठ्या प्रस्तावांना शुक्र दुपार.' },
    finance: { en: 'Review recurring expenses by Wed; avoid new debt through Sat.',         hi: 'बुधवार तक खर्चों की समीक्षा; शनिवार तक नया कर्ज न लें।',         mr: 'बुधवारपर्यंत खर्चांचा आढावा; शनिवारपर्यंत नवीन कर्ज टाळा.' },
    health:  { en: 'Prioritise sleep Mon–Wed; outdoor activity gains on the weekend.',      hi: 'सोम-बुध को नींद को प्राथमिकता; सप्ताहांत में बाहरी गतिविधि लाभदायक।', mr: 'सोम-बुध झोपेला प्राधान्य; आठवड्याच्या शेवटी बाहेरील क्रियाकलाप.' },
  },
  monthly: {
    love:    { en: 'First fortnight renews a bond; second half tests communication — be patient.', hi: 'पहला पखवाड़ा संबंधों को नयापन देगा; दूसरा आधा संवाद की परीक्षा लेगा — धैर्य रखें।', mr: 'पहिल्या पंधरवड्यात नाते ताजेतवाने; दुसऱ्या अर्ध्यात संवादाची परीक्षा — संयम.' },
    career:  { en: 'Visibility rises early; lock promotions or contracts before the full moon.',    hi: 'प्रारंभ में दृश्यता बढ़ेगी; पूर्णिमा से पहले प्रमोशन/अनुबंध पक्का करें।',              mr: 'सुरुवातीला प्रकटता वाढेल; पूर्णिमेआधी बढती/करार पक्का करा.' },
    finance: { en: 'Saturn transit stabilises savings; avoid speculative plays this cycle.',        hi: 'शनि गोचर बचत स्थिर करेगा; इस चक्र में सट्टा निवेश से बचें।',                              mr: 'शनि गोचर बचत स्थिर करेल; सट्टा गुंतवणूक टाळा.' },
    health:  { en: 'Preventive care now prevents a cluster of minor issues later this quarter.',    hi: 'अभी निवारक देखभाल से आगे छोटी-छोटी समस्याओं से बचाव होगा।',                              mr: 'आत्ताच प्रतिबंधात्मक काळजी घ्या — पुढील काळात समस्या कमी.' },
  },
  yearly: {
    love:    { en: 'A Rahu–Venus arc marks a decisive relationship chapter — commit or release.', hi: 'राहु-शुक्र का चक्र निर्णायक अध्याय लाएगा — प्रतिबद्ध हों या मुक्त।',  mr: 'राहू-शुक्र चक्र निर्णायक अध्याय आणेल — बांधिलकी किंवा मुक्ती.' },
    career:  { en: 'Jupiter transit through your 10th house backs a visible leap — plan the pitch.', hi: 'बृहस्पति का दशम भाव में गोचर दृश्य छलांग का समर्थन करेगा — योजना बनाएं।',  mr: 'गुरू दहाव्या स्थानातून जाणारा — दृश्य झेप घ्या.' },
    finance: { en: 'Long-term assets outperform short-term trades; diversify beyond mid-year.',       hi: 'दीर्घकालिक निवेश अल्पकालिक से बेहतर; वर्ष के मध्य के बाद विविधीकरण करें।',  mr: 'दीर्घकालीन मालमत्ता अल्पकालीनपेक्षा चांगली; वर्षाच्या मध्यानंतर विविधता.' },
    health:  { en: 'Anchor a year-long discipline by Navratri; it compounds through Diwali of next year.', hi: 'नवरात्रि तक एक वार्षिक अनुशासन बनाएं; अगले वर्ष दिवाली तक लाभ बढ़ेगा।',  mr: 'नवरात्रीपर्यंत वार्षिक शिस्त ठरवा; पुढील दिवाळीपर्यंत फायदा वाढेल.' },
  },
};

// Score perturbation per range so tabs feel quantitatively different too.
const SCORE_BIAS = { daily: 0, weekly: 6, monthly: -4, yearly: 12 };

function pickLocale(obj, locale) {
  if (locale === 'hi' && obj.hi) return obj.hi;
  if (locale === 'mr' && obj.mr) return obj.mr;
  return obj.en;
}

function payload(locale, range) {
  const bias = SCORE_BIAS[range] || 0;
  const cats = CATEGORIES.map((c) => ({
    category: c,
    headline:
      range === 'daily'   ? (locale === 'hi' ? 'आज का संकेत'     : locale === 'mr' ? 'आजचा संकेत'     : "Today's signal") :
      range === 'weekly'  ? (locale === 'hi' ? 'सप्ताह का रुझान' : locale === 'mr' ? 'आठवड्याचा कल' : 'Weekly outlook') :
      range === 'monthly' ? (locale === 'hi' ? 'मासिक मार्गदर्शन' : locale === 'mr' ? 'मासिक मार्गदर्शन': 'Monthly guidance') :
                            (locale === 'hi' ? 'वार्षिक अध्याय'  : locale === 'mr' ? 'वार्षिक अध्याय' : 'Yearly chapter'),
    body: pickLocale(MESSAGES[range][c], locale),
    score: Math.max(10, Math.min(99, 55 + ((c.length * 7) % 45) + bias)),
  }));
  // Compute a friendly period label (e.g. "Week of 20 Apr 2026", "April 2026", "2026")
  const now = new Date();
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monFull = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  let periodLabel = now.toDateString();
  if (range === 'weekly')  periodLabel = 'Week of ' + now.getDate() + ' ' + monthNames[now.getMonth()] + ' ' + now.getFullYear();
  if (range === 'monthly') periodLabel = monFull[now.getMonth()] + ' ' + now.getFullYear();
  if (range === 'yearly')  periodLabel = String(now.getFullYear());
  return {
    range,
    asOf: new Date().toISOString(),
    periodLabel,
    categories: cats,
  };
}

router.get('/:range(daily|weekly|monthly|yearly)', (req, res) => {
  return ok(res, payload(req.locale, req.params.range), {
    locale: req.locale,
    userId: req.user.id,
  });
});

// Convenience alias
router.get('/', (req, res, next) => {
  const range = (req.query.range || 'daily').toString();
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(range)) {
    return next(badRequest('range must be one of daily, weekly, monthly, yearly.'));
  }
  return ok(res, payload(req.locale, range));
});

module.exports = router;
