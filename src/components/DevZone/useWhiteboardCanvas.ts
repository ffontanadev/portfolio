import { useCallback, useEffect, useState } from 'react';
import type { Point, Stroke, WhiteboardState } from './types';

const STORAGE_KEY = 'portfolio.devzone.whiteboard.v1';
const WHITEBOARD_VERSION = 1;

function createDefaultState(): WhiteboardState {
  return { version: WHITEBOARD_VERSION, pan: { x: 0, y: 0 }, strokes: [] };
}

function isPoint(value: unknown): value is Point {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return typeof p.x === 'number' && typeof p.y === 'number';
}

function isStroke(value: unknown): value is Stroke {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    typeof s.color === 'string' &&
    typeof s.width === 'number' &&
    Array.isArray(s.points) &&
    s.points.every(isPoint)
  );
}

function readState(): WhiteboardState {
  if (typeof window === 'undefined') return createDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as Partial<WhiteboardState>;
    if (
      parsed.version !== WHITEBOARD_VERSION ||
      !isPoint(parsed.pan) ||
      !Array.isArray(parsed.strokes) ||
      !parsed.strokes.every(isStroke)
    ) {
      return createDefaultState();
    }
    return { version: WHITEBOARD_VERSION, pan: parsed.pan, strokes: parsed.strokes };
  } catch {
    return createDefaultState();
  }
}

let strokeCounter = 0;
function makeStrokeId(): string {
  strokeCounter += 1;
  return `stroke-${Date.now().toString(36)}-${strokeCounter}`;
}

export interface WhiteboardApi {
  pan: Point;
  strokes: Stroke[];
  setPan: (pan: Point) => void;
  addStroke: (stroke: Omit<Stroke, 'id'>) => void;
  /** Remove any stroke passing within `radius` (world units) of the point. */
  eraseAt: (point: Point, radius: number) => void;
  clearStrokes: () => void;
  resetView: () => void;
}

/**
 * Owns the infinite whiteboard surface — its pan offset and the freehand strokes
 * drawn on it — mirroring every change to localStorage so a developer's sketches
 * and viewport survive reloads. Coordinates are stored in world space (canvas
 * coordinates independent of the current pan).
 */
export function useWhiteboardCanvas(): WhiteboardApi {
  const [state, setState] = useState<WhiteboardState>(readState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be unavailable (private mode / quota) — ignore. */
    }
  }, [state]);

  const setPan = useCallback((pan: Point) => {
    setState((prev) => (prev.pan.x === pan.x && prev.pan.y === pan.y ? prev : { ...prev, pan }));
  }, []);

  const addStroke = useCallback((stroke: Omit<Stroke, 'id'>) => {
    if (stroke.points.length === 0) return;
    setState((prev) => ({
      ...prev,
      strokes: [...prev.strokes, { ...stroke, id: makeStrokeId() }],
    }));
  }, []);

  const eraseAt = useCallback((point: Point, radius: number) => {
    setState((prev) => {
      const next = prev.strokes.filter(
        (stroke) =>
          !stroke.points.some((p) => {
            const dx = p.x - point.x;
            const dy = p.y - point.y;
            return dx * dx + dy * dy <= (radius + stroke.width / 2) ** 2;
          }),
      );
      return next.length === prev.strokes.length ? prev : { ...prev, strokes: next };
    });
  }, []);

  const clearStrokes = useCallback(() => {
    setState((prev) => (prev.strokes.length === 0 ? prev : { ...prev, strokes: [] }));
  }, []);

  const resetView = useCallback(() => {
    setState((prev) => (prev.pan.x === 0 && prev.pan.y === 0 ? prev : { ...prev, pan: { x: 0, y: 0 } }));
  }, []);

  return {
    pan: state.pan,
    strokes: state.strokes,
    setPan,
    addStroke,
    eraseAt,
    clearStrokes,
    resetView,
  };
}

/** Builds a smoothed SVG path (quadratic midpoint smoothing) from stroke points. */
export function strokeToPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    // A single tap renders as a dot via a zero-length segment + round linecap.
    const { x, y } = points[0];
    return `M ${x} ${y} L ${x} ${y}`;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}
