'use strict';

// Panchang service tests using Node built-ins.
// Test real astronomical panchang computation against known data.
//
//   node test/panchang.js

const assert = require('node:assert/strict');
const { compute } = require('../src/services/panchangService');
const { NAKSHATRAS } = require('../src/services/astronomy/nakshatra');

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

// Parse HH:MM string to fractional hours.
function parseTime(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h + m / 60;
}

// Assert two times are within tolerance (in minutes).
function assertTimeClose(actual, expected, tolMinutes, msg) {
  if (!actual || !expected) {
    assert.equal(actual, expected, msg);
    return;
  }
  const actualHours = parseTime(actual);
  const expectedHours = parseTime(expected);
  const diffMinutes = Math.abs(actualHours - expectedHours) * 60;
  assert.ok(
    diffMinutes <= tolMinutes,
    `${msg || ''} actual=${actual} expected=${expected} diff=${diffMinutes.toFixed(1)} min tol=${tolMinutes} min`,
  );
}

// Test 1: Panchang for 2020-01-01 Pune.
test('Panchang 2020-01-01 Pune: vara = Wednesday', () => {
  const p = compute({
    date: '2020-01-01',
    latitudeDeg: 18.5204,
    longitudeDeg: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'en',
  });

  assert.equal(p.vara, 'Wednesday', `vara=${p.vara}`);
});

test('Panchang 2020-01-01: tithi is non-empty, tithiIndex in [0,29], paksha valid', () => {
  const p = compute({
    date: '2020-01-01',
    latitudeDeg: 18.5204,
    longitudeDeg: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'en',
  });

  assert.ok(p.tithi && typeof p.tithi === 'string', `tithi=${p.tithi}`);
  assert.ok(p.tithiIndex >= 0 && p.tithiIndex <= 29, `tithiIndex=${p.tithiIndex}`);
  assert.ok(['Shukla', 'Krishna'].includes(p.paksha), `paksha=${p.paksha}`);
});

test('Panchang 2020-01-01: nakshatra is one of 27 NAKSHATRAS', () => {
  const p = compute({
    date: '2020-01-01',
    latitudeDeg: 18.5204,
    longitudeDeg: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'en',
  });

  assert.ok(
    NAKSHATRAS.includes(p.nakshatra),
    `nakshatra=${p.nakshatra} not in NAKSHATRAS`,
  );
});

test('Panchang 2020-01-01: yoga is one of 27 yoga names', () => {
  const p = compute({
    date: '2020-01-01',
    latitudeDeg: 18.5204,
    longitudeDeg: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'en',
  });

  const yogaNames = [
    'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
    'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
    'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
    'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva',
    'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
    'Indra', 'Vaidhriti',
  ];

  assert.ok(yogaNames.includes(p.yoga), `yoga=${p.yoga} not in yogaNames`);
});

test('Panchang 2020-01-01: karana is one of 11 karana names', () => {
  const p = compute({
    date: '2020-01-01',
    latitudeDeg: 18.5204,
    longitudeDeg: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'en',
  });

  const karanaNames = [
    'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
    'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna',
  ];

  assert.ok(karanaNames.includes(p.karana), `karana=${p.karana} not in karanaNames`);
});

test('Panchang 2020-01-01: sunrise is HH:MM, between 06:40 and 07:15', () => {
  const p = compute({
    date: '2020-01-01',
    latitudeDeg: 18.5204,
    longitudeDeg: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'en',
  });

  assert.ok(/^\d{2}:\d{2}$/.test(p.sunrise), `sunrise format=${p.sunrise}`);
  assertTimeClose(p.sunrise, '07:00', 25, 'sunrise should be ~07:00');
});

test('Panchang 2020-01-01: sunset is HH:MM, between 17:45 and 18:30', () => {
  const p = compute({
    date: '2020-01-01',
    latitudeDeg: 18.5204,
    longitudeDeg: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'en',
  });

  assert.ok(/^\d{2}:\d{2}$/.test(p.sunset), `sunset format=${p.sunset}`);
  assertTimeClose(p.sunset, '18:15', 30, 'sunset should be ~18:15');
});

test('Panchang 2020-01-01: moonrise and moonset are HH:MM or null', () => {
  const p = compute({
    date: '2020-01-01',
    latitudeDeg: 18.5204,
    longitudeDeg: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'en',
  });

  if (p.moonrise) {
    assert.ok(/^\d{2}:\d{2}$/.test(p.moonrise), `moonrise format=${p.moonrise}`);
  }
  if (p.moonset) {
    assert.ok(/^\d{2}:\d{2}$/.test(p.moonset), `moonset format=${p.moonset}`);
  }
});

test('Panchang 2020-01-01: rahuKalam has start and end if sunrise/sunset available', () => {
  const p = compute({
    date: '2020-01-01',
    latitudeDeg: 18.5204,
    longitudeDeg: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'en',
  });

  if (p.rahuKalam) {
    assert.ok(/^\d{2}:\d{2}$/.test(p.rahuKalam.start), `rahuKalam.start=${p.rahuKalam.start}`);
    assert.ok(/^\d{2}:\d{2}$/.test(p.rahuKalam.end), `rahuKalam.end=${p.rahuKalam.end}`);

    const startHours = parseTime(p.rahuKalam.start);
    const endHours = parseTime(p.rahuKalam.end);
    let duration = endHours - startHours;
    if (duration < 0) duration += 24;
    assert.ok(duration > 0.5 && duration < 3, `rahuKalam duration=${duration.toFixed(2)}h should be ~1.5h`);
  }
});

test('Panchang 2020-01-01: auspicious is non-empty string', () => {
  const p = compute({
    date: '2020-01-01',
    latitudeDeg: 18.5204,
    longitudeDeg: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'en',
  });

  assert.ok(p.auspicious && typeof p.auspicious === 'string', `auspicious=${p.auspicious}`);
});

test('Panchang respects locale parameter (Hindi)', () => {
  const p = compute({
    date: '2020-01-01',
    latitudeDeg: 18.5204,
    longitudeDeg: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'hi',
  });

  assert.ok(p.auspicious, 'auspicious present');
  assert.ok(typeof p.auspicious === 'string', 'auspicious is string');
});

test('Panchang polar edge case (lat=85, summer): returns without throw', () => {
  const p = compute({
    date: '2020-06-21',
    latitudeDeg: 85,
    longitudeDeg: 0,
    tzOffsetMinutes: 0,
    locale: 'en',
  });

  assert.ok(p, 'panchang computed');
  assert.ok(p.vara, 'vara present');
  if (p.sunrise) {
    assert.ok(/^\d{2}:\d{2}$/.test(p.sunrise), `sunrise=${p.sunrise}`);
  }
  if (p.sunset) {
    assert.ok(/^\d{2}:\d{2}$/.test(p.sunset), `sunset=${p.sunset}`);
  }
  if (p.rahuKalam) {
    assert.ok(/^\d{2}:\d{2}$/.test(p.rahuKalam.start), `rahuKalam.start=${p.rahuKalam.start}`);
  }
});

test('Panchang southern hemisphere (lat=-25, summer)', () => {
  const p = compute({
    date: '2020-12-21',
    latitudeDeg: -25,
    longitudeDeg: 135,
    tzOffsetMinutes: 600,
    locale: 'en',
  });

  assert.ok(p.vara, 'vara present');
  assert.ok(p.sunrise, 'sunrise should be present in summer');
  assert.ok(p.sunset, 'sunset should be present in summer');
  assert.ok(/^\d{2}:\d{2}$/.test(p.sunrise), `sunrise=${p.sunrise}`);
});

test('Panchang date field is preserved', () => {
  const testDate = '2020-01-01';
  const p = compute({
    date: testDate,
    latitudeDeg: 18.5204,
    longitudeDeg: 73.8567,
    tzOffsetMinutes: 330,
    locale: 'en',
  });

  assert.equal(p.date, testDate, `date=${p.date}`);
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
