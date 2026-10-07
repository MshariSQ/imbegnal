/**
 * Code Lab's language model: the 14 server languages from shared/languages.ts
 * plus "Web (HTML/CSS/JS)", which only exists in the browser (it renders a page
 * in a sandboxed iframe, so there is nothing for the runner to execute).
 *
 * Pure (types + data only) so it is unit-testable under node:test.
 */
import { LANGUAGES, getLanguage, parseLangId, type BrowserRuntime, type LangId, type LanguageSpec } from "../../shared/languages";

export const WEB_ID = "web" as const;
export type LabLangId = LangId | typeof WEB_ID;
export type EditorMode = LanguageSpec["editor"] | "html";

export interface LabLanguage {
  id: LabLangId;
  label: string;
  editor: EditorMode;
  /** Source file name, shown in the editor header. */
  filename: string;
  /** Hello World starter. */
  hello: string;
  /** Which in-browser runtime can execute it (offline fallback / guests). */
  browser?: BrowserRuntime;
  /** True when no server runner exists for it at all. */
  browserOnly: boolean;
  /** Short note such as "Node.js"; not translated (product names). */
  runtimeNote: string;
}

const WEB_HELLO = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Hello, World!</title>
    <style>
      body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; }
      h1 { color: #0f766e; }
    </style>
  </head>
  <body>
    <h1 id="greeting">Hello, World!</h1>
    <script>
      console.log("Hello, World!");
    </script>
  </body>
</html>
`;

const WEB: LabLanguage = {
  id: WEB_ID,
  label: "Web (HTML/CSS/JS)",
  editor: "html",
  filename: "index.html",
  hello: WEB_HELLO,
  browser: "web",
  browserOnly: true,
  runtimeNote: "Your browser",
};

export const LAB_LANGUAGES: readonly LabLanguage[] = [
  ...LANGUAGES.map<LabLanguage>((l) => ({
    id: l.id,
    label: l.label,
    editor: l.editor,
    filename: l.filename,
    hello: l.hello,
    browser: l.browser,
    browserOnly: false,
    runtimeNote: l.runtimeNote,
  })),
  WEB,
];

const BY_ID = new Map<string, LabLanguage>(LAB_LANGUAGES.map((l) => [l.id, l]));

export function getLabLanguage(id: LabLangId): LabLanguage {
  // Every LabLangId is in the table by construction.
  return BY_ID.get(id) as LabLanguage;
}

export function isLabLangId(v: unknown): v is LabLangId {
  return typeof v === "string" && BY_ID.has(v);
}

/** Lenient parse: server aliases ("c++", "py"…) plus "web"/"html". */
export function parseLabLang(v: unknown): LabLangId | null {
  if (typeof v !== "string") return null;
  const k = v.trim().toLowerCase();
  if (k === WEB_ID || k === "html") return WEB_ID;
  return parseLangId(k);
}

/** Lesson `RunnerLang` ("js" | "python" | "web") → Code Lab language. */
export function fromRunnerLang(r: "js" | "python" | "web"): LabLangId {
  return r === "js" ? "javascript" : r === "python" ? "python" : WEB_ID;
}

/** The server language id, or null for the browser-only Web mode. */
export function toServerLang(id: LabLangId): LangId | null {
  return id === WEB_ID ? null : id;
}

export function hasServerRunner(id: LabLangId): boolean {
  return id !== WEB_ID && !!getLanguage(id);
}

const norm = (s: string) => s.replace(/\r\n?/g, "\n").trimEnd();

/** True when `code` is empty or exactly one of the stock Hello World templates. */
export function isUntouchedTemplate(code: string): boolean {
  const c = norm(code);
  if (c.trim() === "") return true;
  return LAB_LANGUAGES.some((l) => norm(l.hello) === c);
}

export interface SwitchPlan {
  /** Code the editor should show after the switch. */
  code: string;
  /** Stdin the editor should show after the switch. */
  stdin: string;
  /** Where the new code came from: for tests and for the "kept your code" hint. */
  source: "draft" | "template" | "carried";
}

/**
 * What the editor shows after the user switches language.
 *
 *  - Untouched template (or empty): the new language's own draft, else its template.
 *  - Edited code: if the target language has its own edited draft, load that (the
 *    edits in the old language stay in the old language's draft); otherwise the
 *    user's code is carried over unchanged (they probably picked the wrong
 *    language for it).
 *
 * No path discards edited text: the caller persists the outgoing code as the old
 * language's draft before applying the plan.
 */
export function planLanguageSwitch(args: {
  currentCode: string;
  currentStdin: string;
  target: LabLangId;
  targetDraft?: { code: string; stdin: string } | null;
}): SwitchPlan {
  const { currentCode, currentStdin, target, targetDraft } = args;
  const ownDraft = targetDraft && !isUntouchedTemplate(targetDraft.code) ? targetDraft : null;
  if (isUntouchedTemplate(currentCode)) {
    if (ownDraft) return { code: ownDraft.code, stdin: ownDraft.stdin, source: "draft" };
    return { code: getLabLanguage(target).hello, stdin: targetDraft?.stdin ?? "", source: "template" };
  }
  if (ownDraft) return { code: ownDraft.code, stdin: ownDraft.stdin, source: "draft" };
  return { code: currentCode, stdin: currentStdin, source: "carried" };
}
