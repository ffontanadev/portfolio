export type TourStopId = 'techStack' | 'featuredWorks' | 'agents' | 'devZone';

export interface TourStop {
  id: TourStopId;
  /** CSS selector resolved against the live DOM at runtime. */
  selector: string;
  /** i18n key for the caption copy. */
  captionKey: string;
  orbit: { radius: number; revolutions: number };
  captionPlacement: 'top' | 'bottom' | 'left' | 'right';
  scrollAlign: 'center' | 'start';
}

export const TOUR_STOPS: TourStop[] = [
  {
    id: 'techStack',
    selector: '[data-tour-id="tech-stack"]',
    captionKey: 'tour.stops.techStack',
    orbit: { radius: 90, revolutions: 1.75 },
    captionPlacement: 'top',
    scrollAlign: 'center',
  },
  {
    id: 'featuredWorks',
    selector: '[data-tour-id="featured-works"]',
    captionKey: 'tour.stops.featuredWorks',
    orbit: { radius: 110, revolutions: 1.5 },
    captionPlacement: 'right',
    scrollAlign: 'center',
  },
  {
    id: 'agents',
    selector: '[data-tour-id="agents"]',
    captionKey: 'tour.stops.agents',
    orbit: { radius: 110, revolutions: 1.5 },
    captionPlacement: 'top',
    scrollAlign: 'center',
  },
  {
    id: 'devZone',
    selector: '[data-tour-id="dev-zone"]',
    captionKey: 'tour.stops.devZone',
    orbit: { radius: 46, revolutions: 2 },
    captionPlacement: 'bottom',
    scrollAlign: 'start',
  },
];

export function resolveStopElement(stop: TourStop): HTMLElement | null {
  return document.querySelector<HTMLElement>(stop.selector);
}
