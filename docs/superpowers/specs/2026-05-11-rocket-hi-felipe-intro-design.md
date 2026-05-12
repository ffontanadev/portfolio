# Rocket → "Hi, I'm Felipe" Intro Sequence — Design

**Date:** 2026-05-11
**Status:** Approved (pending user spec review)
**Scope:** `src/components/Hero/particles/*` and `src/components/Hero/ParticleField.tsx`

## Goal

Replace the current "particles drift, morph to shape, hold, drift, next shape" loop intro with a one-time cinematic sequence: a particle-formed rocket flies in from the left and, on reaching center, cross-morphs into the text *"Hi, I'm Felipe"*. After a hold, the held text dissolves into the existing drift field and the existing recurring shape cycle (Felipe / FF. / heart) takes over as it does today.

## User-confirmed decisions

| # | Question | Choice |
|---|---|---|
| 1 | When does the sequence play? | One-time intro on page load; existing loop takes over after |
| 2 | After "Hi, I'm Felipe" appears? | Hold, then hand off to the existing recurring cycle |
| 3 | Rocket movement style? | Solid silhouette with **exhaust trail** and a **slight bob/tilt** |
| 4 | Rocket art source? | Inline SVG path in code (matches how `heart` is implemented) |
| 5 | Total intro duration? | Balanced ~5 s (rocket fly 2 s, cross-morph 1 s, hold 1.5 s, dissolve 0.7 s) |
| 6 | Text layout? | Single line, "Hi, I'm Felipe", auto-fit via existing `heightRatio` shrink |
| 7 | Frequency? | Every page load (no session/storage gating) |

## Non-goals

- No persistence (sessionStorage / localStorage gating). Intro plays every load.
- No multi-line text layout. Single-line auto-fit reuses `drawText`'s existing logic.
- No rocket asset loaded from disk. Inline SVG path only.
- No reduced-motion-specific intro variant. The existing `prefers-reduced-motion` early-return in `ParticleField` already suppresses the entire effect, intro included.

## Architecture

Two cooperating state machines inside `ParticleSystem`, gated by an `introActive` flag.

- **IntroSequencer** (new) — owns the four-phase intro state machine. Runs once per `ParticleSystem` construction. Drives shader uniforms each tick. Reports `done` when handoff is complete.
- **Loop state machine** (existing `drift / morphIn / hold / morphOut`) — suppressed while `introActive === true`. On handoff, the sequencer primes the loop machine into `morphOut` (so the held text dissolves into drift) and clears the flag. From that point on, behavior is identical to today.

The intro shapes (rocket, "Hi, I'm Felipe") are *not* part of the recurring `shapes` array; they're a separate `intro: { rocket, text }` config. The existing `shapes` array continues to drive only the recurring loop.

## Shader changes

One new attribute, three new uniforms.

```glsl
attribute vec2  aTargetNext;
uniform float   uTargetBlend;   // 0 = aTarget, 1 = aTargetNext
uniform vec2    uTargetOffset;  // CSS px shift applied to both targets
uniform float   uMorphSmear;    // 0..1 per-particle stagger for trail effect
```

Vertex math becomes:

```glsl
vec2 target  = mix(aTarget, aTargetNext, uTargetBlend) + uTargetOffset;
float pMorph = clamp(uMorph - (1.0 - aSeed) * uMorphSmear, 0.0, 1.0);
vec2 pos     = mix(driftPos, target, pMorph);
```

`uMorphSmear` produces the **exhaust trail** naturally: particles with low `aSeed` latch onto the target first (front of the rocket), particles with high `aSeed` lag behind by up to `uMorphSmear` of the morph progression. No separate trail system, no extra particles, no per-frame trail buffer.

The flying motion is driven entirely by `uTargetOffset.x` — the rocket shape is sampled *once* at center and translated by the offset. `uTargetOffset.y` carries the bob.

## Components

### New files

- `src/components/Hero/particles/IntroSequencer.ts`
  Owns the intro state machine. Takes references to the geometry attributes and material uniforms in its constructor. Public surface: `tick(now: number, bounds: SampleBounds): void`, `done: boolean`, `applyResize(): void`.

- `src/components/Hero/particles/rocketPath.ts`
  Exports the inline SVG path string for the rocket silhouette (nose-right orientation, baked slight tilt) and `drawRocket(ctx, spec, bounds)` which uses `Path2D` to fill the rocket centered at `(bounds.width/2, bounds.height/2)` scaled by `sizeRatio * bounds.height`.

### Modified files

- `src/components/Hero/particles/shapeSampler.ts`
  Add `{ kind: 'rocket'; sizeRatio?: number }` to the `ShapeSpec` union; route to `drawRocket` in the existing kind switch.

- `src/components/Hero/particles/shaders.ts`
  Add `aTargetNext` attribute declaration, three new uniform declarations, update the three lines of vertex math shown above.

- `src/components/Hero/particles/ParticleSystem.ts`
  - Add `aTargetNext` buffer in `initAttributes` (initialized as a copy of `aTarget`).
  - Add three new uniforms in the material constructor (initial values: `uTargetBlend=0`, `uTargetOffset=(0,0)`, `uMorphSmear=0`).
  - Add `private intro: IntroSequencer | null` field, constructed in the constructor when `opts.intro` is provided.
  - New private helper `applyTargetTo(slot: 'aTarget' | 'aTargetNext', shape: ShapeSpec)` — generalizes the existing `applyShapeTarget`.
  - In `tick()`, branch: if `intro && !intro.done`, call `intro.tick(now, bounds)` and skip `stepStateMachine`. When `intro.done` flips, prime `state='morphOut'` and `stateStart=now`.
  - In `resize()`, if intro is active, call `intro.applyResize()` (which re-samples both target slots and continues).

- `src/components/Hero/ParticleField.tsx`
  Add an `intro` config object alongside the existing palette: `{ rocket: { kind: 'rocket', sizeRatio: 0.42 }, text: { kind: 'text', text: "Hi, I'm Felipe", heightRatio: 0.32 } }`. Pass to `ParticleSystem` constructor. The existing `activeShapes` / `ENV_SHAPES` array continues to drive only the recurring loop.

## Data flow & timing

All timings are driven off `performance.now()`, same clock as the existing system. The sequencer's `tick` computes `elapsed = (now - phaseStart) / 1000` and advances when `elapsed` crosses a phase duration.

| Phase | Duration | What animates | Easing |
|---|---|---|---|
| `rocket-fly` | 2000 ms | `uTargetOffset.x`: `-width*0.6 → 0`<br>`uTargetOffset.y`: `sin(t*4.5)*8` (live, not eased)<br>`uMorph`: `0 → 1` over the first 600 ms<br>`uMorphSmear`: `0.35` constant | `easeOutCubic` on x; `easeInOutCubic` on morph |
| `cross-morph` | 1000 ms | `uTargetBlend`: `0 → 1`<br>`uTargetOffset`: `(current → 0,0)`<br>`uMorphSmear`: `0.35 → 0` | `easeInOutCubic` on blend; `easeOutCubic` on offset; linear on smear |
| `text-hold` | 1500 ms | All held: `uMorph=1`, `uTargetBlend=1`, `uTargetOffset=(0,0)`, `uMorphSmear=0` | — |
| handoff | 0 ms | `aTarget := aTargetNext` (`Float32Array.set` copy), `uTargetBlend := 0`, `introActive := false`, loop's `state := 'morphOut'`, `stateStart := now`, `shapeIdx := shapes.length - 1` (so the first recurring shape after drift is `shapes[0]`) | — |

**Setup at construction:** before `rocket-fly` begins, the sequencer writes the rocket sample into `aTarget` and the text sample into `aTargetNext`. Both samplers center their shapes at `(width/2, height/2)`.

**Total intro time:** ~4.5 s active + ~0.7 s morphOut into drift = ~5.2 s before the existing loop's first recurring shape appears.

## Error handling & edge cases

- **Font not loaded for "Hi, I'm Felipe"** — the existing `document.fonts.ready` gate covers this; `ParticleSystem` isn't constructed until fonts are ready.
- **Very narrow viewport (mobile)** — `drawText`'s existing auto-fit shrinks the font when measured width exceeds 78% of bounds. The rocket uses `sizeRatio` against `bounds.height` (like `heart`), so it scales down on small screens. No special-case code.
- **Tab hidden during intro** — `ParticleSystem.pause()` cancels the RAF; `resume()` already shifts the loop's `stateStart` by `now - lastTickAt` to absorb the gap. The sequencer holds its own `phaseStart` field, and `resume()` is extended to apply the same shift to `phaseStart` when the intro is active. This way the next `tick()` sees the same `elapsed` it would have seen if the tab had never hidden.
- **`ResizeObserver` fires mid-intro** — re-sample both target slots from their current shape specs at the new bounds; don't rewind phase progress.
- **Reduced motion** — already handled: `ParticleField` returns null before constructing the system. Intro included.
- **Intro RAF starved indefinitely** — particles hold the last rendered state. Same failure mode as the existing system stalling mid-morph. No crash, no special handling.

## Testing

This is a visual feature with no existing unit tests in `src/components/Hero/particles/`. Verification is primarily manual.

- **Manual smoke**: `npm run dev`, load `/`, confirm sequence: rocket flies in from left → cross-morphs to "Hi, I'm Felipe" at center → holds → dissolves into drift → Felipe / FF. / heart cycle resumes. Reload several times to confirm consistency.
- **Typecheck / lint**: existing project commands run clean.
- **Reduced-motion check**: DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Particle field should not render at all (existing behavior preserved end-to-end).
- **Resize during intro**: drag the window during the first 5 s; intro should adapt without crashing or visual glitch (no jumps, no missing rocket).
- **Recurring loop regression**: after the intro completes, Felipe / FF. / heart cycle should run with today's timings unchanged.

Optional: a small Vitest file for `IntroSequencer.tick()` treating it as a pure function of `(elapsed, bounds)` returning a uniforms snapshot. Not required.

## Risks

- **Shader regression** — adding an attribute and three uniforms is a small but non-zero risk of breaking the existing render. Mitigation: the new uniforms all default to identity values (`uTargetBlend=0`, `uTargetOffset=(0,0)`, `uMorphSmear=0`), so when the sequencer is not running, the math collapses to the current behavior.
- **Rocket art subjective** — the inline SVG path may need iteration to look good. The `sizeRatio` is exposed as a config knob so it's tweakable without code changes to the sampler.
- **Mobile performance** — adding one attribute (~96 KB per 12k particles) is negligible. The morphSmear branch is a `clamp`+`mix` — single-digit GPU cycles per vertex. No expected impact.

## Open questions

None at design time. Concrete tuning (exact `sizeRatio`, exhaust smear amount, bob frequency) will be adjusted by eye during implementation.
