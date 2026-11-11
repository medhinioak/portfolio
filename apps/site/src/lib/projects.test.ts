import { describe, expect, it } from 'vitest';
import { neighbours, publishedInOrder } from './projects';

const entry = (id: string, order: number, draft = false) => ({
  id,
  data: { order, draft },
});

describe('publishedInOrder', () => {
  const entries = [entry('c', 3), entry('a', 1), entry('d', 2, true)];

  it('sorts by order, lower first', () => {
    const ids = publishedInOrder(entries, true).map((e) => e.id);
    expect(ids).toEqual(['a', 'd', 'c']);
  });

  it('leaves drafts out of production builds and keeps them in dev', () => {
    expect(publishedInOrder(entries, false).map((e) => e.id)).toEqual([
      'a',
      'c',
    ]);
    expect(publishedInOrder(entries, true)).toHaveLength(3);
  });

  it('breaks ties in order by id, so the result does not depend on file order', () => {
    const tied = [entry('b', 1), entry('a', 1)];
    expect(publishedInOrder(tied, false).map((e) => e.id)).toEqual(['a', 'b']);
  });
});

describe('neighbours', () => {
  const list = [entry('a', 1), entry('b', 2), entry('c', 3)];

  it('gives no previous or next when there is only one case study', () => {
    expect(neighbours([entry('a', 1)], 'a')).toStrictEqual({
      previous: undefined,
      next: undefined,
    });
  });

  it('gives only next for the first and only previous for the last', () => {
    expect(neighbours(list, 'a').previous).toBeUndefined();
    expect(neighbours(list, 'a').next?.id).toBe('b');
    expect(neighbours(list, 'c').previous?.id).toBe('b');
    expect(neighbours(list, 'c').next).toBeUndefined();
  });

  it('gives both for one in the middle', () => {
    const { previous, next } = neighbours(list, 'b');
    expect([previous?.id, next?.id]).toEqual(['a', 'c']);
  });

  it('gives nothing for an id that is not in the list', () => {
    expect(neighbours(list, 'x')).toEqual({});
  });
});
