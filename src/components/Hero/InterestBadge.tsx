import { motion } from 'framer-motion';

type BadgeColor = 'green' | 'blue' | 'yellow';

interface InterestBadgeProps {
  label: string;
  color: BadgeColor;
  position: 'top-left' | 'right' | 'bottom';
  delay?: number;
}

const colorClasses: Record<BadgeColor, string> = {
  green: 'bg-teal-500 text-white',
  blue: 'bg-blue-500 text-white',
  yellow: 'bg-yellow-500 text-gray-900',
};

const positionClasses: Record<InterestBadgeProps['position'], string> = {
  'top-left': 'absolute -top-4 -left-4',
  'right': 'absolute top-1/2 -right-4 -translate-y-1/2',
  'bottom': 'absolute -bottom-4 left-1/2 -translate-x-1/2',
};

const InterestBadge = ({ label, color, position, delay = 1 }: InterestBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className={`${positionClasses[position]} ${colorClasses[color]} px-5 py-2.5 rounded-full shadow-lg text-sm font-medium z-10`}
    >
      {label}
    </motion.div>
  );
};

export default InterestBadge;
