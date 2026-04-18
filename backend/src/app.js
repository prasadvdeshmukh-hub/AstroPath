'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');

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

function buildApp(env) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  const corsOptions =
    env.CORS_ORIGINS.length === 1 && env.CORS_ORIGINS[0] === '*'
      ? { origin: true }
      : { origin: env.CORS_ORIGINS };
  app.use(cors(corsOptions));

  app.use(requestId());
  app.use(logger());
  app.use(localeMiddleware());

  // Dev-only demo pages. Served under /demo so they never shadow the API.
  app.use('/demo', express.static(path.join(__dirname, '..', 'public'), {
    extensions: ['html'],
    index: 'index.html',
  }));

  // Production UI (cosmic-themed HTML bundle). Mounted at /app when the
  // operator points PUBLIC_UI_DIR at the AstroPath root folder.
  if (env.PUBLIC_UI_DIR) {
    app.use('/app', express.static(env.PUBLIC_UI_DIR, {
      extensions: ['html'],
      index: 'index.html',
    }));
  }

  // Public API
  app.use('/health', healthRoutes);
  app.use('/v1/auth', authRoutes(env));

  // Everything under /v1 (other than /v1/auth) requires auth.
  app.use('/v1', authMiddleware(env));
  app.use('/v1/dashboard', dashboardRoutes);
  app.use('/v1/profile/preferences', preferencesRoutes);
  app.use('/v1/kundli', kundliRoutes);
  app.use('/v1/horoscope', horoscopeRoutes);
  app.use('/v1/panchang', panchangRoutes);
  app.use('/v1/muhurat', muhuratRoutes);
  app.use('/v1/compatibility', compatibilityRoutes);
  app.use('/v1/consultations', consultationsRoutes);
  app.use('/v1/assistant', assistantRoutes);
  app.use('/v1/transits', transitsRoutes);

  // Root: HTML browsers go to the production UI (if mounted), otherwise
  // the lightweight /demo forms; everything else gets the JSON summary.
  app.get('/', (req, res) => {
    const wantsHtml = (req.headers.accept || '').includes('text/html');
    if (wantsHtml) return res.redirect(env.PUBLIC_UI_DIR ? '/app/' : '/demo/');
    res.json({
      data: {
        service: 'astropath-backend',
        version: '0.4.0',
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
        ],
      },
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { buildApp };
