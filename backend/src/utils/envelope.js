'use strict';

// Standard response envelope: { data, meta }.
// The frontend should parse `data` from every successful response.

function ok(res, data, meta) {
  const body = { data };
  if (meta) body.meta = meta;
  return res.json(body);
}

function created(res, data, meta) {
  const body = { data };
  if (meta) body.meta = meta;
  return res.status(201).json(body);
}

module.exports = { ok, created };
