import { useCallback, useEffect, useRef, useState } from 'react';
import type { Stroke, WidgetInstance } from './types';

const MAX_HISTORY = 100;

export interface Snapshot {
  widgets: WidgetInstance[];
  strokes: Stroke[];
}

export interface HistoryApi {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * A signature that captures every change worth a history entry — widget
 * identity, position, pin state and editable content, plus the set of strokes.
 * Stacking-order (`z`) changes are deliberately excluded so merely clicking a
 * widget to focus it does not create an undo step.
 */
function signature({ widgets, strokes }: Snapshot): string {
  const widgetSig = widgets
    .map(
      (w) =>
        `${w.id}:${w.x},${w.y},${w.pinned ? 1 : 0},${w.text ?? ''},${w.src ? 1 : 0},${w.width ?? ''},${w.height ?? ''}`,
    )
    .join('|');
  const strokeSig = strokes.map((s) => s.id).join('|');
  return `${widgetSig}__${strokeSig}`;
}

/**
 * Undo/redo over the combined whiteboard snapshot (widgets + strokes).
 *
 * Rather than intercept every mutator, the hook observes the live snapshot and
 * records the *previous* state whenever a meaningful change lands. Restores are
 * flagged so they don't themselves get recorded, and the snapshots hold the
 * immutable arrays produced by the state hooks, so storing references is safe.
 */
export function useHistory(
  widgets: WidgetInstance[],
  strokes: Stroke[],
  restore: (snapshot: Snapshot) => void,
): HistoryApi {
  const pastRef = useRef<Snapshot[]>([]);
  const futureRef = useRef<Snapshot[]>([]);
  const presentRef = useRef<Snapshot>({ widgets, strokes });
  const isRestoringRef = useRef(false);
  // Availability lives in state (not derived from refs at render time) so the
  // toolbar buttons re-render when the stacks change.
  const [flags, setFlags] = useState({ canUndo: false, canRedo: false });
  const syncFlags = useCallback(() => {
    setFlags((prev) => {
      const canUndo = pastRef.current.length > 0;
      const canRedo = futureRef.current.length > 0;
      return prev.canUndo === canUndo && prev.canRedo === canRedo ? prev : { canUndo, canRedo };
    });
  }, []);

  useEffect(() => {
    const current: Snapshot = { widgets, strokes };

    if (isRestoringRef.current) {
      // This change is the restore we just triggered — adopt it silently.
      isRestoringRef.current = false;
      presentRef.current = current;
      return;
    }

    if (signature(current) === signature(presentRef.current)) {
      // Noise (e.g. a z-order/focus change) — keep the latest reference but
      // don't add a history step.
      presentRef.current = current;
      return;
    }

    pastRef.current.push(presentRef.current);
    if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift();
    futureRef.current = [];
    presentRef.current = current;
    syncFlags();
  }, [widgets, strokes, syncFlags]);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current.pop() as Snapshot;
    futureRef.current.push(presentRef.current);
    presentRef.current = previous;
    isRestoringRef.current = true;
    restore(previous);
    syncFlags();
  }, [restore, syncFlags]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop() as Snapshot;
    pastRef.current.push(presentRef.current);
    presentRef.current = next;
    isRestoringRef.current = true;
    restore(next);
    syncFlags();
  }, [restore, syncFlags]);

  return { undo, redo, canUndo: flags.canUndo, canRedo: flags.canRedo };
}
