"use client";

/**
 * DottedGridBackground - Modern, minimal dotted grid pattern
 * Inspired by Claude AI's interface design
 *
 * Design: Subtle dotted grid overlay on deep charcoal background
 * - Dot size: 1px
 * - Dot spacing: 24px
 * - Color: rgba(255, 255, 255, 0.04) - very subtle
 * - Background: #0a0a0a - deep charcoal
 */
export function DottedGridBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        backgroundColor: '#0a0a0a',
        backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
      aria-hidden="true"
    />
  );
}
