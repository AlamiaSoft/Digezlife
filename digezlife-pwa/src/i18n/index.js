import { LOCALES } from './locales.js';
import { readLocal, writeLocal } from '../services/storage.js';

import en from './locales/en.json';
import ur from './locales/ur.json';
import urRoman from './locales/ur-roman.json';
import pa from './locales/pa.json';
import ps from './locales/ps.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import ne from './locales/ne.json';

const dictionaries = {
  en,
  ur,
  'ur-roman': urRoman,
  pa,
  ps,
  ar,
  fr,
  ne,
};

let currentLocale = readLocal('digezlife_locale', 'en');

export function getLocale() {
  return currentLocale;
}

export function getLocaleMeta(code = currentLocale) {
  return LOCALES.find((l) => l.code === code) || LOCALES[0];
}

export function setLocale(code) {
  if (!dictionaries[code]) {
    code = 'en';
  }
  currentLocale = code;
  writeLocal('digezlife_locale', code);

  const meta = getLocaleMeta(code);
  const root = document.documentElement;

  // Apply RTL or LTR
  root.setAttribute('dir', meta.dir || 'ltr');
  root.setAttribute('lang', code);

  // Apply font class
  root.classList.remove('font-nastaliq', 'font-arabic', 'font-devanagari', 'font-latin');
  if (meta.fontClass) {
    root.classList.add(meta.fontClass);
  }

  // Dispatch event for UI reactivity
  document.dispatchEvent(new CustomEvent('locale:changed', { detail: { locale: code, meta } }));
}

import { BRAND } from '../config/brand.js';

/**
 * Translate key with fallback and parameter interpolation.
 * Usage: t('home.pending_items', { count: 3 })
 */
export function t(keyPath, params = {}, fallback = '') {
  const dict = dictionaries[currentLocale] || dictionaries.en;
  let val = resolveKey(dict, keyPath);

  if (!val && currentLocale !== 'en') {
    val = resolveKey(dictionaries.en, keyPath);
  }

  if (!val) {
    let result = typeof params === 'string' ? params : (fallback || keyPath);
    if (typeof result === 'string') {
      const mergedParams = {
        appName: BRAND.name,
        appShortName: BRAND.shortName,
        appDomain: BRAND.domain,
        appTagline: BRAND.tagline,
        ...(typeof params === 'object' ? params : {})
      };
      Object.entries(mergedParams).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{\\s*${k}\\s*\\}`, 'g'), v);
      });
    }
    return result;
  }

  // Interpolation
  if (typeof val === 'string') {
    const mergedParams = {
      appName: BRAND.name,
      appShortName: BRAND.shortName,
      appDomain: BRAND.domain,
      appTagline: BRAND.tagline,
      ...(params && typeof params === 'object' ? params : {})
    };
    Object.entries(mergedParams).forEach(([k, v]) => {
      val = val.replace(new RegExp(`\\{\\s*${k}\\s*\\}`, 'g'), v);
    });
  }

  return val;
}

function resolveKey(obj, pathStr) {
  if (!obj) return null;
  const parts = pathStr.split('.');
  let curr = obj;
  for (const p of parts) {
    if (curr && typeof curr === 'object' && p in curr) {
      curr = curr[p];
    } else {
      return null;
    }
  }
  return curr;
}

// Initialize on load
if (typeof document !== 'undefined') {
  setLocale(currentLocale);
}
