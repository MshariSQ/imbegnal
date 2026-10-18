/**
 * Browser specs for career paths against the exported site (out/): the /roadmaps/ grid and its
 * filters, a role page (/roadmaps/<path-id>/), an old /roadmaps/<track-id>/ URL (now the course map,
 * still reading roadmap node progress by track id), the /courses/ catalog and the "Part of these
 * career paths" block on a course page. English and Arabic (RTL), 360px layout, axe-core.
 * Run: npm run build, then node --import tsx --test tests/e2e/curriculum/paths.spec.ts
 */
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Browser } from "playwright";
import { careerPaths, plannedCourses } from "../../../data/career-paths";
import { NODE_DATA } from "../../../data/roadmap-nodes";
import { roadmaps } from "../../../data/roadmaps";
import { loadLesson } from "../../../data/lessons";
import { courses } from "../../../lib/catalog";
import { hoursFromMinutes, resolvePaths, type CourseFigures, type PathSummary } from "../../../lib/career-paths";
import { curriculumAr } from "../../../lib/i18n-curriculum";
import { translations } from "../../../lib/i18n";
import { countLabel, hoursLabel } from "../../../lib/plural";
import type { Tx } from "../../../lib/i18n";
import { ROOT, assertNoProblems, axeSeriousViolations, launch, newPage, serveOut } from "./helpers";

let browser: Browser;
let site: { url: string; close: () => Promise<void> };
let summaries: PathSummary[];
let figures: Record<string, CourseFigures>;

const LANGS = ["en", "ar"] as const;
const tx = (lang: "en" | "ar") => translations[lang] as unknown as Tx;
const trackName = (id: string, lang: "en" | "ar") => (lang === "en" ? roadmaps.find((r) => r.id === id)!.title : curriculumAr.curriculum.tracks[id].title);
const planned = new Set(plannedCourses.map((c) => c.id));

before(async () => {
  figures = {};
  for (const c of courses) {
    let minutes = 0;
    for (const l of c.lessons) minutes += (await loadLesson(c.id, l.lessonId))?.estMinutes ?? 0;
    figures[c.id] = { lessonIds: c.lessons.map((l) => l.lessonId), minutes };
  }
  summaries = resolvePaths(figures);
  site = await serveOut();
  browser = await launch();
});
after(async () => {
  await browser?.close();
  await site?.close();
});

const study = (lessons: Record<string, { done: number }>) => JSON.stringify({ v: 1, lessons, notes: {}, days: [], updated: 1 });
const allDone = (...tracks: string[]) => Object.fromEntries(tracks.flatMap((t) => figures[t].lessonIds.map((l) => [`${t}/${l}`, { done: 1 }])));
const fakeJwt = () => {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "none" })}.${b64({ sub: "u1", username: "tester", name: "Test User", avatar: "", exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
};

/**
 * The export is prerendered in English and the pre-paint script sets <html lang/dir> at once; the
 * Arabic text arrives when React re-renders after hydration. Wait for both (the navbar's Courses link
 * is rendered by React in the stored language).
 */
async function waitForLang(page: import("playwright").Page, lang: "en" | "ar") {
  await page.waitForFunction(
    ({ l, label }) =>
      document.documentElement.lang === l &&
      document.documentElement.dir === (l === "ar" ? "rtl" : "ltr") &&
      document.querySelector('nav[aria-label="Main"] a[href="/courses/"]')?.textContent?.trim() === label,
    { l: lang, label: tx(lang).nav.learn },
    { timeout: 10_000 }
  );
}

for (const lang of LANGS) {
  test(`/roadmaps/ lists every career path with credentials, levels and computed hours (${lang})`, async () => {
    const T = tx(lang).paths;
    const { page, context, problems } = await newPage(browser, site.url, { lang });
    try {
      await page.goto(`${site.url}/roadmaps/`);
      await waitForLang(page, lang);
      await page.getByRole("heading", { level: 1, name: T.title }).waitFor({ timeout: 10_000 });
      assert.equal(await page.locator("html").getAttribute("dir"), lang === "ar" ? "rtl" : "ltr");
      const cards = page.locator("article[data-path]");
      assert.equal(await cards.count(), careerPaths.length);
      for (const s of summaries) {
        const card = page.locator(`article[data-path="${s.id}"]`);
        const link = card.getByRole("link", { name: s.title[lang], exact: true });
        assert.equal(await link.getAttribute("href"), `/roadmaps/${s.id}/`, `${s.id} link`);
        const text = await card.innerText();
        assert.ok(text.includes(s.description[lang].slice(0, 30)), `${s.id}: description`);
        for (const item of s.ifYouLike) assert.ok(text.includes(item[lang]), `${s.id}: if you like "${item[lang]}"`);
        // credentials: the first three courses, then "+N more"
        const shown = s.courses.length <= 3 ? s.courses : s.courses.slice(0, 3);
        for (const c of shown) assert.ok(text.includes(c.title[lang]), `${s.id}: course ${c.id}`);
        if (s.courses.length > 3) assert.ok(text.includes(T.more.replace("{n}", String(s.courses.length - 3))), `${s.id}: +N more`);
        // hours are the lesson minutes of the available courses, rounded like the course cards
        assert.ok(text.includes(hoursLabel(tx(lang), hoursFromMinutes(s.totals.minutes))), `${s.id}: hours ${hoursFromMinutes(s.totals.minutes)}`);
        assert.ok(text.includes(T.levels[s.levels[0]]), `${s.id}: level range`);
      }
      assertNoProblems(problems);
    } finally {
      await context.close();
    }
  });
}

test("/roadmaps/ filters: category and level chips, empty state and clear", async () => {
  const T = tx("en").paths;
  const { page, context, problems } = await newPage(browser, site.url);
  try {
    await page.goto(`${site.url}/roadmaps/`);
    await page.locator("article[data-path]").first().waitFor();
    const ids = async () => (await page.locator("article[data-path]").evaluateAll((els) => els.map((e) => e.getAttribute("data-path")))).sort();
    const chip = (name: string) => page.getByRole("button", { name, exact: true });

    await chip(T.categories.security).click();
    assert.equal(await chip(T.categories.security).getAttribute("aria-pressed"), "true");
    assert.equal(await chip(T.allCategories).getAttribute("aria-pressed"), "false");
    assert.deepEqual(await ids(), careerPaths.filter((p) => p.category === "security").map((p) => p.id).sort());
    await page.getByText(T.results.replace("{n}", "2")).waitFor();

    await chip(T.allCategories).click();
    await chip(T.levels.advanced).click();
    assert.deepEqual(await ids(), summaries.filter((s) => s.levels.includes("advanced")).map((s) => s.id).sort());

    // Design has no advanced course: empty state, then "Clear filters" restores everything
    await chip(T.categories.design).click();
    await page.getByText(T.noResults).waitFor();
    await page.getByRole("button", { name: T.clearFilters }).click();
    assert.equal(await page.locator("article[data-path]").count(), careerPaths.length);
    assert.equal(await chip(T.allLevels).getAttribute("aria-pressed"), "true");
    assertNoProblems(problems);
  } finally {
    await context.close();
  }
});

for (const lang of LANGS) {
  test(`a role page groups its courses by level, links available courses and never links coming-soon ones (${lang})`, async () => {
    const T = tx(lang).paths;
    const s = summaries.find((x) => x.id === "soc-analyst")!;
    const { page, context, problems } = await newPage(browser, site.url, { lang });
    try {
      await page.goto(`${site.url}/roadmaps/${s.id}/`);
      await waitForLang(page, lang);
      await page.locator("h1#path-title").filter({ hasText: s.title[lang] }).waitFor({ timeout: 10_000 });
      assert.equal(await page.locator("html").getAttribute("dir"), lang === "ar" ? "rtl" : "ltr");
      const hero = await page.locator("section[aria-labelledby=path-title]").innerText();
      assert.ok(hero.includes(s.description[lang]), "description");
      for (const item of s.ifYouLike) assert.ok(hero.includes(item[lang]), `if you like ${item[lang]}`);
      // Totals with the language's plural form (Arabic: "15 درساً", "حوالي 11 ساعة", never "15 دروس")
      assert.ok(hero.includes(countLabel(tx(lang), "lesson", s.totals.lessons)), `lessons ${countLabel(tx(lang), "lesson", s.totals.lessons)}`);
      assert.ok(hero.includes(hoursLabel(tx(lang), hoursFromMinutes(s.totals.minutes))), "hours");
      const body = await page.locator("main").innerText();
      for (const skill of s.skills) assert.ok(body.includes(skill[lang]), `skill ${skill[lang]}`);
      for (const job of s.jobs) assert.ok(body.includes(job[lang]), `job ${job[lang]}`);

      // Level groups in order, each course "Course k of N"
      assert.deepEqual(await page.locator("[data-level]").evaluateAll((els) => els.map((e) => e.getAttribute("data-level"))), s.levels);
      for (const c of s.courses) {
        const card = page.locator(`article[data-course="${c.id}"]`);
        const text = await card.innerText();
        assert.ok(text.toUpperCase().includes(T.courseOf.replace("{k}", String(c.position)).replace("{n}", String(s.courses.length)).toUpperCase()), `${c.id}: position`);
        assert.ok(text.includes(c.why[lang]), `${c.id}: why`);
        if (planned.has(c.id)) {
          assert.equal(await card.getAttribute("data-course-state"), "coming-soon");
          assert.equal(await card.locator("a").count(), 0, `${c.id}: a coming-soon course is never a link`);
          assert.ok(text.includes(T.comingSoon));
        } else {
          assert.equal(await card.getAttribute("data-course-state"), "available");
          assert.equal(await card.getByRole("link", { name: c.title[lang], exact: true }).getAttribute("href"), `/learn/${c.id}/`);
          assert.equal(await card.getByRole("link", { name: `${T.courseMap}: ${c.title[lang]}` }).getAttribute("href"), `/roadmaps/${c.id}/`);
          assert.ok(text.includes(hoursLabel(tx(lang), hoursFromMinutes(figures[c.id].minutes))), `${c.id}: hours`);
        }
      }
      // No link anywhere on the page points at a planned course
      const hrefs = await page.locator("a[href]").evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
      for (const id of planned) assert.ok(!hrefs.some((h) => h.includes(`/${id}/`)), `link to planned course ${id}`);

      // JSON-LD lists the available courses
      const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}");
      assert.equal(ld["@type"], "EducationalOccupationalProgram");
      assert.deepEqual(ld.hasCourse.map((c: { url: string }) => new URL(c.url).pathname), s.courses.filter((c) => c.available).map((c) => `/learn/${c.id}/`));
      assertNoProblems(problems);
    } finally {
      await context.close();
    }
  });
}

test("role page progress: a finished course counts in every path that contains it; completion states", async () => {
  const T = tx("en").paths;
  // Networking finished: Cyber Security Analyst and Cloud Engineer both move forward
  for (const id of ["soc-analyst", "cloud-engineer"]) {
    const s = summaries.find((x) => x.id === id)!;
    const { page, context, problems } = await newPage(browser, site.url, { storage: { "imb-study-v1": study(allDone("networking")) } });
    try {
      await page.goto(`${site.url}/roadmaps/${id}/`);
      const pct = Math.round((figures.networking.lessonIds.length / s.totals.lessons) * 100);
      await page.locator(`aside[data-path-progress="${pct}"]`).waitFor({ timeout: 10_000 });
      assert.equal(await page.locator("[data-path-state]").getAttribute("data-path-state"), "in-progress");
      const net = await page.locator('article[data-course="networking"]').innerText();
      assert.ok(net.includes(T.statusComplete), "networking shows Completed");
      // "Continue" goes to the first unfinished course
      const next = s.courses.find((c) => c.available && c.id !== "networking")!;
      assert.equal(await page.getByRole("link", { name: `${T.continue}: ${next.title.en}` }).first().getAttribute("href"), `/learn/${next.id}/`);
      assertNoProblems(problems);
    } finally {
      await context.close();
    }
  }
  // UX Designer: every course exists and is finished -> complete, with the course certificates
  {
    const { page, context, problems } = await newPage(browser, site.url, { storage: { "imb-study-v1": study(allDone("ui-ux", "frontend")) } });
    try {
      await page.goto(`${site.url}/roadmaps/ux-designer/`);
      await page.locator('[data-path-state="complete"]').waitFor({ timeout: 10_000 });
      await page.getByText(T.completion.complete).first().waitFor();
      for (const id of ["ui-ux", "frontend"]) {
        assert.equal(await page.getByRole("link", { name: `${T.completion.getCertificate}: ${trackName(id, "en")}` }).getAttribute("href"), `/learn/${id}/#sec-badges`);
      }
      assertNoProblems(problems);
    } finally {
      await context.close();
    }
  }
  // Frontend Developer: the same two courses done, but Advanced React is still coming soon
  {
    const { page, context, problems } = await newPage(browser, site.url, { storage: { "imb-study-v1": study(allDone("ui-ux", "frontend")) } });
    try {
      await page.goto(`${site.url}/roadmaps/frontend-developer/`);
      await page.locator('[data-path-state="available-complete"]').waitFor({ timeout: 10_000 });
      await page.getByText(T.completion.availableComplete).waitFor();
      assertNoProblems(problems);
    } finally {
      await context.close();
    }
  }
});

for (const lang of LANGS) {
  test(`an old /roadmaps/<track-id>/ URL is the course map: node progress by track id, links to the course and its paths (${lang})`, async () => {
    const T = tx(lang).paths;
    const track = "cyber-security";
    const nodes = NODE_DATA[track];
    const { page, context, problems } = await newPage(browser, site.url, { lang, storage: { sf_token: fakeJwt() } });
    try {
      let asked = "";
      await page.route("**/api/progress?roadmap_id=*", async (route) => {
        asked = new URL(route.request().url()).searchParams.get("roadmap_id") ?? "";
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ completed: [nodes[0].id, nodes[1].id] }) });
      });
      await page.goto(`${site.url}/roadmaps/${track}/`);
      await waitForLang(page, lang);
      const h1 = page.locator("h1");
      await h1.filter({ hasText: trackName(track, lang) }).waitFor({ timeout: 10_000 });
      assert.ok((await h1.innerText()).includes(T.mapEyebrow), "retitled Course map");
      // the stored progress is still read with the track id
      await page.getByText(`2 / ${nodes.length}`).waitFor({ timeout: 10_000 });
      assert.equal(asked, track);
      assert.equal(await page.getByRole("link", { name: T.backToCourse }).getAttribute("href"), `/learn/${track}/`);
      const pathLinks = page.getByRole("navigation", { name: T.partOf }).getByRole("link");
      assert.deepEqual(
        await pathLinks.evaluateAll((els) => els.map((e) => e.getAttribute("href"))),
        careerPaths.filter((p) => p.courses.some((c) => c.course === track)).map((p) => `/roadmaps/${p.id}/`)
      );
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), `https://imbegnal.com/roadmaps/${track}/`);
      assertNoProblems(problems);
    } finally {
      await context.close();
    }
  });
}

test("every old /roadmaps/<track-id>/ URL still exists in the export and in the sitemap, beside the path pages", () => {
  const sitemap = readFileSync(join(ROOT, "out/sitemap.xml"), "utf8");
  for (const r of roadmaps) {
    assert.ok(readFileSync(join(ROOT, "out/roadmaps", r.id, "index.html"), "utf8").includes("course map"), `${r.id}: course map page`);
    assert.ok(sitemap.includes(`/roadmaps/${r.id}/<`), `${r.id} in sitemap`);
  }
  for (const p of careerPaths) {
    const html = readFileSync(join(ROOT, "out/roadmaps", p.id, "index.html"), "utf8");
    assert.match(html, new RegExp(`<link rel="canonical" href="[^"]*/roadmaps/${p.id}/"`), `${p.id} canonical`);
    assert.ok(sitemap.includes(`/roadmaps/${p.id}/<`), `${p.id} in sitemap`);
  }
  for (const path of ["/courses/", "/resources/", "/roadmaps/"]) assert.ok(sitemap.includes(`${path}<`), `${path} in sitemap`);
});

for (const lang of LANGS) {
  test(`/courses/ is the catalog of our courses with the career paths of each, filters and the external resources link (${lang})`, async () => {
    const C = tx(lang).coursesCatalog;
    const { page, context, problems } = await newPage(browser, site.url, { lang });
    try {
      await page.goto(`${site.url}/courses/`);
      await waitForLang(page, lang);
      await page.getByRole("heading", { level: 1, name: C.title }).waitFor({ timeout: 10_000 });
      assert.equal(await page.locator("article[data-course]").count(), courses.length);
      for (const c of courses) {
        const card = page.locator(`article[data-course="${c.id}"]`);
        assert.equal(await card.getByRole("link", { name: trackName(c.id, lang), exact: true }).getAttribute("href"), `/learn/${c.id}/`);
        const text = await card.innerText();
        assert.ok(text.includes(hoursLabel(tx(lang), hoursFromMinutes(figures[c.id].minutes))), `${c.id}: hours`);
        const paths = await card.locator('a[href^="/roadmaps/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
        assert.deepEqual(paths, careerPaths.filter((p) => p.courses.some((s) => s.course === c.id)).map((p) => `/roadmaps/${p.id}/`), `${c.id}: paths`);
      }
      // Career path filter: Data Analyst shows its two available courses (the planned one is not a course yet)
      await page.getByLabel(C.pathLabel).selectOption("data-analyst");
      assert.deepEqual(
        (await page.locator("article[data-course]").evaluateAll((els) => els.map((e) => e.getAttribute("data-course")))).sort(),
        ["data-science", "databases"]
      );
      await page.getByLabel(C.pathLabel).selectOption("all");
      // Level filter: Advanced shows Advanced and All Levels courses
      await page.getByRole("button", { name: tx(lang).paths.levels.advanced, exact: true }).click();
      assert.deepEqual(
        (await page.locator("article[data-course]").evaluateAll((els) => els.map((e) => e.getAttribute("data-course")))).sort(),
        courses.filter((c) => c.roadmap.level === "Advanced" || c.roadmap.level === "All Levels").map((c) => c.id).sort()
      );
      assert.equal(await page.getByRole("link", { name: C.externalCta }).getAttribute("href"), "/resources/");
      assertNoProblems(problems);
    } finally {
      await context.close();
    }
  });
}

for (const lang of LANGS) {
  test(`the course page shows Part of these career paths (${lang})`, async () => {
    const T = tx(lang).paths;
    const { page, context, problems } = await newPage(browser, site.url, { lang });
    try {
      await page.goto(`${site.url}/learn/networking/`);
      await waitForLang(page, lang);
      const block = page.locator("[data-testid=course-paths]");
      await block.getByRole("heading", { name: T.partOf }).waitFor({ timeout: 10_000 });
      const members = careerPaths.filter((p) => p.courses.some((c) => c.course === "networking"));
      const links = await block.locator('a[href^="/roadmaps/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
      assert.deepEqual(links, [...members.map((p) => `/roadmaps/${p.id}/`), "/roadmaps/"]);
      const text = await block.innerText();
      for (const p of members) assert.ok(text.includes(p.title[lang]), p.id);
      assertNoProblems(problems);
    } finally {
      await context.close();
    }
  });
}

for (const lang of LANGS) {
  test(`mobile 360px: no horizontal scroll on the career path pages and the catalog (${lang})`, async () => {
    for (const path of ["/roadmaps/", "/roadmaps/penetration-tester/", "/courses/", "/resources/"]) {
      const { page, context, problems } = await newPage(browser, site.url, { lang, width: 360, height: 740, theme: "light" });
      try {
        await page.goto(site.url + path);
        await page.waitForSelector("main");
        await waitForLang(page, lang);
        await page.waitForTimeout(300);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        assert.ok(overflow <= 0, `${path} overflows by ${overflow}px`);
        assertNoProblems(problems);
      } finally {
        await context.close();
      }
    }
  });
}

for (const lang of LANGS) {
  for (const theme of ["light", "dark"] as const) {
    test(`axe: zero serious/critical violations on career path pages, a course map and the catalogs (${lang}, ${theme})`, async () => {
      const paths = ["/roadmaps/", "/roadmaps/soc-analyst/", "/roadmaps/cyber-security/", "/courses/", "/resources/"];
      for (const path of paths) {
        const { page, context, problems } = await newPage(browser, site.url, { lang, theme, storage: { "imb-study-v1": study(allDone("networking")) } });
        try {
          await page.goto(site.url + path);
          await page.waitForSelector("main");
          await waitForLang(page, lang);
          await page.waitForTimeout(500);
          assert.deepEqual(await axeSeriousViolations(page), [], `${path} ${lang} ${theme}`);
          assertNoProblems(problems);
        } finally {
          await context.close();
        }
      }
    });
  }
}
