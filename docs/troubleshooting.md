# Troubleshooting log

Problems hit while building this repository, what caused them and how they were fixed.
Newest first. Each entry has the same fields so it can be skimmed:
**Seen** (date, PR, runs), **Symptom**, **Cause**, **Fix**, **Status**.

Status is one of: _fixed_, _workaround_ (remove when the upstream fix lands), _open_.

## Gemini PR review

### Review fails on every Dependabot PR: "No authentication method provided"

- **Seen:** 2026-11-12, Dependabot PRs #49 and #50, runs 43125761494 and 43125780952.
- **Symptom:** the automatic "Gemini Review" job fails on PRs opened by Dependabot. The
  log shows `Secret source: Dependabot`, then "No authentication method provided. Please
  provide one of 'gemini_api_key', 'google_api_key', or 'gcp_workload_identity_provider'."
- **Cause:** workflow runs triggered by Dependabot get only Dependabot secrets, not the
  repository's Actions secrets. This repository has no Dependabot secrets, so
  `GEMINI_API_KEY` is empty.
- **Fix:** the `dispatch` job in `gemini-dispatch.yml` skips PRs opened by
  `dependabot[bot]` (issue #25). To review one, comment `@gemini-cli /review` on it: a
  comment runs as the commenter, with the repository's secrets. Copying the key into
  Dependabot secrets would also work, but it would hand the key to dependency-update runs.
- **Status:** _fixed_ once merged to `main`.

### Reviewer asks which PR to review

- **Seen:** 2026-11-11, PR #9, run 42984490621 (the first run with the `tools.core` fix).
- **Symptom:** green run after about 7 minutes and no review. Gemini's answer in
  `stdout.log`: "The `$REPOSITORY` and `$PULL_REQUEST_NUMBER` variables are not currently
  set… please provide these values." `activate_skill` worked; `run_shell_command` was
  refused, and three `pull_request_read` calls failed.
- **Cause:** the code-review extension expects `REPOSITORY`, `PULL_REQUEST_NUMBER` and
  `ADDITIONAL_CONTEXT` as environment variables and checks them with a shell command. The
  example workflow sets them only in the earlier "Prepare prompt context" step, and the
  `tools.core` allowlist (correctly) leaves out the shell.
- **Fix:** pass them as arguments in the prompt:
  `/pr-code-review REPOSITORY=… PULL_REQUEST_NUMBER=… ADDITIONAL_CONTEXT=…` (PR #10). The
  action hands the prompt to the CLI through an environment variable, so comment text never
  reaches a shell.
- **Status:** _open_. PR #10 is merged and the prompt now carries the values (run
  42986490166 log: `PULL_REQUEST_NUMBER=9`). A posted review has not been seen yet: run
  42986021710 hit the daily quota and run 42986490166 hit a Google outage (503).
  - 2026-11-12, issue #25: switched `GEMINI_MODEL` to `gemini-3-flash-preview` and commented
    `@gemini-cli /review` once on PR #49 (run 43127182869, 00:25 UTC). The run started and
    called tools, then failed after 49 s with `429`: `generate_content_free_tier_requests,
    limit: 20, model: gemini-3-flash`, "retry in 7h33m" (the reset at midnight Pacific). The
    day's earlier runs were all on `gemini-3.8-flash`, so the two names seem to share one
    quota. Before the 429,
    `run_shell_command` was refused (expected, see above) and one
    `mcp_github_pull_request_read` call "reported an error"; the action skips the
    `gemini-output` upload when the run fails, so that error's details aren't available.

### Green run, no review posted

- **Seen:** 2026-11-11, PR #8, runs 42981788352 and 42982620350.
- **Symptom:** the "Gemini Review" job succeeds in under three minutes, but no review or
  comment appears on the PR. With debug on, Gemini CLI's JSON output ends with
  `"error": {"type": "INVALID_STREAM", "message": "Model stream ended with malformed function call."}`
  and `"tools": {"totalCalls": 0}`. It happened with both `gemini-3.8-flash` and
  `gemini-3-flash-preview`, so the model was not the cause.
- **Cause:** the upstream example workflow sets `"tools": {"core": []}`. Since gemini-cli
  v0.41.0 any `tools.core` value, including an empty list, also excludes every MCP tool.
  The model gets no GitHub tools and cannot run `activate_skill`, which the code-review
  extension's prompt requires, so its tool calls are malformed. The CLI still exits 0, so
  the job is green. Reported upstream as
  [run-gemini-cli#532](https://github.com/google-github-actions/run-gemini-cli/issues/532)
  (root cause in gemini-cli#28361; green-on-error is run-gemini-cli#519).
- **Fix:** in `.github/workflows/gemini-review.yml`, allowlist what the review needs:
  `"tools": {"core": ["activate_skill", "mcp_github_*"]}` (PR #8).
- **Status:** _workaround_. Remove it when #532 is fixed. Verified on PR #9 (run
  42984490621): the GitHub tools and `activate_skill` were available. The review still
  failed for the next reason, above.
- **Also note:** the extension's prompt names tools that no longer exist in
  github-mcp-server v0.27.0 (`create_pending_pull_request_review`,
  `submit_pending_pull_request_review`; upstream run-gemini-cli#510). The model has to map
  them to `pull_request_review_write`, which can cost extra turns.

### Review times out after 7 minutes

- **Seen:** 2026-11-11, PR #8, run 42975886803.
- **Symptom:** the job is cancelled at 7 minutes. "Run Gemini CLI" prints nothing for the
  whole time, and nothing is uploaded, so the log gives no reason.
- **Cause (most likely):** with no `GEMINI_MODEL` variable, the CLI used its default Pro
  model, which has no free tier in the Gemini API. On a free-tier key the CLI retries quota
  errors with growing back-off and prints nothing until the job's `timeout-minutes: 7`
  (the upstream default) cancels it. The PR's diff was also large: 5,848 of its 6,246 added
  lines were `pnpm-lock.yaml`.
- **Fix:** set the repository variable `GEMINI_MODEL=gemini-3-flash-preview` (a model with a
  free tier). Raise `timeout-minutes` to 15. Tell the reviewer in `GEMINI.md` to skip
  `pnpm-lock.yaml`.
- **Status:** _fixed_ (later runs finished in under three minutes).

### A fix to the review workflow cannot be tested from its own PR

- **Seen:** 2026-11-11, PR #8.
- **Symptom:** after pushing a workflow change, `@gemini-cli /review` still behaves the old way.
- **Cause:** `issue_comment` workflows always run the workflow files from the default branch
  (`main`), not from the PR branch. A `pull_request` run uses the PR's merge commit, but
  the dispatch workflow only reacts to `opened`.
- **Fix:** merge the workflow change first, then open a new PR (or comment on one) to test it.
- **Status:** _fixed_ (how GitHub works; keep in mind).

### Long run that ends in `503 UNAVAILABLE`

- **Seen:** 2026-11-11, PR #9, run 42986490166 (`gemini-3.8-flash`).
- **Symptom:** the Gemini step runs for about 10 minutes with no output, then fails (red)
  with `fetch failed sending request`. The log shows repeated
  `Attempt N failed with status 503 … This model is currently experiencing high demand`.
- **Cause:** the model was overloaded on Google's side. Gemini CLI retries with growing
  back-off, which fills most of the 15-minute timeout. Nothing in this repository.
- **Fix:** none needed; retry later, or switch `GEMINI_MODEL` to another model. The action
  uploads the `gemini-output` artifact only when the step succeeds, so a failed run leaves
  only the Actions log (`gh run view <run-id> --log-failed`).
- **Status:** _fixed_ (transient).

### Free-tier limits

- **Seen:** 2026-11-11.
- **Symptom:** slow model calls (about 35 s each on `gemini-3.8-flash`) and a risk of running
  out of requests partway through a review.
- **Cause:** Gemini API free-tier quotas are small and change often. Confirmed on
  2026-11-11 (run 42986021710): the API answered `429` with
  `generate_content_free_tier_requests, limit: 20, model: gemini-3-flash`, that is
  20 requests a day per model. One review can take up to 25 turns (`maxSessionTurns`),
  and every test run of a workflow fix spends from the same budget. The job fails (red)
  when this happens.
- **Fix:** keep re-runs to a minimum; review once the PR is ready, not after every push.
  A run that hits the quota can be retried after midnight Pacific (08:00 UTC). Switching
  `GEMINI_MODEL` doesn't always help: on 2026-11-12 `gemini-3-flash-preview` failed
  on the `model: gemini-3-flash` quota after the day's runs on `gemini-3.8-flash`
  (run 43127182869), so the two names seem to share one quota. Usage: https://ai.dev/rate-limit.
- **Status:** _open_. See the parking lot for alternatives.

### How to see what Gemini is doing

Gemini CLI writes its output to temporary files and uploads them only when the step
finishes. A cancelled run leaves nothing to read. To diagnose:

1. Set the repository variable `UPLOAD_ARTIFACTS=true` (already set). Each run that gets
   through the Gemini step then has a `gemini-output` artifact with `stdout.log`, `stderr.log` and `telemetry.log`:
   `gh run download <run-id>`.
2. For one run only, set `GEMINI_DEBUG=true` to stream the output into the Actions log.
   The repository is public and debug output can include model responses, so delete the
   variable afterwards: `gh variable delete GEMINI_DEBUG`.
3. A green run is not proof of a review. Check the `error` field in `stdout.log`.

## Workspace and tooling

### Dependabot security PR fails install (pnpm minimumReleaseAge)

- **Seen:** 2026-11-11, Dependabot PR #11 (issue #24).
- **Symptom:** a Dependabot security PR's CI fails at `pnpm install` with
  `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`.
- **Cause:** pnpm refuses packages published less than a day ago (`minimumReleaseAge`).
  Dependabot's `cooldown` in `.github/dependabot.yml` delays version updates by a day, but
  security updates ignore the cooldown, so a security PR can point at a release that is
  only hours old.
- **Fix:** wait a day and re-run the PR's checks, or upgrade by hand to the newest version
  that is more than a day old (`npm view <pkg> time` shows publish times), as #24 did.
- **Status:** _workaround_. Both behaviours are by design, so this can happen again.

### Astro 6 needs Node 22; the local machine had Node 21

- **Seen:** 2026-11-11, issue #2.
- **Symptom:** local `node -v` printed v21.7.3, and pnpm was not installed.
- **Cause:** Astro 6.4.8 requires Node `>=22.12.0`.
- **Fix:** `nvm install 22 && corepack enable`. Corepack provides the pnpm version pinned in
  `packageManager`. `.nvmrc` says `22` and the root `engines.node` says `>=22.12.0`. The nvm
  default stays on 21, so run `nvm use` in this repository.
- **Status:** _fixed_.

### pnpm 12 refuses to install: `ERR_PNPM_IGNORED_BUILDS`

- **Seen:** 2026-11-11, issue #2.
- **Symptom:** `pnpm install` fails with "Ignored build scripts: esbuild, sharp".
- **Cause:** pnpm 12 blocks dependency install scripts unless they are approved.
- **Fix:** `pnpm approve-builds esbuild sharp`, which writes `allowBuilds` to
  `pnpm-workspace.yaml`. Approve only packages you recognise.
- **Status:** _fixed_.

### TypeScript pinned to 6.x, not 7

- **Seen:** 2026-11-11, issue #2.
- **Symptom:** TypeScript 7.0.2 is the latest release, but the tooling does not accept it.
- **Cause:** typescript-eslint 8.72.2 supports `typescript <6.1.0` and @astrojs/check 0.9.12
  supports `^5 || ^6`.
- **Fix:** pin `typescript` to 6.0.3.
- **Status:** _workaround_. Revisit when both packages support TypeScript 7.

### Prettier would rewrite the Markdown docs

- **Seen:** 2026-11-11, issue #2.
- **Symptom:** `prettier --check .` failed on 8 existing files, mostly Markdown, where it
  pads compact tables into wide aligned columns.
- **Fix:** Prettier covers code and config only: `**/*.md` and `.claude` are in
  `.prettierignore`.
- **Status:** _fixed_ (a deliberate choice).

### Astro CLI telemetry

- **Seen:** 2026-11-11, issue #2.
- **Symptom:** `astro check` and `astro build` print "Astro collects anonymous usage data".
- **Fix:** the site scripts run with `ASTRO_TELEMETRY_DISABLED=1`. This is in line with
  ADR-0004, although that ADR is about visitors, not tooling.
- **Status:** _fixed_.

### Astro's `npm` font provider loads the wrong font files

- **Seen:** 2026-11-11, issue #3.
- **Symptom:** with `fontProviders.npm({ remote: false })` and `subsets: ['latin']`, the build
  emitted Latin Extended and Cyrillic files too, preloaded all of them, and had no bold or
  italic faces.
- **Cause:** in astro 6.4.8 the `npm` provider only parses the package's `index.css`
  (all subsets, weight 400) and doesn't apply `subsets`.
- **Fix:** use `fontProviders.local()` with the exact Latin `.woff2` files from the
  `@fontsource/*` packages (`apps/site/astro.config.mjs`). See `docs/design/tokens.md`.
- **Status:** _workaround_. Rechecked with astro 7.4.10 (#24): the `npm` provider still
  ignores `subsets`; the build fails fetching `pixelify-sans-cyrillic-400-normal.woff2`.
