'use strict';

// Geo / pincode / state-city endpoints used by the onboarding flow.
//
// These are lightweight read-only lookups backed by an in-memory index;
// safe to call frequently. Auth is still enforced (by app.js mount) so
// random scrapers can't hammer them — but AUTH_MODE=bypass makes dev usage
// painless.

const express = require('express');
const { ok } = require('../utils/envelope');
const { badRequest, notFound } = require('../utils/errors');
const geoService = require('../services/geoService');

const router = express.Router();

// GET /v1/geo/countries → India only (product decision)
router.get('/countries', (_req, res, next) => {
  try {
    return ok(res, { countries: geoService.allCountries() });
  } catch (err) {
    return next(err);
  }
});

// GET /v1/geo/states
router.get('/states', (_req, res, next) => {
  try {
    return ok(res, { states: geoService.listStates() });
  } catch (err) {
    return next(err);
  }
});

// GET /v1/geo/states/:state/cities
router.get('/states/:state/cities', (req, res, next) => {
  try {
    const state = String(req.params.state || '').trim();
    if (!state) return next(badRequest('state path param required.'));
    const cities = geoService.listCities(state);
    if (!cities.length) return next(notFound(`No cities found for state: ${state}`));
    return ok(res, { state, cities });
  } catch (err) {
    return next(err);
  }
});

// GET /v1/geo/pincode/:code  → { pincode, office, district, state, cities }
router.get('/pincode/:code', (req, res, next) => {
  try {
    const code = String(req.params.code || '').trim();
    if (!/^\d{6}$/.test(code)) {
      return next(badRequest('pincode must be a 6-digit number.'));
    }
    const record = geoService.lookupPincode(code);
    if (!record) return next(notFound(`Pincode not found: ${code}`));
    return ok(res, record);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
