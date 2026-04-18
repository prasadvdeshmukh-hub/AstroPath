'use strict';

const express = require('express');
const { ok } = require('../utils/envelope');
const { requireString } = require('../utils/validate');
const { assistantSnapshot } = require('../services/contentService');
const assistant = require('../services/assistantService');
const { getLatestForUser } = require('../data/kundliRepository');

const router = express.Router();

// GET /v1/assistant/snapshot  — welcome + suggestions
router.get('/snapshot', (req, res) => {
  return ok(res, assistantSnapshot(req.locale), { locale: req.locale });
});

// POST /v1/assistant/query — hardened chat endpoint.
// Layers:
//   - input validation
//   - pull the user's most recent kundli snapshot from Firestore
//   - merge client-supplied recent history with server-side memory
//   - delegate to assistantService.composeReply (guardrails + intent + grounding)
//   - persist the turn to server-side memory
router.post('/query', async (req, res, next) => {
  try {
    const body = req.body || {};
    const prompt = requireString(body, 'prompt', { max: 2000 });
    const clientHistory = Array.isArray(body.history) ? body.history.slice(-8) : [];

    const userId = (req.user && req.user.id) || null;
    const serverHistory = assistant.getMemory(userId);

    // Server memory + client turns, client wins for most recent turns
    const history = [...serverHistory.slice(-6), ...clientHistory];

    let kundli = null;
    try {
      kundli = await getLatestForUser(userId);
    } catch (_e) {
      kundli = null;
    }

    const result = assistant.composeReply({
      userId,
      prompt,
      history,
      locale: req.locale,
      kundli,
    });

    // Persist the turn (user prompt + assistant reply) for continuity.
    // Mark guardrail-triggering turns sensitive so we never echo them.
    const sensitive = !!result.refusal;
    assistant.appendMemory(userId, {
      role: 'user',
      text: prompt,
      sensitive,
      guardrail: result.guardrail || null,
    });
    assistant.appendMemory(userId, {
      role: 'assistant',
      text: result.reply,
      intent: result.intent,
      guardrail: result.guardrail || null,
      sensitive,
    });

    return ok(res, result, { locale: req.locale });
  } catch (err) {
    next(err);
  }
});

// POST /v1/assistant/reset — wipe server-side chat memory for current user
router.post('/reset', (req, res) => {
  const userId = (req.user && req.user.id) || null;
  assistant.resetMemory(userId);
  return ok(res, { reset: true });
});

module.exports = router;
