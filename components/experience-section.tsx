"use client"

import { ExperienceTimeline } from "@/components/experience-timeline"
import type { Experience } from "@/lib/types"

// Sample data - replace with your actual work experience
const experiences: Experience[] = [
  {
    title: "Java Developer - BBVA",
    company: "Magenta Innova",
    startDate: "Marzo 2025",
    endDate: "Presente",
    description: [
      "Realicé procedimientos y revisiones pre-migratorias en gran cantidad de APIs RESTful y Microservicios del banco.",
      "Implementé arquitectura de Testing escalable con JUnit y Mockito, permitiendo un desarrollo de pruebas unitarias más eficiente.",
      "Colaboré en la implementación que permite la apertura de cuentas para empresas unipersonales en la aplicación BBVA Empresas.",
    ],
    technologies: [
      "Java",
      "Springboot",
      "Jenkins",
      "OpenShift",
      "Mockito",
      "PostgreSQL",
    ],
  },
  {
    title: "React Native Developer",
    company: "Magenta Innova",
    startDate: "Julio 2023",
    endDate: "Diciembre 2023",
    description: [
      "Desarrollé una aplicación de banca móvil nativa para iOS y Android, mejorando y facilitando la experiencia de autogestión para los usuarios del banco.",
      "Integré APIs RESTful, WebTokens y WebAuthn para cumplir con estándares de seguridad y dispositivos de autenticación biométrica.",
      "Participé activamente en el desarrollo de la solución, ayudando a establecer buenas prácticas para la solución.",
    ],
    technologies: [
      "React Native",
      "Supabase",
      "React Query",
      "Expo CLI",
      "WebAuthn",
      "KeyPair",
      "Git",
    ],
  },
  {
    title: "Fullstack Developer",
    company: "Magenta Innova",
    startDate: "Agosto 2022",
    endDate: "Junio 2023",
    description: [
      "Construí interfaces de usuario responsivas y accesibles utilizando React y Tailwind CSS.",
      "Optimicé rendimiento web mediante lazy loading, code splitting y otras técnicas avanzadas.",
      "Trabajé en Figma para producir wireframes UX/UI y traducirlos en componentes funcionales.",
    ],
    technologies: [
      "React",
      "TypeScript",
      "HTML5",
      "CSS3",
      "Tailwind CSS",
      "Webpack",
      "Figma",
    ],
  },
]

export function ExperienceSection() {
  return (
    <section className="py-16 px-6 md:px-12 lg:px-24 bg-transparent">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#f97316] to-[#ea580c] bg-clip-text text-transparent">
            Experiencia Profesional
          </h2>
          <p className="text-xl text-gray-400">
            Mi trayectoria en el desarrollo de software
          </p>
        </div>

        {/* Timeline */}
        <ExperienceTimeline experiences={experiences} />
      </div>
    </section>
  )
}
