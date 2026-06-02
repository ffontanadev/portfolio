import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  messages,
  STORAGE_KEY,
  SUPPORTED_LOCALES,
  type Locale,
} from './config';
import { translate } from './translate';
import { I18nContext, type I18nContextValue } from './context';

const isLocale = (value: string | null): value is Locale =>
  value !== null && (SUPPORTED_LOCALES as string[]).includes(value);

const readInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

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
