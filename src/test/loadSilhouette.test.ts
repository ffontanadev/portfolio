import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadSilhouette } from '@/components/Hero/particles/silhouetteSampler';

/**
 * The logo marks come off a CDN, so a failed load is a routine event, not an
 * exceptional one — an offline visitor fails every one of them. These tests
 * pin that failing loads stay contained.
 */

let outcome: 'error' | 'load' = 'error';
const realImage = globalThis.Image;

// jsdom never fetches, so neither handler would ever fire on a real Image.
// This stand-in settles on the next microtask instead.
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin: string | null = null;
  #src = '';

  get src(): string {
    return this.#src;
  }

  set src(next: string) {
    this.#src = next;
    queueMicrotask(() => {
      if (outcome === 'error') this.onerror?.();
      else this.onload?.();
    });
  }
}

beforeEach(() => {
  globalThis.Image = FakeImage as unknown as typeof Image;
});

afterEach(() => {
  globalThis.Image = realImage;
  outcome = 'error';
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('loadSilhouette', () => {
  it('rejects with the failing url so callers can log it', async () => {
    await expect(loadSilhouette('https://cdn.example/java.svg')).rejects.toThrow(
      /java\.svg/,
    );
  });

  it('leaves no unhandled rejection behind when a load fails', async () => {
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', onUnhandled);
    try {
      // The caller handles its own rejection; nothing else may be left dangling.
      await loadSilhouette('https://cdn.example/spring.svg').catch(() => {});
      await flush();
      await flush();
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
    expect(unhandled).toEqual([]);
  });

  it('retries a previously failed url instead of caching the failure', async () => {
    await loadSilhouette('https://cdn.example/docker.svg').catch(() => {});
    await flush();
    outcome = 'load';
    await expect(loadSilhouette('https://cdn.example/docker.svg')).resolves.toBeDefined();
  });
});
