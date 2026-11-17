/** Board pack validator: checks every rule in docs/game/spec.md and reports all problems. */
import type { ValidationError, ValidationResult } from './board';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/** Checks a board pack against the spec's rules; never throws. */
export function validateBoardPack(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const report = (path: string, code: string, message: string): void => {
    errors.push({ path, code, message });
  };

  if (!isRecord(input)) {
    report('', 'invalid_type', 'The board pack must be an object.');
    return { ok: false, errors };
  }

  // Rule 1: id, name and version.
  for (const field of ['id', 'name'] as const) {
    if (!isNonEmptyString(input[field])) {
      report(field, 'invalid_type', `"${field}" must be a non-empty string.`);
    }
  }
  const version = input.version;
  if (
    typeof version !== 'number' ||
    !Number.isInteger(version) ||
    version < 1
  ) {
    report('version', 'invalid_type', '"version" must be an integer from 1.');
  }

  // Rules 2 and 3: attributes. Only well-formed ids are used by the later rules.
  const attributeIndex = new Map<string, number>(); // id -> index in input.attributes
  if (!Array.isArray(input.attributes)) {
    report('attributes', 'invalid_type', '"attributes" must be an array.');
  } else {
    input.attributes.forEach((attribute: unknown, i) => {
      const path = `attributes[${i}]`;
      if (!isRecord(attribute)) {
        report(path, 'invalid_type', 'An attribute must be an object.');
        return;
      }
      if (!isNonEmptyString(attribute.id)) {
        report(
          `${path}.id`,
          'invalid_type',
          'An attribute id must be a non-empty string.',
        );
      } else if (attributeIndex.has(attribute.id)) {
        report(
          `${path}.id`,
          'duplicate_id',
          `Attribute id "${attribute.id}" is used twice.`,
        );
      } else {
        attributeIndex.set(attribute.id, i);
      }
      if (!isNonEmptyString(attribute.question)) {
        report(
          `${path}.question`,
          'empty_question',
          'The question must not be empty.',
        );
      }
      if (!isNonEmptyString(attribute.group)) {
        report(`${path}.group`, 'empty_group', 'The group must not be empty.');
      }
      if (attribute.type !== 'boolean') {
        report(
          `${path}.type`,
          'invalid_attribute_type',
          'The type must be "boolean".',
        );
      }
    });
  }
  const attributeIds = [...attributeIndex.keys()];

  // Rules 2, 4 and 5: characters. One row per character object feeds rules 6 to 8.
  const characterIds = new Set<string>();
  const rows: {
    path: string;
    name: string;
    values: UnknownRecord;
    complete: boolean;
  }[] = [];
  let everyCharacterReadable = true;
  if (!Array.isArray(input.characters)) {
    report('characters', 'invalid_type', '"characters" must be an array.');
  } else {
    input.characters.forEach((character: unknown, i) => {
      const path = `characters[${i}]`;
      if (!isRecord(character)) {
        report(path, 'invalid_type', 'A character must be an object.');
        everyCharacterReadable = false;
        return;
      }
      if (!isNonEmptyString(character.id)) {
        report(
          `${path}.id`,
          'invalid_type',
          'A character id must be a non-empty string.',
        );
      } else if (characterIds.has(character.id)) {
        report(
          `${path}.id`,
          'duplicate_id',
          `Character id "${character.id}" is used twice.`,
        );
      } else {
        characterIds.add(character.id);
      }
      for (const field of ['name', 'sprite', 'alt'] as const) {
        if (!isNonEmptyString(character[field])) {
          report(
            `${path}.${field}`,
            'empty_field',
            `"${field}" must not be empty.`,
          );
        }
      }
      const name = isNonEmptyString(character.name) ? character.name : path;
      const values = character.values;
      if (!isRecord(values)) {
        report(`${path}.values`, 'invalid_type', '"values" must be an object.');
        rows.push({ path, name, values: {}, complete: false });
        return;
      }
      let complete = true;
      for (const id of attributeIds) {
        if (!Object.hasOwn(values, id)) {
          report(
            `${path}.values.${id}`,
            'missing_value',
            `No value for "${id}".`,
          );
          complete = false;
        } else if (typeof values[id] !== 'boolean') {
          report(
            `${path}.values.${id}`,
            'invalid_value',
            'A value must be true or false.',
          );
          complete = false;
        }
      }
      for (const key of Object.keys(values)) {
        if (!attributeIndex.has(key)) {
          report(
            `${path}.values.${key}`,
            'unknown_value',
            `"${key}" is not an attribute.`,
          );
        }
      }
      rows.push({ path, name, values, complete });
    });
  }

  // Rule 6: no two characters with identical values. Only complete rows can be compared.
  const seen = new Map<string, string>();
  for (const row of rows) {
    if (!row.complete || attributeIds.length === 0) continue;
    const key = attributeIds.map((id) => (row.values[id] ? '1' : '0')).join('');
    const first = seen.get(key);
    if (first === undefined) {
      seen.set(key, row.name);
    } else {
      report(
        row.path,
        'duplicate_character',
        `${row.name} has the same answers as ${first}, so they cannot be told apart.`,
      );
    }
  }

  // Rule 7: every attribute splits the board. Skipped for an attribute while any
  // character lacks a valid value for it, so a broken value is not reported twice.
  if (everyCharacterReadable && rows.length >= 2) {
    for (const [id, index] of attributeIndex) {
      const answers = rows.map((row) => row.values[id]);
      if (!answers.every((answer) => typeof answer === 'boolean')) continue;
      if (!answers.includes(true) || !answers.includes(false)) {
        report(
          `attributes[${index}]`,
          'no_split',
          `"${id}" has the same answer for every character, so it tells nothing.`,
        );
      }
    }
  }

  // Rule 8: at least 2 usable characters and 1 usable attribute.
  if (Array.isArray(input.characters) && rows.length < 2) {
    report(
      'characters',
      'too_few_characters',
      'A board needs at least 2 characters.',
    );
  }
  if (Array.isArray(input.attributes) && attributeIds.length < 1) {
    report(
      'attributes',
      'too_few_attributes',
      'A board needs at least 1 attribute.',
    );
  }

  return { ok: errors.length === 0, errors };
}
