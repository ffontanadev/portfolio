"use client"

import { Download, MapPin, Calendar, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useState, useEffect } from "react"

export function AboutSection() {
  // Carousel state and images
  const images = [
    "/ffontana-normal.png",
    "/ffontana-guitar.png",
    "/ffontana-programming.png"
  ]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      )
    }, 3000) // Change image every 3 seconds

    return () => clearInterval(interval)
  }, [images.length])

  const handleDownloadCV = () => {
    // Create a link element and trigger download
    const link = document.createElement('a')
    link.href = '/cv-felipe-fontana.pdf' // You'll need to add your CV file to public folder
    link.download = 'Felipe_Fontana_CV.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section id="about" className="py-20 px-4 bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#B13BFF] to-[#471396] bg-clip-text text-transparent">
            Sobre mí
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Desarrollador apasionado por crear experiencias digitales excepcionales
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Profile Image and Quick Info */}
          <div className="text-center lg:text-left">
            <div className="relative inline-block mb-8">
              <div className="w-64 h-64 mx-auto lg:mx-0 rounded-full bg-gradient-to-br from-[#B13BFF]/20 to-[#471396]/20 border-4 border-[#B13BFF]/30 overflow-hidden relative">
                {images.map((image, index) => (
                  <div
                    key={image}
                    className={`absolute inset-0 transition-all duration-500 ease-in-out ${index === currentImageIndex
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-110'
                      }`}
                  >
                    <Image
                      src={image}
                      alt="Felipe Fontana - Desarrollador Web y UI/UX Designer"
                      width={256}
                      height={256}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Info Cards */}
            <div className="space-y-3 mb-8">
              <div className="group flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg bg-black backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-primary/10">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#B13BFF]">Ubicación</span>
                  <span className="font-semibold text-white/80">Montevideo, Uruguay</span>
                </div>
              </div>

              <div className="group flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg bg-black backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-primary/10">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#B13BFF]">Experiencia</span>
                  <span className="font-semibold text-white/80">+3 años de experiencia</span>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Button */}
            <div className="flex flex-col items-center lg:items-start gap-3">
              <Button
                onClick={handleDownloadCV}
                className="group bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Download className="mr-3 h-5 w-5 group-hover:animate-bounce" />
                Descargar CV
              </Button>
              <p className="text-xs text-muted-foreground text-center lg:text-left opacity-70">
                Disponible en PDF • Actualizado 07/09/2025
              </p>
            </div>
          </div>

          {/* Biography and Details */}
          <div className="space-y-6">
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed mb-6">
                Soy <strong className="text-[#B13BFF]">Felipe Fontana</strong>, un <strong className="text-[#B13BFF]">Desarrollador</strong>
                con base en Uruguay, quien poco a poco ha construido su reputación sobre dos cualidades fundamentales
                que me distinguen en el panorama tecnológico: <strong className="text-[#B13BFF]">flexibilidad</strong> y
                <strong className="text-[#B13BFF]"> capacidad de aprendizaje rápido</strong>.
              </p>

              <p className="text-gray-300 leading-relaxed mb-6">
                Lo que me hace verdaderamente único es mi notable capacidad de <strong className="text-[#B13BFF]">adaptabilidad</strong> a través de las diversas tecnologías.
                A diferencia de los desarrolladores que se especializan en un solo lenguaje o framework, tengo una insaciable curiosidad por comprender <strong className="text-[#B13BFF]">sistemas complejos</strong> y disfruto los <strong className="text-[#B13BFF]">desafíos difíciles</strong>.
                No importa que un proyecto requiera <strong className="text-[#B13BFF]">TypeScript para un frontend React, Java para un backend, o C# para .Net o Unity</strong>,
                transiciono sin problemas entre tecnologías.
              </p>

              <p className="text-gray-300 leading-relaxed mb-6">
                Comencé a programar sin saberlo desde muy pequeño... En la escuela me encantaba hacer juegos usando <strong className="text-[#B13BFF]">Scratch</strong>, construir robots utilizando <strong className="text-[#B13BFF]">LEGO Mindstorms</strong> y configurar mis propios <strong className="text-[#B13BFF]">servidores</strong> de Minecraft utilizando Spigot los cuales logré comercializar.
                Durante mis estudios secundarios tuve la oportunidad de cursar{" "}
                <a
                  href="https://planeamientoeducativo.utu.edu.uy/emt-informatica"
                  className="text-[#B13BFF] underline "
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  EMT Informática
                </a>
                {" "}en dónde aprendí sobre el <strong className="text-[#B13BFF]">diseño de bases de datos</strong>, las bases fundamentales de la <strong className="text-[#B13BFF]">programación</strong> (paradigmas, funciones, conjuntos, compuertas lógicas, circuitos lógicos, recursividad, etc...) y también IoT, programando sistemas con Arduino y Raspberry.
              </p>

              <p className="text-gray-300 leading-relaxed">
                Cuando decides trabajar conmigo, no solo estás contratando un desarrollador, te estás asociando con un
                <strong className="text-[#B13BFF]"> camaleón tecnológico</strong> que puede adaptarse a tus necesidades,
                entender tu negocio, y conectar diferentes sistemas con la <strong className="text-[#B13BFF]">versatilidad</strong> de un verdadero <strong className="text-[#B13BFF]">profesional</strong>.
              </p>
            </div>

            {/* Key Achievements */}
            <div className="grid md:grid-cols-2 gap-4 mt-8">
              {[
                { number: "+3", label: "Años de experiencia" },
                { number: "+15", label: "Proyectos completados" },
              ].map((stat, index) => (
                <div className="flex flex-col items-center lg:items-start">
                  <div
                    className="group w-full bg-primary hover:bg-primary/90 text-white font-semibold px-10 py-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div>
                      <span className="text-3xl font-bold">{stat.number}</span> <br />
                      <span className="text-sm mt-5">{stat.label}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
