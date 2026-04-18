'use strict';

// Shared math helpers for astronomy calculations.
// All longitudes are in degrees, normalized to [0, 360).

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function deg2rad(x) {
  return x * DEG2RAD;
}
function rad2deg(x) {
  return x * RAD2DEG;
}

function normDeg(x) {
  const r = x % 360;
  return r < 0 ? r + 360 : r;
}

// Modulo for Julian Centuries since J2000.
function julianCenturies(JD) {
  return (JD - 2451545.0) / 36525;
}

// Degrees in [0, 360) as whole degrees plus minutes/seconds.
function toDMS(deg) {
  const norm = normDeg(deg);
  const d = Math.floor(norm);
  const mFloat = (norm - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60 * 100) / 100;
  return { d, m, s };
}

module.exports = {
  DEG2RAD,
  RAD2DEG,
  deg2rad,
  rad2deg,
  normDeg,
  julianCenturies,
  toDMS,
};
