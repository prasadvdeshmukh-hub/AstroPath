'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const requestId = require('./middleware/requestId');
const logger = require('./middleware/logger');
const localeMiddleware = require('./middleware/locale');
const { authMiddleware } = require('./middleware/auth');
const { errorHandler, notFoundHandler } = require('./middleware/error');

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const preferencesRoutes = require('./routes/preferences');
const kundliRoutes = require('./routes/kundli');
const horoscopeRoutes = require('./routes/horoscope');
const panchangRoutes = require('./routes/panchang');
const muhuratRoutes = require('./routes/muhurat');
const compatibilityRoutes = require('./routes/compatibility');
const consultationsRoutes = require('./routes/consultations');
const assistantRoutes = require('./routes/assistant');
const transitsRoutes = require('./routes/transits');
const geoRoutes = require('./routes/geo');
const subscriptionRoutes = require('./routes/subscription');

function buildApp(env) {
  const app = express();

  app.disable('x-powered-by');
  // Behind Render / Railway / Fly / Cloud Run / Heroku there is a reverse proxy.
  // Trust it so req.ip, req.protocol, and HSTS detection all work correctly.
  app.set('trust proxy', 1);

  // --- Security + performance middleware -----------------------------------
  // helmet: sensible HTTP security headers. We relax CSP for the inline-script
  // UI (no build step) by allowing 'unsafe-inline' for scripts + styles; the
  // rest of the defaults (Referrer-Policy, X-Content-Type-Options, etc.) stay.
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          // Razorpay Checkout JS is loaded from checkout.razorpay.com.
          'script-src': ["'self'", "'unsafe-inline'", 'https://checkout.razorpay.com'],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'blob:', 'https://*.razorpay.com'],
          'connect-src': [
            "'self'",
            'https://identitytoolkit.googleapis.com',
            'https://securetoken.googleapis.com',
            'https://api.razorpay.com',
            'https://lumberjack.razorpay.com',
          ],
          'font-src': ["'self'", 'data:'],
          'object-src': ["'none'"],
          // Razorpay Checkout opens a modal in an iframe — allow its origin.
          'frame-src': ['https://api.razorpay.com', 'https://checkout.razorpay.com'],
          'frame-ancestors': ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  const corsOptions =
    env.CORS_ORIGINS.length === 1 && env.CORS_ORIGINS[0] === '*'
      ? { origin: true }
      : { origin: env.CORS_ORIGINS };
  app.use(cors(corsOptions));

  app.use(requestId());
  app.use(logger());
  app.use(localeMiddleware());

  // --- Rate limits ---------------------------------------------------------
  // Liberal global limit; tighter limits for auth and assistant (the two
  // endpoints worth abusing — login brute force and LLM-ish cost).
  const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120, // 120 req / minute / IP
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => req.path === '/health',
  });
  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });
  const assistantLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });

  // Dev-only demo pages. Served under /demo so they never shadow the API.
  app.use('/demo', express.static(path.join(__dirname, '..', 'public'), {
    extensions: ['html'],
    index: 'index.html',
  }));

  // Production UI (cosmic-themed HTML bundle). Mounted at /app when the
  // operator points PUBLIC_UI_DIR at the AstroPath root folder.
  //
  // Block internal dev preview files so they can never be served to end users:
  //   - AstroPath.html / AstroPath_legacy.html (stitched multi-page previews)
  //   - ui/hub.html / ui/journey.html          (internal preview index)
  // Anything else under PUBLIC_UI_DIR is served normally.
  if (env.PUBLIC_UI_DIR) {
    const BLOCKED_PREVIEWS = new Set([
      '/astropath.html',
      '/astropath_legacy.html',
      '/ui/hub.html',
      '/ui/journey.html',
    ]);
    app.use('/app', (req, res, next) => {
      if (BLOCKED_PREVIEWS.has(req.path.toLowerCase())) {
        return res.redirect('/app/');
      }
      next();
    });
    app.use('/app', express.static(env.PUBLIC_UI_DIR, {
      extensions: ['html'],
      index: 'index.html',
      maxAge: env.NODE_ENV === 'production' ? '1h' : 0,
    }));
  }

  // Public API
  app.use('/health', healthRoutes);
  app.use('/v1/auth', authLimiter, authRoutes(env));

  // Razorpay webhook — MUST be mounted before authMiddleware because Razorpay
  // posts with its own signature header, not a Firebase bearer token. The
  // route uses a raw body parser so signature verification works.
  app.use('/v1/subscription/webhook', subscriptionRoutes.webhookRouter(env));

  // Everything under /v1 (other than /v1/auth) is rate-limited + authenticated.
  app.use('/v1', globalLimiter);
  app.use('/v1', authMiddleware(env));
  app.use('/v1/dashboard', dashboardRoutes);
  app.use('/v1/profile/preferences', preferencesRoutes);
  app.use('/v1/kundli', kundliRoutes);
  app.use('/v1/horoscope', horoscopeRoutes);
  app.use('/v1/panchang', panchangRoutes);
  app.use('/v1/muhurat', muhuratRoutes);
  app.use('/v1/compatibility', compatibilityRoutes);
  app.use('/v1/consultations', consultationsRoutes);
  app.use('/v1/assistant', assistantLimiter, assistantRoutes);
  app.use('/v1/transits', transitsRoutes);
  app.use('/v1/geo', geoRoutes);
  app.use('/v1/subscription', subscriptionRoutes.authRouter(env));

  // Root: HTML browsers go to the production UI (if mounted), otherwise
  // the lightweight /demo forms; everything else gets the JSON summary.
  app.get('/', (req, res) => {
    const wantsHtml = (req.headers.accept || '').includes('text/html');
    if (wantsHtml) return res.redirect(env.PUBLIC_UI_DIR ? '/app/' : '/demo/');
    res.json({
      data: {
        service: 'astropath-backend',
        version: '1.0.0',
        env: env.NODE_ENV,
        endpoints: [
          'GET /health',
          'GET /demo/  (dev UI)',
          'POST /v1/auth/session',
          'GET /v1/dashboard',
          'GET/PATCH /v1/profile/preferences',
          'POST /v1/kundli/generate',
          'GET /v1/horoscope/:range',
          'GET /v1/panchang/today',
          'POST /v1/muhurat/search',
          'POST /v1/compatibility/match',
          'GET /v1/consultations/hub',
          'POST /v1/consultations/session',
          'GET /v1/assistant/snapshot',
          'POST /v1/assistant/query',
          'GET /v1/transits',
          'GET /v1/geo/countries',
          'GET /v1/geo/states',
          'GET /v1/geo/states/:state/cities',
          'GET /v1/geo/pincode/:code',
          'GET /v1/subscription/plans',
          'GET /v1/subscription/status',
          'POST /v1/subscription/order',
          'POST /v1/subscription/verify',
          'POST /v1/subscription/cancel',
          'POST /v1/subscription/webhook (public)',
        ],
      },
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { buildApp };
