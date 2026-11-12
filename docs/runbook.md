# Runbook

How the site gets deployed, and what to do when something goes wrong.
This covers Phase 1 hosting on GitHub Pages ([ADR-0003](adr/0003-github-pages-first-then-aws.md)).
Phase 2 adds AWS.

## How deploy works

1. A pull request is squash-merged into `main`.
2. [`deploy.yml`](../.github/workflows/deploy.yml) runs on the push. Job `build`:
   - installs with `pnpm install --frozen-lockfile` and runs `pnpm build`;
   - fails if any text file in `apps/site/dist` contains the marker `PLACEHOLDER:` (or its URL-encoded form `PLACEHOLDER%3A`), and lists
     those files (the bare word, for example in a post about this rule, is fine);
   - uploads `apps/site/dist` as the Pages artifact.
3. Job `deploy` (the only job with `pages: write` and `id-token: write`) publishes the artifact with `actions/deploy-pages` to the
   `github-pages` environment. The site is served at <https://medhinioak.dev>, with no base path.
4. Deploys share the concurrency group `pages`. A running deploy is never cancelled.
   At most one more waits behind it: if another push arrives meanwhile, the waiting run
   is cancelled and replaced by the newest one. A cancelled deploy run is expected, not a failure.

[`ci.yml`](../.github/workflows/ci.yml) runs lint, type check, tests and build on every
pull request and on `main` (job `ci`). Job `quality` then builds again and runs the
Playwright smoke, axe and drawer tests and Lighthouse CI; its reports are the
`playwright-report` and `lighthouse-reports` artifacts of the run. Neither job deploys
or checks for `PLACEHOLDER:`.
Deploy doesn't wait for CI; the main ruleset (below) makes sure only commits that passed
CI reach `main`.

## One-time setup

Needed once before the first deploy, and again if the repository is recreated.

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Settings → Pages → Custom domain: `medhinioak.dev`. There is no `CNAME` file in the
   repository: with Actions deployments the domain lives only in the settings.
3. DNS for the apex points at GitHub Pages (A and AAAA records, as listed in GitHub's docs).
4. Once the certificate exists, tick **Enforce HTTPS**.
5. Settings → Rules → Rulesets → new branch ruleset for `main` (after `ci` has run once):
   - Require a pull request before merging.
   - Require status checks to pass: add `ci`, and tick
     **Require branches to be up to date before merging**, so each PR is tested against
     the `main` it lands on.
   - Block force pushes.
   Bypassing the ruleset as admin skips this protection, and that commit deploys anyway.

## Deploy manually

Re-deploys the current `main`, for example after changing Pages settings:

```sh
gh workflow run deploy.yml --ref main
gh run watch
```

Or: Actions → Deploy → Run workflow.

## Roll back

Choose one:

- **Revert the PR (preferred).** `gh pr view N`, then use "Revert" on the PR page (or
  `git revert` the squash commit on a branch) and merge the revert PR. The push to
  `main` deploys the previous state. History stays honest.
- **Re-run an older successful deploy (fast).** `gh run list --workflow deploy.yml`,
  pick the last good run, then `gh run rerun <run-id>`. That rebuilds and deploys
  that run's commit. It is temporary: the next push to `main` deploys `main` again,
  so follow up with a revert. GitHub only re-runs runs from the last 30 days; for an
  older good state, revert instead.

## When a deploy fails

- **PLACEHOLDER guard:** the step log lists the files. Replace the placeholder text in
  the source with real content (never invented facts), or take the page out, then merge again.
- **Build or install:** reproduce locally with `pnpm install --frozen-lockfile && pnpm build`.
  Problems seen before are in [`troubleshooting.md`](troubleshooting.md).
- **deploy-pages fails with a 404 or a permissions error:** Pages isn't enabled, or the source
  isn't "GitHub Actions". See One-time setup.
