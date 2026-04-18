'use strict';

// Apparent geocentric ecliptic longitude for the Sun and Moon.
// - Sun: Meeus, Ch 25.  Accuracy ~0.01°.
// - Moon: Meeus, Ch 47 simplified (main periodic terms).  Accuracy ~0.05°.
//
// Both return tropical longitudes in degrees, normalized to [0, 360).

const { julianCenturies, deg2rad, normDeg } = require('./common');

function sunLongitude(JD) {
  const T = julianCenturies(JD);
  const L0 = normDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = deg2rad(M);
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);
  const trueLong = L0 + C;
  const omega = normDeg(125.04 - 1934.136 * T);
  const apparent = trueLong - 0.00569 - 0.00478 * Math.sin(deg2rad(omega));
  return normDeg(apparent);
}

// Moon using Meeus' simplified formula (chapter 47, main terms).
// We evaluate the top ~30 periodic longitude terms by argument order.
function moonLongitude(JD) {
  const T = julianCenturies(JD);

  // Moon's mean longitude
  const Lp = normDeg(
    218.3164477 +
      481267.88123421 * T -
      0.0015786 * T * T +
      (T * T * T) / 538841 -
      (T * T * T * T) / 65194000
  );

  // Moon's mean elongation from the Sun
  const D = normDeg(
    297.8501921 +
      445267.1114034 * T -
      0.0018819 * T * T +
      (T * T * T) / 545868 -
      (T * T * T * T) / 113065000
  );

  // Sun's mean anomaly
  const M = normDeg(
    357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000
  );

  // Moon's mean anomaly
  const Mp = normDeg(
    134.9633964 +
      477198.8675055 * T +
      0.0087414 * T * T +
      (T * T * T) / 69699 -
      (T * T * T * T) / 14712000
  );

  // Moon's argument of latitude
  const F = normDeg(
    93.272095 +
      483202.0175233 * T -
      0.0036539 * T * T -
      (T * T * T) / 3526000 +
      (T * T * T * T) / 863310000
  );

  // Eccentricity factor E (for terms with M or 2M, multiply by E or E^2).
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;

  // Periodic terms: [D, M, Mp, F, coefficient in 1e-6 degrees]
  // Top ~25 main-argument terms from Meeus Table 47.A, sorted by amplitude.
  const terms = [
    [0, 0, 1, 0, 6288774],
    [2, 0, -1, 0, 1274027],
    [2, 0, 0, 0, 658314],
    [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116],
    [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793],
    [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322],
    [2, -1, 0, 0, 45758],
    [0, 1, -1, 0, -40923],
    [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383],
    [2, 0, 0, -2, 15327],
    [0, 0, 1, 2, -12528],
    [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675],
    [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548],
    [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766],
    [1, 0, -1, 0, -5163],
    [1, 1, 0, 0, 4987],
    [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994],
    [4, 0, 0, 0, 3861],
    [2, 0, -3, 0, 3665],
    [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602],
    [2, -1, -2, 0, 2390],
  ];

  let sumL = 0;
  for (const [d, m, mp, f, coeff] of terms) {
    const arg = deg2rad(d * D + m * M + mp * Mp + f * F);
    let amp = coeff;
    if (m === 1 || m === -1) amp *= E;
    else if (m === 2 || m === -2) amp *= E * E;
    sumL += amp * Math.sin(arg);
  }

  // sumL is in 10^-6 degrees.
  const longitude = Lp + sumL / 1_000_000;
  return normDeg(longitude);
}

module.exports = { sunLongitude, moonLongitude };
