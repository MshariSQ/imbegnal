/**
 * Time-checked loop guards for Code Lab's "Web (HTML/CSS/JS)" preview.
 *
 * The parent page's watchdog cannot stop `while(true){}` in browsers that run the
 * sandboxed preview frame on the page's own thread (Firefox, Safari): its timer
 * never gets to fire. So before the preview runs, every loop in the learner's
 * inline scripts gets a call to the run's guard function at the top of its body:
 *
 *     while (x) y++;          ->  while (x) {__imbLoop_ab12(3);y++;}
 *     for (;;) { work(); }    ->  for (;;) {__imbLoop_ab12(4); work(); }
 *
 * The harness (web-sandbox.ts) defines that function. It throws a RangeError
 * (and tells the parent) once the page has been busy without returning to the
 * event loop for longer than the run's time limit, so the loop stops inside the
 * frame in every browser. The budget restarts whenever the page gets a turn, so
 * a loop in an event handler that runs later has its own budget, and a loop that
 * awaits or yields (an animation, a generator) is never stopped for running long.
 *
 * Inserted text never contains a newline: the learner's line numbers (used for
 * error reports and the editor's error marker) do not move. Inserted code is ES5.
 *
 * Not covered (the parent watchdog still applies where it can): recursion without
 * loops, code built from strings (eval, new Function, inline event attributes) and
 * scripts acorn cannot parse (those are left unchanged; the browser reports the
 * syntax error as before).
 *
 * This module imports acorn, so it is loaded lazily (`import()`) when a Web run starts.
 */
import { parse, type Node as AcornNode } from "acorn";

const LOOPS = new Set(["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"]);

/** `type` values that make a <script> run as a classic script (HTML's JavaScript MIME type essence list). */
const JS_TYPES = new Set([
  "",
  "application/ecmascript",
  "application/javascript",
  "application/x-ecmascript",
  "application/x-javascript",
  "text/ecmascript",
  "text/javascript",
  "text/javascript1.0",
  "text/javascript1.1",
  "text/javascript1.2",
  "text/javascript1.3",
  "text/javascript1.4",
  "text/javascript1.5",
  "text/jscript",
  "text/livescript",
  "text/x-ecmascript",
  "text/x-javascript",
]);

export interface GuardScriptOptions {
  /** Name of the global guard function the harness defines for this run. */
  fn: string;
  /** Parse as a module script (`<script type="module">`). */
  module?: boolean;
  /** 1-based line, in the learner's document, of the script's first character. */
  firstLine?: number;
}

type Loop = AcornNode & { body: AcornNode };

function isNode(v: unknown): v is AcornNode {
  return typeof v === "object" && v !== null && typeof (v as { type?: unknown }).type === "string";
}

/** Calls `visit` for every node below `node`, in source order. */
function eachChild(node: AcornNode, visit: (n: AcornNode) => void) {
  for (const key of Object.keys(node)) {
    if (key === "loc") continue;
    const v = (node as unknown as Record<string, unknown>)[key];
    if (Array.isArray(v)) {
      for (const item of v) if (isNode(item)) visit(item);
    } else if (isNode(v)) {
      visit(v);
    }
  }
}

/**
 * Returns `source` with a guard call at the top of every loop body, or `source`
 * itself when it does not parse (or has no loops).
 */
export function guardScript(source: string, opts: GuardScriptOptions): string {
  let program: AcornNode;
  try {
    program = parse(source, {
      ecmaVersion: "latest",
      sourceType: opts.module ? "module" : "script",
      locations: true,
      allowHashBang: true,
    });
  } catch {
    return source;
  }

  const firstLine = opts.firstLine ?? 1;
  // Insertions in the order they were found; a stable sort by position keeps an
  // outer loop's "{" before an inner loop's guard when both land on one spot.
  const inserts: { at: number; text: string }[] = [];

  const visit = (node: AcornNode) => {
    if (LOOPS.has(node.type)) {
      const loop = node as Loop;
      const line = firstLine + (loop.loc?.start.line ?? 1) - 1;
      const call = `${opts.fn}(${line});`;
      if (loop.body.type === "BlockStatement") {
        inserts.push({ at: loop.body.start + 1, text: call });
      } else {
        inserts.push({ at: loop.body.start, text: `{${call}` }, { at: loop.body.end, text: "}" });
      }
    }
    eachChild(node, visit);
  };
  visit(program);
  if (inserts.length === 0) return source;

  inserts.sort((a, b) => a.at - b.at);
  let out = "";
  let from = 0;
  for (const ins of inserts) {
    out += source.slice(from, ins.at) + ins.text;
    from = ins.at;
  }
  return out + source.slice(from);
}

/** How a <script> tag's attributes say its content runs: "classic", "module" or not at all as JS. */
export function scriptKind(attrs: string): "classic" | "module" | null {
  const seen = new Map<string, string>();
  for (const m of attrs.matchAll(/([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const name = m[1].toLowerCase();
    if (!seen.has(name)) seen.set(name, m[2] ?? m[3] ?? m[4] ?? "");
  }
  if (seen.has("src")) return null; // external: blocked by the CSP anyway, and its content is not ours
  const type = (seen.get("type") ?? "").trim().toLowerCase();
  if (type === "module") return "module";
  return JS_TYPES.has(type) ? "classic" : null;
}

/**
 * Comments and raw-text elements are skipped so a `<script>` inside them is never
 * mistaken for a real one (and text shown in a <textarea> is never rewritten).
 */
const MARKUP =
  /<!--[\s\S]*?(?:-->|$)|<(style|textarea|title|xmp)(?=[\s/>])[^>]*>[\s\S]*?<\/\1\s*>|<script(?=[\s/>])((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script(?=[\s/>])[^>]*>/gi;

/**
 * Adds loop guards to every inline JavaScript <script> in the learner's page.
 * Everything else (markup, JSON/importmap/template scripts, external scripts) is untouched.
 */
export function guardPreviewScripts(html: string, fn: string): string {
  let out = "";
  let from = 0;
  let line = 1;
  let counted = 0;
  for (const m of html.matchAll(MARKUP)) {
    if (m[3] === undefined || m.index === undefined) continue;
    const kind = scriptKind(m[2] ?? "");
    if (!kind) continue;
    // "<script" + attributes + ">"
    const contentStart = m.index + "<script".length + (m[2] ?? "").length + 1;
    for (let i = counted; i < contentStart; i++) if (html.charCodeAt(i) === 10) line++;
    counted = contentStart;
    const guarded = guardScript(m[3], { fn, module: kind === "module", firstLine: line });
    if (guarded === m[3]) continue;
    out += html.slice(from, contentStart) + guarded;
    from = contentStart + m[3].length;
  }
  return from === 0 ? html : out + html.slice(from);
}
