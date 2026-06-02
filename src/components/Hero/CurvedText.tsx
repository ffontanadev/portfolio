import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from '@/i18n';

interface CurvedTextProps {
  text?: string;
  radius?: number;
}

const CurvedText = ({
  text,
  radius = 150,
}: CurvedTextProps) => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const resolvedText = text ?? t('hero.curvedText');
  const viewBoxSize = radius * 2 + 50;
  const center = viewBoxSize / 2;

  return (
    <>
      <span className="sr-only">{resolvedText}</span>
      <motion.svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        animate={shouldReduceMotion ? {} : { rotate: 360 }}
        transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
      >
        <defs>
          <path
            id="circlePath"
            d={`M ${center},${center} m -${radius},0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
            fill="none"
          />
        </defs>
        <text
          fontSize="11"
          letterSpacing="6"
          fontWeight="500"
          fill="currentColor"
          className="text-dark-900/55"
          style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}
        >
          <textPath href="#circlePath" startOffset="0%">
            {(resolvedText + resolvedText).toUpperCase()}
          </textPath>
        </text>
      </motion.svg>
    </>
  );
};

export default CurvedText;
