'use strict';

// Auth-adjacent endpoints. Actual token verification is handled by the auth
// middleware for protected routes. These endpoints support the frontend's
// session bootstrap flow.

const express = require('express');
const { ok } = require('../utils/envelope');
const { getOrCreateProfile } = require('../data/userRepository');
const { ApiError } = require('../utils/errors');

module.exports = function authRoutes(env) {
  const router = express.Router();

  router.get('/config', (_req, res) => {
    return ok(res, {
      mode: env.AUTH_MODE,
      firebase: {
        apiKey: env.FIREBASE_API_KEY || '',
        authDomain: env.FIREBASE_AUTH_DOMAIN || '',
        projectId: env.FIREBASE_PROJECT_ID || '',
        appId: env.FIREBASE_APP_ID || '',
      },
      hasClientConfig: Boolean(env.FIREBASE_API_KEY),
    });
  });

  // POST /v1/auth/session
  // In firebase mode: caller must provide a Bearer token; we verify and ensure a profile.
  // In bypass mode: returns the synthetic dev user and its profile so the frontend can
  // exercise the full flow without any Firebase setup. If the request body contains
  // a valid { email, password }, the email is used as the user identity (per-email
  // profile), enabling multiple test users to be exercised end-to-end. With no body
  // (or no email), behaviour is unchanged for backwards compatibility with the
  // silent bootstrap flow and existing tests.
  router.post('/session', async (req, res, next) => {
    try {
      let identity;

      if (env.AUTH_MODE === 'bypass') {
        const body = req.body || {};
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        if (email) {
          const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          if (!isValidEmail) {
            throw new ApiError(400, 'invalid_email', 'Provide a valid email address.');
          }
          if (password && password.length < 6) {
            throw new ApiError(400, 'weak_password', 'Password must be at least 6 characters.');
          }
          // Stable id derived from email so the same user keeps the same profile across requests.
          const id = 'dev-' + email.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          identity = { id, email, provider: 'dev-bypass-email' };
        } else {
          identity = { id: env.DEV_USER_ID, email: env.DEV_USER_EMAIL, provider: 'dev-bypass' };
        }
      } else {
        const header = req.header('authorization') || '';
        const match = /^Bearer\s+(.+)$/i.exec(header);
        if (!match) {
          throw new ApiError(401, 'missing_token', 'Authorization bearer token required.');
        }
        const admin = require('firebase-admin');
        const decoded = await admin.auth().verifyIdToken(match[1].trim());
        identity = {
          id: decoded.uid,
          email: decoded.email || null,
          provider: decoded.firebase && decoded.firebase.sign_in_provider,
        };
      }

      const profile = await getOrCreateProfile(identity.id);
      return ok(res, { user: identity, profile });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
