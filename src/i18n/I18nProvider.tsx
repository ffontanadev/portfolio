import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { messages, STORAGE_KEY, SUPPORTED_LOCALES, type Locale } from './config';
import { translate } from './translate';
import { I18nContext, type I18nContextValue } from './context';

interface I18nProviderProps {
  /** The active locale, owned by the router and read from the URL (§8). */
  locale: Locale;
  /** Called when something asks to switch language; the router navigates. */
  onLocaleChange: (locale: Locale) => void;
  children: ReactNode;
}

/**
 * The locale is a URL segment, not component state — see `src/i18n/routing.ts`.
 * This provider therefore owns no locale state at all: it receives the active
 * locale from the router and forwards change requests back to it.
 *
 * `localStorage` is written but never read here. It is a hint for the bare-`/`
 * redirect only; a stored value must never override the URL.
 */
export const I18nProvider = ({ locale, onLocaleChange, children }: I18nProviderProps) => {
  const setLocale = useCallback(
    (next: Locale) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
      onLocaleChange(next);
    },
    [onLocaleChange],
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const activeMessages = messages[locale];
    return {
      locale,
      setLocale,
      locales: SUPPORTED_LOCALES,
      messages: activeMessages,
      t: (path, vars) => translate(activeMessages as Record<string, unknown>, path, vars),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
