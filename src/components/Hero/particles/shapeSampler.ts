import { drawRocket } from './rocketPath';
import { drawSilhouette } from './silhouetteSampler';

export type ShapeSpec =
  | { kind: 'text'; text: string; fontFamily?: string; weight?: number; heightRatio?: number }
  | { kind: 'heart'; sizeRatio?: number }
  | { kind: 'rocket'; sizeRatio?: number }
  | {
      kind: 'silhouette';
      src: string;
      sizeRatio?: number;
      widthRatio?: number;
      xOffsetRatio?: number;
      yOffsetRatio?: number;
    }
  | { kind: 'frames'; srcs: string[]; fps?: number; sizeRatio?: number; widthRatio?: number };

export interface SampleBounds {
  width: number;
  height: number;
}

// Renders a shape into an offscreen canvas, samples dark pixels at a grid stride,
// and returns exactly `count` (x,y) points in CSS pixels relative to the canvas.
// Sampling stride adapts so we always have enough source points before resampling.
export function sampleShape(
  spec: ShapeSpec,
  count: number,
  bounds: SampleBounds,
): Float32Array {
  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(bounds.width * dpr));
  canvas.height = Math.max(1, Math.floor(bounds.height * dpr));

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return scatterFallback(count, bounds);

  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#000';
  ctx.imageSmoothingEnabled = true;

  if (spec.kind === 'text') {
    drawText(ctx, spec, bounds);
  } else if (spec.kind === 'heart') {
    drawHeart(ctx, spec, bounds);
  } else if (spec.kind === 'rocket') {
    drawRocket(ctx, spec, bounds);
  } else if (spec.kind === 'silhouette') {
    drawSilhouette(ctx, spec, bounds);
  } else {
    // 'frames' is sampled per-frame by FrameSequencer; if it reaches here,
    // something wired it into the static shape rotation path by mistake.
    return scatterFallback(count, bounds);
  }

  let pts = collectDarkPixels(ctx, canvas.width, canvas.height, dpr, 4);

  // If too sparse, sample at finer stride.
  if (pts.length / 2 < count * 0.6) {
    pts = collectDarkPixels(ctx, canvas.width, canvas.height, dpr, 2);
  }

  return distributeToCount(pts, count, bounds);
}

function drawText(
  ctx: CanvasRenderingContext2D,
  spec: Extract<ShapeSpec, { kind: 'text' }>,
  bounds: SampleBounds,
) {
  const family = spec.fontFamily ?? '"Fraunces", serif';
  const weight = spec.weight ?? 800;
  const heightRatio = spec.heightRatio ?? 0.55;
  // Pick font size from bounds.height. fillText doesn't auto-fit; we approximate
  // and then measure to scale if needed.
  let fontSize = bounds.height * heightRatio;
  ctx.font = `${weight} ${fontSize}px ${family}`;
  const metrics = ctx.measureText(spec.text);
  const maxWidth = bounds.width * 0.78;
  if (metrics.width > maxWidth) {
    fontSize *= maxWidth / metrics.width;
    ctx.font = `${weight} ${fontSize}px ${family}`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(spec.text, bounds.width / 2, bounds.height / 2);
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  spec: Extract<ShapeSpec, { kind: 'heart' }>,
  bounds: SampleBounds,
) {
  const sizeRatio = spec.sizeRatio ?? 0.38;
  const size = bounds.height * sizeRatio;
  const cx = bounds.width / 2;
  const cy = bounds.height / 2 + size * 0.08; // optical offset (heart is bottom-heavy)
  ctx.beginPath();
  // Parametric heart curve (16 sin^3 t, 13cos t - 5cos 2t - 2cos 3t - cos 4t)
  const steps = 360;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const px = cx + (x / 17) * size;
    const py = cy - (y / 17) * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function collectDarkPixels(
  ctx: CanvasRenderingContext2D,
  pxW: number,
  pxH: number,
  dpr: number,
  stride: number,
): number[] {
  const img = ctx.getImageData(0, 0, pxW, pxH);
  const data = img.data;
  const pts: number[] = [];
  for (let y = 0; y < pxH; y += stride) {
    for (let x = 0; x < pxW; x += stride) {
      const a = data[(y * pxW + x) * 4 + 3];
      if (a > 96) {
        pts.push(x / dpr, y / dpr);
      }
    }
  }
  return pts;
}

function distributeToCount(
  pts: number[],
  count: number,
  bounds: SampleBounds,
): Float32Array {
  const result = new Float32Array(count * 2);
  const numPts = pts.length / 2;

  if (numPts === 0) {
    return scatterFallback(count, bounds);
  }

  // Shuffle source indices for an even distribution.
  const idx = new Uint32Array(numPts);
  for (let i = 0; i < numPts; i++) idx[i] = i;
  for (let i = numPts - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp;
  }

  for (let i = 0; i < count; i++) {
    const src = idx[i % numPts];
    const repeated = i >= numPts;
    // Tiny jitter on repeats to avoid stacked particles.
    const jx = repeated ? (Math.random() - 0.5) * 2.2 : 0;
    const jy = repeated ? (Math.random() - 0.5) * 2.2 : 0;
    result[i * 2] = pts[src * 2] + jx;
    result[i * 2 + 1] = pts[src * 2 + 1] + jy;
  }
  return result;
}

function scatterFallback(count: number, bounds: SampleBounds): Float32Array {
  const result = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    result[i * 2] = Math.random() * bounds.width;
    result[i * 2 + 1] = Math.random() * bounds.height;
  }
  return result;
}

export interface ColoredSample {
  positions: Float32Array; // length count*2 — (x,y) in CSS px
  colors: Float32Array;    // length count*3 — (r,g,b) 0..1
}

// Like sampleShape, but also returns the source pixel color at each sampled point.
// Only meaningful for `silhouette` specs (the only kind the tech showcase uses);
// other kinds fall back to a scatter with white color so the caller can still tint.
export function sampleShapeWithColor(
  spec: ShapeSpec,
  count: number,
  bounds: SampleBounds,
): ColoredSample {
  if (spec.kind !== 'silhouette') {
    return {
      positions: sampleShape(spec, count, bounds),
      colors: filledColors(count),
    };
  }

  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(bounds.width * dpr));
  canvas.height = Math.max(1, Math.floor(bounds.height * dpr));

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { positions: scatterFallback(count, bounds), colors: filledColors(count) };
  }

  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;
  drawSilhouette(ctx, spec, bounds);

  let sampled = collectDarkPixelsWithColor(ctx, canvas.width, canvas.height, dpr, 4);
  if (sampled.pts.length / 2 < count * 0.6) {
    sampled = collectDarkPixelsWithColor(ctx, canvas.width, canvas.height, dpr, 2);
  }

  return distributeToCountWithColor(sampled, count, bounds);
}

// Variant of collectDarkPixels that also reads RGB at each kept pixel.
function collectDarkPixelsWithColor(
  ctx: CanvasRenderingContext2D,
  pxW: number,
  pxH: number,
  dpr: number,
  stride: number,
): { pts: number[]; rgb: number[] } {
  const img = ctx.getImageData(0, 0, pxW, pxH);
  const data = img.data;
  const pts: number[] = [];
  const rgb: number[] = [];
  for (let y = 0; y < pxH; y += stride) {
    for (let x = 0; x < pxW; x += stride) {
      const o = (y * pxW + x) * 4;
      const a = data[o + 3];
      if (a > 96) {
        pts.push(x / dpr, y / dpr);
        rgb.push(data[o] / 255, data[o + 1] / 255, data[o + 2] / 255);
      }
    }
  }
  return { pts, rgb };
}

// Like distributeToCount, but carries the source color alongside each position.
function distributeToCountWithColor(
  sampled: { pts: number[]; rgb: number[] },
  count: number,
  bounds: SampleBounds,
): ColoredSample {
  const { pts, rgb } = sampled;
  const positions = new Float32Array(count * 2);
  const colors = new Float32Array(count * 3);
  const numPts = pts.length / 2;

  if (numPts === 0) {
    return { positions: scatterFallback(count, bounds), colors: filledColors(count) };
  }

  const idx = new Uint32Array(numPts);
  for (let i = 0; i < numPts; i++) idx[i] = i;
  for (let i = numPts - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp;
  }

  for (let i = 0; i < count; i++) {
    const src = idx[i % numPts];
    const repeated = i >= numPts;
    const jx = repeated ? (Math.random() - 0.5) * 2.2 : 0;
    const jy = repeated ? (Math.random() - 0.5) * 2.2 : 0;
    positions[i * 2] = pts[src * 2] + jx;
    positions[i * 2 + 1] = pts[src * 2 + 1] + jy;
    colors[i * 3] = rgb[src * 3];
    colors[i * 3 + 1] = rgb[src * 3 + 1];
    colors[i * 3 + 2] = rgb[src * 3 + 2];
  }
  return { positions, colors };
}

// White fill so non-silhouette fallbacks still render visibly under brand-mix.
function filledColors(count: number): Float32Array {
  const colors = new Float32Array(count * 3);
  colors.fill(1);
  return colors;
}
