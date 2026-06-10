import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Eraser,
  Maximize,
  Minus,
  MousePointer2,
  Music2,
  Pen,
  Plus,
  Redo2,
  RotateCcw,
  SlidersHorizontal,
  Timer,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import type { CanvasTool, WidgetType } from './types';
import { PEN_COLORS } from './Toolbar';
import { STATUS_SERVICES } from './data/statusServices';

interface MobileControlsProps {
  tool: CanvasTool;
  color: string;
  onToolChange: (tool: CanvasTool) => void;
  onColorChange: (color: string) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onAdd: (type: WidgetType, serviceId?: string) => void;
  onResetLayout: () => void;
  activeServiceIds: string[];
  hasMusic: boolean;
  hasPomodoro: boolean;
}

/**
 * Phone-only control surface: a single floating button that expands into a
 * sheet gathering every whiteboard control (tools, undo/redo, zoom and the
 * widget dock), so the canvas isn't crowded by always-on toolbars on small
 * screens. Hidden at `sm` and up, where the dedicated toolbars take over.
 */
export default function MobileControls(props: MobileControlsProps) {
  const {
    tool,
    color,
    onToolChange,
    onColorChange,
    onClear,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    zoom,
    onZoomIn,
    onZoomOut,
    onResetView,
    onAdd,
    onResetLayout,
    activeServiceIds,
    hasMusic,
    hasPomodoro,
  } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const close = () => {
    setOpen(false);
    setStatusOpen(false);
  };

  return (
    <div className="sm:hidden" data-no-zoom>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={close}
              className="fixed inset-0 z-40 bg-dark-900/10"
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card fixed right-4 bottom-20 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-3 rounded-3xl p-3"
            >
              {/* Tools */}
              <Row label={t('devZone.menu.tools')}>
                <IconButton
                  icon={<MousePointer2 size={18} />}
                  label={t('devZone.toolbar.select')}
                  active={tool === 'select'}
                  onClick={() => onToolChange('select')}
                />
                <IconButton
                  icon={<Pen size={18} />}
                  label={t('devZone.toolbar.draw')}
                  active={tool === 'draw'}
                  onClick={() => onToolChange('draw')}
                />
                <IconButton
                  icon={<Eraser size={18} />}
                  label={t('devZone.toolbar.erase')}
                  active={tool === 'erase'}
                  onClick={() => onToolChange('erase')}
                />
                <span className="mx-1 h-7 w-px bg-dark-900/10" aria-hidden="true" />
                <IconButton
                  icon={<Undo2 size={18} />}
                  label={t('devZone.toolbar.undo')}
                  disabled={!canUndo}
                  onClick={onUndo}
                />
                <IconButton
                  icon={<Redo2 size={18} />}
                  label={t('devZone.toolbar.redo')}
                  disabled={!canRedo}
                  onClick={onRedo}
                />
                <IconButton
                  icon={<Trash2 size={18} />}
                  label={t('devZone.toolbar.clear')}
                  onClick={onClear}
                />
              </Row>

              {tool === 'draw' && (
                <div className="flex items-center gap-2 px-1">
                  {PEN_COLORS.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => onColorChange(swatch)}
                      className={cn(
                        'size-6 rounded-full transition-transform active:scale-95',
                        color === swatch
                          ? 'ring-2 ring-dark-900/70 ring-offset-1 ring-offset-cream-50'
                          : 'ring-1 ring-dark-900/15',
                      )}
                      style={{ backgroundColor: swatch }}
                      aria-label={swatch}
                      aria-pressed={color === swatch}
                    />
                  ))}
                </div>
              )}

              {/* Zoom */}
              <Row label={t('devZone.menu.zoom')}>
                <IconButton icon={<Minus size={18} />} label={t('devZone.zoom.out')} onClick={onZoomOut} />
                <button
                  type="button"
                  onClick={onResetView}
                  className="min-w-14 rounded-xl px-2 py-2 text-center font-mono text-xs font-medium text-dark-900 tabular-nums transition-colors hover:bg-dark-900/5"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <IconButton icon={<Plus size={18} />} label={t('devZone.zoom.in')} onClick={onZoomIn} />
                <span className="mx-1 h-7 w-px bg-dark-900/10" aria-hidden="true" />
                <IconButton
                  icon={<Maximize size={17} />}
                  label={t('devZone.zoom.fit')}
                  onClick={onResetView}
                />
              </Row>

              {/* Add widgets */}
              <Row label={t('devZone.menu.widgets')}>
                <IconButton
                  icon={<Music2 size={18} />}
                  label={t('devZone.dock.music')}
                  disabled={hasMusic}
                  onClick={() => onAdd('music')}
                />
                <IconButton
                  icon={<Timer size={18} />}
                  label={t('devZone.dock.pomodoro')}
                  disabled={hasPomodoro}
                  onClick={() => onAdd('pomodoro')}
                />
                <IconButton
                  icon={<Activity size={18} />}
                  label={t('devZone.dock.status')}
                  active={statusOpen}
                  onClick={() => setStatusOpen((v) => !v)}
                />
                <span className="mx-1 h-7 w-px bg-dark-900/10" aria-hidden="true" />
                <IconButton
                  icon={<RotateCcw size={18} />}
                  label={t('devZone.dock.reset')}
                  onClick={() => {
                    onResetLayout();
                    close();
                  }}
                />
              </Row>

              {statusOpen && (
                <div className="custom-scrollbar -mt-1 flex max-h-44 flex-col gap-0.5 overflow-y-auto rounded-2xl bg-dark-900/[0.03] p-1.5">
                  {STATUS_SERVICES.map((service) => {
                    const active = activeServiceIds.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        type="button"
                        disabled={active}
                        onClick={() => {
                          onAdd('status', service.id);
                          setStatusOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-colors',
                          active ? 'cursor-default text-dark-900/35' : 'text-dark-900 active:bg-dark-900/5',
                        )}
                      >
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: service.accent }}
                        />
                        <span className="flex-1 truncate">{service.name}</span>
                        {active && (
                          <span className="font-mono text-[10px] text-dark-900/35">
                            {t('devZone.dock.added')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating toggle */}
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-label={open ? t('devZone.menu.close') : t('devZone.menu.open')}
        className="glass-card fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full text-dark-900 active:scale-95"
      >
        {open ? <X size={22} /> : <SlidersHorizontal size={20} />}
      </button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-1 pb-1.5 font-mono text-[10px] tracking-widest text-dark-900/40 uppercase">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-0.5">{children}</div>
    </div>
  );
}

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function IconButton({ icon, label, onClick, active, disabled }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex size-10 items-center justify-center rounded-xl transition-colors',
        disabled
          ? 'cursor-default text-dark-900/25'
          : active
            ? 'bg-dark-900 text-cream-50'
            : 'text-dark-900 active:bg-dark-900/5',
      )}
    >
      {icon}
    </button>
  );
}
