'use strict';

// Ascendant (Lagna) calculation.
//
// 1. Compute Greenwich Mean Sidereal Time (GMST) for the given JD.  Meeus Ch 12.
// 2. Local Sidereal Time (LST) = GMST + east_longitude_hours.
// 3. Ascendant = ecliptic point crossing the eastern horizon.
//
// Formula (Meeus, Ch 13, eq 13.5):
//   tan(Asc) = -cos(ST) / (sin(ST) cos(eps) + tan(phi) sin(eps))
// where ST is the LST in the same angular units, eps is the obliquity of the
// ecliptic, and phi is geographic latitude (positive north).

const { julianCenturies, deg2rad, rad2deg, normDeg } = require('./common');
const { meanObliquity } = require('./ayanamsa');

// Greenwich Mean Sidereal Time in degrees. Meeus eq 12.4.
function gmstDegrees(JD) {
  const T = julianCenturies(JD);
  let theta =
    280.46061837 +
    360.98564736629 * (JD - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  return normDeg(theta);
}

// Tropical ascendant, in degrees. longitudeDeg is east-of-Greenwich.
function tropicalAscendant({ JD, latitudeDeg, longitudeDeg }) {
  const gmst = gmstDegrees(JD);
  const lst = normDeg(gmst + longitudeDeg); // east positive
  const lstRad = deg2rad(lst);
  const epsRad = deg2rad(meanObliquity(JD));
  const phiRad = deg2rad(latitudeDeg);

  // Asc = atan2(-cos(ST), sin(ST)*cos(eps) + tan(phi)*sin(eps))
  const y = -Math.cos(lstRad);
  const x = Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(phiRad) * Math.sin(epsRad);
  let asc = rad2deg(Math.atan2(y, x));
  asc = normDeg(asc);

  // Ensure ascendant is in the eastern semicircle relative to the MC.
  // The raw atan2 may produce the wrong branch; adjust by +180° if the
  // ascendant isn't 90°-270° ahead of the MC in ecliptic longitude.
  // MC (medium coeli) = atan2(sin(ST), cos(ST)*cos(eps)).
  const mcRad = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(epsRad));
  const mc = normDeg(rad2deg(mcRad));
  let delta = normDeg(asc - mc);
  if (delta < 90 || delta > 270) {
    asc = normDeg(asc + 180);
  }
  return asc;
}

module.exports = { gmstDegrees, tropicalAscendant };
