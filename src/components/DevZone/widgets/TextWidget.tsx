import { useEffect, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import { DEFAULT_FONT_SIZE } from '../useDevZoneLayout';
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
  onSelect,
  onEditStart,
  onEditEnd,
}: TextWidgetProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const editorRef = useRef<HTMLDivElement | null>(null);
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
    </motion.div>
  );
}
