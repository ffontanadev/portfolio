# Tech Showcase — Particle Logo Mode

**Date:** 2026-06-04
**Status:** Design approved (pending written-spec review)
**Author:** Felipe Fontana (with Claude)

## Summary

Make each technology in the `BrandMarquee` stack slider selectable. Clicking a
technology smoothly scrolls back to the hero and reorganizes the existing
particle field into that technology's **logo, rendered in its real brand
colors**, while a small brief panel describes the technology. The mode is
dismissed by clicking outside the panel or pressing `Esc`, after which the
particles resume their normal ambient loop (`Felipe / FF. / heart`).

This is a progressive enhancement: when particles are disabled
(`VITE_PARTICLE_ENABLED=false`) or the user prefers reduced motion, the
technologies are simply **not interactive** (no fallback panel).

## Goals

- Each marquee technology is clickable.
- Clicking forms the brand logo out of hero particles, in the logo's real colors.
- A one-sentence brief (localized into en/es/pt/zh) accompanies the logo.
- Dismiss via click-outside or `Esc`; particles return to their loop.
- The existing ambient particle loop and intro sequence remain unchanged.

## Non-Goals

- No fallback experience for reduced-motion / particles-disabled users.
- No multi-paragraph descriptions, links, or per-tech deep pages.
- No changes to the intro sequencer or frame-animation paths.

## Decisions (from brainstorming)

| Question | Decision |
| --- | --- |
| Interaction flow | **A** — scroll to hero, particles reform there |
| Brief depth | **A** — short, one sentence (~10–15 words) per tech, all 4 languages |
| Dismiss | **B** — click outside panel or `Esc` |
| Particle color | **B** — respect real brand colors (per-particle sampled RGB) |
| Reduced-motion / disabled | **B** — technology is not clickable |
| Cross-component wiring | **Option 1** — React Context (`TechShowcaseProvider`) |

## Architecture

### Data flow

```
BrandMarquee (click) ──select(tech)──▶ TechShowcaseContext ──┐
                                                             │ selected
HomePage <main> wraps everything in TechShowcaseProvider     ▼
                                          ParticleField (in Hero) reads selected
                                          │  scroll to #hero
                                          │  loadSilhouette(logoUrl)
                                          │  sampleShapeWithColor(...)
                                          ▼
                                   ParticleSystem.showShape(spec, colors)
                                          ▲
                          BriefPanel (in Hero) renders selected.brief
                          dismiss (click-outside / Esc) ──clear()──▶ releaseShape()
```

### New / changed files

| File | Change |
| --- | --- |
| `src/components/Hero/techCatalog.ts` | **New.** Single source of truth for the tech list (`TechItem[]`). Replaces the inline `brands` array in `BrandMarquee`. |
| `src/context/TechShowcaseContext.tsx` | **New.** Provider + `useTechShowcase()` hook exposing `{ selected, select, clear }`. |
| `src/pages/HomePage.tsx` | Wrap `<main>` contents in `TechShowcaseProvider`. |
| `src/components/BrandMarquee.tsx` | Import catalog; make each logo a `<button>` that calls `select(tech)`; uses `marqueeUrl`. |
| `src/components/Hero.tsx` | Render `BriefPanel`; provide a hero ref / `id="hero"` (already present) as the scroll target. |
| `src/components/Hero/BriefPanel.tsx` | **New.** Overlay panel showing the selected tech's name + localized brief, with dismiss behavior. |
| `src/components/Hero/ParticleField.tsx` | New `useEffect` watching `selected`; loads logo, samples with color, calls `showShape` / `releaseShape`. |
| `src/components/Hero/particles/silhouetteSampler.ts` | Add color extraction during sampling. |
| `src/components/Hero/particles/shapeSampler.ts` | Add `sampleShapeWithColor(spec, count, bounds)` returning `{ positions, colors }`. |
| `src/components/Hero/particles/ParticleSystem.ts` | Add `showShape(spec, colors)` / `releaseShape()` and a `'showcase'` state. |
| `src/components/Hero/particles/shaders.ts` | Add `uBrandColorMix` uniform; widen the color-mix expression. |
| `src/i18n/locales/{en,es,pt,zh}.json` | Add `techShowcase.brief.<id>` strings and panel UI labels. |

## Component design

### `techCatalog.ts`

```ts
export interface TechItem {
  id: string;        // i18n key suffix, e.g. 'nextjs'
  name: string;      // display name, e.g. 'Next.js'
  marqueeUrl: string; // SVG shown in the marquee (current behavior)
  logoUrl: string;    // SVG that samples well as particles on the cream bg
}

export const techCatalog: TechItem[] = [ /* 23 entries */ ];
```

`marqueeUrl` keeps the current SVGs (including `_light` variants that look right
in the grayscale marquee). `logoUrl` points to a variant whose non-white pixels
form the recognizable mark on the cream hero background. For most entries
`logoUrl === marqueeUrl`; only the near-white `_light` logos need a darker/colored
substitute. Final per-tech URL selection happens during implementation and is
verified visually.

### `TechShowcaseContext.tsx`

Standard React context. `select(tech)` stores the item and is the single entry
point the marquee calls. `clear()` resets to `null`. No persistence, no URL state.

### `BriefPanel.tsx`

- Renders only when `selected !== null`.
- Position: a contained card pinned toward the lower/left area of the hero so it
  does not cover the particle logo forming in the center. Uses existing hero
  type tokens (`text-eyebrow`, `font-mono`, dark-900 palette). Fades/slides in
  via framer-motion (consistent with existing hero entrances).
- Content: technology `name` (heading) + localized one-sentence brief.
- Dismiss: a `pointerdown` listener on `document` that calls `clear()` when the
  target is outside the panel, plus a `keydown` listener for `Escape`. Both are
  attached only while a panel is open and cleaned up on close.
- Accessibility: `role="dialog"`, `aria-label` = tech name, focus moved to the
  panel on open, focus restored to a sensible element on close. (Non-modal: it
  does not trap focus, matching the lightweight click-outside dismissal.)

### Particle engine changes

**Colored sampling.** `sampleShapeWithColor` mirrors `sampleShape` but, while
collecting non-transparent / non-near-white pixels, also reads each pixel's RGB
and emits a parallel `colors` Float32Array (3 floats per particle, 0–1). The
distribute-to-count step carries the source pixel's color alongside its
position. For non-silhouette shapes (not used by this feature) color falls back
to the existing palette and the feature only calls it for `silhouette` specs.

**`showShape(spec, colors)`** on `ParticleSystem`:
1. Pause the autonomous loop (guard `stepStateMachine` while in `'showcase'`).
2. Upload sampled positions to `aTargetNext` and colors to the `aColor` buffer
   (saving the original `aColor` contents first for restoration).
3. Animate `uBrandColorMix` 0→1 and `uTargetBlend`/`uMorph` into the shape;
   enter the `'showcase'` state which holds indefinitely (ignores the clock).

**`releaseShape()`**:
1. Morph out of the shape, animate `uBrandColorMix` 1→0.
2. Restore the saved `aColor` buffer.
3. Return to `'drift'` so the normal loop resumes from the next tick.

Resize while in `'showcase'` re-samples the locked logo (analogous to the
existing `shapeMorph` resize handling) so the logo stays crisp at the new bounds.
The locked spec + its sampled colors are retained on the instance for this.

**Shader.** Add `uBrandColorMix` (default 0). Change:

```glsl
vec3 base = mix(uDriftColor, uShapeColor, pMorph);
vColor = mix(base, aColor, max(0.22, uBrandColorMix));
```

At `uBrandColorMix = 0` behavior is identical to today (0.22 palette tint). At 1
the particle shows its sampled brand color fully. The loop never raises the
uniform above 0, so the ambient animation is untouched.

### `ParticleField.tsx` wiring

A new `useEffect` keyed on `selected`:
- When `selected` becomes non-null: `loadSilhouette(selected.logoUrl)`, then
  `sampleShapeWithColor`, then `system.showShape(spec, colors)`. Guard against
  the system not yet being constructed (deferred until `ready` resolves) and
  against races where `selected` changes mid-load (cancellation flag).
- When `selected` becomes null: `system.releaseShape()`.

Because `ParticleField` builds its system inside an async `ready.then(...)`, the
showcase commands route through a small ref/queue so a selection made before the
system exists is applied once it does.

### Scroll-to-hero

`select()` (or a `useEffect` in the hero) calls
`document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })`.
Respects `prefers-reduced-motion` implicitly since the feature is inert in that
mode anyway.

## Content / i18n

New i18n keys under `techShowcase`:

```jsonc
"techShowcase": {
  "close": "Close",
  "eyebrow": "Stack · focus",
  "brief": {
    "nextjs": "React framework for production apps with hybrid rendering.",
    "supabase": "Open-source Postgres backend with auth, storage, and realtime.",
    // … one short sentence per tech id, ~10–15 words
  }
}
```

All 23 briefs authored in English first, then translated to es/pt/zh in the same
PR. The `BriefPanel` reads `t('techShowcase.brief.' + selected.id)`.

## Edge cases & error handling

- **Logo fails to load:** `loadSilhouette` rejects → log a warning, do not enter
  showcase, keep the loop running. The panel may still show the brief text.
- **Rapid re-selection:** selecting a new tech while one is shown re-samples and
  morphs directly to the new logo (no full release in between); cancellation flag
  drops stale in-flight loads.
- **Dismiss during morph-in:** `releaseShape` is safe to call mid-morph; it
  transitions to morph-out from the current blend.
- **Resize while showing:** re-sample locked logo at new bounds.
- **Tab hidden / scrolled away:** existing `IntersectionObserver` / visibility
  pause still applies; on resume the locked shape is retained.
- **Near-white logo parts:** invisible on cream by design; mitigated by choosing
  appropriate `logoUrl` variants.

## Testing

The project has **no automated test framework** and we are not introducing one
for this feature (decision: 2026-06-04). Verification relies on static checks and
a manual browser checklist:

- **Static:** `tsc -b` (type-check), `eslint .` (lint), `vite build` (build) all
  pass with no new errors.
- **Catalog integrity (manual code review):** each `TechItem` has a unique `id`,
  and every `id` has a matching `techShowcase.brief.<id>` key in all four locale
  files. A throwaway dev-time assertion may be used during implementation but no
  permanent test is added.
- **Manual / visual checklist:**
  - Clicking each of the 23 marquee items scrolls to the hero and forms a
    recognizable, correctly colored logo.
  - The brief panel shows the right localized text (spot-check across en/es/pt/zh).
  - `Esc` and click-outside dismiss the panel and the particle loop resumes.
  - Rapid re-selection morphs directly to the new logo.
  - Resize while a logo is shown keeps it crisp.
  - With `VITE_PARTICLE_ENABLED=false` and with reduced-motion, marquee items are
    not interactive.

## Rollout

Single PR. No feature flag (the mode is inert without particles already). The
existing `VITE_PARTICLE_*` env config is unaffected.
