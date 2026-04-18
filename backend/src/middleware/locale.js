'use strict';

// Resolve the effective locale for a request.
// Priority: explicit ?lang=xx query, then Accept-Language header, then 'en'.
// Supported languages: English (en), Hindi (hi), Marathi (mr). Others fall
// through to the default so we never ship partially-translated strings.

const SUPPORTED = new Set(['en', 'hi', 'mr']);
const DEFAULT = 'en';

function pickFromAcceptLanguage(header) {
  if (!header) return null;
  const parts = header
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const [tag, qPart] = p.split(';');
      const q = qPart && qPart.startsWith('q=') ? Number(qPart.slice(2)) : 1;
      return { tag: (tag || '').toLowerCase(), q: Number.isFinite(q) ? q : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const p of parts) {
    const lang = p.tag.split('-')[0];
    if (SUPPORTED.has(lang)) return lang;
  }
  return null;
}

function localeMiddleware() {
  return function (req, _res, next) {
    const fromQuery =
      typeof req.query.lang === 'string' ? req.query.lang.toLowerCase() : null;
    const fromHeader = pickFromAcceptLanguage(req.header('accept-language'));
    const picked =
      (fromQuery && SUPPORTED.has(fromQuery) && fromQuery) || fromHeader || DEFAULT;
    req.locale = picked;
    next();
  };
}

module.exports = localeMiddleware;
module.exports.SUPPORTED_LOCALES = Array.from(SUPPORTED);
module.exports.DEFAULT_LOCALE = DEFAULT;
