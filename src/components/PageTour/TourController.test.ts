import { describe, it, expect, vi } from 'vitest';
import { TourController, type TourDeps } from './TourController';
import type { TourStop } from './tourStops';
import type { Rect } from './tourMotion';

const STOPS: TourStop[] = [
  { id: 'techStack', selector: '#a', captionKey: 'k.a', orbit: { radius: 40, revolutions: 1 }, captionPlacement: 'top', scrollAlign: 'center' },
  { id: 'devZone', selector: '#b', captionKey: 'k.b', orbit: { radius: 40, revolutions: 1 }, captionPlacement: 'bottom', scrollAlign: 'start' },
];

function makeDeps(over: Partial<TourDeps> = {}): TourDeps {
  return {
    now: () => 0,
    viewport: () => ({ width: 1440, height: 900, scrollY: 0 }),
    getRect: (sel: string): Rect | null =>
      sel === '#a' ? { left: 200, top: 300, width: 100, height: 40 }
      : sel === '#b' ? { left: 800, top: 5000, width: 60, height: 30 }
      : null,
    scrollTo: vi.fn(),
    render: vi.fn(),
    showCaption: vi.fn(),
    onDone: vi.fn(),
    ...over,
  };
}

// Drive the controller from t=0 to t=ms in fixed increments.
function run(ctrl: TourController, ms: number, dt = 50) {
  for (let t = 0; t <= ms; t += dt) ctrl.step(t);
}

describe('TourController', () => {
  it('starts idle and enters scroll on start', () => {
    const ctrl = new TourController(STOPS, makeDeps());
    expect(ctrl.phase).toBe('idle');
    ctrl.start();
    ctrl.step(0);
    expect(ctrl.phase).toBe('scroll');
  });

  it('shows a caption once it reaches the orbit phase', () => {
    const deps = makeDeps();
    const ctrl = new TourController(STOPS, deps);
    ctrl.start();
    run(ctrl, 3000);
    expect(deps.showCaption).toHaveBeenCalled();
    const shownIds = (deps.showCaption as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => (c[0] as TourStop | null)?.id);
    expect(shownIds).toContain('techStack');
  });

  it('drives scroll toward the target', () => {
    const deps = makeDeps();
    const ctrl = new TourController(STOPS, deps);
    ctrl.start();
    run(ctrl, 1200);
    expect(deps.scrollTo).toHaveBeenCalled();
  });

  it('eventually completes and reports "completed", setting caption null', () => {
    const deps = makeDeps();
    const ctrl = new TourController(STOPS, deps);
    ctrl.start();
    run(ctrl, 30000);
    expect(ctrl.phase).toBe('done');
    expect(deps.onDone).toHaveBeenCalledWith('completed');
    expect(deps.showCaption).toHaveBeenLastCalledWith(null);
  });

  it('abort() stops immediately and reports "aborted"', () => {
    const deps = makeDeps();
    const ctrl = new TourController(STOPS, deps);
    ctrl.start();
    ctrl.step(0);
    ctrl.abort();
    expect(ctrl.phase).toBe('done');
    expect(deps.onDone).toHaveBeenCalledWith('aborted');
  });

  it('skips a stop whose anchor cannot be resolved', () => {
    const deps = makeDeps({ getRect: () => null });
    const ctrl = new TourController(STOPS, deps);
    ctrl.start();
    run(ctrl, 30000);
    expect(ctrl.phase).toBe('done');
    expect(deps.onDone).toHaveBeenCalledWith('completed');
    // No caption ever shown because nothing resolved.
    const shown = (deps.showCaption as ReturnType<typeof vi.fn>).mock.calls
      .some((c) => c[0] !== null);
    expect(shown).toBe(false);
  });
});
