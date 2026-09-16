// Vendored into public/logos/tech from svgl (github.com/pheralb/svgl), from
// simple-icons (single-path marks, recoloured here with the brand hex their
// dataset publishes) and, where neither carries the mark, from the project's
// own site. Hot-linking raw.githubusercontent.com cost a DNS lookup plus a TLS
// handshake to a third origin before any of the marks could start downloading,
// and left the marquee at the mercy of an uptime and a cache policy we don't
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
   * Optional: Apache Axis2 publishes no vector mark at all - its site ships a
   * raster wordmark - so it renders as a typographic wordmark instead, see
   * `BrandMarquee`. Standing the Apache feather in for it would be a brand
   * inaccuracy, the same reason a Swagger logo doesn't stand in for OpenAPI.
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
 * this page or the résumé demonstrates it. New entries slot in beside the
 * neighbour they belong with rather than at the end, so the existing relative
 * order - which is the argument the strip makes - stays intact.
 */
export const techCatalog: TechItem[] = [
  { id: 'java',         name: 'Java 17',        marqueeUrl: `${SVGL}/java.svg`, marqueeSize: { width: 256, height: 346 } },
  { id: 'springboot',   name: 'Spring Boot 3',  marqueeUrl: `${SVGL}/spring.svg`, marqueeSize: { width: 64, height: 64 } },
  { id: 'axis2',        name: 'Axis2' },
  { id: 'junit',        name: 'JUnit 5',        marqueeUrl: `${SVGL}/junit.svg`, marqueeSize: { width: 24, height: 24 } },
  { id: 'openapi',      name: 'OpenAPI',        marqueeUrl: `${SVGL}/openapi.svg`, marqueeSize: { width: 24, height: 24 } },
  { id: 'schemathesis', name: 'Schemathesis',   marqueeUrl: `${SVGL}/schemathesis.svg`, marqueeSize: { width: 35, height: 29 } },
  { id: 'sonarqube',    name: 'SonarQube',      marqueeUrl: `${SVGL}/sonarqube.svg`, marqueeSize: { width: 24, height: 24 } },
  { id: 'postgresql',   name: 'PostgreSQL',     marqueeUrl: `${SVGL}/postgresql.svg`, marqueeSize: { width: 432, height: 445 } },
  { id: 'mssql',        name: 'MSSQL',          marqueeUrl: `${SVGL}/sql-server.svg`, marqueeSize: { width: 48, height: 48 } },
  { id: 'elastic',      name: 'Elastic',        marqueeUrl: `${SVGL}/elastic.svg`, marqueeSize: { width: 24, height: 24 } },
  { id: 'docker',       name: 'Docker',         marqueeUrl: `${SVGL}/docker.svg`, marqueeSize: { width: 24, height: 24 } },
  { id: 'openshift',    name: 'OpenShift',      marqueeUrl: `${SVGL}/openshift.svg`, marqueeSize: { width: 24, height: 24 } },
  { id: 'jenkins',      name: 'Jenkins',        marqueeUrl: `${SVGL}/jenkins.svg`, marqueeSize: { width: 24, height: 24 } },
  { id: 'githubactions', name: 'GitHub Actions', marqueeUrl: `${SVGL}/github-actions.svg`, marqueeSize: { width: 24, height: 24 } },
  { id: 'typescript',   name: 'TypeScript',     marqueeUrl: `${SVGL}/typescript.svg`, marqueeSize: { width: 256, height: 256 } },
  { id: 'react',        name: 'React',          marqueeUrl: `${SVGL}/react_light.svg`, marqueeSize: { width: 569, height: 512 } },
  { id: 'reactnative',  name: 'React Native',   marqueeUrl: `${SVGL}/react-native.svg`, marqueeSize: { width: 112, height: 102 } },
  { id: 'cpp',          name: 'C++17',          marqueeUrl: `${SVGL}/c-plusplus.svg`, marqueeSize: { width: 256, height: 288 } },
];
