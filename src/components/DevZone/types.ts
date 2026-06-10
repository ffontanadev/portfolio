/**
 * Shared types for the Dev Zone whiteboard.
 *
 * The whiteboard is a free-form canvas of draggable, pinnable widgets. The full
 * layout (which widgets exist, where they sit, their stacking order and pinned
 * state) is serialized to localStorage so a developer's setup survives reloads.
 */

export type WidgetType = 'music' | 'pomodoro' | 'status';

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
}

export interface DevZoneLayout {
  version: number;
  zCounter: number;
  widgets: WidgetInstance[];
}
