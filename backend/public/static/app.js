// Shared helpers for the AstroPath demo pages.

const LOCALE_KEY = 'astropath.locale';

function getLocale() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q && ['en', 'hi', 'mr'].includes(q)) {
    localStorage.setItem(LOCALE_KEY, q);
    return q;
  }
  return localStorage.getItem(LOCALE_KEY) || 'en';
}

function setLocale(loc) {
  localStorage.setItem(LOCALE_KEY, loc);
  const url = new URL(location.href);
  url.searchParams.set('lang', loc);
  location.href = url.toString();
}

async function api(path, opts = {}) {
  const loc = getLocale();
  const sep = path.includes('?') ? '&' : '?';
  const url = path.startsWith('/') ? path + sep + 'lang=' + loc : path;
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers: Object.assign(
      { 'accept': 'application/json', 'accept-language': loc },
      opts.body ? { 'content-type': 'application/json' } : {}
    ),
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const ct = res.headers.get('content-type') || '';
  const body = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = body && body.error ? body.error.message : ('HTTP ' + res.status);
    const e = new Error(msg);
    e.status = res.status;
    e.body = body;
    throw e;
  }
  return body;
}

function el(tag, props, ...children) {
  const n = document.createElement(tag);
  if (props) for (const k in props) {
    if (k === 'class') n.className = props[k];
    else if (k === 'html') n.innerHTML = props[k];
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), props[k]);
    else if (props[k] !== undefined && props[k] !== null) n.setAttribute(k, props[k]);
  }
  for (const c of children) {
    if (c == null) continue;
    n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return n;
}

function renderTopbar(activePath) {
  const loc = getLocale();
  const pages = [
    { href: '/demo/', label: 'Home' },
    { href: '/demo/login.html', label: 'Login' },
    { href: '/demo/dashboard.html', label: 'Dashboard' },
    { href: '/demo/kundli.html', label: 'Kundli' },
    { href: '/demo/panchang.html', label: 'Panchang' },
    { href: '/demo/horoscope.html', label: 'Horoscope' },
    { href: '/demo/transits.html', label: 'Transits' },
    { href: '/demo/consultations.html', label: 'Consult' },
    { href: '/demo/assistant.html', label: 'AI Assistant' },
    { href: '/demo/muhurat.html', label: 'Muhurat' },
    { href: '/demo/compatibility.html', label: 'Compatibility' },
    { href: '/demo/preferences.html', label: 'Preferences' },
  ];
  const brand = el('div', { class: 'brand' }, 'Astro', el('span', null, 'Path'));
  const nav = el('div', { class: 'nav' },
    ...pages.map((p) => el('a', {
      href: p.href + '?lang=' + loc,
      class: location.pathname.endsWith(p.href.split('/').pop() || 'index.html') ||
             (p.href === '/demo/' && (location.pathname === '/demo/' || location.pathname.endsWith('/index.html'))) ? 'active' : ''
    }, p.label))
  );
  const select = el('select', { onchange: (e) => setLocale(e.target.value) });
  for (const [code, name] of [['en', 'English'], ['hi', 'हिंदी'], ['mr', 'मराठी']]) {
    const opt = el('option', { value: code }, name);
    if (code === loc) opt.selected = true;
    select.appendChild(opt);
  }
  const picker = el('div', { class: 'locale-picker' },
    el('span', { class: 'muted' }, 'Language'),
    select
  );
  const top = el('div', { class: 'topbar' }, brand, nav, picker);
  document.body.insertBefore(top, document.body.firstChild);
}

function showError(container, err) {
  container.innerHTML = '';
  const msg = err && err.message ? err.message : String(err);
  container.appendChild(el('div', { class: 'error' }, 'Error: ' + msg));
  if (err && err.body) {
    container.appendChild(el('pre', { html: JSON.stringify(err.body, null, 2) }));
  }
}

function kv(obj) {
  const tbl = el('div', { class: 'kv' });
  for (const k of Object.keys(obj)) {
    tbl.appendChild(el('div', { class: 'k' }, k));
    const v = obj[k];
    const rendered = (typeof v === 'object' && v !== null)
      ? JSON.stringify(v)
      : String(v);
    tbl.appendChild(el('div', { class: 'v' }, rendered));
  }
  return tbl;
}

function rawJson(obj) {
  return el('pre', { html: JSON.stringify(obj, null, 2) });
}

window.AP = { api, getLocale, setLocale, renderTopbar, el, kv, showError, rawJson };
