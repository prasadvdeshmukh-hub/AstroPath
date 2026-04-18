'use strict';

const express = require('express');
const { ok } = require('../utils/envelope');
const { badRequest } = require('../utils/errors');
const { compute } = require('../services/panchangService');

const router = express.Router();

// Default location: Pune, India
const DEFAULT_LATITUDE = 18.5204;
const DEFAULT_LONGITUDE = 73.8567;
const DEFAULT_TZ_OFFSET = 330; // IST: UTC+5:30

function parseNumeric(val, defaultVal) {
  if (val === undefined || val === null) return defaultVal;
  const n = Number(val);
  return Number.isFinite(n) ? n : defaultVal;
}

function isValidDate(dateStr) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00Z');
  return d instanceof Date && !Number.isNaN(d.getTime());
}

// GET /v1/panchang/today
router.get('/today', (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const latitude = parseNumeric(req.query.latitude, DEFAULT_LATITUDE);
    const longitude = parseNumeric(req.query.longitude, DEFAULT_LONGITUDE);
    const tzOffsetMinutes = parseNumeric(req.query.tzOffsetMinutes, DEFAULT_TZ_OFFSET);
    const locale = req.locale || 'en';
    const panchang = compute({
      date: today,
      latitudeDeg: latitude,
      longitudeDeg: longitude,
      tzOffsetMinutes,
      locale,
    });
    return ok(res, panchang, { locale });
  } catch (err) {
    return next(err);
  }
});

// GET /v1/panchang?date=YYYY-MM-DD
router.get('/', (req, res, next) => {
  try {
    const dateStr = req.query.date || '';
    if (!isValidDate(dateStr)) {
      return next(badRequest('date query param required in YYYY-MM-DD format.'));
    }
    const latitude = parseNumeric(req.query.latitude, DEFAULT_LATITUDE);
    const longitude = parseNumeric(req.query.longitude, DEFAULT_LONGITUDE);
    const tzOffsetMinutes = parseNumeric(req.query.tzOffsetMinutes, DEFAULT_TZ_OFFSET);
    const locale = req.locale || 'en';
    const panchang = compute({
      date: dateStr,
      latitudeDeg: latitude,
      longitudeDeg: longitude,
      tzOffsetMinutes,
      locale,
    });
    return ok(res, panchang, { locale });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
