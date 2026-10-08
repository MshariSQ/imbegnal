/** Link helpers local to Code Lab (the shared URL contract lives in shared/links.ts). */

/** Sign-in page that returns to `next` (a same-origin path with query) afterwards. */
export function loginHref(next: string): string {
  return `/login/?next=${encodeURIComponent(next)}`;
}
