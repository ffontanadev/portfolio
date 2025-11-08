"use client";
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";
import {
  particlesOptions,
  partners,
} from "@/lib/data";
import { Navigation } from "@/components/navigation";
import { AboutSection } from "@/components/about-section";
import { SkillsSection } from "@/components/skills-section";
import { ExperienceSection } from "@/components/experience-section";
import { ProjectsSection } from "@/components/projects-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { ContactSection } from "@/components/contact-section";
import { HeroSection } from "@/components/hero-section";

export default function FfontanaLanding() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (_container: Container | undefined) => { }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative select-none">
      {/* Navigation */}
      <Navigation />

      {/* Subtle particles behind everything */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          ...particlesOptions,
          particles: {
            ...particlesOptions.particles,
            opacity: { value: 0.15 },
          },
        }}
        className="absolute inset-0 z-0"
      />

      {/* Content */}
      <div className="relative z-20">
        <HeroSection />
        {/* ========== END HERO ========== */}

        {/* Experience Section */}
        <ExperienceSection />

        {/* About Me Section */}
        <AboutSection />

        {/* Skills Section */}
        <SkillsSection />

        {/* Projects Section */}
        <ProjectsSection />

        {/* <TestimonialsSection /> */}

        {/* <ContactSection /> */}

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-gray-800">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-400">© 2024 ffontana.dev - Hecho con ❤️ desde Uruguay</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
