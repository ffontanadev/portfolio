import { describe, expect, it } from 'vitest';
import { buildLocalePath, negotiateLocale, parseLocalePath } from '@/i18n/routing';
import { DEFAULT_LOCALE } from '@/i18n/config';

describe('parseLocalePath', () => {
  it('reads a bare locale path', () => {
    expect(parseLocalePath('/en')).toEqual({ locale: 'en', rest: '/' });
  });

  it('reads a locale path with a trailing slash', () => {
    expect(parseLocalePath('/es/')).toEqual({ locale: 'es', rest: '/' });
  });

  it('keeps the remainder of a deep path', () => {
    expect(parseLocalePath('/pt/dev-zone')).toEqual({ locale: 'pt', rest: '/dev-zone' });
  });

  it('returns a null locale for an unprefixed path', () => {
    expect(parseLocalePath('/dev-zone')).toEqual({ locale: null, rest: '/dev-zone' });
  });

  it('returns a null locale for the root', () => {
    expect(parseLocalePath('/')).toEqual({ locale: null, rest: '/' });
  });

  it('does not treat an unsupported segment as a locale', () => {
    expect(parseLocalePath('/fr/dev-zone')).toEqual({ locale: null, rest: '/fr/dev-zone' });
  });
});

describe('buildLocalePath', () => {
  it('builds a bare locale path', () => {
    expect(buildLocalePath('en')).toBe('/en');
  });

  it('builds a deep path', () => {
    expect(buildLocalePath('zh', '/dev-zone')).toBe('/zh/dev-zone');
  });

  it('collapses a root remainder rather than emitting a trailing slash', () => {
    expect(buildLocalePath('es', '/')).toBe('/es');
  });

  it('round-trips with parseLocalePath', () => {
    const { locale, rest } = parseLocalePath('/pt/dev-zone');
    expect(buildLocalePath(locale!, rest)).toBe('/pt/dev-zone');
  });
});

describe('negotiateLocale', () => {
  it('matches an exact tag', () => {
    expect(negotiateLocale(['es'])).toBe('es');
  });

  it('matches on the primary subtag', () => {
    expect(negotiateLocale(['pt-BR'])).toBe('pt');
  });

  it('prefers the earliest supported candidate', () => {
    expect(negotiateLocale(['fr-FR', 'de', 'zh-Hans-CN', 'en-US'])).toBe('zh');
  });

  it('falls back to English when nothing matches', () => {
    expect(negotiateLocale(['fr', 'de'])).toBe('en');
  });

  it('falls back to English on an empty list', () => {
    expect(negotiateLocale([])).toBe('en');
  });
});

/**
 * `/` and `/dev-zone` must both survive as entry points — the first is what
 * people type, the second is what the old header link pointed at. Both land on
 * a locale-prefixed path, preserving whatever came after the locale slot.
 */
describe('root redirect targets', () => {
  const redirectTarget = (pathname: string, languages: readonly string[], stored?: string) => {
    const { locale, rest } = parseLocalePath(pathname);
    if (locale) return null;
    const preferred = stored ? [stored, ...languages] : languages;
    return buildLocalePath(negotiateLocale(preferred), rest);
  };

  it('sends bare / to the negotiated locale', () => {
    expect(redirectTarget('/', ['es-UY', 'en'])).toBe('/es');
  });

  it('sends bare / to /en when nothing matches', () => {
    expect(redirectTarget('/', ['fr'])).toBe(`/${DEFAULT_LOCALE}`);
  });

  it('preserves a deep path through the redirect', () => {
    expect(redirectTarget('/dev-zone', ['pt-BR'])).toBe('/pt/dev-zone');
  });

  it('lets a stored preference win over the browser list at the root', () => {
    expect(redirectTarget('/', ['en-US'], 'zh')).toBe('/zh');
  });

  it('does not redirect a path that already carries a locale', () => {
    expect(redirectTarget('/en/dev-zone', ['es'])).toBeNull();
  });
});
