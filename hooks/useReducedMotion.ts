'use client'

import { useState, useEffect } from 'react'

/**
 * useReducedMotion Hook
 * Detects if the user has requested reduced motion via system preferences
 * Returns true if animations should be disabled/minimized for accessibility
 *
 * @returns {boolean} Whether reduced motion is preferred
 *
 * @example
 * const prefersReducedMotion = useReducedMotion()
 *
 * <motion.div
 *   animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
 * />
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if window is defined (SSR safety)
    if (typeof window === 'undefined') return

    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Handler for when preference changes
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    // Listen for changes (modern API)
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * useReducedMotionConfig Hook
 * Returns animation configuration based on reduced motion preference
 * Useful for conditional animation settings
 *
 * @returns {{ shouldAnimate: boolean, duration: number }}
 *
 * @example
 * const { shouldAnimate, duration } = useReducedMotionConfig()
 *
 * <motion.div
 *   animate={shouldAnimate ? { y: 0 } : {}}
 *   transition={{ duration }}
 * />
 */
export function useReducedMotionConfig() {
  const prefersReducedMotion = useReducedMotion()

  return {
    shouldAnimate: !prefersReducedMotion,
    duration: prefersReducedMotion ? 0.01 : 0.3,
    instant: prefersReducedMotion,
  }
}
