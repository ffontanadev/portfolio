import { useMemo, useState, useRef } from 'react';
import { AnimatePresence, LayoutGroup, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import ProjectPreviewModal, { EnterpriseHero } from './ProjectPreviewModal';
import { accentForCategory, type Project } from './projectTypes';

const ease = [0.22, 1, 0.36, 1] as const;

type Filter = 'all' | 'personal' | 'professional';

const projects: Project[] = [
  {
    title: "EFENGINE — C++ Game Framework",
    desc: "A from-scratch 3D game framework in C++17 on OpenGL 3.3 Core — a library you compile your games against, built to master memory management and the game lifecycle.",
    color: "bg-cream-100",
    techStack: ["C++17", "OpenGL 3.3 Core", "GLFW", "GLAD", "GLM", "Doctest", "CMake"],
    date: "'26 — NOW",
    role: "Engine Author",
    description: `EFENGINE is my most ambitious project: a personal 3D game framework written in C++17 on OpenGL 3.3 Core for Windows. No editor, no native scripting, no multi-platform builds — it is a library you compile your games against, where each game is a C++ project that links against efengine. The goal is mastery of low-level systems: manual memory management, the game lifecycle, and the render pipeline, built up one phase at a time. Documentation is generated with Doxygen and the build is driven by CMake.`,
    codeBlocks: [],
    category: 'personal',
    featured: true,
    leadMetric: { kind: 'wordmark', value: 'EFENGINE', sub: 'game framework' },
    phases: [
      {
        label: 'Fase 0',
        title: 'Setup',
        desc: 'Toolchain, CMake build, project structure, and dependencies wired up (GLFW, GLAD, GLM, Doctest).',
      },
      {
        label: 'Fase 1',
        title: 'Contexto GLFW',
        desc: 'Window and OpenGL 3.3 Core context creation, the basic game loop, and input handling.',
      },
      {
        label: 'Fase 2',
        title: 'Hello Triangle',
        desc: 'Minimal render pipeline: VBO/VAO setup, shader compilation, and the first triangle on screen.',
        current: true,
      },
    ],
  },
  {
    title: "Banco Provincia — Core Services Migration",
    desc: "Lifting Banco Provincia's legacy Axis2 / Java 8 web services into a modern Spring Boot 3 platform on Java 17, with database connectivity rewired from JNDI to a managed MSSQL DataSource.",
    color: "bg-cream-100",
    techStack: ["Java 17", "Spring Boot 3", "Axis2 (legacy)", "MSSQL", "JNDI → DataSource"],
    date: "'25 — NOW",
    role: "Backend Engineer",
    description: `Long-running modernization of legacy Axis2 SOAP services that power core banking integrations at Banco Provincia. The work covers migrating the runtime from Java 8 to Java 17 + Spring Boot 3, replacing JNDI-bound resources with a managed MSSQL DataSource, and untangling years of tightly-coupled web service contracts — all while preserving downstream consumers.`,
    codeBlocks: [],
    category: 'professional',
    company: 'Banco Provincia',
    logo: 'banco-provincia',
    leadMetric: { kind: 'migration', from: 'Axis 2', to: 'Boot' },
    metrics: [
      { label: 'Runtime', value: 'Java 8 → 17' },
      { label: 'Framework', value: 'Axis2 → Spring Boot 3', accent: true },
      { label: 'Persistence', value: 'JNDI → MSSQL DataSource' },
      { label: 'Domain', value: 'Core banking SOAP services' },
      { label: 'Status', value: 'In progress · 2025 →' },
    ],
  },
  {
    title: "BBVA — API Migration & Test Coverage",
    desc: "Migrating BBVA's internal API surface to Spring Boot and engineering high-coverage test suites across more than 50 services — turning fragile internals into a platform that can be refactored without fear.",
    color: "bg-cream-100",
    techStack: ["Java 17", "Spring Boot", "JUnit 5", "Mockito", "Testcontainers"],
    date: "'25",
    role: "Backend Engineer",
    description: `Engaged on BBVA's internal platform to migrate dozens of API services to Spring Boot and stand up disciplined test coverage across the entire surface. Authored unit and integration tests for 50+ internal APIs, raising baseline coverage and protecting future refactors from regression noise.`,
    codeBlocks: [],
    category: 'professional',
    company: 'BBVA',
    logo: 'bbva',
    leadMetric: { kind: 'scale', superscript: 'API²', value: '50+' },
    metrics: [
      { label: 'Scope', value: '50+ internal APIs', accent: true },
      { label: 'Stack', value: 'Spring Boot · Java 17' },
      { label: 'Testing', value: 'JUnit 5 · Mockito · Testcontainers' },
      { label: 'Outcome', value: 'High coverage · Refactor-safe' },
      { label: 'Year', value: '2025' },
    ],
  },
  {
    title: "Minecraft-like Terrain Generation",
    desc: "Three Voxel World Generation using Perlin noise algorithm in Three.js with 3D First Person Controller",
    color: "bg-blue-50",
    category: 'personal',
    leadMetric: { kind: 'wordmark', value: 'Voxel', sub: 'world' },
    techStack: ["Next.js", "Three.js", "Perlin Noise", "Prototyping", "On-demand Buffer Streaming"],
    date: "JAN 25'",
    role: "Developer",
    description: `A sophisticated 3D voxel world renderer with procedural terrain generation, chunk streaming, and first-person controls. Built with Three.js and Next.js.
            Procedural Terrain Generation: Uses Perlin noise for realistic terrain and cave systems
            Infinite World Streaming: Dynamic chunk loading/unloading based on camera position
            First-Person Controls: WASD movement with mouse look and pointer lock
            Optimized Rendering: Instanced rendering for high performance
            Configurable World: Customizable chunk size, terrain parameters, and block types
            Caching System: Server-side chunk caching with deterministic generation`,
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
    title: "Twitter Clone",
    desc: "A functional clone of the old app Twitter with authentication, feed, following and likes!",
    color: "bg-blue-50",
    category: 'personal',
    leadMetric: { kind: 'wordmark', value: 'Twitter', sub: 'clone' },
    techStack: ["Node.js", "Express", "Express Session", "Mongo", "EJS"],
    date: "JUN 23'",
    role: "Backend Developer",
    description: `A Twitter Clone, one of my first collaborative projects!`,
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
    title: "Magenta Hours Collector (MHC-CLI)",
    desc: "A command line application that connects to an email inbox and extract hour reports using AI and search for emails matching the configured criteria and then give the email to Claude Sonnet 4.5 to collect all the relevant information and alert from use",
    color: "bg-blue-50",
    category: 'personal',
    leadMetric: { kind: 'wordmark', value: 'MHC', sub: 'cli' },
    techStack: ["Commander.js", "Google Cloud Platform", "SQLite"],
    date: "AUG 25'",
    role: "Developer",
    description: `A command line application that connects to an email inbox and search for emails matching the configured criteria and then give the email to Claude Sonnet 4.5 to collect all the relevant information and generate monthly reports.`,
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const featuredProject = useMemo(() => projects.find((p) => p.featured) ?? null, []);

  const counts = useMemo(
    () => ({
      all: projects.length,
      personal: projects.filter((p) => (p.category ?? 'personal') === 'personal').length,
      professional: projects.filter((p) => p.category === 'professional').length,
    }),
    [],
  );

  // The flagship renders in its own full-width band; keep it out of the grid to avoid duplication.
  const visibleProjects = useMemo(() => {
    const base = filter === 'all' ? projects : projects.filter((p) => (p.category ?? 'personal') === filter);
    return base.filter((p) => !p.featured);
  }, [filter]);

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
            <span className="text-eyebrow text-coral-500">§ 02 — Selected Work</span>
            <span className="h-px flex-1 max-w-[140px] bg-dark-900/15" />
          </div>
          <h2 className="font-display font-display-md font-bold tracking-[-0.02em] text-4xl md:text-6xl leading-[1.05] max-w-3xl text-dark-900">
            What I've been{' '}
            <span className="font-display-italic text-coral-500" style={{ fontStyle: 'italic' }}>
              pouring my soul
            </span>{' '}
            into.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-dark-900/55 font-light leading-relaxed">
            A small collection of recent experiments, enterprise migrations, and side-quests.
          </p>
        </motion.div>

        {/* Filter tabs — editorial type, coral hairline marks the active category */}
        <LayoutGroup id="featured-works-filter">
          <div
            role="tablist"
            aria-label="Filter projects by category"
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
                    {tab[0].toUpperCase() + tab.slice(1)}
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
                      className="absolute left-0 right-7 -bottom-[21px] h-px bg-coral-500"
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
                § Flagship · C++ Engine
              </span>
              <span className="h-px flex-1 bg-dark-900/10" />
              <span className="font-mono text-[10px] text-dark-900/40 tracking-widest uppercase">
                {featuredProject.date}
              </span>
            </div>

            <div className="relative w-full aspect-[21/9] md:aspect-[3/1] bg-cream-100 border border-teal-700/20 rounded-2xl overflow-hidden soft-lift">
              <EnterpriseHero project={featuredProject} size="modal" />
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
                    {accent.tagLabel}
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
