'use strict';

// User and profile repository.
// A "user" is the auth identity; a "profile" is the app-facing profile that stores
// preferences such as language and notification settings. We keep them in
// separate Firestore documents keyed by the same user id.

const { getFirestore } = require('../config/firestore');
const C = require('./collections');

const DEFAULT_PREFERENCES = Object.freeze({
  languageCode: 'en',
  notificationsEnabled: true,
  consultationMode: 'chat', // chat | call | video
  focusArea: 'balance', // career | love | finance | spiritual | balance
});

async function getOrCreateProfile(userId, overrides = {}) {
  const db = getFirestore();
  const ref = db.collection(C.PROFILES).doc(userId);
  const snap = await ref.get();
  if (snap.exists) return { id: snap.id, ...snap.data() };

  const initial = {
    userId,
    preferences: { ...DEFAULT_PREFERENCES, ...overrides.preferences },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await ref.set(initial);
  return { id: userId, ...initial };
}

async function getPreferences(userId) {
  const profile = await getOrCreateProfile(userId);
  return profile.preferences;
}

async function updatePreferences(userId, patch) {
  const db = getFirestore();
  const profile = await getOrCreateProfile(userId);
  const next = { ...profile.preferences, ...patch };
  await db
    .collection(C.PROFILES)
    .doc(userId)
    .set(
      { preferences: next, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  return next;
}

module.exports = {
  DEFAULT_PREFERENCES,
  getOrCreateProfile,
  getPreferences,
  updatePreferences,
};
