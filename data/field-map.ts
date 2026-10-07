/**
 * Maps the free-text `field` of the external directories (data/courses.ts,
 * data/certifications.ts) onto the canonical taxonomy in data/roadmaps.ts.
 *
 * Those directories are curated third-party listings and keep their own short
 * labels ("AI", "Cloud"); nothing is displayed from them directly any more.
 * Filter chips, cards and links resolve a field to a roadmap id here and then
 * render `trackTitle(id)`, so renaming a roadmap renames it site-wide.
 *
 * A field with no matching roadmap maps to `null` and gets a localized label in
 * `UNMAPPED_FIELD_LABELS` (these are not roadmap titles). A unit test
 * (tests/unit/canonical.test.ts) fails when a directory uses a field that is
 * missing here, or when a mapping points at an unknown roadmap.
 */
import type { L10n } from "./lessons/types";

export const FIELD_TO_TRACK: Readonly<Record<string, string | null>> = {
  Frontend: "frontend",
  Backend: "backend",
  "Cyber Security": "cyber-security",
  AI: "artificial-intelligence",
  "Artificial Intelligence": "artificial-intelligence",
  "Data Science": "data-science",
  Cloud: "cloud-computing",
  DevOps: "devops",
  "UI/UX": "ui-ux",
  IT: null,
  "Project Management": null,
};

export const UNMAPPED_FIELD_LABELS: Readonly<Record<string, L10n>> = {
  IT: { en: "IT Support", ar: "الدعم التقني" },
  "Project Management": { en: "Project Management", ar: "إدارة المشاريع" },
};

/** Filter-chip key of a directory field: a roadmap id, or `other:<field>` when it has no roadmap. */
export function fieldKey(field: string): string {
  const track = FIELD_TO_TRACK[field];
  return track ?? `other:${field}`;
}

/** Roadmap id a directory field belongs to, or null for fields without a roadmap. */
export function fieldTrack(field: string): string | null {
  return FIELD_TO_TRACK[field] ?? null;
}
