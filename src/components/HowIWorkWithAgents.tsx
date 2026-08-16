import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { GraphMotif, ContractMotif, HarnessMotif } from './agentMotifs';

const ease = [0.22, 1, 0.36, 1] as const;

// Motif per pillar, matched by order (01 → graph, 02 → contract, 03 → harness).
// Structural, non-translatable — same split as FeaturedWorks' projectData.
const MOTIFS = [GraphMotif, ContractMotif, HarnessMotif] as const;

const HowIWorkWithAgents = () => {
  const { t, messages } = useTranslation();
  const { pillars, toolkit } = messages.agents;

  return (
    <section
      id="about"
      className="relative py-32 md:py-40 px-6 md:px-20 max-w-[1440px] mx-auto"
    >
      {/* Header */}
      <div className="mb-16 md:mb-20">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-eyebrow text-coral-500">{t('agents.eyebrow')}</span>
          <span className="h-px flex-1 max-w-[140px] bg-dark-900/15" />
        </div>
        <h2 className="font-display font-display-md font-bold tracking-[-0.02em] text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] leading-[1.05] max-w-3xl text-dark-900">
          {t('agents.headingBefore')}{' '}
          <span className="font-display-italic text-coral-500" style={{ fontStyle: 'italic' }}>
            {t('agents.headingEmphasis')}
          </span>
          {t('agents.headingAfter') ? ` ${t('agents.headingAfter')}` : ''}
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dark-900/55 font-light leading-relaxed">
          {t('agents.intro')}
        </p>
      </div>

      {/* Pillars — instrument-panel cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7">
        {pillars.map((pillar, index) => {
          const Motif = MOTIFS[index] ?? GraphMotif;
          return (
            <motion.article
              key={pillar.index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.1, duration: 0.8, ease }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-dark-900/[0.08] bg-cream-100 soft-lift"
            >
              {/* Motif panel */}
              <div className="relative border-b border-dark-900/[0.06] bg-cream-50/70">
                <span className="absolute left-4 top-3 z-10 font-mono text-[11px] tracking-widest text-coral-500">
                  {pillar.index}
                </span>
                <div className="flex h-40 items-center justify-center px-3 pt-2" aria-hidden="true">
                  <Motif />
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-3 p-6 md:p-7">
                <p className="font-mono text-[11px] leading-snug tracking-[0.01em] text-coral-500">
                  <span className="text-dark-900/30">{'// '}</span>
                  {pillar.principle}
                </p>
                <h3 className="font-display font-bold text-xl md:text-2xl tracking-[-0.01em] leading-tight text-dark-900">
                  {pillar.title}
                </h3>
                <p className="text-[15px] font-light leading-relaxed text-dark-900/60">
                  {pillar.body}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Toolkit strip */}
      <div className="mt-14 md:mt-16">
        <div className="mb-6 flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-dark-900/50">
            {toolkit.label}
          </span>
          <span className="h-px flex-1 bg-dark-900/10" />
        </div>
        <div className="flex flex-wrap gap-3">
          {toolkit.items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.06, duration: 0.5, ease }}
              className="group flex items-baseline gap-2.5 rounded-full border border-dark-900/15 bg-cream-50/50 py-2 pl-3 pr-4 transition-colors duration-300 hover:border-coral-500/40"
            >
              <span className="h-1.5 w-1.5 shrink-0 self-center rounded-full bg-teal-500 transition-colors duration-300 group-hover:bg-coral-500" />
              <span className="font-mono text-[11px] tracking-wide text-dark-900/80">{item.name}</span>
              <span className="font-mono text-[10px] tracking-tight text-dark-900/40">{item.note}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowIWorkWithAgents;
