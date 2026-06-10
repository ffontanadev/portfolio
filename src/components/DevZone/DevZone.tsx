import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MousePointer2 } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { useDevZoneLayout } from './useDevZoneLayout';
import Dock from './Dock';
import MusicPlayerWidget from './widgets/MusicPlayerWidget';
import PomodoroWidget from './widgets/PomodoroWidget';
import StatusListenerWidget from './widgets/StatusListenerWidget';
import type { WidgetInstance } from './types';

/**
 * The Dev Zone whiteboard: a free-form canvas of draggable, pinnable developer
 * widgets (radio, pomodoro, service status listeners) whose layout persists to
 * localStorage. The dock spawns new widgets; the canvas hosts and bounds them.
 */
export default function DevZone() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const { widgets, addWidget, removeWidget, moveWidget, togglePin, focusWidget, resetLayout } =
    useDevZoneLayout();

  const activeServiceIds = widgets
    .filter((w) => w.type === 'status' && w.serviceId)
    .map((w) => w.serviceId as string);

  const renderWidget = (instance: WidgetInstance) => {
    const shared = {
      key: instance.id,
      instance,
      canvasRef,
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

  return (
    <section className="relative min-h-screen pt-24 pb-28">
      <div className="mx-auto max-w-[1440px] px-6 md:px-20">
        <Link
          to="/"
          className="reveal-underline inline-flex items-center gap-1.5 font-mono text-xs text-dark-900/50 transition-colors hover:text-coral-500"
        >
          <ArrowLeft size={14} />
          {t('devZone.back')}
        </Link>
        <div className="mt-4 mb-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-eyebrow text-coral-500">{t('devZone.eyebrow')}</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-dark-900 md:text-5xl">
              {t('devZone.title')}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-dark-900/55">{t('devZone.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Whiteboard canvas — dotted grid surface; bounds widget dragging. */}
      <div
        ref={canvasRef}
        className="relative mx-4 mt-6 min-h-[640px] overflow-hidden rounded-3xl border border-dark-900/10 md:mx-8"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(26,26,26,0.07) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      >
        {widgets.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-dark-900/35">
            <MousePointer2 size={28} />
            <p className="font-mono text-xs tracking-wide">{t('devZone.empty')}</p>
          </div>
        )}
        {widgets.map(renderWidget)}
      </div>

      <Dock onAdd={addWidget} onReset={resetLayout} activeServiceIds={activeServiceIds} />
    </section>
  );
}
