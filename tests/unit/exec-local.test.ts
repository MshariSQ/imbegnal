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
