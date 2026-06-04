// Shared particle-feature flags. Read from import.meta.env (Vite inlines at
// build / dev-server start). Centralized so ParticleField and the hero brief
// agree on whether the tech-showcase is active (progressive enhancement).

const env = import.meta.env as Record<string, string | undefined>;

/** Whether the WebGL particle field (and therefore the tech showcase) runs. */
export const PARTICLES_ENABLED =
  (env.VITE_PARTICLE_ENABLED ?? 'true').toLowerCase() !== 'false';
