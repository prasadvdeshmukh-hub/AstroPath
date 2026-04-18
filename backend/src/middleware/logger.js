'use strict';

function logger() {
  return function (req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: 'info',
          reqId: req.id,
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          ms,
          locale: req.locale,
          userId: req.user && req.user.id,
        })
      );
    });
    next();
  };
}

module.exports = logger;
