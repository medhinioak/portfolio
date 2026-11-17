/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import type { BoardPack } from '../engine/board';
import { validateBoardPack } from '../engine/validate';
import { animalsBoard } from './index';

const boards = import.meta.glob<unknown>('./*.json', {
  eager: true,
  import: 'default',
});

/** The cut-line board: the first `count` characters, without attributes that no longer split. */
function cutBoard(pack: BoardPack, count: number): BoardPack {
  const characters = pack.characters.slice(0, count);
  const attributes = pack.attributes.filter((attribute) => {
    const answers = new Set(characters.map((c) => c.values[attribute.id]));
    return answers.size === 2;
  });
  const keep = new Set(attributes.map((a) => a.id));
  return {
    ...pack,
    attributes,
    characters: characters.map((c) => ({
      ...c,
      values: Object.fromEntries(
        Object.entries(c.values).filter(([id]) => keep.has(id)),
      ),
    })),
  };
}

describe('board packs in src/boards', () => {
  it('finds at least one board', () => {
    expect(Object.keys(boards).length).toBeGreaterThan(0);
  });

  it.each(Object.entries(boards))('%s passes the validator', (_, board) => {
    expect(validateBoardPack(board).errors).toEqual([]);
  });
});

describe('the animals board', () => {
  it('has 24 animals and 68 questions in five groups', () => {
    expect(animalsBoard.characters).toHaveLength(24);
    expect(animalsBoard.attributes).toHaveLength(68);
    expect(new Set(animalsBoard.attributes.map((a) => a.group))).toEqual(
      new Set(['Type', 'Body', 'Looks', 'Habitat', 'Behaviour']),
    );
  });

  it('cut to the first 16 animals, it keeps 60 questions and still passes', () => {
    const cut = cutBoard(animalsBoard, 16);
    expect(cut.attributes).toHaveLength(60);
    expect(validateBoardPack(cut).errors).toEqual([]);
  });
});
