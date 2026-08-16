import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * There is no framework metadata layer in this Vite SPA — `index.html` is the
 * only `<head>` that ships. These tests pin what a crawler and LinkedIn's post
 * inspector actually receive.
 */
const doc = new DOMParser().parseFromString(
  readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8'),
  'text/html',
);

const meta = (selector: string) =>
  doc.querySelector(`meta[${selector}]`)?.getAttribute('content') ?? '';

describe('index.html metadata', () => {
  it('has removed the keywords tag entirely', () => {
    expect(doc.querySelector('meta[name="keywords"]')).toBeNull();
  });

  it('ships the positioning title', () => {
    expect(doc.querySelector('title')?.textContent).toBe(
      'Felipe Fontana — Software Engineer | Java, Spring Boot, Legacy Modernization',
    );
  });

  it('describes legacy modernization, not landing pages', () => {
    const description = meta('name="description"');
    expect(description).toContain('Spring Boot');
    expect(description).toContain('UTC−3');
    expect(description).not.toMatch(/landing page|chatbot|UI\/UX/i);
  });

  it('declares a profile card pointing at the live origin', () => {
    expect(meta('property="og:type"')).toBe('profile');
    expect(meta('property="og:url"')).toBe('https://ffontana.dev/');
    expect(meta('property="og:title"')).toBe(
      'Felipe Fontana — Software Engineer, Java & Spring Boot',
    );
    expect(meta('property="og:locale"')).toBe('en_US');
  });

  it('declares a canonical that resolves today', () => {
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://ffontana.dev/',
    );
  });

  it('carries no banned phrase in the head', () => {
    const head = doc.head.innerHTML.toLowerCase();
    for (const phrase of ['passionate about', 'digital solutions', 'innovative', 'cutting-edge']) {
      expect(head).not.toContain(phrase);
    }
  });
});
