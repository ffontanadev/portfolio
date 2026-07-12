import type { TourStop } from './tourStops';
import {
  type Vec2, type Rect, TrailBuffer,
  easeInOutCubic, lerp, quadBezier, orbitPoint, rectCenter,
} from './tourMotion';

export type TourPhase =
  | 'idle' | 'scroll' | 'approach' | 'orbit' | 'hold' | 'depart' | 'finish' | 'done';

export interface TourDeps {
  now(): number;
  viewport(): { width: number; height: number; scrollY: number };
  /** Target rect in viewport coordinates, or null if the anchor is absent. */
  getRect(selector: string): Rect | null;
  scrollTo(y: number): void;
  render(head: Vec2, trail: Vec2[], opacity: number): void;
  showCaption(stop: TourStop | null): void;
  onDone(reason: 'completed' | 'aborted'): void;
}

const SCROLL_MS = 1000;
const APPROACH_MS = 900;
const ORBIT_REV_MS = 900;   // per revolution
const HOLD_MS = 1500;
const DEPART_MS = 600;
const FINISH_MS = 700;
const TRAIL = 26;

export class TourController {
  private stops: TourStop[];
  private deps: TourDeps;
  private _phase: TourPhase = 'idle';
  private phaseStart = 0;
  private index = 0;
  private head: Vec2 = { x: 0, y: 0 };
  private trail = new TrailBuffer(TRAIL);
  private scrollFrom = 0;
  private scrollTarget = 0;
  private orbitCenter: Vec2 = { x: 0, y: 0 };
  private approachFrom: Vec2 = { x: 0, y: 0 };
  private approachCtrl: Vec2 = { x: 0, y: 0 };
  private approachTo: Vec2 = { x: 0, y: 0 };

  constructor(stops: TourStop[], deps: TourDeps) {
    this.stops = stops;
    this.deps = deps;
  }

  get phase(): TourPhase { return this._phase; }

  start(): void {
    this.index = 0;
    this.enterScrollOrSkip(this.deps.now());
  }

  abort(): void {
    if (this._phase === 'done') return;
    this.deps.showCaption(null);
    this._phase = 'done';
    this.deps.onDone('aborted');
  }

  private setPhase(p: TourPhase, now: number): void {
    this._phase = p;
    this.phaseStart = now;
  }

  private currentRect(): Rect | null {
    const stop = this.stops[this.index];
    return stop ? this.deps.getRect(stop.selector) : null;
  }

  /** Move to the next stop; enter its scroll phase, or finish when exhausted. */
  private advance(now: number): void {
    this.index += 1;
    this.enterScrollOrSkip(now);
  }

  private enterScrollOrSkip(now: number): void {
    // Skip any stops that don't resolve.
    while (this.index < this.stops.length && !this.currentRect()) {
      this.index += 1;
    }
    if (this.index >= this.stops.length) {
      this.setPhase('finish', now);
      return;
    }
    const stop = this.stops[this.index];
    const rect = this.currentRect()!;
    const vp = this.deps.viewport();
    const align = stop.scrollAlign;
    // rect.top is viewport-relative; convert to document space then align.
    const docTop = vp.scrollY + rect.top;
    const targetY = align === 'center'
      ? docTop - vp.height / 2 + rect.height / 2
      : docTop - 96; // 'start' leaves a small header gap
    this.scrollFrom = vp.scrollY;
    this.scrollTarget = Math.max(0, targetY);
    this.setPhase('scroll', now);
  }

  step(now: number): void {
    if (this._phase === 'idle' || this._phase === 'done') return;
    const elapsed = now - this.phaseStart;

    switch (this._phase) {
      case 'scroll': {
        const t = Math.min(elapsed / SCROLL_MS, 1);
        const y = lerp(this.scrollFrom, this.scrollTarget, easeInOutCubic(t));
        this.deps.scrollTo(y);
        // Park the comet near the incoming target so approach starts sensibly.
        const rect = this.currentRect();
        if (rect) {
          const c = rectCenter(rect);
          if (t === 0) this.head = { x: c.x, y: -40 };
        }
        this.pushRender(1);
        if (t >= 1) this.beginApproach(now);
        break;
      }
      case 'approach': {
        const t = Math.min(elapsed / APPROACH_MS, 1);
        this.head = quadBezier(this.approachFrom, this.approachCtrl, this.approachTo, easeInOutCubic(t));
        this.pushRender(1);
        if (t >= 1) {
          this.deps.showCaption(this.stops[this.index]);
          this.setPhase('orbit', now);
        }
        break;
      }
      case 'orbit': {
        const stop = this.stops[this.index];
        const orbitMs = ORBIT_REV_MS * stop.orbit.revolutions;
        const t = Math.min(elapsed / orbitMs, 1);
        const rect = this.currentRect();
        if (rect) this.orbitCenter = rectCenter(rect);
        const angle = -Math.PI / 2 + t * stop.orbit.revolutions * Math.PI * 2;
        this.head = orbitPoint(this.orbitCenter, stop.orbit.radius, angle);
        this.pushRender(1);
        if (t >= 1) this.setPhase('hold', now);
        break;
      }
      case 'hold': {
        const stop = this.stops[this.index];
        const rect = this.currentRect();
        if (rect) this.orbitCenter = rectCenter(rect);
        // Keep drifting slowly around so it reads as alive.
        const angle = -Math.PI / 2 + (stop.orbit.revolutions + elapsed / 2400) * Math.PI * 2;
        this.head = orbitPoint(this.orbitCenter, stop.orbit.radius, angle);
        this.pushRender(1);
        if (elapsed >= HOLD_MS) {
          this.deps.showCaption(null);
          this.setPhase('depart', now);
        }
        break;
      }
      case 'depart': {
        const t = Math.min(elapsed / DEPART_MS, 1);
        // Drift downward off the orbit while fading, then advance.
        this.head = { x: this.orbitCenter.x, y: this.orbitCenter.y + t * 120 };
        this.pushRender(1 - t * 0.4);
        if (t >= 1) this.advance(now);
        break;
      }
      case 'finish': {
        const t = Math.min(elapsed / FINISH_MS, 1);
        this.pushRender(1 - t);
        if (t >= 1) {
          this._phase = 'done';
          this.deps.showCaption(null);
          this.deps.onDone('completed');
        }
        break;
      }
    }
  }

  private beginApproach(now: number): void {
    const rect = this.currentRect();
    const target = rect ? rectCenter(rect) : this.head;
    this.approachFrom = { ...this.head };
    this.approachTo = target;
    // Control point: midpoint pushed perpendicular for a graceful arc.
    const mx = (this.approachFrom.x + target.x) / 2;
    const my = (this.approachFrom.y + target.y) / 2;
    this.approachCtrl = { x: mx + 80, y: my - 60 };
    this.setPhase('approach', now);
  }

  private pushRender(opacity: number): void {
    this.trail.push(this.head);
    this.deps.render(this.head, this.trail.toArray(), opacity);
  }
}
