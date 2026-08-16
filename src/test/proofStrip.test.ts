import { describe, expect, it } from 'vitest';
import { messages, SUPPORTED_LOCALES, type Locale } from '@/i18n/config';

/**
 * Spec §5.3: four figures, every one already in the résumé, none of them
 * currently on the page. The numerals are identical in all four locales —
 * only the labels translate — so this suite compares against `en`.
 */
type Figure = { value: string; label: string };

const proofOf = (locale: Locale) =>
  (messages[locale] as unknown as { proof: { eyebrow: string; figures: Figure[] } }).proof;

describe('proof strip', () => {
  it('ships the four sourced figures', () => {
    expect(proofOf('en').figures.map((f) => f.value)).toEqual([
      '~4,600',
      '50+',
      '20% → 85%',
      '4',
    ]);
  });

  it.each(SUPPORTED_LOCALES)('%s keeps the numerals identical to en', (locale) => {
    expect(proofOf(locale).figures.map((f) => f.value)).toEqual(
      proofOf('en').figures.map((f) => f.value),
    );
  });

  it.each(SUPPORTED_LOCALES)('%s translates every label and leaves none blank', (locale) => {
    const figures = proofOf(locale).figures;
    expect(figures).toHaveLength(4);
    for (const figure of figures) {
      expect(figure.label.trim()).not.toBe('');
    }
    expect(proofOf(locale).eyebrow.trim()).not.toBe('');
  });
});
