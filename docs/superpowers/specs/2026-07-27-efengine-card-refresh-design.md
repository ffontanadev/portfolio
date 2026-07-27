# Design — EFENGINE Card Refresh

- **Date:** 2026-07-27
- **Status:** Approved
- **Author:** Felipe Fontana (with Claude Code)
- **Related:** [FeaturedWorks.tsx](../../../src/components/FeaturedWorks.tsx), [ProjectPreviewModal.tsx](../../../src/components/ProjectPreviewModal.tsx), [projectTypes.ts](../../../src/components/projectTypes.ts), locale files under [src/i18n/locales](../../../src/i18n/locales)
- **Sources of truth:** `D:\@ffontana\CONSOLIDADAS\efengine\README.md` and `gitlog.txt` (380 commits, 2026-05-29 → 2026-07-26)

## 1. Context

The EFENGINE flagship card was written when the project was three phases old and has not moved since. Two months and 380 commits later, every substantive claim on it is wrong or stale.

| Card says | Reality (README + gitlog) |
|---|---|
| OpenGL **3.3** Core | **4.5 Core** with DSA (PR #31, Jul 23) |
| "No editor" | Docked ImGui editor in `sandbox/`: hierarchy, inspector, live material editing, authoring |
| Phase 2 "Hello Triangle" is *current* | Hello Triangle landed **May 31**. Current work is split-sum specular IBL (PR #49, Jul 26) |
| Stack: GLFW/GLAD/GLM/Doctest/CMake | Missing Assimp, stb_image, Dear ImGui (docking), the `efecom` RHI |
| "manual memory management" | The engine is explicitly **RAII, zero raw `new`/`delete`**, and compiles without exceptions |

Note the README itself trails the repo: it describes IBL as diffuse-only, but the Jul 26 commits added **specular IBL** (GGX prefilter + BRDF LUT + split-sum) plus emission maps and normal strength. The card must reflect the gitlog, not just the README.

## 2. Goals / Non-Goals

**Goals**
- Every factual claim on the card matches the repo as of 2026-07-26.
- The roadmap tells the real two-month progression, with the current phase correctly marked.
- Add an **engine systems** block so the modal conveys architecture, not only chronology.
- Full i18n across `en`, `es`, `pt`, `zh`. No new runtime dependencies, no new routes.

**Non-Goals**
- No redesign of the flagship band, the video showcase, or the Latest Commit badge.
- No changes to any other project card.
- No new visual language — the systems block reuses the roadmap's container styling.

## 3. Where the card lives

- `src/components/FeaturedWorks.tsx:21-36` — structural data (`techStack`, `date`, `repo`, `showcaseVideos`)
- `src/i18n/locales/{en,es,pt,zh}.json` → `work.featured.projects.efengine` — all display copy
- `src/components/FeaturedWorks.tsx:525-536` — merges the two, keyed by `id`
- `src/components/ProjectPreviewModal.tsx:379-414` — `DevelopmentRoadmap` renders `phases`
- `src/content/projects.ts` — a twin copy of every card, **imported by nothing** (verified: the only repo match for `featuredProjects` is its own declaration)

`src/i18n/config.ts:21` declares `satisfies Record<string, Messages>` with `Messages = typeof en`, so `tsc -b` fails the build if any locale drifts from the `en` shape. Key parity is compiler-enforced; array *length* is not, so the 7 phases and 6 systems must be kept aligned by hand across the four files.

The flagship project is excluded from the grid (`FeaturedWorks.tsx:605`), so EFENGINE renders only in the flagship band, where **all** tech-stack chips are shown (the 3-chip truncation applies to grid cards only).

## 4. Content

### 4.1 Title

`EFENGINE — C++ Game Engine` (was "C++ Game Framework").

| Locale | Title |
|---|---|
| en | EFENGINE — C++ Game Engine |
| es | EFENGINE — Motor de Juegos en C++ |
| pt | EFENGINE — Motor de Jogos em C++ |
| zh | EFENGINE — C++ 游戏引擎 |

### 4.2 `desc` — subtitle under the flagship title

**en (canonical):**
> A from-scratch 3D engine in C++17 on OpenGL 4.5 Core — PBR with split-sum IBL, shadow mapping, an HDR post chain, a versioned binary scene format and a docked ImGui editor, all under RAII rules with no exceptions.

**es:**
> Motor 3D hecho desde cero en C++17 sobre OpenGL 4.5 Core — PBR con IBL split-sum, shadow mapping, cadena de post-proceso HDR, formato binario propio de escenas y un editor ImGui dockeado, todo bajo reglas RAII y sin excepciones.

`pt` and `zh` follow the same structure.

### 4.3 `description` — modal body

Two paragraphs: **what it does**, then **the rules that govern it**. This is the approved angle — capability backed by engineering discipline, rather than the old "learning low-level systems" framing.

**en (canonical):**
> EFENGINE is my most ambitious project: a 3D engine written from scratch in C++17 on OpenGL 4.5 Core. It renders PBR materials lit by point and directional lights with full image-based lighting — diffuse irradiance plus split-sum specular, both precomputed by compute shaders — over shadow mapping, a skybox and an HDR post chain of bloom, tonemap and FXAA. Scenes live in a node graph addressed by generational handles and persist to `.efe`, a chunked, versioned binary format of my own with a reader hostile to corrupt input. On top sits a docked ImGui editor: hierarchy, inspector, live material editing and scene save/load.
>
> What holds it together is a set of non-negotiable rules. Every `gl*` call is confined to `efecom`, the RHI layer — the renderer never sees OpenGL. No raw `new`/`delete` and no exceptions: ownership is a value or a `unique_ptr`, programmer errors trip an assert, recoverable failures come back as return values, and every subsystem is RAII — constructing it brings it up, destroying it tears it down.

The two paragraphs are separated by `\n\n` in the locale JSON. See §5.3 for the rendering change this requires.

### 4.4 `leadSub`

`"my most ambitious project"` → `"C++17 · OpenGL 4.5 Core"`.

The "most ambitious" line already opens the `description`; repeating it under the wordmark wastes the slot on a claim the reader is about to read again.

### 4.5 Roadmap — 7 phases, reconstructed from the gitlog

The tables in §4.5 and §4.6 give the **`es` copy**, which is the version that was reviewed and approved; `en`, `pt` and `zh` are translations of these exact rows. (§4.2 and §4.3 give `en` as canonical because that is the locale `tsc` type-checks the others against.) The **Commit window** column is provenance for the ordering and is not rendered anywhere.

| Label | Title | Description | Commit window |
|---|---|---|---|
| Fase 0 | Cimientos | CMake con FetchContent, GLFW/GLAD/GLM, Log y Assert, `Window` y `Application` con RAII de punta a punta, doctest sobre CTest. Cierra con el primer triángulo en pantalla. | May 29–31 |
| Fase 1 | Render base | `Shader`, `Texture` con stb_image, `Material`, layout de vértices y `Mesh`; cámara con órbita, pan y zoom. Los shaders pasan a cargarse desde disco. | Jun 2–14 |
| Fase 2 | Escena y luces | `Time`, `ResourceManager` con caché por clave, `Renderer` con `BeginScene`/`Submit`, luces puntuales, framebuffer y la primera UI de debug en ImGui. | Jul 14–18 |
| Fase 3 | HDR y post-proceso | Exposición en la cámara, `TonemapPass` como primer `IPostPass`, y bloom y FXAA encadenados por ping-pong entre dos framebuffers scratch. | Jul 21–22 |
| Fase 4 | OpenGL 4.5 y el RHI | Salto a 4.5 Core con DSA y shaders a `#version 450`. Nace `efecom`: ninguna llamada `gl*` vive fuera del RHI. Skybox y shadow mapping direccional. | Jul 23–24 |
| Fase 5 | Grafo, `.efe` y editor | `SceneGraph` por handles con generación, behaviors por nodo, y el formato binario `.efe` — chunkeado, versionado y con reader hostil a archivos corruptos. El sandbox se vuelve editor dockeado. | Jul 24–25 |
| **Fase 6** *(current)* | IBL completo | Irradiancia difusa más especular por split-sum: prefiltrado GGX con un dispatch por mip y BRDF LUT, ambos por compute shader. Se suman mapas de emisión y normal strength. | Jul 26 |

Labels follow each locale's existing convention: `Fase N` in `en`, `es` and `pt` (the English locale already uses the Spanish word — that is how the card ships today, and it matches how the phases are named in the engine repo), `阶段 N` in `zh`.

### 4.6 Engine systems — 6 rows (new block)

| Label | Role |
|---|---|
| efecom · RHI | La única superficie que habla con la GPU. Handles `u32` opacos, cero tipos de OpenGL en la API, backend GL 4.5 reemplazable. No depende de `efengine`. |
| renderer | PBR con luces puntuales y direccional, IBL difuso y especular, shadow pass, skybox y la `PostChain` de bloom, tonemap y FXAA. |
| scene | Grafo de nodos con handle + generación: destruir un nodo invalida sus handles viejos. Transforms jerárquicos que sólo recalculan lo dirty, y behaviors por nodo. |
| resources | Dueño de todo lo que llega de disco por path: shaders, texturas con color space explícito y modelos FBX vía Assimp. Cachea y devuelve punteros observadores. |
| serialization | El formato `.efe`: header versionado y chunks con FourCC. Un solo `Serialize(Ar&)` por tipo sirve para leer y escribir; los chunks desconocidos se saltean por tamaño. |
| sandbox | Editor ImGui dockeado tipo Unity: jerarquía, inspector, materiales en vivo, panel de render, stats de frame y guardado/carga de escenas. |

Module labels (`efecom`, `renderer`, …) are repo identifiers and stay untranslated in all four locales; only the `role` text is translated.

### 4.7 Tech stack chips

```
before:  C++17 · OpenGL 3.3 Core · GLFW · GLAD · GLM · Doctest · CMake
after:   C++17 · OpenGL 4.5 Core · PBR + IBL · Dear ImGui · Assimp · GLFW · GLM · doctest · CMake
```

`GLAD` drops out — it is a build-time detail, not a capability. `PBR + IBL`, `Dear ImGui` and `Assimp` come in.

## 5. Implementation

### 5.1 New type — `projectTypes.ts`

```ts
export interface ProjectSystem {
    /** Module name as it appears in the repo, e.g. "efecom · RHI". */
    label: string;
    role: string;
}
```

and on `Project`: `systems?: ProjectSystem[];`

Optional, like `phases` and `metrics`. No other project declares it and none is affected.

### 5.2 New component — `EngineSystems` in `ProjectPreviewModal.tsx`

A sibling of `DevelopmentRoadmap`: the same `rounded-2xl border divide-y` container, two columns instead of three, no `current` state. `label` renders in mono, `role` in body text. Returns `null` when `project.systems` is empty, so other phase-bearing cards are unaffected.

Its heading needs a new locale key, `work.modal.engineSystems`, added beside the existing `work.modal.developmentRoadmap` in all four files.

It is deliberately **not** merged with `DevelopmentRoadmap` into a shared abstraction. The two share four container class names but differ in field count and in phase state; a shared wrapper for two callers would cost more than the repetition.

### 5.3 Modal composition

The existing phase branch (`ProjectPreviewModal.tsx:575-581`) right column becomes:

```
DevelopmentRoadmap  →  EngineSystems  →  LatestCommit
```

The `description` `<p>` (`ProjectPreviewModal.tsx:530`) gains `whitespace-pre-line` so the two-paragraph copy renders as two paragraphs. Every existing description is a single paragraph, so nothing else changes visually.

### 5.4 Wiring — `FeaturedWorks.tsx`

| Line | Change |
|---|---|
| 25 | `techStack` → the 9 chips from §4.7 |
| 535 | `current: i === 2` → `current: i === arr.length - 1` |
| +536 | `systems: fp.efengine.systems,` |

The line-535 fix matters beyond this task: a fixed index would mark the wrong phase on every future update. It also brings EFENGINE in line with what `bancoProvincia` already does at line 547.

### 5.5 Locales

In `work.featured.projects.efengine` across `en/es/pt/zh.json`: rewrite `title`, `desc`, `description`, `leadSub`; grow `phases` from 3 to 7 entries; add `systems` with 6 entries. Nothing else in those files is touched.

### 5.6 Deletion

Delete `src/content/projects.ts` — zero imports, and its content already contradicts the locales for several cards. Keeping a dead twin in sync is perpetual work for no benefit. `src/components/projectTypes.ts`, which *is* used, stays.

## 6. Verification

```
pnpm build   # tsc -b validates all four locales against the en shape, then vite build
pnpm lint
pnpm test
```

Plus a visual pass over the modal in `es` and `en`, confirming that the right column — 7 roadmap rows, 6 system rows, and the Latest Commit detail — scrolls cleanly and does not overflow.

## 7. Risks

- **Modal height.** The right column roughly doubles. The modal body already scrolls; the visual pass in §6 confirms it.
- **Locale array drift.** `tsc -b` enforces key shape but not array length, so a locale could ship with 6 phases instead of 7 and still compile. The visual pass covers `en` and `es`; `pt` and `zh` are checked by reading the JSON.
- **The card will go stale again.** Fixing the hardcoded `current` index removes the worst of it, but the phase list is still a manual snapshot. Out of scope here; noted for a future pass.
