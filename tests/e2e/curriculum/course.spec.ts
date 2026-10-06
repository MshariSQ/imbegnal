/**
 * Browser specs for the course page, lab blocks, practice links, certificate
 * card and /courses against the exported site (out/). Run: see README.md.
 */
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import type { Browser } from "playwright";
import { roadmaps } from "../../../data/roadmaps";
import { curricula } from "../../../data/curricula";
import { curriculumAr } from "../../../lib/i18n-curriculum";
import { courses, resolvePractice } from "../../../lib/catalog";
import { loadLesson } from "../../../data/lessons";
import { challengesHref, codeLabHref } from "../../../shared/links";
import { assertNoProblems, axeSeriousViolations, launch, newPage, serveOut } from "./helpers";

let browser: Browser;
let site: { url: string; close: () => Promise<void> };

before(async () => {
  site = await serveOut();
  browser = await launch();
});
after(async () => {
  await browser?.close();
  await site?.close();
});

const SECTIONS = ["sec-learn", "sec-assess", "sec-curriculum", "sec-sample", "sec-challenges", "sec-badges"] as const;
const LANGS = ["en", "ar"] as const;
const titleOf = (id: string, lang: "en" | "ar") => (lang === "en" ? roadmaps.find((r) => r.id === id)!.title : curriculumAr.curriculum.tracks[id].title);

/** localStorage payloads */
const studyAllDone = (track: string) =>
  JSON.stringify({
    v: 1,
    lessons: Object.fromEntries((courses.find((c) => c.id === track)?.lessons ?? []).map((l) => [`${track}/${l.lessonId}`, { done: 1, visited: 1 }])),
    notes: {},
    days: [],
    updated: 1,
  });
const fakeJwt = () => {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "none" })}.${b64({ sub: "u1", username: "tester", name: "Test User", avatar: "", exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
};

test("there are course pages to test (every roadmap with lessons)", () => {
  assert.ok(courses.length >= 8);
});

for (const lang of LANGS) {
  test(`every course page renders all sections and the canonical title (${lang})`, async () => {
    for (const course of courses) {
      const { page, context, problems } = await newPage(browser, site.url, { lang });
      try {
        await page.goto(`${site.url}/learn/${course.id}/`);
        await page.waitForSelector("h1#course-title");
        assert.equal(await page.locator("h1#course-title").innerText(), titleOf(course.id, lang), `${course.id} title`);
        assert.equal(await page.locator("html").getAttribute("dir"), lang === "ar" ? "rtl" : "ltr");
        for (const id of SECTIONS) assert.equal(await page.locator(`#${id}`).count(), 1, `${course.id}: missing section ${id}`);
        // objectives (4-8) and one row per lesson
        const objectives = await page.locator("#sec-learn").locator("xpath=..").locator("ul > li").count();
        assert.ok(objectives >= 4 && objectives <= 8, `${course.id}: ${objectives} objectives`);
        assert.equal(await page.locator("#sec-curriculum").locator("xpath=..").locator("ol > li").count(), course.lessons.length);
        assert.equal(await page.locator("#sec-badges").locator("xpath=..").locator("ul > li").count() >= 3, true);
        // JSON-LD has the requested fields
        const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}");
        assert.equal(ld["@type"], "Course");
        assert.equal(ld.name, roadmaps.find((r) => r.id === course.id)!.title);
        assert.ok(ld.hasCourseInstance && ld.educationalLevel && ld.timeRequired && ld.teaches.length >= 4);
        assert.deepEqual(ld.teaches, curricula[course.id].objectives.map((o) => o.en));
        assertNoProblems(problems);
      } finally {
        await context.close();
      }
    }
  });
}

test("Try in Code Lab links on the course page match shared/links", async () => {
  const track = "cyber-security";
  const { page, context, problems } = await newPage(browser, site.url);
  try {
    await page.goto(`${site.url}/learn/${track}/`);
    await page.waitForSelector("#sec-curriculum");
    const rows = page.locator("#sec-curriculum").locator("xpath=..").locator("ol > li");
    const course = courses.find((c) => c.id === track)!;
    for (const [i, ref] of course.lessons.entries()) {
      const lesson = (await loadLesson(track, ref.lessonId))!;
      const p = resolvePractice(track, ref.lessonId, lesson.sections, [], curricula[track]);
      const expected = p.labs[0]
        ? codeLabHref({ kind: "exercise", ref: p.labs[0].ref })
        : p.demos[0]
          ? codeLabHref({ kind: "demo", track, lesson: ref.lessonId, section: p.demos[0].section })
          : codeLabHref({ kind: "blank", lang: p.blank!.lang });
      const hrefs = await rows.nth(i).locator('a:has-text("Try in Code Lab")').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
      assert.deepEqual(hrefs, [expected], `${ref.lessonId}`);
    }
    // the labs we added are reachable from the course page: log parsing lab on the python lesson
    assert.ok(await page.locator(`a[href="${codeLabHref({ kind: "exercise", ref: "cyber-security/python/failed-logins" })}"]`).count() >= 1);
    assert.equal(await page.locator(`a[href="${challengesHref(track)}"]`).count() >= 1, true, "See all challenges link");
    assertNoProblems(problems);
  } finally {
    await context.close();
  }
});

test("a lab block shows its passed state and sample solution only after the lab is passed", async () => {
  const ref = "cyber-security/python/failed-logins";
  const url = `${site.url}/learn/cyber-security/python/`;
  const fresh = await newPage(browser, site.url);
  try {
    await fresh.page.goto(url);
    const block = fresh.page.locator('section[aria-labelledby="lab-failed-logins"]');
    await block.waitFor();
    assert.equal(await block.getByText("Passed", { exact: true }).count(), 0);
    assert.equal(await block.getByText("Sample solution").count(), 0, "the solution must not exist before the lab is passed");
    assert.ok(!(await block.innerHTML()).includes("re.compile"), "solution text is not in the DOM before passing");
    const cta = block.getByRole("link", { name: "Try in Code Lab" });
    assert.equal(await cta.getAttribute("href"), codeLabHref({ kind: "exercise", ref }));
    assert.ok((await block.locator("ul > li").count()) >= 2, "visible tests are listed");
    assert.match(await block.innerText(), /Hints and instant feedback are in Code Lab/);
    assertNoProblems(fresh.problems);
  } finally {
    await fresh.context.close();
  }

  const passed = await newPage(browser, site.url, { storage: { "imb-labs-v1": JSON.stringify({ [ref]: 1700000000000 }) } });
  try {
    await passed.page.goto(url);
    const block = passed.page.locator('section[aria-labelledby="lab-failed-logins"]');
    await block.getByText("Passed", { exact: true }).first().waitFor();
    assert.match(await block.innerText(), /You earned 15 XP/);
    assert.equal(await block.getByText("Sample solution").count(), 1);
    await block.getByText("Sample solution").click();
    assert.ok(await block.locator("pre code").last().isVisible());
    // the Practice panel agrees
    const panel = passed.page.locator('section[aria-labelledby="practice-title"]');
    assert.match(await panel.innerText(), /Passed/);
    // the course page chip too
    await passed.page.goto(`${site.url}/learn/cyber-security/`);
    await passed.page.getByText("Lab passed").first().waitFor();
    assertNoProblems(passed.problems);
  } finally {
    await passed.context.close();
  }
});

test("lesson pages: Practice panel above completion, Open in Code Lab next to runnable demos", async () => {
  const { page, context, problems } = await newPage(browser, site.url);
  try {
    await page.goto(`${site.url}/learn/cyber-security/python/`);
    await page.waitForSelector("#practice-title");
    const practiceBox = (await page.locator("#practice-title").boundingBox())!;
    const markDone = (await page.getByRole("button", { name: "Mark lesson complete" }).boundingBox())!;
    assert.ok(practiceBox.y < markDone.y, "Practice panel sits above the completion button");
    const lesson = (await loadLesson("cyber-security", "python"))!;
    const p = resolvePractice("cyber-security", "python", lesson.sections, [], curricula["cyber-security"]);
    for (const d of p.demos) assert.ok((await page.locator(`a[href="${d.href}"]`).count()) >= 1, `Open in Code Lab for section ${d.section}`);
    assertNoProblems(problems);
  } finally {
    await context.close();
  }
});

test("the embedded sample code runs in the browser and prints the documented output", async () => {
  const track = "cloud-computing"; // a JavaScript sample: no Pyodide download needed
  const { page, context, problems } = await newPage(browser, site.url);
  try {
    await page.goto(`${site.url}/learn/${track}/`);
    const section = page.locator("#sec-sample").locator("xpath=..");
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: "Run", exact: true }).click();
    const expected = curricula[track].sampleCode.output.trimEnd().split("\n");
    for (const line of expected) await section.getByText(line.replace(/\s+/g, " "), { exact: false }).first().waitFor({ timeout: 10_000 }).catch(async () => {
      // console text keeps its spaces: compare against the raw text instead of the normalised locator
      const text = await section.innerText();
      assert.ok(text.replace(/\s+/g, " ").includes(line.replace(/\s+/g, " ")), `console shows "${line}"`);
    });
    await section.getByRole("link", { name: "Open in Code Lab" }).waitFor();
    assertNoProblems(problems);
  } finally {
    await context.close();
  }
});

test("certificate card: locked, signed-out, download and error states", async () => {
  const track = "devops";
  // locked
  let w = await newPage(browser, site.url);
  try {
    await w.page.goto(`${site.url}/learn/${track}/`);
    await w.page.getByText("Complete every lesson to unlock your certificate.").waitFor();
    assert.equal(await w.page.getByRole("button", { name: /Download certificate/ }).count(), 0);
  } finally {
    await w.context.close();
  }
  // complete but signed out
  w = await newPage(browser, site.url, { storage: { "imb-study-v1": studyAllDone(track) } });
  try {
    await w.page.goto(`${site.url}/learn/${track}/`);
    await w.page.getByRole("link", { name: "Sign in" }).first().waitFor();
    await w.page.getByText("Sign in to download your certificate.").waitFor();
  } finally {
    await w.context.close();
  }
  // complete + signed in: authenticated fetch → Blob download
  w = await newPage(browser, site.url, { storage: { "imb-study-v1": studyAllDone(track), sf_token: fakeJwt() } });
  try {
    let auth = "";
    await w.page.route("**/api/certificates/devops", async (route) => {
      auth = route.request().headers()["authorization"] ?? "";
      await route.fulfill({ status: 200, contentType: "application/pdf", body: "%PDF-1.4 test" });
    });
    await w.page.goto(`${site.url}/learn/${track}/`);
    const button = w.page.getByRole("button", { name: "Download certificate (PDF)" });
    await button.waitFor();
    const [download] = await Promise.all([w.page.waitForEvent("download"), button.click()]);
    assert.equal(download.suggestedFilename(), "imbegnal-devops-certificate.pdf");
    assert.match(auth, /^Bearer /);
    await w.page.getByText("Certificate downloaded.").waitFor();
    // friendly error states
    for (const [status, message] of [[403, /server has not recorded every lesson/], [401, /session expired/], [500, /not available right now/]] as const) {
      await w.page.unroute("**/api/certificates/devops");
      await w.page.route("**/api/certificates/devops", (route) => route.fulfill({ status, contentType: "application/json", body: "{}" }));
      await button.click();
      await w.page.getByRole("status").filter({ hasText: message }).waitFor();
    }
    await w.page.unroute("**/api/certificates/devops");
    await w.page.route("**/api/certificates/devops", (route) => route.abort("failed"));
    await button.click();
    await w.page.getByText("Could not reach the server").waitFor();
  } finally {
    await w.context.close();
  }
});

test("/courses filter chips render canonical roadmap titles (EN and AR)", async () => {
  for (const lang of LANGS) {
    const { page, context, problems } = await newPage(browser, site.url, { lang });
    try {
      await page.goto(`${site.url}/courses/`);
      await page.waitForSelector("button[aria-pressed]");
      const chips = await page.locator("button[aria-pressed]").allInnerTexts();
      for (const id of ["cyber-security", "artificial-intelligence", "frontend", "devops", "ui-ux"]) {
        assert.ok(chips.includes(titleOf(id, lang)), `${lang}: chip for ${id} (${titleOf(id, lang)}) in ${chips.join(" | ")}`);
      }
      // directory free text ("AI", "Cloud") never leaks as a chip
      for (const raw of ["AI", "Cloud", "Frontend"]) assert.ok(!chips.includes(raw), `raw field "${raw}" rendered`);
      await page.getByRole("button", { name: titleOf("devops", lang), exact: true }).click();
      assert.ok((await page.locator("main a[target=_blank]").count()) > 0);
      assertNoProblems(problems);
    } finally {
      await context.close();
    }
  }
});

for (const lang of LANGS) {
  test(`mobile 360px: no horizontal scroll, comfortable tap targets (${lang})`, async () => {
    for (const path of ["/learn/cyber-security/", "/learn/cyber-security/python/", "/learn/frontend/"]) {
      const { page, context, problems } = await newPage(browser, site.url, { lang, width: 360, height: 740, theme: "light" });
      try {
        await page.goto(site.url + path);
        await page.waitForSelector("main");
        await page.waitForTimeout(400);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        assert.ok(overflow <= 0, `${path} overflows by ${overflow}px`);
        const small = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('#sec-curriculum a[href^="/code-lab"], section[aria-labelledby^="lab-"] a[href^="/code-lab"]')]
            .map((a) => a.getBoundingClientRect().height)
            .filter((h) => h > 0 && h < 39.5)
        );
        assert.deepEqual(small, [], `${path}: practice links shorter than 40px`);
        assertNoProblems(problems);
      } finally {
        await context.close();
      }
    }
  });
}

for (const lang of LANGS) {
  for (const theme of ["light", "dark"] as const) {
    test(`axe: zero serious/critical violations on course and lesson pages (${lang}, ${theme})`, async () => {
      const paths = ["/learn/cyber-security/", "/learn/cyber-security/python/", "/learn/ui-ux/accessibility/"];
      for (const path of paths) {
        const { page, context, problems } = await newPage(browser, site.url, { lang, theme, storage: { "imb-labs-v1": JSON.stringify({ "cyber-security/python/failed-logins": 1 }) } });
        try {
          await page.goto(site.url + path);
          await page.waitForSelector("main");
          await page.locator("main").scrollIntoViewIfNeeded();
          await page.waitForTimeout(600);
          assert.deepEqual(await axeSeriousViolations(page), [], `${path} ${lang} ${theme}`);
          assertNoProblems(problems);
        } finally {
          await context.close();
        }
      }
    });
  }
}
