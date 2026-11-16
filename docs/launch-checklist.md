# Launch checklist

Every item must be ticked before launch unless marked **(should)**; those may wait
for Phase 4. Run the checks against medhinioak.dev, not only locally.

## Performance

- [ ] Lighthouse, mobile profile: at least 95 in all four categories on Home and on a blog post
- [x] Core Web Vitals in the "good" range: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms
- [ ] Budget: Home under 300 KB transferred including fonts; a post under 250 KB before images
- [x] Images responsive, with width and height; only the top image loads eagerly
- [x] Fonts self-hosted, Latin subset, one weight of each font preloaded, `font-display: swap`
- [x] Game JavaScript loads only on `/play`
- [ ] Long cache for hashed assets, short cache for HTML

## Accessibility (WCAG 2.2 AA)

- [x] axe and Lighthouse report no serious or critical issues on any page
- [x] Keyboard-only use works; focus is visible in both themes; skip link present
- [x] One `h1` per page, ordered headings, landmarks, `lang="en"`
- [x] Meaningful alt text, or empty alt for decorative images
- [x] Contrast passes in both themes
- [x] Touch targets at least 24 × 24 px; reflow at 320 px and 200 % zoom
- [x] Theme toggle announces its state; `prefers-reduced-motion` honoured
- [ ] One manual screen-reader pass (VoiceOver or NVDA) on Home and a post

## SEO

- [x] Unique title (under ~60 characters) and description on every page
- [x] Canonical URLs; `www` redirects to the apex domain
- [x] `sitemap.xml` and `robots.txt`; no stray `noindex`
- [ ] Open Graph images; LinkedIn link preview tested
- [x] 404 page returns status 404
- [x] RSS at `/rss.xml`, linked in the head
- [ ] Structured data for Person and Article (should)
- [ ] Search Console and Bing Webmaster Tools (should)

## Legal and privacy

- [x] Impressum reachable from every page in one click
- [x] Repository secret `IMPRESSUM_PHONE` set, so the Impressum shows the phone number (never committed; see `runbook.md` → One-time setup)
- [x] Privacy policy reachable from every page in one click; states the host and its logs, legal basis, retention, visitor rights, no cookies, no third parties
- [x] Privacy policy mentions the stored theme preference, if stored
- [x] Network tab on every page type: all requests go to medhinioak.dev only
- [x] No analytics, tracking pixels or embeds
- [ ] All photos and quoted material are mine or licensed and credited
- [ ] Permission to publish each case study (university, teammates)
- [x] EXIF data, including GPS, stripped from every photo
- [ ] Legal pages read once by a second person (should)

## Security

- [x] HTTPS everywhere (automatic for .dev); HSTS header on CloudFront in Phase 2
- [ ] Security headers on CloudFront (should on GitHub Pages, where they cannot be set)
- [ ] Two-factor authentication on GitHub, registrar, email and later AWS root
- [x] `main` protected by a ruleset; Dependabot and secret scanning on
- [x] No secrets in the git history
- [ ] Registrar: auto-renew and transfer lock on
- [ ] SPF, DKIM and DMARC if mail is sent from the domain (should)

## Backups

- [ ] Repository mirrored to a second host
- [ ] Original photos stored outside the repository
- [ ] Recovery codes in a password manager
- [ ] Restore tested once: clone, build, open locally
- [ ] Calendar reminders: domain renewal, quarterly cost check, annual legal-page review

## Launch day

- [ ] Tested on a real phone and a second browser
- [ ] Link checker passes; the footer email address receives mail
- [x] No `PLACEHOLDER`, `TODO`, `lorem` or `example.com` on any page
- [x] Drafts unpublished; dates and time zones correct
- [ ] CV, LinkedIn and GitHub profile link to the site
- [x] Rollback written down: revert and redeploy

## Launch run, 2026-11-16 (#35)

Checked against https://medhinioak.dev at commit `b202154`. Ticked items were verified
by Claude Code; unticked items are open or owner-only.

- **Lighthouse (mobile, 3 runs each):** 100 in all four categories on `/`, `/about/`,
  `/blog/` and `/projects/portfolio-site/`. Lab LCP 0.75–1.5 s, CLS 0, TBT ≤ 45 ms;
  no field data yet. Home transfers 209 KB. No post is live yet (post 1 is a draft), so
  the post rows wait for it.
- **Playwright against the live site (42 tests):** axe in both themes on every page
  (no serious or critical issues), smoke, SEO, drawer, and a network check (every page
  requests `medhinioak.dev` only). At 320 px and at 640 px (1280 px at 200 %) no page
  scrolls sideways. Each page has one `h1`, `lang="en"`, landmarks and a skip link.
  With reduced motion, the animated GIFs are replaced by stills.
- **Domain:** `http://` and `https://www.` both answer 301 to `https://medhinioak.dev/`;
  Pages shows the custom domain with HTTPS enforced. `.dev` is on the HSTS preload list.
- **Link check** (every `href`/`src` in the build): all answer 200 except LinkedIn
  (999, its bot block; check by hand). `mailto:` links not checked.
- **Cache:** GitHub Pages sends `max-age=600` for every file and cannot be configured.
- **Security:** ruleset `protect-main` active; Dependabot updates, secret scanning and
  push protection on; no secret-scanning alerts and no key patterns in the history.
- **Restore:** a fresh clone installs and builds all 9 pages; not yet opened locally.
