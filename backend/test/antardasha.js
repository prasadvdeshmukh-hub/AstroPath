'use strict';

const assert = require('assert/strict');
const { buildDasha, PERIOD_YEARS, ORDER } = require('../src/services/astronomy/dasha');

// Test data: a birth moment with known moon sidereal position
// Using a test case: birth on 2000-01-15 with Moon at 45 degrees (in Ashlesha nakshatra, ruled by Mercury)
const testBirthDate = '2000-01-15';
const testMoonDegrees = 45; // Ashlesha nakshatra, Mercury lord

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passCount++;
  } catch (err) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${err.message}`);
    failCount++;
  }
}

// Generate dasha timeline
const dasha = buildDasha(testBirthDate, testMoonDegrees);

// Test 1: currentAntardasha matches current.antardashas[0]
test('currentAntardasha matches current.antardashas[0]', () => {
  assert(dasha.currentAntardasha !== null, 'currentAntardasha should not be null');
  assert.deepStrictEqual(dasha.currentAntardasha, dasha.current.antardashas[0],
    'currentAntardasha should equal first entry of current.antardashas');
});

// Test 2: Sum of antardasha totalYears in current equals balanceYears (within 0.05)
test('Sum of current antardashas totalYears equals balanceYears (within 0.05)', () => {
  const sum = dasha.current.antardashas.reduce((acc, ant) => acc + ant.totalYears, 0);
  const diff = Math.abs(sum - dasha.current.balanceYears);
  assert(diff <= 0.05, `Sum ${sum.toFixed(3)} should equal balanceYears ${dasha.current.balanceYears.toFixed(3)}, diff: ${diff.toFixed(3)}`);
});

// Test 3: First antardasha planet of current equals current planet
test('First antardasha of current mahadasha equals current planet', () => {
  assert.strictEqual(dasha.current.antardashas[0].planet, dasha.current.planet,
    `First antardasha planet ${dasha.current.antardashas[0].planet} should equal current planet ${dasha.current.planet}`);
});

// Test 4: All current antardasha dates are valid YYYY-MM-DD
test('All current antardasha dates are valid YYYY-MM-DD', () => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  dasha.current.antardashas.forEach((ant, i) => {
    assert(dateRegex.test(ant.startedOn), `current.antardashas[${i}].startedOn invalid: ${ant.startedOn}`);
    assert(dateRegex.test(ant.endsOn), `current.antardashas[${i}].endsOn invalid: ${ant.endsOn}`);
    // Validate that dates are actual valid dates
    const start = new Date(ant.startedOn);
    const end = new Date(ant.endsOn);
    assert(!isNaN(start.getTime()), `current.antardashas[${i}].startedOn not a valid date`);
    assert(!isNaN(end.getTime()), `current.antardashas[${i}].endsOn not a valid date`);
  });
});

// Test 5: Each upcoming mahadasha has first antardasha planet equal to mahadasha planet
test('First antardasha of each upcoming mahadasha equals that mahadasha planet', () => {
  dasha.upcoming.forEach((maha, i) => {
    assert(maha.antardashas.length > 0, `upcoming[${i}] should have at least one antardasha`);
    assert.strictEqual(maha.antardashas[0].planet, maha.planet,
      `upcoming[${i}]: first antardasha planet ${maha.antardashas[0].planet} should equal mahadasha planet ${maha.planet}`);
  });
});

// Test 6: Sum of antardasha totalYears in each upcoming mahadasha equals mahadasha totalYears (within 0.01)
test('Sum of antardasha totalYears in each upcoming mahadasha equals mahadasha totalYears (within 0.01)', () => {
  dasha.upcoming.forEach((maha, i) => {
    const sum = maha.antardashas.reduce((acc, ant) => acc + ant.totalYears, 0);
    const diff = Math.abs(sum - maha.totalYears);
    assert(diff <= 0.01, `upcoming[${i}]: antardasha sum ${sum.toFixed(3)} should equal mahadasha totalYears ${maha.totalYears.toFixed(3)}, diff: ${diff.toFixed(3)}`);
  });
});

// Test 7: All upcoming antardasha dates are valid YYYY-MM-DD
test('All upcoming antardasha dates are valid YYYY-MM-DD', () => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  dasha.upcoming.forEach((maha, mahIdx) => {
    maha.antardashas.forEach((ant, antIdx) => {
      assert(dateRegex.test(ant.startedOn), `upcoming[${mahIdx}].antardashas[${antIdx}].startedOn invalid: ${ant.startedOn}`);
      assert(dateRegex.test(ant.endsOn), `upcoming[${mahIdx}].antardashas[${antIdx}].endsOn invalid: ${ant.endsOn}`);
      // Validate that dates are actual valid dates
      const start = new Date(ant.startedOn);
      const end = new Date(ant.endsOn);
      assert(!isNaN(start.getTime()), `upcoming[${mahIdx}].antardashas[${antIdx}].startedOn not a valid date`);
      assert(!isNaN(end.getTime()), `upcoming[${mahIdx}].antardashas[${antIdx}].endsOn not a valid date`);
    });
  });
});

// Test 8: Current antardasha startedOn equals birth date
test('Current antardasha startedOn equals birth date', () => {
  assert.strictEqual(dasha.current.antardashas[0].startedOn, testBirthDate,
    `Current antardasha startedOn ${dasha.current.antardashas[0].startedOn} should equal birth date ${testBirthDate}`);
});

// Test 9: Verify structure integrity - current has required fields
test('Current mahadasha has all required fields', () => {
  const required = ['planet', 'startedOn', 'endsOn', 'totalYears', 'balanceYears', 'antardashas'];
  required.forEach(field => {
    assert(field in dasha.current, `current.${field} is missing`);
  });
});

// Test 10: Verify antardasha structure - each antardasha has required fields
test('Each antardasha has all required fields', () => {
  const required = ['planet', 'startedOn', 'endsOn', 'totalYears'];
  dasha.current.antardashas.forEach((ant, i) => {
    required.forEach(field => {
      assert(field in ant, `current.antardashas[${i}].${field} is missing`);
    });
  });
});

// Summary
console.log(`\n${passCount} passed, ${failCount} failed`);
process.exit(failCount > 0 ? 1 : 0);
