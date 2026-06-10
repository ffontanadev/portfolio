/**
 * Shared types for the Dev Zone whiteboard.
 *
 * The whiteboard is a free-form canvas of draggable, pinnable widgets. The full
 * layout (which widgets exist, where they sit, their stacking order and pinned
 * state) is serialized to localStorage so a developer's setup survives reloads.
 */

export type WidgetType = 'music' | 'pomodoro' | 'status' | 'note' | 'image';

export interface WidgetInstance {
  /** Unique per instance (multiple status widgets can coexist). */
  id: string;
  type: WidgetType;
  /** Position on the canvas, in px relative to the canvas top-left. */
  x: number;
  y: number;
  /** Stacking order — higher sits on top. */
  z: number;
  /** Pinned (anchored) widgets cannot be dragged until unpinned. */
  pinned: boolean;
  /** Status widgets reference a service from the predefined registry. */
  serviceId?: string;
  /** Note widgets carry their (editable) text content. */
  text?: string;
  /** Image widgets carry their pasted source as a data URL. */
  src?: string;
  /** Render size for image widgets, in world px. */
  width?: number;
  height?: number;
}

export interface DevZoneLayout {
  version: number;
  zCounter: number;
  widgets: WidgetInstance[];
}

/** A 2D point in world (canvas) coordinates. */
export interface Point {
  x: number;
  y: number;
}

/** Active interaction mode for the whiteboard surface. */
export type CanvasTool = 'select' | 'draw' | 'erase';

/** A single freehand pen stroke, captured in world coordinates. */
export interface Stroke {
  id: string;
  color: string;
  width: number;
  points: Point[];
}

/**
 * Persisted whiteboard surface state: the pan offset and zoom of the infinite
 * canvas plus every freehand stroke drawn on it. Kept separate from the widget
 * layout so the two concerns evolve (and version) independently.
 */
export interface WhiteboardState {
  version: number;
  pan: Point;
  /** Canvas zoom factor (1 = 100%). */
  zoom: number;
  strokes: Stroke[];
}
