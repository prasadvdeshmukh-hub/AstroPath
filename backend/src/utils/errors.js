'use strict';

class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

function badRequest(message, details) {
  return new ApiError(400, 'bad_request', message, details);
}
function notFound(message) {
  return new ApiError(404, 'not_found', message);
}

module.exports = { ApiError, badRequest, notFound };
