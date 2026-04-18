'use strict';

// Verifies the whole stack works in all three supported languages:
// English (en), Hindi (hi), Marathi (mr).

const assert = require('node:assert/strict');
const { SUPPORTED_LOCALES, DEFAULT_LOCALE } = require('../src/middleware/locale');
const content = require('../src/services/contentService');
const kundli = require('../src/services/kundliService');
const panchang = require('../src/services/panchangService');
const transits = require('../src/services/transitService');
const { SIGNS_EN, SIGNS_HI, SIGNS_MR } = require('../src/services/astronomy/rashi');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

const LOCALES = ['en', 'hi', 'mr'];

// Devanagari detection for Hindi/Marathi strings. Basic range check.
function hasDevanagari(s) {
  return typeof s === 'string' && /[\u0900-\u097f]/.test(s);
}

function asciiOnly(s) {
  return typeof s === 'string' && /^[\x00-\x7f]*$/.test(s);
}

test('supported locales include en, hi, mr', () => {
  for (const l of LOCALES) {
    assert.ok(SUPPORTED_LOCALES.includes(l), `missing ${l} in SUPPORTED_LOCALES`);
  }
  assert.equal(DEFAULT_LOCALE, 'en');
});

test('rashi tables have 12 unique signs per locale', () => {
  for (const arr of [SIGNS_EN, SIGNS_HI, SIGNS_MR]) {
    assert.equal(arr.length, 12);
    assert.equal(new Set(arr).size, 12, 'duplicate signs in a locale');
  }
  // Hindi and Marathi should diverge at least for Libra (Tula).
  assert.notEqual(SIGNS_HI[6], SIGNS_MR[6], 'Hi/Mr Tula must differ');
});

test('dashboard renders in all three locales', () => {
  for (const locale of LOCALES) {
    const d = content.dashboard(locale);
    assert.ok(d.greeting, `no greeting in ${locale}`);
    assert.ok(d.quickActions.length === 4, `wrong quickActions length in ${locale}`);
    if (locale === 'en') assert.ok(asciiOnly(d.greeting), 'en greeting must be ASCII');
    else assert.ok(hasDevanagari(d.greeting), `${locale} greeting must be Devanagari`);
    // Each quick action has a title in the requested script.
    for (const q of d.quickActions) {
      if (locale === 'en') assert.ok(asciiOnly(q.title), `en title ascii: ${q.title}`);
      else assert.ok(hasDevanagari(q.title), `${locale} title script: ${q.title}`);
    }
  }
});

test('dashboard text differs between hi and mr', () => {
  const hi = content.dashboard('hi');
  const mr = content.dashboard('mr');
  // At least the horoscope headline should differ.
  assert.notEqual(hi.horoscopeHeadline, mr.horoscopeHeadline, 'hi == mr headline');
});

test('consultation hub renders in all three locales', () => {
  for (const locale of LOCALES) {
    const h = content.consultationHub(locale);
    assert.ok(h.astrologers.length >= 3);
    assert.ok(h.categories.length === 4);
    if (locale !== 'en') {
      assert.ok(hasDevanagari(h.walletHeadline), `${locale} walletHeadline script`);
    }
  }
});

test('assistant snapshot renders in all three locales', () => {
  for (const locale of LOCALES) {
    const a = content.assistantSnapshot(locale);
    assert.ok(a.welcomeTitle);
    assert.equal(a.suggestions.length, 4);
    assert.equal(a.starterMessages.length, 2);
    if (locale !== 'en') {
      assert.ok(hasDevanagari(a.welcomeTitle), `${locale} welcomeTitle script`);
      assert.ok(hasDevanagari(a.disclaimer), `${locale} disclaimer script`);
    }
  }
});

test('kundli generates in all three locales with matching sign tables', () => {
  const birth = {
    name: 'Prasad',
    birthDate: '1992-05-17',
    birthTime: '06:12',
    latitude: 18.5204,
    longitude: 73.8567,
    tzOffsetMinutes: 330,
  };
  const en = kundli.generate({ ...birth, locale: 'en' });
  const hi = kundli.generate({ ...birth, locale: 'hi' });
  const mr = kundli.generate({ ...birth, locale: 'mr' });

  // Structural invariants stable across locales.
  assert.equal(en.planetPositions.length, 9);
  assert.equal(hi.planetPositions.length, 9);
  assert.equal(mr.planetPositions.length, 9);

  // Lagna sign must come from the correct sign table per locale.
  assert.ok(SIGNS_EN.includes(en.lagna.sign), `en lagna sign: ${en.lagna.sign}`);
  assert.ok(SIGNS_HI.includes(hi.lagna.sign), `hi lagna sign: ${hi.lagna.sign}`);
  assert.ok(SIGNS_MR.includes(mr.lagna.sign), `mr lagna sign: ${mr.lagna.sign}`);

  // All planet signs must come from the locale's sign table.
  for (const p of en.planetPositions) assert.ok(SIGNS_EN.includes(p.sign), `en planet sign: ${p.sign}`);
  for (const p of hi.planetPositions) assert.ok(SIGNS_HI.includes(p.sign), `hi planet sign: ${p.sign}`);
  for (const p of mr.planetPositions) assert.ok(SIGNS_MR.includes(p.sign), `mr planet sign: ${p.sign}`);

  // Planet names: en uses Latin, hi/mr use Devanagari.
  const enPlanetNames = en.planetPositions.map((p) => p.planet);
  const hiPlanetNames = hi.planetPositions.map((p) => p.planet);
  const mrPlanetNames = mr.planetPositions.map((p) => p.planet);
  for (const n of enPlanetNames) assert.ok(asciiOnly(n), `en planet ascii: ${n}`);
  for (const n of hiPlanetNames) assert.ok(hasDevanagari(n), `hi planet script: ${n}`);
  for (const n of mrPlanetNames) assert.ok(hasDevanagari(n), `mr planet script: ${n}`);

  // Summary in each locale uses the correct script.
  assert.ok(asciiOnly(en.summary), 'en summary ascii');
  assert.ok(hasDevanagari(hi.summary), 'hi summary script');
  assert.ok(hasDevanagari(mr.summary), 'mr summary script');
  assert.notEqual(hi.summary, mr.summary, 'hi/mr summaries should differ');

  // Navamsa / Dasamsa also localized.
  for (const p of mr.planetPositions) {
    assert.ok(SIGNS_MR.includes(p.navamsaSign), `mr navamsa sign: ${p.navamsaSign}`);
    assert.ok(SIGNS_MR.includes(p.dasamsaSign), `mr dasamsa sign: ${p.dasamsaSign}`);
  }

  // Engine version consistent.
  assert.equal(en.engineVersion, 'astropath-meeus-0.4.0');
  assert.equal(hi.engineVersion, 'astropath-meeus-0.4.0');
  assert.equal(mr.engineVersion, 'astropath-meeus-0.4.0');

  // Locale echoed in response.
  assert.equal(en.locale, 'en');
  assert.equal(hi.locale, 'hi');
  assert.equal(mr.locale, 'mr');
});

test('kundli planetary positions numerically match across locales', () => {
  const base = {
    name: 'Prasad',
    birthDate: '1992-05-17',
    birthTime: '06:12',
    latitude: 18.5204,
    longitude: 73.8567,
    tzOffsetMinutes: 330,
  };
  const en = kundli.generate({ ...base, locale: 'en' });
  const mr = kundli.generate({ ...base, locale: 'mr' });
  // Houses, degrees, ayanamsa must not depend on locale.
  assert.equal(en.ayanamsa, mr.ayanamsa);
  assert.equal(en.lagna.degrees, mr.lagna.degrees);
  assert.equal(en.lagna.siderealLong, mr.lagna.siderealLong);
  for (let i = 0; i < en.planetPositions.length; i++) {
    assert.equal(en.planetPositions[i].house, mr.planetPositions[i].house);
    assert.equal(en.planetPositions[i].degrees, mr.planetPositions[i].degrees);
  }
});

test('panchang renders in all three locales', () => {
  const params = {
    date: '2020-01-01',
    latitudeDeg: 18.5204,
    longitudeDeg: 73.8567,
    tzOffsetMinutes: 330,
  };
  const en = panchang.compute({ ...params, locale: 'en' });
  const hi = panchang.compute({ ...params, locale: 'hi' });
  const mr = panchang.compute({ ...params, locale: 'mr' });

  assert.equal(en.vara, 'Wednesday');
  assert.ok(hasDevanagari(hi.vara), `hi vara script: ${hi.vara}`);
  assert.ok(hasDevanagari(mr.vara), `mr vara script: ${mr.vara}`);

  // Auspicious message matches script.
  assert.ok(asciiOnly(en.auspicious), 'en auspicious ascii');
  assert.ok(hasDevanagari(hi.auspicious), 'hi auspicious script');
  assert.ok(hasDevanagari(mr.auspicious), 'mr auspicious script');

  // Tithi/nakshatra/yoga/karana are transliterated proper nouns (same in all).
  assert.equal(en.tithi, hi.tithi);
  assert.equal(en.nakshatra, mr.nakshatra);
  // Numeric fields stable.
  assert.equal(en.tithiIndex, hi.tithiIndex);
  assert.equal(en.sunrise, mr.sunrise);
});

test('transits service works with en/hi/mr', () => {
  for (const locale of LOCALES) {
    const t = transits.computeTransits({ date: '2026-04-17', locale });
    assert.equal(t.planets.length, 9);
    // Sign strings must come from the locale's sign table (where a sign appears).
    const table = locale === 'hi' ? SIGNS_HI : locale === 'mr' ? SIGNS_MR : SIGNS_EN;
    for (const p of t.planets) assert.ok(table.includes(p.sign), `${locale} transit sign: ${p.sign}`);
  }
});

async function main() {
  let pass = 0, fail = 0;
  for (const t of tests) {
    const start = Date.now();
    try {
      await t.fn();
      process.stdout.write('  ok  ' + t.name + ' (' + (Date.now() - start) + 'ms)\n');
      pass++;
    } catch (err) {
      process.stdout.write('  ERR ' + t.name + ' --- ' + err.message + '\n');
      fail++;
    }
  }
  process.stdout.write('\n' + pass + '/' + tests.length + ' passed' + (fail ? (', ' + fail + ' failed\n') : '\n'));
  if (fail) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
