'use strict';

// Lahiri (Chitra Paksha) ayanamsa.
// Definition: ayanamsa = 23°15'00" on 1956-03-21 (JD 2435553.5), drifting at
// approximately 50.2910571"/yr due to precession of the equinoxes.
//
// J2000 baseline value: 23.85284° (matches standard astrology software within
// a few arcseconds over the next century).
//
// Reference: Lahiri committee (Rashtriya Panchang Samiti, 1955) + IAU-2006
// precession rate for the drift term.

const { julianCenturies } = require('./common');

const J2000_AYANAMSA_DEG = 23.85284;
const DRIFT_ARCSEC_PER_YEAR = 50.2910571;
const DRIFT_DEG_PER_CENTURY = (DRIFT_ARCSEC_PER_YEAR * 100) / 3600;

// Obliquity of the ecliptic (mean), IAU 2006 series, Meeus Ch 22.
// Accurate to better than 0.001° over several centuries.
function meanObliquity(JD) {
  const T = julianCenturies(JD);
  // 23° 26' 21.448" - 46.8150"T - 0.00059"T^2 + 0.001813"T^3, in arcseconds
  const eps0ArcSec =
    23 * 3600 + 26 * 60 + 21.448 + (-46.8150 - (0.00059 - 0.001813 * T) * T) * T;
  return eps0ArcSec / 3600;
}

function lahiriAyanamsa(JD) {
  const T = julianCenturies(JD);
  return J2000_AYANAMSA_DEG + DRIFT_DEG_PER_CENTURY * T;
}

// Convert tropical ecliptic longitude -> sidereal (Lahiri).
function tropicalToSidereal(tropicalDeg, JD) {
  const ayan = lahiriAyanamsa(JD);
  const sid = tropicalDeg - ayan;
  const n = sid % 360;
  return n < 0 ? n + 360 : n;
}

module.exports = {
  J2000_AYANAMSA_DEG,
  DRIFT_ARCSEC_PER_YEAR,
  lahiriAyanamsa,
  meanObliquity,
  tropicalToSidereal,
};
