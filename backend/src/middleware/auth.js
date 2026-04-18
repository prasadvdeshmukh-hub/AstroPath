'use strict';

// Auth middleware. Two modes:
//  - bypass: every request is allowed, populated with a synthetic dev user.
//  - firebase: Firebase ID token required in Authorization: Bearer <token>.

const { ApiError } = require('../utils/errors');

function authMiddleware(env) {
  if (env.AUTH_MODE === 'bypass') {
    return function devBypass(req, _res, next) {
      req.user = {
        id: env.DEV_USER_ID,
        email: env.DEV_USER_EMAIL,
        provider: 'dev-bypass',
      };
      next();
    };
  }

  // firebase mode - verify ID token lazily so memory/bypass paths don't need creds.
  let admin;
  try {
    admin = require('firebase-admin');
  } catch (err) {
    return function missingSdk(_req, _res, next) {
      next(
        new ApiError(
          500,
          'auth_sdk_unavailable',
          'Firebase Admin SDK is not installed. Run `npm install`.'
        )
      );
    };
  }

  return async function firebaseAuth(req, _res, next) {
    try {
      const header = req.header('authorization') || '';
      const match = /^Bearer\s+(.+)$/i.exec(header);
      if (!match) {
        throw new ApiError(401, 'missing_token', 'Authorization bearer token required.');
      }
      const token = match[1].trim();
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = {
        id: decoded.uid,
        email: decoded.email || null,
        provider: decoded.firebase && decoded.firebase.sign_in_provider,
      };
      next();
    } catch (err) {
      if (err instanceof ApiError) return next(err);
      next(new ApiError(401, 'invalid_token', 'Could not verify auth token.'));
    }
  };
}

module.exports = { authMiddleware };
