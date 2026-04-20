'use strict';

/*
 * Subscription routes — Razorpay.
 *
 * GET    /v1/subscription/plans           → list plan catalog
 * GET    /v1/subscription/status          → current user's subscription state
 * POST   /v1/subscription/order           → create Razorpay order for a plan
 * POST   /v1/subscription/verify          → verify signature + activate plan
 * POST   /v1/subscription/cancel          → flip back to free
 * POST   /v1/subscription/stub-complete   → dev-mode helper: fake a successful
 *                                            payment so the UI flow closes without
 *                                            real Razorpay keys. No-op in prod.
 * POST   /v1/subscription/webhook         → Razorpay webhook receiver (public)
 *
 * Auth note: /webhook is mounted separately (before authMiddleware) so Razorpay
 * can POST to it without a user token. Everything else stays behind auth.
 */

const express = require('express');
const { ok } = require('../utils/envelope');
const { badRequest } = require('../utils/errors');
const Sub = require('../services/subscriptionService');

// --- Authenticated router: plans / status / order / verify / cancel --------
function authRouter(env) {
  const router = express.Router();

  router.get('/plans', (_req, res) => {
    return ok(res, { plans: Sub.listPlans(), stubbed: !Sub.hasRealKeys(env) });
  });

  router.get('/status', async (req, res, next) => {
    try {
      const status = await Sub.getStatus(req.user.id);
      return ok(res, status);
    } catch (err) { next(err); }
  });

  router.post('/order', async (req, res, next) => {
    try {
      const planId = (req.body && req.body.planId) || '';
      if (!planId) throw badRequest('planId is required.');
      const order = await Sub.createOrder(env, req.user.id, planId);
      return ok(res, order);
    } catch (err) { next(err); }
  });

  router.post('/verify', async (req, res, next) => {
    try {
      const status = await Sub.verifyAndActivate(env, req.user.id, req.body || {});
      return ok(res, status);
    } catch (err) { next(err); }
  });

  router.post('/cancel', async (req, res, next) => {
    try {
      const status = await Sub.cancel(req.user.id);
      return ok(res, status);
    } catch (err) { next(err); }
  });

  // Dev-only helper: when no real keys are configured, the frontend can't
  // actually open the Razorpay modal, so we expose this endpoint to mint a
  // valid (payment_id, signature) pair that the /verify route will accept.
  router.post('/stub-complete', (req, res, next) => {
    try {
      if (Sub.hasRealKeys(env)) {
        throw badRequest('stub-complete is only available when Razorpay keys are not configured.');
      }
      const orderId = (req.body && req.body.orderId) || '';
      if (!orderId) throw badRequest('orderId is required.');
      return ok(res, Sub.stubCompletion(orderId));
    } catch (err) { next(err); }
  });

  return router;
}

// --- Public webhook router (no auth) ---------------------------------------
// Must be mounted with a raw body parser so signature verification works.
function webhookRouter(env) {
  const router = express.Router();

  router.post(
    '/',
    express.raw({ type: '*/*', limit: '1mb' }),
    async (req, res) => {
      try {
        const sig = req.header('x-razorpay-signature') || '';
        const raw = req.body instanceof Buffer ? req.body.toString('utf8') : String(req.body || '');
        if (!Sub.verifyWebhook(env, sig, raw)) {
          return res.status(400).json({ error: { code: 'bad_signature', message: 'invalid signature' } });
        }
        let event;
        try { event = raw ? JSON.parse(raw) : {}; } catch (_e) { event = {}; }
        await Sub.handleWebhookEvent(env, event);
        return res.json({ data: { ok: true } });
      } catch (err) {
        // Webhook retries are expensive — acknowledge unless signature failed.
        return res.status(500).json({ error: { code: 'webhook_error', message: err.message || 'error' } });
      }
    }
  );

  return router;
}

module.exports = { authRouter, webhookRouter };
