import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from './config';

const isLocale = (value: string): value is Locale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(value);

/**
 * Split a pathname into its locale segment and the remainder. Spec §8 makes
 * the locale a URL segment; this is the only place that knowledge is encoded.
 *
 * `rest` always starts with `/` and is `'/'` for a bare locale path, so it can
 * be fed straight back into `buildLocalePath` when the visitor switches
 * language on a deep path.
 */
export const parseLocalePath = (pathname: string): { locale: Locale | null; rest: string } => {
  const [, head = '', ...tail] = pathname.split('/');
  if (!isLocale(head)) return { locale: null, rest: pathname === '' ? '/' : pathname };
  const rest = tail.join('/');
  return { locale: head, rest: rest === '' ? '/' : `/${rest}` };
};

/** Inverse of `parseLocalePath`. `buildLocalePath('es', '/')` is `/es`, not `/es/`. */
export const buildLocalePath = (locale: Locale, rest = '/'): string =>
  rest === '/' || rest === '' ? `/${locale}` : `/${locale}${rest.startsWith('/') ? rest : `/${rest}`}`;

/**
 * Pick the best supported locale from an ordered candidate list — typically
 * `navigator.languages`. Matches on the primary subtag, so `pt-BR` resolves to
 * `pt` and `zh-Hans-CN` to `zh`. Defaults to `/en` per §8: the thesis of the
 * site is the US market.
 */
export const negotiateLocale = (candidates: readonly string[]): Locale => {
  for (const candidate of candidates) {
    const [primary = ''] = candidate.toLowerCase().split('-');
    if (isLocale(primary)) return primary;
  }
  return DEFAULT_LOCALE;
};
