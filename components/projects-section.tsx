"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Play, Ban } from "lucide-react"
import Image from "next/image"
import { ScrollReveal, ScrollRevealList } from "./animations/scroll-reveal"
import { motion } from "framer-motion"

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
    featured: true,
    client: "Personal Project",
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
    featured: false,
    client: "Hack Academy",
  },
  {
    id: 7,
    title: "eBanking - Winterbotham",
    description: "Aplicación de banca multiplataforma para clientes de Winterbotham.",
    image: "/wb-ebanking.png",
    technologies: ["React Native", "TypeScript", "Expo", "WebAuthn"],
    category: "mobile",
    featured: false,
    client: "Winterbotham Trust",
  },
]

const categories = [
  { id: "all", name: "Todos" },
  { id: "frontend", name: "Frontend" },
  { id: "fullstack", name: "Full Stack" },
  { id: "ai", name: "IA & Bots" },
  { id: "mobile", name: "Móvil" }
]

export function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [showAll, setShowAll] = useState(false)

  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter(project => project.category === activeCategory)

  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 6)

  return (
    <section id="projects" className="py-20 px-4 bg-gradient-to-b from-black via-mono-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-lime-500 to-lime-400 bg-clip-text text-transparent">
              Proyectos Destacados
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Una selección de mis trabajos más recientes y destacados
            </p>
          </div>
        </ScrollReveal>

        {/* Category Filter */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeCategory === category.id
                  ? "bg-lime-500 text-black shadow-lg shadow-lime-500/25"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-lime-500 border border-gray-700"
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </ScrollReveal>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProjects.map((project, index) => (
            <ScrollReveal key={project.id} delay={index * 0.1}>
              <Card
                className={`bg-mono-gray-900 border-gray-800 hover:border-lime-500/50 transition-all duration-500 group overflow-hidden ${project.featured ? "ring-2 ring-lime-500/20" : ""
                  }`}
              >
                {/* Project Image - 16:9 Aspect Ratio */}
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={project.image}
                    alt={`${project.title} - Proyecto de desarrollo web`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                  {/* Featured Badge */}
                  {project.featured && (
                    <Badge className="absolute top-4 right-4 bg-lime-500 text-black font-semibold backdrop-blur-md">
                      Destacado
                    </Badge>
                  )}

                  {/* Client Badge */}
                  {project.client && (
                    <Badge className="absolute top-4 left-4 bg-black/60 text-lime-500 border border-lime-500/30 backdrop-blur-md">
                      {project.client}
                    </Badge>
                  )}

                  {/* Hover Overlay with Actions */}
                  <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    {project.demoUrl && (
                      <Button
                        size="sm"
                        variant="limeFilled"
                        onClick={() => window.open(project.demoUrl, '_blank')}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Demo
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button
                        size="sm"
                        variant="lime"
                        onClick={() => window.open(project.githubUrl, '_blank')}
                      >
                        <Github className="w-4 h-4 mr-2" />
                        Código
                      </Button>
                    )}
                    {!project.demoUrl && !project.githubUrl && (
                      <Button size="sm" variant="ghost" disabled className="text-gray-400">
                        <Ban className="w-4 h-4 mr-2" />
                        No disponible
                      </Button>
                    )}
                  </div>
                </div>

              <CardHeader>
                <CardTitle className="text-lime-500 group-hover:text-lime-400 transition-colors duration-200">
                  {project.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs border-lime-500/30 text-lime-500"
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
              </CardContent>
            </Card>
          </ScrollReveal>
          ))}
        </div>

        {/* Show More Button */}
        {filteredProjects.length > 6 && (
          <ScrollReveal direction="up" delay={0.3}>
            <div className="text-center mt-12">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="lime"
                size="lg"
                className="px-8 py-3"
              >
                {showAll ? "Ver Menos" : `Ver Todos (${filteredProjects.length})`}
              </Button>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}
