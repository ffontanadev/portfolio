# EFENGINE Video Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static background of the efengine flagship banner in FeaturedWorks with an ambient, auto-cycling playlist of local video clips, keeping the "EFENGINE" identity overlay on top and degrading gracefully to the existing static hero.

**Architecture:** A new isolated `VideoShowcaseHero` component owns all `<video>` and playlist logic and is rendered in place of the static hero in the flagship band — but only when the project declares `showcaseVideos`. The centered identity block of the current `TypographicHero` is extracted into a shared `HeroOverlayContent` so the static and video heroes share identical typography. Reduced-motion, no-clips, and load-error all fall back to the static `TypographicHero`.

**Tech Stack:** React 19, TypeScript, Vite, framer-motion (already a dependency — `useInView`), Tailwind CSS v4, custom i18n (`@/i18n`). Path alias `@/` → `src/`.

---

## Testing note (read first)

This repo has **no test runner** (no vitest/jest in `package.json`), and — consistent with the prior efengine spec — adding one is out of scope. So this plan is **not** TDD. Each task's verification is:

- **Type check:** `npx tsc -b` → expected: no errors.
- **Lint:** `npm run lint` → expected: no errors.

Functional verification is a single **manual browser pass** in the final task. Run all commands from the repo root `d:/@ffontana/portfolio-main`.

The work happens on the existing branch `feature/efengine-webhook`. Commit after each task.

**Do not** stage or commit the untracked `src/content/` directory or `.claude/settings.local.json` — they are unrelated to this feature.

---

## File structure

**New files:**
- `src/hooks/usePrefersReducedMotion.ts` — boolean hook tracking the OS "reduce motion" setting.
- `src/components/VideoShowcaseHero.tsx` — ambient video playlist background; one responsibility.
- `public/videos/efengine/.gitkeep` — holds the clip directory in git (author supplies real clips).

**Modified files:**
- `src/components/projectTypes.ts` — add optional `showcaseVideos?: string[]` to `Project`.
- `src/components/ProjectPreviewModal.tsx` — extract `HeroOverlayContent` + `HERO_RADIAL_BG` from `TypographicHero` (pure refactor, no visual change), export both.
- `src/components/FeaturedWorks.tsx` — import `VideoShowcaseHero`; set `showcaseVideos` on efengine; conditionally render video vs static hero in the flagship band.

---

## Task 1: Add `showcaseVideos` to the Project type

**Files:**
- Modify: `src/components/projectTypes.ts`

- [ ] **Step 1: Add the field to the `Project` interface**

In `src/components/projectTypes.ts`, the `Project` interface currently ends with:

```ts
    featured?: boolean;
    phases?: ProjectPhase[];
    /** GitHub repo as "owner/name"; enables the latest-commit badge/detail. */
    repo?: string;
}
```

Change it to add the new field after `repo?`:

```ts
    featured?: boolean;
    phases?: ProjectPhase[];
    /** GitHub repo as "owner/name"; enables the latest-commit badge/detail. */
    repo?: string;
    /** Public paths to ambient showcase clips, e.g. '/videos/efengine/clip.mp4'. */
    showcaseVideos?: string[];
}
```

> No change needed to `ProjectStructural` in `FeaturedWorks.tsx`: it is `Omit<Project, ...>` without omitting `showcaseVideos`, so the field is inherited automatically.

- [ ] **Step 2: Type check**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/projectTypes.ts
git commit -m "feat: add optional showcaseVideos field to Project type

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Extract `HeroOverlayContent` from `TypographicHero`

This is a **pure refactor** — `TypographicHero` (and its `EnterpriseHero` alias) must render byte-for-byte the same output. We only pull the centered content into a reusable, exported sub-component and export the shared gradient string, so `VideoShowcaseHero` can reuse both.

**Files:**
- Modify: `src/components/ProjectPreviewModal.tsx`

- [ ] **Step 1: Replace the `TypographicHero` definition**

In `src/components/ProjectPreviewModal.tsx`, find the entire current `TypographicHero` definition (it begins with `export const TypographicHero = ({ project, size = 'modal' }: { project: Project; size?: 'card' | 'modal' }) => {` and ends just before the `// Backwards-compatible alias` comment / `export const EnterpriseHero = TypographicHero;` line).

Replace that whole block with the following (the `EnterpriseHero` alias line stays unchanged, immediately after):

```tsx
/** Radial cream wash rendered behind both the static and video heroes. */
export const HERO_RADIAL_BG =
    'radial-gradient(ellipse 60% 80% at 50% 35%, #FFF8F3, transparent 70%)';

/**
 * The centered identity block shared by the static (`TypographicHero`) and
 * video (`VideoShowcaseHero`) heroes: logo/company, lead metric, hairline, and
 * the tech-stack line. Pure presentation, no background of its own.
 */
export const HeroOverlayContent = ({
    project,
    size = 'modal',
}: {
    project: Project;
    size?: 'card' | 'modal';
}) => {
    const isModal = size === 'modal';
    const accent = accentForCategory(project.category);

    return (
        <div className={`relative h-full flex flex-col items-center justify-center ${isModal ? 'px-8 py-14' : 'px-6 py-10'}`}>
            {project.logo ? (
                (() => {
                    const Logo = LOGO_REGISTRY[project.logo];
                    const isWide = project.logo === 'banco-provincia';
                    const sizeClasses = isWide
                        ? isModal
                            ? 'h-4 mb-7 text-dark-900/85'
                            : 'h-5 mb-5 text-dark-900/85'
                        : isModal
                          ? 'h-9 mb-7 text-dark-900/85'
                          : 'h-6 mb-5 text-dark-900/85';
                    return <Logo className={`${sizeClasses} w-auto`} />;
                })()
            ) : (
                project.company && (
                    <span
                        className={`font-display font-display-italic text-dark-900/60 tracking-tight mb-3 ${
                            isModal ? 'text-2xl' : 'text-lg'
                        }`}
                        style={{ fontStyle: 'italic' }}
                    >
                        {project.company}
                    </span>
                )
            )}
            {project.leadMetric && <LeadMetricDisplay metric={project.leadMetric} size={size} />}
            <div className={`${isModal ? 'mt-8' : 'mt-5'} h-px w-12 ${accent.hairlineSoft}`} aria-hidden="true" />
            <p className={`mt-3 font-mono tracking-[0.22em] uppercase text-dark-900/50 text-center ${isModal ? 'text-[11px]' : 'text-[9px]'}`}>
                {project.techStack.slice(0, isModal ? 5 : 3).join(' · ')}
            </p>
        </div>
    );
};

export const TypographicHero = ({ project, size = 'modal' }: { project: Project; size?: 'card' | 'modal' }) => {
    const isModal = size === 'modal';

    return (
        <div
            className={`relative w-full overflow-hidden ${
                isModal ? 'aspect-[21/9] bg-cream-100' : 'h-full bg-cream-100'
            }`}
        >
            <div
                className="absolute inset-0 opacity-60"
                style={{ background: HERO_RADIAL_BG }}
                aria-hidden="true"
            />
            <div
                className="absolute inset-x-5 top-5 flex items-center justify-between text-dark-900/45"
                aria-hidden="true"
            >
                <span className="font-display italic text-sm" style={{ fontStyle: 'italic' }}>
                    §
                </span>
            </div>

            <HeroOverlayContent project={project} size={size} />
        </div>
    );
};
```

> Verify the line `export const EnterpriseHero = TypographicHero;` still exists immediately below (with its `// Backwards-compatible alias` comment). It is unchanged.

- [ ] **Step 2: Type check**

Run: `npx tsc -b`
Expected: no errors. (The `accent` variable now lives only in `HeroOverlayContent`; `TypographicHero` no longer references it, so there is no unused-variable warning.)

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProjectPreviewModal.tsx
git commit -m "refactor: extract HeroOverlayContent + HERO_RADIAL_BG from TypographicHero

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `usePrefersReducedMotion` hook

**Files:**
- Create: `src/hooks/usePrefersReducedMotion.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/usePrefersReducedMotion.ts`:

```ts
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Tracks the user's OS "reduce motion" accessibility preference. SSR-safe:
 * returns `false` until mounted, then reflects the media query and subscribes
 * to changes so the UI reacts if the setting is toggled at runtime.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia(QUERY);
    setPrefersReduced(mql.matches);

    const onChange = (event: MediaQueryListEvent) => setPrefersReduced(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return prefersReduced;
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/usePrefersReducedMotion.ts
git commit -m "feat: usePrefersReducedMotion hook

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: `VideoShowcaseHero` component

**Files:**
- Create: `src/components/VideoShowcaseHero.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/VideoShowcaseHero.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import type { Project } from './projectTypes';
import { TypographicHero, HeroOverlayContent, HERO_RADIAL_BG } from './ProjectPreviewModal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface VideoShowcaseHeroProps {
    project: Project;
    /** Public paths to the playlist clips, in order. */
    videos: string[];
    size?: 'card' | 'modal';
}

/** Light cream scrim so the dark overlay type stays legible over any footage. */
const SCRIM_BG =
    'radial-gradient(ellipse 70% 90% at 50% 40%, rgba(255,248,243,0.72), rgba(255,248,243,0.34) 60%, rgba(255,248,243,0.12))';

/**
 * Ambient, auto-cycling video background for a flagship banner. Clips play
 * muted and inline, advancing through the playlist endlessly, with the shared
 * HeroOverlayContent on top. Degrades to the static TypographicHero when the
 * user prefers reduced motion, when a clip fails to load, or when no clips are
 * provided. Pauses while scrolled offscreen to save resources.
 */
const VideoShowcaseHero = ({ project, videos, size = 'modal' }: VideoShowcaseHeroProps) => {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [index, setIndex] = useState(0);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const inView = useInView(containerRef, { margin: '0px' });

    const isModal = size === 'modal';

    // Pause when scrolled offscreen; resume (best-effort) when back in view.
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (inView) {
            void video.play().catch(() => {
                /* Autoplay may be rejected by the browser; the static look still holds. */
            });
        } else {
            video.pause();
        }
    }, [inView, index]);

    // No clips, reduced motion, or a load failure → static hero.
    if (!videos.length || prefersReducedMotion || failed) {
        return <TypographicHero project={project} size={size} />;
    }

    const handleEnded = () => {
        setReady(false); // brief fade-out before the next clip fades in
        setIndex((current) => (current + 1) % videos.length);
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden bg-cream-100 ${isModal ? 'aspect-[21/9]' : 'h-full'}`}
        >
            {/* Cream wash underlay — prevents any flash before the first frame loads. */}
            <div
                className="absolute inset-0 opacity-60"
                style={{ background: HERO_RADIAL_BG }}
                aria-hidden="true"
            />

            {/* Ambient clip. `key` remounts on clip change so the new src autoplays. */}
            <video
                ref={videoRef}
                key={videos[index]}
                src={videos[index]}
                muted
                autoPlay
                playsInline
                preload="metadata"
                aria-hidden="true"
                onCanPlay={() => setReady(true)}
                onEnded={handleEnded}
                onError={() => setFailed(true)}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    ready ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Legibility scrim between footage and overlay. */}
            <div className="absolute inset-0" style={{ background: SCRIM_BG }} aria-hidden="true" />

            {/* § corner mark, matching the static hero. */}
            <div
                className="absolute inset-x-5 top-5 flex items-center justify-between text-dark-900/45"
                aria-hidden="true"
            >
                <span className="font-display italic text-sm" style={{ fontStyle: 'italic' }}>
                    §
                </span>
            </div>

            {/* Shared identity overlay — identical typography to the static hero. */}
            <HeroOverlayContent project={project} size={size} />
        </div>
    );
};

export default VideoShowcaseHero;
```

> **Scrim tuning:** `SCRIM_BG` is intentionally a light cream wash because the overlay text is dark (`text-dark-900`). If, with real footage, the video feels too washed out, lower the alpha values (e.g. `0.72` → `0.5`); if the wordmark is hard to read, raise them. This is a visual knob, not a logic change.

- [ ] **Step 2: Type check**

Run: `npx tsc -b`
Expected: no errors. (`useInView` returns `boolean`; the refs are typed `HTMLDivElement` / `HTMLVideoElement`.)

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors. (The `useEffect` deps are `[inView, index]`; `videoRef`/`videos` accessed inside are stable/closure values — if `eslint-plugin-react-hooks` flags `videos`, it is safe because the component returns the static hero before this effect matters; only add `videos.length` to deps if lint requires it.)

- [ ] **Step 4: Commit**

```bash
git add src/components/VideoShowcaseHero.tsx
git commit -m "feat: VideoShowcaseHero ambient video playlist component

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Asset directory + wire into the flagship band

**Files:**
- Create: `public/videos/efengine/.gitkeep`
- Modify: `src/components/FeaturedWorks.tsx`

- [ ] **Step 1: Create the clip directory placeholder**

Create an empty file `public/videos/efengine/.gitkeep` (no content). This keeps the directory in git; the author drops real `.mp4` clips here later.

> **Author action (outside this plan):** place web-optimized clips at the paths listed in Step 3 (e.g. `public/videos/efengine/hello-triangle.mp4`). Until real files exist, the banner correctly falls back to the static hero (the `<video>` `onError` path) — nothing breaks.

- [ ] **Step 2: Import `VideoShowcaseHero`**

In `src/components/FeaturedWorks.tsx`, the top imports currently include:

```ts
import ProjectPreviewModal, { EnterpriseHero } from './ProjectPreviewModal';
import LatestCommit from './LatestCommit';
```

Add the new import immediately after the `LatestCommit` import:

```ts
import VideoShowcaseHero from './VideoShowcaseHero';
```

- [ ] **Step 3: Set `showcaseVideos` on efengine's structural data**

In `src/components/FeaturedWorks.tsx`, in the `projectData` array, the `efengine` entry currently is:

```ts
  {
    id: 'efengine',
    color: "bg-cream-100",
    techStack: ["C++17", "OpenGL 3.3 Core", "GLFW", "GLAD", "GLM", "Doctest", "CMake"],
    date: "'26 — NOW",
    codeBlocks: [],
    category: 'personal',
    featured: true,
    repo: 'elFonTii/efengine',
  },
```

Change it to add `showcaseVideos`:

```ts
  {
    id: 'efengine',
    color: "bg-cream-100",
    techStack: ["C++17", "OpenGL 3.3 Core", "GLFW", "GLAD", "GLM", "Doctest", "CMake"],
    date: "'26 — NOW",
    codeBlocks: [],
    category: 'personal',
    featured: true,
    repo: 'elFonTii/efengine',
    showcaseVideos: [
      '/videos/efengine/hello-triangle.mp4',
      '/videos/efengine/glfw-context.mp4',
    ],
  },
```

> Adjust the array to match the real clip filenames the author adds. The order is the playback order.

- [ ] **Step 4: Render video-or-static in the flagship band**

In `src/components/FeaturedWorks.tsx`, inside the flagship `<article>`, the banner container currently reads:

```tsx
            <div className="relative w-full aspect-[21/9] md:aspect-[3/1] bg-cream-100 border border-teal-700/20 rounded-2xl overflow-hidden soft-lift">
              <EnterpriseHero project={featuredProject} size="modal" />
              <div className="absolute inset-0 transition-colors duration-700 mix-blend-multiply bg-teal-700/0 group-hover:bg-teal-700/[0.05]" />
```

Replace the single `<EnterpriseHero ... />` line with the conditional (leave the surrounding `<div>` and the hover-wash `<div>` exactly as they are):

```tsx
            <div className="relative w-full aspect-[21/9] md:aspect-[3/1] bg-cream-100 border border-teal-700/20 rounded-2xl overflow-hidden soft-lift">
              {featuredProject.showcaseVideos?.length ? (
                <VideoShowcaseHero
                  project={featuredProject}
                  videos={featuredProject.showcaseVideos}
                  size="modal"
                />
              ) : (
                <EnterpriseHero project={featuredProject} size="modal" />
              )}
              <div className="absolute inset-0 transition-colors duration-700 mix-blend-multiply bg-teal-700/0 group-hover:bg-teal-700/[0.05]" />
```

> The `EnterpriseHero` import stays — it is still used by the `else` branch (and by every non-flagship card / the modal). Do not remove it.

- [ ] **Step 5: Type check**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add public/videos/efengine/.gitkeep src/components/FeaturedWorks.tsx
git commit -m "feat: render ambient video showcase on efengine flagship banner

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Full build + manual verification

**Files:** none (verification only)

> For Steps 3–6 to show **video**, at least one real clip must exist at a path listed in Task 5 Step 3. If no clips are present yet, the banner will (correctly) show the static hero — confirm that, then add a clip and re-check the video paths.

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: `tsc -b` passes and `vite build` completes with no errors.

- [ ] **Step 2: Start the dev server**

Run: `npm run dev`
Expected: Vite serves on a local URL (e.g. `http://localhost:5173`).

- [ ] **Step 3: Verify the static refactor is unchanged**

In the browser, scroll to the "Selected Work" section. With **no** clips present (or before adding them), confirm the efengine flagship banner looks **identical to before**: cream wash, centered "EFENGINE" wordmark, hairline, and the tech-stack line. (This proves the Task 2 refactor is behavior-preserving.)

- [ ] **Step 4: Verify ambient playback (with clips present)**

Add at least one real clip matching a Task 5 path, reload, and confirm on the efengine banner:
- the clip autoplays, is muted, and loops the playlist (advances to the next clip and wraps);
- the "EFENGINE" wordmark + tech-stack line remain readable on top over the scrim;
- the hover wash and the arrow chip still appear on hover;
- clicking the banner still opens the project modal.

- [ ] **Step 5: Verify reduced motion**

Enable the OS "reduce motion" setting (Windows: Settings → Accessibility → Visual effects → Animation effects off; or emulate in DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce"). Reload and confirm the banner shows the **static** typographic hero with **no** video playing.

- [ ] **Step 6: Verify graceful failure**

Temporarily change one `showcaseVideos` path to a non-existent file (or set Network → Offline) and reload. Confirm the banner falls back to the static hero — no broken/black box, no console-fatal layout break. Restore the path/Network afterward.

- [ ] **Step 7: Verify offscreen pause**

With a clip playing, scroll the banner well out of view, then back. Confirm playback pauses while offscreen and resumes when it returns (observe via DevTools, or that the clip does not advance while hidden).

- [ ] **Step 8: Final confirmation**

All checks pass → the feature is complete. No commit needed (verification-only task). If any check fails, fix the relevant task's code and re-commit before declaring done.

---

## Notes for the implementer

- **Path alias:** `@/` resolves to `src/` (e.g. `@/hooks/usePrefersReducedMotion`).
- **No new dependencies:** `framer-motion` (`useInView`) is already in `package.json`.
- **Autoplay requires `muted`** — keep the `muted` + `playsInline` attributes or browsers will block autoplay.
- **The video is decorative** (`aria-hidden`) and has no audio, so no captions/transcript are needed; identity comes from the visible `HeroOverlayContent`.
- **`showcaseVideos` is generic** — any future project can set it to opt into the same ambient treatment; nothing else assumes it.
- **Do not** stage `src/content/` or `.claude/settings.local.json`.
```
