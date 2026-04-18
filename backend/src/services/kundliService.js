'use strict';

// Real Vedic kundli pipeline.
//
// 1. Julian Date from birth date/time and timezone offset.
// 2. Tropical geocentric longitudes for the Sun, Moon, Mercury, Venus, Mars,
//    Jupiter, Saturn plus mean Rahu/Ketu.
// 3. Shift to sidereal using the Lahiri ayanamsa.
// 4. Tropical ascendant from Greenwich mean sidereal time and the observer's
//    geographic coordinates, then shift to sidereal.
// 5. Whole-sign houses computed from the Lagna.
// 6. Nakshatra + pada + Vimshottari mahadasha + antardasha timeline.
// 7. Divisional placements (Navamsa D9, Dasamsa D10) for every planet + Lagna.
// 8. Manglik / Kaal Sarp / Pitra classical dosha checks.
//
// Supports English (en), Hindi (hi), Marathi (mr).

const { julianDateFromBirth } = require('./astronomy/julianDate');
const { lahiriAyanamsa, tropicalToSidereal } = require('./astronomy/ayanamsa');
const { sunLongitude, moonLongitude } = require('./astronomy/sunMoon');
const { geocentricLongitude } = require('./astronomy/planets');
const { meanRahu, meanKetu } = require('./astronomy/nodes');
const { tropicalAscendant } = require('./astronomy/lagna');
const { signName, signDegrees, wholeSignHouse } = require('./astronomy/rashi');
const { nakshatraInfo } = require('./astronomy/nakshatra');
const { buildDasha } = require('./astronomy/dasha');
const { detectAll } = require('./astronomy/doshas');
const { computeDivisionals } = require('./astronomy/divisional');

const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const PLANETS_HI = {
  Sun:     '\u0938\u0942\u0930\u094d\u092f',
  Moon:    '\u091a\u0902\u0926\u094d\u0930',
  Mars:    '\u092e\u0902\u0917\u0932',
  Mercury: '\u092c\u0941\u0927',
  Jupiter: '\u0917\u0941\u0930\u0941',
  Venus:   '\u0936\u0941\u0915\u094d\u0930',
  Saturn:  '\u0936\u0928\u093f',
  Rahu:    '\u0930\u093e\u0939\u0941',
  Ketu:    '\u0915\u0947\u0924\u0941',
};
// Marathi planet names. Mangal ends in LLA; Shani/Rahu/Ketu in long vowels.
const PLANETS_MR = {
  Sun:     '\u0938\u0942\u0930\u094d\u092f',
  Moon:    '\u091a\u0902\u0926\u094d\u0930',
  Mars:    '\u092e\u0902\u0917\u0933',
  Mercury: '\u092c\u0941\u0927',
  Jupiter: '\u0917\u0941\u0930\u0941',
  Venus:   '\u0936\u0941\u0915\u094d\u0930',
  Saturn:  '\u0936\u0928\u0940',
  Rahu:    '\u0930\u093e\u0939\u0942',
  Ketu:    '\u0915\u0947\u0924\u0942',
};

function localizedPlanet(english, locale) {
  if (locale === 'hi') return PLANETS_HI[english] || english;
  if (locale === 'mr') return PLANETS_MR[english] || english;
  return english;
}

function tropicalLongitudes(JD) {
  return {
    Sun: sunLongitude(JD),
    Moon: moonLongitude(JD),
    Mercury: geocentricLongitude('mercury', JD),
    Venus: geocentricLongitude('venus', JD),
    Mars: geocentricLongitude('mars', JD),
    Jupiter: geocentricLongitude('jupiter', JD),
    Saturn: geocentricLongitude('saturn', JD),
    Rahu: meanRahu(JD),
    Ketu: meanKetu(JD),
  };
}

// Locale-specific summary sentence. Kept in-module to keep the service
// self-contained; translations can be split into a locale bundle later.
function summaryFor(locale, ctx) {
  const { name, lagnaEnName, moonEnName, nak, dashaPlanet, antardashaPlanet, endsOn } = ctx;
  if (locale === 'hi') {
    // Hindi: "<Name>, aapki lagn rashi <X> hai aur chandra <Y> rashi ke <Nak> nakshatra (paad N) mein hai. Vartaman vimshottari mahadasha <P> ki hai."
    return name + ', \u0906\u092a\u0915\u0940 \u0932\u0917\u094d\u0928 \u0930\u093e\u0936\u093f ' +
      signName(ctx.sidAsc, 'hi') + ' \u0939\u0948\u0964 \u091a\u0902\u0926\u094d\u0930 ' +
      signName(ctx.moonLong, 'hi') + ' \u0930\u093e\u0936\u093f \u0915\u0947 ' +
      nak.name + ' \u0928\u0915\u094d\u0937\u0924\u094d\u0930 (\u092a\u093e\u0926 ' +
      nak.pada + ') \u092e\u0947\u0902 \u0939\u0948\u0964 \u0935\u0930\u094d\u0924\u092e\u093e\u0928 ' +
      '\u0935\u093f\u092e\u094d\u0936\u094b\u0924\u094d\u0924\u0930\u0940 \u092e\u0939\u093e\u0926\u0936\u093e ' +
      localizedPlanet(dashaPlanet, 'hi') + ' (\u0905\u0902\u0924\u0930\u0926\u0936\u093e ' +
      localizedPlanet(antardashaPlanet, 'hi') + ') \u0915\u0940 \u0939\u0948, \u091c\u094b ' +
      endsOn + ' \u0924\u0915 \u091a\u0932\u0947\u0917\u0940\u0964';
  }
  if (locale === 'mr') {
    // Marathi: "<Name>, tumchi lagna rashi <X> aahe aani chandra <Y> rashit <Nak> nakshatratil (pad N) aahe. Sadhya vimshottari mahadasha <P> chi aahe."
    return name + ', \u0924\u0941\u092e\u091a\u0940 \u0932\u0917\u094d\u0928 \u0930\u093e\u0936\u093f ' +
      signName(ctx.sidAsc, 'mr') + ' \u0906\u0939\u0947 \u0906\u0923\u093f \u091a\u0902\u0926\u094d\u0930 ' +
      signName(ctx.moonLong, 'mr') + ' \u0930\u093e\u0936\u0940\u0924 ' +
      nak.name + ' \u0928\u0915\u094d\u0937\u0924\u094d\u0930\u093e\u091a\u094d\u092f\u093e (\u092a\u093e\u0926 ' +
      nak.pada + ') \u0906\u0939\u0947. \u0938\u0927\u094d\u092f\u093e ' +
      '\u0935\u093f\u092e\u094d\u0936\u094b\u0924\u094d\u0924\u0930\u0940 \u092e\u0939\u093e\u0926\u0936\u093e ' +
      localizedPlanet(dashaPlanet, 'mr') + ' (\u0905\u0902\u0924\u0930\u0926\u0936\u093e ' +
      localizedPlanet(antardashaPlanet, 'mr') + ') \u091a\u0940 \u0938\u0941\u0930\u0942 \u0906\u0939\u0947, \u091c\u0940 ' +
      endsOn + ' \u092a\u0930\u094d\u092f\u0902\u0924 \u091a\u093e\u0932\u0947\u0932.';
  }
  // English default
  return name + ', your rising sign is ' + lagnaEnName +
    ' and the Moon sits in ' + moonEnName +
    ' in the ' + nak.name + ' nakshatra (pada ' + nak.pada + '). Current Vimshottari ' +
    'mahadasha is ' + dashaPlanet + ' (antardasha ' + antardashaPlanet +
    ') until ' + endsOn + '.';
}

function generate(opts) {
  const {
    name,
    birthDate,
    birthTime,
    latitude,
    longitude,
    tzOffsetMinutes = 0,
    locale = 'en',
  } = opts || {};

  const JD = julianDateFromBirth({ birthDate, birthTime, tzOffsetMinutes });
  const ayanamsa = lahiriAyanamsa(JD);

  const trop = tropicalLongitudes(JD);
  const sidereal = {};
  for (const key of PLANET_ORDER) {
    sidereal[key] = tropicalToSidereal(trop[key], JD);
  }

  const tropAsc = tropicalAscendant({
    JD,
    latitudeDeg: latitude,
    longitudeDeg: longitude,
  });
  const sidAsc = tropicalToSidereal(tropAsc, JD);

  const planetPositionsFull = PLANET_ORDER.map((planet) => {
    const long = sidereal[planet];
    const div = computeDivisionals(long);
    return {
      planet: localizedPlanet(planet, locale),
      planetKey: planet,
      sign: signName(long, locale),
      house: wholeSignHouse(long, sidAsc),
      degrees: signDegrees(long),
      siderealLong: Number(long.toFixed(4)),
      navamsaSign: signName(div.D9.signIndex * 30, locale),
      dasamsaSign: signName(div.D10.signIndex * 30, locale),
    };
  });

  const moonLong = sidereal.Moon;
  const nak = nakshatraInfo(moonLong);
  const dasha = buildDasha(birthDate + 'T' + birthTime, moonLong);
  const doshas = detectAll(planetPositionsFull);

  const sunLong = sidereal.Sun;
  const lagnaDivisionals = computeDivisionals(sidAsc);

  const summary = summaryFor(locale, {
    name,
    sidAsc,
    moonLong,
    lagnaEnName: signName(sidAsc, 'en'),
    moonEnName: signName(moonLong, 'en'),
    nak,
    dashaPlanet: dasha.current.planet,
    antardashaPlanet: dasha.currentAntardasha.planet,
    endsOn: dasha.current.endsOn,
  });

  return {
    input: { name, birthDate, birthTime, latitude, longitude, tzOffsetMinutes },
    locale,
    ayanamsa: Number(ayanamsa.toFixed(4)),
    lagna: {
      sign: signName(sidAsc, locale),
      degrees: signDegrees(sidAsc),
      siderealLong: Number(sidAsc.toFixed(4)),
      navamsaSign: signName(lagnaDivisionals.D9.signIndex * 30, locale),
      dasamsaSign: signName(lagnaDivisionals.D10.signIndex * 30, locale),
    },
    moonSign: signName(moonLong, locale),
    sunSign: signName(sunLong, locale),
    nakshatra: { name: nak.name, pada: nak.pada, lord: nak.lord },
    planetPositions: planetPositionsFull.map((p) => ({
      planet: p.planet,
      sign: p.sign,
      house: p.house,
      degrees: p.degrees,
      navamsaSign: p.navamsaSign,
      dasamsaSign: p.dasamsaSign,
    })),
    dasha,
    doshas: {
      manglik: doshas.manglik,
      kaalSarp: doshas.kaalSarp,
      pitra: doshas.pitra,
      explanations: doshas.explanations,
    },
    summary,
    generatedAt: new Date().toISOString(),
    engineVersion: 'astropath-meeus-0.4.0',
    engineAccuracy:
      'Positions: Meeus simplified solar+lunar theory (within 0.05 deg) and JPL low-precision ' +
      'Keplerian elements (within 0.3-0.5 deg) for Mars-Saturn. Lahiri ayanamsa. Whole-sign ' +
      'houses. Includes antardashas and D9/D10 divisional placements. i18n: en, hi, mr. ' +
      'For arcsecond accuracy, swap geocentricLongitude for a Swiss Ephemeris binding.',
  };
}

module.exports = { generate };
