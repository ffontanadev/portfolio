/**
 * Predefined registry of service status "listeners".
 *
 * Most entries are powered by Statuspage.io, whose public `/api/v2/status.json`
 * endpoint returns a normalized `{ status: { indicator, description } }` shape
 * and sends permissive CORS headers, so it can be polled directly from the
 * browser. AWS does not run on Statuspage; it is flagged with a distinct
 * `provider` so the fetcher can adapt (and degrade gracefully if a browser
 * blocks the request).
 *
 * The user chooses which of these to surface on the whiteboard via the dock.
 */

export type StatusProvider = 'statuspage' | 'aws';

export interface StatusService {
  id: string;
  name: string;
  provider: StatusProvider;
  /** Machine-readable status endpoint. */
  statusUrl: string;
  /** Human-facing status page, linked from the widget. */
  homepage: string;
  /** Brand accent used for the widget's identity dot. */
  accent: string;
}

export const STATUS_SERVICES: StatusService[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    provider: 'statuspage',
    statusUrl: 'https://status.claude.com/api/v2/status.json',
    homepage: 'https://status.claude.com',
    accent: '#D97757',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    provider: 'statuspage',
    statusUrl: 'https://status.openai.com/api/v2/status.json',
    homepage: 'https://status.openai.com',
    accent: '#10A37F',
  },
  {
    id: 'github',
    name: 'GitHub',
    provider: 'statuspage',
    statusUrl: 'https://www.githubstatus.com/api/v2/status.json',
    homepage: 'https://www.githubstatus.com',
    accent: '#1A1A1A',
  },
  {
    id: 'aws',
    name: 'AWS',
    provider: 'aws',
    statusUrl: 'https://status.aws.amazon.com/data.json',
    homepage: 'https://health.aws.amazon.com/health/status',
    accent: '#FF9900',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    provider: 'statuspage',
    statusUrl: 'https://www.cloudflarestatus.com/api/v2/status.json',
    homepage: 'https://www.cloudflarestatus.com',
    accent: '#F38020',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    provider: 'statuspage',
    statusUrl: 'https://www.vercel-status.com/api/v2/status.json',
    homepage: 'https://www.vercel-status.com',
    accent: '#1A1A1A',
  },
  {
    id: 'netlify',
    name: 'Netlify',
    provider: 'statuspage',
    statusUrl: 'https://www.netlifystatus.com/api/v2/status.json',
    homepage: 'https://www.netlifystatus.com',
    accent: '#00AD9F',
  },
  {
    id: 'npm',
    name: 'npm',
    provider: 'statuspage',
    statusUrl: 'https://status.npmjs.org/api/v2/status.json',
    homepage: 'https://status.npmjs.org',
    accent: '#CB3837',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    provider: 'statuspage',
    statusUrl: 'https://status.stripe.com/api/v2/status.json',
    homepage: 'https://status.stripe.com',
    accent: '#635BFF',
  },
  {
    id: 'discord',
    name: 'Discord',
    provider: 'statuspage',
    statusUrl: 'https://discordstatus.com/api/v2/status.json',
    homepage: 'https://discordstatus.com',
    accent: '#5865F2',
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    provider: 'statuspage',
    statusUrl: 'https://status.atlassian.com/api/v2/status.json',
    homepage: 'https://status.atlassian.com',
    accent: '#0052CC',
  },
  {
    id: 'datadog',
    name: 'Datadog',
    provider: 'statuspage',
    statusUrl: 'https://status.datadoghq.com/api/v2/status.json',
    homepage: 'https://status.datadoghq.com',
    accent: '#632CA6',
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    provider: 'statuspage',
    statusUrl: 'https://status.digitalocean.com/api/v2/status.json',
    homepage: 'https://status.digitalocean.com',
    accent: '#0080FF',
  },
];

export function getStatusService(id: string): StatusService | undefined {
  return STATUS_SERVICES.find((service) => service.id === id);
}
