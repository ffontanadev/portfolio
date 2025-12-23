import { motion } from 'framer-motion';
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
  interests = []
}: CircularImageContainerProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Circular container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] lg:w-[400px] lg:h-[400px]"
      >
        {/* Curved text */}
        <CurvedText text={curvedText} />

        {/* Profile placeholder circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200 via-blue-200 to-teal-200 shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-coral-500 to-coral-500/50 flex items-center justify-center">
            <span className="text-6xl md:text-7xl lg:text-8xl opacity-30">
              <UserIcon size={128} />
            </span>
          </div>
        </div>

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
