/** Contact details and links shared by the Home page, About page and footer (issue #29). */

/** The name in the Impressum and privacy policy (issue #33). */
export const legalName = 'PLACEHOLDER: full name for the Impressum';

/** The address shown on Home, in the footer and on the legal pages. */
export const email = 'PLACEHOLDER: email address';

/** The subject a visitor's mail app fills in for "Email me". */
export const mailSubject = 'PLACEHOLDER: mailto subject';

/** The CV, hosted outside this repository. */
export const cvUrl = 'PLACEHOLDER: CV URL';

/** Channel links in the Contact section; the label names the destination. */
export const channels = {
  github: { label: 'GitHub', href: 'PLACEHOLDER: GitHub URL' },
  linkedin: { label: 'LinkedIn', href: 'PLACEHOLDER: LinkedIn URL' },
  youtube: { label: 'YouTube', href: 'PLACEHOLDER: YouTube URL' },
  twitch: { label: 'Twitch', href: 'PLACEHOLDER: Twitch URL' },
} as const;

/** A `mailto:` link to `address`; the subject is URL-encoded, and left out when empty. */
export function mailtoHref(address: string, subject = ''): string {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${address}${query}`;
}
