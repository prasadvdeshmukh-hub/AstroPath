'use strict';

const express = require('express');
const { ok } = require('../utils/envelope');
const { getPreferences, updatePreferences } = require('../data/userRepository');
const { badRequest } = require('../utils/errors');
const { SUPPORTED_LOCALES } = require('../middleware/locale');

const ALLOWED_MODES = new Set(['chat', 'call', 'video']);
const ALLOWED_FOCUS = new Set(['career', 'love', 'finance', 'spiritual', 'balance']);

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const prefs = await getPreferences(req.user.id);
    return ok(res, prefs);
  } catch (err) {
    next(err);
  }
});

router.patch('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    const patch = {};

    if (body.languageCode !== undefined) {
      if (typeof body.languageCode !== 'string' || !SUPPORTED_LOCALES.includes(body.languageCode)) {
        throw badRequest(
          `languageCode must be one of: ${SUPPORTED_LOCALES.join(', ')}`
        );
      }
      patch.languageCode = body.languageCode;
    }
    if (body.notificationsEnabled !== undefined) {
      if (typeof body.notificationsEnabled !== 'boolean') {
        throw badRequest('notificationsEnabled must be a boolean.');
      }
      patch.notificationsEnabled = body.notificationsEnabled;
    }
    if (body.consultationMode !== undefined) {
      if (!ALLOWED_MODES.has(body.consultationMode)) {
        throw badRequest(
          `consultationMode must be one of: ${Array.from(ALLOWED_MODES).join(', ')}`
        );
      }
      patch.consultationMode = body.consultationMode;
    }
    if (body.focusArea !== undefined) {
      if (!ALLOWED_FOCUS.has(body.focusArea)) {
        throw badRequest(
          `focusArea must be one of: ${Array.from(ALLOWED_FOCUS).join(', ')}`
        );
      }
      patch.focusArea = body.focusArea;
    }

    if (Object.keys(patch).length === 0) {
      throw badRequest('At least one preference field is required.');
    }

    const next = await updatePreferences(req.user.id, patch);
    return ok(res, next);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
