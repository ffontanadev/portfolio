import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { ParticleSystem } from './particles/ParticleSystem';
import type { ShapeSpec } from './particles/shapeSampler';
import type { IntroShapes } from './particles/IntroSequencer';
import { loadSilhouette } from './particles/silhouetteSampler';
import { SHOWCASE_LOGOS, showcaseSpecFor, showcaseFitsIn } from './particles/showcaseSpec';
import { useTechShowcase } from '@/context/TechShowcaseContext';
import type { TechItem } from './techCatalog';
import { PARTICLES_ENABLED } from '@/config/particles';

const PALETTE = {
  drift: new THREE.Color('#1A1A1A'),
  shape: new THREE.Color('#FF6B6B'),
  accents: [new THREE.Color('#00D9A3'), new THREE.Color('#9D4EDD')],
};

// --- Env-driven configuration ---------------------------------------------
// All particle-field config lives in .env (VITE_PARTICLE_*). When unset, the
// values below act as the defaults. Vite inlines import.meta.env at build /
// dev-server start, so changes to .env require restarting `npm run dev`.

const SHAPE_SEPARATOR = '|';

const ROCKET_SHAPE: ShapeSpec = { kind: 'rocket', sizeRatio: 0.28 };

const DEFAULT_SHAPES: ShapeSpec[] = [
  { kind: 'text', text: 'Felipe', heightRatio: 0.5 },
  { kind: 'text', text: 'FF.', heightRatio: 0.62 },
  { kind: 'heart', sizeRatio: 0.38 },
];

// Named frame-animation registry. Tokens in VITE_PARTICLE_SHAPES that match
// a key here resolve to that frame animation (handled in parseShapesFromEnv).
// Add a new animation by dropping frames in /public/anim/<name>/ and adding
// one entry below.
const ANIMATIONS: Record<string, ShapeSpec> = {
  walking: {
    kind: 'frames',
    srcs: Array.from({ length: 30 }, (_, i) =>
      `/anim/walking/guy-walking_${String(i + 1).padStart(3, '0')}.jpg`,
    ),
    fps: 2,
    sizeRatio: 0.55,
  },
};

// Auto-pick a heightRatio so longer text still fits on screen.
function textHeightRatio(text: string): number {
  const len = text.length;
  if (len <= 4) return 0.62;
  if (len <= 7) return 0.5;
  if (len <= 11) return 0.4;
  return 0.32;
}

// Parse VITE_PARTICLE_SHAPES into the ShapeSpec[] the engine consumes.
// Format: pipe-separated. `heart` (case-insensitive) → heart icon;
// anything else is rendered as Fraunces text. Empty / missing → defaults.
//
// This shape loop is the offline fallback only: the hero normally runs the
// tech-logo showcase, which takes over as soon as the first logo decodes and
// never hands back.
function parseShapesFromEnv(raw: string | undefined): ShapeSpec[] {
  if (!raw) return DEFAULT_SHAPES;
  const parts = raw
    .split(SHAPE_SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return DEFAULT_SHAPES;
  return parts.map((part): ShapeSpec => {
    const lower = part.toLowerCase();
    if (lower === 'heart') {
      return { kind: 'heart', sizeRatio: 0.38 };
    }
    if (ANIMATIONS[lower]) {
      return ANIMATIONS[lower];
    }
    return { kind: 'text', text: part, heightRatio: textHeightRatio(part) };
  });
}

const env = import.meta.env as Record<string, string | undefined>;
const ENV_SHAPES = parseShapesFromEnv(env.VITE_PARTICLE_SHAPES);
const ENABLED = PARTICLES_ENABLED;
const COUNT_OVERRIDE = (() => {
  const raw = env.VITE_PARTICLE_COUNT;
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
})();

const getParticleCount = (w: number): number => {
  if (COUNT_OVERRIDE !== null) return COUNT_OVERRIDE;
  if (w < 768) return 6000;
  if (w < 1280) return 14000;
  return 24000;
};

// --- Tech showcase helpers (module-scope, stable across renders) -----------

/**
 * How long to wait for the very first logo before starting the rocket without
 * it. The marks come off a CDN; a slow response must not stall the hero, so
 * past this point the intro ends on the rocket and the loop forms the logo
 * whenever it arrives.
 */
const FIRST_LOGO_BUDGET_MS = 2500;

/** Resolve once `src` has decoded, or once the budget runs out — whichever first. */
function loadWithin(src: string, budgetMs: number): Promise<boolean> {
  return Promise.race([
    loadSilhouette(src).then(
      () => true,
      (err) => {
        console.warn('[ParticleField] logo load failed', err);
        return false;
      },
    ),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), budgetMs)),
  ]);
}

/**
 * Show `tech`'s logo, cross-morphing from whatever is on screen. `auto` keeps
 * the loop cycling afterwards; a click passes false to park on one logo.
 * Technologies without an SVG mark (six of the thirteen) have nothing to
 * sample, so the field simply keeps showing whatever it already had.
 */
async function applyShowcase(
  system: ParticleSystem,
  tech: TechItem,
  auto: boolean,
): Promise<void> {
  const src = tech.marqueeUrl;
  if (!src) return;
  if (!showcaseFitsIn(system.boundsPublic)) return;
  try {
    await loadSilhouette(src);
  } catch (err) {
    console.warn('[ParticleField] logo load failed', err);
    return;
  }
  // The canvas may have been resized past the breakpoint while the SVG
  // decoded, so re-check before committing to a logo.
  if (!showcaseFitsIn(system.boundsPublic)) return;
  system.showShape(showcaseSpecFor(tech), auto);
}

interface ParticleFieldProps {
  className?: string;
  /** Override env-supplied shapes. Mostly for testing/storybook use. */
  shapes?: ShapeSpec[];
}

const ParticleField = ({ className = '', shapes }: ParticleFieldProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const activeShapes = shapes ?? ENV_SHAPES;

  const { selected } = useTechShowcase();
  const systemRef = useRef<ParticleSystem | null>(null);
  const pendingSelectRef = useRef<TechItem | null>(null);
  /** The logo on screen — drives both the auto cycle and resize re-sampling. */
  const cycleIdxRef = useRef(0);

  useEffect(() => {
    if (!ENABLED) return;
    if (reduced) return;
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    let cancelled = false;

    const fontsReady =
      typeof document !== 'undefined' && (document as Document).fonts
        ? (document as Document).fonts.ready
        : Promise.resolve();

    // Pre-load any silhouette SVGs and frame-animation images referenced by
    // active shapes (or the intro) in parallel with font loading. Failures
    // don't block construction — sampleShape will fall back to scatter for
    // that shape until/unless it loads.
    const imageSrcs = new Set<string>();
    for (const s of activeShapes) {
      if (s.kind === 'silhouette') imageSrcs.add(s.src);
      else if (s.kind === 'frames') for (const src of s.srcs) imageSrcs.add(src);
    }
    const silhouettesReady = Promise.all(
      [...imageSrcs].map((src) =>
        loadSilhouette(src).catch((err) => {
          console.warn('[ParticleField]', err);
        }),
      ),
    );

    // Warm the whole logo cycle so later cross-morphs sample instantly, but
    // only gate the intro on the first one — and only briefly.
    const firstLogo = SHOWCASE_LOGOS[0];
    for (const tech of SHOWCASE_LOGOS.slice(1)) {
      if (tech.marqueeUrl) void loadWithin(tech.marqueeUrl, FIRST_LOGO_BUDGET_MS);
    }
    const firstLogoReady = firstLogo?.marqueeUrl
      ? loadWithin(firstLogo.marqueeUrl, FIRST_LOGO_BUDGET_MS)
      : Promise.resolve(false);

    const ready = Promise.all([fontsReady, silhouettesReady, firstLogoReady]);

    let system: ParticleSystem | null = null;
    let resizeObs: ResizeObserver | null = null;
    let intersectObs: IntersectionObserver | null = null;
    let onMove: ((e: PointerEvent) => void) | null = null;
    let onVisibility: (() => void) | null = null;

    ready.then(([, , firstLogoLoaded]) => {
      if (cancelled) return;

      const count = getParticleCount(container.clientWidth);
      // The intro is built on the first resize, so decide the handoff against
      // the size the canvas is about to take.
      const initialBounds = {
        width: container.clientWidth,
        height: container.clientHeight,
      };
      const wideEnough = showcaseFitsIn(initialBounds);
      const intro: IntroShapes = {
        rocket: ROCKET_SHAPE,
        handoff:
          wideEnough && firstLogoLoaded && firstLogo
            ? showcaseSpecFor(firstLogo)
            : null,
      };

      system = new ParticleSystem({
        canvas,
        particleCount: count,
        // Below the breakpoint nothing forms at all: no logos, and no ambient
        // fallback shapes either — they are just as wide and just as centred.
        shapes: wideEnough ? activeShapes : [],
        driftColor: PALETTE.drift,
        shapeColor: PALETTE.shape,
        accentColors: PALETTE.accents,
        driftAlpha: 0.16,
        shapeAlpha: 0.78,
        intro,
        onShowcaseAdvance: () => {
          const active = systemRef.current;
          if (!active || SHOWCASE_LOGOS.length === 0) return;
          cycleIdxRef.current = (cycleIdxRef.current + 1) % SHOWCASE_LOGOS.length;
          void applyShowcase(active, SHOWCASE_LOGOS[cycleIdxRef.current], true);
        },
      });

      const sizeNow = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        system!.resize(w, h, dpr);
      };
      sizeNow();
      system.start();

      systemRef.current = system;
      if (pendingSelectRef.current) {
        const pending = pendingSelectRef.current;
        pendingSelectRef.current = null;
        void applyShowcase(system, pending, false);
      } else if (wideEnough && !intro.handoff) {
        // The rocket has nothing to morph into; start the loop as soon as the
        // first logo turns up, so a slow CDN only delays it rather than
        // stranding the hero in the fallback shape loop.
        void applyShowcase(system, firstLogo, true);
      }

      // Crossing the breakpoint changes what the field is allowed to show, so
      // the observer does more than resize the canvas.
      let wasWide = wideEnough;
      resizeObs = new ResizeObserver(() => {
        sizeNow();
        const active = systemRef.current;
        if (!active) return;
        const isWide = showcaseFitsIn(active.boundsPublic);
        if (isWide === wasWide) return;
        wasWide = isWide;
        if (isWide) {
          active.setShapes(activeShapes);
          void applyShowcase(active, SHOWCASE_LOGOS[cycleIdxRef.current], true);
        } else {
          active.hideShowcase();
          active.setShapes([]);
        }
      });
      resizeObs.observe(container);

      onMove = (e: PointerEvent) => {
        if (!system) return;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const inside =
          x >= 0 && x <= rect.width && y >= 0 && y <= rect.height && e.pointerType !== 'touch';
        system.setCursor(x, y, inside);
      };
      window.addEventListener('pointermove', onMove, { passive: true });

      intersectObs = new IntersectionObserver(
        ([entry]) => {
          if (!system) return;
          if (entry.isIntersecting) system.resume();
          else system.pause();
        },
        { threshold: 0.01 },
      );
      intersectObs.observe(container);

      onVisibility = () => {
        if (!system) return;
        if (document.hidden) system.pause();
        else system.resume();
      };
      document.addEventListener('visibilitychange', onVisibility);
    });

    return () => {
      cancelled = true;
      systemRef.current = null;
      if (resizeObs) resizeObs.disconnect();
      if (intersectObs) intersectObs.disconnect();
      if (onMove) window.removeEventListener('pointermove', onMove);
      if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
      if (system) system.dispose();
    };
  }, [reduced, activeShapes]);

  useEffect(() => {
    const system = systemRef.current;
    if (!selected) {
      // Dismissing the brief resumes the cycle from whichever logo is showing
      // rather than dissolving the field back to drift.
      system?.setShowcaseAuto(true);
      pendingSelectRef.current = null;
      return;
    }
    // Keep the cycle in step with the click, so resuming carries on from here
    // instead of jumping back to wherever the loop had got to.
    const idx = SHOWCASE_LOGOS.findIndex((t) => t.id === selected.id);
    if (idx !== -1) cycleIdxRef.current = idx;

    if (system) {
      void applyShowcase(system, selected, false);
    } else {
      pendingSelectRef.current = selected; // applied once the system is built
    }
  }, [selected]);

  if (!ENABLED) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className}`}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default ParticleField;
