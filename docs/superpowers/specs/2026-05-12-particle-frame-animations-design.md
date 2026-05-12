# Particle Frame Animations — Design

**Date:** 2026-05-12
**Status:** Draft (pending user spec review)
**Scope:** `src/components/Hero/particles/*` and `src/components/Hero/ParticleField.tsx`

## Goal

Extend the hero's particle system to play **frame-based animations** — sequences of raster/vector image frames where particles smoothly morph between successive frames. Multiple named animations can be registered and easily swapped by changing one env value. The first animation to ship is `walking` (30 JPG frames in `public/anim/walking/`).

## User-confirmed decisions

| # | Question | Choice |
|---|---|---|
| 1 | Frame transition style | **Smooth morph** between frames (particles flow from frame N → N+1 continuously, no hold) |
| 2 | Loop integration | **Animation = one slot in the shape list**; rotates alongside text/heart/silhouette |
| 3 | Switching model | **Declarative** — animations are `ShapeSpec`s listed in `VITE_PARTICLE_SHAPES`; switch by editing the env value |
| 4 | Play duration | **Exactly one full loop** per visit, then morph out to the next shape |
| 5 | Asset location | `public/anim/<name>/` |
| 6 | Default FPS | `2` (overridable per animation in the registry) |

## Non-goals

- No imperative runtime API (`setActiveAnimation`, etc.). All switching is via env/props at construction time.
- No per-frame easing or per-frame duration overrides. Frame N→N+1 always takes exactly `1 / fps` seconds.
- No sprite-sheet support. Each frame is a separate file.
- No mid-animation seeking, scrubbing, or pause-on-hover beyond the existing global `pause()` / `resume()` (which freezes the whole system).
- No shader changes. The existing `aTargetNext` + `uTargetBlend` plumbing (added for the intro sequencer) is reused as-is.

## Architecture

A frame animation is treated as a `ShapeSpec` with an internal time axis. When the existing state machine reaches an animation slot, the `hold` state is replaced by a new `play` state that's driven by a `FrameSequencer` (a parallel sibling to `IntroSequencer`).

```
            ┌──────── existing path (static shapes) ─────────┐
drift  →  morphIn  →  hold                                    →  morphOut  →  drift
                       └─ replaced by ──┐
                                        ▼
            ┌────── new path (frames shape) ──────────┐
drift  →  morphIn  →  play (FrameSequencer)            →  morphOut  →  drift
```

State machine selection: at the `morphIn → next` transition, `ParticleSystem` inspects `this.shapes[this.shapeIdx]`. If `kind === 'frames'`, enter `play`; otherwise enter `hold`.

## Shader changes

**None.** All the plumbing this feature needs already exists:

- `aTarget` / `aTargetNext` attributes — added for the intro sequencer
- `uTargetBlend` uniform — `0` = use `aTarget`, `1` = use `aTargetNext`
- The vertex shader already does `mix(aTarget, aTargetNext, uTargetBlend) + uTargetOffset`

`uTargetOffset` / `uTargetScale` / `uMorphSmear` are left at their neutral values (`(0,0)`, `1`, `0`) for the entire `play` state — those are intro-only effects.

## New shape kind

```ts
// shapeSampler.ts
export type ShapeSpec =
  | { kind: 'text'; /* ... */ }
  | { kind: 'heart'; /* ... */ }
  | { kind: 'rocket'; /* ... */ }
  | { kind: 'silhouette'; /* ... */ }
  | {
      kind: 'frames';
      srcs: string[];                // ordered list of frame image URLs
      fps?: number;                  // default 2
      sizeRatio?: number;            // same semantics as silhouette
      widthRatio?: number;           // same semantics as silhouette
    };
```

Notes:

- All frames share one `sizeRatio` / `widthRatio`. Per-frame sizing is out of scope.
- `sampleShape` does **not** know about `kind: 'frames'`. Frame animations are sampled per-frame via a new helper `sampleFrame(src, count, bounds, sizing)` that wraps the existing silhouette path (`drawSilhouette` + `collectDarkPixels`). The orchestration of "which frame to sample when" lives in `FrameSequencer`, not in `sampleShape`.

## Frame loading and pre-sampling

**Loading** — `loadSilhouette(src)` already handles arbitrary raster/vector images via `new Image()`. The frame loader simply iterates `srcs` and resolves when all are decoded. We extend `ParticleField.tsx`'s existing `silhouetteSrcs` pre-load set to also include every frame URL from every `kind: 'frames'` shape in the active list.

**Pre-sampling** — when the state machine transitions from `drift → morphIn` *into* a frames shape, `ParticleSystem` constructs a `FrameSequencer`. The constructor synchronously pre-samples all frames into a `Float32Array[]` of length `srcs.length`, cached on the instance. Why upfront and not lazy: a 24k-particle silhouette sample costs ~3–5 ms; doing 30 of them during `play` would stutter at 2 FPS. Doing them all once at slot-entry is bounded (~150 ms for 30 frames), happens during `morphIn` (when particles are already in motion and a sub-frame hitch is invisible), and keeps the `play` loop allocation-free.

**`morphIn` target** — the constructor also writes frame 0's pre-sampled buffer into `aTarget` (replacing the static-shape path's `applyTargetTo('aTarget', shape)` call, since `sampleShape` does not handle `kind: 'frames'`). The morphIn then animates particles from drift into frame 0, identical in feel to a static shape's morphIn.

**Resize while a frames shape is active** — applies to all of `morphIn`, `play`, and `morphOut`. The sequencer remains alive across all three states (disposed only at `morphOut → drift`). On resize, `ParticleSystem` calls `this.frame.applyResize()` instead of the generic `applyTargetTo('aTarget', shapes[shapeIdx])` path. `applyResize` re-samples every cached frame at the new bounds, then re-writes the current frame into `aTarget` (and, during `play`, the next into `aTargetNext`) — no rewind of progress.

**JPG/PNG with non-pure-white backgrounds** — the existing `drawSilhouette` drops pixels with luminance > 0.98. JPG frames with compression noise around silhouette edges may need a relaxed threshold. Out of scope for the initial design; if needed, expose `luminanceThreshold` on the frames spec later.

## FrameSequencer

New file: `src/components/Hero/particles/FrameSequencer.ts`. Structurally parallel to `IntroSequencer.ts`.

**Constructor inputs**

```ts
new FrameSequencer({
  adapter: {
    applyBufferTo(slot: 'aTarget' | 'aTargetNext', buf: Float32Array): void;
    copyNextIntoPrimary(): void;
    uniforms: { uTargetBlend: { value: number } };
  },
  shape: Extract<ShapeSpec, { kind: 'frames' }>,
  bounds: SampleBounds,
  nowMs: number,
});
```

**Internal state**

- `frames: Float32Array[]` — pre-sampled per-frame target buffers
- `frameIdx: number` — index of the frame currently in `aTarget` (starts at 0)
- `transitionStart: number` — `performance.now()` at the start of the current frame→next transition
- `frameDurationMs = 1000 / fps`
- `done: boolean` — set true after the final frame transition completes
- `phase: 'idle' | 'playing'` — `idle` during morphIn (sequencer exists but is not ticking); `playing` once `start(nowMs)` is called by `ParticleSystem` at the `morphIn → play` boundary

**Lifecycle**

1. **Construction** — sample all `srcs.length` frames into the `frames[]` array. Write `frames[0]` into `aTarget` (replacing the static path's `applyTargetTo` call). Write `frames[1]` into `aTargetNext` if it exists. Set `uTargetBlend = 0`. Set `frameIdx = 0`, `phase = 'idle'`, `done = false`. The sequencer does *not* tick yet — `ParticleSystem` is now running `morphIn` toward `aTarget`.
2. **`start(nowMs)`** — called by `ParticleSystem` when state transitions `morphIn → play`. Sets `transitionStart = nowMs`, `phase = 'playing'`.
3. **`tick(nowMs)`** — no-op if `phase !== 'playing'` or `done`. Otherwise compute `t = (nowMs - transitionStart) / frameDurationMs`, clamp to `[0,1]`. Write `uTargetBlend = easeInOutCubic(t)`. When `t >= 1`:
   - `copyNextIntoPrimary()` — `aTargetNext` (frame `frameIdx + 1`) becomes the new `aTarget`.
   - Increment `frameIdx`. Reset `uTargetBlend = 0`.
   - If `frameIdx === srcs.length - 1`: we just landed on the last frame; no more transitions to play. Set `done = true` and return. `ParticleSystem` reads `done` next tick and advances to `morphOut`.
   - Otherwise: write `frames[frameIdx + 1]` into `aTargetNext`, set `transitionStart = nowMs`.
4. **`done: boolean`** — read by `ParticleSystem` after each tick.
5. **`shiftClock(deltaMs)`** — adjusts `transitionStart` after pause/resume. No-op if `phase !== 'playing'`. Same pattern as `IntroSequencer.shiftClock`.
6. **`applyResize(bounds)`** — re-samples all frames at the new bounds. Re-writes `frames[frameIdx]` into `aTarget`. If `phase === 'playing'` and `frameIdx < srcs.length - 1`, also re-writes `frames[frameIdx + 1]` into `aTargetNext`. No rewind of `transitionStart`.

**Edge case: single-frame animation (`srcs.length === 1`)** — the constructor skips the `aTargetNext` write. On `start`, the sequencer immediately sets `done = true` so `ParticleSystem` transitions straight from `play → morphOut` on the next tick. The single frame is held in `aTarget` for `morphIn` and `morphOut` only — effectively a one-loop "frame-shaped silhouette" with zero `play` duration. Allowed but discouraged in the registry.

## ParticleSystem changes

In `ParticleSystem.ts`:

- **`State` type** gains `'play'`: `type State = 'drift' | 'morphIn' | 'hold' | 'play' | 'morphOut'`.
- A new private field `frame: FrameSequencer | null = null`. Holds the active sequencer for the *entire* lifecycle of one frames-shape visit: constructed at `drift → morphIn`, disposed at `morphOut → drift`.
- In `stepStateMachine`:
  - `drift → next` branch (where the next shape is selected): if `shapes[shapeIdx + 1].kind === 'frames'`, construct a `FrameSequencer` and assign to `this.frame` *instead of* calling `applyTargetTo('aTarget', shape)` (the sequencer's constructor writes frame 0 to `aTarget` itself). Otherwise unchanged. State advances to `morphIn` either way.
  - `morphIn → next` branch: if `this.frame !== null`, call `this.frame.start(now)` and set state to `'play'`. Otherwise set state to `'hold'` as today.
  - New `case 'play'`: call `this.frame!.tick(now)`. `morph` stays at `1` for the whole play state. When `this.frame.done`, set state to `'morphOut'`, set `stateStart = now`. *Do not* null `this.frame` yet — it's needed by `resize` during `morphOut`. `uTargetBlend` is already `0` (reset by the sequencer when it lands on the final frame).
  - `morphOut → drift` branch: if `this.frame !== null`, set `this.frame = null` (release pre-sampled buffers).
- In `resize`:
  - When `this.frame !== null` (any of `morphIn`, `play`, `morphOut` for a frames shape), call `this.frame.applyResize(this.bounds)` and skip the existing `applyTargetTo('aTarget', shapes[shapeIdx])` call entirely.
- In `resume`:
  - When state is `'play'`, call `this.frame!.shiftClock(delta)` in addition to `stateStart += delta`.

## Configuration

### Registry

In `ParticleField.tsx`, beside the existing `parseShapesFromEnv`:

```ts
const ANIMATIONS: Record<string, Extract<ShapeSpec, { kind: 'frames' }>> = {
  walking: {
    kind: 'frames',
    srcs: Array.from({ length: 30 }, (_, i) =>
      `/anim/walking/guy-walking_${String(i + 1).padStart(3, '0')}.jpg`
    ),
    fps: 2,
    sizeRatio: 0.55,
  },
};
```

Adding a new animation = drop files in `public/anim/<name>/`, add one entry to `ANIMATIONS`.

### Env parser

`parseShapesFromEnv` gains one branch, placed *before* the text fallback:

```ts
if (ANIMATIONS[lower]) return ANIMATIONS[lower];
```

So token resolution order in `VITE_PARTICLE_SHAPES` becomes:

1. `heart` → heart icon
2. `guy` → `/guy.svg` silhouette
3. **token matches an `ANIMATIONS` key** → that frame animation
4. anything else → Fraunces text

Example envs:

```
VITE_PARTICLE_SHAPES="Felipe|walking|FF."
VITE_PARTICLE_SHAPES="walking"      # only the animation, looping via shape rotation
```

### Pre-loading frames in ParticleField

The existing pre-load block builds `silhouetteSrcs` from active shapes. We add an analogous traversal for `kind: 'frames'` shapes that pushes every `srcs[i]` into the same set, since they all flow through `loadSilhouette`. No change to the parallelism / failure-handling shape of that code.

## Failure modes

| Mode | Behavior |
|---|---|
| One or more frame files fail to load | The failed frame's pre-sample falls back to `scatterFallback` (existing behavior in `shapeSampler`). The animation still runs — that frame is a scattered cloud. Logged via `console.warn`, same as silhouette failures today. |
| `srcs.length === 0` | Defensive guard in `FrameSequencer` constructor: throws. Caller (env parser / registry) is expected to never produce this. |
| `srcs.length === 1` | Sequencer immediately reports `done` on first tick; effectively behaves like a static silhouette but pays the play-state cost. Allowed but discouraged. |
| `fps` ≤ 0 or non-finite | Default to `2`. |
| Pause/resume mid-animation | `shiftClock(delta)` re-zeros the transition clock. Animation continues from the exact frame and progress it was at. |

## Memory and timing budget

For the shipping `walking` animation:

- 30 frames × 24,000 particles × 2 floats × 4 bytes = **5.76 MB** peak for `frames[]`.
- 30 × ~5 ms sampling cost = **~150 ms** pre-sample wall time, paid once during `morphIn`.
- Play duration = 30 / 2 = **15 s** per visit. That's ~4× a static `hold` (3.5 s). Acceptable; user has confirmed.

At lower particle counts (mobile, 6000 particles) the memory drops to ~1.4 MB and sampling to ~40 ms. No additional optimization needed.

## Testing checklist

Manual, in browser, after implementation:

- [ ] `VITE_PARTICLE_SHAPES="walking"` plays the walking loop continuously (drift between visits is ~0.5 s, then 15 s of play, then drift again).
- [ ] `VITE_PARTICLE_SHAPES="Felipe|walking|FF."` rotates: text → walking → text → walking → … in order.
- [ ] Resize during play: particles smoothly resample at new size, animation keeps running, no rewind.
- [ ] Pause (tab background) during play and resume: animation continues from where it was, not from start.
- [ ] No console errors when a frame URL 404s; animation still cycles with one scattered frame.
- [ ] Reduced motion: hero is suppressed entirely (existing behavior, should remain).
- [ ] Memory does not grow each loop iteration (sequencer is disposed at `play → morphOut`).

## Future extensions (out of scope now)

- Imperative `setActiveAnimation(name)` API on `ParticleSystem` — needed only when we want scroll-driven or click-driven animation swaps.
- Per-frame duration overrides (variable-speed animations).
- Sprite-sheet (single image, multiple frames) loader.
- Per-animation `luminanceThreshold` for noisy JPG frames.
- Loop count > 1 per visit (currently hardcoded to one loop).
