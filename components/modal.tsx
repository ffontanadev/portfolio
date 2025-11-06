// src/components/Modal/Modal.tsx
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";


const modalTheme = {
    colors: {
      // Gradient inspirado en la pieza
      gradient:
        "linear-gradient(145deg, #5B2DFF 0%, #7B3AF6 40%, #9C4DFF 70%, #B44BE6 100%)",
      primary700: "#5B2DFF",
      primary600: "#7B3AF6",
      primary500: "#9C4DFF",
      surface: "#1A1033",
      overlay: "rgba(6, 10, 25, 0.72)",
      white: "#FFFFFF",
      textOnPrimary: "#FFFFFF",
      textMuted: "rgba(255,255,255,0.82)",
      chipBg: "#FFFFFF",
      chipText: "#12141A",
      bulletDot: "#C9B8FF",
      divider: "rgba(255,255,255,0.12)",
    },
    radii: {
      xl: 28,
      lg: 20,
      md: 14,
      sm: 10,
      pill: 999,
    },
    shadows: {
      xl: "0 30px 100px rgba(65, 7, 168, 0.55)",
      md: "0 10px 30px rgba(75, 0, 130, 0.35)",
      softInner: "inset 0 1px 0 rgba(255,255,255,0.12)",
    },
    spacing(px: number) {
      return `${px}px`;
    },
    fonts: {
      // Montserrat queda impecable con este diseño; fallback a system
      stack:
        "'Montserrat', ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
    },
  };

type ModalProps = {
  open: boolean;
  onClose: () => void;
  "aria-label"?: string;
  children: React.ReactNode;
  width?: number | string;
  maxWidth?: number | string;
  withoutCloseButton?: boolean;
};

const getFocusable = (node: HTMLElement) =>
  node.querySelectorAll<HTMLElement>(
    'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
  );

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  width = 920,
  maxWidth = "96vw",
  withoutCloseButton,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // create container
  if (!containerRef.current && typeof document !== "undefined") {
    containerRef.current = document.createElement("div");
    containerRef.current.setAttribute("data-portal", "modal");
  }

  // mount/unmount portal
  useEffect(() => {
    if (!containerRef.current || typeof document === "undefined") return;
    document.body.appendChild(containerRef.current);
    return () => {
      containerRef.current &&
        document.body.contains(containerRef.current) &&
        document.body.removeChild(containerRef.current);
    };
  }, []);

  // lock scroll + focus management
  useEffect(() => {
    if (!open) return;
    lastFocused.current = (document.activeElement as HTMLElement) ?? null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // focus first focusable
    const to = setTimeout(() => {
      if (contentRef.current) {
        const focusables = getFocusable(contentRef.current);
        (focusables[0] || contentRef.current).focus();
      }
    }, 0);
    return () => {
      clearTimeout(to);
      document.body.style.overflow = originalOverflow;
      lastFocused.current && lastFocused.current.focus?.();
    };
  }, [open]);

  // keyboard handlers
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
    if (e.key === "Tab" && contentRef.current) {
      const focusables = Array.from(getFocusable(contentRef.current));
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (!open || !containerRef.current) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      onKeyDown={onKeyDown}
      {...rest}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        background: modalTheme.colors.overlay,
        padding: modalTheme.spacing(20),
      }}
      onMouseDown={(e) => {
        // close only when clicking backdrop (not the card)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
          borderRadius: modalTheme.radii.xl,
          background: modalTheme.colors.gradient,
          color: modalTheme.colors.textOnPrimary,
          boxShadow: modalTheme.shadows.xl,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {!withoutCloseButton && (
          <button
            aria-label="Cerrar"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 40,
              height: 40,
              borderRadius: modalTheme.radii.pill,
              border: "none",
              background: "rgba(255,255,255,0.14)",
              color: modalTheme.colors.white,
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              backdropFilter: "blur(6px)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, containerRef.current);
};
