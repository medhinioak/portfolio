/** Helper for the sprite tests: draws a small image from rows of characters. */
import { blankImage, type Image } from './image.ts';

/** Builds an image from text rows; `colours` maps a character to RGB, any other character is empty. */
export function drawImage(
  rows: string[],
  colours: Record<string, [number, number, number]>,
): Image {
  const image = blankImage(rows[0].length, rows.length);
  rows.forEach((row, y) =>
    [...row].forEach((char, x) => {
      const colour = colours[char];
      if (colour) image.data.set([...colour, 255], (y * image.width + x) * 4);
    }),
  );
  return image;
}

/** Reads an image back as text rows: the character for each colour, `.` for empty. */
export function readRows(
  image: Image,
  colours: Record<string, [number, number, number]>,
): string[] {
  const rows: string[] = [];
  for (let y = 0; y < image.height; y++) {
    let row = '';
    for (let x = 0; x < image.width; x++) {
      const i = (y * image.width + x) * 4;
      const pixel = [image.data[i], image.data[i + 1], image.data[i + 2]];
      const match = Object.entries(colours).find(([, c]) =>
        c.every((v, k) => v === pixel[k]),
      );
      row += image.data[i + 3] === 0 ? '.' : (match?.[0] ?? '?');
    }
    rows.push(row);
  }
  return rows;
}
