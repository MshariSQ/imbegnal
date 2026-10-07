import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { bootSuite, hasPyodide, openLab, resultPanel, runButton, setEditor, withPage, type Suite } from "./support";

/**
 * These run for real in the browser: no run endpoint is mocked and none must be called.
 * Python needs Pyodide, which the sandbox cannot fetch from the CDN: set PYODIDE_DIR
 * (an unpacked `pyodide@0.26.4` npm package) to enable it, see README.md.
 */
describe("Code Lab: in-browser runners (guests, offline fallback)", () => {
  let s: Suite;
  before(async () => void (s = await bootSuite()));
  after(async () => s.close());

  it("JavaScript: console output, stderr, stdin and no server round trip", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site, "lang=javascript");
      await setEditor(
        h.page,
        'const name = require("fs").readFileSync(0, "utf8").trim();\nconsole.log("Hello, " + name + "!");\nconsole.error("a warning");\n'
      );
      await h.page.getByLabel("Standard input (stdin)").fill("Ada\n");
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      const t = await resultPanel(h.page).innerText();
      assert.match(t, /Hello, Ada!/);
      assert.match(t, /a warning/);
      assert.match(t, /Runs in your browser/);
      assert.match(await h.page.getByTestId("run-status").innerText(), /Finished: Success · exit code 0/);
      assert.equal(h.api.runs.length, 0);
      assert.deepEqual(h.errors, []);
    });
  });

  it("JavaScript: an uncaught error is a runtime error with its line highlighted", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site, "lang=javascript");
      await setEditor(h.page, 'console.log("start");\n\nnull.boom;\n');
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      assert.equal(await resultPanel(h.page).getAttribute("data-status"), "runtime_error");
      assert.match(await resultPanel(h.page).innerText(), /Error on line 3/);
      assert.equal(await h.page.locator(".cm-imb-error-line").count(), 1);
      // Editing clears the stale marker.
      await h.page.locator(".cm-content").click();
      await h.page.keyboard.type("x");
      assert.equal(await h.page.locator(".cm-imb-error-line").count(), 0);
    });
  });

  it("JavaScript: an infinite loop is killed by the hard timeout and the page stays responsive", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site, "lang=javascript");
      await setEditor(h.page, "while (true) {}\n");
      const t0 = Date.now();
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor({ timeout: 15_000 });
      assert.equal(await resultPanel(h.page).getAttribute("data-status"), "timeout");
      assert.ok(Date.now() - t0 < 12_000);
      assert.match(await resultPanel(h.page).innerText(), /ran longer than 5 s/);
      // The tab did not freeze: the editor still accepts typing and Run works again.
      await setEditor(h.page, 'console.log("alive");\n');
      await runButton(h.page).click();
      await h.page.getByText("alive").waitFor();
    });
  });

  it("JavaScript: a print flood is cut off and flagged", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site, "lang=javascript");
      await setEditor(h.page, 'for (let i = 0; i < 1e7; i++) console.log("flood line number " + i);\n');
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor({ timeout: 15_000 });
      assert.match(await resultPanel(h.page).getAttribute("data-status") ?? "", /output_limit|timeout/);
      assert.match(await h.page.getByTestId("run-status").innerText(), /output truncated/);
    });
  });

  it("Web: renders in a sandboxed iframe with script-only permissions and captures the console", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site, "lang=web");
      assert.equal(await h.page.getByTestId("filename").innerText(), "index.html");
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      const frame = h.page.locator('iframe[title="Preview"]');
      assert.equal(await frame.getAttribute("sandbox"), "allow-scripts", "no same-origin, no popups, no forms");
      assert.match((await frame.getAttribute("srcdoc")) ?? "", /Content-Security-Policy/);
      const inner = h.page.frameLocator('iframe[title="Preview"]');
      assert.equal(await inner.locator("#greeting").innerText(), "Hello, World!");
      assert.match(await resultPanel(h.page).innerText(), /Hello, World!/, "console.log is mirrored into the Console section");
      assert.equal(h.api.runs.length, 0);
    });
  });

  it("Web: the preview cannot read the site's storage or reach the network", async () => {
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site, "lang=web");
      await setEditor(
        h.page,
        `<!doctype html><html><head></head><body><script>
let storage = "ok";
try { storage = String(localStorage.getItem("sf_token")); } catch (e) { storage = "blocked:" + e.name; }
console.log("storage=" + storage);
fetch("https://example.com/x").then(() => console.log("net=open"), () => console.log("net=blocked"));
console.log("parent=" + (function(){ try { return typeof parent.document; } catch (e) { return "blocked:" + e.name; } })());
</script></body></html>`
      );
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      await h.page.waitForFunction(() => /net=/.test(document.querySelector('[data-testid="run-result"]')?.textContent ?? ""), null, { timeout: 8000 });
      const t = await resultPanel(h.page).innerText();
      assert.match(t, /storage=blocked:SecurityError/);
      assert.match(t, /net=blocked/);
      assert.match(t, /parent=blocked:SecurityError/);
    });
  });

  it("Web: a script error is reported with its line number", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site, "lang=web");
      await setEditor(h.page, "<!doctype html>\n<html>\n<head></head>\n<body>\n<script>\nundefinedFunction();\n</script>\n</body>\n</html>\n");
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      assert.match(await resultPanel(h.page).innerText(), /Line 6: .*undefinedFunction/);
      assert.match(await resultPanel(h.page).innerText(), /Error on line 6/);
    });
  });

  it("Web: a script that never yields is stopped by the watchdog", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site, "lang=web");
      await setEditor(h.page, "<!doctype html><html><head></head><body><script>while(true){}</script></body></html>");
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor({ timeout: 20_000 });
      assert.equal(await resultPanel(h.page).getAttribute("data-status"), "timeout");
      // Whichever fires first (the parent watchdog or the in-page loop guard), the learner gets the timeout explanation.
      assert.match(await resultPanel(h.page).innerText(), /longer than 5 s and was stopped/);
      // The page did not freeze: the next run works.
      await setEditor(h.page, '<script>console.log("alive")</script>');
      await runButton(h.page).click();
      await h.page.getByText("alive").first().waitFor();
    });
  });

  it("Web: the in-page loop guard alone stops a runaway loop (no parent watchdog involved)", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site, "lang=web");
      // The loop starts well after the run finished ("done" follows the load event), so the parent's watchdog is
      // already cleared: in a browser that keeps the frame on the page's thread this used to freeze the tab for good.
      await setEditor(
        h.page,
        [
          "<!doctype html><html><head></head><body>",
          '<p id="out">waiting</p>',
          "<script>",
          'window.addEventListener("load", function () {',
          "  setTimeout(function () {",
          "    var started = Date.now(), spins = 0;",
          "    try { while (true) { spins++; } }",
          '    catch (e) { document.getElementById("out").textContent = e.name + " after " + Math.round((Date.now() - started) / 1000) + " s: " + e.message; }',
          "  }, 500);",
          "});",
          "</script>",
          "</body></html>",
        ].join("\n")
      );
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      assert.equal(await resultPanel(h.page).getAttribute("data-status"), "ok", "the run itself finished normally");
      const out = h.page.frameLocator('iframe[title="Preview"]').locator("#out");
      await out.filter({ hasText: /RangeError/ }).waitFor({ timeout: 20_000 });
      assert.match(await out.innerText(), /^RangeError after 5 s: Code Lab stopped a loop that ran longer than 5 s \(line 7\)$/);
      // The tab stayed usable: the editor still takes a new program and runs it.
      await setEditor(h.page, '<script>console.log("still alive")</script>');
      await runButton(h.page).click();
      await h.page.getByText("still alive").first().waitFor();
    });
  });

  it("guest history: the last browser runs are kept on this device and can be reopened and cleared", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site, "lang=javascript");
      for (const n of [1, 2]) {
        await setEditor(h.page, `console.log("run number ${n}");\n`);
        await runButton(h.page).click();
        await h.page.getByText(`run number ${n}`).first().waitFor();
      }
      await h.page.getByTestId("history-button").click();
      const dialog = h.page.getByRole("dialog", { name: "Run history" });
      await dialog.getByText("Browser runs are stored only on this device").waitFor();
      assert.equal(await dialog.getByTestId("history-item").count(), 2);
      await dialog.getByTestId("history-item").nth(1).click();
      await h.page.getByTestId("lab-note").waitFor();
      await h.page.waitForFunction(() => document.querySelector(".cm-content")?.textContent?.includes("run number 1"));
      await h.page.getByTestId("history-button").click();
      await h.page.getByRole("button", { name: "Clear local history" }).click();
      assert.match(await h.page.getByRole("dialog").innerText(), /No browser runs yet/);
      assert.equal(await h.page.evaluate(() => localStorage.getItem("imb-codelab-history-v1")), null);
    });
  });

  it("Python (Pyodide): stdout, stderr, stdin, exit code and traceback line", { skip: !hasPyodide() && "set PYODIDE_DIR to a local pyodide@0.26.4 install" }, async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site, "lang=python");
      await setEditor(h.page, 'import sys\nname = input()\nprint("Hello,", name)\nprint("to stderr", file=sys.stderr)\n');
      await h.page.getByLabel("Standard input (stdin)").fill("Grace\n");
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor({ timeout: 90_000 });
      const t = await resultPanel(h.page).innerText();
      assert.match(t, /Hello, Grace/);
      assert.match(await h.page.getByRole("region", { name: "Errors (stderr)" }).innerText(), /to stderr/);
      assert.equal(await resultPanel(h.page).getAttribute("data-status"), "ok");

      await setEditor(h.page, 'print("one")\nprint(1 / 0)\n');
      await runButton(h.page).click();
      await h.page.waitForFunction(() => document.querySelector('[data-testid="run-result"]')?.getAttribute("data-status") === "runtime_error", null, { timeout: 30_000 });
      assert.match(await resultPanel(h.page).innerText(), /ZeroDivisionError/);
      assert.match(await resultPanel(h.page).innerText(), /Error on line 2/);

      await setEditor(h.page, 'print("unterminated\n');
      await runButton(h.page).click();
      await h.page.waitForFunction(() => document.querySelector('[data-testid="run-result"]')?.getAttribute("data-status") === "compile_error", null, { timeout: 30_000 });
      assert.match((await resultPanel(h.page).innerText()).toLowerCase(), /compiler output/);
      assert.equal(h.api.runs.length, 0);
    });
  });

  it("Python (Pyodide): an infinite loop is terminated and the next run works", { skip: !hasPyodide() && "set PYODIDE_DIR to a local pyodide@0.26.4 install" }, async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site, "lang=python");
      await setEditor(h.page, "while True:\n    pass\n");
      await runButton(h.page).click();
      await h.page.waitForFunction(() => document.querySelector('[data-testid="run-result"]')?.getAttribute("data-status") === "timeout", null, { timeout: 60_000 });
      await setEditor(h.page, 'print("recovered")\n');
      await runButton(h.page).click();
      await h.page.getByText("recovered").first().waitFor({ timeout: 60_000 });
    });
  });
});
