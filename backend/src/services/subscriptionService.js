'use strict';

/*
 * Subscription service — Razorpay test-mode integration.
 * ------------------------------------------------------
 * This module exposes a small, stable API the routes call:
 *
 *   listPlans()                         → the plan catalog (free / bronze / silver / gold)
 *   getStatus(userId)                   → { plan, status, activatedAt, expiresAt }
 *   createOrder(userId, planId)         → { orderId, amount, currency, keyId, planId }
 *   verifyAndActivate(userId, payload)  → { plan, status: 'active' }
 *   cancel(userId)                      → { plan: 'free', status: 'cancelled' }
 *   handleWebhook(signature, rawBody)   → { ok: true } (or throws on bad signature)
 *
 * Razorpay reality vs dev stub:
 *   When RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET are configured, we talk to
 *   Razorpay's REST API and verify HMAC-SHA256 signatures exactly as their
 *   docs specify. When the keys are missing (the local dev default), we
 *   generate deterministic fake order ids + signatures so the whole flow —
 *   create → verify → activate → webhook — stays exercisable end-to-end.
 *
 * Why a dev stub at all: the user flagged Razorpay as the primary monetisation
 * path, so the UI needs a working checkout even when real keys aren't present
 * yet. The stub matches the real response envelope so no frontend code has to
 * branch on "test vs real".
 */

const crypto = require('crypto');
const https = require('https');
const { getFirestore } = require('../config/firestore');
const C = require('../data/collections');
const { getOrCreateProfile } = require('../data/userRepository');
const { badRequest, ApiError } = require('../utils/errors');

// Plan catalog. Prices in paise (₹ × 100) — Razorpay's native unit.
const PLANS = Object.freeze([
  {
    id: 'free',
    name: 'Free',
    priceINR: 0,
    priceP: 0,
    interval: 'monthly',
    perks: [
      'Daily horoscope',
      'Basic panchang',
      'Kundli generate (Lagna/Chandra)',
      '1 free AI chat /day',
    ],
  },
  {
    id: 'bronze',
    name: 'Bronze',
    priceINR: 199,
    priceP: 19900,
    interval: 'monthly',
    perks: [
      'Everything in Free',
      'Weekly + Monthly horoscope tabs',
      'Navamsa chart + full dasha timeline',
      'Learn Jyotish Vidya — first 3 modules',
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    priceINR: 499,
    priceP: 49900,
    interval: 'monthly',
    perks: [
      'Everything in Bronze',
      'Yearly horoscope',
      'Full Learn Jyotish Vidya catalog',
      'Priority AI guru (unlimited)',
      '1 astrologer consultation /month',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    priceINR: 999,
    priceP: 99900,
    interval: 'monthly',
    perks: [
      'Everything in Silver',
      '3 astrologer consultations /month',
      'Custom Muhurat searches',
      'Annual deep-dive report',
    ],
  },
]);

function findPlan(id) {
  return PLANS.find((p) => p.id === id) || null;
}

// ---------------------------------------------------------------------------
// Razorpay REST helper.
// Uses the built-in https module — no SDK dependency. Razorpay auth is HTTP
// Basic with the key id/secret.
// ---------------------------------------------------------------------------
function rzpRequest(env, method, pathname, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const auth = Buffer.from(
      env.RAZORPAY_KEY_ID + ':' + env.RAZORPAY_KEY_SECRET
    ).toString('base64');
    const req = https.request(
      {
        host: 'api.razorpay.com',
        method,
        path: pathname,
        headers: {
          Authorization: 'Basic ' + auth,
          'Content-Type': 'application/json',
          'Content-Length': payload ? Buffer.byteLength(payload) : 0,
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (chunk) => (buf += chunk));
        res.on('end', () => {
          try {
            const parsed = buf ? JSON.parse(buf) : {};
            if (res.statusCode >= 400) {
              return reject(
                new ApiError(
                  res.statusCode,
                  'razorpay_error',
                  (parsed && parsed.error && parsed.error.description) ||
                    'Razorpay request failed'
                )
              );
            }
            resolve(parsed);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function hasRealKeys(env) {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

// ---------------------------------------------------------------------------
// Dev-stub signing — mirrors Razorpay's HMAC scheme so the same verify path
// can handle both real and stubbed payments.
// ---------------------------------------------------------------------------
const STUB_SECRET = 'astropath-dev-stub-secret';

function stubSign(orderId, paymentId) {
  return crypto
    .createHmac('sha256', STUB_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');
}

function stubOrderId(userId, planId) {
  // Deterministic-ish but unique per call.
  return (
    'order_stub_' +
    crypto
      .createHash('sha256')
      .update(userId + '|' + planId + '|' + Date.now() + '|' + Math.random())
      .digest('hex')
      .slice(0, 16)
  );
}

function stubPaymentId() {
  return 'pay_stub_' + crypto.randomBytes(8).toString('hex');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
function listPlans() {
  // Return a UI-friendly shape (rupees) plus the internal ids.
  return PLANS.map((p) => ({
    id: p.id,
    name: p.name,
    priceINR: p.priceINR,
    interval: p.interval,
    perks: p.perks,
  }));
}

async function getStatus(userId) {
  const db = getFirestore();
  const ref = db.collection(C.SUBSCRIPTIONS).doc(userId);
  const snap = await ref.get();
  if (!snap.exists) {
    return { plan: 'free', status: 'none', activatedAt: null, expiresAt: null };
  }
  const data = snap.data() || {};
  const now = Date.now();
  let status = data.status || 'active';
  if (status === 'active' && data.expiresAt && Date.parse(data.expiresAt) < now) {
    status = 'expired';
  }
  return {
    plan: data.plan || 'free',
    status,
    activatedAt: data.activatedAt || null,
    expiresAt: data.expiresAt || null,
    lastOrderId: data.lastOrderId || null,
    lastPaymentId: data.lastPaymentId || null,
  };
}

async function writeStatus(userId, patch) {
  const db = getFirestore();
  const ref = db.collection(C.SUBSCRIPTIONS).doc(userId);
  await ref.set(
    { userId, ...patch, updatedAt: new Date().toISOString() },
    { merge: true }
  );
  return getStatus(userId);
}

async function createOrder(env, userId, planId) {
  const plan = findPlan(planId);
  if (!plan) throw badRequest('Unknown plan: ' + planId);
  if (plan.id === 'free') throw badRequest('Cannot place an order for the free plan.');

  // Ensure profile exists so downstream metadata lookups are safe.
  await getOrCreateProfile(userId);

  const receipt = 'ap_' + userId.slice(0, 8) + '_' + Date.now();
  const orderBody = {
    amount: plan.priceP,
    currency: 'INR',
    receipt,
    notes: { userId, planId: plan.id, product: 'AstroPath Subscription' },
  };

  let orderId;
  if (hasRealKeys(env)) {
    const order = await rzpRequest(env, 'POST', '/v1/orders', orderBody);
    orderId = order.id;
  } else {
    orderId = stubOrderId(userId, plan.id);
  }

  // Persist pending intent so webhook / verify can cross-check.
  const db = getFirestore();
  await db.collection(C.PAYMENTS).doc(orderId).set(
    {
      orderId,
      userId,
      planId: plan.id,
      amount: plan.priceP,
      currency: 'INR',
      status: 'created',
      stubbed: !hasRealKeys(env),
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return {
    orderId,
    amount: plan.priceP,
    currency: 'INR',
    keyId: env.RAZORPAY_KEY_ID || 'rzp_test_stub',
    planId: plan.id,
    planName: plan.name,
    stubbed: !hasRealKeys(env),
  };
}

// Verify a `razorpay_payment_id + razorpay_order_id + razorpay_signature`
// triple and, if valid, flip the user's subscription to `active`.
async function verifyAndActivate(env, userId, payload) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = payload || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw badRequest('razorpay_order_id, razorpay_payment_id, razorpay_signature are required.');
  }
  const plan = findPlan(planId);
  if (!plan || plan.id === 'free') throw badRequest('Invalid planId for verification.');

  const expected = hasRealKeys(env)
    ? crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex')
    : stubSign(razorpay_order_id, razorpay_payment_id);

  if (expected !== razorpay_signature) {
    throw new ApiError(400, 'bad_signature', 'Payment signature verification failed.');
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30d monthly

  // Record payment.
  const db = getFirestore();
  await db.collection(C.PAYMENTS).doc(razorpay_order_id).set(
    {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      userId,
      planId: plan.id,
      status: 'paid',
      paidAt: now.toISOString(),
    },
    { merge: true }
  );

  return writeStatus(userId, {
    plan: plan.id,
    status: 'active',
    activatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastOrderId: razorpay_order_id,
    lastPaymentId: razorpay_payment_id,
  });
}

async function cancel(userId) {
  return writeStatus(userId, {
    plan: 'free',
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
  });
}

// Produce a stub (payment_id, signature) pair — only exposed in dev mode so
// the UI can complete a checkout without opening the Razorpay modal.
function stubCompletion(orderId) {
  const paymentId = stubPaymentId();
  const signature = stubSign(orderId, paymentId);
  return { razorpay_payment_id: paymentId, razorpay_signature: signature };
}

// Webhook — verify signature with RAZORPAY_WEBHOOK_SECRET and reconcile state.
function verifyWebhook(env, signatureHeader, rawBody) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    // Accept unsigned webhooks only in dev when no secret is configured.
    return !hasRealKeys(env);
  }
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return expected === signatureHeader;
}

async function handleWebhookEvent(env, event) {
  // We only care about payment.captured for test-mode; subscription webhooks
  // would go here in a fuller integration.
  if (event && event.event === 'payment.captured') {
    const p = event.payload && event.payload.payment && event.payload.payment.entity;
    if (!p) return;
    const orderId = p.order_id;
    const notes = p.notes || {};
    const userId = notes.userId;
    const planId = notes.planId;
    if (!userId || !planId) return;
    const plan = findPlan(planId);
    if (!plan) return;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await writeStatus(userId, {
      plan: plan.id,
      status: 'active',
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastOrderId: orderId,
      lastPaymentId: p.id,
    });
  }
}

module.exports = {
  PLANS,
  listPlans,
  findPlan,
  getStatus,
  createOrder,
  verifyAndActivate,
  cancel,
  stubCompletion,
  verifyWebhook,
  handleWebhookEvent,
  hasRealKeys,
};
