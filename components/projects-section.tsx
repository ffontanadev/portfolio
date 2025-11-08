"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Play, Filter, Ban } from "lucide-react"
import Image from "next/image"

const projects = [
  {
    id: 1,
    title: "Three Voxel Engine",
    description: "Motor capaz de crear mundos procedurales usando chunks, ruido perlin y server-side chunk generation",
    image: "/three-voxel-engine.png",
    technologies: ["Next.js", "TypeScript", "Three.js", "Buffers"],
    category: "fullstack",
    demoUrl: "https://three-voxel-engine.vercel.app/",
    githubUrl: "https://github.com/ffontanadev/three-voxel-engine",
    featured: true
  },
  {
    id: 2,
    title: "Hackflix - Pure CSS",
    description: "Aplicación de catálogo de películas desarrollada con React y CSS puro, implementando una interfaz estilo Netflix con componentes reutilizables y diseño responsivo.",
    image: "/hackflix-legacy.png",
    technologies: ["React", "CSS3", "JavaScript", "HTML5", "Responsive Design"],
    category: "frontend",
    demoUrl: "https://hackflix-app.vercel.app",
    githubUrl: "https://github.com/elFonTii/hackflix-app",
    featured: false
  },
  {
    id: 7,
    title: "eBanking - Winterbotham",
    description: "Aplicación de banca multiplataforma para clientes de Winterbotham.",
    image: "/wb-ebanking.png",
    technologies: ["React Native", "TypeScript", "Expo", "WebAuthn"],
    category: "mobile",
    featured: false
  },
]

const categories = [
  { id: "all", name: "Todos", icon: "🎯" },
  { id: "frontend", name: "Frontend", icon: "🎨" },
  { id: "fullstack", name: "Full Stack", icon: "⚡" },
  { id: "ai", name: "IA & Bots", icon: "🤖" },
  { id: "mobile", name: "Móvil", icon: "📱" }
]

export function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [showAll, setShowAll] = useState(false)

  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter(project => project.category === activeCategory)

  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 6)

  return (
    <section id="projects" className="py-20 px-4 bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#B13BFF] to-[#471396] bg-clip-text text-transparent">
            Proyectos Destacados
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Una selección de mis trabajos más recientes y destacados
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${activeCategory === category.id
                ? "bg-[#B13BFF] text-black shadow-lg shadow-[#B13BFF]/25"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-[#B13BFF]"
                }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProjects.map((project, index) => (
            <Card
              key={project.id}
              className={`bg-gray-900/50 border-gray-800 hover:border-[#B13BFF]/50 transition-all duration-300 group overflow-hidden ${project.featured ? "ring-1 ring-[#B13BFF]/20" : ""
                }`}
            >
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={project.image}
                  alt={`${project.title} - Proyecto de desarrollo web`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {project.featured && (
                  <Badge className="absolute top-4 right-4 bg-[#B13BFF] text-black">
                    Destacado
                  </Badge>
                )}

                {/* Overlay with action buttons */}
                {project.demoUrl && project.githubUrl ? (
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <Button
                      size="sm"
                      className="bg-[#B13BFF] hover:bg-[#A4DD00] text-black"
                      onClick={() => window.open(project.demoUrl, '_blank')}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Demo
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white text-[#B13BFF] hover:bg-white hover:text-black"
                      onClick={() => window.open(project.githubUrl, '_blank')}
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Código
                    </Button>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <Button
                      size="sm"
                      className="bg-[#B13BFF] hover:bg-[#A4DD00] text-black"
                      disabled
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Demostración no disponible
                    </Button>
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-[#B13BFF] group-hover:text-white transition-colors duration-200">
                  {project.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs border-[#B13BFF]/30 text-[#B13BFF]"
                    >
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs border-gray-600 text-gray-400"
                    >
                      +{project.technologies.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {project.demoUrl && project.githubUrl ? (
                    <Button
                      size="sm"
                      className="flex-1 bg-[#B13BFF] hover:bg-[#A4DD00] text-black"
                      onClick={() => window.open(project.demoUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver Proyecto
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1 bg-[#B13BFF] hover:bg-[#A4DD00] text-black"
                      disabled
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Demostración no disponible
                    </Button>
                  )}


                </div>

              </CardContent>
            </Card>
          ))}
        </div>

        {/* Show More Button */}
        {filteredProjects.length > 6 && (
          <div className="text-center mt-12">
            <Button
              onClick={() => setShowAll(!showAll)}
              variant="outline"
              className="border-[#B13BFF] text-[#B13BFF] hover:bg-[#B13BFF] hover:text-black px-8 py-3"
            >
              {showAll ? "Ver Menos" : `Ver Todos (${filteredProjects.length})`}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
