import { describe, expect, it } from 'vitest';
import { clamp } from './clamp';

describe('clamp', () => {
  it('returns the value when it is within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when the value is below range', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it('returns max when the value is above range', () => {
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it('returns the bound when min equals max', () => {
    expect(clamp(7, 3, 3)).toBe(3);
  });

  it('throws when min is greater than max', () => {
    expect(() => clamp(1, 10, 0)).toThrow(RangeError);
  });

  it.each([
    [NaN, 0, 10],
    [5, NaN, 10],
    [5, 0, NaN],
  ])('throws when an argument is NaN: clamp(%s, %s, %s)', (value, min, max) => {
    expect(() => clamp(value, min, max)).toThrow(RangeError);
  });
});
