'use strict';

const express = require('express');
const { ok } = require('../utils/envelope');
const { requireString, requireIsoDate } = require('../utils/validate');
const { badRequest } = require('../utils/errors');

const router = express.Router();

function personFromBody(body, key) {
  const person = body && body[key];
  if (!person || typeof person !== 'object') {
    throw badRequest(`"${key}" is required and must be an object.`);
  }
  return {
    name: requireString(person, 'name', { max: 120 }),
    birthDate: requireIsoDate(person, 'birthDate').toISOString().slice(0, 10),
    birthTime: requireString(person, 'birthTime'),
  };
}

router.post('/match', (req, res, next) => {
  try {
    const body = req.body || {};
    const a = personFromBody(body, 'personA');
    const b = personFromBody(body, 'personB');

    const hi = req.locale === 'hi';
    const total = 22 + ((a.name.length + b.name.length) % 14); // 22..35 out of 36

    return ok(res, {
      personA: a,
      personB: b,
      gunaMilan: {
        total,
        outOf: 36,
        breakdown: [
          { category: 'Varna', score: 1, outOf: 1 },
          { category: 'Vashya', score: 2, outOf: 2 },
          { category: 'Tara', score: 2, outOf: 3 },
          { category: 'Yoni', score: 3, outOf: 4 },
          { category: 'Graha Maitri', score: 4, outOf: 5 },
          { category: 'Gana', score: 4, outOf: 6 },
          { category: 'Bhakoot', score: 3, outOf: 7 },
          { category: 'Nadi', score: 3, outOf: 8 },
        ],
      },
      emotional: {
        score: 78,
        summary: hi
          ? 'भावनात्मक लय समान है, संवाद की गति अलग है।'
          : 'Similar emotional rhythm, different conversational pace.',
      },
      longTerm: {
        score: 71,
        summary: hi
          ? 'लंबे समय में विकास के लिए शांत संचार आवश्यक है।'
          : 'Calm communication unlocks long-term growth together.',
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
