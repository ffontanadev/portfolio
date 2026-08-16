import { describe, expect, it } from 'vitest';
import { messages, SUPPORTED_LOCALES, type Locale } from '@/i18n/config';

/**
 * Spec §11 bans a set of phrases outright. tsc enforces the *shape* of the
 * message tree; nothing enforces what goes in it. These tests are scoped to
 * the subtrees P0 rewrites — widen them as later phases land (§5.8 still
 * ships "Digital solutions" in the contact block).
 */
const BANNED = [
  'passionate about',
  'digital solutions',
  'innovative',
  'cutting-edge',
  'rockstar',
  'ninja',
  'wizard',
  '10x',
  '3+ years',
];

/** Every string reachable from `node`, depth-first. */
const strings = (node: unknown): string[] => {
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(strings);
  if (node !== null && typeof node === 'object') return Object.values(node).flatMap(strings);
  return [];
};

const heroOf = (locale: Locale) =>
  (messages[locale] as unknown as { hero: Record<string, unknown> }).hero;

const mobileBankingOf = (locale: Locale) =>
  (messages[locale] as unknown as {
    work: { featured: { projects: { mobileBanking: Record<string, unknown> } } };
  }).work.featured.projects.mobileBanking;

describe('hero copy', () => {
  it.each(SUPPORTED_LOCALES)('%s carries no banned phrase', (locale) => {
    const haystack = strings(heroOf(locale)).join(' ').toLowerCase();
    for (const phrase of BANNED) {
      expect(haystack).not.toContain(phrase);
    }
  });

  it.each(SUPPORTED_LOCALES)('%s states the timezone in the availability line', (locale) => {
    const hero = heroOf(locale) as { availability?: string };
    expect(hero.availability).toBeTruthy();
    expect(hero.availability).toContain('UTC−3');
  });

  it.each(SUPPORTED_LOCALES)('%s no longer ships the retired subheading fragments', (locale) => {
    expect(heroOf(locale)).not.toHaveProperty('subheading');
  });

  it('anchors the English subhead to the sourced figures', () => {
    const hero = heroOf('en') as { subhead?: string };
    expect(hero.subhead).toContain('4,600');
    expect(hero.subhead).toContain('50+');
    expect(hero.subhead).toContain('85%');
  });
});

/**
 * TODO[VERIFY spec §13 P0 item 5]: the client name behind `mobileBanking` is
 * still unverified by the owner, so the de-anonymization copy has not shipped
 * and these guards would fail. Un-skip them in the same commit that renames the
 * client — do not fill in a name here.
 */
describe.skip('Winterbotham card', () => {
  it.each(SUPPORTED_LOCALES)('%s no longer anonymizes the client', (locale) => {
    const haystack = strings(mobileBankingOf(locale)).join(' ');
    expect(haystack).not.toContain('NDA');
    expect(haystack).toContain('Winterbotham');
  });

  it.each(SUPPORTED_LOCALES)('%s no longer volunteers the spec-execution clause', (locale) => {
    const haystack = strings(mobileBankingOf(locale)).join(' ').toLowerCase();
    expect(haystack).not.toMatch(/external design|especificaciones externas|especificações externas|外部的设计/);
  });
});
