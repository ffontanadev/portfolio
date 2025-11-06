import {
  ChevronLeft,
  Globe,
  Home,
  Layout,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { Fragment, useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const sidebarItems = [
    {
      icon: <Home className="w-6 h-6" />,
      label: "No disponible",
      active: true,
    },
    { icon: <MessageCircle className="w-6 h-6" />, label: "No disponible" },
    { icon: <Layout className="w-6 h-6" />, label: "No disponible" },
    { icon: <Globe className="w-6 h-6" />, label: "No disponible" },
  ];

  const handleClick = (destination: string) => {
    router.push(destination);
  };

  return (
    <div className="hidden md:block fixed left-0 top-0 h-full w-20 bg-black/20 backdrop-blur-xl border-r border-purple-500/20 z-40">
      <div className="flex flex-col items-center py-8 space-y-6 h-full">
        <FFBack onClick={() => handleClick("/")} />

        {sidebarItems.map((item, index) => (
          <button
            data-cursor-hover
            key={index}
            className={`w-12 h-12 rounded-xl flex items-center cursor-none justify-center transition-all duration-300 hover:scale-110 group opacity-75${
              item.active
                ? "bg-gradient-to-r from-purple-600 to-violet-600 shadow-lg shadow-purple-500/25"
                : "bg-gray-800/50 hover:bg-gray-700/50"
            }`}
          >
            {item.icon}
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-none whitespace-nowrap">
              {item.label}
            </div>
          </button>
        ))}
        <div className="flex-grow" />
        <button
          data-cursor-hover
          className="w-12 h-12 mb-4 rounded-xl flex items-center justify-center cursor-none bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-110"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Home
            className="w-6 h-6 text-white"
            onClick={() => handleClick("/")}
          />
        </button>
      </div>
    </div>
  );
}

export function FFBack({ onClick }: { onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      data-cursor-hover
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-[#B13BFF] font-bold"
    >
      <div className="transition-transform duration-200 ease-in-out ">
        {hovered ? (
          <ChevronLeft className="w-4 h-4 mb-0.5" />
        ) : (
          <div className="w-4 h-4 mb-0.5" />
        )}
      </div>
      ff.dev
    </div>
  );
}
