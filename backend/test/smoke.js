'use strict';

// End-to-end smoke test. Boots the Express app against the in-memory Firestore,
// exercises every endpoint, and prints a compact summary. Designed to run with
// no network access and no external services.
//
//   node test/smoke.js
//
// Exits with code 0 on full success, non-zero on first failure.

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '0';
process.env.FIRESTORE_MODE = 'memory';
process.env.AUTH_MODE = 'bypass';
process.env.CORS_ORIGINS = '*';

const http = require('http');
const { loadEnv } = require('../src/config/env');
const { initFirestore } = require('../src/config/firestore');
const { buildApp } = require('../src/app');

function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const { address, port } = server.address();
    const options = {
      host: address === '::' ? '127.0.0.1' : address,
      port,
      method,
      path,
      headers: { 'content-type': 'application/json' },
    };
    const req = http.request(options, (res) => {
      let chunks = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (chunks += c));
      res.on('end', () => {
        let parsed;
        try {
          parsed = chunks ? JSON.parse(chunks) : null;
        } catch (_e) {
          parsed = chunks;
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (body !== undefined) req.write(JSON.stringify(body));
    req.end();
  });
}

function assert(cond, msg) {
  if (!cond) {
    const err = new Error('ASSERT FAILED: ' + msg);
    err.isAssertion = true;
    throw err;
  }
}

async function main() {
  const env = loadEnv();
  await initFirestore(env);
  const app = buildApp(env);

  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));

  const results = [];
  async function run(name, fn) {
    const start = Date.now();
    try {
      await fn();
      results.push({ name, ok: true, ms: Date.now() - start });
      process.stdout.write(`  ok  ${name} (${Date.now() - start}ms)\n`);
    } catch (err) {
      results.push({ name, ok: false, ms: Date.now() - start, error: err.message });
      process.stdout.write(`  ERR ${name} — ${err.message}\n`);
    }
  }

  try {
    await run('GET /health', async () => {
      const r = await request(server, 'GET', '/health');
      assert(r.status === 200, `status=${r.status}`);
      assert(r.body.data.status === 'ok', 'status not ok');
      assert(r.body.data.firestoreMode === 'memory', 'firestore not memory');
    });

    await run('GET / (service summary)', async () => {
      const r = await request(server, 'GET', '/');
      assert(r.status === 200, `status=${r.status}`);
      assert(Array.isArray(r.body.data.endpoints), 'endpoints missing');
    });

    await run('POST /v1/auth/session (bypass)', async () => {
      const r = await request(server, 'POST', '/v1/auth/session', {});
      assert(r.status === 200, `status=${r.status}`);
      assert(r.body.data.user.id, 'user.id missing');
      assert(r.body.data.profile.preferences.languageCode, 'languageCode missing');
    });

    await run('GET /v1/auth/config', async () => {
      const r = await request(server, 'GET', '/v1/auth/config');
      assert(r.status === 200, `status=${r.status}`);
      assert(r.body.data.mode === 'bypass', 'auth mode missing');
      assert(r.body.data.hasClientConfig === false, 'default client config should be false');
    });

    await run('GET /v1/dashboard?lang=en', async () => {
      const r = await request(server, 'GET', '/v1/dashboard?lang=en');
      assert(r.status === 200, `status=${r.status}`);
      assert(r.body.data.greeting.includes('seeker'), 'English greeting wrong');
      assert(r.body.data.quickActions.length >= 4, 'quickActions missing');
    });

    await run('GET /v1/dashboard?lang=hi', async () => {
      const r = await request(server, 'GET', '/v1/dashboard?lang=hi');
      assert(r.status === 200, `status=${r.status}`);
      assert(r.body.data.greeting.includes('साधक'), 'Hindi greeting wrong');
      assert(r.body.meta.locale === 'hi', 'meta.locale wrong');
    });

    await run('PATCH /v1/profile/preferences', async () => {
      const r = await request(server, 'PATCH', '/v1/profile/preferences', {
        languageCode: 'hi',
        consultationMode: 'video',
      });
      assert(r.status === 200, `status=${r.status}`);
      assert(r.body.data.languageCode === 'hi', 'languageCode not persisted');
      assert(r.body.data.consultationMode === 'video', 'consultationMode not persisted');
    });

    await run('PATCH /v1/profile/preferences rejects bad input', async () => {
      const r = await request(server, 'PATCH', '/v1/profile/preferences', {
        languageCode: 'klingon',
      });
      assert(r.status === 400, `status=${r.status}`);
      assert(r.body.error.code === 'bad_request', 'error code wrong');
    });

    await run('POST /v1/kundli/generate', async () => {
      const r = await request(server, 'POST', '/v1/kundli/generate', {
        name: 'Prasad',
        birthDate: '1992-05-17',
        birthTime: '06:12',
        latitude: 18.5204,
        longitude: 73.8567,
      });
      assert(r.status === 201, `status=${r.status}`);
      assert(r.body.data.id, 'id missing');
      assert(r.body.data.lagna && r.body.data.lagna.sign, 'lagna missing');
      assert(r.body.data.planetPositions.length === 9, 'planet count wrong');
    });

    await run('POST /v1/kundli/generate validates', async () => {
      const r = await request(server, 'POST', '/v1/kundli/generate', {
        name: '',
        birthDate: 'not-a-date',
        birthTime: 'bad',
        latitude: 999,
        longitude: 0,
      });
      assert(r.status === 400, `status=${r.status}`);
    });

    await run('GET /v1/horoscope/daily', async () => {
      const r = await request(server, 'GET', '/v1/horoscope/daily');
      assert(r.status === 200, `status=${r.status}`);
      assert(r.body.data.categories.length === 4, 'categories wrong');
    });

    await run('GET /v1/panchang/today', async () => {
      const r = await request(server, 'GET', '/v1/panchang/today');
      assert(r.status === 200, `status=${r.status}`);
      assert(r.body.data.tithi, 'tithi missing');
      assert(r.body.data.sunrise, 'sunrise missing');
    });

    await run('POST /v1/muhurat/search', async () => {
      const r = await request(server, 'POST', '/v1/muhurat/search', {
        purpose: 'marriage',
        from: '2026-05-01',
        to: '2026-05-08',
      });
      assert(r.status === 200, `status=${r.status}`);
      assert(Array.isArray(r.body.data.windows), 'windows missing');
    });

    await run('POST /v1/compatibility/match', async () => {
      const r = await request(server, 'POST', '/v1/compatibility/match', {
        personA: { name: 'Rhea', birthDate: '1994-02-10', birthTime: '09:30' },
        personB: { name: 'Arjun', birthDate: '1992-11-21', birthTime: '14:05' },
      });
      assert(r.status === 200, `status=${r.status}`);
      assert(r.body.data.gunaMilan.outOf === 36, 'guna milan wrong');
    });

    await run('GET /v1/consultations/hub', async () => {
      const r = await request(server, 'GET', '/v1/consultations/hub');
      assert(r.status === 200, `status=${r.status}`);
      assert(r.body.data.astrologers.length >= 3, 'astrologers missing');
    });

    await run('POST /v1/consultations/session', async () => {
      const r = await request(server, 'POST', '/v1/consultations/session', {
        astrologerId: 'dev-mehta',
        mode: 'chat',
      });
      assert(r.status === 201, `status=${r.status}`);
      assert(r.body.data.id, 'id missing');
      assert(r.body.data.status === 'queued', 'status wrong');
    });

    await run('GET /v1/assistant/snapshot', async () => {
      const r = await request(server, 'GET', '/v1/assistant/snapshot');
      assert(r.status === 200, `status=${r.status}`);
      assert(r.body.data.suggestions.length === 4, 'suggestions wrong');
    });

    await run('POST /v1/assistant/query', async () => {
      const r = await request(server, 'POST', '/v1/assistant/query', {
        prompt: 'What should I focus on this week?',
      });
      assert(r.status === 200, `status=${r.status}`);
      assert(typeof r.body.data.reply === 'string', 'reply missing');
      assert(r.body.data.nonDeterministic === true, 'flag missing');
    });

    await run('404 for unknown route', async () => {
      const r = await request(server, 'GET', '/v1/does-not-exist');
      assert(r.status === 404, `status=${r.status}`);
      assert(r.body.error.code === 'not_found', 'code wrong');
    });
  } finally {
    await new Promise((r) => server.close(r));
  }

  const failed = results.filter((r) => !r.ok);
  process.stdout.write(
    `\n${results.length - failed.length}/${results.length} passed` +
      (failed.length ? `, ${failed.length} failed\n` : '\n')
  );
  if (failed.length) {
    for (const f of failed) process.stdout.write(`  - ${f.name}: ${f.error}\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
