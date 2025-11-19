import { useRouter } from "next/navigation";
import { useState } from "react";
import Tooltip from "./tooltip";
import { Button } from "./ui/button";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";
import { WorldCanvas } from "./three/world-canvas";
import Image from "next/image";

const controlGroups = [
    {
        title: "Movimiento",
        controls: [
            { src: "/w.png", alt: "Move Forward (W)", label: "W" },
            { src: "/a.png", alt: "Move Left (A)", label: "A" },
            { src: "/s.png", alt: "Move Backward (S)", label: "S" },
            { src: "/d.png", alt: "Move Right (D)", label: "D" },
        ],
    },
    {
        title: "Salir",
        controls: [
            { src: "/esc.png", alt: "Unlock mouse (ESC)", label: "ESC" },
        ],
    },
];

const whatsappHref =
    "https://wa.me/59800000000?text=Hola%20Felipe!%20Vengo%20desde%20ffontana.dev%20y%20quiero%20aprovechar%20los%20descuentos%20👋";


export const HeroSection = () => {
    const router = useRouter();
    const [chunkSize, setChunkSize] = useState(16);
    const [viewRadius, setViewRadius] = useState(8);

    const handleClick = (destination: string) => {
        router.push(destination);
    };


    return (
        <section
            id="hero"
            className="relative min-h-[98vh] w-full overflow-hidden border-white/10"
        >
            <div className="pointer-events-none absolute inset-y-0 right-0 w-full md:w-1/2">
                {/* Gradient blur overlay for smooth transition */}
                <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-black via-black/20 to-transparent z-10 pointer-events-none " />

                {/* Allow interactions inside the canvas area only */}
                <div className="pointer-events-auto h-full relative">
                    {/* Runtime Controls for chunk parameters */}
                    <div
                        className="absolute top-12 hidden md:flex  right-6 backdrop-blur-md bg-black/40 px-4 py-3 rounded-lg shadow-lg z-20 text-white min-w-[200px] border border-white/10"
                        aria-label="World parameters"
                    >
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="chunkSize" className="text-xs font-semibold text-gray-200 block mb-1">
                                    Chunk Size: {chunkSize}
                                </label>
                                <input
                                    id="chunkSize"
                                    type="range"
                                    min="8"
                                    max="32"
                                    step="4"
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(Number(e.target.value))}
                                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#B13BFF]"
                                />
                            </div>
                            <div>
                                <label htmlFor="viewRadius" className="text-xs font-semibold text-gray-200 block mb-1">
                                    View Radius: {viewRadius}
                                </label>
                                <input
                                    id="viewRadius"
                                    type="range"
                                    min="2"
                                    max="16"
                                    step="1"
                                    value={viewRadius}
                                    onChange={(e) => setViewRadius(Number(e.target.value))}
                                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#B13BFF]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Overlay with grouped controls */}
                    <div
                        className="
                        absolute bottom-6 left-1/2 transform -translate-x-1/2
                        flex-col sm:flex-row
                        w-[90%] max-w-[500px] hidden md:flex backdrop-blur-md bg-black/40 px-4 py-3 rounded-lg shadow-lg z-20 text-white min-w-[200px] border border-white/10"
                        aria-label="Game controls"
                    >
                        {controlGroups.map((group, groupIdx) => (
                            <div key={groupIdx} className="flex flex-col items-center gap-2 min-w-[250px]">
                                <span className="text-sm font-semibold text-gray-200">{group.title}</span>
                                <div className="flex gap-2 ">
                                    {group.controls.map((icon, iconIdx) => (
                                        <div
                                            key={iconIdx}
                                            className="flex flex-col items-center text-xs"
                                            aria-label={icon.alt}
                                        >
                                            <Image
                                                src={icon.src}
                                                alt={icon.alt}
                                                width={36}
                                                height={36}
                                                className="rounded-2xl"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <WorldCanvas className="absolute inset-0 rounded-l-full hidden md:block" chunkSize={chunkSize} viewRadius={viewRadius} />
                </div>
            </div>

            {/* Text + CTAs */}
            <div className="relative z-10 px-4 pt-28 pb-20">
                <div className="max-w-7xl mx-auto">
                    {/* Professional badge */}
                    <div className="flex items-center gap-2 mb-6">
                        <Badge className="rounded-full bg-white text-black font-semibold hover:bg-white">
                            Desarrollador Full Stack
                        </Badge>
                        <span className="text-sm text-white/70">
                            & Problem Solver!
                        </span>
                    </div>

                    {/* Professional headline */}
                    <div className="max-w-3xl">
                        <h1 className="leading-[0.85] font-bold tracking-tight">
                            <span className="block text-[clamp(40px,7vw,88px)]">
                                Felipe
                            </span>
                            <span className="block text-[clamp(64px,14vw,160px)]">
                                Fontana
                            </span>
                            <span className="block text-[clamp(32px,5vw,64px)] text-white/80">
                                Software Developer
                            </span>
                        </h1>

                        <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl">
                            Flexibilidad, aprendizaje rápido y pragmatismo. Soluciones modernas y eficientes.
                            Mi principal objetivo es el tuyo.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Tooltip content="Explora proyectos interactivos" position="top">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    disabled
                                    onClick={() => handleClick("/showcase")}
                                    className="border-white/30 text-[#B13BFF] hover:bg-white hover:text-black px-8 py-6 rounded-full transition-all duration-300"
                                >
                                    Ver proyectos (to rework)
                                    <Sparkles className="ml-2 h-5 w-5" />
                                </Button>
                            </Tooltip>
                            <a href={whatsappHref} target="_blank" rel="noreferrer">
                                <Button
                                    size="lg"
                                    className="bg-[#B13BFF] hover:bg-white text-black font-semibold px-8 py-6 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-[#B13BFF]/25 hover:scale-105"
                                    aria-label="Contactar por WhatsApp"
                                >
                                    Hablemos
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </a>

                        </div>

                        <div className="mt-5 text-xs text-white/60">
                            * Uruguay • 3+ años de experiencia • <a
                                href="https://www.linkedin.com/in/felipefontana"
                                className="underline hover:text-[#B13BFF]"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Linked.in
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}