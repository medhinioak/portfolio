# ADR-0011: Build the game before the AWS move

- Status: Accepted
- Date: 2026-11-17
- Decider: Medhini
- Review: Claude (project chat), 2026-11-17

## Context

The plan had AWS and Terraform as Phase 2 (Nov 23 – Dec 6) and the game as Phase 3
(Dec 7–27). Phase 1 launched ahead of schedule. The site's primary audience is
friends, and the game is the part they will come back for; the AWS move changes
nothing a visitor can see. The game is static files and needs nothing from AWS.
Phase 2's own cut line already allowed staying on GitHub Pages and starting the game
first. I can keep the same 8–10 hours a week through the December holidays.

## Decision

Swap the two phases:

- **Phase 2, the game:** Nov 18 – Dec 13, hard stop Dec 20.
- **Phase 3, AWS and Terraform:** Dec 14 – Jan 3. It starts the day after the game
  ships and no later than Dec 21, so it can't slide indefinitely. If Terraform does
  not work by Dec 31, the site stays on GitHub Pages and the move finishes in January.

The game post becomes Post 2 and the AWS post becomes Post 3. ADR-0003 (GitHub Pages
first, then AWS) still stands; this changes only the order and dates, including the
"Dec 3" fallback date in ADR-0003's consequences.

## Alternatives considered

- **Keep AWS first.** Cloud and Terraform work is the strongest evidence for cloud
  engineering roles, and it would arrive about three weeks sooner. Not chosen: the
  game matters more to the primary audience, and the AWS work still lands before
  January.
- **Run both phases in parallel.** Two topics at once breaks the "one thing in
  progress" working rule and makes both gates harder to judge.

## Consequences

- The game ships about three weeks earlier, while launch momentum is high.
- Evidence of the AWS and Terraform work arrives later, around the turn of the year.
- The GitHub Pages limits last longer: no security headers, no HSTS header and no
  custom cache rules until CloudFront (`docs/launch-checklist.md`, Security and Performance).
- The AWS work falls over the holidays; the fixed start date and the Dec 31 cut line
  keep it from sliding.
- GitHub milestones are renamed to match: "Phase 2: Animal Game" and "Phase 3: AWS & Terraform".
- Revisit if job applications for cloud roles need the AWS work sooner.
