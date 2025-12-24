import { useState } from 'react';
import { motion } from 'framer-motion';
import ProjectPreviewModal, { type Project } from './ProjectPreviewModal';



const projects: Project[] = [
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

const OlderWorks = () => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            <section className="py-20 bg-gray-50 px-6 md:px-20">
                <div className="max-w-[1440px] mx-auto">
                    <div className="mb-12">
                        <h2 className="text-2xl font-display font-bold mb-2">Older works</h2>
                        <p className="text-gray-500 max-w-xl">
                            These pieces are relics of my developing journey – still dear to my heart, but not the main event anymore.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {projects.map((project, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleProjectClick(project)}
                                className="group cursor-pointer"
                            >
                                <div className="bg-white rounded-2xl overflow-hidden border-2 border-stone-200 transition-all duration-300 group-hover:border-stone-400 group-hover:shadow-xl">
                                    <div
                                        className={`w-full aspect-4/3 ${project.color} overflow-hidden relative`}
                                    >
                                        {project.image && (
                                            <img
                                                src={project.image}
                                                alt={project.title}
                                                className="w-full h-full object-cover grayscale-60 sepia-20 contrast-[0.9] opacity-90 group-hover:opacity-75 transition-all duration-300"
                                                loading="lazy"
                                            />
                                        )}
                                        {/* Year badge in corner */}
                                        <div className="absolute top-3 right-3 bg-stone-800/80 backdrop-blur-sm text-stone-100 px-3 py-1 rounded text-sm font-medium">
                                            {project.date}
                                        </div>
                                    </div>
                                    {/* Always visible title at bottom */}
                                    <div className="p-4 bg-linear-to-b from-stone-50 to-amber-50/30 border-t border-stone-200">
                                        <h3 className="text-lg font-display font-semibold text-stone-800 mb-1">
                                            {project.title}
                                        </h3>
                                        <p className="text-sm text-stone-600">
                                            {project.desc}
                                        </p>
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
