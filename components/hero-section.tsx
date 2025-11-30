import { useRouter } from "next/navigation";
import Tooltip from "./tooltip";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";

const whatsappHref =
    "https://wa.me/59800000000?text=Hola%20Felipe!%20Vengo%20desde%20ffontana.dev%20y%20quiero%20aprovechar%20los%20descuentos%20👋";

export const HeroSection = () => {
    const router = useRouter();

    const handleClick = (destination: string) => {
        router.push(destination);
    };

    return (
        <section
            id="hero"
            className="relative min-h-[98vh] w-full overflow-hidden"
        >
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