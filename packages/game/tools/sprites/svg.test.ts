import { describe, expect, it } from 'vitest';
import { blankImage } from './image.ts';
import { GRID } from './sprite.ts';
import {
  checkSprite,
  gzippedSize,
  spriteToSvg,
  SVG_SIZE_LIMIT,
} from './svg.ts';

const palette = { outline: '#1b1a23', colours: ['#ff0000', '#00aa00'] };

/** A sprite with a 2 × 2 red block outlined by one pixel, and a green dot beside it. */
function sprite(): ReturnType<typeof blankImage> {
  const image = blankImage(GRID, GRID);
  const set = (x: number, y: number, hex: string): void => {
    image.data.set(
      [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5), 16),
        255,
      ],
      (y * GRID + x) * 4,
    );
  };
  for (let y = 4; y < 8; y++)
    for (let x = 4; x < 8; x++) set(x, y, palette.outline);
  for (let y = 5; y < 7; y++) for (let x = 5; x < 7; x++) set(x, y, '#ff0000');
  set(20, 10, '#00aa00');
  return image;
}

/** Paints the rectangles of an exported SVG back into a map of "x,y" to fill. */
function paintBack(svg: string): Map<string, string> {
  const painted = new Map<string, string>();
  for (const [, fill, d] of svg.matchAll(/<path fill="([^"]+)" d="([^"]+)"/g)) {
    for (const [, x, y, w, h] of d.matchAll(/M(\d+) (\d+)h(\d+)v(\d+)/g)) {
      for (let j = 0; j < Number(h); j++) {
        for (let i = 0; i < Number(w); i++)
          painted.set(`${Number(x) + i},${Number(y) + j}`, fill);
      }
    }
  }
  return painted;
}

describe('checkSprite', () => {
  it('accepts a sprite that uses only the palette', () => {
    expect(checkSprite(sprite(), palette)).toEqual([]);
  });

  it('rejects the wrong size', () => {
    expect(checkSprite(blankImage(16, 16), palette)[0]).toContain(
      'expected 32 × 32',
    );
  });

  it('names pixels that use a colour outside the palette, and half-transparent pixels', () => {
    const image = sprite();
    image.data.set([1, 2, 3, 255], (0 * GRID + 0) * 4);
    image.data.set([255, 0, 0, 128], (0 * GRID + 1) * 4);
    expect(checkSprite(image, palette)).toEqual([
      'pixel 0,0 uses #010203, which is not in the palette',
      'pixel 1,0 is half transparent',
    ]);
  });
});

describe('spriteToSvg', () => {
  it('draws exactly the filled pixels, with the outline as currentColor', () => {
    const painted = paintBack(spriteToSvg(sprite(), palette));
    expect(painted.size).toBe(16 + 1);
    expect(painted.get('4,4')).toBe('currentColor');
    expect(painted.get('5,5')).toBe('#f00');
    expect(painted.get('20,10')).toBe('#0a0');
    expect(painted.has('0,0')).toBe(false);
  });

  it('merges neighbouring pixels into few rectangles', () => {
    const svg = spriteToSvg(sprite(), palette);
    // The ring is 4 rectangles at most, the block 1, the dot 1.
    expect(svg.match(/M\d+ \d+h/g)?.length).toBeLessThanOrEqual(6);
    expect(gzippedSize(svg)).toBeLessThan(SVG_SIZE_LIMIT);
  });

  it('is a plain SVG with no script, metadata or embedded image', () => {
    const svg = spriteToSvg(sprite(), palette);
    expect(svg).toMatch(
      /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 32 32"/,
    );
    expect(svg).not.toMatch(/<(script|metadata|image|style|title)/);
  });
});
