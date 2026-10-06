# Curriculum browser specs

Playwright specs for the course page (`/learn/<track>/`), graded lab blocks, practice links,
the certificate card and the `/courses` directory. They run against the **exported site**
(`out/`), served by a tiny static server on a free port (port 0), so they never collide with
other dev servers. The Worker is not needed: `/api/*` calls are answered with `204` and
`GET /api/certificates/<track>` is mocked per test with `page.route`.

The repo ships the `playwright` library but not `@playwright/test`, so the specs use
`node:test` with `playwright` (the same style as `tests/unit`).

## Run

```bash
npm run build                                           # produces out/
node --import tsx --test tests/e2e/curriculum/course.spec.ts
```

Run one test: `--test-name-pattern="axe"`. The full file takes about 3 minutes (every
course page in two languages, axe in light/dark x EN/AR).

Chromium is found automatically: `CHROMIUM_PATH` if set, else the build Playwright expects,
else the newest `chromium-*` / `chromium_headless_shell-*` under `PLAYWRIGHT_BROWSERS_PATH`
(default `/opt/pw-browsers`).

## What is covered

* every course page (all roadmaps that have lessons), EN + AR: all sections render, the
  `<h1>` equals the roadmap title (EN) or the curriculum's Arabic name (AR), `dir="rtl"`,
  JSON-LD (`Course`, `hasCourseInstance`, `educationalLevel`, `teaches`, `timeRequired`)
* "Try in Code Lab" hrefs equal what `shared/links.ts` builds for the lesson's lab, demo or blank lab
* a lab block: listed visible tests, Code Lab CTA, **no solution before passing**, passed state
  (seeded `imb-labs-v1`), XP note, sample-solution disclosure, Practice panel and course chip agree
* the embedded sample code runs in the browser and prints its documented output
* certificate card: locked, signed out, authenticated Blob download, friendly 401/403/500/network errors
* `/courses` chips are canonical roadmap titles (EN + AR), never the directory's raw `field` text
* 360px layout: no horizontal scroll, practice links >= 40px tall
* axe-core: zero serious/critical violations (light/dark x EN/AR) on a course page and two lesson pages
* no console errors, page errors or failed same-origin requests (404 prefetches of routes owned by
  other workstreams, e.g. `/code-lab/`, are ignored only while those routes are absent from `out/`)

Known exclusion: axe skips `.cm-activeLine` because the CodeMirror GitHub-light theme in
`components/lesson/CodeRunner.tsx` paints active-line tokens below 4.5:1 (not owned by this workstream).
