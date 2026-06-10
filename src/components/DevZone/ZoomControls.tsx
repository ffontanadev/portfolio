import { Maximize, Minus, Plus } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

/** Bottom-right zoom readout with step controls and a reset-to-100% action. */
export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  const { t } = useTranslation();

  return (
    <div data-no-zoom className="pointer-events-none fixed right-5 bottom-5 z-40 hidden justify-end sm:flex">
      <div className="glass-card pointer-events-auto flex items-center gap-0.5 rounded-full px-1.5 py-1.5">
        <button
          type="button"
          onClick={onZoomOut}
          title={t('devZone.zoom.out')}
          aria-label={t('devZone.zoom.out')}
          className="rounded-full p-1.5 text-dark-900 transition-colors hover:bg-dark-900/5"
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          onClick={onReset}
          title={t('devZone.zoom.reset')}
          aria-label={t('devZone.zoom.reset')}
          className="min-w-12 rounded-full px-2 py-1 text-center font-mono text-xs font-medium text-dark-900 tabular-nums transition-colors hover:bg-dark-900/5"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          title={t('devZone.zoom.in')}
          aria-label={t('devZone.zoom.in')}
          className="rounded-full p-1.5 text-dark-900 transition-colors hover:bg-dark-900/5"
        >
          <Plus size={16} />
        </button>
        <span className="mx-0.5 h-5 w-px bg-dark-900/10" aria-hidden="true" />
        <button
          type="button"
          onClick={onReset}
          title={t('devZone.zoom.fit')}
          aria-label={t('devZone.zoom.fit')}
          className="rounded-full p-1.5 text-dark-900 transition-colors hover:bg-dark-900/5"
        >
          <Maximize size={15} />
        </button>
      </div>
    </div>
  );
}
