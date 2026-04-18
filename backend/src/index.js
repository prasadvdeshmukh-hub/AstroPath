'use strict';

// Entry point for the AstroPath backend.
// Loads env, initializes Firestore lazily, and starts the HTTP server.

const { loadEnv } = require('./config/env');
const { buildApp } = require('./app');
const { initFirestore } = require('./config/firestore');

async function main() {
  const env = loadEnv();
  await initFirestore(env);

  const app = buildApp(env);
  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(
      `[astropath-backend] listening on :${env.PORT} ` +
        `(firestore=${env.FIRESTORE_MODE}, auth=${env.AUTH_MODE}, env=${env.NODE_ENV})`
    );
  });

  const shutdown = (signal) => {
    // eslint-disable-next-line no-console
    console.log(`[astropath-backend] received ${signal}, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[astropath-backend] fatal startup error', err);
  process.exit(1);
});
