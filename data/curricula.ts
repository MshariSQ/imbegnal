/**
 * Curriculum metadata, keyed by roadmap id (data/roadmaps.ts is the only place a
 * track's name, icon and accent live). A track's lessons come from
 * data/roadmap-nodes + data/lessons; this file adds everything a learner needs to
 * judge and plan a course: outcomes, audience, prerequisites, honest hours, how
 * mastery is assessed, badges and a runnable example.
 *
 * Rules enforced by tests/unit/curricula.test.ts and tests/unit/canonical.test.ts:
 *  - every roadmap has an entry; every track id referenced here is a roadmap id
 *  - 4–8 verb-first objectives, every learner-facing string is bilingual
 *  - `estimatedHours` is within ±35% of the sum of lesson minutes unless `estimateOnly`
 *  - every `sampleCode` runs and prints exactly `output`
 */
import type { LangId } from "../shared/languages";
import type { L10n } from "./lessons/types";
import type { RoadmapNodeInfo } from "./roadmap-nodes";

export type ModuleKey = RoadmapNodeInfo["status"];

/** Lucide icon used by a badge (mapped to components in components/learn/CourseBadges). */
export type BadgeIcon =
  | "award" | "shield" | "flame" | "flask" | "trophy" | "rocket" | "target" | "graduation"
  | "brain" | "terminal" | "network" | "database" | "cpu" | "code" | "palette" | "cloud"
  | "server" | "bug" | "lock" | "search" | "layers" | "git-branch" | "container" | "chart"
  | "pen-tool" | "binary" | "eye" | "puzzle" | "globe" | "hard-drive";

/**
 * Deterministic badge rules, evaluated from local progress only (study store +
 * lab progress), see `evaluateBadge` in lib/catalog.ts. Counts are capped at
 * what the track offers, so a rule can never be unreachable.
 */
export type BadgeRule =
  /** At least `count` lessons completed. */
  | { kind: "lessons"; count: number }
  /** Every lesson of a module completed. */
  | { kind: "module"; module: ModuleKey }
  /** At least `count` graded lab exercises passed. */
  | { kind: "labs"; count: number }
  /** At least `count` lessons with a recorded first-try quiz accuracy of `min` (0..1) or better. */
  | { kind: "quizzes"; min: number; count: number }
  /** Every lesson of the course completed. */
  | { kind: "course" };

export interface Badge {
  id: string;
  icon: BadgeIcon;
  title: L10n;
  /** What the learner did to earn it (shown on locked and unlocked badges). */
  criteria: L10n;
  rule: BadgeRule;
}

export type AssessmentSource = "lessons" | "quizzes" | "labs" | "challenges";

export interface AssessmentCriterion {
  /** What counts as evidence for this criterion. */
  source: AssessmentSource;
  title: L10n;
  detail: L10n;
}

export interface Assessment {
  /** One paragraph: how mastery is judged on this track. */
  summary: L10n;
  /**
   * Explicit passing rule. `lessons: "required"` means every lesson of the
   * Foundations module; `"all"` every lesson. `labs` is capped at the number of
   * graded labs the track has; `challenges` is verified by the server.
   */
  passing: { lessons: "required" | "all"; quizAccuracy: number; labs: number; challenges: number };
  criteria: AssessmentCriterion[];
}

export type Prerequisite = { track: string } | { text: L10n };

export interface SampleCode {
  /** Only languages the browser runs itself, so the course page can execute it. */
  lang: "javascript" | "python";
  code: string;
  /** What the example shows and what to try changing. */
  caption: L10n;
  /** Exact stdout of the unmodified code (verified by a unit test). */
  output: string;
}

export interface LessonLink {
  /** Offer a blank Code Lab in the lesson's language (default true). */
  lab?: boolean;
  /** Language of that blank Code Lab when it differs from the track's `primaryLang`. */
  lang?: LangId;
  /** Challenge ids (data/challenges) worth doing after this lesson. */
  challenges?: string[];
}

export interface Curriculum {
  /**
   * Arabic name and description of the track. roadmaps[] is English-only; the English
   * title is never copied here, so renaming a roadmap still renames it everywhere.
   */
  arabic: { title: string; description: string };
  /** 4–8 verb-first, measurable outcomes. */
  objectives: L10n[];
  audience: L10n;
  prerequisites: Prerequisite[];
  /** Total study hours including labs. */
  estimatedHours: number;
  /** True while the track has no (or placeholder) lessons: hours are a plan, not a sum. */
  estimateOnly?: boolean;
  /** Position (1-based) in the suggested order for someone taking several tracks. */
  recommendedOrder: number;
  /** Roadmap ids that make this track easier when taken first (not hard prerequisites). */
  recommendedAfter: string[];
  modules: Record<ModuleKey, { title: L10n; summary: L10n }>;
  assessment: Assessment;
  badges: Badge[];
  /** Code Lab language for "blank" practice. */
  primaryLang: LangId;
  sampleCode: SampleCode;
  /** Per-lesson practice hints, keyed by lesson (roadmap node) id. */
  lessonLinks?: Record<string, LessonLink>;
}

const l = (en: string, ar: string): L10n => ({ en, ar });

/** Standard passing rule; tracks override the numbers that differ. */
const passing = (quizAccuracy: number, labs: number, challenges: number, lessons: "required" | "all" = "required") => ({
  lessons,
  quizAccuracy,
  labs,
  challenges,
});

export const curricula: Record<string, Curriculum> = {
  // ───────────────────────────────────────────────────────────────────────────
  "cyber-security": {
    arabic: { title: "الأمن السيبراني", description: "من أساسيات الشبكات إلى اختبار الاختراق ومراكز العمليات الأمنية وهندسة الأمن" },
    objectives: [
      l("Explain the CIA triad and map a real incident (phishing, ransomware, a leaked key) to the control that would have stopped it.", "اشرح ثلاثية CIA واربط حادثة حقيقية (تصيّد، فدية، مفتاح مسرَّب) بالضابط الأمني الذي كان سيوقفها."),
      l("Build an isolated home lab with a Linux VM and snapshots so every later experiment is safe and repeatable.", "ابنِ مختبراً منزلياً معزولاً بجهاز لينكس افتراضي ولقطات استرجاع ليكون كل اختبار لاحق آمناً وقابلاً للتكرار."),
      l("Trace a web request through DNS, TCP, TLS and HTTP and name the layer an attack abuses.", "تتبّع طلب ويب عبر DNS وTCP وTLS وHTTP وسمِّ الطبقة التي يستغلها الهجوم."),
      l("Navigate Linux from the shell: manage permissions, processes and read system logs.", "تنقّل في لينكس من الطرفية: أدِر الصلاحيات والعمليات واقرأ سجلات النظام."),
      l("Write Python that parses authentication logs with regular expressions and reports brute-force sources.", "اكتب بايثون تحلّل سجلات المصادقة بالتعابير النمطية وتُبلغ عن مصادر هجمات التخمين."),
      l("Demonstrate SQL injection and XSS against a practice app, then fix both with parameterized queries and output encoding.", "أظهر حقن SQL وXSS على تطبيق تدريبي ثم أصلحهما بالاستعلامات المُعامَلة وترميز المخرجات."),
      l("Triage SOC alerts: separate true from false positives and write a short incident note.", "افرز تنبيهات مركز العمليات الأمنية بين إيجابي حقيقي وكاذب واكتب ملاحظة حادثة موجزة."),
      l("Follow the phases of an ethical penetration test inside a written scope and rules of engagement.", "اتبع مراحل اختبار الاختراق الأخلاقي ضمن نطاق مكتوب وقواعد اشتباك واضحة."),
    ],
    audience: l(
      "Career changers, IT staff and students who want a path into SOC analysis, security engineering or ethical hacking. No security background needed.",
      "المتحوّلون مهنياً وموظفو تقنية المعلومات والطلاب الراغبون في مسار نحو تحليل مركز العمليات الأمنية أو هندسة الأمن أو الاختراق الأخلاقي. لا حاجة لخبرة أمنية سابقة."
    ),
    prerequisites: [{ text: l("Comfortable installing apps and using a browser. No programming experience needed.", "إتقان تثبيت البرامج واستخدام المتصفح. لا حاجة لخبرة في البرمجة.") }],
    estimatedHours: 5,
    recommendedOrder: 10,
    recommendedAfter: ["networking", "operating-systems"],
    modules: {
      required: { title: l("Foundations: lab, systems and Python", "الأساسيات: المختبر والأنظمة وبايثون"), summary: l("Build the lab, learn how computers and networks work, and automate with Python.", "ابنِ المختبر وتعلّم كيف تعمل الحواسيب والشبكات وأتمت العمل ببايثون.") },
      important: { title: l("Attack and defend in practice", "الهجوم والدفاع عملياً"), summary: l("Break a web app, then watch for the same attack from the defender's seat.", "اخترق تطبيق ويب ثم راقب الهجوم نفسه من مقعد المدافع.") },
      optional: { title: l("Professional ethical hacking", "الاختراق الأخلاقي الاحترافي"), summary: l("Scope, methodology and reporting the way real engagements run.", "النطاق والمنهجية وكتابة التقارير كما تجري الاختبارات الحقيقية.") },
    },
    assessment: {
      summary: l(
        "Mastery means you can both explain and do: every required lesson, solid quiz accuracy, working Python and shell scripts that pass their tests, and a captured flag.",
        "الإتقان يعني أن تشرح وتنفّذ: كل الدروس الأساسية، ودقة جيدة في الاختبارات، وسكربتات بايثون وشل تجتاز اختباراتها، وعلماً (flag) تلتقطه."
      ),
      passing: passing(0.7, 2, 1),
      criteria: [
        { source: "lessons", title: l("Build the foundations", "ابنِ الأساسيات"), detail: l("Complete all required lessons: lab setup, computer basics, networking, Linux, Python and security basics.", "أكمل كل الدروس الأساسية: إعداد المختبر وأساسيات الحاسوب والشبكات ولينكس وبايثون وأساسيات الأمن.") },
        { source: "quizzes", title: l("Explain the why", "اشرح السبب"), detail: l("Average at least 70% on first-try lesson quizzes covering threats, controls and protocols.", "حقق متوسط 70% على الأقل في اختبارات الدروس من المحاولة الأولى عن التهديدات والضوابط والبروتوكولات.") },
        { source: "labs", title: l("Automate the boring parts", "أتمت الأعمال الروتينية"), detail: l("Pass the log-parsing lab in Python and the permissions lab in Bash against their visible tests.", "اجتز مختبر تحليل السجلات ببايثون ومختبر الصلاحيات ببَاش أمام اختباراتهما الظاهرة.") },
        { source: "challenges", title: l("Capture a flag", "التقط علماً"), detail: l("Solve at least one beginner CTF challenge (crypto, web or forensics) on your own.", "حُلّ تحدّي CTF مبتدئاً واحداً على الأقل (تشفير أو ويب أو تحليل جنائي) بنفسك.") },
      ],
    },
    badges: [
      { id: "lab-online", icon: "terminal", title: l("Lab Online", "المختبر يعمل"), criteria: l("Finish your first lesson and start the lab.", "أنهِ درسك الأول وشغّل المختبر."), rule: { kind: "lessons", count: 1 } },
      { id: "solid-foundations", icon: "shield", title: l("Solid Foundations", "أساسيات متينة"), criteria: l("Complete every Foundations lesson.", "أكمل كل دروس الأساسيات."), rule: { kind: "module", module: "required" } },
      { id: "script-defender", icon: "code", title: l("Script Defender", "مدافع بالسكربتات"), criteria: l("Pass 2 graded lab exercises.", "اجتز تمرينين مصحَّحين في المختبر."), rule: { kind: "labs", count: 2 } },
      { id: "sharp-eyes", icon: "eye", title: l("Sharp Eyes", "عين حادة"), criteria: l("Score 80% or more on the first try in 4 lesson quizzes.", "احصل على 80% أو أكثر من المحاولة الأولى في 4 اختبارات دروس."), rule: { kind: "quizzes", min: 0.8, count: 4 } },
      { id: "security-analyst", icon: "graduation", title: l("Security Analyst", "محلل أمني"), criteria: l("Complete every lesson in the track.", "أكمل كل دروس المسار."), rule: { kind: "course" } },
    ],
    primaryLang: "python",
    sampleCode: {
      lang: "python",
      code: `import re
from collections import Counter

log = """\\
Oct 05 03:12:01 sshd[311]: Failed password for root from 203.0.113.9 port 51022
Oct 05 03:12:03 sshd[311]: Failed password for admin from 203.0.113.9 port 51024
Oct 05 03:12:05 sshd[311]: Failed password for root from 203.0.113.9 port 51026
Oct 05 03:14:40 sshd[402]: Accepted password for alice from 198.51.100.7 port 40110
Oct 05 03:15:12 sshd[455]: Failed password for bob from 198.51.100.23 port 40300
"""

failures = Counter(re.findall(r"Failed password for \\w+ from ([\\d.]+)", log))
for ip, count in failures.most_common():
    verdict = "BLOCK" if count >= 3 else "watch"
    print(f"{ip:<15} {count} failures -> {verdict}")
`,
      caption: l("A 10-line brute-force detector: regex pulls the source IP out of failed logins and flags repeat offenders. Try lowering the threshold or adding a new log line.", "كاشف لهجمات التخمين في 10 أسطر: تستخرج التعابير النمطية عنوان IP المصدر من محاولات الدخول الفاشلة وتُعلِّم المتكررين. جرّب خفض الحد أو إضافة سطر سجل جديد."),
      output: "203.0.113.9     3 failures -> BLOCK\n198.51.100.23   1 failures -> watch\n",
    },
    lessonLinks: {
      linux: { lang: "bash" },
      "web-security": { lang: "javascript" },
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "artificial-intelligence": {
    arabic: { title: "الذكاء الاصطناعي", description: "تعلم الآلة والتعلم العميق ومعالجة اللغات الطبيعية وتطبيقات حقيقية" },
    objectives: [
      l("Set up a reproducible notebook environment and run a model end to end for the first time.", "جهّز بيئة دفاتر قابلة لإعادة الإنتاج وشغّل نموذجاً من البداية إلى النهاية لأول مرة."),
      l("Prepare numeric data in Python and compute the maths ML relies on: vectors, dot products, derivatives and gradient steps.", "حضّر بيانات رقمية ببايثون واحسب الرياضيات التي يعتمد عليها تعلم الآلة: المتجهات والضرب النقطي والمشتقات وخطوات الانحدار."),
      l("Train, evaluate and compare a supervised model, and explain overfitting using a train/test split.", "درّب نموذجاً خاضعاً للإشراف وقيّمه وقارنه، واشرح فرط التخصيص باستخدام تقسيم التدريب/الاختبار."),
      l("Describe how a neural network learns (forward pass, loss, backpropagation) and implement a single neuron by hand.", "صف كيف تتعلم الشبكة العصبية (تمرير أمامي، دالة خسارة، انتشار عكسي) ونفّذ خلية عصبية واحدة يدوياً."),
      l("Explain how text becomes tokens and embeddings, and why that lets language models search, summarize and chat.", "اشرح كيف يتحول النص إلى رموز وتمثيلات متجهية، ولماذا يتيح ذلك للنماذج اللغوية البحث والتلخيص والمحادثة."),
      l("Explain how convolutions let a model see images and pick a sensible vision pipeline for a task.", "اشرح كيف تتيح الالتفافات للنموذج رؤية الصور واختر مسار رؤية حاسوبية مناسباً لمهمة ما."),
      l("Outline the path from notebook to production: versioning, serving, monitoring and data drift.", "حدّد المسار من الدفتر إلى الإنتاج: الإصدارات والتقديم والمراقبة وانحراف البيانات."),
      l("Use generative models responsibly: write effective prompts, check outputs and recognise hallucination and bias.", "استخدم النماذج التوليدية بمسؤولية: اكتب موجّهات فعّالة وافحص المخرجات وتعرّف على الهلوسة والتحيّز."),
    ],
    audience: l(
      "Learners who can read a little Python and want to understand how modern AI works, not just call an API. Good for developers, analysts and curious students.",
      "المتعلمون الذين يقرؤون قليلاً من بايثون ويريدون فهم كيف يعمل الذكاء الاصطناعي الحديث لا استدعاء واجهة برمجية فقط. مناسب للمطورين والمحللين والطلاب الفضوليين."
    ),
    prerequisites: [{ text: l("Basic Python (variables, loops, functions) and school-level algebra. The track revisits both.", "أساسيات بايثون (متغيرات وحلقات ودوال) وجبر مدرسي. يراجع المسار الاثنين.") }],
    estimatedHours: 5.5,
    recommendedOrder: 12,
    recommendedAfter: ["data-science"],
    modules: {
      required: { title: l("Core ML toolkit", "عدّة تعلم الآلة الأساسية"), summary: l("Python, maths and your first supervised and deep models.", "بايثون والرياضيات ونماذجك الأولى الخاضعة للإشراف والعميقة.") },
      important: { title: l("Language and vision", "اللغة والرؤية"), summary: l("How machines read text and understand images.", "كيف تقرأ الآلات النصوص وتفهم الصور.") },
      optional: { title: l("Production and generative AI", "الإنتاج والذكاء التوليدي"), summary: l("Ship and monitor models; use generative AI with judgement.", "انشر النماذج وراقبها؛ واستخدم الذكاء التوليدي بحكمة.") },
    },
    assessment: {
      summary: l(
        "You prove AI understanding by predicting what code will do, not by memorising terms: quizzes check the concepts, labs make you implement the maths, and a challenge puts it under pressure.",
        "تُثبت فهمك للذكاء الاصطناعي بالتنبؤ بما سيفعله الكود لا بحفظ المصطلحات: الاختبارات تفحص المفاهيم، والمختبرات تجعلك تنفّذ الرياضيات، والتحدّي يضعها تحت الضغط."
      ),
      passing: passing(0.7, 2, 1),
      criteria: [
        { source: "lessons", title: l("Cover the core toolkit", "غطِّ العدّة الأساسية"), detail: l("Complete the setup, Python, maths, machine-learning and deep-learning lessons.", "أكمل دروس الإعداد وبايثون والرياضيات وتعلم الآلة والتعلم العميق.") },
        { source: "quizzes", title: l("Reason about models", "استدلّ على النماذج"), detail: l("Average at least 70% on first-try quizzes on overfitting, loss functions and evaluation metrics.", "حقق متوسط 70% على الأقل من المحاولة الأولى في اختبارات فرط التخصيص ودوال الخسارة ومقاييس التقييم.") },
        { source: "labs", title: l("Implement the maths", "نفّذ الرياضيات"), detail: l("Pass the normalization and gradient-descent labs: no libraries, just Python.", "اجتز مختبري التطبيع والانحدار التدريجي: بلا مكتبات، بايثون فقط.") },
        { source: "challenges", title: l("Solve under pressure", "احلّ تحت الضغط"), detail: l("Solve one data or algorithm challenge that needs a model-style calculation.", "حُلّ تحدّياً واحداً في البيانات أو الخوارزميات يحتاج حساباً بأسلوب النماذج.") },
      ],
    },
    badges: [
      { id: "first-model", icon: "rocket", title: l("First Model", "النموذج الأول"), criteria: l("Finish your first lesson and run a model.", "أنهِ درسك الأول وشغّل نموذجاً."), rule: { kind: "lessons", count: 1 } },
      { id: "math-comfortable", icon: "brain", title: l("Maths Comfortable", "مرتاح مع الرياضيات"), criteria: l("Complete every core-toolkit lesson.", "أكمل كل دروس العدّة الأساسية."), rule: { kind: "module", module: "required" } },
      { id: "gradient-hands", icon: "flask", title: l("Gradient by Hand", "الانحدار بيدك"), criteria: l("Pass 2 graded lab exercises.", "اجتز تمرينين مصحَّحين في المختبر."), rule: { kind: "labs", count: 2 } },
      { id: "overfit-spotter", icon: "target", title: l("Overfit Spotter", "كاشف فرط التخصيص"), criteria: l("Score 80% or more on the first try in 4 lesson quizzes.", "احصل على 80% أو أكثر من المحاولة الأولى في 4 اختبارات دروس."), rule: { kind: "quizzes", min: 0.8, count: 4 } },
      { id: "ai-practitioner", icon: "graduation", title: l("AI Practitioner", "ممارس ذكاء اصطناعي"), criteria: l("Complete every lesson in the track.", "أكمل كل دروس المسار."), rule: { kind: "course" } },
    ],
    primaryLang: "python",
    sampleCode: {
      lang: "python",
      code: `# Learn y = 2x + 1 from four examples with gradient descent: no libraries.
xs = [0, 1, 2, 3]
ys = [1, 3, 5, 7]
w, b, lr = 0.0, 0.0, 0.05

for step in range(400):
    dw = db = 0.0
    for x, y in zip(xs, ys):
        error = (w * x + b) - y
        dw += 2 * error * x / len(xs)
        db += 2 * error / len(xs)
    w -= lr * dw
    b -= lr * db

print(f"learned w={w:.2f} b={b:.2f}")
print("prediction for x=10:", round(w * 10 + b, 1))
`,
      caption: l("Machine learning in miniature: the model nudges two numbers downhill until its errors shrink. Change the learning rate to 1.0 and watch it fail.", "تعلم الآلة بحجم مصغّر: يدفع النموذج رقمين نحو الأسفل حتى تتقلص أخطاؤه. غيّر معدل التعلم إلى 1.0 وراقبه يفشل."),
      output: "learned w=2.00 b=1.00\nprediction for x=10: 21.0\n",
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "data-science": {
    arabic: { title: "علم البيانات", description: "الإحصاء وبايثون وSQL والتصوير البياني وذكاء الأعمال" },
    objectives: [
      l("Summarize a dataset with mean, median and spread, and flag outliers with the IQR rule.", "لخّص مجموعة بيانات بالمتوسط والوسيط والتشتت، وأشِّر إلى القيم الشاذة بقاعدة IQR."),
      l("Interpret confidence intervals and p-values correctly, and say what an A/B test can and cannot prove.", "فسّر فترات الثقة وقيم p بشكل صحيح، وقل ما يستطيع اختبار A/B إثباته وما لا يستطيع."),
      l("Clean and reshape tabular data with pandas: filter, group, join and handle missing values.", "نظّف البيانات الجدولية وأعد تشكيلها باستخدام pandas: تصفية وتجميع وربط ومعالجة القيم المفقودة."),
      l("Query a database with SQL: joins, GROUP BY, subqueries and window functions.", "استعلم من قاعدة بيانات بـ SQL: الربط والتجميع والاستعلامات الفرعية ودوال النافذة."),
      l("Choose the right chart for a question and avoid misleading scales.", "اختر المخطط المناسب للسؤال وتجنّب المقاييس المضلِّلة."),
      l("Build and validate a predictive model with a train/test split and the right metric.", "ابنِ نموذجاً تنبؤياً وتحقق منه بتقسيم تدريب/اختبار والمقياس المناسب."),
      l("Describe how data pipelines (ETL/ELT) move and clean data, and where they break.", "صف كيف تنقل خطوط البيانات (ETL/ELT) البيانات وتنظّفها وأين تنكسر."),
      l("Publish a portfolio project that turns one clear question into an insight a stakeholder can act on.", "انشر مشروعاً في معرض أعمالك يحوّل سؤالاً واضحاً إلى استنتاج يستطيع صاحب القرار العمل به."),
    ],
    audience: l(
      "Analysts, students and career changers who want to answer questions with data. Starts from zero statistics; a spreadsheet background helps.",
      "المحللون والطلاب والمتحوّلون مهنياً الراغبون في الإجابة عن الأسئلة بالبيانات. يبدأ من الصفر في الإحصاء؛ وخلفية جداول البيانات تساعد."
    ),
    prerequisites: [{ text: l("School-level maths and comfort with a spreadsheet. Python is taught from scratch.", "رياضيات مدرسية وإلمام بجداول البيانات. تُدرَّس بايثون من الصفر.") }],
    estimatedHours: 4.5,
    recommendedOrder: 11,
    recommendedAfter: ["databases"],
    modules: {
      required: { title: l("Analyst fundamentals", "أساسيات المحلل"), summary: l("Statistics, Python and SQL: the daily toolkit.", "الإحصاء وبايثون وSQL: عدّة العمل اليومية.") },
      important: { title: l("Prediction and pipelines", "التنبؤ وخطوط البيانات"), summary: l("Machine learning for analysts and how data reaches you.", "تعلم الآلة للمحللين وكيف تصلك البيانات.") },
      optional: { title: l("Dashboards and career", "اللوحات والمسار المهني"), summary: l("BI tools and a portfolio that gets interviews.", "أدوات ذكاء الأعمال ومعرض أعمال يجلب المقابلات.") },
    },
    assessment: {
      summary: l(
        "A data scientist is judged by answers, not code length: your quizzes show sound statistical reasoning, your labs show you can wrangle and query data correctly, and a challenge tests it on a fresh dataset.",
        "يُحكَم على عالم البيانات بإجاباته لا بطول كوده: اختباراتك تُظهر استدلالاً إحصائياً سليماً، ومختبراتك تُظهر أنك تعالج البيانات وتستعلم منها بصحة، وتحدٍّ يختبرها على بيانات جديدة."
      ),
      passing: passing(0.7, 2, 1),
      criteria: [
        { source: "lessons", title: l("Own the daily toolkit", "أتقن عدّة العمل اليومية"), detail: l("Complete statistics, Python for data, SQL and visualization.", "أكمل الإحصاء وبايثون للبيانات وSQL والتصوير البياني.") },
        { source: "quizzes", title: l("Reason statistically", "استدلّ إحصائياً"), detail: l("Average at least 70% on first-try quizzes about distributions, sampling and chart choice.", "حقق متوسط 70% على الأقل من المحاولة الأولى في اختبارات التوزيعات والعيّنات واختيار المخطط.") },
        { source: "labs", title: l("Wrangle and query", "عالج واستعلم"), detail: l("Pass the group-by aggregation lab in Python and the SQL lab (SQLite) against their tests.", "اجتز مختبر التجميع ببايثون ومختبر SQL (على SQLite) أمام اختباراتهما.") },
        { source: "challenges", title: l("Face new data", "واجه بيانات جديدة"), detail: l("Solve one data-flavoured challenge without reusing a lesson's code verbatim.", "حُلّ تحدّياً واحداً بنكهة البيانات دون نسخ كود درس حرفياً.") },
      ],
    },
    badges: [
      { id: "first-dataset", icon: "chart", title: l("First Dataset", "أول مجموعة بيانات"), criteria: l("Finish your first lesson.", "أنهِ درسك الأول."), rule: { kind: "lessons", count: 1 } },
      { id: "analyst-toolkit", icon: "database", title: l("Analyst Toolkit", "عدّة المحلل"), criteria: l("Complete every fundamentals lesson.", "أكمل كل دروس الأساسيات."), rule: { kind: "module", module: "required" } },
      { id: "query-wrangler", icon: "flask", title: l("Query Wrangler", "مروِّض الاستعلامات"), criteria: l("Pass 2 graded lab exercises.", "اجتز تمرينين مصحَّحين في المختبر."), rule: { kind: "labs", count: 2 } },
      { id: "statistical-mind", icon: "brain", title: l("Statistical Mind", "عقل إحصائي"), criteria: l("Score 80% or more on the first try in 4 lesson quizzes.", "احصل على 80% أو أكثر من المحاولة الأولى في 4 اختبارات دروس."), rule: { kind: "quizzes", min: 0.8, count: 4 } },
      { id: "data-scientist", icon: "graduation", title: l("Data Scientist", "عالم بيانات"), criteria: l("Complete every lesson in the track.", "أكمل كل دروس المسار."), rule: { kind: "course" } },
    ],
    primaryLang: "python",
    sampleCode: {
      lang: "python",
      code: `import statistics as st

salaries = [42, 45, 47, 48, 50, 51, 53, 55, 58, 140]  # in thousands

q1, _, q3 = st.quantiles(salaries, n=4)
iqr = q3 - q1
limit = q3 + 1.5 * iqr
outliers = [s for s in salaries if s > limit]

print("mean  ", round(st.mean(salaries), 1))
print("median", st.median(salaries))
print("outliers above", round(limit, 1), "->", outliers)
`,
      caption: l("One extreme salary drags the mean far above the median: the first thing a statistician checks. Remove the 140 and compare.", "راتب واحد متطرّف يسحب المتوسط بعيداً فوق الوسيط: أول ما يفحصه الإحصائي. احذف القيمة 140 وقارن."),
      output: "mean   58.9\nmedian 50.5\noutliers above 69.0 -> [140]\n",
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "cloud-computing": {
    arabic: { title: "الحوسبة السحابية", description: "AWS وAzure وGCP — المعمارية والنشر والخدمات السحابية" },
    objectives: [
      l("Explain IaaS, PaaS and SaaS and the shared-responsibility model with a concrete example of each.", "اشرح IaaS وPaaS وSaaS ونموذج المسؤولية المشتركة بمثال ملموس لكل منها."),
      l("Choose compute, storage and database services for a workload and justify the trade-off.", "اختر خدمات الحوسبة والتخزين وقواعد البيانات لحِمل عمل ما وبرّر المفاضلة."),
      l("Design a VPC with public and private subnets, routing and security groups.", "صمّم شبكة VPC بشبكات فرعية عامة وخاصة وتوجيه ومجموعات أمان."),
      l("Write infrastructure as code that provisions the same environment repeatably.", "اكتب بنية تحتية كرمز تُنشئ البيئة نفسها بشكل متكرر."),
      l("Apply least-privilege IAM and encryption at rest and in transit.", "طبّق مبدأ أقل صلاحية في IAM والتشفير أثناء التخزين والنقل."),
      l("Compare serverless functions and containers for a given traffic pattern.", "قارن بين الدوال بلا خادم والحاويات لنمط حركة مرور معيّن."),
      l("Estimate monthly cost and reliability using the Well-Architected pillars.", "قدّر التكلفة الشهرية والموثوقية باستخدام ركائز Well-Architected."),
      l("Design a multi-AZ architecture and calculate the availability it achieves.", "صمّم معمارية متعددة مناطق التوافر واحسب التوافر الذي تحققه."),
    ],
    audience: l(
      "IT staff, developers and students heading toward cloud engineer or architect roles and entry-level cloud certifications.",
      "موظفو تقنية المعلومات والمطورون والطلاب المتجهون إلى أدوار مهندس السحابة أو مصمّمها والشهادات السحابية المبتدئة."
    ),
    prerequisites: [{ text: l("Basic IT literacy: files, networks, using a terminal. Fundamentals are refreshed in lesson 1.", "إلمام تقني أساسي: الملفات والشبكات واستخدام الطرفية. تُراجَع الأساسيات في الدرس الأول.") }],
    estimatedHours: 4.5,
    recommendedOrder: 9,
    recommendedAfter: ["networking"],
    modules: {
      required: { title: l("Cloud foundations", "أساسيات السحابة"), summary: l("IT basics, cloud models, core AWS services and networking.", "أساسيات تقنية المعلومات ونماذج السحابة وخدمات AWS الأساسية والشبكات.") },
      important: { title: l("Build and secure", "ابنِ وأمّن"), summary: l("Infrastructure as code, security and serverless compute.", "البنية كرمز والأمان والحوسبة بلا خادم.") },
      optional: { title: l("Architecture", "المعمارية"), summary: l("Design resilient, cost-aware systems.", "صمّم أنظمة مرنة تراعي التكلفة.") },
    },
    assessment: {
      summary: l(
        "Cloud skill is design judgement: quizzes test whether you pick the right service and the safe default, and the lab makes you do the networking and availability arithmetic yourself.",
        "مهارة السحابة حُكم تصميمي: تختبر الاختبارات اختيارك للخدمة المناسبة والإعداد الآمن، ويجعلك المختبر تُجري حسابات الشبكات والتوافر بنفسك."
      ),
      passing: passing(0.7, 1, 1),
      criteria: [
        { source: "lessons", title: l("Learn the building blocks", "تعلّم اللبنات"), detail: l("Complete IT fundamentals, cloud concepts, AWS core services and cloud networking.", "أكمل أساسيات تقنية المعلومات ومفاهيم السحابة وخدمات AWS الأساسية وشبكات السحابة.") },
        { source: "quizzes", title: l("Choose the right service", "اختر الخدمة المناسبة"), detail: l("Average at least 70% on first-try quizzes about service selection, IAM and shared responsibility.", "حقق متوسط 70% على الأقل من المحاولة الأولى في اختبارات اختيار الخدمة وIAM والمسؤولية المشتركة.") },
        { source: "labs", title: l("Do the network maths", "احسب الشبكة بنفسك"), detail: l("Pass the CIDR subnet-planning lab: split an address block into correctly sized subnets.", "اجتز مختبر تخطيط الشبكات الفرعية بـ CIDR: قسّم كتلة عناوين إلى شبكات فرعية بأحجام صحيحة.") },
        { source: "challenges", title: l("Debug an infrastructure puzzle", "افحص لغز بنية تحتية"), detail: l("Solve one systems-flavoured challenge (misconfiguration or networking).", "حُلّ تحدّياً واحداً بنكهة الأنظمة (إعداد خاطئ أو شبكات).") },
      ],
    },
    badges: [
      { id: "first-cloud", icon: "cloud", title: l("Head in the Cloud", "رأسك في السحابة"), criteria: l("Finish your first lesson.", "أنهِ درسك الأول."), rule: { kind: "lessons", count: 1 } },
      { id: "cloud-foundations", icon: "server", title: l("Cloud Foundations", "أساسيات السحابة"), criteria: l("Complete every foundations lesson.", "أكمل كل دروس الأساسيات."), rule: { kind: "module", module: "required" } },
      { id: "subnet-planner", icon: "network", title: l("Subnet Planner", "مخطِّط الشبكات"), criteria: l("Pass a graded lab exercise.", "اجتز تمريناً مصحَّحاً في المختبر."), rule: { kind: "labs", count: 1 } },
      { id: "well-architected", icon: "layers", title: l("Well-Architected", "معمارية سليمة"), criteria: l("Score 80% or more on the first try in 4 lesson quizzes.", "احصل على 80% أو أكثر من المحاولة الأولى في 4 اختبارات دروس."), rule: { kind: "quizzes", min: 0.8, count: 4 } },
      { id: "cloud-engineer", icon: "graduation", title: l("Cloud Engineer", "مهندس سحابة"), criteria: l("Complete every lesson in the track.", "أكمل كل دروس المسار."), rule: { kind: "course" } },
    ],
    primaryLang: "python",
    sampleCode: {
      lang: "javascript",
      code: `// Availability of a service that needs ALL parts (serial) vs ANY part (parallel).
const serial = (...a) => a.reduce((p, x) => p * x, 1);
const parallel = (...a) => 1 - a.reduce((p, x) => p * (1 - x), 1);

const web = 0.995;   // one web server: 99.5%
const db = 0.999;    // managed database: 99.9%

const singleAz = serial(web, db);
const twoAz = serial(parallel(web, web), db);

const pct = (x) => (x * 100).toFixed(3) + "%";
console.log("one AZ  :", pct(singleAz));
console.log("two AZs :", pct(twoAz));
console.log("downtime/yr:", Math.round((1 - twoAz) * 525600), "minutes");
`,
      caption: l("Why architects add a second Availability Zone: redundancy multiplies the failure probabilities. Notice the database is now the weakest link.", "لماذا يضيف المعماريون منطقة توافر ثانية: التكرار يضاعف احتمالات الفشل. لاحظ أن قاعدة البيانات أصبحت الحلقة الأضعف."),
      output: "one AZ  : 99.401%\ntwo AZs : 99.900%\ndowntime/yr: 526 minutes\n",
    },
    lessonLinks: {
      "networking-cloud": { lang: "python" },
      iac: { lab: false },
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  devops: {
    arabic: { title: "DevOps", description: "التكامل والنشر المستمر والحاويات وKubernetes والبنية كرمز والمراقبة" },
    objectives: [
      l("Automate repetitive tasks with Bash scripts, pipes and exit codes.", "أتمت المهام المتكررة بسكربتات Bash والأنابيب ورموز الخروج."),
      l("Use Git branching and pull requests, and resolve a merge conflict without losing work.", "استخدم تفرّعات Git وطلبات الدمج، وحُلّ تعارض دمج دون ضياع العمل."),
      l("Containerize an application with a Dockerfile and explain layers and build caching.", "حوِّل تطبيقاً إلى حاوية بملف Dockerfile واشرح الطبقات وتخزين البناء المؤقت."),
      l("Design a CI pipeline (build, test, scan, deploy) that fails fast and is cheap to run.", "صمّم خط CI (بناء، اختبار، فحص، نشر) يفشل مبكراً ورخيص التشغيل."),
      l("Describe Pods, Deployments and Services, and perform a rolling update with a rollback plan.", "صف Pods وDeployments وServices ونفّذ تحديثاً متدرجاً بخطة تراجع."),
      l("Define environments as code and review a plan diff before applying it.", "عرّف البيئات كرمز وراجع فروقات الخطة قبل تطبيقها."),
      l("Instrument a service with metrics and logs, define an SLO and compute its error budget.", "زوّد خدمة بالمقاييس والسجلات وعرّف SLO واحسب ميزانية الأخطاء."),
      l("Add security gates (secret scanning, dependency and image scanning) to a pipeline.", "أضف بوابات أمان (فحص الأسرار والاعتماديات والصور) إلى خط التسليم."),
    ],
    audience: l(
      "Developers, sysadmins and students aiming at DevOps, SRE or platform-engineering roles.",
      "المطورون ومديرو الأنظمة والطلاب الساعون إلى أدوار DevOps أو SRE أو هندسة المنصات."
    ),
    prerequisites: [
      { text: l("Comfort at the command line and basic Git. Both are reviewed in the first two lessons.", "إلمام بسطر الأوامر وأساسيات Git. يُراجَع الاثنان في أول درسين.") },
    ],
    estimatedHours: 4,
    recommendedOrder: 8,
    recommendedAfter: ["operating-systems", "networking"],
    modules: {
      required: { title: l("The delivery toolchain", "أدوات التسليم"), summary: l("Shell, Git, containers and your first pipeline.", "الطرفية وGit والحاويات وأول خط تسليم.") },
      important: { title: l("Run it in production", "شغّله في الإنتاج"), summary: l("Kubernetes, environments as code and observability.", "Kubernetes والبيئات كرمز والمراقبة.") },
      optional: { title: l("Secure delivery", "تسليم آمن"), summary: l("Shift security left without slowing teams down.", "قدّم الأمان مبكراً دون إبطاء الفرق.") },
    },
    assessment: {
      summary: l(
        "DevOps is judged on reliability and repeatability: quizzes check your reasoning about pipelines and failure, and the shell lab proves you can script a task that gives the same answer every time.",
        "يُقاس DevOps بالموثوقية وقابلية التكرار: تفحص الاختبارات استدلالك عن خطوط التسليم والأعطال، ويثبت مختبر الطرفية أنك تكتب سكربتاً يعطي النتيجة نفسها كل مرة."
      ),
      passing: passing(0.7, 1, 1),
      criteria: [
        { source: "lessons", title: l("Cover the toolchain", "غطِّ سلسلة الأدوات"), detail: l("Complete the Linux, Git, Docker and CI/CD lessons.", "أكمل دروس لينكس وGit وDocker وCI/CD.") },
        { source: "quizzes", title: l("Reason about failure", "استدلّ على الأعطال"), detail: l("Average at least 70% on first-try quizzes about pipelines, rollbacks and observability.", "حقق متوسط 70% على الأقل من المحاولة الأولى في اختبارات خطوط التسليم والتراجع والمراقبة.") },
        { source: "labs", title: l("Script it", "اكتبه كسكربت"), detail: l("Pass the Bash log-summary lab: parse input, aggregate and print stable output.", "اجتز مختبر تلخيص السجلات ببَاش: حلّل المدخل وجمّعه واطبع مخرجات ثابتة.") },
        { source: "challenges", title: l("Fix a broken system", "أصلح نظاماً معطوباً"), detail: l("Solve one systems challenge (permissions, processes or networking).", "حُلّ تحدّياً واحداً في الأنظمة (الصلاحيات أو العمليات أو الشبكات).") },
      ],
    },
    badges: [
      { id: "first-pipeline", icon: "git-branch", title: l("First Commit", "أول إيداع"), criteria: l("Finish your first lesson.", "أنهِ درسك الأول."), rule: { kind: "lessons", count: 1 } },
      { id: "toolchain-ready", icon: "container", title: l("Toolchain Ready", "السلسلة جاهزة"), criteria: l("Complete every toolchain lesson.", "أكمل كل دروس سلسلة الأدوات."), rule: { kind: "module", module: "required" } },
      { id: "shell-scripter", icon: "terminal", title: l("Shell Scripter", "كاتب سكربتات"), criteria: l("Pass a graded lab exercise.", "اجتز تمريناً مصحَّحاً في المختبر."), rule: { kind: "labs", count: 1 } },
      { id: "reliability-minded", icon: "gauge-ph" as never, title: l("Reliability-Minded", "عقلية الموثوقية"), criteria: l("Score 80% or more on the first try in 4 lesson quizzes.", "احصل على 80% أو أكثر من المحاولة الأولى في 4 اختبارات دروس."), rule: { kind: "quizzes", min: 0.8, count: 4 } },
      { id: "devops-engineer", icon: "graduation", title: l("DevOps Engineer", "مهندس DevOps"), criteria: l("Complete every lesson in the track.", "أكمل كل دروس المسار."), rule: { kind: "course" } },
    ],
    primaryLang: "bash",
    sampleCode: {
      lang: "javascript",
      code: `// An SLO is a promise; the error budget is how much failure it allows.
function errorBudget(sloPercent, days) {
  const totalMinutes = days * 24 * 60;
  return totalMinutes * (1 - sloPercent / 100);
}

for (const slo of [99, 99.9, 99.99]) {
  const minutes = errorBudget(slo, 30);
  console.log(slo + "% over 30 days ->", minutes.toFixed(1), "minutes of downtime allowed");
}
`,
      caption: l("Every extra nine cuts the downtime you can afford by 10×, which is why SLOs drive how you deploy. Try a 7-day window.", "كل رقم تسعة إضافي يقلّص التوقف المسموح 10 أضعاف، ولذلك تحدّد أهداف SLO طريقة نشرك. جرّب نافذة 7 أيام."),
      output: "99% over 30 days -> 432.0 minutes of downtime allowed\n99.9% over 30 days -> 43.2 minutes of downtime allowed\n99.99% over 30 days -> 4.3 minutes of downtime allowed\n",
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  frontend: {
    arabic: { title: "تطوير الواجهات الأمامية", description: "HTML وCSS وJavaScript وReact وتطوير الويب الحديث" },
    objectives: [
      l("Build semantic, accessible HTML pages that work with a keyboard and a screen reader.", "ابنِ صفحات HTML دلالية وسهلة الوصول تعمل بلوحة المفاتيح وقارئ الشاشة."),
      l("Lay out responsive pages with Flexbox, Grid and media queries from 360px up.", "نسّق صفحات متجاوبة بـ Flexbox وGrid واستعلامات الوسائط ابتداءً من عرض 360px."),
      l("Write JavaScript that handles events, transforms arrays and fetches data asynchronously.", "اكتب جافاسكربت تعالج الأحداث وتحوّل المصفوفات وتجلب البيانات بشكل غير متزامن."),
      l("Use Git and GitHub to save work, branch and open a pull request.", "استخدم Git وGitHub لحفظ العمل والتفريع وفتح طلب دمج."),
      l("Compose React components with props and state and lift state when two components share it.", "ركّب مكوّنات React بالخصائص والحالة وارفع الحالة حين يتشاركها مكوّنان."),
      l("Add TypeScript types that catch bugs before the browser does.", "أضف أنواع TypeScript تلتقط الأخطاء قبل المتصفح."),
      l("Ship a routed Next.js app with data fetching and a production build.", "انشر تطبيق Next.js بتوجيه وجلب بيانات وبناء إنتاجي."),
      l("Test components and measure performance against Core Web Vitals.", "اختبر المكوّنات وقِس الأداء مقابل Core Web Vitals."),
    ],
    audience: l(
      "Complete beginners and career changers who want to build real websites and land a junior frontend role or first freelance clients.",
      "المبتدئون تماماً والمتحوّلون مهنياً الراغبون في بناء مواقع حقيقية والحصول على وظيفة مطوّر واجهات مبتدئ أو أول عملاء مستقلين."
    ),
    prerequisites: [{ text: l("None. You need a computer, a browser and a free afternoon.", "لا شيء. تحتاج حاسوباً ومتصفحاً وبعد ظهر فارغ.") }],
    estimatedHours: 5.5,
    recommendedOrder: 5,
    recommendedAfter: [],
    modules: {
      required: { title: l("Web fundamentals", "أساسيات الويب"), summary: l("HTML, CSS, JavaScript, Git and your first React components.", "HTML وCSS وجافاسكربت وGit ومكوّنات React الأولى.") },
      important: { title: l("Modern frontend stack", "حزمة الواجهات الحديثة"), summary: l("TypeScript, Tailwind, Next.js and getting paid for your skills.", "TypeScript وTailwind وNext.js والحصول على دخل من مهاراتك.") },
      optional: { title: l("Quality and performance", "الجودة والأداء"), summary: l("Test it, measure it, ship with confidence.", "اختبره وقِسه وانشره بثقة.") },
    },
    assessment: {
      summary: l(
        "Frontend skill is shown by working pages: quizzes check your mental model of the DOM and React, in-lesson exercises are checked in your browser, and graded labs verify your logic in plain JavaScript and TypeScript.",
        "تظهر مهارة الواجهات في الصفحات العاملة: تفحص الاختبارات نموذجك الذهني لـ DOM وReact، وتُفحص تمارين الدروس في متصفحك، وتتحقق المختبرات المصحَّحة من منطقك في جافاسكربت وتايب سكربت."
      ),
      passing: passing(0.7, 2, 1),
      criteria: [
        { source: "lessons", title: l("Build the core", "ابنِ الأساس"), detail: l("Complete HTML & CSS, JavaScript, Git and React.", "أكمل HTML وCSS وجافاسكربت وGit وReact.") },
        { source: "quizzes", title: l("Know why it works", "اعرف لماذا يعمل"), detail: l("Average at least 70% on first-try quizzes about the DOM, the box model, state and props.", "حقق متوسط 70% على الأقل من المحاولة الأولى في اختبارات DOM ونموذج الصندوق والحالة والخصائص.") },
        { source: "labs", title: l("Write logic that passes tests", "اكتب منطقاً يجتاز الاختبارات"), detail: l("Pass the JavaScript text-processing lab and the TypeScript typing lab.", "اجتز مختبر معالجة النصوص بجافاسكربت ومختبر الأنواع بتايب سكربت.") },
        { source: "challenges", title: l("Solve a web challenge", "حُلّ تحدّي ويب"), detail: l("Solve one frontend or web-security challenge on your own.", "حُلّ تحدّي واجهات أو أمان ويب بنفسك.") },
      ],
    },
    badges: [
      { id: "hello-web", icon: "globe", title: l("Hello, Web", "مرحباً أيها الويب"), criteria: l("Finish your first lesson.", "أنهِ درسك الأول."), rule: { kind: "lessons", count: 1 } },
      { id: "web-fundamentals", icon: "layers", title: l("Web Fundamentals", "أساسيات الويب"), criteria: l("Complete every fundamentals lesson.", "أكمل كل دروس الأساسيات."), rule: { kind: "module", module: "required" } },
      { id: "logic-builder", icon: "code", title: l("Logic Builder", "بنّاء المنطق"), criteria: l("Pass 2 graded lab exercises.", "اجتز تمرينين مصحَّحين في المختبر."), rule: { kind: "labs", count: 2 } },
      { id: "dom-whisperer", icon: "eye", title: l("DOM Whisperer", "همّاس الـ DOM"), criteria: l("Score 80% or more on the first try in 4 lesson quizzes.", "احصل على 80% أو أكثر من المحاولة الأولى في 4 اختبارات دروس."), rule: { kind: "quizzes", min: 0.8, count: 4 } },
      { id: "frontend-developer", icon: "graduation", title: l("Frontend Developer", "مطوّر واجهات"), criteria: l("Complete every lesson in the track.", "أكمل كل دروس المسار."), rule: { kind: "course" } },
    ],
    primaryLang: "javascript",
    sampleCode: {
      lang: "javascript",
      code: `// Never put user text into HTML unescaped: that is how XSS happens.
const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const comments = ["Great post!", "<img src=x onerror=alert(1)>", 'Use "strict" mode'];

const html = "<ul>\\n" + comments.map((c) => "  <li>" + escapeHtml(c) + "</li>").join("\\n") + "\\n</ul>";
console.log(html);
`,
      caption: l("Rendering a comment list safely. The second comment is an attack: see how it is neutralized. Remove escapeHtml to see what a browser would execute.", "عرض قائمة تعليقات بأمان. التعليق الثاني هجوم: لاحظ كيف يُبطَل. احذف escapeHtml لترى ما كان المتصفح سينفّذه."),
      output: "<ul>\n  <li>Great post!</li>\n  <li>&lt;img src=x onerror=alert(1)&gt;</li>\n  <li>Use &quot;strict&quot; mode</li>\n</ul>\n",
    },
    lessonLinks: {
      typescript: { lang: "typescript" },
      "html-css": { lab: false },
      "css-frameworks": { lab: false },
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  backend: {
    arabic: { title: "تطوير الخلفيات", description: "واجهات API وقواعد البيانات والمصادقة ومعمارية الخوادم القابلة للتوسع" },
    objectives: [
      l("Write functions with control flow and data structures to solve problems and cover edge cases.", "اكتب دوالاً بتدفق تحكم وهياكل بيانات لحلّ المسائل وتغطية الحالات الحدّية."),
      l("Model data relationally and write SQL for create, read, update, delete and joins.", "نمذج البيانات علائقياً واكتب SQL لعمليات الإنشاء والقراءة والتحديث والحذف والربط."),
      l("Design REST endpoints with correct verbs, status codes and input validation.", "صمّم نقاط REST بأفعال ورموز حالة صحيحة وتحقق من المدخلات."),
      l("Hash passwords properly and implement token-based authentication safely.", "جزّئ كلمات المرور بشكل صحيح ونفّذ المصادقة بالرموز بأمان."),
      l("Build a Node.js HTTP service with routing and middleware.", "ابنِ خدمة HTTP بـ Node.js مع توجيه وبرمجيات وسيطة."),
      l("Use a cache and a queue to cut latency and absorb traffic spikes.", "استخدم ذاكرة تخزين مؤقت وطابوراً لتقليل الاستجابة وامتصاص الذروات."),
      l("Containerize and deploy a service with configuration from the environment.", "حوِّل خدمة إلى حاوية وانشرها بإعدادات من البيئة."),
      l("Sketch a system design with back-of-envelope capacity numbers (requests per second, storage).", "ارسم تصميم نظام بأرقام سعة تقريبية (طلبات في الثانية، التخزين)."),
    ],
    audience: l(
      "Learners with a little programming exposure who want to build the server side: APIs, databases and the plumbing behind apps.",
      "المتعلمون الذين لديهم خلفية بسيطة في البرمجة ويريدون بناء الجانب الخادمي: واجهات API وقواعد البيانات والبنية خلف التطبيقات."
    ),
    prerequisites: [{ text: l("Variables, loops and functions in any language. Lesson 1 refreshes them in JavaScript.", "المتغيرات والحلقات والدوال بأي لغة. يراجعها الدرس الأول بجافاسكربت.") }],
    estimatedHours: 5,
    recommendedOrder: 6,
    recommendedAfter: ["databases"],
    modules: {
      required: { title: l("Server-side core", "نواة الخادم"), summary: l("Programming basics, SQL, REST APIs and authentication.", "أساسيات البرمجة وSQL وواجهات REST والمصادقة.") },
      important: { title: l("Build and scale", "ابنِ ووسّع"), summary: l("Node.js services, caching, queues and deployment.", "خدمات Node.js والتخزين المؤقت والطوابير والنشر.") },
      optional: { title: l("System design", "تصميم الأنظمة"), summary: l("Reason about capacity and failure at scale.", "استدلّ على السعة والأعطال على نطاق واسع.") },
    },
    assessment: {
      summary: l(
        "Backend work must be correct before it is fast: quizzes test API and security reasoning, labs grade your SQL and logic against edge cases, and a challenge adds hidden-test pressure.",
        "يجب أن يكون العمل الخلفي صحيحاً قبل أن يكون سريعاً: تختبر الاختبارات استدلالك عن API والأمان، وتقيّم المختبرات SQL ومنطقك على الحالات الحدّية، ويضيف التحدّي ضغط اختبارات خفيّة."
      ),
      passing: passing(0.7, 2, 1),
      criteria: [
        { source: "lessons", title: l("Learn the server side", "تعلّم جانب الخادم"), detail: l("Complete programming basics, databases, REST APIs and authentication.", "أكمل أساسيات البرمجة وقواعد البيانات وواجهات REST والمصادقة.") },
        { source: "quizzes", title: l("Reason about APIs and security", "استدلّ على API والأمان"), detail: l("Average at least 70% on first-try quizzes about status codes, hashing and token expiry.", "حقق متوسط 70% على الأقل من المحاولة الأولى في اختبارات رموز الحالة والتجزئة وانتهاء الرموز.") },
        { source: "labs", title: l("Write correct queries and logic", "اكتب استعلامات ومنطقاً صحيحين"), detail: l("Pass the SQL lab (SQLite) and the request-validation lab against their tests.", "اجتز مختبر SQL (على SQLite) ومختبر التحقق من الطلبات أمام اختباراتهما.") },
        { source: "challenges", title: l("Beat hidden tests", "اجتز الاختبارات الخفيّة"), detail: l("Solve one backend or algorithm challenge graded by hidden tests.", "حُلّ تحدّياً خلفياً أو في الخوارزميات يُصحَّح باختبارات خفيّة.") },
      ],
    },
    badges: [
      { id: "first-endpoint", icon: "server", title: l("First Endpoint", "أول نقطة وصول"), criteria: l("Finish your first lesson.", "أنهِ درسك الأول."), rule: { kind: "lessons", count: 1 } },
      { id: "server-core", icon: "database", title: l("Server-Side Core", "نواة الخادم"), criteria: l("Complete every core lesson.", "أكمل كل الدروس الأساسية."), rule: { kind: "module", module: "required" } },
      { id: "query-craftsperson", icon: "flask", title: l("Query Craft", "حِرفة الاستعلام"), criteria: l("Pass 2 graded lab exercises.", "اجتز تمرينين مصحَّحين في المختبر."), rule: { kind: "labs", count: 2 } },
      { id: "api-thinker", icon: "target", title: l("API Thinker", "مفكّر API"), criteria: l("Score 80% or more on the first try in 4 lesson quizzes.", "احصل على 80% أو أكثر من المحاولة الأولى في 4 اختبارات دروس."), rule: { kind: "quizzes", min: 0.8, count: 4 } },
      { id: "backend-developer", icon: "graduation", title: l("Backend Developer", "مطوّر خلفية"), criteria: l("Complete every lesson in the track.", "أكمل كل دروس المسار."), rule: { kind: "course" } },
    ],
    primaryLang: "javascript",
    sampleCode: {
      lang: "javascript",
      code: `// A token-bucket rate limiter: the engine behind "429 Too Many Requests".
function createLimiter(capacity, refillPerSecond) {
  let tokens = capacity;
  let last = 0;
  return function allow(nowSeconds) {
    tokens = Math.min(capacity, tokens + (nowSeconds - last) * refillPerSecond);
    last = nowSeconds;
    if (tokens < 1) return false;
    tokens -= 1;
    return true;
  };
}

const allow = createLimiter(3, 1); // burst of 3, then 1 request per second
const arrivals = [0, 0.1, 0.2, 0.3, 0.4, 1.5, 3.5];
for (const t of arrivals) console.log("t=" + t + "s", allow(t) ? "200 OK" : "429 Too Many Requests");
`,
      caption: l("Bursts are allowed until the bucket empties, then requests are rejected until it refills. Change the capacity and watch the pattern move.", "تُسمح الدفعات حتى يفرغ الدلو ثم تُرفض الطلبات حتى يمتلئ من جديد. غيّر السعة وراقب النمط يتحرك."),
      output: "t=0s 200 OK\nt=0.1s 200 OK\nt=0.2s 200 OK\nt=0.3s 429 Too Many Requests\nt=0.4s 429 Too Many Requests\nt=1.5s 200 OK\nt=3.5s 200 OK\n",
    },
    lessonLinks: {
      databases: { lang: "python" },
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "ui-ux": {
    arabic: { title: "تصميم UI/UX", description: "أبحاث المستخدم والإطارات الشبكية والنماذج الأولية وأنظمة التصميم" },
    objectives: [
      l("Critique a screen using hierarchy, contrast, alignment and proximity, and propose specific fixes.", "انتقد شاشة باستخدام التسلسل الهرمي والتباين والمحاذاة والتقارب واقترح إصلاحات محددة."),
      l("Build a type scale and a colour palette whose text meets WCAG AA contrast (4.5:1).", "ابنِ سلّماً للخطوط ولوحة ألوان يحقق نصها تباين WCAG AA (4.5:1)."),
      l("Design flows in Figma with frames, auto layout and reusable components.", "صمّم تدفقات في Figma بالإطارات والتخطيط التلقائي ومكوّنات قابلة لإعادة الاستخدام."),
      l("Plan and run user interviews, then synthesize findings into insights.", "خطّط لمقابلات المستخدمين ونفّذها ثم لخّص النتائج في استنتاجات."),
      l("Create low-fidelity wireframes and an information architecture validated with a card sort.", "أنشئ إطارات سلكية منخفضة الدقة وهيكل معلومات يُتحقق منه بفرز البطاقات."),
      l("Build a clickable prototype and test it with five users to find the top usability problems.", "ابنِ نموذجاً أولياً قابلاً للنقر واختبره مع خمسة مستخدمين لإيجاد أهم مشكلات الاستخدام."),
      l("Document tokens and components in a design system developers can implement.", "وثّق الرموز والمكوّنات في نظام تصميم يستطيع المطورون تنفيذه."),
      l("Audit a design for accessibility: keyboard, screen reader and colour contrast.", "دقّق تصميماً في إمكانية الوصول: لوحة المفاتيح وقارئ الشاشة وتباين الألوان."),
    ],
    audience: l(
      "Beginners and career changers moving into UI design, UX research or product design, and developers who want to design better.",
      "المبتدئون والمتحوّلون مهنياً نحو تصميم الواجهات أو أبحاث تجربة المستخدم أو تصميم المنتجات، والمطورون الراغبون في تصميم أفضل."
    ),
    prerequisites: [{ text: l("None. Curiosity about how people use things is enough.", "لا شيء. يكفي الفضول حول كيفية استخدام الناس للأشياء.") }],
    estimatedHours: 4,
    recommendedOrder: 7,
    recommendedAfter: [],
    modules: {
      required: { title: l("Design foundations", "أسس التصميم"), summary: l("Principles, typography, colour, Figma and user research.", "المبادئ والخطوط والألوان وFigma وأبحاث المستخدم.") },
      important: { title: l("From idea to prototype", "من الفكرة إلى النموذج الأولي"), summary: l("Wireframes, flows and testable prototypes.", "الإطارات السلكية والتدفقات والنماذج القابلة للاختبار.") },
      optional: { title: l("Scale and inclusion", "التوسع والشمول"), summary: l("Design systems and accessibility.", "أنظمة التصميم وإمكانية الوصول.") },
    },
    assessment: {
      summary: l(
        "Design quality can be measured: quizzes check your reasoning, in-lesson exercises render real HTML and CSS you can inspect, and the contrast lab proves you can calculate accessibility instead of eyeballing it.",
        "جودة التصميم قابلة للقياس: تفحص الاختبارات استدلالك، وتعرض تمارين الدروس HTML وCSS حقيقيين يمكنك فحصهما، ويثبت مختبر التباين أنك تحسب إمكانية الوصول بدل التخمين."
      ),
      passing: passing(0.7, 1, 1),
      criteria: [
        { source: "lessons", title: l("Learn the craft", "تعلّم الحرفة"), detail: l("Complete design principles, typography and colour, Figma and user research.", "أكمل مبادئ التصميم والخطوط والألوان وFigma وأبحاث المستخدم.") },
        { source: "quizzes", title: l("Defend design decisions", "دافع عن قرارات التصميم"), detail: l("Average at least 70% on first-try quizzes about hierarchy, research methods and usability.", "حقق متوسط 70% على الأقل من المحاولة الأولى في اختبارات التسلسل الهرمي ومناهج البحث وقابلية الاستخدام.") },
        { source: "labs", title: l("Calculate accessibility", "احسب إمكانية الوصول"), detail: l("Pass the WCAG contrast-ratio lab: compute the ratio and the AA verdict for colour pairs.", "اجتز مختبر نسبة التباين وفق WCAG: احسب النسبة وحكم AA لأزواج الألوان.") },
        { source: "challenges", title: l("Spot the accessibility bug", "اكتشف خلل الوصول"), detail: l("Solve one web or accessibility-flavoured challenge.", "حُلّ تحدّياً بنكهة الويب أو إمكانية الوصول.") },
      ],
    },
    badges: [
      { id: "first-frame", icon: "pen-tool", title: l("First Frame", "الإطار الأول"), criteria: l("Finish your first lesson.", "أنهِ درسك الأول."), rule: { kind: "lessons", count: 1 } },
      { id: "design-foundations", icon: "palette", title: l("Design Foundations", "أسس التصميم"), criteria: l("Complete every foundations lesson.", "أكمل كل دروس الأسس."), rule: { kind: "module", module: "required" } },
      { id: "contrast-checker", icon: "eye", title: l("Contrast Checker", "فاحص التباين"), criteria: l("Pass a graded lab exercise.", "اجتز تمريناً مصحَّحاً في المختبر."), rule: { kind: "labs", count: 1 } },
      { id: "user-advocate", icon: "target", title: l("User Advocate", "نصير المستخدم"), criteria: l("Score 80% or more on the first try in 4 lesson quizzes.", "احصل على 80% أو أكثر من المحاولة الأولى في 4 اختبارات دروس."), rule: { kind: "quizzes", min: 0.8, count: 4 } },
      { id: "product-designer", icon: "graduation", title: l("Product Designer", "مصمّم منتجات"), criteria: l("Complete every lesson in the track.", "أكمل كل دروس المسار."), rule: { kind: "course" } },
    ],
    primaryLang: "javascript",
    sampleCode: {
      lang: "javascript",
      code: `// WCAG contrast ratio: the number behind "is this text readable?"
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(fg, bg) {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

for (const [fg, bg] of [["#767676", "#ffffff"], ["#949494", "#ffffff"], ["#ffffff", "#0b57d0"]]) {
  const ratio = contrast(fg, bg);
  console.log(fg, "on", bg, "->", ratio.toFixed(2) + ":1", ratio >= 4.5 ? "passes AA" : "fails AA");
}
`,
      caption: l("Light grey text looks elegant and fails millions of readers. Swap in your brand colours and check them before they ship.", "النص الرمادي الفاتح يبدو أنيقاً لكنه يخذل ملايين القرّاء. ضع ألوان علامتك وافحصها قبل الإطلاق."),
      output: "#767676 on #ffffff -> 4.54:1 passes AA\n#949494 on #ffffff -> 3.03:1 fails AA\n#ffffff on #0b57d0 -> 6.89:1 passes AA\n",
    },
    lessonLinks: {
      figma: { lab: false },
      "user-research": { lab: false },
      wireframing: { lab: false },
      prototyping: { lab: false },
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  networking: {
    arabic: { title: "الشبكات", description: "كيف تنتقل البيانات: نموذجا OSI وTCP/IP وعنونة IP وتقسيم الشبكات والتوجيه وDNS وHTTP وTLS واستكشاف الأعطال" },
    objectives: [
      l("Explain what each OSI and TCP/IP layer does and place protocols (Ethernet, IP, TCP, HTTP) on the right layer.", "اشرح وظيفة كل طبقة في OSI وTCP/IP وضع البروتوكولات (Ethernet وIP وTCP وHTTP) في الطبقة الصحيحة."),
      l("Convert between binary and dotted-decimal and compute the network, broadcast and usable host range of any IPv4 CIDR block.", "حوّل بين الثنائي والعشري المنقّط واحسب عنوان الشبكة والبث ونطاق المضيفين المتاح لأي كتلة IPv4 بـ CIDR."),
      l("Plan a subnetting scheme (VLSM) for an office from host-count requirements without wasting addresses.", "خطّط لمخطط شبكات فرعية (VLSM) لمكتب انطلاقاً من أعداد الأجهزة دون هدر العناوين."),
      l("Read a routing table and predict the next hop using longest-prefix match.", "اقرأ جدول توجيه وتنبّأ بالقفزة التالية بمطابقة أطول بادئة."),
      l("Trace a DNS lookup from resolver to root, TLD and authoritative server and diagnose failures with dig.", "تتبّع بحث DNS من المحلّل إلى الجذر والنطاق الأعلى والخادم المخوَّل وشخّص الأعطال بـ dig."),
      l("Walk through a TCP handshake and a TLS connection and read HTTP request and response headers.", "تتبّع مصافحة TCP واتصال TLS واقرأ ترويسات طلب HTTP واستجابته."),
      l("Troubleshoot connectivity layer by layer with ping, traceroute, ss and a packet capture.", "شخّص مشكلات الاتصال طبقة بطبقة بـ ping وtraceroute وss والتقاط الحزم."),
    ],
    audience: l(
      "Future network engineers, sysadmins, developers and security analysts who need to understand how data really travels.",
      "مهندسو الشبكات ومديرو الأنظمة والمطورون ومحللو الأمن المستقبليون الذين يحتاجون إلى فهم كيف تنتقل البيانات فعلاً."
    ),
    prerequisites: [{ text: l("None. Comfort with binary numbers helps and is taught early.", "لا شيء. الإلمام بالأعداد الثنائية يفيد ويُدرَّس مبكراً.") }],
    estimatedHours: 6,
    estimateOnly: true,
    recommendedOrder: 1,
    recommendedAfter: [],
    modules: {
      required: { title: l("How data travels", "كيف تنتقل البيانات"), summary: l("Layers, addressing, subnetting and routing: the core model.", "الطبقات والعنونة والشبكات الفرعية والتوجيه: النموذج الأساسي.") },
      important: { title: l("Services on the network", "الخدمات على الشبكة"), summary: l("DNS, HTTP, TLS and the protocols apps depend on.", "DNS وHTTP وTLS والبروتوكولات التي تعتمد عليها التطبيقات.") },
      optional: { title: l("Troubleshooting and design", "التشخيص والتصميم"), summary: l("Find faults fast and design small networks.", "اعثر على الأعطال بسرعة وصمّم شبكات صغيرة.") },
    },
    assessment: {
      summary: l(
        "Networking mastery is calculation plus diagnosis: you subnet by hand, predict routing decisions, and explain a failing connection layer by layer. Graded labs check your arithmetic automatically.",
        "إتقان الشبكات حساب وتشخيص: تقسّم الشبكات يدوياً وتتنبأ بقرارات التوجيه وتشرح اتصالاً فاشلاً طبقة بطبقة. وتتحقق المختبرات المصحَّحة من حساباتك تلقائياً."
      ),
      passing: passing(0.7, 2, 1),
      criteria: [
        { source: "lessons", title: l("Learn the model", "تعلّم النموذج"), detail: l("Complete every foundations lesson: layers, IP addressing, subnetting and routing.", "أكمل كل دروس الأساسيات: الطبقات وعنونة IP وتقسيم الشبكات والتوجيه.") },
        { source: "quizzes", title: l("Explain the layers", "اشرح الطبقات"), detail: l("Average at least 70% on first-try quizzes about protocols, handshakes and name resolution.", "حقق متوسط 70% على الأقل من المحاولة الأولى في اختبارات البروتوكولات والمصافحات وحلّ الأسماء.") },
        { source: "labs", title: l("Do the arithmetic", "أجرِ الحسابات"), detail: l("Pass graded labs on CIDR calculation and longest-prefix routing with visible tests.", "اجتز مختبرات مصحَّحة عن حساب CIDR والتوجيه بأطول بادئة باختبارات ظاهرة.") },
        { source: "challenges", title: l("Read the packets", "اقرأ الحزم"), detail: l("Solve one networking challenge such as decoding a captured exchange.", "حُلّ تحدّي شبكات واحداً مثل فك رموز تبادل ملتقَط.") },
      ],
    },
    badges: [
      { id: "first-packet", icon: "network", title: l("First Packet", "أول حزمة"), criteria: l("Finish your first lesson.", "أنهِ درسك الأول."), rule: { kind: "lessons", count: 1 } },
      { id: "subnet-surgeon", icon: "binary", title: l("Subnet Surgeon", "جرّاح الشبكات الفرعية"), criteria: l("Pass 2 graded lab exercises.", "اجتز تمرينين مصحَّحين في المختبر."), rule: { kind: "labs", count: 2 } },
      { id: "layer-cake", icon: "layers", title: l("Layer Cake", "كعكة الطبقات"), criteria: l("Complete every foundations lesson.", "أكمل كل دروس الأساسيات."), rule: { kind: "module", module: "required" } },
      { id: "protocol-whisperer", icon: "eye", title: l("Protocol Whisperer", "همّاس البروتوكولات"), criteria: l("Score 80% or more on the first try in 4 lesson quizzes.", "احصل على 80% أو أكثر من المحاولة الأولى في 4 اختبارات دروس."), rule: { kind: "quizzes", min: 0.8, count: 4 } },
      { id: "network-engineer", icon: "graduation", title: l("Network Engineer", "مهندس شبكات"), criteria: l("Complete every lesson in the track.", "أكمل كل دروس المسار."), rule: { kind: "course" } },
    ],
    primaryLang: "python",
    sampleCode: {
      lang: "python",
      code: `import ipaddress

net = ipaddress.ip_network("192.168.10.37/26", strict=False)
hosts = list(net.hosts())

print("network   ", net.network_address)
print("broadcast ", net.broadcast_address)
print("netmask   ", net.netmask)
print("usable    ", len(hosts), "hosts:", hosts[0], "to", hosts[-1])
print("same subnet as .62?", ipaddress.ip_address("192.168.10.62") in net)
`,
      caption: l("The calculation every network engineer does by hand: one /26 holds 64 addresses, 62 of them usable. Change the prefix to /27 and predict the new range first.", "الحساب الذي يجريه كل مهندس شبكات يدوياً: شبكة /26 تضم 64 عنواناً منها 62 صالحاً. غيّر البادئة إلى /27 وتوقع النطاق الجديد أولاً."),
      output: "network    192.168.10.0\nbroadcast  192.168.10.63\nnetmask    255.255.255.192\nusable     62 hosts: 192.168.10.1 to 192.168.10.62\nsame subnet as .62? True\n",
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "operating-systems": {
    arabic: { title: "أنظمة التشغيل", description: "العمليات والذاكرة وأنظمة الملفات والجدولة والتزامن، إضافة إلى سطر أوامر لينكس، من الداخل" },
    objectives: [
      l("Describe the process lifecycle and what a context switch costs.", "صف دورة حياة العملية وتكلفة تبديل السياق."),
      l("Use the Linux command line to inspect processes, files, permissions and system calls.", "استخدم سطر أوامر لينكس لفحص العمليات والملفات والصلاحيات واستدعاءات النظام."),
      l("Explain virtual memory, paging and why a page fault happens.", "اشرح الذاكرة الافتراضية والتصفيح ولماذا يحدث خطأ الصفحة."),
      l("Compare FCFS, SJF and Round Robin scheduling by computing average waiting time.", "قارن جدولة FCFS وSJF وRound Robin بحساب متوسط زمن الانتظار."),
      l("Explain how a file system maps names to blocks with inodes and what journaling protects.", "اشرح كيف يربط نظام الملفات الأسماء بالكتل بـ inodes وما الذي يحميه السجل اليومي."),
      l("Spot a race condition or deadlock and fix it with a lock, semaphore or ordering rule.", "اكتشف حالة تسابق أو جموداً وأصلحه بقفل أو إشارة أو قاعدة ترتيب."),
      l("Write a small program that creates processes and pipes with fork, exec and pipe.", "اكتب برنامجاً صغيراً ينشئ عمليات وأنابيب بـ fork وexec وpipe."),
    ],
    audience: l(
      "Developers, future SREs and security learners who want to know what happens beneath their code.",
      "المطورون ومهندسو الموثوقية المستقبليون ودارسو الأمن الراغبون في معرفة ما يحدث تحت أكوادهم."
    ),
    prerequisites: [{ text: l("Basic programming in any language. Reading small C snippets is taught as you go.", "أساسيات البرمجة بأي لغة. تُدرَّس قراءة مقتطفات C الصغيرة أثناء المسار.") }],
    estimatedHours: 7,
    estimateOnly: true,
    recommendedOrder: 2,
    recommendedAfter: [],
    modules: {
      required: { title: l("Processes, memory and files", "العمليات والذاكرة والملفات"), summary: l("The three abstractions every OS provides.", "التجريدات الثلاثة التي يوفرها كل نظام تشغيل.") },
      important: { title: l("Concurrency and scheduling", "التزامن والجدولة"), summary: l("Sharing one CPU safely between many tasks.", "تقاسم معالج واحد بأمان بين مهام كثيرة.") },
      optional: { title: l("Inside Linux", "داخل لينكس"), summary: l("System calls, the shell and containers as OS features.", "استدعاءات النظام والطرفية والحاويات كميزات للنظام.") },
    },
    assessment: {
      summary: l(
        "OS knowledge is shown by predicting behaviour: which process runs next, whether a page fault occurs, whether two threads can deadlock. Labs have you simulate those decisions in code and check them against exact outputs.",
        "تظهر معرفة نظم التشغيل بالتنبؤ بالسلوك: أي عملية تعمل تالياً، وهل يحدث خطأ صفحة، وهل يمكن لخيطين أن يتجمّدا. تجعلك المختبرات تحاكي هذه القرارات برمجياً وتتحقق منها بمخرجات دقيقة."
      ),
      passing: passing(0.7, 2, 1),
      criteria: [
        { source: "lessons", title: l("Learn the abstractions", "تعلّم التجريدات"), detail: l("Complete the process, memory and file-system lessons.", "أكمل دروس العمليات والذاكرة ونظام الملفات.") },
        { source: "quizzes", title: l("Predict behaviour", "تنبّأ بالسلوك"), detail: l("Average at least 70% on first-try quizzes about scheduling, paging and synchronization.", "حقق متوسط 70% على الأقل من المحاولة الأولى في اختبارات الجدولة والتصفيح والتزامن.") },
        { source: "labs", title: l("Simulate the kernel", "حاكِ النواة"), detail: l("Pass graded labs that simulate scheduling and page replacement with exact expected output.", "اجتز مختبرات مصحَّحة تحاكي الجدولة واستبدال الصفحات بمخرجات متوقعة دقيقة.") },
        { source: "challenges", title: l("Debug a live system", "شخّص نظاماً حياً"), detail: l("Solve one systems challenge (processes, permissions or file system).", "حُلّ تحدّي أنظمة واحداً (عمليات أو صلاحيات أو نظام ملفات).") },
      ],
    },
    badges: [
      { id: "hello-kernel", icon: "cpu", title: l("Hello, Kernel", "مرحباً أيتها النواة"), criteria: l("Finish your first lesson.", "أنهِ درسك الأول."), rule: { kind: "lessons", count: 1 } },
      { id: "three-abstractions", icon: "hard-drive", title: l("Three Abstractions", "التجريدات الثلاثة"), criteria: l("Complete every foundations lesson.", "أكمل كل دروس الأساسيات."), rule: { kind: "module", module: "required" } },
      { id: "scheduler-sim", icon: "flask", title: l("Scheduler Simulator", "محاكي الجدولة"), criteria: l("Pass 2 graded lab exercises.", "اجتز تمرينين مصحَّحين في المختبر."), rule: { kind: "labs", count: 2 } },
      { id: "deadlock-detective", icon: "search", title: l("Deadlock Detective", "محقق الجمود"), criteria: l("Score 80% or more on the first try in 4 lesson quizzes.", "احصل على 80% أو أكثر من المحاولة الأولى في 4 اختبارات دروس."), rule: { kind: "quizzes", min: 0.8, count: 4 } },
      { id: "systems-engineer", icon: "graduation", title: l("Systems Engineer", "مهندس أنظمة"), criteria: l("Complete every lesson in the track.", "أكمل كل دروس المسار."), rule: { kind: "course" } },
    ],
    primaryLang: "c",
    sampleCode: {
      lang: "python",
      code: `# Round Robin scheduling with a 3-unit quantum: who waits how long?
from collections import deque

jobs = {"A": 5, "B": 3, "C": 8}   # CPU burst of each process, all arrive at t=0
quantum = 3

remaining = dict(jobs)
queue = deque(jobs)
clock, finish = 0, {}

while queue:
    p = queue.popleft()
    run = min(quantum, remaining[p])
    clock += run
    remaining[p] -= run
    if remaining[p]:
        queue.append(p)
    else:
        finish[p] = clock

for p, burst in jobs.items():
    print(f"{p}: finished at {finish[p]:>2}, waited {finish[p] - burst}")
print("average wait:", round(sum(finish[p] - jobs[p] for p in jobs) / len(jobs), 2))
`,
      caption: l("A scheduler is just a queue plus a clock. Try a quantum of 1 or 100 and see how waiting times and fairness change.", "المجدول مجرد طابور وساعة. جرّب كمّاً زمنياً 1 أو 100 وانظر كيف تتغير أزمنة الانتظار والعدالة."),
      output: "A: finished at 11, waited 6\nB: finished at  6, waited 3\nC: finished at 16, waited 8\naverage wait: 5.67\n",
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "data-structures-algorithms": {
    arabic: { title: "هياكل البيانات والخوارزميات", description: "من المصفوفات إلى الرسوم البيانية، والفرز والبحث والاستدعاء الذاتي والبرمجة الديناميكية وBig-O: أساس كل مقابلة تقنية" },
    objectives: [
      l("Analyse running time with Big-O for loops and recursion and compare two solutions on paper.", "حلّل زمن التشغيل بـ Big-O للحلقات والاستدعاء الذاتي وقارن حلّين على الورق."),
      l("Choose between array, linked list, stack, queue, hash map and heap by the cost of the operations you need.", "اختر بين المصفوفة والقائمة المرتبطة والمكدّس والطابور وجدول التجزئة والكومة بحسب تكلفة العمليات المطلوبة."),
      l("Implement binary search, merge sort and quicksort and explain their cost and stability.", "نفّذ البحث الثنائي والفرز بالدمج والفرز السريع واشرح تكلفتها واستقرارها."),
      l("Traverse trees and graphs with DFS and BFS and find shortest paths in unweighted graphs.", "اجتز الأشجار والرسوم البيانية بـ DFS وBFS واعثر على أقصر المسارات في الرسوم غير الموزونة."),
      l("Solve problems with recursion and memoization and convert them to iterative form.", "حُلّ المسائل بالاستدعاء الذاتي والحفظ المؤقت وحوّلها إلى صيغة تكرارية."),
      l("Apply dynamic programming by defining the state, the transition and the base case.", "طبّق البرمجة الديناميكية بتعريف الحالة والانتقال والحالة الأساسية."),
      l("Solve a medium interview problem in 30 minutes with tests and a stated complexity.", "حُلّ مسألة مقابلة متوسطة في 30 دقيقة مع اختبارات وتعقيد معلن."),
    ],
    audience: l(
      "Students and self-taught developers preparing for technical interviews or wanting to write faster, simpler programs.",
      "الطلاب والمطورون ذاتيو التعلم الذين يستعدون للمقابلات التقنية أو يريدون كتابة برامج أسرع وأبسط."
    ),
    prerequisites: [{ text: l("Fluency in one programming language: variables, loops, functions, lists. Examples use Python.", "إتقان لغة برمجة واحدة: المتغيرات والحلقات والدوال والقوائم. الأمثلة بلغة بايثون.") }],
    estimatedHours: 10,
    estimateOnly: true,
    recommendedOrder: 3,
    recommendedAfter: [],
    modules: {
      required: { title: l("Core structures and complexity", "الهياكل الأساسية والتعقيد"), summary: l("Big-O, arrays, lists, stacks, queues, hash maps, sorting and searching.", "Big-O والمصفوفات والقوائم والمكدّسات والطوابير وجداول التجزئة والفرز والبحث.") },
      important: { title: l("Trees, graphs and recursion", "الأشجار والرسوم والاستدعاء الذاتي"), summary: l("Hierarchies, networks and divide-and-conquer.", "التسلسلات الهرمية والشبكات وفرّق تسد.") },
      optional: { title: l("Dynamic programming and interviews", "البرمجة الديناميكية والمقابلات"), summary: l("Optimization patterns and timed problem solving.", "أنماط التحسين وحل المسائل بزمن محدد.") },
    },
    assessment: {
      summary: l(
        "Algorithms are learned by solving: nearly every lab is a problem graded against edge cases, quizzes check your complexity reasoning, and challenges add timed pressure.",
        "تُتعلَّم الخوارزميات بالحل: كل مختبر تقريباً مسألة تُصحَّح على الحالات الحدّية، وتفحص الاختبارات استدلالك عن التعقيد، وتضيف التحديات ضغط الوقت."
      ),
      passing: passing(0.7, 3, 2),
      criteria: [
        { source: "lessons", title: l("Learn the toolbox", "تعلّم صندوق الأدوات"), detail: l("Complete every core lesson on complexity and fundamental data structures.", "أكمل كل الدروس الأساسية عن التعقيد وهياكل البيانات الأساسية.") },
        { source: "quizzes", title: l("State the complexity", "حدّد التعقيد"), detail: l("Average at least 70% on first-try quizzes asking you to pick the right structure or Big-O.", "حقق متوسط 70% على الأقل من المحاولة الأولى في اختبارات تطلب اختيار الهيكل المناسب أو Big-O.") },
        { source: "labs", title: l("Solve with tests", "حُلّ باختبارات"), detail: l("Pass at least 3 graded problems (visible edge cases included) in any language you prefer.", "اجتز 3 مسائل مصحَّحة على الأقل (تشمل حالات حدّية ظاهرة) بأي لغة تفضلها.") },
        { source: "challenges", title: l("Beat hidden tests", "اجتز الاختبارات الخفيّة"), detail: l("Solve at least 2 algorithm challenges graded by hidden tests.", "حُلّ تحدّيين على الأقل في الخوارزميات يُصحَّحان باختبارات خفيّة.") },
      ],
    },
    badges: [
      { id: "first-loop", icon: "puzzle", title: l("First Loop", "الحلقة الأولى"), criteria: l("Finish your first lesson.", "أنهِ درسك الأول."), rule: { kind: "lessons", count: 1 } },
      { id: "toolbox-ready", icon: "layers", title: l("Toolbox Ready", "صندوق الأدوات جاهز"), criteria: l("Complete every core lesson.", "أكمل كل الدروس الأساسية."), rule: { kind: "module", module: "required" } },
      { id: "problem-solver", icon: "code", title: l("Problem Solver", "حلّال المسائل"), criteria: l("Pass 3 graded lab exercises.", "اجتز 3 تمارين مصحَّحة في المختبر."), rule: { kind: "labs", count: 3 } },
      { id: "big-o-brain", icon: "brain", title: l("Big-O Brain", "عقل Big-O"), criteria: l("Score 80% or more on the first try in 4 lesson quizzes.", "احصل على 80% أو أكثر من المحاولة الأولى في 4 اختبارات دروس."), rule: { kind: "quizzes", min: 0.8, count: 4 } },
      { id: "algorithmist", icon: "graduation", title: l("Algorithmist", "خبير خوارزميات"), criteria: l("Complete every lesson in the track.", "أكمل كل دروس المسار."), rule: { kind: "course" } },
    ],
    primaryLang: "python",
    sampleCode: {
      lang: "python",
      code: `from collections import deque

grid = [
    "S.#.....",
    ".##.###.",
    "....#...",
    ".####.#.",
    "......#E",
]

def shortest_path(grid):
    rows, cols = len(grid), len(grid[0])
    start = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "S")
    queue, seen = deque([(start, 0)]), {start}
    while queue:
        (r, c), dist = queue.popleft()
        if grid[r][c] == "E":
            return dist
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append(((nr, nc), dist + 1))
    return -1

print("shortest path:", shortest_path(grid), "steps")
`,
      caption: l("Breadth-first search explores in rings, so the first time it reaches the exit is a shortest path. Add a wall to block the exit and watch it return -1.", "يستكشف البحث بالعرض أولاً على شكل حلقات، فأول وصول للمخرج هو أقصر مسار. أضف جداراً يسدّ المخرج وراقبه يعيد -1."),
      output: "shortest path: 11 steps\n",
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  databases: {
    arabic: { title: "قواعد البيانات", description: "النمذجة العلائقية وSQL والفهرسة والمعاملات ومتى تلجأ إلى NoSQL" },
    objectives: [
      l("Model entities as normalized tables (1NF to 3NF) with primary and foreign keys.", "نمذج الكيانات في جداول مطبَّعة (من 1NF إلى 3NF) بمفاتيح أساسية وأجنبية."),
      l("Write SELECT queries with joins, aggregates, subqueries and window functions.", "اكتب استعلامات SELECT بالربط والتجميع والاستعلامات الفرعية ودوال النافذة."),
      l("Explain how a B-tree index speeds up a query and read an EXPLAIN plan.", "اشرح كيف يسرّع فهرس B-tree الاستعلام واقرأ خطة EXPLAIN."),
      l("Use transactions and isolation levels to prevent lost updates and dirty reads.", "استخدم المعاملات ومستويات العزل لمنع التحديثات الضائعة والقراءات القذرة."),
      l("Plan a safe schema migration that does not lock production tables.", "خطّط لهجرة آمنة للمخطط لا تقفل جداول الإنتاج."),
      l("Choose between relational, document, key-value and graph stores for a given workload.", "اختر بين المخازن العلائقية والوثائقية والمفتاح-قيمة والبيانية لحِمل عمل معيّن."),
      l("Secure a database with parameterized queries, least privilege and tested backups.", "أمّن قاعدة بيانات بالاستعلامات المُعامَلة وأقل صلاحية ونسخ احتياطية مُختبَرة."),
    ],
    audience: l(
      "Developers, analysts and aspiring database administrators who want to design schemas and write fast, correct SQL.",
      "المطورون والمحللون ومديرو قواعد البيانات الطامحون الذين يريدون تصميم المخططات وكتابة SQL سريع وصحيح."
    ),
    prerequisites: [{ text: l("None. If you have used a spreadsheet you already know the idea of rows and columns.", "لا شيء. إن استخدمت جدول بيانات فأنت تعرف فكرة الصفوف والأعمدة.") }],
    estimatedHours: 6,
    estimateOnly: true,
    recommendedOrder: 4,
    recommendedAfter: [],
    modules: {
      required: { title: l("Modeling and SQL", "النمذجة وSQL"), summary: l("Tables, keys, normalization and everyday queries.", "الجداول والمفاتيح والتطبيع والاستعلامات اليومية.") },
      important: { title: l("Performance and integrity", "الأداء والسلامة"), summary: l("Indexes, query plans and transactions.", "الفهارس وخطط الاستعلام والمعاملات.") },
      optional: { title: l("Beyond relational", "ما بعد العلائقي"), summary: l("NoSQL trade-offs, migrations, security and backups.", "مفاضلات NoSQL والهجرات والأمان والنسخ الاحتياطي.") },
    },
    assessment: {
      summary: l(
        "Database skill is shown by queries that return the right rows quickly: labs run your SQL against real data through SQLite, quizzes test your design and isolation reasoning, challenges add hidden edge cases.",
        "تظهر مهارة قواعد البيانات باستعلامات تعيد الصفوف الصحيحة بسرعة: تشغّل المختبرات SQL على بيانات حقيقية عبر SQLite، وتختبر الاختبارات استدلالك عن التصميم والعزل، وتضيف التحديات حالات حدّية خفيّة."
      ),
      passing: passing(0.7, 3, 1),
      criteria: [
        { source: "lessons", title: l("Learn modeling and SQL", "تعلّم النمذجة وSQL"), detail: l("Complete every Modeling and SQL lesson.", "أكمل كل دروس النمذجة وSQL.") },
        { source: "quizzes", title: l("Design and reason", "صمّم واستدلّ"), detail: l("Average at least 70% on first-try quizzes about normal forms, indexes and isolation levels.", "حقق متوسط 70% على الأقل من المحاولة الأولى في اختبارات الصيغ المعيارية والفهارس ومستويات العزل.") },
        { source: "labs", title: l("Write correct SQL", "اكتب SQL صحيحاً"), detail: l("Pass at least 3 graded SQL labs (joins, aggregates and window functions) run on SQLite.", "اجتز 3 مختبرات SQL مصحَّحة على الأقل (ربط وتجميع ودوال نافذة) تعمل على SQLite.") },
        { source: "challenges", title: l("Handle the edge cases", "عالج الحالات الحدّية"), detail: l("Solve one data challenge graded by hidden tests.", "حُلّ تحدّي بيانات واحداً يُصحَّح باختبارات خفيّة.") },
      ],
    },
    badges: [
      { id: "first-table", icon: "database", title: l("First Table", "الجدول الأول"), criteria: l("Finish your first lesson.", "أنهِ درسك الأول."), rule: { kind: "lessons", count: 1 } },
      { id: "sql-fluent", icon: "code", title: l("SQL Fluent", "طلاقة SQL"), criteria: l("Complete every Modeling and SQL lesson.", "أكمل كل دروس النمذجة وSQL."), rule: { kind: "module", module: "required" } },
      { id: "query-crafter", icon: "flask", title: l("Query Crafter", "صانع الاستعلامات"), criteria: l("Pass 3 graded lab exercises.", "اجتز 3 تمارين مصحَّحة في المختبر."), rule: { kind: "labs", count: 3 } },
      { id: "index-whisperer", icon: "search", title: l("Index Whisperer", "همّاس الفهارس"), criteria: l("Score 80% or more on the first try in 4 lesson quizzes.", "احصل على 80% أو أكثر من المحاولة الأولى في 4 اختبارات دروس."), rule: { kind: "quizzes", min: 0.8, count: 4 } },
      { id: "database-architect", icon: "graduation", title: l("Database Architect", "مصمّم قواعد بيانات"), criteria: l("Complete every lesson in the track.", "أكمل كل دروس المسار."), rule: { kind: "course" } },
    ],
    primaryLang: "python",
    sampleCode: {
      lang: "python",
      code: `# Why indexes matter: count the comparisons to find one id among 100,000 rows.
rows = list(range(0, 200_000, 2))        # a sorted "index" of 100,000 ids
target = 150_000

scan = 0
for value in rows:                       # a full table scan checks every row
    scan += 1
    if value == target:
        break

lo, hi, lookup = 0, len(rows) - 1, 0
while lo <= hi:                          # a B-tree style lookup halves the search space
    lookup += 1
    mid = (lo + hi) // 2
    if rows[mid] == target:
        break
    lo, hi = (mid + 1, hi) if rows[mid] < target else (lo, mid - 1)

print("full scan comparisons:", scan)
print("index lookup comparisons:", lookup)
`,
      caption: l("Three orders of magnitude difference from one idea: keep data sorted so you can skip most of it. Change the target to the last row and compare again.", "فرق ثلاث مراتب حجم من فكرة واحدة: أبقِ البيانات مرتبة لتتخطى معظمها. غيّر الهدف إلى الصف الأخير وقارن من جديد."),
      output: "full scan comparisons: 75001\nindex lookup comparisons: 16\n",
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "reverse-engineering": {
    arabic: { title: "الهندسة العكسية", description: "اقرأ الكود الآلي وبايت كود: التجميع والملفات الثنائية والتصحيح وفك التعمية وأساسيات تحليل البرمجيات الخبيثة (بشكل قانوني وأخلاقي)" },
    objectives: [
      l("Describe how source code becomes a binary: compile, assemble, link, load.", "صف كيف يتحول الكود المصدري إلى ملف ثنائي: ترجمة وتجميع وربط وتحميل."),
      l("Read basic x86-64 assembly (mov, add, cmp, jmp, call) and map it back to C constructs.", "اقرأ تجميع x86-64 الأساسي (mov وadd وcmp وjmp وcall) واربطه بعناصر C."),
      l("Inspect an unknown binary with file, strings, objdump and readelf before running anything.", "افحص ملفاً ثنائياً مجهولاً بـ file وstrings وobjdump وreadelf قبل تشغيل أي شيء."),
      l("Use a debugger to set breakpoints, step through code and examine registers and the stack.", "استخدم مصحّحاً لوضع نقاط توقف والتنقل في الكود وفحص السجلات والمكدّس."),
      l("Recognise common obfuscation (XOR, base64, packing) and write a script that decodes it.", "تعرّف على أساليب التعمية الشائعة (XOR وbase64 والضغط) واكتب سكربتاً يفكّها."),
      l("Analyse a sample safely in an isolated VM and write a short report of its behaviour and indicators.", "حلّل عيّنة بأمان في جهاز افتراضي معزول واكتب تقريراً موجزاً بسلوكها ومؤشراتها."),
      l("Explain the legal and ethical limits: licences, the DMCA and responsible disclosure.", "اشرح الحدود القانونية والأخلاقية: التراخيص وDMCA والإفصاح المسؤول."),
    ],
    audience: l(
      "Security learners, CTF players and systems programmers who want to understand programs without their source. Content is for defence, education and legal analysis only.",
      "دارسو الأمن ولاعبو CTF ومبرمجو الأنظمة الراغبون في فهم البرامج دون مصدرها. المحتوى للدفاع والتعليم والتحليل القانوني فقط."
    ),
    prerequisites: [
      { track: "operating-systems" },
      { text: l("Basic C or Python: you should read a loop and a function call without help.", "أساسيات C أو بايثون: يجب أن تقرأ حلقة واستدعاء دالة دون مساعدة.") },
    ],
    estimatedHours: 8,
    estimateOnly: true,
    recommendedOrder: 13,
    recommendedAfter: ["operating-systems", "cyber-security"],
    modules: {
      required: { title: l("Binaries and assembly", "الملفات الثنائية والتجميع"), summary: l("How programs are built and how to read their machine code.", "كيف تُبنى البرامج وكيف تُقرأ أكوادها الآلية.") },
      important: { title: l("Dynamic analysis", "التحليل الديناميكي"), summary: l("Debugging, decoding and observing programs safely.", "التصحيح وفك الترميز ومراقبة البرامج بأمان.") },
      optional: { title: l("Malware analysis basics", "أساسيات تحليل البرمجيات الخبيثة"), summary: l("Lab hygiene, reporting and the legal context.", "نظافة المختبر وكتابة التقارير والسياق القانوني.") },
    },
    assessment: {
      summary: l(
        "Reverse engineering is shown by recovering what a program does: you decode obfuscated data with scripts, explain assembly in plain language, and capture flags from crackme-style challenges.",
        "تظهر الهندسة العكسية باستعادة ما يفعله البرنامج: تفك البيانات المعمّاة بالسكربتات وتشرح التجميع بلغة بسيطة وتلتقط الأعلام من تحديات بنمط crackme."
      ),
      passing: passing(0.7, 2, 2),
      criteria: [
        { source: "lessons", title: l("Read machine code", "اقرأ الكود الآلي"), detail: l("Complete every Binaries and assembly lesson.", "أكمل كل دروس الملفات الثنائية والتجميع.") },
        { source: "quizzes", title: l("Explain what you see", "اشرح ما تراه"), detail: l("Average at least 70% on first-try quizzes about registers, the stack and calling conventions.", "حقق متوسط 70% على الأقل من المحاولة الأولى في اختبارات السجلات والمكدّس واصطلاحات الاستدعاء.") },
        { source: "labs", title: l("Decode with scripts", "فكّ بالسكربتات"), detail: l("Pass graded labs that decode XOR, base64 and simple custom encodings.", "اجتز مختبرات مصحَّحة تفك XOR وbase64 وترميزات مخصصة بسيطة.") },
        { source: "challenges", title: l("Crack the crackmes", "اكسر الـ crackme"), detail: l("Solve at least 2 reverse-engineering challenges and capture their flags.", "حُلّ تحدّيين على الأقل في الهندسة العكسية والتقط علميهما.") },
      ],
    },
    badges: [
      { id: "first-disassembly", icon: "binary", title: l("First Disassembly", "أول تفكيك"), criteria: l("Finish your first lesson.", "أنهِ درسك الأول."), rule: { kind: "lessons", count: 1 } },
      { id: "assembly-reader", icon: "cpu", title: l("Assembly Reader", "قارئ التجميع"), criteria: l("Complete every Binaries and assembly lesson.", "أكمل كل دروس الملفات الثنائية والتجميع."), rule: { kind: "module", module: "required" } },
      { id: "decoder", icon: "lock", title: l("Decoder", "فاكّ الترميز"), criteria: l("Pass 2 graded lab exercises.", "اجتز تمرينين مصحَّحين في المختبر."), rule: { kind: "labs", count: 2 } },
      { id: "careful-analyst", icon: "bug", title: l("Careful Analyst", "محلل حذر"), criteria: l("Score 80% or more on the first try in 4 lesson quizzes.", "احصل على 80% أو أكثر من المحاولة الأولى في 4 اختبارات دروس."), rule: { kind: "quizzes", min: 0.8, count: 4 } },
      { id: "reverse-engineer", icon: "graduation", title: l("Reverse Engineer", "مهندس عكسي"), criteria: l("Complete every lesson in the track.", "أكمل كل دروس المسار."), rule: { kind: "course" } },
    ],
    primaryLang: "python",
    sampleCode: {
      lang: "python",
      code: `# A classic first obfuscation: every byte XORed with one key. Recover the key and the message.
blob = bytes.fromhex("3b3f213c2b20683c27683c202d682a292b233d38683b2d3a3e2d3a")      # found in a binary's data section
known_start = b"s"                                  # we guess the message starts with "s"
key = blob[0] ^ known_start[0]

message = bytes(b ^ key for b in blob)
print("key     :", hex(key))
print("decoded :", message.decode())
`,
      caption: l("XOR is its own inverse, so one known plaintext byte gives you the whole key. Practice on the labs, then try a two-byte key.", "XOR معكوس نفسه، فبايت واحد معروف من النص الأصلي يعطيك المفتاح كاملاً. تمرّن في المختبرات ثم جرّب مفتاحاً من بايتين."),
      output: "key     : 0x48\ndecoded : switch to the backup server\n",
    },
  },
};
