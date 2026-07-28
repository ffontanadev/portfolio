import { describe, it, expect } from 'vitest';
import { shouldRunTour, type TourEnv } from './shouldRunTour';

const OK: TourEnv = {
  seen: false, particlesEnabled: true, reducedMotion: false,
  viewportWidth: 1440, finePointer: true,
};

describe('shouldRunTour', () => {
  it('runs when all conditions are met', () => {
    expect(shouldRunTour(OK)).toBe(true);
  });
  it('does not run for repeat visitors', () => {
    expect(shouldRunTour({ ...OK, seen: true })).toBe(false);
  });
  it('does not run when particles are disabled', () => {
    expect(shouldRunTour({ ...OK, particlesEnabled: false })).toBe(false);
  });
  it('does not run under reduced motion', () => {
    expect(shouldRunTour({ ...OK, reducedMotion: true })).toBe(false);
  });
  it('does not run on narrow viewports', () => {
    expect(shouldRunTour({ ...OK, viewportWidth: 800 })).toBe(false);
  });
  it('does not run on coarse pointers (touch)', () => {
    expect(shouldRunTour({ ...OK, finePointer: false })).toBe(false);
  });
});
