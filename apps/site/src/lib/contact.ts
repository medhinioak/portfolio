/** Contact details and links shared by Home, About, the footer (#29) and the legal pages (#33). */

/** The name in the Impressum and privacy policy (issue #33). */
export const legalName = 'Medhini Prakash Oak';

/** The address shown on Home, in the footer and on the legal pages. */
export const email = 'medhinioak@gmail.com';

/** The subject a visitor's mail app fills in for "Email me". */
export const mailSubject = 'Hello from medhinioak.dev';

/** The CV, hosted outside this repository. */
export const cvUrl =
  'https://drive.google.com/file/d/1sT2pfrSy8Ox0qNn72XHWaBPMrmt7NUlr/view?usp=drivesdk';

/** Channel links in the Contact section; the label names the destination. */
export const channels = {
  github: { label: 'GitHub', href: 'https://github.com/medhinioak' },
  linkedin: {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/medhini-oak/',
  },
  youtube: { label: 'YouTube', href: 'https://www.youtube.com/@medhinioak' },
  twitch: { label: 'Twitch', href: 'https://www.twitch.tv/oakiepoodle' },
} as const;

/** A `tel:` link for a phone number written with spaces, such as "+49 123 456". */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`;
}

/** A `mailto:` link to `address`; the subject is URL-encoded, and left out when empty. */
export function mailtoHref(address: string, subject = ''): string {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${address}${query}`;
}
