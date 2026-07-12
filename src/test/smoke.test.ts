import { describe, it, expect } from 'vitest';

describe('test infra', () => {
  it('runs in jsdom with localStorage available', () => {
    localStorage.setItem('k', 'v');
    expect(localStorage.getItem('k')).toBe('v');
    expect(typeof document).toBe('object');
  });
});
