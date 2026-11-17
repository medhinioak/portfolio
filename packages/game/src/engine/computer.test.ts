import { describe, expect, it } from 'vitest';
import { animalsBoard } from '../boards';
import type { BoardPack } from './board';
import {
  bestQuestions,
  computerMove,
  usefulQuestions,
  type ComputerMove,
} from './computer';
import {
  askQuestion,
  createGame,
  makeGuess,
  type Difficulty,
  type GameState,
} from './game';
import { createRandom, type Random } from './random';

/**
 * Four characters and four questions. Worked out on paper:
 * `fur` splits them 1/3, `flies` 2/2 and `swims` 2/2, `wild` is yes for all (useless).
 * So the best questions are `flies` and `swims`.
 */
const smallPack: BoardPack = {
  id: 'small',
  name: 'Small',
  version: 1,
  attributes: [
    { id: 'fur', group: 'Body', question: 'Fur?', type: 'boolean' },
    { id: 'flies', group: 'Behaviour', question: 'Flies?', type: 'boolean' },
    { id: 'swims', group: 'Behaviour', question: 'Swims?', type: 'boolean' },
    { id: 'wild', group: 'Habitat', question: 'Wild?', type: 'boolean' },
  ],
  characters: [
    {
      id: 'cat',
      values: { fur: true, flies: false, swims: false, wild: true },
    },
    {
      id: 'owl',
      values: { fur: false, flies: true, swims: false, wild: true },
    },
    {
      id: 'duck',
      values: { fur: false, flies: true, swims: true, wild: true },
    },
    {
      id: 'frog',
      values: { fur: false, flies: false, swims: true, wild: true },
    },
  ].map((c) => ({ ...c, name: c.id, sprite: c.id, alt: c.id })),
};

/** A new game on `pack` where it is the computer's turn. */
function computerTurn(
  pack: BoardPack,
  difficulty: Difficulty = 'hard',
): GameState {
  const game = createGame({ pack, difficulty, random: createRandom(1) });
  return { ...game, turn: 'computer' };
}

/** How far a question's yes count is from half the computer's candidates. */
function splitDistance(state: GameState, attributeId: string): number {
  const { candidates } = state.computer;
  const yes = state.pack.characters.filter(
    (c) => candidates.includes(c.id) && c.values[attributeId] === true,
  ).length;
  return Math.abs(yes - candidates.length / 2);
}

/** Applies a computer move to the game. */
function play(state: GameState, move: ComputerMove): GameState {
  return move.kind === 'ask'
    ? askQuestion(state, move.attributeId)
    : makeGuess(state, move.characterId);
}

/** The questions the computer needs to find `secret`; the player always passes. */
function questionsToWin(
  difficulty: Difficulty,
  secret: string,
  random: Random,
): number {
  let state = createGame({
    pack: animalsBoard,
    difficulty,
    random,
    playerSecret: secret,
  });
  let questions = 0;
  while (state.winner === null) {
    const move = computerMove({ ...state, turn: 'computer' }, random);
    if (move.kind === 'ask') {
      questions++;
    }
    state = play({ ...state, turn: 'computer' }, move);
  }
  return questions;
}

/** The average questions per game over every animal and seeds 1..`seeds`. */
function averageQuestions(difficulty: Difficulty, seeds: number): number {
  let total = 0;
  let games = 0;
  for (let seed = 1; seed <= seeds; seed++) {
    const random = createRandom(`${difficulty}-${seed}`);
    for (const c of animalsBoard.characters) {
      total += questionsToWin(difficulty, c.id, random);
      games++;
    }
  }
  return total / games;
}

describe('usefulQuestions', () => {
  it('leaves out questions everyone answers the same way', () => {
    expect(usefulQuestions(computerTurn(smallPack))).toEqual([
      'fur',
      'flies',
      'swims',
    ]);
  });

  it('leaves out questions the computer has asked', () => {
    const game = askQuestion(computerTurn(smallPack), 'fur');
    expect(usefulQuestions({ ...game, turn: 'computer' })).not.toContain('fur');
  });

  it('judges usefulness on the remaining candidates only', () => {
    const game = computerTurn(smallPack);
    const narrowed = {
      ...game,
      computer: { ...game.computer, candidates: ['owl', 'duck'] },
    };
    // fur and flies are "no" and "yes" for both, so only swims can tell them apart.
    expect(usefulQuestions(narrowed)).toEqual(['swims']);
  });
});

describe('bestQuestions', () => {
  it('finds the even splits worked out on paper', () => {
    expect(bestQuestions(computerTurn(smallPack))).toEqual(['flies', 'swims']);
  });

  it('with an odd count, treats splits one off half as equally good', () => {
    const game = computerTurn(smallPack);
    const three = {
      ...game,
      computer: { ...game.computer, candidates: ['cat', 'owl', 'duck'] },
    };
    // fur 1/3 and swims 1/3 are as close to 1.5 as flies 2/3; all three tie.
    expect(bestQuestions(three)).toEqual(['fur', 'flies', 'swims']);
  });
});

describe('computerMove', () => {
  it("refuses to move on the player's turn or after the game ends", () => {
    const game = computerTurn(smallPack);
    const random = createRandom(1);
    expect(() => computerMove({ ...game, turn: 'player' }, random)).toThrow();
    expect(() => computerMove({ ...game, winner: 'player' }, random)).toThrow();
  });

  it('guesses as soon as one candidate is left', () => {
    const game = computerTurn(smallPack);
    const one = {
      ...game,
      computer: { ...game.computer, candidates: ['frog'] },
    };
    expect(computerMove(one, createRandom(1))).toEqual({
      kind: 'guess',
      characterId: 'frog',
    });
  });

  it('guesses when no question can tell the candidates apart', () => {
    const twins: BoardPack = {
      ...smallPack,
      characters: [
        ...smallPack.characters,
        { ...smallPack.characters[0]!, id: 'lynx', name: 'lynx' },
      ],
    };
    const game = computerTurn(twins);
    const both = {
      ...game,
      computer: { ...game.computer, candidates: ['cat', 'lynx'] },
    };
    const move = computerMove(both, createRandom(1));
    expect(move.kind).toBe('guess');
    expect(['cat', 'lynx']).toContain(
      move.kind === 'guess' ? move.characterId : '',
    );
  });

  it('on hard always asks a best question, and the seed breaks ties', () => {
    const picks = new Set<string>();
    for (let seed = 1; seed <= 20; seed++) {
      const move = computerMove(computerTurn(smallPack), createRandom(seed));
      expect(move.kind).toBe('ask');
      if (move.kind === 'ask') {
        picks.add(move.attributeId);
      }
    }
    expect([...picks].sort()).toEqual(['flies', 'swims']);
  });

  it('repeats the same move for the same seed', () => {
    const game = computerTurn(animalsBoard, 'easy');
    expect(computerMove(game, createRandom('x'))).toEqual(
      computerMove(game, createRandom('x')),
    );
  });

  it('on easy sometimes asks a worse question, but never a useless one', () => {
    const game = computerTurn(smallPack, 'easy');
    const picks = new Set<string>();
    for (let seed = 1; seed <= 50; seed++) {
      const move = computerMove(game, createRandom(seed));
      if (move.kind === 'ask') {
        picks.add(move.attributeId);
      }
    }
    expect(picks).toContain('fur');
    expect(picks).not.toContain('wild');
  });

  it('on hard never picks a worse split than easy', () => {
    const game = computerTurn(animalsBoard);
    for (let seed = 1; seed <= 50; seed++) {
      const hard = computerMove(game, createRandom(seed));
      const easy = computerMove(
        { ...game, difficulty: 'easy' },
        createRandom(seed),
      );
      if (hard.kind !== 'ask' || easy.kind !== 'ask') {
        throw new Error('Expected both to ask on a full board');
      }
      expect(splitDistance(game, hard.attributeId)).toBeLessThanOrEqual(
        splitDistance(game, easy.attributeId),
      );
    }
  });
});

describe('simulated games on the animals board', () => {
  it('hard needs fewer questions on average than medium, and medium fewer than easy', () => {
    const easy = averageQuestions('easy', 10);
    const medium = averageQuestions('medium', 10);
    const hard = averageQuestions('hard', 10);
    expect(hard).toBeLessThan(medium);
    expect(medium).toBeLessThan(easy);
    // 24 animals need at least log2(24) ≈ 4.6 yes/no questions on average.
    expect(hard).toBeGreaterThanOrEqual(Math.log2(24));
  });
});
