"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Database, Bot, Palette } from "lucide-react"

type ProficiencyLevel = "Professional" | "Intermediate" | "Learning"

interface Skill {
  name: string
  proficiency: ProficiencyLevel
  years: string
  description: string
}

interface SkillCategory {
  title: string
  icon: typeof Code
  skills: Skill[]
}

const skillCategories: SkillCategory[] = [
  {
    title: "Frontend",
    icon: Palette,
    skills: [
      {
        name: "React.js",
        proficiency: "Professional",
        years: "3+ años",
        description: "Desarrollo de aplicaciones complejas y SPAs modernas"
      },
      {
        name: "Next.js",
        proficiency: "Professional",
        years: "3+ años",
        description: "SSR, SSG, y arquitecturas full-stack con App Router"
      },
      {
        name: "TypeScript",
        proficiency: "Professional",
        years: "2+ años",
        description: "Tipado estricto y sistemas type-safe robustos"
      },
      {
        name: "Tailwind CSS",
        proficiency: "Professional",
        years: "3+ años",
        description: "Diseño responsivo y sistemas de diseño escalables"
      },
      {
        name: "CSS",
        proficiency: "Professional",
        years: "3+ años",
        description: "Animaciones, layouts modernos, y responsive design"
      },
      {
        name: "Astro.build",
        proficiency: "Learning",
        years: "< 1 año",
        description: "Static site generation y content-focused websites"
      },
    ]
  },
  {
    title: "Backend",
    icon: Code,
    skills: [
      {
        name: "Node.js",
        proficiency: "Professional",
        years: "3+ años",
        description: "APIs REST, microservicios, y procesamiento en tiempo real"
      },
      {
        name: "Springboot",
        proficiency: "Intermediate",
        years: "1 año",
        description: "Servicios Java enterprise y arquitectura MVC"
      },
      {
        name: "Next.js API Routes",
        proficiency: "Professional",
        years: "3+ años",
        description: "Serverless functions y backend integration"
      },
    ]
  },
  {
    title: "Bases de Datos",
    icon: Database,
    skills: [
      {
        name: "MongoDB",
        proficiency: "Professional",
        years: "3+ años",
        description: "NoSQL, agregaciones complejas, y modelado de datos"
      },
      {
        name: "PostgreSQL",
        proficiency: "Professional",
        years: "2+ años",
        description: "SQL avanzado, relaciones, y optimización de queries"
      },
      {
        name: "MySQL",
        proficiency: "Professional",
        years: "2+ años",
        description: "Diseño de esquemas y bases de datos relacionales"
      },
      {
        name: "RESTful APIs",
        proficiency: "Professional",
        years: "3+ años",
        description: "Diseño de APIs, autenticación, y documentación"
      },
      {
        name: "Supabase",
        proficiency: "Professional",
        years: "2+ años",
        description: "Backend-as-a-service, auth, y real-time features"
      },
    ]
  },
  {
    title: "IA & Automatización",
    icon: Bot,
    skills: [
      {
        name: "Meta API",
        proficiency: "Intermediate",
        years: "1+ año",
        description: "WhatsApp Business API y automatización de mensajería"
      },
      {
        name: "Twilio API",
        proficiency: "Intermediate",
        years: "1+ año",
        description: "Comunicaciones programables y chatbots"
      },
      {
        name: "OpenAI API",
        proficiency: "Intermediate",
        years: "1+ año",
        description: "Integración de IA generativa en aplicaciones"
      },
      {
        name: "Claude API",
        proficiency: "Intermediate",
        years: "1+ año",
        description: "Asistentes conversacionales y análisis de contenido"
      },
    ]
  }
]

const proficiencyColors: Record<ProficiencyLevel, string> = {
  "Professional": "bg-[#f97316] text-white",
  "Intermediate": "bg-[#fb923c] text-white",
  "Learning": "bg-gray-600 text-white"
}

export function SkillsSectionNew() {
  const [activeCategory, setActiveCategory] = useState(0)

  return (
    <section id="skills" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#f97316] to-[#ea580c] bg-clip-text text-transparent">
            Habilidades Técnicas
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experiencia en programación multi-lenguaje con adopción rápida de tecnologías emergentes y enfoque adaptable a diversos requerimientos de proyectos
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {skillCategories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <button
                key={index}
                onClick={() => setActiveCategory(index)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === index
                    ? "bg-[#f97316] text-white shadow-lg shadow-[#f97316]/25 scale-105"
                    : "bg-white text-black hover:scale-105"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {category.title}
              </button>
            )
          })}
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories[activeCategory].skills.map((skill, index) => (
            <Card
              key={index}
              className="bg-transparent/50 border-gray-800 hover:border-[#f97316]/50 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-white group-hover:text-[#f97316] transition-colors duration-200">
                    {skill.name}
                  </h3>
                  <Badge className={`${proficiencyColors[skill.proficiency]} text-xs font-medium`}>
                    {skill.proficiency}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    📅 {skill.years}
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {skill.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technology Badges */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-[#f97316]">
            Tecnologías Adicionales
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "AWS", "Vercel", "Netlify", "Git", "VS Code", "Webpack", "Vite",
              "Shopify", "Stripe", "MercadoPago", "HubSpot", "Mailchimp", "Meta Business",
              "Google Analytics", "Calendly", "Firebase", "Styled Components", "SCSS"
            ].map((tech, index) => (
              <Badge
                key={index}
                variant="outline"
                className="px-4 py-2 text-sm border-gray-600 text-gray-300 hover:border-[#f97316] hover:text-[#f97316] transition-all duration-200 cursor-default"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
