import { useEffect, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import { DEFAULT_FONT_SIZE, FONT_MAX, FONT_MIN } from '../useDevZoneLayout';
import type { WidgetInstance } from '../types';

interface TextWidgetProps {
  instance: WidgetInstance;
  interactive?: boolean;
  editing: boolean;
  selected: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onFocus: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onSetFontSize: (id: string, size: number) => void;
  onSelect: (id: string) => void;
  onEditStart: (id: string) => void;
  onEditEnd: () => void;
  zoom: number;
}

/**
 * A free text element living directly on the whiteboard — no card, no
 * background. Drag to move, double-click to edit, and (Task 5) drag the corner
 * handle to scale the font size. Empty text is removed on blur.
 */
export default function TextWidget({
  instance,
  interactive = true,
  editing,
  selected,
  onMove,
  onFocus,
  onRemove,
  onUpdate,
  onSetFontSize,
  onSelect,
  onEditStart,
  onEditEnd,
  zoom,
}: TextWidgetProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const resizeRef = useRef<{ startY: number; startSize: number } | null>(null);
  const x = useMotionValue(instance.x);
  const y = useMotionValue(instance.y);
  const draggable = interactive && !editing;

  useEffect(() => {
    if (x.get() !== instance.x) x.set(instance.x);
    if (y.get() !== instance.y) y.set(instance.y);
  }, [instance.x, instance.y, x, y]);

  // Focus the editor and place the caret at the end when entering edit mode.
  useEffect(() => {
    if (!editing) return;
    const el = editorRef.current;
    if (!el) return;
    if (el.innerText !== (instance.text ?? '')) el.innerText = instance.text ?? '';
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [editing, instance.text]);

  const onHandleDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = {
      startY: event.clientY,
      startSize: instance.fontSize ?? DEFAULT_FONT_SIZE,
    };
  };
  const onHandleMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = resizeRef.current;
    if (!state) return;
    // Screen-space drag → world-space size: divide by zoom so it feels 1:1.
    const deltaWorld = (event.clientY - state.startY) / zoom;
    const next = Math.min(FONT_MAX, Math.max(FONT_MIN, state.startSize + deltaWorld));
    onSetFontSize(instance.id, next);
  };
  const onHandleUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resizeRef.current = null;
  };

  const commit = () => {
    const el = editorRef.current;
    const next = (el?.innerText ?? '').replace(/ /g, ' ');
    if (next.trim() === '') {
      onRemove(instance.id);
      onEditEnd();
      return;
    }
    if (next !== (instance.text ?? '')) onUpdate(instance.id, next);
    onEditEnd();
  };

  return (
    <motion.div
      data-widget="true"
      style={{
        x,
        y,
        scale: isMobile ? 0.9 : 1,
        transformOrigin: 'top left',
        zIndex: instance.z,
        touchAction: 'none',
      }}
      drag={draggable}
      dragMomentum={false}
      dragElastic={0}
      onPointerDown={() => {
        onFocus(instance.id);
        onSelect(instance.id);
      }}
      onDragEnd={() => onMove(instance.id, Math.round(x.get()), Math.round(y.get()))}
      onDoubleClick={() => onEditStart(instance.id)}
      className={cn(
        'absolute top-0 left-0 select-none',
        selected && 'outline outline-1 outline-coral-500/60',
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-text',
      )}
    >
      <div
        ref={editorRef}
        contentEditable={editing}
        suppressContentEditableWarning
        data-placeholder={t('devZone.text.placeholder')}
        spellCheck={false}
        onBlur={commit}
        style={{ fontSize: `${instance.fontSize ?? DEFAULT_FONT_SIZE}px` }}
        className={cn(
          'min-w-[1ch] max-w-[60vw] whitespace-pre-wrap break-words bg-transparent font-mono leading-snug text-dark-900 outline-none dark:text-cream-50',
          'empty:before:text-dark-900/30 empty:before:content-[attr(data-placeholder)] dark:empty:before:text-cream-50/30',
        )}
      >
        {editing ? undefined : instance.text}
      </div>
      {selected && !editing && interactive && (
        <>
          <button
            type="button"
            aria-label={t('devZone.widget.remove')}
            title={t('devZone.widget.remove')}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onRemove(instance.id)}
            className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-coral-500 text-white"
          >
            <X size={10} />
          </button>
          <button
            type="button"
            aria-label={t('devZone.text.resize')}
            title={t('devZone.text.resize')}
            onPointerDown={onHandleDown}
            onPointerMove={onHandleMove}
            onPointerUp={onHandleUp}
            className="absolute -bottom-1.5 -right-1.5 size-3 cursor-nwse-resize rounded-full border border-white bg-coral-500 touch-none"
          />
        </>
      )}
    </motion.div>
  );
}
