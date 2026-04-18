'use strict';

const express = require('express');
const { ok } = require('../utils/envelope');
const { badRequest } = require('../utils/errors');

const router = express.Router();

const CATEGORIES = ['love', 'career', 'finance', 'health'];

function body(hi, category) {
  const texts = {
    love: {
      en: 'Emotional currents run warm — listen more than you explain.',
      hi: 'भावनात्मक ऊर्जा कोमल है — समझाने से अधिक सुनें।',
    },
    career: {
      en: 'Good timing for visible decisions — document your reasoning.',
      hi: 'स्पष्ट निर्णयों के लिए उपयुक्त समय — अपने कारण लिखकर रखें।',
    },
    finance: {
      en: 'Avoid rushed commitments after sunset; morning reviews favor you.',
      hi: 'सूर्यास्त के बाद जल्दबाजी से बचें; सुबह की समीक्षा आपके पक्ष में है।',
    },
    health: {
      en: 'Hydrate, rest early, and guard against over-committing your calendar.',
      hi: 'हाइड्रेट रहें, जल्दी आराम करें, और अधिक commitments से बचें।',
    },
  };
  return hi ? texts[category].hi : texts[category].en;
}

function payload(locale, range) {
  const hi = locale === 'hi';
  return {
    range,
    asOf: new Date().toISOString(),
    categories: CATEGORIES.map((c) => ({
      category: c,
      headline: hi ? 'आज का संकेत' : "Today's signal",
      body: body(hi, c),
      score: 55 + ((c.length * 7) % 45),
    })),
  };
}

router.get('/:range(daily|weekly|monthly|yearly)', (req, res) => {
  return ok(res, payload(req.locale, req.params.range), {
    locale: req.locale,
    userId: req.user.id,
  });
});

// Convenience alias
router.get('/', (req, res, next) => {
  const range = (req.query.range || 'daily').toString();
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(range)) {
    return next(badRequest('range must be one of daily, weekly, monthly, yearly.'));
  }
  return ok(res, payload(req.locale, range));
});

module.exports = router;
