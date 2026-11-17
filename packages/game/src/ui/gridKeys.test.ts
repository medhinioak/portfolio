import { describe, expect, it } from 'vitest';
import { nextCardIndex } from './gridKeys';

/** 24 cards in 6 columns (desktop): rows 0–5, 6–11, 12–17, 18–23. */
const desktop = (index: number, key: string, ctrl = false): number | null =>
  nextCardIndex(index, key, ctrl, 6, 24);

describe('nextCardIndex', () => {
  it('moves by one card across and one row down or up', () => {
    expect(desktop(7, 'ArrowRight')).toBe(8);
    expect(desktop(7, 'ArrowLeft')).toBe(6);
    expect(desktop(7, 'ArrowDown')).toBe(13);
    expect(desktop(7, 'ArrowUp')).toBe(1);
  });

  it('stops at the edges instead of wrapping', () => {
    expect(desktop(6, 'ArrowLeft')).toBe(6);
    expect(desktop(11, 'ArrowRight')).toBe(11);
    expect(desktop(2, 'ArrowUp')).toBe(2);
    expect(desktop(20, 'ArrowDown')).toBe(20);
  });

  it('goes to the ends of the row, or of the grid with Ctrl', () => {
    expect(desktop(9, 'Home')).toBe(6);
    expect(desktop(9, 'End')).toBe(11);
    expect(desktop(9, 'Home', true)).toBe(0);
    expect(desktop(9, 'End', true)).toBe(23);
  });

  it('follows the column count, as on a phone', () => {
    expect(nextCardIndex(5, 'ArrowDown', false, 4, 24)).toBe(9);
    expect(nextCardIndex(7, 'ArrowRight', false, 4, 24)).toBe(7);
  });

  it('handles a last row that is not full', () => {
    // 10 cards in 4 columns: the last row is 8–9.
    expect(nextCardIndex(9, 'ArrowRight', false, 4, 10)).toBe(9);
    expect(nextCardIndex(8, 'End', false, 4, 10)).toBe(9);
    expect(nextCardIndex(7, 'ArrowDown', false, 4, 10)).toBe(7);
    expect(nextCardIndex(5, 'ArrowDown', false, 4, 10)).toBe(9);
  });

  it('ignores other keys, so Space and Enter still press the card', () => {
    expect(desktop(3, ' ')).toBeNull();
    expect(desktop(3, 'Enter')).toBeNull();
    expect(desktop(3, 'a')).toBeNull();
  });
});
