import { describe, expect, it } from 'vitest';
import {
  SHOWCASE_LOGOS,
  showcaseSpecFor,
  showcaseFitsIn,
  SHOWCASE_X_OFFSET,
  SHOWCASE_MIN_WIDTH,
} from '@/components/Hero/particles/showcaseSpec';
import { techCatalog } from '@/components/Hero/techCatalog';

const DESKTOP = { width: 1600, height: 900 };
const MOBILE = { width: 420, height: 900 };

const java = techCatalog.find((t) => t.id === 'java')!;

describe('showcase logo list', () => {
  it('carries only the catalog entries that have an SVG mark, in catalog order', () => {
    expect(SHOWCASE_LOGOS.map((t) => t.id)).toEqual([
      'java', 'springboot', 'postgresql', 'mssql', 'docker', 'typescript', 'react',
    ]);
  });

  it('never yields an entry without a marqueeUrl to sample', () => {
    for (const tech of SHOWCASE_LOGOS) {
      expect(tech.marqueeUrl).toBeTruthy();
    }
  });
});

/**
 * Below the hero's split-column breakpoint there is no empty right column to
 * put a logo in, and a centred one would sit on top of the headline — so the
 * showcase simply doesn't run there.
 */
describe('showcaseFitsIn', () => {
  it('runs the showcase on a desktop-width canvas', () => {
    expect(showcaseFitsIn(DESKTOP)).toBe(true);
  });

  it('suppresses the showcase on a phone-width canvas', () => {
    expect(showcaseFitsIn(MOBILE)).toBe(false);
  });

  it('runs at the breakpoint itself, where the hero is already two columns', () => {
    expect(showcaseFitsIn({ width: SHOWCASE_MIN_WIDTH, height: 900 })).toBe(true);
  });

  it('stops one pixel below the breakpoint', () => {
    expect(showcaseFitsIn({ width: SHOWCASE_MIN_WIDTH - 1, height: 900 })).toBe(false);
  });
});

describe('showcaseSpecFor', () => {
  it('pushes the logo right of centre, clear of the headline', () => {
    const spec = showcaseSpecFor(java);
    expect(spec.kind).toBe('silhouette');
    if (spec.kind !== 'silhouette') return;
    expect(spec.xOffsetRatio).toBe(SHOWCASE_X_OFFSET);
    expect(spec.xOffsetRatio).toBeGreaterThan(0);
  });

  it('caps the width to the right column rather than the whole canvas', () => {
    const spec = showcaseSpecFor(java);
    if (spec.kind !== 'silhouette') return;
    expect(spec.widthRatio).toBeLessThan(0.5);
  });

  it('scales the size by the per-tech logoScale', () => {
    const scaled = showcaseSpecFor({ ...java, logoScale: 0.5 });
    const plain = showcaseSpecFor({ ...java, logoScale: undefined });
    if (scaled.kind !== 'silhouette' || plain.kind !== 'silhouette') return;
    expect(scaled.sizeRatio).toBeCloseTo(plain.sizeRatio! * 0.5);
  });

  it('lifts the logo above the hero brief text', () => {
    const spec = showcaseSpecFor(java);
    if (spec.kind !== 'silhouette') return;
    expect(spec.yOffsetRatio).toBeLessThan(0);
  });
});
