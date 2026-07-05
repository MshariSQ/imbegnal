import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "frontend-testing",
  title: { en: "Testing & Performance — Ship with Confidence", ar: "الاختبار والأداء — انشر بثقة" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What automated tests actually are (you'll write a tiny test tool yourself)
- The testing pyramid every team talks about
- Core Web Vitals — the 3 numbers Google grades your site with

Fun fact: every exercise you've passed in this course was checked by automated tests. Today you look behind the curtain.`,
        ar: `## ماذا ستتعلم

- ما هي الاختبارات الآلية فعلياً (ستكتب أداة اختبار مصغّرة بنفسك)
- هرم الاختبارات الذي تتحدث عنه كل الفرق
- مؤشرات الويب الأساسية — الأرقام الثلاثة التي تقيّم بها Google موقعك

معلومة ممتعة: كل تمرين اجتزته في هذه الدورة صُحّح باختبارات آلية. اليوم تنظر خلف الستار.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The taste-tester 👨‍🍳

Imagine a restaurant where, after **every** change to **any** recipe, a robot instantly tastes **every** dish and yells if something went bad. You'd never accidentally ruin the soup by changing the salt jar.

That's automated testing. A **test** is just code that:

1. Runs your function with known inputs
2. Compares the result to what it *should* be
3. Screams if they don't match

\`\`\`js
// the function
function add(a, b) { return a + b; }

// the test
if (add(2, 3) !== 5) {
  throw new Error("add is broken!");
}
\`\`\`

Real projects use a test runner like **Jest** or **Vitest** — same idea with nicer tools:

\`\`\`js
test("adds two numbers", () => {
  expect(add(2, 3)).toBe(5);
});
\`\`\`

**The pyramid:** many fast *unit tests* (one function), some *integration tests* (parts working together), few *end-to-end tests* (robot clicks through the real site). Why tests matter for YOUR career: they're what lets teams change code without fear — and interviewers ask about them.`,
        ar: `## متذوّق الطعام 👨‍🍳

تخيّل مطعماً فيه روبوت، بعد **كل** تعديل على **أي** وصفة، يتذوق فوراً **كل** الأطباق ويصرخ إن فسد شيء. لن تفسد الشوربة أبداً بالخطأ عند تغيير وعاء الملح.

هذا هو الاختبار الآلي. **الاختبار** مجرد كود:

1. يشغّل دالتك بمدخلات معروفة
2. يقارن الناتج بما *يجب* أن يكون
3. يصرخ إن لم يتطابقا

\`\`\`js
// الدالة
function add(a, b) { return a + b; }

// الاختبار
if (add(2, 3) !== 5) {
  throw new Error("add is broken!");
}
\`\`\`

المشاريع الحقيقية تستخدم مشغّل اختبارات مثل **Jest** أو **Vitest** — نفس الفكرة بأدوات أجمل:

\`\`\`js
test("adds two numbers", () => {
  expect(add(2, 3)).toBe(5);
});
\`\`\`

**الهرم:** كثير من *اختبارات الوحدة* السريعة (دالة واحدة)، بعض *اختبارات التكامل* (أجزاء تعمل معاً)، قليل من *اختبارات النهاية إلى النهاية* (روبوت ينقر في الموقع الحقيقي). ولماذا تهم الاختبارات مسيرتك؟ لأنها ما يسمح للفرق بتغيير الكود دون خوف — والمقابلات تسأل عنها.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `**Build your own test tool!** Write a function \`expectEqual(actual, expected)\` that:
1. Prints \`"PASS"\` with console.log when they are equal (\`===\`)
2. Prints \`"FAIL expected <expected> got <actual>"\` when they differ

Then use it to test the provided \`multiply\` function — one passing case and one deliberately failing case are already written for you.`,
        ar: `**ابنِ أداة اختبارك الخاصة!** اكتب دالة \`expectEqual(actual, expected)\`:
1. تطبع \`"PASS"\` بـ console.log عند تساويهما (\`===\`)
2. تطبع \`"FAIL expected <expected> got <actual>"\` عند اختلافهما

ثم استخدمها لاختبار دالة \`multiply\` المرفقة — حالة ناجحة وحالة فاشلة عمداً مكتوبتان لك مسبقاً.`,
      },
      starterCode: `function multiply(a, b) {
  return a * b;
}

function expectEqual(actual, expected) {
  // print "PASS" or "FAIL expected <expected> got <actual>"

}

// try your tool:
expectEqual(multiply(2, 3), 6);    // should print PASS
expectEqual(multiply(2, 2), 5);    // should print FAIL expected 5 got 4`,
      solution: `function multiply(a, b) {
  return a * b;
}

function expectEqual(actual, expected) {
  if (actual === expected) {
    console.log("PASS");
  } else {
    console.log("FAIL expected " + expected + " got " + actual);
  }
}

expectEqual(multiply(2, 3), 6);    // PASS
expectEqual(multiply(2, 2), 5);    // FAIL expected 5 got 4`,
      hints: [
        { en: `Skeleton: \`if (actual === expected) { console.log("PASS"); } else { ... }\``, ar: `الهيكل: \`if (actual === expected) { console.log("PASS"); } else { ... }\`` },
        { en: `Build the FAIL text with +: \`"FAIL expected " + expected + " got " + actual\``, ar: `ابنِ نص FAIL بعلامة +: \`"FAIL expected " + expected + " got " + actual\`` },
      ],
      tests: [
        {
          name: { en: "expectEqual exists", ar: "expectEqual موجودة" },
          check: `typeof expectEqual === "function"`,
        },
        {
          name: { en: "Equal values print PASS", ar: "القيم المتساوية تطبع PASS" },
          check: `window.__consoleLog.some(function(l){ return l.indexOf("PASS") !== -1; })`,
        },
        {
          name: { en: "Different values print FAIL with both numbers", ar: "القيم المختلفة تطبع FAIL مع الرقمين" },
          check: `window.__consoleLog.some(function(l){ return l.indexOf("FAIL") !== -1 && l.indexOf("5") !== -1 && l.indexOf("4") !== -1; })`,
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Performance — Core Web Vitals ⚡

Google measures every site with three numbers (they affect your search ranking!):

- **LCP** (Largest Contentful Paint) — how fast the main content appears. Target: **< 2.5s**
- **INP** (Interaction to Next Paint) — how fast the page reacts to clicks. Target: **< 200ms**
- **CLS** (Cumulative Layout Shift) — does content jump around while loading? Target: **< 0.1**

Check any site now: open Chrome DevTools (F12) → **Lighthouse** tab → Analyze. You get a 0–100 score and a fix-list.

The usual junior-level wins: compress/resize images (biggest one by far), set width/height on images (kills CLS), lazy-load below-the-fold content, and ship less JavaScript.`,
        ar: `## الأداء — مؤشرات الويب الأساسية ⚡

تقيس Google كل موقع بثلاثة أرقام (وتؤثر على ترتيبك في البحث!):

- **LCP** — سرعة ظهور المحتوى الرئيسي. الهدف: **أقل من 2.5 ثانية**
- **INP** — سرعة استجابة الصفحة للنقرات. الهدف: **أقل من 200 مللي ثانية**
- **CLS** — هل يقفز المحتوى أثناء التحميل؟ الهدف: **أقل من 0.1**

افحص أي موقع الآن: افتح أدوات مطوّر كروم (F12) ← تبويب **Lighthouse** ← Analyze. تحصل على درجة من 100 وقائمة إصلاحات.

المكاسب المعتادة لمستوى المبتدئ: ضغط الصور وتصغيرها (الأكبر أثراً بلا منازع)، تحديد width/height للصور (يقتل CLS)، التحميل الكسول لما تحت الطية، وتقليل JavaScript المُرسل.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a unit test?", ar: "ما هو اختبار الوحدة (unit test)؟" },
          choices: [
            { en: "A test of one small piece (like one function) in isolation", ar: "اختبار جزء صغير واحد (كدالة واحدة) بمعزل" },
            { en: "Testing the whole site by hand", ar: "اختبار الموقع كاملاً يدوياً" },
            { en: "A speed measurement", ar: "قياس للسرعة" },
          ],
          answer: 0,
          explain: {
            en: "Unit tests are the pyramid's wide base: tiny, isolated, lightning fast — you run hundreds on every save.",
            ar: "اختبارات الوحدة قاعدة الهرم العريضة: صغيرة، معزولة، سريعة كالبرق — تشغّل المئات مع كل حفظ.",
          },
        },
        {
          q: { en: "expect(add(2,3)).toBe(5) — what happens if add returns 6?", ar: "expect(add(2,3)).toBe(5) — ماذا يحدث لو أعادت add القيمة 6؟" },
          choices: [
            { en: "Nothing, tests never fail", ar: "لا شيء، الاختبارات لا تفشل" },
            { en: "The test fails and the runner reports exactly what differed", ar: "يفشل الاختبار ويبلّغ المشغّل بما اختلف بالضبط" },
            { en: "The browser crashes", ar: "ينهار المتصفح" },
          ],
          answer: 1,
          explain: {
            en: "Exactly like your expectEqual: compare, and report loudly on mismatch. Failing tests block broken code from shipping.",
            ar: "تماماً مثل expectEqual التي كتبتها: قارن وأبلغ بوضوح عند الاختلاف. الاختبارات الفاشلة تمنع وصول الكود المكسور للنشر.",
          },
        },
        {
          q: { en: "Your page's images pop in and push the text down while loading. Which vital suffers?", ar: "صور صفحتك تظهر فجأة وتدفع النص للأسفل أثناء التحميل. أي مؤشر يتضرر؟" },
          choices: [
            { en: "LCP", ar: "LCP" },
            { en: "INP", ar: "INP" },
            { en: "CLS", ar: "CLS" },
          ],
          answer: 2,
          explain: {
            en: "CLS = layout shift. Fix: always give images width and height (or aspect-ratio) so the space is reserved before they load.",
            ar: "CLS = انزياح التخطيط. الحل: أعطِ الصور دائماً width و height (أو aspect-ratio) ليُحجز مكانها قبل تحميلها.",
          },
        },
        {
          q: { en: "Where do you run a quick performance audit?", ar: "أين تجري فحص أداء سريعاً؟" },
          choices: [
            { en: "Chrome DevTools → Lighthouse", ar: "أدوات مطور كروم ← Lighthouse" },
            { en: "The terminal only", ar: "الطرفية فقط" },
            { en: "You must pay for a service", ar: "يجب الدفع لخدمة خارجية" },
          ],
          answer: 0,
          explain: {
            en: "Lighthouse is free, built into Chrome (F12), and gives scores plus concrete fixes. web.dev/measure works too.",
            ar: "Lighthouse مجاني ومدمج في كروم (F12) ويعطي درجات وإصلاحات ملموسة. ويعمل web.dev/measure أيضاً.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Tests = robot taste-testers; you built expectEqual, the seed of Jest's expect().toBe()
- Pyramid: many unit, some integration, few end-to-end
- Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1 — audit with Lighthouse

**Next step on your machine:** \`npm create vite@latest\`, add Vitest, and write 3 real tests for the add and safeAdd functions from earlier lessons. Then Lighthouse-audit your Next.js site and fix the top finding.`,
        ar: `## الخلاصة

- الاختبارات = متذوّقون آليون؛ بنيت expectEqual، بذرة expect().toBe() في Jest
- الهرم: كثير وحدة، بعض تكامل، قليل نهاية-إلى-نهاية
- مؤشرات الويب: LCP < 2.5s و INP < 200ms و CLS < 0.1 — افحص بـ Lighthouse

**خطوتك التالية على جهازك:** \`npm create vite@latest\`، أضف Vitest، واكتب 3 اختبارات حقيقية لدالتي add و safeAdd من الدروس السابقة. ثم افحص موقع Next.js الخاص بك بـ Lighthouse وأصلح أول ملاحظة.`,
      },
    },
  ],
};
