import { createContext } from 'react';
import type { Locale, Messages } from './config';
import type { TranslateVars } from './translate';

export interface I18nContextValue {
  /** The active locale code (e.g. `"en"`). */
  locale: Locale;
  /** Switch the active locale. Persisted to localStorage. */
  setLocale: (locale: Locale) => void;
  /** All locale codes that currently ship a translation file. */
  locales: Locale[];
  /** Translate a dot-path key, interpolating `{name}` placeholders. */
  t: (path: string, vars?: TranslateVars) => string;
  /** The full, typed message tree for the active locale — use for structured data (arrays/objects). */
  messages: Messages;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);
