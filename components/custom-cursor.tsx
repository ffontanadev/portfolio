import { useEffect, useRef, useState } from "react";

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      const target = e.target as HTMLElement;
      const hovering = target.closest("[data-cursor-hover]") !== null;

      setIsHovering(hovering);
    };

    const updateCursor = () => {
      const { x, y } = mousePosRef.current;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x - 12}px, ${
          y - 12
        }px, 0)`;
      }
      rafRef.current = requestAnimationFrame(updateCursor);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`hidden md:block fixed top-0 left-0 w-7 h-7 pointer-events-none z-50 transition-transform duration-200 ease-out ${
        isHovering ? "scale-150" : "scale-100"
      }`}
    >
      <img
        src="/rocket-cursor.png"
        alt="Spaceship Cursor"
        className={`w-full h-full transition-all duration-300 ${
          isHovering ? "drop-shadow-xl opacity-100" : "opacity-40"
        }`}
      />
    </div>
  );
};

export default CustomCursor;
