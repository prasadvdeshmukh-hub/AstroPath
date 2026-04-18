'use strict';

const express = require('express');
const { ok } = require('../utils/envelope');
const { badRequest } = require('../utils/errors');
const { requireString, requireIsoDate } = require('../utils/validate');

const router = express.Router();

const PURPOSES = new Set(['marriage', 'business', 'griha_pravesh', 'travel', 'naming']);

router.post('/search', (req, res, next) => {
  try {
    const body = req.body || {};
    const purpose = requireString(body, 'purpose');
    if (!PURPOSES.has(purpose)) {
      throw badRequest(
        `purpose must be one of: ${Array.from(PURPOSES).join(', ')}`
      );
    }
    const from = requireIsoDate(body, 'from');
    const to = requireIsoDate(body, 'to');
    if (to.getTime() <= from.getTime()) {
      throw badRequest('"to" must be after "from".');
    }

    const hi = req.locale === 'hi';
    const windows = [];
    const spanDays = Math.min(
      7,
      Math.ceil((to.getTime() - from.getTime()) / (24 * 3600 * 1000))
    );
    for (let i = 0; i < spanDays; i++) {
      const d = new Date(from.getTime() + i * 24 * 3600 * 1000);
      if (i % 2 === 0) continue; // every other day for the mock
      windows.push({
        date: d.toISOString().slice(0, 10),
        window: '09:40 - 11:10',
        quality: i % 4 === 1 ? 'excellent' : 'good',
        note: hi
          ? 'शुभ ग्रह स्थिति, प्रारंभ के लिए अनुकूल।'
          : 'Favorable planetary alignment for initiation.',
      });
    }

    return ok(res, {
      purpose,
      from: from.toISOString(),
      to: to.toISOString(),
      windows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
