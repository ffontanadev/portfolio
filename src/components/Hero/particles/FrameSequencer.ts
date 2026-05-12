// src/components/Hero/particles/FrameSequencer.ts
import { sampleShape, type ShapeSpec, type SampleBounds } from './shapeSampler';

type FramesShape = Extract<ShapeSpec, { kind: 'frames' }>;
type Phase = 'idle' | 'playing' | 'done';

export interface FrameAdapter {
  /** Write a pre-sampled buffer into a target slot. */
  applyBufferTo(slot: 'aTarget' | 'aTargetNext', buf: Float32Array): void;
  /** Copy aTargetNext over aTarget (slot swap at frame boundary). */
  copyNextIntoPrimary(): void;
  /** Current canvas bounds; mutated in place by ParticleSystem.resize. */
  bounds: SampleBounds;
  /** Material uniform driven by the sequencer. */
  uniforms: { uTargetBlend: { value: number } };
}

export interface FrameSequencerOptions {
  adapter: FrameAdapter;
  shape: FramesShape;
  particleCount: number;
}

const DEFAULT_FPS = 2;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Drives the 'play' state of ParticleSystem for a frames-kind shape.
 *
 * Lifecycle:
 *   constructor()  → pre-samples all frames, writes frame 0 to aTarget,
 *                    frame 1 to aTargetNext (if any), uTargetBlend = 0.
 *   start(now)     → called at morphIn → play; arms the transition clock.
 *   tick(now)      → drives uTargetBlend 0→1; on completion, swaps slots
 *                    and arms the next transition (or marks done after
 *                    the final frame).
 *   applyResize()  → re-samples all frames at new bounds, re-writes the
 *                    current frame (and next, if playing) into the slots.
 *   shiftClock(d)  → shifts transitionStart by d ms after pause/resume.
 */
export class FrameSequencer {
  private adapter: FrameAdapter;
  private shape: FramesShape;
  private particleCount: number;

  private frames: Float32Array[] = [];
  private frameIdx = 0;
  private transitionStart = 0;
  private frameDurationMs: number;
  private phase: Phase = 'idle';

  constructor(opts: FrameSequencerOptions) {
    if (opts.shape.srcs.length === 0) {
      throw new Error('FrameSequencer: shape.srcs must not be empty');
    }

    this.adapter = opts.adapter;
    this.shape = opts.shape;
    this.particleCount = opts.particleCount;

    const fps = (opts.shape.fps && opts.shape.fps > 0 && Number.isFinite(opts.shape.fps))
      ? opts.shape.fps
      : DEFAULT_FPS;
    this.frameDurationMs = 1000 / fps;

    this.sampleAllFrames();

    // Prime slots: frame 0 in aTarget, frame 1 (if exists) in aTargetNext.
    this.adapter.applyBufferTo('aTarget', this.frames[0]);
    if (this.frames.length > 1) {
      this.adapter.applyBufferTo('aTargetNext', this.frames[1]);
    }
    this.adapter.uniforms.uTargetBlend.value = 0;
  }

  get done(): boolean {
    return this.phase === 'done';
  }

  /** Called by ParticleSystem when transitioning morphIn → play. */
  start(nowMs: number): void {
    if (this.phase === 'done') return;
    // Single-frame edge case: nothing to transition to, done immediately.
    if (this.frames.length === 1) {
      this.phase = 'done';
      return;
    }
    this.transitionStart = nowMs;
    this.phase = 'playing';
  }

  /** Called every frame by ParticleSystem while state === 'play'. */
  tick(nowMs: number): void {
    if (this.phase !== 'playing') return;

    const t = Math.min((nowMs - this.transitionStart) / this.frameDurationMs, 1);
    this.adapter.uniforms.uTargetBlend.value = easeInOutCubic(t);

    if (t < 1) return;

    // Transition complete: aTargetNext (= frames[frameIdx+1]) becomes aTarget.
    this.adapter.copyNextIntoPrimary();
    this.frameIdx += 1;
    this.adapter.uniforms.uTargetBlend.value = 0;

    if (this.frameIdx === this.frames.length - 1) {
      // Landed on the final frame; no more transitions.
      this.phase = 'done';
      return;
    }

    // Arm next transition: write the *next-next* frame into aTargetNext.
    this.adapter.applyBufferTo('aTargetNext', this.frames[this.frameIdx + 1]);
    this.transitionStart = nowMs;
  }

  /** Re-sample all frames at the current bounds; re-prime active slots. */
  applyResize(): void {
    this.sampleAllFrames();
    this.adapter.applyBufferTo('aTarget', this.frames[this.frameIdx]);
    if (this.phase === 'playing' && this.frameIdx < this.frames.length - 1) {
      this.adapter.applyBufferTo('aTargetNext', this.frames[this.frameIdx + 1]);
    }
  }

  /** Shift the transition clock after a pause/resume. */
  shiftClock(deltaMs: number): void {
    if (this.phase !== 'playing') return;
    this.transitionStart += deltaMs;
  }

  private sampleAllFrames(): void {
    const { srcs, sizeRatio, widthRatio } = this.shape;
    this.frames = srcs.map((src) =>
      sampleShape(
        { kind: 'silhouette', src, sizeRatio, widthRatio },
        this.particleCount,
        this.adapter.bounds,
      ),
    );
  }
}
