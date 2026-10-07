import { test } from "node:test";
import assert from "node:assert/strict";
import { LANGUAGES } from "../../shared/languages";
import {
  LAB_LANGUAGES,
  fromRunnerLang,
  getLabLanguage,
  hasServerRunner,
  isUntouchedTemplate,
  parseLabLang,
  planLanguageSwitch,
  toServerLang,
} from "../../lib/codelab/langs";
import { decideRunTarget, serverCanRun, UNKNOWN_AVAILABILITY, type AvailabilityMap } from "../../lib/codelab/run-target";

test("Code Lab offers the 14 server languages plus the browser-only Web mode", () => {
  assert.equal(LAB_LANGUAGES.length, LANGUAGES.length + 1);
  assert.equal(LAB_LANGUAGES.filter((l) => l.browserOnly).map((l) => l.id).join(), "web");
  assert.equal(LAB_LANGUAGES.filter((l) => l.browser).map((l) => l.id).sort().join(), "javascript,python,web");
  assert.equal(getLabLanguage("web").editor, "html");
  assert.equal(toServerLang("web"), null);
  assert.equal(toServerLang("go"), "go");
  assert.equal(hasServerRunner("web"), false);
  assert.equal(hasServerRunner("rust"), true);
});

test("language parsing accepts aliases and the Web mode", () => {
  assert.equal(parseLabLang("C++"), "cpp");
  assert.equal(parseLabLang("py"), "python");
  assert.equal(parseLabLang("HTML"), "web");
  assert.equal(parseLabLang("web"), "web");
  assert.equal(parseLabLang("cobol"), null);
  assert.equal(parseLabLang(undefined), null);
  assert.equal(fromRunnerLang("js"), "javascript");
  assert.equal(fromRunnerLang("python"), "python");
  assert.equal(fromRunnerLang("web"), "web");
});

test("only stock templates and blank editors count as untouched", () => {
  for (const l of LAB_LANGUAGES) assert.ok(isUntouchedTemplate(l.hello), l.id);
  assert.ok(isUntouchedTemplate(""));
  assert.ok(isUntouchedTemplate("  \n\n"));
  assert.ok(isUntouchedTemplate(getLabLanguage("python").hello.replace(/\n/g, "\r\n")));
  assert.ok(!isUntouchedTemplate(`${getLabLanguage("python").hello}print("more")\n`));
});

test("switching language: an untouched template is swapped for the target's template", () => {
  const plan = planLanguageSwitch({ currentCode: getLabLanguage("python").hello, currentStdin: "", target: "go" });
  assert.equal(plan.source, "template");
  assert.equal(plan.code, getLabLanguage("go").hello);
});

test("switching language never destroys edits", () => {
  const edited = 'print("my work")\nx = 1\n';
  const carried = planLanguageSwitch({ currentCode: edited, currentStdin: "5", target: "ruby" });
  assert.deepEqual(carried, { code: edited, stdin: "5", source: "carried" });

  const draft = { code: "puts 'saved'\nputs 2\n", stdin: "9" };
  const loaded = planLanguageSwitch({ currentCode: edited, currentStdin: "5", target: "ruby", targetDraft: draft });
  assert.deepEqual(loaded, { code: draft.code, stdin: "9", source: "draft" });
});

test("switching from a template restores the target's own edited draft, but ignores an untouched one", () => {
  const draft = { code: "console.log(1 + 1);\n", stdin: "a" };
  const plan = planLanguageSwitch({ currentCode: getLabLanguage("python").hello, currentStdin: "", target: "javascript", targetDraft: draft });
  assert.equal(plan.source, "draft");
  const stale = { code: getLabLanguage("javascript").hello, stdin: "keep" };
  const plan2 = planLanguageSwitch({ currentCode: getLabLanguage("python").hello, currentStdin: "", target: "javascript", targetDraft: stale });
  assert.equal(plan2.source, "template");
  assert.equal(plan2.stdin, "keep");
});

const ready = (byLang: AvailabilityMap["byLang"], runner: AvailabilityMap["runner"] = "up"): AvailabilityMap => ({ state: "ready", runner, byLang });

test("run target: Web always runs in the browser", () => {
  for (const signedIn of [true, false]) {
    assert.equal(decideRunTarget({ lang: "web", signedIn, preferBrowser: false, availability: ready({}) }), "browser");
  }
});

test("run target: guests run JS/Python locally and are asked to sign in for the rest", () => {
  const a = ready({});
  assert.equal(decideRunTarget({ lang: "python", signedIn: false, preferBrowser: false, availability: a }), "browser");
  assert.equal(decideRunTarget({ lang: "javascript", signedIn: false, preferBrowser: false, availability: a }), "browser");
  assert.equal(decideRunTarget({ lang: "rust", signedIn: false, preferBrowser: false, availability: a }), "signin");
});

test("run target: signed-in users use the server, with the browser as preference or fallback", () => {
  assert.equal(decideRunTarget({ lang: "python", signedIn: true, preferBrowser: false, availability: ready({ python: true }) }), "server");
  assert.equal(decideRunTarget({ lang: "python", signedIn: true, preferBrowser: true, availability: ready({ python: true }) }), "browser");
  assert.equal(decideRunTarget({ lang: "python", signedIn: true, preferBrowser: false, availability: ready({ python: false }) }), "browser");
  assert.equal(decideRunTarget({ lang: "javascript", signedIn: true, preferBrowser: false, availability: ready({}, "down") }), "browser");
  assert.equal(decideRunTarget({ lang: "rust", signedIn: true, preferBrowser: false, availability: ready({ rust: false }) }), "unavailable");
  assert.equal(decideRunTarget({ lang: "rust", signedIn: true, preferBrowser: false, availability: ready({}, "unconfigured") }), "unavailable");
});

test("run target: unknown availability lets the server decide", () => {
  assert.equal(serverCanRun("rust", UNKNOWN_AVAILABILITY), true);
  assert.equal(serverCanRun("rust", { state: "failed", byLang: {} }), true);
  assert.equal(decideRunTarget({ lang: "rust", signedIn: true, preferBrowser: false, availability: UNKNOWN_AVAILABILITY }), "server");
});
