"use client"

import { useCallback } from "react"
import Particles from "react-tsparticles"
import { loadSlim } from "tsparticles-slim"
import type { Container, Engine } from "tsparticles-engine"

const improvedParticlesOptions = {
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 120,
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: "push",
      },
      onHover: {
        enable: true,
        mode: "repulse",
      },
      resize: true,
    },
    modes: {
      push: {
        quantity: 4,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: "#B13BFF",
    },
    links: {
      color: "#B13BFF",
      distance: 150,
      enable: true,
      opacity: 0.2, // Reduced for better readability
      width: 1,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: {
        default: "bounce",
      },
      random: false,
      speed: 1, // Slower movement
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 1200, // Increased area for fewer particles
      },
      value: 60, // Reduced number of particles
    },
    opacity: {
      value: 0.3, // Reduced opacity for better contrast
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 3 },
    },
  },
  detectRetina: true,
}

export function ImprovedBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  const particlesLoaded = useCallback(
    async (container: Container | undefined) => {},
    []
  )

  return (
    <>
      {/* Improved particles background */}
      <Particles
        id="improved-particles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={improvedParticlesOptions}
        className="absolute inset-0 z-0"
      />
      
      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-5" />
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-10 z-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  )
}
