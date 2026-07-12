export interface TourEnv {
  seen: boolean;
  particlesEnabled: boolean;
  reducedMotion: boolean;
  viewportWidth: number;
  finePointer: boolean;
}

/**
 * Pure gating predicate for the first-visit tour. Kept in its own module (not
 * PageTour.tsx) so the component file only exports a component, satisfying the
 * `react-refresh/only-export-components` rule.
 */
export function shouldRunTour(env: TourEnv): boolean {
  return (
    !env.seen &&
    env.particlesEnabled &&
    !env.reducedMotion &&
    env.viewportWidth >= 1024 &&
    env.finePointer
  );
}
