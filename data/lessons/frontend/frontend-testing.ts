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
- **Mocking** — testing in isolation without a real server or database
- Core Web Vitals — the 3 numbers Google grades your site with

Fun fact: every exercise you've passed in this course was checked by automated tests. Today you look behind the curtain.`,
        ar: `## ماذا ستتعلم

- ما هي الاختبارات الآلية فعلياً (ستكتب أداة اختبار مصغّرة بنفسك)
- هرم الاختبارات الذي تتحدث عنه كل الفرق
- **المحاكاة (Mocking)** — الاختبار بمعزل دون خادم أو قاعدة بيانات حقيقية
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
        en: `## Arrays and objects need a different check ⚠️

Your \`expectEqual\` uses \`===\`, which works perfectly for numbers and strings. But try comparing two arrays with it:

\`\`\`js
[1, 2, 3] === [1, 2, 3]   // false! Even though they "look" the same
\`\`\`

\`===\` checks *identity* (are these the exact same object in memory?), not *contents*. Two separately-created arrays are never the same object, even with identical items. Real test tools solve this by comparing contents deeply — the simplest trick is turning both into strings first:

\`\`\`js
JSON.stringify([1, 2, 3]) === JSON.stringify([1, 2, 3])   // true!
\`\`\`

This is exactly why several exercises in this course compare arrays using \`JSON.stringify(...)  === JSON.stringify(...)\` inside their checks — now you know why, instead of just copying the pattern.`,
        ar: `## المصفوفات والكائنات تحتاج فحصاً مختلفاً ⚠️

دالتك \`expectEqual\` تستخدم \`===\`، وتعمل تماماً مع الأرقام والنصوص. لكن جرّب مقارنة مصفوفتين بها:

\`\`\`js
[1, 2, 3] === [1, 2, 3]   // false! رغم أنهما "تبدوان" متطابقتين
\`\`\`

\`===\` تفحص *الهوية* (هل هذان نفس الكائن بالضبط في الذاكرة؟)، لا *المحتوى*. مصفوفتان أُنشئتا منفصلتين ليستا أبداً نفس الكائن، حتى بعناصر متطابقة. أدوات الاختبار الحقيقية تحل هذا بمقارنة المحتوى بعمق — أبسط حيلة هي تحويل كليهما لنص أولاً:

\`\`\`js
JSON.stringify([1, 2, 3]) === JSON.stringify([1, 2, 3])   // true!
\`\`\`

هذا بالضبط لماذا تقارن عدة تمارين في هذه الدورة المصفوفات بـ\`JSON.stringify(...) === JSON.stringify(...)\` داخل فحوصاتها — الآن تعرف السبب، لا مجرد نسخ النمط.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Write \`expectArrayEqual(actual, expected)\` — like \`expectEqual\`, but correct for arrays. Print \`"PASS"\` if their contents match, otherwise \`"FAIL"\`.`,
        ar: `اكتب \`expectArrayEqual(actual, expected)\` — كـ\`expectEqual\`، لكن صحيحة للمصفوفات. اطبع \`"PASS"\` إن تطابق المحتوى، وإلا \`"FAIL"\`.`,
      },
      starterCode: `function expectArrayEqual(actual, expected) {
  // compare contents, not identity — JSON.stringify both sides

}

expectArrayEqual([1, 2, 3], [1, 2, 3]);   // should print PASS
expectArrayEqual([1, 2], [1, 2, 3]);      // should print FAIL`,
      solution: `function expectArrayEqual(actual, expected) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log("PASS");
  } else {
    console.log("FAIL");
  }
}

expectArrayEqual([1, 2, 3], [1, 2, 3]);   // PASS
expectArrayEqual([1, 2], [1, 2, 3]);      // FAIL`,
      hints: [
        { en: `if (JSON.stringify(actual) === JSON.stringify(expected)) { console.log("PASS"); }`, ar: `if (JSON.stringify(actual) === JSON.stringify(expected)) { console.log("PASS"); }` },
        { en: `else { console.log("FAIL"); }`, ar: `else { console.log("FAIL"); }` },
      ],
      tests: [
        { name: { en: "Matching arrays print PASS", ar: "المصفوفات المتطابقة تطبع PASS" }, check: `window.__consoleLog.includes("PASS")` },
        { name: { en: "Different arrays print FAIL", ar: "المصفوفات المختلفة تطبع FAIL" }, check: `window.__consoleLog.includes("FAIL")` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Mocking — testing without the real thing 🎭

What if your function calls a real API or database? You don't want tests hitting a live server every time (slow, costs money, fails if the internet is down). **Mocking** replaces the real dependency with a fake stand-in that returns known data instantly:

\`\`\`js
// real version — calls an actual API
function getUser(id) {
  return fetch("/api/users/" + id).then(r => r.json());
}

// mocked version, used only during tests
function mockGetUser(id) {
  return Promise.resolve({ id: id, name: "Test User" });
}
\`\`\`

The test calls \`mockGetUser\` instead of the real one, so it runs in milliseconds, never touches the network, and always returns the same predictable data — perfect for checking "does my component *display* the user correctly?" without caring whether the real API works today.`,
        ar: `## المحاكاة — الاختبار دون الشيء الحقيقي 🎭

ماذا لو استدعت دالتك API أو قاعدة بيانات حقيقية؟ لا تريد اختبارات تضرب خادماً حياً كل مرة (بطيء، يكلّف مالاً، يفشل إن انقطع الإنترنت). **المحاكاة (Mocking)** تستبدل الاعتمادية الحقيقية ببديل وهمي يعيد بيانات معروفة فوراً:

\`\`\`js
// النسخة الحقيقية — تستدعي API فعلياً
function getUser(id) {
  return fetch("/api/users/" + id).then(r => r.json());
}

// النسخة المحاكاة، تُستخدم فقط أثناء الاختبار
function mockGetUser(id) {
  return Promise.resolve({ id: id, name: "Test User" });
}
\`\`\`

الاختبار يستدعي \`mockGetUser\` بدل الحقيقية، فيعمل بأجزاء من الثانية، ولا يلمس الشبكة أبداً، ويعيد دائماً نفس البيانات المتوقعة — مثالي لفحص "هل يعرض مكوّني المستخدم بشكل صحيح؟" دون الاهتمام بهل يعمل الـ API الحقيقي اليوم.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: this exact course 🔍

You don't need to imagine how automated testing works — you've been inside it this entire course. Every exercise you've passed has a hidden \`check\` string, like \`add(2,3) === 5\`, that runs against your code the instant you click "Check" — that *is* \`expectEqual\`, just wired into this platform's UI instead of printing to a console. When your code passes all checks, the lesson marks itself complete automatically. You weren't just learning about tests in this lesson; every lesson before it was testing you the same way.`,
        ar: `## دراسة حالة واقعية: هذه الدورة نفسها 🔍

لا تحتاج تخيّل كيف يعمل الاختبار الآلي — كنت بداخله طوال هذه الدورة. كل تمرين اجتزته له نص \`check\` خفي، مثل \`add(2,3) === 5\`، يعمل ضد كودك لحظة ضغطك "تحقّق" — هذا *هو* \`expectEqual\`، لكن موصول بواجهة هذه المنصة بدل الطباعة في وحدة تحكم. حين ينجح كودك في كل الفحوصات، يُعلَّم الدرس مكتملاً تلقائياً. لم تكن تتعلم عن الاختبارات في هذا الدرس فقط؛ كل درس قبله كان يختبرك بنفس الطريقة.`,
      },
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
        {
          q: { en: "Why does [1,2,3] === [1,2,3] return false?", ar: "لماذا تعيد [1,2,3] === [1,2,3] القيمة false؟" },
          choices: [
            { en: "=== checks if it's the exact same object in memory, not matching contents", ar: "=== تفحص هل هو نفس الكائن بالضبط في الذاكرة، لا تطابق المحتوى" },
            { en: "Arrays cannot hold numbers", ar: "المصفوفات لا يمكن أن تحمل أرقاماً" },
            { en: "This is a bug in JavaScript", ar: "هذا خطأ في JavaScript" },
          ],
          answer: 0,
          explain: {
            en: "Two separately created arrays are never === , even with identical items. Compare contents with JSON.stringify() instead.",
            ar: "مصفوفتان أُنشئتا منفصلتين ليستا أبداً ===، حتى بعناصر متطابقة. قارن المحتوى بـ JSON.stringify() بدلاً من ذلك.",
          },
        },
        {
          q: { en: "Why mock a real API call in a test?", ar: "لماذا نحاكي استدعاء API حقيقياً في اختبار؟" },
          choices: [
            { en: "So the test runs fast, predictably, and without needing a live server", ar: "ليعمل الاختبار سريعاً وبشكل متوقع دون الحاجة لخادم حيّ" },
            { en: "Mocking makes the real API faster", ar: "المحاكاة تجعل الـ API الحقيقي أسرع" },
            { en: "It's required by every programming language", ar: "كل لغة برمجة تفرضها" },
          ],
          answer: 0,
          explain: {
            en: "A mock returns known fake data instantly, letting you test your own logic in isolation from network issues or a down server.",
            ar: "المحاكاة تعيد بيانات وهمية معروفة فوراً، فتختبر منطقك الخاص بمعزل عن مشاكل الشبكة أو خادم متوقف.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Tests = robot taste-testers; you built expectEqual, the seed of Jest's expect().toBe()
- Arrays/objects need content comparison (JSON.stringify), not ===
- Mocking replaces real APIs/databases with fast, predictable fakes during tests
- Pyramid: many unit, some integration, few end-to-end
- Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1 — audit with Lighthouse
- Every exercise in this entire course has been testing you with exactly this mechanism

**Next step on your machine:** \`npm create vite@latest\`, add Vitest, and write 3 real tests for the add and safeAdd functions from earlier lessons. Then Lighthouse-audit your Next.js site and fix the top finding.`,
        ar: `## الخلاصة

- الاختبارات = متذوّقون آليون؛ بنيت expectEqual، بذرة expect().toBe() في Jest
- المصفوفات/الكائنات تحتاج مقارنة محتوى (JSON.stringify)، لا ===
- المحاكاة تستبدل الـ APIs/قواعد البيانات الحقيقية ببدائل سريعة متوقعة أثناء الاختبار
- الهرم: كثير وحدة، بعض تكامل، قليل نهاية-إلى-نهاية
- مؤشرات الويب: LCP < 2.5s و INP < 200ms و CLS < 0.1 — افحص بـ Lighthouse
- كل تمرين في هذه الدورة كاملة كان يختبرك بهذه الآلية بالضبط

**خطوتك التالية على جهازك:** \`npm create vite@latest\`، أضف Vitest، واكتب 3 اختبارات حقيقية لدالتي add و safeAdd من الدروس السابقة. ثم افحص موقع Next.js الخاص بك بـ Lighthouse وأصلح أول ملاحظة.`,
      },
    },
  ],
};
