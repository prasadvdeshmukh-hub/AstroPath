'use strict';

const express = require('express');
const { created } = require('../utils/envelope');
const { badRequest } = require('../utils/errors');
const { requireString, requireIsoDate } = require('../utils/validate');
const kundliService = require('../services/kundliService');
const { saveKundli } = require('../data/kundliRepository');

const router = express.Router();

// POST /v1/kundli/generate
router.post('/generate', async (req, res, next) => {
  try {
    const body = req.body || {};
    const name = requireString(body, 'name', { max: 120 });
    requireIsoDate(body, 'birthDate');
    const birthTime = requireString(body, 'birthTime');
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(birthTime)) {
      throw badRequest('birthTime must be HH:MM or HH:MM:SS (24-hour).');
    }

    const lat = Number(body.latitude);
    const lon = Number(body.longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      throw badRequest('latitude must be a number between -90 and 90.');
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      throw badRequest('longitude must be a number between -180 and 180.');
    }

    let tzOffsetMinutes = 0;
    if (body.tzOffsetMinutes !== undefined && body.tzOffsetMinutes !== null) {
      const tz = Number(body.tzOffsetMinutes);
      if (!Number.isFinite(tz) || tz < -14 * 60 || tz > 14 * 60) {
        throw badRequest('tzOffsetMinutes must be between -840 and 840.');
      }
      tzOffsetMinutes = tz;
    }

    const kundli = kundliService.generate({
      name,
      birthDate: body.birthDate,
      birthTime,
      latitude: lat,
      longitude: lon,
      tzOffsetMinutes,
      locale: req.locale,
    });

    const id = await saveKundli(req.user.id, kundli);
    return created(res, { id, ...kundli }, { userId: req.user.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
