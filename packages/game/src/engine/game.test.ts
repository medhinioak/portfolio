import { describe, expect, it } from 'vitest';
import { animalsBoard } from '../boards';
import type { BoardPack } from './board';
import {
  askedQuestions,
  askQuestion,
  createGame,
  gameResult,
  makeGuess,
  type GameState,
  type Side,
} from './game';
import { createRandom, pickOne, type Random } from './random';

/** Four characters and three questions; `wild` is "no" for nobody, so it rules nothing out. */
const smallPack: BoardPack = {
  id: 'small',
  name: 'Small',
  version: 1,
  attributes: [
    { id: 'fur', group: 'Body', question: 'Fur?', type: 'boolean' },
    { id: 'flies', group: 'Behaviour', question: 'Flies?', type: 'boolean' },
    { id: 'wild', group: 'Habitat', question: 'Wild?', type: 'boolean' },
  ],
  characters: [
    { id: 'cat', values: { fur: true, flies: false, wild: true } },
    { id: 'bat', values: { fur: true, flies: true, wild: true } },
    { id: 'duck', values: { fur: false, flies: true, wild: true } },
    { id: 'frog', values: { fur: false, flies: false, wild: true } },
  ].map((c) => ({ ...c, name: c.id, sprite: c.id, alt: c.id })),
};

/** A small game where the player has `player` and the computer has `computer`. */
function smallGame(player: string, computer: string): GameState {
  const game = createGame({
    pack: smallPack,
    difficulty: 'easy',
    random: createRandom(1),
    playerSecret: player,
  });
  return { ...game, computer: { ...game.computer, secret: computer } };
}

/** The secret of the side that is not `side`. */
function otherSecret(state: GameState, side: Side): string {
  return state[side === 'player' ? 'computer' : 'player'].secret;
}

/** A character's answer to a question. */
function valueOf(
  pack: BoardPack,
  characterId: string,
  attributeId: string,
): boolean {
  return (
    pack.characters.find((c) => c.id === characterId)?.values[attributeId] ===
    true
  );
}

/** A test-only strategy: guess the last candidate, else ask the first question that rules something out. */
function simpleMove(state: GameState): GameState {
  const { candidates } = state[state.turn];
  if (candidates.length === 1) {
    return makeGuess(state, candidates[0] as string);
  }
  const asked = askedQuestions(state, state.turn);
  const useful = state.pack.attributes.find((a) => {
    if (asked.includes(a.id)) return false;
    const yes = candidates.filter((id) => valueOf(state.pack, id, a.id)).length;
    return yes > 0 && yes < candidates.length;
  });
  return askQuestion(state, (useful as { id: string }).id);
}

/** A random legal move: an unasked question, or a guess at any character. */
function randomMove(state: GameState, random: Random): GameState {
  const asked = askedQuestions(state, state.turn);
  const unasked = state.pack.attributes.filter((a) => !asked.includes(a.id));
  if (unasked.length > 0 && random() < 0.7) {
    return askQuestion(state, pickOne(unasked, random).id);
  }
  return makeGuess(state, pickOne(state.pack.characters, random).id);
}

describe('createGame', () => {
  it('starts with the player, every character in and no moves', () => {
    const game = smallGame('cat', 'duck');
    const all = ['cat', 'bat', 'duck', 'frog'];
    expect(game.turn).toBe('player');
    expect(game.winner).toBeNull();
    expect(game.player).toEqual({ secret: 'cat', candidates: all });
    expect(game.computer.candidates).toEqual(all);
    expect(game.history).toEqual([]);
    expect(gameResult(game)).toBeNull();
  });

  it('picks both secrets from the seed when the player taps "Surprise me"', () => {
    const start = (seed: number): GameState =>
      createGame({
        pack: animalsBoard,
        difficulty: 'hard',
        random: createRandom(seed),
      });
    expect(start(5).player.secret).toBe(start(5).player.secret);
    expect(start(5).computer.secret).toBe(start(5).computer.secret);
    const ids = animalsBoard.characters.map((c) => c.id);
    const picks = new Set(
      Array.from({ length: 200 }, (_, seed) => start(seed).player.secret),
    );
    expect(picks).toEqual(new Set(ids));
  });

  it('gives the computer the same animal for a seed, picked or surprised', () => {
    for (let seed = 0; seed < 20; seed++) {
      const start = (playerSecret?: string): string =>
        createGame({
          pack: animalsBoard,
          difficulty: 'hard',
          random: createRandom(seed),
          playerSecret,
        }).computer.secret;
      expect(start('lion')).toBe(start());
    }
  });

  it('rejects an unknown pick', () => {
    expect(() =>
      createGame({
        pack: smallPack,
        difficulty: 'easy',
        random: createRandom(1),
        playerSecret: 'unicorn',
      }),
    ).toThrow('Unknown character');
  });
});

describe('askQuestion', () => {
  it('answers about the other side and rules out the cards that disagree', () => {
    let game = askQuestion(smallGame('cat', 'duck'), 'fur');
    expect(game.history).toEqual([
      { side: 'player', kind: 'ask', attributeId: 'fur', answer: false },
    ]);
    expect(game.player.candidates).toEqual(['duck', 'frog']);
    expect(game.turn).toBe('computer');

    game = askQuestion(game, 'flies');
    expect(game.history[1]).toEqual({
      side: 'computer',
      kind: 'ask',
      attributeId: 'flies',
      answer: false,
    });
    expect(game.computer.candidates).toEqual(['cat', 'frog']);
    expect(game.player.candidates).toEqual(['duck', 'frog']);
    expect(game.turn).toBe('player');
  });

  it('still uses up the turn when the question rules nothing out', () => {
    const game = askQuestion(smallGame('cat', 'duck'), 'wild');
    expect(game.player.candidates).toHaveLength(4);
    expect(game.history[0]).toMatchObject({
      attributeId: 'wild',
      answer: true,
    });
    expect(game.turn).toBe('computer');
  });

  it('lets each side ask a question once', () => {
    let game = askQuestion(smallGame('cat', 'duck'), 'fur');
    game = askQuestion(game, 'fur');
    expect(askedQuestions(game, 'player')).toEqual(['fur']);
    expect(askedQuestions(game, 'computer')).toEqual(['fur']);
    expect(() => askQuestion(game, 'fur')).toThrow('already asked');
  });

  it('rejects an unknown question', () => {
    expect(() => askQuestion(smallGame('cat', 'duck'), 'scales')).toThrow(
      'Unknown question',
    );
  });

  it('does not change the state it was given', () => {
    const before = smallGame('cat', 'duck');
    const copy = structuredClone(before);
    askQuestion(before, 'fur');
    makeGuess(before, 'bat');
    expect(before).toEqual(copy);
  });
});

describe('makeGuess', () => {
  it('wins on the first guess', () => {
    const game = makeGuess(smallGame('cat', 'duck'), 'duck');
    expect(game.winner).toBe('player');
    expect(gameResult(game)).toEqual({
      winner: 'player',
      difficulty: 'easy',
      packId: 'small',
      turns: 1,
      questionsAsked: 0,
      wrongGuesses: 0,
    });
  });

  it('rules out a wrong guess and loses the turn', () => {
    const game = makeGuess(smallGame('cat', 'duck'), 'bat');
    expect(game.winner).toBeNull();
    expect(game.turn).toBe('computer');
    expect(game.player.candidates).toEqual(['cat', 'duck', 'frog']);
    expect(game.history[0]).toEqual({
      side: 'player',
      kind: 'guess',
      characterId: 'bat',
      correct: false,
    });
  });

  it('accepts a guess at a card that is already ruled out', () => {
    let game = askQuestion(smallGame('cat', 'duck'), 'fur'); // rules out cat and bat
    game = askQuestion(game, 'wild');
    game = makeGuess(game, 'cat');
    expect(game.history[2]).toMatchObject({
      characterId: 'cat',
      correct: false,
    });
    expect(game.player.candidates).toEqual(['duck', 'frog']);
  });

  it('wins with the last candidate left', () => {
    let game = smallGame('cat', 'duck');
    game = askQuestion(game, 'fur'); // player: duck, frog
    game = askQuestion(game, 'wild');
    game = askQuestion(game, 'flies'); // player: duck
    game = askQuestion(game, 'flies');
    expect(game.player.candidates).toEqual(['duck']);
    game = makeGuess(game, 'duck');
    expect(game.winner).toBe('player');
  });

  it('lets the computer win', () => {
    let game = makeGuess(smallGame('cat', 'duck'), 'bat');
    game = makeGuess(game, 'cat');
    expect(game.winner).toBe('computer');
    expect(gameResult(game)).toMatchObject({
      winner: 'computer',
      wrongGuesses: 1,
    });
  });

  it('rejects an unknown character', () => {
    expect(() => makeGuess(smallGame('cat', 'duck'), 'unicorn')).toThrow(
      'Unknown character',
    );
  });
});

describe('after the game ends', () => {
  it('accepts no more moves', () => {
    const over = makeGuess(smallGame('cat', 'duck'), 'duck');
    expect(() => askQuestion(over, 'fur')).toThrow('over');
    expect(() => makeGuess(over, 'cat')).toThrow('over');
  });
});

describe('a full round on the animals board', () => {
  it('ends in a player win', () => {
    let game = createGame({
      pack: animalsBoard,
      difficulty: 'medium',
      random: createRandom('player-wins'),
      playerSecret: 'penguin',
    });
    // The player plays the simple strategy; the computer only asks, in board order, and never guesses.
    const computerQuestions = animalsBoard.attributes.map((a) => a.id);
    let turn = 0;
    while (game.winner === null) {
      game =
        game.turn === 'player'
          ? simpleMove(game)
          : askQuestion(game, computerQuestions[turn++] as string);
    }
    const result = gameResult(game);
    expect(result?.winner).toBe('player');
    expect(result?.wrongGuesses).toBe(0);
    expect(game.player.candidates).toEqual([game.computer.secret]);
    expect(result?.turns).toBe(game.history.length);
    expect(result?.questionsAsked).toBe(askedQuestions(game, 'player').length);
  });

  it('ends in a player loss', () => {
    let game = createGame({
      pack: animalsBoard,
      difficulty: 'hard',
      random: createRandom('computer-wins'),
      playerSecret: 'octopus',
    });
    // The player keeps guessing wrong; the computer plays the simple strategy.
    const wrong = animalsBoard.characters
      .map((c) => c.id)
      .filter((id) => id !== game.computer.secret);
    let guess = 0;
    while (game.winner === null) {
      game =
        game.turn === 'player'
          ? makeGuess(game, wrong[guess++] as string)
          : simpleMove(game);
    }
    expect(game.winner).toBe('computer');
    expect(game.history.at(-1)).toEqual({
      side: 'computer',
      kind: 'guess',
      characterId: 'octopus',
      correct: true,
    });
    expect(gameResult(game)).toMatchObject({
      winner: 'computer',
      difficulty: 'hard',
      packId: 'animals',
      questionsAsked: 0,
      wrongGuesses: guess,
    });
  });

  it('keeps answers true and candidates shrinking in random games', () => {
    for (let seed = 0; seed < 50; seed++) {
      const random = createRandom(seed);
      let game = createGame({ pack: animalsBoard, difficulty: 'easy', random });
      let moves = 0;
      while (game.winner === null) {
        const side = game.turn;
        const before = game[side].candidates;
        game = randomMove(game, random);
        const move = game.history.at(-1);
        if (move?.kind === 'ask') {
          expect(move.answer).toBe(
            valueOf(animalsBoard, otherSecret(game, side), move.attributeId),
          );
        }
        const after = game[side].candidates;
        expect(after.every((id) => before.includes(id))).toBe(true);
        if (game.winner === null) {
          expect(after).toContain(otherSecret(game, side));
          expect(game.turn).not.toBe(side);
        }
        moves++;
      }
      expect(moves).toBeLessThan(500);
    }
  });
});
