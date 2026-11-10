# ADR-0005: Build a "guess that animal" deduction game on board packs

- Status: Accepted
- Date: 2026-11-10
- Decider: Medhini

## Context

The site gets one small single-player game, buildable in roughly 18–24 hours. A
long-term idea is boards generated from a text prompt, which is out of scope now
but should not require a rewrite later.

## Decision

- A Guess-Who-style duel against the computer, themed on animals, with an original
  name and original pixel or SVG art. ("Guess Who?" is a third-party trademark.)
- A pure TypeScript deduction engine that plays any **board pack**: a JSON file
  with an attribute schema and characters. The engine does not know what the
  characters look like.
- The computer asks the question whose yes/no split of its remaining candidates is
  closest to half (maximum expected information). Difficulty adds controlled randomness.
- Rendering with React and SVG; no game engine.
- Scope: 24 animals (cut line 16), three difficulties (cut line two), keyboard and
  touch play, engine unit tests.

## Alternatives considered

- **Incident-triage puzzle** — no art cost and relevant to cloud roles, but niche and
  less fun for non-engineers.
- **Daily code-breaker** — smallest scope, but a crowded genre.
- **Canvas or Phaser** — no benefit for a turn-based board game; SVG is more accessible.

## Consequences

- The engine is easy to unit-test and could run on a server or CLI later.
- Prompt-generated boards only need to produce a valid board pack.
- Drawing the animals is the largest time risk, hence the 16-animal cut line.
