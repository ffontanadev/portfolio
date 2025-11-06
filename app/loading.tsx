import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
      <div className="text-white text-2xl">Cargando...</div>
    </div>
  );
}
