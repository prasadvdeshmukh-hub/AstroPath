'use strict';

// Nakshatra + pada from sidereal longitude.
// 27 nakshatras across 360° -> each is 13°20' = 13.3333... degrees wide.
// Each nakshatra is divided into 4 padas of 3°20' = 3.3333...° each.

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

// Vimshottari dasha lords, one per nakshatra, repeating every 9.
// Starts at Ashwini = Ketu, Bharani = Venus, Krittika = Sun, ...
const DASHA_LORDS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
];

const NAKSHATRA_SPAN = 360 / 27; // 13.333...
const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3.333...

function nakshatraInfo(siderealLongitudeDeg) {
  const n = ((siderealLongitudeDeg % 360) + 360) % 360;
  const index = Math.floor(n / NAKSHATRA_SPAN);
  const offsetInNak = n - index * NAKSHATRA_SPAN;
  const pada = Math.min(4, Math.floor(offsetInNak / PADA_SPAN) + 1);
  const lord = DASHA_LORDS[index % 9];
  return {
    index,
    name: NAKSHATRAS[index],
    pada,
    lord,
    offsetInNakshatra: Number(offsetInNak.toFixed(4)),
    spanRemainingDeg: Number((NAKSHATRA_SPAN - offsetInNak).toFixed(4)),
  };
}

module.exports = { NAKSHATRAS, DASHA_LORDS, NAKSHATRA_SPAN, PADA_SPAN, nakshatraInfo };
