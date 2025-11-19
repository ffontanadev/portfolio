"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "María González",
    role: "CEO, TechStart",
    company: "TechStart Solutions",
    image: "/placeholder-user.jpg",
    rating: 5,
    text: "Felipe transformó completamente nuestra presencia digital. Su enfoque en UX/UI y la optimización para conversiones aumentó nuestras ventas en un 150%. Altamente recomendado.",
    project: "E-commerce Platform"
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    role: "Fundador",
    company: "InnovateLab",
    image: "/placeholder-user.jpg",
    rating: 5,
    text: "El chatbot con IA que desarrolló Felipe para nuestro WhatsApp Business automatizó el 80% de nuestras consultas. Excelente trabajo y soporte post-entrega.",
    project: "WhatsApp AI Bot"
  },
  {
    id: 3,
    name: "Ana Martínez",
    role: "Marketing Director",
    company: "GrowthCorp",
    image: "/placeholder-user.jpg",
    rating: 5,
    text: "La landing page que creó Felipe superó todas nuestras expectativas. El diseño es impecable y la tasa de conversión mejoró significativamente desde el primer día.",
    project: "Landing Page"
  },
  {
    id: 4,
    name: "Diego Fernández",
    role: "CTO",
    company: "DataFlow",
    image: "/placeholder-user.jpg",
    rating: 5,
    text: "Felipe demostró gran expertise técnico y creatividad. El dashboard que desarrolló nos ayuda a visualizar nuestros datos de manera clara y efectiva. Trabajo de primera calidad.",
    project: "Analytics Dashboard"
  },
  {
    id: 5,
    name: "Laura Sánchez",
    role: "Gerente General",
    company: "ServicePro",
    image: "/placeholder-user.jpg",
    rating: 5,
    text: "Profesional, puntual y con gran atención al detalle. Felipe entendió perfectamente nuestras necesidades y entregó una solución que superó nuestras expectativas.",
    project: "Booking System"
  }
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  return (
    <section id="testimonials" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#f97316] to-[#ea580c] bg-clip-text text-transparent">
            Lo que dicen mis clientes
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Testimonios reales de clientes satisfechos con mis servicios de desarrollo web y diseño
          </p>
        </div>

        {/* Main Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto mb-12">
          <Card className="bg-gray-900/50 border-gray-800 hover:border-[#f97316]/50 transition-all duration-300">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Client Image */}
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#f97316]/30">
                    <Image
                      src={testimonials[currentIndex].image}
                      alt={`${testimonials[currentIndex].name} - Cliente satisfecho`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Testimonial Content */}
                <div className="flex-1 text-center md:text-left">
                  <Quote className="w-8 h-8 text-[#f97316] mb-4 mx-auto md:mx-0" />
                  
                  <blockquote className="text-lg md:text-xl text-gray-300 mb-6 italic leading-relaxed">
                    "{testimonials[currentIndex].text}"
                  </blockquote>

                  {/* Rating */}
                  <div className="flex justify-center md:justify-start gap-1 mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#f97316] fill-current" />
                    ))}
                  </div>

                  {/* Client Info */}
                  <div>
                    <h4 className="font-semibold text-[#f97316] text-lg">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-gray-400">
                      {testimonials[currentIndex].role} en {testimonials[currentIndex].company}
                    </p>
                    <p className="text-sm text-[#f97316]/70 mt-1">
                      Proyecto: {testimonials[currentIndex].project}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Arrows */}
          <Button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#f97316]/20 hover:bg-[#f97316] text-[#f97316] hover:text-black backdrop-blur-sm"
            aria-label="Testimonio anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#f97316]/20 hover:bg-[#f97316] text-[#f97316] hover:text-black backdrop-blur-sm"
            aria-label="Siguiente testimonio"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-2 mb-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-[#f97316] scale-125"
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
              aria-label={`Ir al testimonio ${index + 1}`}
            />
          ))}
        </div>

        {/* All Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className={`bg-gray-900/30 border-gray-800 hover:border-[#f97316]/50 transition-all duration-300 cursor-pointer ${
                index === currentIndex ? "ring-2 ring-[#f97316]/30" : ""
              }`}
              onClick={() => goToSlide(index)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#f97316] fill-current" />
                  ))}
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-3 italic">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#f97316]/30">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[#f97316] text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
