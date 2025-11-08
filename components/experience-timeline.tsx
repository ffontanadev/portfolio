"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Experience } from "@/lib/types"

interface ExperienceTimelineProps {
  experiences: Experience[]
  className?: string
}

export function ExperienceTimeline({ experiences, className }: ExperienceTimelineProps) {
  return (
    <div className={cn("relative w-full", className)}>
      {/* Timeline vertical line */}
      <div className="absolute left-4 md:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#B13BFF] via-[#B13BFF]/60 to-transparent" />

      <div className="space-y-12">
        {experiences.map((experience, index) => (
          <ExperienceItem
            key={index}
            experience={experience}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

interface ExperienceItemProps {
  experience: Experience
  index: number
}

function ExperienceItem({ experience, index }: ExperienceItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const itemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    )

    if (itemRef.current) {
      observer.observe(itemRef.current)
    }

    return () => {
      if (itemRef.current) {
        observer.unobserve(itemRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={itemRef}
      className={cn(
        "relative pl-12 md:pl-20 transition-all duration-700 ease-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Timeline dot */}
      <div className="absolute left-[11px] md:left-[26px] top-2 w-5 h-5 -translate-x-1/2">
        <div className="relative w-full h-full">
          {/* Pulsing ring */}
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-[#B13BFF] opacity-0 transition-opacity duration-700",
              isVisible && "animate-ping opacity-75"
            )}
          />
          {/* Solid dot */}
          <div className="absolute inset-0 rounded-full bg-[#B13BFF] ring-4 ring-black" />
        </div>
      </div>

      {/* Content card */}
      <div className="group">
        {/* Date range */}
        <div className="mb-2 text-sm font-medium text-[#B13BFF]">
          {experience.startDate} – {experience.endDate}
        </div>

        {/* Title and company */}
        <div className="mb-3">
          <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#B13BFF] transition-colors duration-300">
            {experience.title}
          </h3>
          <p className="text-lg font-medium text-gray-300">
            {experience.company}
          </p>
        </div>

        {/* Description paragraphs */}
        <div className="space-y-3 mb-4">
          {experience.description.map((paragraph, idx) => (
            <p key={idx} className="text-gray-400 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Technologies tags */}
        {experience.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {experience.technologies.map((tech, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className={cn(
                  "border-gray-600 text-gray-300",
                  "hover:border-[#B13BFF] hover:text-[#B13BFF]",
                  "transition-all duration-200",
                  "cursor-default"
                )}
              >
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
