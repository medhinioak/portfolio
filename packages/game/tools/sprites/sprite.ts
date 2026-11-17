/** Turns a large draft image into a 32 × 32 sprite on the shared palette, and cuts sheets apart. */
import { blankImage, type Image } from './image.ts';
import { nearestColour, type Rgb } from './palette.ts';

/** Width and height of a sprite in pixels. */
export const GRID = 32;

/** How far from pure white a pixel can be and still count as background. */
const BACKGROUND_TOLERANCE = 36;

function isNearWhite(data: Uint8Array, i: number): boolean {
  const limit = 255 - BACKGROUND_TOLERANCE;
  return data[i] >= limit && data[i + 1] >= limit && data[i + 2] >= limit;
}

/** Makes the white background transparent. White inside the animal is kept. */
export function removeBackground(image: Image): Image {
  const { width, height } = image;
  const data = new Uint8Array(image.data);
  const seen = new Uint8Array(width * height);
  const stack: number[] = [];
  const visit = (x: number, y: number): void => {
    const p = y * width + x;
    if (seen[p] || !isNearWhite(data, p * 4)) return;
    seen[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < width; x++) {
    visit(x, 0);
    visit(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    visit(0, y);
    visit(width - 1, y);
  }
  while (stack.length > 0) {
    const p = stack.pop() as number;
    data[p * 4 + 3] = 0;
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) visit(x - 1, y);
    if (x < width - 1) visit(x + 1, y);
    if (y > 0) visit(x, y - 1);
    if (y < height - 1) visit(x, y + 1);
  }
  return { width, height, data };
}

/** Cuts the image down to the box around its filled pixels. */
export function cropToContent(image: Image): Image {
  const { width, height, data } = image;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < 0) throw new Error('the image has no filled pixels');
  return crop(image, left, top, right + 1, bottom + 1);
}

/**
 * Scales a cropped animal to fit the grid, centred sideways and standing on the bottom row.
 * A grid pixel is filled when at least half of the source pixels behind it are.
 */
export function fitToGrid(image: Image, size = GRID): Image {
  const scale = size / Math.max(image.width, image.height);
  const scaledWidth = Math.max(1, Math.round(image.width * scale));
  const scaledHeight = Math.max(1, Math.round(image.height * scale));
  const offsetX = Math.floor((size - scaledWidth) / 2);
  const offsetY = size - scaledHeight;
  const grid = blankImage(size, size);
  for (let gy = 0; gy < scaledHeight; gy++) {
    for (let gx = 0; gx < scaledWidth; gx++) {
      const x0 = Math.floor((gx * image.width) / scaledWidth);
      const x1 = Math.max(
        x0 + 1,
        Math.floor(((gx + 1) * image.width) / scaledWidth),
      );
      const y0 = Math.floor((gy * image.height) / scaledHeight);
      const y1 = Math.max(
        y0 + 1,
        Math.floor(((gy + 1) * image.height) / scaledHeight),
      );
      let filled = 0;
      const sum = [0, 0, 0];
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * image.width + x) * 4;
          if (image.data[i + 3] === 0) continue;
          filled++;
          sum[0] += image.data[i];
          sum[1] += image.data[i + 1];
          sum[2] += image.data[i + 2];
        }
      }
      if (filled * 2 < (x1 - x0) * (y1 - y0)) continue;
      const o = ((offsetY + gy) * size + offsetX + gx) * 4;
      grid.data.set([...sum.map((s) => Math.round(s / filled)), 255], o);
    }
  }
  return grid;
}

/** Removes the background, crops and fits an animal to the grid, before any palette is applied. */
export function fitSprite(source: Image): Image {
  return fitToGrid(cropToContent(removeBackground(source)));
}

/** Replaces every filled pixel with the closest palette colour. */
export function applyPalette(image: Image, colours: Rgb[]): Image {
  const data = new Uint8Array(image.data);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data.set(nearestColour([data[i], data[i + 1], data[i + 2]], colours), i);
  }
  return { ...image, data };
}

/** Paints the silhouette's edge pixels (filled pixels beside an empty one or the border). */
export function markOutline(image: Image, outline: Rgb): Image {
  const { width, height } = image;
  const data = new Uint8Array(image.data);
  const filled = (x: number, y: number): boolean =>
    x >= 0 &&
    y >= 0 &&
    x < width &&
    y < height &&
    image.data[(y * width + x) * 4 + 3] > 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!filled(x, y)) continue;
      if (
        filled(x - 1, y) &&
        filled(x + 1, y) &&
        filled(x, y - 1) &&
        filled(x, y + 1)
      )
        continue;
      data.set([...outline, 255], (y * width + x) * 4);
    }
  }
  return { width, height, data };
}

/** Makes the 32 × 32 draft of one animal from a large source image. */
export function draftSprite(source: Image, fills: Rgb[], outline: Rgb): Image {
  return markOutline(applyPalette(fitSprite(source), fills), outline);
}

/**
 * Cuts a sheet of animals with a caption above each one into one image per animal, in
 * reading order. Throws if the sheet does not hold exactly `count` animals.
 */
export function splitSheet(sheet: Image, count: number): Image[] {
  const { width, height, data } = sheet;
  const isInk = (x: number, y: number): boolean =>
    !isNearWhite(data, (y * width + x) * 4);
  const rowInk = Array.from({ length: height }, (_, y) => {
    let n = 0;
    for (let x = 0; x < width; x++) if (isInk(x, y)) n++;
    return n >= 2;
  });
  const bands = runs(rowInk, 8);
  const tallest = Math.max(...bands.map(([from, to]) => to - from + 1));
  // Captions are much shorter than animals.
  const animalBands = bands.filter(
    ([from, to]) => (to - from + 1) * 4 >= tallest,
  );
  const minGap = Math.max(8, Math.round(width * 0.01));
  const found: Image[] = [];
  for (const [top, bottom] of animalBands) {
    const columnInk = Array.from({ length: width }, (_, x) => {
      let n = 0;
      for (let y = top; y <= bottom; y++) if (isInk(x, y)) n++;
      return n >= 2;
    });
    for (const [left, right] of runs(columnInk, minGap)) {
      found.push(crop(sheet, left, top, right + 1, bottom + 1));
    }
  }
  if (found.length !== count) {
    throw new Error(
      `expected ${count} animals on the sheet but found ${found.length}`,
    );
  }
  return found;
}

/** Lists the stretches of `true` values, joining stretches closer together than `minGap`. */
function runs(filled: boolean[], minGap: number): [number, number][] {
  const found: [number, number][] = [];
  let start = -1;
  let last = -1;
  filled.forEach((value, i) => {
    if (value) {
      if (start < 0) start = i;
      last = i;
    } else if (start >= 0 && i - last >= minGap) {
      found.push([start, last]);
      start = -1;
    }
  });
  if (start >= 0) found.push([start, last]);
  return found;
}

function crop(
  image: Image,
  left: number,
  top: number,
  right: number,
  bottom: number,
): Image {
  const out = blankImage(right - left, bottom - top);
  for (let y = top; y < bottom; y++) {
    const from = (y * image.width + left) * 4;
    out.data.set(
      image.data.subarray(from, from + (right - left) * 4),
      (y - top) * out.width * 4,
    );
  }
  return out;
}
