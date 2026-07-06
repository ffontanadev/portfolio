import { useEffect, type ReactNode } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { GripVertical, Pin, PinOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { WidgetInstance } from './types';

interface WidgetFrameProps {
  instance: WidgetInstance;
  title: string;
  icon: ReactNode;
  /** Brand accent for the title dot (defaults to coral). */
  accent?: string;
  /** Dragging is suspended while a drawing tool is active. */
  interactive?: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onFocus: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRemove: (id: string) => void;
  className?: string;
  children: ReactNode;
}

/**
 * Draggable, pinnable shell shared by every Dev Zone widget. Dragging is driven
 * from the header only (so interactive controls in the body stay clickable), and
 * the final resting position is reported back to the layout for persistence.
 * Pinned ("anchored") widgets disable dragging until unpinned.
 */
export default function Widget({
  instance,
  title,
  icon,
  accent = 'var(--color-coral-500)',
  interactive = true,
  onMove,
  onFocus,
  onTogglePin,
  onRemove,
  className,
  children,
}: WidgetFrameProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const x = useMotionValue(instance.x);
  const y = useMotionValue(instance.y);
  const dragControls = useDragControls();
  const draggable = interactive && !instance.pinned;
  // Widgets are sized for the desktop board; scale them down on phones so they
  // don't swallow the viewport. framer composes this with the drag x/y.
  const scale = isMobile ? 0.78 : 1;

  // Keep the drag motion values in sync when the position changes from outside a
  // drag (undo/redo, layout restore). A no-op when the values already match.
  useEffect(() => {
    if (x.get() !== instance.x) x.set(instance.x);
    if (y.get() !== instance.y) y.set(instance.y);
  }, [instance.x, instance.y, x, y]);

  return (
    <motion.div
      data-widget="true"
      style={{ x, y, scale, transformOrigin: 'top left', zIndex: instance.z, touchAction: 'none' }}
      drag={draggable}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onPointerDown={() => onFocus(instance.id)}
      onDragEnd={() => onMove(instance.id, Math.round(x.get()), Math.round(y.get()))}
      className={cn(
        'glass-card absolute top-0 left-0 w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl text-left',
        className,
      )}
    >
      <header
        onPointerDown={(event) => {
          if (draggable) dragControls.start(event);
        }}
        className={cn(
          'flex items-center gap-2 border-b border-dark-900/10 dark:border-cream-50/10 px-3 py-2 select-none',
          !draggable ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
        )}
      >
        <GripVertical
          size={14}
          className={cn('shrink-0 text-dark-900/30 dark:text-cream-50/30', instance.pinned && 'opacity-30')}
          aria-hidden="true"
        />
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
        <span className="flex items-center gap-1.5 text-dark-900/70 dark:text-cream-50/70">{icon}</span>
        <h3 className="flex-1 truncate font-mono text-xs font-medium tracking-wide text-dark-900 dark:text-cream-50">
          {title}
        </h3>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onTogglePin(instance.id)}
          className="rounded-md p-1 text-dark-900/40 transition-colors hover:bg-dark-900/5 hover:text-coral-500 dark:text-cream-50/40 dark:hover:bg-cream-50/10"
          aria-pressed={instance.pinned}
          aria-label={instance.pinned ? t('devZone.widget.unpin') : t('devZone.widget.pin')}
          title={instance.pinned ? t('devZone.widget.unpin') : t('devZone.widget.pin')}
        >
          {instance.pinned ? <Pin size={14} /> : <PinOff size={14} />}
        </button>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onRemove(instance.id)}
          className="rounded-md p-1 text-dark-900/40 transition-colors hover:bg-dark-900/5 hover:text-coral-500 dark:text-cream-50/40 dark:hover:bg-cream-50/10"
          aria-label={t('devZone.widget.remove')}
          title={t('devZone.widget.remove')}
        >
          <X size={14} />
        </button>
      </header>
      <div className="p-4">{children}</div>
    </motion.div>
  );
}
