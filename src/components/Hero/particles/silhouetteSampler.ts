import type { ShapeSpec, SampleBounds } from './shapeSampler';

// Cache loaded SVG images keyed by URL so repeated samples don't re-decode.
const cache = new Map<string, HTMLImageElement>();
const inflight = new Map<string, Promise<HTMLImageElement>>();

const SILHOUETTE_MAX_WIDTH_RATIO = 0.75;
// Pixels with luminance above this threshold are treated as background/highlights
// and dropped — the sampler then picks up only the dark silhouette.
const LIGHT_LUMINANCE_THRESHOLD = 0.98;
/**
 * Breathing room kept between an x-offset mark and the canvas edge, as a
 * fraction of width. Without it a wide wordmark pushed toward the right column
 * would sample with its tail cropped off the canvas.
 */
export const SILHOUETTE_EDGE_MARGIN_RATIO = 0.04;

export interface SilhouettePlacement {
  tx: number;
  ty: number;
  dw: number;
  dh: number;
}

/**
 * Where and how large to draw a silhouette on the sampling canvas. Pure so the
 * placement rules — in particular the right-edge clamp that keeps an offset
 * wordmark on screen — are testable without a canvas.
 */
export function silhouettePlacement(
  spec: Extract<ShapeSpec, { kind: 'silhouette' }>,
  bounds: SampleBounds,
  naturalW: number,
  naturalH: number,
): SilhouettePlacement {
  const sizeRatio = spec.sizeRatio ?? 0.55;
  const widthRatio = spec.widthRatio ?? SILHOUETTE_MAX_WIDTH_RATIO;

  // Cap by both bounds — same trick as drawRocket: narrow viewports otherwise
  // produce a silhouette wider than the canvas because bounds.height stays large
  // (hero is min-h-screen) while bounds.width shrinks.
  const heightScale = (bounds.height * sizeRatio) / naturalH;
  const widthScale = (bounds.width * widthRatio) / naturalW;
  const scale = Math.min(heightScale, widthScale);

  const dw = naturalW * scale;
  const dh = naturalH * scale;

  const centeredX = (bounds.width - dw) / 2;
  // Optional horizontal bias (fraction of width): positive pushes the mark
  // right, used by the tech showcase so logos sit in the hero's empty right
  // column instead of behind the headline.
  const biasedX = centeredX + (spec.xOffsetRatio ?? 0) * bounds.width;

  const margin = bounds.width * SILHOUETTE_EDGE_MARGIN_RATIO;
  const maxX = bounds.width - margin - dw;
  // A mark too wide to sit between the margins can't be clamped into them —
  // centring is the least-bad placement, and matches the un-offset behaviour.
  const tx = maxX < margin ? centeredX : Math.min(Math.max(biasedX, margin), maxX);

  // Optional vertical bias (fraction of height): negative shifts the mark up,
  // used by the tech showcase so a centered logo clears the bottom brief text.
  const ty = (bounds.height - dh) / 2 + (spec.yOffsetRatio ?? 0) * bounds.height;

  return { tx, ty, dw, dh };
}

export function loadSilhouette(src: string): Promise<HTMLImageElement> {
  const existing = cache.get(src);
  if (existing) return Promise.resolve(existing);
  const pending = inflight.get(src);
  if (pending) return pending;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      cache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load silhouette SVG: ${src}`));
    // Request with CORS so the sampled canvas isn't tainted and getImageData
    // works on cross-origin logos (e.g. raw.githubusercontent.com, which sends
    // Access-Control-Allow-Origin: *).
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
  inflight.set(src, promise);
  // Two handlers rather than `.finally()`: that derives a *new* promise which
  // rejects alongside this one and has no catch of its own, so every failed
  // logo fetch would surface as an unhandled rejection. Callers still get the
  // original promise and handle it themselves.
  promise.then(
    () => inflight.delete(src),
    () => inflight.delete(src),
  );
  return promise;
}

export function drawSilhouette(
  ctx: CanvasRenderingContext2D,
  spec: Extract<ShapeSpec, { kind: 'silhouette' }>,
  bounds: SampleBounds,
) {
  const img = cache.get(spec.src);
  // If not yet loaded, leave the canvas blank — sampleShape's empty-points path
  // falls back to scatter, so the loop visibly skips this shape rather than crashing.
  if (!img) return;

  const naturalW = img.naturalWidth || img.width || 100;
  const naturalH = img.naturalHeight || img.height || 100;
  const { tx, ty, dw, dh } = silhouettePlacement(spec, bounds, naturalW, naturalH);

  ctx.drawImage(img, tx, ty, dw, dh);

  // Mask light pixels. The shape canvas is freshly cleared per sample, so we
  // operate on the full canvas — simpler than mapping bounds units back into
  // physical pixels via dpr.
  const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const lum = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
    if (lum > LIGHT_LUMINANCE_THRESHOLD) d[i + 3] = 0;
  }
  ctx.putImageData(data, 0, 0);
}
