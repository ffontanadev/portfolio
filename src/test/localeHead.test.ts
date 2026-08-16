import { describe, expect, it } from 'vitest';
import { messages, SUPPORTED_LOCALES, type Locale } from '@/i18n/config';

/**
 * Spec §7.1 ships the English head verbatim. The other three locales get the
 * same *claims* in their own language — the numerals stay identical, because
 * §11 forbids a figure that does not trace to the résumé, in any language.
 */
const seoOf = (locale: Locale) =>
  (messages[locale] as unknown as { seo: { title: string; description: string } }).seo;

describe('per-locale metadata', () => {
  it('ships the spec title verbatim for en', () => {
    expect(seoOf('en').title).toBe(
      'Felipe Fontana — Software Engineer | Java, Spring Boot, Legacy Modernization',
    );
  });

  it('ships the spec description verbatim for en', () => {
    expect(seoOf('en').description).toBe(
      'Software Engineer with 4 years modernizing core banking systems — Axis2/Java 8 to Spring Boot 3 across ~4,600 classes, 50+ APIs migrated, test coverage from 20% to 85%. Based in Uruguay, UTC−3, full US Eastern overlap.',
    );
  });

  it.each(SUPPORTED_LOCALES)('%s names the owner and the specialty in the title', (locale) => {
    expect(seoOf(locale).title).toContain('Felipe Fontana');
    expect(seoOf(locale).title).toContain('Spring Boot');
  });

  it.each(SUPPORTED_LOCALES)('%s keeps the sourced figures in the description', (locale) => {
    const description = seoOf(locale).description;
    expect(description).toContain('4,600');
    expect(description).toContain('50+');
    expect(description).toContain('20%');
    expect(description).toContain('85%');
    expect(description).toContain('UTC−3');
  });

  /**
   * 80, not 75: §7.1 fixes the English title verbatim at 76 characters, so a
   * 75-char cap would forbid the very string the spec mandates. The bound is
   * here to catch unbounded drift, not to second-guess the spec — Google
   * truncates around 600px regardless.
   */
  it.each(SUPPORTED_LOCALES)('%s stays inside the length search engines render', (locale) => {
    expect(seoOf(locale).title.length).toBeLessThanOrEqual(80);
    expect(seoOf(locale).description.length).toBeLessThanOrEqual(320);
  });
});
