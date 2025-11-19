"use client";

import type React from "react";

import { useState, Fragment } from "react";
import { ChevronRight, Hammer } from "lucide-react";
import CustomCursor from "@/components/custom-cursor";
import Sidebar from "@/components/sidebar";
import ChatBot from "@/components/chatbot";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import ExpandableModal from "@/components/expandable-modal";
import { Demo } from "@/lib/types";
import { DottedGridBackground } from "@/components/dotted-grid-background";

export default function DemoShowcase() {
  const [selectedDemo, setSelectedDemo] = useState<Demo | null>(null);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative cursor-none">
      {/* Custom Cursor */}
      <CustomCursor />

      {/* Dotted grid background */}
      <DottedGridBackground />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Grid */}
      {/* TODO: Extract this into a separate component */}
      <div className="md:ml-20 p-8 cursor-none">
        <div className="max-w-7xl mx-auto z-10 relative">
          {/* Header */}
          <div className="mb-12 text-center ">
            <Badge className="bg-[#f97316]/20 text-[#f97316] border-[#f97316]/30 mb-4">
              ffontana.dev
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-[#f97316] to-[#ea580c] bg-clip-text text-transparent">
              Showroom Digital
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explora nuestra colección de demostraciones interactivas donde la
              inteligencia artificial se combina con diseños web modernos y
              funcionales. Pon a prueba chatbots conversacionales, interfaces
              inteligentes y experiencias digitales que marcan tendencia.
            </p>
          </div>

          {/* Demo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {demos.map((demo) => (
              <div
                data-cursor-hover
                key={demo.id}
                className="group relative bg-gray-800/30 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] sm:hover:scale-105"
                onClick={() => setSelectedDemo(demo)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  {/* Icono grande con responsive padding */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${demo.gradient} rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {demo.icon}
                  </div>

                  {/* Título */}
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 text-white group-hover:text-purple-300 transition-colors">
                    {demo.title}
                  </h3>

                  {/* Descripción */}
                  <p className="text-sm sm:text-base text-gray-400 mb-5 sm:mb-6 leading-relaxed">
                    {demo.description}
                  </p>

                  {/* Etiqueta + Botón */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
                    <span
                      className={`w-fit px-3 py-1 rounded-full text-sm font-semibold tracking-tight 
          ${
            demo.type === "chatbot"
              ? "bg-purple-600/20 text-purple-300"
              : "bg-blue-600/20 text-blue-300"
          }`}
                    >
                      {demo.type === "chatbot" ? "Chatbot" : "Landing Page"}
                    </span>

                    <button className=" cursor-none w-full sm:w-auto bg-gradient-to-r from-purple-600 to-violet-600 text-white px-5 py-2 rounded-full hover:scale-[1.03] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                      <span className="text-sm font-medium">Iniciar demo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Modals */}
      {selectedDemo && (
        <ExpandableModal
          selectedDemo={selectedDemo}
          setSelectedDemo={setSelectedDemo}
        />
      )}
    </div>
  );
}

const demos: Demo[] = [
  {
    id: "ai-assistant",
    title: "Dara | Atención al Cliente",
    description:
      "Asistente virtual entrenada y capacitada para atención al cliente",
    icon: (
      <Image
        src="/dara-avatar.png"
        alt="Avatar de Dara"
        width={48}
        height={48}
        className="rounded-full object-cover"
      />
    ),
    type: "chatbot",
    gradient: "from-purple-600 via-violet-600 to-indigo-600",
    preview: <ChatBot />,
  },
  {
    id: "customer-support",
    title: "EN CONSTRUCCIÓN",
    description: "Automated customer service with smart ticket routing",
    icon: <Hammer className="w-6 h-6" />,
    type: "chatbot",
    gradient: "from-pink-500 via-purple-500 to-violet-600",
    preview: <Fragment />,
  },
  {
    id: "saas-landing",
    title: "EN CONSTRUCCIÓN",
    description: "Modern landing page with conversion optimization",
    icon: <Hammer className="w-6 h-6" />,
    type: "landing",
    gradient: "from-blue-600 via-purple-600 to-pink-600",
    preview: <Fragment />,
  },
  {
    id: "portfolio-site",
    title: "EN CONSTRUCCIÓN",
    description: "Creative portfolio with interactive animations",
    icon: <Hammer className="w-6 h-6" />,
    type: "landing",
    gradient: "from-purple-600 via-indigo-600 to-pink-600",
    preview: <Fragment />,
  },
];
