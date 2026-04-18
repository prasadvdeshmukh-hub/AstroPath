'use strict';

// Logic-layer smoke test. Does NOT require express/cors - useful for
// environments without npm install access. The full HTTP smoke test lives
// in smoke.js and is the canonical pre-flight check in normal dev.

process.env.FIRESTORE_MODE = 'memory';
process.env.AUTH_MODE = 'bypass';

const assert = require('node:assert/strict');

const { loadEnv } = require('../src/config/env');
const { initFirestore, getFirestoreMode } = require('../src/config/firestore');
const userRepo = require('../src/data/userRepository');
const consultationRepo = require('../src/data/consultationRepository');
const kundliRepo = require('../src/data/kundliRepository');
const content = require('../src/services/contentService');
const kundliService = require('../src/services/kundliService');
const { requireString, requireIsoDate } = require('../src/utils/validate');
const { ApiError, badRequest } = require('../src/utils/errors');

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test('env loads defaults', () => {
  const env = loadEnv();
  assert.equal(env.FIRESTORE_MODE, 'memory');
  assert.equal(env.AUTH_MODE, 'bypass');
  assert.equal(env.NODE_ENV, process.env.NODE_ENV || 'development');
});

test('memory firestore initializes', async () => {
  const env = loadEnv();
  await initFirestore(env);
  assert.equal(getFirestoreMode(), 'memory');
});

test('profile bootstrap yields defaults', async () => {
  const profile = await userRepo.getOrCreateProfile('user-1');
  assert.equal(profile.userId, 'user-1');
  assert.equal(profile.preferences.languageCode, 'en');
  assert.equal(profile.preferences.consultationMode, 'chat');
});

test('preferences update persists', async () => {
  const next = await userRepo.updatePreferences('user-1', {
    languageCode: 'hi',
    focusArea: 'career',
  });
  assert.equal(next.languageCode, 'hi');
  assert.equal(next.focusArea, 'career');
  assert.equal(next.consultationMode, 'chat'); // unchanged
  const refetched = await userRepo.getPreferences('user-1');
  assert.deepEqual(refetched, next);
});

test('kundli service produces stable deterministic output', () => {
  const a = kundliService.generate({
    name: 'Prasad',
    birthDate: '1992-05-17',
    birthTime: '06:12',
    latitude: 18.5204,
    longitude: 73.8567,
    locale: 'en',
  });
  const b = kundliService.generate({
    name: 'Prasad',
    birthDate: '1992-05-17',
    birthTime: '06:12',
    latitude: 18.5204,
    longitude: 73.8567,
    locale: 'en',
  });
  assert.equal(a.lagna.sign, b.lagna.sign);
  assert.equal(a.planetPositions.length, 9);
  assert.ok(a.nakshatra.pada >= 1 && a.nakshatra.pada <= 4);
});

test('kundli repository stores under a user', async () => {
  const kundli = kundliService.generate({
    name: 'Test',
    birthDate: '2000-01-01',
    birthTime: '00:00',
    latitude: 0,
    longitude: 0,
  });
  const id = await kundliRepo.saveKundli('user-1', kundli);
  assert.ok(typeof id === 'string' && id.length > 0);
});

test('consultation session creates queued record', async () => {
  const { id } = await consultationRepo.createSession({
    userId: 'user-1',
    astrologerId: 'dev-mehta',
    mode: 'chat',
  });
  assert.ok(id);
});

test('content service localizes dashboard to hi', () => {
  const en = content.dashboard('en');
  const hi = content.dashboard('hi');
  assert.ok(en.greeting.includes('seeker'));
  assert.ok(hi.greeting.includes('साधक'));
  assert.equal(en.quickActions.length, 4);
  assert.equal(hi.quickActions.length, 4);
});

test('content service consultation hub has 3 astrologers', () => {
  const hub = content.consultationHub('en');
  assert.equal(hub.astrologers.length, 3);
  assert.ok(hub.astrologers.every((a) => a.modes.length >= 1));
});

test('content service assistant snapshot ships 4 suggestions', () => {
  const snap = content.assistantSnapshot('en');
  assert.equal(snap.suggestions.length, 4);
  assert.equal(snap.starterMessages.length, 2);
});

test('validators reject bad input', () => {
  assert.throws(() => requireString({ name: '' }, 'name'), ApiError);
  assert.throws(() => requireIsoDate({ d: 'nope' }, 'd'), ApiError);
  assert.doesNotThrow(() => requireString({ name: 'ok' }, 'name'));
});

test('badRequest sets status 400', () => {
  const e = badRequest('x');
  assert.equal(e.status, 400);
  assert.equal(e.code, 'bad_request');
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
      process.stdout.write(`  ERR ${t.name} — ${err.message}\n`);
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
