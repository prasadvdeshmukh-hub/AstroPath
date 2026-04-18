'use strict';

// Environment loader - no external dotenv dependency.
// Reads .env if present, falls back to process.env, applies defaults.

const fs = require('fs');
const path = require('path');

function parseDotenv(raw) {
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  let fileEnv = {};
  if (fs.existsSync(envPath)) {
    try {
      fileEnv = parseDotenv(fs.readFileSync(envPath, 'utf8'));
    } catch (_err) {
      fileEnv = {};
    }
  }
  const merged = { ...fileEnv, ...process.env };

  const env = {
    NODE_ENV: merged.NODE_ENV || 'development',
    PORT: Number(merged.PORT || 8080),
    CORS_ORIGINS: (merged.CORS_ORIGINS || '*')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    FIRESTORE_MODE: (merged.FIRESTORE_MODE || 'memory').toLowerCase(),
    FIREBASE_PROJECT_ID: merged.FIREBASE_PROJECT_ID || '',
    GOOGLE_APPLICATION_CREDENTIALS: merged.GOOGLE_APPLICATION_CREDENTIALS || '',
    AUTH_MODE: (merged.AUTH_MODE || 'bypass').toLowerCase(),
    DEV_USER_ID: merged.DEV_USER_ID || 'dev-user-001',
    DEV_USER_EMAIL: merged.DEV_USER_EMAIL || 'dev@astropath.local',
    // Optional: serve the real (cosmic-themed) UI from the same origin as the API.
    // Point at the AstroPath root folder. When set, the backend mounts it at /app
    // and redirects / to /app/ for HTML browsers.
    PUBLIC_UI_DIR: merged.PUBLIC_UI_DIR || '',
  };

  if (!['memory', 'firestore'].includes(env.FIRESTORE_MODE)) {
    throw new Error(
      `Invalid FIRESTORE_MODE "${env.FIRESTORE_MODE}". Use "memory" or "firestore".`
    );
  }
  if (!['bypass', 'firebase'].includes(env.AUTH_MODE)) {
    throw new Error(
      `Invalid AUTH_MODE "${env.AUTH_MODE}". Use "bypass" or "firebase".`
    );
  }
  return env;
}

module.exports = { loadEnv };
