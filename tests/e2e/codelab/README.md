# Code Lab browser tests

Real Chromium against the **exported site** (`out/`), with the Worker **mocked** via
`page.route` using the exact shapes from `shared/api.ts`. The in-browser runners
(JavaScript worker, Pyodide, sandboxed Web iframe) run for real, without mocks.

## Run

```bash
npm run build                      # produces out/ (the specs refuse to start without it)

# Python in the browser needs Pyodide. Offline machines: install it once somewhere and point at it
#   npm i --prefix /tmp/pyodide pyodide@0.26.4
export PYODIDE_DIR=/tmp/pyodide/node_modules/pyodide   # optional: Pyodide specs are skipped without it

# one spec (each file starts its own static server on a free port and its own browser)
node --import tsx --test tests/e2e/codelab/run.spec.ts

# all Code Lab specs
node --import tsx --test tests/e2e/codelab/*.spec.ts

# also write screenshots of the key states to tests/e2e/codelab/artifacts/ (git-ignored)
SCREENSHOTS=1 node --import tsx --test tests/e2e/codelab/screenshots.spec.ts
```

Chromium is taken from `PLAYWRIGHT_CHROMIUM_EXECUTABLE`, else `$PLAYWRIGHT_BROWSERS_PATH`
(default `/opt/pw-browsers`), else Playwright's own install.

## Specs

| File | Covers |
| --- | --- |
| `run.spec.ts` | Hello World (stdout/stderr, status line, quota), Ctrl/Cmd+Enter, stdin, compile and runtime errors, timeout and truncation, Stop, long lines |
| `errors.spec.ts` | 401, every quota/rate/concurrency scope, runner down (with the in-browser fallback), suspended, offline, unavailable language, unsupported, Pro nudge |
| `browser.spec.ts` | JS / Python / Web runners for real: console capture, error lines, hard timeouts, output cap, sandbox isolation, guest history |
| `history-share.spec.ts` | Server history paging and reopening, share dialog, read-only permalink, fork flow, 404s |
| `deeplinks.spec.ts` | `?ex=`, `?demo=`, `?ch=`, `?lang=` with fabricated fixtures, graded runs, hints/solution, XP, submit |
| `layout.spec.ts` | Desktop/mobile layout, RTL mirroring, language switching and drafts, lazy language packs, settings, keyboard, axe (EN/AR x light/dark) |
| `screenshots.spec.ts` | Opt-in visual capture |

## Fixtures

`data/lessons/**` and `data/challenges/**` belong to the content engineers and are never edited by
tests. Deep-link specs inject fabricated lessons/challenges through `window.__IMB_LAB_FIXTURES__`
(see `lib/codelab/sources.ts`), set before the page loads via `addInitScript` (`fixtures` option of
`withPage`). The seam is read client-side only and only affects the browser that sets it.

`support.ts` holds the static server, the `MockApi` (record + answer), a fake session token, and
page helpers. Console errors, warnings and page errors are collected on every page; specs assert
they stay empty (that is what catches hydration mismatches such as React #418).
