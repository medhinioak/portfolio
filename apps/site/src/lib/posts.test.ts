import { describe, expect, it } from 'vitest';
import {
  formatPostDate,
  isoDay,
  publishedNewestFirst,
  readingMinutes,
} from './posts';

const entry = (id: string, day: string, draft = false) => ({
  id,
  data: { pubDate: new Date(day), draft },
});

const words = (n: number): string => Array(n).fill('word').join(' ');

describe('publishedNewestFirst', () => {
  const entries = [
    entry('old', '2026-01-01'),
    entry('new', '2026-03-01'),
    entry('draft', '2026-02-01', true),
  ];

  it('sorts newest first', () => {
    const ids = publishedNewestFirst(entries, true).map((e) => e.id);
    expect(ids).toEqual(['new', 'draft', 'old']);
  });

  it('leaves drafts out of production builds', () => {
    const ids = publishedNewestFirst(entries, false).map((e) => e.id);
    expect(ids).toEqual(['new', 'old']);
  });

  it('orders posts from the same day by id', () => {
    const sameDay = [entry('b', '2026-01-01'), entry('a', '2026-01-01')];
    const ids = publishedNewestFirst(sameDay, false).map((e) => e.id);
    expect(ids).toEqual(['a', 'b']);
  });
});

describe('readingMinutes', () => {
  it('is at least 1 minute for an empty body', () => {
    expect(readingMinutes('')).toBe(1);
    expect(readingMinutes('   \n\n  ')).toBe(1);
  });

  it('is exact at multiples of 200 words and rounds up past them', () => {
    expect(readingMinutes(words(200))).toBe(1);
    expect(readingMinutes(words(400))).toBe(2);
    expect(readingMinutes(words(401))).toBe(3);
  });

  it('counts words across lines and ignores Markdown symbols', () => {
    expect(readingMinutes(`## Heading\n\n- ${words(199)}\n\n> ---`)).toBe(1);
    expect(readingMinutes(`## ${words(200)}\n\n- one`)).toBe(2);
  });

  it('ignores HTML comments, also across lines', () => {
    expect(readingMinutes(`${words(200)}\n<!-- a note\nto self -->`)).toBe(1);
  });

  it('counts code inside a block but not its fence lines', () => {
    const block = (fence: string): string =>
      `${words(150)}\n\n${fence}ts\n${words(50)}\n${fence}\n`;
    expect(readingMinutes(block('```'))).toBe(1);
    expect(readingMinutes(block('~~~'))).toBe(1);
    expect(readingMinutes(`${block('```')}more`)).toBe(2);
  });
});

describe('formatPostDate and isoDay', () => {
  it('shows the front-matter day even west of UTC', () => {
    // A date-only value is UTC midnight, which is the evening before in Los Angeles.
    const previousZone = process.env.TZ;
    process.env.TZ = 'America/Los_Angeles';
    try {
      const date = new Date('2026-11-01');
      expect(date.getDate()).toBe(31);
      expect(formatPostDate(date)).toBe('1 November 2026');
      expect(isoDay(date)).toBe('2026-11-01');
    } finally {
      if (previousZone === undefined) delete process.env.TZ;
      else process.env.TZ = previousZone;
    }
  });
});
