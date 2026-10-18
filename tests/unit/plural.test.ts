/**
 * Lesson, exercise, quiz and hour counts (lib/plural.ts) use the CLDR plural form of the language.
 * Arabic: 1 and 2 take no numeral, 3-10 the plural, 11-99 the singular accusative, 100-102 the
 * singular. The career path pages are the first to show counts of 11 and more (path totals).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { translations, type Tx } from "../../lib/i18n";
import { countLabel, hoursLabel } from "../../lib/plural";

const en = translations.en as unknown as Tx;
const ar = translations.ar as unknown as Tx;

test("English: one and other", () => {
  assert.equal(countLabel(en, "lesson", 1), "1 lesson");
  assert.equal(countLabel(en, "lesson", 2), "2 lessons");
  assert.equal(countLabel(en, "lesson", 15), "15 lessons");
  assert.equal(countLabel(en, "exercise", 1), "1 exercise");
  assert.equal(countLabel(en, "quiz", 3), "3 quizzes");
  assert.equal(hoursLabel(en, 1), "~1h");
  assert.equal(hoursLabel(en, 17), "~17h");
});

test("Arabic hours: dual, 3-10 plural, 11-99 singular", () => {
  assert.equal(hoursLabel(ar, 1), "حوالي ساعة");
  assert.equal(hoursLabel(ar, 2), "حوالي ساعتين");
  assert.equal(hoursLabel(ar, 3), "حوالي 3 ساعات");
  assert.equal(hoursLabel(ar, 10), "حوالي 10 ساعات");
  assert.equal(hoursLabel(ar, 11), "حوالي 11 ساعة");
  assert.equal(hoursLabel(ar, 17), "حوالي 17 ساعة");
  assert.equal(hoursLabel(ar, 100), "حوالي 100 ساعة");
});

test("Arabic lessons, exercises and quizzes", () => {
  assert.equal(countLabel(ar, "lesson", 1), "درس واحد");
  assert.equal(countLabel(ar, "lesson", 2), "درسان");
  assert.equal(countLabel(ar, "lesson", 3), "3 دروس");
  assert.equal(countLabel(ar, "lesson", 10), "10 دروس");
  assert.equal(countLabel(ar, "lesson", 15), "15 درساً");
  assert.equal(countLabel(ar, "lesson", 29), "29 درساً");
  assert.equal(countLabel(ar, "lesson", 99), "99 درساً");
  assert.equal(countLabel(ar, "lesson", 100), "100 درس");
  assert.equal(countLabel(ar, "lesson", 103), "103 دروس");
  assert.equal(countLabel(ar, "lesson", 111), "111 درساً");
  assert.equal(countLabel(ar, "exercise", 2), "تمرينان");
  assert.equal(countLabel(ar, "exercise", 12), "12 تمريناً");
  assert.equal(countLabel(ar, "quiz", 1), "اختبار واحد");
  assert.equal(countLabel(ar, "quiz", 4), "4 اختبارات");
  assert.equal(countLabel(ar, "quiz", 11), "11 اختباراً");
});

test("no Arabic count from 11 to 99 uses the 3-10 plural, and every count shows its number from 3 on", () => {
  for (let n = 11; n <= 99; n++) {
    for (const label of [hoursLabel(ar, n), countLabel(ar, "lesson", n), countLabel(ar, "exercise", n), countLabel(ar, "quiz", n)]) {
      assert.ok(!/ساعات|دروس|تمارين|اختبارات/.test(label), `${n}: ${label}`);
      assert.ok(label.includes(String(n)), `${n}: ${label}`);
    }
  }
  for (let n = 3; n <= 10; n++) assert.equal(countLabel(ar, "lesson", n), `${n} دروس`);
});
