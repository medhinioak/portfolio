/// <reference types="vite/client" />
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import palette from './animals/palette.json';
import { animalsBoard } from './index';

const files = import.meta.glob<string>('./animals/sprites/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const sprites = new Map(
  Object.entries(files).map(([path, svg]) => [
    path.replace('./animals/sprites/', '').replace('.svg', ''),
    svg,
  ]),
);

/** Expands `#abc` to `#aabbcc`. */
function longHex(colour: string): string {
  return colour.length === 4
    ? `#${[...colour.slice(1)].map((c) => c + c).join('')}`
    : colour;
}

describe('animal sprites', () => {
  it('exist for every animal, and for no name that is not on the board', () => {
    const names = animalsBoard.characters.map((c) => c.sprite);
    expect(names.filter((n) => !sprites.has(n))).toEqual([]);
    expect([...sprites.keys()].filter((n) => !names.includes(n))).toEqual([]);
  });

  it('have alt text that describes the picture', () => {
    for (const character of animalsBoard.characters) {
      expect(character.alt, character.id).toMatch(/^Pixel art of .{10,}\.$/);
    }
  });

  it.each([...sprites])(
    '%s is a plain 32 × 32 SVG on the palette',
    (_, svg) => {
      expect(svg).toMatch(
        /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 32 32"/,
      );
      expect(svg).not.toMatch(
        /<(script|metadata|image|style|title|desc)|href=/,
      );
      const allowed = new Set([
        'currentColor',
        ...palette.colours.map((c) => c.toLowerCase()),
      ]);
      const fills = [...svg.matchAll(/fill="([^"]+)"/g)].map((m) =>
        m[1] === 'currentColor' ? m[1] : longHex(m[1]),
      );
      expect(fills.length).toBeGreaterThan(0);
      expect(fills.filter((f) => !allowed.has(f))).toEqual([]);
    },
  );

  it.each([...sprites])('%s is at most 2 KB gzipped', (_, svg) => {
    expect(gzipSync(svg, { level: 9 }).length).toBeLessThanOrEqual(2048);
  });
});
