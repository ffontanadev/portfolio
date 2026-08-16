import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import ProjectPreviewModal, { type Project } from './ProjectPreviewModal';
import { useTranslation } from '@/i18n';

// Structural data — non-translatable (visual styling, stacks, code). Display
// text (title/desc/role/description) is merged in from the locale, keyed by `id`.
const projectData = [
    {
        id: "biome",
        color: "bg-gradient-to-br from-amber-50 to-stone-100",
        image: "/images/biome-terrain-engine.webp",
        techStack: ["Unity", "C Sharp", "Perlin Noise"],
        date: "2021",
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
        id: "hackflix",
        color: "bg-gradient-to-br from-stone-50 to-neutral-100",
        image: "/images/hackflix.webp",
        techStack: ["React", "TMDb", "Pure CSS", "Responsive Design", "Vercel"],
        date: "2022",
        demoUrl: "https://hackflix-app.vercel.app",
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
        id: "truqui",
        color: "bg-gradient-to-br from-warmGray-50 to-stone-100",
        image: "/images/truqui.webp",
        techStack: ["React", "Redux", "PWA", "Tailwind v3", "Vercel"],
        date: "2022",
        demoUrl: "https://truqui-app.vercel.app",
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
    {
        id: "threeVoxelEngine",
        color: "bg-gradient-to-br from-slate-50 to-stone-100",
        image: "/images/voxel-world-engine.webp",
        techStack: ["Next.js", "Three.js", "Perlin Noise", "Server-side Chunk Generation", "Real-time Streaming"],
        date: "2025",
        demoUrl: "https://three-voxel-engine.vercel.app",
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
  }`,
            },
        ],
    },
];

const OlderWorks = () => {
    const { t, messages } = useTranslation();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const projects: Project[] = projectData.map((p) => ({
        ...p,
        ...messages.work.older.projects[p.id as keyof typeof messages.work.older.projects],
    }));

    const handleProjectClick = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedProject(null), 200);
    };

    const ease = [0.22, 1, 0.36, 1] as const;

    return (
        <>
            <section className="py-24 md:py-32 bg-cream-50 px-6 md:px-20 relative overflow-hidden">
                {/* Subtle ambient blob */}
                <div
                    aria-hidden="true"
                    className="absolute top-1/2 left-1/4 w-[40rem] h-[40rem] -translate-y-1/2 rounded-full bg-purple-500/4 blur-3xl pointer-events-none"
                />

                <div className="max-w-[1440px] mx-auto relative">
                    <div className="mb-16 max-w-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-eyebrow text-dark-900/55">{t('work.older.eyebrow')}</span>
                            <span className="h-px flex-1 max-w-[120px] bg-dark-900/15" />
                        </div>
                        <h2 className="font-display font-bold text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] tracking-[-0.02em] text-dark-900 leading-tight">
                            {t('work.older.headingBefore')}{' '}
                            <span className="font-display-italic text-dark-900/55" style={{ fontStyle: 'italic' }}>
                                {t('work.older.headingEmphasis')}
                            </span>
                        </h2>
                        <p className="mt-4 text-dark-900/55 font-light leading-relaxed">
                            {t('work.older.description')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {projects.map((project, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ delay: index * 0.08, duration: 0.8, ease }}
                                onClick={() => handleProjectClick(project)}
                                className="group cursor-pointer"
                            >
                                <div className="bg-cream-50 rounded-2xl overflow-hidden border border-dark-900/10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-coral-500/40 group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_60px_-30px_rgba(26,26,26,0.25)]">
                                    <div className={`w-full aspect-[4/3] ${project.color} overflow-hidden relative`}>
                                        {project.image && (
                                            <img
                                                src={project.image}
                                                alt={project.title}
                                                className="w-full h-full object-cover grayscale-[55%] sepia-[15%] contrast-[0.92] opacity-90 group-hover:grayscale-0 group-hover:sepia-0 group-hover:contrast-100 group-hover:opacity-100 transition-all duration-700"
                                                loading="lazy"
                                            />
                                        )}
                                        {/* Date as mono pill */}
                                        <div className="absolute top-3 right-3 backdrop-blur-md bg-cream-50/85 text-dark-900/75 px-3 py-1 rounded-full">
                                            <span className="font-mono text-[10px] tracking-widest">
                                                {project.date}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 border-t border-dark-900/8">
                                        <h3 className="text-lg font-display font-semibold text-dark-900 mb-1 group-hover:text-coral-500 transition-colors duration-500">
                                            {project.title}
                                        </h3>
                                        <p className="text-sm text-dark-900/55 font-light leading-relaxed">
                                            {project.desc}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <span className="flex items-center gap-2 text-dark-900/35 group-hover:text-coral-500 transition-colors duration-500">
                                                <span className="font-mono text-[10px] tracking-widest uppercase">
                                                    {t('work.older.view')}
                                                </span>
                                                <span className="h-px w-6 bg-current transition-all duration-500 group-hover:w-10" />
                                            </span>
                                            {project.demoUrl && (
                                                <a
                                                    href={project.demoUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase text-dark-900/45 hover:text-coral-500 transition-colors duration-300"
                                                >
                                                    {t('work.liveDemo')}
                                                    <ArrowUpRight size={12} aria-hidden="true" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <ProjectPreviewModal
                project={selectedProject}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
};

export default OlderWorks;
