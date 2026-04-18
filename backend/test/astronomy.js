'use strict';

// Reference-position tests for the astronomy pipeline.
// All ground truths are derived from standard ephemeris references (Meeus,
// JPL Horizons snapshots, Lahiri ayanamsa tables).
//
//   node test/astronomy.js

const assert = require('node:assert/strict');

const { julianDateUT, julianDateFromBirth } = require('../src/services/astronomy/julianDate');
const { lahiriAyanamsa, meanObliquity } = require('../src/services/astronomy/ayanamsa');
const { sunLongitude, moonLongitude } = require('../src/services/astronomy/sunMoon');
const { geocentricLongitude } = require('../src/services/astronomy/planets');
const { meanRahu, meanKetu } = require('../src/services/astronomy/nodes');
const { tropicalAscendant, gmstDegrees } = require('../src/services/astronomy/lagna');
const { signName, signIndex } = require('../src/services/astronomy/rashi');
const { nakshatraInfo } = require('../src/services/astronomy/nakshatra');
const { buildDasha } = require('../src/services/astronomy/dasha');
const kundliService = require('../src/services/kundliService');

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

function assertClose(actual, expected, tol, msg) {
  const d = Math.abs(actual - expected);
  assert.ok(d <= tol, `${msg || ''} actual=${actual} expected=${expected} diff=${d} tol=${tol}`);
}

function angSep(a, b) {
  const d = Math.abs((a - b) % 360);
  return Math.min(d, 360 - d);
}

test('Julian Date for J2000 epoch', () => {
  const JD = julianDateUT(2000, 1, 1, 12);
  assertClose(JD, 2451545.0, 1e-6, 'J2000');
});

test('Julian Date accepts tz offset', () => {
  // IST = UTC+5:30. 1992-05-17 06:12 IST should equal 00:42 UTC same day.
  const JD = julianDateFromBirth({
    birthDate: '1992-05-17',
    birthTime: '06:12',
    tzOffsetMinutes: 330,
  });
  const expected = julianDateUT(1992, 5, 17, 0 + 42 / 60);
  assertClose(JD, expected, 1e-6, 'IST conversion');
});

test('Lahiri ayanamsa at J2000 ~ 23.85 deg', () => {
  const ay = lahiriAyanamsa(2451545.0);
  assertClose(ay, 23.8526, 0.01, 'Lahiri J2000');
});

test('Lahiri ayanamsa at 2020-01-01 ~ 24.13 deg', () => {
  const ay = lahiriAyanamsa(2458849.5);
  assertClose(ay, 24.125, 0.02, 'Lahiri 2020');
});

test('Mean obliquity at J2000 = 23d26m', () => {
  const eps = meanObliquity(2451545.0);
  assertClose(eps, 23.4393, 0.001, 'mean obliquity J2000');
});

test('Sun tropical longitude near vernal equinox', () => {
  const JD = julianDateUT(2020, 3, 20, 3 + 50 / 60);
  const L = sunLongitude(JD);
  assertClose(angSep(L, 0), 0, 0.05, 'Sun at equinox');
});

test('Sun tropical longitude on 2000-06-21 is ~Cancer 0', () => {
  const JD = julianDateUT(2000, 6, 21, 1 + 48 / 60);
  const L = sunLongitude(JD);
  assertClose(L, 90, 0.05, 'Sun at solstice');
});

test('Moon 2020-01-01 ~ 346.5 deg (JPL Horizons)', () => {
  const JD = julianDateUT(2020, 1, 1, 0);
  const L = moonLongitude(JD);
  assert.ok(L >= 0 && L < 360, `moon longitude in range: ${L}`);
  // Simplified lunar theory targets ~0.5 deg accuracy.
  assertClose(angSep(L, 346.53), 0, 0.5, 'Moon 2020-01-01');
});

test('Mercury-Saturn return finite, in-range longitudes at J2000', () => {
  const JD = 2451545.0;
  for (const p of ['mercury', 'venus', 'mars', 'jupiter', 'saturn']) {
    const L = geocentricLongitude(p, JD);
    assert.ok(Number.isFinite(L), `${p} finite`);
    assert.ok(L >= 0 && L < 360, `${p} in range: ${L}`);
  }
});

test('Mars J2000 in late Aquarius (~328 deg)', () => {
  const L = geocentricLongitude('mars', 2451545.0);
  assertClose(angSep(L, 327.86), 0, 1.5, 'Mars J2000');
});

test('Jupiter J2000 in Aries (~25 deg)', () => {
  const L = geocentricLongitude('jupiter', 2451545.0);
  assertClose(angSep(L, 25.35), 0, 1.5, 'Jupiter J2000');
});

test('Saturn J2000 in Taurus (~40 deg)', () => {
  const L = geocentricLongitude('saturn', 2451545.0);
  assertClose(angSep(L, 40.24), 0, 1.5, 'Saturn J2000');
});

test('Rahu and Ketu are exactly 180 deg apart', () => {
  const JD = julianDateUT(2020, 6, 15, 12);
  const r = meanRahu(JD);
  const k = meanKetu(JD);
  assertClose(angSep(r + 180, k), 0, 1e-6, 'Rahu-Ketu axis');
});

test('GMST at J2000 noon ~ 280.46 deg', () => {
  const gmst = gmstDegrees(2451545.0);
  assertClose(gmst, 280.46061837, 0.01, 'GMST J2000');
});

test('Ascendant returns a valid ecliptic degree', () => {
  const JD = julianDateFromBirth({
    birthDate: '1992-05-17',
    birthTime: '06:12',
    tzOffsetMinutes: 330,
  });
  const asc = tropicalAscendant({ JD, latitudeDeg: 18.5204, longitudeDeg: 73.8567 });
  assert.ok(asc >= 0 && asc < 360, `asc in range: ${asc}`);
});

test('Nakshatra lookup: 0 deg sidereal -> Ashwini pada 1', () => {
  const info = nakshatraInfo(0);
  assert.equal(info.name, 'Ashwini');
  assert.equal(info.pada, 1);
  assert.equal(info.lord, 'Ketu');
});

test('Nakshatra lookup: 123.5 deg -> Magha', () => {
  const info = nakshatraInfo(123.5);
  assert.equal(info.name, 'Magha');
  assert.equal(info.pada, 2);
  assert.equal(info.lord, 'Ketu');
});

test('Vimshottari dasha: full 120-year cycle', () => {
  const d = buildDasha('1992-05-17T06:12', 123.5);
  assert.equal(d.current.planet, 'Ketu');
  // Invariant: birth-dasha FULL period + sum of all upcoming totals = 120.
  const totalYears =
    d.current.totalYears + d.upcoming.reduce((s, u) => s + u.totalYears, 0);
  assertClose(totalYears, 120, 0.01, 'Vimshottari 120y cycle');
  assert.ok(d.current.balanceYears > 0 && d.current.balanceYears <= d.current.totalYears);
  assert.equal(d.upcoming.length, 8);
});

test('Sign helpers classify correctly', () => {
  assert.equal(signIndex(0), 0);
  assert.equal(signIndex(30), 1);
  assert.equal(signIndex(359.999), 11);
  assert.equal(signName(0, 'en'), 'Aries');
  assert.equal(signName(90, 'en'), 'Cancer');
});

test('kundliService.generate end-to-end returns expected shape', () => {
  const k = kundliService.generate({
    name: 'Prasad',
    birthDate: '1992-05-17',
    birthTime: '06:12',
    latitude: 18.5204,
    longitude: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'en',
  });
  assert.ok(k.lagna.sign, 'lagna sign present');
  assert.ok(k.nakshatra.name, 'nakshatra present');
  assert.equal(k.planetPositions.length, 9);
  assert.equal(k.engineVersion, 'astropath-meeus-0.4.0');
  assert.ok(k.ayanamsa >= 23 && k.ayanamsa <= 25, `ayanamsa sane: ${k.ayanamsa}`);
  const sunPlanet = k.planetPositions.find((p) => p.planet === 'Sun');
  assert.ok(['Aries', 'Taurus'].includes(sunPlanet.sign), `Sun sign = ${sunPlanet.sign}`);
  const moonPlanet = k.planetPositions.find((p) => p.planet === 'Moon');
  assert.equal(moonPlanet.sign, k.moonSign);
  const totalYears =
    k.dasha.current.totalYears + k.dasha.upcoming.reduce((s, u) => s + u.totalYears, 0);
  assertClose(totalYears, 120, 0.01, 'Kundli dasha total');
});

test('kundliService handles Hindi locale', () => {
  const k = kundliService.generate({
    name: 'Prasad',
    birthDate: '1992-05-17',
    birthTime: '06:12',
    latitude: 18.5204,
    longitude: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'hi',
  });
  const hindiSigns = ['\u092e\u0947\u0937', '\u0935\u0943\u0937\u092d', '\u092e\u093f\u0925\u0941\u0928', '\u0915\u0930\u094d\u0915', '\u0938\u093f\u0902\u0939', '\u0915\u0928\u094d\u092f\u093e', '\u0924\u0941\u0932\u093e', '\u0935\u0943\u0936\u094d\u091a\u093f\u0915', '\u0927\u0928\u0941', '\u092e\u0915\u0930', '\u0915\u0941\u0902\u092d', '\u092e\u0940\u0928'];
  assert.ok(hindiSigns.includes(k.lagna.sign), `lagna sign in Hindi: ${k.lagna.sign}`);
});

async function main() {
  let pass = 0;
  let fail = 0;
  for (const t of tests) {
    const start = Date.now();
    try {
      await t.fn();
      process.stdout.write(`  ok  ${t.name} (${Date.now() - start}ms)\n`);
      pass++;
    } catch (err) {
      process.stdout.write(`  ERR ${t.name} --- ${err.message}\n`);
      fail++;
    }
  }
  process.stdout.write(`\n${pass}/${tests.length} passed` + (fail ? `, ${fail} failed\n` : '\n'));
  if (fail) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
