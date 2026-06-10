import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { StatusService } from '../data/statusServices';

/** Normalized status severity, aligned with the Statuspage indicator vocabulary. */
export type StatusIndicator = 'none' | 'minor' | 'major' | 'critical' | 'maintenance' | 'unknown';

export interface ServiceStatus {
  indicator: StatusIndicator;
  description: string;
}

interface StatuspageResponse {
  status?: {
    indicator?: string;
    description?: string;
  };
}

interface AwsStatusResponse {
  current?: Array<{ status?: number }>;
}

function normalizeIndicator(value: string | undefined): StatusIndicator {
  switch (value) {
    case 'none':
    case 'minor':
    case 'major':
    case 'critical':
    case 'maintenance':
      return value;
    default:
      return 'unknown';
  }
}

async function fetchStatuspage(service: StatusService): Promise<ServiceStatus> {
  const res = await fetch(service.statusUrl, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const data = (await res.json()) as StatuspageResponse;
  return {
    indicator: normalizeIndicator(data.status?.indicator),
    description: data.status?.description ?? 'Unknown',
  };
}

// AWS publishes a legacy data.json; its statuses are numeric (0 = ok, 1 = info,
// 2 = degraded, 3 = outage). Browsers may block it via CORS, in which case the
// query surfaces an error and the widget degrades gracefully.
async function fetchAws(service: StatusService): Promise<ServiceStatus> {
  const res = await fetch(service.statusUrl, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const data = (await res.json()) as AwsStatusResponse;
  const current = data.current ?? [];
  const worst = current.reduce((max, item) => Math.max(max, item.status ?? 0), 0);
  if (worst >= 3) return { indicator: 'critical', description: 'Service disruption' };
  if (worst === 2) return { indicator: 'major', description: 'Degraded performance' };
  if (worst === 1) return { indicator: 'minor', description: 'Informational' };
  return { indicator: 'none', description: 'Service is operating normally' };
}

function fetchServiceStatus(service: StatusService): Promise<ServiceStatus> {
  return service.provider === 'aws' ? fetchAws(service) : fetchStatuspage(service);
}

/**
 * Polls a service's public status endpoint on an interval, acting as a live
 * "listener". Refetches every 60s and on reconnect; errors are left to the
 * widget to render as an unknown/unreachable state.
 */
export function useServiceStatus(service: StatusService): UseQueryResult<ServiceStatus, Error> {
  return useQuery({
    queryKey: ['devzone', 'status', service.id],
    queryFn: () => fetchServiceStatus(service),
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1,
  });
}
