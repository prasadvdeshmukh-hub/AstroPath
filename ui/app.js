/*
 * AstroPath shared client (app.js)
 * ---------------------------------
 * Every UI page loads this file. It provides:
 *   - window.AstroPath.api   : typed fetch helpers around the backend
 *   - window.AstroPath.state : localStorage-backed session + profile + chat
 *   - window.AstroPath.guard : auth-aware route gate (redirects if needed)
 *   - window.AstroPath.nav   : small navigation helpers with state preserved
 *
 * Backend contract: JSON envelope { data, meta } on success, { error } on failure.
 * Auth mode in dev: AUTH_MODE=bypass. Bearer token is optional; when present we forward it.
 */

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // Config
  // ------------------------------------------------------------------
  // If the UI is served from the same origin as the backend (recommended for
  // go-live), API_BASE stays empty and requests use relative URLs. Otherwise
  // the page can override via <meta name="astropath-api" content="http://...">.
  const meta = document.querySelector('meta[name="astropath-api"]');
  const API_BASE = (meta && meta.content) || '';

  const LS_KEYS = Object.freeze({
    token:       'astropath.token',
    refreshToken:'astropath.refreshToken',
    user:        'astropath.user',
    profile:     'astropath.profile',
    onboarding:  'astropath.onboarding',
    locale:      'astropath.locale',
    chat:        'astropath.chat',
    kundli:      'astropath.lastKundli',
    birthInfo:   'astropath.birthInfo',
    bootstrapped:'astropath.bootstrapped',
  });

  // ------------------------------------------------------------------
  // Storage helpers
  // ------------------------------------------------------------------
  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (_e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (_e) {}
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (_e) {}
    },
    clearAll() {
      for (const k of Object.values(LS_KEYS)) storage.remove(k);
    },
  };

  // ------------------------------------------------------------------
  // Session state
  // ------------------------------------------------------------------
  const state = {
    get token()     { return storage.get(LS_KEYS.token, null); },
    set token(v)    { v ? storage.set(LS_KEYS.token, v) : storage.remove(LS_KEYS.token); },

    get refreshToken() { return storage.get(LS_KEYS.refreshToken, null); },
    set refreshToken(v){ v ? storage.set(LS_KEYS.refreshToken, v) : storage.remove(LS_KEYS.refreshToken); },

    get user()      { return storage.get(LS_KEYS.user, null); },
    set user(v)     { v ? storage.set(LS_KEYS.user, v) : storage.remove(LS_KEYS.user); },

    get profile()   { return storage.get(LS_KEYS.profile, null); },
    set profile(v)  { v ? storage.set(LS_KEYS.profile, v) : storage.remove(LS_KEYS.profile); },

    get locale()    { return storage.get(LS_KEYS.locale, 'en'); },
    set locale(v)   { storage.set(LS_KEYS.locale, v || 'en'); },

    get onboardingComplete() { return !!storage.get(LS_KEYS.onboarding, false); },
    set onboardingComplete(v){ storage.set(LS_KEYS.onboarding, !!v); },

    get birthInfo() { return storage.get(LS_KEYS.birthInfo, null); },
    set birthInfo(v){ v ? storage.set(LS_KEYS.birthInfo, v) : storage.remove(LS_KEYS.birthInfo); },

    get lastKundli(){ return storage.get(LS_KEYS.kundli, null); },
    set lastKundli(v){ v ? storage.set(LS_KEYS.kundli, v) : storage.remove(LS_KEYS.kundli); },

    get chat()      { return storage.get(LS_KEYS.chat, []); },
    set chat(v)     { storage.set(LS_KEYS.chat, Array.isArray(v) ? v : []); },
    appendChat(msg) {
      const list = state.chat;
      list.push({ ...msg, at: new Date().toISOString() });
      // keep last 50 messages to avoid LS bloat
      state.chat = list.slice(-50);
    },
    clearChat() { storage.remove(LS_KEYS.chat); },

    isAuthenticated() { return !!state.user; },
    signOut() {
      storage.clearAll();
    },
  };

  // ------------------------------------------------------------------
  // Fetch wrapper
  // ------------------------------------------------------------------
  async function fetchJson(path, options = {}) {
    const url = API_BASE + path;
    const headers = Object.assign(
      { 'Accept': 'application/json', 'Accept-Language': state.locale || 'en' },
      options.headers || {}
    );
    if (state.token) headers['Authorization'] = 'Bearer ' + state.token;
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options = { ...options, body: JSON.stringify(options.body) };
    }
    const res = await fetch(url, { ...options, headers });
    let body = null;
    try { body = await res.json(); } catch (_e) { body = null; }
    if (!res.ok) {
      const err = new Error((body && body.error && body.error.message) || ('HTTP ' + res.status));
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body && body.data !== undefined ? body.data : body;
  }

  // ------------------------------------------------------------------
  // Typed API
  // ------------------------------------------------------------------
  const api = {
    health()               { return fetchJson('/health'); },

    // Auth + session
    authConfig()           { return fetchJson('/v1/auth/config'); },
    session(body)          { return fetchJson('/v1/auth/session', { method: 'POST', body: body || {} }); },

    // Dashboard + preferences
    dashboard()            { return fetchJson('/v1/dashboard'); },
    getPreferences()       { return fetchJson('/v1/profile/preferences'); },
    patchPreferences(p)    { return fetchJson('/v1/profile/preferences', { method: 'PATCH', body: p }); },

    // Core astrology
    generateKundli(payload){ return fetchJson('/v1/kundli/generate', { method: 'POST', body: payload }); },
    horoscope(range)       { return fetchJson('/v1/horoscope/' + (range || 'daily')); },
    panchangToday()        { return fetchJson('/v1/panchang/today'); },
    muhurat(p)             { return fetchJson('/v1/muhurat/search', { method: 'POST', body: p }); },
    compatibility(p)       { return fetchJson('/v1/compatibility/match', { method: 'POST', body: p }); },
    transits(date)         { return fetchJson('/v1/transits?date=' + encodeURIComponent(date)); },

    // Consultations
    consultationHub()      { return fetchJson('/v1/consultations/hub'); },
    bookConsultation(p)    { return fetchJson('/v1/consultations/session', { method: 'POST', body: p }); },

    // Assistant
    assistantSnapshot()    { return fetchJson('/v1/assistant/snapshot'); },
    assistantQuery(prompt, history) {
      return fetchJson('/v1/assistant/query', {
        method: 'POST',
        body: { prompt, history: history || [] },
      });
    },

    // Geo: India-only pincode / state / city master (backend-served CSV)
    geoCountries()         { return fetchJson('/v1/geo/countries'); },
    geoStates()            { return fetchJson('/v1/geo/states'); },
    geoCities(state)       { return fetchJson('/v1/geo/states/' + encodeURIComponent(state) + '/cities'); },
    geoPincode(code)       { return fetchJson('/v1/geo/pincode/' + encodeURIComponent(code)); },

    // Subscription / Razorpay
    subPlans()             { return fetchJson('/v1/subscription/plans'); },
    subStatus()            { return fetchJson('/v1/subscription/status'); },
    subCreateOrder(planId) { return fetchJson('/v1/subscription/order', { method: 'POST', body: { planId } }); },
    subVerify(payload)     { return fetchJson('/v1/subscription/verify', { method: 'POST', body: payload }); },
    subCancel()            { return fetchJson('/v1/subscription/cancel', { method: 'POST', body: {} }); },
    subStubComplete(orderId) { return fetchJson('/v1/subscription/stub-complete', { method: 'POST', body: { orderId } }); },
  };

  // ------------------------------------------------------------------
  // Auth bootstrap
  // ------------------------------------------------------------------
  async function bootstrapSession() {
    // In bypass mode the backend will hand us a dev user on /v1/auth/session.
    // We cache it so pages can render instantly on reload.
    try {
      const data = await api.session();
      if (data && data.user)    state.user = data.user;
      if (data && data.profile) state.profile = data.profile;
      storage.set(LS_KEYS.bootstrapped, true);
      return data;
    } catch (err) {
      if (err && err.status === 401) {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.profile = null;
      }
      // In firebase mode without a token we'll get 401; UI should show /login.
      return null;
    }
  }

  function isUiPage() {
    return location.pathname.replace(/\\/g, '/').includes('/ui/');
  }

  function buildPath(rootName, uiName) {
    return isUiPage() ? '../' + rootName : './' + (uiName || rootName);
  }

  const paths = Object.freeze({
    landing: () => buildPath('index.html'),
    login: () => buildPath('login.html'),
    dashboard: () => buildPath('ui/dashboard.html', 'dashboard.html'),
    onboarding: () => buildPath('ui/onboarding.html', 'onboarding.html'),
    settings: () => buildPath('ui/settings.html', 'settings.html'),
  });

  // ------------------------------------------------------------------
  // Splash overlay — shown during bootstrap so no flash of unauthed content
  // ------------------------------------------------------------------
  function showSplash(message) {
    let el = document.querySelector('.auth-splash');
    if (!el) {
      el = document.createElement('div');
      el.className = 'auth-splash';
      el.innerHTML =
        '<div class="auth-splash-inner">' +
          '<div class="auth-splash-orb"></div>' +
          '<div class="auth-splash-label"></div>' +
        '</div>';
      document.body.appendChild(el);
    }
    const label = el.querySelector('.auth-splash-label');
    if (label) label.textContent = message || 'Aligning the stars…';
    el.classList.add('is-visible');
    return el;
  }
  function hideSplash() {
    const el = document.querySelector('.auth-splash');
    if (!el) return;
    el.classList.remove('is-visible');
    // remove after CSS transition
    setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 260);
  }

  // ------------------------------------------------------------------
  // Route guard
  //   page = 'public'   : accessible without auth (index, login, guidelines, hub)
  //   page = 'onboarding': requires auth, prompts onboarding if not complete
  //   page = 'app'      : requires auth AND completed onboarding
  // ------------------------------------------------------------------
  async function guard(page) {
    const here = location.pathname.split('/').pop() || '';
    const needsBootstrap = !state.user || !!state.token;

    if (needsBootstrap && page !== 'public') showSplash('Aligning the stars…');

    // Always try to bootstrap so token/dev-bypass identity is fresh
    if (needsBootstrap) await bootstrapSession();

    if (page === 'public') {
      hideSplash();
      setActiveNav();
      normalizeNavIcons();
      hydrateStatusRow();
      return true;
    }

    if (!state.isAuthenticated()) {
      // Avoid loops: don't redirect away from index/login
      if (!['index.html', 'login.html', ''].includes(here)) {
        location.replace(paths.login());
      }
      hideSplash();
      return false;
    }
    if (page === 'onboarding') {
      hideSplash();
      setActiveNav();
      normalizeNavIcons();
      hydrateStatusRow();
      return true;
    }

    if (page === 'app' && !state.onboardingComplete) {
      if (here !== 'onboarding.html') location.replace(paths.onboarding());
      hideSplash();
      return false;
    }
    hideSplash();
    setActiveNav();
    normalizeNavIcons();
    hydrateStatusRow();
    mountSessionMenu();
    return true;
  }

  // ------------------------------------------------------------------
  // Bottom-nav active state + lightweight navigate()
  // ------------------------------------------------------------------
  const NAV_MAP = {
    'dashboard.html':    'home',
    'horoscope.html':    'home',
    'kundli.html':       'kundli',
    'panchang.html':     'kundli',
    'consultation.html': 'consult',
    'assistant.html':    'ai',
    'settings.html':     'settings',
    'learn.html':        'settings',
    'subscription.html': 'settings',
  };
  function setActiveNav() {
    const here = location.pathname.split('/').pop() || '';
    const key = NAV_MAP[here];
    if (!key) return;
    const items = document.querySelectorAll('.bn-item');
    items.forEach((node) => {
      const href  = (node.getAttribute('href') || '').split('/').pop();
      const match = (
        (key === 'home'    && href === 'dashboard.html') ||
        (key === 'kundli'  && href === 'kundli.html')    ||
        (key === 'consult' && href === 'consultation.html') ||
        (key === 'ai'      && href === 'assistant.html') ||
        (key === 'settings'&& href === 'settings.html')
      );
      node.classList.toggle('is-active', !!match);
    });
  }

  function normalizeNavIcons() {
    document.querySelectorAll('.bn-item').forEach((node) => {
      const label = (node.textContent || '').trim().toLowerCase();
      const icon = node.querySelector('.bn-icon');
      if (icon && label.startsWith('home')) icon.innerHTML = '&#8962;';
    });
  }

  function hydrateStatusRow() {
    const row = document.querySelector('.status-row');
    if (!row) return;
    const left = row.querySelector('span:first-child');
    if (!left) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString([], { day: 'numeric', month: 'short' });
    left.textContent = time + ' - ' + date;
  }

  function navigate(path, opts) {
    if (!path) return;
    const splash = (opts && opts.silent) ? null : showSplash('Loading…');
    // Slight delay so the splash has time to paint — feels like a true page break.
    setTimeout(() => { location.href = path; }, 80);
    return splash;
  }

  // Wire the bottom-nav globally: show splash on inter-page taps
  document.addEventListener('click', (e) => {
    const link = e.target && e.target.closest && e.target.closest('.bn-item');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    // Same page? skip.
    const herePath = location.pathname.split('/').pop() || '';
    const targetPath = href.split('/').pop();
    if (herePath === targetPath) { e.preventDefault(); return; }
    showSplash('Loading…');
  }, { capture: true });

  // ------------------------------------------------------------------
  // Small DOM helpers
  // ------------------------------------------------------------------
  const dom = {
    setText(sel, text) {
      const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
      if (el && text !== undefined && text !== null) el.textContent = text;
    },
    qs(sel, root)  { return (root || document).querySelector(sel); },
    qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); },
    toast(msg) {
      let el = document.querySelector('.astro-toast');
      if (!el) {
        el = document.createElement('div');
        el.className = 'astro-toast';
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.classList.add('is-visible');
      clearTimeout(el.__t);
      el.__t = setTimeout(() => el.classList.remove('is-visible'), 2400);
    },
  };

  let sessionMenuMounted = false;
  let sessionSheetEl = null;

  function displayName() {
    const birthInfo = state.birthInfo;
    if (birthInfo && birthInfo.name) return birthInfo.name;
    if (state.profile && state.profile.displayName) return state.profile.displayName;
    if (state.user && state.user.email) return state.user.email.split('@')[0];
    return 'Cosmic seeker';
  }

  function displayMeta() {
    if (state.user && state.user.email) return state.user.email;
    if (state.user && state.user.provider) return 'Signed in with ' + state.user.provider;
    return 'AstroPath session';
  }

  function initialsFor(name) {
    return String(name || 'A')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'A';
  }

  function closeSessionMenu() {
    if (sessionSheetEl) sessionSheetEl.classList.remove('is-visible');
  }

  function renderSessionSheet() {
    if (sessionSheetEl) return sessionSheetEl;
    sessionSheetEl = document.createElement('div');
    sessionSheetEl.className = 'session-sheet-backdrop';
    sessionSheetEl.innerHTML =
      '<div class="session-sheet" role="dialog" aria-modal="true" aria-label="Profile menu">' +
        '<button class="session-sheet__close" type="button" aria-label="Close profile menu">&times;</button>' +
        '<div class="session-sheet__avatar"></div>' +
        '<div class="session-sheet__name"></div>' +
        '<div class="session-sheet__meta"></div>' +
        '<div class="session-sheet__actions">' +
          '<a class="session-sheet__link" data-session-link="settings" href="#">Settings</a>' +
          '<a class="session-sheet__link" data-session-link="profile" href="#">Edit profile</a>' +
          '<button class="session-sheet__logout" type="button">Log out</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(sessionSheetEl);
    sessionSheetEl.addEventListener('click', (event) => {
      if (event.target === sessionSheetEl) closeSessionMenu();
    });
    sessionSheetEl.querySelector('.session-sheet__close').addEventListener('click', closeSessionMenu);
    sessionSheetEl.querySelector('[data-session-link="settings"]').addEventListener('click', (event) => {
      event.preventDefault();
      closeSessionMenu();
      location.href = paths.settings();
    });
    sessionSheetEl.querySelector('[data-session-link="profile"]').addEventListener('click', (event) => {
      event.preventDefault();
      closeSessionMenu();
      location.href = paths.onboarding();
    });
    sessionSheetEl.querySelector('.session-sheet__logout').addEventListener('click', () => {
      state.signOut();
      closeSessionMenu();
      location.replace(paths.login());
    });
    return sessionSheetEl;
  }

  function openSessionMenu() {
    const sheet = renderSessionSheet();
    const name = displayName();
    dom.setText(sheet.querySelector('.session-sheet__name'), name);
    dom.setText(sheet.querySelector('.session-sheet__meta'), displayMeta());
    dom.setText(sheet.querySelector('.session-sheet__avatar'), initialsFor(name));
    sheet.classList.add('is-visible');
  }

  function decorateSessionTrigger(trigger) {
    if (!trigger || trigger.dataset.sessionBound === 'true') return;
    const name = displayName();
    trigger.dataset.sessionBound = 'true';
    trigger.classList.add('session-trigger');
    if (!trigger.textContent.trim()) trigger.textContent = initialsFor(name);
    trigger.setAttribute('type', trigger.getAttribute('type') || 'button');
    trigger.setAttribute('aria-label', 'Open profile menu');
    trigger.addEventListener('click', openSessionMenu);
  }

  function pageIsPublic() {
    const here = location.pathname.split('/').pop() || '';
    return ['index.html', 'login.html', 'guidelines.html', 'hub.html', 'journey.html', ''].includes(here);
  }

  function mountSessionMenu() {
    if (pageIsPublic()) return;
    const here = location.pathname.split('/').pop() || '';
    // Product decision (2026-04-20): profile icon only on Home (dashboard).
    // Other pages wire the session menu only when the page explicitly opts in
    // via a [data-session-trigger] element (e.g. dashboard's avatar button).
    const explicitTrigger = document.querySelector('[data-session-trigger]');
    if (explicitTrigger) {
      decorateSessionTrigger(explicitTrigger);
      sessionMenuMounted = true;
      return;
    }
    // No floating icon injected anywhere else anymore.
  }

  normalizeNavIcons();
  hydrateStatusRow();

  // Re-apply i18n whenever the locale changes mid-page (Settings picker).
  function refreshI18n() {
    if (window.AstroPathI18n && typeof window.AstroPathI18n.apply === 'function') {
      window.AstroPathI18n.apply();
    }
  }

  // ------------------------------------------------------------------
  // Public surface
  // ------------------------------------------------------------------
  window.AstroPath = Object.freeze({
    API_BASE,
    LS_KEYS,
    storage,
    state,
    api,
    fetchJson,
    bootstrap: bootstrapSession,
    guard,
    dom,
    paths,
    nav: { navigate, setActive: setActiveNav, showSplash, hideSplash },
    sessionMenu: { open: openSessionMenu, close: closeSessionMenu, mount: mountSessionMenu },
    i18n: { refresh: refreshI18n, t: (k, f) => (window.AstroPathI18n ? window.AstroPathI18n.t(k, f) : (f || k)) },
  });
})();
