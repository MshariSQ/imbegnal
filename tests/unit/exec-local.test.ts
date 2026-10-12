import { test } from "node:test";
import assert from "node:assert/strict";
import { LANGUAGES } from "../../shared/languages";
import { localSupports, runLocal } from "../helpers/exec-local";

// Every language's Hello World template must print "Hello, World!" with the host toolchain
// (skipped per language when the toolchain is not installed on this machine).
for (const l of LANGUAGES) {
  test(`hello world template runs: ${l.id}`, { skip: !localSupports(l.id) }, () => {
    const r = runLocal(l.id, l.hello);
    assert.equal(r.exitCode, 0, r.stderr);
    assert.equal(r.stdout.trim(), "Hello, World!");
  });
}

// Java runs compiled classes (javac once per source, then `java -cp`), like the runner, so the case time
// limit covers the run only. Single-file source-launch mode compiled in memory inside every case's limit,
// about 1 CPU-second each, and a correct reference solution timed out on a loaded machine.
test("java: the program runs from javac output, not from the source launcher", { skip: !localSupports("java") }, () => {
  const code = 'package demo;\npublic class Streak { public static void main(String[] a) { System.out.println(Streak.class.getResource("Streak.class")); } }';
  const first = runLocal("java", code);
  assert.equal(first.exitCode, 0, first.stderr);
  assert.match(first.stdout.trim(), /^file:.*\/demo\/Streak\.class$/);
  const again = runLocal("java", code);
  assert.equal(again.stdout, first.stdout, "the second case reuses the same build");
});
