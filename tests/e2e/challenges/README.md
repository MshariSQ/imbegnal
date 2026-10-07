# Challenges (CTF) UI specs

Playwright (library API, run with `node:test`) specs for `/challenges/`,
`/challenges/<id>/` and `/challenges/leaderboard/`. They run against a static
export of the site with the Worker **mocked** through `page.route`, using the
exact response shapes of `shared/api.ts`. No Worker, runner or network is needed.

## Why a fixture build

`data/challenges/*.ts` is content owned by the authors (and may be empty), so the
specs cannot rely on it. `build-fixture-site.mjs` temporarily writes
`tests/fixtures/challenges/challenges.ts` into `data/challenges/security.ts`, runs
`next build` (API origin baked in as `https://imbegnal-e2e.workers.dev`), copies
the export to `node_modules/.cache/ctf-e2e-site` and **restores** the data file,
also on failure or Ctrl-C. Fixtures are never committed into `data/`.

## Run

```bash
node tests/e2e/challenges/build-fixture-site.mjs                       # ~90 s, once per UI change
node --import tsx --test --test-concurrency=1 tests/e2e/challenges/*.spec.ts
```

Single spec: `node --import tsx --test tests/e2e/challenges/detail.spec.ts`.

Environment overrides: `CTF_E2E_SITE_DIR` (use another export),
`CHROMIUM_PATH` / `PLAYWRIGHT_BROWSERS_PATH` (when Playwright's own browser is not
installed; `/opt/pw-browsers` is picked up automatically).

## What is covered

- `list.spec.ts`: render, every filter (track, difficulty, status, kind, search),
  sorting, URL state, empty state, first blood marker, solved state from stats,
  "stats unavailable" fallback.
- `detail.spec.ts`: statement, files (copy / download), hints with the cost confirm,
  flag submit correct / incorrect / rate limited / 401 / quota errors, first blood
  celebration, Open in Code Lab link format, code-kind panel.
- `leaderboard.spec.ts`: tabs, track filter, pinned "you" row, podium text.
- `layout-a11y.spec.ts`: RTL, 360 px layout, axe-core zero serious/critical in
  light/dark x EN/AR, no console or hydration errors.

Pure logic (filters, sorting, URL state, relative time, stat merge, solved cache)
is covered by `tests/unit/ctf-*.test.ts` (`npm run test:unit`).

`harness.ts` holds the static server, the Worker mock (`defaultMock()` is
overridable per test), the console-error collector and the axe helper.
