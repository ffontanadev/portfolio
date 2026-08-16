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

describe('Winterbotham card', () => {
  it.each(SUPPORTED_LOCALES)('%s no longer anonymizes the client', (locale) => {
    const haystack = strings(mobileBankingOf(locale)).join(' ');
    expect(haystack).not.toContain('NDA');
    expect(haystack).toContain('Winterbotham');
  });

  it.each(SUPPORTED_LOCALES)('%s no longer volunteers the spec-execution clause', (locale) => {
    const haystack = strings(mobileBankingOf(locale)).join(' ').toLowerCase();
    expect(haystack).not.toMatch(/external design|especificaciones externas|especificações externas|外部的设计/);
  });

  /**
   * The résumé says "a team of 4 over 1.5 years" (src/constants/index.ts); the
   * site shipped "three" until the owner confirmed four on 2026-08-16. Launch
   * QA §14 requires the two to agree — pin the team size so they cannot drift
   * apart again.
   */
  it.each(SUPPORTED_LOCALES)('%s states a team of four', (locale) => {
    const team = (mobileBankingOf(locale) as { metrics: { label: string; value: string }[] })
      .metrics.find((m) => /team|equipo|equipe|团队/i.test(m.label));
    expect(team?.value).toMatch(/4/);
  });
});

describe('Provincia Casa Financiera card', () => {
  const provinciaOf = (locale: Locale) =>
    (messages[locale] as unknown as {
      work: { featured: { projects: { bancoProvincia: Record<string, unknown> } } };
    }).work.featured.projects.bancoProvincia;

  /**
   * Spec §12 item 1: "Banco Provincia" reads to anyone who googles it as the
   * Argentine provincial bank. The owner confirmed on 2026-08-15 that the
   * client is Provincia Casa Financiera, a Uruguayan institution.
   */
  it.each(SUPPORTED_LOCALES)('%s no longer names the Argentine bank', (locale) => {
    const haystack = strings(provinciaOf(locale)).join(' ');
    expect(haystack).not.toContain('Banco Provincia');
    expect(haystack).toContain('Provincia Casa Financiera');
  });
});

describe('BBVA card', () => {
  const bbvaOf = (locale: Locale) =>
    (messages[locale] as unknown as {
      work: { featured: { projects: { bbva: Record<string, unknown> } } };
    }).work.featured.projects.bbva;

  /**
   * Spec §5.4 supplies every one of these from the résumé. `~48` (the APIs
   * that got the coverage work) and `50+` (the service surface) are not in
   * conflict and both ship, each attached to the noun the spec attaches it to.
   */
  it.each(SUPPORTED_LOCALES)('%s carries the sourced coverage figures', (locale) => {
    const haystack = strings(bbvaOf(locale)).join(' ');
    expect(haystack).toContain('20%');
    expect(haystack).toContain('85%');
    expect(haystack).toContain('~48');
    expect(haystack).toContain('10');
  });

  it.each(SUPPORTED_LOCALES)('%s no longer claims Testcontainers', (locale) => {
    expect(strings(bbvaOf(locale)).join(' ')).not.toContain('Testcontainers');
  });
});

/**
 * P0 scoped the ban to the subtrees it rewrote because contact.services[2]
 * still shipped "Digital solutions". §5.8 replaced that block, so the ban now
 * applies to everything.
 *
 * The list is English; es/pt/zh shipped *translations* of the banned phrase
 * ("Soluciones digitales", "Soluções digitais", "数字化解决方案") which this
 * scan cannot catch. They were removed by hand alongside the English one —
 * the suite below pins the replacement copy so they cannot come back.
 */
describe('the whole message tree', () => {
  it.each(SUPPORTED_LOCALES)('%s carries no banned phrase anywhere', (locale) => {
    const haystack = strings(messages[locale]).join(' ').toLowerCase();
    for (const phrase of BANNED) {
      expect(haystack).not.toContain(phrase);
    }
  });
});

describe('availability block', () => {
  const contactOf = (locale: Locale) =>
    (messages[locale] as unknown as {
      contact: { availability: string[]; services: { title: string }[] };
    }).contact;

  it.each(SUPPORTED_LOCALES)('%s ships four literal availability lines', (locale) => {
    expect(contactOf(locale).availability).toHaveLength(4);
    for (const line of contactOf(locale).availability) {
      expect(line.trim()).not.toBe('');
    }
  });

  it.each(SUPPORTED_LOCALES)('%s states the location and the timezone', (locale) => {
    const haystack = contactOf(locale).availability.join(' ');
    expect(haystack).toContain('UTC−3');
    expect(haystack).toContain('Young');
  });

  it.each(SUPPORTED_LOCALES)('%s still offers exactly three engagement types', (locale) => {
    expect(contactOf(locale).services).toHaveLength(3);
  });
});

/**
 * Spec §5.4: "Sitting beside a 4,600-class migration and a PBR renderer, it
 * doesn't add range — it subtracts seniority." Six projects, not seven.
 */
describe('project inventory', () => {
  const projectsOf = (locale: Locale) =>
    (messages[locale] as unknown as {
      work: { featured: { projects: Record<string, unknown> } };
    }).work.featured.projects;

  it.each(SUPPORTED_LOCALES)('%s no longer ships the Twitter Clone', (locale) => {
    expect(projectsOf(locale)).not.toHaveProperty('twitterClone');
  });

  it.each(SUPPORTED_LOCALES)('%s ships exactly six featured projects', (locale) => {
    expect(Object.keys(projectsOf(locale))).toHaveLength(6);
  });
});
