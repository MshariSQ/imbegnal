import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "git-devops",
  title: { en: "Git for DevOps — Workflows & Versioning", ar: "Git لـ DevOps — سير العمل والإصدارات" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Branching strategies teams actually use
- **Semantic versioning** (what v2.4.1 means)
- Why Git is the trigger for all automation
- You'll implement a version bumper`,
        ar: `## ماذا ستتعلم

- استراتيجيات التفريع التي تستخدمها الفرق فعلاً
- **الإصدار الدلالي (Semantic Versioning)** (ماذا يعني v2.4.1)
- لماذا Git هو مُحفّز كل الأتمتة
- ستنفّذ رافع إصدار`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Git is the DevOps trigger 🎯

You met Git basics in the frontend track (commit, push, branches). For DevOps, Git is bigger: it's the **central trigger for all automation**. When you push code, pipelines wake up, run tests, build, and deploy — automatically. Git isn't just version control here; it's the *starting gun* for the whole delivery machine.

**Branching strategies** — how teams organize parallel work:
- **GitHub Flow** (simple, popular): \`main\` is always deployable. For any change, branch off main → work → open a Pull Request → review → merge → auto-deploy. Great for continuous delivery.
- **Git Flow** (more structured): separate long-lived branches for \`develop\`, \`release\`, and \`main\`/production. Heavier; used where releases are more formal.

The golden rule stays: **\`main\` must always work**, because in DevOps main often deploys automatically. A broken main breaks production.

**Semantic Versioning (SemVer)** — the universal language for version numbers, written **MAJOR.MINOR.PATCH** (e.g. \`2.4.1\`):
- **MAJOR** (2 → 3): breaking changes. Existing users' code may stop working.
- **MINOR** (2.4 → 2.5): new features, but backward-compatible. Safe to upgrade.
- **PATCH** (2.4.1 → 2.4.2): bug fixes only, backward-compatible.

So going from \`1.9.3\` to \`2.0.0\` screams "warning, breaking changes!"; \`1.9.3\` to \`1.9.4\` whispers "just a safe bug fix." Every serious library uses this, and automated pipelines bump versions based on it. Reading a version number now tells you the *risk* of upgrading — crucial for managing dependencies safely.`,
        ar: `## Git هو مُحفّز DevOps 🎯

قابلت أساسيات Git في مسار الواجهات (commit، push، الفروع). في DevOps، Git أكبر: إنه **المُحفّز المركزي لكل الأتمتة**. حين تدفع كوداً، تستيقظ الخطوط، تشغّل الاختبارات، تبني، وتنشر — تلقائياً. Git هنا ليس مجرد تحكّم بالإصدارات؛ بل *طلقة البداية* لآلة التسليم كلها.

**استراتيجيات التفريع** — كيف تنظّم الفرق العمل المتوازي:
- **GitHub Flow** (بسيط، شائع): \`main\` قابل للنشر دائماً. لأي تغيير، تفرّع من main → اعمل → افتح Pull Request → راجع → ادمج → انشر تلقائياً. رائع للتسليم المستمر.
- **Git Flow** (أكثر هيكلة): فروع منفصلة طويلة العمر لـ \`develop\` و\`release\` و\`main\`/الإنتاج. أثقل؛ يُستخدم حيث الإصدارات أكثر رسمية.

القاعدة الذهبية تبقى: **\`main\` يجب أن يعمل دائماً**، لأن main في DevOps غالباً يُنشر تلقائياً. main مكسور يكسر الإنتاج.

**الإصدار الدلالي (SemVer)** — اللغة العالمية لأرقام الإصدارات، تُكتب **MAJOR.MINOR.PATCH** (مثل \`2.4.1\`):
- **MAJOR** (2 ← 3): تغييرات كاسرة. قد يتوقف كود المستخدمين الحاليين.
- **MINOR** (2.4 ← 2.5): ميزات جديدة، لكن متوافقة رجعياً. الترقية آمنة.
- **PATCH** (2.4.1 ← 2.4.2): إصلاحات أخطاء فقط، متوافقة رجعياً.

فالانتقال من \`1.9.3\` إلى \`2.0.0\` يصرخ "تحذير، تغييرات كاسرة!"؛ ومن \`1.9.3\` إلى \`1.9.4\` يهمس "مجرد إصلاح آمن". كل مكتبة جادة تستخدم هذا، والخطوط الآلية ترفع الإصدارات بناءً عليه. قراءة رقم الإصدار الآن تخبرك بـ*خطورة* الترقية — حاسم لإدارة الاعتماديات بأمان.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Automate SemVer. Write \`bump(version, type)\` where \`version\` is \`"MAJOR.MINOR.PATCH"\` and \`type\` is \`"major"\`, \`"minor"\`, or \`"patch"\`. Return the new version string.

Rules: bumping **major** resets minor & patch to 0; bumping **minor** resets patch to 0; **patch** just adds 1.

Examples: \`bump("2.4.1","patch")\`→\`"2.4.2"\`; \`bump("2.4.1","minor")\`→\`"2.5.0"\`; \`bump("2.4.1","major")\`→\`"3.0.0"\``,
        ar: `أتمِت SemVer. اكتب \`bump(version, type)\` حيث \`version\` هي \`"MAJOR.MINOR.PATCH"\` و\`type\` هي \`"major"\` أو \`"minor"\` أو \`"patch"\`. أعِد نص الإصدار الجديد.

القواعد: رفع **major** يصفّر minor وpatch؛ رفع **minor** يصفّر patch؛ و**patch** يضيف 1 فقط.

أمثلة: \`bump("2.4.1","patch")\`←\`"2.4.2"\`؛ \`bump("2.4.1","minor")\`←\`"2.5.0"\`؛ \`bump("2.4.1","major")\`←\`"3.0.0"\``,
      },
      starterCode: `function bump(version, type) {
  const [major, minor, patch] = version.split(".").map(Number);
  // return the new "x.y.z" based on type
}

console.log(bump("2.4.1", "patch")); // "2.4.2"
console.log(bump("2.4.1", "minor")); // "2.5.0"
console.log(bump("2.4.1", "major")); // "3.0.0"`,
      solution: `function bump(version, type) {
  const [major, minor, patch] = version.split(".").map(Number);
  if (type === "major") return (major + 1) + ".0.0";
  if (type === "minor") return major + "." + (minor + 1) + ".0";
  return major + "." + minor + "." + (patch + 1);
}

console.log(bump("2.4.1", "patch")); // "2.4.2"
console.log(bump("2.4.1", "minor")); // "2.5.0"
console.log(bump("2.4.1", "major")); // "3.0.0"`,
      hints: [
        { en: `Split and convert: version.split(".").map(Number) gives [major, minor, patch].`, ar: `قسّم وحوّل: version.split(".").map(Number) يعطي [major, minor, patch].` },
        { en: `major → (major+1)+".0.0"; minor → major+"."+(minor+1)+".0"; patch → add 1 to patch.`, ar: `major ← (major+1)+".0.0"؛ minor ← major+"."+(minor+1)+".0"؛ patch ← أضف 1 لـ patch.` },
      ],
      tests: [
        { name: { en: "patch bump", ar: "رفع patch" }, check: `bump("2.4.1","patch") === "2.4.2"` },
        { name: { en: "minor resets patch", ar: "minor يصفّر patch" }, check: `bump("2.4.1","minor") === "2.5.0"` },
        { name: { en: "major resets minor & patch", ar: "major يصفّر minor وpatch" }, check: `bump("2.4.1","major") === "3.0.0"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Tags and release automation 🏷️

A branch moves forward with every commit — it's a living pointer. A **tag**, by contrast, is a permanent bookmark on one exact commit that never moves. Tags are how DevOps pipelines know *what a release actually was*:

\`\`\`bash
git tag v2.4.1              # bookmark the current commit as v2.4.1
git push origin v2.4.1      # share that bookmark
\`\`\`

Once a commit is tagged \`v2.4.1\`, that name points to *that exact snapshot* forever — even if \`main\` moves 500 commits ahead tomorrow, \`v2.4.1\` still means exactly what it meant on release day. This matters enormously for DevOps: your CI/CD pipeline can be configured so that **pushing a tag** (not just any commit) is what triggers a production deployment. That gives teams a deliberate, auditable release step, separate from the constant stream of everyday commits — "we deploy tags, not just any push to main."

It also makes **rollback** trivial: if \`v2.4.2\` breaks production, you don't have to figure out which commit was good — you just redeploy the artifact tagged \`v2.4.1\`. Combined with SemVer, tags turn your Git history into a reliable, navigable timeline of every release you've ever shipped.`,
        ar: `## الوسوم وأتمتة الإصدارات 🏷️

الفرع يتقدّم مع كل commit — إنه مؤشّر حيّ. أما **الوسم (tag)** فهو إشارة مرجعية دائمة على commit واحد بالضبط لا تتحرك أبداً. الوسوم هي كيف تعرف خطوط DevOps *ما كان الإصدار فعلياً*:

\`\`\`bash
git tag v2.4.1              # ضع إشارة مرجعية على الـ commit الحالي باسم v2.4.1
git push origin v2.4.1      # شارك تلك الإشارة
\`\`\`

بمجرد وسم commit بـ \`v2.4.1\`، يشير ذلك الاسم إلى *تلك اللقطة بالضبط* للأبد — حتى لو تقدّم \`main\` 500 commit غداً، \`v2.4.1\` لا يزال يعني بالضبط ما عناه يوم الإصدار. هذا يهم بشدة لـ DevOps: يمكن إعداد خط CI/CD بحيث **دفع وسم** (لا أي commit) هو ما يحفّز نشراً للإنتاج. هذا يمنح الفرق خطوة إصدار متعمّدة وقابلة للتدقيق، منفصلة عن تدفق الـ commits اليومي المستمر — "ننشر الوسوم، لا أي دفعة إلى main."

كما يجعل **التراجع (rollback)** بسيطاً: إن كسر \`v2.4.2\` الإنتاج، لا تحتاج معرفة أي commit كان سليماً — فقط أعِد نشر القطعة الموسومة \`v2.4.1\`. مع SemVer، تحوّل الوسوم سجلّ Git إلى خط زمني موثوق وقابل للتصفّح لكل إصدار شحنته يوماً.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Model a rollback picker. Write \`latestStableTag(tags)\` where \`tags\` is an array of SemVer strings like \`"2.4.1"\`. Return the **highest** version (compare major, then minor, then patch numerically — not alphabetically!).

Example: \`latestStableTag(["1.9.3", "2.0.0", "1.10.0"])\` → \`"2.0.0"\``,
        ar: `حاكِ مُنتقي تراجع. اكتب \`latestStableTag(tags)\` حيث \`tags\` مصفوفة نصوص SemVer مثل \`"2.4.1"\`. أعِد **أعلى** إصدار (قارن major، ثم minor، ثم patch رقمياً — لا أبجدياً!).

مثال: \`latestStableTag(["1.9.3", "2.0.0", "1.10.0"])\` ← \`"2.0.0"\``,
      },
      starterCode: `function latestStableTag(tags) {
  // parse each tag into [major, minor, patch] numbers, then find the max
}

console.log(latestStableTag(["1.9.3", "2.0.0", "1.10.0"])); // "2.0.0"`,
      solution: `function latestStableTag(tags) {
  function parts(tag) {
    return tag.split(".").map(Number);
  }
  return tags.reduce((best, tag) => {
    const a = parts(tag);
    const b = parts(best);
    for (let i = 0; i < 3; i++) {
      if (a[i] !== b[i]) return a[i] > b[i] ? tag : best;
    }
    return best;
  });
}

console.log(latestStableTag(["1.9.3", "2.0.0", "1.10.0"])); // "2.0.0"`,
      hints: [
        { en: `Split each tag on "." and convert to numbers — comparing as strings would put "10" before "9".`, ar: `قسّم كل وسم على "." وحوّله لأرقام — المقارنة كنصوص تضع "10" قبل "9".` },
        { en: `Use reduce to keep the "best so far", comparing major first, then minor, then patch.`, ar: `استخدم reduce للاحتفاظ بـ"الأفضل حتى الآن"، مقارناً major أولاً، ثم minor، ثم patch.` },
      ],
      tests: [
        { name: { en: "Picks the highest major version", ar: "يختار أعلى إصدار major" }, check: `latestStableTag(["1.9.3","2.0.0","1.10.0"]) === "2.0.0"` },
        { name: { en: "Compares minor numerically, not alphabetically", ar: "يقارن minor رقمياً لا أبجدياً" }, check: `latestStableTag(["1.9.0","1.10.0","1.2.0"]) === "1.10.0"` },
        { name: { en: "Compares patch when major and minor tie", ar: "يقارن patch عند تعادل major وminor" }, check: `latestStableTag(["2.4.1","2.4.9","2.4.5"]) === "2.4.9"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: this platform's own release tags 🔍

You don't have to look far for a real example — Git tags are exactly how most well-run open-source projects, including the tools that build sites like this one, mark their official releases. A project like Next.js publishes a tag (e.g. \`v15.2.0\`) for every release; that tag is what actually gets published to npm, what release notes describe, and what teams pin their \`package.json\` to. If a new release introduces a bug, maintainers don't have to hunt through hundreds of commits — they simply point users back to the previous tag while a fix is prepared.

This is the same discipline recommended for any serious DevOps pipeline: don't deploy "whatever main happens to be right now" — deploy a **tagged, named, intentional release** that can be referenced, audited, and rolled back to by name, forever.`,
        ar: `## دراسة حالة واقعية: وسوم الإصدار في هذه المنصة 🔍

لا تحتاج للبحث بعيداً عن مثال حقيقي — وسوم Git هي بالضبط كيف تُعلِّم معظم مشاريع المصادر المفتوحة المُدارة جيداً، بما فيها الأدوات التي تبني مواقع كهذا الموقع، إصداراتها الرسمية. مشروع مثل Next.js ينشر وسماً (مثل \`v15.2.0\`) لكل إصدار؛ ذلك الوسم هو ما يُنشر فعلياً على npm، وما تصفه ملاحظات الإصدار، وما تثبّت عليه الفرق \`package.json\`. إن جلب إصدار جديد خطأً، لا يحتاج القائمون على الصيانة تفتيش مئات الـ commits — بل يوجّهون المستخدمين ببساطة إلى الوسم السابق ريثما يُحضَّر إصلاح.

هذا نفس الانضباط المُوصى به لأي خط DevOps جاد: لا تنشر "أياً كان ما عليه main الآن" — انشر **إصداراً موسوماً، مسمّى، متعمَّداً** يمكن الإشارة إليه وتدقيقه والتراجع إليه بالاسم، للأبد.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "In version 2.4.1, what does the '2' represent?", ar: "في الإصدار 2.4.1، ماذا يمثّل الرقم '2'؟" },
          choices: [
            { en: "MAJOR — breaking changes when it increases", ar: "MAJOR — تغييرات كاسرة عند زيادته" },
            { en: "PATCH — bug fixes", ar: "PATCH — إصلاحات أخطاء" },
            { en: "The number of contributors", ar: "عدد المساهمين" },
          ],
          answer: 0,
          explain: {
            en: "MAJOR.MINOR.PATCH — a major bump signals backward-incompatible (breaking) changes. Upgrade with care.",
            ar: "MAJOR.MINOR.PATCH — رفع major يشير لتغييرات غير متوافقة (كاسرة). رقِّ بحذر.",
          },
        },
        {
          q: { en: "Upgrading from 1.4.0 to 1.5.0 (minor) means…", ar: "الترقية من 1.4.0 إلى 1.5.0 (minor) تعني…" },
          choices: [
            { en: "New features, but backward-compatible (safe)", ar: "ميزات جديدة، لكن متوافقة رجعياً (آمنة)" },
            { en: "Breaking changes", ar: "تغييرات كاسرة" },
            { en: "The project was deleted", ar: "حُذف المشروع" },
          ],
          answer: 0,
          explain: {
            en: "A minor bump adds features without breaking existing usage — generally safe to adopt.",
            ar: "رفع minor يضيف ميزات دون كسر الاستخدام الحالي — آمن عموماً للتبنّي.",
          },
        },
        {
          q: { en: "Why is Git central to DevOps?", ar: "لماذا Git محوري في DevOps؟" },
          choices: [
            { en: "A push triggers automated pipelines (test, build, deploy)", ar: "الدفع يحفّز خطوطاً آلية (اختبار، بناء، نشر)" },
            { en: "It stores images", ar: "يخزّن الصور" },
            { en: "It replaces the database", ar: "يستبدل قاعدة البيانات" },
          ],
          answer: 0,
          explain: {
            en: "In DevOps, pushing to Git is the starting gun for CI/CD automation. Git events drive the whole delivery pipeline.",
            ar: "في DevOps، الدفع إلى Git هو طلقة بداية أتمتة CI/CD. أحداث Git تقود خط التسليم كله.",
          },
        },
        {
          q: { en: "What makes a Git tag different from a branch?", ar: "ما الذي يجعل وسم Git مختلفاً عن الفرع؟" },
          choices: [
            { en: "A tag permanently points to one exact commit and never moves; a branch keeps advancing", ar: "الوسم يشير دائماً لـ commit واحد بالضبط ولا يتحرك؛ والفرع يستمر بالتقدّم" },
            { en: "Tags and branches are exactly the same thing", ar: "الوسوم والفروع نفس الشيء تماماً" },
            { en: "A tag deletes all commits before it", ar: "الوسم يحذف كل الـ commits قبله" },
          ],
          answer: 0,
          explain: {
            en: "A branch is a moving pointer that advances with new commits; a tag is a fixed bookmark on one commit, ideal for marking releases.",
            ar: "الفرع مؤشّر متحرك يتقدّم مع commits جديدة؛ والوسم إشارة ثابتة على commit واحد، مثالي لتعليم الإصدارات.",
          },
        },
        {
          q: { en: "Why do pipelines often trigger production deploys on a pushed tag rather than every commit?", ar: "لماذا تحفّز الخطوط غالباً نشر الإنتاج عند دفع وسم لا كل commit؟" },
          choices: [
            { en: "It creates a deliberate, auditable release step and makes rollback as simple as redeploying a named tag", ar: "يخلق خطوة إصدار متعمّدة وقابلة للتدقيق، ويجعل التراجع بسيطاً كإعادة نشر وسم مسمّى" },
            { en: "Tags make the pipeline run faster", ar: "الوسوم تجعل الخط يعمل أسرع" },
            { en: "Git requires a tag before any commit can be pushed", ar: "Git يفرض وسماً قبل دفع أي commit" },
          ],
          answer: 0,
          explain: {
            en: "Deploying only tagged commits separates 'every day's work' from 'an intentional, named release' — and rollback just means redeploying an older tag.",
            ar: "نشر الـ commits الموسومة فقط يفصل 'عمل كل يوم' عن 'إصدار متعمَّد مسمّى' — والتراجع يعني فقط إعادة نشر وسم أقدم.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- In DevOps, Git pushes trigger the entire automation pipeline
- Branching strategies (GitHub Flow, Git Flow) keep main always deployable
- SemVer (MAJOR.MINOR.PATCH) communicates upgrade risk
- Tags are permanent bookmarks on one commit — pipelines can deploy tags for auditable, rollback-friendly releases
- You built an automated version bumper and a highest-tag picker

**Next:** Docker — packaging apps into portable containers, the DevOps unit of deployment.`,
        ar: `## الخلاصة

- في DevOps، دفعات Git تحفّز خط الأتمتة كله
- استراتيجيات التفريع (GitHub Flow، Git Flow) تُبقي main قابلاً للنشر دائماً
- SemVer (MAJOR.MINOR.PATCH) يوصّل خطورة الترقية
- الوسوم إشارات مرجعية دائمة على commit واحد — يمكن للخطوط نشر الوسوم لإصدارات قابلة للتدقيق وسهلة التراجع
- بنيت رافع إصدار آلي ومُنتقي أعلى وسم

**التالي:** Docker — تغليف التطبيقات في حاويات محمولة، وحدة النشر في DevOps.`,
      },
    },
  ],
};
