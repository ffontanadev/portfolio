"use client";

import { useEffect, useRef } from "react";

/**
 * Returns a ref { x, y } normalized to [-1, 1], smoothly damped.
 * Doesn't steal pointer events (listens on window), so your buttons still work.
 */
export function useWindowPointer(damping = 0.08) {
  const ref = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      target.current.x = nx;
      target.current.y = -ny; // invert Y for right-handed look
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    const tick = () => {
      ref.current.x += (target.current.x - ref.current.x) * damping;
      ref.current.y += (target.current.y - ref.current.y) * damping;
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [damping]);

  return ref;
}
