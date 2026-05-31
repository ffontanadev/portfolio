# Projects Section Redesign — EFENGINE Flagship Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make EFENGINE a full-width flagship card above the projects grid, remove images from personal projects, and give personal projects the same typographic treatment as professional ones while keeping the two categories visually distinct (teal = personal, coral = professional).

**Architecture:** Two files change. `ProjectPreviewModal.tsx` owns the `Project` type and shared display components — we extend the type (`wordmark` lead metric, `phases`, `featured`), generalize `EnterpriseHero` into a category-aware `TypographicHero` with a derived accent, add a `DevelopmentRoadmap` component, and update the modal's right-column branching. `FeaturedWorks.tsx` owns the data + section layout — we add EFENGINE data, render the flagship hero above the grid (excluded from the grid), and drive per-category accent/tag on cards. Accent color is derived from `category` everywhere, never duplicated in data.

**Tech Stack:** React 19, TypeScript ~5.9, Tailwind CSS v4 (tokens in `src/index.css` `@theme`), framer-motion 12, lucide-react. No unit-test runner is configured — verification is `npm run build` (tsc + vite), `npm run lint`, and visual checks via `npm run dev`.

**Verification note:** This codebase has no jest/vitest. "Tests" in this plan are type-check + lint + visual confirmation. Run the dev server (`npm run dev`) and inspect the projects section in a browser for the visual steps.

---

## File Structure

- **`src/components/ProjectPreviewModal.tsx`** (modify) — type definitions and shared presentational components. Responsibilities after this work:
  - `Project` type with `featured?`, `phases?`, extended `ProjectLeadMetric` (adds `wordmark`).
  - `ProjectPhase` interface.
  - `accentForCategory(category)` helper → returns the coral/teal class fragments.
  - `LeadMetricDisplay` — handles `migration | scale | wordmark`.
  - `TypographicHero` (renamed from `EnterpriseHero`, kept as an alias export) — category-aware tag + accent, logo for professional, lead metric for personal.
  - `MetricBrief` (unchanged).
  - `DevelopmentRoadmap` (new) — vertical numbered phase timeline.
  - Modal: hero is always `TypographicHero` (no image branch); right column branches metrics → phases → codeBlocks.
- **`src/components/FeaturedWorks.tsx`** (modify) — data array + section layout. Responsibilities after this work:
  - `projects` data: add EFENGINE (`featured: true`, phases, wordmark lead), add `category` + `leadMetric` to existing personal projects, drop `image`.
  - A `FlagshipCard` block rendered full-width above the grid when filter is `all | personal`.
  - Grid excludes the featured project; cards use `EnterpriseHero` → `TypographicHero` for every project (no image branch); accent/tag derived from `category`.

---

## Task 1: Extend the `Project` type and lead-metric union

**Files:**
- Modify: `src/components/ProjectPreviewModal.tsx:31-52`

- [ ] **Step 1: Add the `wordmark` variant, `ProjectPhase`, and new `Project` fields**

In `src/components/ProjectPreviewModal.tsx`, replace the `ProjectLeadMetric` union (lines 31-33) with:

```ts
export type ProjectLeadMetric =
    | { kind: 'migration'; from: string; to: string }
    | { kind: 'scale'; superscript?: string; value: string }
    | { kind: 'wordmark'; value: string; sub?: string };
```

Add a `ProjectPhase` interface immediately after the `ProjectMetric` interface (after line 29):

```ts
export interface ProjectPhase {
    label: string;
    title: string;
    desc: string;
    current?: boolean;
}
```

Add three fields to the `Project` interface (inside the interface ending at line 52), after `metrics?`:

```ts
    featured?: boolean;
    phases?: ProjectPhase[];
```

(`image?` stays on the type — it is simply no longer populated by data.)

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: PASS (no type errors). The new union member is not yet consumed, which is fine.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectPreviewModal.tsx
git commit -m "feat(projects): extend Project type with phases, featured, wordmark lead metric"
```

---

## Task 2: Render the `wordmark` lead metric

**Files:**
- Modify: `src/components/ProjectPreviewModal.tsx:113-163` (the `LeadMetricDisplay` component)

- [ ] **Step 1: Handle the `wordmark` kind in `LeadMetricDisplay`**

In `LeadMetricDisplay`, add this branch *before* the final `scale` return (i.e., after the `migration` `if` block that ends around line 140):

```tsx
    if (metric.kind === 'wordmark') {
        return (
            <div className="flex flex-col items-center">
                <span
                    className={`font-display font-bold tracking-[-0.04em] leading-none text-dark-900 ${
                        isModal ? 'text-[clamp(3rem,8vw,6rem)]' : 'text-[clamp(2.25rem,6vw,3.75rem)]'
                    }`}
                >
                    {metric.value}
                </span>
                {metric.sub && (
                    <span
                        className={`font-display font-display-italic font-light tracking-tight text-dark-900/55 mt-2 ${
                            isModal ? 'text-2xl' : 'text-lg'
                        }`}
                        style={{ fontStyle: 'italic' }}
                    >
                        {metric.sub}
                    </span>
                )}
            </div>
        );
    }
```

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: PASS. TypeScript narrows the union; the existing `scale` return handles the remaining case.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectPreviewModal.tsx
git commit -m "feat(projects): render wordmark lead metric"
```

---

## Task 3: Add the `accentForCategory` helper

**Files:**
- Modify: `src/components/ProjectPreviewModal.tsx` (add after `LOGO_REGISTRY`, around line 15)

- [ ] **Step 1: Add the accent helper**

After the `ProjectLogo` type export (line 17), add:

```ts
// Accent color is derived from category — coral for professional work, teal for personal.
export const accentForCategory = (category?: ProjectCategory) => {
    const isPersonal = (category ?? 'personal') === 'personal';
    return {
        isPersonal,
        tagLabel: isPersonal ? 'Personal' : 'Enterprise',
        // text / hairline / hover classes
        text: isPersonal ? 'text-teal-500' : 'text-coral-500',
        hairline: isPersonal ? 'bg-teal-500' : 'bg-coral-500',
        hoverText: isPersonal ? 'group-hover:text-teal-500' : 'group-hover:text-coral-500',
        // hover wash over card image area
        washIdle: isPersonal ? 'bg-teal-500/0' : 'bg-coral-500/0',
        washHover: isPersonal ? 'group-hover:bg-teal-500/[0.06]' : 'group-hover:bg-coral-500/[0.06]',
    };
};
```

Note: `ProjectCategory` is declared later in the file (line 35). Because this is a `const` arrow function referencing the type only in an annotation, and TS hoists type declarations, this compiles. If the build complains about ordering, move the `accentForCategory` definition to just below the `ProjectCategory` type declaration (after line 35) instead.

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectPreviewModal.tsx
git commit -m "feat(projects): add accentForCategory helper for per-category accent"
```

---

## Task 4: Generalize `EnterpriseHero` → `TypographicHero`

**Files:**
- Modify: `src/components/ProjectPreviewModal.tsx:165-228` (the `EnterpriseHero` component)

- [ ] **Step 1: Rename and make the hero category-aware**

Replace the entire `EnterpriseHero` component (lines 165-228) with:

```tsx
export const TypographicHero = ({ project, size = 'modal' }: { project: Project; size?: 'card' | 'modal' }) => {
    const isModal = size === 'modal';
    const accent = accentForCategory(project.category);
    return (
        <div
            className={`relative w-full overflow-hidden ${
                isModal ? 'aspect-[21/9] bg-cream-100' : 'h-full bg-cream-100'
            }`}
        >
            <div
                className="absolute inset-0 opacity-60"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 80% at 50% 35%, #FFF8F3, transparent 70%)',
                }}
                aria-hidden="true"
            />
            <div
                className="absolute inset-x-6 top-5 flex items-center justify-between text-dark-900/45"
                aria-hidden="true"
            >
                <span className={`font-mono text-[10px] tracking-[0.3em] uppercase ${accent.text}`}>
                    {accent.tagLabel}
                </span>
                <span className="font-display italic text-sm" style={{ fontStyle: 'italic' }}>
                    §
                </span>
            </div>

            <div className={`relative h-full flex flex-col items-center justify-center ${isModal ? 'px-8 py-14' : 'px-6 py-10'}`}>
                {project.logo ? (
                    (() => {
                        const Logo = LOGO_REGISTRY[project.logo];
                        // Wide wordmarks (Provincia) need more horizontal room than the square BBVA mark.
                        const isWide = project.logo === 'banco-provincia';
                        const sizeClasses = isWide
                            ? isModal
                                ? 'h-7 mb-7 text-dark-900/85'
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
                <div className={`${isModal ? 'mt-8' : 'mt-5'} h-px w-12 ${accent.hairline}/40`} aria-hidden="true" />
                <p className={`mt-3 font-mono tracking-[0.22em] uppercase text-dark-900/50 text-center ${isModal ? 'text-[11px]' : 'text-[9px]'}`}>
                    {project.techStack.slice(0, isModal ? 5 : 3).join(' · ')}
                </p>
            </div>
        </div>
    );
};

// Backwards-compatible alias — existing imports keep working.
export const EnterpriseHero = TypographicHero;
```

Note on the hairline: `${accent.hairline}/40` produces e.g. `bg-teal-500/40`. Tailwind v4 supports the `/opacity` suffix on these classes; the previous code used a static `bg-dark-900/20`. If the slash-opacity on a dynamic class does not render, fall back to wrapping with explicit classes `bg-coral-500/40` / `bg-teal-500/40` in the `accentForCategory` map instead (add a `hairlineSoft` field). Verify visually in Step 3.

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: PASS. The `EnterpriseHero` alias keeps the existing import in `FeaturedWorks.tsx` valid.

- [ ] **Step 3: Visual check**

Run: `npm run dev`, open the projects section. Professional cards (Provincia/BBVA) still show coral `Enterprise` tag + logo. Nothing should regress yet (personal projects still use images at this point — that changes in Task 7).
Expected: professional cards unchanged in look; coral accent present.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProjectPreviewModal.tsx
git commit -m "feat(projects): generalize EnterpriseHero into category-aware TypographicHero"
```

---

## Task 5: Add the `DevelopmentRoadmap` component

**Files:**
- Modify: `src/components/ProjectPreviewModal.tsx` (add after `MetricBrief`, around line 257)

- [ ] **Step 1: Add the roadmap component**

After the `MetricBrief` component (ends ~line 257), add:

```tsx
const DevelopmentRoadmap = ({ project }: { project: Project }) => {
    if (!project.phases?.length) return null;
    return (
        <div>
            <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-dark-900/55 mb-4">
                Development Roadmap
            </h3>
            <div className="rounded-2xl border border-dark-900/10 divide-y divide-dark-900/[0.07] overflow-hidden bg-cream-50/40">
                {project.phases.map((phase, i) => (
                    <div key={i} className="flex items-start gap-4 px-5 py-4">
                        <span
                            className={`font-mono text-[10px] tracking-[0.2em] uppercase shrink-0 mt-1 ${
                                phase.current ? 'text-teal-500 font-semibold' : 'text-dark-900/45'
                            }`}
                        >
                            {phase.label}
                        </span>
                        <div className="min-w-0">
                            <p
                                className={`font-display text-lg md:text-xl tracking-tight ${
                                    phase.current ? 'text-teal-500 font-semibold' : 'text-dark-900 font-medium'
                                }`}
                            >
                                {phase.title}
                            </p>
                            <p className="mt-1 text-sm text-dark-900/55 leading-relaxed">
                                {phase.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: PASS. Component is defined but not yet used (next step wires it in) — TS allows unused module-internal consts only if referenced; since it will be referenced in Task 6, if `noUnusedLocals` flags it, proceed directly to Task 6 before building. To keep this step green, combine Step 2 verification with Task 6 if the build complains about the unused component.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectPreviewModal.tsx
git commit -m "feat(projects): add DevelopmentRoadmap phase timeline component"
```

---

## Task 6: Rewire the modal hero and right column

**Files:**
- Modify: `src/components/ProjectPreviewModal.tsx:358-435` (hero block + right-column branch)

- [ ] **Step 1: Replace the modal hero block (image-or-enterprise) with always-typographic**

Replace the hero block (lines 358-370, the `{project.image ? (...) : (<EnterpriseHero .../>)}` section) with:

```tsx
                                {/* Hero Section — typographic for every project */}
                                <TypographicHero project={project} size="modal" />
```

- [ ] **Step 2: Replace the right-column branch with metrics → phases → codeBlocks**

Replace the right-column conditional (lines 423-435, the `{project.category === 'professional' && project.metrics?.length ? (<MetricBrief/>) : (...codeBlocks...)}` block) with:

```tsx
                                    {/* Right Column — Migration Brief, Development Roadmap, or Code Blocks */}
                                    {project.category === 'professional' && project.metrics?.length ? (
                                        <MetricBrief project={project} />
                                    ) : project.phases?.length ? (
                                        <DevelopmentRoadmap project={project} />
                                    ) : (
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                                                Key Implementation
                                            </h3>
                                            {project.codeBlocks.map((block, index) => (
                                                <CodeBlockComponent key={index} block={block} />
                                            ))}
                                        </div>
                                    )}
```

- [ ] **Step 3: Type-check**

Run: `npm run build`
Expected: PASS. `DevelopmentRoadmap` is now referenced, clearing any unused-local warning from Task 5.

- [ ] **Step 4: Visual check**

Run: `npm run dev`. Open a professional project modal → still shows logo hero + Migration Brief. Open a personal project modal (e.g. Twitter Clone) → now shows a typographic hero (no image) + its code blocks.
Expected: no image anywhere in modals; professional unchanged in structure.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectPreviewModal.tsx
git commit -m "feat(projects): use typographic hero + phase/code branching in modal"
```

---

## Task 7: Update existing personal project data (drop images, add category + lead)

**Files:**
- Modify: `src/components/FeaturedWorks.tsx:53-501` (the three personal project objects)

- [ ] **Step 1: Update the Voxel / Minecraft-like project**

In the `Minecraft-like Terrain Generation` object (starts line 53): remove the `image: "/images/voxel-world-engine.png",` line, and add these two fields (after the `color` line):

```ts
    category: 'personal',
    leadMetric: { kind: 'scale', superscript: 'voxels', value: '∞' },
```

- [ ] **Step 2: Update the Twitter Clone project**

In the `Twitter Clone` object (starts line 190): remove the `image: "/images/twitter-clone.png",` line, and add (after `color`):

```ts
    category: 'personal',
    leadMetric: { kind: 'wordmark', value: 'Twitter', sub: 'clone' },
```

- [ ] **Step 3: Update the MHC-CLI project**

In the `Magenta Hours Collector (MHC-CLI)` object (starts line 310): remove the `image: "/images/mhc-cli.png",` line, and add (after `color`):

```ts
    category: 'personal',
    leadMetric: { kind: 'wordmark', value: 'MHC', sub: 'cli' },
```

- [ ] **Step 4: Type-check**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Visual check**

Run: `npm run dev`. The three personal cards now render the teal `Personal` tag + typographic hero instead of an image. Professional cards still coral.
Expected: clear teal vs coral distinction in the grid.

- [ ] **Step 6: Commit**

```bash
git add src/components/FeaturedWorks.tsx
git commit -m "feat(projects): drop images from personal projects, add category + lead metric"
```

---

## Task 8: Add EFENGINE project data

**Files:**
- Modify: `src/components/FeaturedWorks.tsx:10` (top of the `projects` array)

- [ ] **Step 1: Insert EFENGINE as the first array element**

Insert this object as the **first** element of the `projects` array (immediately after `const projects: Project[] = [`):

```ts
  {
    title: "EFENGINE — C++ Game Framework",
    desc: "A from-scratch 3D game framework in C++17 on OpenGL 3.3 Core — a library you compile your games against, built to master memory management and the game lifecycle.",
    color: "bg-cream-100",
    techStack: ["C++17", "OpenGL 3.3 Core", "GLFW", "GLAD", "GLM", "Doctest", "CMake"],
    date: "'26 — NOW",
    role: "Engine Author",
    description: `EFENGINE is my most ambitious project: a personal 3D game framework written in C++17 on OpenGL 3.3 Core for Windows. No editor, no native scripting, no multi-platform builds — it is a library you compile your games against, where each game is a C++ project that links against efengine. The goal is mastery of low-level systems: manual memory management, the game lifecycle, and the render pipeline, built up one phase at a time. Documentation is generated with Doxygen and the build is driven by CMake.`,
    codeBlocks: [],
    category: 'personal',
    featured: true,
    leadMetric: { kind: 'wordmark', value: 'EFENGINE', sub: 'game framework' },
    phases: [
      {
        label: 'Fase 0',
        title: 'Setup',
        desc: 'Toolchain, CMake build, project structure, and dependencies wired up (GLFW, GLAD, GLM, Doctest).',
      },
      {
        label: 'Fase 1',
        title: 'Contexto GLFW',
        desc: 'Window and OpenGL 3.3 Core context creation, the basic game loop, and input handling.',
      },
      {
        label: 'Fase 2',
        title: 'Hello Triangle',
        desc: 'Minimal render pipeline: VBO/VAO setup, shader compilation, and the first triangle on screen.',
        current: true,
      },
    ],
  },
```

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Visual check (interim)**

Run: `npm run dev`. EFENGINE now appears as the first card in the grid (flagship layout comes in Task 9). Its modal shows the wordmark hero + Development Roadmap with three phases, Fase 2 highlighted teal.
Expected: roadmap renders; Fase 2 in teal.

- [ ] **Step 4: Commit**

```bash
git add src/components/FeaturedWorks.tsx
git commit -m "feat(projects): add EFENGINE project with development phases"
```

---

## Task 9: Render EFENGINE as a full-width flagship above the grid

**Files:**
- Modify: `src/components/FeaturedWorks.tsx` — imports (line 4), `counts`/`visibleProjects` memos (lines 516-528), and the grid render block (lines 614-720)

- [ ] **Step 1: Import the helper and split out the featured project**

Update the import on line 4 to also pull the accent helper:

```ts
import ProjectPreviewModal, { EnterpriseHero, accentForCategory, type Project } from './ProjectPreviewModal';
```

Inside the `FeaturedWorks` component, after the `projects` constant is in scope, derive the flagship and the grid set. Replace the `counts` and `visibleProjects` memos (lines 516-528) with:

```ts
  const featuredProject = useMemo(() => projects.find((p) => p.featured) ?? null, []);

  const counts = useMemo(
    () => ({
      all: projects.length,
      personal: projects.filter((p) => (p.category ?? 'personal') === 'personal').length,
      professional: projects.filter((p) => p.category === 'professional').length,
    }),
    [],
  );

  // The flagship renders in its own full-width band; keep it out of the grid to avoid duplication.
  const visibleProjects = useMemo(() => {
    const base = filter === 'all' ? projects : projects.filter((p) => (p.category ?? 'personal') === filter);
    return base.filter((p) => !p.featured);
  }, [filter]);

  // Flagship shows only when the active filter includes it (it is a personal project).
  const showFeatured =
    featuredProject !== null && (filter === 'all' || filter === (featuredProject.category ?? 'personal'));
```

- [ ] **Step 2: Render the flagship band above the grid**

Immediately before the `<AnimatePresence mode="wait" initial={false}>` (line 614), insert the flagship block:

```tsx
        {showFeatured && featuredProject && (
          <motion.article
            key="flagship"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease }}
            onClick={() => handleProjectClick(featuredProject)}
            className="group cursor-pointer mb-24"
          >
            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-mono text-[9px] text-teal-500 tracking-[0.25em] uppercase">
                § Flagship · C++ Engine
              </span>
              <span className="h-px flex-1 bg-dark-900/10" />
              <span className="font-mono text-[10px] text-dark-900/40 tracking-widest uppercase">
                {featuredProject.date}
              </span>
            </div>

            <div className="relative w-full aspect-[21/9] md:aspect-[3/1] bg-cream-100 border border-teal-500/20 rounded-2xl overflow-hidden soft-lift">
              <EnterpriseHero project={featuredProject} size="modal" />
              <div className="absolute inset-0 transition-colors duration-700 mix-blend-multiply bg-teal-500/0 group-hover:bg-teal-500/[0.05]" />
              <div className="absolute top-5 right-5 bg-cream-50/90 backdrop-blur-sm p-3 rounded-full opacity-0 translate-y-3 -translate-x-3 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                <ArrowUpRight size={18} className="text-dark-900" />
              </div>
            </div>

            <div className="mt-7 max-w-3xl">
              <h3 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em] leading-tight text-dark-900 group-hover:text-teal-500 transition-colors duration-500">
                {featuredProject.title}
              </h3>
              <p className="mt-3 text-base md:text-lg text-dark-900/60 font-light leading-relaxed">
                {featuredProject.desc}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {featuredProject.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[10px] tracking-widest uppercase text-dark-900/55 border border-dark-900/15 rounded-full px-3 py-1"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        )}
```

- [ ] **Step 3: Drive grid card accent/tag from category**

In the grid card render (the `visibleProjects.map(...)` block), replace the `isEnterprise` derivation (line 627) and its dependent JSX so accent comes from the helper. Specifically:

Replace line 627:
```ts
                const isEnterprise = project.category === 'professional';
```
with:
```ts
                const accent = accentForCategory(project.category);
                const isEnterprise = project.category === 'professional';
```

Replace the category tag (lines 643-647) with an accent-driven tag shown for every project:
```tsx
                  <span className={`font-mono text-[9px] tracking-[0.25em] uppercase ${accent.text}/90`}>
                    {accent.tagLabel}
                  </span>
```

Replace the card visual block (lines 654-688) — which currently branches on image vs `EnterpriseHero` — with an always-typographic version:
```tsx
                {/* Card visual — typographic composition for every project */}
                <div className="relative w-full aspect-[4/3] bg-cream-100 border border-dark-900/[0.08] rounded-2xl overflow-hidden soft-lift">
                  <EnterpriseHero project={project} size="card" />

                  {/* Warm hover wash, tinted by category accent */}
                  <div className={`absolute inset-0 transition-colors duration-700 mix-blend-multiply ${accent.washIdle} ${accent.washHover}`} />

                  {/* Arrow chip */}
                  <div className="absolute top-5 right-5 bg-cream-50/90 backdrop-blur-sm p-3 rounded-full opacity-0 translate-y-3 -translate-x-3 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                    <ArrowUpRight size={18} className="text-dark-900" />
                  </div>
                </div>
```

Replace the title hover color (line 692) so it uses the accent:
```tsx
                  <h3 className={`font-display font-bold text-2xl md:text-3xl tracking-[-0.01em] leading-tight text-dark-900 transition-colors duration-500 ${accent.hoverText}`}>
```

- [ ] **Step 4: Type-check**

Run: `npm run build`
Expected: PASS. Confirm no unused-import warning for `accentForCategory` and that the image-branch removal didn't leave `project.color`/`project.image` references dangling (the card no longer uses `project.color`; that is fine — it stays on the type and data).

- [ ] **Step 5: Visual check**

Run: `npm run dev`. Confirm:
- EFENGINE appears as a full-width band above the grid with teal `§ Flagship · C++ Engine` eyebrow, large `EFENGINE` wordmark, description and full stack.
- Switching the filter to `personal` keeps the flagship; switching to `professional` hides it.
- Grid: personal cards = teal `Personal` tag + teal hover; professional = coral `Enterprise` + coral hover. EFENGINE is not duplicated in the grid.
- Project numbering (`NN / total`) reflects the grid set without the flagship.

Expected: all of the above hold.

- [ ] **Step 6: Commit**

```bash
git add src/components/FeaturedWorks.tsx
git commit -m "feat(projects): render EFENGINE flagship band and category-driven card accents"
```

---

## Task 10: Final verification and cleanup

**Files:**
- None (verification only)

- [ ] **Step 1: Full build + lint**

Run: `npm run build && npm run lint`
Expected: build PASS, lint PASS (no new errors). If lint flags the now-unused `project.color` or `image` in data, leave the data fields (harmless) but remove any genuinely unused imports.

- [ ] **Step 2: Cross-filter visual sweep**

Run: `npm run dev`. Click through `All`, `Personal`, `Professional`. Open each project's modal. Confirm no images appear anywhere, the flagship behaves per filter, and both categories are clearly distinguished by teal/coral.
Expected: consistent, no regressions.

- [ ] **Step 3: Commit any cleanup (if needed)**

```bash
git add -A
git commit -m "chore(projects): final cleanup after projects section redesign"
```

(Skip if Steps 1-2 produced no changes.)

---

## Self-Review

**Spec coverage:**
- EFENGINE flagship above grid → Task 8 (data) + Task 9 (band). ✓
- Remove images from personal → Task 6 (modal) + Task 7 (data) + Task 9 (cards). ✓
- Personal adopts typographic treatment → Task 4 (hero) + Task 9 (cards). ✓
- Personal vs professional distinguishable → Task 3 (accent helper) + Task 9 (tag/accent). ✓
- Wordmark lead metric → Task 1 (type) + Task 2 (render). ✓
- Development phases instead of snippets → Task 1 (type) + Task 5 (component) + Task 6 (branch) + Task 8 (data). ✓
- Correct EFENGINE stack (GLFW/GLAD/GLM/Doctest/CMake/Doxygen) → Task 8. ✓

**Type consistency:** `accentForCategory` fields (`text`, `hairline`, `hoverText`, `washIdle`, `washHover`, `tagLabel`, `isPersonal`) are referenced identically in Tasks 4 and 9. `TypographicHero` is the canonical name with `EnterpriseHero` as an alias, and Task 9 imports `EnterpriseHero` — consistent. `ProjectPhase` shape (`label`, `title`, `desc`, `current?`) matches between Task 1 (type), Task 5 (render), and Task 8 (data). `wordmark` variant shape (`value`, `sub?`) matches Tasks 1, 2, 7, 8.

**Placeholder scan:** No TBD/TODO; every code step shows full code; commands have expected output.
