'use strict';

const express = require('express');
const { getFirestoreMode } = require('../config/firestore');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    data: {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      firestoreMode: getFirestoreMode(),
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
