'use strict';

const { getFirestore } = require('../config/firestore');
const C = require('./collections');

async function saveKundli(userId, kundli) {
  const db = getFirestore();
  const ref = await db.collection(C.KUNDLI).add({
    userId,
    ...kundli,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

/**
 * Find the most recent kundli for a given user.
 * Works for both the in-memory shim and real Firestore (we iterate + sort).
 * Returns null if none found.
 */
async function getLatestForUser(userId) {
  if (!userId) return null;
  const db = getFirestore();
  try {
    const snap = await db.collection(C.KUNDLI).get();
    if (!snap || !snap.docs || snap.empty) return null;
    const mine = [];
    for (const doc of snap.docs) {
      const data = doc.data();
      if (data && data.userId === userId) mine.push({ id: doc.id, ...data });
    }
    if (mine.length === 0) return null;
    mine.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return mine[0];
  } catch (_err) {
    return null;
  }
}

module.exports = { saveKundli, getLatestForUser };
