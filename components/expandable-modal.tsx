"use client";

import { Demo } from "@/lib/types";
import { X } from "lucide-react";

type ExpandableModalProps = {
  selectedDemo: Demo | null;
  setSelectedDemo: (demo: Demo | null) => void;
};

const ExpandableModal = ({
  selectedDemo,
  setSelectedDemo,
}: ExpandableModalProps) => {
  if (!selectedDemo) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-4xl h-[80vh] bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-2xl animate-in zoom-in-95 duration-500 ease-out">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div
              className={`hidden md:block w-12 h-12 bg-gradient-to-r ${selectedDemo.gradient} rounded-xl flex items-center justify-center`}
            >
              {selectedDemo.icon}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {selectedDemo.title}
              </h2>
              <p className="text-gray-400 text-sm md:text-base">
                {selectedDemo.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedDemo(null)}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 h-[calc(100%-88px)] overflow-y-auto">
          {selectedDemo.preview}
        </div>
      </div>
    </div>
  );
};

export default ExpandableModal;
