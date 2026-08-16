// src/components/Hero/particles/ShowcaseSequencer.ts
import type { ShapeSpec } from './shapeSampler';

type Phase = 'formIn' | 'hold' | 'crossMorph';

export interface ShowcaseAdapter {
  /** Sample a logo's positions *and* its brand colours into the named slot. */
  applyColoredTargetTo(slot: 'aTarget' | 'aTargetNext', shape: ShapeSpec): void;
  /**
   * Fold the secondary slot into the primary one at the given blend factor
   * (positions and colours alike). 1 is a straight copy; an in-between value
   * happens when a click interrupts a cross-morph, and lerping keeps the field
   * exactly where it already is instead of snapping.
   */
  promoteNextIntoPrimary(blend: number): void;
  uniforms: {
    uTargetBlend: { value: number };
    uBrandColorMix: { value: number };
  };
}

export interface ShowcaseTimings {
  /** Seconds for drift → first logo, when no intro handed one over. */
  formIn: number;
  /** Seconds a logo is held before the next one is requested. */
  hold: number;
  /** Seconds for logo → logo. */
  crossMorph: number;
}

export interface ShowcaseSequencerOptions {
  adapter: ShowcaseAdapter;
  spec: ShapeSpec;
  timings: ShowcaseTimings;
  nowMs: number;
  /**
   * True when the primary slot already holds this logo — the intro's
   * cross-morph lands the rocket directly on it, so re-sampling and re-forming
   * would throw away the transition that just played.
   */
  startFormed?: boolean;
  auto?: boolean;
  onAdvance?: () => void;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Drives the hero's tech-logo loop: hold a logo, ask for the next one, morph
 * across to it without ever dissolving back to drift. Pure aside from the
 * adapter, so the whole cycle is testable without a WebGL context.
 *
 * The same object serves the click path — `setAuto(false)` parks it on one
 * logo, `advanceTo` switches logos on demand.
 */
export class ShowcaseSequencer {
  private adapter: ShowcaseAdapter;
  private timings: ShowcaseTimings;
  private onAdvance?: () => void;

  private phase: Phase;
  private phaseStart: number;
  private auto: boolean;
  /** Guards the hold callback so one expiry produces exactly one request. */
  private advanceRequested = false;

  private currentSpec: ShapeSpec;
  private nextSpec: ShapeSpec | null = null;

  constructor(opts: ShowcaseSequencerOptions) {
    this.adapter = opts.adapter;
    this.timings = opts.timings;
    this.onAdvance = opts.onAdvance;
    this.auto = opts.auto ?? false;
    this.currentSpec = opts.spec;
    this.phaseStart = opts.nowMs;

    this.adapter.uniforms.uTargetBlend.value = 0;

    if (opts.startFormed) {
      this.phase = 'hold';
      this.adapter.uniforms.uBrandColorMix.value = 1;
    } else {
      this.phase = 'formIn';
      this.adapter.applyColoredTargetTo('aTarget', opts.spec);
      this.adapter.uniforms.uBrandColorMix.value = 0;
    }
  }

  get spec(): ShapeSpec {
    return this.currentSpec;
  }

  /** Enable/disable automatic cycling. Pass `nowMs` to restart the hold. */
  setAuto(enabled: boolean, nowMs?: number): void {
    this.auto = enabled;
    if (enabled && nowMs !== undefined) {
      this.phaseStart = nowMs;
      this.advanceRequested = false;
    }
  }

  /** Shift the internal clock by `deltaMs` (used after pause/resume). */
  shiftClock(deltaMs: number): void {
    this.phaseStart += deltaMs;
  }

  /** Cross-morph to another logo. Safe to call mid-morph. */
  advanceTo(spec: ShapeSpec, nowMs: number): void {
    if (this.phase === 'crossMorph') {
      // Fold the in-flight blend down into the primary slot before reusing the
      // secondary one, otherwise resetting uTargetBlend would snap the field
      // back to the logo we were already leaving.
      this.adapter.promoteNextIntoPrimary(this.adapter.uniforms.uTargetBlend.value);
      if (this.nextSpec) this.currentSpec = this.nextSpec;
    }

    this.nextSpec = spec;
    this.adapter.applyColoredTargetTo('aTargetNext', spec);
    this.adapter.uniforms.uTargetBlend.value = 0;
    this.adapter.uniforms.uBrandColorMix.value = 1;
    this.phase = 'crossMorph';
    this.phaseStart = nowMs;
    this.advanceRequested = false;
  }

  /**
   * Re-sample the live logo(s) at the current bounds without rewinding. Specs
   * are pure ratios, so the same spec re-lays itself out at the new size.
   */
  applyResize(): void {
    this.adapter.applyColoredTargetTo('aTarget', this.currentSpec);
    if (this.phase === 'crossMorph' && this.nextSpec) {
      this.adapter.applyColoredTargetTo('aTargetNext', this.nextSpec);
    }
  }

  /** Advance the cycle. Returns the uMorph value for this frame. */
  tick(nowMs: number): number {
    const u = this.adapter.uniforms;
    const elapsed = Math.max(0, (nowMs - this.phaseStart) / 1000);

    if (this.phase === 'formIn') {
      const t = Math.min(elapsed / this.timings.formIn, 1);
      const eased = easeInOutCubic(t);
      u.uBrandColorMix.value = eased;
      if (t >= 1) {
        this.phase = 'hold';
        this.phaseStart = nowMs;
      }
      return eased;
    }

    if (this.phase === 'crossMorph') {
      const t = Math.min(elapsed / this.timings.crossMorph, 1);
      u.uTargetBlend.value = easeInOutCubic(t);
      u.uBrandColorMix.value = 1;
      if (t >= 1) {
        this.adapter.promoteNextIntoPrimary(1);
        u.uTargetBlend.value = 0;
        if (this.nextSpec) this.currentSpec = this.nextSpec;
        this.nextSpec = null;
        this.phase = 'hold';
        this.phaseStart = nowMs;
        this.advanceRequested = false;
      }
      return 1;
    }

    // hold
    u.uBrandColorMix.value = 1;
    u.uTargetBlend.value = 0;
    if (this.auto && !this.advanceRequested && elapsed >= this.timings.hold) {
      this.advanceRequested = true;
      this.onAdvance?.();
    }
    return 1;
  }
}
