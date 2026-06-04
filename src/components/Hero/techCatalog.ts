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
   */
  marqueeUrl: string;
  /**
   * Optional per-logo size multiplier on the showcase base size ratio.
   * <1 shrinks an oversized mark, >1 grows a small one. Defaults to 1.
   */
  logoScale?: number;
}

export const techCatalog: TechItem[] = [
  { id: 'supabase',    name: 'Supabase',     marqueeUrl: `${SVGL}/supabase.svg` },
  { id: 'nextjs',      name: 'Next.js',      marqueeUrl: `${SVGL}/nextjs_icon_dark.svg` },
  { id: 'aws',         name: 'AWS',          marqueeUrl: `${SVGL}/aws_light.svg` },
  { id: 'threejs',     name: 'Three.js',     marqueeUrl: `${SVGL}/threejs-light.svg` },
  { id: 'drizzle',     name: 'Drizzle',      marqueeUrl: `${SVGL}/drizzle-orm_light.svg` },
  { id: 'sqlite',      name: 'SQLite',       marqueeUrl: `${SVGL}/sqlite.svg` },
  { id: 'mongodb',     name: 'MongoDB',      marqueeUrl: `${SVGL}/mongodb-icon-light.svg` },
  { id: 'postgresql',  name: 'PostgreSQL',   marqueeUrl: `${SVGL}/postgresql.svg` },
  { id: 'springboot',  name: 'Spring Boot',  marqueeUrl: `${SVGL}/spring.svg` },
  { id: 'sequelize',   name: 'Sequelize',    marqueeUrl: `${SVGL}/sequelize.svg` },
  { id: 'express',     name: 'Express.js',   marqueeUrl: `${SVGL}/expressjs.svg` },
  { id: 'tailwind',    name: 'Tailwind CSS', marqueeUrl: `${SVGL}/tailwindcss.svg` },
  { id: 'astro',       name: 'Astro',        marqueeUrl: `${SVGL}/astro-icon-light.svg` },
  { id: 'bootstrap',   name: 'Bootstrap',    marqueeUrl: `${SVGL}/bootstrap.svg` },
  { id: 'vercel',      name: 'Vercel',       marqueeUrl: `${SVGL}/vercel.svg` },
  { id: 'godaddy',     name: 'GoDaddy',      marqueeUrl: `${SVGL}/godaddy.svg` },
  { id: 'googlecloud', name: 'Google Cloud', marqueeUrl: `${SVGL}/google-cloud.svg` },
  { id: 'csharp',      name: 'C#',           marqueeUrl: `${SVGL}/csharp.svg` },
  { id: 'lit',         name: 'Lit',          marqueeUrl: `${SVGL}/lit.svg` },
  { id: 'redux',       name: 'Redux',        marqueeUrl: `${SVGL}/redux.svg` },
  { id: 'auth0',       name: 'Auth0',        marqueeUrl: `${SVGL}/auth0.svg` },
  { id: 'jwt',         name: 'JWT',          marqueeUrl: `${SVGL}/jwt.svg` },
  { id: 'vite',        name: 'Vite',         marqueeUrl: `${SVGL}/vitejs.svg` },
];
