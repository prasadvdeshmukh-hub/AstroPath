'use strict';

const { getFirestore } = require('../config/firestore');
const C = require('./collections');

async function createSession({ userId, astrologerId, mode }) {
  const db = getFirestore();
  const ref = await db.collection(C.CONSULTATIONS).add({
    userId,
    astrologerId,
    mode,
    status: 'queued',
    createdAt: new Date().toISOString(),
  });
  return { id: ref.id };
}

module.exports = { createSession };
