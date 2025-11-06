"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Mail, MapPin, Phone, Send, Calendar } from "lucide-react"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData)
    
    // Reset form
    setFormData({ name: "", email: "", subject: "", message: "" })
    setIsSubmitting(false)
    
    // Show success message (you could use a toast library)
    alert("¡Mensaje enviado correctamente! Te contactaré pronto.")
  }

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("¡Hola Felipe! Me interesa conocer más sobre tus servicios de desarrollo web.")
    const whatsappUrl = `https://wa.me/59899123456?text=${message}` // Replace with your actual WhatsApp number
    window.open(whatsappUrl, '_blank')
  }

  const handleEmailContact = () => {
    const subject = encodeURIComponent("Consulta sobre servicios de desarrollo web")
    const body = encodeURIComponent("Hola Felipe,\n\nMe interesa conocer más sobre tus servicios. Me gustaría agendar una reunión para discutir mi proyecto.\n\nSaludos!")
    window.open(`mailto:felipe@ffontana.dev?subject=${subject}&body=${body}`)
  }

  return (
    <section id="contact" className="py-20 px-4 bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#B13BFF] to-[#471396] bg-clip-text text-transparent">
            Hablemos de tu proyecto
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            ¿Tienes una idea? ¡Hagámosla realidad juntos! Contacta conmigo y empecemos a trabajar en tu próximo proyecto digital.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-[#B13BFF] mb-6">
                Información de contacto
              </h3>
              <p className="text-gray-300 mb-8">
                Estoy disponible para nuevos proyectos y colaboraciones. No dudes en contactarme por cualquiera de estos medios.
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800 hover:border-[#B13BFF]/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#B13BFF]/20 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-[#B13BFF]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">WhatsApp</h4>
                      <p className="text-gray-400 text-sm mb-2">Respuesta inmediata</p>
                      <Button
                        onClick={handleWhatsAppContact}
                        className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                      >
                        Enviar mensaje
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover:border-[#B13BFF]/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#B13BFF]/20 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-[#B13BFF]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">Email</h4>
                      <p className="text-gray-400 text-sm mb-2">felipe@ffontana.dev</p>
                      <Button
                        onClick={handleEmailContact}
                        variant="outline"
                        className="border-[#B13BFF] text-[#B13BFF] hover:bg-[#B13BFF] hover:text-black"
                      >
                        Enviar email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover:border-[#B13BFF]/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#B13BFF]/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[#B13BFF]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">Reunión Virtual</h4>
                      <p className="text-gray-400 text-sm mb-2">Agenda una videollamada</p>
                      <Button
                        variant="outline"
                        className="border-[#B13BFF] text-[#B13BFF] hover:bg-[#B13BFF] hover:text-black"
                      >
                        Agendar reunión
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-[#B13BFF]" />
                <span>Montevideo, Uruguay (GMT-3)</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-[#B13BFF]" />
                <span>Disponible Lun-Vie 9:00-18:00</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#B13BFF]">Envía un mensaje</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-[#B13BFF] focus:ring-[#B13BFF]"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-[#B13BFF] focus:ring-[#B13BFF]"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Asunto *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-[#B13BFF] focus:ring-[#B13BFF]"
                    placeholder="¿En qué te puedo ayudar?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Mensaje *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-[#B13BFF] focus:ring-[#B13BFF] resize-none"
                    placeholder="Cuéntame sobre tu proyecto, objetivos, timeline y presupuesto aproximado..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#B13BFF] hover:bg-[#A4DD00] text-black font-semibold py-3 transition-all duration-300 hover:shadow-lg hover:shadow-[#B13BFF]/25"
                >
                  {isSubmitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Enviar mensaje
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
