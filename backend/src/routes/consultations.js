'use strict';

const express = require('express');
const { ok, created } = require('../utils/envelope');
const { badRequest } = require('../utils/errors');
const { requireString } = require('../utils/validate');
const { consultationHub } = require('../services/contentService');
const { createSession } = require('../data/consultationRepository');

const router = express.Router();

const MODES = new Set(['chat', 'call', 'video']);

router.get('/hub', (req, res) => {
  return ok(res, consultationHub(req.locale), { locale: req.locale });
});

router.post('/session', async (req, res, next) => {
  try {
    const body = req.body || {};
    const astrologerId = requireString(body, 'astrologerId', { max: 64 });
    const mode = requireString(body, 'mode');
    if (!MODES.has(mode)) {
      throw badRequest(`mode must be one of: ${Array.from(MODES).join(', ')}`);
    }

    const { id } = await createSession({
      userId: req.user.id,
      astrologerId,
      mode,
    });

    return created(res, {
      id,
      astrologerId,
      mode,
      status: 'queued',
      estimatedWaitMinutes: 3,
      joinUrl: `astropath://consultation/${id}`,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
