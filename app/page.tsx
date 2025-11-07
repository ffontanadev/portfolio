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

        {/* About Me Section */}
        <AboutSection />

        {/* Skills Section */}
        <SkillsSection />

        {/* Projects Section */}
        <ProjectsSection />

        {/* Partners Carousel */}
        <section className="py-16 px-4 bg-gray-900/20">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-12 text-[#B13BFF]">
              Integraciones con las mejores plataformas
            </h3>
            <div className="overflow-hidden">
              <div className="flex animate-scroll">
                {[...partners, ...partners].map((partner, index) => (
                  <div key={index} className="flex-shrink-0 mx-8">
                    <div className="w-32 h-16 bg-gray-800/50 rounded-lg flex items-center justify-center border border-gray-700 hover:border-[#B13BFF]/50 transition-all duration-300">
                      <span className="text-gray-400 font-semibold text-sm">{partner}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        {/* <TestimonialsSection /> */}

        {/* Contact Section */}
        {/* <ContactSection /> */}

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-gray-800">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-400">© 2024 ffontana.dev - Soluciones digitales personalizadas</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
