/** localStorage key gating the one-time tour. Bump the version to re-show it. */
export const TOUR_SEEN_KEY = 'ff.tour.v1.seen';

/** Window event the footer "replay" button dispatches to restart the tour. */
export const TOUR_REPLAY_EVENT = 'ff:tour-replay';

export function hasSeenTour(): boolean {
  try {
    return localStorage.getItem(TOUR_SEEN_KEY) === '1';
  } catch {
    return true; // storage blocked → behave as "already seen" (do not auto-run)
  }
}

export function markTourSeen(): void {
  try {
    localStorage.setItem(TOUR_SEEN_KEY, '1');
  } catch {
    /* ignore quota/privacy errors */
  }
}

export function clearTourSeen(): void {
  try {
    localStorage.removeItem(TOUR_SEEN_KEY);
  } catch {
    /* ignore */
  }
}
