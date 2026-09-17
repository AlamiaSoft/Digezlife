/**
 * Minimal hash router.
 * Hash-based on purpose: this starter kit is meant to be deployable
 * to any static host (including plain object storage) without
 * server-side rewrite rules. If you prefer History API routing in
 * your real app, swap this file only — screens are unaffected.
 */
const routes = new Map();
let notFoundHandler = () => '<div class="screen">Not found</div>';
let currentPath = '';

/**
 * Register a route with a screen module.
 * `screen` may be either a function returning an HTML string, or an
 * object { render(params) => html, afterRender(params) } for
 * screens that need to attach event listeners once mounted.
 */
export function registerRoute(path, screen) {
  const normalized = typeof screen === 'function' ? { render: screen } : screen;
  routes.set(path, normalized);
}

export function registerNotFound(handler) {
  notFoundHandler = handler;
}

function matchRoute(hash) {
  const path = hash.replace(/^#/, '') || '/';
  const [base, query] = path.split('?');
  const params = Object.fromEntries(new URLSearchParams(query || ''));

  for (const [pattern, handler] of routes) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = base.split('/').filter(Boolean);
    if (patternParts.length !== pathParts.length) continue;

    const routeParams = {};
    let matched = true;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        routeParams[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        matched = false;
        break;
      }
    }
    if (matched) {
      return { handler, params: { ...routeParams, ...params } };
    }
  }
  return null;
}

export function navigate(path) {
  if (location.hash.replace(/^#/, '') === path) {
    render();
  } else {
    location.hash = path;
  }
}

export function currentRoute() {
  return currentPath;
}

const listeners = new Set();
export function onRouteChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function render() {
  const hash = location.hash || '#/splash';
  currentPath = hash.replace(/^#/, '') || '/';
  const outlet = document.getElementById('screen-outlet');
  if (!outlet) return;

  const match = matchRoute(hash);
  listeners.forEach((fn) => fn(currentPath));

  try {
    const screen = match ? match.handler : { render: notFoundHandler };
    const html = await screen.render(match ? match.params : {});
    outlet.innerHTML = html;
    outlet.scrollTop = 0;
    document.dispatchEvent(
      new CustomEvent('screen:mounted', { detail: { path: currentPath, meta: screen.meta || {} } })
    );
    if (typeof screen.afterRender === 'function') {
      await screen.afterRender(match ? match.params : {});
    }
  } catch (err) {
    console.error(err);
    outlet.innerHTML = `<div class="screen"><p>Something went wrong rendering this screen.</p></div>`;
  }
}

export function startRouter() {
  window.addEventListener('hashchange', render);
  document.addEventListener('locale:changed', render);
  render();
}

