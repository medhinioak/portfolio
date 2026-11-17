# ADR-0012: Make the game art as AI-assisted pixel art, edited by the owner

- Status: Proposed
- Date: 2026-11-17
- Decider: Medhini
- Review: Claude (project chat), 2026-11-17

## Context

[ADR-0005](0005-deduction-game-with-board-packs.md) calls for original pixel or SVG art
and names drawing the animals as the largest time risk. The game has 24 animals, all
drawn from the start; the cut line is 16. The plan gives the game about four weeks at
8–10 hours a week, and the art competes with the engine and the interface for that time.
[ADR-0006](0006-ai-assisted-development-with-human-review.md) makes AI involvement
visible, and the repository is public and part of a job search. Whether purely
AI-generated images can be protected by copyright is unsettled, and image tools differ in
their terms and in how they were trained.

## Decision

Draft each animal sprite with an AI image tool, then redraw or edit it by hand on the
32 × 32 pixel grid, so the published sprite is the owner's work. The owner approves every
sprite. The tool, its terms and the date go into [`ai-usage.md`](../ai-usage.md) once the
tool is chosen. The checklist for each sprite is in [`game/spec.md`](../game/spec.md#art-plan):
original, allowed by the tool's terms, readable at 80 px wide, with alt text.

## Alternatives considered

- **Draw everything by hand** — most clearly the owner's work, but the biggest schedule
  risk; it would likely force the cut to 16 animals.
- **Commission an artist** — good result, but it adds cost to a project with a monthly
  budget under €10, and a dependency on someone else's time.
- **A free pixel-art pack** — fast, but the animals, style and licences would not match a
  board of 24 chosen animals, and the art would not be original.

## Consequences

- The art is faster to make, so all 24 animals are realistic.
- A tool's terms and its training data are a real choice, not a detail. Picking the tool
  is a step in the art issue, and the choice is recorded.
- The pixel-grid edit is what makes each sprite the owner's; skipping it for a sprite
  breaks this decision.
- The game page should say how the art was made (a short credit line); the wording is
  decided with the interface.
- Revisit if the tool's terms change, if a sprite cannot be made original, or if hand
  drawing turns out to be as fast.
