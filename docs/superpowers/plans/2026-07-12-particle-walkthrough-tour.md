# Particle Walkthrough Tour Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-time, first-visit cinematic guided tour where a comet of particles travels the homepage and orbits key features (tech-stack selector, featured works, agents, dev-zone) with i18n captions, to make undiscoverable interactions visible.

**Architecture:** A standalone `PageTour` React component mounts a fixed, full-viewport Canvas 2D overlay plus a caption/skip DOM layer. A framework-agnostic `TourController` runs a `requestAnimationFrame` loop over an ordered `TourStop` config, driving its own scroll tween and per-stop `scroll → approach → orbit → hold → depart` states. All motion is in viewport coordinates; targets resolve via `data-tour-id` selectors. The existing Three.js hero engine is untouched.

**Tech Stack:** React 19, TypeScript (strict), Vite 7, Canvas 2D, Framer Motion (already present, for caption fade), Vitest + jsdom (added in Task 1).

## Global Constraints

- TypeScript strict; **never use `any`** (project rule). Prefer explicit types / `unknown` + narrowing.
- **Do not modify** anything under `src/components/Hero/**` (the hero particle engine stays as-is).
- All four locale files (`src/i18n/locales/{en,es,pt,zh}.json`) must mirror the `en` shape exactly, or `tsc -b` fails (`Messages = typeof en` + `satisfies`). Every new key added to `en` must be added to `es`, `pt`, `zh`.
- Tour palette (reuse hero colors): coral `#FF6B6B`, teal `#00D9A3`, purple `#9D4EDD`.
- First-visit flag key: `ff.tour.v1.seen` (localStorage).
- Gating to auto-run: first visit AND `PARTICLES_ENABLED` AND not `prefers-reduced-motion` AND viewport width ≥ 1024 AND fine pointer.
- Start delay after load ≈ hero intro length: `INTRO_TOTAL_S` (4.8s) + a short beat.
- Path alias `@` → `src` (works in Vitest via shared Vite config).
- Per-task verification commands: `npm run test` (Vitest), `npm run build` (tsc + vite build), `npm run lint` (eslint). Commit after each task.

---

### Task 1: Add Vitest + jsdom test infrastructure

**Files:**
- Modify: `package.json` (devDependencies + scripts)
- Modify: `vite.config.ts` (add `test` config, switch to `vitest/config` defineConfig)
- Create: `src/test/setup.ts`
- Test: `src/test/smoke.test.ts`

**Interfaces:**
- Produces: `npm run test` runs Vitest in jsdom; `@` alias resolves in tests.

- [ ] **Step 1: Install dev dependencies**

Run:
```bash
npm install -D vitest@^2 jsdom@^25
```
Expected: `vitest` and `jsdom` added under devDependencies; no errors.

- [ ] **Step 2: Add test scripts to package.json**

In `package.json` `"scripts"`, add:
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 3: Update vite.config.ts to configure Vitest**

Replace the file contents with:
```ts
/// <reference types="vitest/config" />
import path from "path"
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
```

- [ ] **Step 4: Create the setup file**

Create `src/test/setup.ts`:
```ts
// Vitest setup. localStorage and matchMedia are used by the tour; jsdom
// provides localStorage but not matchMedia, so stub a minimal version here.
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();
});

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}
```

- [ ] **Step 5: Write the smoke test**

Create `src/test/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('test infra', () => {
  it('runs in jsdom with localStorage available', () => {
    localStorage.setItem('k', 'v');
    expect(localStorage.getItem('k')).toBe('v');
    expect(typeof document).toBe('object');
  });
});
```

- [ ] **Step 6: Run the test suite**

Run: `npm run test`
Expected: 1 passed. jsdom environment active.

- [ ] **Step 7: Confirm build + lint still pass**

Run: `npm run build && npm run lint`
Expected: both succeed (Vitest config change does not break the app build).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/test/
git commit -m "test: add Vitest + jsdom infrastructure"
```

---

### Task 2: Motion math (`tourMotion.ts`)

**Files:**
- Create: `src/components/PageTour/tourMotion.ts`
- Test: `src/components/PageTour/tourMotion.test.ts`

**Interfaces:**
- Produces:
  - `interface Vec2 { x: number; y: number }`
  - `interface Rect { left: number; top: number; width: number; height: number }`
  - `function easeInOutCubic(t: number): number`
  - `function lerp(a: number, b: number, t: number): number`
  - `function quadBezier(p0: Vec2, c: Vec2, p1: Vec2, t: number): Vec2`
  - `function orbitPoint(center: Vec2, radius: number, angle: number): Vec2`
  - `function rectCenter(r: Rect): Vec2`
  - `class TrailBuffer { constructor(capacity: number); push(p: Vec2): void; toArray(): Vec2[]; clear(): void }`

- [ ] **Step 1: Write the failing test**

Create `src/components/PageTour/tourMotion.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  easeInOutCubic, lerp, quadBezier, orbitPoint, rectCenter, TrailBuffer,
} from './tourMotion';

describe('easeInOutCubic', () => {
  it('pins endpoints and midpoint', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
  });
});

describe('lerp', () => {
  it('interpolates linearly', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(4, 8, 0)).toBe(4);
  });
});

describe('quadBezier', () => {
  it('returns endpoints at t=0 and t=1', () => {
    const p0 = { x: 0, y: 0 }, c = { x: 5, y: 10 }, p1 = { x: 10, y: 0 };
    expect(quadBezier(p0, c, p1, 0)).toEqual(p0);
    expect(quadBezier(p0, c, p1, 1)).toEqual(p1);
  });
  it('bows toward the control point at t=0.5', () => {
    const mid = quadBezier({ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 0 }, 0.5);
    expect(mid.y).toBeGreaterThan(0);
  });
});

describe('orbitPoint', () => {
  it('places the point at radius from center', () => {
    const p = orbitPoint({ x: 100, y: 100 }, 20, 0);
    expect(p.x).toBeCloseTo(120, 5);
    expect(p.y).toBeCloseTo(100, 5);
  });
});

describe('rectCenter', () => {
  it('returns the geometric center', () => {
    expect(rectCenter({ left: 10, top: 20, width: 100, height: 40 }))
      .toEqual({ x: 60, y: 40 });
  });
});

describe('TrailBuffer', () => {
  it('keeps only the last N points, oldest-first', () => {
    const buf = new TrailBuffer(3);
    buf.push({ x: 1, y: 1 });
    buf.push({ x: 2, y: 2 });
    buf.push({ x: 3, y: 3 });
    buf.push({ x: 4, y: 4 });
    expect(buf.toArray()).toEqual([
      { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 },
    ]);
  });
  it('clears', () => {
    const buf = new TrailBuffer(3);
    buf.push({ x: 1, y: 1 });
    buf.clear();
    expect(buf.toArray()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tourMotion`
Expected: FAIL — cannot resolve `./tourMotion`.

- [ ] **Step 3: Write the implementation**

Create `src/components/PageTour/tourMotion.ts`:
```ts
export interface Vec2 { x: number; y: number }
export interface Rect { left: number; top: number; width: number; height: number }

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function quadBezier(p0: Vec2, c: Vec2, p1: Vec2, t: number): Vec2 {
  const u = 1 - t;
  const a = u * u;
  const b = 2 * u * t;
  const d = t * t;
  return {
    x: a * p0.x + b * c.x + d * p1.x,
    y: a * p0.y + b * c.y + d * p1.y,
  };
}

export function orbitPoint(center: Vec2, radius: number, angle: number): Vec2 {
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}

export function rectCenter(r: Rect): Vec2 {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Fixed-capacity ring buffer of recent points; `toArray` returns oldest-first. */
export class TrailBuffer {
  private points: Vec2[] = [];
  constructor(private capacity: number) {}
  push(p: Vec2): void {
    this.points.push({ x: p.x, y: p.y });
    if (this.points.length > this.capacity) this.points.shift();
  }
  toArray(): Vec2[] {
    return this.points.map((p) => ({ x: p.x, y: p.y }));
  }
  clear(): void {
    this.points = [];
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tourMotion`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/PageTour/tourMotion.ts src/components/PageTour/tourMotion.test.ts
git commit -m "feat(tour): motion math helpers"
```

---

### Task 3: First-visit flag (`useFirstVisit.ts`)

**Files:**
- Create: `src/components/PageTour/useFirstVisit.ts`
- Test: `src/components/PageTour/useFirstVisit.test.ts`

**Interfaces:**
- Produces:
  - `const TOUR_SEEN_KEY = 'ff.tour.v1.seen'`
  - `const TOUR_REPLAY_EVENT = 'ff:tour-replay'`
  - `function hasSeenTour(): boolean`
  - `function markTourSeen(): void`
  - `function clearTourSeen(): void`

- [ ] **Step 1: Write the failing test**

Create `src/components/PageTour/useFirstVisit.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  TOUR_SEEN_KEY, hasSeenTour, markTourSeen, clearTourSeen,
} from './useFirstVisit';

describe('first-visit flag', () => {
  it('is false before any visit', () => {
    expect(hasSeenTour()).toBe(false);
  });
  it('becomes true after marking, using the versioned key', () => {
    markTourSeen();
    expect(localStorage.getItem(TOUR_SEEN_KEY)).toBe('1');
    expect(hasSeenTour()).toBe(true);
  });
  it('clears back to false', () => {
    markTourSeen();
    clearTourSeen();
    expect(hasSeenTour()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- useFirstVisit`
Expected: FAIL — cannot resolve module.

- [ ] **Step 3: Write the implementation**

Create `src/components/PageTour/useFirstVisit.ts`:
```ts
/** localStorage key gating the one-time tour. Bump the version to re-show it. */
export const TOUR_SEEN_KEY = 'ff.tour.v1.seen';

/** Window event the footer "replay" button dispatches to restart the tour. */
export const TOUR_REPLAY_EVENT = 'ff:tour-replay';

export function hasSeenTour(): boolean {
  try {
    return localStorage.getItem(TOUR_SEEN_KEY) === '1';
  } catch {
    return true; // storage blocked → behave as "already seen" (do not auto-run)
  }
}

export function markTourSeen(): void {
  try {
    localStorage.setItem(TOUR_SEEN_KEY, '1');
  } catch {
    /* ignore quota/privacy errors */
  }
}

export function clearTourSeen(): void {
  try {
    localStorage.removeItem(TOUR_SEEN_KEY);
  } catch {
    /* ignore */
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- useFirstVisit`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/PageTour/useFirstVisit.ts src/components/PageTour/useFirstVisit.test.ts
git commit -m "feat(tour): first-visit flag + replay event constant"
```

---

### Task 4: Stop configuration (`tourStops.ts`)

**Files:**
- Create: `src/components/PageTour/tourStops.ts`
- Test: `src/components/PageTour/tourStops.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type TourStopId = 'techStack' | 'featuredWorks' | 'agents' | 'devZone'`
  - `interface TourStop { id: TourStopId; selector: string; captionKey: string; orbit: { radius: number; revolutions: number }; captionPlacement: 'top' | 'bottom' | 'left' | 'right'; scrollAlign: 'center' | 'start' }`
  - `const TOUR_STOPS: TourStop[]`
  - `function resolveStopElement(stop: TourStop): HTMLElement | null`

- [ ] **Step 1: Write the failing test**

Create `src/components/PageTour/tourStops.test.ts`:
```ts
import { describe, it, expect, afterEach } from 'vitest';
import { TOUR_STOPS, resolveStopElement } from './tourStops';

afterEach(() => { document.body.innerHTML = ''; });

describe('TOUR_STOPS config', () => {
  it('lists the four stops in page order', () => {
    expect(TOUR_STOPS.map((s) => s.id)).toEqual([
      'techStack', 'featuredWorks', 'agents', 'devZone',
    ]);
  });
  it('every stop has a caption key under the tour namespace', () => {
    for (const s of TOUR_STOPS) {
      expect(s.captionKey.startsWith('tour.stops.')).toBe(true);
      expect(s.orbit.radius).toBeGreaterThan(0);
    }
  });
});

describe('resolveStopElement', () => {
  it('returns null when the anchor is absent', () => {
    expect(resolveStopElement(TOUR_STOPS[0])).toBeNull();
  });
  it('finds the element by its data-tour-id', () => {
    const el = document.createElement('div');
    el.setAttribute('data-tour-id', 'tech-stack');
    document.body.appendChild(el);
    expect(resolveStopElement(TOUR_STOPS[0])).toBe(el);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tourStops`
Expected: FAIL — cannot resolve module.

- [ ] **Step 3: Write the implementation**

Create `src/components/PageTour/tourStops.ts`:
```ts
export type TourStopId = 'techStack' | 'featuredWorks' | 'agents' | 'devZone';

export interface TourStop {
  id: TourStopId;
  /** CSS selector resolved against the live DOM at runtime. */
  selector: string;
  /** i18n key for the caption copy. */
  captionKey: string;
  orbit: { radius: number; revolutions: number };
  captionPlacement: 'top' | 'bottom' | 'left' | 'right';
  scrollAlign: 'center' | 'start';
}

export const TOUR_STOPS: TourStop[] = [
  {
    id: 'techStack',
    selector: '[data-tour-id="tech-stack"]',
    captionKey: 'tour.stops.techStack',
    orbit: { radius: 90, revolutions: 1.75 },
    captionPlacement: 'top',
    scrollAlign: 'center',
  },
  {
    id: 'featuredWorks',
    selector: '[data-tour-id="featured-works"]',
    captionKey: 'tour.stops.featuredWorks',
    orbit: { radius: 110, revolutions: 1.5 },
    captionPlacement: 'right',
    scrollAlign: 'center',
  },
  {
    id: 'agents',
    selector: '[data-tour-id="agents"]',
    captionKey: 'tour.stops.agents',
    orbit: { radius: 110, revolutions: 1.5 },
    captionPlacement: 'top',
    scrollAlign: 'center',
  },
  {
    id: 'devZone',
    selector: '[data-tour-id="dev-zone"]',
    captionKey: 'tour.stops.devZone',
    orbit: { radius: 46, revolutions: 2 },
    captionPlacement: 'bottom',
    scrollAlign: 'start',
  },
];

export function resolveStopElement(stop: TourStop): HTMLElement | null {
  return document.querySelector<HTMLElement>(stop.selector);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tourStops`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/PageTour/tourStops.ts src/components/PageTour/tourStops.test.ts
git commit -m "feat(tour): ordered stop config + anchor resolver"
```

---

### Task 5: Caption copy in all four locales

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/es.json`
- Modify: `src/i18n/locales/pt.json`
- Modify: `src/i18n/locales/zh.json`
- Test: `src/components/PageTour/tourCopy.test.ts`

**Interfaces:**
- Consumes: `TOUR_STOPS` (Task 4), `translate` from `@/i18n/translate`, `messages` from `@/i18n/config`.
- Produces: a `tour` namespace resolvable in every locale.

- [ ] **Step 1: Write the failing test**

Create `src/components/PageTour/tourCopy.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { messages } from '@/i18n/config';
import { translate } from '@/i18n/translate';
import { TOUR_STOPS } from './tourStops';

const LOCALES = Object.keys(messages) as (keyof typeof messages)[];

describe('tour copy', () => {
  it('resolves skip + replay labels in every locale', () => {
    for (const loc of LOCALES) {
      expect(translate(messages[loc], 'tour.skip')).not.toBe('tour.skip');
      expect(translate(messages[loc], 'tour.replay')).not.toBe('tour.replay');
    }
  });
  it('resolves every stop caption in every locale', () => {
    for (const loc of LOCALES) {
      for (const stop of TOUR_STOPS) {
        const text = translate(messages[loc], stop.captionKey);
        expect(text).not.toBe(stop.captionKey); // key echoed back == missing
        expect(text.length).toBeGreaterThan(0);
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tourCopy`
Expected: FAIL — captions echo their keys (namespace missing).

- [ ] **Step 3: Add the `tour` namespace to `en.json`**

Add this top-level block to `src/i18n/locales/en.json` (e.g. after the `nav` block; keep valid JSON — mind the trailing comma):
```json
  "tour": {
    "skip": "Skip tour",
    "replay": "Replay guided tour",
    "stops": {
      "techStack": "Click any logo to watch it form in the hero, with a short note on how I use it.",
      "featuredWorks": "Open a project for the full case study and migration dossier.",
      "agents": "How I actually build with AI agents — end to end.",
      "devZone": "Step into the Dev Zone — a hidden, draggable desk of my daily tools."
    }
  },
```

- [ ] **Step 4: Add the same shape to `es.json`**

Add to `src/i18n/locales/es.json`:
```json
  "tour": {
    "skip": "Saltar recorrido",
    "replay": "Repetir recorrido guiado",
    "stops": {
      "techStack": "Haz clic en cualquier logo para verlo formarse en el hero, con una nota de cómo lo uso.",
      "featuredWorks": "Abre un proyecto para ver el caso completo y el expediente de migración.",
      "agents": "Cómo construyo realmente con agentes de IA, de principio a fin.",
      "devZone": "Entra en la Dev Zone: un escritorio oculto y arrastrable con mis herramientas diarias."
    }
  },
```

- [ ] **Step 5: Add the same shape to `pt.json`**

Add to `src/i18n/locales/pt.json`:
```json
  "tour": {
    "skip": "Pular tour",
    "replay": "Repetir tour guiado",
    "stops": {
      "techStack": "Clique em qualquer logo para vê-lo se formar no hero, com uma nota de como eu o uso.",
      "featuredWorks": "Abra um projeto para ver o estudo de caso completo e o dossiê de migração.",
      "agents": "Como eu realmente construo com agentes de IA, do início ao fim.",
      "devZone": "Entre na Dev Zone — uma mesa oculta e arrastável com minhas ferramentas do dia a dia."
    }
  },
```

- [ ] **Step 6: Add the same shape to `zh.json`**

Add to `src/i18n/locales/zh.json`:
```json
  "tour": {
    "skip": "跳过导览",
    "replay": "重新播放导览",
    "stops": {
      "techStack": "点击任意徽标，即可看到它在主视觉中生成，并附上我如何使用它的说明。",
      "featuredWorks": "打开项目查看完整案例研究与迁移档案。",
      "agents": "我如何真正地用 AI 智能体从头到尾进行构建。",
      "devZone": "进入 Dev Zone —— 一张隐藏的、可拖拽的日常工具桌面。"
    }
  },
```

- [ ] **Step 7: Run the test + typecheck**

Run: `npm run test -- tourCopy && npm run build`
Expected: test PASS; `tsc -b` PASS (proves all four locales mirror `en`'s new shape — if any locale is missing the block, the build fails here).

- [ ] **Step 8: Commit**

```bash
git add src/i18n/locales/ src/components/PageTour/tourCopy.test.ts
git commit -m "feat(tour): add tour caption copy in 4 locales"
```

---

### Task 6: Comet renderer (`cometRenderer.ts`)

**Files:**
- Create: `src/components/PageTour/cometRenderer.ts`
- Test: `src/components/PageTour/cometRenderer.test.ts`

**Interfaces:**
- Consumes: `Vec2` from `./tourMotion`.
- Produces:
  - `const TOUR_PALETTE: readonly string[]`
  - `interface CometParticle { color: string; radius: number; offset: number }`
  - `function createComet(count: number): CometParticle[]`
  - `function drawComet(ctx: CanvasRenderingContext2D, head: Vec2, trail: Vec2[], particles: CometParticle[], opacity: number): void`

- [ ] **Step 1: Write the failing test**

Create `src/components/PageTour/cometRenderer.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { TOUR_PALETTE, createComet, drawComet } from './cometRenderer';

describe('createComet', () => {
  it('produces the requested particle count', () => {
    expect(createComet(16)).toHaveLength(16);
  });
  it('draws all colors from the tour palette', () => {
    for (const p of createComet(30)) {
      expect(TOUR_PALETTE).toContain(p.color);
    }
  });
  it('is deterministic (stable across calls)', () => {
    expect(createComet(8)).toEqual(createComet(8));
  });
});

describe('drawComet', () => {
  it('does not draw when opacity is 0', () => {
    const ctx = fakeCtx();
    drawComet(ctx.proxy, { x: 0, y: 0 }, [{ x: 0, y: 0 }], createComet(4), 0);
    expect(ctx.calls.arc).toBe(0);
  });
  it('draws head + trail arcs when visible', () => {
    const ctx = fakeCtx();
    drawComet(ctx.proxy, { x: 10, y: 10 }, [{ x: 1, y: 1 }, { x: 2, y: 2 }], createComet(4), 1);
    expect(ctx.calls.arc).toBeGreaterThan(0);
  });
});

function fakeCtx() {
  const calls = { arc: 0, fill: 0 };
  const proxy = {
    save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(),
    arc: vi.fn(() => { calls.arc++; }),
    fill: vi.fn(() => { calls.fill++; }),
    set globalAlpha(_v: number) {}, get globalAlpha() { return 1; },
    set fillStyle(_v: string) {}, get fillStyle() { return ''; },
    set shadowBlur(_v: number) {}, get shadowBlur() { return 0; },
    set shadowColor(_v: string) {}, get shadowColor() { return ''; },
  } as unknown as CanvasRenderingContext2D;
  return { proxy, calls };
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- cometRenderer`
Expected: FAIL — cannot resolve module.

- [ ] **Step 3: Write the implementation**

Create `src/components/PageTour/cometRenderer.ts`:
```ts
import type { Vec2 } from './tourMotion';

export const TOUR_PALETTE = ['#FF6B6B', '#00D9A3', '#9D4EDD'] as const;

export interface CometParticle {
  color: string;
  /** base sprite radius in CSS px */
  radius: number;
  /** angular/temporal offset so particles in the head don't overlap exactly */
  offset: number;
}

/**
 * Deterministic head-cluster description. Colors cycle the palette so coral
 * dominates (index 0) with teal/purple accents, matching the hero field.
 */
export function createComet(count: number): CometParticle[] {
  const out: CometParticle[] = [];
  for (let i = 0; i < count; i++) {
    // Weighted toward coral: every 3rd/5th particle picks an accent.
    const color =
      i % 5 === 0 ? TOUR_PALETTE[2]
      : i % 3 === 0 ? TOUR_PALETTE[1]
      : TOUR_PALETTE[0];
    out.push({
      color,
      radius: 1.6 + (i % 4) * 0.5,
      offset: (i / count) * Math.PI * 2,
    });
  }
  return out;
}

/**
 * Draw the comet: a soft glowing head cluster at `head`, plus the fading trail
 * (oldest-first) shrinking and dimming toward the tail. No-op at opacity 0.
 */
export function drawComet(
  ctx: CanvasRenderingContext2D,
  head: Vec2,
  trail: Vec2[],
  particles: CometParticle[],
  opacity: number,
): void {
  if (opacity <= 0) return;
  ctx.save();

  // Trail: dim, shrinking dots from tail (index 0) to head (last).
  const n = trail.length;
  for (let i = 0; i < n; i++) {
    const t = (i + 1) / n; // 0..1, newer = larger/brighter
    const p = trail[i];
    ctx.globalAlpha = opacity * 0.35 * t;
    ctx.fillStyle = TOUR_PALETTE[0];
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.4 * t + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head cluster: each particle jittered slightly around the head point.
  ctx.shadowBlur = 12;
  for (const part of particles) {
    const jx = Math.cos(part.offset) * 2.2;
    const jy = Math.sin(part.offset) * 2.2;
    ctx.globalAlpha = opacity * 0.9;
    ctx.fillStyle = part.color;
    ctx.shadowColor = part.color;
    ctx.beginPath();
    ctx.arc(head.x + jx, head.y + jy, part.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- cometRenderer`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/PageTour/cometRenderer.ts src/components/PageTour/cometRenderer.test.ts
git commit -m "feat(tour): comet Canvas 2D renderer"
```

---

### Task 7: Tour controller (`TourController.ts`)

**Files:**
- Create: `src/components/PageTour/TourController.ts`
- Test: `src/components/PageTour/TourController.test.ts`

**Interfaces:**
- Consumes: `TourStop` (Task 4); `Vec2`, `Rect`, `TrailBuffer`, `easeInOutCubic`, `lerp`, `quadBezier`, `orbitPoint`, `rectCenter` (Task 2).
- Produces:
  - `type TourPhase = 'idle' | 'scroll' | 'approach' | 'orbit' | 'hold' | 'depart' | 'finish' | 'done'`
  - `interface TourDeps { now(): number; viewport(): { width: number; height: number; scrollY: number }; getRect(selector: string): Rect | null; scrollTo(y: number): void; render(head: Vec2, trail: Vec2[], opacity: number): void; showCaption(stop: TourStop | null): void; onDone(reason: 'completed' | 'aborted'): void }`
  - `class TourController { constructor(stops: TourStop[], deps: TourDeps); get phase(): TourPhase; start(): void; step(now: number): void; abort(): void }`

Note: `TourController.step(now)` is the pure advance used by tests and by the rAF loop in `PageTour`. The controller does **not** own `requestAnimationFrame` (the component drives it), which keeps it deterministic and testable.

- [ ] **Step 1: Write the failing test**

Create `src/components/PageTour/TourController.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { TourController, type TourDeps } from './TourController';
import type { TourStop } from './tourStops';
import type { Rect, Vec2 } from './tourMotion';

const STOPS: TourStop[] = [
  { id: 'techStack', selector: '#a', captionKey: 'k.a', orbit: { radius: 40, revolutions: 1 }, captionPlacement: 'top', scrollAlign: 'center' },
  { id: 'devZone', selector: '#b', captionKey: 'k.b', orbit: { radius: 40, revolutions: 1 }, captionPlacement: 'bottom', scrollAlign: 'start' },
];

function makeDeps(over: Partial<TourDeps> = {}): TourDeps {
  return {
    now: () => 0,
    viewport: () => ({ width: 1440, height: 900, scrollY: 0 }),
    getRect: (sel: string): Rect | null =>
      sel === '#a' ? { left: 200, top: 300, width: 100, height: 40 }
      : sel === '#b' ? { left: 800, top: 5000, width: 60, height: 30 }
      : null,
    scrollTo: vi.fn(),
    render: vi.fn(),
    showCaption: vi.fn(),
    onDone: vi.fn(),
    ...over,
  };
}

// Drive the controller from t=0 to t=ms in fixed increments.
function run(ctrl: TourController, ms: number, dt = 50) {
  for (let t = 0; t <= ms; t += dt) ctrl.step(t);
}

describe('TourController', () => {
  it('starts idle and enters scroll on start', () => {
    const ctrl = new TourController(STOPS, makeDeps());
    expect(ctrl.phase).toBe('idle');
    ctrl.start();
    ctrl.step(0);
    expect(ctrl.phase).toBe('scroll');
  });

  it('shows a caption once it reaches the orbit phase', () => {
    const deps = makeDeps();
    const ctrl = new TourController(STOPS, deps);
    ctrl.start();
    run(ctrl, 3000);
    expect(deps.showCaption).toHaveBeenCalled();
    const shownIds = (deps.showCaption as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => (c[0] as TourStop | null)?.id);
    expect(shownIds).toContain('techStack');
  });

  it('drives scroll toward the target', () => {
    const deps = makeDeps();
    const ctrl = new TourController(STOPS, deps);
    ctrl.start();
    run(ctrl, 1200);
    expect(deps.scrollTo).toHaveBeenCalled();
  });

  it('eventually completes and reports "completed", setting caption null', () => {
    const deps = makeDeps();
    const ctrl = new TourController(STOPS, deps);
    ctrl.start();
    run(ctrl, 30000);
    expect(ctrl.phase).toBe('done');
    expect(deps.onDone).toHaveBeenCalledWith('completed');
    expect(deps.showCaption).toHaveBeenLastCalledWith(null);
  });

  it('abort() stops immediately and reports "aborted"', () => {
    const deps = makeDeps();
    const ctrl = new TourController(STOPS, deps);
    ctrl.start();
    ctrl.step(0);
    ctrl.abort();
    expect(ctrl.phase).toBe('done');
    expect(deps.onDone).toHaveBeenCalledWith('aborted');
  });

  it('skips a stop whose anchor cannot be resolved', () => {
    const deps = makeDeps({ getRect: () => null });
    const ctrl = new TourController(STOPS, deps);
    ctrl.start();
    run(ctrl, 30000);
    expect(ctrl.phase).toBe('done');
    expect(deps.onDone).toHaveBeenCalledWith('completed');
    // No caption ever shown because nothing resolved.
    const shown = (deps.showCaption as ReturnType<typeof vi.fn>).mock.calls
      .some((c) => c[0] !== null);
    expect(shown).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- TourController`
Expected: FAIL — cannot resolve module.

- [ ] **Step 3: Write the implementation**

Create `src/components/PageTour/TourController.ts`:
```ts
import type { TourStop } from './tourStops';
import {
  type Vec2, type Rect, TrailBuffer,
  easeInOutCubic, lerp, quadBezier, orbitPoint, rectCenter,
} from './tourMotion';

export type TourPhase =
  | 'idle' | 'scroll' | 'approach' | 'orbit' | 'hold' | 'depart' | 'finish' | 'done';

export interface TourDeps {
  now(): number;
  viewport(): { width: number; height: number; scrollY: number };
  /** Target rect in viewport coordinates, or null if the anchor is absent. */
  getRect(selector: string): Rect | null;
  scrollTo(y: number): void;
  render(head: Vec2, trail: Vec2[], opacity: number): void;
  showCaption(stop: TourStop | null): void;
  onDone(reason: 'completed' | 'aborted'): void;
}

const SCROLL_MS = 1000;
const APPROACH_MS = 900;
const ORBIT_REV_MS = 900;   // per revolution
const HOLD_MS = 1500;
const DEPART_MS = 600;
const FINISH_MS = 700;
const TRAIL = 26;

export class TourController {
  private _phase: TourPhase = 'idle';
  private phaseStart = 0;
  private index = 0;
  private head: Vec2 = { x: 0, y: 0 };
  private trail = new TrailBuffer(TRAIL);
  private scrollFrom = 0;
  private scrollTarget = 0;
  private orbitCenter: Vec2 = { x: 0, y: 0 };
  private approachFrom: Vec2 = { x: 0, y: 0 };
  private approachCtrl: Vec2 = { x: 0, y: 0 };
  private approachTo: Vec2 = { x: 0, y: 0 };

  constructor(private stops: TourStop[], private deps: TourDeps) {}

  get phase(): TourPhase { return this._phase; }

  start(): void {
    this.index = 0;
    this.enterScrollOrSkip(this.deps.now());
  }

  abort(): void {
    if (this._phase === 'done') return;
    this.deps.showCaption(null);
    this._phase = 'done';
    this.deps.onDone('aborted');
  }

  private setPhase(p: TourPhase, now: number): void {
    this._phase = p;
    this.phaseStart = now;
  }

  private currentRect(): Rect | null {
    const stop = this.stops[this.index];
    return stop ? this.deps.getRect(stop.selector) : null;
  }

  /** Move to the next stop; enter its scroll phase, or finish when exhausted. */
  private advance(now: number): void {
    this.index += 1;
    this.enterScrollOrSkip(now);
  }

  private enterScrollOrSkip(now: number): void {
    // Skip any stops that don't resolve.
    while (this.index < this.stops.length && !this.currentRect()) {
      this.index += 1;
    }
    if (this.index >= this.stops.length) {
      this.setPhase('finish', now);
      return;
    }
    const stop = this.stops[this.index];
    const rect = this.currentRect()!;
    const vp = this.deps.viewport();
    const align = stop.scrollAlign;
    // rect.top is viewport-relative; convert to document space then align.
    const docTop = vp.scrollY + rect.top;
    const targetY = align === 'center'
      ? docTop - vp.height / 2 + rect.height / 2
      : docTop - 96; // 'start' leaves a small header gap
    this.scrollFrom = vp.scrollY;
    this.scrollTarget = Math.max(0, targetY);
    this.setPhase('scroll', now);
  }

  step(now: number): void {
    if (this._phase === 'idle' || this._phase === 'done') return;
    const elapsed = now - this.phaseStart;

    switch (this._phase) {
      case 'scroll': {
        const t = Math.min(elapsed / SCROLL_MS, 1);
        const y = lerp(this.scrollFrom, this.scrollTarget, easeInOutCubic(t));
        this.deps.scrollTo(y);
        // Park the comet near the incoming target so approach starts sensibly.
        const rect = this.currentRect();
        if (rect) {
          const c = rectCenter(rect);
          if (t === 0) this.head = { x: c.x, y: -40 };
        }
        this.pushRender(1);
        if (t >= 1) this.beginApproach(now);
        break;
      }
      case 'approach': {
        const t = Math.min(elapsed / APPROACH_MS, 1);
        this.head = quadBezier(this.approachFrom, this.approachCtrl, this.approachTo, easeInOutCubic(t));
        this.pushRender(1);
        if (t >= 1) {
          this.deps.showCaption(this.stops[this.index]);
          this.setPhase('orbit', now);
        }
        break;
      }
      case 'orbit': {
        const stop = this.stops[this.index];
        const orbitMs = ORBIT_REV_MS * stop.orbit.revolutions;
        const t = Math.min(elapsed / orbitMs, 1);
        const rect = this.currentRect();
        if (rect) this.orbitCenter = rectCenter(rect);
        const angle = -Math.PI / 2 + t * stop.orbit.revolutions * Math.PI * 2;
        this.head = orbitPoint(this.orbitCenter, stop.orbit.radius, angle);
        this.pushRender(1);
        if (t >= 1) this.setPhase('hold', now);
        break;
      }
      case 'hold': {
        const stop = this.stops[this.index];
        const rect = this.currentRect();
        if (rect) this.orbitCenter = rectCenter(rect);
        // Keep drifting slowly around so it reads as alive.
        const angle = -Math.PI / 2 + (stop.orbit.revolutions + elapsed / 2400) * Math.PI * 2;
        this.head = orbitPoint(this.orbitCenter, stop.orbit.radius, angle);
        this.pushRender(1);
        if (elapsed >= HOLD_MS) {
          this.deps.showCaption(null);
          this.setPhase('depart', now);
        }
        break;
      }
      case 'depart': {
        const t = Math.min(elapsed / DEPART_MS, 1);
        // Drift downward off the orbit while fading, then advance.
        this.head = { x: this.orbitCenter.x, y: this.orbitCenter.y + t * 120 };
        this.pushRender(1 - t * 0.4);
        if (t >= 1) this.advance(now);
        break;
      }
      case 'finish': {
        const t = Math.min(elapsed / FINISH_MS, 1);
        this.pushRender(1 - t);
        if (t >= 1) {
          this._phase = 'done';
          this.deps.showCaption(null);
          this.deps.onDone('completed');
        }
        break;
      }
    }
  }

  private beginApproach(now: number): void {
    const rect = this.currentRect();
    const target = rect ? rectCenter(rect) : this.head;
    this.approachFrom = { ...this.head };
    this.approachTo = target;
    // Control point: midpoint pushed perpendicular for a graceful arc.
    const mx = (this.approachFrom.x + target.x) / 2;
    const my = (this.approachFrom.y + target.y) / 2;
    this.approachCtrl = { x: mx + 80, y: my - 60 };
    this.setPhase('approach', now);
  }

  private pushRender(opacity: number): void {
    this.trail.push(this.head);
    this.deps.render(this.head, this.trail.toArray(), opacity);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- TourController`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/PageTour/TourController.ts src/components/PageTour/TourController.test.ts
git commit -m "feat(tour): tour state-machine controller"
```

---

### Task 8: Gating predicate + `PageTour` component

**Files:**
- Create: `src/components/PageTour/PageTour.tsx`
- Test: `src/components/PageTour/shouldRunTour.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 2–7; `useTranslation` from `@/i18n`; `PARTICLES_ENABLED` from `@/config/particles`; `TOUR_REPLAY_EVENT`, `hasSeenTour`, `markTourSeen` from `./useFirstVisit`.
- Produces:
  - `interface TourEnv { seen: boolean; particlesEnabled: boolean; reducedMotion: boolean; viewportWidth: number; finePointer: boolean }`
  - `function shouldRunTour(env: TourEnv): boolean`
  - `default` export: `PageTour` React component.

- [ ] **Step 1: Write the failing test (pure gating logic)**

Create `src/components/PageTour/shouldRunTour.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { shouldRunTour, type TourEnv } from './PageTour';

const OK: TourEnv = {
  seen: false, particlesEnabled: true, reducedMotion: false,
  viewportWidth: 1440, finePointer: true,
};

describe('shouldRunTour', () => {
  it('runs when all conditions are met', () => {
    expect(shouldRunTour(OK)).toBe(true);
  });
  it('does not run for repeat visitors', () => {
    expect(shouldRunTour({ ...OK, seen: true })).toBe(false);
  });
  it('does not run when particles are disabled', () => {
    expect(shouldRunTour({ ...OK, particlesEnabled: false })).toBe(false);
  });
  it('does not run under reduced motion', () => {
    expect(shouldRunTour({ ...OK, reducedMotion: true })).toBe(false);
  });
  it('does not run on narrow viewports', () => {
    expect(shouldRunTour({ ...OK, viewportWidth: 800 })).toBe(false);
  });
  it('does not run on coarse pointers (touch)', () => {
    expect(shouldRunTour({ ...OK, finePointer: false })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- shouldRunTour`
Expected: FAIL — cannot resolve `./PageTour`.

- [ ] **Step 3: Write the component + gating predicate**

Create `src/components/PageTour/PageTour.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { PARTICLES_ENABLED } from '@/config/particles';
import { TOUR_STOPS, type TourStop } from './tourStops';
import { TourController, type TourDeps } from './TourController';
import { createComet, drawComet } from './cometRenderer';
import type { Vec2, Rect } from './tourMotion';
import {
  TOUR_REPLAY_EVENT, hasSeenTour, markTourSeen,
} from './useFirstVisit';

export interface TourEnv {
  seen: boolean;
  particlesEnabled: boolean;
  reducedMotion: boolean;
  viewportWidth: number;
  finePointer: boolean;
}

/** Pure gating predicate — see shouldRunTour.test.ts. */
export function shouldRunTour(env: TourEnv): boolean {
  return (
    !env.seen &&
    env.particlesEnabled &&
    !env.reducedMotion &&
    env.viewportWidth >= 1024 &&
    env.finePointer
  );
}

const START_DELAY_MS = 5200; // ~hero intro (4.8s) + a beat
const COMET_COUNT = 16;

interface CaptionState { stop: TourStop; point: Vec2 }

const PageTour = () => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [caption, setCaption] = useState<CaptionState | null>(null);
  const controllerRef = useRef<TourController | null>(null);

  // Decide + run. Re-armed by the replay event.
  useEffect(() => {
    let started = false;
    let rafId = 0;
    let startTimer = 0;
    const listeners: Array<[string, EventListener, boolean]> = [];

    const readEnv = (): TourEnv => ({
      seen: hasSeenTour(),
      particlesEnabled: PARTICLES_ENABLED,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      viewportWidth: window.innerWidth,
      finePointer: window.matchMedia('(pointer: fine)').matches,
    });

    const begin = () => {
      if (started) return;
      started = true;
      setActive(true);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const sizeCanvas = () => {
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      sizeCanvas();

      const comet = createComet(COMET_COUNT);
      let programmatic = false;

      const deps: TourDeps = {
        now: () => performance.now(),
        viewport: () => ({
          width: window.innerWidth,
          height: window.innerHeight,
          scrollY: window.scrollY,
        }),
        getRect: (selector: string): Rect | null => {
          const el = document.querySelector<HTMLElement>(selector);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { left: r.left, top: r.top, width: r.width, height: r.height };
        },
        scrollTo: (y: number) => {
          programmatic = true;
          window.scrollTo(0, y);
          // Release the flag on the next frame so the resulting scroll event is ignored.
          requestAnimationFrame(() => { programmatic = false; });
        },
        render: (head: Vec2, trail: Vec2[], opacity: number) => {
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          drawComet(ctx, head, trail, comet, opacity);
        },
        showCaption: (stop: TourStop | null) => {
          if (!stop) { setCaption(null); return; }
          const el = document.querySelector<HTMLElement>(stop.selector);
          if (!el) { setCaption(null); return; }
          const r = el.getBoundingClientRect();
          setCaption({ stop, point: { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
        },
        onDone: (_reason) => {
          markTourSeen();
          finish();
        },
      };

      const controller = new TourController(TOUR_STOPS, deps);
      controllerRef.current = controller;

      const loop = () => {
        controller.step(performance.now());
        if (controller.phase !== 'done') rafId = requestAnimationFrame(loop);
      };

      const onResize = () => sizeCanvas();
      const abort = () => controller.abort();

      const addUserAbort = (type: string) => {
        const handler: EventListener = (e) => {
          if (type === 'scroll' && programmatic) return;
          if (type === 'keydown') {
            const k = (e as KeyboardEvent).key;
            const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Escape'];
            if (!keys.includes(k)) return;
          }
          abort();
        };
        const passive = type !== 'keydown';
        window.addEventListener(type, handler, { passive });
        listeners.push([type, handler, passive]);
      };
      ['wheel', 'touchmove', 'keydown'].forEach(addUserAbort);
      window.addEventListener('resize', onResize);
      listeners.push(['resize', onResize as EventListener, true]);

      controller.start();
      rafId = requestAnimationFrame(loop);
    };

    const finish = () => {
      cancelAnimationFrame(rafId);
      for (const [type, handler] of listeners) window.removeEventListener(type, handler);
      listeners.length = 0;
      setActive(false);
      setCaption(null);
      controllerRef.current = null;
    };

    const maybeStart = () => {
      if (shouldRunTour(readEnv())) {
        startTimer = window.setTimeout(begin, START_DELAY_MS);
      }
    };

    const onReplay = () => {
      if (started) return;
      startTimer = window.setTimeout(begin, 200);
    };
    window.addEventListener(TOUR_REPLAY_EVENT, onReplay);

    maybeStart();

    return () => {
      window.clearTimeout(startTimer);
      window.removeEventListener(TOUR_REPLAY_EVENT, onReplay);
      if (started) finish();
    };
  }, []);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />

      <AnimatePresence>
        {caption && (
          <motion.div
            key={caption.stop.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute max-w-[260px] -translate-x-1/2 rounded-xl border-l-2 border-coral-500 bg-cream-50/95 px-4 py-3 text-sm leading-snug text-dark-900 shadow-xl backdrop-blur"
            style={{
              left: caption.point.x,
              top: caption.point.y + captionOffsetY(caption.stop.captionPlacement),
            }}
          >
            {t(caption.stop.captionKey)}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => controllerRef.current?.abort()}
        className="pointer-events-auto fixed bottom-6 right-6 rounded-full border border-dark-900/15 bg-cream-50/90 px-4 py-2 text-xs font-medium text-dark-900/70 shadow-lg backdrop-blur transition-colors hover:text-coral-500"
      >
        {t('tour.skip')}
      </button>
    </div>
  );
};

function captionOffsetY(placement: TourStop['captionPlacement']): number {
  switch (placement) {
    case 'top': return -120;
    case 'bottom': return 80;
    default: return -16;
  }
}

export default PageTour;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- shouldRunTour`
Expected: all PASS.

- [ ] **Step 5: Typecheck + lint the component**

Run: `npm run build && npm run lint`
Expected: PASS. If lint flags the `_reason`/`_v` unused params, prefix is already `_` (allowed by the config's `argsIgnorePattern`); if the config lacks that pattern, rename to remove the param instead.

- [ ] **Step 6: Commit**

```bash
git add src/components/PageTour/PageTour.tsx src/components/PageTour/shouldRunTour.test.ts
git commit -m "feat(tour): PageTour overlay component + gating predicate"
```

---

### Task 9: Wire anchors, mount, and replay

**Files:**
- Modify: `src/pages/HomePage.tsx` (mount `<PageTour />`)
- Modify: `src/components/BrandMarquee.tsx` (add `data-tour-id="tech-stack"`)
- Modify: `src/components/FeaturedWorks.tsx` (add `data-tour-id="featured-works"`)
- Modify: `src/components/HowIWorkWithAgents.tsx` (add `data-tour-id="agents"`)
- Modify: `src/components/Navigation.tsx` (add `data-tour-id="dev-zone"`)
- Modify: `src/components/Footer.tsx` (replay button)

**Interfaces:**
- Consumes: `PageTour` default export; `TOUR_REPLAY_EVENT`, `clearTourSeen` from `@/components/PageTour/useFirstVisit`.

- [ ] **Step 1: Mount PageTour in HomePage**

In `src/pages/HomePage.tsx`, add the import and render it once inside the provider (last child, position-independent since it's fixed):
```tsx
import PageTour from '../components/PageTour/PageTour';
```
Add `<PageTour />` as the final child inside `<TechShowcaseProvider>` (after `<main>…</main>`):
```tsx
      </main>
      <PageTour />
    </TechShowcaseProvider>
```

- [ ] **Step 2: Anchor the tech-stack stop**

In `src/components/BrandMarquee.tsx`, add `data-tour-id="tech-stack"` to the scrolling logos row — the `motion.div` with `className="flex gap-16 items-center …"` (around line 26). Add the attribute:
```tsx
                <motion.div
                    data-tour-id="tech-stack"
                    className="flex gap-16 items-center whitespace-nowrap pr-16"
```

- [ ] **Step 3: Anchor the featured-works stop**

In `src/components/FeaturedWorks.tsx`, add `data-tour-id="featured-works"` to the `<section>` opening tag at line 624 (which already has `id="work"`):
```tsx
      <section
        data-tour-id="featured-works"
        id="work"
```

- [ ] **Step 4: Anchor the agents stop**

In `src/components/HowIWorkWithAgents.tsx`, add `data-tour-id="agents"` to the `<section>` at line 16–17 (already `id="agents"`):
```tsx
    <section
      data-tour-id="agents"
      id="agents"
```

- [ ] **Step 5: Anchor the dev-zone stop**

In `src/components/Navigation.tsx`, add `data-tour-id="dev-zone"` to the desktop dev-zone `Link` at line 81:
```tsx
                        <Link
                            to="/dev-zone"
                            data-tour-id="dev-zone"
```

- [ ] **Step 6: Add the replay button to the Footer**

In `src/components/Footer.tsx`, import the helpers and render a subtle text button. Add near the other imports:
```tsx
import { TOUR_REPLAY_EVENT, clearTourSeen } from './PageTour/useFirstVisit';
```
Add a handler in the component body:
```tsx
  const replayTour = () => {
    clearTourSeen();
    window.dispatchEvent(new CustomEvent(TOUR_REPLAY_EVENT));
  };
```
Render a button in the footer's bottom/meta row (place beside the existing copyright/meta text; match its muted styling):
```tsx
        <button
          type="button"
          onClick={replayTour}
          className="text-xs font-medium text-dark-900/50 underline-offset-4 transition-colors hover:text-coral-500 hover:underline"
        >
          {t('tour.replay')}
        </button>
```
If `Footer` does not already destructure `t`, add `const { t } = useTranslation();` (import `useTranslation` from `@/i18n`) — check the file first and reuse the existing translation hook if present.

- [ ] **Step 7: Typecheck, lint, and run all tests**

Run: `npm run build && npm run lint && npm run test`
Expected: all PASS. `tsc -b` confirms every anchor edit compiles and all four locales still mirror `en`.

- [ ] **Step 8: Commit**

```bash
git add src/pages/HomePage.tsx src/components/BrandMarquee.tsx src/components/FeaturedWorks.tsx src/components/HowIWorkWithAgents.tsx src/components/Navigation.tsx src/components/Footer.tsx
git commit -m "feat(tour): mount PageTour, wire anchors + footer replay"
```

---

### Task 10: End-to-end verification (Playwright) + reduced-motion check

**Files:** none (verification task). Use the `webapp-testing` / Playwright tooling available in the environment.

**Goal:** Confirm real behavior in a browser: the tour auto-runs once, scrolls, orbits, shows captions, aborts on input, respects the seen flag, and replay works.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Vite serves on a local URL (note the port).

- [ ] **Step 2: Fresh-visitor auto-run**

In the browser: open the site, clear `localStorage` (`localStorage.removeItem('ff.tour.v1.seen')`), reload. Wait ~5.5s.
Expected: the page auto-scrolls to the tech-stack marquee; a comet orbits the logos; the caption "Click any logo…" appears; then it proceeds through featured works → agents → dev-zone, orbiting/captioning each; finally the comet fades and scrolling stops.

- [ ] **Step 3: Seen flag suppresses repeat runs**

Reload the page (without clearing storage).
Expected: no tour runs; `localStorage.getItem('ff.tour.v1.seen') === '1'`.

- [ ] **Step 4: Manual-input abort**

Clear the seen flag and reload; during the tour, scroll with the wheel (or press End).
Expected: the tour aborts immediately — comet + caption disappear, scroll returns to the user — and the seen flag is set.

- [ ] **Step 5: Skip button**

Clear the seen flag and reload; click the "Skip tour" pill (bottom-right).
Expected: tour ends immediately; seen flag set.

- [ ] **Step 6: Footer replay**

With the seen flag set, click "Replay guided tour" in the footer.
Expected: the flag clears and the tour starts again (~0.2s later) from the tech-stack stop.

- [ ] **Step 7: Reduced-motion + mobile gating**

In DevTools, emulate `prefers-reduced-motion: reduce` (and separately, a ≤1000px / touch viewport), clear the flag, reload.
Expected: the tour does not run in either case; the hero experience is unaffected.

- [ ] **Step 8: Final full verification + commit note**

Run: `npm run test && npm run build && npm run lint`
Expected: all green. No code changes in this task; if a defect was found, fix it under the owning task's pattern (test-first) before marking complete.

---

## Self-Review

**Spec coverage:**
- Lifecycle (one-time, remembered, replay) → Tasks 3, 8, 9. ✓
- Cinematic scroll + instant yield → Task 7 (`scroll` phase), Task 8 (abort listeners, `programmatic` flag). ✓
- Four ordered stops + orbit + caption → Tasks 4, 5, 7, 8. ✓
- Comet + fading trail + hero palette → Tasks 2 (TrailBuffer), 6. ✓
- Standalone Canvas 2D overlay, hero untouched → Task 8; no Task modifies `Hero/**`. ✓
- i18n in 4 locales, shape-locked → Task 5. ✓
- Gating (first-visit, particles, reduced-motion, ≥1024, fine pointer) → Task 8 `shouldRunTour`. ✓
- Start after hero intro → Task 8 `START_DELAY_MS`. ✓
- Testing strategy (unit + controller + E2E) → Tasks 2–8 unit, Task 10 E2E. ✓
- Files-touched list matches spec → Task 9. ✓

**Placeholder scan:** No TBD/TODO; every code step contains complete code; every command has an expected result. ✓

**Type consistency:** `Vec2`/`Rect` defined in Task 2 and consumed by Tasks 6–8; `TourStop`/`TourStopId` defined in Task 4 and consumed by Tasks 5, 7, 8; `TourDeps`/`TourPhase` defined in Task 7 and consumed by Task 8; `TOUR_REPLAY_EVENT`/`hasSeenTour`/`markTourSeen`/`clearTourSeen` defined in Task 3 and consumed by Tasks 8, 9; `shouldRunTour`/`TourEnv` defined in Task 8 and tested there. Renderer `createComet`/`drawComet`/`TOUR_PALETTE` defined in Task 6 and consumed by Task 8. All names consistent. ✓

**Note for implementer:** Before Task 9 Step 6, open `Footer.tsx` and confirm whether `useTranslation`/`t` is already in scope; reuse it rather than adding a duplicate. Before adding each JSON block in Task 5, read the target file to place the block as valid JSON (comma handling).
