# ADR-0003: Launch on GitHub Pages, then move to AWS with Terraform

- Status: Accepted
- Date: 2026-11-10
- Decider: Medhini

## Context

The site should launch within two weeks at 8–10 hours a week, cost under €10 a month,
and eventually run on infrastructure as code. Setting up AWS and Terraform before
launch would take most of the second week.

## Decision

- **Phase 1:** deploy to GitHub Pages with GitHub Actions, on medhinioak.dev.
- **Phase 2:** move to a private S3 bucket behind CloudFront (Origin Access Control),
  with an ACM certificate (us-east-1), Route 53 DNS and a CloudFront Function for
  clean URLs, all managed by Terraform. State lives in a versioned S3 bucket with
  native locking (`use_lockfile = true`). GitHub Actions deploys through OIDC, with
  no stored AWS keys. An AWS budget alerts at €5 and €8.

## Alternatives considered

- **AWS from day one** — delays launch by about a week.
- **Stay on GitHub Pages** — cheapest, but does not show the cloud and IaC work the
  site is meant to demonstrate, and cannot set security headers.
- **Cloudflare Pages** — similar to GitHub Pages, adds another provider.
- **OpenTofu** — nearly identical; Terraform is more common in job ads.

## Consequences

- Launch is not blocked by infrastructure work.
- Expected cost after the move: about $2 a month, mostly domain and hosted zone.
- The DNS switch needs a planned cut-over, with GitHub Pages kept as a fallback for a week.
- The migration becomes a blog post.
- If Terraform is not working by Dec 3, the site stays on GitHub Pages until January.
