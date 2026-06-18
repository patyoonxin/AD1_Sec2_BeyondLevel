import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import en from './en.json';
import ms from './ms_MY.json';

/**
 * Lightweight i18n implementation for the portal.
 *
 * Design: a SINGLE GLOBAL FLAT dictionary of atomic English keys is shared
 * across every subsystem (Complaints, Chatbot, FAQ, Auth, Users, ...).
 * Every caller looks up the same canonical key - e.g. `t('submit')`,
 * `t('pending')`, `t('location')` - regardless of which module they live in.
 * This avoids duplication and keeps translations consistent across the portal.
 *
 * Dictionaries:
 *   src/lang/en.json     (English  - source of truth)
 *   src/lang/ms_MY.json  (Bahasa Melayu)
 *
 * The lookup function still supports dotted paths for backwards compatibility,
 * but new code should use plain flat keys.
 *
 * Usage:
 *   1. Wrap the app in <LanguageProvider>...</LanguageProvider> (in index.js).
 *   2. In any component:
 *        const { t, lang, setLang } = useTranslation();
 *        return <button>{t('submit')}</button>;
 *   3. Switch language at runtime via setLang('ms') or setLang('en').
 *   4. Interpolate values with `{name}` placeholders:
 *        t('showing_of_complaints', { shown: 5, total: 42 })
 */

const DICTIONARIES = { en, ms };

/* Pull the user's last preference (or browser default) from localStorage. */
const detectInitialLang = () => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
  if (stored && DICTIONARIES[stored]) return stored;
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ms')) {
    return 'ms';
  }
  return 'en';
};

/* Walks an object using a dotted path. Returns the key itself if not found. */
const lookup = (dict, path) => {
  const parts = path.split('.');
  let cursor = dict;
  for (const part of parts) {
    if (cursor && typeof cursor === 'object' && part in cursor) {
      cursor = cursor[part];
    } else {
      return undefined;
    }
  }
  return typeof cursor === 'string' ? cursor : undefined;
};

/* Replace {placeholders} with values from the params object. */
const interpolate = (template, params) => {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? params[key] : `{${key}}`
  );
};

const I18nContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLang);

  const setLang = useCallback((next) => {
    if (!DICTIONARIES[next]) return;
    setLangState(next);
    try { localStorage.setItem('lang', next); } catch (_) { /* ignore */ }
  }, []);

  /**
   * Translation function.
   *
   * Supports three calling patterns:
   *   t('pending')                        → raw key fallback
   *   t('pending', 'Pending')             → string fallback
   *   t('showing_of', { shown, total })  → params object (legacy)
   *   t('showing_of', 'Showing...', {s,t}) → fallback + params
   */
  const t = useCallback((key, defaultOrParams, maybeParams) => {
    const hasDefault = typeof defaultOrParams === 'string';
    const fallback = hasDefault ? defaultOrParams : key;
    const params = hasDefault ? maybeParams : defaultOrParams;

    const dict = DICTIONARIES[lang] || DICTIONARIES.en;
    const value = lookup(dict, key) ?? lookup(DICTIONARIES.en, key) ?? fallback;
    return interpolate(value, params);
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

/**
 * Drop-in language switcher button. Toggles between English and
 * Bahasa Melayu. Style is intentionally minimal so it can be embedded
 * inside the navbar or admin sidebar.
 */
export function LanguageSwitcher({ style = {} }) {
  const { lang, setLang } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'en' ? 'ms' : 'en')}
      style={{
        border: '1px solid #d3d1c7',
        background: '#f8f7f4',
        borderRadius: 7,
        padding: '5px 11px',
        fontSize: 12,
        cursor: 'pointer',
        color: '#1a1a1a',
        ...style,
      }}
      title="Switch language / Tukar bahasa"
    >
      {lang === 'en' ? 'BM' : 'EN'}
    </button>
  );
}
