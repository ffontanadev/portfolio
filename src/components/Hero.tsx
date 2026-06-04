import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import ParticleField from './Hero/ParticleField';
import BriefPanel from './Hero/BriefPanel';
import { useTranslation } from '@/i18n';

const ease = [0.22, 1, 0.36, 1] as const;

// Seconds before the particle intro hands off to the recurring loop:
// rocketFly (4.0) + crossMorph (1.0) + textHold (1.5). Surrounding HTML text
// is delayed by this so it doesn't compete with the particle animation.
// Kept in sync with DEFAULT_TIMINGS in particles/IntroSequencer.ts.
const INTRO_TOTAL_S = 4.8;

const Hero = () => {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();

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

  // Reduced-motion users see no particle intro, so the surrounding text appears
  // immediately rather than stalling for an animation that never runs.
  const introOffset = shouldReduceMotion ? 0 : INTRO_TOTAL_S;

  return (
    <section
      ref={sectionRef}
      id="hero"
      onMouseMove={handleMouseMove}
      className="relative select-none min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-cream-50 to-cream-100"
    >
      {/* Particle field — fills the entire hero, drifts ambient, morphs
          through Felipe / FF. / heart on a loop. Cursor pushes particles aside. */}
      <ParticleField className="z-0" />
      <BriefPanel />

      {/* Container */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 w-full max-w-8xl mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-28"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: introOffset, duration: 0.8, ease }}
          className="flex items-center gap-4 mb-12"
        >
          <span className="text-eyebrow text-dark-900/60">{t('hero.eyebrow')}</span>
          <span className="flex-1 max-w-[120px] hairline text-dark-900" />
        </motion.div>

        {/* Split-screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-14 lg:gap-24 items-center">

          {/* Left Column - Content */}
          <div className="flex flex-col space-y-10">
            {/* Status Badge <StatusBadge /> */}
            <div>
              
            </div>

            {/* Hero Heading — word-by-word reveal
            <h1 className="font-display font-display-xl font-bold leading-[1.02] text-5xl md:text-6xl lg:text-7xl tracking-[-0.02em]">
              <span className="block overflow-hidden pb-1">
                {headlineWords.map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ delay: 0.25 + i * 0.08, duration: 0.85, ease }}
                    className="inline-block mr-4"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
              <span className="block overflow-hidden pb-2">
                <motion.span
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.95, ease }}
                  className="inline-block font-display-italic text-coral-500"
                  style={{ fontStyle: 'italic' }}
                >
                  Felipe.
                </motion.span>
              </span>
            </h1>
            */}
            {/* Activity Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.9, ease }}
            >
            </motion.div>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: introOffset + 0.1, duration: 0.9, ease }}
          className="max-w-xl text-lg md:text-xl text-dark-900/70 leading-relaxed font-light mt-16"
        >
          {t('hero.subheading.lead')}{' '}
          <span className="font-medium text-dark-900 reveal-underline cursor-default">{t('hero.subheading.role')}</span>{' '}
          {t('hero.subheading.middle')}{' '}
          <span className="font-medium text-dark-900">{t('hero.subheading.company')}</span>{' '}
          <span className="text-coral-500">.</span>
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
