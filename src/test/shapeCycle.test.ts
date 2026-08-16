import { describe, expect, it } from 'vitest';
import { nextShapeIndex } from '@/components/Hero/particles/ParticleSystem';

/**
 * The ambient shape loop is the offline fallback, and on narrow canvases it is
 * switched off entirely — there is nowhere to put a shape. An empty cycle has
 * to read as "stay in drift", not wrap around to a nonexistent index.
 */
describe('nextShapeIndex', () => {
  it('advances through the cycle', () => {
    expect(nextShapeIndex(0, 3)).toBe(1);
    expect(nextShapeIndex(1, 3)).toBe(2);
  });

  it('wraps at the end', () => {
    expect(nextShapeIndex(2, 3)).toBe(0);
  });

  it('reports no next shape when the cycle is empty', () => {
    expect(nextShapeIndex(0, 0)).toBeNull();
  });

  it('reports no next shape rather than producing NaN from a modulo by zero', () => {
    expect(nextShapeIndex(-1, 0)).toBeNull();
    expect(Number.isNaN(nextShapeIndex(5, 0) as number)).toBe(false);
  });

  it('stays put on a single-shape cycle', () => {
    expect(nextShapeIndex(0, 1)).toBe(0);
  });
});
