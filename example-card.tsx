"use client"

import { ExternalLink, Zap } from "lucide-react"

interface Example {
  id: string
  title: string
  description: string
  thumbnail: string
  category: string
  isInteractive?: boolean
}

interface ExampleCardProps {
  example: Example
  onClick: () => void
}

export function ExampleCard({ example, onClick }: ExampleCardProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
    >
      <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-1 shadow-xl hover:shadow-2xl hover:shadow-[#B13BFF]/20 transition-all duration-300">
        <div className="bg-gradient-to-br from-[#471396]/30 to-[#090040] rounded-[22px] overflow-hidden">
          {/* Thumbnail */}
          <div className="relative h-48 bg-gradient-to-br from-[#B13BFF]/20 to-[#471396]/20 overflow-hidden">
            <img
              src={example.thumbnail || "/placeholder.svg"}
              alt={example.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-[#B13BFF]/90 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                {example.isInteractive ? (
                  <Zap className="w-7 h-7 text-white" />
                ) : (
                  <ExternalLink className="w-6 h-6 text-white" />
                )}
              </div>
            </div>

            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-[#B13BFF]/80 backdrop-blur-sm text-xs font-medium text-white">
                {example.category}
              </span>
            </div>

            {/* Interactive badge */}
            {example.isInteractive && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/80 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  <span className="text-xs font-medium text-white">Live</span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#B13BFF] transition-colors duration-300">
              {example.title}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">{example.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
