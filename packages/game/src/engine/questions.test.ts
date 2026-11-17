import { describe, expect, it } from 'vitest';
import { animalsBoard } from '../boards';
import { ALL_GROUPS, filterQuestions, questionGroups } from './questions';

const { attributes } = animalsBoard;

/** The ids of the questions that match. */
function ids(text: string, group?: string): string[] {
  return filterQuestions(attributes, text, group).map((a) => a.id);
}

describe('questionGroups', () => {
  it('lists the five groups in the order of the pack', () => {
    expect(questionGroups(attributes)).toEqual([
      'Type',
      'Body',
      'Looks',
      'Habitat',
      'Behaviour',
    ]);
  });
});

describe('filterQuestions', () => {
  it('shows every question for an empty or blank filter', () => {
    expect(ids('')).toHaveLength(68);
    expect(ids('   ')).toHaveLength(68);
  });

  it('needs every typed word, in any order and case', () => {
    expect(ids('legs')).toEqual(['four_legs', 'two_legs', 'six_legs']);
    expect(ids('LEGS four')).toEqual(['four_legs']);
    expect(ids('four  legs')).toEqual(['four_legs']);
  });

  it('narrows by group as well as by text', () => {
    expect(ids('', 'Type')).toHaveLength(9);
    expect(ids('legs', ALL_GROUPS)).toHaveLength(3);
    expect(ids('spend', 'Habitat')).toEqual(['water_only']);
    expect(ids('legs', 'Habitat')).toEqual([]);
  });
});
