import type { ShapeSpec, SampleBounds } from './shapeSampler';

// Treating the path's vertical extent as 60, sizeRatio scales it to bounds.height.
export const ROCKET_PATH_HEIGHT_UNITS = 70;
export const ROCKET_PATH_WIDTH_UNITS = 100;

// Max fraction of canvas width the final-size rocket may occupy.
const ROCKET_MAX_WIDTH_RATIO = 0.45;
const ROCKET_BODY = 'M70 40 L95 50 L70 60 L28 60 L5 78 L18 55 L18 50 L18 45 L5 22 L28 40 Z';
const ROCKET_PORTHOLE = 'M58 50 a 4 4 0 1 1 -8 0 a 4 4 0 1 1 8 0 Z';

export function drawRocket(
  ctx: CanvasRenderingContext2D,
  spec: Extract<ShapeSpec, { kind: 'rocket' }>,
  bounds: SampleBounds,
) {
  const sizeRatio = spec.sizeRatio ?? 0.28;
  const heightScale = (bounds.height * sizeRatio) / ROCKET_PATH_HEIGHT_UNITS;
  const widthScale = (bounds.width * ROCKET_MAX_WIDTH_RATIO) / ROCKET_PATH_WIDTH_UNITS;
  const scale = Math.min(heightScale, widthScale);

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
