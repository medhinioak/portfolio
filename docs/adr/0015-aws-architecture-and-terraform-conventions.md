# ADR-0015: Host the site on S3 and CloudFront in eu-north-1, with two Terraform stacks

- Status: Proposed
- Date: 2026-11-25
- Decider: Medhini
- Review: PLACEHOLDER: reviewers and date, filled in after the Gemini app review

## Context

[ADR-0003](0003-github-pages-first-then-aws.md) chose the direction for Phase 3: a private
S3 bucket behind CloudFront with Origin Access Control, an ACM certificate in us-east-1,
Route 53, a CloudFront Function for clean URLs, Terraform state in S3 with native locking,
GitHub OIDC, and budget alerts at €5 and €8. This ADR settles the details, so that issues
#101–#120 can follow one plan. Facts on 2026-11-25:

- **Domain:** registered at sav.com. DNS is hosted at Cloudflare (`augustus` and `laura`
  `.ns.cloudflare.com`). No DS record (DNSSEC is off), no MX records, no AAAA records.
  Today's records: four apex A records for GitHub Pages, `www` CNAME to
  `medhinioak.github.io`, and one `_github-pages-challenge-medhinioak` TXT record.
- **AWS account:** new, on the free account plan with $100 in credits, default region
  eu-north-1. The free plan ends after six months or when the credits run out. The account
  is then closed unless it is upgraded. A manual upgrade keeps the remaining credits; joining
  AWS Organizations upgrades the account too, but the credits expire
  ([Free Tier FAQ](https://aws.amazon.com/free/free-tier-faqs/)).
- **GitHub OIDC:** this repository already uses immutable subject claims. Its `sub` starts
  `repo:medhinioak@36889960/portfolio@1452995604` (`gh api repos/medhinioak/portfolio/actions/oidc/customization/sub`).
  Trust policies written from older, name-only examples would not match
  ([GitHub changelog](https://github.blog/changelog/2026-04-23-immutable-subject-claims-for-github-actions-oidc-tokens/),
  [OIDC reference](https://docs.github.com/en/actions/reference/security/oidc)).
- **Versions:** Terraform 1.17.2 and the AWS provider 6.74.0 are current. `use_lockfile` needs
  Terraform 1.10 or newer; DynamoDB locking is deprecated
  ([S3 backend](https://developer.hashicorp.com/terraform/language/backend/s3)).
- **Site:** static Astro output with `trailingSlash: 'always'`, hashed assets under
  `/_astro/`, a `404.html`, and inline scripts (theme, island hydration).

## Decision

Two Terraform stacks: `infra/bootstrap` (applied once, never destroyed) and `infra/site`
(can be destroyed and recreated). Each numbered point below matches the same point in issue #100.

1. **Region.** S3 buckets and the default provider in **eu-north-1** (Stockholm), the
   account's default, in the EU. ACM certificate in us-east-1 through a provider alias
   (CloudFront requires it). CloudFront `PriceClass_100` (North America, Europe, Israel,
   Türkiye). No IAM Identity Center, so no home region to choose (see 8).
2. **Origin.** One private bucket, all public access blocked, ACLs disabled (bucket owner
   enforced), SSE-S3 encryption. Only CloudFront reads it, through OAC (SigV4, always sign).
   The bucket policy allows `s3:GetObject` only for this distribution (`AWS:SourceArn`). No S3
   website endpoint. No versioning: rollback is a git revert and a redeploy (`docs/runbook.md`).
3. **URLs.** One viewer-request CloudFront Function (`cloudfront-js-2.0`), in this order:
   - Host `www.medhinioak.dev` gets a 301 to the same path and query on the apex.
   - A path that ends in `/` gets `index.html` appended.
   - A path with no file extension and no trailing slash gets a 301 to `path/`, as GitHub
     Pages does today.
   - Custom error responses: S3 answers 403 for a missing key through OAC, so both 403 and 404
     serve `/404.html` with status 404, cached for 60 seconds.
   - `.dev` is on the browsers' HSTS preload list, so browsers never make a plain HTTP request
     to the domain. Every redirect is therefore one hop. Non-browser HTTP clients get the
     HTTPS redirect first, then the `www` redirect.
4. **TLS and headers.** One ACM public certificate for the apex and `www`, DNS-validated.
   - Security policy `TLSv1.2_2025` (TLS 1.2 minimum, current ciphers), SNI only.
     HTTP/2 and HTTP/3 on. Viewer protocol policy: redirect HTTP to HTTPS.
   - One response headers policy sends `Strict-Transport-Security: max-age=31536000;
     includeSubDomains`. No `preload` directive: the TLD is already preloaded.
   - The same policy sends `X-Content-Type-Options: nosniff`,
     `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and a
     `Permissions-Policy` that turns off camera, microphone, geolocation and similar
     features (custom header).
   - **No Content-Security-Policy in this phase.** The site's inline scripts rule out a
     header CSP without `unsafe-inline`. Astro's `security.csp` (stable since Astro 6) puts a
     hash-based policy in a `<meta>` tag instead. That is a site change with its own checks,
     so it goes to `docs/parking-lot.md`.
5. **Caching.** Both cache behaviours use the managed `CachingOptimized` cache policy:
   compression is on (Brotli and gzip), and the edge keeps files for up to one day. Browser
   caching is set by the response headers policies, which override any origin value. S3
   object metadata is not used.
   - `/_astro/*` sends `Cache-Control: public, max-age=31536000, immutable`.
   - The default behaviour sends `Cache-Control: public, max-age=0, must-revalidate`.
   - Every deploy invalidates `/*`. That counts as one path, and the first 1,000 paths a month
     are free.
   - A response headers policy changes only what the browser receives, not the edge TTL
     ([docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/understanding-response-headers-policies.html)).
     That is why the invalidation is needed.
   - Each behaviour has its own response headers policy, and both carry the security headers
     from point 4. They differ only in `Cache-Control`.
6. **DNS ownership.** The Route 53 hosted zone lives in `infra/bootstrap` with
   `prevent_destroy`, so its name servers never change.
   - **The zone's records.** Bootstrap also owns every record in the zone: the
     GitHub Pages TXT record and the free anti-spoofing records (a null MX `0 .`,
     SPF `v=spf1 -all`, DMARC `v=DMARC1; p=reject`). It also owns the apex and `www`, and the
     variable `site_origin` (`github-pages` or `cloudfront`) chooses where they point:
     - `github-pages`: the four A records and the `www` CNAME as today, with a 300-second TTL.
     - `cloudfront`: apex A and AAAA aliases to the distribution, and the `www` CNAME to the
       distribution's domain. Bootstrap reads that domain from the site stack's state.
   - **The site stack's records.** `infra/site` owns only the certificate's validation
     records. It looks the zone up by name.
   - **Cut-over** (#114): a PR changes the default to `cloudfront` and the owner applies
     bootstrap. No record moves between stacks, and no two stacks manage the same record.
   - **Rollback in one command:**
     `terraform -chdir=infra/bootstrap apply -var site_origin=github-pages`. A follow-up PR
     then sets that as the default. Resolvers drop the 60-second alias answers within about a
     minute.
   - **Destroy drill** (#113, before the cut-over): destroy and recreate `infra/site` while
     the records still point at GitHub Pages. Visitors notice nothing.
   - **After the cut-over:** roll back first, then destroy.
   - **DNSSEC stays off.** There is no DS record today, so changing the name servers at
     sav.com is safe. The Cloudflare zone is deleted only after the new name servers have
     been seen for 48 hours.
7. **State.** One state bucket in eu-north-1, set up like the site bucket in point 2, plus
   versioning (noncurrent versions expire after 90 days) and a policy that denies non-TLS
   requests.
   - `use_lockfile = true`, keys `bootstrap/terraform.tfstate` and `site/terraform.tfstate`.
   - `required_version = "~> 1.17"`, AWS provider `~> 6.74`, `.terraform.lock.hcl` committed.
   - The first bootstrap apply uses local state, then `terraform init -migrate-state`.
   - `prevent_destroy` on the state bucket and the zone. `force_destroy` on the site bucket,
     whose content is rebuilt from the repository.
8. **Authentication.** No IAM Identity Center: it needs AWS Organizations, and enabling
   Organizations would make the credits expire.
   - The root user gets MFA and is not used day to day.
   - The owner gets one IAM user with console sign-in, MFA, `AdministratorAccess` and
     `SignInLocalDevelopmentAccess`, and **no access keys**. The CLI and Terraform use
     `aws login` (AWS CLI 2.32 or newer), with short-lived credentials that rotate every
     15 minutes ([AWS docs](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sign-in.html)).
     The S3 backend can read those credentials natively from Terraform 1.15 and
     provider 6.23. #101 confirms this works.
   - CI uses GitHub OIDC, audience `sts.amazonaws.com`, `sub` matched with `StringEquals`
     on the immutable form. The plan role trusts
     `repo:medhinioak@36889960/portfolio@1452995604:pull_request`; it gets `ReadOnlyAccess`
     plus read access to the state bucket, and runs `plan -lock=false`, so it never writes.
   - The deploy role trusts `...:ref:refs/heads/main` on a job without a GitHub environment.
     It may only `s3:ListBucket`, `PutObject` and `DeleteObject` on the site bucket,
     `cloudfront:CreateInvalidation` on the distribution, and `cloudfront:ListDistributions`.
   - Before writing each trust policy, check the real claim with a debug step: GitHub
     documents no immutable example for every event type.
   - Pull requests from forks get no OIDC token.
9. **Apply model.** The owner applies locally from the PR branch after reading the plan, then
   merges. If an apply fails, the fix goes on the same branch. CI only plans
   (`infra-plan.yml`) and deploys content. There is no automatic `terraform apply`.
10. **Deploy.** `aws s3 sync apps/site/dist s3://<bucket> --delete`, then
    `aws cloudfront create-invalidation --paths '/*'`. The distribution ID is looked up at
    deploy time by its alias `medhinioak.dev`, because it changes when the stack is
    recreated.
    - The role ARNs contain the account ID, so they are repository **secrets** and stay
      masked in the public logs. Region and bucket name are **variables**.
    - The bucket names are `medhinioak-dev-site` and `medhinioak-dev-tfstate`, in S3's global
      namespace. Both were free on 2026-11-25.
11. **Logging.** No CloudFront standard or real-time logs, no S3 server access logs, no log
    bucket. CloudFront still processes each request (IP address, user agent, URL) to serve it.
    The files are stored in Stockholm, and edges in North America and Europe serve them.
    #115 writes this into the privacy policy.
12. **Cost.** CloudFront stays on pay-as-you-go.
    - Its always-free tier covers 1 TB, 10 million requests and 2 million function invocations
      a month
      ([pricing](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/)).
    - The expected bill is the $0.50 hosted zone plus a few cents of S3. The domain is billed
      by sav.com.
    - **One** cost budget, monthly, with credits **excluded** (otherwise the credits hide all
      spend). Alerts on actual spend at **$5 and $8** and on forecast spend over $8, by email.
    - The amounts are in USD, because the rate couldn't be checked on 2026-11-25. At any rate
      above 1.00 USD per euro they are below €5 and €8, so alerts come early, not late.
    - Budgets without actions are free.
    - The alert email comes from `TF_VAR_alert_email` (a repository secret in CI) and is never
      committed.
    - The account moves to the Paid plan by hand before the cut-over (#114), not by joining
      an Organization.
13. **Tags and names.** Provider `default_tags`: `Project=portfolio`, `ManagedBy=terraform`
    and `Stack=bootstrap` or `Stack=site`. No account IDs in names or in the repository; code
    uses `data "aws_caller_identity"`.
14. **Not done on purpose:** WAF, multi-region, access logs, Lambda@Edge, a staging
    environment, customer-managed KMS keys, Route 53 health checks, DNSSEC, Organizations and
    Identity Center, a header CSP.

## Alternatives considered

- **S3 website endpoint.** It needs a public bucket and serves HTTP only from S3 to CloudFront.
- **AWS Amplify Hosting.** It does the same job with less code, but it hides the pieces this
  phase is meant to show, and it duplicates the build pipeline.
- **Cloudflare (already the DNS host).** Moving the site to Cloudflare Pages was rejected in
  ADR-0003; keeping DNS there would split the setup across two providers and two tools.
- **OpenTofu.** Rejected in ADR-0003: Terraform is more common in job ads.
- **HCP Terraform for state.** It adds an account and a free tier outside AWS; an S3 bucket
  keeps everything in one place and is part of what the phase shows.
- **DynamoDB state locking.** Deprecated since S3 native locking arrived.
- **Lambda@Edge for URLs.** It has no free tier, has to be deployed in us-east-1 and runs
  slower; a CloudFront Function does this job.
- **IAM Identity Center (the issue's proposal).** It needs Organizations, which ends the
  credits. Revisit when the credits are used up or more accounts are needed.
- **The site stack owns the apex and `www` aliases with `allow_overwrite` (the issue's
  proposal).** Two stacks would manage the same records, the next bootstrap apply would undo
  the cut-over, and rollback would delete records before recreating them.
- **CloudFront flat-rate Free plan.** Free Tier accounts can't use it. It requires a WAF web
  ACL that can't be detached. It allows only managed cache and response header policies,
  which rules out points 4 and 5. Pay-as-you-go already costs nothing at this traffic
  ([docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html)).
- **Bucket names in the account regional namespace.** They protect the names from being
  taken, but each name includes the account ID, which would then appear in public CI logs.
- **Two budgets.** One budget with several thresholds gives the same alerts.

## Consequences

- The whole site stack can be destroyed and recreated without touching DNS, and DNS can be
  rolled back to GitHub Pages in one command.
- The site gets HSTS, security headers and proper caching, closing the open Security and
  Performance items in `docs/launch-checklist.md` except the CSP.
- Nothing stores AWS keys: the owner uses `aws login`, CI uses OIDC.
- Bootstrap reads the site stack's state when `site_origin = "cloudfront"`, so after the
  cut-over the site stack must exist before bootstrap can be planned.
- A plan in CI can run during an apply because it doesn't take the lock; it may then show a
  stale diff. Re-run it.
- `s3 sync --delete` can remove old `/_astro/` files while a browser still holds an old
  page. The window is short, because HTML is revalidated on every visit.
- The free account plan is a deadline: the upgrade to the Paid plan must happen before the
  cut-over.
- Revisit if traffic outgrows the free tier, if more AWS accounts are needed (Organizations
  and Identity Center), or if the domain starts sending mail (the anti-spoofing records have
  to change).
