# Runbook

How the site gets deployed, and what to do when something goes wrong.
This covers Phase 1 hosting on GitHub Pages ([ADR-0003](adr/0003-github-pages-first-then-aws.md)).
Phase 2 adds AWS.

## How deploy works

1. A pull request is squash-merged into `main`.
2. [`deploy.yml`](../.github/workflows/deploy.yml) runs on the push. Job `build`:
   - installs with `pnpm install --frozen-lockfile` and runs `pnpm build`;
   - fails if any file in `apps/site/dist` contains the word `PLACEHOLDER`, and lists those files;
   - uploads `apps/site/dist` as the Pages artifact.
3. Job `deploy` publishes the artifact with `actions/deploy-pages` to the
   `github-pages` environment. The site is served at <https://medhinioak.dev>, with no base path.
4. Deploys queue in the concurrency group `pages`. A running deploy is never
   cancelled; a newer one waits for it.

[`ci.yml`](../.github/workflows/ci.yml) runs lint, type check, tests and build on every
pull request and on `main`. It doesn't deploy, and it doesn't check for `PLACEHOLDER`.

## One-time setup

Needed once before the first deploy, and again if the repository is recreated.

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Settings → Pages → Custom domain: `medhinioak.dev`. There is no `CNAME` file in the
   repository: with Actions deployments the domain lives only in the settings.
3. DNS for the apex points at GitHub Pages (A and AAAA records, as listed in GitHub's docs).
4. Once the certificate exists, tick **Enforce HTTPS**.

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
  so follow up with a revert.

## When a deploy fails

- **PLACEHOLDER guard:** the step log lists the files. Replace the placeholder text in
  the source with real content (never invented facts), or take the page out, then merge again.
- **Build or install:** reproduce locally with `pnpm install --frozen-lockfile && pnpm build`.
  Problems seen before are in [`troubleshooting.md`](troubleshooting.md).
- **deploy-pages fails with a 404 or a permissions error:** Pages isn't enabled, or the source
  isn't "GitHub Actions". See One-time setup.
