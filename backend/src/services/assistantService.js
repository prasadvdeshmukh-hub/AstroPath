'use strict';

/*
 * AstroPath AI Assistant — production-minded, deterministic reply engine.
 *
 * Responsibilities:
 *   1. Apply guardrails for medical / legal / financial / self-harm topics.
 *   2. Classify the user prompt into an astrology-relevant intent.
 *   3. Compose a grounded reply that references the user's kundli snapshot
 *      and recent conversation history (server-side memory).
 *   4. Suggest follow-up actions that route to real app surfaces.
 *
 * This intentionally does NOT call an external LLM; the response is rule-based
 * so go-live works offline and stays budget-safe. Swap in a real LLM later by
 * replacing `composeReply()`.
 */

// ------------------------------------------------------------------
// In-memory conversation memory, keyed by userId. Bounded per-user.
// Swap with a repository call when persisting to Firestore long-term.
// ------------------------------------------------------------------
const MAX_TURNS = 20;
const conversations = new Map(); // userId -> [{ role, text, at }]

function getMemory(userId) {
  if (!userId) return [];
  return conversations.get(userId) || [];
}
function appendMemory(userId, turn) {
  if (!userId) return;
  const list = conversations.get(userId) || [];
  list.push({ ...turn, at: new Date().toISOString() });
  while (list.length > MAX_TURNS) list.shift();
  conversations.set(userId, list);
}
function resetMemory(userId) {
  if (userId) conversations.delete(userId);
}

// ------------------------------------------------------------------
// Guardrails. Each detector returns a canned, empathetic decline with a
// pointer to the right professional resource. Order matters (self-harm first).
// ------------------------------------------------------------------
const GUARDRAILS = [
  {
    id: 'self_harm',
    match: /(suicid|kill myself|end my life|self[- ]?harm|cutting myself|want to die)/i,
    reply: {
      en:
        "I hear that things feel heavy right now — I'm not the right support for this. " +
        "Please reach out to a trained counsellor. In India, iCall (9152987821) and Vandrevala " +
        "Foundation (1860-2662-345) offer confidential help. If you are in immediate danger, " +
        "call 112 or go to the nearest emergency room.",
      hi:
        'मुझे आपकी बात की गंभीरता समझ में आती है, पर इस विषय में मैं सही सहायक नहीं हूँ। कृपया ' +
        'प्रशिक्षित काउंसलर से संपर्क करें — iCall (9152987821) और Vandrevala Foundation ' +
        '(1860-2662-345) गोपनीय सहायता देते हैं। तुरंत खतरा हो तो 112 पर कॉल करें।',
      mr:
        'तुमच्या भावना मला जाणवतात, पण यासाठी मी योग्य मदतगार नाही. कृपया प्रशिक्षित समुपदेशकाशी ' +
        'संपर्क साधा — iCall (9152987821) व Vandrevala Foundation (1860-2662-345) गोपनीय ' +
        'मदत देतात. तातडीची गरज असल्यास 112 वर कॉल करा.',
    },
    actions: [
      { id: 'open-guidelines', label: 'Read our wellbeing note' },
    ],
    severity: 'critical',
  },
  {
    id: 'medical',
    match: /(diagnos|prescri|medication|dosage|cancer|pregnan|surg|chemo|mental illness|depression)/i,
    reply: {
      en:
        "I can offer spiritual and lifestyle guidance, not medical advice. For anything related " +
        "to diagnosis, treatment, or medication, please speak with a qualified doctor. Astrology " +
        "should support, never replace, professional medical care.",
      hi:
        'मैं आध्यात्मिक और जीवनशैली मार्गदर्शन दे सकता हूँ, पर चिकित्सकीय सलाह नहीं। निदान, इलाज या ' +
        'दवा से जुड़ा कोई भी प्रश्न कृपया योग्य डॉक्टर से पूछें।',
      mr:
        'मी आध्यात्मिक व जीवनशैलीविषयी मार्गदर्शन देऊ शकतो, पण वैद्यकीय सल्ला नाही. निदान, उपचार किंवा ' +
        'औषधांबाबत कृपया पात्र डॉक्टरांचा सल्ला घ्या.',
    },
    actions: [
      { id: 'book-consultation', label: 'Talk to a wellness astrologer' },
    ],
  },
  {
    id: 'legal',
    match: /(lawsuit|court case|legal advice|divorce proceeding|custody|criminal|visa rejection|contract review)/i,
    reply: {
      en:
        "For anything involving a real legal matter — contracts, custody, court dates — please " +
        "consult a qualified lawyer. I can still help with timing (muhurat) or the emotional " +
        "picture, but not the legal strategy itself.",
      hi:
        'वास्तविक कानूनी मामलों के लिए कृपया योग्य वकील से परामर्श करें। मैं मुहूर्त और भावनात्मक ' +
        'पहलू पर सहायता कर सकता हूँ, पर कानूनी रणनीति नहीं।',
      mr:
        'कायदेशीर विषयांसाठी कृपया पात्र वकीलांचा सल्ला घ्या. मी मुहूर्त व भावनिक बाजूवर मदत करू ' +
        'शकतो, पण कायदेशीर रणनीतीवर नाही.',
    },
    actions: [
      { id: 'find-muhurat', label: 'Find a supportive muhurat' },
    ],
  },
  {
    id: 'financial',
    match: /(stock tip|buy.*stock|which stock|invest in|crypto|trade.*now|multibagger|futures|options|mutual fund)/i,
    reply: {
      en:
        "I will not recommend specific trades, stocks, or crypto. Astrology can flag auspicious " +
        "windows for launches and decisions, but the instrument itself deserves a SEBI-registered " +
        "financial advisor. I can help you pick a muhurat or frame the decision calmly.",
      hi:
        'मैं किसी खास स्टॉक, क्रिप्टो या ट्रेड की सिफारिश नहीं करूँगा। निर्णय के लिए मुहूर्त और दृष्टिकोण पर ' +
        'सहायता मिल सकती है, पर विशिष्ट निवेश के लिए SEBI-पंजीकृत सलाहकार से मिलें।',
      mr:
        'मी विशिष्ट स्टॉक, क्रिप्टो किंवा ट्रेडची शिफारस करणार नाही. मुहूर्त व दृष्टिकोनावर मदत मिळेल, पण ' +
        'गुंतवणुकीसाठी SEBI-नोंदणीकृत सल्लागारांचा सल्ला घ्या.',
    },
    actions: [
      { id: 'find-muhurat', label: 'Find a launch muhurat' },
    ],
  },
];

function matchGuardrail(prompt) {
  for (const g of GUARDRAILS) if (g.match.test(prompt)) return g;
  return null;
}

// ------------------------------------------------------------------
// Intent classifier — simple keyword tagger.
// ------------------------------------------------------------------
const INTENTS = [
  { id: 'career',       pattern: /(career|job|work|promo|boss|office|resign|layoff|interview)/i },
  { id: 'marriage',     pattern: /(marriage|wedding|partner|spouse|match|rishta|compatibility|guna)/i },
  { id: 'relationship', pattern: /(relationship|girlfriend|boyfriend|breakup|fight|family|parent)/i },
  { id: 'kundli',       pattern: /(kundli|kundali|chart|lagna|ascendant|moon sign|sun sign|dasha|navamsa)/i },
  { id: 'remedy',       pattern: /(remedy|remedies|mantra|pooja|puja|upay|donation|stone|gem|rudraksh)/i },
  { id: 'muhurat',      pattern: /(muhurat|muhurta|auspicious time|when should i|best time|date to)/i },
  { id: 'travel',       pattern: /(travel|trip|journey|flight|relocation|shift city|move to)/i },
  { id: 'horoscope',    pattern: /(today|tomorrow|this week|horoscope|forecast|prediction)/i },
];

function classifyIntent(prompt) {
  for (const i of INTENTS) if (i.pattern.test(prompt)) return i.id;
  return 'general';
}

// ------------------------------------------------------------------
// Reply composer. Uses kundli snapshot + intent to produce a grounded answer.
// ------------------------------------------------------------------
function kundliLine(kundli, locale) {
  if (!kundli) return null;
  // Support both the raw kundliService output and a condensed "summary" shape
  // pushed from the client (state.lastKundli).
  const summary = kundli.summary || {};
  const lagna =
    summary.lagnaSign ||
    summary.lagna ||
    (kundli.lagna && kundli.lagna.sign) ||
    '';
  const moon = summary.moonSign || kundli.moonSign || '';
  const sun  = summary.sunSign  || kundli.sunSign  || '';
  if (!lagna && !moon && !sun) return null;
  if (locale === 'hi') {
    return `आपकी कुंडली से: लग्न ${lagna || '—'}, चंद्र ${moon || '—'}, सूर्य ${sun || '—'}.`;
  }
  if (locale === 'mr') {
    return `तुमच्या कुंडलीनुसार: लग्न ${lagna || '—'}, चंद्र ${moon || '—'}, सूर्य ${sun || '—'}.`;
  }
  return `From your chart: Lagna ${lagna || '—'}, Moon in ${moon || '—'}, Sun in ${sun || '—'}.`;
}

const INTENT_BODIES = {
  career: {
    en:
      'For career questions, separate the role change from the timing. Write down the one decision you actually need to make this week, and the one you can defer for 30 days. Then pick a calm Abhijit or Amrit window to send the important email or have the hard conversation.',
    hi:
      'करियर के सवालों में भूमिका बदलाव और समय को अलग रखें। इस सप्ताह जो एक निर्णय वास्तव में चाहिए उसे लिखें, और जिसे 30 दिन के लिए टाला जा सकता है उसे भी। फिर अभिजित या अमृत काल में महत्वपूर्ण ईमेल या बातचीत करें।',
    mr:
      'करियरच्या प्रश्नात भूमिका बदल व वेळ वेगळे ठेवा. या आठवड्यात घ्यायचाच एक निर्णय आणि 30 दिवस टाळता येणारा एक — हे लिहून काढा. मग अभिजित किंवा अमृत काळात महत्त्वाचा ईमेल पाठवा किंवा संवाद करा.',
  },
  marriage: {
    en:
      'For marriage-related questions I look at Guna Milan, Mangal Dosha, and the 7th house lord of both charts. The most useful thing now is a clear Guna score and a short list of compatibility gaps you can discuss openly with family.',
    hi:
      'विवाह प्रश्नों में गुण मिलान, मंगल दोष और दोनों कुंडलियों के सप्तम भाव स्वामी देखें। अभी सबसे उपयोगी है एक साफ गुण स्कोर और कुछ बातें जो परिवार के साथ खुलकर चर्चा की जा सकें।',
    mr:
      'विवाहविषयक प्रश्नात गुणमिलन, मंगलदोष व दोन्ही कुंडल्यांचा सप्तमेश पाहतो. सध्या उपयोगी म्हणजे स्पष्ट गुणांक व कुटुंबाशी खुलेपणाने बोलण्यासाठी काही मुद्दे.',
  },
  relationship: {
    en:
      'Relationship friction often maps to transits over the 4th and 7th houses. Tonight, pause before reacting: write one sentence you want the other person to hear. Bring that sentence into your next calm conversation.',
    hi:
      'रिश्तों की बेचैनी अक्सर चतुर्थ और सप्तम भाव के गोचर से जुड़ी होती है। आज रात प्रतिक्रिया देने से पहले एक वाक्य लिखें जो आप दूसरे व्यक्ति को सुनाना चाहते हैं — और वही शांत बातचीत में बोलें।',
    mr:
      'नात्यांतील तणाव चतुर्थ व सप्तम भावांच्या गोचराशी जोडलेला असतो. आज रात्री प्रतिक्रिया देण्यापूर्वी एकच वाक्य लिहा जे समोरच्याला ऐकवायचे आहे — तेच शांत संभाषणात बोला.',
  },
  kundli: {
    en:
      'I read your chart as a combination of three voices: Lagna (how you show up), Moon (how you feel), Sun (what you lead with). Tell me which of these three feels most stuck, and I will focus there.',
    hi:
      'आपकी कुंडली को मैं तीन आवाज़ों के रूप में पढ़ता हूँ: लग्न (कैसे दिखते हैं), चंद्र (कैसा महसूस करते हैं), सूर्य (किस दिशा में आगे बढ़ते हैं)। बताइए इनमें से कौन सी अभी सबसे अटकी हुई लगती है, मैं वहीं ध्यान दूँगा।',
    mr:
      'तुमची कुंडली मी तीन आवाजांमध्ये वाचतो: लग्न (कसे दिसता), चंद्र (कसे वाटते), सूर्य (कोणत्या दिशेने जाता). यांपैकी कोणता आत्ता सर्वाधिक अडलेला वाटतो ते सांगा, तिथेच लक्ष देतो.',
  },
  remedy: {
    en:
      'Remedies work best when they are small, daily, and consistent. I suggest: a 10-minute sunrise routine (water to the east), a single mantra chanted 11 times with attention, and one act of quiet seva per week. Skip expensive gems unless an astrologer you trust prescribes them from your chart.',
    hi:
      'उपाय तभी काम करते हैं जब वे छोटे, नियमित और निरंतर हों। सुझाव: सूर्योदय पर 10 मिनट की दिनचर्या (पूर्व में जल), एक मंत्र का 11 बार ध्यानपूर्वक जाप, और सप्ताह में एक छोटी सेवा। महंगे रत्न तब तक न लें जब तक कोई विश्वसनीय ज्योतिषी आपकी कुंडली से न कहे।',
    mr:
      'उपाय छोटे, नियमित व सातत्यपूर्ण असतील तरच काम करतात. सुचना: सूर्योदयी 10 मिनिटांची दिनचर्या (पूर्वेला पाणी), एक मंत्र 11 वेळा लक्षपूर्वक जप, व आठवड्यात एक लहान सेवा. महागडे रत्न विश्वासार्ह ज्योतिषाने कुंडलीनुसार सांगेपर्यंत घेऊ नका.',
  },
  muhurat: {
    en:
      'For choosing a window, avoid Rahu Kaal and look for Abhijit or Amrit Kaal on the day you already have flexibility. Give me the activity (marriage, launch, griha pravesh, travel, naming) and a date range, and I will narrow the window.',
    hi:
      'समय चुनने के लिए राहु काल से बचें और अभिजित या अमृत काल देखें। गतिविधि (विवाह, लॉन्च, गृह प्रवेश, यात्रा, नामकरण) और तारीख़ की सीमा बताइए, मैं विंडो कम कर दूँगा।',
    mr:
      'वेळ निवडताना राहू काळ टाळा व अभिजित किंवा अमृत काळ पहा. कार्य (विवाह, लॉन्च, गृहप्रवेश, प्रवास, नामकरण) आणि तारीख-पट्टा सांगा, मी विंडो अरुंद करून देतो.',
  },
  travel: {
    en:
      'Travel is kindest in windows where your chart\'s 3rd and 9th lords are not retrograde. For any international move, plan the first step during a waxing moon and avoid the two days around an eclipse.',
    hi:
      'यात्रा उन समयों में अनुकूल रहती है जब कुंडली के तृतीय और नवम भाव के स्वामी वक्री न हों। अंतरराष्ट्रीय बदलाव के लिए पहला कदम शुक्ल पक्ष में रखें और ग्रहण के आसपास दो दिन टालें।',
    mr:
      'प्रवास कुंडलीच्या तृतीय व नवम भावाचे स्वामी वक्री नसताना अनुकूल असतो. आंतरराष्ट्रीय बदलासाठी पहिले पाऊल शुक्ल पक्षात ठेवा आणि ग्रहणाच्या जवळचे दोन दिवस टाळा.',
  },
  horoscope: {
    en:
      'For a daily read, check the headline first, then energy score, then one caution line. If you want tomorrow or this week, tell me which and I will pull the forecast.',
    hi:
      'दैनिक रीडिंग के लिए पहले हेडलाइन देखें, फिर ऊर्जा स्कोर, फिर एक सावधानी पंक्ति। कल या इस सप्ताह के लिए कहें, मैं पूर्वानुमान ले आऊँगा।',
    mr:
      'दैनिक वाचनासाठी आधी ठळक ओळ पहा, मग ऊर्जा स्कोअर, व एक सावधानतेची ओळ. उद्याचे किंवा या आठवड्याचे हवे असल्यास सांगा, मी अंदाज आणतो.',
  },
  general: {
    en:
      'Tell me a little more — is this about career, a relationship, health of a decision, a specific date, or understanding your chart? I will keep my reply grounded in your kundli and current transits.',
    hi:
      'थोड़ा और बताइए — यह करियर, रिश्ते, किसी निर्णय, विशिष्ट तारीख़, या कुंडली समझने के बारे में है? मैं उत्तर कुंडली और वर्तमान गोचर पर आधारित रखूँगा।',
    mr:
      'थोडे अधिक सांगा — हा प्रश्न करियर, नाते, निर्णय, विशिष्ट तारीख, की कुंडली समजून घेण्याबद्दल आहे? मी उत्तर कुंडली व सध्याच्या गोचरावर आधारित ठेवतो.',
  },
};

const ACTION_LIBRARY = {
  en: {
    'read-horoscope':     "Read today's full horoscope",
    'book-consultation':  'Talk to a human astrologer',
    'open-kundli':        'Open my kundli',
    'find-muhurat':       'Find a muhurat',
    'open-guidelines':    'Read our wellbeing note',
  },
  hi: {
    'read-horoscope':     'आज का पूर्ण राशिफल पढ़ें',
    'book-consultation':  'किसी ज्योतिषी से बात करें',
    'open-kundli':        'मेरी कुंडली खोलें',
    'find-muhurat':       'मुहूर्त खोजें',
    'open-guidelines':    'हमारा कल्याण नोट पढ़ें',
  },
  mr: {
    'read-horoscope':     'आजचे पूर्ण राशिभविष्य वाचा',
    'book-consultation':  'ज्योतिषाशी बोला',
    'open-kundli':        'माझी कुंडली उघडा',
    'find-muhurat':       'मुहूर्त शोधा',
    'open-guidelines':    'आमची कल्याण नोंद वाचा',
  },
};

function pickLocale(obj, locale) {
  if (!obj) return '';
  return obj[locale] || obj.en || '';
}

function actionsForIntent(intent, locale) {
  const lib = ACTION_LIBRARY[locale] || ACTION_LIBRARY.en;
  const base = [];
  switch (intent) {
    case 'career':
    case 'marriage':
    case 'relationship':
    case 'kundli':
      base.push({ id: 'open-kundli', label: lib['open-kundli'] });
      base.push({ id: 'book-consultation', label: lib['book-consultation'] });
      break;
    case 'muhurat':
    case 'travel':
      base.push({ id: 'find-muhurat', label: lib['find-muhurat'] });
      base.push({ id: 'book-consultation', label: lib['book-consultation'] });
      break;
    case 'horoscope':
      base.push({ id: 'read-horoscope', label: lib['read-horoscope'] });
      base.push({ id: 'book-consultation', label: lib['book-consultation'] });
      break;
    case 'remedy':
      base.push({ id: 'open-kundli', label: lib['open-kundli'] });
      base.push({ id: 'book-consultation', label: lib['book-consultation'] });
      break;
    default:
      base.push({ id: 'read-horoscope', label: lib['read-horoscope'] });
      base.push({ id: 'open-kundli', label: lib['open-kundli'] });
  }
  return base;
}

// Gently reference recent conversation so the reply feels continuous.
// IMPORTANT: Never echo text that tripped a guardrail — doing so can retraumatize
// a user in crisis or surface sensitive phrasing. We also skip very short or
// guardrail-marked turns.
function memoryEcho(history, locale) {
  if (!Array.isArray(history) || history.length < 2) return null;
  const reversed = [...history].reverse();
  const earlierUser = reversed.find((t) => {
    if (!t || typeof t.text !== 'string') return false;
    if (!(t.role === 'user' || t.isUser)) return false;
    if (t.sensitive || t.guardrail) return false; // skip flagged turns
    if (matchGuardrail(t.text)) return false;     // belt + suspenders
    return true;
  });
  if (!earlierUser || !earlierUser.text) return null;
  const snippet = earlierUser.text.trim().slice(0, 80);
  if (snippet.length < 6) return null;
  if (locale === 'hi') return `पिछली बात से जोड़ते हुए — "${snippet}" — `;
  if (locale === 'mr') return `आधीच्या संवादाच्या अनुषंगाने — "${snippet}" — `;
  return `Building on what you shared — "${snippet}" — `;
}

function disclaimer(locale) {
  if (locale === 'hi') return 'यह मार्गदर्शन सलाहकार है, निश्चित भविष्यवाणी नहीं।';
  if (locale === 'mr') return 'हे मार्गदर्शन सल्लावजा आहे, निश्चित भविष्य नाही.';
  return 'This guidance is advisory, not a deterministic prediction.';
}

/**
 * Main entry — compose a full reply.
 * @param {Object} ctx
 * @param {string} ctx.userId
 * @param {string} ctx.prompt
 * @param {string} [ctx.locale]
 * @param {Array}  [ctx.history]  client-supplied recent turns
 * @param {Object} [ctx.kundli]   recent kundli snapshot (may be null)
 */
function composeReply(ctx) {
  const prompt = (ctx.prompt || '').trim();
  const locale = (ctx.locale === 'hi' || ctx.locale === 'mr') ? ctx.locale : 'en';

  // 1. Guardrails
  const guard = matchGuardrail(prompt);
  if (guard) {
    const text = pickLocale(guard.reply, locale);
    return {
      prompt,
      reply: text,
      intent: 'guardrail',
      guardrail: guard.id,
      refusal: true,
      severity: guard.severity || 'info',
      disclaimer: disclaimer(locale),
      suggestedActions: (guard.actions || []).map((a) => ({
        id: a.id,
        label: (ACTION_LIBRARY[locale] && ACTION_LIBRARY[locale][a.id]) || a.label,
      })),
      nonDeterministic: false,
    };
  }

  // 2. Intent + composition
  const intent = classifyIntent(prompt);
  const body = pickLocale(INTENT_BODIES[intent] || INTENT_BODIES.general, locale);
  const parts = [];

  const echo = memoryEcho(ctx.history, locale);
  if (echo) parts.push(echo + body);
  else      parts.push(body);

  const chart = kundliLine(ctx.kundli, locale);
  if (chart) parts.push(chart);

  parts.push(disclaimer(locale));

  return {
    prompt,
    reply: parts.join(' '),
    intent,
    guardrail: null,
    refusal: false,
    disclaimer: disclaimer(locale),
    suggestedActions: actionsForIntent(intent, locale),
    nonDeterministic: true,
  };
}

module.exports = {
  composeReply,
  getMemory,
  appendMemory,
  resetMemory,
  // exposed for tests
  _internals: { matchGuardrail, classifyIntent },
};
