import { useMemo, useState, useRef } from 'react';
import { AnimatePresence, LayoutGroup, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import ProjectPreviewModal, { EnterpriseHero } from './ProjectPreviewModal';
import LatestCommit from './LatestCommit';
import VideoShowcaseHero from './VideoShowcaseHero';
import { accentForCategory, categoryLabelKey, type Project, type ProjectSystemTier } from './projectTypes';
import { useTranslation } from '@/i18n';

const ease = [0.22, 1, 0.36, 1] as const;

type Filter = 'all' | 'personal' | 'professional';

// Structural data — non-translatable (styling, stacks, dates, code, lead-metric
// glyphs). Display text (title/desc/role/description, metric copy) is merged in
// from the locale inside the component, keyed by `id`.
type ProjectStructural = Omit<Project, 'title' | 'desc' | 'role' | 'description' | 'metrics' | 'migration'> & {
  id: string;
};

// The efengine `systems` locale array is authored in dependency order —
// efecom, renderer, scene, resources, serialization, sandbox — and its length
// is pinned by src/test/localeCard.test.ts. Tiers describe architecture rather
// than copy, so they live here instead of in the locale files.
const EFENGINE_SYSTEM_TIERS: ProjectSystemTier[] = [
  'rhi',
  'runtime',
  'runtime',
  'runtime',
  'runtime',
  'editor',
];

const projectData: ProjectStructural[] = [
  {
    id: 'efengine',
    color: "bg-cream-100",
    techStack: ["C++17", "OpenGL 4.5 Core", "PBR + IBL", "Dear ImGui", "Assimp", "GLFW", "GLM", "doctest", "CMake"],
    date: "'26 — NOW",
    codeBlocks: [],
    category: 'personal',
    featured: true,
    repo: 'elFonTii/efengine',
    demoUrl: 'https://elfontii.github.io/efengine/',
    showcaseVideos: [
      '/videos/efengine/video_01.mp4',
      '/videos/efengine/video_02.mp4',
      '/videos/efengine/video_03.mp4'
    ],
  },
  {
    id: 'bancoProvincia',
    color: "bg-cream-100",
    techStack: ["Java 17", "Spring Boot 3", "Axis2 (legacy)", "MSSQL", "JNDI → DataSource"],
    date: "'25 — NOW",
    codeBlocks: [],
    category: 'professional',
    company: 'Provincia Casa Financiera',
    // The Uruguayan branch of Banco de la Provincia de Buenos Aires — hence the
    // parent bank's wordmark on a card titled with the local entity's name.
    logo: 'banco-provincia',
    leadMetric: { kind: 'migration', from: 'Axis 2', to: 'Boot' },
  },
  {
    id: 'bbva',
    color: "bg-cream-100",
    techStack: ["Java 17", "Spring Boot", "JUnit 5", "Mockito", "Jenkins", "OpenShift", "SonarQube"],
    date: "'25",
    codeBlocks: [],
    category: 'professional',
    company: 'BBVA',
    logo: 'bbva',
    leadMetric: { kind: 'scale', superscript: 'API²', value: '50+' },
  },
  {
    id: 'mobileBanking',
    color: "bg-cream-100",
    techStack: ["React Native", "Expo", "WebAuthn", "Backend for Frontend", "Local Persistence"],
    date: "'23 — '24",
    codeBlocks: [],
    category: 'professional',
    company: 'Winterbotham',
    leadMetric: { kind: 'wordmark', value: 'Native + Expo', sub: 'e-banking application' },
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
        systems: fp.efengine.systems.map((s, i) => ({
          ...s,
          tier: EFENGINE_SYSTEM_TIERS[i] ?? 'runtime',
        })),
      },
      {
        ...byId.bancoProvincia,
        title: fp.bancoProvincia.title,
        desc: fp.bancoProvincia.desc,
        role: fp.bancoProvincia.role,
        description: fp.bancoProvincia.description,
        migration: {
          ...fp.bancoProvincia.migration,
          phases: fp.bancoProvincia.migration.phases.map((ph, i, arr) => ({
            ...ph,
            current: i === arr.length - 1,
          })),
        },
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
        ...byId.mobileBanking,
        title: fp.mobileBanking.title,
        desc: fp.mobileBanking.desc,
        role: fp.mobileBanking.role,
        description: fp.mobileBanking.description,
        metrics: fp.mobileBanking.metrics.map((m, i) => ({ ...m, accent: i === 1 })),
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
          <h2 className="font-display font-display-md font-bold tracking-[-0.02em] text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] leading-[1.05] max-w-3xl text-dark-900">
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
