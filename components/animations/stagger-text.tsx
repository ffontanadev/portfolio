'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { stagger as staggerConfig, durations, easings, scrollThresholds } from '@/lib/animations'

interface StaggerTextProps {
  /** Text to animate */
  text: string
  /** Base delay before animation starts (default: 0) */
  delay?: number
  /** Stagger type from config (default: 'words') */
  staggerType?: 'words' | 'characters'
  /** Custom className for container */
  className?: string
  /** Custom className for each animated element */
  elementClassName?: string
  /** HTML tag to use for container (default: 'div') */
  as?: keyof JSX.IntrinsicElements
  /** Should trigger only once (default: true) */
  once?: boolean
  /** How much of element should be visible before animating */
  threshold?: keyof typeof scrollThresholds
}

/**
 * StaggerText Component
 * Animates text word-by-word or character-by-character with stagger effect
 * Respects reduced-motion preferences
 *
 * @example
 * <StaggerText
 *   text="Hello World from Every Day"
 *   staggerType="words"
 *   delay={0.1}
 * />
 */
export function StaggerText({
  text,
  delay = 0,
  staggerType = 'words',
  className = '',
  elementClassName = '',
  as: Component = 'div',
  once = true,
  threshold = 'normal',
}: StaggerTextProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once,
    amount: scrollThresholds[threshold],
  })
  const prefersReducedMotion = useReducedMotion()

  // Split text based on stagger type
  const elements = staggerType === 'words' ? text.split(' ') : text.split('')
  const staggerDelay = staggerType === 'words' ? staggerConfig.words : staggerConfig.characters

  // Container animation variants
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
        delayChildren: prefersReducedMotion ? 0 : delay,
      },
    },
  }

  // Individual element variants
  const elementVariants = prefersReducedMotion
    ? {
        initial: {},
        animate: {},
      }
    : {
        initial: {
          opacity: 0,
          y: 20,
        },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: durations.medium,
            ease: easings.smooth,
          },
        },
      }

  return (
    <Component ref={ref} className={className}>
      <motion.span
        className="inline-flex flex-wrap"
        initial="initial"
        animate={isInView ? 'animate' : 'initial'}
        variants={containerVariants}
        aria-label={text}
      >
        {elements.map((element, index) => (
          <motion.span
            key={`${element}-${index}`}
            className={`inline-block ${elementClassName}`}
            variants={elementVariants}
            style={staggerType === 'words' ? { marginRight: '0.25em' } : {}}
          >
            {element}
            {staggerType === 'characters' && element === ' ' && '\u00A0'}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  )
}

/**
 * StaggerLines Component
 * Animates multi-line text with line-by-line stagger effect
 *
 * @example
 * <StaggerLines
 *   lines={[
 *     "First line of text",
 *     "Second line of text",
 *     "Third line of text"
 *   ]}
 * />
 */
interface StaggerLinesProps {
  /** Array of text lines to animate */
  lines: string[]
  /** Base delay before animation starts (default: 0) */
  delay?: number
  /** Delay between each line in seconds (default: 0.1) */
  lineDelay?: number
  /** Custom className for container */
  className?: string
  /** Custom className for each line */
  lineClassName?: string
  /** Should trigger only once (default: true) */
  once?: boolean
}

export function StaggerLines({
  lines,
  delay = 0,
  lineDelay = 0.1,
  className = '',
  lineClassName = '',
  once = true,
}: StaggerLinesProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: 0.2 })
  const prefersReducedMotion = useReducedMotion()

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : lineDelay,
        delayChildren: prefersReducedMotion ? 0 : delay,
      },
    },
  }

  const lineVariants = prefersReducedMotion
    ? {
        initial: {},
        animate: {},
      }
    : {
        initial: {
          opacity: 0,
          y: 30,
        },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: durations.slow,
            ease: easings.smooth,
          },
        },
      }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
      variants={containerVariants}
    >
      {lines.map((line, index) => (
        <motion.div key={index} className={lineClassName} variants={lineVariants}>
          {line}
        </motion.div>
      ))}
    </motion.div>
  )
}

/**
 * StaggerLetters Component (Advanced)
 * More granular character animation with custom effects
 *
 * @example
 * <StaggerLetters text="HELLO" effect="wave" />
 */
interface StaggerLettersProps {
  text: string
  /** Animation effect type */
  effect?: 'wave' | 'pop' | 'rotate'
  delay?: number
  className?: string
  letterClassName?: string
}

export function StaggerLetters({
  text,
  effect = 'wave',
  delay = 0,
  className = '',
  letterClassName = '',
}: StaggerLettersProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const prefersReducedMotion = useReducedMotion()

  const letters = text.split('')

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.03,
        delayChildren: prefersReducedMotion ? 0 : delay,
      },
    },
  }

  const getLetterVariants = () => {
    if (prefersReducedMotion) {
      return {
        initial: {},
        animate: {},
      }
    }

    switch (effect) {
      case 'wave':
        return {
          initial: { opacity: 0, y: 20 },
          animate: {
            opacity: 1,
            y: [20, -5, 0],
            transition: {
              duration: 0.5,
              ease: easings.bounce,
            },
          },
        }
      case 'pop':
        return {
          initial: { opacity: 0, scale: 0 },
          animate: {
            opacity: 1,
            scale: [0, 1.2, 1],
            transition: {
              duration: 0.4,
              ease: easings.elastic,
            },
          },
        }
      case 'rotate':
        return {
          initial: { opacity: 0, rotateY: 90 },
          animate: {
            opacity: 1,
            rotateY: 0,
            transition: {
              duration: 0.5,
              ease: easings.smooth,
            },
          },
        }
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
        }
    }
  }

  const letterVariants = getLetterVariants()

  return (
    <motion.span
      ref={ref}
      className={`inline-flex ${className}`}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
      variants={containerVariants}
      aria-label={text}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          className={`inline-block ${letterClassName}`}
          variants={letterVariants}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.span>
  )
}
