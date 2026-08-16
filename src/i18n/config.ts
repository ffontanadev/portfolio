import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import zh from './locales/zh.json';

/**
 * The English locale is the source of truth: every other locale must mirror
 * its shape. Adding a new language is a two-step change — drop a `<lang>.json`
 * next to `en.json`, then register it in the `messages` map below. The
 * `satisfies` check fails the build if a locale drifts from the `en` shape.
 */
export type Messages = typeof en;

export const DEFAULT_LOCALE = 'en';

export const messages = {
  en,
  es,
  pt,
  zh,
} satisfies Record<string, Messages>;

export type Locale = keyof typeof messages;

export const SUPPORTED_LOCALES = Object.keys(messages) as Locale[];

/** Endonym shown in the language switcher — intentionally not translated per-locale. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  zh: '中文',
};

/**
 * Remembers the visitor's last explicit choice. Read **only** by the bare-`/`
 * redirect; the URL is the source of truth everywhere else.
 */
export const STORAGE_KEY = 'portfolio.locale';

