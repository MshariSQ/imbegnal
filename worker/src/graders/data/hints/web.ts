import type { L10nText } from "../../../../../shared/challenges";

/**
 * SERVER-ONLY hint texts for the web (tracks: frontend, backend, ui-ux) group, keyed by challenge id.
 * Matching public meta: data/challenges/web.ts, which carries only the per-hint COST
 * (same order, same count; worker/tests/challenges/parity.test.ts enforces it). The text is
 * returned by POST /api/challenges/:id/hint after the cost is charged and must never be
 * imported by the site or copied into shared/ or data/.
 */
export const webHints: Record<string, L10nText[]> = {
  "fe-specificity-duel": [
    {
      en: "Do the first example on paper: write a triple for every selector, then compare the triples position by position.",
      ar: "حلّ المثال الأول على الورق: اكتب ثلاثية لكل محدِّد ثم قارن الثلاثيات خانة بخانة.",
    },
    {
      en: "A whole attribute selector such as `a[href=\"#top\"]` is ONE class-level item. Whatever is inside the brackets (dots, hashes) must not be counted again.",
      ar: "محدِّد السمة كاملاً مثل `a[href=\"#top\"]` عنصر واحد من مستوى الفئة. ما بداخل الأقواس (نقاط أو `#`) يجب ألا يُحسب مرة أخرى.",
    },
    {
      en: "Compare the triples as tuples (lexicographically), never by their sum, and keep the later rule when two triples are equal (`>=`).",
      ar: "قارن الثلاثيات كمجموعات مرتبة (قاموسياً) وليس بمجموعها، واحتفظ بالقاعدة اللاحقة عند التساوي (`>=`).",
    },
  ],
  "be-http-status": [
    {
      en: "Parse each line into a key/value map first, then write the rules as an `if` / `elif` chain in exactly the order of the table.",
      ar: "حوّل كل سطر إلى خريطة مفتاح/قيمة أولاً، ثم اكتب القواعد كسلسلة `if` / `elif` بنفس ترتيب الجدول تماماً.",
    },
    {
      en: "The rules for `media` and `body` apply only to POST, PUT and PATCH. A GET never answers 415, 400 or 422.",
      ar: "قاعدتا `media` و`body` تنطبقان فقط على POST وPUT وPATCH. طلب GET لا يرد أبداً بـ 415 أو 400 أو 422.",
    },
    {
      en: "Return early: as soon as a rule matches you are done, so a request that is both unauthenticated and over its rate limit answers by whichever rule comes first.",
      ar: "أنهِ الدالة مبكراً: عندما تنطبق قاعدة فقد انتهيت، لذا الطلب غير الموثّق والمتجاوز للحد معاً يُجاب بحسب القاعدة الأسبق في الجدول.",
    },
  ],
  "ux-contrast-ratio": [
    {
      en: "Write a `luminance(hex)` function first and test it by hand: white must give 1 and black must give 0.",
      ar: "اكتب دالة `luminance(hex)` أولاً واختبرها يدوياً: الأبيض يجب أن يعطي 1 والأسود يجب أن يعطي 0.",
    },
    {
      en: "The numerator uses the lighter luminance whichever colour is the text, so sort the two values with `max` and `min` instead of assuming an order. Expand `#abc` to `#aabbcc` before parsing.",
      ar: "البسط يستخدم السطوع الأكبر أياً كان لون النص، لذا رتّب القيمتين بـ`max` و`min` ولا تفترض ترتيباً. وسّع `#abc` إلى `#aabbcc` قبل التحليل.",
    },
    {
      en: "Some pairs print as `4.50` yet score 4.499…, which fails AA. Compare the exact ratio with the thresholds and round only for printing.",
      ar: "بعض الأزواج تُطبع `4.50` لكن نسبتها الفعلية 4.499… فترسب في AA. قارن النسبة الدقيقة بالحدود وقرّب فقط عند الطباعة.",
    },
  ],
  "be-jwt-expiry": [
    {
      en: "Return as soon as a rule fires and keep the order of the list: a token with a wrong issuer is `wrong_issuer` even if it is also expired.",
      ar: "أعِد النتيجة فور انطباق قاعدة وحافظ على ترتيب القائمة: الرمز ذو المُصدِر الخاطئ هو `wrong_issuer` حتى لو كان منتهياً أيضاً.",
    },
    {
      en: "Careful with types. In Python `True` is an `int` and `\"api\" in \"rapid-api\"` is `True`; check `isinstance(x, bool)` and compare strings with `==`. In JavaScript use `Number.isInteger` and `Array.isArray`.",
      ar: "انتبه إلى الأنواع. في Python القيمة `True` من النوع `int` والتعبير `\"api\" in \"rapid-api\"` يعطي `True`؛ افحص `isinstance(x, bool)` وقارن النصوص بـ`==`. وفي JavaScript استخدم `Number.isInteger` و`Array.isArray`.",
    },
    {
      en: "With leeway the token is accepted while `nbf - leeway <= now < exp + leeway`. Remember that `nbf` can simply be absent.",
      ar: "مع السماحية يُقبل الرمز ما دام `nbf - leeway <= now < exp + leeway`. وتذكّر أن `nbf` قد لا يكون موجوداً أصلاً.",
    },
  ],
  "be-rate-limiter": [
    {
      en: "Keep one small state record per client: tokens, the time of the last refill, the current window number and the count used in it. Update the refill and the window before deciding, on every request.",
      ar: "احتفظ بسجل حالة صغير لكل عميل: الرموز ووقت آخر تعبئة ورقم النافذة الحالية وما استُخدم فيها. حدّث التعبئة والنافذة قبل اتخاذ القرار، عند كل طلب.",
    },
    {
      en: "Floating point drifts: adding 0.1 ten times gives 0.9999999999999999, not 1, and that request would be wrongly denied. Count tokens in thousandths instead, so `refill` tokens per second is exactly `refill` thousandths per millisecond.",
      ar: "الأعداد العشرية تنحرف: جمع 0.1 عشر مرات يعطي 0.9999999999999999 وليس 1 فيُرفض الطلب خطأً. عُدّ الرموز بالألف من الرمز بدلاً من ذلك، فيصير معدل `refill` رمزاً في الثانية هو `refill` من ألف رمز في كل مللي ثانية بالضبط.",
    },
    {
      en: "Decide first, charge afterwards: compute whether the bucket has a token and whether the quota allows it, and only when both hold remove one token and add one to the window count. A request denied by one limit must not use up the other.",
      ar: "قرّر أولاً ثم احسب الكلفة: تحقق هل في الدلو رمز وهل الحصة تسمح، ولا تخصم رمزاً وتزد عدّاد النافذة إلا عند تحقق الشرطين معاً. الطلب المرفوض بسبب أحد الحدّين يجب ألا يستهلك الآخر.",
    },
  ],
};
