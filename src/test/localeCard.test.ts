import { describe, expect, it } from 'vitest';
import { messages, SUPPORTED_LOCALES, type Locale } from '@/i18n/config';

/**
 * `satisfies Record<string, Messages>` in config.ts makes tsc enforce key
 * parity across locales, but it cannot enforce array *length* — a locale can
 * ship 6 roadmap phases where `en` has 7 and still compile. These tests close
 * that gap and pin the EFENGINE card to the current state of the engine.
 */

/** Every array in the message tree, keyed by its dotted path. */
const arrayLengths = (node: unknown, path = '', out: Record<string, number> = {}) => {
  if (Array.isArray(node)) {
    out[path] = node.length;
    node.forEach((item, i) => arrayLengths(item, `${path}[${i}]`, out));
  } else if (node !== null && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      arrayLengths(value, path ? `${path}.${key}` : key, out);
    }
  }
  return out;
};

type EfengineCard = {
  title: string;
  desc: string;
  role: string;
  description: string;
  leadSub: string;
  phases: { label: string; title: string; desc: string }[];
  systems: { label: string; role: string }[];
};

const cardOf = (locale: Locale) =>
  (messages[locale] as unknown as {
    work: { featured: { projects: { efengine: EfengineCard } } };
  }).work.featured.projects.efengine;

const modalOf = (locale: Locale) =>
  (messages[locale] as unknown as {
    work: { modal: Record<string, string | undefined> };
  }).work.modal;

/** Every string reachable from `node`, depth-first. */
const strings = (node: unknown): string[] => {
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(strings);
  if (node !== null && typeof node === 'object') return Object.values(node).flatMap(strings);
  return [];
};

describe('locale array parity', () => {
  const reference = arrayLengths(messages.en);

  it.each(SUPPORTED_LOCALES)('%s has the same array lengths as en', (locale) => {
    expect(arrayLengths(messages[locale])).toEqual(reference);
  });
});

describe('EFENGINE card is current', () => {
  it.each(SUPPORTED_LOCALES)('%s lists the 7 roadmap phases', (locale) => {
    expect(cardOf(locale).phases).toHaveLength(7);
  });

  it.each(SUPPORTED_LOCALES)('%s lists the 6 engine systems', (locale) => {
    expect(cardOf(locale).systems).toHaveLength(6);
  });

  it.each(SUPPORTED_LOCALES)('%s no longer advertises the retired OpenGL 3.3 target', (locale) => {
    expect(JSON.stringify(cardOf(locale))).not.toContain('3.3');
  });

  it.each(SUPPORTED_LOCALES)('%s names OpenGL 4.5 in the card summary', (locale) => {
    expect(cardOf(locale).desc).toContain('4.5');
  });

  it.each(SUPPORTED_LOCALES)('%s has no blank strings in the card', (locale) => {
    for (const value of strings(cardOf(locale))) {
      expect(value.trim()).not.toBe('');
    }
  });

  it.each(SUPPORTED_LOCALES)('%s has a heading for the engine systems block', (locale) => {
    expect(modalOf(locale).engineSystems?.trim()).toBeTruthy();
  });
});
