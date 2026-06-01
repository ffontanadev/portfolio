import { motion, useReducedMotion } from 'framer-motion';
import CurvedText from './CurvedText';
import InterestBadge from './InterestBadge';
import { UserIcon } from '../ui/user';

interface Interest {
  label: string;
  color: 'green' | 'blue' | 'yellow';
  position: 'top-left' | 'right' | 'bottom';
}

interface CircularImageContainerProps {
  curvedText?: string;
  interests?: Interest[];
}

const CircularImageContainer = ({
  curvedText,
  interests = [],
}: CircularImageContainerProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer rotating mono text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-[300px] h-[300px] md:w-[340px] md:h-[340px] lg:w-[420px] lg:h-[420px]"
      >
        <CurvedText text={curvedText} />

        {/* Soft halo */}
        <motion.div
          aria-hidden="true"
          animate={shouldReduceMotion ? {} : { scale: [1, 1.04, 1], opacity: [0.6, 0.85, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-6 rounded-full bg-gradient-to-br from-purple-500/15 via-coral-500/10 to-teal-500/15 blur-2xl"
        />

        {/* Breathing portrait disk */}
        <motion.div
          animate={shouldReduceMotion ? {} : { scale: [1, 1.015, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-10 rounded-full overflow-hidden shadow-[0_30px_80px_-30px_rgba(26,26,26,0.4)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-coral-500 via-coral-500/85 to-purple-500/70" />
          <div
            aria-hidden="true"
            className="absolute inset-0 mix-blend-soft-light opacity-60"
            style={{
              background:
                'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.5), transparent 55%)',
            }}
          />
          <div className="relative w-full h-full flex items-center justify-center text-cream-50/40">
            <UserIcon size={140} />
          </div>
        </motion.div>

        {/* Floating decorative dot */}
        <motion.span
          aria-hidden="true"
          animate={shouldReduceMotion ? {} : { y: [-6, 6, -6], x: [0, 4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-2 left-12 h-3 w-3 rounded-full bg-teal-500 shadow-md"
        />
        <motion.span
          aria-hidden="true"
          animate={shouldReduceMotion ? {} : { y: [4, -4, 4], x: [0, -3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-4 -right-1 h-2 w-2 rounded-full bg-purple-500/80"
        />

        {/* Interest badges */}
        {interests.map((interest, index) => (
          <InterestBadge
            key={index}
            label={interest.label}
            color={interest.color}
            position={interest.position}
            delay={1 + index * 0.1}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default CircularImageContainer;
