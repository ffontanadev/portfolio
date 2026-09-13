// Vendored from github.com/pheralb/svgl (static/library) into public/logos/tech.
// Hot-linking raw.githubusercontent.com cost a DNS lookup plus a TLS handshake
// to a third origin before any of the seven marks could start downloading, and
// left the marquee at the mercy of an uptime and a cache policy we don't
// control. Same-origin also means the particle silhouette sampler reads them
// without relying on someone else's CORS headers.
const SVGL = '/logos/tech';

export interface TechItem {
  /** Stable id; also the i18n key suffix: techShowcase.brief.<id> */
  id: string;
  /** Display name shown in the marquee label and the hero brief heading. */
  name: string;
  /**
   * SVG used both in the marquee and as the particle-logo source. These are
   * the dark/colored variants that read on the cream hero background (svgl's
   * `-dark` variants are light-on-dark and sample to nothing, so avoid them).
   *
   * Optional: svgl carries no mark for JUnit, OpenAPI, Schemathesis, Jenkins,
   * React Native or C++17. Those render as typographic wordmarks instead - * see `BrandMarquee`. Standing a Swagger logo in for OpenAPI would be a
   * brand inaccuracy, so we don't.
   */
  marqueeUrl?: string;
  /**
   * The mark's intrinsic `viewBox` dimensions, read straight off the vendored
   * SVG. Emitted as `width`/`height` on the `<img>` so the browser can derive
   * an aspect ratio and reserve the right box *before* the file arrives - the
   * marquee renders these at a fixed `h-12` with `w-auto`, so without this the
   * width is unknown until load and every logo shoves its neighbours sideways.
   *
   * Intrinsic, not the rendered 48px: CSS still does the sizing, so changing
   * the marquee's height does not invalidate these numbers.
   *
   * Required wherever `marqueeUrl` is set; absent for the wordmark entries,
   * which render no image at all.
   */
  marqueeSize?: { width: number; height: number };
  /**
   * Optional per-logo size multiplier on the showcase base size ratio.
   * <1 shrinks an oversized mark, >1 grows a small one. Defaults to 1.
   */
  logoScale?: number;
}

/**
 * Spec §5.2. Ordered by what the owner wants to be hired for, not
 * alphabetically or by recency. A technology appears only if a project on
 * this page or the résumé demonstrates it.
 */
export const techCatalog: TechItem[] = [
  { id: 'java',         name: 'Java 17',       marqueeUrl: `${SVGL}/java.svg`, marqueeSize: { width: 256, height: 346 } },
  { id: 'springboot',   name: 'Spring Boot 3', marqueeUrl: `${SVGL}/spring.svg`, marqueeSize: { width: 64, height: 64 } },
  { id: 'junit',        name: 'JUnit 5' },
  { id: 'openapi',      name: 'OpenAPI' },
  { id: 'schemathesis', name: 'Schemathesis' },
  { id: 'postgresql',   name: 'PostgreSQL',    marqueeUrl: `${SVGL}/postgresql.svg`, marqueeSize: { width: 432, height: 445 } },
  { id: 'mssql',        name: 'MSSQL',         marqueeUrl: `${SVGL}/sql-server.svg`, marqueeSize: { width: 48, height: 48 } },
  { id: 'docker',       name: 'Docker',        marqueeUrl: `${SVGL}/docker.svg`, marqueeSize: { width: 24, height: 24 } },
  { id: 'jenkins',      name: 'Jenkins' },
  { id: 'typescript',   name: 'TypeScript',    marqueeUrl: `${SVGL}/typescript.svg`, marqueeSize: { width: 256, height: 256 } },
  { id: 'react',        name: 'React',         marqueeUrl: `${SVGL}/react_light.svg`, marqueeSize: { width: 569, height: 512 } },
  { id: 'reactnative',  name: 'React Native' },
  { id: 'cpp',          name: 'C++17' },
];
