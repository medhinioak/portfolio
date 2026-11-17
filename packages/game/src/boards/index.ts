/** Board packs that ship with the game. */
import type { BoardPack } from '../engine/board';
import animals from './animals.json';

/** The animals board: 24 animals and 68 questions. boards.test.ts checks that it is valid. */
export const animalsBoard: BoardPack = animals as BoardPack;
