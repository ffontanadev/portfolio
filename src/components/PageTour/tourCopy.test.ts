import { describe, it, expect } from 'vitest';
import { messages } from '@/i18n/config';
import { translate } from '@/i18n/translate';
import { TOUR_STOPS } from './tourStops';

const LOCALES = Object.keys(messages) as (keyof typeof messages)[];

describe('tour copy', () => {
  it('resolves skip + replay labels in every locale', () => {
    for (const loc of LOCALES) {
      expect(translate(messages[loc], 'tour.skip')).not.toBe('tour.skip');
      expect(translate(messages[loc], 'tour.replay')).not.toBe('tour.replay');
    }
  });
  it('resolves every stop caption in every locale', () => {
    for (const loc of LOCALES) {
      for (const stop of TOUR_STOPS) {
        const text = translate(messages[loc], stop.captionKey);
        expect(text).not.toBe(stop.captionKey); // key echoed back == missing
        expect(text.length).toBeGreaterThan(0);
      }
    }
  });
});
