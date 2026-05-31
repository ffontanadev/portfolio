# Projects Section Redesign — EFENGINE Flagship & Personal/Professional Alignment

**Date:** 2026-05-31
**Author:** Felipe Fontana (with Claude)
**Status:** Approved design, pending implementation plan

## Goal

Update the projects section of the portfolio so that:

1. **EFENGINE** — the author's most ambitious project, a from-scratch C++ game framework — stands out above all other projects as a flagship.
2. Personal projects **drop their images** and adopt the same typographic treatment used by the professional (enterprise) projects.
3. Personal vs professional projects remain **easily distinguishable at a glance**.

## Context

The projects live in two files:

- `src/components/FeaturedWorks.tsx` — holds the `projects: Project[]` data array and renders the section: header, filter tabs (`all | personal | professional`), and a 2-column responsive grid of project cards. Personal cards render `project.image`; professional cards render `<EnterpriseHero>`.
- `src/components/ProjectPreviewModal.tsx` — defines the `Project` type and shared display components (`EnterpriseHero`, `LeadMetricDisplay`, `MetricBrief`), plus the detail modal. The modal hero is an image for personal projects and `<EnterpriseHero>` for professional. The modal right column shows `MetricBrief` (professional) or `codeBlocks` (personal).

Color tokens already exist in `src/index.css` `@theme`: `--color-coral-500: #FF6B6B`, `--color-teal-500: #00D9A3`, `--color-cream-50/100`, `--color-dark-900`.

## EFENGINE — Identity (authoritative description from the author)

A personal 3D game **framework**, written in **C++17**, built on **OpenGL 3.3 Core**, for **Windows**. No editor, no native scripting, no multi-platform compilation. It is a **library you compile your games against** — each game is a C++ project that links against efengine. Its purpose is learning: **memory management**, the **game lifecycle**, etc.

- **Dependencies / stack:** C++17, OpenGL 3.3 Core, GLFW, GLAD, GLM, Doctest, CMake (Doxygen for auto-documentation).
- EFENGINE shows **development phases** instead of code snippets.

## Design

### 1. Data model (`Project` type, in `ProjectPreviewModal.tsx`)

Generalize what is currently enterprise-only so it also serves personal projects.

- **`category` becomes the source of truth for accent color.** Professional → coral, personal → teal. No separate color field is repeated in data; the accent is derived from `category` at render time.
- **Rename `EnterpriseHero` → `TypographicHero`** (single component for both categories). It paints: the category tag, the lead metric, and the stack. Professional keeps showing the company logo; personal shows the lead metric (wordmark or stack) instead of a logo.
- **Extend `ProjectLeadMetric`** with a wordmark variant:
  ```ts
  | { kind: 'wordmark'; value: string; sub?: string }
  ```
  Used by EFENGINE: value `"EFENGINE"`, sub `"game framework"`.
- **Add `featured?: boolean`** to mark EFENGINE as the flagship.
- **Add `phases?: ProjectPhase[]`** where:
  ```ts
  interface ProjectPhase { label: string; title: string; desc: string; current?: boolean }
  ```
- **`image?` is no longer used** by cards or the modal. The field may remain on the type for safety but personal project data drops it.

### 2. Personal vs Professional distinction

Driven entirely by `category`:

| | Professional | Personal |
|---|---|---|
| Accent | coral (`#FF6B6B`) | teal (`#00D9A3`) |
| Tag | `ENTERPRISE` | `PERSONAL` |
| Hero | company logo + lead metric | lead metric (wordmark / scale) |

The tag hairline, the hover wash over the card, and the title hover color all use the category's accent. At a glance: coral = professional work, teal = personal.

### 3. EFENGINE as flagship (full-width hero at the top)

A full-width card **above the 2-column grid**, inside the "Selected Work" section but with its own eyebrow `§ FLAGSHIP · C++ ENGINE`. Taller than grid cards, large `EFENGINE` wordmark, the identity description above, stack chips, and teal accent.

- Visible only when the active filter is `all` or `personal` (it is a personal project).
- Clicking it opens the same `ProjectPreviewModal`.
- It is excluded from the regular grid so it is not duplicated. The grid count / numbering reflects the remaining projects.

### 4. Modal right column — three variants

The modal right column logic becomes:

1. Professional with `metrics` → `MetricBrief` (unchanged).
2. Project with `phases` → **`DevelopmentRoadmap`** (new): a vertical numbered timeline. Each phase renders its `label` (mono), `title` (display), and `desc`. Reuses MetricBrief's visual frame (rounded border, dividers). The phase marked `current: true` is highlighted with the teal accent.
3. Otherwise (personal projects with code) → `codeBlocks` (unchanged).

### 5. EFENGINE data

- **title:** `"EFENGINE — C++ Game Framework"`
- **category:** `personal`
- **featured:** `true`
- **techStack:** `["C++17", "OpenGL 3.3 Core", "GLFW", "GLAD", "GLM", "Doctest", "CMake"]`
- **leadMetric:** `{ kind: 'wordmark', value: 'EFENGINE', sub: 'game framework' }`
- **desc / description:** based on the authoritative identity above — a from-scratch 3D game framework in C++17 on OpenGL 3.3 Core for Windows; a library you compile your games against; built to master memory management and the game lifecycle.
- **codeBlocks:** `[]` (none — uses phases instead)
- **phases:**
  - **Fase 0 — Setup:** Toolchain, CMake, project structure and dependencies (GLFW, GLAD, GLM, Doctest).
  - **Fase 1 — Contexto GLFW:** Window and OpenGL 3.3 Core context creation, basic game loop, input handling.
  - **Fase 2 — Hello Triangle:** Minimal render pipeline: VBO/VAO, shaders, first triangle on screen. *(current phase)*

### 6. Cleanup of existing personal projects

For the 4 existing personal projects (Minecraft-like Terrain, Twitter Clone, MHC-CLI, and any other):

- Remove `image`.
- Add `category: 'personal'`.
- Add a `leadMetric` so the typographic hero renders something meaningful (a `scale` value or short wordmark derived from the project, e.g. language/stack focus).
- Keep their existing `codeBlocks` (modal right column unchanged for them).

## Affected files

- `src/components/ProjectPreviewModal.tsx` — type changes (`wordmark` lead metric, `phases`, `featured`), rename/generalize `EnterpriseHero` → `TypographicHero` with accent-by-category, add `DevelopmentRoadmap`, update modal right-column branching.
- `src/components/FeaturedWorks.tsx` — add EFENGINE data with phases, render flagship full-width hero above the grid, exclude flagship from grid, apply per-category accent/tag to cards, remove images from personal data.

## Out of scope (YAGNI)

- No new color tokens (teal already exists).
- No changes to other sections (Hero, Contact, etc.).
- No editor/scripting/multi-platform features for EFENGINE itself — it is described, not built here.
- No image lazy-loading infrastructure changes (images are simply removed from data).