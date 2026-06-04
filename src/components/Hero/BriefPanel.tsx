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
  }, [selected, inert, clear]);

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
