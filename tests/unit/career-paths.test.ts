/**
 * Career path data (data/career-paths.ts) and its resolver (lib/career-paths.ts): every referenced
 * course exists or is a planned course, ids are unique and never collide with the course maps at
 * /roadmaps/<track-id>/, every learner-facing string is bilingual, hours and lesson counts are
 * computed from the lessons (never stored), and planned courses are never linkable.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CAREER_PATH_IDS, isCourseMapPath } from "../../data/career-path-keys";
import { PATH_CATEGORIES, PATH_LEVELS, careerPaths, plannedCourses, type CareerPath } from "../../data/career-paths";
import { roadmaps } from "../../data/roadmaps";
import { loadLesson } from "../../data/lessons";
import { courses } from "../../lib/catalog";
import {
  coursePathLinks,
  hoursFromMinutes,
  nextCourse,
  pathProgress,
  pathsWithCourse,
  resolvePath,
  resolvePaths,
  trackLevels,
  type CourseFigures,
} from "../../lib/career-paths";
import { pathsEn, pathsAr } from "../../lib/i18n-paths";

const trackIds = new Set(roadmaps.map((r) => r.id));
const plannedIds = new Set(plannedCourses.map((c) => c.id));
const ARABIC = /[؀-ۿ]/;

/** The design the owner approved: path id -> courses in order. */
const APPROVED: Record<string, string[]> = {
  "soc-analyst": ["networking", "operating-systems", "cyber-security", "incident-response"],
  "penetration-tester": ["networking", "operating-systems", "cyber-security", "reverse-engineering", "web-app-pentesting"],
  "full-stack-developer": ["frontend", "backend", "databases", "devops"],
  "frontend-developer": ["ui-ux", "frontend", "advanced-react"],
  "data-analyst": ["databases", "data-science", "bi-dashboards"],
  "data-scientist": ["data-structures-algorithms", "databases", "data-science", "artificial-intelligence"],
  "ai-engineer": ["data-structures-algorithms", "data-science", "artificial-intelligence", "mlops"],
  "cloud-engineer": ["operating-systems", "networking", "cloud-computing", "devops"],
  "devops-engineer": ["operating-systems", "networking", "devops", "cloud-computing"],
  "ux-designer": ["ui-ux", "frontend"],
  "software-engineer": ["data-structures-algorithms", "operating-systems", "backend", "databases"],
};

/** Real figures: the catalog's lesson ids and the lessons' own minutes. */
async function realFigures(): Promise<Record<string, CourseFigures>> {
  const out: Record<string, CourseFigures> = {};
  for (const c of courses) {
    let minutes = 0;
    const lessonIds: string[] = [];
    for (const ref of c.lessons) {
      const lesson = await loadLesson(c.id, ref.lessonId);
      if (!lesson) continue;
      lessonIds.push(ref.lessonId);
      minutes += lesson.estMinutes;
    }
    out[c.id] = { lessonIds, minutes };
  }
  return out;
}

function bilingual(where: string, v: { en: string; ar: string }, arabicScript = true) {
  assert.ok(v && typeof v.en === "string" && v.en.trim().length > 0, `${where}: English missing`);
  assert.ok(typeof v.ar === "string" && v.ar.trim().length > 0, `${where}: Arabic missing`);
  if (arabicScript) assert.match(v.ar, ARABIC, `${where}: Arabic text has no Arabic letters`);
  assert.equal(v.en, v.en.trim(), `${where}: stray whitespace`);
  assert.equal(v.ar, v.ar.trim(), `${where}: stray whitespace`);
}

test("the 11 approved career paths, with their courses in the approved order", () => {
  assert.deepEqual(
    Object.fromEntries(careerPaths.map((p) => [p.id, p.courses.map((s) => s.course)])),
    APPROVED
  );
});

test("path ids are unique slugs and never a track id or a planned course id", () => {
  const ids = careerPaths.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate path id");
  for (const id of ids) {
    assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${id}: not a slug`);
    // /roadmaps/<track-id>/ is that course's map (old URLs, roadmap node progress): a path may not take it
    assert.ok(!trackIds.has(id), `${id} collides with a track id`);
    assert.ok(!plannedIds.has(id), `${id} collides with a planned course id`);
  }
});

test("every referenced course is a track or a planned course; planned ids are not track ids and are used", () => {
  const used = new Set(careerPaths.flatMap((p) => p.courses.map((s) => s.course)));
  for (const p of careerPaths) {
    for (const s of p.courses) assert.ok(trackIds.has(s.course) || plannedIds.has(s.course), `${p.id}: unknown course ${s.course}`);
    const list = p.courses.map((s) => s.course);
    assert.equal(new Set(list).size, list.length, `${p.id}: a course appears twice`);
    assert.ok(p.courses.length >= 2, `${p.id}: a path needs at least 2 courses`);
  }
  assert.equal(new Set(plannedCourses.map((c) => c.id)).size, plannedCourses.length, "duplicate planned id");
  for (const c of plannedCourses) {
    // When a planned course ships (a track with that id), delete its planned entry in the same change.
    assert.ok(!trackIds.has(c.id), `${c.id} is now a track: remove it from plannedCourses`);
    assert.ok(used.has(c.id), `${c.id} is planned but no path uses it`);
    bilingual(`planned ${c.id} title`, c.title);
    bilingual(`planned ${c.id} description`, c.description);
    assert.ok(c.icon.length > 0);
    assert.match(c.accent, /^#[0-9a-f]{6}$/i);
  }
});

test("every course in the catalog belongs to at least one career path", () => {
  for (const c of courses) assert.ok(pathsWithCourse(c.id).length > 0, `${c.id} is in no career path`);
});

test("levels are valid and never go down along a path (Beginner -> Intermediate -> Advanced)", () => {
  for (const p of careerPaths) {
    let prev = 0;
    for (const s of p.courses) {
      const rank = PATH_LEVELS.indexOf(s.level);
      assert.ok(rank >= 0, `${p.id}/${s.course}: level ${s.level}`);
      assert.ok(rank >= prev, `${p.id}/${s.course}: ${s.level} after a higher level`);
      prev = rank;
    }
    assert.equal(p.courses[0].level, "beginner", `${p.id}: a path starts at Beginner`);
  }
});

test("every learner-facing string is bilingual; counts of if-you-like, skills and jobs", () => {
  for (const p of careerPaths) {
    bilingual(`${p.id} title`, p.title);
    bilingual(`${p.id} description`, p.description);
    assert.ok(p.description.en.length >= 120, `${p.id}: description is one full paragraph`);
    assert.equal(p.ifYouLike.length, 3, `${p.id}: exactly 3 "if you like" items`);
    p.ifYouLike.forEach((v, i) => bilingual(`${p.id} ifYouLike[${i}]`, v));
    assert.ok(p.skills.length >= 5 && p.skills.length <= 8, `${p.id}: 5-8 skills, has ${p.skills.length}`);
    // Product names ("React", "Docker") are not translated, so a skill may have no Arabic letters
    p.skills.forEach((v, i) => bilingual(`${p.id} skills[${i}]`, v, false));
    assert.ok(p.jobs.length >= 2, `${p.id}: at least 2 job titles`);
    p.jobs.forEach((v, i) => bilingual(`${p.id} jobs[${i}]`, v));
    p.courses.forEach((s) => bilingual(`${p.id}/${s.course} why`, s.why));
    assert.ok((PATH_CATEGORIES as readonly string[]).includes(p.category), `${p.id}: category ${p.category}`);
    assert.match(p.accent, /^#[0-9a-f]{6}$/i, `${p.id}: accent`);
    assert.ok(p.icon.length > 0, `${p.id}: icon`);
    for (const list of [p.skills, p.jobs, p.ifYouLike]) {
      const en = list.map((v) => v.en.toLowerCase());
      assert.equal(new Set(en).size, en.length, `${p.id}: duplicate entry in ${en.join(", ")}`);
    }
  }
  // Every category has a path (the filter chips never offer an empty category) and a label in both languages
  for (const c of PATH_CATEGORIES) {
    assert.ok(careerPaths.some((p) => p.category === c), `no path in category ${c}`);
    assert.ok(pathsEn.paths.categories[c] && pathsAr.paths.categories[c], `category ${c} label`);
  }
});

test("no hours, durations, salaries or lesson counts are stored in the path data", () => {
  const allowed = new Set(["id", "title", "icon", "accent", "category", "description", "ifYouLike", "skills", "jobs", "courses"]);
  for (const p of careerPaths) {
    for (const k of Object.keys(p)) assert.ok(allowed.has(k), `${p.id}: unexpected field ${k}`);
    for (const s of p.courses) assert.deepEqual(Object.keys(s).sort(), ["course", "level", "why"], `${p.id}/${s.course}`);
    const text = JSON.stringify(p);
    assert.doesNotMatch(text, /[$€£]|\bsalary\b|\bper year\b|\d+\s*%|\d+\s*(hours|hrs|months|weeks)\b/i, `${p.id}: numbers belong to the computed figures, not the data`);
  }
});

test("hours and lesson counts are computed from the catalog's lessons and their minutes", async () => {
  const figures = await realFigures();
  const summaries = resolvePaths(figures);
  assert.equal(summaries.length, careerPaths.length);
  for (const s of summaries) {
    const path = careerPaths.find((p) => p.id === s.id)!;
    const availableIds = path.courses.map((c) => c.course).filter((id) => courses.some((c) => c.id === id));
    const expectLessons = availableIds.reduce((n, id) => n + courses.find((c) => c.id === id)!.lessons.length, 0);
    const expectMinutes = availableIds.reduce((n, id) => n + figures[id].minutes, 0);
    assert.equal(s.totals.lessons, expectLessons, `${s.id}: lessons`);
    assert.equal(s.totals.minutes, expectMinutes, `${s.id}: minutes`);
    assert.equal(s.totals.available, availableIds.length, `${s.id}: available courses`);
    assert.equal(s.totals.comingSoon, path.courses.length - availableIds.length, `${s.id}: coming soon`);
    assert.equal(s.totals.courses, path.courses.length);
    // Sanity: a path is hours of study, not minutes or months; lessons average 10-120 minutes
    const hours = hoursFromMinutes(s.totals.minutes);
    assert.ok(hours >= 2 && hours <= 300, `${s.id}: ${hours} hours`);
    assert.ok(s.totals.minutes / s.totals.lessons >= 10 && s.totals.minutes / s.totals.lessons <= 120, `${s.id}: minutes per lesson`);
    // Positions are 1..N in order, levels listed Beginner first
    assert.deepEqual(s.courses.map((c) => c.position), path.courses.map((_, i) => i + 1));
    assert.deepEqual(s.levels, PATH_LEVELS.filter((lv) => path.courses.some((c) => c.level === lv)));
  }
  assert.equal(hoursFromMinutes(0), 1);
  assert.equal(hoursFromMinutes(89), 1);
  assert.equal(hoursFromMinutes(90), 2);
});

test("a lesson added to a course is counted in every path that contains it, and only there", async () => {
  const figures = await realFigures();
  const before = resolvePaths(figures);
  const grown = { ...figures, networking: { lessonIds: [...figures.networking.lessonIds, "new-lesson"], minutes: figures.networking.minutes + 45 } };
  const after = resolvePaths(grown);
  const withNetworking = new Set(pathsWithCourse("networking").map((m) => m.path.id));
  assert.deepEqual([...withNetworking].sort(), ["cloud-engineer", "devops-engineer", "penetration-tester", "soc-analyst"]);
  for (const [i, s] of after.entries()) {
    const b = before[i];
    if (withNetworking.has(s.id)) {
      assert.equal(s.totals.lessons, b.totals.lessons + 1, s.id);
      assert.equal(s.totals.minutes, b.totals.minutes + 45, s.id);
    } else {
      assert.deepEqual(s.totals, b.totals, s.id);
    }
  }
});

test("planned (NEW) courses are never available, never carry lessons, even if figures exist for their id", async () => {
  const figures = await realFigures();
  const spoofed = { ...figures, "incident-response": { lessonIds: ["x"], minutes: 30 }, mlops: { lessonIds: ["y"], minutes: 30 } };
  for (const s of resolvePaths(spoofed)) {
    for (const c of s.courses) {
      if (plannedIds.has(c.id)) {
        assert.equal(c.available, false, `${s.id}/${c.id} must not be linkable`);
        assert.deepEqual(c.lessonIds, []);
        assert.equal(c.minutes, 0);
        const planned = plannedCourses.find((p) => p.id === c.id)!;
        assert.deepEqual(c.title, planned.title);
      } else {
        assert.equal(c.available, true, `${s.id}/${c.id} exists and has lessons`);
        assert.ok(c.lessonIds.length > 0);
      }
    }
  }
  // A track with no lessons yet (no figures) is shown as coming soon, not linked
  const noNetworking = { ...figures };
  delete (noNetworking as Record<string, CourseFigures | undefined>).networking;
  const soc = resolvePath(careerPaths.find((p) => p.id === "soc-analyst")!, noNetworking);
  assert.equal(soc.courses[0].available, false);
  assert.equal(soc.courses[0].title.en, roadmaps.find((r) => r.id === "networking")!.title);
});

test("pathsWithCourse gives the course's position and level in each path", () => {
  const m = pathsWithCourse("cyber-security");
  assert.deepEqual(m.map((x) => [x.path.id, x.position, x.total, x.level]), [
    ["soc-analyst", 3, 4, "intermediate"],
    ["penetration-tester", 3, 5, "intermediate"],
  ]);
  assert.deepEqual(pathsWithCourse("no-such-course"), []);
  const custom: CareerPath[] = [{ ...careerPaths[0], id: "x", courses: [{ course: "frontend", level: "beginner", why: { en: "a", ar: "ب" } }] }];
  assert.deepEqual(pathsWithCourse("frontend", custom).map((x) => x.path.id), ["x"]);
});

test("path progress: course progress counts in every path; states and the next course", async () => {
  const figures = await realFigures();
  const summaries = resolvePaths(figures);
  const by = (id: string) => summaries.find((s) => s.id === id)!;
  const doneAll = (track: string) => Object.fromEntries(figures[track].lessonIds.map((l) => [`${track}/${l}`, { done: 1 }]));

  const none = pathProgress(by("ux-designer"), {});
  assert.equal(none.state, "not-started");
  assert.equal(none.done, 0);
  assert.equal(nextCourse(by("ux-designer"), none)?.id, "ui-ux");

  // Finishing Networking moves four paths forward at once
  const net = doneAll("networking");
  for (const id of ["soc-analyst", "penetration-tester", "cloud-engineer", "devops-engineer"]) {
    const p = pathProgress(by(id), net);
    assert.equal(p.done, figures.networking.lessonIds.length, id);
    assert.equal(p.state, "in-progress", id);
    assert.equal(p.perCourse.networking.complete, true, id);
  }
  assert.equal(pathProgress(by("ux-designer"), net).done, 0);
  assert.equal(nextCourse(by("cloud-engineer"), pathProgress(by("cloud-engineer"), net))?.id, "operating-systems");

  // A path without coming-soon courses completes
  const ux = { ...doneAll("ui-ux"), ...doneAll("frontend") };
  const uxp = pathProgress(by("ux-designer"), ux);
  assert.equal(uxp.state, "complete");
  assert.equal(uxp.ratio, 1);
  assert.equal(uxp.coursesComplete, 2);

  // A path with a coming-soon course is never "complete" while the course is not published
  const fe = pathProgress(by("frontend-developer"), ux);
  assert.equal(fe.state, "available-complete");
  assert.equal(fe.perCourse["advanced-react"], undefined, "a planned course has no progress");
  // Nothing left to continue: never a finished course, never the coming-soon one
  assert.equal(nextCourse(by("frontend-developer"), fe), undefined);
  assert.equal(nextCourse(by("ux-designer"), uxp), undefined);

  // `done: true` (legacy) counts; `done: 0` does not
  const legacy = pathProgress(by("ux-designer"), { [`ui-ux/${figures["ui-ux"].lessonIds[0]}`]: { done: true }, [`ui-ux/${figures["ui-ux"].lessonIds[1]}`]: { done: 0 } });
  assert.equal(legacy.done, 1);
});

test("track levels map onto path levels ('All Levels' matches every level)", () => {
  assert.deepEqual(trackLevels("Beginner"), ["beginner"]);
  assert.deepEqual(trackLevels("Advanced"), ["advanced"]);
  assert.deepEqual(trackLevels("All Levels"), ["beginner", "intermediate", "advanced"]);
});

test("CAREER_PATH_IDS (the light list the navbar reads) is the path data's ids, in order", () => {
  assert.deepEqual([...CAREER_PATH_IDS], careerPaths.map((p) => p.id));
});

test("isCourseMapPath: /roadmaps/<track-id>/ is a course map, /roadmaps/<path-id>/ and /roadmaps/ are not", () => {
  for (const id of trackIds) {
    assert.equal(isCourseMapPath(`/roadmaps/${id}/`), true, id);
    assert.equal(isCourseMapPath(`/roadmaps/${id}`), true, id);
  }
  for (const id of CAREER_PATH_IDS) assert.equal(isCourseMapPath(`/roadmaps/${id}/`), false, id);
  for (const p of ["/roadmaps/", "/roadmaps", "/", "/learn/networking/", "/courses/"]) assert.equal(isCourseMapPath(p), false, p);
});

test("coursePathLinks: the props the course page and course map get, in path order", () => {
  for (const id of trackIds) {
    assert.deepEqual(
      coursePathLinks(id),
      pathsWithCourse(id).map(({ path, position, total, level }) => ({ id: path.id, title: path.title, icon: path.icon, position, total, level })),
      id
    );
  }
  assert.deepEqual(coursePathLinks("networking").map((x) => x.id), ["soc-analyst", "penetration-tester", "cloud-engineer", "devops-engineer"]);
});

/**
 * The paths' text (data/career-paths.ts, ~50 KB) must not reach pages that only show paths they get
 * as props (home, course pages, course maps, role pages): these client modules may import only types
 * from the modules that load it.
 */
test("client components that get paths as props never import the path data", () => {
  const ROOT = join(__dirname, "../..");
  // a value import (not `import type`) from data/career-paths or lib/career-paths
  const heavy = /^import\s+(?!type\b)[^;]*from\s+"(@\/data\/career-paths|@\/lib\/career-paths|\.\/career-paths)"/m;
  for (const f of [
    "lib/path-progress.ts",
    "components/paths/PathCard.tsx",
    "components/paths/PathBits.tsx",
    "components/paths/CareerPathPage.tsx",
    "components/paths/CareerPathsGrid.tsx",
    "components/paths/PathsForCourse.tsx",
    "components/home/Home.tsx",
    "components/layout/Navbar.tsx",
    "components/learn/CourseOverview.tsx",
    "app/roadmaps/[slug]/RoadmapClient.tsx",
    "app/roadmaps/[slug]/RoadmapWrapper.tsx",
  ]) {
    const src = readFileSync(join(ROOT, f), "utf8");
    assert.ok(!heavy.test(src), `${f} imports a value from the path data`);
  }
});

