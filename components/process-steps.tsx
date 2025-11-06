"use client";

import { useEffect, useRef, useState } from "react";

import {
  ArrowRight,
  Brackets,
  ChartBar,
  CheckCircle,
  Code2,
  Cog,
  Lightbulb,
  Pencil,
  Rocket,
  Sparkles,
  ZoomIn,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { ProcessStepsProps, Theme } from "@/lib/types";

export default function ProcessSteps({
  title,
  steps,
  layout = "horizontal",
  theme = {},
  className = "",
}: ProcessStepsProps) {
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>(
    new Array(steps.length).fill(false)
  );
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  const mergedTheme = { ...defaultTheme, ...theme };

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                setVisibleSteps((prev) => {
                  const newVisible = [...prev];
                  newVisible[index] = true;
                  return newVisible;
                });
              }, index * 150); // Staggered animation
            }
          },
          { threshold: 0.2 }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [steps.length]);

  const getStepIcon = (iconName: keyof typeof iconMap) => {
    const IconComponent = iconMap[iconName] || Sparkles;
    return IconComponent;
  };

  return (
    <section
      ref={sectionRef}
      className={`relative py-16 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="absolute inset-0 bg-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Title */}
        <header className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[#B13BFF] to-[#471396] bg-clip-text text-transparent">
            {title}
          </h2>
          <div
            className="w-24 h-1 mx-auto rounded-full"
            style={{ backgroundColor: mergedTheme.highlight }}
          />
        </header>

        {/* Steps Container */}
        <div
          className={`relative ${
            layout === "horizontal"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 lg:gap-6"
              : "max-w-4xl mx-auto space-y-8 "
          }`}
        >
          {/* Connecting Lines for Horizontal Layout */}
          {layout === "horizontal" && (
            <div className="hidden lg:block absolute inset-0 pointer-events-none">
              {steps.slice(0, -1).map((_, index) => (
                <div
                  key={`connector-${index}`}
                  className="absolute top-1/2 transform -translate-y-1/2 animate-pulse"
                  style={{
                    left: `${
                      ((index + 1) * 100) / steps.length -
                      100 / steps.length / 2
                    }%`,
                    width: `${100 / steps.length}%`,
                    height: "2px",
                    background: `linear-gradient(90deg, ${mergedTheme.secondary}, ${mergedTheme.highlight})`,
                    zIndex: 0,
                  }}
                >
                  <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                </div>
              ))}
            </div>
          )}

          {/* Steps */}
          {steps.map((step, index) => {
            const IconComponent = getStepIcon(step.icon);
            const isVisible = visibleSteps[index];

            return (
              <article
                key={index}
                ref={(el) => (stepRefs.current[index] = el)}
                className={`
                  relative group cursor-pointer transition-all duration-700 transform
                  ${
                    isVisible
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-8 scale-95"
                  }
                  ${
                    layout === "vertical"
                      ? "flex items-start space-x-6"
                      : "text-center"
                  }
                `}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {/* Step Number Badge */}
                <div
                  className={`
                  ${layout === "vertical" ? "flex-shrink-0" : "mx-auto mb-6"}
                  relative z-10
                `}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${mergedTheme.highlight}, ${mergedTheme.secondary})`,
                      boxShadow: `0 8px 32px ${mergedTheme.highlight}40`,
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                    style={{ backgroundColor: mergedTheme.highlight }}
                  />
                </div>

                {/* Card Content */}
                <div
                  className={`
                  ${layout === "vertical" ? "flex-1" : "w-full"}
                  bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-[#B13BFF]/50 
                  group-hover:bg-gray/10 group-hover:border-purple-400/30 
                  transition-all duration-300 group-hover:shadow-2xl
                  group-hover:shadow-purple-500/20
                `}
                >
                  {/* Icon */}
                  <div
                    className={`
                    ${
                      layout === "vertical"
                        ? "mb-4"
                        : "mb-6 flex justify-center"
                    }
                  `}
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${mergedTheme.secondary}40` }}
                    >
                      <IconComponent
                        className="w-6 h-6"
                        style={{ color: mergedTheme.highlight }}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className={`
                      font-bold text-lg mb-3 group-hover:text-purple-300 transition-colors duration-300
                      ${layout === "vertical" ? "text-left" : "text-center"}
                    `}
                    style={{ color: mergedTheme.text }}
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={`
                      text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300
                      ${layout === "vertical" ? "text-left" : "text-center"}
                    `}
                    style={{ color: mergedTheme.text }}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Vertical Layout Connector */}
                {layout === "vertical" && index < steps.length - 1 && (
                  <div
                    className="absolute left-8 top-20 w-0.5 h-16 opacity-50"
                    style={{ backgroundColor: mergedTheme.secondary }}
                  />
                )}
              </article>
            );
          })}
        </div>

        {/* Bottom CTA or additional content area */}
        <footer className="text-center mt-16">
          <Badge className="inline-block px-6 py-2 rounded-2xl text-sm font-medium bg-[#B13BFF]/20 text-[#B13BFF] border-[#B13BFF]/30 mb-4">
            Hemos optimizado este proceso para que sea más eficiente y efectivo,
            asegurando que cada paso esté alineado con tus objetivos de negocio
            🚀😉
          </Badge>
        </footer>
      </div>
    </section>
  );
}

export const iconMap = {
  lightbulb: Lightbulb,
  pencil: Pencil,
  code: Brackets,
  "magnifying-glass": ZoomIn,

  "chart-bar": ChartBar,
  "rocket-launch": Rocket,
  sparkles: Sparkles,
  cog: Cog,
  "check-circle": CheckCircle,
  "arrow-right": ArrowRight,
};

const defaultTheme: Theme = {
  background: "#090040",
  highlight: "#B13BFF",
  secondary: "#471396",
  text: "#ffffff",
  cardBackground: "rgba(71, 19, 150, 0.1)",
};
