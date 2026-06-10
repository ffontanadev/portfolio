import type { ReactNode, RefObject } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { GripVertical, Pin, PinOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import type { WidgetInstance } from './types';

interface WidgetFrameProps {
  instance: WidgetInstance;
  canvasRef: RefObject<HTMLDivElement | null>;
  title: string;
  icon: ReactNode;
  /** Brand accent for the title dot (defaults to coral). */
  accent?: string;
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
  canvasRef,
  title,
  icon,
  accent = 'var(--color-coral-500)',
  onMove,
  onFocus,
  onTogglePin,
  onRemove,
  className,
  children,
}: WidgetFrameProps) {
  const { t } = useTranslation();
  const x = useMotionValue(instance.x);
  const y = useMotionValue(instance.y);
  const dragControls = useDragControls();

  return (
    <motion.div
      style={{ x, y, zIndex: instance.z }}
      drag={!instance.pinned}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={canvasRef}
      onPointerDown={() => onFocus(instance.id)}
      onDragEnd={() => onMove(instance.id, Math.round(x.get()), Math.round(y.get()))}
      className={cn(
        'glass-card absolute top-0 left-0 w-[320px] overflow-hidden rounded-2xl text-left',
        className,
      )}
    >
      <header
        onPointerDown={(event) => {
          if (!instance.pinned) dragControls.start(event);
        }}
        className={cn(
          'flex items-center gap-2 border-b border-dark-900/10 px-3 py-2 select-none',
          instance.pinned ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
        )}
      >
        <GripVertical
          size={14}
          className={cn('shrink-0 text-dark-900/30', instance.pinned && 'opacity-30')}
          aria-hidden="true"
        />
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
        <span className="flex items-center gap-1.5 text-dark-900/70">{icon}</span>
        <h3 className="flex-1 truncate font-mono text-xs font-medium tracking-wide text-dark-900">
          {title}
        </h3>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onTogglePin(instance.id)}
          className="rounded-md p-1 text-dark-900/40 transition-colors hover:bg-dark-900/5 hover:text-coral-500"
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
          className="rounded-md p-1 text-dark-900/40 transition-colors hover:bg-dark-900/5 hover:text-coral-500"
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
