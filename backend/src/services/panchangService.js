'use strict';

// Complete panchang computation: vara, tithi, nakshatra, yoga, karana, sunrise/sunset, Rahu Kalam.

const { julianDateUT } = require('./astronomy/julianDate');
const { sunLongitude, moonLongitude } = require('./astronomy/sunMoon');
const { tropicalToSidereal, lahiriAyanamsa } = require('./astronomy/ayanamsa');
const { nakshatraInfo, NAKSHATRAS } = require('./astronomy/nakshatra');
const { sunTimes, moonTimes } = require('./astronomy/sunrise');

const VARAS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const VARAS_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
const VARAS_MR = ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
function localizedVara(idx, locale) {
  if (locale === 'hi') return VARAS_HI[idx];
  if (locale === 'mr') return VARAS_MR[idx];
  return VARAS[idx];
}

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi',
];

const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti',
];

const KARANA_REPEATING = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti'];
const KARANA_FIXED = ['Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'];

// Compute vara (weekday): JD mod 7, where 0 = Sunday.
function computeVara(JD) {
  const vara = Math.floor(JD + 1.5) % 7;
  return VARAS[vara];
}

// Compute tithi: difference between moon and sun longitudes (sidereal).
function computeTithi(sunLongSidereal, moonLongSidereal) {
  let diff = (moonLongSidereal - sunLongSidereal) % 360;
  if (diff < 0) diff += 360;

  const tithiIndex = Math.floor(diff / 12);
  const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';

  let tithiName;
  if (tithiIndex === 29) {
    tithiName = 'Amavasya';
  } else if (tithiIndex < 15) {
    tithiName = TITHI_NAMES[tithiIndex];
    if (tithiIndex === 14) tithiName = 'Purnima';
  } else {
    const idx = tithiIndex - 15;
    tithiName = TITHI_NAMES[idx];
    if (idx === 14) tithiName = 'Amavasya';
  }

  return {
    tithiIndex,
    tithi: tithiName,
    paksha,
  };
}

// Compute yoga: sum of sun + moon sidereal longitudes / (360/27).
function computeYoga(sunLongSidereal, moonLongSidereal) {
  let sum = (sunLongSidereal + moonLongSidereal) % 360;
  if (sum < 0) sum += 360;

  const yogaIndex = Math.floor(sum / (360 / 27));
  return {
    yogaIndex,
    yoga: YOGA_NAMES[yogaIndex],
  };
}

// Compute karana: difference / 6 gives halfIndex in [0..59].
function computeKarana(diff) {
  const halfIndex = Math.floor(diff / 6);

  let karana;
  if (halfIndex === 0) {
    karana = 'Kimstughna';
  } else if (halfIndex === 57) {
    karana = 'Shakuni';
  } else if (halfIndex === 58) {
    karana = 'Chatushpada';
  } else if (halfIndex === 59) {
    karana = 'Naga';
  } else {
    karana = KARANA_REPEATING[(halfIndex - 1) % 7];
  }

  return karana;
}

// Compute Rahu Kalam (1/8 of daylight, varies by weekday).
// Returns { start, end } as HH:MM local strings, or null if sunrise/sunset unavailable.
function computeRahuKalam(sunrise, sunset, varaIndex) {
  if (!sunrise || !sunset) {
    return null;
  }

  // Parse HH:MM strings to fractional hours.
  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
  };

  const sunriseHours = parseTime(sunrise);
  const sunsetHours = parseTime(sunset);
  let dayLength = sunsetHours - sunriseHours;

  // Wrap across midnight.
  if (dayLength < 0) dayLength += 24;

  const slotLength = dayLength / 8;

  // Slot assignment by vara (1-indexed):
  // Sun=8, Mon=2, Tue=7, Wed=5, Thu=6, Fri=4, Sat=3
  const slotMap = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 };
  const slotNum = slotMap[varaIndex];

  const rahuStart = sunriseHours + (slotNum - 1) * slotLength;
  const rahuEnd = sunriseHours + slotNum * slotLength;

  const formatTime = (hours) => {
    let h = hours % 24;
    if (h < 0) h += 24;
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  return {
    start: formatTime(rahuStart),
    end: formatTime(rahuEnd),
  };
}

// Simple heuristic for auspiciousness.
function computeAuspicious(yoga, locale) {
  const inauspicious = [
    'Vyatipata', 'Vaidhriti', 'Vyaghata', 'Atiganda', 'Parigha',
  ];

  const isFavourable = !inauspicious.includes(yoga);

  if (locale === 'hi') {
    return isFavourable
      ? 'अनुकूल दिन'
      : 'आज दुर्भाग्यपूर्ण है, महत्वपूर्ण कार्य टालें।';
  }
  if (locale === 'mr') {
    return isFavourable
      ? 'आजचा दिवस अनुकूल आहे.'
      : 'आज अशुभ काळ आहे; महत्त्वाची कामे पुढे ढकला.';
  }

  return isFavourable
    ? 'Favourable day for new beginnings.'
    : 'Inauspicious period; defer important actions.';
}

// Main panchang computation.
function compute({ date, latitudeDeg, longitudeDeg, tzOffsetMinutes, locale = 'en' }) {
  const [yStr, moStr, dStr] = date.split('-');
  const year = Number(yStr);
  const month = Number(moStr);
  const day = Number(dStr);

  // Compute at 0h UT.
  const jd0 = julianDateUT(year, month, day, 0);

  // Get ayanamsa for tropical -> sidereal conversion.
  const ayanamsa = lahiriAyanamsa(jd0);

  // Sun and Moon tropical longitudes.
  const sunLongTropical = sunLongitude(jd0);
  const moonLongTropical = moonLongitude(jd0);

  // Convert to sidereal.
  const sunLongSidereal = tropicalToSidereal(sunLongTropical, jd0);
  const moonLongSidereal = tropicalToSidereal(moonLongTropical, jd0);

  // Compute panchang elements.
  const varaEn = computeVara(jd0);
  const varaIndex = VARAS.indexOf(varaEn);
  const vara = localizedVara(varaIndex, locale);

  const diff = (moonLongSidereal - sunLongSidereal) % 360;
  const { tithi, tithiIndex, paksha } = computeTithi(sunLongSidereal, moonLongSidereal);
  const { yoga } = computeYoga(sunLongSidereal, moonLongSidereal);
  const karana = computeKarana(diff < 0 ? diff + 360 : diff);

  const nakshatraData = nakshatraInfo(moonLongSidereal);
  const nakshatra = nakshatraData.name;

  // Sunrise and sunset.
  const { sunrise, sunset } = sunTimes({
    date,
    latitudeDeg,
    longitudeDeg,
    tzOffsetMinutes,
  });

  // Moonrise and moonset.
  const { moonrise, moonset } = moonTimes({
    date,
    latitudeDeg,
    longitudeDeg,
    tzOffsetMinutes,
  });

  // Rahu Kalam (may be null if sunrise/sunset not available).
  const rahuKalam = computeRahuKalam(sunrise, sunset, varaIndex);

  // Auspiciousness.
  const auspicious = computeAuspicious(yoga, locale);

  return {
    date,
    vara,
    paksha,
    tithi,
    tithiIndex,
    nakshatra,
    yoga,
    karana,
    sunrise,
    sunset,
    moonrise,
    moonset,
    rahuKalam,
    auspicious,
  };
}

module.exports = { compute };
