import { useCallback, useEffect, useState } from 'react';
import type { DevZoneLayout, WidgetInstance, WidgetType } from './types';

const STORAGE_KEY = 'portfolio.devzone.layout.v1';
const LAYOUT_VERSION = 1;

/**
 * Sensible starting board for first-time visitors. On narrow (phone) viewports
 * the three default widgets stack in a single readable column instead of running
 * off the right edge; on wider screens they sit side by side.
 */
function createDefaultLayout(): DevZoneLayout {
  const isNarrow = typeof window !== 'undefined' && window.innerWidth < 768;
  const centerX = isNarrow ? Math.max(8, (typeof window !== 'undefined' ? window.innerWidth : 375) - 336) / 2 : 32;
  const [music, pomodoro, status] = isNarrow
    ? [
        { x: centerX, y: 100 },
        { x: centerX, y: 330 },
        { x: centerX, y: 560 },
      ]
    : [
        { x: 32, y: 120 },
        { x: 372, y: 120 },
        { x: 712, y: 120 },
      ];
  return {
    version: LAYOUT_VERSION,
    zCounter: 3,
    widgets: [
      { id: 'music-default', type: 'music', ...music, z: 1, pinned: false },
      { id: 'pomodoro-default', type: 'pomodoro', ...pomodoro, z: 2, pinned: false },
      {
        id: 'status-anthropic-default',
        type: 'status',
        serviceId: 'anthropic',
        ...status,
        z: 3,
        pinned: false,
      },
    ],
  };
}

const WIDGET_TYPES: WidgetType[] = ['music', 'pomodoro', 'status', 'note', 'image'];

function isWidgetInstance(value: unknown): value is WidgetInstance {
  if (typeof value !== 'object' || value === null) return false;
  const w = value as Record<string, unknown>;
  return (
    typeof w.id === 'string' &&
    WIDGET_TYPES.includes(w.type as WidgetType) &&
    typeof w.x === 'number' &&
    typeof w.y === 'number' &&
    typeof w.z === 'number' &&
    typeof w.pinned === 'boolean'
  );
}

function readLayout(): DevZoneLayout {
  if (typeof window === 'undefined') return createDefaultLayout();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultLayout();
    const parsed = JSON.parse(raw) as Partial<DevZoneLayout>;
    if (
      parsed.version !== LAYOUT_VERSION ||
      !Array.isArray(parsed.widgets) ||
      !parsed.widgets.every(isWidgetInstance)
    ) {
      return createDefaultLayout();
    }
    return {
      version: LAYOUT_VERSION,
      zCounter: typeof parsed.zCounter === 'number' ? parsed.zCounter : parsed.widgets.length,
      widgets: parsed.widgets,
    };
  } catch {
    return createDefaultLayout();
  }
}

let instanceCounter = 0;
function makeId(type: WidgetType): string {
  instanceCounter += 1;
  return `${type}-${Date.now().toString(36)}-${instanceCounter}`;
}

export interface DevZoneLayoutApi {
  widgets: WidgetInstance[];
  addWidget: (type: WidgetType, serviceId?: string) => void;
  /** Drop a pasted text note at the given world position; returns its id. */
  addNote: (text: string, x: number, y: number) => void;
  /** Drop a pasted image (data URL) at the given world position. */
  addImage: (src: string, width: number, height: number, x: number, y: number) => void;
  /** Update a note's text content. */
  updateNote: (id: string, text: string) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, x: number, y: number) => void;
  togglePin: (id: string) => void;
  focusWidget: (id: string) => void;
  /** Replace the whole widget list (used by undo/redo). */
  setWidgets: (widgets: WidgetInstance[]) => void;
  resetLayout: () => void;
}

/**
 * Owns the whiteboard layout and mirrors every change to localStorage. Returns
 * the current widgets plus the mutators the canvas and dock drive.
 */
export function useDevZoneLayout(): DevZoneLayoutApi {
  const [layout, setLayout] = useState<DevZoneLayout>(readLayout);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch {
      /* storage may be unavailable (private mode / quota) — ignore. */
    }
  }, [layout]);

  const addWidget = useCallback((type: WidgetType, serviceId?: string) => {
    setLayout((prev) => {
      // Status listeners are unique per service; music and pomodoro are
      // singletons. In both cases, don't spawn a duplicate.
      if (type === 'status') {
        if (prev.widgets.some((w) => w.type === 'status' && w.serviceId === serviceId)) {
          return prev;
        }
      } else if (prev.widgets.some((w) => w.type === type)) {
        return prev;
      }
      const nextZ = prev.zCounter + 1;
      const offset = (prev.widgets.length % 6) * 28;
      const widget: WidgetInstance = {
        id: makeId(type),
        type,
        serviceId,
        x: 48 + offset,
        y: 48 + offset,
        z: nextZ,
        pinned: false,
      };
      return { ...prev, zCounter: nextZ, widgets: [...prev.widgets, widget] };
    });
  }, []);

  const addNote = useCallback((text: string, x: number, y: number) => {
    setLayout((prev) => {
      const nextZ = prev.zCounter + 1;
      const widget: WidgetInstance = {
        id: makeId('note'),
        type: 'note',
        text,
        x: Math.round(x),
        y: Math.round(y),
        z: nextZ,
        pinned: false,
      };
      return { ...prev, zCounter: nextZ, widgets: [...prev.widgets, widget] };
    });
  }, []);

  const addImage = useCallback(
    (src: string, width: number, height: number, x: number, y: number) => {
      setLayout((prev) => {
        const nextZ = prev.zCounter + 1;
        const widget: WidgetInstance = {
          id: makeId('image'),
          type: 'image',
          src,
          width,
          height,
          x: Math.round(x),
          y: Math.round(y),
          z: nextZ,
          pinned: false,
        };
        return { ...prev, zCounter: nextZ, widgets: [...prev.widgets, widget] };
      });
    },
    [],
  );

  const updateNote = useCallback((id: string, text: string) => {
    setLayout((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => (w.id === id ? { ...w, text } : w)),
    }));
  }, []);

  const setWidgets = useCallback((widgets: WidgetInstance[]) => {
    setLayout((prev) => {
      if (prev.widgets === widgets) return prev;
      const maxZ = widgets.reduce((m, w) => Math.max(m, w.z), 0);
      return { ...prev, widgets, zCounter: Math.max(prev.zCounter, maxZ) };
    });
  }, []);

  const removeWidget = useCallback((id: string) => {
    setLayout((prev) => ({ ...prev, widgets: prev.widgets.filter((w) => w.id !== id) }));
  }, []);

  const moveWidget = useCallback((id: string, x: number, y: number) => {
    setLayout((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => (w.id === id ? { ...w, x, y } : w)),
    }));
  }, []);

  const togglePin = useCallback((id: string) => {
    setLayout((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => (w.id === id ? { ...w, pinned: !w.pinned } : w)),
    }));
  }, []);

  const focusWidget = useCallback((id: string) => {
    setLayout((prev) => {
      const target = prev.widgets.find((w) => w.id === id);
      if (!target || target.z === prev.zCounter) return prev;
      const nextZ = prev.zCounter + 1;
      return {
        ...prev,
        zCounter: nextZ,
        widgets: prev.widgets.map((w) => (w.id === id ? { ...w, z: nextZ } : w)),
      };
    });
  }, []);

  const resetLayout = useCallback(() => setLayout(createDefaultLayout()), []);

  return {
    widgets: layout.widgets,
    addWidget,
    addNote,
    addImage,
    updateNote,
    removeWidget,
    moveWidget,
    togglePin,
    focusWidget,
    setWidgets,
    resetLayout,
  };
}
