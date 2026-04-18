'use strict';

// Rashi (zodiac sign) lookup and whole-sign house helpers.
// Sidereal longitudes are assumed (Lahiri).

const SIGNS_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
const SIGNS_HI = [
  '\u092e\u0947\u0937', '\u0935\u0943\u0937\u092d', '\u092e\u093f\u0925\u0941\u0928', '\u0915\u0930\u094d\u0915', '\u0938\u093f\u0902\u0939', '\u0915\u0928\u094d\u092f\u093e',
  '\u0924\u0941\u0932\u093e', '\u0935\u0943\u0936\u094d\u091a\u093f\u0915', '\u0927\u0928\u0941', '\u092e\u0915\u0930', '\u0915\u0941\u0902\u092d', '\u092e\u0940\u0928',
];
// Marathi rashi names. Most mirror Sanskrit/Hindi forms; Tula ends with the
// Marathi-specific letter LLA (U+0933).
const SIGNS_MR = [
  '\u092e\u0947\u0937', '\u0935\u0943\u0937\u092d', '\u092e\u093f\u0925\u0941\u0928', '\u0915\u0930\u094d\u0915', '\u0938\u093f\u0902\u0939', '\u0915\u0928\u094d\u092f\u093e',
  '\u0924\u0942\u0933', '\u0935\u0943\u0936\u094d\u091a\u093f\u0915', '\u0927\u0928\u0941', '\u092e\u0915\u0930', '\u0915\u0941\u0902\u092d', '\u092e\u0940\u0928',
];

function signIndex(siderealLongitudeDeg) {
  const n = ((siderealLongitudeDeg % 360) + 360) % 360;
  return Math.floor(n / 30);
}

function signName(siderealLongitudeDeg, locale) {
  const idx = signIndex(siderealLongitudeDeg);
  if (locale === 'hi') return SIGNS_HI[idx];
  if (locale === 'mr') return SIGNS_MR[idx];
  return SIGNS_EN[idx];
}

function signDegrees(siderealLongitudeDeg) {
  const n = ((siderealLongitudeDeg % 360) + 360) % 360;
  return Number((n - Math.floor(n / 30) * 30).toFixed(2));
}

function wholeSignHouse(siderealLongitudeDeg, lagnaLongitudeDeg) {
  const planetSign = signIndex(siderealLongitudeDeg);
  const lagnaSign = signIndex(lagnaLongitudeDeg);
  return ((planetSign - lagnaSign + 12) % 12) + 1;
}

module.exports = {
  SIGNS_EN,
  SIGNS_HI,
  SIGNS_MR,
  signIndex,
  signName,
  signDegrees,
  wholeSignHouse,
};
