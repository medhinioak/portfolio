/** Checks a finished 32 × 32 sprite PNG against the palette and exports it as an SVG. */
import { gzipSync } from 'node:zlib';
import type { Image } from './image.ts';
import { GRID } from './sprite.ts';
import { rgbToHex, type Palette } from './palette.ts';

/** The size an exported sprite should stay under, in gzipped bytes (ADR-0014). */
export const SVG_SIZE_LIMIT = 2048;

/** Returns the size of an SVG in bytes after gzip, which is what a visitor downloads. */
export function gzippedSize(svg: string): number {
  return gzipSync(svg, { level: 9 }).length;
}

function pixelHex(image: Image, x: number, y: number): string | null {
  const i = (y * image.width + x) * 4;
  const { data } = image;
  return data[i + 3] === 0
    ? null
    : rgbToHex([data[i], data[i + 1], data[i + 2]]);
}

/** Lists what is wrong with a sprite PNG: wrong size, half-transparent pixels, colours off the palette. */
export function checkSprite(image: Image, palette: Palette): string[] {
  if (image.width !== GRID || image.height !== GRID) {
    return [
      `size is ${image.width} × ${image.height}, expected ${GRID} × ${GRID}`,
    ];
  }
  const allowed = new Set([palette.outline, ...palette.colours]);
  const problems = new Set<string>();
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const alpha = image.data[(y * GRID + x) * 4 + 3];
      if (alpha !== 0 && alpha !== 255) {
        problems.add(`pixel ${x},${y} is half transparent`);
        continue;
      }
      const hex = pixelHex(image, x, y);
      if (hex !== null && !allowed.has(hex)) {
        problems.add(
          `pixel ${x},${y} uses ${hex}, which is not in the palette`,
        );
      }
    }
  }
  return [...problems];
}

/** Exports a checked sprite as an SVG: one path per colour, made of merged rectangles. */
export function spriteToSvg(image: Image, palette: Palette): string {
  const paths = new Map<string, string>();
  const open = new Map<
    string,
    { x: number; y: number; w: number; h: number }
  >();
  const rects = new Map<
    string,
    { x: number; y: number; w: number; h: number }[]
  >();
  for (let y = 0; y < GRID; y++) {
    const stillOpen = new Set<string>();
    let x = 0;
    while (x < GRID) {
      const hex = pixelHex(image, x, y);
      if (hex === null) {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < GRID && pixelHex(image, end, y) === hex) end++;
      // A run directly under a run of the same colour, position and width grows that rectangle.
      const key = `${hex}:${x}:${end - x}`;
      const above = open.get(key);
      if (above) {
        above.h++;
      } else {
        const rect = { x, y, w: end - x, h: 1 };
        open.set(key, rect);
        rects.set(hex, [...(rects.get(hex) ?? []), rect]);
      }
      stillOpen.add(key);
      x = end;
    }
    for (const key of open.keys()) if (!stillOpen.has(key)) open.delete(key);
  }
  for (const [hex, list] of rects) {
    const d = list.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h-${r.w}z`).join('');
    const fill = hex === palette.outline ? 'currentColor' : shortHex(hex);
    paths.set(fill, `<path fill="${fill}" d="${d}"/>`);
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID} ${GRID}" shape-rendering="crispEdges">` +
    [...paths.values()].join('') +
    '</svg>\n'
  );
}

function shortHex(hex: string): string {
  const [, a, b, c, d, e, f] = hex;
  return a === b && c === d && e === f ? `#${a}${c}${e}` : hex;
}
