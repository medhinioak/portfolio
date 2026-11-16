---
title: How I built my portfolio site in two weeks
description: 'How I planned and built medhinioak.dev as a solo, part-time project run like a team project, with decision records, CI gates and AI assistants under review.'
# PLACEHOLDER: set the real publication date when the post goes live.
pubDate: 2026-11-12
tags:
  - process
  - astro
  - ai
cover:
  image: ./building-my-portfolio-site-in-two-weeks/cover.png
  alt: 'Self-drawn chibi of Medhini jumping with one arm up, with the word “Hi!” beside her.'
# Set draft to false only after the owner has re-read the whole post.
draft: true
---

I built this site for my friends first, and for the people who find me through YouTube or Twitch, or through a recruiter's inbox, second. It's a home for my projects, my blog and, eventually, a small game, and it's meant to feel like a tidy game menu, not a startup landing page. This is how I built it in about two weeks, solo, at 8–10 hours a week, with a master's degree and one very opinionated cat in the background.

## Why build it myself

A template would have been quicker, and a hosted builder quicker still. But the point of this site isn't only what you see, it's what's under the hood. I wanted a project that shows how I work: how I plan, how I record decisions, and how I stick to engineering best practices, from CI and tests to accessibility checks and, soon, infrastructure as code. I also wanted to learn how to do all of it myself, end to end, instead of letting a tool hide the interesting parts. It had to feel like me too, a tidy game menu with pixel headings, and it had to respect visitors' privacy, which is easier to promise when I control every request the site makes. So I set myself some rules: solo, under €10 a month, static hosting, and everything deployed from code.

## How I planned it

I didn't start with `npm create`. I started with a brief: who the site is for, a monthly cost ceiling of €10, infrastructure as code, German legal basics, and a game small enough for one person to build. From there I worked out the pieces myself: the game concept, the tech stack, the repository layout, a site map, a plan split into phases, the things I would not do, and a pre-launch checklist. I used Claude to turn that thinking into a written plan, then went through its first draft, left 32 comments and made the changes. The calls were mine: who the site is for, which game to build, which stack to use and what to leave out.

Then I had a second model, Gemini, review the plan. I asked both models to challenge my assumptions instead of agreeing with me, and it paid off. My first game idea needed hand-drawn characters, and Claude's estimate of the art workload is what made me switch to a simpler animal theme. The reviews also raised legal and privacy points, which I looked into and made decisions on.

Two habits keep the plan realistic. Each phase ends at a gate, a written list of things that must be true before I move on, and a phase that misses its gate doesn't get more scope, it gets cut to a line I wrote in advance. And new ideas go into a parking lot, so they can't sneak into whatever I'm working on. I even thought about calling the phases "sprints", then decided against it: sprints are fixed, repeating timeboxes, and neither they nor program increments describe one person working towards gates. Using a term correctly reads as more professional than borrowing a bigger one.

## How every change flows

Everything is docs-as-code. The plan, the decision records, the process notes, the launch checklist, the runbook and a troubleshooting log all live in the repository as Markdown, changed through pull requests like the code, so git keeps the history. I thought about setting up Confluence and decided it was overkill. Each significant decision gets a short architecture decision record with its context, alternatives and consequences, and accepted ones aren't edited: a changed decision gets a new record that supersedes the old one, which has already happened twice. The original planning document stays private. It was written as advice to me, which is the wrong voice for a repository, so I rewrote it as the project's own record.

Every change, including mine, takes the same path. It starts as an issue, gets its own branch, and then Claude Code works in plan mode first, so I approve the plan before any code is written. The pull request has a Conventional Commit title and a template that records the checks and which AI was involved. CI runs lint, type checks, unit tests, the build, accessibility checks and Lighthouse. After review, it's squashed into a protected main branch: no direct pushes, a green CI and every conversation resolved.

The deploy has one extra guard. Anything I don't know yet is written as a placeholder marker, and the production deploy fails if that marker appears on a published page. Drafts never block development, and nothing half-written reaches the site.

## How this compares with industry practice

Most of this is ordinary good practice, scaled down. Decision records follow the format Michael Nygard described, definitions of done and cut lines come from agile practice, and a protected main branch with required checks, small pull requests and Conventional Commits is how most teams keep a clean history. Quality targets such as WCAG 2.2 AA, Core Web Vitals in the "good" range and a page-weight budget are checked in CI instead of by eye. The runbook and the troubleshooting log are lightweight versions of what operations teams keep, and I write the notes blamelessly, about what broke and why.

Where it differs, honestly: there is no second human reviewer. I approve my own pull requests after AI reviews and my own read of the full diff, and that is the biggest gap compared with a team. There is no staging environment, so changes are checked against a production build, and when I move to AWS I'll test it on its own address before switching the domain. And there's no monitoring or on-call, because for a static site an outage just means "revert and redeploy", which is written down in the runbook.

## Choosing the stack

I chose each part of the stack against three constraints: 8–10 hours a week, under €10 a month, and a game that has to be able to leave the site later. Every choice is written down as an architecture decision record (ADR). The [records live in the repository](https://github.com/medhinioak/portfolio/tree/main/docs/adr) next to the code, so you can read the reasoning, the alternatives I turned down and what each choice costs.

| Choice | Why I chose it | What I gave up |
| --- | --- | --- |
| **Astro with React islands** ([ADR-0001](https://github.com/medhinioak/portfolio/blob/main/docs/adr/0001-astro-with-react-islands.md)) | The site is mostly content, so pages ship almost no JavaScript and fast Lighthouse scores come cheap. React only loads where something is interactive, like the theme toggle and, later, the game. | Next.js shows up more often in job ads. |
| **A pnpm monorepo with the game as its own package** ([ADR-0002](https://github.com/medhinioak/portfolio/blob/main/docs/adr/0002-monorepo-with-standalone-game-package.md)) | The game becomes a standalone project later. A lint rule stops it importing anything from the site, and the engine stays plain TypeScript, so extracting it is one `git subtree split`. | A little workspace setup up front. |
| **GitHub Pages first, AWS later** ([ADR-0003](https://github.com/medhinioak/portfolio/blob/main/docs/adr/0003-github-pages-first-then-aws.md)) | Launch isn't held up by infrastructure. Later, the site moves to S3 and CloudFront, built with Terraform and deployed with short-lived OIDC credentials instead of stored keys. The target is about $2 a month. | A planned DNS switch-over. |
| **Upgrading to Astro 7 early** ([ADR-0008](https://github.com/medhinioak/portfolio/blob/main/docs/adr/0008-upgrade-to-astro-7.md)) | Dependabot flagged security advisories for Astro 6, including a critical one in its image handling, and the fixes exist only in Astro 7. Nothing was exploitable yet, but images were about to arrive with the case studies, so I upgraded while the change was still small. | A newer Node minimum and a few Astro 7 quirks. |

## Working with AI

I build this solo, and AI assistants are a big part of how that works in 8–10 hours a week. So I wrote the rules down in the repository ([ADR-0006](https://github.com/medhinioak/portfolio/blob/main/docs/adr/0006-ai-assisted-development-with-human-review.md) and [`docs/ai-usage.md`](https://github.com/medhinioak/portfolio/blob/main/docs/ai-usage.md)) instead of improvising them. Claude Code is the author: it writes code on a branch, one author per branch. Planning and decisions happen in a Claude project that reads the same docs from the repository, so chats and code stay in sync, and a decision made in a chat isn't final until it's written into the repo through a pull request. I supply every fact about my own work, I make every decision, and I approve every merge.

Reviews are meant to be independent, because an assistant reviewing its own work misses the same things it missed while writing. Every pull request gets a fresh-context `/code-review` from Claude, a green CI and my own read of the full diff. Anything that must never break is enforced by lint, tests or CI, not by trusting an instruction. And I record which AI was involved in every pull request and in the commit trailers.

The AI was wrong sometimes, too. Early on, Claude dismissed a feature I asked about (Claude Code's agent teams) as unnecessary because it had misread what I meant. I corrected it, it looked up the documentation and gave a better answer: useful later for parallel work, not for a sequential scaffold. Asking an assistant to push back works best when you push back too.

### The Gemini reviewer that never reviewed

I wanted a second model family to review the work as well, so blind spots don't overlap. The first plan was Google's Gemini Code Assist on GitHub, until I found out that Google had shut down its consumer Gemini tools. Plan B was Google's `run-gemini-cli` GitHub Action with a free API key, and getting it to work turned into its own small project.

First came a green job that posted nothing. A recent Gemini CLI release had changed what an empty tool allowlist means, so the example workflow quietly removed every GitHub tool and the model had no way to post. I worked out the cause and [reported it upstream](https://github.com/google-github-actions/run-gemini-cli/issues/532). Next the reviewer asked which pull request it should review, because the values it expected weren't reaching it, which I fixed by passing them in the prompt. Then came timeouts and quota errors: the free tier allows about 20 requests a day, and one review can use up to 25. And every Dependabot pull request failed the review, because Dependabot's runs don't get the repository's secrets.

With 14 pull requests opened in a single day, an automatic review on every PR could never work on the free tier. So I changed the decision ([ADR-0009](https://github.com/medhinioak/portfolio/blob/main/docs/adr/0009-gemini-pr-review-on-request.md)): Gemini now reviews only when I ask, on the pull requests where a second model matters most, such as workflows, decisions and game logic. I'll be honest about where that stands: I've fixed the workflow three times, and I still haven't seen it post a review. Every step is in the [troubleshooting log](https://github.com/medhinioak/portfolio/blob/main/docs/troubleshooting.md). It's a good reminder that a green check isn't proof that anything happened, and that a process is only as real as the parts that actually run.


## Design on a small budget

The design brief was "a tidy game menu, not a startup landing page". Pixel type is the seasoning, not the meal.

- **Wireframes were time-boxed to two hours.** They're low-fidelity and live in [`docs/design/`](https://github.com/medhinioak/portfolio/tree/main/docs/design) for Home, About, a case study, a blog post and the 404 page, in light and dark and at phone width.
- **Colours are design tokens with a contrast table.** Every text colour pair passes WCAG AA (4.5:1) in both themes before it's used anywhere. That rule is also why code blocks have no syntax highlighting for now ([ADR-0010](https://github.com/medhinioak/portfolio/blob/main/docs/adr/0010-no-syntax-highlighting-at-launch.md)): the highlighter writes its own inline colours, which would have needed about eight new tokens, each with its own contrast row.
- **Phone navigation is a left drawer** ([ADR-0007](https://github.com/medhinioak/portfolio/blob/main/docs/adr/0007-phone-navigation-drawer.md)). Focus moves into it, Escape closes it, and the page behind is made inert, so keyboard and screen-reader users can't get lost under the overlay.
- **The theme follows your system setting by default.** A tiny inline script sets the theme before the first paint, so there's no flash. One bug: the toggle's label changed when React took over the page, which made the header wrap and the page jump on phones. Fixing it got its own pull request.

## What's next

**Next, the move to AWS.** The site moves from GitHub Pages to a private S3 bucket behind CloudFront, managed with Terraform, so the whole setup can be destroyed and recreated from the repository.

**After that, the game.** It's a "guess the animal" duel against the computer. The computer picks each question the way a good player would, by choosing the one whose yes/no answer splits its remaining guesses closest to half. The engine is plain TypeScript with unit tests, and it can play any board described in a small JSON file.

If you want to see how any of this was decided, start with the [plan](https://github.com/medhinioak/portfolio/blob/main/docs/plan.md) and the [ADR index](https://github.com/medhinioak/portfolio/tree/main/docs/adr).
