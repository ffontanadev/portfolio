# Migration Showcase & "How I Work With Agents" Section — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the Banco Provincia project's detail modal with a real, mined "Migration Dossier" and add a new "How I Work With Agents" homepage section — both in the site's existing editorial design system.

**Architecture:** Additive-only. Extend the `Project` type with an optional `migration` dossier, render it via a new `MigrationDossier` sub-component in the existing modal, and assemble it in `FeaturedWorks` from i18n (matching the existing `metrics`/`phases` merge pattern). Add a self-contained `HowIWorkWithAgents` section component to `HomePage`. All copy is localized across the four locales.

**Tech Stack:** React 19, TypeScript (strict), Vite 7, Tailwind v4, framer-motion, a custom i18n layer (`useTranslation`, `messages` tree typed from `en.json`).

## Global Constraints

Every task's requirements implicitly include this section.

- **No test framework exists in this repo** (no vitest/jest; scripts are `dev`, `build` = `tsc -b && vite build`, `lint` = `eslint .`). Do **not** introduce a test harness. Each task's verification is: `npx tsc -b` clean, `npm run lint` clean, and — for UI tasks — visual verification against the running dev server (Playwright / webapp-testing).
- **No `any`.** TypeScript strict must pass.
- **No new dependencies** (runtime or dev).
- **`en.json` is the source of truth for the i18n type** (`Messages = typeof en`; `messages` uses `satisfies Record<string, Messages>`). Any key added to `en.json` MUST be added with the identical shape to `es.json`, `pt.json`, `zh.json` in the same task, or the build breaks.
- **Confidentiality:** Never use internal repo slugs (`webbank-*`, `servicios`, `seguridad`, `mtxf`, `fuentes`) or internal service/table/endpoint names in any copy. Use only the generic public module labels defined in Task 3. "Banco Provincia" is allowed (already public on the site).
- **Numbers are baked at build time**, "as of 2026-07". Values are the mined figures in this plan; do not invent others.
- **Follow existing editorial classes** (`text-eyebrow`, `font-display`, `font-display-md`, `font-display-italic`, `text-coral-500`, `text-dark-900`, `bg-cream-*`, mono labels). Mirror `FeaturedWorks` section chrome.
- **Translation rule for new keys:** translate prose (headings, labels, roles, phase titles/descriptions, intro, pillar titles/bodies). Keep **identical across all locales**: pure numbers (`scope[].value`, `phases[].label`, `pillars[].index`), product-style module `label`s, tech tokens in before/after `items`, skill-name `proof` lines, `leadStat.value`, and the `§ NN —` prefix of eyebrows. Keep digit grouping exactly as written (e.g. `1,623`) in every locale.

---

## File Structure

- **Modify** `src/components/projectTypes.ts` — add `MetricStat`, `MigrationBeforeAfter`, `MigrationModule`, `MigrationDossier`; add optional `migration?` to `Project`. (Task 1)
- **Modify** `src/components/ProjectPreviewModal.tsx` — add `MigrationDossier` sub-component; add a `project.migration` branch as the first option in the right-column selector. (Task 2)
- **Modify** `src/i18n/locales/{en,es,pt,zh}.json` — add `work.featured.projects.bancoProvincia.migration`, remove that project's `metrics`, update its `desc`. (Task 3)
- **Modify** `src/components/FeaturedWorks.tsx` — build `migration` for `bancoProvincia` from i18n; drop its `metrics` merge; add `migration` to the `ProjectStructural` `Omit`. (Task 3)
- **Modify** `src/i18n/locales/{en,es,pt,zh}.json` — add top-level `agents` block; renumber `work.older.eyebrow` to `§ 04 — Archive`. (Task 4)
- **Create** `src/components/HowIWorkWithAgents.tsx` — the new section. (Task 5)
- **Modify** `src/pages/HomePage.tsx` — insert `<HowIWorkWithAgents />` between `<FeaturedWorks />` and `<OlderWorks />`. (Task 5)

---

## Task 1: Migration dossier types

**Files:**
- Modify: `src/components/projectTypes.ts`

**Interfaces:**
- Consumes: existing `ProjectPhase` (`{ label; title; desc; current? }`), `Project`.
- Produces: `MetricStat`, `MigrationBeforeAfter`, `MigrationModule`, `MigrationDossier`; `Project.migration?: MigrationDossier`.

- [ ] **Step 1: Add the dossier types after the existing `ProjectPhase` interface**

In `src/components/projectTypes.ts`, immediately after the `ProjectPhase` interface (currently ends at line 20), insert:

```ts
export interface MetricStat {
    value: string;
    label: string;
}

export interface MigrationBeforeAfter {
    heading: string;
    items: string[];
}

export interface MigrationModule {
    label: string;
    role: string;
    scale: string;
}

export interface MigrationDossier {
    scope: MetricStat[];
    before: MigrationBeforeAfter;
    after: MigrationBeforeAfter;
    modulesHeading: string;
    modules: MigrationModule[];
    phasesHeading: string;
    phases: ProjectPhase[];
}
```

- [ ] **Step 2: Add the optional field to `Project`**

In the `Project` interface, add after the `phases?: ProjectPhase[];` line:

```ts
    migration?: MigrationDossier;
```

- [ ] **Step 3: Type-check**

Run: `npx tsc -b`
Expected: no errors (additive types, nothing references them yet).

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/projectTypes.ts
git commit -m "feat(work): add MigrationDossier types"
```

---

## Task 2: `MigrationDossier` component + modal branch

**Files:**
- Modify: `src/components/ProjectPreviewModal.tsx`

**Interfaces:**
- Consumes: `Project.migration?: MigrationDossier` (Task 1); existing `useTranslation`; existing visual chrome from `MetricBrief`/`DevelopmentRoadmap`.
- Produces: internal `MigrationDossier` component; new first branch in the modal's right column keyed on `project.migration`.

- [ ] **Step 1: Import the type**

In `src/components/ProjectPreviewModal.tsx`, extend the existing type import (line 12) to include `MigrationDossier`:

```ts
import type { Project, CodeBlock, ProjectLeadMetric, ProjectLogo, MigrationDossier } from './projectTypes';
```

- [ ] **Step 2: Add the `MigrationDossier` component**

Immediately before the `DevelopmentRoadmap` component definition (currently line 276), insert. It reuses the exact card chrome of `MetricBrief` (bordered, divided list) and the coral `→` motif:

```tsx
const MigrationStatTiles = ({ stats }: { stats: MigrationDossier['scope'] }) => (
    <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
            <div key={i} className="rounded-xl border border-dark-900/10 bg-cream-50/40 px-4 py-3">
                <div className="font-display font-bold text-2xl md:text-3xl tracking-[-0.03em] text-dark-900 leading-none">
                    {s.value}
                </div>
                <div className="mt-1.5 font-mono text-[10px] tracking-[0.18em] uppercase text-dark-900/55">
                    {s.label}
                </div>
            </div>
        ))}
    </div>
);

const MigrationDossierView = ({ dossier }: { dossier: MigrationDossier }) => (
    <div className="space-y-8">
        <MigrationStatTiles stats={dossier.scope} />

        {/* Before -> After */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
            {[dossier.before, dossier.after].map((col, idx) => (
                <div key={idx} className={idx === 0 ? '' : 'col-start-3'}>
                    <h4 className="font-mono text-[10px] tracking-[0.22em] uppercase text-dark-900/55 mb-3">
                        {col.heading}
                    </h4>
                    <ul className="space-y-2">
                        {col.items.map((item, i) => (
                            <li
                                key={i}
                                className={`text-sm leading-snug ${
                                    idx === 0 ? 'text-dark-900/50 line-through decoration-dark-900/20' : 'text-dark-900 font-medium'
                                }`}
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            <span
                className="col-start-2 row-start-1 self-center font-display-italic text-coral-500 text-3xl font-light pt-6"
                style={{ fontStyle: 'italic' }}
                aria-hidden="true"
            >
                &rarr;
            </span>
        </div>

        {/* Module breakdown */}
        <div>
            <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-dark-900/55 mb-4">
                {dossier.modulesHeading}
            </h3>
            <div className="rounded-2xl border border-dark-900/10 divide-y divide-dark-900/[0.07] overflow-hidden bg-cream-50/40">
                {dossier.modules.map((m, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-4 px-5 py-3.5">
                        <div className="min-w-0">
                            <p className="font-display text-base md:text-lg tracking-tight text-dark-900 font-medium">
                                {m.label}
                            </p>
                            <p className="mt-0.5 text-sm text-dark-900/55 leading-snug">{m.role}</p>
                        </div>
                        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-dark-900/55 shrink-0">
                            {m.scale}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* Phases */}
        <div>
            <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-dark-900/55 mb-4">
                {dossier.phasesHeading}
            </h3>
            <div className="rounded-2xl border border-dark-900/10 divide-y divide-dark-900/[0.07] overflow-hidden bg-cream-50/40">
                {dossier.phases.map((phase, i) => (
                    <div key={i} className="flex items-start gap-4 px-5 py-4">
                        <span
                            className={`font-mono text-[10px] tracking-[0.2em] uppercase shrink-0 mt-1 ${
                                phase.current ? 'text-coral-500 font-semibold' : 'text-dark-900/45'
                            }`}
                        >
                            {phase.label}
                        </span>
                        <div className="min-w-0">
                            <p
                                className={`font-display text-lg tracking-tight ${
                                    phase.current ? 'text-coral-500 font-semibold' : 'text-dark-900 font-medium'
                                }`}
                            >
                                {phase.title}
                            </p>
                            <p className="mt-1 text-sm text-dark-900/55 leading-relaxed">{phase.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
```

- [ ] **Step 3: Add the branch to the modal's right column**

In `ProjectPreviewModal`, the right-column selector currently begins (line ~468):

```tsx
                                    {project.category === 'professional' && project.metrics?.length ? (
                                        <MetricBrief project={project} />
```

Change it so `migration` is checked first:

```tsx
                                    {project.migration ? (
                                        <MigrationDossierView dossier={project.migration} />
                                    ) : project.category === 'professional' && project.metrics?.length ? (
                                        <MetricBrief project={project} />
```

(Leave the remaining `: project.phases?.length ? (...)  : (...)` chain unchanged.)

- [ ] **Step 4: Type-check**

Run: `npx tsc -b`
Expected: no errors. (The branch is dormant — no project sets `migration` yet.)

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/ProjectPreviewModal.tsx
git commit -m "feat(work): render MigrationDossier in project modal"
```

---

## Task 3: Migration content (4 locales) + FeaturedWorks wiring

This task is coupled by the type system: removing `bancoProvincia.metrics` from `en.json` while `FeaturedWorks` still references it would break the build, so the i18n edits and the `FeaturedWorks` edit land together.

**Files:**
- Modify: `src/i18n/locales/en.json`, `es.json`, `pt.json`, `zh.json`
- Modify: `src/components/FeaturedWorks.tsx`

**Interfaces:**
- Consumes: `MigrationDossier` shape (Task 1); the modal branch (Task 2).
- Produces: `messages.work.featured.projects.bancoProvincia.migration` (typed `MigrationDossier`-compatible); `bancoProvincia` project carries `migration`, not `metrics`.

- [ ] **Step 1: en.json — replace `bancoProvincia.metrics` with `migration` and update `desc`**

In `src/i18n/locales/en.json`, within `work.featured.projects.bancoProvincia`: (a) replace the `"desc"` value, (b) delete the entire `"metrics": [ ... ]` array, (c) add the `"migration"` object. Resulting block:

```json
        "bancoProvincia": {
          "title": "Banco Provincia — Core Services Migration",
          "desc": "Lifting Banco Provincia's legacy Axis2 / Java 8 web services into a modern Spring Boot 3 platform on Java 17 — 7 repositories, ~4,600 classes — with connectivity rewired from JNDI to a managed MSSQL DataSource.",
          "role": "Backend Engineer",
          "description": "Long-running modernization of legacy Axis2 SOAP services that power core banking integrations at Banco Provincia. The work covers migrating the runtime from Java 8 to Java 17 + Spring Boot 3, replacing JNDI-bound resources with a managed MSSQL DataSource, and untangling years of tightly-coupled web service contracts — all while preserving downstream consumers.",
          "migration": {
            "scope": [
              { "value": "7", "label": "repositories" },
              { "value": "~4,600", "label": "Java classes" },
              { "value": "~24,000", "label": "methods" },
              { "value": "82", "label": "SQL scripts" }
            ],
            "before": {
              "heading": "Before",
              "items": ["Axis2 · SOAP / XML", "JNDI-bound resources", "Java 8 runtime", "Hand-rolled XML contracts"]
            },
            "after": {
              "heading": "After",
              "items": ["Spring Boot 3 · REST / JSON", "Managed MSSQL DataSource", "Java 17 runtime", "OpenAPI + Schemathesis tests"]
            },
            "modulesHeading": "Modules migrated",
            "modules": [
              { "label": "Core Services", "role": "SOAP→REST dispatcher with dual XML/JSON responses.", "scale": "128 classes" },
              { "label": "Service Plugins", "role": "Per-service business logic loaded by the dispatcher.", "scale": "636 classes" },
              { "label": "Security", "role": "Authentication, sessions and access control.", "scale": "617 classes" },
              { "label": "Messaging & Transaction Format", "role": "Banking message contracts and transaction formatting.", "scale": "164 classes" },
              { "label": "Web Tier — Common", "role": "Shared web-tier contracts and utilities.", "scale": "209 classes" },
              { "label": "Web Tier — Core", "role": "The presentation tier — the platform's largest surface.", "scale": "1,623 classes" },
              { "label": "Web Tier — Services", "role": "Service-client layer between the web tier and backend.", "scale": "1,246 classes" }
            ],
            "phasesHeading": "Migration path",
            "phases": [
              { "label": "01", "title": "Discovery & indexing", "desc": "Index all seven repositories into a knowledge graph to map the real service and call surface." },
              { "label": "02", "title": "Service-by-service migration", "desc": "Lift modules onto Spring Boot 3 and Java 17, rewire JNDI to a managed MSSQL DataSource, and preserve SOAP contracts via dual XML/JSON." },
              { "label": "03", "title": "Contract testing", "desc": "OpenAPI (Swagger) definitions with Schemathesis property and fuzz testing to guarantee parity with the legacy services." },
              { "label": "04", "title": "Cutover", "desc": "Module by module — Core Services and Security are live on Spring Boot 3; the rest are in flight." }
            ]
          }
        },
```

- [ ] **Step 2: es.json — same structural change, translated prose**

Replace `bancoProvincia`'s `desc` and `metrics` with the block below (labels/headings/roles/phases translated; numbers, module labels, tech tokens kept identical per the Global translation rule):

```json
        "bancoProvincia": {
          "title": "Banco Provincia — Migración de servicios core",
          "desc": "Migración de los servicios web legados Axis2 / Java 8 de Banco Provincia a una plataforma moderna Spring Boot 3 sobre Java 17 — 7 repositorios, ~4,600 clases — con la conectividad reescrita de JNDI a un MSSQL DataSource gestionado.",
          "role": "Backend Engineer",
          "description": "Modernización de largo aliento de servicios SOAP Axis2 legados que sostienen integraciones bancarias core en Banco Provincia. El trabajo abarca migrar el runtime de Java 8 a Java 17 + Spring Boot 3, reemplazar recursos ligados a JNDI por un MSSQL DataSource gestionado, y desenredar años de contratos de servicios web fuertemente acoplados — preservando siempre a los consumidores.",
          "migration": {
            "scope": [
              { "value": "7", "label": "repositorios" },
              { "value": "~4,600", "label": "clases Java" },
              { "value": "~24,000", "label": "métodos" },
              { "value": "82", "label": "scripts SQL" }
            ],
            "before": {
              "heading": "Antes",
              "items": ["Axis2 · SOAP / XML", "Recursos ligados a JNDI", "Runtime Java 8", "Contratos XML artesanales"]
            },
            "after": {
              "heading": "Después",
              "items": ["Spring Boot 3 · REST / JSON", "MSSQL DataSource gestionado", "Runtime Java 17", "Tests OpenAPI + Schemathesis"]
            },
            "modulesHeading": "Módulos migrados",
            "modules": [
              { "label": "Core Services", "role": "Despachador SOAP→REST con respuestas duales XML/JSON.", "scale": "128 clases" },
              { "label": "Service Plugins", "role": "Lógica de negocio por servicio cargada por el despachador.", "scale": "636 clases" },
              { "label": "Security", "role": "Autenticación, sesiones y control de acceso.", "scale": "617 clases" },
              { "label": "Messaging & Transaction Format", "role": "Contratos de mensajes bancarios y formato de transacciones.", "scale": "164 clases" },
              { "label": "Web Tier — Common", "role": "Contratos y utilidades compartidas de la capa web.", "scale": "209 clases" },
              { "label": "Web Tier — Core", "role": "La capa de presentación — la mayor superficie de la plataforma.", "scale": "1,623 clases" },
              { "label": "Web Tier — Services", "role": "Capa cliente de servicios entre la capa web y el backend.", "scale": "1,246 clases" }
            ],
            "phasesHeading": "Ruta de migración",
            "phases": [
              { "label": "01", "title": "Descubrimiento e indexado", "desc": "Indexar los siete repositorios en un grafo de conocimiento para mapear la superficie real de servicios y llamadas." },
              { "label": "02", "title": "Migración servicio por servicio", "desc": "Llevar los módulos a Spring Boot 3 y Java 17, reescribir JNDI a un MSSQL DataSource gestionado y preservar los contratos SOAP con XML/JSON dual." },
              { "label": "03", "title": "Testing de contratos", "desc": "Definiciones OpenAPI (Swagger) con testing de propiedades y fuzzing Schemathesis para garantizar paridad con los servicios legados." },
              { "label": "04", "title": "Cutover", "desc": "Módulo a módulo — Core Services y Security ya viven en Spring Boot 3; el resto está en curso." }
            ]
          }
        },
```

- [ ] **Step 3: pt.json — same structural change, translated prose**

```json
        "bancoProvincia": {
          "title": "Banco Provincia — Migração de serviços core",
          "desc": "Migração dos serviços web legados Axis2 / Java 8 do Banco Provincia para uma plataforma moderna Spring Boot 3 em Java 17 — 7 repositórios, ~4,600 classes — com a conectividade reescrita de JNDI para um MSSQL DataSource gerenciado.",
          "role": "Backend Engineer",
          "description": "Modernização de longo prazo de serviços SOAP Axis2 legados que sustentam integrações bancárias core no Banco Provincia. O trabalho cobre migrar o runtime de Java 8 para Java 17 + Spring Boot 3, substituir recursos ligados a JNDI por um MSSQL DataSource gerenciado e desemaranhar anos de contratos de serviços web fortemente acoplados — sempre preservando os consumidores.",
          "migration": {
            "scope": [
              { "value": "7", "label": "repositórios" },
              { "value": "~4,600", "label": "classes Java" },
              { "value": "~24,000", "label": "métodos" },
              { "value": "82", "label": "scripts SQL" }
            ],
            "before": {
              "heading": "Antes",
              "items": ["Axis2 · SOAP / XML", "Recursos ligados a JNDI", "Runtime Java 8", "Contratos XML feitos à mão"]
            },
            "after": {
              "heading": "Depois",
              "items": ["Spring Boot 3 · REST / JSON", "MSSQL DataSource gerenciado", "Runtime Java 17", "Testes OpenAPI + Schemathesis"]
            },
            "modulesHeading": "Módulos migrados",
            "modules": [
              { "label": "Core Services", "role": "Despachante SOAP→REST com respostas duplas XML/JSON.", "scale": "128 classes" },
              { "label": "Service Plugins", "role": "Lógica de negócio por serviço carregada pelo despachante.", "scale": "636 classes" },
              { "label": "Security", "role": "Autenticação, sessões e controle de acesso.", "scale": "617 classes" },
              { "label": "Messaging & Transaction Format", "role": "Contratos de mensagens bancárias e formatação de transações.", "scale": "164 classes" },
              { "label": "Web Tier — Common", "role": "Contratos e utilitários compartilhados da camada web.", "scale": "209 classes" },
              { "label": "Web Tier — Core", "role": "A camada de apresentação — a maior superfície da plataforma.", "scale": "1,623 classes" },
              { "label": "Web Tier — Services", "role": "Camada cliente de serviços entre a camada web e o backend.", "scale": "1,246 classes" }
            ],
            "phasesHeading": "Caminho da migração",
            "phases": [
              { "label": "01", "title": "Descoberta e indexação", "desc": "Indexar os sete repositórios em um grafo de conhecimento para mapear a superfície real de serviços e chamadas." },
              { "label": "02", "title": "Migração serviço a serviço", "desc": "Levar os módulos para Spring Boot 3 e Java 17, reescrever JNDI para um MSSQL DataSource gerenciado e preservar os contratos SOAP via XML/JSON duplo." },
              { "label": "03", "title": "Testes de contrato", "desc": "Definições OpenAPI (Swagger) com testes de propriedade e fuzzing Schemathesis para garantir paridade com os serviços legados." },
              { "label": "04", "title": "Cutover", "desc": "Módulo a módulo — Core Services e Security já rodam em Spring Boot 3; o restante está em andamento." }
            ]
          }
        },
```

- [ ] **Step 4: zh.json — same structural change, translated prose**

```json
        "bancoProvincia": {
          "title": "Banco Provincia — 核心服务迁移",
          "desc": "将 Banco Provincia 遗留的 Axis2 / Java 8 Web 服务迁移到基于 Java 17 的现代 Spring Boot 3 平台 —— 7 个代码库、约 4,600 个类 —— 并将数据库连接从 JNDI 改写为托管的 MSSQL DataSource。",
          "role": "后端工程师",
          "description": "对支撑 Banco Provincia 核心银行集成的遗留 Axis2 SOAP 服务进行长期现代化改造。工作内容包括将运行时从 Java 8 迁移到 Java 17 + Spring Boot 3、以托管的 MSSQL DataSource 替换 JNDI 绑定资源，并理清多年来紧耦合的 Web 服务契约 —— 同时始终保持下游消费方可用。",
          "migration": {
            "scope": [
              { "value": "7", "label": "代码库" },
              { "value": "~4,600", "label": "Java 类" },
              { "value": "~24,000", "label": "方法" },
              { "value": "82", "label": "SQL 脚本" }
            ],
            "before": {
              "heading": "迁移前",
              "items": ["Axis2 · SOAP / XML", "JNDI 绑定资源", "Java 8 运行时", "手写的 XML 契约"]
            },
            "after": {
              "heading": "迁移后",
              "items": ["Spring Boot 3 · REST / JSON", "托管的 MSSQL DataSource", "Java 17 运行时", "OpenAPI + Schemathesis 测试"]
            },
            "modulesHeading": "已迁移模块",
            "modules": [
              { "label": "Core Services", "role": "SOAP→REST 调度器，支持 XML/JSON 双响应。", "scale": "128 类" },
              { "label": "Service Plugins", "role": "由调度器加载的各服务业务逻辑。", "scale": "636 类" },
              { "label": "Security", "role": "认证、会话与访问控制。", "scale": "617 类" },
              { "label": "Messaging & Transaction Format", "role": "银行报文契约与交易格式化。", "scale": "164 类" },
              { "label": "Web Tier — Common", "role": "Web 层共享契约与工具。", "scale": "209 类" },
              { "label": "Web Tier — Core", "role": "表现层 —— 平台最大的代码面。", "scale": "1,623 类" },
              { "label": "Web Tier — Services", "role": "Web 层与后端之间的服务客户端层。", "scale": "1,246 类" }
            ],
            "phasesHeading": "迁移路径",
            "phases": [
              { "label": "01", "title": "梳理与索引", "desc": "将全部七个代码库索引进知识图谱，映射出真实的服务与调用面。" },
              { "label": "02", "title": "逐服务迁移", "desc": "将模块迁移到 Spring Boot 3 与 Java 17，把 JNDI 改写为托管的 MSSQL DataSource，并通过 XML/JSON 双响应保留 SOAP 契约。" },
              { "label": "03", "title": "契约测试", "desc": "以 OpenAPI（Swagger）定义配合 Schemathesis 属性与模糊测试，确保与遗留服务保持一致。" },
              { "label": "04", "title": "切换上线", "desc": "逐个模块推进 —— Core Services 与 Security 已在 Spring Boot 3 上线，其余仍在进行中。" }
            ]
          }
        },
```

- [ ] **Step 5: Rewire `FeaturedWorks.tsx`**

In `src/components/FeaturedWorks.tsx`:

(a) Add `migration` to the `ProjectStructural` `Omit` (line 17) so structural data never carries it:

```ts
type ProjectStructural = Omit<Project, 'title' | 'desc' | 'role' | 'description' | 'phases' | 'metrics' | 'migration'> & {
  id: string;
};
```

(b) In the `projects` useMemo, replace the `bancoProvincia` merge object's `metrics` line with a `migration` builder (sets the final phase as `current`):

```tsx
      {
        ...byId.bancoProvincia,
        title: fp.bancoProvincia.title,
        desc: fp.bancoProvincia.desc,
        role: fp.bancoProvincia.role,
        description: fp.bancoProvincia.description,
        migration: {
          ...fp.bancoProvincia.migration,
          phases: fp.bancoProvincia.migration.phases.map((ph, i, arr) => ({
            ...ph,
            current: i === arr.length - 1,
          })),
        },
      },
```

- [ ] **Step 6: Type-check (proves all four locales share shape and the merge is type-correct)**

Run: `npx tsc -b`
Expected: no errors. If tsc reports a locale-shape mismatch, a key was mistyped in one of es/pt/zh — fix it to match `en.json` exactly.

- [ ] **Step 7: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 8: Visual checkpoint (dev server)**

Run: `npm run dev` and open the site. Click the **Banco Provincia** card. Verify the modal's right column shows: 4 stat tiles, Before→After with the coral arrow, the 7-row module breakdown, and the 4 phases (last one coral/"current"). No horizontal overflow at desktop and mobile widths. Switch language (en/es/pt/zh) — all dossier copy renders with no missing-key errors in the console.

- [ ] **Step 9: Commit**

```bash
git add src/i18n/locales/en.json src/i18n/locales/es.json src/i18n/locales/pt.json src/i18n/locales/zh.json src/components/FeaturedWorks.tsx
git commit -m "feat(work): real migration dossier for Banco Provincia (4 locales)"
```

---

## Task 4: "Agents" i18n content (4 locales) + eyebrow renumber

**Files:**
- Modify: `src/i18n/locales/en.json`, `es.json`, `pt.json`, `zh.json`

**Interfaces:**
- Produces: top-level `messages.agents` (`{ eyebrow, headingBefore, headingEmphasis, headingAfter, intro, leadStat: { value, label }, pillars: { index, title, body, proof }[] }`), consumed by Task 5. Renumbered `work.older.eyebrow`.

- [ ] **Step 1: en.json — add the `agents` block and renumber older eyebrow**

(a) Change `work.older.eyebrow` (line 327) from `"§ 03 — Archive"` to `"§ 04 — Archive"`.

(b) Add a new top-level key `agents` (sibling of `work`, `contact`, etc. — insert it right after the closing `}` of the `work` block, before `contact`):

```json
  "agents": {
    "eyebrow": "§ 03 — Method",
    "headingBefore": "How I work",
    "headingEmphasis": "with agents",
    "headingAfter": "",
    "intro": "AI isn't a magic wand here — it's a disciplined force-multiplier under tight human direction. Three practices keep it reliable.",
    "leadStat": {
      "value": "13 repos · ~73k nodes · ~260k relationships",
      "label": "indexed into memory"
    },
    "pillars": [
      {
        "index": "01",
        "title": "Knowledge-graph indexing",
        "body": "I index every codebase into a memory graph so agents reason over real call chains and service contracts — not guesses. It's how the Banco Provincia migration surface (~4,600 classes) became navigable.",
        "proof": "13 repos · ~73k nodes"
      },
      {
        "index": "02",
        "title": "Spec- & plan-driven workflow",
        "body": "Every feature starts as a brainstormed spec, then a written plan, then implementation and verification — each committed to the repo. The migration's contract-testing work shipped exactly this way.",
        "proof": "specs & plans in-repo"
      },
      {
        "index": "03",
        "title": "Custom skills & slash commands",
        "body": "Purpose-built skills encode the hard, repeatable workflows — SOAP→REST conversion, Spring Boot optimization, legacy-Java debugging — so they stay consistent and reviewable.",
        "proof": "soap-to-rest-converter · java-springboot-optimizer"
      }
    ]
  },
```

- [ ] **Step 2: es.json — add translated `agents`; older eyebrow → `§ 04 — Archivo`**

```json
  "agents": {
    "eyebrow": "§ 03 — Método",
    "headingBefore": "Cómo trabajo",
    "headingEmphasis": "con agentes",
    "headingAfter": "",
    "intro": "La IA no es magia aquí — es un multiplicador de fuerza disciplinado bajo estricta dirección humana. Tres prácticas la mantienen confiable.",
    "leadStat": {
      "value": "13 repos · ~73k nodes · ~260k relationships",
      "label": "indexados en memoria"
    },
    "pillars": [
      {
        "index": "01",
        "title": "Indexado en grafo de conocimiento",
        "body": "Indexo cada código en un grafo de memoria para que los agentes razonen sobre cadenas de llamadas y contratos reales — no suposiciones. Así la superficie de migración de Banco Provincia (~4,600 clases) se volvió navegable.",
        "proof": "13 repos · ~73k nodes"
      },
      {
        "index": "02",
        "title": "Flujo guiado por specs y planes",
        "body": "Cada feature empieza como un spec, luego un plan escrito, luego implementación y verificación — todo versionado en el repo. El testing de contratos de la migración se hizo exactamente así.",
        "proof": "specs & plans in-repo"
      },
      {
        "index": "03",
        "title": "Skills y comandos a medida",
        "body": "Skills hechos a medida codifican los flujos difíciles y repetibles — conversión SOAP→REST, optimización de Spring Boot, debugging de Java legado — para que sean consistentes y revisables.",
        "proof": "soap-to-rest-converter · java-springboot-optimizer"
      }
    ]
  },
```

- [ ] **Step 3: pt.json — add translated `agents`; older eyebrow → `§ 04 — Arquivo`**

```json
  "agents": {
    "eyebrow": "§ 03 — Método",
    "headingBefore": "Como eu trabalho",
    "headingEmphasis": "com agentes",
    "headingAfter": "",
    "intro": "IA não é mágica aqui — é um multiplicador de força disciplinado sob rígida direção humana. Três práticas a mantêm confiável.",
    "leadStat": {
      "value": "13 repos · ~73k nodes · ~260k relationships",
      "label": "indexados em memória"
    },
    "pillars": [
      {
        "index": "01",
        "title": "Indexação em grafo de conhecimento",
        "body": "Indexo cada código em um grafo de memória para que os agentes raciocinem sobre cadeias de chamadas e contratos reais — não suposições. Foi assim que a superfície de migração do Banco Provincia (~4,600 classes) ficou navegável.",
        "proof": "13 repos · ~73k nodes"
      },
      {
        "index": "02",
        "title": "Fluxo guiado por specs e planos",
        "body": "Cada feature começa como um spec, depois um plano escrito, depois implementação e verificação — tudo versionado no repo. Os testes de contrato da migração foram feitos exatamente assim.",
        "proof": "specs & plans in-repo"
      },
      {
        "index": "03",
        "title": "Skills e comandos sob medida",
        "body": "Skills sob medida codificam os fluxos difíceis e repetíveis — conversão SOAP→REST, otimização de Spring Boot, debugging de Java legado — para que sejam consistentes e revisáveis.",
        "proof": "soap-to-rest-converter · java-springboot-optimizer"
      }
    ]
  },
```

- [ ] **Step 4: zh.json — add translated `agents`; older eyebrow → `§ 04 — 存档`**

```json
  "agents": {
    "eyebrow": "§ 03 — 方法",
    "headingBefore": "我如何",
    "headingEmphasis": "与智能体协作",
    "headingAfter": "",
    "intro": "这里的 AI 不是魔法 —— 而是在严格人为主导下的、有纪律的力量倍增器。三条实践让它保持可靠。",
    "leadStat": {
      "value": "13 repos · ~73k nodes · ~260k relationships",
      "label": "已索引进记忆"
    },
    "pillars": [
      {
        "index": "01",
        "title": "知识图谱索引",
        "body": "我把每个代码库都索引进记忆图谱，让智能体基于真实的调用链与服务契约推理，而非猜测。正是如此，Banco Provincia 的迁移代码面（约 4,600 个类）才变得可导航。",
        "proof": "13 repos · ~73k nodes"
      },
      {
        "index": "02",
        "title": "以规格与计划驱动的流程",
        "body": "每个功能都从头脑风暴的规格开始，再到书面计划，再到实现与验证 —— 每一步都提交进仓库。这次迁移的契约测试正是这样交付的。",
        "proof": "specs & plans in-repo"
      },
      {
        "index": "03",
        "title": "定制技能与斜杠命令",
        "body": "定制技能把困难、可复用的流程固化下来 —— SOAP→REST 转换、Spring Boot 优化、遗留 Java 调试 —— 让它们保持一致且可审查。",
        "proof": "soap-to-rest-converter · java-springboot-optimizer"
      }
    ]
  },
```

- [ ] **Step 5: Validate JSON + type-check**

Run: `npx tsc -b`
Expected: no errors (all four locales now expose an identically-shaped `agents` block, so `Messages` gains it cleanly). A shape-mismatch error means a locale's `agents` differs from `en.json` — fix to match.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/i18n/locales/en.json src/i18n/locales/es.json src/i18n/locales/pt.json src/i18n/locales/zh.json
git commit -m "feat(agents): add How-I-Work-With-Agents copy (4 locales); renumber archive eyebrow"
```

---

## Task 5: `HowIWorkWithAgents` section + HomePage insertion

**Files:**
- Create: `src/components/HowIWorkWithAgents.tsx`
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `messages.agents` + `t()` (Task 4); `useTranslation` from `@/i18n`.
- Produces: default-exported `HowIWorkWithAgents` React component; rendered between `FeaturedWorks` and `OlderWorks`.

- [ ] **Step 1: Create the component**

Create `src/components/HowIWorkWithAgents.tsx` with exactly:

```tsx
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';

const ease = [0.22, 1, 0.36, 1] as const;

const HowIWorkWithAgents = () => {
  const { t, messages } = useTranslation();
  const pillars = messages.agents.pillars;

  return (
    <section
      id="agents"
      className="relative py-32 md:py-40 px-6 md:px-20 max-w-[1440px] mx-auto"
    >
      {/* Header */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-eyebrow text-coral-500">{t('agents.eyebrow')}</span>
          <span className="h-px flex-1 max-w-[140px] bg-dark-900/15" />
        </div>
        <h2 className="font-display font-display-md font-bold tracking-[-0.02em] text-4xl md:text-6xl leading-[1.05] max-w-3xl text-dark-900">
          {t('agents.headingBefore')}{' '}
          <span className="font-display-italic text-coral-500" style={{ fontStyle: 'italic' }}>
            {t('agents.headingEmphasis')}
          </span>
          {t('agents.headingAfter') ? ` ${t('agents.headingAfter')}` : ''}
        </h2>
        <p className="mt-6 max-w-xl text-lg text-dark-900/55 font-light leading-relaxed">
          {t('agents.intro')}
        </p>
        <div className="mt-8 flex items-baseline gap-3 flex-wrap">
          <span className="font-display font-bold text-xl md:text-2xl tracking-[-0.02em] text-dark-900">
            {t('agents.leadStat.value')}
          </span>
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-dark-900/50">
            {t('agents.leadStat.label')}
          </span>
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12">
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: index * 0.08, duration: 0.8, ease }}
          >
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-xs text-coral-500 tracking-widest">{pillar.index}</span>
              <span className="h-px flex-1 bg-dark-900/10" />
            </div>
            <h3 className="font-display font-bold text-xl md:text-2xl tracking-[-0.01em] leading-tight text-dark-900">
              {pillar.title}
            </h3>
            <p className="mt-3 text-base text-dark-900/60 font-light leading-relaxed">
              {pillar.body}
            </p>
            <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-dark-900/45">
              {pillar.proof}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowIWorkWithAgents;
```

- [ ] **Step 2: Insert into HomePage**

In `src/pages/HomePage.tsx`, add the import and render it between `FeaturedWorks` and `OlderWorks`:

```tsx
import { TechShowcaseProvider } from '../context/TechShowcaseContext';
import Hero from '../components/Hero';
import BrandMarquee from '../components/BrandMarquee';
import FeaturedWorks from '../components/FeaturedWorks';
import HowIWorkWithAgents from '../components/HowIWorkWithAgents';
import OlderWorks from '../components/OlderWorks';
import Contact from '../components/Contact';

export default function HomePage() {
  return (
    <TechShowcaseProvider>
      <main>
        <Hero />
        <BrandMarquee />
        <FeaturedWorks />
        <HowIWorkWithAgents />
        <OlderWorks />
        <Contact />
      </main>
    </TechShowcaseProvider>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 5: Visual checkpoint (dev server)**

Run: `npm run dev`. Verify the "How I Work With Agents" section renders **between Selected Work and Older Works**, with eyebrow `§ 03 — Method`, the italic-coral heading, the lead stat line, and 3 responsive pillar cards (1 col mobile / 3 col desktop). Confirm the Older Works eyebrow now reads `§ 04`. Switch all four languages — no missing-key console errors; headings read naturally.

- [ ] **Step 6: Commit**

```bash
git add src/components/HowIWorkWithAgents.tsx src/pages/HomePage.tsx
git commit -m "feat(agents): add How-I-Work-With-Agents homepage section"
```

---

## Task 6: Full verification & number re-check

**Files:** none (verification only; fix-forward commits if issues found).

- [ ] **Step 1: Clean build**

Run: `npm run build`
Expected: `tsc -b` + `vite build` succeed with no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: End-to-end visual pass (Playwright / webapp-testing)**

With `npm run dev` running, drive the browser:
- Home → confirm section order: Hero, Selected Work (`§ 02`), Method (`§ 03`), Archive (`§ 04`), Contact (`§ 05`).
- Open the Banco Provincia modal → dossier renders fully; capture desktop + mobile (≤414px) screenshots; confirm no horizontal overflow and the right column scrolls within the modal.
- Toggle en/es/pt/zh → dossier + agents section render with no missing keys; Chinese glyphs render.

- [ ] **Step 4: Re-verify mined numbers**

Confirm the figures in copy still match codebase-memory (in case a repo was re-indexed since 2026-07-12): per-repo class counts (128 / 636 / 617 / 164 / 209 / 1,623 / 1,246 → ~4,600 total), 82 SQL scripts, 13 repos / ~73k nodes / ~260k relationships. If any drifted materially, update the affected copy in all four locales and re-run Steps 1–2.

- [ ] **Step 5: Final commit (only if fixes were made)**

```bash
git add -A
git commit -m "chore(work): verification fixes for migration + agents"
```

---

## Self-Review

**1. Spec coverage:**
- Spec §4 (Migration Dossier: types, modal component, content blocks, card desc) → Tasks 1, 2, 3. ✅
- Spec §5 (Agents section: component, placement, 3 pillars, `§ 03 — Method`, renumber) → Tasks 4, 5. ✅
- Spec §6 (i18n across 4 locales, edited keys) → Tasks 3, 4. ✅
- Spec §7 (verification: tsc/lint/build + visual + number re-check) → per-task + Task 6. ✅
- Spec §8 (generic module labels, conservative framing, "2+ modules on Boot 3") → enforced in Task 3 copy + Global Constraints. ✅

**2. Placeholder scan:** No TBD/TODO; every step has literal content, exact paths, exact commands, expected output. TDD-with-tests intentionally replaced by tsc/lint/build/visual because the repo has no test harness (documented in Global Constraints) — not a placeholder.

**3. Type consistency:** `MigrationDossier` fields (`scope`, `before`, `after`, `modulesHeading`, `modules`, `phasesHeading`, `phases`) defined in Task 1 match exactly the JSON keys in Task 3 and the `MigrationDossierView` prop reads in Task 2. `agents` shape in Task 4 matches the reads in Task 5 (`messages.agents.pillars` with `index/title/body/proof`; `leadStat.value/label`; `t('agents.*')`). Component name `MigrationDossierView` is used consistently in Task 2 (import type is `MigrationDossier`, the value component is `MigrationDossierView` to avoid a name clash with the type). FeaturedWorks `Omit` includes `migration` so structural spread never conflicts.
