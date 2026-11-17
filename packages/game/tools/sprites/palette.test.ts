import { describe, expect, it } from 'vitest';
import {
  buildPalette,
  hexToRgb,
  nearestColour,
  parsePalette,
  rgbToHex,
} from './palette.ts';
import { drawImage } from './testing.ts';

describe('colour conversion', () => {
  it('round-trips between hex and RGB', () => {
    expect(rgbToHex(hexToRgb('#1b1a23'))).toBe('#1b1a23');
    expect(rgbToHex([0, 0, 255])).toBe('#0000ff');
  });
});

describe('nearestColour', () => {
  it('picks the closest of the given colours', () => {
    expect(
      nearestColour(
        [250, 10, 10],
        [
          [0, 0, 0],
          [255, 0, 0],
          [0, 255, 0],
        ],
      ),
    ).toEqual([255, 0, 0]);
  });
});

describe('buildPalette', () => {
  const image = drawImage(['rrrggg.'], {
    r: [200, 20, 20],
    g: [20, 200, 20],
  });

  it('returns a colour for each distinct area, using the average of the area', () => {
    expect(buildPalette([image], 2)).toEqual([
      [200, 20, 20],
      [20, 200, 20],
    ]);
  });

  it('stops at the distinct colours when more are asked for, and ignores empty pixels', () => {
    expect(buildPalette([image], 50)).toHaveLength(2);
  });

  it('gives the same palette for the same sprites', () => {
    expect(buildPalette([image], 2)).toEqual(buildPalette([image], 2));
  });
});

describe('parsePalette', () => {
  it('accepts an outline and fill colours', () => {
    expect(parsePalette({ outline: '#111111', colours: ['#222222'] })).toEqual({
      outline: '#111111',
      colours: ['#222222'],
    });
  });

  it('rejects a bad shape, too many colours, and an outline that is also a fill', () => {
    expect(() => parsePalette({ outline: 'red', colours: [] })).toThrow(
      'expected',
    );
    const sixteen = Array.from(
      { length: 16 },
      (_, i) => `#0000${(i + 16).toString(16)}`,
    );
    expect(() =>
      parsePalette({ outline: '#111111', colours: sixteen }),
    ).toThrow('at most 15');
    expect(() =>
      parsePalette({ outline: '#111111', colours: ['#111111'] }),
    ).toThrow('outline');
  });
});
