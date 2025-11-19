"use client"

import { useState } from "react"
import { BlogPost } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight } from "lucide-react"

interface BlogStackedCardsProps {
  posts: BlogPost[]
}

export function BlogStackedCards({ posts }: BlogStackedCardsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <>
      {/* Stacked Cards Container */}
      <div className="relative max-w-4xl mx-auto">
        <div className="relative h-[600px] md:h-[500px]">
          {posts.map((post, index) => {
            const isSelected = selectedIndex === index
            const isAbove = selectedIndex !== null && index < selectedIndex
            const isBelow = selectedIndex !== null && index > selectedIndex

            // Calculate stacking offset
            let translateY = index * 20
            let zIndex = posts.length - index
            let opacity = 1 - (index * 0.1)
            let scale = 1 - (index * 0.03)

            if (isSelected) {
              translateY = 0
              zIndex = 1000
              opacity = 1
              scale = 1
            } else if (isAbove) {
              translateY = -100
              opacity = 0.3
            } else if (isBelow) {
              translateY = index * 20 + 80
            }

            return (
              <div
                key={post.slug}
                className={`absolute inset-x-0 top-0 transition-all duration-500 ease-out cursor-pointer ${
                  isSelected ? 'cursor-default' : ''
                }`}
                style={{
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  zIndex,
                  opacity: Math.max(opacity, 0.5),
                }}
                onClick={() => setSelectedIndex(isSelected ? null : index)}
              >
                <div
                  className={`bg-gradient-to-br from-gray-900 to-black border rounded-2xl p-6 md:p-8 shadow-2xl transition-all duration-500 ${
                    isSelected
                      ? 'border-[#f97316] shadow-[#f97316]/20'
                      : 'border-gray-800 hover:border-[#f97316]/50'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-[#f97316] transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.ceil(post.content.split(' ').length / 200)} min lectura
                        </span>
                      </div>
                    </div>
                    {!isSelected && (
                      <ArrowRight className="w-5 h-5 text-[#f97316] flex-shrink-0 ml-4" />
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="outline"
                        className="border-[#f97316]/30 text-[#f97316] text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Description */}
                  <p className={`text-gray-300 leading-relaxed transition-all duration-500 ${
                    isSelected ? 'line-clamp-none' : 'line-clamp-2'
                  }`}>
                    {post.description}
                  </p>

                  {/* Expanded Content Preview */}
                  {isSelected && (
                    <div className="mt-6 pt-6 border-t border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="prose prose-invert prose-orange max-w-none">
                        <p className="text-gray-400 text-sm italic">
                          Haz clic en el artículo para leerlo completo...
                        </p>
                      </div>
                      <button
                        className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-full font-semibold transition-all duration-300 hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Navigate to blog post
                          window.open(`/blog/${post.slug}`, '_blank')
                        }}
                      >
                        Leer artículo completo
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Hint Text */}
        {selectedIndex === null && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 animate-pulse">
              ← Haz clic en una tarjeta para expandirla →
            </p>
          </div>
        )}
      </div>
    </>
  )
}
