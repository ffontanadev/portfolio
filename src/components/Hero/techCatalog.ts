const SVGL = 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library';

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
   * React Native or C++17. Those render as typographic wordmarks instead —
   * see `BrandMarquee`. Standing a Swagger logo in for OpenAPI would be a
   * brand inaccuracy, so we don't.
   */
  marqueeUrl?: string;
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
  { id: 'java',         name: 'Java 17',       marqueeUrl: `${SVGL}/java.svg` },
  { id: 'springboot',   name: 'Spring Boot 3', marqueeUrl: `${SVGL}/spring.svg` },
  { id: 'junit',        name: 'JUnit 5' },
  { id: 'openapi',      name: 'OpenAPI' },
  { id: 'schemathesis', name: 'Schemathesis' },
  { id: 'postgresql',   name: 'PostgreSQL',    marqueeUrl: `${SVGL}/postgresql.svg` },
  { id: 'mssql',        name: 'MSSQL',         marqueeUrl: `${SVGL}/sql-server.svg` },
  { id: 'docker',       name: 'Docker',        marqueeUrl: `${SVGL}/docker.svg` },
  { id: 'jenkins',      name: 'Jenkins' },
  { id: 'typescript',   name: 'TypeScript',    marqueeUrl: `${SVGL}/typescript.svg` },
  { id: 'react',        name: 'React',         marqueeUrl: `${SVGL}/react_light.svg` },
  { id: 'reactnative',  name: 'React Native' },
  { id: 'cpp',          name: 'C++17' },
];
