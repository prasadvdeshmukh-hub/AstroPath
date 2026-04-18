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

  // POST /v1/auth/session
  // In firebase mode: caller must provide a Bearer token; we verify and ensure a profile.
  // In bypass mode: returns the synthetic dev user and its profile so the frontend can
  // exercise the full flow without any Firebase setup.
  router.post('/session', async (req, res, next) => {
    try {
      let identity;

      if (env.AUTH_MODE === 'bypass') {
        identity = { id: env.DEV_USER_ID, email: env.DEV_USER_EMAIL, provider: 'dev-bypass' };
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
