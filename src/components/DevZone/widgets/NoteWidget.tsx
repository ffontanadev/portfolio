import { StickyNote } from 'lucide-react';
import { useTranslation } from '@/i18n';
import Widget from '../Widget';
import type { WidgetInstance } from '../types';

interface NoteWidgetProps {
  instance: WidgetInstance;
  interactive?: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onFocus: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}

/** A pasted text note — an editable sticky living on the whiteboard. */
export default function NoteWidget({ onUpdate, ...props }: NoteWidgetProps) {
  const { t } = useTranslation();
  const { instance } = props;

  return (
    <Widget {...props} title={t('devZone.note.title')} icon={<StickyNote size={14} />}>
      <textarea
        value={instance.text ?? ''}
        onChange={(event) => onUpdate(instance.id, event.target.value)}
        placeholder={t('devZone.note.placeholder')}
        spellCheck={false}
        className="h-32 w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-dark-900 outline-none placeholder:text-dark-900/30"
      />
    </Widget>
  );
}
