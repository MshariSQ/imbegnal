# Interactive Lessons Platform + Security Hardening — Design

**Date:** 2026-07-02
**Status:** Approved by owner
**Scope:** Turn SkillForge roadmaps into full interactive courses — ELI5 bilingual lessons with an in-browser code runner — and harden the platform for production.

---

## 1. Goals

1. Every roadmap node can carry a full **lesson**: simple-language explanation (ELI5 style), live code demos, auto-checked exercises, and quizzes — written in **both Arabic and English** from day one.
2. Code exercises run **100% client-side** (the site is a static Next.js export on GitHub Pages — there is no server to execute code).
3. A student who completes a track should be job-ready for entry-level paid work; the reference track is **Frontend** (HTML/CSS/JS), whose exercises run natively in the browser.
4. Fix real security gaps in the Cloudflare Worker backend and add best-effort frontend hardening, so the platform is publishable.

## 2. Non-Goals

- No server-side code execution, no WebContainers (requires COOP/COEP headers GitHub Pages cannot set; restrictive license).
- No third-party embedded runners (StackBlitz/OneCompiler embeds) — they break the privacy policy, inject branding, and cannot auto-check solutions.
- No exercise-level progress in D1 — node-level completion remains the only server-side progress record (exercise detail stays in localStorage). YAGNI.
- No content for all 8 tracks in phase 1 — the platform supports all lesson types from day one; content rolls out track by track.

## 3. Data Model

### 3.1 Types (`data/lessons/types.ts`)

```ts
export interface L10n { en: string; ar: string }

export interface Lesson {
  nodeId: string;            // matches RoadmapNodeInfo.id
  title: L10n;
  estMinutes: number;        // honest estimate shown to the student
  sections: LessonSection[];
}

export type LessonSection = TextSection | CodeDemoSection | ExerciseSection | QuizSection;

export interface TextSection {
  type: "text";
  body: L10n;                // markdown subset: headings, bold, inline code, code fences, lists
}

export interface CodeDemoSection {
  type: "code-demo";
  lang: RunnerLang;
  code: string;              // code is always English/LTR
  explanation: L10n;
}

export type RunnerLang = "web" | "js" | "python";
// "web"    = full HTML document (may include <style>/<script>) rendered in the sandbox
// "js"     = plain JS run in a minimal HTML shell, console output shown
// "python" = run via Pyodide in a Web Worker

export interface ExerciseSection {
  type: "exercise";
  lang: RunnerLang;
  prompt: L10n;              // what to build, ELI5 wording
  starterCode: string;
  solution: string;          // revealed via "Show solution" after >= 2 failed check runs
  hints: L10n[];             // progressive hints, revealed one at a time
  tests: ExerciseTest[];
}

export interface ExerciseTest {
  name: L10n;                // human-readable: "The page contains an <h1>"
  check: string;
  // lang web/js : JS expression evaluated INSIDE the sandbox iframe; must evaluate truthy.
  //               Has access to document/window of the sandboxed doc and user globals.
  // lang python : Python snippet (asserts) executed after user code in the same Pyodide scope.
}

export interface QuizSection {
  type: "quiz";
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  q: L10n;
  choices: L10n[];           // 3–4 choices
  answer: number;            // index into choices
  explain: L10n;             // shown after answering
}
```

### 3.2 File layout & lazy loading

```
data/lessons/
├── types.ts
├── index.ts                 # registry (below)
└── frontend/
    ├── html-css.ts          # export const lesson: Lesson
    ├── javascript.ts
    └── ...
```

`data/lessons/index.ts`:

```ts
const registry: Record<string, () => Promise<{ lesson: Lesson }>> = {
  "frontend/html-css": () => import("./frontend/html-css"),
  // ...
};
export const hasLesson = (roadmapId: string, nodeId: string) =>
  `${roadmapId}/${nodeId}` in registry;
export async function loadLesson(roadmapId: string, nodeId: string): Promise<Lesson | null>;
```

Dynamic `import()` gives per-lesson code-splitting: site bundle size stays flat no matter how much content is added.

## 4. Runner Engines

### 4.1 Web sandbox (`lib/runner/web-sandbox.ts`, `components/lesson/runner/WebRunner.tsx`)

- `<iframe sandbox="allow-scripts" srcdoc={...}>` — **never** `allow-same-origin`. User code runs in an opaque origin: it cannot touch the parent DOM, localStorage, cookies, or the JWT. This is the security boundary.
- srcdoc = harness + user code:
  - `lang:"web"`: user HTML document + injected harness `<script>`.
  - `lang:"js"`: minimal dark-themed HTML shell + user script + harness.
- Harness responsibilities (runs inside iframe):
  - Patch `console.log/warn/error` → `parent.postMessage({t:"console", level, args})`.
  - `window.onerror` → `postMessage({t:"error", message})`.
  - After `load`, evaluate each test with `new Function("return (" + check + ")")` in try/catch → `postMessage({t:"tests", results:[{i, pass, error?}]})`.
- Parent (`WebRunner`) listens on `message`, filters by `event.source === iframe.contentWindow` (origin is `"null"` for opaque origins — source check is the reliable filter).
- Every run recreates the iframe (clean state). 5-second watchdog: no `tests` message → report as probable infinite loop, offer re-run.
- UI: split view — editor on one side, live preview + console panel on the other (stacked on mobile).

### 4.2 Python runner (`lib/runner/python-worker.ts`, `components/lesson/runner/PythonRunner.tsx`)

- Dedicated Web Worker; loads Pyodide from jsDelivr CDN via `importScripts` on first use (~10 MB, browser-cached afterwards). Loading state in UI: "جاري تحميل بيئة بايثون…" with progress note.
- Worker protocol: `{cmd:"run", code, tests}` → runs user code with stdout/stderr captured (redirect `sys.stdout`), then each test's Python asserts in the same scope → `{t:"result", stdout, testResults}`.
- 10-second timeout → `worker.terminate()` + recreate; report timeout to student.
- Worker keeps the Pyodide instance alive between runs (fast re-runs); only user scope is reset per run.

### 4.3 Quiz engine (`components/lesson/QuizBlock.tsx`)

Pure React. Select → submit → immediate feedback + explanation. Quiz section passes when all questions answered correctly (retry allowed per question).

### 4.4 Editor

CodeMirror 6 via `@uiw/react-codemirror` + `@codemirror/lang-html`, `lang-javascript`, `lang-python`. Dark theme matched to `#0D1117`/`#161B22`. Editor content is always LTR (`dir="ltr"` on the editor container) even in Arabic UI — code is LTR by convention.

## 5. Lesson UI

- `RoadmapClient` main panel gains tabs when `hasLesson(roadmapId, nodeId)`:
  **📖 Lesson (default)** | **🔗 Resources** (current content unchanged). Nodes without lessons show Resources only (current behavior).
- Sidebar: nodes with lessons show a small 📖 indicator.
- `components/lesson/LessonView.tsx` renders sections in order:
  - `TextBlock` — markdown subset renderer (use `react-markdown` with default sanitization-safe config; no raw HTML pass-through).
  - `CodeDemo` — highlighted code + explanation + "جرّب بنفسك / Try it" button that opens it as a live editable runner.
  - `ExerciseBlock` — prompt, editor with starterCode, Run ▶ / Check ✓ buttons, test checklist (each test row shows name + pass/fail), progressive hints, "Show solution" unlocked after 2 failed check runs.
  - `QuizBlock` — as above.
- **Completion flow:** a node with a lesson is auto-marked complete when all its exercise sections pass AND all quiz sections pass. On completion: local mark + `markNodeDone` via existing API if signed in. Manual toggle remains for lesson-less nodes.
- All UI strings (Run, Check, Hints, Show solution, tests passed, loading Python, etc.) added to `lib/i18n.ts` under `tx.lesson` in both languages.
- RTL: layout uses logical properties per project convention; only editors/preview stay LTR.

## 6. Progress Storage

- localStorage key `sf-lesson:<roadmapId>:<nodeId>` → `{ ex: number[], quiz: number[], done?: 1 }` (section indexes that passed).
- Works fully anonymous. On sign-in, node-level completion syncs through the existing `/api/progress` endpoints; D1 schema unchanged.

## 7. Security Hardening (Phase 2)

Audit findings and fixes, `worker/src/index.ts`:

1. **OAuth `state` not validated (CSRF).** `handleAuthGitHub` generates `state` but `handleAuthCallback` ignores it. Fix: set `state` in an HttpOnly, Secure, SameSite=Lax cookie (Max-Age 600) on the worker domain when redirecting to GitHub; callback requires query `state` === cookie value, then clears the cookie.
2. **JWT delivered in query string.** `?token=` leaks via history, referrer, and logs. Fix: redirect to `${FRONTEND_URL}/auth/callback/#token=…` (fragment). Frontend `app/auth/callback/page.tsx` reads `location.hash` instead of `searchParams`.
3. **JWT without `exp` verifies forever.** `verifyJWT` only checks `exp` when present. Fix: reject tokens missing `exp`.
4. **No rate limiting.** Fix: in-memory per-isolate sliding window keyed by `CF-Connecting-IP` — 60 req/min general, 10 req/min on auth endpoints → 429 + `Retry-After`. Documented as best-effort (per-isolate memory; acceptable at this scale, no paid dependencies).
5. **No input validation.** Fix: `roadmap_id`, `node_id`, `item_id` must match `/^[a-z0-9-]{1,64}$/`; bookmark `type` must be `certification` or `course`; malformed JSON → 400.
6. **Internal error detail leaked** in `?error=auth_failed&detail=<message>`. Fix: log via `console.error`, redirect with generic `error=auth_failed` only.
7. Add response headers on worker JSON: `X-Content-Type-Options: nosniff`, `Cache-Control: no-store` on auth/user endpoints.

Frontend (GitHub Pages cannot set real headers — best-effort via meta):

8. CSP `<meta http-equiv="Content-Security-Policy">` in `app/layout.tsx`:
   `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src * data:; connect-src 'self' https://cdn.jsdelivr.net https://*.workers.dev; object-src 'none'; base-uri 'self'`
   Notes: `unsafe-inline`/`unsafe-eval` are required by Next hydration, the test harness (`new Function`), and Pyodide (wasm). srcdoc iframes inherit this CSP, so inline scripts inside the sandbox remain allowed. Rendered **only when `process.env.NODE_ENV === "production"`** — otherwise it would block the local dev worker at `localhost:8787`. This is hardening against injected third-party content, not a strict CSP — documented honestly.
9. Runner isolation (section 4.1) is the primary new attack-surface control: user code never executes in the page context, only inside `sandbox="allow-scripts"` iframes or the Python worker.

## 8. Content Plan — Pedagogical Template

Every lesson follows the same fixed pedagogy (enforced by convention, reviewed in PRs):

1. **Objectives** (text) — "in this lesson you will…"
2. **ELI5 explanation** (text) — an analogy a child could follow, then the real concept.
3. **Live demo** (code-demo) — see it working, tweak it.
4. **Exercises** (2–5, easy → harder) — auto-checked, hints before solution.
5. **Quiz** (3–6 questions) — checks understanding, each answer explained.
6. **Summary + what's next** (text).

**Phase 1 reference content:** the complete **Frontend** track (all its nodes), each lesson full AR+EN. Frontend first because its exercises run natively with zero extra download and it is the shortest path to paid work (freelance web development).

**Later phases:** Data Science / AI tracks (Python lessons), theory-heavy tracks (Cyber Security, Cloud, DevOps — quiz-dominant lessons). A lesson-authoring guide is added to CONTRIBUTING.md so external contributors can write lessons that pass review.

## 9. Phases

| Phase | Deliverable |
|-------|-------------|
| 1a | Platform: types, registry, web sandbox, Python worker, quiz engine, editor, LessonView + tabs, progress, i18n strings |
| 1b | Frontend track: full bilingual lessons for every node |
| 2 | Worker security fixes (items 1–7) + frontend CSP (8) + CONTRIBUTING lesson guide |
| 3+ | Content expansion track by track (separate sessions) |

## 10. Testing & Verification

- `npx tsc --noEmit` and `npm run build` (static export) must pass at every phase.
- Manual verification in preview: run/check a web exercise (pass and fail paths), console capture, infinite-loop watchdog, Python lesson load + run, quiz flow, hint/solution gating, completion auto-mark, AR/EN toggle mid-lesson, mobile layout, progress persistence across reload.
- Worker: `wrangler dev` + curl tests for state validation, fragment redirect, exp rejection, rate-limit 429, input validation 400s.

## 11. Risks & Accepted Trade-offs

- **Pyodide CDN dependency** — first Python lesson needs ~10 MB from jsDelivr; acceptable, cached after.
- **Per-isolate rate limiting** is best-effort, not global — acceptable at current scale, zero cost.
- **localStorage progress** can be lost by clearing the browser — mitigated by GitHub sign-in sync.
- **Meta-tag CSP** is weaker than header CSP — GitHub Pages constraint, documented.
- **Content volume** — bilingual full curriculum is large; phased rollout is the mitigation, platform is content-ready from day one.
