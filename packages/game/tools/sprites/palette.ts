/** The shared sprite palette: colour helpers, median-cut selection and file parsing. */
import type { Image } from './image.ts';

/** A colour as red, green and blue, 0 to 255. */
export type Rgb = [number, number, number];

/** The shared palette: the outline stand-in colour plus the fill colours (`#rrggbb`). */
export interface Palette {
  outline: string;
  colours: string[];
}

/** The most colours a sprite may use: the outline plus the fills (spec, Art plan). */
export const MAX_COLOURS = 16;

/** Converts `#rrggbb` to red, green and blue. */
export function hexToRgb(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Converts red, green and blue to lower-case `#rrggbb`. */
export function rgbToHex([r, g, b]: Rgb): string {
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Returns the colour in `colours` closest to `rgb` (green counts most, as the eye does). */
export function nearestColour(rgb: Rgb, colours: Rgb[]): Rgb {
  let best = colours[0];
  let bestDistance = Infinity;
  for (const c of colours) {
    const distance =
      2 * (c[0] - rgb[0]) ** 2 +
      4 * (c[1] - rgb[1]) ** 2 +
      3 * (c[2] - rgb[2]) ** 2;
    if (distance < bestDistance) {
      best = c;
      bestDistance = distance;
    }
  }
  return best;
}

/** Picks `count` colours that represent the filled pixels of all sprites, by median cut. */
export function buildPalette(sprites: Image[], count: number): Rgb[] {
  const pixels: Rgb[] = [];
  for (const { data } of sprites) {
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
  }
  const boxes: Rgb[][] = [pixels];
  while (boxes.length < count) {
    // Split the box that spans the widest range of colour over the most pixels.
    let target = -1;
    let targetScore = 0;
    boxes.forEach((box, index) => {
      const score = box.length * widestRange(box).range;
      if (score > targetScore) {
        target = index;
        targetScore = score;
      }
    });
    if (target < 0) break;
    const { channel } = widestRange(boxes[target]);
    const sorted = [...boxes[target]].sort((a, b) => a[channel] - b[channel]);
    const middle = sorted.length >> 1;
    boxes.splice(target, 1, sorted.slice(0, middle), sorted.slice(middle));
  }
  const colours = new Map<string, Rgb>();
  for (const box of boxes) {
    if (box.length > 0) colours.set(rgbToHex(mean(box)), mean(box));
  }
  return [...colours.values()].sort(
    (a, b) => luminance(a) - luminance(b) || a[0] - b[0],
  );
}

/** Checks the parsed contents of a palette file and returns it. */
export function parsePalette(json: unknown): Palette {
  const hex = /^#[0-9a-f]{6}$/;
  const value = json as { outline?: unknown; colours?: unknown } | null;
  const outline = value?.outline;
  const colours = value?.colours;
  if (
    typeof outline !== 'string' ||
    !hex.test(outline) ||
    !Array.isArray(colours) ||
    !colours.every((c) => typeof c === 'string' && hex.test(c))
  ) {
    throw new Error(
      'palette: expected { "outline": "#rrggbb", "colours": ["#rrggbb", ...] }',
    );
  }
  if (colours.length + 1 > MAX_COLOURS) {
    throw new Error(
      `palette: at most ${MAX_COLOURS - 1} colours plus the outline`,
    );
  }
  if (colours.includes(outline)) {
    throw new Error(
      'palette: the outline colour must not also be a fill colour',
    );
  }
  return { outline, colours: colours as string[] };
}

function widestRange(box: Rgb[]): { channel: 0 | 1 | 2; range: number } {
  let best = { channel: 0 as 0 | 1 | 2, range: 0 };
  for (const channel of [0, 1, 2] as const) {
    let low = 255;
    let high = 0;
    for (const pixel of box) {
      low = Math.min(low, pixel[channel]);
      high = Math.max(high, pixel[channel]);
    }
    if (high - low > best.range) best = { channel, range: high - low };
  }
  return best;
}

function mean(box: Rgb[]): Rgb {
  const sum = [0, 0, 0];
  for (const pixel of box) {
    sum[0] += pixel[0];
    sum[1] += pixel[1];
    sum[2] += pixel[2];
  }
  return sum.map((s) => Math.round(s / box.length)) as Rgb;
}

function luminance([r, g, b]: Rgb): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
