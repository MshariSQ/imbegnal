import { test } from "node:test";
import assert from "node:assert/strict";
import { matchOutput } from "../../shared/match";

test("trim ignores trailing whitespace and CRLF", () => {
  assert.ok(matchOutput("42\r\n", "42"));
  assert.ok(matchOutput("a\nb\n\n", "a\nb"));
  assert.ok(!matchOutput("a\nb", "a\nc"));
});
test("exact is strict", () => {
  assert.ok(matchOutput("x\n", "x\n", "exact"));
  assert.ok(!matchOutput("x", "x\n", "exact"));
});
test("lines ignores per-line trailing spaces", () => {
  assert.ok(matchOutput("a  \nb\t\n\n", "a\nb", "lines"));
  assert.ok(!matchOutput("a\n\nb", "a\nb", "lines"));
});
test("contains and regex", () => {
  assert.ok(matchOutput("flag is IMB{x}\n", "IMB{x}", "contains"));
  assert.ok(matchOutput("answer: 17", "^answer: \\d+$", "regex"));
  assert.ok(!matchOutput("answer: x", "^answer: \\d+$", "regex"));
  assert.ok(!matchOutput("x", "(", "regex")); // invalid regex never passes
});
test("float tolerance", () => {
  assert.ok(matchOutput("3.14159 2.0", "3.14160 2", "float", 1e-4));
  assert.ok(!matchOutput("3.2", "3.1", "float", 1e-4));
  assert.ok(matchOutput("ok 1.0", "ok 1", "float"));
  assert.ok(!matchOutput("no 1.0", "ok 1", "float"));
});
test("huge outputs never match", () => {
  assert.ok(!matchOutput("a".repeat(300_000), "a"));
});
