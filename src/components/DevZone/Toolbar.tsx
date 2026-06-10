import { AnimatePresence, motion } from 'framer-motion';
import { Eraser, MousePointer2, Pen, Redo2, Trash2, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import type { CanvasTool } from './types';

/** Pen colours offered in the draw toolbar (stored as hex on each stroke). */
export const PEN_COLORS = ['#1A1A1A', '#FF6B6B', '#3B82F6', '#10B981', '#F59E0B'] as const;

interface ToolbarProps {
  tool: CanvasTool;
  color: string;
  onToolChange: (tool: CanvasTool) => void;
  onColorChange: (color: string) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Floating tool selector for the whiteboard: switch between moving widgets /
 * panning (select), freehand drawing (draw) and erasing strokes (erase). The
 * colour row reveals while the pen is active.
 */
export default function Toolbar({
  tool,
  color,
  onToolChange,
  onColorChange,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolbarProps) {
  const { t } = useTranslation();

  return (
    <div
      data-no-zoom
      className="pointer-events-none fixed inset-x-0 top-5 z-40 flex flex-col items-center gap-2 px-4"
    >
      <div className="glass-card pointer-events-auto flex items-center gap-1 rounded-full px-2 py-2">
        <ToolButton
          icon={<MousePointer2 size={16} />}
          label={t('devZone.toolbar.select')}
          active={tool === 'select'}
          onClick={() => onToolChange('select')}
        />
        <ToolButton
          icon={<Pen size={16} />}
          label={t('devZone.toolbar.draw')}
          active={tool === 'draw'}
          onClick={() => onToolChange('draw')}
        />
        <ToolButton
          icon={<Eraser size={16} />}
          label={t('devZone.toolbar.erase')}
          active={tool === 'erase'}
          onClick={() => onToolChange('erase')}
        />
        <span className="mx-1 h-6 w-px bg-dark-900/10" aria-hidden="true" />
        <ToolButton
          icon={<Undo2 size={16} />}
          label={t('devZone.toolbar.undo')}
          onClick={onUndo}
          disabled={!canUndo}
          iconOnly
        />
        <ToolButton
          icon={<Redo2 size={16} />}
          label={t('devZone.toolbar.redo')}
          onClick={onRedo}
          disabled={!canRedo}
          iconOnly
        />
        <ToolButton
          icon={<Trash2 size={16} />}
          label={t('devZone.toolbar.clear')}
          onClick={onClear}
          iconOnly
        />
      </div>

      <AnimatePresence>
        {tool === 'draw' && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card pointer-events-auto flex items-center gap-1.5 rounded-full px-2.5 py-2"
          >
            {PEN_COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => onColorChange(swatch)}
                className={cn(
                  'size-5 rounded-full transition-transform hover:scale-110',
                  color === swatch
                    ? 'ring-2 ring-dark-900/70 ring-offset-1 ring-offset-cream-50'
                    : 'ring-1 ring-dark-900/15',
                )}
                style={{ backgroundColor: swatch }}
                aria-label={swatch}
                aria-pressed={color === swatch}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  /** Render only the icon (no text label even on wide screens). */
  iconOnly?: boolean;
}

function ToolButton({ icon, label, onClick, active, disabled, iconOnly }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
        disabled
          ? 'cursor-default text-dark-900/25'
          : active
            ? 'bg-dark-900 text-cream-50'
            : 'text-dark-900 hover:bg-dark-900/5',
      )}
    >
      {icon}
      {!iconOnly && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}
