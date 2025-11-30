/**
 * Animation Constants & Configurations
 * Centralized animation settings for consistent timing and easing across the portfolio
 * Inspired by every-day.nl's animation patterns
 */

/**
 * Easing Curves
 * Custom cubic-bezier curves for different animation feels
 */
export const easings = {
  // Smooth, professional easing (matches every-day.nl)
  smooth: [0.6, 0.05, 0.01, 0.9] as const,

  // Bouncy, playful easing
  bounce: [0.68, -0.55, 0.265, 1.55] as const,

  // Quick, snappy easing
  snappy: [0.77, 0, 0.175, 1] as const,

  // Gentle, subtle easing
  gentle: [0.25, 0.46, 0.45, 0.94] as const,

  // Elastic spring effect
  elastic: [0.87, 0, 0.13, 1] as const,
} as const

/**
 * Duration Scale (in seconds)
 * Use these instead of hardcoding duration values
 */
export const durations = {
  instant: 0.01,  // For reduced-motion fallback
  fastest: 0.15,  // Micro-interactions
  fast: 0.25,     // Hover effects, color changes
  normal: 0.3,    // Standard transitions
  medium: 0.5,    // Page transitions, reveals
  slow: 0.6,      // Large movements, complex animations
  slowest: 1.0,   // Special effects
} as const

/**
 * Stagger Delays (in seconds)
 * For sequential animations of multiple elements
 */
export const stagger = {
  menu: 0.05,       // Navigation menu items (50ms apart)
  cards: 0.1,       // Project cards, skill items
  words: 0.05,      // Text word-by-word reveals
  characters: 0.02, // Character-by-character (use sparingly)
} as const

/**
 * Animation Performance Budget
 * Limits to ensure smooth 60fps performance
 */
export const ANIMATION_BUDGET = {
  maxConcurrentAnimations: 5,
  maxDuration: 1000, // 1 second (in ms)
  maxStaggerDelay: 50, // 50ms between items (in ms)
  gpuAcceleratedOnly: true, // Only transform/opacity
} as const

/**
 * Scroll Reveal Thresholds
 * When elements should start animating during scroll
 */
export const scrollThresholds = {
  immediate: 0.1,  // As soon as 10% visible
  early: 0.2,      // At 20% visible
  normal: 0.3,     // At 30% visible (default)
  late: 0.5,       // At 50% visible
  full: 1.0,       // Fully visible
} as const

/**
 * Framer Motion Variants
 * Reusable animation configurations
 */
export const variants = {
  // Fade in from bottom
  fadeInUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },

  // Fade in from top
  fadeInDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  },

  // Simple fade
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Scale up
  scaleUp: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },

  // Slide from left
  slideInLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
  },

  // Slide from right
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  },
} as const

/**
 * Page Transition Config
 * For use with Framer Motion AnimatePresence
 */
export const pageTransition = {
  duration: durations.medium,
  ease: easings.smooth,
} as const

/**
 * Off-Canvas Menu Config
 */
export const offCanvasMenu = {
  container: {
    duration: durations.medium,
    ease: easings.smooth,
  },
  stagger: stagger.menu,
  itemDelay: 0.3, // Delay before first item starts
} as const

/**
 * Image Hover Config
 */
export const imageHover = {
  scale: 1.05,
  duration: durations.medium,
  ease: easings.smooth,
} as const

/**
 * Button Layer Config
 * For layered button interactions (background + text)
 */
export const buttonLayers = {
  background: {
    duration: durations.fast,
    ease: 'ease-out',
  },
  text: {
    duration: durations.fast,
    delay: 0.075, // 75ms delay for coordinated timing
    ease: 'ease-out',
  },
} as const

/**
 * Helper: Get transition object for Framer Motion
 */
export const getTransition = (
  duration: keyof typeof durations = 'normal',
  easing: keyof typeof easings = 'smooth',
  delay = 0
) => ({
  duration: durations[duration],
  ease: easings[easing],
  delay,
})

/**
 * Helper: Get stagger config for Framer Motion
 */
export const getStaggerConfig = (
  type: keyof typeof stagger = 'cards',
  baseDelay = 0
) => ({
  staggerChildren: stagger[type],
  delayChildren: baseDelay,
})
