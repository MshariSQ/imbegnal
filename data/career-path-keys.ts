/**
 * The text-free part of the career path model: ids, levels and categories. It is kept apart from
 * data/career-paths.ts (about 50 KB of bilingual text) so client code that needs only these (the
 * navbar, the filters, the role page that gets its path as props) does not load every path's text.
 * tests/unit/career-paths.test.ts keeps CAREER_PATH_IDS equal to the ids in data/career-paths.ts.
 */

export const CAREER_PATH_IDS = [
  "soc-analyst",
  "penetration-tester",
  "full-stack-developer",
  "frontend-developer",
  "data-analyst",
  "data-scientist",
  "ai-engineer",
  "cloud-engineer",
  "devops-engineer",
  "ux-designer",
  "software-engineer",
] as const;

export const PATH_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type PathLevel = (typeof PATH_LEVELS)[number];

export const PATH_CATEGORIES = ["security", "software", "data-ai", "cloud-devops", "design"] as const;
export type PathCategory = (typeof PATH_CATEGORIES)[number];

/**
 * /roadmaps/<id>/ is a role page when <id> is a career path id and a course map otherwise (the
 * track ids, the URLs roadmaps had before career paths). The navbar files a course map under Courses.
 */
export function isCourseMapPath(pathname: string): boolean {
  const m = /^\/roadmaps\/([^/?#]+)/.exec(pathname);
  return !!m && !(CAREER_PATH_IDS as readonly string[]).includes(m[1]);
}
