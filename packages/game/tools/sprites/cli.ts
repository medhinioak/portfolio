/** Command line for the sprite pipeline: split, palette, draft and svg (see docs/game/spec.md, Art plan). */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { readImage, writePng } from './image.ts';
import {
  buildPalette,
  hexToRgb,
  MAX_COLOURS,
  parsePalette,
  rgbToHex,
  type Palette,
} from './palette.ts';
import { draftSprite, fitSprite, splitSheet } from './sprite.ts';
import { checkSprite, spriteToSvg, SVG_SIZE_TARGET } from './svg.ts';

/** The colour that stands for the outline in sprite PNGs: the site's light-theme text colour. */
const OUTLINE = '#1b1a23';

const USAGE = `Usage (paths are relative to where you run pnpm):
  sprites split <sheet> --names a,b,c --out <dir>
  sprites palette <images...> --out <palette.json> [--colours ${MAX_COLOURS - 1}]
  sprites draft <images...> --palette <palette.json> --out <dir>
  sprites svg <pngs...> --palette <palette.json> --out <dir>`;

const base = process.env.INIT_CWD ?? process.cwd();
const path = (p: string): string => resolve(base, p);
const nameOf = (file: string): string => basename(file, extname(file));

function readPalette(file: string): Palette {
  return parsePalette(JSON.parse(readFileSync(path(file), 'utf8')));
}

function main(): void {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      names: { type: 'string' },
      out: { type: 'string' },
      palette: { type: 'string' },
      colours: { type: 'string' },
    },
  });
  const [command, ...files] = positionals;
  const out = values.out;
  if (!command || !out || files.length === 0) {
    throw new Error(USAGE);
  }

  if (command === 'split') {
    const names = (values.names ?? '').split(',').filter(Boolean);
    const animals = splitSheet(readImage(path(files[0])), names.length);
    mkdirSync(path(out), { recursive: true });
    animals.forEach((animal, i) =>
      writePng(join(path(out), `${names[i]}.png`), animal),
    );
    console.log(`Wrote ${animals.length} images to ${out}`);
  } else if (command === 'palette') {
    const count = Number(values.colours ?? MAX_COLOURS - 1);
    const colours = buildPalette(
      files.map((f) => fitSprite(readImage(path(f)))),
      count,
    );
    const palette: Palette = {
      outline: OUTLINE,
      colours: colours.map(rgbToHex),
    };
    writeFileSync(path(out), `${JSON.stringify(palette, null, 2)}\n`);
    console.log(`Wrote ${colours.length} colours and the outline to ${out}`);
  } else if (command === 'draft' && values.palette) {
    const palette = readPalette(values.palette);
    mkdirSync(path(out), { recursive: true });
    for (const file of files) {
      const draft = draftSprite(
        readImage(path(file)),
        palette.colours.map(hexToRgb),
        hexToRgb(palette.outline),
      );
      writePng(join(path(out), `${nameOf(file)}.png`), draft);
    }
    console.log(`Wrote ${files.length} drafts to ${out}`);
  } else if (command === 'svg' && values.palette) {
    const palette = readPalette(values.palette);
    mkdirSync(path(out), { recursive: true });
    let failed = false;
    for (const file of files) {
      const image = readImage(path(file));
      const problems = checkSprite(image, palette);
      if (problems.length > 0) {
        failed = true;
        console.error(`${file}:\n  ${problems.slice(0, 5).join('\n  ')}`);
        continue;
      }
      const svg = spriteToSvg(image, palette);
      if (svg.length > SVG_SIZE_TARGET) {
        console.warn(
          `${file}: ${svg.length} bytes, over the ${SVG_SIZE_TARGET} byte target`,
        );
      }
      writeFileSync(join(path(out), `${nameOf(file)}.svg`), svg);
    }
    if (failed) process.exitCode = 1;
  } else {
    throw new Error(USAGE);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
