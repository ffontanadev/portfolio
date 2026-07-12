# Design — Migration Showcase & "How I Work With Agents" Section

- **Date:** 2026-07-12
- **Status:** Approved — open questions resolved with recommended defaults (see §8)
- **Author:** Felipe Fontana (with Claude Code)
- **Related:** [FeaturedWorks.tsx](../../../src/components/FeaturedWorks.tsx), [ProjectPreviewModal.tsx](../../../src/components/ProjectPreviewModal.tsx), [projectTypes.ts](../../../src/components/projectTypes.ts), [HomePage.tsx](../../../src/pages/HomePage.tsx), locale files under [src/i18n/locales](../../../src/i18n/locales)

## 1. Context

The portfolio presents the **Banco Provincia — Core Services Migration** as one professional project. Its detail modal currently shows a flat 5-row "Project Brief" (`MetricBrief`). This undersells a large, real effort: the migration of a legacy Axis2 / SOAP / Java 8 banking platform (internal name **WebBank**, 7 repositories) onto **Spring Boot 3 / REST / Java 17**, done with an AI-assisted, spec-driven methodology.

Two additions:

1. **Enrich the migration project** so its detail modal reflects the true scope of the effort, using **real figures mined from the codebase-memory knowledge graph** of the 7 indexed WebBank repos.
2. **Add a "How I Work With Agents" homepage section** that explains the AI methodology (knowledge-graph indexing, spec/plan-driven workflow, custom skills & slash commands), also anchored in real numbers.

These are related: the WebBank migration was itself executed with this methodology (superpowers specs/plans are committed inside the migrated repos), so the two additions reinforce each other.

## 2. Goals / Non-Goals

**Goals**
- Make the migration modal a credible "Migration Dossier" grounded in verifiable numbers.
- Make the 7-repo surface visible (module breakdown) — that is what conveys *effort*.
- Add an honest, well-designed AI-methodology section in the site's existing editorial language.
- Full i18n across `en`, `es`, `pt`, `zh`. No new runtime dependencies. No new routes.

**Non-Goals**
- No dedicated case-study page or route (rejected during brainstorming).
- No changes to the card grid, filters, or other projects' data.
- No live/dynamic querying of codebase-memory from the site — numbers are baked at build time (static content). They are "as of 2026-07-12".
- No claim that "AI wrote the code"; framing is disciplined human-directed augmentation.

## 3. Mined dataset (source of truth for copy)

All figures from codebase-memory on 2026-07-12; recomputed and cross-checked during implementation before commit.

### 3.1 Migration scope — 7 WebBank repos
| repo | classes | methods | nodes | edges | sql | on Spring Boot? |
|---|---|---|---|---|---|---|
| webbank-servicios-fuentes | 128 | 407 | 1,421 | 3,504 | 34 | **Yes** — `ServiciosApplication`, `/ejecutar` dispatcher, dual XML/JSON |
| webbank-servicios-plugins-fuentes | 636 | 445 | 1,940 | 3,734 | 4 | plugin library (loaded by dispatcher) |
| webbank-seguridad-fuentes | 617 | 2,722 | 7,845 | 24,864 | 5 | **Yes** — `SeguridadApplication` |
| webbank-mtxf-fuentes | 164 | 800 | 2,769 | 8,024 | 32 | message/transaction format layer |
| webbank-frontend-common | 209 | 2,352 | 5,639 | 15,764 | 0 | shared web-tier |
| webbank-frontend-fuentes | 1,623 | 9,844 | 29,726 | 121,561 | 7 | web presentation tier (largest) |
| webbank-frontend-services | 1,246 | 7,675 | 17,590 | 69,475 | 0 | web-tier service-client layer |
| **TOTAL** | **4,623** | **24,245** | **66,930** | **246,926** | **82** | 2+ modules confirmed on Boot 3 |

**Copy-facing (rounded):** 7 repositories · ~4,600 Java classes · ~24,000 methods · ~67k graph nodes · ~247k relationships · 82 SQL / stored-procedure scripts.

### 3.2 All indexed work (for the AI section)
13 repositories indexed · ~72,900 nodes · ~260,000 relationships (10 WebBank + efengine + this portfolio + truthsource).

### 3.3 Before → After (platform-level)
- Axis2 (SOAP / XML) → **Spring Boot 3** (REST / JSON)
- Java 8 → **Java 17**
- JNDI-bound resources → **managed MSSQL DataSource**
- WSDL / hand-rolled XML contracts → **OpenAPI (Swagger) + Schemathesis** contract tests

### 3.4 AI-methodology evidence (real, in-repo)
- `webbank-servicios-fuentes/docs/superpowers/plans/2026-06-10-swagger-schemathesis.md` and `.../specs/2026-06-10-swagger-schemathesis-design.md`
- This portfolio's own `docs/superpowers/plans` + `specs`
- Custom skills used: `soap-to-rest-converter`, `java-springboot-optimizer`, `modern-java-app-debugger`

## 4. Deliverable 1 — Migration Dossier (modal enrichment)

### 4.1 Type-model changes ([projectTypes.ts](../../../src/components/projectTypes.ts))
Additive only. New types + one optional field on `Project`:

```ts
export interface MetricStat { value: string; label: string; }      // "4,600" / "Java classes"
export interface MigrationModule {
  name: string;   // e.g. "servicios" (short label, not the full repo slug)
  role: string;   // one line
  scale: string;  // e.g. "29.7k nodes" or "1,623 classes"
}
export interface MigrationDossier {
  scope: MetricStat[];                       // 3–4 headline stats
  before: string[];                          // legacy bullets
  after: string[];                           // modern bullets
  modules: MigrationModule[];                // the 7 repos, one row each
  phases?: ProjectPhase[];                   // reuse existing ProjectPhase
}
// Project gains:  migration?: MigrationDossier;
```

Structural values (numbers, module names, tech tokens, `→`) are non-translatable and can live in the TSX structural data; role/phase/label prose is localized (see §6). To keep the existing "merge structural + i18n by id" pattern intact, `migration` is assembled in `FeaturedWorks` from structural bits + `fp.bancoProvincia.migration.*`, mirroring how `metrics`/`phases` are already merged.

### 4.2 Component changes ([ProjectPreviewModal.tsx](../../../src/components/ProjectPreviewModal.tsx))
- New presentational sub-component `MigrationDossier` (co-located in the modal file, matching `MetricBrief`/`DevelopmentRoadmap`).
- Right-column selection gains a first branch: `project.migration` → `<MigrationDossier />`; else existing `metrics` → `<MetricBrief />`; else `phases`; else code blocks. Banco Provincia will carry `migration` (and drop its now-redundant flat `metrics`, or keep them unused — decision: **remove `metrics` for this project** to avoid duplicate data).
- Because the dossier is taller than the current brief, it renders in the modal's existing scrollable right column; on `lg` it may span both columns if content warrants — **decision: keep it in the right column**, consistent with `MetricBrief`, to avoid a bespoke layout.

### 4.3 Dossier content blocks (top → bottom)
1. **Scope band** — 3–4 `MetricStat` tiles: `7 · repositories`, `~4,600 · Java classes`, `~24,000 · methods`, `82 · SQL scripts`. Mono labels, display-weight numbers, matching the site.
2. **Before → After** — two stacked/side-by-side lists with the coral `→` motif reused from `LeadMetricDisplay`'s migration kind. Left = legacy (Axis2 · SOAP/XML · JNDI · Java 8), right = modern (Spring Boot 3 · REST/JSON · MSSQL DataSource · Java 17).
3. **Module breakdown** — a bordered, divided list (same visual chrome as `MetricBrief`) with one row per module: **generic public label** (§8.1 mapping — never the internal repo slug), `role`, right-aligned `scale`. This is the centerpiece that conveys effort.
4. **Phases** — reuse `ProjectPhase` rows: Discovery & indexing → Service-by-service migration → Contract testing (Swagger/Schemathesis) → Cutover; final row marked `current`.

### 4.4 Card-level touch (minimal)
The card's `leadMetric` (`Axis 2 → Boot`) stays. Optionally add one mined proof-point to the card description via i18n copy (e.g. "7 repositories · ~4,600 classes"). **Decision: update the `desc` copy only**, no structural card change.

## 5. Deliverable 2 — "How I Work With Agents" section

### 5.1 Component & placement
- New `src/components/HowIWorkWithAgents.tsx`, self-contained, using the same primitives as `FeaturedWorks` (eyebrow `§`, display headline with italic coral emphasis, framer-motion reveal, mono labels).
- Inserted in [HomePage.tsx](../../../src/pages/HomePage.tsx) **between `FeaturedWorks` and `OlderWorks`**.
- Section `id="agents"` (enables future nav/anchor; nav changes are out of scope).

### 5.2 Layout
- Header: eyebrow (e.g. `§ 03 — Method`), display headline ("How I work **with agents**"), one-paragraph honest intro.
- A lead stat line anchored in real numbers: **13 repositories indexed · ~73k nodes · ~260k relationships**.
- **3 pillar cards** (responsive: 1 col mobile / 3 col `md`), each: index (`01/02/03`), title, 1–2 sentence body, and a small mono "proof" line.

### 5.3 The three pillars
1. **Knowledge-graph indexing** — *proof: 13 repos · ~73k nodes.* "I index every codebase into a memory graph so agents reason over real call chains and service contracts — not guesses. It's how the Banco Provincia migration surface (~4,600 classes) became navigable." (Public copy uses "Banco Provincia", never the internal platform name.)
2. **Spec- & plan-driven workflow** — *proof: specs & plans committed to the repo.* "Every feature starts as a brainstormed spec, then a written plan, then TDD and verification. The migration's Swagger/Schemathesis work shipped exactly this way."
3. **Custom skills & slash commands** — *proof: soap-to-rest-converter · java-springboot-optimizer.* "Purpose-built skills and commands encode repeatable workflows — SOAP→REST conversion, Spring Boot optimization, legacy-Java debugging — so the hard parts are consistent and reviewable."

Ordering note: the pillar order follows the workflow (index → plan → execute with skills). Subagents pillar intentionally omitted per brainstorming.

### 5.4 Section ordering label
Existing sections use `§ 02 — Selected Work` (featured) and `§ 03 — Archive` (older). Inserting a new section shifts numbering. **Decision:** new section = `§ 03 — Method`; renumber Older Works eyebrow to `§ 04 — Archive` and Contact to `§ 05` (Contact is already `§ 05`). Verify all `§ NN` eyebrows across locales stay consistent (see §6).

## 6. i18n plan

- **New keys, all four locales** (`en`, `es`, `pt`, `zh`):
  - `work.featured.projects.bancoProvincia.migration`: `{ scope[], before[], after[], modules[].{role}, phases[].{label,title,desc} }` (module `name`/`scale` and stat numbers stay structural; only prose is localized).
  - Top-level `agents`: `{ eyebrow, headingBefore, headingEmphasis, headingAfter, intro, leadStat.{value,label}, pillars[].{index,title,body,proof} }`.
- **Edited keys:** `work.older.eyebrow` → `§ 04 — Archive`; `work.featured.projects.bancoProvincia.desc` (add proof-point); confirm `contact.eyebrow` numbering.
- Numbers are written once (structural / English-source) and reused across locales; only surrounding words translate.
- Translations authored for all four languages (pt/es are native-market; zh mirrors structure).

## 7. Verification

- `tsc` / build passes (Vite + TS strict); ESLint clean; no `any`.
- Run the dev server and visually verify via Playwright (`webapp-testing`):
  - Banco Provincia card → modal shows the dossier (scope, before/after, modules, phases) with no overflow, light theme, at mobile + desktop widths.
  - New "How I Work With Agents" section renders between Selected Work and Older Works, 3 pillars, responsive.
  - Language switch (en/es/pt/zh) renders all new copy with no missing keys.
- Re-verify mined numbers against codebase-memory immediately before commit; if a repo was re-indexed and counts drifted, update copy.

## 8. Resolved decisions

1. **Confidentiality → generic public labels (LOCKED).** The public site never shows internal repo slugs. The 7 modules render under generic labels; the real *numbers* are kept. Mapping:

   | internal repo | public module label |
   |---|---|
   | webbank-servicios-fuentes | **Core Services** (SOAP→REST dispatcher) |
   | webbank-servicios-plugins-fuentes | **Service Plugins** |
   | webbank-seguridad-fuentes | **Security** |
   | webbank-mtxf-fuentes | **Messaging & Transaction Format** |
   | webbank-frontend-common | **Web Tier — Common** |
   | webbank-frontend-fuentes | **Web Tier — Core** |
   | webbank-frontend-services | **Web Tier — Services** |

   "Banco Provincia" itself stays (already public in the current portfolio). No internal service names, endpoints, or table names appear anywhere in copy.
2. **Module roles** — descriptions authored from graph structure; `mtxf` and the web-tier split are best-effort. The user may correct any role line during implementation review; not a blocker.
3. **Migration status** — copy says "2+ modules on Spring Boot 3" (only Core Services + Security confirmed) and frames the rest as in-flight. No over-claiming.
4. **"SQL / stored-procedure scripts"** — 82 `.sql` files counted; framed conservatively as scripts.
5. **Numbers baked at build time**, labeled "as of 2026-07" where a timestamp reads naturally. Acceptable for a portfolio.

## 9. Out of scope
Nav/anchor links to the new section; dynamic/live metrics; changes to other projects; the Additional/OlderWorks data; automated tests beyond build + visual verification.
