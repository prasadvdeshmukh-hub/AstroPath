'use strict';

const express = require('express');
const { ok } = require('../utils/envelope');
const { badRequest } = require('../utils/errors');
const { computeTransits } = require('../services/transitService');

const router = express.Router();

// Validate natalLagna or natalMoon: must be a numeric string in [0, 360).
function validateDegrees(value, name) {
  if (value === undefined || value === null) return undefined;
  const num = Number(value);
  if (Number.isNaN(num) || num < 0 || num >= 360) {
    throw badRequest(`${name} must be a number in [0, 360).`);
  }
  return num;
}

// GET /v1/transits?date=YYYY-MM-DD[&natalLagna=degrees][&natalMoon=degrees]
router.get('/', (req, res, next) => {
  try {
    const { date, natalLagna, natalMoon } = req.query;

    // Validate date parameter (required).
    if (!date) {
      return next(badRequest('date parameter is required.'));
    }

    // Parse optional natal parameters.
    const lagna = validateDegrees(natalLagna, 'natalLagna');
    const moon = validateDegrees(natalMoon, 'natalMoon');

    // Compute transits.
    const data = computeTransits({
      date: String(date),
      natalLagna: lagna,
      natalMoon: moon,
      locale: req.locale,
    });

    return ok(res, data, { locale: req.locale });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
