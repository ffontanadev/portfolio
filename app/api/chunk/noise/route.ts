import { NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { makeNoise } from '@/lib/three/perlin';

export const runtime = 'nodejs';

// 1 year strong cache to match other chunk endpoints
const ONE_YEAR = 31536000;
const CACHE_CONTROL = `public, max-age=${ONE_YEAR}, s-maxage=${ONE_YEAR}, immutable`;

type Params = {
  size: number;
  seed: string;
  scale: number;
  dim: '2d' | '3d';
  axes: 'xz' | 'xy' | 'yz'; // only for 2d
  cx: number;
  cy: number;
  cz: number;
};

function parseParams(req: NextRequest): Params {
  const sp = req.nextUrl.searchParams;
  const size = Math.max(4, Math.min(128, Number(sp.get('size') ?? 64) | 0));
  const seed = (sp.get('seed') ?? 'seed').toString();
  const scale = Number(sp.get('scale') ?? 0.1);
  const dim = ((sp.get('dim') ?? '2d') as '2d' | '3d');
  const axes = ((sp.get('axes') ?? 'xz') as 'xz' | 'xy' | 'yz');
  const cx = Number(sp.get('cx') ?? 0) | 0;
  const cy = Number(sp.get('cy') ?? 0) | 0;
  const cz = Number(sp.get('cz') ?? 0) | 0;
  return { size, seed, scale, dim, axes, cx, cy, cz };
}

// Simple deterministic string hash -> 32-bit unsigned int
function hash32(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function keyOf(p: Params) {
  return `${p.size}|${p.seed}|${p.scale}|${p.dim}|${p.axes}|${p.cx}|${p.cy}|${p.cz}`;
}

// Compute noise grid on the server and return Float32Array
function computeNoise(p: Params): Float32Array {
  const { size: S, seed, scale, dim, axes, cx, cy, cz } = p;

  // Minimal inline conversion to unit float
  let s = hash32(seed) >>> 0;
  const unit = (s & 0x7ffffff) / 0x8000000;
  const noise = makeNoise(unit);

  if (dim === '2d') {
    const out = new Float32Array(S * S);
    for (let a = 0; a < S; a++) {
      for (let b = 0; b < S; b++) {
        let x = 0, y = 0, z = 0;
        if (axes === 'xz') { x = (a + cx * S) * scale; z = (b + cz * S) * scale; }
        else if (axes === 'xy') { x = (a + cx * S) * scale; y = (b + cy * S) * scale; }
        else { y = (a + cy * S) * scale; z = (b + cz * S) * scale; }
        const n = noise(x, y, z);
        out[a + b * S] = n;
      }
    }
    return out;
  }

  // dim === '3d'
  const out = new Float32Array(S * S * S);
  const IDX = (x: number, y: number, z: number) => x + y * S + z * S * S; // xyz layout
  for (let x = 0; x < S; x++) {
    for (let y = 0; y < S; y++) {
      for (let z = 0; z < S; z++) {
        const n = noise((x + cx * S) * scale, (y + cy * S) * scale, (z + cz * S) * scale);
        out[IDX(x, y, z)] = n;
      }
    }
  }
  return out;
}

const getNoiseCached = cache(
  async (p: Params) => computeNoise(p),
  ['chunk-noise'],
  { revalidate: ONE_YEAR, tags: ['chunk-noise'] }
);

export async function GET(req: NextRequest) {
  try {
    const params = parseParams(req);
    const key = keyOf(params);
    const data = await getNoiseCached(params);
    const etag = `W/"${hash32(key).toString(16)}-${params.size}-${params.dim}"`;

    const ifNoneMatch = req.headers.get('if-none-match');
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new Response(null, { status: 304, headers: { 'Cache-Control': CACHE_CONTROL, ETag: etag } });
    }

    return new Response(new Uint8Array(data.buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': CACHE_CONTROL,
        'ETag': etag,
        'X-Noise-Size': String(params.size),
        'X-Noise-Dim': params.dim,
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? 'error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

