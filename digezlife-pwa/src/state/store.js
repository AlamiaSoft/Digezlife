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
  if (household) {
    writeLocal('auth.household', household);
    if (household.id) writeLocal('auth.household_id', household.id);
  }
  authStore.set({
    isAuthenticated: true,
    user: user || authStore.get().user,
    household: household || authStore.get().household,
  });
}

export function logout() {
  writeLocal('auth.token', null);
  writeLocal('auth.user', null);
  writeLocal('auth.household', null);
  writeLocal('auth.household_id', null);
  authStore.set({
    isAuthenticated: false,
    user: null,
    household: { id: 'demo-household', name: 'My Household' },
  });
}

export function setHousehold(household) {
  if (!household) return;
  writeLocal('auth.household', household);
  if (household.id) writeLocal('auth.household_id', household.id);
  authStore.set({ household });
}

/* ---------------- Theme & Palette Slice ---------------- */
export const PALETTES = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Barkat',
    color: '#0f5132',
    accent: '#198754',
    cssVars: {
      '--wa-color-brand-95': '#e8f5ed',
      '--wa-color-brand-90': '#c9e6d4',
      '--wa-color-brand-80': '#93cba8',
      '--wa-color-brand-70': '#59ab79',
      '--wa-color-brand-60': '#2e8c53',
      '--wa-color-brand-50': '#198754',
      '--wa-color-brand-40': '#0f5132',
      '--wa-color-brand-30': '#0b3d26',
      '--wa-color-brand-20': '#072819',
      '--wa-color-brand-10': '#03140c',
      '--wa-color-brand-fill': '#0f5132',
      '--wa-color-brand-fill-loud': '#0f5132',
      '--wa-color-brand-fill-quiet': '#e8f5ed',
      '--wa-color-brand-on-loud': '#ffffff',
      '--wa-color-brand-on-quiet': '#0f5132',
      '--wa-color-brand-on-normal': '#0f5132',
      '--app-brand-primary': '#0f5132',
      '--app-brand-accent': '#198754',
    },
  },
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire Blue',
    color: '#0a4b78',
    accent: '#0284c7',
    cssVars: {
      '--wa-color-brand-95': '#e0f2fe',
      '--wa-color-brand-90': '#bae6fd',
      '--wa-color-brand-80': '#7dd3fc',
      '--wa-color-brand-70': '#38bdf8',
      '--wa-color-brand-60': '#0284c7',
      '--wa-color-brand-50': '#0369a1',
      '--wa-color-brand-40': '#0a4b78',
      '--wa-color-brand-30': '#073656',
      '--wa-color-brand-20': '#052338',
      '--wa-color-brand-10': '#02101a',
      '--wa-color-brand-fill': '#0a4b78',
      '--wa-color-brand-fill-loud': '#0a4b78',
      '--wa-color-brand-fill-quiet': '#e0f2fe',
      '--wa-color-brand-on-loud': '#ffffff',
      '--wa-color-brand-on-quiet': '#0a4b78',
      '--wa-color-brand-on-normal': '#0a4b78',
      '--app-brand-primary': '#0a4b78',
      '--app-brand-accent': '#0284c7',
    },
  },
  amber: {
    id: 'amber',
    name: 'Sunset Amber',
    color: '#b45309',
    accent: '#d97706',
    cssVars: {
      '--wa-color-brand-95': '#fef3c7',
      '--wa-color-brand-90': '#fde68a',
      '--wa-color-brand-80': '#fcd34d',
      '--wa-color-brand-70': '#fbbf24',
      '--wa-color-brand-60': '#f59e0b',
      '--wa-color-brand-50': '#d97706',
      '--wa-color-brand-40': '#b45309',
      '--wa-color-brand-30': '#78350f',
      '--wa-color-brand-20': '#451a03',
      '--wa-color-brand-10': '#230d01',
      '--wa-color-brand-fill': '#b45309',
      '--wa-color-brand-fill-loud': '#b45309',
      '--wa-color-brand-fill-quiet': '#fef3c7',
      '--wa-color-brand-on-loud': '#ffffff',
      '--wa-color-brand-on-quiet': '#b45309',
      '--wa-color-brand-on-normal': '#b45309',
      '--app-brand-primary': '#b45309',
      '--app-brand-accent': '#d97706',
    },
  },
  purple: {
    id: 'purple',
    name: 'Royal Violet',
    color: '#581c87',
    accent: '#7c3aed',
    cssVars: {
      '--wa-color-brand-95': '#f3e8ff',
      '--wa-color-brand-90': '#e9d5ff',
      '--wa-color-brand-80': '#d8b4fe',
      '--wa-color-brand-70': '#c084fc',
      '--wa-color-brand-60': '#a855f7',
      '--wa-color-brand-50': '#7c3aed',
      '--wa-color-brand-40': '#581c87',
      '--wa-color-brand-30': '#3b0764',
      '--wa-color-brand-20': '#24043d',
      '--wa-color-brand-10': '#11021e',
      '--wa-color-brand-fill': '#581c87',
      '--wa-color-brand-fill-loud': '#581c87',
      '--wa-color-brand-fill-quiet': '#f3e8ff',
      '--wa-color-brand-on-loud': '#ffffff',
      '--wa-color-brand-on-quiet': '#581c87',
      '--wa-color-brand-on-normal': '#581c87',
      '--app-brand-primary': '#581c87',
      '--app-brand-accent': '#7c3aed',
    },
  },
  teal: {
    id: 'teal',
    name: 'Teal Breeze',
    color: '#0f766e',
    accent: '#0d9488',
    cssVars: {
      '--wa-color-brand-95': '#ccfbf1',
      '--wa-color-brand-90': '#99f6e4',
      '--wa-color-brand-80': '#5eead4',
      '--wa-color-brand-70': '#2dd4bf',
      '--wa-color-brand-60': '#14b8a6',
      '--wa-color-brand-50': '#0d9488',
      '--wa-color-brand-40': '#0f766e',
      '--wa-color-brand-30': '#115e59',
      '--wa-color-brand-20': '#134e4a',
      '--wa-color-brand-10': '#042f2e',
      '--wa-color-brand-fill': '#0f766e',
      '--wa-color-brand-fill-loud': '#0f766e',
      '--wa-color-brand-fill-quiet': '#ccfbf1',
      '--wa-color-brand-on-loud': '#ffffff',
      '--wa-color-brand-on-quiet': '#0f766e',
      '--wa-color-brand-on-normal': '#0f766e',
      '--app-brand-primary': '#0f766e',
      '--app-brand-accent': '#0d9488',
    },
  },
};

export const themeStore = createStore({
  mode: readLocal('theme.mode', 'light'), // 'light' | 'dark' | 'system'
  palette: readLocal('theme.palette', 'emerald'), // 'emerald' | 'sapphire' | 'amber' | 'purple' | 'teal'
});

export function setThemeMode(mode) {
  writeLocal('theme.mode', mode);
  themeStore.set({ mode });
  applyTheme(mode);
}

export function setPalette(paletteId) {
  const palette = PALETTES[paletteId] || PALETTES.emerald;
  writeLocal('theme.palette', palette.id);
  themeStore.set({ palette: palette.id });
  applyPalette(palette.id);
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

export function applyPalette(paletteId) {
  const palette = PALETTES[paletteId] || PALETTES.emerald;
  const root = document.documentElement;
  Object.entries(palette.cssVars).forEach(([k, v]) => {
    root.style.setProperty(k, v);
  });
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
