// src/components/Hero/particles/IntroSequencer.ts
import * as THREE from 'three';
import type { ShapeSpec, SampleBounds } from './shapeSampler';

type Phase = 'rocket-fly' | 'cross-morph' | 'text-hold' | 'done';

export interface IntroShapes {
  rocket: ShapeSpec;
  text: ShapeSpec;
}

export interface IntroAdapter {
  /** Write a shape's sampled positions into the named slot. */
  applyTargetTo(slot: 'aTarget' | 'aTargetNext', shape: ShapeSpec): void;
  /** Copy aTargetNext over aTarget (used during handoff). */
  copyNextIntoPrimary(): void;
  /** Material uniforms the sequencer drives. */
  uniforms: {
    uMorph: { value: number };
    uTargetBlend: { value: number };
    uTargetOffset: { value: THREE.Vector2 };
    uTargetScale: { value: number };
    uMorphSmear: { value: number };
  };
  /** Current canvas bounds, needed for rocket-fly offset. */
  bounds: SampleBounds;
}

export interface IntroTimings {
  rocketFly: number;
  crossMorph: number;
  textHold: number;
}

const DEFAULT_TIMINGS: IntroTimings = {
  rocketFly: 4.0,
  crossMorph: 1.0,
  textHold: 1.5,
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
    this.adapter.applyTargetTo('aTargetNext', shapes.text);

    // Initial uniform state: drift (uMorph=0), no blend, far-left offset, full smear,
    // and the rocket starts shrunk to ROCKET_START_SCALE so it can grow toward the camera.
    this.adapter.uniforms.uMorph.value = 0;
    this.adapter.uniforms.uTargetBlend.value = 0;
    this.adapter.uniforms.uMorphSmear.value = SMEAR_AMOUNT;
    this.adapter.uniforms.uTargetScale.value = ROCKET_START_SCALE;
    this.adapter.uniforms.uTargetOffset.value.set(
      -adapter.bounds.width * 0.6,
      0,
    );
  }

  get done(): boolean {
    return this.phase === 'done';
  }

  /** Shift internal clock by `deltaMs` (used after pause/resume). */
  shiftClock(deltaMs: number): void {
    this.phaseStart += deltaMs;
  }

  /** Resample both targets at the current bounds without rewinding. */
  applyResize(): void {
    this.adapter.applyTargetTo('aTarget', this.shapes.rocket);
    this.adapter.applyTargetTo('aTargetNext', this.shapes.text);
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
        this.offsetAtCrossMorphStart.copy(u.uTargetOffset.value);
        this.phase = 'cross-morph';
        this.phaseStart = nowMs;
      }
      return;
    }

    if (this.phase === 'cross-morph') {
      const dur = this.timings.crossMorph;
      const t = Math.min(elapsed / dur, 1);
      const blendEased = easeInOutCubic(t);
      const offsetEased = easeOutCubic(t);

      u.uTargetBlend.value = blendEased;
      u.uTargetOffset.value.x =
        this.offsetAtCrossMorphStart.x * (1 - offsetEased);
      u.uTargetOffset.value.y =
        this.offsetAtCrossMorphStart.y * (1 - offsetEased);
      // Smear decays from SMEAR_AMOUNT to 0 linearly.
      u.uMorphSmear.value = SMEAR_AMOUNT * (1 - t);
      u.uMorph.value = 1;
      u.uTargetScale.value = 1;

      if (t >= 1) {
        this.phase = 'text-hold';
        this.phaseStart = nowMs;
      }
      return;
    }

    if (this.phase === 'text-hold') {
      u.uMorph.value = 1;
      u.uTargetBlend.value = 1;
      u.uTargetOffset.value.set(0, 0);
      u.uTargetScale.value = 1;
      u.uMorphSmear.value = 0;

      if (elapsed >= this.timings.textHold) {
        // Handoff: copy text into primary slot, reset blend.
        this.adapter.copyNextIntoPrimary();
        u.uTargetBlend.value = 0;
        this.phase = 'done';
      }
    }
  }
}
