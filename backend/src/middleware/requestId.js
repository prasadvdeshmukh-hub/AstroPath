'use strict';

const crypto = require('crypto');

function requestId() {
  return function (req, res, next) {
    const incoming = req.header('x-request-id');
    const id = incoming && incoming.trim().length > 0 ? incoming : crypto.randomUUID();
    req.id = id;
    res.setHeader('x-request-id', id);
    next();
  };
}

module.exports = requestId;
