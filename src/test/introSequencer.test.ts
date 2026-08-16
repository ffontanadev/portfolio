import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  IntroSequencer,
  type IntroAdapter,
  type IntroShapes,
} from '@/components/Hero/particles/IntroSequencer';
import type { ShapeSpec } from '@/components/Hero/particles/shapeSampler';

const BOUNDS = { width: 1600, height: 900 };
const TIMINGS = { rocketFly: 4.0, crossMorph: 1.0 };

const ROCKET: ShapeSpec = { kind: 'rocket', sizeRatio: 0.28 };
const LOGO: ShapeSpec = { kind: 'silhouette', src: 'java.svg' };

function harness() {
  const applied: Array<{ slot: string; kind: string; colored: boolean }> = [];
  const state = { promotions: 0 };
  const adapter: IntroAdapter = {
    applyTargetTo: (slot, shape) => {
      applied.push({ slot, kind: shape.kind, colored: false });
    },
    applyColoredTargetTo: (slot, shape) => {
      applied.push({ slot, kind: shape.kind, colored: true });
    },
    promoteNextIntoPrimary: () => {
      state.promotions += 1;
    },
    uniforms: {
      uMorph: { value: 0 },
      uTargetBlend: { value: 0 },
      uTargetOffset: { value: new THREE.Vector2(0, 0) },
      uTargetScale: { value: 1 },
      uMorphSmear: { value: 0 },
      uBrandColorMix: { value: 0 },
    },
    bounds: BOUNDS,
  };
  return {
    adapter,
    applied,
    get promotions() {
      return state.promotions;
    },
  };
}

const build = (h: ReturnType<typeof harness>, shapes: IntroShapes) =>
  new IntroSequencer(h.adapter, shapes, 0, TIMINGS);

const withLogo: IntroShapes = { rocket: ROCKET, handoff: LOGO };
const withoutLogo: IntroShapes = { rocket: ROCKET, handoff: null };

describe('IntroSequencer — the rocket flight is untouched', () => {
  it('starts the rocket far left, shrunk, and fully drifted', () => {
    const h = harness();
    build(h, withLogo);
    const u = h.adapter.uniforms;
    expect(u.uTargetOffset.value.x).toBeCloseTo(-BOUNDS.width * 0.6);
    expect(u.uTargetScale.value).toBeCloseTo(0.05);
    expect(u.uMorph.value).toBe(0);
    expect(u.uMorphSmear.value).toBeGreaterThan(0);
  });

  it('samples the rocket into the primary slot without brand colours', () => {
    const h = harness();
    build(h, withLogo);
    expect(h.applied[0]).toEqual({ slot: 'aTarget', kind: 'rocket', colored: false });
  });

  it('flies the rocket to centre at full scale over rocketFly seconds', () => {
    const h = harness();
    const seq = build(h, withLogo);
    seq.tick(4000);
    const u = h.adapter.uniforms;
    expect(u.uTargetOffset.value.x).toBeCloseTo(0);
    expect(u.uTargetScale.value).toBeCloseTo(1);
    expect(u.uMorph.value).toBeCloseTo(1);
  });

  it('is still flying — not done — before rocketFly elapses', () => {
    const h = harness();
    const seq = build(h, withLogo);
    seq.tick(3900);
    expect(seq.done).toBe(false);
  });
});

describe('IntroSequencer — handing the rocket to the first logo', () => {
  it('preloads the logo with its brand colours into the secondary slot', () => {
    const h = harness();
    build(h, withLogo);
    expect(h.applied).toContainEqual({
      slot: 'aTargetNext',
      kind: 'silhouette',
      colored: true,
    });
  });

  it('cross-fades the blend and the brand colour together', () => {
    const h = harness();
    const seq = build(h, withLogo);
    seq.tick(4000); // rocket landed, cross-morph begins
    seq.tick(4500); // halfway
    const u = h.adapter.uniforms;
    expect(u.uTargetBlend.value).toBeGreaterThan(0);
    expect(u.uTargetBlend.value).toBeLessThan(1);
    expect(u.uBrandColorMix.value).toBeCloseTo(u.uTargetBlend.value);
  });

  it('finishes as soon as the logo has formed — there is no text to hold', () => {
    const h = harness();
    const seq = build(h, withLogo);
    seq.tick(4000);
    seq.tick(5000);
    expect(seq.done).toBe(true);
  });

  it('leaves the logo fully formed, centred and brand-coloured', () => {
    const h = harness();
    const seq = build(h, withLogo);
    seq.tick(4000);
    seq.tick(5000);
    const u = h.adapter.uniforms;
    expect(u.uMorph.value).toBe(1);
    expect(u.uBrandColorMix.value).toBe(1);
    expect(u.uTargetScale.value).toBe(1);
    expect(u.uMorphSmear.value).toBe(0);
    expect(u.uTargetOffset.value.x).toBeCloseTo(0);
  });

  it('promotes the logo into the primary slot and resets the blend on handoff', () => {
    const h = harness();
    const seq = build(h, withLogo);
    seq.tick(4000);
    seq.tick(5000);
    expect(h.promotions).toBe(1);
    expect(h.adapter.uniforms.uTargetBlend.value).toBe(0);
  });

  it('reports whether the loop can pick up an already-formed logo', () => {
    const h = harness();
    const seq = build(h, withLogo);
    seq.tick(4000);
    seq.tick(5000);
    expect(seq.handedOffFormed).toBe(true);
  });
});

describe('IntroSequencer — when the logo has not loaded', () => {
  it('ends after the rocket flight rather than morphing into nothing', () => {
    const h = harness();
    const seq = build(h, withoutLogo);
    seq.tick(4000);
    expect(seq.done).toBe(true);
  });

  it('tells the caller the loop still has to form the logo itself', () => {
    const h = harness();
    const seq = build(h, withoutLogo);
    seq.tick(4000);
    expect(seq.handedOffFormed).toBe(false);
  });

  it('never samples a secondary target it cannot fill', () => {
    const h = harness();
    build(h, withoutLogo);
    expect(h.applied.every((a) => a.slot === 'aTarget')).toBe(true);
  });
});

describe('IntroSequencer — resize', () => {
  it('re-samples the rocket and the pending logo without rewinding', () => {
    const h = harness();
    const seq = build(h, withLogo);
    seq.tick(2000);
    h.applied.length = 0;
    seq.applyResize();
    expect(h.applied).toEqual([
      { slot: 'aTarget', kind: 'rocket', colored: false },
      { slot: 'aTargetNext', kind: 'silhouette', colored: true },
    ]);
    expect(seq.done).toBe(false);
  });
});
