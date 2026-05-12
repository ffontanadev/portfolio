# Rocket → "Hi, I'm Felipe" Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current static-position particle shape morph intro with a cinematic one-time sequence: a particle-formed rocket flies from off-screen left to center, then cross-morphs into the text "Hi, I'm Felipe" before handing off to the existing recurring shape loop.

**Architecture:** Add a new `IntroSequencer` that runs once on `ParticleSystem` construction, gated by an `introActive` flag. The sequencer drives three new shader uniforms (`uTargetBlend`, `uTargetOffset`, `uMorphSmear`) and one new attribute (`aTargetNext`) to (a) translate a centered rocket shape across screen via offset, (b) cross-morph from rocket to text via a second target slot, and (c) produce an exhaust trail naturally through per-particle morph staggering. When the sequencer reports `done`, the existing loop state machine takes over starting in `morphOut` so the held text dissolves into drift.

**Tech Stack:** TypeScript, React 19, Three.js (raw WebGL via `ShaderMaterial`), Vite, no test framework. Verification is `npm run build` (tsc + vite build), `npm run lint`, and manual visual checks via `npm run dev`.

**Spec reference:** `docs/superpowers/specs/2026-05-11-rocket-hi-felipe-intro-design.md`

---

## File Structure

**New files:**
- `src/components/Hero/particles/rocketPath.ts` — inline rocket SVG path data + `drawRocket(ctx, spec, bounds)` helper
- `src/components/Hero/particles/IntroSequencer.ts` — `IntroSequencer` class, owns the four-phase intro state machine

**Modified files:**
- `src/components/Hero/particles/shapeSampler.ts` — extend `ShapeSpec` union with `rocket`, route to `drawRocket`
- `src/components/Hero/particles/shaders.ts` — add one attribute and three uniforms, update vertex math
- `src/components/Hero/particles/ParticleSystem.ts` — register new attribute and uniforms, add `applyTargetTo` helper, hold optional `intro: IntroSequencer | null`, branch `tick()` based on `introActive`, integrate intro into `resize` / `pause` / `resume`
- `src/components/Hero/ParticleField.tsx` — supply `intro: { rocket, text }` config to `ParticleSystem`

**Boundary discipline:** the rocket art lives in its own file (`rocketPath.ts`). The intro sequencer is fully separated from the loop state machine. The shader uniforms default to identity values, so when the sequencer is not running, the system collapses to current behavior.

---

## Task 1: Add rocket art + extend shape sampler

**Files:**
- Create: `src/components/Hero/particles/rocketPath.ts`
- Modify: `src/components/Hero/particles/shapeSampler.ts`

- [ ] **Step 1: Create `rocketPath.ts`**

Create the file with the rocket path data and a draw helper. The path is defined in a 100×100 unit space with the rocket pointing right (nose at higher x). `drawRocket` scales the path against `bounds.height * sizeRatio` and centers it at the canvas mid-point. The `ctx.fillStyle = '#000'` is already set by `sampleShape` before calling shape drawers, so we just need to fill the path.

```ts
// src/components/Hero/particles/rocketPath.ts
import type { SampleBounds } from './shapeSampler';

// Rocket silhouette pointing right, drawn in a 100x100 unit grid.
// Layout: body spans x=25..70, nose tip at x=95, fins protrude to x=5.
// Vertical extent is roughly y=20..80 (height ~60 units in path space).
// Treating the path's vertical extent as 60, sizeRatio scales it to bounds.height.
export const ROCKET_PATH_HEIGHT_UNITS = 60;

// Single closed body+fins path. Uses absolute moveto/lineto commands.
const ROCKET_BODY = 'M70 40 L95 50 L70 60 L28 60 L5 78 L18 55 L18 50 L18 45 L5 22 L28 40 Z';

// Small porthole — separately added so the dark pixel sampler picks it up.
const ROCKET_PORTHOLE = 'M58 50 a 4 4 0 1 1 -8 0 a 4 4 0 1 1 8 0 Z';

export interface RocketSpec {
  kind: 'rocket';
  sizeRatio?: number;
}

export function drawRocket(
  ctx: CanvasRenderingContext2D,
  spec: RocketSpec,
  bounds: SampleBounds,
) {
  const sizeRatio = spec.sizeRatio ?? 0.28;
  const targetHeight = bounds.height * sizeRatio;
  const scale = targetHeight / ROCKET_PATH_HEIGHT_UNITS;

  // Center the path's 100-unit width around the canvas center.
  const tx = bounds.width / 2 - 50 * scale;
  const ty = bounds.height / 2 - 50 * scale;

  ctx.save();
  ctx.translate(tx, ty);
  ctx.scale(scale, scale);

  const body = new Path2D(ROCKET_BODY);
  ctx.fill(body);

  const porthole = new Path2D(ROCKET_PORTHOLE);
  // Cut the porthole out so the sampler treats it as empty (white).
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fill(porthole);
  ctx.restore();

  ctx.restore();
}
```

- [ ] **Step 2: Extend `ShapeSpec` union and route to `drawRocket`**

Edit `src/components/Hero/particles/shapeSampler.ts`. Add the rocket variant to the union and dispatch in `sampleShape`.

Replace the type union at the top:

```ts
// Old:
// export type ShapeSpec =
//   | { kind: 'text'; text: string; fontFamily?: string; weight?: number; heightRatio?: number }
//   | { kind: 'heart'; sizeRatio?: number };

// New:
export type ShapeSpec =
  | { kind: 'text'; text: string; fontFamily?: string; weight?: number; heightRatio?: number }
  | { kind: 'heart'; sizeRatio?: number }
  | { kind: 'rocket'; sizeRatio?: number };
```

Add the import for the helper near the top of the file:

```ts
import { drawRocket } from './rocketPath';
```

Replace the dispatch block inside `sampleShape`:

```ts
// Old:
// if (spec.kind === 'text') {
//   drawText(ctx, spec, bounds);
// } else {
//   drawHeart(ctx, spec, bounds);
// }

// New:
if (spec.kind === 'text') {
  drawText(ctx, spec, bounds);
} else if (spec.kind === 'heart') {
  drawHeart(ctx, spec, bounds);
} else {
  drawRocket(ctx, spec, bounds);
}
```

- [ ] **Step 3: Verify build + lint pass**

Run: `npm run build`
Expected: clean (no TS or vite errors).

Run: `npm run lint`
Expected: clean (or only pre-existing warnings unrelated to these files).

- [ ] **Step 4: Sanity-check the rocket renders (temporary)**

Temporarily replace one entry of `DEFAULT_SHAPES` in `src/components/Hero/ParticleField.tsx` with `{ kind: 'rocket', sizeRatio: 0.28 }` to confirm the sampler produces a recognizable rocket shape.

Run: `npm run dev`
Open the dev URL, wait for the shape cycle, expected: at the position formerly occupied by the substituted shape, particles form a rocket silhouette (nose pointing right, fins to the left, small porthole gap visible).

Revert the temporary `DEFAULT_SHAPES` change before committing.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero/particles/rocketPath.ts src/components/Hero/particles/shapeSampler.ts
git commit -m "feat(hero/particles): add rocket shape to shape sampler"
```

---

## Task 2: Add new attribute and uniforms to shader + particle system

This task is **plumbing only** — it threads new shader inputs through, but the new uniforms default to identity values (`uTargetBlend=0`, `uTargetOffset=(0,0)`, `uMorphSmear=0`) so visual behavior is unchanged. We verify the visual is unchanged at the end of the task before moving on.

**Files:**
- Modify: `src/components/Hero/particles/shaders.ts`
- Modify: `src/components/Hero/particles/ParticleSystem.ts`

- [ ] **Step 1: Update vertex shader**

Edit `src/components/Hero/particles/shaders.ts`. Add the new attribute and uniform declarations in the vertex shader, and update the position math.

Add inside the vertex shader's declaration block (after `attribute vec3 aColor;`):

```glsl
  attribute vec2  aTargetNext;
```

Add inside the uniform block (after `uniform float uMorph;`):

```glsl
  uniform float uTargetBlend;   // 0 = aTarget, 1 = aTargetNext
  uniform vec2  uTargetOffset;  // CSS px shift applied to the active target
  uniform float uMorphSmear;    // 0..1 per-particle morph stagger
```

Replace the existing `pos` calculation block. Old:

```glsl
    // Lerp toward shape target.
    vec2 pos = mix(driftPos, aTarget, uMorph);
```

New:

```glsl
    // Blend between primary and next target, then translate.
    vec2 target = mix(aTarget, aTargetNext, uTargetBlend) + uTargetOffset;
    // Per-particle morph stagger — particles with high aSeed lag, producing
    // a natural trail/exhaust effect during the intro.
    float pMorph = clamp(uMorph - (1.0 - aSeed) * uMorphSmear, 0.0, 1.0);
    vec2 pos = mix(driftPos, target, pMorph);
```

Also update the size calculation to use `pMorph` for consistency (so trailing particles stay smaller while they're still mostly in drift), replace:

```glsl
    float baseSize = mix(1.15, 2.4, uMorph);
```

with:

```glsl
    float baseSize = mix(1.15, 2.4, pMorph);
```

And update the color/alpha mixes the same way — replace:

```glsl
    vec3 base = mix(uDriftColor, uShapeColor, uMorph);
    vColor = mix(base, aColor, 0.22);

    // Alpha: low in drift, higher in shape. Per-particle seed gives a subtle haze.
    float alpha = mix(uDriftAlpha, uShapeAlpha, uMorph);
```

with:

```glsl
    vec3 base = mix(uDriftColor, uShapeColor, pMorph);
    vColor = mix(base, aColor, 0.22);

    // Alpha: low in drift, higher in shape. Per-particle seed gives a subtle haze.
    float alpha = mix(uDriftAlpha, uShapeAlpha, pMorph);
```

- [ ] **Step 2: Register new uniforms in `ParticleSystem` material**

Edit `src/components/Hero/particles/ParticleSystem.ts`. In the `ShaderMaterial` constructor inside `ParticleSystem`'s constructor, add three new uniform entries.

Find the `uniforms:` block (around line 83) and add these entries — they can go right after `uMorph`:

```ts
        uTargetBlend: { value: 0 },
        uTargetOffset: { value: new THREE.Vector2(0, 0) },
        uMorphSmear: { value: 0 },
```

The complete updated `uniforms` block should look like:

```ts
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uTargetBlend: { value: 0 },
        uTargetOffset: { value: new THREE.Vector2(0, 0) },
        uMorphSmear: { value: 0 },
        uCursor: { value: new THREE.Vector2(-9999, -9999) },
        uCursorForce: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uDpr: { value: 1 },
        uDriftColor: { value: opts.driftColor.clone() },
        uShapeColor: { value: opts.shapeColor.clone() },
        uDriftAlpha: { value: opts.driftAlpha ?? 0.18 },
        uShapeAlpha: { value: opts.shapeAlpha ?? 0.72 },
      },
```

- [ ] **Step 3: Allocate `aTargetNext` buffer attribute**

In `initAttributes` of `ParticleSystem.ts`, add a `targetsNext` Float32Array right after `targets`, initialize it as a copy of `targets`, and register it as the `aTargetNext` attribute.

Find this section:

```ts
    const targets = new Float32Array(N * 2);
```

Add right below it:

```ts
    const targetsNext = new Float32Array(N * 2);
```

In the per-particle loop, after the line `targets[i * 2 + 1] = homes[i * 2 + 1];`, add:

```ts
      targetsNext[i * 2] = homes[i * 2];
      targetsNext[i * 2 + 1] = homes[i * 2 + 1];
```

At the bottom of the function, after the existing `this.geometry.setAttribute('aTarget', ...)` line, add:

```ts
    this.geometry.setAttribute('aTargetNext', new THREE.BufferAttribute(targetsNext, 2));
```

- [ ] **Step 4: Verify visual is unchanged**

Run: `npm run build`
Expected: clean.

Run: `npm run dev`
Open the dev URL. Expected: the particle field looks **identical** to before this task — drift, morph to Felipe, hold, drift, morph to FF., etc. No visual regression.

If there is any visual regression, the most likely cause is a typo in the GLSL `pMorph` line. Re-check that all four `mix(... , uMorph)` callsites in the vertex shader were updated to use `pMorph`.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero/particles/shaders.ts src/components/Hero/particles/ParticleSystem.ts
git commit -m "feat(hero/particles): add aTargetNext attribute and intro uniforms"
```

---

## Task 3: Add `applyTargetTo` helper

The existing `applyShapeTarget` writes to `aTarget` only. Generalize it so the sequencer can write to either slot.

**Files:**
- Modify: `src/components/Hero/particles/ParticleSystem.ts`

- [ ] **Step 1: Replace `applyShapeTarget` with a parameterized helper**

In `src/components/Hero/particles/ParticleSystem.ts`, find this method:

```ts
  private applyShapeTarget(shape: ShapeSpec) {
    const attr = this.geometry.getAttribute('aTarget') as THREE.BufferAttribute;
    const next = sampleShape(shape, this.particleCount, this.bounds);
    (attr.array as Float32Array).set(next);
    attr.needsUpdate = true;
  }
```

Replace with:

```ts
  private applyTargetTo(slot: 'aTarget' | 'aTargetNext', shape: ShapeSpec) {
    const attr = this.geometry.getAttribute(slot) as THREE.BufferAttribute;
    const next = sampleShape(shape, this.particleCount, this.bounds);
    (attr.array as Float32Array).set(next);
    attr.needsUpdate = true;
  }
```

- [ ] **Step 2: Update existing callsites**

Find both callsites of `this.applyShapeTarget(...)` in `ParticleSystem.ts`:

- In `resize()`: `this.applyShapeTarget(this.shapes[this.shapeIdx]);`
- In `stepStateMachine()` (the `drift` case): `this.applyShapeTarget(this.shapes[this.shapeIdx]);`

Replace both with:

```ts
this.applyTargetTo('aTarget', this.shapes[this.shapeIdx]);
```

- [ ] **Step 3: Verify build + visual unchanged**

Run: `npm run build`
Expected: clean.

Run: `npm run dev`
Expected: still no visual change vs. before this task. The shape cycle works as today.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero/particles/ParticleSystem.ts
git commit -m "refactor(hero/particles): parameterize target slot writer"
```

---

## Task 4: Implement `IntroSequencer`

**Files:**
- Create: `src/components/Hero/particles/IntroSequencer.ts`

- [ ] **Step 1: Create the sequencer skeleton**

Create `src/components/Hero/particles/IntroSequencer.ts` with the full class. The sequencer takes a small adapter object so it can write to target slots and uniforms without holding a direct reference to `ParticleSystem` (keeps the dependency one-way).

```ts
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
  rocketFly: 2.0,
  crossMorph: 1.0,
  textHold: 1.5,
};

const SMEAR_AMOUNT = 0.35;

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

    // Initial uniform state: drift (uMorph=0), no blend, far-left offset, full smear.
    this.adapter.uniforms.uMorph.value = 0;
    this.adapter.uniforms.uTargetBlend.value = 0;
    this.adapter.uniforms.uMorphSmear.value = SMEAR_AMOUNT;
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
    const elapsed = (nowMs - this.phaseStart) / 1000;

    if (this.phase === 'rocket-fly') {
      const dur = this.timings.rocketFly;
      const t = Math.min(elapsed / dur, 1);
      const eased = easeOutCubic(t);

      // X offset: -width*0.6 → 0
      const startX = -this.adapter.bounds.width * 0.6;
      u.uTargetOffset.value.x = startX + (0 - startX) * eased;
      // Y bob: live sine, ~4.5 rad/s.
      u.uTargetOffset.value.y = Math.sin(elapsed * 4.5) * 8;

      // uMorph ramps from 0 to 1 in the first 600 ms, then holds.
      const morphT = Math.min(elapsed / 0.6, 1);
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
```

- [ ] **Step 2: Verify the file type-checks**

Run: `npm run build`
Expected: clean. (Nothing imports `IntroSequencer` yet, so this only validates the file in isolation.)

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero/particles/IntroSequencer.ts
git commit -m "feat(hero/particles): add IntroSequencer for rocket→text intro"
```

---

## Task 5: Wire the intro into `ParticleSystem`

**Files:**
- Modify: `src/components/Hero/particles/ParticleSystem.ts`

- [ ] **Step 1: Add `intro` to `ParticleSystemOptions` and import the sequencer**

At the top of `src/components/Hero/particles/ParticleSystem.ts`, add the import:

```ts
import { IntroSequencer, type IntroShapes, type IntroTimings } from './IntroSequencer';
```

Extend `ParticleSystemOptions`:

```ts
export interface ParticleSystemOptions {
  canvas: HTMLCanvasElement;
  particleCount: number;
  shapes: ShapeSpec[];
  driftColor: THREE.Color;
  shapeColor: THREE.Color;
  accentColors: THREE.Color[];
  driftAlpha?: number;
  shapeAlpha?: number;
  timings?: Partial<StateTimings>;
  intro?: IntroShapes;
  introTimings?: Partial<IntroTimings>;
}
```

- [ ] **Step 2: Add the `intro` field and `copyNextIntoPrimary` helper**

In the `ParticleSystem` class body, add a private field next to the other state fields (e.g., near `private shapeIdx = 0;`):

```ts
  private intro: IntroSequencer | null = null;
  private introOpts: { shapes: IntroShapes; timings?: Partial<IntroTimings> } | null = null;
```

In the constructor, after `this.timings = { ...DEFAULT_TIMINGS, ...opts.timings };`, capture the intro config:

```ts
    if (opts.intro) {
      this.introOpts = { shapes: opts.intro, timings: opts.introTimings };
    }
```

Add a private helper method next to `applyTargetTo`:

```ts
  private copyNextIntoPrimary() {
    const primary = this.geometry.getAttribute('aTarget') as THREE.BufferAttribute;
    const next = this.geometry.getAttribute('aTargetNext') as THREE.BufferAttribute;
    (primary.array as Float32Array).set(next.array as Float32Array);
    primary.needsUpdate = true;
  }
```

- [ ] **Step 3: Construct the sequencer after attributes are initialized**

The sequencer needs `bounds` and the geometry attributes to exist. The right place is at the end of `resize()`, just after the first-time `initAttributes()` call.

Find this block in `resize()`:

```ts
    if (!this.initialized) {
      this.initAttributes();
      this.initialized = true;
    } else {
      this.resampleHomes();
    }
    // Always refresh the active shape's target for the new bounds.
    this.applyTargetTo('aTarget', this.shapes[this.shapeIdx]);
```

Replace with:

```ts
    if (!this.initialized) {
      this.initAttributes();
      this.initialized = true;

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
              uMorphSmear: this.material.uniforms.uMorphSmear as { value: number },
            },
            bounds: this.bounds,
          },
          this.introOpts.shapes,
          performance.now(),
          this.introOpts.timings,
        );
      }
    } else {
      this.resampleHomes();
      // Resampling targets must reflect intro state, not the loop shape.
      if (this.intro && !this.intro.done) {
        this.intro.applyResize();
        return;
      }
    }
    // Loop path: refresh the active shape's target for the new bounds.
    this.applyTargetTo('aTarget', this.shapes[this.shapeIdx]);
```

- [ ] **Step 4: Branch `tick()` between intro and loop**

Find the `tick` method:

```ts
  private tick = () => {
    const now = performance.now();
    const time = (now - this.startTime) / 1000;
    this.lastTickAt = now;

    const morph = this.stepStateMachine(now);

    // Smooth cursor force ...
```

Replace the `const morph = this.stepStateMachine(now);` line with:

```ts
    let morph: number;
    if (this.intro && !this.intro.done) {
      this.intro.tick(now);
      morph = this.material.uniforms.uMorph.value as number;
    } else {
      if (this.intro && this.intro.done) {
        // First frame after intro: prime the loop into morphOut so the held
        // text dissolves into drift, then advance through shapes[0] first.
        this.intro = null;
        this.state = 'morphOut';
        this.stateStart = now;
        this.shapeIdx = this.shapes.length - 1;
      }
      morph = this.stepStateMachine(now);
    }
```

- [ ] **Step 5: Shift the sequencer clock on resume**

Find `resume()`:

```ts
  resume() {
    if (this.rafId === null && this.initialized) {
      const now = performance.now();
      this.stateStart += now - this.lastTickAt;
      this.tick();
    }
  }
```

Replace with:

```ts
  resume() {
    if (this.rafId === null && this.initialized) {
      const now = performance.now();
      const delta = now - this.lastTickAt;
      this.stateStart += delta;
      if (this.intro && !this.intro.done) {
        this.intro.shiftClock(delta);
      }
      this.tick();
    }
  }
```

- [ ] **Step 6: Verify build + lint**

Run: `npm run build`
Expected: clean.

Run: `npm run lint`
Expected: clean (or pre-existing warnings only).

The intro is wired up, but `ParticleField.tsx` does not yet pass an `intro` config, so visual behavior is still unchanged.

- [ ] **Step 7: Commit**

```bash
git add src/components/Hero/particles/ParticleSystem.ts
git commit -m "feat(hero/particles): integrate IntroSequencer into ParticleSystem"
```

---

## Task 6: Pass intro config from `ParticleField` + final verification

**Files:**
- Modify: `src/components/Hero/ParticleField.tsx`

- [ ] **Step 1: Add intro config and pass it to `ParticleSystem`**

Edit `src/components/Hero/ParticleField.tsx`. First, add the import for the `IntroShapes` type at the top of the file (alongside the existing `ShapeSpec` import):

```ts
import type { IntroShapes } from './particles/IntroSequencer';
```

Add a constant near the existing `DEFAULT_SHAPES`:

```ts
const INTRO_SHAPES: IntroShapes = {
  rocket: { kind: 'rocket', sizeRatio: 0.28 },
  text: { kind: 'text', text: "Hi, I'm Felipe", heightRatio: 0.32 },
};
```

In the `system = new ParticleSystem({ ... })` call inside the `useEffect`, add `intro: INTRO_SHAPES` to the options object:

```ts
      system = new ParticleSystem({
        canvas,
        particleCount: count,
        shapes: activeShapes,
        driftColor: PALETTE.drift,
        shapeColor: PALETTE.shape,
        accentColors: PALETTE.accents,
        driftAlpha: 0.16,
        shapeAlpha: 0.78,
        intro: INTRO_SHAPES,
      });
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: End-to-end manual verification**

Run: `npm run dev`. Open the dev URL in a browser. Observe the hero section on initial load.

Confirm each item in sequence:

1. Particles begin in the drift state (low-alpha haze).
2. Within ~600 ms, particles begin converging into a rocket silhouette positioned off-screen left.
3. The rocket flies right across the screen over ~2 s, with a slight vertical bob and a visible trailing exhaust of particles (caused by `uMorphSmear`).
4. Around the 2 s mark the rocket reaches the center and cross-morphs smoothly into the text "Hi, I'm Felipe".
5. The text holds for ~1.5 s.
6. The text dissolves into the drift field.
7. The existing recurring loop resumes with `Felipe` as the first shape, then `FF.`, then heart, repeating.

Reload the page several times and confirm the sequence is consistent.

- [ ] **Step 4: Reduced-motion check**

In Chrome DevTools, open Rendering panel and set "Emulate CSS media feature prefers-reduced-motion" to `reduce`. Reload.

Expected: the particle field does not render at all (the existing `useReducedMotion` early-return in `ParticleField.tsx` still applies). No JS errors in console.

- [ ] **Step 5: Resize-during-intro check**

Reload the page and drag the browser window to a different size during the first ~5 s of the intro.

Expected: rocket/text targets re-sample to the new bounds without crashing, the intro continues from the current phase elapsed time (no rewind, no jump), and the final text reads correctly at the new size.

- [ ] **Step 6: Tab-hide check**

Reload, then switch to a different tab during the rocket-fly phase for ~3 s, then return.

Expected: when returning, the intro picks up roughly where it left off (within the rocket flight) rather than time-warping ahead. The full sequence still completes and the loop takes over.

- [ ] **Step 7: Tuning pass (by eye)**

If any of these feel off, adjust the constants and reload:

- Rocket too small/large → tweak `INTRO_SHAPES.rocket.sizeRatio` in `ParticleField.tsx` (default 0.28; try 0.24–0.32).
- Text too small/wide → tweak `INTRO_SHAPES.text.heightRatio` (default 0.32; longer text fits at smaller heights).
- Exhaust trail too pronounced/faint → tweak `SMEAR_AMOUNT` in `IntroSequencer.ts` (default 0.35; try 0.2–0.5).
- Rocket bob too strong/weak → tweak the amplitude in `Math.sin(elapsed * 4.5) * 8` (the trailing `* 8`).
- Sequence feels too fast/slow → tweak `DEFAULT_TIMINGS` values in `IntroSequencer.ts` (`rocketFly`, `crossMorph`, `textHold`).

- [ ] **Step 8: Commit**

```bash
git add src/components/Hero/ParticleField.tsx
git commit -m "feat(hero): play rocket→Hi I'm Felipe intro on page load"
```

If tuning constants were also changed in step 7, include those files in the same commit:

```bash
git add src/components/Hero/ParticleField.tsx src/components/Hero/particles/IntroSequencer.ts
git commit -m "feat(hero): play rocket→Hi I'm Felipe intro on page load"
```

---

## Done

After all six tasks are complete and committed, the feature is shippable. The intro plays on every page load, takes ~5 s, hands off cleanly into the existing recurring shape cycle, and respects `prefers-reduced-motion`.
