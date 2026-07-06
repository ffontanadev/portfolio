import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'portfolio.devzone.theme.v1';

export type DevZoneTheme = 'light' | 'dark';

function readTheme(): DevZoneTheme {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Owns the DevZone-scoped colour theme and mirrors it to localStorage so the
 * choice survives reloads. Defaults to light (no system-preference read) to stay
 * consistent with the rest of the site.
 */
export function useDevZoneTheme(): { theme: DevZoneTheme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<DevZoneTheme>(readTheme);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage may be unavailable (private mode / quota) — ignore. */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
