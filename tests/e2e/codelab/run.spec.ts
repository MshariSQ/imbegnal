import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MockApi,
  FAKE_TOKEN,
  bootSuite,
  editorText,
  openLab,
  quotaInfo,
  resultPanel,
  runButton,
  runResult,
  setEditor,
  withPage,
  type Suite,
} from "./support";

describe("Code Lab: running code on the server", () => {
  let s: Suite;
  before(async () => void (s = await bootSuite()));
  after(async () => s.close());

  it("Hello World: stdout and stderr panes, status line, quota and the right request", async () => {
    const api = new MockApi();
    api.run = () => ({
      runId: "r-1",
      result: runResult({ stdout: "Hello, World!\n", stderr: "warning: deprecated\n", stderrBytes: 20, runMs: 87 }),
      quota: quotaInfo({ used: 14, remaining: 36 }),
    });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      assert.match(await editorText(h.page), /print\("Hello, World!"\)/);
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();

      const out = h.page.getByRole("region", { name: "Standard output" });
      assert.equal((await out.innerText()).trim(), "Hello, World!");
      const err = h.page.getByRole("region", { name: "Errors (stderr)" });
      assert.match(await err.innerText(), /warning: deprecated/);

      const status = h.page.getByTestId("run-status");
      assert.match(await status.innerText(), /Finished: Success · exit code 0 · run 87 ms/);
      assert.match(await h.page.getByTestId("quota").innerText(), /36 of 50 runs left today/);
      assert.match(await h.page.getByTestId("quota").innerText(), /Free plan/);

      assert.equal(api.runs.length, 1);
      assert.deepEqual(api.runs[0], { lang: "python", code: 'print("Hello, World!")\n' });
      assert.ok(api.authHeaders.includes(`Bearer ${FAKE_TOKEN}`), "the Bearer token is sent");
      assert.deepEqual(h.errors, []);
    }, api);
  });

  it("Ctrl/Cmd+Enter runs from inside the editor and keeps focus there", async () => {
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      await h.page.locator(".cm-content").click();
      await h.page.keyboard.press("ControlOrMeta+Enter");
      await resultPanel(h.page).waitFor();
      assert.equal(await h.page.evaluate(() => !!document.activeElement?.closest(".cm-editor")), true);
      assert.equal(h.api.runs.length, 1);
    });
  });

  it("stdin round trip: the input panel text is sent and its echo is shown", async () => {
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site, "lang=python");
      await h.page.getByLabel("Standard input (stdin)").fill("42\nsecond line\n");
      await setEditor(h.page, "print(input())\n");
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      assert.equal(h.api.runs[0].stdin, "42\nsecond line\n");
      assert.equal(h.api.runs[0].code, "print(input())\n");
      assert.match(await h.page.getByRole("region", { name: "Standard output" }).innerText(), /42\s+second line/);
    });
  });

  it("compile error: compiler output comes first, the program never ran", async () => {
    const api = new MockApi();
    api.run = () => ({
      runId: "r-2",
      result: runResult({
        status: "compile_error",
        exitCode: 1,
        stdout: "",
        compileOutput: "Main.java:3: error: ';' expected\n        System.out.println(\"x\")\n                                ^\n",
        compileMs: 1210,
        runMs: 0,
      }),
      quota: quotaInfo(),
    });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site, "lang=java");
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      assert.equal(await resultPanel(h.page).getAttribute("data-status"), "compile_error");
      const text = await resultPanel(h.page).innerText();
      const lower = text.toLowerCase();
      assert.ok(lower.indexOf("compiler output") >= 0 && lower.indexOf("compiler output") < lower.indexOf("standard output"), "compile output is the first section");
      assert.match(text, /error: ';' expected/);
      assert.match(text, /rejected the program/);
      assert.match(await h.page.getByTestId("run-status").innerText(), /Compile error .* compile 1\.2 s/);
      assert.equal(api.runs[0].lang, "java");
    }, api);
  });

  it("runtime error shows stderr in the error colour with the exit code badge", async () => {
    const api = new MockApi();
    api.run = () => ({
      runId: "r-3",
      result: runResult({ status: "runtime_error", exitCode: 1, stdout: "before\n", stderr: "Traceback (most recent call last):\nZeroDivisionError: division by zero\n" }),
      quota: quotaInfo(),
    });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      const err = h.page.getByRole("region", { name: "Errors (stderr)" });
      assert.match(await err.innerText(), /ZeroDivisionError/);
      // stderr uses the error colour token (red), stdout the neutral foreground.
      assert.match(await err.getAttribute("class") ?? "", /text-red-300/);
      assert.doesNotMatch(await h.page.getByRole("region", { name: "Standard output" }).getAttribute("class") ?? "", /text-red/);
      assert.match(await resultPanel(h.page).innerText(), /exit code 1/);
    }, api);
  });

  it("timeout explains the limit and what to look for; truncated output is flagged", async () => {
    const api = new MockApi();
    api.run = () => ({
      runId: "r-4",
      result: runResult({
        status: "timeout",
        exitCode: null,
        signal: "SIGKILL",
        stdout: "x\n".repeat(50),
        stdoutBytes: 500_000,
        truncated: { stdout: true, stderr: false },
        runMs: 5000,
      }),
      quota: quotaInfo(),
    });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      const text = await resultPanel(h.page).innerText();
      assert.match(text, /ran longer than 5 s/);
      assert.match(text, /infinite loop/);
      assert.match(text, /Output was cut short/);
      assert.match(text, /signal SIGKILL/);
      assert.match(await h.page.getByTestId("run-status").innerText(), /Time limit exceeded.*signal SIGKILL.*output truncated/);
    }, api);
  });

  it("Stop aborts the in-flight request and says so", async () => {
    const api = new MockApi();
    api.run = () => ({ delayMs: 20_000, body: {} });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      await runButton(h.page).click();
      await h.page.getByTestId("stop-button").first().click();
      await h.page.getByText("Stopped.").first().waitFor();
      assert.equal(await h.page.getByTestId("run-button").first().isEnabled(), true);
    }, api);
  });

  it("long lines scroll inside the output instead of widening the page", async () => {
    const api = new MockApi();
    api.run = () => ({ runId: "r-5", result: runResult({ stdout: `${"0123456789".repeat(300)}\n` }), quota: quotaInfo() });
    await withPage(s, { signedIn: true, viewport: { width: 1360, height: 900 } }, async (h) => {
      await openLab(h, s.site);
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      const m = await h.page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth }));
      assert.ok(m.doc <= m.win, `page must not scroll horizontally (${m.doc} > ${m.win})`);
      const pre = h.page.getByRole("region", { name: "Standard output" });
      assert.ok((await pre.evaluate((el) => el.scrollWidth - el.clientWidth)) > 0, "the output block scrolls");
    }, api);
  });
});
