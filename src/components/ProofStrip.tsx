import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Spec §5.3 — a single band of four figures between the hero and the stack
 * strip. No decoration: a skimmer who reads nothing else should still leave
 * with a number. Every figure repeats in context on a project card below.
 */
const ProofStrip = () => {
  const { t, messages } = useTranslation();

  return (
    <section
      aria-label={t('proof.eyebrow')}
      className="px-6 md:px-20 py-14 md:py-16 border-y border-dark-900/8 bg-cream-50"
    >
      <div className="max-w-[1440px] mx-auto">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-10 md:flex md:items-baseline md:justify-between md:gap-6">
          {messages.proof.figures.map((figure, i) => (
            <motion.div
              key={figure.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              className="flex flex-col gap-2"
            >
              <dt className="sr-only">{figure.label}</dt>
              <dd className="flex flex-col gap-2">
                <span className="font-mono text-2xl md:text-3xl tracking-tight text-dark-900 tabular-nums">
                  {figure.value}
                </span>
                <span className="font-mono text-[11px] md:text-xs tracking-[0.18em] uppercase text-dark-900/50">
                  {figure.label}
                </span>
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default ProofStrip;
