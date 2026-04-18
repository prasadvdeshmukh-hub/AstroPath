'use strict';
const assert = require('node:assert/strict');
const { navamsaSign, dasamsaSign, computeDivisionals } = require('../src/services/astronomy/divisional');
const { SIGNS_EN } = require('../src/services/astronomy/rashi');

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test('0° sidereal (Aries 0°) -> Navamsa Aries, Dasamsa Aries', () => {
  const nav = navamsaSign(0);
  const das = dasamsaSign(0);
  assert.equal(nav.signIndex, 0);
  assert.equal(nav.signName, 'Aries');
  assert.equal(nav.partInSign, 0);
  assert.equal(das.signIndex, 0);
  assert.equal(das.signName, 'Aries');
  assert.equal(das.partInSign, 0);
});

test('3°21\' in Aries -> 2nd navamsa = Taurus', () => {
  const nav = navamsaSign(3.35);
  assert.equal(nav.signIndex, 1);
  assert.equal(nav.signName, 'Taurus');
  assert.equal(nav.partInSign, 1);
});

test('20° Aries -> 7th navamsa (K=6) = Libra', () => {
  const nav = navamsaSign(20);
  assert.equal(nav.signIndex, 6);
  assert.equal(nav.signName, 'Libra');
  assert.equal(nav.partInSign, 6);
});

test('0° Taurus (30°) -> Navamsa Capricorn, Dasamsa Capricorn', () => {
  const nav = navamsaSign(30);
  const das = dasamsaSign(30);
  assert.equal(nav.signIndex, 9);
  assert.equal(nav.signName, 'Capricorn');
  assert.equal(nav.partInSign, 0);
  assert.equal(das.signIndex, 9);
  assert.equal(das.signName, 'Capricorn');
  assert.equal(das.partInSign, 0);
});

test('0° Gemini (60°) -> Navamsa Aquarius', () => {
  const nav = navamsaSign(60);
  assert.equal(nav.signIndex, 10);
  assert.equal(nav.signName, 'Aquarius');
  assert.equal(nav.partInSign, 0);
});

test('0° Libra (180°) -> Navamsa Libra (movable -> itself)', () => {
  const nav = navamsaSign(180);
  assert.equal(nav.signIndex, 6);
  assert.equal(nav.signName, 'Libra');
  assert.equal(nav.partInSign, 0);
});

test('29° Pisces (359°) -> valid navamsa and dasamsa', () => {
  const nav = navamsaSign(359);
  const das = dasamsaSign(359);
  assert.ok(SIGNS_EN.includes(nav.signName));
  assert.ok(nav.signIndex >= 0 && nav.signIndex <= 11);
  assert.ok(nav.partInSign >= 0 && nav.partInSign <= 8);
  assert.ok(SIGNS_EN.includes(das.signName));
  assert.ok(das.signIndex >= 0 && das.signIndex <= 11);
  assert.ok(das.partInSign >= 0 && das.partInSign <= 9);
});

test('Full zodiac sweep - all signs appear in navamsas', () => {
  const navamsasPerSign = {};
  for (let lon = 0; lon < 360; lon += 0.1) {
    const nav = navamsaSign(lon);
    navamsasPerSign[nav.signName] = true;
  }
  for (const signName of SIGNS_EN) {
    assert.ok(navamsasPerSign[signName], `Navamsa ${signName} appears in sweep`);
  }
});

test('Full zodiac sweep - all signs appear in dasamsas', () => {
  const dasamsasPerSign = {};
  for (let lon = 0; lon < 360; lon += 0.1) {
    const das = dasamsaSign(lon);
    dasamsasPerSign[das.signName] = true;
  }
  for (const signName of SIGNS_EN) {
    assert.ok(dasamsasPerSign[signName], `Dasamsa ${signName} appears in sweep`);
  }
});

test('computeDivisionals combines both D9 and D10', () => {
  const result = computeDivisionals(20);
  assert.ok(result.D9);
  assert.ok(result.D10);
  assert.equal(result.D9.signIndex, 6);
  assert.equal(result.D9.signName, 'Libra');
  assert.equal(result.D9.partInSign, 6);
});

test('Negative longitudes are normalized correctly', () => {
  const nav1 = navamsaSign(30);
  const nav2 = navamsaSign(-330);
  assert.equal(nav1.signIndex, nav2.signIndex);
  assert.equal(nav1.signName, nav2.signName);
  const das1 = dasamsaSign(30);
  const das2 = dasamsaSign(-330);
  assert.equal(das1.signIndex, das2.signIndex);
  assert.equal(das1.signName, das2.signName);
});

test('Longitudes > 360 wrap correctly', () => {
  const nav1 = navamsaSign(390);
  const nav2 = navamsaSign(30);
  assert.equal(nav1.signIndex, nav2.signIndex);
  assert.equal(nav1.signName, nav2.signName);
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
