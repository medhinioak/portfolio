/** Names and one-line descriptions shown for each difficulty (docs/game/spec.md, Decisions). */
import type { Difficulty } from '../engine/game';

/** The difficulties in the order the start screen lists them. */
export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

/** What the player sees for each difficulty id. */
export const DIFFICULTY_LABELS: Readonly<
  Record<Difficulty, { name: string; description: string }>
> = {
  easy: {
    name: 'Breezy',
    description: 'The computer often asks poor questions.',
  },
  medium: {
    name: 'Medium',
    description: 'The computer sometimes asks a poor question.',
  },
  hard: {
    name: 'Zoologist',
    description: 'The computer always asks the best question.',
  },
};
