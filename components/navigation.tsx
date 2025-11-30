"use client"

import { useState, useEffect } from "react"
import { Menu, X, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { motion, AnimatePresence } from "framer-motion"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { offCanvasMenu, getTransition } from "@/lib/animations"

const navItems = [
  { name: "Inicio", href: "#hero" },
  { name: "Sobre mí", href: "#about" },
  { name: "Habilidades", href: "#skills" },
  { name: "Proyectos", href: "#projects" },
  { name: "Testimonios", href: "#testimonials" },
  { name: "Servicios", href: "#services" },
  { name: "Contacto", href: "#contact" },
]

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)
      setShowScrollTop(scrollPosition > 500)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" })
      setIsMenuOpen(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })
  }

  // Container variant for staggered menu items
  const menuContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: offCanvasMenu.stagger,
        delayChildren: offCanvasMenu.itemDelay,
      },
    },
  }

  // Individual menu item variants
  const menuItemVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: getTransition('fast', 'smooth'),
        },
      }

  return (
    <>
      {/* Navigation Header */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black/90 backdrop-blur-md border-b border-white/10"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={getTransition('medium', 'smooth')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => scrollToSection("#hero")}
                className="text-xl font-bold bg-gradient-to-r from-lime-500 to-lime-400 bg-clip-text text-transparent hover:from-lime-400 hover:to-lime-300 transition-all duration-300"
              >
                ffontana.dev
              </button>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="ml-10 flex items-baseline space-x-1">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    className="relative text-gray-300 hover:text-lime-500 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 group"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={getTransition('fast', 'smooth', index * 0.05)}
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-lime-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Mobile menu button with Sheet */}
            <div className="lg:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-300 hover:text-lime-500 hover:bg-white/5"
                    aria-label="Toggle menu"
                  >
                    <AnimatePresence mode="wait">
                      {isMenuOpen ? (
                        <motion.div
                          key="close"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <X className="h-6 w-6" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="open"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Menu className="h-6 w-6" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="top"
                  className="bg-black/95 backdrop-blur-xl border-b border-lime-500/20 pt-20"
                >
                  <motion.div
                    className="flex flex-col space-y-4"
                    variants={menuContainerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {navItems.map((item) => (
                      <motion.button
                        key={item.name}
                        onClick={() => scrollToSection(item.href)}
                        className="text-left text-2xl font-bold text-gray-300 hover:text-lime-500 py-3 px-4 rounded-lg transition-all duration-300 hover:bg-white/5 hover:pl-6"
                        variants={menuItemVariants}
                      >
                        {item.name}
                      </motion.button>
                    ))}
                  </motion.div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Button
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full bg-lime-500 hover:bg-lime-400 text-black shadow-lg hover:shadow-lime-500/50 transition-all duration-300"
              aria-label="Scroll to top"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
