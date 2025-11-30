'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getTransition, scrollThresholds } from '@/lib/animations'

interface ScrollRevealProps {
  children: ReactNode
  /** Animation delay in seconds (default: 0) */
  delay?: number
  /** How much of the element should be visible before animating (default: 0.2) */
  threshold?: keyof typeof scrollThresholds
  /** Animation direction (default: 'up') */
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  /** Should trigger only once (default: true) */
  once?: boolean
  /** Custom className */
  className?: string
  /** Distance to travel during animation in pixels (default: 50) */
  distance?: number
}

/**
 * ScrollReveal Component
 * Animates elements as they scroll into view
 * Respects reduced-motion preferences
 *
 * @example
 * <ScrollReveal direction="up" delay={0.2}>
 *   <div>Content that reveals on scroll</div>
 * </ScrollReveal>
 */
export function ScrollReveal({
  children,
  delay = 0,
  threshold = 'normal',
  direction = 'up',
  once = true,
  className = '',
  distance = 50,
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once,
    amount: scrollThresholds[threshold],
  })
  const prefersReducedMotion = useReducedMotion()

  // Get animation variants based on direction
  const getVariants = () => {
    // If reduced motion, return no animation
    if (prefersReducedMotion) {
      return {
        initial: {},
        animate: {},
      }
    }

    const baseVariant = {
      opacity: 0,
    }

    const animateVariant = {
      opacity: 1,
    }

    switch (direction) {
      case 'up':
        return {
          initial: { ...baseVariant, y: distance },
          animate: { ...animateVariant, y: 0 },
        }
      case 'down':
        return {
          initial: { ...baseVariant, y: -distance },
          animate: { ...animateVariant, y: 0 },
        }
      case 'left':
        return {
          initial: { ...baseVariant, x: distance },
          animate: { ...animateVariant, x: 0 },
        }
      case 'right':
        return {
          initial: { ...baseVariant, x: -distance },
          animate: { ...animateVariant, x: 0 },
        }
      case 'fade':
      default:
        return {
          initial: baseVariant,
          animate: animateVariant,
        }
    }
  }

  const variants = getVariants()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
      variants={variants}
      transition={getTransition('slow', 'smooth', delay)}
    >
      {children}
    </motion.div>
  )
}

/**
 * ScrollRevealList Component
 * Animates a list of items with stagger effect
 *
 * @example
 * <ScrollRevealList stagger={0.1}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </ScrollRevealList>
 */
interface ScrollRevealListProps {
  children: ReactNode
  /** Stagger delay between items in seconds (default: 0.1) */
  stagger?: number
  /** Base delay before animation starts (default: 0) */
  delay?: number
  /** How much of the element should be visible (default: 0.2) */
  threshold?: keyof typeof scrollThresholds
  /** Animation direction (default: 'up') */
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  /** Custom className for container */
  className?: string
}

export function ScrollRevealList({
  children,
  stagger = 0.1,
  delay = 0,
  threshold = 'normal',
  direction = 'up',
  className = '',
}: ScrollRevealListProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    amount: scrollThresholds[threshold],
  })
  const prefersReducedMotion = useReducedMotion()

  const distance = 50

  const getVariants = () => {
    if (prefersReducedMotion) {
      return {
        initial: {},
        animate: {},
      }
    }

    const baseVariant = { opacity: 0 }
    const animateVariant = { opacity: 1 }

    switch (direction) {
      case 'up':
        return {
          initial: { ...baseVariant, y: distance },
          animate: { ...animateVariant, y: 0 },
        }
      case 'down':
        return {
          initial: { ...baseVariant, y: -distance },
          animate: { ...animateVariant, y: 0 },
        }
      case 'left':
        return {
          initial: { ...baseVariant, x: distance },
          animate: { ...animateVariant, x: 0 },
        }
      case 'right':
        return {
          initial: { ...baseVariant, x: -distance },
          animate: { ...animateVariant, x: 0 },
        }
      case 'fade':
      default:
        return {
          initial: baseVariant,
          animate: animateVariant,
        }
    }
  }

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  }

  const itemVariants = getVariants()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
      variants={containerVariants}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  )
}
