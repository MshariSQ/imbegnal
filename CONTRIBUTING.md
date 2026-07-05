# Contributing to SkillForge

Thank you for taking the time to contribute! SkillForge is a free, open-source learning platform and every contribution — big or small — makes it better for learners worldwide.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [What You Can Contribute](#what-you-can-contribute)
- [Before You Start](#before-you-start)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Adding a New Roadmap](#adding-a-new-roadmap)
- [Writing an Interactive Lesson](#writing-an-interactive-lesson)
- [Adding or Updating Resources](#adding-or-updating-resources)
- [Pull Request Rules](#pull-request-rules)
- [Commit Message Format](#commit-message-format)
- [Code Style](#code-style)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

By participating in this project you agree to be respectful, constructive, and welcoming to contributors of all backgrounds and experience levels. Harassment or hostile behaviour of any kind will not be tolerated. Issues and pull requests that violate this will be closed without comment.

---

## What You Can Contribute

| Type | Examples |
|------|---------|
| **New roadmap** | Add a full learning roadmap for a field not yet covered |
| **Roadmap node** | Add, fix, or improve nodes inside an existing roadmap |
| **Resource update** | Update a broken link, add a better course/book/video, fix pricing |
| **Translation** | Improve or extend Arabic translations in `lib/i18n.ts` |
| **Bug fix** | Fix a UI bug, broken page, or incorrect data |
| **New feature** | Propose and build a new platform feature |
| **Documentation** | Improve README, this file, or inline code comments |
| **Accessibility** | Improve keyboard navigation, ARIA labels, colour contrast |

---

## Before You Start

1. **Search open issues and pull requests first.** Someone may already be working on the same thing.
2. **For large changes, open an issue first** and describe what you intend to do. This saves you from doing work that might not be merged.
3. **For small fixes** (typos, broken links, minor bugs) you can open a PR directly — no issue needed.

---

## Development Setup

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Git**

### Steps

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/skillforge.git
cd skillforge

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app runs at `http://localhost:3000`. There is no basePath prefix in development, so URLs look like `/roadmaps/frontend/` instead of `/skillforge/roadmaps/frontend/`.

### Build check

Before opening a PR, confirm the production build passes:

```bash
npm run build
```

This runs `next build` with static export. If it fails, your PR will fail CI too.

### Type check

```bash
npx tsc --noEmit
```

All TypeScript errors must be resolved before submitting.

---

## Project Structure

```
skillforge/
├── app/                     # Next.js App Router pages
│   ├── page.tsx             # Homepage
│   ├── roadmaps/
│   │   ├── page.tsx         # Roadmap listing
│   │   └── [slug]/
│   │       ├── page.tsx     # Static params + data loader
│   │       ├── RoadmapClient.tsx  # Interactive roadmap UI
│   │       └── RoadmapWrapper.tsx
│   ├── certifications/
│   ├── courses/
│   ├── about/
│   ├── terms/
│   └── privacy/
├── components/
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── data/
│   ├── roadmaps.ts          # Roadmap metadata (title, icon, level, etc.)
│   ├── certifications.ts
│   ├── courses.ts
│   └── roadmap-nodes/       # One file per roadmap with full node data
│       ├── cyber-security.ts
│       ├── frontend.ts
│       └── ...
├── lib/
│   ├── i18n.ts              # All English + Arabic UI strings
│   ├── lang-context.tsx     # Language context + useLang() hook
│   ├── auth.ts              # Client-side auth helpers
│   └── api.ts               # API calls to Cloudflare Worker backend
└── public/                  # Static assets
```

---

## Making Changes

```bash
# Create a branch from main — name it after what you're doing
git checkout -b add-rust-roadmap
# or
git checkout -b fix-broken-aws-link
# or
git checkout -b improve-arabic-translations

# Make your changes, then stage and commit
git add <specific files>
git commit -m "feat: add Rust programming roadmap"

# Push and open a pull request
git push origin your-branch-name
```

Never commit directly to `main`. All changes must go through a pull request.

---

## Adding a New Roadmap

This is the most common contribution. Follow these exact steps:

### 1. Add metadata to `data/roadmaps.ts`

Each roadmap entry looks like this:

```ts
{
  id: "rust",                          // URL slug — lowercase, hyphens only
  title: "Rust Programming",
  icon: "🦀",
  description: "Short description shown on the listing card (1–2 sentences).",
  level: "Intermediate",               // "Beginner" | "Intermediate" | "Advanced" | "All Levels"
  duration: "6-9 months",
  learners: "18k+",
  color: "from-orange-500/5 to-red-500/5",  // Tailwind gradient for hover effect
  tags: ["Systems", "Performance"],
  category: "tech",                    // "tech" | "business"
}
```

### 2. Create `data/roadmap-nodes/rust.ts`

Each node represents one topic in the roadmap. Copy this structure exactly:

```ts
import type { RoadmapNodeInfo } from "./cyber-security";

export const rustNodes: RoadmapNodeInfo[] = [
  {
    id: "rust-ownership",
    label: "Ownership & Borrowing",
    description: "Rust's core memory safety model — ownership rules, borrowing, and the borrow checker.",
    status: "required",       // "required" | "important" | "optional"
    resources: {
      youtube: {
        title: "Rust Ownership Explained",
        url: "https://www.youtube.com/watch?v=...",
        provider: "Let's Get Rusty",
        tags: ["Free"],
        duration: "25 min",
      },
      course: {
        title: "The Rust Programming Language Book",
        url: "https://doc.rust-lang.org/book/",
        provider: "rust-lang.org",
        tags: ["Free", "Official"],
      },
      certification: undefined,
      book: {
        title: "Programming Rust",
        url: "https://www.oreilly.com/library/view/programming-rust-2nd/9781492052586/",
        provider: "O'Reilly",
        tags: ["Paid"],
      },
      docs: {
        title: "The Rust Reference",
        url: "https://doc.rust-lang.org/reference/",
        provider: "rust-lang.org",
        tags: ["Free", "Official"],
      },
    },
  },
  // ... more nodes
];
```

**Status guide:**
- `required` — must-know fundamentals; shown in the "Core" group
- `important` — strongly recommended topics; shown in "Key Topics"
- `optional` — advanced or supplementary; shown in "Advanced"

**Resource rules:**
- Every node must have at least one resource (not all four are required — set unused ones to `undefined`)
- All URLs must be real, working links — verify them before submitting
- Use `"Free"`, `"Paid"`, `"Free Audit"`, `"Official"`, `"Recommended"`, or `"Industry Standard"` as tags
- Do not add affiliate links or sponsored content

### 3. Register the roadmap in `app/roadmaps/[slug]/page.tsx`

Add an import and an entry to the `NODE_DATA` map:

```ts
import { rustNodes } from "@/data/roadmap-nodes/rust";

const NODE_DATA: Record<string, RoadmapNodeInfo[]> = {
  // existing entries ...
  "rust": rustNodes,
};
```

### 4. Test it locally

Visit `http://localhost:3000/roadmaps/rust/` and confirm:
- The sidebar lists all your nodes grouped by status
- Clicking a node shows the title, description, and resources
- The progress bar works
- The page looks correct in both English and Arabic (the node labels and descriptions are intentionally left in English — only the UI chrome switches languages)

---

## Writing an Interactive Lesson

Roadmap nodes can carry a full interactive lesson (explanation + runnable code + auto-checked exercises + quiz). Lessons live in `data/lessons/<roadmapId>/<nodeId>.ts` and are registered in `data/lessons/index.ts`.

### The fixed pedagogy (every lesson follows this order)

1. **Objectives** (`text`) — "in this lesson you will…"
2. **ELI5 explanation** (`text`) — an analogy a child could follow, *then* the real concept
3. **Live demo** (`code-demo`) — working code the student can open and tweak
4. **Exercises** (`exercise` × 2–5, easy → harder) — auto-checked, with progressive hints and a solution
5. **Quiz** (`quiz`, 3–6 questions) — each answer explained
6. **Summary + what's next** (`text`)

### Rules

- **Bilingual always.** Every `L10n` field needs real Arabic and English — no machine-translation dumps. Code stays English/LTR.
- **Honest estimates.** `estMinutes` should match a realistic completion time.
- **Runner languages:** `"web"` (full HTML doc in a sandboxed iframe), `"js"` (console-based), `"python"` (Pyodide worker). For tools that can't run in a browser (git, Next.js), use non-runnable demos (`runnable: false`) and a quiz-heavy lesson.
- **Tests must be robust.** `web`/`js` checks are JS expressions evaluated inside the sandbox (they can use `document`, user globals, and `__consoleLog`). Python tests are assert snippets (with `_stdout` available). Verify your solution passes all tests and the starter code fails at least one.
- **Hints before solutions.** 2–3 progressive hints; the solution unlocks automatically after 2 failed check runs.
- **No copy-paste tutorials.** Exercises should feel like building something, not filling blanks.

### Wiring it up

```ts
// data/lessons/index.ts
const registry = {
  // ...
  "frontend/my-node": () => import("./frontend/my-node"),
};
```

The lesson tab, sidebar indicator, progress tracking, and auto-completion all light up automatically once the registry entry exists.

---

## Adding or Updating Resources

To add or fix a resource inside an existing roadmap node, edit the relevant file in `data/roadmap-nodes/`. Keep the same structure shown above and verify all links are live before submitting.

To update certification data (pricing, difficulty, exam links), edit `data/certifications.ts`. Always link to the official exam page, not a third-party prep site.

---

## Pull Request Rules

1. **One thing per PR.** Do not mix a new roadmap with unrelated bug fixes in the same PR.
2. **Fill in the PR template** — describe what changed, why, and how to test it.
3. **The build must pass.** Run `npm run build` locally before pushing.
4. **No broken links.** Every URL you add must work at the time of submission.
5. **No sponsored or affiliate links.** All resources must be editorially chosen, not paid placements.
6. **No AI-generated filler.** Roadmap descriptions and node descriptions must be accurate and useful — not generic placeholder text.
7. **Be responsive.** If a reviewer asks for changes, please respond within 7 days or the PR may be closed.

---

## Commit Message Format

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <short description>
```

| Type | When to use |
|------|-------------|
| `feat` | Adding new content or functionality |
| `fix` | Fixing a bug or broken link |
| `data` | Adding or updating roadmap/cert/course data |
| `i18n` | Translation additions or fixes |
| `style` | UI or CSS changes only |
| `refactor` | Code restructuring with no behaviour change |
| `docs` | README, CONTRIBUTING, or comment changes |
| `chore` | Dependency updates, config changes |

Examples:
```
feat: add Rust programming roadmap
data: update AWS Solutions Architect exam price
fix: broken Coursera ML course link in data-science roadmap
i18n: improve Arabic translation for roadmap UI labels
docs: clarify node status guide in CONTRIBUTING
```

---

## Code Style

- **TypeScript** — all new code must be typed. No `any` unless unavoidable.
- **React** — functional components only. No class components.
- **Tailwind CSS** — use Tailwind utility classes. Do not add raw CSS unless Tailwind cannot achieve it.
- **RTL support** — if your change touches layout, use [CSS logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values): `ps-*`/`pe-*` instead of `pl-*`/`pr-*`, `ms-*`/`me-*` instead of `ml-*`/`mr-*`, `border-s`/`border-e` instead of `border-l`/`border-r`, `start-*`/`end-*` instead of `left-*`/`right-*`. This ensures Arabic RTL layout works without extra overrides.
- **Client components** — add `"use client"` only when the component uses hooks or browser APIs. Keep server components where possible.
- **No comments** — code should be self-explanatory. Only add a comment if something is genuinely non-obvious (a workaround, a constraint, a subtle invariant).

---

## Reporting Bugs

Open an issue at [github.com/MshariSQ/skillforge/issues](https://github.com/MshariSQ/skillforge/issues) and include:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser and OS
- A screenshot if relevant

---

## Suggesting Features

Open an issue with the `enhancement` label. Describe the problem you're trying to solve, not just the solution you have in mind. This helps us understand the use case and discuss the best approach before anyone writes code.

---

## Questions?

Open an issue with the `question` label. We're happy to help you get started.
