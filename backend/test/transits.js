'use strict';

// Test suite for transits service.
// Run with: node test/transits.js

const assert = require('node:assert/strict');
const { computeTransits, SIGNS_EN } = require('../src/services/transitService');
const { badRequest } = require('../src/utils/errors');

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

// Test 1: Valid date with no natal inputs
test('Date 2020-01-01 with no natal inputs returns 9 planets, no house fields', () => {
  const result = computeTransits({ date: '2020-01-01' });

  assert.equal(result.planets.length, 9, 'Should have 9 planets');
  assert.equal(result.date, '2020-01-01', 'Date should match input');
  assert.ok(result.JD > 0, 'JD should be computed');
  assert.ok(typeof result.ayanamsa === 'number', 'Ayanamsa should be a number');

  // Check ayanamsa is in expected range for 2020-01-01 (should be ~24.1-24.2)
  assert.ok(result.ayanamsa >= 24 && result.ayanamsa <= 25, `Ayanamsa should be ~24.1, got ${result.ayanamsa}`);

  // Verify all planets have required fields but no house fields
  result.planets.forEach((p) => {
    assert.ok(SIGNS_EN.includes(p.sign), `Sign should be in SIGNS_EN: ${p.sign}`);
    assert.ok(typeof p.siderealLong === 'number', 'siderealLong should be a number');
    assert.ok(typeof p.degreesInSign === 'number', 'degreesInSign should be a number');
    assert.ok(p.nakshatra && typeof p.nakshatra.name === 'string', 'nakshatra.name should exist');
    assert.ok(typeof p.nakshatra.pada === 'number', 'nakshatra.pada should be a number');
    assert.ok(p.houseFromLagna === undefined, 'houseFromLagna should not exist');
    assert.ok(p.houseFromMoon === undefined, 'houseFromMoon should not exist');
  });
});

// Test 2: Valid date with natalLagna and natalMoon
test('Date 2020-01-01 with natalLagna=0 and natalMoon=120 includes house fields', () => {
  const result = computeTransits({
    date: '2020-01-01',
    natalLagna: 0,
    natalMoon: 120,
  });

  assert.equal(result.planets.length, 9, 'Should have 9 planets');

  result.planets.forEach((p) => {
    assert.ok(typeof p.houseFromLagna === 'number', 'houseFromLagna should be a number');
    assert.ok(p.houseFromLagna >= 1 && p.houseFromLagna <= 12, `houseFromLagna should be 1-12, got ${p.houseFromLagna}`);
    assert.ok(typeof p.houseFromMoon === 'number', 'houseFromMoon should be a number');
    assert.ok(p.houseFromMoon >= 1 && p.houseFromMoon <= 12, `houseFromMoon should be 1-12, got ${p.houseFromMoon}`);
  });
});

// Test 3: Invalid date format throws error
test('Invalid date format throws badRequest error', () => {
  assert.throws(
    () => computeTransits({ date: 'not-a-date' }),
    (err) => err.code === 'bad_request',
    'Should throw ApiError with bad_request code'
  );
});

// Test 4: Only natalLagna without natalMoon
test('Date 2020-01-01 with only natalLagna=45 includes houseFromLagna but not houseFromMoon', () => {
  const result = computeTransits({
    date: '2020-01-01',
    natalLagna: 45,
  });

  result.planets.forEach((p) => {
    assert.ok(typeof p.houseFromLagna === 'number', 'houseFromLagna should be a number');
    assert.ok(p.houseFromMoon === undefined, 'houseFromMoon should not exist');
  });
});

// Test 5: Only natalMoon without natalLagna
test('Date 2020-01-01 with only natalMoon=180 includes houseFromMoon but not houseFromLagna', () => {
  const result = computeTransits({
    date: '2020-01-01',
    natalMoon: 180,
  });

  result.planets.forEach((p) => {
    assert.ok(p.houseFromLagna === undefined, 'houseFromLagna should not exist');
    assert.ok(typeof p.houseFromMoon === 'number', 'houseFromMoon should be a number');
  });
});

// Test 6: asOf timestamp is current
test('asOf timestamp is a valid ISO string', () => {
  const result = computeTransits({ date: '2020-01-01' });
  assert.ok(typeof result.asOf === 'string', 'asOf should be a string');
  assert.ok(!Number.isNaN(new Date(result.asOf).getTime()), 'asOf should be a valid ISO date');
});

// Test 7: JD value is reasonable for 2020-01-01 at noon UT
test('JD for 2020-01-01 at noon UT is 2458850.0', () => {
  const result = computeTransits({ date: '2020-01-01' });
  // 2020-01-01 00:00 UT = JD 2458849.5, so noon UT = JD 2458850.0.
  assert.ok(result.JD >= 2458849.9 && result.JD <= 2458850.1, `JD should be ~2458850.0, got ${result.JD}`);
});

// Test 8: All planet names are present
test('All 9 planets are present in the result', () => {
  const result = computeTransits({ date: '2020-01-01' });
  const planets = result.planets.map((p) => p.planet);
  const expectedPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  expectedPlanets.forEach((expected) => {
    assert.ok(planets.includes(expected), `${expected} should be in planets list`);
  });
});

// Test 9: Degrees in sign are in [0, 30)
test('Degrees in sign for all planets are in [0, 30)', () => {
  const result = computeTransits({ date: '2020-01-01' });
  result.planets.forEach((p) => {
    assert.ok(
      p.degreesInSign >= 0 && p.degreesInSign < 30,
      `degreesInSign should be in [0, 30), got ${p.degreesInSign}`
    );
  });
});

// Test 10: natalLagna out of range throws error
test('natalLagna >= 360 throws error', () => {
  assert.throws(
    () => computeTransits({ date: '2020-01-01', natalLagna: 360 }),
    (err) => err.code === 'bad_request',
    'Should throw ApiError'
  );
});

// Test 11: natalMoon negative throws error
test('natalMoon < 0 throws error', () => {
  assert.throws(
    () => computeTransits({ date: '2020-01-01', natalMoon: -1 }),
    (err) => err.code === 'bad_request',
    'Should throw ApiError'
  );
});

// Run all tests
async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const { name, fn } of tests) {
    try {
      await Promise.resolve(fn());
      console.log(`✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ ${name}`);
      console.error(`  ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});

  