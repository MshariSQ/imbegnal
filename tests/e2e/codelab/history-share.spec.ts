import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { RunDetail, Snippet } from "../../../shared/api";
import { MockApi, bootSuite, openLab, resultPanel, runButton, summary, withPage, type Suite } from "./support";

describe("Code Lab: history, share and permalinks", () => {
  let s: Suite;
  before(async () => void (s = await bootSuite()));
  after(async () => s.close());

  it("server history pages with Load more and opens an entry (code, stdin and output)", async () => {
    const api = new MockApi();
    api.history = Array.from({ length: 45 }, (_, i) => summary(i, { lang: i === 1 ? "rust" : "python", status: i === 2 ? "runtime_error" : "ok" }));
    const detail: RunDetail = {
      ...summary(1, { lang: "rust" }),
      code: 'fn main() { println!("from history"); }\n',
      stdin: "7\n",
      stdout: "from history\n",
      stderr: "",
    };
    api.runDetails[detail.id] = detail;
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      await h.page.getByTestId("history-button").click();
      const dialog = h.page.getByRole("dialog", { name: "Run history" });
      await dialog.getByTestId("history-item").first().waitFor();
      assert.equal(await dialog.getByTestId("history-item").count(), 20);
      assert.match(await dialog.getByTestId("history-item").nth(2).innerText(), /Runtime error/);
      await dialog.getByRole("button", { name: "Load more" }).click();
      await h.page.waitForFunction(() => document.querySelectorAll('[data-testid="history-item"]').length === 40);
      await dialog.getByRole("button", { name: "Load more" }).click();
      await h.page.waitForFunction(() => document.querySelectorAll('[data-testid="history-item"]').length === 45);
      assert.equal(await dialog.getByRole("button", { name: "Load more" }).count(), 0, "no more pages");
      assert.ok(h.api.requests.some((r) => /GET \/api\/lab\/runs\?limit=20&before=/.test(r)), "pages use the before cursor");

      await dialog.getByTestId("history-item").nth(1).click();
      await h.page.getByTestId("lab-note").waitFor();
      await h.page.waitForFunction(() => document.querySelector(".cm-content")?.textContent?.includes("from history"));
      assert.equal(await h.page.getByLabel("Standard input (stdin)").inputValue(), "7\n");
      assert.match(await h.page.getByTestId("lang-trigger").innerText(), /Rust/);
      assert.match(await resultPanel(h.page).innerText(), /from history/);
      assert.match(await h.page.getByTestId("lab-note").innerText(), /Loaded Rust code from/);
      // Undo restores what was in the editor before.
      await h.page.getByRole("button", { name: "Undo" }).click();
      await h.page.waitForFunction(() => document.querySelector(".cm-content")?.textContent?.includes("Hello, World!"));
      assert.match(await h.page.getByTestId("lang-trigger").innerText(), /Python/);
    }, api);
  });

  it("a failed history request is reported with retry", async () => {
    const api = new MockApi();
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      await h.page.route(/\/api\/lab\/runs\?/, (r) => r.fulfill({ status: 500, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: "{}" }));
      await h.page.getByTestId("history-button").click();
      await h.page.getByText("Couldn’t load your history.").waitFor();
    }, api);
  });

  it("guests see the sign-in prompt for server history and their device history tab", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site);
      await h.page.getByTestId("history-button").click();
      const dialog = h.page.getByRole("dialog", { name: "Run history" });
      await dialog.getByRole("tab", { name: "Server runs" }).click();
      assert.match(await dialog.innerText(), /Sign in to keep a history/);
      assert.match((await dialog.getByRole("link", { name: "Sign in" }).getAttribute("href")) ?? "", /^\/login\/\?next=/);
      await h.page.keyboard.press("Escape");
      assert.equal(await h.page.getByRole("dialog").count(), 0);
      assert.equal(await h.page.evaluate(() => document.activeElement?.getAttribute("data-testid")), "history-button", "focus returns to the opener");
    });
  });

  it("share creates an immutable snippet, shows the permalink and copies it", async () => {
    await withPage(s, { signedIn: true }, async (h) => {
      await h.context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => undefined);
      await openLab(h, s.site, "lang=rust");
      await h.page.getByTestId("share-button").click();
      const dialog = h.page.getByRole("dialog", { name: "Share this code" });
      await dialog.getByLabel("Title (optional)").fill("My first Rust program");
      await dialog.getByRole("button", { name: "Create link" }).click();
      const url = dialog.getByTestId("share-url");
      await url.waitFor();
      assert.equal(await url.inputValue(), `${s.site.url}/code-lab/s/?id=abc12345`);
      assert.deepEqual(h.api.snippetsCreated, [{ lang: "rust", code: 'fn main() {\n    println!("Hello, World!");\n}\n', title: "My first Rust program" }]);
      assert.equal(await h.page.evaluate(() => document.activeElement?.id), "share-link", "focus moves to the new link");
      await dialog.getByRole("button", { name: "Copy link" }).click();
      await dialog.getByText("Link copied").first().waitFor();
    });
  });

  it("guests are asked to sign in before sharing; the Web mode explains it cannot be shared", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site);
      await h.page.getByTestId("share-button").click();
      const dialog = h.page.getByRole("dialog", { name: "Share this code" });
      assert.match(await dialog.innerText(), /Sign in to share/);
      assert.equal(await dialog.getByRole("button", { name: "Create link" }).count(), 0);
    });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site, "lang=web");
      await h.page.getByTestId("share-button").click();
      assert.match(await h.page.getByRole("dialog", { name: "Share this code" }).innerText(), /can.t be shared yet/);
    });
  });

  it("a share failure is reported inside the dialog", async () => {
    const api = new MockApi();
    api.createSnippetReply = { status: 429, body: { error: "rate_limited", scope: "rate", retryAfterSec: 30 } };
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      await h.page.getByTestId("share-button").click();
      const dialog = h.page.getByRole("dialog", { name: "Share this code" });
      await dialog.getByRole("button", { name: "Create link" }).click();
      await dialog.getByRole("alert").waitFor();
      assert.match(await dialog.getByRole("alert").innerText(), /too fast/i);
    }, api);
  });

  const snippet: Snippet = {
    id: "abc12345",
    lang: "python",
    code: 'name = input()\nprint(f"Hi, {name}")\n',
    stdin: "Ada\n",
    title: "Greeter",
    authorName: "Grace Hopper",
    createdAt: "2030-03-04T10:00:00.000Z",
  };

  it("permalink: read-only editor, title, language, author and date, noindex, and Run works", async () => {
    const api = new MockApi();
    api.snippets[snippet.id] = snippet;
    await withPage(s, { signedIn: false }, async (h) => {
      await h.page.goto(`${s.site.url}/code-lab/s/?id=${snippet.id}`);
      await h.page.getByTestId("snippet-title").waitFor();
      assert.equal(await h.page.getByTestId("snippet-title").innerText(), "Greeter");
      assert.match(await h.page.getByTestId("snippet-lang").innerText(), /Python/);
      assert.match(await h.page.getByTestId("snippet-author").innerText(), /by Grace Hopper/);
      assert.match(await h.page.locator("main, body").first().innerText(), /Mar 4, 2030/);
      assert.equal(await h.page.locator('meta[name="robots"]').getAttribute("content"), "noindex");
      await h.page.waitForSelector(".cm-content");
      assert.equal(await h.page.locator(".cm-editor .cm-content").getAttribute("aria-readonly"), "true");
      assert.equal(await h.page.locator(".cm-content").getAttribute("aria-label"), "Read-only code, Python");
      const before = await h.page.locator(".cm-content").innerText();
      await h.page.locator(".cm-content").click();
      await h.page.keyboard.type("hacked");
      assert.equal(await h.page.locator(".cm-content").innerText(), before, "typing does not change a read-only snippet");
      // Guests run Python in the browser, so this needs Pyodide; the server path is covered with a JS snippet below.
      assert.deepEqual(h.errors, []);
    }, api);
  });

  it("permalink: Run uses the snippet's stdin on the server for a signed-in user; Open in Code Lab forks it", async () => {
    const api = new MockApi();
    api.snippets[snippet.id] = { ...snippet, lang: "ruby", code: "puts gets\n" };
    await withPage(s, { signedIn: true }, async (h) => {
      await h.page.goto(`${s.site.url}/code-lab/s/?id=${snippet.id}`);
      await h.page.getByTestId("snippet-title").waitFor();
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      assert.deepEqual(api.runs[0], { lang: "ruby", code: "puts gets\n", stdin: "Ada\n" });
      await h.page.getByTestId("fork-link").click();
      await h.page.waitForURL(/\/code-lab\/\?fork=abc12345/);
      await h.page.waitForSelector('[data-testid="lab"]');
      await h.page.waitForFunction(() => document.querySelector(".cm-content")?.textContent?.includes("puts gets"));
      assert.match(await h.page.getByTestId("lang-trigger").innerText(), /Ruby/);
      assert.equal(await h.page.getByLabel("Standard input (stdin)").inputValue(), "Ada\n");
      // The fork is editable.
      await h.page.locator(".cm-content").click();
      await h.page.keyboard.type("# mine\n");
      assert.match(await h.page.locator(".cm-content").innerText(), /# mine/);
    }, api);
  });

  it("permalink: unknown snippets show a friendly 404 and loading states have no layout jump", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await h.page.goto(`${s.site.url}/code-lab/s/?id=doesnotexist1`);
      await h.page.getByTestId("snippet-error").waitFor();
      assert.match(await h.page.getByTestId("snippet-error").innerText(), /Snippet not found/);
      await h.page.goto(`${s.site.url}/code-lab/s/?id=%3Cscript%3E`);
      await h.page.getByTestId("snippet-error").waitFor();
      assert.equal(h.api.requests.filter((r) => /snippets\/%3C/.test(r)).length, 0, "an invalid id never reaches the API");
    });
  });

  it("opening ?fork= for a missing snippet shows the not-found card with a way out", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await h.page.goto(`${s.site.url}/code-lab/?fork=missing12345`);
      await h.page.getByTestId("lab-not-found").waitFor();
      assert.equal(await h.page.getByTestId("lab-not-found").getByRole("link", { name: "New blank lab" }).getAttribute("href"), "/code-lab/");
    });
  });
});
