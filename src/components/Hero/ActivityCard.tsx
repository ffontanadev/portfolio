import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from '@/i18n';

interface Activity {
  text: string;
  detail?: string;
}

interface ActivityCardProps {
  title?: string;
  activities?: Activity[];
  cycleMs?: number;
}

const Spool = ({ spinning }: { spinning: boolean }) => (
  <motion.span
    aria-hidden="true"
    animate={spinning ? { rotate: 360 } : { rotate: 0 }}
    transition={spinning ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.6 }}
    className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full border border-dark-900/35"
  >
    <span className="block h-[3px] w-[3px] rounded-full bg-dark-900/55" />
  </motion.span>
);

const ActivityCard = ({
  title,
  activities,
  cycleMs = 4200,
}: ActivityCardProps) => {
  const shouldReduceMotion = useReducedMotion();
  const { t, messages } = useTranslation();
  const resolvedTitle = title ?? t('hero.activityCard.title');
  const resolvedActivities: Activity[] = activities ?? messages.hero.activityCard.activities;
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || shouldReduceMotion) return;
    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % resolvedActivities.length);
    }, cycleMs);
    return () => window.clearInterval(id);
  }, [paused, shouldReduceMotion, resolvedActivities.length, cycleMs]);

  const playing = !paused && !shouldReduceMotion;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative lg:min-w-sm max-w-md glass-card rounded-2xl p-6 pt-5 pb-4 overflow-hidden"
    >
      {/* Header — A side · cassette spools · status */}
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Spool spinning={playing} />
          <span className="text-eyebrow text-dark-900/55">{resolvedTitle}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[9px] tracking-widest text-dark-900/40 uppercase">
            {t('hero.activityCard.side')}
          </span>
          <Spool spinning={playing} />
        </div>
      </header>

      {/* Tracklist */}
      <ul className="space-y-2.5">
        {resolvedActivities.map((activity, i) => {
          const isActive = i === activeIdx;
          return (
            <li
              key={i}
              className="relative grid grid-cols-[auto_1fr_auto] items-baseline gap-3 px-2 py-2 rounded-md cursor-default group"
            >
              {/* Active row background */}
              <motion.span
                aria-hidden="true"
                initial={false}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-md bg-coral-500/8 -z-0"
              />

              {/* Track number */}
              <span
                className={`relative font-mono text-[10px] tracking-widest transition-colors duration-500 ${
                  isActive ? 'text-coral-500' : 'text-dark-900/35'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Title + detail */}
              <span className="relative flex flex-col">
                <span
                  className={`leading-snug transition-all duration-500 ${
                    isActive
                      ? 'text-dark-900 font-medium'
                      : 'text-dark-900/55 font-light'
                  }`}
                >
                  {activity.text}
                </span>
                {activity.detail && (
                  <motion.span
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      height: isActive ? 'auto' : 0,
                    }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden font-display italic text-sm text-dark-900/55"
                  >
                    {activity.detail}
                  </motion.span>
                )}
              </span>

              {/* NOW tag */}
              <motion.span
                aria-hidden={!isActive}
                initial={false}
                animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 6 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative font-mono text-[9px] tracking-[0.22em] text-coral-500 uppercase"
              >
                {t('hero.activityCard.now')}
              </motion.span>
            </li>
          );
        })}
      </ul>

      {/* Footer — progress + counter */}
      <footer className="mt-5 pt-4 border-t border-dark-900/8">
        <div className="flex items-center gap-3">
          {/* Progress bar — keyed to activeIdx so it resets each cycle */}
          <div className="relative h-[2px] flex-1 bg-dark-900/10 overflow-hidden rounded-full">
            <motion.span
              key={`${activeIdx}-${paused}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: playing ? 1 : 0 }}
              transition={{ duration: playing ? cycleMs / 1000 : 0, ease: 'linear' }}
              style={{ transformOrigin: 'left' }}
              className="absolute inset-y-0 left-0 w-full bg-coral-500"
            />
          </div>
          <span className="font-mono text-[9px] tracking-widest text-dark-900/40 uppercase tabular-nums">
            {String(activeIdx + 1).padStart(2, '0')} / {String(resolvedActivities.length).padStart(2, '0')}
          </span>
          <span
            className={`font-mono text-[9px] tracking-widest uppercase ${
              playing ? 'text-coral-500' : 'text-dark-900/40'
            }`}
          >
            {playing ? t('hero.activityCard.play') : t('hero.activityCard.hold')}
          </span>
        </div>
      </footer>
    </motion.div>
  );
};

export default ActivityCard;
