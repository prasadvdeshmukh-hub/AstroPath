'use strict';

// Planetary positions via Keplerian orbital elements.
// Source: JPL low-precision approximate positions (1800-2050 table).
//   https://ssd.jpl.nasa.gov/planets/approx_pos.html
// Accuracy: typically ~0.1°-0.5° for inner planets and ~0.5°-1.0° for the
// outer ones over ±250 years from J2000. Enough for sign, nakshatra and
// house classification; not enough for bhava-level precision work.
//
// All returned longitudes are tropical, geocentric, J2000 ecliptic frame.

const { julianCenturies, deg2rad, rad2deg, normDeg } = require('./common');

// [a (AU), e, I (deg), L (deg), longPeri varpi (deg), longNode Omega (deg)]
// and per-century rates (same units).
const ELEMENTS = {
  mercury: {
    base: [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593],
    rate: [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
  },
  venus: {
    base: [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255],
    rate: [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
  },
  earth: {
    base: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
    rate: [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
  },
  mars: {
    base: [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
    rate: [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
  },
  jupiter: {
    base: [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
    rate: [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
  },
  saturn: {
    base: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
    rate: [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
  },
};

function elementsAt(name, T) {
  const { base, rate } = ELEMENTS[name];
  return {
    a: base[0] + rate[0] * T,
    e: base[1] + rate[1] * T,
    I: base[2] + rate[2] * T,
    L: base[3] + rate[3] * T,
    varpi: base[4] + rate[4] * T,
    Omega: base[5] + rate[5] * T,
  };
}

// Solve Kepler's equation E - e sin(E) = M (M and E in radians).
function solveKepler(M, e) {
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 12; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

// Heliocentric ecliptic (J2000) coordinates for a planet at time T.
function heliocentric(name, T) {
  const { a, e, I, L, varpi, Omega } = elementsAt(name, T);
  const argPeri = varpi - Omega; // argument of perihelion, deg
  const M = ((L - varpi) % 360 + 540) % 360 - 180; // normalized to [-180, 180]
  const Mrad = deg2rad(M);
  const E = solveKepler(Mrad, e);
  // Position in orbital plane
  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);
  // Rotate to J2000 ecliptic (z = perpendicular to ecliptic).
  const cw = Math.cos(deg2rad(argPeri));
  const sw = Math.sin(deg2rad(argPeri));
  const co = Math.cos(deg2rad(Omega));
  const so = Math.sin(deg2rad(Omega));
  const ci = Math.cos(deg2rad(I));
  const si = Math.sin(deg2rad(I));
  const xEcl =
    (cw * co - sw * so * ci) * xOrb + (-sw * co - cw * so * ci) * yOrb;
  const yEcl =
    (cw * so + sw * co * ci) * xOrb + (-sw * so + cw * co * ci) * yOrb;
  const zEcl = sw * si * xOrb + cw * si * yOrb;
  return { x: xEcl, y: yEcl, z: zEcl };
}

// Geocentric ecliptic longitude for a named planet at Julian Date JD.
function geocentricLongitude(name, JD) {
  const T = julianCenturies(JD);
  const planet = heliocentric(name, T);
  const earth = heliocentric('earth', T);
  const dx = planet.x - earth.x;
  const dy = planet.y - earth.y;
  let lon = rad2deg(Math.atan2(dy, dx));
  return normDeg(lon);
}

module.exports = {
  ELEMENTS,
  heliocentric,
  geocentricLongitude,
};
