'use strict';

// Transit service: compute current planetary positions for a given date,
// optionally relative to a user's natal chart (lagna or moon).

const { badRequest } = require('../utils/errors');
const { julianDateUT } = require('./astronomy/julianDate');
const { lahiriAyanamsa, tropicalToSidereal } = require('./astronomy/ayanamsa');
const { sunLongitude, moonLongitude } = require('./astronomy/sunMoon');
const { geocentricLongitude } = require('./astronomy/planets');
const { meanRahu, meanKetu } = require('./astronomy/nodes');
const { signName, signDegrees, wholeSignHouse, SIGNS_EN } = require('./astronomy/rashi');
const { nakshatraInfo } = require('./astronomy/nakshatra');

const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

function parseDate(dateStr) {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof dateStr !== 'string' || !re.test(dateStr)) {
    throw badRequest('date must be in YYYY-MM-DD format');
  }
  const [yStr, moStr, dStr] = dateStr.split('-');
  const Y = Number(yStr);
  const M = Number(moStr);
  const D = Number(dStr);
  if (M < 1 || M > 12 || D < 1 || D > 31) {
    throw badRequest('date has invalid month or day');
  }
  return { Y, M, D };
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

// Options: { date: 'YYYY-MM-DD', natalLagna?: number, natalMoon?: number, locale?: string }
function computeTransits(opts) {
  const { date, natalLagna, natalMoon, locale = 'en' } = opts || {};

  const { Y, M, D } = parseDate(date);

  if (natalLagna !== undefined && natalLagna !== null) {
    if (!Number.isFinite(natalLagna) || natalLagna < 0 || natalLagna >= 360) {
      throw badRequest('natalLagna must be a number in [0, 360).');
    }
  }
  if (natalMoon !== undefined && natalMoon !== null) {
    if (!Number.isFinite(natalMoon) || natalMoon < 0 || natalMoon >= 360) {
      throw badRequest('natalMoon must be a number in [0, 360).');
    }
  }

  // Use noon UT as the time-of-day for daily transit snapshots.
  const JD = julianDateUT(Y, M, D, 12);
  const ayanamsa = lahiriAyanamsa(JD);

  const trop = tropicalLongitudes(JD);
  const sidereal = {};
  for (const key of PLANET_ORDER) {
    sidereal[key] = tropicalToSidereal(trop[key], JD);
  }

  const planets = PLANET_ORDER.map((planet) => {
    const siderealLong = sidereal[planet];
    const nak = nakshatraInfo(siderealLong);
    const obj = {
      planet,
      sign: signName(siderealLong, locale),
      siderealLong: Number(siderealLong.toFixed(4)),
      degreesInSign: Number(signDegrees(siderealLong).toFixed(2)),
      nakshatra: { name: nak.name, pada: nak.pada },
    };
    if (natalLagna !== undefined && natalLagna !== null) {
      obj.houseFromLagna = wholeSignHouse(siderealLong, natalLagna);
    }
    if (natalMoon !== undefined && natalMoon !== null) {
      obj.houseFromMoon = wholeSignHouse(siderealLong, natalMoon);
    }
    return obj;
  });

  return {
    asOf: new Date().toISOString(),
    date,
    JD,
    ayanamsa: Number(ayanamsa.toFixed(4)),
    planets,
  };
}

module.exports = { computeTransits, SIGNS_EN };
