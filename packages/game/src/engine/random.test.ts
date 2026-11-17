import { describe, expect, it } from 'vitest';
import { createRandom, pickOne } from './random';

/** The first n numbers of a generator. */
function take(seed: number | string, n: number): number[] {
  const random = createRandom(seed);
  return Array.from({ length: n }, () => random());
}

describe('createRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    expect(take(42, 5)).toEqual(take(42, 5));
    expect(take('tail-trail', 5)).toEqual(take('tail-trail', 5));
  });

  it('gives different sequences for different seeds', () => {
    expect(take(1, 5)).not.toEqual(take(2, 5));
    expect(take('a', 5)).not.toEqual(take('b', 5));
  });

  it('stays in [0, 1)', () => {
    for (const n of take(7, 10_000)) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});

describe('pickOne', () => {
  it('follows the seed and can pick every item', () => {
    const items = ['a', 'b', 'c', 'd'];
    const picks = (seed: number): string[] => {
      const random = createRandom(seed);
      return Array.from({ length: 50 }, () => pickOne(items, random));
    };
    expect(picks(3)).toEqual(picks(3));
    expect(new Set(picks(3))).toEqual(new Set(items));
  });

  it('throws on an empty list', () => {
    expect(() => pickOne([], createRandom(1))).toThrow();
  });
});
