import { describe, it, expect } from 'vitest';
import {
  easeInOutCubic, lerp, quadBezier, orbitPoint, rectCenter, TrailBuffer,
} from './tourMotion';

describe('easeInOutCubic', () => {
  it('pins endpoints and midpoint', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
  });
});

describe('lerp', () => {
  it('interpolates linearly', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(4, 8, 0)).toBe(4);
  });
});

describe('quadBezier', () => {
  it('returns endpoints at t=0 and t=1', () => {
    const p0 = { x: 0, y: 0 }, c = { x: 5, y: 10 }, p1 = { x: 10, y: 0 };
    expect(quadBezier(p0, c, p1, 0)).toEqual(p0);
    expect(quadBezier(p0, c, p1, 1)).toEqual(p1);
  });
  it('bows toward the control point at t=0.5', () => {
    const mid = quadBezier({ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 0 }, 0.5);
    expect(mid.y).toBeGreaterThan(0);
  });
});

describe('orbitPoint', () => {
  it('places the point at radius from center', () => {
    const p = orbitPoint({ x: 100, y: 100 }, 20, 0);
    expect(p.x).toBeCloseTo(120, 5);
    expect(p.y).toBeCloseTo(100, 5);
  });
});

describe('rectCenter', () => {
  it('returns the geometric center', () => {
    expect(rectCenter({ left: 10, top: 20, width: 100, height: 40 }))
      .toEqual({ x: 60, y: 40 });
  });
});

describe('TrailBuffer', () => {
  it('keeps only the last N points, oldest-first', () => {
    const buf = new TrailBuffer(3);
    buf.push({ x: 1, y: 1 });
    buf.push({ x: 2, y: 2 });
    buf.push({ x: 3, y: 3 });
    buf.push({ x: 4, y: 4 });
    expect(buf.toArray()).toEqual([
      { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 },
    ]);
  });
  it('clears', () => {
    const buf = new TrailBuffer(3);
    buf.push({ x: 1, y: 1 });
    buf.clear();
    expect(buf.toArray()).toEqual([]);
  });
});
