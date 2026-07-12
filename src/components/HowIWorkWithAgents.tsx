import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';

const ease = [0.22, 1, 0.36, 1] as const;

const HowIWorkWithAgents = () => {
  const { t, messages } = useTranslation();
  const pillars = messages.agents.pillars;

  return (
    <section
      data-tour-id="agents"
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
