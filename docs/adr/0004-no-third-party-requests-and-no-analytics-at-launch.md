# ADR-0004: No third-party requests and no analytics at launch

- Status: Accepted
- Date: 2026-11-10
- Decider: Medhini

## Context

The site is operated from Germany. Loading resources from third parties (fonts, video
embeds, CDNs, analytics) can transfer visitors' IP addresses and may require consent
under the GDPR and § 25 TDDDG. A German court (LG München I, 3 O 17493/20, 2022)
awarded damages for loading Google Fonts from Google's servers. Analytics numbers
would add little at launch traffic.

## Decision

- All requests go to the site's own domain. Fonts (Pixelify Sans, Atkinson
  Hyperlegible) are self-hosted from Fontsource packages.
- No embeds. YouTube, Twitch and similar are plain links.
- No analytics and no cookies at launch, therefore no consent banner.
- The theme preference is stored only after the visitor uses the toggle.
- Revisit analytics in Phase 4, and update the privacy policy before adding anything.

## Alternatives considered

- **Cookieless analytics now** (GoatCounter, Umami, Plausible) — low risk, but the
  supervisory authorities and the EDPB disagree on whether script-based measurement
  needs consent, and the numbers are not needed yet.
- **Consent banner with Google Analytics** — adds friction and clutter for no benefit.

## Consequences

- A short privacy policy and no banner.
- No visitor statistics; Search Console and link-preview clicks give a rough picture.
- A CI or launch check confirms that every request stays on the site's domain.
