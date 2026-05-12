// src/components/Hero/particles/rocketPath.ts
import type { SampleBounds } from './shapeSampler';

// Rocket silhouette pointing right, drawn in a 100x100 unit grid.
// Layout: body spans x=25..70, nose tip at x=95, fins protrude to x=5.
// Vertical extent is roughly y=20..80 (height ~60 units in path space).
// Treating the path's vertical extent as 60, sizeRatio scales it to bounds.height.
export const ROCKET_PATH_HEIGHT_UNITS = 60;

// Single closed body+fins path. Uses absolute moveto/lineto commands.
const ROCKET_BODY = 'M70 40 L95 50 L70 60 L28 60 L5 78 L18 55 L18 50 L18 45 L5 22 L28 40 Z';

// Small porthole — separately added so the dark pixel sampler picks it up.
const ROCKET_PORTHOLE = 'M58 50 a 4 4 0 1 1 -8 0 a 4 4 0 1 1 8 0 Z';

export interface RocketSpec {
  kind: 'rocket';
  sizeRatio?: number;
}

export function drawRocket(
  ctx: CanvasRenderingContext2D,
  spec: RocketSpec,
  bounds: SampleBounds,
) {
  const sizeRatio = spec.sizeRatio ?? 0.28;
  const targetHeight = bounds.height * sizeRatio;
  const scale = targetHeight / ROCKET_PATH_HEIGHT_UNITS;

  // Center the path's 100-unit width around the canvas center.
  const tx = bounds.width / 2 - 50 * scale;
  const ty = bounds.height / 2 - 50 * scale;

  ctx.save();
  ctx.translate(tx, ty);
  ctx.scale(scale, scale);

  const body = new Path2D(ROCKET_BODY);
  ctx.fill(body);

  const porthole = new Path2D(ROCKET_PORTHOLE);
  // Cut the porthole out so the sampler treats it as empty (white).
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fill(porthole);
  ctx.restore();

  ctx.restore();
}
