import { useEffect, useState } from 'react';

// Matches Tailwind's default `sm` breakpoint: below 640px is treated as mobile.
const QUERY = '(max-width: 639px)';

function getInitialValue(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

/**
 * Tracks whether the viewport is in the mobile (sub-`sm`) range. SSR-safe:
 * returns `false` until mounted, then reflects the media query and subscribes to
 * changes so the UI reacts to rotation / resize.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(getInitialValue);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia(QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
