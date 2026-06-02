import en from './locales/en.json';

/**
 * The English locale is the source of truth: every other locale must mirror
 * its shape. Adding a new language is a two-step change — drop a `<lang>.json`
 * next to `en.json`, then register it in the `messages` map below.
 */
export type Messages = typeof en;

export const DEFAULT_LOCALE = 'en';

export const messages = {
  en,
} satisfies Record<string, Messages>;

export type Locale = keyof typeof messages;

export const SUPPORTED_LOCALES = Object.keys(messages) as Locale[];

export const STORAGE_KEY = 'portfolio.locale';
