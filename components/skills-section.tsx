"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const skillCategories = [
  {
    title: "Frontend",
    icon: "🎨",
    skills: [
      { name: "React.js", level: 90, color: "#61DAFB" },
      { name: "Next.js", level: 90, color: "#000000" },
      { name: "TypeScript", level: 85, color: "#3178C6" },
      { name: "Tailwind CSS", level: 95, color: "#06B6D4" },
      { name: "CSS", level: 80, color: "#F7DF1E" },
      { name: "Astro.build", level: 25, color: "#4FC08D" },
    ]
  },
  {
    title: "Backend",
    icon: "⚙️",
    skills: [
      { name: "Node.js", level: 80, color: "#339933" },
      { name: "Springboot", level: 50, color: "#3776AB" },
      { name: "Next.js", level: 90, color: "#777BB4" },
    ]
  },
  {
    title: "Bases de Datos",
    icon: "🗄️",
    skills: [
      { name: "MongoDB", level: 90, color: "#47A248" },
      { name: "PostgreSQL", level: 80, color: "#336791" },
      { name: "MySQL", level: 80, color: "#4479A1" },
      { name: "RESTful", level: 85, color: "#FF6B35" },
      { name: "Supabase", level: 85, color: "#E10098" },
    ]
  },
  {
    title: "IA & Automatización",
    icon: "🤖",
    skills: [
      { name: "Meta API", level: 50, color: "#25D366" },
      { name: "Twilio API", level: 50, color: "#FF4A00" },
      { name: "OpenAI API", level: 50, color: "#412991" },
      { name: "Claude API", level: 60, color: "#412991" },

    ]
  }
]

export function SkillsSection() {
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
          {skillCategories.map((category, index) => (
            <button
              key={index}
              onClick={() => setActiveCategory(index)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === index
                  ? "bg-[#f97316] text-white shadow-lg shadow-[#f97316]/25 scale-105"
                  : "bg-white text-black hover:scale-105"
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.title}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories[activeCategory].skills.map((skill, index) => (
            <Card
              key={index}
              className="bg-transparent/50 border-gray-800 hover:border-[#f97316]/50 transition-all duration-1000 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white group-hover:text-[#f97316] transition-colors duration-200">
                    {skill.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-[#f97316]/30 text-[#f97316]"
                  >
                    {skill.level}%
                  </Badge>
                </div>
                <Progress 
                  value={skill.level} 
                  className="h-2 bg-gray-800"
                />
                <div className="mt-2 text-right">
                  <span className="text-xs text-gray-400">
                    Nivel de competencia
                  </span>
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
