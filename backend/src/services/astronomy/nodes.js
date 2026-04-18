'use strict';

// Mean longitude of the ascending node of the Moon (Rahu).
// Meeus Ch 47. Accuracy ~1 arcminute - plenty for nakshatra/house placement.
// Ketu = Rahu + 180°.

const { julianCenturies, normDeg } = require('./common');

function meanRahu(JD) {
  const T = julianCenturies(JD);
  // Meeus: Omega = 125.0445479 - 1934.1362891*T + 0.0020754*T^2 + T^3/467441 - T^4/60616000
  const omega =
    125.0445479 -
    1934.1362891 * T +
    0.0020754 * T * T +
    (T * T * T) / 467441 -
    (T * T * T * T) / 60616000;
  return normDeg(omega);
}

function meanKetu(JD) {
  return normDeg(meanRahu(JD) + 180);
}

module.exports = { meanRahu, meanKetu };
