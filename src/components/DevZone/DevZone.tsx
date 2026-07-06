import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ArrowLeft, MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import { useDevZoneLayout } from './useDevZoneLayout';
import { useDevZoneTheme } from './hooks/useDevZoneTheme';
import { clampZoom, strokeToPath, useWhiteboardCanvas } from './useWhiteboardCanvas';
import { useHistory, type Snapshot } from './useHistory';
import Dock from './Dock';
import Toolbar, { PEN_COLORS } from './Toolbar';
import ZoomControls from './ZoomControls';
import MobileControls from './MobileControls';
import MusicPlayerWidget from './widgets/MusicPlayerWidget';
import PomodoroWidget from './widgets/PomodoroWidget';
import StatusListenerWidget from './widgets/StatusListenerWidget';
import NoteWidget from './widgets/NoteWidget';
import ImageWidget from './widgets/ImageWidget';
import type { CanvasTool, Point, Stroke, WidgetInstance } from './types';

const PEN_WIDTH = 3;
const ERASER_RADIUS = 14;
const ZOOM_STEP = 1.2;
/** Largest stored image dimension (keeps localStorage usage reasonable). */
const IMAGE_STORE_MAX = 900;
/** Default on-canvas display size for a pasted image. */
const IMAGE_DISPLAY_MAX = 280;

/** A stroke still being drawn — it gets its id only once committed. */
type DraftStroke = Omit<Stroke, 'id'>;

function isEditableTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable;
}

/**
 * The Dev Zone whiteboard: a full-screen, infinite, pannable and zoomable canvas
 * hosting draggable developer widgets (radio, pomodoro, service status), pasted
 * notes & images, and a Figma-style freehand drawing layer. Layout, strokes and
 * the view (pan + zoom) persist to localStorage. Supports wheel zoom, undo/redo
 * (Cmd/Ctrl+Z, Shift+Z, Ctrl+Y) and pasting text/images onto the board.
 */
export default function DevZone() {
  const { t } = useTranslation();
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const {
    widgets,
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
  } = useDevZoneLayout();
  const { pan, zoom, strokes, setPan, setView, addStroke, setStrokes, eraseAt, clearStrokes, resetView } =
    useWhiteboardCanvas();
  const { theme, toggleTheme } = useDevZoneTheme();

  // Live mirrors of pan/zoom for handlers attached imperatively (wheel) or that
  // must read the latest view without being re-created (drag transform, paste).
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  useLayoutEffect(() => {
    panRef.current = pan;
    zoomRef.current = zoom;
  }, [pan, zoom]);

  const [tool, setTool] = useState<CanvasTool>('select');
  const [color, setColor] = useState<string>(PEN_COLORS[0]);

  // --- Undo / redo over the combined widget + stroke snapshot -----------------
  const restore = useCallback(
    (snapshot: Snapshot) => {
      setWidgets(snapshot.widgets);
      setStrokes(snapshot.strokes);
    },
    [setWidgets, setStrokes],
  );
  const { undo, redo, canUndo, canRedo } = useHistory(widgets, strokes, restore);

  // Draft stroke lives in a ref (read on pointer-up, side-effect free) mirrored
  // into state so the in-progress path re-renders as the pointer moves.
  const draftRef = useRef<DraftStroke | null>(null);
  const [draft, setDraftState] = useState<DraftStroke | null>(null);
  const setDraft = (next: DraftStroke | null) => {
    draftRef.current = next;
    setDraftState(next);
  };

  // Per-interaction pointer bookkeeping.
  const panStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const drawPointerRef = useRef<number | null>(null);
  const erasePointerRef = useRef<number | null>(null);

  const activeServiceIds = widgets
    .filter((w) => w.type === 'status' && w.serviceId)
    .map((w) => w.serviceId as string);
  // Music and pomodoro are singletons — track which are already on the board.
  const hasMusic = widgets.some((w) => w.type === 'music');
  const hasPomodoro = widgets.some((w) => w.type === 'pomodoro');

  const toWorld = (clientX: number, clientY: number): Point => {
    const rect = viewportRef.current?.getBoundingClientRect();
    const left = rect?.left ?? 0;
    const top = rect?.top ?? 0;
    return { x: (clientX - left - pan.x) / zoom, y: (clientY - top - pan.y) / zoom };
  };

  // Divide pointer movement by the current zoom so framer-motion drag keeps the
  // widget under the cursor inside the scaled world layer.
  const transformPagePoint = useCallback(
    (point: Point) => ({ x: point.x / zoomRef.current, y: point.y / zoomRef.current }),
    [],
  );

  // --- Zooming -----------------------------------------------------------------
  // Zoom toward (cx, cy) — viewport-relative px — keeping that point fixed.
  const applyZoomAt = useCallback(
    (cx: number, cy: number, target: number) => {
      const next = clampZoom(target);
      const worldX = (cx - panRef.current.x) / zoomRef.current;
      const worldY = (cy - panRef.current.y) / zoomRef.current;
      setView({ x: cx - worldX * next, y: cy - worldY * next }, next);
    },
    [setView],
  );

  const zoomFromButton = useCallback(
    (factor: number) => {
      const rect = viewportRef.current?.getBoundingClientRect();
      applyZoomAt((rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2, zoomRef.current * factor);
    },
    [applyZoomAt],
  );

  // Wheel zoom — registered natively so we can preventDefault (browser zoom/scroll).
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      // Let scrollable chrome (e.g. the dock's status picker) handle its own wheel.
      if ((event.target as Element | null)?.closest('[data-no-zoom]')) return;
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      const factor = Math.exp(-event.deltaY * 0.0015);
      applyZoomAt(event.clientX - rect.left, event.clientY - rect.top, zoomRef.current * factor);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyZoomAt]);

  // --- Undo/redo keyboard shortcuts -------------------------------------------
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (isEditableTarget(document.activeElement)) return;
      const key = event.key.toLowerCase();
      if (key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (key === 'y') {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  // --- Paste text & images -----------------------------------------------------
  useEffect(() => {
    const dropImage = (file: File, worldX: number, worldY: number) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') return;
        const img = new Image();
        img.onload = () => {
          const storeScale = Math.min(1, IMAGE_STORE_MAX / Math.max(img.width, img.height));
          const cw = Math.max(1, Math.round(img.width * storeScale));
          const ch = Math.max(1, Math.round(img.height * storeScale));
          const canvas = document.createElement('canvas');
          canvas.width = cw;
          canvas.height = ch;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, cw, ch);
          let dataUrl = result;
          try {
            dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          } catch {
            /* tainted canvas — fall back to the raw data URL. */
          }
          const displayScale = Math.min(1, IMAGE_DISPLAY_MAX / Math.max(cw, ch));
          const dw = Math.round(cw * displayScale);
          const dh = Math.round(ch * displayScale);
          addImage(dataUrl, dw, dh, worldX - dw / 2, worldY - dh / 2);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    };

    const onPaste = (event: ClipboardEvent) => {
      if (isEditableTarget(document.activeElement)) return; // let inputs paste normally
      const data = event.clipboardData;
      if (!data) return;

      const rect = viewportRef.current?.getBoundingClientRect();
      const vw = rect?.width ?? window.innerWidth;
      const vh = rect?.height ?? window.innerHeight;
      const centerX = (vw / 2 - panRef.current.x) / zoomRef.current;
      const centerY = (vh / 2 - panRef.current.y) / zoomRef.current;

      const imageItem = Array.from(data.items).find((item) => item.type.startsWith('image/'));
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) {
          event.preventDefault();
          dropImage(file, centerX, centerY);
          return;
        }
      }

      const text = data.getData('text/plain');
      if (text && text.trim()) {
        event.preventDefault();
        addNote(text, centerX - 160, centerY - 70);
      }
    };

    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addNote, addImage]);

  // --- Panning (select tool, dragging empty canvas) ---------------------------
  const handleViewportPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (tool !== 'select') return;
    // Only pan when the bare canvas background is grabbed. Capturing the pointer
    // for clicks that land on a widget, the toolbar or the dock would swallow
    // their click events (those targets are descendants of this viewport).
    if (event.target !== event.currentTarget) return;
    panStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleViewportPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = panStateRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    setPan({
      x: state.originX + (event.clientX - state.startX),
      y: state.originY + (event.clientY - state.startY),
    });
  };

  const handleViewportPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = panStateRef.current;
    if (state && state.pointerId === event.pointerId) {
      panStateRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  // --- Drawing / erasing (overlay captures pointer in draw/erase tools) -------
  const handleDrawPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const world = toWorld(event.clientX, event.clientY);
    if (tool === 'erase') {
      erasePointerRef.current = event.pointerId;
      eraseAt(world, ERASER_RADIUS / zoom);
      return;
    }
    drawPointerRef.current = event.pointerId;
    setDraft({ color, width: PEN_WIDTH, points: [world] });
  };

  const handleDrawPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const world = toWorld(event.clientX, event.clientY);
    if (tool === 'erase') {
      if (erasePointerRef.current !== event.pointerId) return;
      eraseAt(world, ERASER_RADIUS / zoom);
      return;
    }
    if (drawPointerRef.current !== event.pointerId || !draftRef.current) return;
    setDraft({ ...draftRef.current, points: [...draftRef.current.points, world] });
  };

  const handleDrawPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (tool === 'erase') {
      if (erasePointerRef.current === event.pointerId) erasePointerRef.current = null;
      return;
    }
    if (drawPointerRef.current !== event.pointerId) return;
    drawPointerRef.current = null;
    if (draftRef.current) addStroke(draftRef.current);
    setDraft(null);
  };

  const renderWidget = (instance: WidgetInstance) => {
    const shared = {
      key: instance.id,
      instance,
      interactive: tool === 'select',
      onMove: moveWidget,
      onFocus: focusWidget,
      onTogglePin: togglePin,
      onRemove: removeWidget,
    };
    switch (instance.type) {
      case 'music':
        return <MusicPlayerWidget {...shared} />;
      case 'pomodoro':
        return <PomodoroWidget {...shared} />;
      case 'status':
        return <StatusListenerWidget {...shared} />;
      case 'note':
        return <NoteWidget {...shared} onUpdate={updateNote} />;
      case 'image':
        return <ImageWidget {...shared} />;
      default:
        return null;
    }
  };

  const isDrawingTool = tool !== 'select';

  return (
    <div
      ref={viewportRef}
      onPointerDown={handleViewportPointerDown}
      onPointerMove={handleViewportPointerMove}
      onPointerUp={handleViewportPointerUp}
      className={cn(
        'fixed inset-0 touch-none overflow-hidden bg-cream-50 dark:bg-dark-900',
        theme === 'dark' && 'dz-dark',
        tool === 'select' && 'cursor-grab active:cursor-grabbing',
      )}
      style={{
        backgroundImage: `radial-gradient(circle, ${
          theme === 'dark' ? 'rgba(255,248,243,0.10)' : 'rgba(26,26,26,0.08)'
        } 1px, transparent 1px)`,
        backgroundSize: `${22 * zoom}px ${22 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* World layer — pans & zooms as one; hosts strokes and widgets in canvas space. */}
      <div
        className="absolute top-0 left-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <MotionConfig transformPagePoint={transformPagePoint}>
          <svg className="pointer-events-none absolute top-0 left-0 overflow-visible" width="1" height="1">
            {strokes.map((stroke) => (
              <path
                key={stroke.id}
                d={strokeToPath(stroke.points)}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {draft && (
              <path
                d={strokeToPath(draft.points)}
                stroke={draft.color}
                strokeWidth={draft.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>

          {widgets.map(renderWidget)}
        </MotionConfig>
      </div>

      {/* Drawing overlay — only intercepts pointers while a draw tool is active. */}
      <div
        onPointerDown={isDrawingTool ? handleDrawPointerDown : undefined}
        onPointerMove={isDrawingTool ? handleDrawPointerMove : undefined}
        onPointerUp={isDrawingTool ? handleDrawPointerUp : undefined}
        className={cn(
          'absolute inset-0 z-30 touch-none',
          tool === 'select' && 'pointer-events-none',
          tool === 'draw' && 'cursor-crosshair',
          tool === 'erase' && 'cursor-cell',
        )}
      />

      {/* Empty-board hint. */}
      {widgets.length === 0 && strokes.length === 0 && !draft && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 text-dark-900/35 dark:text-cream-50/35">
          <MousePointer2 size={28} />
          <p className="font-mono text-xs tracking-wide">{t('devZone.empty')}</p>
        </div>
      )}

      {/* Floating header. */}
      <div className="pointer-events-none fixed top-5 left-5 z-40 flex flex-col gap-1">
        <Link
          to="/"
          className="reveal-underline pointer-events-auto inline-flex w-fit items-center gap-1.5 font-mono text-xs text-dark-900/50 transition-colors hover:text-coral-500 dark:text-cream-50/50"
        >
          <ArrowLeft size={14} />
          {t('devZone.back')}
        </Link>
        <h1 className="font-display text-lg font-semibold tracking-tight text-dark-900 dark:text-cream-50">
          {t('devZone.title')}
        </h1>
      </div>

      <Toolbar
        tool={tool}
        color={color}
        onToolChange={setTool}
        onColorChange={setColor}
        onClear={clearStrokes}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <ZoomControls
        zoom={zoom}
        onZoomIn={() => zoomFromButton(ZOOM_STEP)}
        onZoomOut={() => zoomFromButton(1 / ZOOM_STEP)}
        onReset={resetView}
      />

      <Dock
        onAdd={addWidget}
        onReset={resetLayout}
        activeServiceIds={activeServiceIds}
        hasMusic={hasMusic}
        hasPomodoro={hasPomodoro}
      />

      <MobileControls
        tool={tool}
        color={color}
        onToolChange={setTool}
        onColorChange={setColor}
        onClear={clearStrokes}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        zoom={zoom}
        onZoomIn={() => zoomFromButton(ZOOM_STEP)}
        onZoomOut={() => zoomFromButton(1 / ZOOM_STEP)}
        onResetView={resetView}
        onAdd={addWidget}
        onResetLayout={resetLayout}
        activeServiceIds={activeServiceIds}
        hasMusic={hasMusic}
        hasPomodoro={hasPomodoro}
      />
    </div>
  );
}
