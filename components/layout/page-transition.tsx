'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { pageTransition } from '@/lib/animations'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * PageTransition Component
 * Wraps page content to provide smooth transitions between routes
 * Inspired by every-day.nl's page transition effect
 *
 * @example
 * // In layout.tsx
 * <PageTransition>
 *   {children}
 * </PageTransition>
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  // If reduced motion, render without animation
  if (prefersReducedMotion) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * PageTransitionSlide Component
 * Alternative slide-based page transition
 *
 * @example
 * <PageTransitionSlide direction="left">
 *   {children}
 * </PageTransitionSlide>
 */
interface PageTransitionSlideProps {
  children: ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
}

export function PageTransitionSlide({
  children,
  direction = 'left',
}: PageTransitionSlideProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <>{children}</>
  }

  const variants = {
    left: {
      initial: { x: 100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -100, opacity: 0 },
    },
    right: {
      initial: { x: -100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 100, opacity: 0 },
    },
    up: {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -100, opacity: 0 },
    },
    down: {
      initial: { y: -100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 100, opacity: 0 },
    },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants[direction]}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
