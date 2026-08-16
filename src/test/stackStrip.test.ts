import { describe, expect, it } from 'vitest';
import { techCatalog } from '@/components/Hero/techCatalog';
import { messages, SUPPORTED_LOCALES } from '@/i18n/config';

/**
 * Spec §5.2: the strip advertises only technologies a project on this page or
 * the résumé demonstrates, ordered by what the owner wants to be hired for.
 * These tests pin the list itself, not just its length — the order is the
 * argument.
 */
const EXPECTED = [
  ['java', 'Java 17'],
  ['springboot', 'Spring Boot 3'],
  ['junit', 'JUnit 5'],
  ['openapi', 'OpenAPI'],
  ['schemathesis', 'Schemathesis'],
  ['postgresql', 'PostgreSQL'],
  ['mssql', 'MSSQL'],
  ['docker', 'Docker'],
  ['jenkins', 'Jenkins'],
  ['typescript', 'TypeScript'],
  ['react', 'React'],
  ['reactnative', 'React Native'],
  ['cpp', 'C++17'],
] as const;

const REMOVED = [
  'supabase', 'nextjs', 'aws', 'threejs', 'drizzle', 'sqlite', 'mongodb',
  'sequelize', 'express', 'tailwind', 'astro', 'bootstrap', 'vercel',
  'godaddy', 'googlecloud', 'csharp', 'lit', 'redux', 'auth0', 'jwt', 'vite',
];

const briefsOf = (locale: (typeof SUPPORTED_LOCALES)[number]) =>
  (messages[locale] as unknown as {
    techShowcase: { brief: Record<string, string> };
  }).techShowcase.brief;

describe('stack strip', () => {
  it('ships exactly the 13 spec technologies, in order', () => {
    expect(techCatalog.map((t) => [t.id, t.name])).toEqual(
      EXPECTED.map(([id, name]) => [id, name]),
    );
  });

  it('no longer advertises GoDaddy or the other unbacked technologies', () => {
    const ids = techCatalog.map((t) => t.id);
    for (const removed of REMOVED) {
      expect(ids).not.toContain(removed);
    }
  });

  it('gives every logo-bearing entry an svgl url and the rest none', () => {
    const withLogo = techCatalog.filter((t) => t.marqueeUrl).map((t) => t.id);
    expect(withLogo).toEqual([
      'java', 'springboot', 'postgresql', 'mssql', 'docker', 'typescript', 'react',
    ]);
  });

  it.each(SUPPORTED_LOCALES)('%s has a brief for every entry and no orphans', (locale) => {
    const briefs = briefsOf(locale);
    expect(Object.keys(briefs).sort()).toEqual(techCatalog.map((t) => t.id).sort());
    for (const value of Object.values(briefs)) {
      expect(value.trim()).not.toBe('');
    }
  });
});
