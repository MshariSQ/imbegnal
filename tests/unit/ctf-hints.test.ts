import { test } from "node:test";
import assert from "node:assert/strict";
import { awardWithHints, isL10nText, mergeRevealed, nextHintIndex, textsByIndex } from "../../lib/ctf/hints";
import type { RevealedHint } from "../../shared/api";

const T = (n: number) => ({ en: `hint ${n}`, ar: `تلميح ${n}` });

test("isL10nText accepts only a bilingual pair of strings", () => {
  assert.equal(isL10nText(T(1)), true);
  for (const bad of [null, undefined, "text", 3, {}, { en: "x" }, { ar: "x" }, { en: 1, ar: "x" }, { en: "x", ar: null }]) {
    assert.equal(isL10nText(bad), false, JSON.stringify(bad));
  }
});

test("textsByIndex keeps well-formed, in-range entries and drops the rest", () => {
  const revealed = [
    { index: 0, text: T(0) },
    { index: 2, text: T(2) },
    { index: 3, text: T(3) }, // out of range for 3 hints
    { index: -1, text: T(9) },
    { index: 1.5, text: T(9) },
    { index: 1, text: { en: "only english" } },
    null,
  ] as unknown as RevealedHint[];
  const m = textsByIndex(revealed, 3);
  assert.deepEqual([...m.keys()], [0, 2]);
  assert.deepEqual(m.get(2), T(2));
  assert.equal(textsByIndex(undefined, 3).size, 0);
});

test("nextHintIndex is the first hint whose text the learner does not hold", () => {
  assert.equal(nextHintIndex(3, new Map()), 0);
  assert.equal(nextHintIndex(3, new Map([[0, T(0)]])), 1);
  // a gap (e.g. a text that failed validation) is offered again before later ones
  assert.equal(nextHintIndex(3, new Map([[0, T(0)], [2, T(2)]])), 1);
  assert.equal(nextHintIndex(2, new Map([[0, T(0)], [1, T(1)]])), null);
  assert.equal(nextHintIndex(0, new Map()), null);
});

test("mergeRevealed adds or replaces one hint and keeps the list sorted", () => {
  const a = mergeRevealed(undefined, { index: 2, text: T(2) });
  const b = mergeRevealed(a, { index: 0, text: T(0) });
  assert.deepEqual(b.map((h) => h.index), [0, 2]);
  const c = mergeRevealed(b, { index: 2, text: { en: "new", ar: "جديد" } });
  assert.deepEqual(c.map((h) => h.index), [0, 2]);
  assert.equal(c[1].text.en, "new");
  assert.notEqual(c, b, "a new array, never a mutation");
  assert.deepEqual(b[1].text, T(2));
});

test("awardWithHints subtracts each open hint once and never goes below zero", () => {
  const hints = [{ cost: 5 }, { cost: 10 }, { cost: 20 }];
  assert.equal(awardWithHints(50, hints, []), 50);
  assert.equal(awardWithHints(50, hints, [0]), 45);
  assert.equal(awardWithHints(50, hints, [0, 2]), 25);
  assert.equal(awardWithHints(50, hints, [0, 0, 0]), 45, "duplicates count once");
  assert.equal(awardWithHints(50, hints, [7, -1]), 50, "out-of-range indexes are ignored");
  assert.equal(awardWithHints(30, hints, [0, 1, 2]), 0);
  assert.equal(awardWithHints(50, [{ cost: -5 }], [0]), 50, "a negative cost never adds points");
});
