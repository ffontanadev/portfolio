import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import ProjectPreviewModal, { type Project } from './ProjectPreviewModal';

const projects: Project[] = [
    {
        title: "Minecraft-like Terrain Generation",
        desc: "Three Voxel World Generation using Perlin noise algorithm in Three.js with 3D First Person Controller",
        color: "bg-blue-50",
        image: "/images/voxel-world-engine.png",
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
        image: "/images/twitter-clone.png",
        techStack: ["Node.js", "Express", "Express Session", "Mongo", "EJS"],
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
];

const FeaturedWorks = () => {
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
            <section id="work" className="py-32 px-6 md:px-20 max-w-[1440px] mx-auto">
                <div className="mb-20">
                    <h2 className="text-sm font-bold tracking-widest uppercase text-coral-500 mb-4">Featured works</h2>
                    <p className="text-2xl md:text-3xl font-display italic text-gray-600">
                        a.k.a., what I've been pouring my soul into these last few years
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-20">
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleProjectClick(project)}
                            className="group cursor-pointer"
                        >
                            {/* Card Image Placeholder */}
                            <div className={`w-full aspect-[4/3] ${project.color} rounded-2xl mb-8 overflow-hidden relative`}>
                                {project.image && (
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover  group-hover:opacity-100 transition-opacity duration-300"
                                        loading="lazy"
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                <div className="absolute top-6 right-6 bg-white p-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <ArrowUpRight size={24} />
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center gap-4 mb-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <span className="bg-gray-100 px-3 py-1 rounded-full">{project.date}</span>
                                <span className="text-coral-500">{project.techStack.slice(0, 2).join(', ')}</span>
                            </div>

                            <h3 className="text-3xl font-display font-bold mb-2 group-hover:text-coral-500 transition-colors">
                                {project.title}
                            </h3>
                            <p className="text-lg text-gray-600">
                                {project.desc}
                            </p>
                        </motion.div>
                    ))}
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

export default FeaturedWorks;
