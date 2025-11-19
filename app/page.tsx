"use client";
import { Navigation } from "@/components/navigation";
import { AboutSection } from "@/components/about-section";
import { SkillsSectionNew } from "@/components/skills-section-new";
import { ExperienceSection } from "@/components/experience-section";
import { ProjectsSection } from "@/components/projects-section";
import { HeroSection } from "@/components/hero-section";
import { DottedGridBackground } from "@/components/dotted-grid-background";

export default function FfontanaLanding() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative select-none">
      {/* Navigation */}
      <Navigation />

      {/* Dotted grid background */}
      <DottedGridBackground />

      {/* Content */}
      <div className="relative z-20">
        <HeroSection />
        {/* ========== END HERO ========== */}

        {/* Experience Section */}
        <ExperienceSection />

        {/* About Me Section */}
        <AboutSection />

        {/* Skills Section */}
        <SkillsSectionNew />

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
