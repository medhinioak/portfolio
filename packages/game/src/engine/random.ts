/** Seeded random numbers, so games, tests and replays repeat exactly. */

/** A random number generator: each call returns a number in [0, 1). */
export type Random = () => number;

/** Hashes a string to an unsigned 32-bit number (FNV-1a). */
function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Creates a seeded generator (mulberry32); the same seed gives the same sequence. */
export function createRandom(seed: number | string): Random {
  let state = typeof seed === 'string' ? hashSeed(seed) : seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Picks one item at random; throws on an empty list. */
export function pickOne<T>(items: readonly T[], random: Random): T {
  if (items.length === 0) {
    throw new Error('pickOne needs at least one item');
  }
  return items[Math.floor(random() * items.length)] as T;
}
