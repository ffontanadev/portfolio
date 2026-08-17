import { useEffect, useRef, lazy, Suspense } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useTechShowcase } from '@/context/TechShowcaseContext';
import { PARTICLES_ENABLED } from '@/config/particles';
import { useIsMobile } from '@/hooks/useIsMobile';

// three.js is ~600KB of the bundle and the field is decorative, so it loads as
// its own chunk after the hero's markup is on screen rather than blocking it.
// `PARTICLES_ENABLED` gates the import itself: when the flag is off the chunk
// is never requested, where the old static import shipped three.js regardless.
const ParticleField = lazy(() => import('./Hero/ParticleField'));

const ease = [0.22, 1, 0.36, 1] as const;

// Seconds the rocket spends flying in (rocketFly in IntroSequencer's
// DEFAULT_TIMINGS). Surrounding HTML text is delayed by this so it doesn't
// compete with the particle animation; it lands as the rocket does, while the
// rocket cross-morphs into the first tech logo.
const INTRO_TOTAL_S = 4.0;

const Hero = () => {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const { selected, clear } = useTechShowcase();
  const isMobile = useIsMobile();

  // Below `sm` the field is skipped outright: it is a decorative WebGL layer
  // that costs a ~132KB three.js chunk on a phone's connection plus GPU work a
  // low-end device pays for while the page is still painting. Gating the mount
  // (rather than the animation) also keeps the lazy chunk from being requested.
  const particlesActive = PARTICLES_ENABLED && !isMobile;

  // The tech showcase is a progressive enhancement: inert when particles are
  // disabled or reduced-motion is on. When inert, ignore any selection.
  const inert = !particlesActive || shouldReduceMotion;
  const showingBrief = selected !== null && !inert;

  useEffect(() => {
    if (inert && selected) {
      clear();
      return;
    }
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clear();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selected, inert, clear]);

  // Scroll parallax for background drift
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  // Cursor-tracked parallax (gentle)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const portraitX = useSpring(useTransform(mouseX, [-1, 1], [-10, 10]), { stiffness: 60, damping: 18 });
  const portraitY = useSpring(useTransform(mouseY, [-1, 1], [-8, 8]), { stiffness: 60, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  // The text only waits when the rocket actually flies. Reduced-motion users
  // and phones get no particle intro, so stalling them for four seconds hides
  // the headline behind an animation that never runs — and, because the client
  // re-renders over the prerendered markup instead of hydrating it, that stall
  // blanks a hero the browser had already painted (spec §10: LCP ≤ 2.0s).
  const introOffset = inert ? 0 : INTRO_TOTAL_S;

  // …and when no intro runs, the entry animation itself has to go, not just its
  // delay. main.tsx mounts with createRoot, so the client re-renders over the
  // prerendered markup instead of hydrating it (see scripts/prerender.js): an
  // `initial` of opacity 0 therefore re-hides a hero the browser had already
  // painted, and the fade back in is what the phone records as LCP. `false`
  // tells framer-motion to start at the animate state, so the text the snapshot
  // put on screen simply stays there. Desktop still gets the full entrance.
  const entryInitial = <T,>(from: T) => (inert ? (false as const) : from);

  return (
    <section
      ref={sectionRef}
      id="hero"
      onMouseMove={handleMouseMove}
      className="relative select-none min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-cream-50 to-cream-100"
    >
      {/* Particle field — fills the entire hero. The rocket flies in, morphs
          into the first tech logo, and the field then cycles the stack's logos
          on the right-hand side. Cursor pushes particles aside. */}
      {particlesActive && (
        <Suspense fallback={null}>
          <ParticleField className="z-0" />
        </Suspense>
      )}

      {/* Container */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 w-full max-w-8xl mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-28"
      >
        {/* Eyebrow */}
        <motion.div
          initial={entryInitial({ opacity: 0, y: 12 })}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: introOffset, duration: 0.8, ease }}
          className={`relative flex items-center gap-4 mb-12 transition-[top] duration-500 ${
            showingBrief ? 'max-md:-top-[15vh]' : 'top-0'
          }`}
        >
          <span className="text-eyebrow text-dark-900/60">{t('hero.eyebrow')}</span>
          <span className="flex-1 max-w-[120px] hairline text-dark-900" />
        </motion.div>

        {/* Split-screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-14 lg:gap-24 items-center">

          {/* Left Column - Content */}
          <div className="flex flex-col space-y-8">
            <motion.h1
              initial={entryInitial({ opacity: 0, y: 20 })}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: introOffset, duration: 0.9, ease }}
              className="font-display font-display-xl font-bold leading-[1.05] tracking-[-0.02em] text-[2.25rem] md:text-[3.5rem] lg:text-[4.5rem] text-dark-900"
            >
              {t('hero.headline.lead')}{' '}
              <span className="font-display-italic text-coral-500" style={{ fontStyle: 'italic' }}>
                {t('hero.headline.emphasis')}
              </span>
            </motion.h1>

            <motion.p
              initial={entryInitial({ opacity: 0, y: 16 })}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: introOffset + 0.15, duration: 0.8, ease }}
              className="font-mono text-[11px] md:text-xs leading-relaxed tracking-wide text-dark-900/60"
            >
              {t('hero.availability')}
            </motion.p>

            <motion.nav
              initial={entryInitial({ opacity: 0, y: 16 })}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: introOffset + 0.25, duration: 0.8, ease }}
              aria-label={t('hero.ctas.work')}
              className="flex flex-wrap items-center gap-4"
            >
              <a
                href="#work"
                className="group relative overflow-hidden rounded-full bg-dark-900 px-7 py-3.5 text-sm font-medium text-cream-50"
              >
                <span className="relative z-10">{t('hero.ctas.work')}</span>
                <span className="absolute inset-0 translate-y-full bg-coral-500 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
              </a>
              <a
                href="mailto:contacto@ffontana.dev"
                className="rounded-full border border-dark-900/15 px-7 py-3.5 text-sm font-medium text-dark-900 transition-colors duration-300 hover:border-coral-500 hover:text-coral-500"
              >
                {t('hero.ctas.contact')}
              </a>
              <a
                href="https://github.com/ffontanadev"
                target="_blank"
                rel="noopener noreferrer"
                className="reveal-underline text-sm font-medium text-dark-900/70 transition-colors duration-300 hover:text-coral-500"
              >
                {t('hero.ctas.github')}
              </a>
            </motion.nav>
          </div>

          {/* Right Column - Portrait with cursor parallax */}
          <motion.div
            style={{ x: portraitX, y: portraitY }}
            className="flex justify-center lg:justify-end will-change-transform"
          >
            <div className="lg:h-[500px]" />
          </motion.div>
        </div>

        {/* Subheading — at the bottom of the entire hero */}
        <motion.div
          initial={entryInitial({ opacity: 0, y: 20 })}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: introOffset + 0.1, duration: 0.9, ease }}
          className="max-w-xl text-lg md:text-xl text-dark-900/70 leading-relaxed font-light mt-16"
        >
          <AnimatePresence mode="wait" initial={false}>
            {showingBrief && selected ? (
              <motion.p
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease }}
              >
                <span className="font-medium text-dark-900">{selected.name}</span>
                <span className="text-dark-900/40">{' — '}</span>
                {t('techShowcase.brief.' + selected.id)}{' '}
                <button
                  type="button"
                  onClick={clear}
                  className="group/back inline-flex items-center gap-1 align-baseline font-medium text-coral-500 hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <span aria-hidden="true" className="transition-transform group-hover/back:-translate-x-0.5">←</span>
                  {t('techShowcase.back')}
                </button>
              </motion.p>
            ) : (
              <motion.p
                key="subheading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease }}
              >
                {t('hero.subhead')}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Drifting background blobs — dimmed so they read as deep atmosphere
          underneath the particle field, not competing with it. */}
      <motion.div
        style={{ y: bgY1 }}
        aria-hidden="true"
        className="absolute right-[-6%] top-[18%] w-[28rem] h-[28rem] rounded-full -z-10 pointer-events-none"
      >
        <div className="w-full h-full bg-purple-500/5 rounded-full blur-3xl animate-[drift_18s_ease-in-out_infinite]" />
      </motion.div>
      <motion.div
        style={{ y: bgY2 }}
        aria-hidden="true"
        className="absolute left-[-8%] bottom-[-6%] w-[30rem] h-[30rem] rounded-full -z-10 pointer-events-none"
      >
        <div className="w-full h-full bg-teal-500/6 rounded-full blur-3xl animate-[drift_24s_ease-in-out_infinite_reverse]" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="absolute top-[60%] left-[40%] w-[18rem] h-[18rem] rounded-full -z-10 pointer-events-none"
      >
        <div className="w-full h-full bg-coral-500/4 rounded-full blur-3xl animate-[drift_22s_ease-in-out_infinite]" />
      </motion.div>
    </section>
  );
};

export default Hero;
