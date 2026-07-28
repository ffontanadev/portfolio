import { describe, it, expect, vi } from 'vitest';
import { TOUR_PALETTE, createComet, drawComet } from './cometRenderer';

describe('createComet', () => {
  it('produces the requested particle count', () => {
    expect(createComet(16)).toHaveLength(16);
  });
  it('draws all colors from the tour palette', () => {
    for (const p of createComet(30)) {
      expect(TOUR_PALETTE).toContain(p.color);
    }
  });
  it('is deterministic (stable across calls)', () => {
    expect(createComet(8)).toEqual(createComet(8));
  });
});

describe('drawComet', () => {
  it('does not draw when opacity is 0', () => {
    const ctx = fakeCtx();
    drawComet(ctx.proxy, { x: 0, y: 0 }, [{ x: 0, y: 0 }], createComet(4), 0);
    expect(ctx.calls.arc).toBe(0);
  });
  it('draws head + trail arcs when visible', () => {
    const ctx = fakeCtx();
    drawComet(ctx.proxy, { x: 10, y: 10 }, [{ x: 1, y: 1 }, { x: 2, y: 2 }], createComet(4), 1);
    expect(ctx.calls.arc).toBeGreaterThan(0);
  });
});

function fakeCtx() {
  const calls = { arc: 0, fill: 0 };
  const proxy = {
    save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(),
    arc: vi.fn(() => { calls.arc++; }),
    fill: vi.fn(() => { calls.fill++; }),
    set globalAlpha(_v: number) {}, get globalAlpha() { return 1; },
    set fillStyle(_v: string) {}, get fillStyle() { return ''; },
    set shadowBlur(_v: number) {}, get shadowBlur() { return 0; },
    set shadowColor(_v: string) {}, get shadowColor() { return ''; },
  } as unknown as CanvasRenderingContext2D;
  return { proxy, calls };
}
