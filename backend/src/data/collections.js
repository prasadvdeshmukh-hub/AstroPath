'use strict';

// Canonical Firestore collection names.
// Keep these stable - frontend/backend contracts reference them by shape, not path.

module.exports = Object.freeze({
  USERS: 'users',
  PROFILES: 'profiles',
  KUNDLI: 'kundliData',
  HOROSCOPES: 'horoscopeData',
  ASTROLOGERS: 'astrologers',
  CONSULTATIONS: 'consultations',
  PAYMENTS: 'payments',
  SUBSCRIPTIONS: 'subscriptions',
});
