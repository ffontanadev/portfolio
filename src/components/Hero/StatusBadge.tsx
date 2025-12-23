import { motion } from 'framer-motion';

interface StatusBadgeProps {
  text?: string;
  available?: boolean;
}

const StatusBadge = ({ text = 'Available to work', available = true }: StatusBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white/50"
      role="status"
      aria-live="polite"
    >
      {available && (
        <>
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" aria-hidden="true" />
        </>
      )}
      <span className="text-sm font-medium text-gray-600">{text}</span>
    </motion.div>
  );
};

export default StatusBadge;
