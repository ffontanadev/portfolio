import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';

interface StatusBadgeProps {
  text?: string;
  available?: boolean;
}

const StatusBadge = ({ text, available = true }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const label = text ?? t('hero.statusBadge.available');
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-card"
      role="status"
      aria-live="polite"
    >
      {available && (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-70 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
        </span>
      )}
      <span className="text-eyebrow text-dark-900/70">{label}</span>
    </motion.div>
  );
};

export default StatusBadge;
