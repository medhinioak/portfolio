/** Reading and writing image files for the sprite tool. */
import { readFileSync, writeFileSync } from 'node:fs';
import * as jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

/** A raster image: RGBA bytes, row by row. Alpha is 0 (empty) or 255 (filled) in sprites. */
export interface Image {
  width: number;
  height: number;
  data: Uint8Array;
}

/** Creates a fully transparent image. */
export function blankImage(width: number, height: number): Image {
  return { width, height, data: new Uint8Array(width * height * 4) };
}

/** Reads a PNG or JPEG file. */
export function readImage(path: string): Image {
  const bytes = readFileSync(path);
  if (path.toLowerCase().endsWith('.png')) {
    const png = PNG.sync.read(bytes);
    return {
      width: png.width,
      height: png.height,
      data: new Uint8Array(png.data),
    };
  }
  const jpg = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true });
  return {
    width: jpg.width,
    height: jpg.height,
    data: new Uint8Array(jpg.data),
  };
}

/** Writes an image as a PNG file. */
export function writePng(path: string, image: Image): void {
  const png = new PNG({ width: image.width, height: image.height });
  png.data = Buffer.from(image.data);
  writeFileSync(path, PNG.sync.write(png));
}
