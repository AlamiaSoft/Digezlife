/**
 * DigEzLife Reactive State Stores
 * Minimal observable stores for authentication, tenant context, theme, network, and toast alerts.
 */
import { readLocal, writeLocal } from '../services/storage.js';

export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  function get() {
    return state;
  }

  function set(patch) {
    const patchObj = typeof patch === 'function' ? patch(state) : patch;
    state = { ...state, ...patchObj };
    listeners.forEach((fn) => fn(state));
  }

  function subscribe(fn) {
    listeners.add(fn);
    fn(state);
    return () => listeners.delete(fn);
  }

  return { get, set, subscribe };
}

/* ---------------- Auth & Household Slice ---------------- */
export const authStore = createStore({
  isAuthenticated: !!readLocal('auth.token', null),
  user: readLocal('auth.user', null),
  household: readLocal('auth.household', { id: 'demo-household', name: 'My Household' }),
});

export function login(user, token, household) {
  if (token) writeLocal('auth.token', token);
  if (user) {
    writeLocal('auth.user', user);
    writeLocal('auth.last_user', user);
  }
  if (household) writeLocal('auth.household', household);
  authStore.set({
    isAuthenticated: true,
    user: user || authStore.get().user,
    household: household || authStore.get().household,
  });
}

export function logout() {
  writeLocal('auth.token', null);
  writeLocal('auth.user', null);
  writeLocal('auth.household_id', null);
  authStore.set({
    isAuthenticated: false,
    user: null,
    household: { id: 'demo-household', name: 'My Household' },
  });
}


export function setHousehold(household) {
  writeLocal('auth.household', household);
  writeLocal('auth.household_id', household.id);
  authStore.set({ household });
}

/* ---------------- Theme Slice ---------------- */
export const themeStore = createStore({
  mode: readLocal('theme.mode', 'light'), // 'light' | 'dark' | 'system'
});

export function setThemeMode(mode) {
  writeLocal('theme.mode', mode);
  themeStore.set({ mode });
  applyTheme(mode);
}

export function applyTheme(mode) {
  const root = document.documentElement;
  root.classList.remove('wa-light', 'wa-dark');
  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(prefersDark ? 'wa-dark' : 'wa-light');
  } else {
    root.classList.add(mode === 'dark' ? 'wa-dark' : 'wa-light');
  }
}

/* ---------------- Network Status Slice ---------------- */
export const networkStore = createStore({
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
});

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => networkStore.set({ online: true }));
  window.addEventListener('offline', () => networkStore.set({ online: false }));
}

/* ---------------- Toast Slice ---------------- */
export const toastStore = createStore({ queue: [] });

export function pushToast({ message, variant = 'brand', duration = 3000 }) {
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  toastStore.set((s) => ({ queue: [...s.queue, { id, message, variant, duration }] }));
  return id;
}

export function dismissToast(id) {
  toastStore.set((s) => ({ queue: s.queue.filter((t) => t.id !== id) }));
}
