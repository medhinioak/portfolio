import { describe, expect, it } from 'vitest';
import { countStillIn, isRuledOut, toggleMark } from './marks';

const all = ['cat', 'owl', 'duck', 'frog'];
/** The answers so far have ruled out the owl and the duck. */
const candidates = ['cat', 'frog'];

describe('isRuledOut', () => {
  it('follows the answers when the player has not chosen', () => {
    expect(isRuledOut('owl', candidates, {})).toBe(true);
    expect(isRuledOut('cat', candidates, {})).toBe(false);
  });

  it('lets a manual choice win either way', () => {
    expect(isRuledOut('owl', candidates, { owl: false })).toBe(false);
    expect(isRuledOut('cat', candidates, { cat: true })).toBe(true);
  });
});

describe('toggleMark', () => {
  it('flips what the card shows now, including an automatic mark', () => {
    expect(toggleMark('owl', candidates, {})).toEqual({ owl: false });
    expect(toggleMark('cat', candidates, {})).toEqual({ cat: true });
    expect(toggleMark('cat', candidates, { cat: true })).toEqual({
      cat: false,
    });
  });

  it('keeps a manual "in" when a later answer rules the card out', () => {
    const manual = toggleMark('cat', candidates, { cat: true });
    // A new answer removes the cat from the candidates; the player's choice still wins.
    expect(isRuledOut('cat', ['frog'], manual)).toBe(false);
  });
});

describe('countStillIn', () => {
  it('counts what the board shows, manual choices included', () => {
    expect(countStillIn(all, candidates, {})).toBe(2);
    expect(countStillIn(all, candidates, { owl: false, frog: true })).toBe(2);
    expect(countStillIn(all, candidates, { frog: true })).toBe(1);
  });
});
