'use strict';

// Sunrise, sunset, and moonrise/moonset calculations using Meeus Ch 15.
// All times returned in both UT (fractional hours) and local (HH:MM string).

const { julianDateUT } = require('./julianDate');
const { sunLongitude, moonLongitude } = require('./sunMoon');
const { meanObliquity } = require('./ayanamsa');
const { gmstDegrees } = require('./lagna');
const { deg2rad, rad2deg, normDeg } = require('./common');

// Convert fractional hours to HH:MM string.
function hoursToHHMM(fractionalHours) {
  let h = fractionalHours % 24;
  if (h < 0) h += 24;
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Compute right ascension and declination from ecliptic longitude and obliquity.
function eclipticToRADec(eclipticLongDeg, obliquityDeg) {
  const ecLongRad = deg2rad(eclipticLongDeg);
  const obliqRad = deg2rad(obliquityDeg);

  const raRad = Math.atan2(Math.cos(obliqRad) * Math.sin(ecLongRad), Math.cos(ecLongRad));
  const raDeg = normDeg(rad2deg(raRad));

  const decRad = Math.asin(Math.sin(obliqRad) * Math.sin(ecLongRad));
  const decDeg = rad2deg(decRad);

  return { raDeg, decDeg };
}

// Helper: compute solar noon and hour angle for sunrise/sunset.
function computeSunTimes(jd0, latitudeDeg, longitudeDeg, h0Deg) {
  const L = sunLongitude(jd0);
  const eps = meanObliquity(jd0);
  const { raDeg, decDeg } = eclipticToRADec(L, eps);
  const decRad = deg2rad(decDeg);
  const latRad = deg2rad(latitudeDeg);

  const gmst = gmstDegrees(jd0);
  let m0 = (raDeg - gmst - longitudeDeg) / 360;
  m0 = m0 - Math.floor(m0);
  if (m0 < 0) m0 += 1;

  const solarNoonUT = m0 * 24;

  const sinH0 = Math.sin(deg2rad(h0Deg));
  const sinPhi = Math.sin(latRad);
  const cosPhi = Math.cos(latRad);
  const cosDec = Math.cos(decRad);
  const sinDec = Math.sin(decRad);

  const cosH = (sinH0 - sinPhi * sinDec) / (cosPhi * cosDec);

  if (cosH > 1 || cosH < -1) {
    return { cosH, solarNoonUT, raDeg, decDeg };
  }

  const H = rad2deg(Math.acos(cosH));

  return { cosH, solarNoonUT, H, raDeg, decDeg };
}

// Sun times: sunrise, sunset, solar noon.
function sunTimes({ date, latitudeDeg, longitudeDeg, tzOffsetMinutes }) {
  const [yStr, moStr, dStr] = date.split('-');
  const year = Number(yStr);
  const month = Number(moStr);
  const day = Number(dStr);

  const jd0 = julianDateUT(year, month, day, 0);
  const h0 = -0.833;

  const result = computeSunTimes(jd0, latitudeDeg, longitudeDeg, h0);

  if (result.cosH > 1 || result.cosH < -1) {
    const solarNoonLocal = result.solarNoonUT + tzOffsetMinutes / 60;
    return {
      sunriseUT: null,
      sunsetUT: null,
      sunrise: null,
      sunset: null,
      solarNoon: hoursToHHMM(solarNoonLocal),
      solarNoonUT: result.solarNoonUT,
    };
  }

  const sunriseUT = result.solarNoonUT - result.H / 15;
  const sunsetUT = result.solarNoonUT + result.H / 15;

  const sunriseLocal = sunriseUT + tzOffsetMinutes / 60;
  const sunsetLocal = sunsetUT + tzOffsetMinutes / 60;
  const solarNoonLocal = result.solarNoonUT + tzOffsetMinutes / 60;

  return {
    sunriseUT,
    sunsetUT,
    sunrise: hoursToHHMM(sunriseLocal),
    sunset: hoursToHHMM(sunsetLocal),
    solarNoon: hoursToHHMM(solarNoonLocal),
    solarNoonUT: result.solarNoonUT,
  };
}

// Moon times: moonrise and moonset (best-effort approximation).
function moonTimes({ date, latitudeDeg, longitudeDeg, tzOffsetMinutes }) {
  const [yStr, moStr, dStr] = date.split('-');
  const year = Number(yStr);
  const month = Number(moStr);
  const day = Number(dStr);

  const jd0 = julianDateUT(year, month, day, 0);
  const h0 = 0.125;

  const moonTropLong = moonLongitude(jd0);
  const eps = meanObliquity(jd0);
  const { raDeg, decDeg } = eclipticToRADec(moonTropLong, eps);
  const decRad = deg2rad(decDeg);
  const latRad = deg2rad(latitudeDeg);

  const gmst = gmstDegrees(jd0);
  let m0 = (raDeg - gmst - longitudeDeg) / 360;
  m0 = m0 - Math.floor(m0);
  if (m0 < 0) m0 += 1;
  const lunarNoonUT = m0 * 24;

  const sinH0 = Math.sin(deg2rad(h0));
  const sinPhi = Math.sin(latRad);
  const cosPhi = Math.cos(latRad);
  const cosDec = Math.cos(decRad);
  const sinDec = Math.sin(decRad);

  const cosH = (sinH0 - sinPhi * sinDec) / (cosPhi * cosDec);

  if (cosH > 1 || cosH < -1) {
    return { moonrise: null, moonset: null };
  }

  const H = rad2deg(Math.acos(cosH));

  const moonriseUT = lunarNoonUT - H / 15;
  const moonsetUT = lunarNoonUT + H / 15;

  const moonriseLocal = moonriseUT + tzOffsetMinutes / 60;
  const moonsetLocal = moonsetUT + tzOffsetMinutes / 60;

  return {
    moonrise: hoursToHHMM(moonriseLocal),
    moonset: hoursToHHMM(moonsetLocal),
  };
}

module.exports = { sunTimes, moonTimes };
