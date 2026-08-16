// Vitest setup. jsdom provides localStorage but not matchMedia, which Framer
// Motion's reduced-motion hooks query, so stub a minimal version here.
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();
});

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}
