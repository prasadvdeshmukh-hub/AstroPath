'use strict';

const express = require('express');
const { ok } = require('../utils/envelope');
const { dashboard } = require('../services/contentService');
const { getPreferences } = require('../data/userRepository');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const prefs = await getPreferences(req.user.id);
    const locale = req.locale || prefs.languageCode || 'en';
    const payload = dashboard(locale);
    return ok(res, payload, { locale, userId: req.user.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
