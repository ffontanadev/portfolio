// src/components/Hero/particles/IntroSequencer.ts
import * as THREE from 'three';
import type { ShapeSpec, SampleBounds } from './shapeSampler';

type Phase = 'rocket-fly' | 'cross-morph' | 'done';

export interface IntroShapes {
  rocket: ShapeSpec;
  /**
   * The first tech logo, which the rocket morphs straight into. Null when its
   * SVG hasn't loaded in time (the marks come off a CDN) — the intro then ends
   * with the rocket and the showcase loop forms the logo on its own once it
   * arrives, rather than cross-morphing into an empty sample.
   */
  handoff: ShapeSpec | null;
}

export interface IntroAdapter {
  /** Write a shape's sampled positions into the named slot. */
  applyTargetTo(slot: 'aTarget' | 'aTargetNext', shape: ShapeSpec): void;
  /** Write a shape's positions *and* its sampled brand colours into the slot. */
  applyColoredTargetTo(slot: 'aTarget' | 'aTargetNext', shape: ShapeSpec): void;
  /** Fold the secondary slot into the primary one at the given blend factor. */
  promoteNextIntoPrimary(blend: number): void;
  /** Material uniforms the sequencer drives. */
  uniforms: {
    uMorph: { value: number };
    uTargetBlend: { value: number };
    uTargetOffset: { value: THREE.Vector2 };
    uTargetScale: { value: number };
    uMorphSmear: { value: number };
    uBrandColorMix: { value: number };
  };
  /** Current canvas bounds, needed for rocket-fly offset. */
  bounds: SampleBounds;
}

export interface IntroTimings {
  rocketFly: number;
  crossMorph: number;
}

const DEFAULT_TIMINGS: IntroTimings = {
  rocketFly: 4.0,
  crossMorph: 1.0,
};

const SMEAR_AMOUNT = .020;
// Seconds for uMorph to ramp 0→1 inside the rocket-fly phase. Must be < timings.rocketFly.
const ROCKET_FLY_MORPH_RAMP = 0.6;
// Rocket scales from this fraction of full size up to 1.0 over rocket-fly — sells distance.
const ROCKET_START_SCALE = 0.05;
// Y-bob during rocket-fly. Slow frequency reads as a graceful arc, not a wiggle.
const BOB_AMPLITUDE_PX = 24;
const BOB_FREQUENCY = 2.0;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class IntroSequencer {
  private adapter: IntroAdapter;
  private shapes: IntroShapes;
  private timings: IntroTimings;

  private phase: Phase = 'rocket-fly';
  private phaseStart: number;
  // Captured target offset at the start of cross-morph, used to ease toward (0,0).
  private offsetAtCrossMorphStart = new THREE.Vector2(0, 0);
  private formed = false;

  /** Construct AFTER ParticleSystem.resize() has run at least once so adapter.bounds is non-zero. */
  constructor(
    adapter: IntroAdapter,
    shapes: IntroShapes,
    nowMs: number,
    timings: Partial<IntroTimings> = {},
  ) {
    this.adapter = adapter;
    this.shapes = shapes;
    this.timings = { ...DEFAULT_TIMINGS, ...timings };
    this.phaseStart = nowMs;

    // Prime both target slots up-front so resize during any phase can resample
    // without losing context.
    this.adapter.applyTargetTo('aTarget', shapes.rocket);
    if (shapes.handoff) {
      this.adapter.applyColoredTargetTo('aTargetNext', shapes.handoff);
    }

    // Initial uniform state: drift (uMorph=0), no blend, far-left offset, full smear,
    // and the rocket starts shrunk to ROCKET_START_SCALE so it can grow toward the camera.
    this.adapter.uniforms.uMorph.value = 0;
    this.adapter.uniforms.uTargetBlend.value = 0;
    this.adapter.uniforms.uMorphSmear.value = SMEAR_AMOUNT;
    this.adapter.uniforms.uTargetScale.value = ROCKET_START_SCALE;
    this.adapter.uniforms.uBrandColorMix.value = 0;
    this.adapter.uniforms.uTargetOffset.value.set(
      -adapter.bounds.width * 0.6,
      0,
    );
  }

  get done(): boolean {
    return this.phase === 'done';
  }

  /**
   * Whether the intro left the first logo formed in the primary slot. False
   * when the logo never loaded, in which case the showcase loop has to morph
   * it in from drift itself.
   */
  get handedOffFormed(): boolean {
    return this.formed;
  }

  /** Shift internal clock by `deltaMs` (used after pause/resume). */
  shiftClock(deltaMs: number): void {
    this.phaseStart += deltaMs;
  }

  /** Resample both targets at the current bounds without rewinding. */
  applyResize(): void {
    this.adapter.applyTargetTo('aTarget', this.shapes.rocket);
    if (this.shapes.handoff) {
      this.adapter.applyColoredTargetTo('aTargetNext', this.shapes.handoff);
    }
  }

  tick(nowMs: number): void {
    if (this.phase === 'done') return;

    const u = this.adapter.uniforms;
    const elapsed = Math.max(0, (nowMs - this.phaseStart) / 1000);

    if (this.phase === 'rocket-fly') {
      const dur = this.timings.rocketFly;
      const t = Math.min(elapsed / dur, 1);
      const eased = easeOutCubic(t);

      // X offset: -width*0.6 → 0 (eased), with the same easing on scale so motion + growth
      // resolve together at the center.
      const startX = -this.adapter.bounds.width * 0.6;
      u.uTargetOffset.value.x = startX + (0 - startX) * eased;
      // Y bob: slow sine for a graceful arc, not a wiggle.
      u.uTargetOffset.value.y = Math.sin(elapsed * BOB_FREQUENCY) * BOB_AMPLITUDE_PX;
      // Scale: ROCKET_START_SCALE → 1, easing in lockstep with the X offset.
      u.uTargetScale.value = ROCKET_START_SCALE + (1 - ROCKET_START_SCALE) * eased;

      // uMorph ramps from 0 to 1 in the first 600 ms, then holds.
      const morphT = Math.min(elapsed / ROCKET_FLY_MORPH_RAMP, 1);
      u.uMorph.value = easeInOutCubic(morphT);

      u.uMorphSmear.value = SMEAR_AMOUNT;

      if (t >= 1) {
        if (!this.shapes.handoff) {
          // Nothing to morph into; hand the formed rocket back to the system.
          this.phase = 'done';
          return;
        }
        this.offsetAtCrossMorphStart.copy(u.uTargetOffset.value);
        this.phase = 'cross-morph';
        this.phaseStart = nowMs;
      }
      return;
    }

    // cross-morph: rocket → first tech logo, position and brand colour together.
    const dur = this.timings.crossMorph;
    const t = Math.min(elapsed / dur, 1);
    const blendEased = easeInOutCubic(t);
    const offsetEased = easeOutCubic(t);

    u.uTargetBlend.value = blendEased;
    // The logo's own colours fade in on the same curve as its shape, so the
    // rocket's coral never lingers on a formed logo.
    u.uBrandColorMix.value = blendEased;
    u.uTargetOffset.value.x = this.offsetAtCrossMorphStart.x * (1 - offsetEased);
    u.uTargetOffset.value.y = this.offsetAtCrossMorphStart.y * (1 - offsetEased);
    // Smear decays from SMEAR_AMOUNT to 0 linearly.
    u.uMorphSmear.value = SMEAR_AMOUNT * (1 - t);
    u.uMorph.value = 1;
    u.uTargetScale.value = 1;

    if (t >= 1) {
      // Handoff: fold the logo into the primary slot and reset blend so the
      // showcase loop can start its own cross-morphs from a clean state.
      this.adapter.promoteNextIntoPrimary(1);
      u.uTargetBlend.value = 0;
      u.uTargetOffset.value.set(0, 0);
      this.formed = true;
      this.phase = 'done';
    }
  }
}
