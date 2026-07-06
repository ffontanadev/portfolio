import { Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '@/i18n';
import Widget from '../Widget';
import type { WidgetInstance } from '../types';

interface ImageWidgetProps {
  instance: WidgetInstance;
  interactive?: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onFocus: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRemove: (id: string) => void;
}

/** A pasted image pinned onto the whiteboard, sized to fit its content. */
export default function ImageWidget(props: ImageWidgetProps) {
  const { t } = useTranslation();
  const { instance } = props;

  return (
    <Widget
      {...props}
      title={t('devZone.image.title')}
      icon={<ImageIcon size={14} />}
      className="w-auto"
    >
      {instance.src ? (
        <img
          src={instance.src}
          alt={t('devZone.image.title')}
          draggable={false}
          style={{ width: instance.width, height: instance.height }}
          className="block max-w-[70vw] select-none object-contain"
        />
      ) : (
        <p className="p-4 text-sm text-dark-900/50 dark:text-cream-50/50">{t('devZone.image.unavailable')}</p>
      )}
    </Widget>
  );
}
