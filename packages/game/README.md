# Tail Trail

Ask yes/no questions and find the computer's secret animal before it finds yours.

Tail Trail is a small deduction game for the browser. You and the computer each pick a
secret animal from the same board of 24. You take turns: ask a question from a fixed
list ("Can it fly?") or guess. The board marks the animals each answer rules out. A
wrong guess loses your turn; the first to name the other's animal wins. There are three
difficulties: Breezy, Medium and Zoologist.

It is played on [medhinioak.dev/play](https://medhinioak.dev/play/) and runs on its own
here. The full rules, screens and keyboard model are in
[`docs/game/spec.md`](../../docs/game/spec.md).

## Run it

From the repository root, with Node from `.nvmrc` (`nvm use`) and `pnpm install` done:

| What | Command |
|---|---|
| Playground (the game without the site) | `pnpm --filter game dev` |
| Sprite contact sheet | the playground's `/contact-sheet.html` |
| Unit tests (engine, boards, sprite tools) | `pnpm --filter game test` |
| Engine coverage | `pnpm test:coverage` |
| Browser tests (keyboard, phone, axe) | `pnpm --filter game test:e2e` |
| Type check | `pnpm --filter game typecheck` |

The playground sets the `--game-*` theme properties to defaults and has a theme
button, so both themes can be checked. Add `?seed=1` to the URL to fix every random
choice.

## Layout

| Path | What |
|---|---|
| `src/index.ts` | The public API; the site imports only from here |
| `src/engine/` | Rules, the validator and the computer. Plain TypeScript: no React, no DOM |
| `src/ui/` | The React + SVG interface |
| `src/boards/` | Board packs (`animals.json`) and their sprites |
| `art/` | 32 × 32 PNG masters of the sprites |
| `tools/sprites/` | The sprite pipeline (`pnpm --filter game sprites`) |
| `playground/` | The standalone page for development |

The package never imports from `apps/site`, and it has no routing, analytics or browser
storage ([ADR-0002](../../docs/adr/0002-monorepo-with-standalone-game-package.md)). The
site passes callbacks (`onGameStart`, `onGameEnd`) and decides what to do with them.

## Using the component

```tsx
import { Game } from 'game';

<Game homeHref="/" />;
```

`Game` takes an optional `pack` (default: the animals board), `seed`, `homeHref` and the
two callbacks. It is themed only by these custom properties, set on a parent element:
`--game-bg`, `--game-surface`, `--game-text`, `--game-muted`, `--game-accent`,
`--game-on-accent`, `--game-highlight`, `--game-font-heading`, `--game-font-body` and
`--game-radius`. On the site, `apps/site/src/pages/play.astro` sets them from the site's
tokens.

## Board packs

A board pack is one JSON file: a set of characters and the yes/no questions about them.
The engine plays any valid pack and knows nothing about what the characters look like.

```ts
interface BoardPack {
  id: string; // 'animals'
  name: string; // 'Animals'
  version: number; // starts at 1
  attributes: Attribute[]; // the questions
  characters: Character[]; // the cards
}

interface Attribute {
  id: string; // 'fur'
  group: string; // 'Body': questions are grouped and filtered by it
  question: string; // 'Does it have fur or hair?'
  type: 'boolean';
}

interface Character {
  id: string; // 'tiger'
  name: string; // 'Tiger'
  sprite: string; // sprite file name without .svg
  alt: string; // text alternative of the sprite
  values: Record<string, boolean>; // attribute id -> answer
}
```

`validateBoardPack(pack)` returns every problem with a path and a code, and never
throws. Besides types and unique ids, it checks that every character answers every
question, that no two characters have the same answers, and that every question splits
the board (at least one yes and one no). Those last two make every board winnable by
questions alone. The full rule list is in the spec,
[Board pack schema](../../docs/game/spec.md#board-pack-schema).

Sprites are looked up by name in `src/boards/animals/sprites/` only, since the animals
board is the only pack so far. A second pack needs its own sprites folder and a change in
`src/ui/Sprite.tsx`; until then its cards show a crossed placeholder box.

## How the computer chooses

The computer keeps a list of the animals yours could still be, and removes those that
disagree with each answer. To pick a question it skips any that every remaining animal
answers the same way, then takes the one whose "yes" count is closest to half the list:
whatever the answer, it rules out as many animals as it can expect to. Ties are broken
with the game's seeded random numbers. When one animal is left, it guesses.

The difficulty only changes how often it ignores the best question and asks a random
useful one instead: 60 % of turns on Breezy, 30 % on Medium, never on Zoologist. It
reads only the answers you give, never your animal or your marks. Details:
[Computer opponent](../../docs/game/spec.md#computer-opponent).

## Licence

- **Code** (everything that is not art): MIT, see [`LICENSE`](../../LICENSE).
- **Art** (the sprites in `src/boards/animals/sprites/`, the masters in `art/` and the
  contact sheet): all rights reserved, see [`CONTENT-LICENSE.md`](../../CONTENT-LICENSE.md).
  The sprites are AI-assisted drafts, edited by the owner
  ([ADR-0012](../../docs/adr/0012-game-art-is-ai-assisted-pixel-art-edited-by-the-owner.md)).
