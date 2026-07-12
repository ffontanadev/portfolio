import { describe, it, expect, afterEach } from 'vitest';
import { TOUR_STOPS, resolveStopElement } from './tourStops';

afterEach(() => { document.body.innerHTML = ''; });

describe('TOUR_STOPS config', () => {
  it('lists the four stops in page order', () => {
    expect(TOUR_STOPS.map((s) => s.id)).toEqual([
      'techStack', 'featuredWorks', 'agents', 'devZone',
    ]);
  });
  it('every stop has a caption key under the tour namespace', () => {
    for (const s of TOUR_STOPS) {
      expect(s.captionKey.startsWith('tour.stops.')).toBe(true);
      expect(s.orbit.radius).toBeGreaterThan(0);
    }
  });
});

describe('resolveStopElement', () => {
  it('returns null when the anchor is absent', () => {
    expect(resolveStopElement(TOUR_STOPS[0])).toBeNull();
  });
  it('finds the element by its data-tour-id', () => {
    const el = document.createElement('div');
    el.setAttribute('data-tour-id', 'tech-stack');
    document.body.appendChild(el);
    expect(resolveStopElement(TOUR_STOPS[0])).toBe(el);
  });
});
