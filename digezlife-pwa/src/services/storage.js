/**
 * Local storage abstraction.
 * Every read/write is namespaced and JSON-safe. Swap the internals
 * here (e.g. to IndexedDB) without touching call sites.
 */
const NAMESPACE = 'pwa-starter';

export function readLocal(key, fallback = null) {
  try {
    const raw = localStorage.getItem(`${NAMESPACE}:${key}`);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeLocal(key, value) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(`${NAMESPACE}:${key}`);
      return true;
    }
    localStorage.setItem(`${NAMESPACE}:${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeLocal(key) {
  try {
    localStorage.removeItem(`${NAMESPACE}:${key}`);
    return true;
  } catch {
    return false;
  }
}
