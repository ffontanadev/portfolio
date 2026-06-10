import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import { useDevZoneLayout } from './useDevZoneLayout';
import { strokeToPath, useWhiteboardCanvas } from './useWhiteboardCanvas';
import Dock from './Dock';
import Toolbar, { PEN_COLORS } from './Toolbar';
import MusicPlayerWidget from './widgets/MusicPlayerWidget';
import PomodoroWidget from './widgets/PomodoroWidget';
import StatusListenerWidget from './widgets/StatusListenerWidget';
import type { CanvasTool, Point, Stroke, WidgetInstance } from './types';

const PEN_WIDTH = 3;
const ERASER_RADIUS = 14;

/** A stroke still being drawn — it gets its id only once committed. */
type DraftStroke = Omit<Stroke, 'id'>;

/**
 * The Dev Zone whiteboard: a full-screen, infinite, pannable canvas hosting
 * draggable developer widgets (radio, pomodoro, service status) alongside a
 * Figma-style freehand drawing layer. Widget layout, strokes and pan offset all
 * persist to localStorage. The dock spawns widgets; the toolbar switches between
 * moving/panning, drawing and erasing.
 */
export default function DevZone() {
  const { t } = useTranslation();
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const { widgets, addWidget, removeWidget, moveWidget, togglePin, focusWidget, resetLayout } =
    useDevZoneLayout();
  const { pan, strokes, setPan, addStroke, eraseAt, clearStrokes, resetView } =
    useWhiteboardCanvas();

  const [tool, setTool] = useState<CanvasTool>('select');
  const [color, setColor] = useState<string>(PEN_COLORS[0]);

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
    return { x: clientX - left - pan.x, y: clientY - top - pan.y };
  };

  // --- Panning (select tool, dragging empty canvas) ---------------------------
  const handleViewportPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (tool !== 'select') return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-widget="true"]')) return; // let the widget drag itself
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
      eraseAt(world, ERASER_RADIUS);
      return;
    }
    drawPointerRef.current = event.pointerId;
    setDraft({ color, width: PEN_WIDTH, points: [world] });
  };

  const handleDrawPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const world = toWorld(event.clientX, event.clientY);
    if (tool === 'erase') {
      if (erasePointerRef.current !== event.pointerId) return;
      eraseAt(world, ERASER_RADIUS);
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

  const handleClear = () => {
    clearStrokes();
    resetView();
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
        'fixed inset-0 touch-none overflow-hidden bg-cream-50',
        tool === 'select' && 'cursor-grab active:cursor-grabbing',
      )}
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(26,26,26,0.08) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* World layer — pans as one; hosts strokes and widgets in canvas space. */}
      <div
        className="absolute top-0 left-0"
        style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0)` }}
      >
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
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 text-dark-900/35">
          <MousePointer2 size={28} />
          <p className="font-mono text-xs tracking-wide">{t('devZone.empty')}</p>
        </div>
      )}

      {/* Floating header. */}
      <div className="pointer-events-none fixed top-5 left-5 z-40 flex flex-col gap-1">
        <Link
          to="/"
          className="reveal-underline pointer-events-auto inline-flex w-fit items-center gap-1.5 font-mono text-xs text-dark-900/50 transition-colors hover:text-coral-500"
        >
          <ArrowLeft size={14} />
          {t('devZone.back')}
        </Link>
        <h1 className="font-display text-lg font-semibold tracking-tight text-dark-900">
          {t('devZone.title')}
        </h1>
      </div>

      <Toolbar
        tool={tool}
        color={color}
        onToolChange={setTool}
        onColorChange={setColor}
        onClear={handleClear}
      />

      <Dock
        onAdd={addWidget}
        onReset={resetLayout}
        activeServiceIds={activeServiceIds}
        hasMusic={hasMusic}
        hasPomodoro={hasPomodoro}
      />
    </div>
  );
}
