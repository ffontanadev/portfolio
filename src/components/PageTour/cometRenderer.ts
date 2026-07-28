import type { Vec2 } from './tourMotion';

export const TOUR_PALETTE = ['#FF6B6B', '#00D9A3', '#9D4EDD'] as const;

export interface CometParticle {
  color: string;
  /** base sprite radius in CSS px */
  radius: number;
  /** angular/temporal offset so particles in the head don't overlap exactly */
  offset: number;
}

/**
 * Deterministic head-cluster description. Colors cycle the palette so coral
 * dominates (index 0) with teal/purple accents, matching the hero field.
 */
export function createComet(count: number): CometParticle[] {
  const out: CometParticle[] = [];
  for (let i = 0; i < count; i++) {
    // Weighted toward coral: every 3rd/5th particle picks an accent.
    const color =
      i % 5 === 0 ? TOUR_PALETTE[2]
      : i % 3 === 0 ? TOUR_PALETTE[1]
      : TOUR_PALETTE[0];
    out.push({
      color,
      radius: 1.6 + (i % 4) * 0.5,
      offset: (i / count) * Math.PI * 2,
    });
  }
  return out;
}

/**
 * Draw the comet: a soft glowing head cluster at `head`, plus the fading trail
 * (oldest-first) shrinking and dimming toward the tail. No-op at opacity 0.
 */
export function drawComet(
  ctx: CanvasRenderingContext2D,
  head: Vec2,
  trail: Vec2[],
  particles: CometParticle[],
  opacity: number,
): void {
  if (opacity <= 0) return;
  ctx.save();

  // Trail: dim, shrinking dots from tail (index 0) to head (last).
  const n = trail.length;
  for (let i = 0; i < n; i++) {
    const t = (i + 1) / n; // 0..1, newer = larger/brighter
    const p = trail[i];
    ctx.globalAlpha = opacity * 0.35 * t;
    ctx.fillStyle = TOUR_PALETTE[0];
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.4 * t + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head cluster: each particle jittered slightly around the head point.
  ctx.shadowBlur = 12;
  for (const part of particles) {
    const jx = Math.cos(part.offset) * 2.2;
    const jy = Math.sin(part.offset) * 2.2;
    ctx.globalAlpha = opacity * 0.9;
    ctx.fillStyle = part.color;
    ctx.shadowColor = part.color;
    ctx.beginPath();
    ctx.arc(head.x + jx, head.y + jy, part.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
