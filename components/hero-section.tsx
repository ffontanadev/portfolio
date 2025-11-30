"use client"

import { useRouter } from "next/navigation";
import Tooltip from "./tooltip";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";
import { StaggerText } from "./animations/stagger-text";
import { ScrollReveal } from "./animations/scroll-reveal";
import { motion } from "framer-motion";

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
            className="relative min-h-[98vh] w-full overflow-hidden bg-gradient-to-br from-black via-mono-gray-900 to-black"
        >
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-20 right-20 w-96 h-96 bg-lime-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-20 left-20 w-72 h-72 bg-lime-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Text + CTAs */}
            <div className="relative z-10 px-4 pt-28 pb-20">
                <div className="max-w-7xl mx-auto">
                    {/* Professional badge */}
                    <ScrollReveal direction="down" delay={0}>
                        <div className="flex items-center gap-2 mb-6">
                            <Badge className="rounded-full bg-lime-500 text-black font-semibold hover:bg-lime-400 transition-colors">
                                Desarrollador Full Stack
                            </Badge>
                            <span className="text-sm text-white/70">
                                & Problem Solver!
                            </span>
                        </div>
                    </ScrollReveal>

                    {/* Professional headline with stagger animation */}
                    <div className="max-w-3xl">
                        <h1 className="leading-[0.85] font-bold tracking-tight mb-6">
                            <motion.span
                                className="block text-[clamp(40px,7vw,88px)] text-white"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Felipe
                            </motion.span>
                            <motion.span
                                className="block text-[clamp(64px,14vw,160px)] bg-gradient-to-r from-lime-500 via-lime-400 to-lime-500 bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                Fontana
                            </motion.span>
                            <motion.span
                                className="block text-[clamp(32px,5vw,64px)] text-white/80"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                            >
                                Software Developer
                            </motion.span>
                        </h1>

                        <StaggerText
                            text="Flexibilidad, aprendizaje rápido y pragmatismo. Soluciones modernas y eficientes. Mi principal objetivo es el tuyo."
                            delay={0.8}
                            staggerType="words"
                            className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl"
                        />

                        <ScrollReveal direction="up" delay={1.2}>
                            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <Tooltip content="Explora proyectos interactivos" position="top">
                                    <Button
                                        size="lg"
                                        variant="lime"
                                        disabled
                                        onClick={() => handleClick("/showcase")}
                                        className="px-8 py-6 rounded-full"
                                    >
                                        Ver proyectos (to rework)
                                        <Sparkles className="ml-2 h-5 w-5" />
                                    </Button>
                                </Tooltip>
                                <a href={whatsappHref} target="_blank" rel="noreferrer">
                                    <Button
                                        size="lg"
                                        variant="limeFilled"
                                        className="px-8 py-6 rounded-full"
                                        aria-label="Contactar por WhatsApp"
                                    >
                                        Hablemos
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </a>
                            </div>
                        </ScrollReveal>

                        <motion.div
                            className="mt-5 text-xs text-white/60"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                        >
                            * Uruguay • 3+ años de experiencia • <a
                                href="https://www.linkedin.com/in/felipefontana"
                                className="underline hover:text-lime-500 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Linked.in
                            </a>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}