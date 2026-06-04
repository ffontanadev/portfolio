# Tech Showcase — Particle Logo Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each technology in the stack marquee selectable; clicking one scrolls to the hero, reforms the particle field into that technology's logo in its real brand colors, and shows a one-sentence localized brief, dismissible via click-outside or `Esc`.

**Architecture:** A React Context (`TechShowcaseProvider`) carries the selected technology from `BrandMarquee` to the hero. `ParticleField` reacts by commanding the existing `ParticleSystem` into a new locked `'showcase'` state that samples a logo SVG with per-particle brand colors. A `BriefPanel` overlays the hero with the localized brief. The mode is a progressive enhancement — inert when particles are disabled or reduced-motion is on.

**Tech Stack:** React 19, TypeScript, three.js (raw WebGL shaders), framer-motion, Tailwind v4, custom i18n (`@/i18n`).

**Verification:** No test framework (decision 2026-06-04). Each task verifies with `npx tsc -b` and `npx eslint .`; a final task runs `npm run build` and a manual browser checklist. Commit after each task.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/components/Hero/techCatalog.ts` | **New.** Single source of truth: `TechItem[]` with `id`, `name`, `marqueeUrl`, `logoUrl`. |
| `src/context/TechShowcaseContext.tsx` | **New.** Provider + `useTechShowcase()` hook: `{ selected, select, clear }`. |
| `src/pages/HomePage.tsx` | Wrap `<main>` in `TechShowcaseProvider`. |
| `src/components/BrandMarquee.tsx` | Use catalog; render each logo as a `<button>` calling `select(tech)`. |
| `src/i18n/locales/{en,es,pt,zh}.json` | Add `techShowcase` UI labels + `brief.<id>` per technology. |
| `src/components/Hero/particles/silhouetteSampler.ts` | Add `drawSilhouetteForColor` reuse + color read during sampling. |
| `src/components/Hero/particles/shapeSampler.ts` | Add `sampleShapeWithColor()` returning `{ positions, colors }`. |
| `src/components/Hero/particles/shaders.ts` | Add `uBrandColorMix` uniform; widen color-mix expression. |
| `src/components/Hero/particles/ParticleSystem.ts` | Add `uBrandColorMix` uniform, `showShape()` / `releaseShape()`, `'showcase'` state, color save/restore, resize handling. |
| `src/components/Hero/ParticleField.tsx` | `useEffect` on `selected`: load logo, sample with color, drive `showShape`/`releaseShape`; queue commands issued before the system is ready. |
| `src/components/Hero/BriefPanel.tsx` | **New.** Overlay panel; localized brief; click-outside + `Esc` dismissal; scroll-to-hero on open. |
| `src/components/Hero.tsx` | Render `<BriefPanel />`. |

---

## Task 1: Tech catalog

**Files:**
- Create: `src/components/Hero/techCatalog.ts`

- [ ] **Step 1: Create the catalog module**

Each entry has a stable `id` (used as the i18n brief key), the display `name`, the
`marqueeUrl` (the SVG currently used in the marquee), and a `logoUrl` (the variant
that samples well as dark/colored particles on the cream hero background). For most
technologies `logoUrl === marqueeUrl`. The `_light` variants whose marks are
near-white are swapped for a dark/colored variant so they are visible on cream;
those are marked with a trailing comment and **must be visually verified in Task 10**.

Create `src/components/Hero/techCatalog.ts`:

```ts
const SVGL = 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library';

export interface TechItem {
  /** Stable id; also the i18n key suffix: techShowcase.brief.<id> */
  id: string;
  /** Display name shown in the marquee label and the brief panel heading. */
  name: string;
  /** SVG shown in the marquee (unchanged from the original list). */
  marqueeUrl: string;
  /** SVG sampled into particles. Must read as a dark/colored mark on cream. */
  logoUrl: string;
}

export const techCatalog: TechItem[] = [
  { id: 'supabase',    name: 'Supabase',     marqueeUrl: `${SVGL}/supabase.svg`,               logoUrl: `${SVGL}/supabase.svg` },
  { id: 'nextjs',      name: 'Next.js',      marqueeUrl: `${SVGL}/nextjs_icon_dark.svg`,       logoUrl: `${SVGL}/nextjs_icon_dark.svg` },
  { id: 'aws',         name: 'AWS',          marqueeUrl: `${SVGL}/aws_light.svg`,              logoUrl: `${SVGL}/aws_dark.svg` }, // light→dark for cream bg
  { id: 'threejs',     name: 'Three.js',     marqueeUrl: `${SVGL}/threejs-light.svg`,          logoUrl: `${SVGL}/threejs-dark.svg` }, // light→dark for cream bg
  { id: 'drizzle',     name: 'Drizzle',      marqueeUrl: `${SVGL}/drizzle-orm_light.svg`,      logoUrl: `${SVGL}/drizzle-orm.svg` }, // light→colored for cream bg
  { id: 'sqlite',      name: 'SQLite',       marqueeUrl: `${SVGL}/sqlite.svg`,                 logoUrl: `${SVGL}/sqlite.svg` },
  { id: 'mongodb',     name: 'MongoDB',      marqueeUrl: `${SVGL}/mongodb-icon-light.svg`,     logoUrl: `${SVGL}/mongodb-icon.svg` }, // verify visibility on cream
  { id: 'postgresql',  name: 'PostgreSQL',   marqueeUrl: `${SVGL}/postgresql.svg`,             logoUrl: `${SVGL}/postgresql.svg` },
  { id: 'springboot',  name: 'Spring Boot',  marqueeUrl: `${SVGL}/spring.svg`,                 logoUrl: `${SVGL}/spring.svg` },
  { id: 'sequelize',   name: 'Sequelize',    marqueeUrl: `${SVGL}/sequelize.svg`,              logoUrl: `${SVGL}/sequelize.svg` },
  { id: 'express',     name: 'Express.js',   marqueeUrl: `${SVGL}/expressjs.svg`,              logoUrl: `${SVGL}/expressjs-dark.svg` }, // black wordmark, verify
  { id: 'tailwind',    name: 'Tailwind CSS', marqueeUrl: `${SVGL}/tailwindcss.svg`,            logoUrl: `${SVGL}/tailwindcss.svg` },
  { id: 'astro',       name: 'Astro',        marqueeUrl: `${SVGL}/astro-icon-light.svg`,       logoUrl: `${SVGL}/astro-icon-dark.svg` }, // light→dark for cream bg
  { id: 'bootstrap',   name: 'Bootstrap',    marqueeUrl: `${SVGL}/bootstrap.svg`,              logoUrl: `${SVGL}/bootstrap.svg` },
  { id: 'vercel',      name: 'Vercel',       marqueeUrl: `${SVGL}/vercel.svg`,                 logoUrl: `${SVGL}/vercel.svg` }, // black, fine on cream
  { id: 'godaddy',     name: 'GoDaddy',      marqueeUrl: `${SVGL}/godaddy.svg`,                logoUrl: `${SVGL}/godaddy.svg` },
  { id: 'googlecloud', name: 'Google Cloud', marqueeUrl: `${SVGL}/google-cloud.svg`,           logoUrl: `${SVGL}/google-cloud.svg` },
  { id: 'csharp',      name: 'C#',           marqueeUrl: `${SVGL}/csharp.svg`,                 logoUrl: `${SVGL}/csharp.svg` },
  { id: 'lit',         name: 'Lit',          marqueeUrl: `${SVGL}/lit.svg`,                    logoUrl: `${SVGL}/lit.svg` },
  { id: 'redux',       name: 'Redux',        marqueeUrl: `${SVGL}/redux.svg`,                  logoUrl: `${SVGL}/redux.svg` },
  { id: 'auth0',       name: 'Auth0',        marqueeUrl: `${SVGL}/auth0.svg`,                  logoUrl: `${SVGL}/auth0.svg` },
  { id: 'jwt',         name: 'JWT',          marqueeUrl: `${SVGL}/jwt.svg`,                    logoUrl: `${SVGL}/jwt.svg` },
  { id: 'vite',        name: 'Vite',         marqueeUrl: `${SVGL}/vitejs.svg`,                 logoUrl: `${SVGL}/vitejs.svg` },
];
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: PASS (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero/techCatalog.ts
git commit -m "feat: add tech catalog as single source of truth for stack"
```

---

## Task 2: i18n briefs and panel labels

**Files:**
- Modify: `src/i18n/locales/en.json` (after the `brandMarquee` block, ~line 53)
- Modify: `src/i18n/locales/es.json`
- Modify: `src/i18n/locales/pt.json`
- Modify: `src/i18n/locales/zh.json`

Each `brief.<id>` key matches a catalog `id` from Task 1. Briefs are one sentence,
~10–15 words. Insert the `techShowcase` object immediately after the existing
`brandMarquee` object in each file (mind the trailing comma on `brandMarquee`).

- [ ] **Step 1: Add `techShowcase` to `en.json`**

```json
  "techShowcase": {
    "close": "Close",
    "eyebrow": "Stack · focus",
    "brief": {
      "supabase": "Open-source Postgres backend with auth, storage, and realtime APIs.",
      "nextjs": "React framework for production apps with hybrid server and client rendering.",
      "aws": "Amazon's cloud platform for compute, storage, and managed infrastructure at scale.",
      "threejs": "WebGL library for rendering 3D graphics and animation in the browser.",
      "drizzle": "Lightweight, type-safe TypeScript ORM with a SQL-like query builder.",
      "sqlite": "Self-contained, serverless SQL database engine embedded directly in the app.",
      "mongodb": "Document database storing flexible, JSON-like records for fast iteration.",
      "postgresql": "Powerful open-source relational database known for reliability and rich features.",
      "springboot": "Java framework for building production-ready services with minimal configuration.",
      "sequelize": "Promise-based Node.js ORM for SQL databases with model definitions and migrations.",
      "express": "Minimal, unopinionated Node.js framework for building web servers and APIs.",
      "tailwind": "Utility-first CSS framework for building custom designs without leaving your markup.",
      "astro": "Content-focused web framework that ships zero JavaScript by default for speed.",
      "bootstrap": "Popular CSS framework with ready-made responsive components and a grid system.",
      "vercel": "Cloud platform for deploying and scaling frontend apps with zero configuration.",
      "godaddy": "Domain registrar and hosting provider for getting projects online quickly.",
      "googlecloud": "Google's cloud platform for compute, data, and machine-learning services.",
      "csharp": "Modern, type-safe language from Microsoft for backend, desktop, and game development.",
      "lit": "Lightweight library for building fast, reusable web components on web standards.",
      "redux": "Predictable state container for JavaScript apps with a single source of truth.",
      "auth0": "Identity platform handling authentication and authorization as a managed service.",
      "jwt": "Compact, signed tokens for securely transmitting claims between parties.",
      "vite": "Fast build tool and dev server with instant hot-module replacement."
    }
  },
```

- [ ] **Step 2: Add `techShowcase` to `es.json`**

```json
  "techShowcase": {
    "close": "Cerrar",
    "eyebrow": "Stack · enfoque",
    "brief": {
      "supabase": "Backend Postgres open-source con autenticación, almacenamiento y APIs en tiempo real.",
      "nextjs": "Framework de React para apps en producción con renderizado híbrido servidor-cliente.",
      "aws": "Plataforma cloud de Amazon para cómputo, almacenamiento e infraestructura gestionada a escala.",
      "threejs": "Librería WebGL para renderizar gráficos 3D y animación en el navegador.",
      "drizzle": "ORM de TypeScript liviano y con tipos seguros, con un constructor de consultas tipo SQL.",
      "sqlite": "Motor de base de datos SQL sin servidor, embebido directamente en la aplicación.",
      "mongodb": "Base de datos de documentos que guarda registros flexibles tipo JSON para iterar rápido.",
      "postgresql": "Potente base de datos relacional open-source, conocida por su fiabilidad y funciones.",
      "springboot": "Framework de Java para construir servicios listos para producción con mínima configuración.",
      "sequelize": "ORM de Node.js basado en promesas para bases SQL, con modelos y migraciones.",
      "express": "Framework minimalista y sin opiniones de Node.js para crear servidores web y APIs.",
      "tailwind": "Framework CSS utility-first para crear diseños a medida sin salir del marcado.",
      "astro": "Framework web enfocado en contenido que envía cero JavaScript por defecto para más velocidad.",
      "bootstrap": "Popular framework CSS con componentes responsivos listos y un sistema de grilla.",
      "vercel": "Plataforma cloud para desplegar y escalar apps frontend sin configuración.",
      "godaddy": "Registrador de dominios y proveedor de hosting para publicar proyectos rápidamente.",
      "googlecloud": "Plataforma cloud de Google para cómputo, datos y servicios de machine learning.",
      "csharp": "Lenguaje moderno y con tipos seguros de Microsoft para backend, escritorio y videojuegos.",
      "lit": "Librería liviana para construir web components rápidos y reutilizables sobre estándares web.",
      "redux": "Contenedor de estado predecible para apps JavaScript con una única fuente de verdad.",
      "auth0": "Plataforma de identidad que gestiona autenticación y autorización como servicio.",
      "jwt": "Tokens compactos y firmados para transmitir información de forma segura entre partes.",
      "vite": "Herramienta de build y servidor de desarrollo veloz con recarga instantánea de módulos."
    }
  },
```

- [ ] **Step 3: Add `techShowcase` to `pt.json`**

```json
  "techShowcase": {
    "close": "Fechar",
    "eyebrow": "Stack · foco",
    "brief": {
      "supabase": "Backend Postgres open-source com autenticação, armazenamento e APIs em tempo real.",
      "nextjs": "Framework React para apps em produção com renderização híbrida servidor-cliente.",
      "aws": "Plataforma cloud da Amazon para computação, armazenamento e infraestrutura gerenciada em escala.",
      "threejs": "Biblioteca WebGL para renderizar gráficos 3D e animação no navegador.",
      "drizzle": "ORM TypeScript leve e type-safe, com um construtor de consultas no estilo SQL.",
      "sqlite": "Motor de banco de dados SQL sem servidor, embutido diretamente no aplicativo.",
      "mongodb": "Banco de dados de documentos que guarda registros flexíveis tipo JSON para iterar rápido.",
      "postgresql": "Poderoso banco de dados relacional open-source, conhecido pela confiabilidade e recursos.",
      "springboot": "Framework Java para criar serviços prontos para produção com configuração mínima.",
      "sequelize": "ORM Node.js baseado em promises para bancos SQL, com modelos e migrações.",
      "express": "Framework minimalista e sem opiniões do Node.js para criar servidores web e APIs.",
      "tailwind": "Framework CSS utility-first para criar designs sob medida sem sair da marcação.",
      "astro": "Framework web focado em conteúdo que entrega zero JavaScript por padrão para mais velocidade.",
      "bootstrap": "Popular framework CSS com componentes responsivos prontos e um sistema de grid.",
      "vercel": "Plataforma cloud para implantar e escalar apps frontend sem configuração.",
      "godaddy": "Registrador de domínios e provedor de hospedagem para publicar projetos rapidamente.",
      "googlecloud": "Plataforma cloud do Google para computação, dados e serviços de machine learning.",
      "csharp": "Linguagem moderna e type-safe da Microsoft para backend, desktop e jogos.",
      "lit": "Biblioteca leve para construir web components rápidos e reutilizáveis sobre padrões web.",
      "redux": "Contêiner de estado previsível para apps JavaScript com uma única fonte de verdade.",
      "auth0": "Plataforma de identidade que gerencia autenticação e autorização como serviço.",
      "jwt": "Tokens compactos e assinados para transmitir informações com segurança entre partes.",
      "vite": "Ferramenta de build e servidor de desenvolvimento rápido com hot-reload instantâneo."
    }
  },
```

- [ ] **Step 4: Add `techShowcase` to `zh.json`**

```json
  "techShowcase": {
    "close": "关闭",
    "eyebrow": "技术栈 · 聚焦",
    "brief": {
      "supabase": "开源的 Postgres 后端，内置身份验证、存储和实时 API。",
      "nextjs": "用于生产应用的 React 框架，支持服务端与客户端混合渲染。",
      "aws": "亚马逊的云平台，提供大规模的计算、存储和托管基础设施。",
      "threejs": "用于在浏览器中渲染 3D 图形与动画的 WebGL 库。",
      "drizzle": "轻量、类型安全的 TypeScript ORM，提供类 SQL 的查询构建器。",
      "sqlite": "无需服务器、直接嵌入应用的自包含 SQL 数据库引擎。",
      "mongodb": "文档数据库，存储灵活的类 JSON 记录，便于快速迭代。",
      "postgresql": "强大的开源关系型数据库，以可靠性和丰富功能著称。",
      "springboot": "用于以最少配置构建生产级服务的 Java 框架。",
      "sequelize": "基于 Promise 的 Node.js ORM，支持模型定义与数据库迁移。",
      "express": "极简、无约束的 Node.js 框架，用于构建 Web 服务器和 API。",
      "tailwind": "实用优先的 CSS 框架，无需离开标记即可构建自定义设计。",
      "astro": "以内容为中心的 Web 框架，默认零 JavaScript，追求极速加载。",
      "bootstrap": "流行的 CSS 框架，提供现成的响应式组件和栅格系统。",
      "vercel": "用于零配置部署和扩展前端应用的云平台。",
      "godaddy": "域名注册商与托管服务商，帮助项目快速上线。",
      "googlecloud": "谷歌的云平台，提供计算、数据和机器学习服务。",
      "csharp": "微软推出的现代、类型安全语言，适用于后端、桌面和游戏开发。",
      "lit": "基于 Web 标准、用于构建快速可复用 Web 组件的轻量库。",
      "redux": "用于 JavaScript 应用的可预测状态容器，提供单一数据源。",
      "auth0": "以托管服务方式处理身份验证与授权的身份平台。",
      "jwt": "用于在各方之间安全传递声明的紧凑签名令牌。",
      "vite": "快速的构建工具和开发服务器，支持即时模块热替换。"
    }
  },
```

- [ ] **Step 5: Validate JSON parses**

Run: `node -e "for (const l of ['en','es','pt','zh']) { JSON.parse(require('fs').readFileSync('src/i18n/locales/'+l+'.json','utf8')); console.log(l,'ok'); }"`
Expected: `en ok` / `es ok` / `pt ok` / `zh ok` (no JSON parse errors).

- [ ] **Step 6: Commit**

```bash
git add src/i18n/locales/en.json src/i18n/locales/es.json src/i18n/locales/pt.json src/i18n/locales/zh.json
git commit -m "i18n: add tech showcase briefs and panel labels for 23 technologies"
```

---

## Task 3: TechShowcaseContext + provider

**Files:**
- Create: `src/context/TechShowcaseContext.tsx`
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Create the context module**

Create `src/context/TechShowcaseContext.tsx`:

```tsx
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { TechItem } from '@/components/Hero/techCatalog';

interface TechShowcaseValue {
  /** The technology whose logo is currently shown, or null. */
  selected: TechItem | null;
  /** Select a technology — triggers the hero particle-logo mode. */
  select: (tech: TechItem) => void;
  /** Dismiss the showcase and resume the ambient particle loop. */
  clear: () => void;
}

const TechShowcaseContext = createContext<TechShowcaseValue | null>(null);

export function TechShowcaseProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<TechItem | null>(null);

  const select = useCallback((tech: TechItem) => setSelected(tech), []);
  const clear = useCallback(() => setSelected(null), []);

  const value = useMemo<TechShowcaseValue>(
    () => ({ selected, select, clear }),
    [selected, select, clear],
  );

  return (
    <TechShowcaseContext.Provider value={value}>
      {children}
    </TechShowcaseContext.Provider>
  );
}

export function useTechShowcase(): TechShowcaseValue {
  const ctx = useContext(TechShowcaseContext);
  if (!ctx) {
    throw new Error('useTechShowcase must be used within a TechShowcaseProvider');
  }
  return ctx;
}
```

> Note: confirm `@/` resolves to `src/` — it is already used in `BrandMarquee.tsx`
> (`import { useTranslation } from '@/i18n'`), so the alias is configured.

- [ ] **Step 2: Wrap HomePage's `<main>` in the provider**

Modify `src/pages/HomePage.tsx` to:

```tsx
import Hero from '../components/Hero';
import BrandMarquee from '../components/BrandMarquee';
import FeaturedWorks from '../components/FeaturedWorks';
import OlderWorks from '../components/OlderWorks';
import BlogCTA from '../components/BlogCTA';
import Contact from '../components/Contact';
import { TechShowcaseProvider } from '../context/TechShowcaseContext';

export default function HomePage() {
  return (
    <TechShowcaseProvider>
      <main>
        <Hero />
        <BrandMarquee />
        <FeaturedWorks />
        <OlderWorks />
        <BlogCTA />
        <Contact />
      </main>
    </TechShowcaseProvider>
  );
}
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc -b && npx eslint src/context/TechShowcaseContext.tsx src/pages/HomePage.tsx`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/context/TechShowcaseContext.tsx src/pages/HomePage.tsx
git commit -m "feat: add TechShowcaseContext to carry selected tech to the hero"
```

---

## Task 4: Make the marquee selectable

**Files:**
- Modify: `src/components/BrandMarquee.tsx`

Replace the inline `brands` array with the catalog, and make each item a `<button>`
that calls `select(tech)`. Keep the existing visual styling, infinite scroll, and
hover-pause behavior. Items remain inert when particles are off / reduced-motion —
handled in `ParticleField`/`Hero`; the marquee always calls `select`, and the
particle side decides whether to react. (The brief panel itself only renders when
the particle system is active — see Task 9.)

- [ ] **Step 1: Rewrite `BrandMarquee.tsx`**

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useTechShowcase } from '@/context/TechShowcaseContext';
import { techCatalog } from './Hero/techCatalog';

const BrandMarquee = () => {
    const [paused, setPaused] = useState(false);
    const { t } = useTranslation();
    const { select } = useTechShowcase();

    return (
        <section className="py-20 overflow-hidden bg-transparent relative">
            <div className="max-w-[1440px] mx-auto px-6 md:px-20 mb-8">
                <div className="flex items-center gap-4">
                    <span className="text-eyebrow text-dark-900/45">{t('brandMarquee.eyebrow')}</span>
                    <span className="h-px flex-1 max-w-[120px] bg-dark-900/12" />
                </div>
            </div>

            <div
                className="flex w-full mask-image-gradient"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                <motion.div
                    className="flex gap-16 items-center whitespace-nowrap pr-16"
                    animate={{ x: paused ? undefined : '-50%' }}
                    transition={{
                        repeat: Infinity,
                        duration: 50,
                        ease: 'linear',
                    }}
                >
                    {[...techCatalog, ...techCatalog].map((brand, index) => (
                        <button
                            key={`${brand.id}-${index}`}
                            type="button"
                            onClick={() => select(brand)}
                            className="group relative flex flex-col items-center justify-center min-w-[56px] cursor-pointer bg-transparent border-0 p-0 focus-visible:outline-2 focus-visible:outline-coral-500 focus-visible:outline-offset-4 rounded"
                            aria-label={t('brandMarquee.logoAlt', { name: brand.name })}
                        >
                            <img
                                src={brand.marqueeUrl}
                                alt={brand.name}
                                className="h-12 w-auto object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                loading="lazy"
                            />
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-widest uppercase text-dark-900/0 group-hover:text-dark-900/65 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                                {brand.name}
                            </span>
                        </button>
                    ))}
                </motion.div>
            </div>

            <style>{`
                .mask-image-gradient {
                    mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
                }
            `}</style>
        </section>
    );
};

export default BrandMarquee;
```

- [ ] **Step 2: Type-check, lint, and manual click**

Run: `npx tsc -b && npx eslint src/components/BrandMarquee.tsx`
Expected: PASS.

Run: `npm run dev`, open the page, click a marquee logo. Expected: no crash; nothing
visible happens yet (the hero side is wired in later tasks). Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/BrandMarquee.tsx
git commit -m "feat: make marquee technologies selectable buttons"
```

---

## Task 5: Colored shape sampling

**Files:**
- Modify: `src/components/Hero/particles/silhouetteSampler.ts`
- Modify: `src/components/Hero/particles/shapeSampler.ts`

Add a sampling path that returns both positions and per-point RGB (0–1), reusing the
existing draw + near-white masking logic. Only `silhouette` specs need color; this is
the only kind the showcase feature uses.

- [ ] **Step 1: Add a colored sampler in `shapeSampler.ts`**

Append to `src/components/Hero/particles/shapeSampler.ts` (after `sampleShape`):

```ts
export interface ColoredSample {
  positions: Float32Array; // length count*2 — (x,y) in CSS px
  colors: Float32Array;    // length count*3 — (r,g,b) 0..1
}

// Like sampleShape, but also returns the source pixel color at each sampled point.
// Only meaningful for `silhouette` specs (the only kind the tech showcase uses);
// other kinds fall back to a scatter with white color so the caller can still tint.
export function sampleShapeWithColor(
  spec: ShapeSpec,
  count: number,
  bounds: SampleBounds,
): ColoredSample {
  if (spec.kind !== 'silhouette') {
    return {
      positions: sampleShape(spec, count, bounds),
      colors: filledColors(count),
    };
  }

  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(bounds.width * dpr));
  canvas.height = Math.max(1, Math.floor(bounds.height * dpr));

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { positions: scatterFallback(count, bounds), colors: filledColors(count) };
  }

  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;
  drawSilhouette(ctx, spec, bounds);

  let sampled = collectDarkPixelsWithColor(ctx, canvas.width, canvas.height, dpr, 4);
  if (sampled.pts.length / 2 < count * 0.6) {
    sampled = collectDarkPixelsWithColor(ctx, canvas.width, canvas.height, dpr, 2);
  }

  return distributeToCountWithColor(sampled, count, bounds);
}

// Variant of collectDarkPixels that also reads RGB at each kept pixel.
function collectDarkPixelsWithColor(
  ctx: CanvasRenderingContext2D,
  pxW: number,
  pxH: number,
  dpr: number,
  stride: number,
): { pts: number[]; rgb: number[] } {
  const img = ctx.getImageData(0, 0, pxW, pxH);
  const data = img.data;
  const pts: number[] = [];
  const rgb: number[] = [];
  for (let y = 0; y < pxH; y += stride) {
    for (let x = 0; x < pxW; x += stride) {
      const o = (y * pxW + x) * 4;
      const a = data[o + 3];
      if (a > 96) {
        pts.push(x / dpr, y / dpr);
        rgb.push(data[o] / 255, data[o + 1] / 255, data[o + 2] / 255);
      }
    }
  }
  return { pts, rgb };
}

// Like distributeToCount, but carries the source color alongside each position.
function distributeToCountWithColor(
  sampled: { pts: number[]; rgb: number[] },
  count: number,
  bounds: SampleBounds,
): ColoredSample {
  const { pts, rgb } = sampled;
  const positions = new Float32Array(count * 2);
  const colors = new Float32Array(count * 3);
  const numPts = pts.length / 2;

  if (numPts === 0) {
    return { positions: scatterFallback(count, bounds), colors: filledColors(count) };
  }

  const idx = new Uint32Array(numPts);
  for (let i = 0; i < numPts; i++) idx[i] = i;
  for (let i = numPts - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp;
  }

  for (let i = 0; i < count; i++) {
    const src = idx[i % numPts];
    const repeated = i >= numPts;
    const jx = repeated ? (Math.random() - 0.5) * 2.2 : 0;
    const jy = repeated ? (Math.random() - 0.5) * 2.2 : 0;
    positions[i * 2] = pts[src * 2] + jx;
    positions[i * 2 + 1] = pts[src * 2 + 1] + jy;
    colors[i * 3] = rgb[src * 3];
    colors[i * 3 + 1] = rgb[src * 3 + 1];
    colors[i * 3 + 2] = rgb[src * 3 + 2];
  }
  return { positions, colors };
}

// White fill so non-silhouette fallbacks still render visibly under brand-mix.
function filledColors(count: number): Float32Array {
  const colors = new Float32Array(count * 3);
  colors.fill(1);
  return colors;
}
```

> `drawSilhouette`, `scatterFallback`, `collectDarkPixels`, and `distributeToCount`
> already exist in this file / are imported; reuse them as shown. Do not duplicate
> `drawSilhouette` — it is imported at the top (`import { drawSilhouette } from './silhouetteSampler'`).

- [ ] **Step 2: Confirm `drawSilhouette` masks near-white (no change needed)**

`drawSilhouette` in `silhouetteSampler.ts` already zeroes alpha for pixels with
luminance > 0.98, so `collectDarkPixelsWithColor`'s `a > 96` test naturally drops
them. No edit to `silhouetteSampler.ts` is required. Verify by reading the file.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc -b && npx eslint src/components/Hero/particles/shapeSampler.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero/particles/shapeSampler.ts
git commit -m "feat: add colored shape sampling for brand logos"
```

---

## Task 6: Shader brand-color mix uniform

**Files:**
- Modify: `src/components/Hero/particles/shaders.ts:27` (uniform block) and `:121` (color mix)

- [ ] **Step 1: Declare the uniform**

In `shaders.ts`, in the vertex shader uniform list (near `uniform float uShapeAlpha;`),
add:

```glsl
  uniform float uBrandColorMix; // 0 = palette tint (loop); 1 = sampled brand color
```

- [ ] **Step 2: Widen the color-mix expression**

Replace the existing line:

```glsl
    vColor = mix(base, aColor, 0.22);
```

with:

```glsl
    vColor = mix(base, aColor, max(0.22, uBrandColorMix));
```

At `uBrandColorMix = 0` this is identical to current behavior; at `1` particles
render their sampled brand color fully.

- [ ] **Step 3: Type-check**

Run: `npx tsc -b`
Expected: PASS (shaders are template strings; this verifies the file still compiles).

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero/particles/shaders.ts
git commit -m "feat: add uBrandColorMix uniform to particle shader"
```

---

## Task 7: ParticleSystem showcase state

**Files:**
- Modify: `src/components/Hero/particles/ParticleSystem.ts`

Add the `'showcase'` locked state, `showShape()` / `releaseShape()`, the new
uniform, per-particle color save/restore, and resize handling for the locked logo.

- [ ] **Step 1: Register the uniform**

In the `material` uniforms object (after `uShapeAlpha`), add:

```ts
        uBrandColorMix: { value: 0 },
```

- [ ] **Step 2: Add showcase fields and state type**

Extend the `State` union (line ~30) to include `'showcase'`:

```ts
type State = 'drift' | 'morphIn' | 'hold' | 'play' | 'morphOut' | 'shapeMorph' | 'showcase';
```

Add instance fields (near the other private fields):

```ts
  // --- Tech showcase (externally locked logo) ---
  private showcaseSpec: ShapeSpec | null = null;     // the locked logo spec, for resize re-sampling
  private showcaseColors: Float32Array | null = null; // sampled brand colors for the locked logo
  private savedColors: Float32Array | null = null;    // original aColor buffer, restored on release
  private showcaseT = 0;                               // 0..1 morph/brand-mix progress
  private readonly SHOWCASE_MORPH_S = 0.9;
```

- [ ] **Step 3: Add `showShape` / `releaseShape` methods**

Add these public methods (e.g. after `setCursor`):

```ts
  /**
   * Lock the field into a specific logo shape with per-particle brand colors,
   * pausing the autonomous loop. Safe to call repeatedly to switch logos.
   */
  showShape(spec: ShapeSpec, colors: Float32Array): void {
    if (!this.initialized) return; // ParticleField queues until first resize
    this.showcaseSpec = spec;
    this.showcaseColors = colors;

    // Save original palette colors once (first entry only).
    const colorAttr = this.geometry.getAttribute('aColor') as THREE.BufferAttribute;
    if (!this.savedColors) {
      this.savedColors = (colorAttr.array as Float32Array).slice();
    }

    // Sample the logo into aTarget and upload brand colors.
    this.applyTargetTo('aTarget', spec);
    (colorAttr.array as Float32Array).set(colors);
    colorAttr.needsUpdate = true;

    // Reset blend bookkeeping and enter the locked state from the current morph.
    this.material.uniforms.uTargetBlend.value = 0;
    this.frame = null;
    this.prevFrame = null;
    this.state = 'showcase';
    this.stateStart = performance.now();
    this.showcaseT = 0;
  }

  /** Release the locked logo: morph out, restore palette colors, resume the loop. */
  releaseShape(): void {
    if (this.state !== 'showcase') return;
    if (this.savedColors) {
      const colorAttr = this.geometry.getAttribute('aColor') as THREE.BufferAttribute;
      (colorAttr.array as Float32Array).set(this.savedColors);
      colorAttr.needsUpdate = true;
      this.savedColors = null;
    }
    this.showcaseSpec = null;
    this.showcaseColors = null;
    // Hand back to the ambient loop starting from a morph-out of the held shape.
    this.state = 'morphOut';
    this.stateStart = performance.now();
  }
```

- [ ] **Step 4: Drive the showcase morph in `stepStateMachine`**

Add a `case 'showcase'` to the `switch` in `stepStateMachine` (before the closing
brace of the switch). It ramps `showcaseT` 0→1 to morph in and raise the brand-color
mix, then holds at 1 indefinitely:

```ts
      case 'showcase': {
        const elapsedS = (now - this.stateStart) / 1000;
        this.showcaseT = Math.min(elapsedS / this.SHOWCASE_MORPH_S, 1);
        const e = easeInOutCubic(this.showcaseT);
        this.material.uniforms.uBrandColorMix.value = e;
        m = e; // morph drift → shape
        break;
      }
```

> `m` is the function's running morph value already declared at the top of
> `stepStateMachine` (`let m = 0;`). The `case 'showcase'` sets it like other cases.

- [ ] **Step 5: Fade brand-mix back out during morphOut**

In the existing `case 'morphOut'` block, after computing `m`, drive the brand mix
back toward 0 so colors fade out in step with the shape. Replace the body of
`case 'morphOut'` with:

```ts
      case 'morphOut': {
        const t = Math.min(elapsed / this.timings.morphOut, 1);
        m = 1 - easeInOutCubic(t);
        this.material.uniforms.uBrandColorMix.value =
          Math.min(this.material.uniforms.uBrandColorMix.value as number, 1 - easeInOutCubic(t));
        if (t >= 1) {
          this.state = 'drift';
          this.stateStart = now;
          this.frame = null;  // release pre-sampled frame buffers
          this.showcaseT = 0;
        }
        break;
      }
```

- [ ] **Step 6: Handle resize while in showcase**

In `resize()`, in the `else` branch (after `this.resampleHomes();`), add a guard
**before** the `if (this.state === 'shapeMorph')` block:

```ts
      // Locked showcase logo: re-sample it (and re-upload colors) at new bounds.
      if (this.state === 'showcase' && this.showcaseSpec) {
        this.applyTargetTo('aTarget', this.showcaseSpec);
        if (this.showcaseColors) {
          const colorAttr = this.geometry.getAttribute('aColor') as THREE.BufferAttribute;
          (colorAttr.array as Float32Array).set(this.showcaseColors);
          colorAttr.needsUpdate = true;
        }
        return;
      }
```

> Note: re-sampling with `applyTargetTo` re-runs `sampleShape` (monochrome positions),
> which is correct — positions must match new bounds. Colors are index-aligned to the
> particle, not the position, so re-uploading `showcaseColors` keeps each particle's
> hue stable. Minor hue/position drift on resize is acceptable.

- [ ] **Step 7: Type-check and lint**

Run: `npx tsc -b && npx eslint src/components/Hero/particles/ParticleSystem.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/Hero/particles/ParticleSystem.ts
git commit -m "feat: add locked showcase state with brand colors to ParticleSystem"
```

---

## Task 8: Wire ParticleField to the context

**Files:**
- Modify: `src/components/Hero/ParticleField.tsx`

`ParticleField` builds its `ParticleSystem` asynchronously inside `ready.then(...)`.
We need to (a) read `selected` from context, (b) keep a ref to the live `system`,
(c) apply showcase commands when `selected` changes — queuing if the system is not
yet built, and (d) skip entirely under reduced-motion / disabled particles (the
effect simply never runs because the system is never created in those cases).

- [ ] **Step 1: Import context, sampler, and add a system ref**

At the top of `ParticleField.tsx` add imports:

```tsx
import { useTechShowcase } from '@/context/TechShowcaseContext';
import { sampleShapeWithColor } from './particles/shapeSampler';
```

Inside the component, add refs and read the context (near the existing refs):

```tsx
  const systemRef = useRef<ParticleSystem | null>(null);
  const pendingSelectRef = useRef<typeof selected>(null);
  const { selected } = useTechShowcase();
```

> `selected` typed via the hook; `pendingSelectRef` holds a selection made before
> the system exists. Import the `ParticleSystem` type — it is already imported at the
> top of the file (`import { ParticleSystem } from './particles/ParticleSystem'`).

- [ ] **Step 2: Expose the built system via the ref**

Inside `ready.then(() => { ... })`, immediately after `system = new ParticleSystem({...})`
and `system.start();`, set the ref and flush any queued selection:

```tsx
      systemRef.current = system;
      if (pendingSelectRef.current) {
        const pending = pendingSelectRef.current;
        pendingSelectRef.current = null;
        void applyShowcase(system, pending);
      }
```

In the cleanup return, clear the ref:

```tsx
      systemRef.current = null;
```

(place `systemRef.current = null;` alongside the existing `if (system) system.dispose();`).

- [ ] **Step 3: Add the `applyShowcase` helper**

Add this module-scope helper near the top of the file (outside the component), so it
is stable and not re-created each render. `showShape(spec, colors)` re-samples
positions internally (it calls `applyTargetTo('aTarget', spec)`), so we only need the
sampled **colors** here; both samplings use the same `spec`, so positions and colors
stay index-aligned:

```tsx
const showcaseSpecFor = (tech: TechItem): ShapeSpec => ({
  kind: 'silhouette',
  src: tech.logoUrl,
  sizeRatio: 0.62,
});

async function applyShowcase(system: ParticleSystem, tech: TechItem): Promise<void> {
  try {
    await loadSilhouette(tech.logoUrl);
  } catch (err) {
    console.warn('[ParticleField] logo load failed', err);
    return; // keep the ambient loop running
  }
  const spec = showcaseSpecFor(tech);
  const { colors } = sampleShapeWithColor(spec, system.particleCountPublic, system.boundsPublic);
  system.showShape(spec, colors);
}
```

> Requires importing the `TechItem` type and `ShapeSpec` type at the top of the file:
> `import type { TechItem } from './techCatalog';` and
> `import type { ShapeSpec } from './particles/shapeSampler';`. `loadSilhouette` is
> already imported in `ParticleField.tsx`. Add the two public getters used above to
> `ParticleSystem` in Step 4.

- [ ] **Step 4: Add public getters to ParticleSystem for sampling**

In `ParticleSystem.ts`, add:

```ts
  get particleCountPublic(): number { return this.particleCount; }
  get boundsPublic(): SampleBounds { return this.bounds; }
```

> `SampleBounds` is already imported in `ParticleSystem.ts`.

- [ ] **Step 5: React to `selected` changes**

Add a dedicated `useEffect` (separate from the big construction effect), keyed on
`selected`:

```tsx
  useEffect(() => {
    const system = systemRef.current;
    if (!selected) {
      if (system) system.releaseShape();
      pendingSelectRef.current = null;
      return;
    }
    if (system) {
      void applyShowcase(system, selected);
    } else {
      pendingSelectRef.current = selected; // applied once the system is built
    }
  }, [selected]);
```

- [ ] **Step 6: Type-check and lint**

Run: `npx tsc -b && npx eslint src/components/Hero/ParticleField.tsx src/components/Hero/particles/ParticleSystem.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/Hero/ParticleField.tsx src/components/Hero/particles/ParticleSystem.ts
git commit -m "feat: drive particle showcase from selected tech context"
```

---

## Task 9: BriefPanel + hero integration + scroll

**Files:**
- Create: `src/components/Hero/BriefPanel.tsx`
- Modify: `src/components/Hero.tsx`

The panel renders only when `selected` is set. On open it scrolls `#hero` into view,
moves focus to itself, and listens for `Esc` + outside `pointerdown` to dismiss.

- [ ] **Step 1: Create `BriefPanel.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useTechShowcase } from '@/context/TechShowcaseContext';

const ease = [0.22, 1, 0.36, 1] as const;

// Mirror ParticleField's activation rules: the showcase is a progressive
// enhancement, inert when particles are disabled or reduced-motion is on.
const env = import.meta.env as Record<string, string | undefined>;
const PARTICLES_ENABLED =
  (env.VITE_PARTICLE_ENABLED ?? 'true').toLowerCase() !== 'false';

const BriefPanel = () => {
  const { selected, clear } = useTechShowcase();
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const inert = !PARTICLES_ENABLED || reduced;

  // When the showcase is inert, never show the panel. Defensively clear any
  // selection so the rest of the app stays consistent.
  useEffect(() => {
    if (inert && selected) clear();
  }, [inert, selected, clear]);

  useEffect(() => {
    if (!selected || inert) return;

    // Bring the hero (and its particle logo) into view.
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clear();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        clear();
      }
    };
    document.addEventListener('keydown', onKey);
    // Defer outside-click registration so the click that opened the panel
    // (from the marquee) doesn't immediately close it.
    const id = window.setTimeout(
      () => document.addEventListener('pointerdown', onPointerDown),
      0,
    );

    return () => {
      window.clearTimeout(id);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [selected, clear]);

  return (
    <AnimatePresence>
      {selected && !inert && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-label={selected.name}
          tabIndex={-1}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, ease }}
          className="absolute z-20 bottom-16 left-6 md:left-12 lg:left-20 max-w-sm rounded-2xl border border-dark-900/10 bg-cream-50/80 backdrop-blur-md p-6 shadow-xl outline-none"
        >
          <div className="flex items-start justify-between gap-6 mb-3">
            <span className="text-eyebrow text-dark-900/45">{t('techShowcase.eyebrow')}</span>
            <button
              type="button"
              onClick={clear}
              aria-label={t('techShowcase.close')}
              className="font-mono text-xs text-dark-900/50 hover:text-dark-900 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
          <h3 className="font-display text-2xl font-bold text-dark-900 mb-2">{selected.name}</h3>
          <p className="text-dark-900/70 leading-relaxed">
            {t('techShowcase.brief.' + selected.id)}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BriefPanel;
```

> The design said dismissal is click-outside + `Esc`. A small ✕ is included for
> affordance/accessibility but is optional; keep it — it also satisfies the
> `techShowcase.close` label added in Task 2. Confirm `cream-50` / `dark-900` color
> tokens exist (they are used across `Hero.tsx` and `BrandMarquee.tsx`).

- [ ] **Step 2: Render `BriefPanel` in the hero**

In `src/components/Hero.tsx`, import and render the panel inside the root
`<section id="hero" ...>`, just after `<ParticleField className="z-0" />`:

```tsx
import BriefPanel from './Hero/BriefPanel';
```

```tsx
      <ParticleField className="z-0" />
      <BriefPanel />
```

- [ ] **Step 3: Type-check, lint, build**

Run: `npx tsc -b && npx eslint src/components/Hero/BriefPanel.tsx src/components/Hero.tsx`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero/BriefPanel.tsx src/components/Hero.tsx
git commit -m "feat: add tech brief panel with scroll-to-hero and dismissal"
```

---

## Task 10: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Static checks**

Run: `npx tsc -b && npx eslint . && npm run build`
Expected: all PASS, no new errors/warnings.

- [ ] **Step 2: i18n cross-check (catalog ↔ locales)**

Run this throwaway check; expected output is `all locales complete` with no `MISSING`
lines:

```bash
node -e "
const ids = require('fs').readFileSync('src/components/Hero/techCatalog.ts','utf8').match(/id:\s*'([^']+)'/g).map(s=>s.match(/'([^']+)'/)[1]);
let ok=true;
for (const l of ['en','es','pt','zh']) {
  const j = JSON.parse(require('fs').readFileSync('src/i18n/locales/'+l+'.json','utf8'));
  const brief = (j.techShowcase||{}).brief||{};
  for (const id of ids) if (!brief[id]) { ok=false; console.log('MISSING', l, id); }
}
console.log(ok ? 'all locales complete' : 'INCOMPLETE');
"
```

- [ ] **Step 3: Manual browser checklist**

Run `npm run dev` and verify:
- [ ] Clicking each marquee technology scrolls to the hero and forms its logo.
- [ ] Each logo is recognizable and shows real brand colors (pay special attention
      to the `logoUrl`-substituted entries flagged in Task 1: aws, threejs, drizzle,
      mongodb, express, astro — swap the URL if a mark is invisible/washed out).
- [ ] The brief panel shows the correct localized text; switch language (en/es/pt/zh)
      and spot-check a few.
- [ ] `Esc` dismisses; clicking outside the panel dismisses; the loop resumes.
- [ ] Selecting a different tech while one is open morphs to the new logo.
- [ ] Resizing the window while a logo is shown keeps it crisp.
- [ ] With `VITE_PARTICLE_ENABLED=false` in `.env` (restart dev server), clicking a
      marquee item does nothing (no panel, no crash). Restore the env afterward.
- [ ] With OS "reduce motion" enabled, clicking a marquee item does nothing.

- [ ] **Step 4: Final commit (if any URL swaps were needed)**

```bash
git add -A
git commit -m "fix: finalize tech logo URLs after visual verification"
```

---

## Self-Review Notes

- **Spec coverage:** catalog (T1), briefs/i18n (T2), context wiring (T3), selectable
  marquee (T4), colored sampling (T5), shader (T6), showcase state (T7), field wiring
  (T8), brief panel + scroll + dismissal (T9), verification incl. reduced-motion/disabled
  inert behavior (T10). All spec sections map to a task.
- **Reduced-motion/disabled:** handled in two layers. (1) `ParticleField`'s
  construction effect early-returns under `reduced`/`!ENABLED`, so `systemRef.current`
  stays null and `applyShowcase` never runs — the particle side is inert. (2) `BriefPanel`
  (T9) mirrors the same `PARTICLES_ENABLED` + `useReducedMotion()` rules: when inert it
  renders `null` and defensively calls `clear()`, so a `select()` from the marquee
  produces no panel and no lingering selection. This satisfies the spec's "tech is NOT
  clickable in those modes."
- **Type consistency:** `showShape(spec, colors)` / `releaseShape()` signatures match
  between T7 (definition), T8 (call sites), and the public getters
  `particleCountPublic` / `boundsPublic` (T8 Step 4). `TechItem` shape (T1) is the same
  type consumed by the context (T3), marquee (T4), and `applyShowcase` (T8).
```
