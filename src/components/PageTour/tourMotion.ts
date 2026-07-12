export interface Vec2 { x: number; y: number }
export interface Rect { left: number; top: number; width: number; height: number }

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function quadBezier(p0: Vec2, c: Vec2, p1: Vec2, t: number): Vec2 {
  const u = 1 - t;
  const a = u * u;
  const b = 2 * u * t;
  const d = t * t;
  return {
    x: a * p0.x + b * c.x + d * p1.x,
    y: a * p0.y + b * c.y + d * p1.y,
  };
}

export function orbitPoint(center: Vec2, radius: number, angle: number): Vec2 {
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}

export function rectCenter(r: Rect): Vec2 {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Fixed-capacity ring buffer of recent points; `toArray` returns oldest-first. */
export class TrailBuffer {
  private points: Vec2[] = [];
  constructor(private capacity: number) {}
  push(p: Vec2): void {
    this.points.push({ x: p.x, y: p.y });
    if (this.points.length > this.capacity) this.points.shift();
  }
  toArray(): Vec2[] {
    return this.points.map((p) => ({ x: p.x, y: p.y }));
  }
  clear(): void {
    this.points = [];
  }
}
