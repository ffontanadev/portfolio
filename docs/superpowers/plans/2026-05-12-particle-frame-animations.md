# Particle Frame Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the hero's particle system with a new `frames` shape kind that smooth-morphs between a sequence of image frames, configured declaratively via an `ANIMATIONS` registry and toggled by the existing `VITE_PARTICLE_SHAPES` env value. Ship with a 30-frame `walking` animation.

**Architecture:** A frame animation is a `ShapeSpec` whose target moves over time. When the existing state machine reaches a frames slot, a new `play` state (driven by a new `FrameSequencer` class — parallel to the existing `IntroSequencer`) cross-blends through pre-sampled frame buffers using the already-wired `aTarget` / `aTargetNext` / `uTargetBlend` plumbing. No shader changes. One full loop per visit, then morphOut to drift as today.

**Tech Stack:** TypeScript 5.9, React 19, Three.js 0.184, Vite 7. Codebase has **no test framework configured** — verification is `npm run build` (typecheck), `npm run lint` (ESLint), and the manual browser checklist in the spec.

**Spec:** `docs/superpowers/specs/2026-05-12-particle-frame-animations-design.md`

## File structure

- **Create:** `src/components/Hero/particles/FrameSequencer.ts` — owns the `play`-state state machine: pre-samples all frames once at construction, drives `uTargetBlend` and slot swaps, signals `done` after the final frame transition.
- **Modify:** `src/components/Hero/particles/shapeSampler.ts` — add `kind: 'frames'` to the `ShapeSpec` union. No behavior change in `sampleShape` (the frames kind is sampled per-frame inside `FrameSequencer` by synthesizing a `silhouette` spec).
- **Modify:** `src/components/Hero/particles/ParticleSystem.ts` — add `'play'` to the `State` union, add `frame: FrameSequencer | null` field, add a small `applyBufferTo` helper, branch the state machine for frames shapes, route `resize`/`resume` through the sequencer when present.
- **Modify:** `src/components/Hero/ParticleField.tsx` — declare the `ANIMATIONS` registry (with `walking`), extend `parseShapesFromEnv` to resolve animation names, extend the pre-load set to include every frame URL.

---

### Task 1: Extend `ShapeSpec` union with `kind: 'frames'`

**Files:**
- Modify: `src/components/Hero/particles/shapeSampler.ts:4-8`

- [ ] **Step 1: Add the new union variant**

Edit `src/components/Hero/particles/shapeSampler.ts`. Replace the `ShapeSpec` type definition:

```ts
export type ShapeSpec =
  | { kind: 'text'; text: string; fontFamily?: string; weight?: number; heightRatio?: number }
  | { kind: 'heart'; sizeRatio?: number }
  | { kind: 'rocket'; sizeRatio?: number }
  | { kind: 'silhouette'; src: string; sizeRatio?: number; widthRatio?: number }
  | { kind: 'frames'; srcs: string[]; fps?: number; sizeRatio?: number; widthRatio?: number };
```

- [ ] **Step 2: Handle the new kind in `sampleShape`'s dispatch**

Note: `sampleShape` is never called with a `frames` spec in the production flow (the `FrameSequencer` samples frames individually by synthesizing `silhouette` specs). But because the dispatch is exhaustive, TypeScript will flag the missing branch. Add a defensive fallback to scatter.

Replace the dispatch block in `sampleShape` (around line 35-43):

```ts
  if (spec.kind === 'text') {
    drawText(ctx, spec, bounds);
  } else if (spec.kind === 'heart') {
    drawHeart(ctx, spec, bounds);
  } else if (spec.kind === 'rocket') {
    drawRocket(ctx, spec, bounds);
  } else if (spec.kind === 'silhouette') {
    drawSilhouette(ctx, spec, bounds);
  } else {
    // 'frames' is sampled per-frame by FrameSequencer; if it reaches here,
    // something wired it into the static shape rotation path by mistake.
    return scatterFallback(count, bounds);
  }
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run build`
Expected: Build succeeds, no TypeScript errors.

- [ ] **Step 4: Verify lint passes**

Run: `npm run lint`
Expected: No new lint errors in `shapeSampler.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero/particles/shapeSampler.ts
git commit -m "feat(particles): add 'frames' kind to ShapeSpec union"
```

---

### Task 2: Create `FrameSequencer.ts`

**Files:**
- Create: `src/components/Hero/particles/FrameSequencer.ts`

- [ ] **Step 1: Create the file with the full class**

Create `src/components/Hero/particles/FrameSequencer.ts` with this exact content:

```ts
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
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run build`
Expected: Build succeeds, no TypeScript errors.

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint`
Expected: No new lint errors in `FrameSequencer.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero/particles/FrameSequencer.ts
git commit -m "feat(particles): add FrameSequencer for cross-blending frame buffers"
```

---

### Task 3: Wire `FrameSequencer` into `ParticleSystem`

**Files:**
- Modify: `src/components/Hero/particles/ParticleSystem.ts`

- [ ] **Step 1: Add the import**

At the top of `ParticleSystem.ts`, after the existing imports (after line 4):

```ts
import { FrameSequencer, type FrameAdapter } from './FrameSequencer';
```

- [ ] **Step 2: Extend the `State` type**

Replace the `State` type declaration (line 27):

```ts
type State = 'drift' | 'morphIn' | 'hold' | 'play' | 'morphOut';
```

- [ ] **Step 3: Add the `frame` private field**

In the `ParticleSystem` class body, after the existing `private intro` / `private introOpts` declarations (around line 63), add:

```ts
  private frame: FrameSequencer | null = null;
  private frameAdapter: FrameAdapter | null = null;
```

(The adapter is constructed lazily once `bounds` exists — same timing constraint as `IntroSequencer` — to avoid capturing zero-bounds at constructor time.)

- [ ] **Step 4: Add the private `applyBufferTo` helper**

Add this method to the class, immediately after the existing `applyTargetTo` method (after line 235):

```ts
  private applyBufferTo(slot: 'aTarget' | 'aTargetNext', buf: Float32Array) {
    const attr = this.geometry.getAttribute(slot) as THREE.BufferAttribute;
    (attr.array as Float32Array).set(buf);
    attr.needsUpdate = true;
  }
```

- [ ] **Step 5: Construct the frame adapter on first resize**

In `resize`, inside the `if (!this.initialized) { ... }` block, after the intro-sequencer construction block (after line 159, just before the `return;`), add the adapter construction. Replace the entire `if (!this.initialized)` block (lines 133-160) with:

```ts
    if (!this.initialized) {
      this.initAttributes();
      this.initialized = true;

      this.frameAdapter = {
        applyBufferTo: (slot, buf) => this.applyBufferTo(slot, buf),
        copyNextIntoPrimary: () => this.copyNextIntoPrimary(),
        bounds: this.bounds,
        uniforms: {
          uTargetBlend: this.material.uniforms.uTargetBlend as { value: number },
        },
      };

      // First resize → construct the intro sequencer if one was requested.
      if (this.introOpts) {
        this.intro = new IntroSequencer(
          {
            applyTargetTo: (slot, shape) => this.applyTargetTo(slot, shape),
            copyNextIntoPrimary: () => this.copyNextIntoPrimary(),
            uniforms: {
              uMorph: this.material.uniforms.uMorph as { value: number },
              uTargetBlend: this.material.uniforms.uTargetBlend as { value: number },
              uTargetOffset: this.material.uniforms.uTargetOffset as { value: THREE.Vector2 },
              uTargetScale: this.material.uniforms.uTargetScale as { value: number },
              uMorphSmear: this.material.uniforms.uMorphSmear as { value: number },
            },
            bounds: this.bounds,
          },
          this.introOpts.shapes,
          performance.now(),
          this.introOpts.timings,
        );
        this.introOpts = null;  // consumed; guard against re-entry / double-construction.
        // Sequencer's constructor already populated aTarget with the rocket;
        // skip the loop's first-frame target refresh so it isn't clobbered.
        return;
      }
    } else {
      this.resampleHomes();
      // Resampling targets must reflect intro state, not the loop shape.
      if (this.intro && !this.intro.done) {
        this.intro.applyResize();
        return;
      }
      // If a frame sequencer is active, it owns target resampling.
      if (this.frame) {
        this.frame.applyResize();
        return;
      }
    }
    // Loop path: refresh the active shape's target for the new bounds.
    this.applyTargetTo('aTarget', this.shapes[this.shapeIdx]);
```

- [ ] **Step 6: Branch `drift → morphIn` for frames shapes**

In `stepStateMachine`, replace the `case 'drift':` block (lines 255-263) with:

```ts
      case 'drift':
        m = 0;
        if (elapsed >= this.timings.drift) {
          this.shapeIdx = (this.shapeIdx + 1) % this.shapes.length;
          const nextShape = this.shapes[this.shapeIdx];
          if (nextShape.kind === 'frames') {
            this.frame = new FrameSequencer({
              adapter: this.frameAdapter!,
              shape: nextShape,
              particleCount: this.particleCount,
            });
          } else {
            this.applyTargetTo('aTarget', nextShape);
          }
          this.state = 'morphIn';
          this.stateStart = now;
        }
        break;
```

- [ ] **Step 7: Branch `morphIn → next` for frames shapes**

Replace the `case 'morphIn':` block (lines 264-272) with:

```ts
      case 'morphIn': {
        const t = Math.min(elapsed / this.timings.morphIn, 1);
        m = easeInOutCubic(t);
        if (t >= 1) {
          if (this.frame) {
            this.frame.start(now);
            this.state = 'play';
          } else {
            this.state = 'hold';
          }
          this.stateStart = now;
        }
        break;
      }
```

- [ ] **Step 8: Add the `play` case**

Add a new case to the switch, immediately after the `case 'morphIn':` block and before `case 'hold':` (around line 273):

```ts
      case 'play': {
        this.frame!.tick(now);
        m = 1;
        if (this.frame!.done) {
          this.state = 'morphOut';
          this.stateStart = now;
        }
        break;
      }
```

- [ ] **Step 9: Null the sequencer on `morphOut → drift`**

Replace the `case 'morphOut':` block (lines 280-288) with:

```ts
      case 'morphOut': {
        const t = Math.min(elapsed / this.timings.morphOut, 1);
        m = 1 - easeInOutCubic(t);
        if (t >= 1) {
          this.state = 'drift';
          this.stateStart = now;
          this.frame = null;  // release pre-sampled frame buffers
        }
        break;
      }
```

- [ ] **Step 10: Shift the sequencer clock on resume**

In `resume()` (lines 343-353), replace the entire method with:

```ts
  resume() {
    if (this.rafId === null && this.initialized) {
      const now = performance.now();
      const delta = now - this.lastTickAt;
      this.stateStart += delta;
      if (this.intro && !this.intro.done) {
        this.intro.shiftClock(delta);
      }
      if (this.frame && this.state === 'play') {
        this.frame.shiftClock(delta);
      }
      this.tick();
    }
  }
```

- [ ] **Step 11: Verify typecheck passes**

Run: `npm run build`
Expected: Build succeeds, no TypeScript errors.

- [ ] **Step 12: Verify lint passes**

Run: `npm run lint`
Expected: No new lint errors in `ParticleSystem.ts`.

- [ ] **Step 13: Commit**

```bash
git add src/components/Hero/particles/ParticleSystem.ts
git commit -m "feat(particles): integrate FrameSequencer into state machine"
```

---

### Task 4: Register the `walking` animation and wire env parsing

**Files:**
- Modify: `src/components/Hero/ParticleField.tsx`

- [ ] **Step 1: Add the `ANIMATIONS` registry**

In `ParticleField.tsx`, after the `DEFAULT_SHAPES` declaration (after line 31), add:

```ts
// Named frame-animation registry. Tokens in VITE_PARTICLE_SHAPES that match
// a key here resolve to that frame animation (handled in parseShapesFromEnv).
// Add a new animation by dropping frames in /public/anim/<name>/ and adding
// one entry below.
const ANIMATIONS: Record<string, ShapeSpec> = {
  walking: {
    kind: 'frames',
    srcs: Array.from({ length: 30 }, (_, i) =>
      `/anim/walking/guy-walking_${String(i + 1).padStart(3, '0')}.jpg`,
    ),
    fps: 2,
    sizeRatio: 0.55,
  },
};
```

- [ ] **Step 2: Extend `parseShapesFromEnv` to resolve animation names**

Replace the `parts.map((part): ShapeSpec => { ... })` block in `parseShapesFromEnv` (lines 53-62) with:

```ts
  return parts.map((part): ShapeSpec => {
    const lower = part.toLowerCase();
    if (lower === 'heart') {
      return { kind: 'heart', sizeRatio: 0.38 };
    }
    if (lower === 'guy') {
      return { kind: 'silhouette', src: '/guy.svg', sizeRatio: 1.5 };
    }
    if (ANIMATIONS[lower]) {
      return ANIMATIONS[lower];
    }
    return { kind: 'text', text: part, heightRatio: textHeightRatio(part) };
  });
```

- [ ] **Step 3: Pre-load frame URLs alongside silhouette URLs**

The existing pre-load block (lines 111-121) only collects URLs from `kind: 'silhouette'` shapes. Extend it to also collect every URL from `kind: 'frames'` shapes. Replace the `const silhouetteSrcs = new Set<string>(); ... ` block (lines 111-121) with:

```ts
    // Pre-load any silhouette SVGs and frame-animation images referenced by
    // active shapes (or the intro) in parallel with font loading. Failures
    // don't block construction — sampleShape will fall back to scatter for
    // that shape until/unless it loads.
    const imageSrcs = new Set<string>();
    for (const s of activeShapes) {
      if (s.kind === 'silhouette') imageSrcs.add(s.src);
      else if (s.kind === 'frames') for (const src of s.srcs) imageSrcs.add(src);
    }
    const silhouettesReady = Promise.all(
      [...imageSrcs].map((src) =>
        loadSilhouette(src).catch((err) => {
          console.warn('[ParticleField]', err);
        }),
      ),
    );
```

- [ ] **Step 4: Verify typecheck passes**

Run: `npm run build`
Expected: Build succeeds, no TypeScript errors.

- [ ] **Step 5: Verify lint passes**

Run: `npm run lint`
Expected: No new lint errors in `ParticleField.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero/ParticleField.tsx
git commit -m "feat(particles): register 'walking' animation and resolve via env"
```

---

### Task 5: Manual browser verification

**Files:** none (verification only)

This task runs the testing checklist from the spec. Each step is a manual observation in a browser.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Vite prints a local URL (e.g. `http://localhost:5173/`). Open it.

- [ ] **Step 2: Test the all-animation loop**

In your local `.env` (or shell), set:

```
VITE_PARTICLE_SHAPES=walking
```

Restart `npm run dev` (Vite inlines env at start). Open the hero.

Expected:
- After the existing intro completes ("Hi, I'm Felipe" dissolves), the particles drift briefly (~0.5 s).
- They morph into frame 0 of the walking silhouette (a standing figure).
- Over the next 14.5 seconds, the silhouette walks — particles continuously flowing from each frame's positions to the next at 2 FPS (one transition every 500 ms).
- After the 30th frame, particles morph back to drift.
- The cycle repeats.

No console errors. No visible stutter between frames.

- [ ] **Step 3: Test mixed rotation (text + animation)**

Set:

```
VITE_PARTICLE_SHAPES=Felipe|walking|FF.
```

Restart and reload.

Expected: rotation goes `Felipe` → drift → walking (15 s) → drift → `FF.` → drift → `Felipe` → … in that order.

- [ ] **Step 4: Test resize during play**

While the walking animation is playing, resize the browser window (drag the corner, or use DevTools to toggle device emulation).

Expected:
- Particles smoothly re-flow to a re-sampled silhouette at the new bounds.
- Animation continues from approximately the same frame — no rewind to frame 0, no visible "snap to first frame".

- [ ] **Step 5: Test pause/resume**

While the walking animation is playing, switch to another browser tab for at least 1 second, then switch back.

Expected:
- On tab return, the animation resumes from the exact frame and progress it was at — no rewind, no jump.

- [ ] **Step 6: Test missing-frame resilience**

In `ANIMATIONS.walking.srcs`, temporarily replace one URL (say index 10) with a path that 404s, e.g. `/anim/walking/MISSING.jpg`. Restart and reload.

Expected:
- Console shows a `[ParticleField]` warn for the missing file.
- Animation still cycles. The missing-frame's transition shows particles scattering randomly across the canvas for ~500 ms instead of forming a silhouette, then continues to the next frame normally.

Revert the change before committing.

- [ ] **Step 7: Check for compression-noise issues with JPGs**

If during step 2 the walking silhouette looks "fringey" or has visible noise particles ringing the figure (JPG compression artifacts being picked up by the luminance threshold), open `src/components/Hero/particles/silhouetteSampler.ts` and lower `LIGHT_LUMINANCE_THRESHOLD` from `0.98` to `0.92`. Rerun and recheck.

If a tweak is needed, commit it:

```bash
git add src/components/Hero/particles/silhouetteSampler.ts
git commit -m "fix(particles): relax luminance threshold for JPG frames"
```

If no tweak needed, skip this commit.

- [ ] **Step 8: Check reduced-motion still suppresses the hero**

In DevTools, enable `prefers-reduced-motion: reduce` (Rendering tab → Emulate CSS media feature). Reload.

Expected: the entire particle field is suppressed (canvas not rendered). This is existing behavior — confirms the new code didn't break it.

- [ ] **Step 9: Memory sanity check**

In DevTools Performance Monitor, watch JS heap size for ~2 minutes while the rotation loops.

Expected: heap grows during the first `walking` visit (pre-samples), then stays bounded — no monotonic growth across multiple loop iterations (`this.frame = null` at `morphOut → drift` is releasing the buffers).

---

## Self-review notes

After writing this plan, ran the self-review:

- **Spec coverage:** Each spec section maps to a task — `ShapeSpec` extension → Task 1; `FrameSequencer` class → Task 2; `ParticleSystem` state machine changes (including resize/resume) → Task 3; `ANIMATIONS` registry + parser + pre-load → Task 4; manual testing checklist → Task 5.
- **Placeholder scan:** No TBDs, no "implement appropriate X". All code blocks are complete.
- **Type consistency:** `FrameAdapter` interface in Task 2 matches its usage in Task 3 (`applyBufferTo`, `copyNextIntoPrimary`, `bounds`, `uniforms.uTargetBlend`). `FrameSequencer` method names (`start`, `tick`, `applyResize`, `shiftClock`, `done`) are used consistently in Tasks 2 and 3.
- **One discovered detail:** Task 3 had to additionally construct a `frameAdapter` field on first `resize` (mirroring how `IntroSequencer`'s construction is gated on first resize, since `bounds` is zero at constructor time). Wired into Step 5 of Task 3.
