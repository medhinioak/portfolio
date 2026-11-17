import { describe, expect, it } from 'vitest';
import { animalsBoard } from '../boards';
import { askQuestion, createGame, makeGuess, type GameState } from './game';
import { describeMove } from './messages';
import { createRandom } from './random';

/** A game where the player has the penguin and the computer has the tiger. */
function game(): GameState {
  const state = createGame({
    pack: animalsBoard,
    difficulty: 'easy',
    random: createRandom(1),
    playerSecret: 'penguin',
  });
  return { ...state, computer: { ...state.computer, secret: 'tiger' } };
}

/** Plays `step` and describes the move it made. */
function describe1(step: (s: GameState) => GameState, from = game()): string {
  const after = step(from);
  return describeMove(after, after.history.at(-1)!);
}

describe('describeMove', () => {
  it('describes the player asking, with how many animals are still in', () => {
    expect(describe1((s) => askQuestion(s, 'fur'))).toBe(
      'You asked: Does it have fur or hair? The answer is yes. 10 of 24 animals are still in.',
    );
  });

  it('describes the computer asking, without a count', () => {
    const computerTurn = { ...game(), turn: 'computer' as const };
    expect(describe1((s) => askQuestion(s, 'flies'), computerTurn)).toBe(
      'The computer asked: Can it fly? The answer is no.',
    );
  });

  it('describes a wrong guess and a winning guess', () => {
    expect(describe1((s) => makeGuess(s, 'lion'))).toBe(
      'You guessed Lion. That is not it. You lose this turn.',
    );
    expect(describe1((s) => makeGuess(s, 'tiger'))).toBe(
      "You won. The computer's animal was the tiger.",
    );
  });

  it('describes the computer winning', () => {
    const computerTurn = { ...game(), turn: 'computer' as const };
    expect(describe1((s) => makeGuess(s, 'penguin'), computerTurn)).toBe(
      'The computer won. It guessed your animal: the penguin.',
    );
  });
});
