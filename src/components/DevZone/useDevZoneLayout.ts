import { useCallback, useEffect, useState } from 'react';
import type { DevZoneLayout, WidgetInstance, WidgetType } from './types';

const STORAGE_KEY = 'portfolio.devzone.layout.v1';
const LAYOUT_VERSION = 1;

/** Sensible starting board for first-time visitors. */
function createDefaultLayout(): DevZoneLayout {
  return {
    version: LAYOUT_VERSION,
    zCounter: 3,
    widgets: [
      { id: 'music-default', type: 'music', x: 32, y: 32, z: 1, pinned: false },
      { id: 'pomodoro-default', type: 'pomodoro', x: 372, y: 32, z: 2, pinned: false },
      {
        id: 'status-anthropic-default',
        type: 'status',
        serviceId: 'anthropic',
        x: 712,
        y: 32,
        z: 3,
        pinned: false,
      },
    ],
  };
}

function isWidgetInstance(value: unknown): value is WidgetInstance {
  if (typeof value !== 'object' || value === null) return false;
  const w = value as Record<string, unknown>;
  return (
    typeof w.id === 'string' &&
    (w.type === 'music' || w.type === 'pomodoro' || w.type === 'status') &&
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
  removeWidget: (id: string) => void;
  moveWidget: (id: string, x: number, y: number) => void;
  togglePin: (id: string) => void;
  focusWidget: (id: string) => void;
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
    removeWidget,
    moveWidget,
    togglePin,
    focusWidget,
    resetLayout,
  };
}
