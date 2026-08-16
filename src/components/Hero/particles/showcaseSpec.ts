// Shape specs for the hero tech-logo showcase. Kept apart from ParticleField so
// the sizing/placement rules are plain functions the test suite can exercise —
// everything downstream of here needs a WebGL context, which jsdom lacks.

import { techCatalog, type TechItem } from '../techCatalog';
import type { ShapeSpec, SampleBounds } from './shapeSampler';

/**
 * The logos the hero cycles through. Six catalog entries (JUnit, OpenAPI,
 * Schemathesis, Jenkins, React Native, C++17) have no mark in svgl and render
 * as typographic wordmarks in the marquee — there is nothing to sample into
 * particles for those, so the loop skips them.
 */
export const SHOWCASE_LOGOS: TechItem[] = techCatalog.filter((t) => t.marqueeUrl);

/**
 * Base height fraction for a showcase logo. Square icons would otherwise dwarf
 * wide wordmarks (height is the binding constraint in a tall hero), so keep
 * this modest; per-tech `logoScale` trims outliers further.
 */
export const SHOWCASE_BASE_SIZE = 0.36;

/** Shift the logo up so it clears the bottom-left brief text in the hero. */
export const SHOWCASE_Y_OFFSET = -0.1;

/**
 * Horizontal bias, as a fraction of canvas width. The hero is a
 * `1.15fr 1fr` grid whose left column carries the headline, so a centred logo
 * lands on top of the text. +0.20 puts the logo's centre at ~70% of the width,
 * inside the empty right column.
 */
export const SHOWCASE_X_OFFSET = 0.2;

/**
 * Below this width the hero grid collapses to a single column (Tailwind's `lg`
 * breakpoint), so the empty right column the logos live in stops existing.
 */
export const SHOWCASE_MIN_WIDTH = 1024;

/** Width cap: the logo shares the row with the headline, so it can't sprawl. */
const WIDTH_RATIO = 0.42;

/**
 * Whether the canvas is wide enough to show a logo at all. Below the
 * breakpoint there is nowhere to put one — a centred logo would sit on top of
 * the headline — so the showcase is switched off rather than repositioned.
 */
export function showcaseFitsIn(bounds: SampleBounds): boolean {
  return bounds.width >= SHOWCASE_MIN_WIDTH;
}

/**
 * Build the particle shape for one technology's logo. Only meaningful where
 * `showcaseFitsIn` holds. Every dimension is a ratio resolved against the live
 * canvas at sample time, so a spec stays valid across resizes.
 */
export function showcaseSpecFor(tech: TechItem): ShapeSpec {
  return {
    kind: 'silhouette',
    src: tech.marqueeUrl ?? '',
    sizeRatio: SHOWCASE_BASE_SIZE * (tech.logoScale ?? 1),
    widthRatio: WIDTH_RATIO,
    xOffsetRatio: SHOWCASE_X_OFFSET,
    yOffsetRatio: SHOWCASE_Y_OFFSET,
  };
}
