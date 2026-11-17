/** The question list filter (docs/game/spec.md, Asking and guessing). */
import type { Attribute } from './board';

/** The group button that shows every question. */
export const ALL_GROUPS = 'All';

/** The question groups in the order they first appear in the pack. */
export function questionGroups(attributes: readonly Attribute[]): string[] {
  return [...new Set(attributes.map((a) => a.group))];
}

/** The questions in `group` (or all) that contain every typed word, in any order and case. */
export function filterQuestions(
  attributes: readonly Attribute[],
  text: string,
  group: string = ALL_GROUPS,
): Attribute[] {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  return attributes.filter(
    (a) =>
      (group === ALL_GROUPS || a.group === group) &&
      words.every((w) => a.question.toLowerCase().includes(w)),
  );
}
