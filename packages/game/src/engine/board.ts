/** Board pack types: the data format the engine plays (docs/game/spec.md, Board pack schema). */

/** A yes/no question about every character. Only booleans for now. */
export interface Attribute {
  id: string;
  group: string;
  question: string;
  type: 'boolean';
}

/** One card on the board. */
export interface Character {
  id: string;
  name: string;
  sprite: string;
  alt: string;
  values: Record<string, boolean>;
}

/** A complete set of characters and questions. */
export interface BoardPack {
  id: string;
  name: string;
  version: number;
  attributes: Attribute[];
  characters: Character[];
}

/** One problem found by the validator. */
export interface ValidationError {
  path: string;
  code: string;
  message: string;
}

/** The validator's result: `ok` is true when `errors` is empty. */
export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
}
