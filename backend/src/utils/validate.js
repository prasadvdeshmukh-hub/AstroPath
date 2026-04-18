'use strict';

const { badRequest } = require('./errors');

function requireString(obj, key, opts = {}) {
  const v = obj && obj[key];
  if (typeof v !== 'string' || v.trim() === '') {
    throw badRequest(`"${key}" is required and must be a non-empty string.`);
  }
  if (opts.max && v.length > opts.max) {
    throw badRequest(`"${key}" must be <= ${opts.max} characters.`);
  }
  return v.trim();
}

function optionalString(obj, key, opts = {}) {
  const v = obj && obj[key];
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v !== 'string') {
    throw badRequest(`"${key}" must be a string.`);
  }
  if (opts.max && v.length > opts.max) {
    throw badRequest(`"${key}" must be <= ${opts.max} characters.`);
  }
  return v.trim();
}

function requireIsoDate(obj, key) {
  const v = requireString(obj, key);
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) {
    throw badRequest(`"${key}" must be an ISO-8601 date or datetime.`);
  }
  return d;
}

module.exports = { requireString, optionalString, requireIsoDate };
