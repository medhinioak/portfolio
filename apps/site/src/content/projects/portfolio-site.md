---
title: 'A portfolio site built like a product'
summary: 'A personal site, blog and (soon) game, built as a real engineering project: fast, accessible, privacy-friendly and cheap to run.'
role: 'Designer and developer'
year: 2026
timeframe: 'Started Nov 2026, in progress'
team: 'Solo, with AI assistants under my review'
context: 'Personal project'
stack:
  [
    'Astro',
    'React',
    'TypeScript',
    'pnpm',
    'GitHub Actions',
    'GitHub Pages',
    'Vitest',
    'Playwright',
    'Lighthouse CI',
    'axe',
  ]
codeUrl: 'https://github.com/medhinioak/portfolio'
# No demoUrl: the live demo is this site.
order: 2
---

## The problem

I needed a place to show my work that was fast, accessible and search-friendly, ran for under €10 a month, and respected visitors' privacy under German law. It also had to be a project I could show in a job search, not a template with my name on it.

## What I did

I planned it in phases with cut lines, and wrote down each big decision as a short ADR. The site is built with Astro and React islands, so content pages ship almost no JavaScript. It uses self-hosted fonts, no analytics, no cookies and no third-party requests, which means no consent banner. CI runs lint, type checks, tests, accessibility checks and Lighthouse, and the deploy fails if any placeholder text is left on a page. I used AI assistants as authors and reviewers, but I made every decision, and the whole setup is documented in the repo.

## Outcome

The site is live on medhinioak.dev with light and dark themes, a CI pipeline and automatic deploys, and the plan has hosting moving to AWS with Terraform next. After launch I'll add the real Lighthouse and accessibility results. I won't put numbers here until I've measured them.

<figure class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 712" width="460" height="712" role="img" aria-label="Every change reaches the site through one automated path: pull request, CI, protected main, a deploy build that refuses unfinished pages, then GitHub Pages today and S3 with CloudFront later, both serving medhinioak.dev." fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" font-size="12">
  <defs>
    <marker id="pd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M1 1 L9 5 L1 9" stroke="currentColor" stroke-width="1.5" fill="none"/>
    </marker>
  </defs>
  <g stroke="none" fill="currentColor" text-anchor="middle">
    <!-- 1 pull request -->
    <text x="230" y="38" font-size="14" font-weight="700">Pull request</text>
    <text x="230" y="56" opacity=".8">one branch per issue · Conventional Commit title</text>
    <!-- 2 CI -->
    <text x="230" y="134" font-size="14" font-weight="700">CI</text>
    <text x="230" y="153" opacity=".8">ci: lint · type check · tests · build</text>
    <text x="230" y="170" opacity=".8">quality: Playwright · axe · Lighthouse</text>
    <!-- 3 main -->
    <text x="230" y="246" font-size="14" font-weight="700">main (protected)</text>
    <text x="230" y="264" opacity=".8">squash merge · no direct or force pushes</text>
    <!-- 4 deploy -->
    <text x="230" y="342" font-size="14" font-weight="700">Deploy workflow</text>
    <text x="230" y="361" opacity=".8">pnpm build, then a guard step:</text>
    <text x="230" y="378" opacity=".8">fails if a PLACEHOLDER marker is left on a page</text>
    <!-- hosts -->
    <text x="127.5" y="508" font-size="14" font-weight="700">GitHub Pages</text>
    <text x="127.5" y="526" font-weight="700">live today</text>
    <text x="127.5" y="548" opacity=".8">HTTPS enforced</text>
    <text x="127.5" y="565" opacity=".8">static files, no server</text>
    <text x="332.5" y="508" font-size="14" font-weight="700">AWS</text>
    <text x="332.5" y="526" font-weight="700">planned, Phase 2</text>
    <text x="332.5" y="548" opacity=".8">private S3 bucket</text>
    <text x="332.5" y="565" opacity=".8">CloudFront + ACM cert</text>
    <text x="332.5" y="582" opacity=".8">Terraform · Route 53</text>
    <!-- visitors -->
    <text x="230" y="664" font-size="14" font-weight="700">medhinioak.dev</text>
    <text x="230" y="682" opacity=".8">every request stays on this one domain</text>
  </g>
  <!-- arrow labels -->
  <g stroke="none" fill="currentColor" text-anchor="start">
    <text x="240" y="97">CI runs on every pull request</text>
    <text x="240" y="209">green CI, conversations resolved</text>
    <text x="240" y="305">push to main starts it</text>
    <text x="137" y="440">Pages artifact</text>
    <text x="342" y="434">sync + invalidate</text>
    <text x="342" y="450">OIDC, no stored keys</text>
    <text x="137" y="625">today</text>
    <text x="342" y="625">after the DNS switch</text>
  </g>
  <!-- boxes -->
  <rect x="30" y="16" width="400" height="56" rx="8"/>
  <rect x="30" y="112" width="400" height="72" rx="8"/>
  <rect x="30" y="224" width="400" height="56" rx="8"/>
  <rect x="30" y="320" width="400" height="80" rx="8" fill-opacity=".12" style="stroke: var(--color-highlight); fill: var(--color-highlight)"/>
  <rect x="30" y="484" width="195" height="116" rx="8"/>
  <rect x="235" y="484" width="195" height="116" rx="8" stroke-dasharray="6 5"/>
  <rect x="30" y="640" width="400" height="56" rx="8"/>
  <!-- arrows -->
  <line x1="230" y1="72" x2="230" y2="110" marker-end="url(#pd-arrow)"/>
  <line x1="230" y1="184" x2="230" y2="222" marker-end="url(#pd-arrow)"/>
  <line x1="230" y1="280" x2="230" y2="318" marker-end="url(#pd-arrow)"/>
  <line x1="127" y1="400" x2="127" y2="482" marker-end="url(#pd-arrow)"/>
  <line x1="332" y1="400" x2="332" y2="482" marker-end="url(#pd-arrow)" stroke-dasharray="6 5"/>
  <line x1="127" y1="600" x2="127" y2="638" marker-end="url(#pd-arrow)"/>
  <line x1="332" y1="600" x2="332" y2="638" marker-end="url(#pd-arrow)" stroke-dasharray="6 5"/>
</svg>
<figcaption>How a change reaches the site: one automated path, and the guard that stops unfinished pages. The AWS branch (dashed) is planned for Phase 2.</figcaption>
</figure>

## What I learned

A green CI run doesn't prove the job did its work: my AI review workflow stayed green for days without posting a single review. Decisions are much easier to defend when they're written down, and cut lines keep a solo project shippable.

## Credits

Fonts: Pixelify Sans and Atkinson Hyperlegible (open licence). AI assistance: Claude Code, plus a Gemini review on request. No teammates, so no permission to publish is needed.
