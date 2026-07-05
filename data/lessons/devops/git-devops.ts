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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- In DevOps, Git pushes trigger the entire automation pipeline
- Branching strategies (GitHub Flow, Git Flow) keep main always deployable
- SemVer (MAJOR.MINOR.PATCH) communicates upgrade risk
- You built an automated version bumper

**Next:** Docker — packaging apps into portable containers, the DevOps unit of deployment.`,
        ar: `## الخلاصة

- في DevOps، دفعات Git تحفّز خط الأتمتة كله
- استراتيجيات التفريع (GitHub Flow، Git Flow) تُبقي main قابلاً للنشر دائماً
- SemVer (MAJOR.MINOR.PATCH) يوصّل خطورة الترقية
- بنيت رافع إصدار آلي

**التالي:** Docker — تغليف التطبيقات في حاويات محمولة، وحدة النشر في DevOps.`,
      },
    },
  ],
};
