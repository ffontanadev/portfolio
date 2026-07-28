import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { PARTICLES_ENABLED } from '@/config/particles';
import { TOUR_STOPS, type TourStop } from './tourStops';
import { TourController, type TourDeps } from './TourController';
import { createComet, drawComet } from './cometRenderer';
import type { Vec2, Rect } from './tourMotion';
import { shouldRunTour, type TourEnv } from './shouldRunTour';
import {
  TOUR_REPLAY_EVENT, hasSeenTour, markTourSeen,
} from './useFirstVisit';

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
      // Commit the overlay synchronously so the <canvas> is mounted before we
      // read its ref below — a plain setState would leave canvasRef.current null
      // on the next line and silently abort the tour.
      flushSync(() => setActive(true));

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
        onDone: () => {
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
