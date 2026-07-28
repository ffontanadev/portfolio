# Particle Walkthrough Tour — Design

**Date:** 2026-07-12
**Status:** Approved (pending spec review)
**Author:** Felipe Fontana (with Claude)

## Summary

Add a one-time, first-visit **guided walkthrough** to the homepage: a small "comet"
of particles that travels a path down the page and orbits key interactive features
to make them discoverable. The flagship target is the tech-stack selector in the
brand marquee — clicking a rotating logo forms it in the hero with a brief, a
feature that is currently invisible unless you already know it exists.

The existing hero particle field (a GPU/Three.js system bound to the hero section)
is **not touched**. The walkthrough is a separate, self-contained, lightweight
Canvas 2D overlay that spans the whole viewport.

## Goals

- Reveal otherwise-undiscoverable interactions (primarily the tech-stack selector).
- Feel like a natural extension of the hero particle language, not a generic tooltip tour.
- Run once per visitor, unobtrusively, and never nag repeat visitors.
- Stay completely decoupled from the hero engine.

## Non-Goals

- No changes to the hero `ParticleField` / `ParticleSystem` behavior or appearance.
- No auto-triggering of the features themselves (the tour points and captions; it
  does not click logos or open modals).
- No mobile/touch cinematic tour in this iteration (see Edge Cases).

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Lifecycle | One-time on first visit, remembered via `localStorage`, replayable |
| Scroll control | Cinematic — the tour drives scroll; aborts on any manual input |
| Stops | Tech-stack selector → Featured project cards → How-I-Work-With-Agents → Dev-Zone nav link (top-to-bottom order) |
| At each stop | Orbit the feature + show a small i18n caption naming the action (no auto-demo) |
| Guide form | A comet: bright head + fading trail, reusing the hero palette |

## Architecture

New module: `src/components/PageTour/`

| File | Responsibility |
|---|---|
| `PageTour.tsx` | Gating (should the tour run?), mounts the fixed `<canvas>` + caption layer + skip pill, owns lifecycle, wires React state ↔ controller via callbacks |
| `tourStops.ts` | Ordered stop config (see below) |
| `TourController.ts` | Framework-agnostic class: the `requestAnimationFrame` loop, the per-stop state machine, and scroll orchestration; drives the renderer and emits caption/skip state through callbacks |
| `cometRenderer.ts` | Canvas 2D drawing: comet head, fading trail buffer, orbit swirl, palette |
| `tourMotion.ts` | Pure math: easings, approach bezier, orbit position, trail ring-buffer |
| `useFirstVisit.ts` | `localStorage` first-visit flag helper |

Mount point: **once inside `HomePage`** (`src/pages/HomePage.tsx`), so it only exists
on the `/` route. It queries the DOM globally (`document.querySelector`), so it can
still orbit the Dev-Zone link that lives in `Navigation` (rendered outside HomePage).

Overlay element: `position: fixed; inset: 0; pointer-events: none;` with a z-index
above page content but below any modal/overlay (the project's `ProjectPreviewModal`).
All motion is computed in **viewport coordinates** because the canvas is fixed;
target positions come from `getBoundingClientRect()`.

### `tourStops.ts` shape

```ts
interface TourStop {
  id: 'techStack' | 'featuredWorks' | 'agents' | 'devZone';
  selector: string;              // resolved at runtime via document.querySelector
  captionKey: string;            // i18n key, e.g. 'tour.stops.techStack'
  orbit: { radius: number; revolutions: number };
  captionPlacement: 'top' | 'bottom' | 'left' | 'right';
  scrollAlign: 'center' | 'start'; // where in the viewport to bring the target
}
```

Ordered stops and their anchors:

1. `techStack` → logos row in `BrandMarquee.tsx` (`[data-tour-id="tech-stack"]`)
2. `featuredWorks` → first project card / grid in `FeaturedWorks.tsx` (`[data-tour-id="featured-works"]`)
3. `agents` → focal element in `HowIWorkWithAgents.tsx` (`[data-tour-id="agents"]`)
4. `devZone` → desktop nav link in `Navigation.tsx` (`[data-tour-id="dev-zone"]`)

If a selector fails to resolve at runtime (e.g., element not yet mounted or hidden),
that stop is skipped gracefully and the tour continues to the next one.

## Motion & State Model

The controller walks the ordered stops. Per stop, the sub-states are:

```
scroll → approach → orbit → hold → depart
```

- **scroll** — a self-driven scroll tween (`window.scrollTo` per frame,
  easeInOutCubic, ~1.0s) rather than native `scroll-behavior: smooth`, so the tour
  knows exactly when the scroll settles and can let the comet lead while the page
  catches up. Target Y = element top − desired viewport offset (per `scrollAlign`).
- **approach** — the comet head flies along an eased quadratic/cubic bezier arc from
  its current position to the target's on-screen point (rect center + placement
  offset). The control point offsets the arc so the path curves gracefully.
- **orbit** — the head revolves ~`revolutions` times around the target point
  (`center + radius·(cosθ, sinθ)`, θ advancing); the trail forms a glowing ring; the
  caption fades in. The target rect is re-sampled each frame so the orbit stays
  centered if layout nudges.
- **hold** — a readable beat with the ring + caption held.
- **depart** — caption fades out; the comet peels off in the direction of the next
  target.

Overall lifecycle:

```
idle → intro-delay → [ per stop: scroll → approach → orbit → hold → depart ] → finish → done
```

`finish` dissolves the comet off-screen and sets the seen flag. `done` stops the rAF
loop and detaches all listeners (no lasting cost).

### The comet

- A bright head made of a few particles, plus a ring-buffer of recent head positions
  (~last 24 frames) drawn as fading, shrinking dots.
- ~12–20 particles total, colored from the hero palette: `#FF6B6B` (coral),
  `#00D9A3` (teal), `#9D4EDD` (purple).
- Canvas sized to `viewport × devicePixelRatio` (clamped to 2), with resize handling.

## Cinematic Scroll + Instant Yield

While the tour drives scroll, a `programmaticScroll` flag is set so the tour ignores
the scroll events it generates. Listeners for genuine user intent trigger an
**abort**:

- `wheel`, `touchmove`, `keydown` (Arrow keys, Space, PageUp/PageDown, Home/End), and `Esc`.
- A persistent small **"Skip tour"** pill (bottom-right, `pointer-events: auto`) and
  clicking it.

Abort behavior: stop the scroll tween, fade out comet + caption, set the seen flag,
detach every listener, stop the rAF loop. The tour never fights the user.

## Captions (i18n)

Each stop shows a small DOM chip positioned near the feature (not under the comet):
a soft card with a coral left-accent and a small arrow pointing at the target,
fading/sliding in. Copy is added under a new `tour` namespace in all four locales
(`en`, `es`, `pt`, `zh`):

- `tour.skip` — the skip pill label
- `tour.replay` — the footer replay label
- `tour.stops.techStack` — e.g. "Click a logo to watch it form in the hero."
- `tour.stops.featuredWorks` — e.g. "Open a project for the full case study."
- `tour.stops.agents` — e.g. "How I build with AI agents, end to end."
- `tour.stops.devZone` — e.g. "Step into the Dev Zone — a hidden interactive desk."

English copy is authored here; the other three locales are translated and can be
refined by the author.

## Gating (should the tour auto-run?)

All must be true:

- First visit: `localStorage['ff.tour.v1.seen']` is not set.
- `PARTICLES_ENABLED` is true (`src/config/particles`).
- `prefers-reduced-motion` is not set.
- Desktop: pointer is fine and viewport width ≥ 1024px.

Start timing: the tour begins after the hero intro settles — a fixed delay of
`INTRO_TOTAL_S` (≈4.8s, per `Hero.tsx` / `IntroSequencer`) plus a short beat — so it
never collides with the rocket intro.

## Edge Cases

- **Reduced motion** → the auto-tour does not run (consistent with the hero).
- **Mobile / touch / narrow (<1024px)** → does not run; a cinematic scroll hijack is
  hostile on touch. Mobile users keep the standard experience. (Chosen default; can
  revisit with a mobile-specific design later.)
- **Particles disabled** → does not run.
- **Route change** → only mounted on `/`; navigating away tears it down.
- **Unresolvable target** → that stop is skipped; the tour continues.
- **Window resize mid-tour** → canvas resizes; rects are re-sampled each frame.

## Replay

A subtle "Replay guided tour" text button in the `Footer` clears the seen flag and
restarts the tour from the top. (Chosen default; footer keeps it out of the way.)

## Testing

- **Unit** — `tourMotion` math (easings, bezier point, orbit position, ring-buffer),
  `useFirstVisit` (localStorage set/get/clear), `tourStops` integrity (all selectors
  resolve against a rendered homepage).
- **Controller** — state transitions with mocked time and mocked `getBoundingClientRect`.
- **Manual / E2E** — via the existing Playwright tooling: fresh load with cleared
  storage → assert the page scrolls and captions appear in order; dispatch a `wheel`
  event → assert the tour aborts and the seen flag is set; reload → assert the tour
  does not run.

## Files Touched

New:
- `src/components/PageTour/PageTour.tsx`
- `src/components/PageTour/tourStops.ts`
- `src/components/PageTour/TourController.ts`
- `src/components/PageTour/cometRenderer.ts`
- `src/components/PageTour/tourMotion.ts`
- `src/components/PageTour/useFirstVisit.ts`

Existing (small edits):
- `src/pages/HomePage.tsx` — mount `<PageTour />`
- `src/components/BrandMarquee.tsx` — add `data-tour-id="tech-stack"`
- `src/components/FeaturedWorks.tsx` — add `data-tour-id="featured-works"`
- `src/components/HowIWorkWithAgents.tsx` — add `data-tour-id="agents"`
- `src/components/Navigation.tsx` — add `data-tour-id="dev-zone"`
- `src/components/Footer.tsx` — add "Replay guided tour" trigger
- `src/i18n/locales/{en,es,pt,zh}.json` — add the `tour` namespace

## Risks & Mitigations

- **Scroll-hijack feels intrusive** → mitigated by instant yield on any input, a
  persistent skip pill, one-time-only, and desktop-only gating.
- **Anchor drift if sections are reordered/renamed** → stops resolve by
  `data-tour-id`, not by DOM position; missing anchors are skipped, not fatal.
- **Second render loop cost** → negligible (~12–20 particles), and the loop fully
  stops on finish/abort.
- **z-index collisions with the project modal** → overlay z-index sits below modal
  layers; the tour targets are homepage sections, not modal content.
