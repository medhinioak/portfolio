import { describe, expect, it } from 'vitest';
import {
  applyPalette,
  cropToContent,
  despeckle,
  fitToGrid,
  markOutline,
  removeBackground,
  splitSheet,
} from './sprite.ts';
import { drawImage, readRows } from './testing.ts';

const WHITE: [number, number, number] = [255, 255, 255];
const DARK: [number, number, number] = [20, 20, 30];
const RED: [number, number, number] = [200, 30, 30];
const colours = { w: WHITE, d: DARK, r: RED };

describe('removeBackground', () => {
  it('clears white that touches the border but keeps white inside the animal', () => {
    const image = drawImage(
      ['wwwww', 'wdddw', 'wdwdw', 'wdddw', 'wwwww'],
      colours,
    );
    expect(readRows(removeBackground(image), colours)).toEqual([
      '.....',
      '.ddd.',
      '.dwd.',
      '.ddd.',
      '.....',
    ]);
  });
});

describe('cropToContent', () => {
  it('cuts to the box around the filled pixels', () => {
    const image = drawImage(['.....', '..dd.', '..dd.', '.....'], colours);
    expect(readRows(cropToContent(image), colours)).toEqual(['dd', 'dd']);
  });

  it('refuses an empty image', () => {
    expect(() => cropToContent(drawImage(['...'], colours))).toThrow(
      'no filled pixels',
    );
  });
});

describe('fitToGrid', () => {
  it('scales the longer side to the grid, centres it and stands it on the bottom row', () => {
    const wide = drawImage(['dddddddd', 'dddddddd'], colours);
    expect(readRows(fitToGrid(wide, 4), colours)).toEqual([
      '....',
      '....',
      '....',
      'dddd',
    ]);
  });

  it('centres a narrow animal', () => {
    const tall = drawImage(['dd', 'dd', 'dd', 'dd'], colours);
    expect(readRows(fitToGrid(tall, 8), colours)[7]).toBe('..dddd..');
  });

  it('fills a grid pixel only when at least half of its source pixels are filled', () => {
    // Each grid pixel covers 2 × 2 source pixels: the left one has 2 of 4, the right one 1 of 4.
    const image = drawImage(['dd.r', 'dd..', 'dd..', 'dd..'], colours);
    const grid = fitToGrid(cropToContent(image), 2);
    expect(readRows(grid, colours)).toEqual(['d.', 'd.']);
  });
});

describe('applyPalette', () => {
  it('maps filled pixels to the closest palette colour and leaves empty pixels empty', () => {
    const image = drawImage(['a.b'], { a: [210, 40, 40], b: [30, 30, 40] });
    expect(readRows(applyPalette(image, [RED, DARK]), colours)).toEqual([
      'r.d',
    ]);
  });
});

describe('despeckle', () => {
  it('replaces a lone pixel with the colour around it and keeps lines and areas', () => {
    const image = drawImage(
      ['dddd.', 'ddrd.', 'dddd.', '.....', 'rrr..'],
      colours,
    );
    expect(readRows(despeckle(image), colours)).toEqual([
      'dddd.',
      'dddd.',
      'dddd.',
      '.....',
      'rrr..',
    ]);
  });

  it('leaves an isolated pixel with no neighbours alone', () => {
    expect(readRows(despeckle(drawImage(['.r.'], colours)), colours)).toEqual([
      '.r.',
    ]);
  });
});

describe('markOutline', () => {
  it('paints edge pixels, including those on the border, and leaves the inside alone', () => {
    const image = drawImage(['ddd', 'ddd', 'ddd'], colours);
    expect(readRows(markOutline(image, RED), colours)).toEqual([
      'rrr',
      'rdr',
      'rrr',
    ]);
  });
});

describe('splitSheet', () => {
  /** A white sheet: a caption bar over each animal, the second animal wider than its caption. */
  function sheet(): ReturnType<typeof drawImage> {
    const rows = Array.from({ length: 60 }, () => 'w'.repeat(80));
    const paint = (
      top: number,
      bottom: number,
      left: number,
      right: number,
    ): void => {
      for (let y = top; y < bottom; y++) {
        rows[y] =
          rows[y].slice(0, left) +
          'd'.repeat(right - left) +
          rows[y].slice(right);
      }
    };
    paint(2, 6, 5, 20); // caption 1
    paint(2, 6, 45, 55); // caption 2
    paint(14, 54, 5, 25); // animal 1
    paint(14, 54, 40, 75); // animal 2, wider than its caption
    return drawImage(rows, colours);
  }

  it('returns one image per animal, left to right, without the captions', () => {
    const animals = splitSheet(sheet(), 2);
    expect(animals.map((a) => [a.width, a.height])).toEqual([
      [20, 40],
      [35, 40],
    ]);
  });

  it('throws when the sheet holds a different number of animals', () => {
    expect(() => splitSheet(sheet(), 3)).toThrow(
      'expected 3 animals on the sheet but found 2',
    );
  });
});
