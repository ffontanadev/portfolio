import { describe, expect, it } from 'vitest';
import { buildLocalePath, negotiateLocale, parseLocalePath } from '@/i18n/routing';

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
