import { formatDistanceToNow } from 'date-fns';
import { enUS, es, ptBR, zhCN } from 'date-fns/locale';
import type { Locale } from '@/i18n/config';

/** i18n locale code → date-fns locale object. */
const LOCALE_MAP: Record<Locale, typeof enUS> = {
  en: enUS,
  es,
  pt: ptBR,
  zh: zhCN,
};

/**
 * Formats an ISO date as locale-aware relative time, e.g. "2 days ago"
 * / "hace 2 días". Falls back to English if the locale is unknown.
 */
export const formatRelativeTime = (iso: string, locale: Locale): string =>
  formatDistanceToNow(new Date(iso), {
    addSuffix: true,
    locale: LOCALE_MAP[locale] ?? enUS,
  });
