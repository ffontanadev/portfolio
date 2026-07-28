import { describe, it, expect } from 'vitest';
import {
  TOUR_SEEN_KEY, hasSeenTour, markTourSeen, clearTourSeen,
} from './useFirstVisit';

describe('first-visit flag', () => {
  it('is false before any visit', () => {
    expect(hasSeenTour()).toBe(false);
  });
  it('becomes true after marking, using the versioned key', () => {
    markTourSeen();
    expect(localStorage.getItem(TOUR_SEEN_KEY)).toBe('1');
    expect(hasSeenTour()).toBe(true);
  });
  it('clears back to false', () => {
    markTourSeen();
    clearTourSeen();
    expect(hasSeenTour()).toBe(false);
  });
});
