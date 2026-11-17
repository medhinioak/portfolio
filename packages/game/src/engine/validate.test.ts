import { describe, expect, it } from 'vitest';
import { validateBoardPack } from './validate';

/** A small valid pack: 3 characters told apart by 2 questions. Each test changes a copy. */
function validPack(): Record<string, unknown> & {
  attributes: Record<string, unknown>[];
  characters: (Record<string, unknown> & { values: Record<string, unknown> })[];
} {
  return {
    id: 'test',
    name: 'Test',
    version: 1,
    attributes: [
      {
        id: 'fur',
        group: 'Body',
        question: 'Does it have fur?',
        type: 'boolean',
      },
      {
        id: 'flies',
        group: 'Behaviour',
        question: 'Can it fly?',
        type: 'boolean',
      },
    ],
    characters: [
      {
        id: 'cat',
        name: 'Cat',
        sprite: 'cat',
        alt: 'A cat.',
        values: { fur: true, flies: false },
      },
      {
        id: 'bat',
        name: 'Bat',
        sprite: 'bat',
        alt: 'A bat.',
        values: { fur: true, flies: true },
      },
      {
        id: 'duck',
        name: 'Duck',
        sprite: 'duck',
        alt: 'A duck.',
        values: { fur: false, flies: true },
      },
    ],
  };
}

/** The [path, code] pairs reported for a pack. */
function problems(pack: unknown): [string, string][] {
  return validateBoardPack(pack).errors.map((e) => [e.path, e.code]);
}

describe('validateBoardPack', () => {
  it('accepts a valid pack', () => {
    expect(validateBoardPack(validPack())).toEqual({ ok: true, errors: [] });
  });

  it.each([null, 42, 'pack', [], undefined])(
    'rejects %s without throwing',
    (input) => {
      expect(problems(input)).toEqual([['', 'invalid_type']]);
    },
  );

  describe('rule 1: id, name and version', () => {
    it.each([
      ['id', ''],
      ['name', 7],
      ['version', 0],
      ['version', 1.5],
      ['version', '1'],
    ])('reports a bad %s (%s)', (field, value) => {
      expect(problems({ ...validPack(), [field]: value })).toEqual([
        [field, 'invalid_type'],
      ]);
    });

    it('reports a missing field', () => {
      const pack = validPack();
      delete pack.name;
      expect(problems(pack)).toEqual([['name', 'invalid_type']]);
    });

    it('reports attributes and characters that are not arrays', () => {
      expect(
        problems({ ...validPack(), attributes: {}, characters: 'x' }),
      ).toEqual([
        ['attributes', 'invalid_type'],
        ['characters', 'invalid_type'],
      ]);
    });

    it('reports entries that are not objects', () => {
      const pack = validPack();
      (pack.attributes as unknown[]).push('size');
      (pack.characters as unknown[]).push(null);
      expect(problems(pack)).toEqual([
        ['attributes[2]', 'invalid_type'],
        ['characters[3]', 'invalid_type'],
      ]);
    });
  });

  describe('rule 2: unique ids', () => {
    it('reports a repeated attribute id', () => {
      const pack = validPack();
      pack.attributes.push({ ...pack.attributes[0], question: 'Furry?' });
      expect(problems(pack)).toEqual([['attributes[2].id', 'duplicate_id']]);
    });

    it('reports a repeated character id', () => {
      const pack = validPack();
      pack.characters[2].id = 'cat';
      expect(problems(pack)).toEqual([['characters[2].id', 'duplicate_id']]);
    });
  });

  describe('rule 3: attributes', () => {
    it('reports an empty question', () => {
      const pack = validPack();
      pack.attributes[0].question = '  ';
      expect(problems(pack)).toEqual([
        ['attributes[0].question', 'empty_question'],
      ]);
    });

    it('reports a missing group', () => {
      const pack = validPack();
      delete pack.attributes[1].group;
      expect(problems(pack)).toEqual([['attributes[1].group', 'empty_group']]);
    });

    it('reports a type other than boolean', () => {
      const pack = validPack();
      pack.attributes[0].type = 'number';
      expect(problems(pack)).toEqual([
        ['attributes[0].type', 'invalid_attribute_type'],
      ]);
    });
  });

  describe('rule 4: values', () => {
    it('reports a missing value', () => {
      const pack = validPack();
      delete pack.characters[1].values.flies;
      expect(problems(pack)).toEqual([
        ['characters[1].values.flies', 'missing_value'],
      ]);
    });

    it('reports a value for an unknown attribute', () => {
      const pack = validPack();
      pack.characters[0].values.wings = false;
      expect(problems(pack)).toEqual([
        ['characters[0].values.wings', 'unknown_value'],
      ]);
    });

    it('reports a value that is not a boolean', () => {
      const pack = validPack();
      pack.characters[0].values.fur = 'yes';
      expect(problems(pack)).toEqual([
        ['characters[0].values.fur', 'invalid_value'],
      ]);
    });

    it('reports values that are not an object', () => {
      const pack = validPack();
      pack.characters[0].values = [] as unknown as Record<string, unknown>;
      expect(problems(pack)).toContainEqual([
        'characters[0].values',
        'invalid_type',
      ]);
    });
    it('does not also report no_split when a value is missing or invalid', () => {
      const pack = validPack();
      pack.characters = pack.characters.slice(0, 2);
      pack.characters[1].values = { fur: 'yes', flies: true };
      expect(problems(pack)).toEqual([
        ['characters[1].values.fur', 'invalid_value'],
      ]);
    });

    it('reports a missing value for an id that is also an Object property', () => {
      const pack = validPack();
      pack.attributes.push({
        id: 'constructor',
        group: 'Type',
        question: 'Q?',
        type: 'boolean',
      });
      pack.characters[0].values['constructor'] = true;
      pack.characters[1].values['constructor'] = false;
      expect(problems(pack)).toEqual([
        ['characters[2].values.constructor', 'missing_value'],
      ]);
    });
  });

  describe('rule 5: name, sprite and alt', () => {
    it.each(['name', 'sprite', 'alt'])('reports an empty %s', (field) => {
      const pack = validPack();
      pack.characters[0][field] = '';
      expect(problems(pack)).toEqual([
        [`characters[0].${field}`, 'empty_field'],
      ]);
    });
  });

  describe('rule 6: characters can be told apart', () => {
    it('reports a character with the same answers as another', () => {
      const pack = validPack();
      pack.characters[1].values = { fur: false, flies: true };
      const result = validateBoardPack(pack);
      expect(result.errors.map((e) => [e.path, e.code])).toEqual([
        ['characters[2]', 'duplicate_character'],
      ]);
      expect(result.errors[0].message).toContain('Bat');
    });
  });

  describe('rule 7: every attribute splits the board', () => {
    it('reports an attribute that is the same for everyone', () => {
      const pack = validPack();
      pack.attributes.push({
        id: 'alive',
        group: 'Type',
        question: 'Alive?',
        type: 'boolean',
      });
      for (const character of pack.characters) character.values.alive = true;
      expect(problems(pack)).toEqual([['attributes[2]', 'no_split']]);
    });
  });

  describe('rule 8: minimum size', () => {
    it('reports fewer than 2 characters', () => {
      const pack = validPack();
      pack.characters = pack.characters.slice(0, 1);
      expect(problems(pack)).toContainEqual([
        'characters',
        'too_few_characters',
      ]);
    });

    it('does not count entries that are not objects', () => {
      const pack = validPack();
      (pack.characters as unknown[]).splice(1, 2, null);
      expect(problems(pack)).toEqual([
        ['characters[1]', 'invalid_type'],
        ['characters', 'too_few_characters'],
      ]);
    });

    it('reports no attributes', () => {
      const pack = validPack();
      pack.attributes = [];
      for (const character of pack.characters) character.values = {};
      expect(problems(pack)).toEqual([['attributes', 'too_few_attributes']]);
    });
  });

  it('reports every problem in one pack, not just the first', () => {
    const pack = validPack();
    pack.version = 'one';
    pack.attributes[0].question = '';
    pack.characters[0].alt = '';
    delete pack.characters[1].values.fur;
    expect(problems(pack)).toEqual([
      ['version', 'invalid_type'],
      ['attributes[0].question', 'empty_question'],
      ['characters[0].alt', 'empty_field'],
      ['characters[1].values.fur', 'missing_value'],
    ]);
  });
});
