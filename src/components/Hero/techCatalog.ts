const SVGL = 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library';

export interface TechItem {
  /** Stable id; also the i18n key suffix: techShowcase.brief.<id> */
  id: string;
  /** Display name shown in the marquee label and the brief panel heading. */
  name: string;
  /** SVG shown in the marquee (unchanged from the original list). */
  marqueeUrl: string;
  /** SVG sampled into particles. Must read as a dark/colored mark on cream. */
  logoUrl: string;
}

export const techCatalog: TechItem[] = [
  { id: 'supabase',    name: 'Supabase',     marqueeUrl: `${SVGL}/supabase.svg`,               logoUrl: `${SVGL}/supabase.svg` },
  { id: 'nextjs',      name: 'Next.js',      marqueeUrl: `${SVGL}/nextjs_icon_dark.svg`,       logoUrl: `${SVGL}/nextjs_icon_dark.svg` },
  { id: 'aws',         name: 'AWS',          marqueeUrl: `${SVGL}/aws_light.svg`,              logoUrl: `${SVGL}/aws_dark.svg` }, // light→dark for cream bg
  { id: 'threejs',     name: 'Three.js',     marqueeUrl: `${SVGL}/threejs-light.svg`,          logoUrl: `${SVGL}/threejs-dark.svg` }, // light→dark for cream bg
  { id: 'drizzle',     name: 'Drizzle',      marqueeUrl: `${SVGL}/drizzle-orm_light.svg`,      logoUrl: `${SVGL}/drizzle-orm.svg` }, // light→colored for cream bg
  { id: 'sqlite',      name: 'SQLite',       marqueeUrl: `${SVGL}/sqlite.svg`,                 logoUrl: `${SVGL}/sqlite.svg` },
  { id: 'mongodb',     name: 'MongoDB',      marqueeUrl: `${SVGL}/mongodb-icon-light.svg`,     logoUrl: `${SVGL}/mongodb-icon.svg` }, // verify visibility on cream
  { id: 'postgresql',  name: 'PostgreSQL',   marqueeUrl: `${SVGL}/postgresql.svg`,             logoUrl: `${SVGL}/postgresql.svg` },
  { id: 'springboot',  name: 'Spring Boot',  marqueeUrl: `${SVGL}/spring.svg`,                 logoUrl: `${SVGL}/spring.svg` },
  { id: 'sequelize',   name: 'Sequelize',    marqueeUrl: `${SVGL}/sequelize.svg`,              logoUrl: `${SVGL}/sequelize.svg` },
  { id: 'express',     name: 'Express.js',   marqueeUrl: `${SVGL}/expressjs.svg`,              logoUrl: `${SVGL}/expressjs-dark.svg` }, // black wordmark, verify
  { id: 'tailwind',    name: 'Tailwind CSS', marqueeUrl: `${SVGL}/tailwindcss.svg`,            logoUrl: `${SVGL}/tailwindcss.svg` },
  { id: 'astro',       name: 'Astro',        marqueeUrl: `${SVGL}/astro-icon-light.svg`,       logoUrl: `${SVGL}/astro-icon-dark.svg` }, // light→dark for cream bg
  { id: 'bootstrap',   name: 'Bootstrap',    marqueeUrl: `${SVGL}/bootstrap.svg`,              logoUrl: `${SVGL}/bootstrap.svg` },
  { id: 'vercel',      name: 'Vercel',       marqueeUrl: `${SVGL}/vercel.svg`,                 logoUrl: `${SVGL}/vercel.svg` }, // black, fine on cream
  { id: 'godaddy',     name: 'GoDaddy',      marqueeUrl: `${SVGL}/godaddy.svg`,                logoUrl: `${SVGL}/godaddy.svg` },
  { id: 'googlecloud', name: 'Google Cloud', marqueeUrl: `${SVGL}/google-cloud.svg`,           logoUrl: `${SVGL}/google-cloud.svg` },
  { id: 'csharp',      name: 'C#',           marqueeUrl: `${SVGL}/csharp.svg`,                 logoUrl: `${SVGL}/csharp.svg` },
  { id: 'lit',         name: 'Lit',          marqueeUrl: `${SVGL}/lit.svg`,                    logoUrl: `${SVGL}/lit.svg` },
  { id: 'redux',       name: 'Redux',        marqueeUrl: `${SVGL}/redux.svg`,                  logoUrl: `${SVGL}/redux.svg` },
  { id: 'auth0',       name: 'Auth0',        marqueeUrl: `${SVGL}/auth0.svg`,                  logoUrl: `${SVGL}/auth0.svg` },
  { id: 'jwt',         name: 'JWT',          marqueeUrl: `${SVGL}/jwt.svg`,                    logoUrl: `${SVGL}/jwt.svg` },
  { id: 'vite',        name: 'Vite',         marqueeUrl: `${SVGL}/vitejs.svg`,                 logoUrl: `${SVGL}/vitejs.svg` },
];
