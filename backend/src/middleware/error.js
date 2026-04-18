'use strict';

const { ApiError } = require('../utils/errors');

function notFoundHandler(req, _res, next) {
  next(new ApiError(404, 'not_found', `No route for ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let status = 500;
  let code = 'internal_error';
  let message = 'Something went wrong.';
  let details;

  if (err instanceof ApiError) {
    status = err.status;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err && err.type === 'entity.parse.failed') {
    status = 400;
    code = 'invalid_json';
    message = 'Request body is not valid JSON.';
  }

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'error',
        reqId: req.id,
        path: req.originalUrl,
        message: err && err.message,
        stack: err && err.stack,
      })
    );
  }

  res.status(status).json({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    requestId: req.id,
  });
}

module.exports = { notFoundHandler, errorHandler };
