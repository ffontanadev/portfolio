import { Activity, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import Widget from '../Widget';
import type { WidgetInstance } from '../types';
import { getStatusService } from '../data/statusServices';
import { useServiceStatus, type StatusIndicator } from '../hooks/useServiceStatus';

interface StatusWidgetProps {
  instance: WidgetInstance;
  interactive?: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onFocus: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRemove: (id: string) => void;
}

const INDICATOR_COLOR: Record<StatusIndicator, string> = {
  none: 'var(--color-teal-500)',
  minor: '#F59E0B',
  major: '#F97316',
  critical: 'var(--color-coral-500)',
  maintenance: '#3B82F6',
  unknown: '#9CA3AF',
};

export default function StatusListenerWidget(props: StatusWidgetProps) {
  const { t } = useTranslation();
  const service = props.instance.serviceId ? getStatusService(props.instance.serviceId) : undefined;

  // A status widget without a valid service reference is unrenderable — show a
  // minimal frame so the user can still remove it.
  if (!service) {
    return (
      <Widget {...props} title={t('devZone.status.title')} icon={<Activity size={14} />}>
        <p className="text-sm text-dark-900/50">{t('devZone.status.unavailable')}</p>
      </Widget>
    );
  }

  return <StatusBody {...props} service={service} />;
}

function StatusBody({
  service,
  ...props
}: StatusWidgetProps & { service: NonNullable<ReturnType<typeof getStatusService>> }) {
  const { t } = useTranslation();
  const { data, isPending, isError, isFetching, dataUpdatedAt, refetch } =
    useServiceStatus(service);

  const indicator: StatusIndicator = isError ? 'unknown' : (data?.indicator ?? 'unknown');
  const dotColor = INDICATOR_COLOR[indicator];

  const description = isError
    ? t('devZone.status.unreachable')
    : (data?.description ?? t('devZone.status.checking'));

  const updatedLabel =
    dataUpdatedAt && !isError
      ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '—';

  return (
    <Widget
      {...props}
      title={service.name}
      icon={<Activity size={14} />}
      accent={service.accent}
    >
      <div className="flex items-start gap-3">
        <span className="relative mt-1 flex size-3 shrink-0">
          {indicator !== 'none' && indicator !== 'unknown' && (
            <span
              className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: dotColor }}
            />
          )}
          <span
            className="relative inline-flex size-3 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        </span>
        <div className="min-w-0 flex-1">
          {isPending ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-dark-900/50">
              <Loader2 size={13} className="animate-spin" />
              {t('devZone.status.checking')}
            </span>
          ) : (
            <p className="text-sm leading-snug text-dark-900">{description}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-dark-900/10 pt-2 font-mono text-[10px] text-dark-900/40">
        <span>
          {t('devZone.status.updated')} {updatedLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded p-1 transition-colors hover:bg-dark-900/5 hover:text-dark-900"
            aria-label={t('devZone.status.refresh')}
          >
            <RefreshCw size={12} className={cn(isFetching && 'animate-spin')} />
          </button>
          <a
            href={service.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1 transition-colors hover:bg-dark-900/5 hover:text-dark-900"
            aria-label={t('devZone.status.openPage')}
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </Widget>
  );
}
