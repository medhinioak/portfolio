/** The player's ruled-out marks: automatic from answers, with manual overrides (docs/game/spec.md, Ruled-out marks). */

/** Manual choices by character id: true = ruled out, false = kept in. */
export type ManualMarks = Readonly<Record<string, boolean>>;

/** Whether a card shows as ruled out; a manual choice always wins over the automatic mark. */
export function isRuledOut(
  id: string,
  candidates: readonly string[],
  manual: ManualMarks,
): boolean {
  return manual[id] ?? !candidates.includes(id);
}

/** Flips one card's mark, starting from what it shows now. */
export function toggleMark(
  id: string,
  candidates: readonly string[],
  manual: ManualMarks,
): ManualMarks {
  return { ...manual, [id]: !isRuledOut(id, candidates, manual) };
}

/** How many of `ids` are not ruled out. */
export function countStillIn(
  ids: readonly string[],
  candidates: readonly string[],
  manual: ManualMarks,
): number {
  return ids.filter((id) => !isRuledOut(id, candidates, manual)).length;
}
