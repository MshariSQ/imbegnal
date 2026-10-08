// Code Lab against the REAL stack: Hello World on the Docker runner for the
// acceptance languages, separate stdout/stderr, and the share → fork flow.
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { SITE, api, closeBrowser, newUser, openSession, setEditorCode } from "./stack";
import type { SnippetCreateResponse } from "../../../shared/api";

after(closeBrowser);

const RUN_TIMEOUT = 90_000;

describe("Code Lab · real runner", () => {
  for (const lang of ["python", "javascript", "java", "c", "cpp"] as const) {
    it(`Hello World runs for ${lang} and shows stdout`, { timeout: RUN_TIMEOUT }, async () => {
      const user = await newUser(`hello-${lang}`);
      const s = await openSession(user);
      try {
        await s.page.goto(`${SITE}/code-lab/?lang=${lang}`);
        await s.page.waitForSelector(".cm-content");
        await s.page.getByTestId("run-button").first().click();
        await s.page.getByTestId("run-result").waitFor({ timeout: RUN_TIMEOUT });
        await s.page.getByTestId("run-status").filter({ hasText: /Success/ }).waitFor({ timeout: RUN_TIMEOUT });
        const out = s.page.getByRole("region", { name: "Standard output" });
        assert.equal((await out.innerText()).trim(), "Hello, World!");
        assert.match(await s.page.getByTestId("quota").innerText(), /runs left today/);
        assert.deepEqual(s.errors, []);
      } finally {
        await s.context.close();
      }
    });
  }

  it("keeps stderr separate from stdout, and a shared snippet forks into the editor", { timeout: RUN_TIMEOUT }, async () => {
    const user = await newUser("streams");
    const code = 'import sys\nprint("to stdout")\nprint("to stderr", file=sys.stderr)\n';
    const snip = await api<SnippetCreateResponse>("/api/lab/snippets", user, { body: { lang: "python", code, title: "Two streams" } });
    assert.equal(snip.status, 201, JSON.stringify(snip.body));
    const s = await openSession(user);
    try {
      // Read-only permalink first
      await s.page.goto(`${SITE}${snip.body.path}`);
      await s.page.getByTestId("snippet-title").filter({ hasText: "Two streams" }).waitFor();
      // Fork into the lab and run
      await s.page.goto(`${SITE}/code-lab/?fork=${snip.body.id}`);
      await s.page.waitForFunction(() => document.querySelector(".cm-content")?.textContent?.includes("to stderr"));
      await s.page.getByTestId("run-button").first().click();
      await s.page.getByTestId("run-status").filter({ hasText: /Success/ }).waitFor({ timeout: RUN_TIMEOUT });
      assert.equal((await s.page.getByRole("region", { name: "Standard output" }).innerText()).trim(), "to stdout");
      assert.match(await s.page.getByRole("region", { name: "Errors (stderr)" }).innerText(), /to stderr/);
      assert.deepEqual(s.errors, []);
    } finally {
      await s.context.close();
    }
  });

  it("an infinite loop is killed and explained in the UI", { timeout: RUN_TIMEOUT }, async () => {
    const user = await newUser("loop");
    const s = await openSession(user);
    try {
      await s.page.goto(`${SITE}/code-lab/?lang=python`);
      await setEditorCode(s.page, "while True:\n    pass\n");
      const t0 = Date.now();
      await s.page.getByTestId("run-button").first().click();
      await s.page.getByTestId("run-status").filter({ hasText: /Time limit exceeded/ }).waitFor({ timeout: RUN_TIMEOUT });
      assert.ok(Date.now() - t0 < 20_000, "killed close to the 5 s limit, not left running");
    } finally {
      await s.context.close();
    }
  });
});
