import type { ShapeSpec, SampleBounds } from './shapeSampler';

// Cache loaded SVG images keyed by URL so repeated samples don't re-decode.
const cache = new Map<string, HTMLImageElement>();
const inflight = new Map<string, Promise<HTMLImageElement>>();

const SILHOUETTE_MAX_WIDTH_RATIO = 0.55;
// Pixels with luminance above this threshold are treated as background/highlights
// and dropped — the sampler then picks up only the dark silhouette.
const LIGHT_LUMINANCE_THRESHOLD = 0.5;

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
    img.src = src;
  });
  inflight.set(src, promise);
  promise.finally(() => inflight.delete(src));
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

  const sizeRatio = spec.sizeRatio ?? 0.55;
  const widthRatio = spec.widthRatio ?? SILHOUETTE_MAX_WIDTH_RATIO;
  const naturalW = img.naturalWidth || img.width || 100;
  const naturalH = img.naturalHeight || img.height || 100;

  // Cap by both bounds — same trick as drawRocket: narrow viewports otherwise
  // produce a silhouette wider than the canvas because bounds.height stays large
  // (hero is min-h-screen) while bounds.width shrinks.
  const heightScale = (bounds.height * sizeRatio) / naturalH;
  const widthScale = (bounds.width * widthRatio) / naturalW;
  const scale = Math.min(heightScale, widthScale);

  const dw = naturalW * scale;
  const dh = naturalH * scale;
  const tx = (bounds.width - dw) / 2;
  const ty = (bounds.height - dh) / 2;

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
