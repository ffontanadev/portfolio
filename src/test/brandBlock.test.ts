import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TypographicHero } from '@/components/ProjectPreviewModal';
import { blockPolarity, blockTokens, contrastRatio, type Project } from '@/components/projectTypes';

/**
 * The brand block puts type directly on the brand hex, so the palette stops
 * being a taste question: a hex that clears AA in neither polarity cannot ship.
 * `blockPolarity` resolves that at runtime, and these tests pin the rule so a
 * new `brandColor` cannot quietly land under the floor.
 */

const CREAM = '#FFF8F3';
const INK = '#1A1A1A';

/** WCAG AA for body text. The 9px tech-stack line is what binds here. */
const AA = 4.5;

/** Every `brandColor` literal in the featured-projects table, in file order. */
const brandColorsInSource = (): string[] => {
    // vitest runs from the project root, so resolve off cwd rather than
    // import.meta.url - vite rewrites that and it is not a file: URL here.
    const source = readFileSync(resolve('src/components/FeaturedWorks.tsx'), 'utf8');
    return [...source.matchAll(/brandColor:\s*'(#[0-9a-fA-F]{6})'/g)].map((m) => m[1]);
};

describe('contrastRatio', () => {
    it('bottoms out at 1 for a colour against itself', () => {
        expect(contrastRatio(CREAM, CREAM)).toBeCloseTo(1, 5);
    });

    it('tops out at 21 for black on white', () => {
        expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    });

    it('is symmetric', () => {
        expect(contrastRatio(CREAM, '#001391')).toBeCloseTo(contrastRatio('#001391', CREAM), 10);
    });

    it('matches the ratios the design is documented against', () => {
        expect(contrastRatio(CREAM, '#001391')).toBeCloseTo(13.3, 1);
        expect(contrastRatio(CREAM, '#1d418f')).toBeCloseTo(9.06, 1);
        expect(contrastRatio(CREAM, '#00703C')).toBeCloseTo(5.9, 1);
        expect(contrastRatio(INK, '#f5a623')).toBeCloseTo(8.59, 1);
        expect(contrastRatio(INK, '#F82790')).toBeCloseTo(4.71, 1);
    });
});

describe('blockPolarity', () => {
    it.each([
        ['#001391', 'cream'],
        ['#1d418f', 'cream'],
        ['#00703C', 'cream'],
        ['#f5a623', 'ink'],
        ['#F82790', 'ink'],
    ])('%s takes %s type', (hex, expected) => {
        expect(blockPolarity(hex)).toBe(expected);
    });

    it('picks whichever colour actually wins, for any hex', () => {
        for (const hex of ['#000000', '#FFFFFF', '#808080', '#7f00ff', '#ffe100']) {
            const chosen = blockPolarity(hex) === 'cream' ? CREAM : INK;
            const rejected = chosen === CREAM ? INK : CREAM;
            expect(contrastRatio(chosen, hex)).toBeGreaterThanOrEqual(contrastRatio(rejected, hex));
        }
    });
});

describe('every shipped brand survives the block', () => {
    const brands = brandColorsInSource();

    it('finds the featured-projects brand hexes', () => {
        // Guards the regex above: if the table is restructured this trips before
        // the AA check below silently passes on an empty list.
        expect(brands.length).toBeGreaterThanOrEqual(6);
    });

    it.each(brandColorsInSource())('%s clears AA in its chosen polarity', (hex) => {
        const chosen = blockPolarity(hex) === 'cream' ? CREAM : INK;
        expect(contrastRatio(chosen, hex)).toBeGreaterThanOrEqual(AA);
    });
});

describe('blockTokens', () => {
    it('hands down the field and the full-strength type colour', () => {
        const tokens = blockTokens('#001391') as Record<string, string>;
        expect(tokens['--block-brand']).toBe('#001391');
        expect(tokens['--block-type']).toBe(CREAM);
    });

    it('flips the whole set on a light brand', () => {
        const tokens = blockTokens('#F82790') as Record<string, string>;
        expect(tokens['--block-type']).toBe(INK);
        expect(tokens['--block-lift']).toContain('26, 26, 26');
    });

    it('falls back to the cream field when a project has no brand', () => {
        const tokens = blockTokens() as Record<string, string>;
        expect(tokens['--block-brand']).toBe('#FFE8D6');
        expect(tokens['--block-type']).toBe(INK);
    });

    /**
     * The rule the whole direction rests on: type is never softened. At 74% the
     * 9px line measures 3.98 on #00703C and 3.53 on #F82790, both under AA, so
     * only the two aria-hidden tokens are allowed to carry an alpha.
     */
    it('keeps --block-type opaque', () => {
        for (const hex of ['#001391', '#00703C', '#f5a623', '#F82790']) {
            const tokens = blockTokens(hex) as Record<string, string>;
            expect(tokens['--block-type']).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
    });
});

/**
 * Acceptance, against rendered output rather than the source: the banner is a
 * solid field, the token set reaches the DOM, and the two faded pieces are the
 * only ones there - and both are out of the accessibility tree.
 */
describe('TypographicHero renders the block', () => {
    const base: Project = {
        title: 'BBVA - API Migration & Test Coverage',
        desc: 'desc',
        color: 'bg-cream-100',
        techStack: ['Java 17', 'Spring Boot', 'JUnit 5', 'Mockito'],
        date: "'25",
        role: 'role',
        description: 'description',
        codeBlocks: [],
        category: 'professional',
        company: 'BBVA',
        brandColor: '#001391',
        leadMetric: { kind: 'scale', superscript: 'API²', value: '50+' },
    };

    const render = (project: Project, index?: string) =>
        renderToStaticMarkup(createElement(TypographicHero, { project, size: 'card', index }));

    it('paints the brand hex as the field and knocks cream type out of it', () => {
        const html = render(base);
        expect(html).toContain('--block-brand:#001391');
        expect(html).toContain('--block-type:#FFF8F3');
        expect(html).toContain('background-color:var(--block-brand)');
    });

    it('flips to ink type on a light brand', () => {
        const html = render({ ...base, brandColor: '#F82790' });
        expect(html).toContain('--block-type:#1A1A1A');
    });

    it('shows the index digit only when the grid passes one, and hides it from AT', () => {
        expect(render(base)).not.toContain('--block-type-faint)">03');
        const withIndex = render(base, '03');
        expect(withIndex).toContain('>03<');
        // the digit and the section mark are the only faded pieces, and the two
        // aria-hidden spans in the banner are exactly those two
        expect(withIndex.match(/aria-hidden="true"/g)?.length).toBeGreaterThanOrEqual(3);
    });

    it('keeps brand tokens out of the type colour, so nothing softens', () => {
        const html = render(base, '03');
        expect(html).not.toContain('rgba(255, 248, 243, 0.74)');
        expect(html).not.toContain('text-dark-900/5');
    });

    it('marks the tech-stack line untranslatable', () => {
        expect(render(base)).toContain('translate="no"');
    });

    it('falls back to the cream field when a project carries no brand', () => {
        const noBrand: Project = { ...base };
        delete noBrand.brandColor;
        const html = render(noBrand);
        expect(html).toContain('--block-brand:#FFE8D6');
        expect(html).toContain('--block-type:#1A1A1A');
    });
});
