import { useMemo, useState, useRef } from 'react';
import { AnimatePresence, LayoutGroup, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import ProjectPreviewModal, { EnterpriseHero } from './ProjectPreviewModal';
import LatestCommit from './LatestCommit';
import VideoShowcaseHero from './VideoShowcaseHero';
import { accentForCategory, categoryLabelKey, type Project } from './projectTypes';
import { useTranslation } from '@/i18n';

const ease = [0.22, 1, 0.36, 1] as const;

type Filter = 'all' | 'personal' | 'professional';

// Structural data — non-translatable (styling, stacks, dates, code, lead-metric
// glyphs). Display text (title/desc/role/description, phase + metric copy) is
// merged in from the locale inside the component, keyed by `id`.
type ProjectStructural = Omit<Project, 'title' | 'desc' | 'role' | 'description' | 'phases' | 'metrics'> & {
  id: string;
};

const projectData: ProjectStructural[] = [
  {
    id: 'efengine',
    color: "bg-cream-100",
    techStack: ["C++17", "OpenGL 3.3 Core", "GLFW", "GLAD", "GLM", "Doctest", "CMake"],
    date: "'26 — NOW",
    codeBlocks: [],
    category: 'personal',
    featured: true,
    repo: 'elFonTii/efengine',
    showcaseVideos: [
      '/videos/efengine/hello-triangle.mp4',
      '/videos/efengine/glfw-context.mp4',
    ],
  },
  {
    id: 'bancoProvincia',
    color: "bg-cream-100",
    techStack: ["Java 17", "Spring Boot 3", "Axis2 (legacy)", "MSSQL", "JNDI → DataSource"],
    date: "'25 — NOW",
    codeBlocks: [],
    category: 'professional',
    company: 'Banco Provincia',
    logo: 'banco-provincia',
    leadMetric: { kind: 'migration', from: 'Axis 2', to: 'Boot' },
  },
  {
    id: 'bbva',
    color: "bg-cream-100",
    techStack: ["Java 17", "Spring Boot", "JUnit 5", "Mockito", "Testcontainers"],
    date: "'25",
    codeBlocks: [],
    category: 'professional',
    company: 'BBVA',
    logo: 'bbva',
    leadMetric: { kind: 'scale', superscript: 'API²', value: '50+' },
  },
  {
    id: 'voxel',
    color: "bg-blue-50",
    category: 'personal',
    leadMetric: { kind: 'wordmark', value: 'Voxel', sub: 'world' },
    techStack: ["Next.js", "Three.js", "Perlin Noise", "Prototyping", "On-demand Buffer Streaming"],
    date: "JAN 25'",
    codeBlocks: [
      {
        language: "typescript",
        label: "Perlin Noise Generation",
        code: ` 

/**
 * Función de ruido que acepta coordenadas 2D o 3D y retorna un valor [0, 1]
 */
type NoiseFunction = (x: number, y: number, z?: number) => number;

/**
 *
 * Algoritmo de Perlin:
 * 1. Generar tabla de permutaciones (p) basada en la semilla
 * 2. Para cada punto (x,y,z), encontrar el cubo unitario que lo contiene
 * 3. Calcular gradientes en las 8 esquinas del cubo
 * 4. Interpolar trilinealmente entre los gradientes usando curvas fade
 *
 * @param seed Semilla para generación determinista (default: Math.random())
 * @returns Función de ruido (x, y, z?) => [0, 1]
 */
export function makeNoise(seed = Math.random()): NoiseFunction {
    // Tabla de permutaciones de 512 entradas (duplicada para evitar overflow)
    const p = new Uint8Array(512);

    // Inicializar tabla con valores 0-255
    for (let i = 0; i < 256; i++) p[i] = i;

    // Mezclar aleatoriamente usando la semilla (Fisher-Yates shuffle)
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(seed * (i + 1));
      [p[i], p[j]] = [p[j], p[i]]; // Swap
    }

    // Duplicar la primera mitad para evitar checks de overflow
    for (let i = 0; i < 256; i++) p[i + 256] = p[i];

    /**
     * Curva de interpolación suave (fade function).
     * Usa el polinomio 6t⁵ - 15t⁴ + 10t³ para transiciones C2-continuas.
     * Esto elimina artefactos visuales y produce ruido más orgánico.
     */
    function fade(t: number) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Interpolación lineal entre a y b según factor t
     */
    function lerp(a: number, b: number, t: number) {
      return a + t * (b - a);
    }

    /**
     * Función de gradiente: convierte un hash en un vector de gradiente
     * y calcula el producto punto con el vector de distancia (x, y, z).
     *
     * Los primeros 4 bits del hash determinan la dirección del gradiente,
     * creando 16 vectores posibles distribuidos uniformemente.
     */
    function grad(hash: number, x: number, y: number, z: number) {
      const h = hash & 15; // Usar solo los primeros 4 bits
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    /**
     * Función de ruido principal - evalúa el ruido de Perlin en (x, y, z).
     * Si z no se proporciona, se usa 0 (modo 2D).
     *
     * Proceso:
     * 1. Encontrar coordenadas del cubo unitario
     * 2. Calcular posición relativa dentro del cubo
     * 3. Aplicar curva fade a las coordenadas relativas
     * 4. Hashear las 8 esquinas del cubo
     * 5. Interpolar trilinealmente los gradientes
     * 6. Normalizar salida a [0, 1]
     */
    return function noise(x: number, y: number, z: number = 0) {
      // Encontrar coordenadas del cubo unitario que contiene el punto
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;

      // Calcular posición relativa del punto dentro del cubo [0, 1)
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);

      // Aplicar curva fade para interpolación suave
      const u = fade(x);
      const v = fade(y);
      const w = fade(z);

      // Hashear coordenadas de las 8 esquinas del cubo
      const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
      const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;

      // Interpolación trilineal de los 8 gradientes de las esquinas
      return lerp(
        // Interpolar en Z para el plano inferior (z=0)
        lerp(
          lerp(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u),
          lerp(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u),
          v
        ),
        // Interpolar en Z para el plano superior (z=1)
        lerp(
          lerp(grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1), u),
          lerp(grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1), u),
          v
        ),
        w
      ) * 0.5 + 0.5; // Normalizar de [-1, 1] a [0, 1]
    };
  }`
      }
    ]
  },
  {
    id: 'twitterClone',
    color: "bg-blue-50",
    category: 'personal',
    leadMetric: { kind: 'wordmark', value: 'Twitter', sub: 'clone' },
    techStack: ["Node.js", "Express", "Express Session", "Mongo", "EJS"],
    date: "JUN 23'",
    codeBlocks: [
      {
        language: "typescript",
        label: "Tweet API Controller",
        code: ` 

const { User, Tweet } = require("../db/connection");

//Trae todos los tweets en forma de JSON
async function index(req, res) {
  try {
    const loggedUser = await User.findById(req.user._id);
    const following = loggedUser.following;

    const tweets = await Tweet.find({
      $or: [
        { author: loggedUser._id },
        { author: { $in: following } }
      ]
    }).sort({ creationdate: -1 }).populate('author');

    res.json({
      tweets,
      user: req.user._id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


//Obten los tweets de un usuario
async function getTweetsByUser(req, res) {
  const { userId } = req.params;
  const tweets = await Tweet.find({ author: userId }).sort({ creationdate: -1 }).populate('author');
  res.json(tweets);
}

// Guarda el nuevo tweet en la base
async function store(req, res) {
  try {
    const { text } = req.body;
    const user = await User.findById(req.user._id);
    const tweet = new Tweet({
      text,
      author: user._id,
      creationdate: new Date(),
    });
    await tweet.save();
    const savedTweet = await Tweet.findById(tweet._id).populate('author');
    res.json(savedTweet);
  } catch (err) {
    res.json(err);
  }
}

// Trae el Tweet que solicitamos para editar en forma de JSON
async function getTweetById(req, res) {
  const { id } = req.params;
  try {
    const tweet = await Tweet.findById(id);
    res.json(tweet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Remove the specified resource from storage.
async function destroy(req, res) {
  const { id } = req.params;
  const tweet = await Tweet.findByIdAndDelete(id);
  res.json(tweet);
}

async function likesHandler(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findById(req.user._id);
    const tweet = await Tweet.findById(id);

    //Si el usuario ya le dió like al tweet, lo saca
    if (tweet.likes.includes(user._id)) {
      tweet.likes.pull(user._id);
      tweet.save();
      res.json({ tweet, liked: false });
    } else {
      tweet.likes.push(user._id);
      tweet.save();
      res.json({ tweet, liked: true });
    }
  } catch (error) {
    res.json(error);
  }
}

// Otros handlers...
// ...

module.exports = {
  index,
  store,
  getTweetById,
  likesHandler,
  getTweetsByUser,
  destroy,
};
`
      }
    ]
  },
  {
    id: 'mhc',
    color: "bg-blue-50",
    category: 'personal',
    leadMetric: { kind: 'wordmark', value: 'MHC', sub: 'cli' },
    techStack: ["Commander.js", "Google Cloud Platform", "SQLite"],
    date: "AUG 25'",
    codeBlocks: [
      {
        language: "typescript",
        label: "Fetch Command",
        code: ` 
import { Command } from "commander";
import { getConfigService } from "../services/ConfigService.js";
import { getDatabaseService } from "../db/database.js";
import { EmailServiceFactory } from "../services/email/EmailServiceFactory.js";
import { EmailRepository } from "../db/repositories/EmailRepository.js";
import { logger } from "../utils/logger.js";
import { parsePeriodString } from "../models/Period.js";
import { displaySummary } from "../utils/display.js";
import { colors } from "../utils/theme.js";
import ora from "ora";

interface FetchOptions {
  period: string;
  from?: string;
  to?: string;
  subject?: string;
  dryRun: boolean;
  force: boolean;
}

export const fetchCommand = new Command("fetch")
  .description("Fetch employee hours report emails from configured email service and store them in the database")
  .option(
    "-p, --period <period>",
    "Period to fetch emails for. Use 'current', 'previous', or specific quarter like '2024-01-Q1'",
    "current"
  )
  .option("--from <date>", "Start date filter in YYYY-MM-DD format (e.g., 2024-01-01)")
  .option("--to <date>", "End date filter in YYYY-MM-DD format (e.g., 2024-01-31)")
  .option("--subject <pattern>", "Custom subject pattern to search for (overrides config setting)")
  .option("--dry-run", "Preview emails that would be fetched without saving to database", false)
  .option("--force", "Re-fetch and process emails that were already processed", false)
  .action(async (options: FetchOptions) => {
    const spinner = ora();

    try {
      logger.header("Magenta Innova - Reporte de horas");

      // Initialize services
      spinner.start("Initializing services...");
      const configService = getConfigService();
      const dbService = await getDatabaseService(
        configService.get("storage").dbPath
      );
      const emailRepository = new EmailRepository(dbService.getDb());
      spinner.succeed("Services initialized");

      // Validate environment
      const validation = configService.validateEnvironment();
      if (!validation.valid) {
        spinner.fail("Configuration validation failed");
        logger.error("Configuration errors:");
        validation.errors.forEach((err) => logger.error(  {err}));
        process.exit(1);
      }

      // Parse period
      const period = parsePeriodString(options.period);
      logger.info(
       Fetching emails for period: {colors.primaryBold(period.label)}
      );

      // Build date filters
      let fromDate: Date | undefined;
      let toDate: Date | undefined;

      if (options.from) {
        fromDate = new Date(options.from);
        logger.info(From date: {colors.text(options.from)});
      }

      if (options.to) {
        toDate = new Date(options.to);
        logger.info(To date: {colors.text(options.to)});
      }

      // Get subject pattern from config or option
      const subjectPattern =
        options.subject || configService.get("business").subjectPattern;
      logger.info(Subject pattern: {colors.text(subjectPattern)});
      console.log();

      // Create email service using factory
      spinner.start("Connecting to email service...");
      const emailService = EmailServiceFactory.create(configService);

      // Connect to email service
      await emailService.connect();
      spinner.succeed("Connected to email service");

      try {
        // Fetch emails
        spinner.start("Fetching emails from inbox...");
        const emails = await emailService.fetchEmails({
          folder: "INBOX",
          unreadOnly: false,
          from: fromDate,
          to: toDate,
          subject: subjectPattern,
        });

        spinner.succeed(
          Found {emails.length} email{emails.length !== 1 ? "s" : ""}
        );

        if (emails.length === 0) {
          logger.info("No emails found matching criteria");
          await emailService.disconnect();
          await dbService.disconnect();
          return;
        }

        // Process emails
        let savedCount = 0;
        let skippedCount = 0;

        spinner.start("Processing emails...");

        for (const email of emails) {
          // Check if email already exists
          const exists = await emailRepository.emailExists(email.messageId);

          if (exists && !options.force) {
            logger.debug(Email {email.messageId} already exists, skipping);
            skippedCount++;
            continue;
          }

          if (!options.dryRun) {
            // Save to database
            await emailRepository.saveRawEmail(email);

            // Mark as processed in email service
            await emailService.markAsProcessed(email.id);

            savedCount++;
            logger.debug(Saved email: { email.subject });
          } else {
            spinner.text = [DRY RUN] Processing: {email.subject};
            savedCount++;
          }
        }

        // Save database changes
        if (!options.dryRun) {
          await dbService.save();
          spinner.succeed("Emails processed and saved");
        } else {
          spinner.info("DRY RUN - No changes saved");
        }

        // Summary
        const summaryStats: Record<string, string | number> = {
          "Total fetched": emails.length,
          Saved: savedCount,
          Skipped: skippedCount,
        };

        if (options.dryRun) {
          summaryStats["Mode"] = "DRY RUN - No changes saved";
        }

        displaySummary("Fetch Complete", summaryStats);
      } finally {
        // Disconnect from email service
        await emailService.disconnect();
        await dbService.disconnect();
      }
    } catch (error) {
      spinner.fail("Fetch command failed");
      logger.error("Fetch command failed", error);
      process.exit(1);
    }
  });

`
      }
    ]
  },
];

const FeaturedWorks = () => {
  const { t, messages } = useTranslation();
  const fp = messages.work.featured.projects;
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  // Merge structural project data with localized copy, keyed by id.
  const projects = useMemo<Project[]>(() => {
    const byId = Object.fromEntries(projectData.map((p) => [p.id, p])) as Record<string, ProjectStructural>;
    return [
      {
        ...byId.efengine,
        title: fp.efengine.title,
        desc: fp.efengine.desc,
        role: fp.efengine.role,
        description: fp.efengine.description,
        leadMetric: { kind: 'wordmark', value: 'EFENGINE', sub: fp.efengine.leadSub },
        phases: fp.efengine.phases.map((ph, i) => ({ ...ph, current: i === 2 })),
      },
      {
        ...byId.bancoProvincia,
        title: fp.bancoProvincia.title,
        desc: fp.bancoProvincia.desc,
        role: fp.bancoProvincia.role,
        description: fp.bancoProvincia.description,
        metrics: fp.bancoProvincia.metrics.map((m, i) => ({ ...m, accent: i === 1 })),
      },
      {
        ...byId.bbva,
        title: fp.bbva.title,
        desc: fp.bbva.desc,
        role: fp.bbva.role,
        description: fp.bbva.description,
        metrics: fp.bbva.metrics.map((m, i) => ({ ...m, accent: i === 0 })),
      },
      {
        ...byId.voxel,
        title: fp.voxel.title,
        desc: fp.voxel.desc,
        role: fp.voxel.role,
        description: fp.voxel.description,
      },
      {
        ...byId.twitterClone,
        title: fp.twitterClone.title,
        desc: fp.twitterClone.desc,
        role: fp.twitterClone.role,
        description: fp.twitterClone.description,
      },
      {
        ...byId.mhc,
        title: fp.mhc.title,
        desc: fp.mhc.desc,
        role: fp.mhc.role,
        description: fp.mhc.description,
      },
    ];
  }, [fp]);

  const featuredProject = useMemo(() => projects.find((p) => p.featured) ?? null, [projects]);

  const counts = useMemo(
    () => ({
      all: projects.length,
      personal: projects.filter((p) => (p.category ?? 'personal') === 'personal').length,
      professional: projects.filter((p) => p.category === 'professional').length,
    }),
    [projects],
  );

  // The flagship renders in its own full-width band; keep it out of the grid to avoid duplication.
  const visibleProjects = useMemo(() => {
    const base = filter === 'all' ? projects : projects.filter((p) => (p.category ?? 'personal') === filter);
    return base.filter((p) => !p.featured);
  }, [filter, projects]);

  // Flagship shows only when the active filter includes it (it is a personal project).
  const showFeatured =
    featuredProject !== null && (filter === 'all' || filter === (featuredProject.category ?? 'personal'));

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 200);
  };

  return (
    <>
      <section
        ref={sectionRef}
        id="work"
        className="relative py-32 md:py-40 px-6 md:px-20 max-w-[1440px] mx-auto"
      >
        {/* Section header */}
        <motion.div style={{ y: headingY }} className="mb-14">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-eyebrow text-coral-500">{t('work.featured.eyebrow')}</span>
            <span className="h-px flex-1 max-w-[140px] bg-dark-900/15" />
          </div>
          <h2 className="font-display font-display-md font-bold tracking-[-0.02em] text-4xl md:text-6xl leading-[1.05] max-w-3xl text-dark-900">
            {t('work.featured.headingBefore')}{' '}
            <span className="font-display-italic text-coral-500" style={{ fontStyle: 'italic' }}>
              {t('work.featured.headingEmphasis')}
            </span>{' '}
            {t('work.featured.headingAfter')}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-dark-900/55 font-light leading-relaxed">
            {t('work.featured.description')}
          </p>
        </motion.div>

        {/* Filter tabs — editorial type, coral hairline marks the active category */}
        <LayoutGroup id="featured-works-filter">
          <div
            role="tablist"
            aria-label={t('work.featured.filterAriaLabel')}
            className="flex flex-wrap items-baseline gap-x-10 gap-y-3 pb-5 mb-20 border-b border-dark-900/10"
          >
            {(['all', 'personal', 'professional'] as Filter[]).map((tab) => {
              const isActive = filter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilter(tab)}
                  className="relative pb-1 group focus:outline-none"
                >
                  <span
                    className={`font-display text-xl md:text-2xl tracking-[-0.01em] transition-colors duration-300 ${
                      isActive
                        ? 'text-dark-900 font-display-italic'
                        : 'text-dark-900/40 group-hover:text-dark-900/70'
                    }`}
                    style={{ fontStyle: isActive ? 'italic' : 'normal' }}
                  >
                    {t(`work.featured.filters.${tab}`)}
                  </span>
                  <span
                    className={`ml-2 align-top font-mono text-[10px] tracking-widest transition-colors duration-300 ${
                      isActive ? 'text-coral-500' : 'text-dark-900/35 group-hover:text-dark-900/55'
                    }`}
                  >
                    {String(counts[tab]).padStart(2, '0')}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="featured-works-tab-underline"
                      className="absolute left-0 right-7 -bottom-[5px] h-px bg-coral-500"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        {showFeatured && featuredProject && (
          <motion.article
            key="flagship"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease }}
            onClick={() => handleProjectClick(featuredProject)}
            className="group cursor-pointer mb-24"
          >
            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-mono text-[9px] text-teal-700 tracking-[0.25em] uppercase">
                {t('work.featured.flagshipTag')}
              </span>
              <span className="h-px flex-1 bg-dark-900/10" />
              <span className="font-mono text-[10px] text-dark-900/40 tracking-widest uppercase">
                {featuredProject.date}
              </span>
            </div>

            <div className="relative w-full aspect-[21/9] md:aspect-[3/1] bg-cream-100 border border-teal-700/20 rounded-2xl overflow-hidden soft-lift">
              {featuredProject.showcaseVideos?.length ? (
                <VideoShowcaseHero
                  project={featuredProject}
                  videos={featuredProject.showcaseVideos}
                  size="modal"
                />
              ) : (
                <EnterpriseHero project={featuredProject} size="modal" />
              )}
              <div className="absolute inset-0 transition-colors duration-700 mix-blend-multiply bg-teal-700/0 group-hover:bg-teal-700/[0.05]" />
              <div className="absolute top-5 right-5 bg-cream-50/90 backdrop-blur-sm p-3 rounded-full opacity-0 translate-y-3 -translate-x-3 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                <ArrowUpRight size={18} className="text-dark-900" />
              </div>
            </div>

            <div className="mt-7 max-w-3xl">
              <h3 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em] leading-tight text-dark-900 group-hover:text-teal-700 transition-colors duration-500">
                {featuredProject.title}
              </h3>
              <p className="mt-3 text-base md:text-lg text-dark-900/60 font-light leading-relaxed">
                {featuredProject.desc}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {featuredProject.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[10px] tracking-widest uppercase text-dark-900/55 border border-dark-900/15 rounded-full px-3 py-1"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              {featuredProject.repo && (
                <LatestCommit repo={featuredProject.repo} variant="badge" />
              )}
            </div>
          </motion.article>
        )}

        <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease }}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24"
        >
          {visibleProjects.map((project, index) => {
            const num = String(index + 1).padStart(2, '0');
            const total = String(visibleProjects.length).padStart(2, '0');
            const offsetClass = index % 2 === 1 ? 'md:mt-20' : '';
            const accent = accentForCategory(project.category);
            return (
              <motion.article
                key={`${filter}-${project.title}`}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.08, duration: 0.9, ease }}
                onClick={() => handleProjectClick(project)}
                className={`group cursor-pointer ${offsetClass}`}
              >
                {/* Project number / date rail */}
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="font-mono text-xs text-dark-900/40 tracking-widest">
                    {num} <span className="text-dark-900/25">/ {total}</span>
                  </span>
                  <span className={`font-mono text-[9px] tracking-[0.25em] uppercase ${accent.text}`}>
                    {t(categoryLabelKey(project.category))}
                  </span>
                  <span className="h-px flex-1 bg-dark-900/10" />
                  <span className="font-mono text-[10px] text-dark-900/40 tracking-widest uppercase">
                    {project.date}
                  </span>
                </div>

                {/* Card visual — typographic composition for every project */}
                <div className="relative w-full aspect-[4/3] bg-cream-100 border border-dark-900/[0.08] rounded-2xl overflow-hidden soft-lift">
                  <EnterpriseHero project={project} size="card" />

                  {/* Warm hover wash, tinted by category accent */}
                  <div className={`absolute inset-0 transition-colors duration-700 mix-blend-multiply ${accent.washIdle} ${accent.washHover}`} />

                  {/* Arrow chip */}
                  <div className="absolute top-5 right-5 bg-cream-50/90 backdrop-blur-sm p-3 rounded-full opacity-0 translate-y-3 -translate-x-3 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                    <ArrowUpRight size={18} className="text-dark-900" />
                  </div>
                </div>

                {/* Title & description */}
                <div className="mt-7">
                  <h3 className={`font-display font-bold text-2xl md:text-3xl tracking-[-0.01em] leading-tight text-dark-900 transition-colors duration-500 ${accent.hoverText}`}>
                    {project.title}
                  </h3>
                  <p className="mt-3 text-base md:text-lg text-dark-900/60 font-light leading-relaxed max-w-md">
                    {project.desc}
                  </p>

                  {/* Stack chips */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[10px] tracking-widest uppercase text-dark-900/55 border border-dark-900/15 rounded-full px-3 py-1"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="font-mono text-[10px] tracking-widest text-dark-900/40 px-1 py-1">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
        </AnimatePresence>
      </section>

      <ProjectPreviewModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default FeaturedWorks;
