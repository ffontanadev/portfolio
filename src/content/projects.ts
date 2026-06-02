import type { Project } from '@/components/projectTypes';

// Featured / flagship work — rendered by FeaturedWorks (the flagship band + the grid).
export const featuredProjects: Project[] = [
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
    leadMetric: { kind: 'wordmark', value: 'EFENGINE', sub: 'my most ambitious project' },
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
        desc: 'Minimal render pipeline: VBO/VAO/ setup, shader compilation, and the first triangle on screen.',
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

// Archive / older work — rendered by OlderWorks.
export const olderProjects: Project[] = [
  {
    title: "Biome Terrain Engine",
    desc: "Procedural generation",
    color: "bg-gradient-to-br from-amber-50 to-stone-100",
    image: "/images/biome-terrain-engine.png",
    techStack: ["Unity", "C Sharp", "Perlin Noise"],
    date: "2021",
    role: "Developer",
    description: `The generator produces biome maps at heightmap resolutions compatible with Unity Terrain (up to 513×513), using optimized two-dimensional data structures to represent both biome distribution and their gradual intensities. The system includes HSV color visualization for debugging and analysis, allowing for the rapid identification of transition zones between biomes.

Key features:

Weighted biome distribution using configurable seed points
Organic propagation algorithm with customizable decay rates
Support for multiple biomes with varying intensities
Generation of intensity maps for smooth transitions
Native integration with Unity Terrain System
Automatic export of biome maps as PNG textures

Ideal for projects requiring procedurally generated worlds with realistic ecosystems and natural transitions between different terrain types.`,
    codeBlocks: [
      {
        language: "csharp",
        label: "Perform Biome Generation",
        code: `if UNITY_EDITOR
    public void RegenerateWorld()
    {
        //Cache the map resolution
        int mapResolution = targetTerrain.terrainData.heightmapResolution;

        Perform_BiomeGeneration(mapResolution);
    }

    void Perform_BiomeGeneration(int mapResolution)
    {
        //Allocate the biome map and strengths
        BiomeMap = new byte[mapResolution, mapResolution];
        BiomeStrengths = new float[mapResolution, mapResolution];

        //Setup the space for the seed points
        int seedPoints = Mathf.RoundToInt(mapResolution * mapResolution * Config.BiomeSeedPointDensity);
        List<byte> BiomesToGenerate = new List<byte>(seedPoints);

        //Populate the biomes to spawn based on weightings
        float totalBiomeWeighting = Config.TotalWeighting;
        for (int biomeIndex = 0; biomeIndex < Config.NumBiomes; biomeIndex++)
        {
            int entries = Mathf.RoundToInt(seedPoints * Config.Biomes[biomeIndex].Weighting / totalBiomeWeighting);
            Debug.Log("Will spawn" + entries + " entries for biome " + Config.Biomes[biomeIndex].Biome.Name);

            for (int entryIndex = 0; entryIndex < entries; entryIndex++)
            {
                BiomesToGenerate.Add((byte)biomeIndex);
            }
        }

        //Spawn the individual biomes
        while (BiomesToGenerate.Count > 0)
        {
            //Pick a random seed point
            int seedPointIndex = Random.Range(0, BiomesToGenerate.Count);

            //Extract the biome index
            byte biomeIndex = BiomesToGenerate[seedPointIndex];

            //Remove the seed point from the list
            BiomesToGenerate.RemoveAt(seedPointIndex);

            Perform_BiomeGeneration(biomeIndex, mapResolution);
        }

        Texture2D biomeMapTexture = new Texture2D(mapResolution, mapResolution, TextureFormat.RGB24, false);
        for(int y  = 0; y < mapResolution; y++)
        {
            for(int x = 0; x < mapResolution; x++)
            {
                float hue = ((float)BiomeMap[x, y] / (float)Config.NumBiomes);

                biomeMapTexture.SetPixel(x, y, Color.HSVToRGB(hue, 0.75f, 0.75f));
            }
        }
        biomeMapTexture.Apply();
        System.IO.File.WriteAllBytes("Assets/ProceduralWorld/BiomeMap.png", biomeMapTexture.EncodeToPNG());
    }

    Vector2Int[] NeighbourOffsets = new Vector2Int[]
    {
        new Vector2Int(0, 1),
        new Vector2Int(0, -1),
        new Vector2Int(1, 0),
        new Vector2Int(-1, 0),
        new Vector2Int(1, 1),
        new Vector2Int(-1, -1),
        new Vector2Int(1, -1),
        new Vector2Int(-1, 1),
    };

    void Perform_BiomeGeneration(byte biomeIndex, int mapResolution)
    {
        //Cache biome configuration
        BiomeConfigSO biomeConfig = Config.Biomes[biomeIndex].Biome;

        //Set the spawn location
        Vector2Int spawnLocation = new Vector2Int(Random.Range(0, mapResolution), Random.Range(0, mapResolution));

        //Get the starting intensity
        float startingIntensity = Random.Range(biomeConfig.minIntensity, biomeConfig.maxIntensity);

        //Setup working list
        Queue<Vector2Int> workingList = new Queue<Vector2Int>();
        workingList.Enqueue(spawnLocation);

        //Setup the visited map and target intensity map
        bool[,] visitedMap = new bool[mapResolution, mapResolution];
        float[,] targetIntensityMap = new float[mapResolution, mapResolution];

        //Set the starting intensity
        targetIntensityMap[spawnLocation.x, spawnLocation.y] = startingIntensity;

        //Oozing begins
        while(workingList.Count > 0 ){
            Vector2Int workingLocation = workingList.Dequeue();

            //Set the biome
            BiomeMap[workingLocation.x, workingLocation.y] = biomeIndex;
            visitedMap[workingLocation.x, workingLocation.y] = true;
            BiomeStrengths[workingLocation.x, workingLocation.y] = targetIntensityMap[workingLocation.x, workingLocation.y];

            //Traverse the neighbours
            for(int neighbourIndex = 0; neighbourIndex < NeighbourOffsets.Length; neighbourIndex++){
                Vector2Int neighbourLocation = workingLocation + NeighbourOffsets[neighbourIndex];

                //skip if invalid
                if(neighbourLocation.x < 0 || neighbourLocation.y < 0 || neighbourLocation.x >= mapResolution || neighbourLocation.y >= mapResolution){
                    continue;
                }

                //skip if already visited
                if(visitedMap[neighbourLocation.x, neighbourLocation.y]){
                    continue;
                }

                //flag as visited
                visitedMap[neighbourLocation.x, neighbourLocation.y] = true;

                //Work out and store neighbour strength
                float neighbourStrength = targetIntensityMap[workingLocation.x, workingLocation.y] - Random.Range(biomeConfig.minDecayRate, biomeConfig.maxDecayRate);
                targetIntensityMap[neighbourLocation.x, neighbourLocation.y] = neighbourStrength;

                //If the strenght is too low, stop.
                if(neighbourStrength < 0){
                    continue;
                }
                workingList.Enqueue(neighbourLocation);
            }
        }
    }
#endif`,
      },
    ],
  },
  {
    title: "Hackflix",
    desc: "Browse for the latest movies easily.",
    color: "bg-gradient-to-br from-stone-50 to-neutral-100",
    image: "/images/hackflix.png",
    techStack: ["React", "TMDb", "CSS3", "Responsive Design", "Vercel"],
    date: "2022",
    role: "Developer",
    description: "A web-based movie catalog platform that replicates the user experience of modern streaming services, developed entirely with React and vanilla CSS without any dependencies on styling frameworks. The project demonstrates mastery of reusable component architecture and advanced CSS techniques to achieve a polished and responsive interface. The application implements a modular component system that includes horizontal carousels, movie cards with hover effects, dynamic navigation, and adaptive layouts that maintain visual consistency across multiple devices and screen resolutions. All styling is managed using pure CSS with modern methodologies such as Flexbox and CSS Grid.",
    codeBlocks: [
      {
        language: "javascript",
        label: "UPI Payment Handler",
        code: `// Process UPI payment request
async function processUPIPayment(paymentDetails) {
    try {
        const { amount, recipientUPI, note } = paymentDetails;

        // Validate UPI ID format
        if (!validateUPIId(recipientUPI)) {
            throw new Error('Invalid UPI ID');
        }

        // Create payment transaction
        const transaction = await Transaction.create({
            sender: req.user.upiId,
            recipient: recipientUPI,
            amount: parseFloat(amount),
            note: note || '',
            status: 'pending',
            timestamp: new Date(),
        });

        // Process through UPI gateway
        const result = await upiGateway.initiatePayment({
            transactionId: transaction._id,
            amount,
            recipientUPI,
        });

        return {
            success: true,
            transactionId: transaction._id,
            status: result.status,
        };
    } catch (error) {
        logger.error('Payment failed:', error);
        throw error;
    }
}`,
      },
    ],
  },
  {
    title: "Truqui",
    desc: "Your one stop book shop",
    color: "bg-gradient-to-br from-warmGray-50 to-stone-100",
    image: "/images/truqui.png",
    techStack: ["React", "Redux", "PWA", "Tailwind", "Vercel"],
    date: "2022",
    role: "Developer",
    description: "A Progressive Web App (PWA) specializing in digital scorekeeping for Truco, the most popular traditional card game in Uruguay and Argentina. Designed to work completely offline, it allows players to keep accurate and efficient score tracking without relying on an internet connection. The app leverages modern PWA capabilities to deliver a native cross-platform experience, installable directly from the browser on mobile devices, tablets, and desktops. Its offline-first architecture guarantees full availability through Service Workers and local storage, ensuring that games are never interrupted by connectivity issues.",
    codeBlocks: [
      {
        language: "javascript",
        label: "Main Game Hook",
        code: `import { useSelector, useDispatch } from "react-redux";
import { addPoint, removePoint, setColor, setDuration, startGame, endGame } from "../redux/slices/gameSlice";

export default function useGameHook() {
    const game = useSelector(state => state.game);
    const dispatch = useDispatch();

    const handleAddPoints = team => {
        dispatch(addPoint({ team }));
    }

    const handleRemovePoints = team => {
        dispatch(removePoint({ team }));
    }

    const handleSetColor = (team, color) => {
        dispatch(setColor({ team, color }));
    }

    const handleSetDuration = duration => {
        dispatch(setDuration({ duration }));
    }

    const handleStartGame = () => {
        dispatch(startGame());
    }

    const handleEndGame = () => {
        dispatch(endGame());
    }

    return { game, handleAddPoints, handleRemovePoints, handleSetColor, handleSetDuration, handleStartGame, handleEndGame };

}}`,
      },
      {
        language: "javascript",
        label: "Game State Management",
        code: `// Redux slice of the game
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    started: false,

    duration: 15,
    team_one: {
        tag: "Nosotros",
        color: "#7BDCB5",
        score: 0,
        isInGood: false,
        bgcolor: "#fff",
    },
    team_two: {
        tag: "Ellos",
        color: "#EB144C",
        score: 0,
        isInGood: false,
        bgcolor: "#fff",
    },
    winner: null,
};

const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        addPoint: (state, action) => {
            const team = state[action.payload.team];
            if (team.score >= 0 && team.score <= state.duration) {
                team.score++;
                if (team.score === state.duration && !team.isInGood) {
                    team.isInGood = true;
                    team.bgcolor = "#DDFFD4";
                    team.score = 0;
                }

                if(team.score === state.duration && team.isInGood){
                    state.winner = action.payload.team;
                }

            }
        },
        removePoint: (state, action) => {
            const team = state[action.payload.team];
            if (team.score > 0 && team.score <= state.duration) {
                team.score--;
                if (team.score === state.duration && !team.isInGood) {
                    team.isInGood = true;
                    team.bgcolor = "#DDFFD4";
                    team.score = 0;
                }

                if(team.score === state.duration && team.isInGood){
                    state.winner = action.payload.team;
                }

            }
        },
        setColor: (state, action) => {
            const { team, color } = action.payload;
            state[team].color = color;
        },
        setDuration: (state, action) => {
            const { duration } = action.payload;
            state.duration = duration;
        },
        startGame: (state) => {
            state.started = true;
        },
        endGame: (state) => {
            state.started = false;
            state.duration = initialState.duration;
            state.team_one.score = 0;
            state.team_two.score = 0;
            state.team_one.color = initialState.team_one.color;
            state.team_two.color = initialState.team_two.color;
            state.team_one.isInGood = false;
            state.team_two.isInGood = false;
            state.team_one.bgcolor = initialState.team_one.bgcolor;
            state.team_two.bgcolor = initialState.team_two.bgcolor;
            state.winner = null;
        }
    },
});

export const { addPoint, removePoint, setColor, setDuration, startGame, endGame } = gameSlice.actions;

export default gameSlice.reducer;`,
      },
    ],
  },
];
