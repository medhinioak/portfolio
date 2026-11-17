# ADR-0013: Players ask from a fixed list of questions, with a filter

- Status: Proposed
- Date: 2026-11-17
- Decider: Medhini
- Review: Claude (project chat), 2026-11-17

## Context

I asked whether players could type their own questions. The engine answers every
question from the board pack's yes/no values and nothing else
([ADR-0005](0005-deduction-game-with-board-packs.md)). A typed question has to be turned
into one of those attributes first. The site is static and sends no third-party requests
([ADR-0004](0004-no-third-party-requests-and-no-analytics-at-launch.md)), and the game's
rule is that answers are always true.

## Decision

The player asks from a fixed list of questions defined in the board pack: 68 for the
animals board, in five groups. A "Filter questions" box narrows the list as you type, and
group buttons narrow it further. The box never asks a question by itself; only a question
button does. Details: [`game/spec.md`](../game/spec.md#asking-and-guessing).

## Alternatives considered

- **Free text matched by keywords.** It feels open, but a wrong match gives a wrong
  answer, which breaks "answers are always true", and players will type things the board
  cannot answer.
- **A language model in the browser.** It could read free text, but it means a large
  download, slow starts and answers that can still be wrong.
- **A hosted language model.** Needs a third-party request and ongoing cost, against
  ADR-0004.

## Consequences

- Every answer comes straight from the data, so the engine stays pure and testable.
- The question list grows with the board and has to be kept correct; each question needs a
  clear "how to read it" note for edge cases.
- The filter keeps a list of 68 usable on a phone and with a keyboard or screen reader.
- Revisit if prompt-generated boards arrive, since they would need a way to ask about
  attributes that are not in a fixed list.
