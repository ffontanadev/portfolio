import { describe, expect, it } from 'vitest';
import {
  silhouettePlacement,
  SILHOUETTE_EDGE_MARGIN_RATIO,
} from '@/components/Hero/particles/silhouetteSampler';

const BOUNDS = { width: 1600, height: 900 };
// A square mark at the default showcase size: 900 * 0.36 = 324px tall.
const SQUARE = { naturalWidth: 100, naturalHeight: 100 };
// A wordmark five times wider than tall — Spring and PostgreSQL are this shape.
const WORDMARK = { naturalWidth: 500, naturalHeight: 100 };

const spec = (over: Record<string, unknown> = {}) => ({
  kind: 'silhouette' as const,
  src: 'x.svg',
  sizeRatio: 0.36,
  widthRatio: 0.42,
  ...over,
});

describe('silhouettePlacement', () => {
  it('centres horizontally when no x offset is given', () => {
    const { tx, dw } = silhouettePlacement(
      spec({ xOffsetRatio: undefined }),
      BOUNDS,
      SQUARE.naturalWidth,
      SQUARE.naturalHeight,
    );
    expect(tx + dw / 2).toBeCloseTo(BOUNDS.width / 2);
  });

  it('shifts the mark right by the requested fraction of the canvas width', () => {
    const { tx, dw } = silhouettePlacement(
      spec({ xOffsetRatio: 0.2 }),
      BOUNDS,
      SQUARE.naturalWidth,
      SQUARE.naturalHeight,
    );
    expect(tx + dw / 2).toBeCloseTo(BOUNDS.width * 0.7);
  });

  it('clamps a wide wordmark so it never runs off the right edge', () => {
    const { tx, dw } = silhouettePlacement(
      spec({ xOffsetRatio: 0.2 }),
      BOUNDS,
      WORDMARK.naturalWidth,
      WORDMARK.naturalHeight,
    );
    const margin = BOUNDS.width * SILHOUETTE_EDGE_MARGIN_RATIO;
    expect(tx + dw).toBeLessThanOrEqual(BOUNDS.width - margin + 0.001);
    expect(tx).toBeGreaterThanOrEqual(margin - 0.001);
  });

  it('falls back to centring a mark too wide to fit inside the margins', () => {
    const { tx, dw } = silhouettePlacement(
      spec({ xOffsetRatio: 0.2, widthRatio: 1.4, sizeRatio: 2 }),
      BOUNDS,
      WORDMARK.naturalWidth,
      WORDMARK.naturalHeight,
    );
    expect(tx + dw / 2).toBeCloseTo(BOUNDS.width / 2);
  });

  it('still applies the vertical bias alongside the horizontal one', () => {
    const { ty, dh } = silhouettePlacement(
      spec({ xOffsetRatio: 0.2, yOffsetRatio: -0.1 }),
      BOUNDS,
      SQUARE.naturalWidth,
      SQUARE.naturalHeight,
    );
    expect(ty + dh / 2).toBeCloseTo(BOUNDS.height * 0.4);
  });

  it('caps the mark by width as well as height on narrow canvases', () => {
    const narrow = { width: 400, height: 900 };
    const { dw } = silhouettePlacement(
      spec({ widthRatio: 0.75 }),
      narrow,
      WORDMARK.naturalWidth,
      WORDMARK.naturalHeight,
    );
    expect(dw).toBeLessThanOrEqual(narrow.width * 0.75 + 0.001);
  });
});
