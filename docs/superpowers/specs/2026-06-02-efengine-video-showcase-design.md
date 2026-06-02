# Design: ambient video showcase for the EFENGINE flagship banner

- **Date:** 2026-06-02
- **Branch:** `feature/efengine-webhook`
- **Status:** Approved for implementation planning

## Goal

Replace the **static** background of the efengine flagship banner in **FeaturedWorks**
with an **ambient, auto-cycling playlist of local video clips**, to make the banner feel
alive and showcase the engine in motion — while keeping the existing "EFENGINE" identity
and the rest of the section's editorial design intact.

Today the flagship band ([`FeaturedWorks.tsx`](../../../src/components/FeaturedWorks.tsx),
the flagship `<article>`) renders its background via `EnterpriseHero` (aliased to
`TypographicHero` in [`ProjectPreviewModal.tsx`](../../../src/components/ProjectPreviewModal.tsx)):
a radial cream gradient + the "EFENGINE" wordmark + a hairline + a tech-stack line — fully
static.

## Decisions taken during brainstorming

| Decision | Choice | Rationale |
| --- | --- | --- |
| Video source | **Local `.mp4` files in the repo** (`public/videos/efengine/`) | Full visual control, no third-party player chrome/branding |
| Playback | **Ambient**: autoplay, muted, `playsInline`, loop the *playlist*, auto-advance, no controls | Keeps the calm, cinematic, editorial feel of the section |
| Overlay | **Keep** the "EFENGINE" wordmark + tech-stack line on top of the video, with a legibility scrim | Preserves brand identity and typographic consistency |
| Reduced motion / no clips / error / loading | **Fall back to the existing static `TypographicHero`** | Zero new assets, guaranteed-good accessible fallback, never a broken state |
| Scope | The **efengine flagship band only**; mechanism is reusable but nothing else opts in | YAGNI |

## Architecture

A new isolated component, **`VideoShowcaseHero`**, owns all video and playlist logic. It is
rendered **in place of** the static hero in the flagship band, but **only** when the project
declares showcase clips. Everything else — the five other project cards, the modal, and the
static hero used everywhere else — is untouched.

```
flagship <article> (FeaturedWorks.tsx)
  └─ banner container (aspect 21/9 → 3:1, rounded, overflow-hidden)
       ├─ showcaseVideos?.length
       │     ? <VideoShowcaseHero project videos size="modal" />
       │     : <EnterpriseHero project size="modal" />   (unchanged)
       ├─ hover wash (unchanged)
       └─ arrow chip (unchanged)
```

### Shared overlay (small refactor, no behavior change)

To keep the typography identical between the static and video heroes, the centered content
of `TypographicHero` is extracted into a shared piece:

- **`HeroOverlayContent`** — the centered wordmark / logo / lead-metric + hairline + tech-stack
  line (the existing inner block of `TypographicHero`).
- `TypographicHero` keeps rendering **exactly as today**: radial cream gradient background +
  `HeroOverlayContent`. Its public API (`{ project, size }`) and the `EnterpriseHero` alias
  are unchanged.

This is a pure extraction — the static hero renders byte-for-byte the same output; it just
now composes a named sub-component that `VideoShowcaseHero` can reuse.

## New / changed files

### New: `src/components/VideoShowcaseHero.tsx`

Props: `{ project: Project; videos: string[]; size?: 'card' | 'modal' }` (mirrors the
`EnterpriseHero` signature; the flagship band passes `size="modal"`).

Behavior:

- **Reduced motion** (`prefers-reduced-motion: reduce`) → returns `<TypographicHero project size />`
  and never autoplays. (Detected via a tiny `usePrefersReducedMotion` hook using
  `window.matchMedia`, SSR-safe / guarded.)
- Otherwise renders, inside a `relative w-full h-full overflow-hidden bg-cream-100` container:
  1. a **cream radial-gradient underlay** identical to the static hero's, so there is never a
     flash/black box before the first frame loads;
  2. one **`<video>`** element — `muted autoPlay playsInline loop={false} preload="metadata"`,
     `object-cover absolute inset-0`, `aria-hidden` (decorative — identity comes from the
     overlay, and there is no audio, so no captions are needed). It starts at clip index `0`.
  3. a **scrim** (subtle gradient) between video and overlay for text legibility;
  4. **`HeroOverlayContent`** on top — identical "EFENGINE" typography to the static version.
- **Auto-advance:** on the `<video>`'s `onEnded`, advance the clip index, wrapping endlessly
  (`(i + 1) % videos.length`). A single `<video>` element is reused; its `src` changes by index.
- **Fade:** the video fades in (opacity 0 → 1) once it can play (`onCanPlay`); on clip change a
  short opacity dip provides a simple cross-fade. (Single-element fade is v1; a two-element
  true cross-fade is out of scope.)
- **Offscreen pause:** uses framer-motion `useInView` (already a dependency) to `pause()` the
  video when the banner is scrolled out of view and resume when it returns — saves CPU/battery.
- **Error fallback:** on the video's `onError`, set a `failed` flag and render
  `<TypographicHero project size />` instead — the banner silently degrades to the static hero.

### Changed: `src/components/ProjectPreviewModal.tsx`

Extract `HeroOverlayContent` from `TypographicHero` and have `TypographicHero` compose it.
Export `HeroOverlayContent` so `VideoShowcaseHero` can import it. No other change; the modal,
`EnterpriseHero` alias, and all callers behave identically.

### Changed: `src/components/projectTypes.ts`

Add one optional field to `Project`:

```ts
/** Public paths to ambient showcase clips, e.g. '/videos/efengine/phase-2.mp4'. */
showcaseVideos?: string[];
```

Generic: any future project can declare `showcaseVideos` to opt into the same treatment.
`ProjectStructural` in `FeaturedWorks.tsx` is `Omit<Project, ...>` without omitting this field,
so it is inherited automatically.

### Changed: `src/components/FeaturedWorks.tsx`

- In `projectData`, on the `efengine` entry, add `showcaseVideos: ['/videos/efengine/...']`
  with the real clip paths.
- Import `VideoShowcaseHero`.
- In the flagship band, replace the single `<EnterpriseHero project={featuredProject} size="modal" />`
  with the conditional:

  ```tsx
  {featuredProject.showcaseVideos?.length
    ? <VideoShowcaseHero project={featuredProject} videos={featuredProject.showcaseVideos} size="modal" />
    : <EnterpriseHero project={featuredProject} size="modal" />}
  ```

  The surrounding hover wash, arrow chip, and click-to-open-modal stay exactly as they are.

### New assets: `public/videos/efengine/`

The author supplies the actual web-optimized clip files (`.mp4`, H.264 / AAC or no audio,
short loops). The component handles 0…n clips gracefully (0 → static fallback via the band
conditional). **No clip files are created by this plan** — only the wiring and the paths.

## Data flow

```
projectData.efengine.showcaseVideos  (structural, non-translatable)
  → merged Project (FeaturedWorks useMemo, via ...byId.efengine spread)
    → flagship band
        → showcaseVideos?.length
            ? <VideoShowcaseHero videos=… />
                → reduced motion? → <TypographicHero/> (static)
                → else → <video src={videos[index]} …/> + scrim + <HeroOverlayContent/>
                          (onEnded → index = (index+1) % n; onError → <TypographicHero/>)
            : <EnterpriseHero/> (static)
```

## Accessibility

- The video is **decorative** (`aria-hidden`), muted, with no audio track → no captions or
  transcript needed; identity is conveyed by the visible `HeroOverlayContent` text.
- `prefers-reduced-motion: reduce` fully disables autoplay and renders the static hero.
- Autoplay is reliable because the video is **muted** + `playsInline` (browser autoplay policy).

## Error handling (all paths resolve to the static hero — never a broken banner)

- **Reduced motion** → static `TypographicHero`, no video element mounted.
- **No clips configured** → band renders `EnterpriseHero` as today.
- **Video load/decode error** (`onError`) → `failed` flag → static `TypographicHero`.
- **Loading** → cream radial-gradient underlay shows until the first frame fades in.

## Verification

This repo has **no test runner** (no vitest/jest in `package.json`), and — consistent with the
prior efengine spec — adding one is out of scope. So verification is **not** TDD:

1. `npm run build` (`tsc -b` + `vite build`) — no type errors, builds clean.
2. `npm run lint` — no errors.
3. Manual browser pass (`npm run dev`):
   - clips present + motion allowed → video autoplays muted, loops, auto-advances; overlay
     wordmark + tech line readable over the scrim;
   - clicking the banner still opens the project modal; hover wash + arrow chip intact;
   - OS "reduce motion" on → banner shows the static typographic hero, no playback;
   - bad/missing clip path → banner falls back to the static hero, no broken box;
   - scroll the banner offscreen and back → playback pauses and resumes.

## Out of scope (YAGNI)

- Per-clip poster images, captions, audio, or any player controls.
- Two-element true cross-fade (single-element opacity fade is v1).
- Generalizing the feature to other projects (the field is reusable, but nothing else opts in).
- Lazy network loading strategies beyond `preload="metadata"` + offscreen pause.
- An automated test runner.
- Producing/encoding the actual video clip files (author-supplied).
