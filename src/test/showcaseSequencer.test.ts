import { describe, expect, it, vi } from 'vitest';
import {
  ShowcaseSequencer,
  type ShowcaseAdapter,
} from '@/components/Hero/particles/ShowcaseSequencer';
import type { ShapeSpec } from '@/components/Hero/particles/shapeSampler';

const TIMINGS = { formIn: 0.9, hold: 3.5, crossMorph: 0.9 };

const specFor = (src: string): ShapeSpec => ({ kind: 'silhouette', src });

interface Harness {
  adapter: ShowcaseAdapter;
  applied: Array<{ slot: string; src: string }>;
  promotions: number;
}

function harness(): Harness {
  const applied: Array<{ slot: string; src: string }> = [];
  const state = { promotions: 0 };
  const adapter: ShowcaseAdapter = {
    applyColoredTargetTo: (slot, shape) => {
      applied.push({ slot, src: shape.kind === 'silhouette' ? shape.src : shape.kind });
    },
    promoteNextIntoPrimary: () => {
      state.promotions += 1;
    },
    uniforms: {
      uTargetBlend: { value: 0 },
      uBrandColorMix: { value: 0 },
    },
  };
  return {
    adapter,
    applied,
    get promotions() {
      return state.promotions;
    },
  };
}

/** A sequencer already holding java.svg, as the intro leaves it. */
function formed(onAdvance?: () => void) {
  const h = harness();
  const seq = new ShowcaseSequencer({
    adapter: h.adapter,
    spec: specFor('java.svg'),
    timings: TIMINGS,
    nowMs: 0,
    startFormed: true,
    auto: onAdvance !== undefined,
    onAdvance,
  });
  return { h, seq };
}

describe('ShowcaseSequencer — entering from drift', () => {
  it('samples the first logo into the primary slot', () => {
    const h = harness();
    new ShowcaseSequencer({
      adapter: h.adapter,
      spec: specFor('java.svg'),
      timings: TIMINGS,
      nowMs: 0,
    });
    expect(h.applied).toEqual([{ slot: 'aTarget', src: 'java.svg' }]);
  });

  it('ramps the morph and the brand-colour mix together over formIn', () => {
    const h = harness();
    const seq = new ShowcaseSequencer({
      adapter: h.adapter,
      spec: specFor('java.svg'),
      timings: TIMINGS,
      nowMs: 0,
    });

    expect(seq.tick(0)).toBe(0);
    expect(h.adapter.uniforms.uBrandColorMix.value).toBe(0);

    const mid = seq.tick(450);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
    expect(h.adapter.uniforms.uBrandColorMix.value).toBeCloseTo(mid);

    expect(seq.tick(900)).toBe(1);
    expect(h.adapter.uniforms.uBrandColorMix.value).toBe(1);
  });

  it('starts already formed when the intro handed the logo over', () => {
    const h = harness();
    const seq = new ShowcaseSequencer({
      adapter: h.adapter,
      spec: specFor('java.svg'),
      timings: TIMINGS,
      nowMs: 0,
      startFormed: true,
    });
    expect(seq.tick(0)).toBe(1);
    expect(h.adapter.uniforms.uBrandColorMix.value).toBe(1);
  });

  it('does not re-sample a logo the intro already put in the primary slot', () => {
    const h = harness();
    new ShowcaseSequencer({
      adapter: h.adapter,
      spec: specFor('java.svg'),
      timings: TIMINGS,
      nowMs: 0,
      startFormed: true,
    });
    expect(h.applied).toEqual([]);
  });
});

describe('ShowcaseSequencer — automatic cycling', () => {
  it('asks for the next logo once the hold elapses', () => {
    const onAdvance = vi.fn();
    const { seq } = formed(onAdvance);

    seq.tick(3400);
    expect(onAdvance).not.toHaveBeenCalled();

    seq.tick(3500);
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });

  it('asks only once per hold, even if the caller does not advance', () => {
    const onAdvance = vi.fn();
    const { seq } = formed(onAdvance);
    seq.tick(3500);
    seq.tick(3600);
    seq.tick(5000);
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });

  it('stays on the current logo forever while auto is off', () => {
    const onAdvance = vi.fn();
    const { seq } = formed(onAdvance);
    seq.setAuto(false);
    seq.tick(60_000);
    expect(onAdvance).not.toHaveBeenCalled();
  });

  it('resumes cycling when auto is turned back on', () => {
    const onAdvance = vi.fn();
    const { seq } = formed(onAdvance);
    seq.setAuto(false);
    seq.tick(60_000);
    seq.setAuto(true, 60_000);
    seq.tick(63_400);
    expect(onAdvance).not.toHaveBeenCalled();
    seq.tick(63_500);
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });
});

describe('ShowcaseSequencer — logo to logo', () => {
  it('loads the incoming logo into the secondary slot', () => {
    const { h, seq } = formed();
    seq.advanceTo(specFor('docker.svg'), 3500);
    expect(h.applied).toEqual([{ slot: 'aTargetNext', src: 'docker.svg' }]);
  });

  it('cross-fades with uTargetBlend instead of dissolving back to drift', () => {
    const { h, seq } = formed();
    seq.advanceTo(specFor('docker.svg'), 3500);

    expect(h.adapter.uniforms.uTargetBlend.value).toBe(0);
    // The whole point of the cross-morph: particles never leave the shape.
    expect(seq.tick(3500)).toBe(1);
    expect(seq.tick(3950)).toBe(1);
    expect(h.adapter.uniforms.uTargetBlend.value).toBeGreaterThan(0);
    expect(h.adapter.uniforms.uTargetBlend.value).toBeLessThan(1);
  });

  it('promotes the incoming logo and resets the blend when the morph completes', () => {
    const { h, seq } = formed();
    seq.advanceTo(specFor('docker.svg'), 3500);
    seq.tick(4400);
    expect(h.promotions).toBe(1);
    expect(h.adapter.uniforms.uTargetBlend.value).toBe(0);
  });

  it('holds the new logo for a full beat before asking for the next one', () => {
    const onAdvance = vi.fn();
    const h = harness();
    const seq = new ShowcaseSequencer({
      adapter: h.adapter,
      spec: specFor('java.svg'),
      timings: TIMINGS,
      nowMs: 0,
      startFormed: true,
      auto: true,
      onAdvance,
    });
    seq.tick(3500);
    expect(onAdvance).toHaveBeenCalledTimes(1);

    seq.advanceTo(specFor('docker.svg'), 3500);
    seq.tick(4400); // cross-morph done, hold restarts here
    seq.tick(7800);
    expect(onAdvance).toHaveBeenCalledTimes(1);
    seq.tick(7900);
    expect(onAdvance).toHaveBeenCalledTimes(2);
  });

  it('interrupts an in-flight cross-morph when a click picks another logo', () => {
    const { h, seq } = formed();
    seq.advanceTo(specFor('docker.svg'), 3500);
    seq.tick(3950); // halfway through
    seq.advanceTo(specFor('react.svg'), 3950);

    // The half-blended state has to be folded into the primary slot first,
    // otherwise resetting the blend would snap back to the outgoing logo.
    expect(h.promotions).toBe(1);
    expect(h.adapter.uniforms.uTargetBlend.value).toBe(0);
    expect(h.applied.map((a) => a.src)).toEqual(['docker.svg', 'react.svg']);
  });
});

describe('ShowcaseSequencer — clock and resize', () => {
  it('does not burn the hold while the field is paused off-screen', () => {
    const onAdvance = vi.fn();
    const h = harness();
    const seq = new ShowcaseSequencer({
      adapter: h.adapter,
      spec: specFor('java.svg'),
      timings: TIMINGS,
      nowMs: 0,
      startFormed: true,
      auto: true,
      onAdvance,
    });
    seq.tick(1000);
    seq.shiftClock(30_000); // 30s hidden tab
    seq.tick(31_000);
    expect(onAdvance).not.toHaveBeenCalled();
    seq.tick(33_500);
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });

  it('re-samples the held logo at the new bounds on resize', () => {
    const { h, seq } = formed();
    h.applied.length = 0;
    seq.applyResize();
    expect(h.applied).toEqual([{ slot: 'aTarget', src: 'java.svg' }]);
  });

  it('re-samples both logos when a resize lands mid cross-morph', () => {
    const { h, seq } = formed();
    seq.advanceTo(specFor('docker.svg'), 3500);
    h.applied.length = 0;
    seq.applyResize();
    expect(h.applied).toEqual([
      { slot: 'aTarget', src: 'java.svg' },
      { slot: 'aTargetNext', src: 'docker.svg' },
    ]);
  });
});
