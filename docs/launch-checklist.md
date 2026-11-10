# Launch checklist

Every item must be ticked before launch unless marked **(should)**; those may wait
for Phase 4. Run the checks against medhinioak.dev, not only locally.

## Performance

- [ ] Lighthouse, mobile profile: at least 95 in all four categories on Home and on a blog post
- [ ] Core Web Vitals in the "good" range: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms
- [ ] Budget: Home under 300 KB transferred including fonts; a post under 250 KB before images
- [ ] Images responsive, with width and height; only the top image loads eagerly
- [ ] Fonts self-hosted, Latin subset, one weight preloaded, `font-display: swap`
- [ ] Game JavaScript loads only on `/play`
- [ ] Long cache for hashed assets, short cache for HTML

## Accessibility (WCAG 2.2 AA)

- [ ] axe and Lighthouse report no serious or critical issues on any page
- [ ] Keyboard-only use works; focus is visible in both themes; skip link present
- [ ] One `h1` per page, ordered headings, landmarks, `lang="en"`
- [ ] Meaningful alt text, or empty alt for decorative images
- [ ] Contrast passes in both themes
- [ ] Touch targets at least 24 × 24 px; reflow at 320 px and 200 % zoom
- [ ] Theme toggle announces its state; `prefers-reduced-motion` honoured
- [ ] One manual screen-reader pass (VoiceOver or NVDA) on Home and a post

## SEO

- [ ] Unique title (under ~60 characters) and description on every page
- [ ] Canonical URLs; `www` redirects to the apex domain
- [ ] `sitemap.xml` and `robots.txt`; no stray `noindex`
- [ ] Open Graph images; LinkedIn link preview tested
- [ ] 404 page returns status 404
- [ ] RSS at `/rss.xml`, linked in the head
- [ ] Structured data for Person and Article (should)
- [ ] Search Console and Bing Webmaster Tools (should)

## Legal and privacy

- [ ] Impressum reachable from every page in one click
- [ ] Privacy policy reachable from every page in one click; states the host and its logs, legal basis, retention, visitor rights, no cookies, no third parties
- [ ] Privacy policy mentions the stored theme preference, if stored
- [ ] Network tab on every page type: all requests go to medhinioak.dev only
- [ ] No analytics, tracking pixels or embeds
- [ ] All photos and quoted material are mine or licensed and credited
- [ ] Permission to publish each case study (university, teammates)
- [ ] EXIF data, including GPS, stripped from every photo
- [ ] Legal pages read once by a second person (should)

## Security

- [ ] HTTPS everywhere (automatic for .dev); HSTS header on CloudFront in Phase 2
- [ ] Security headers on CloudFront (should on GitHub Pages, where they cannot be set)
- [ ] Two-factor authentication on GitHub, registrar, email and later AWS root
- [ ] `main` protected by a ruleset; Dependabot and secret scanning on
- [ ] No secrets in the git history
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
- [ ] No `PLACEHOLDER`, `TODO`, `lorem` or `example.com` on any page
- [ ] Drafts unpublished; dates and time zones correct
- [ ] CV, LinkedIn and GitHub profile link to the site
- [ ] Rollback written down: revert and redeploy
