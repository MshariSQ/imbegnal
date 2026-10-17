/**
 * Career paths: job roles, each built from several courses in Beginner -> Intermediate ->
 * Advanced order. Shown at /roadmaps/ (the grid) and /roadmaps/<path-id>/ (the role page).
 *
 * A path never copies a course: `courses[].course` is a track id from data/roadmaps.ts (the one
 * place a course's name, icon and accent live) or the id of a course that is still being written
 * (`plannedCourses` below, shown as "coming soon" and never linked). A course can be in several
 * paths, and progress in a course counts in every path that contains it.
 *
 * Lesson counts and hours are NOT stored here: lib/career-paths.ts computes them from the lessons
 * of the courses that exist (lib/catalog + lesson minutes), so lessons added later are counted.
 *
 * Rules enforced by tests/unit/career-paths.test.ts:
 *  - ids are unique and never equal a track id (/roadmaps/<track-id>/ is that course's map)
 *  - every referenced course is a track or a planned course; planned ids are not track ids
 *    (delete the planned entry in the change that ships the course)
 *  - levels never go down along a path; every learner-facing string is bilingual
 *  - 3 "if you like" items, 5-8 skills, at least 2 job titles, a "why" line per course
 */
import type { L10n } from "./lessons/types";

export const PATH_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type PathLevel = (typeof PATH_LEVELS)[number];

export const PATH_CATEGORIES = ["security", "software", "data-ai", "cloud-devops", "design"] as const;
export type PathCategory = (typeof PATH_CATEGORIES)[number];

export interface PathStep {
  /** Track id (data/roadmaps.ts) or planned course id (`plannedCourses`). */
  course: string;
  /** Level of this course within this path (the same course can sit at another level elsewhere). */
  level: PathLevel;
  /** One line: why this course is in this path. */
  why: L10n;
}

export interface CareerPath {
  /** URL segment of /roadmaps/<id>/; never a track id. */
  id: string;
  title: L10n;
  /** Emoji, like the tracks in data/roadmaps.ts. */
  icon: string;
  /** Hex color for the card glow and the role page hero. */
  accent: string;
  category: PathCategory;
  /** One paragraph: what people in this role do. */
  description: L10n;
  /** Exactly 3 "If you like ..." items. */
  ifYouLike: L10n[];
  /** 5-8 skills the path builds. */
  skills: L10n[];
  /** Typical job titles. */
  jobs: L10n[];
  /** In study order; levels never go down. */
  courses: PathStep[];
}

/** A course that does not exist yet (written in phase 2): shown as "coming soon", never linked. */
export interface PlannedCourse {
  id: string;
  title: L10n;
  description: L10n;
  icon: string;
  accent: string;
}

const l = (en: string, ar: string): L10n => ({ en, ar });

export const plannedCourses: PlannedCourse[] = [
  {
    id: "incident-response",
    title: l("Incident Response & SOC Operations", "الاستجابة للحوادث وعمليات مراكز SOC"),
    description: l(
      "Alert triage, investigation, containment and reporting, as practiced in a Security Operations Center.",
      "فرز التنبيهات والتحقيق والاحتواء وكتابة التقارير كما تُمارَس في مراكز عمليات الأمن."
    ),
    icon: "🧯",
    accent: "#ef4444",
  },
  {
    id: "web-app-pentesting",
    title: l("Web Application Penetration Testing", "اختبار اختراق تطبيقات الويب"),
    description: l(
      "Finding, safely exploiting with permission, and reporting vulnerabilities in web applications.",
      "اكتشاف ثغرات تطبيقات الويب واستغلالها بأمان وبإذن مسبق ثم الإبلاغ عنها."
    ),
    icon: "🕸️",
    accent: "#e11d48",
  },
  {
    id: "advanced-react",
    title: l("Advanced React", "React المتقدم"),
    description: l(
      "State management, performance, testing and patterns for large React applications.",
      "إدارة الحالة والأداء والاختبار وأنماط بناء تطبيقات React الكبيرة."
    ),
    icon: "⚛️",
    accent: "#38bdf8",
  },
  {
    id: "bi-dashboards",
    title: l("Dashboards & Business Intelligence", "لوحات المعلومات وذكاء الأعمال"),
    description: l(
      "Designing dashboards and reports with business intelligence tools that decision-makers can act on.",
      "تصميم لوحات المعلومات والتقارير بأدوات ذكاء الأعمال بحيث يستطيع صنّاع القرار العمل بها."
    ),
    icon: "🗂️",
    accent: "#0284c7",
  },
  {
    id: "mlops",
    title: l("Deploying Models: MLOps", "نشر النماذج: MLOps"),
    description: l(
      "Packaging, serving, monitoring and retraining machine learning models in production.",
      "تحزيم نماذج تعلّم الآلة وتقديمها كخدمات ومراقبتها وإعادة تدريبها في بيئة الإنتاج."
    ),
    icon: "🛠️",
    accent: "#9333ea",
  },
];

export const careerPaths: CareerPath[] = [
  {
    id: "soc-analyst",
    title: l("Cyber Security Analyst", "محلل أمن سيبراني"),
    icon: "🚨",
    accent: "#ef4444",
    category: "security",
    description: l(
      "Cyber security analysts protect an organization's systems by watching for signs of attack, investigating alerts and helping to contain incidents. Many work in a Security Operations Center (SOC), where they read logs and network traffic, separate real threats from false alarms, and escalate what they find with clear evidence.",
      "يحمي محللو الأمن السيبراني أنظمة المؤسسة بمراقبة مؤشرات الهجوم والتحقيق في التنبيهات والمساعدة في احتواء الحوادث. يعمل كثير منهم في مركز عمليات الأمن (SOC)، حيث يقرؤون السجلات وحركة الشبكة، ويميّزون التهديدات الحقيقية من الإنذارات الكاذبة، ويصعّدون ما يجدونه مدعوماً بأدلة واضحة."
    ),
    ifYouLike: [
      l("Following clues until the story makes sense", "تتبّع الأدلة حتى تكتمل القصة"),
      l("Spotting the one detail that does not fit", "ملاحظة التفصيل الوحيد الذي لا يتّسق مع الباقي"),
      l("Keeping a cool head when something goes wrong", "الحفاظ على هدوئك عندما يحدث خطأ ما"),
    ],
    skills: [
      l("Network traffic analysis", "تحليل حركة الشبكة"),
      l("Log analysis", "تحليل السجلات"),
      l("Linux and Windows fundamentals", "أساسيات لينكس وويندوز"),
      l("Alert triage and threat detection", "فرز التنبيهات واكتشاف التهديدات"),
      l("Incident response", "الاستجابة للحوادث"),
      l("Security controls and hardening", "الضوابط الأمنية وتقوية الأنظمة"),
      l("Clear incident reporting", "كتابة تقارير الحوادث بوضوح"),
    ],
    jobs: [
      l("SOC Analyst", "محلل SOC"),
      l("Security Analyst", "محلل أمني"),
      l("Incident Responder", "مستجيب للحوادث الأمنية"),
      l("Security Monitoring Analyst", "محلل مراقبة أمنية"),
    ],
    courses: [
      {
        course: "networking",
        level: "beginner",
        why: l(
          "Attacks arrive over the network: reading IP addresses, ports, DNS and HTTP is how you tell normal traffic from suspicious traffic.",
          "تصل الهجمات عبر الشبكة: قراءة عناوين IP والمنافذ وDNS وHTTP هي طريقتك للتمييز بين الحركة الطبيعية والحركة المريبة."
        ),
      },
      {
        course: "operating-systems",
        level: "intermediate",
        why: l(
          "Alerts point at processes, users, files and permissions on a host; knowing how an operating system works tells you what to inspect.",
          "تشير التنبيهات إلى عمليات ومستخدمين وملفات وصلاحيات على الجهاز، وفهم طريقة عمل نظام التشغيل يخبرك بما يجب فحصه."
        ),
      },
      {
        course: "cyber-security",
        level: "intermediate",
        why: l(
          "The core of the role: common attacks, web security and how SOC analysis works day to day.",
          "جوهر الدور: الهجمات الشائعة وأمن الويب وكيف يجري تحليل SOC يوماً بيوم."
        ),
      },
      {
        course: "incident-response",
        level: "advanced",
        why: l(
          "Puts it all together in SOC practice: triaging alerts, investigating an incident from the first signal to containment, and writing the report.",
          "يجمع كل ما سبق في ممارسة SOC: فرز التنبيهات، والتحقيق في الحادثة من أول إشارة حتى الاحتواء، وكتابة التقرير."
        ),
      },
    ],
  },
  {
    id: "penetration-tester",
    title: l("Penetration Tester", "مختبر اختراق"),
    icon: "🔓",
    accent: "#e11d48",
    category: "security",
    description: l(
      "Penetration testers are hired to attack systems with permission, the way a real attacker would, and to report the weaknesses they find before someone else exploits them. The work covers networks, web applications and sometimes compiled software, and always ends with a clear report that explains the risk and how to fix it.",
      "يُكلَّف مختبرو الاختراق بمهاجمة الأنظمة بإذن مسبق كما يفعل المهاجم الحقيقي، ثم الإبلاغ عن نقاط الضعف التي يجدونها قبل أن يستغلها غيرهم. يشمل العمل الشبكات وتطبيقات الويب وأحياناً البرامج المُترجَمة، وينتهي دائماً بتقرير واضح يشرح الخطر وطريقة إصلاحه."
    ),
    ifYouLike: [
      l("Taking things apart to see how they work", "تفكيك الأشياء لمعرفة كيف تعمل"),
      l("Finding the unexpected way around a rule", "إيجاد طريق غير متوقع للالتفاف على القاعدة"),
      l("Explaining a technical problem so others can fix it", "شرح مشكلة تقنية حتى يتمكن الآخرون من إصلاحها"),
    ],
    skills: [
      l("Network scanning and enumeration", "فحص الشبكات واستكشافها"),
      l("Web application security", "أمن تطبيقات الويب"),
      l("Linux command line", "سطر أوامر لينكس"),
      l("Python scripting", "كتابة السكربتات ببايثون"),
      l("Assembly and binary analysis", "لغة التجميع وتحليل الملفات الثنائية"),
      l("Responsible disclosure and ethics", "الإفصاح المسؤول وأخلاقيات المهنة"),
      l("Writing findings reports", "كتابة تقارير الثغرات"),
    ],
    jobs: [
      l("Penetration Tester", "مختبر اختراق"),
      l("Ethical Hacker", "مخترق أخلاقي"),
      l("Red Team Operator", "عضو فريق أحمر"),
      l("Application Security Tester", "مختبر أمن التطبيقات"),
    ],
    courses: [
      {
        course: "networking",
        level: "beginner",
        why: l(
          "Every test starts with mapping a network: hosts, ports, protocols and the services behind them.",
          "يبدأ كل اختبار برسم خريطة الشبكة: الأجهزة والمنافذ والبروتوكولات والخدمات التي تعمل خلفها."
        ),
      },
      {
        course: "operating-systems",
        level: "intermediate",
        why: l(
          "Exploits target processes, memory and permissions; you need to know how they work to understand why an attack succeeds.",
          "تستهدف الثغرات العمليات والذاكرة والصلاحيات، وعليك فهم طريقة عملها لتعرف لماذا ينجح الهجوم."
        ),
      },
      {
        course: "cyber-security",
        level: "intermediate",
        why: l(
          "Attack and defense fundamentals, web security and an introduction to penetration testing.",
          "أساسيات الهجوم والدفاع وأمن الويب ومدخل إلى اختبار الاختراق."
        ),
      },
      {
        course: "reverse-engineering",
        level: "advanced",
        why: l(
          "Reading assembly and analysing binaries lets you test software when no source code is available.",
          "قراءة لغة التجميع وتحليل الملفات الثنائية تتيح لك اختبار البرامج عندما لا تتوفر شيفرتها المصدرية."
        ),
      },
      {
        course: "web-app-pentesting",
        level: "advanced",
        why: l(
          "Most engagements include web applications: a hands-on course on finding and reporting their vulnerabilities.",
          "تتضمن معظم المهام تطبيقات ويب: دورة عملية في اكتشاف ثغراتها والإبلاغ عنها."
        ),
      },
    ],
  },
  {
    id: "full-stack-developer",
    title: l("Full-Stack Developer", "مطوّر ويب شامل"),
    icon: "🧱",
    accent: "#14b8a6",
    category: "software",
    description: l(
      "Full-stack developers build complete web applications: the interface people use in the browser, the server and API behind it, and the database that stores the data. They also test and deploy their code, so they can take a feature from idea to production.",
      "يبني مطوّرو الويب الشاملون تطبيقات ويب متكاملة: الواجهة التي يستخدمها الناس في المتصفح، والخادم وواجهة البرمجة (API) خلفها، وقاعدة البيانات التي تحفظ البيانات. كما يختبرون شيفرتهم وينشرونها، فيستطيعون نقل الميزة من فكرة إلى بيئة الإنتاج."
    ),
    ifYouLike: [
      l("Building things people can click and use", "بناء أشياء يضغط عليها الناس ويستخدمونها"),
      l("Seeing how all the pieces of a system fit together", "فهم كيف تتكامل كل أجزاء النظام"),
      l("Learning a little of everything", "تعلّم شيء من كل شيء"),
    ],
    skills: [
      l("HTML, CSS and JavaScript", "HTML وCSS وجافاسكربت"),
      l("React", "React"),
      l("REST APIs", "واجهات REST البرمجية"),
      l("Authentication and security", "المصادقة والأمان"),
      l("SQL and data modeling", "SQL ونمذجة البيانات"),
      l("Git and version control", "Git والتحكم في الإصدارات"),
      l("Docker and CI/CD", "Docker والتكامل والنشر المستمر (CI/CD)"),
    ],
    jobs: [
      l("Full-Stack Developer", "مطوّر ويب شامل"),
      l("Web Developer", "مطوّر ويب"),
      l("Software Engineer", "مهندس برمجيات"),
      l("JavaScript Developer", "مطوّر جافاسكربت"),
    ],
    courses: [
      {
        course: "frontend",
        level: "beginner",
        why: l(
          "The browser side: HTML, CSS, JavaScript and React, the part of the app your users see.",
          "جانب المتصفح: HTML وCSS وجافاسكربت وReact، وهو جزء التطبيق الذي يراه المستخدمون."
        ),
      },
      {
        course: "backend",
        level: "intermediate",
        why: l(
          "The server side: APIs, authentication, caching and deployment for the app your frontend talks to.",
          "جانب الخادم: واجهات البرمجة والمصادقة والتخزين المؤقت والنشر للتطبيق الذي تتواصل معه الواجهة."
        ),
      },
      {
        course: "databases",
        level: "intermediate",
        why: l(
          "Every app stores data: modeling tables, writing joins and keeping queries fast with indexes.",
          "كل تطبيق يخزّن بيانات: نمذجة الجداول وكتابة عمليات الربط (Joins) والحفاظ على سرعة الاستعلامات بالفهارس."
        ),
      },
      {
        course: "devops",
        level: "advanced",
        why: l(
          "Ship what you build: Git workflows, Docker, CI/CD pipelines and monitoring.",
          "انشر ما تبنيه: سير عمل Git وDocker وخطوط CI/CD والمراقبة."
        ),
      },
    ],
  },
  {
    id: "frontend-developer",
    title: l("Frontend Developer", "مطوّر واجهات أمامية"),
    icon: "💻",
    accent: "#d946ef",
    category: "software",
    description: l(
      "Frontend developers build the part of a website or web app that people see and interact with. They turn designs into accessible, responsive interfaces with HTML, CSS and JavaScript, use frameworks such as React to manage complex screens, and care about how fast and usable the result feels.",
      "يبني مطوّرو الواجهات الأمامية الجزء الذي يراه الناس ويتفاعلون معه في الموقع أو تطبيق الويب. يحوّلون التصاميم إلى واجهات متجاوبة وسهلة الوصول باستخدام HTML وCSS وجافاسكربت، ويستعينون بأطر عمل مثل React لإدارة الشاشات المعقدة، ويهتمون بسرعة النتيجة وسهولة استخدامها."
    ),
    ifYouLike: [
      l("Turning a sketch into something real on screen", "تحويل رسم أولي إلى شيء حقيقي على الشاشة"),
      l("Small visual details and smooth interactions", "التفاصيل البصرية الصغيرة والتفاعلات السلسة"),
      l("Seeing the result of your work immediately", "رؤية نتيجة عملك فوراً"),
    ],
    skills: [
      l("HTML and CSS layout", "تخطيط الصفحات بـ HTML وCSS"),
      l("JavaScript and TypeScript", "جافاسكربت وTypeScript"),
      l("React", "React"),
      l("Accessibility", "سهولة الوصول"),
      l("Responsive design", "التصميم المتجاوب"),
      l("Testing and performance", "الاختبار والأداء"),
      l("Working from Figma designs", "العمل انطلاقاً من تصاميم Figma"),
    ],
    jobs: [
      l("Frontend Developer", "مطوّر واجهات أمامية"),
      l("UI Engineer", "مهندس واجهات مستخدم"),
      l("React Developer", "مطوّر React"),
      l("Web Developer", "مطوّر ويب"),
    ],
    courses: [
      {
        course: "ui-ux",
        level: "beginner",
        why: l(
          "Frontend developers implement designs every day: layout, typography, color and accessibility make you a better partner to designers.",
          "يطبّق مطوّرو الواجهات التصاميم يومياً: معرفة التخطيط والخطوط والألوان وسهولة الوصول تجعلك شريكاً أفضل للمصممين."
        ),
      },
      {
        course: "frontend",
        level: "beginner",
        why: l(
          "The core of the role: HTML, CSS, JavaScript, React, TypeScript and Next.js, with testing and performance.",
          "جوهر الدور: HTML وCSS وجافاسكربت وReact وTypeScript وNext.js، مع الاختبار والأداء."
        ),
      },
      {
        course: "advanced-react",
        level: "advanced",
        why: l(
          "Takes React further: state management, performance and patterns for large applications.",
          "ينتقل بـ React إلى مستوى أعلى: إدارة الحالة والأداء وأنماط بناء التطبيقات الكبيرة."
        ),
      },
    ],
  },
  {
    id: "data-analyst",
    title: l("Data Analyst", "محلل بيانات"),
    icon: "📈",
    accent: "#0284c7",
    category: "data-ai",
    description: l(
      "Data analysts answer business questions with data. They pull data with SQL, clean and explore it, apply basic statistics, and present what they find in charts and dashboards that help others make decisions.",
      "يجيب محللو البيانات عن أسئلة العمل بالبيانات. يستخرجون البيانات بلغة SQL، وينظّفونها ويستكشفونها، ويطبّقون الإحصاء الأساسي، ثم يعرضون ما توصلوا إليه في رسوم بيانية ولوحات معلومات تساعد الآخرين على اتخاذ القرار."
    ),
    ifYouLike: [
      l("Finding patterns in numbers", "اكتشاف الأنماط في الأرقام"),
      l("Answering the question “why did this happen?”", "الإجابة عن سؤال «لماذا حدث هذا؟»"),
      l("Turning complicated results into a clear story", "تحويل النتائج المعقدة إلى قصة واضحة"),
    ],
    skills: [
      l("SQL queries and joins", "استعلامات SQL وعمليات الربط"),
      l("Data cleaning with Python", "تنظيف البيانات ببايثون"),
      l("Descriptive statistics", "الإحصاء الوصفي"),
      l("Data visualization", "تصوير البيانات"),
      l("Dashboards and reporting", "لوحات المعلومات والتقارير"),
      l("Communicating insights", "إيصال الاستنتاجات"),
    ],
    jobs: [
      l("Data Analyst", "محلل بيانات"),
      l("Business Intelligence Analyst", "محلل ذكاء أعمال"),
      l("Reporting Analyst", "محلل تقارير"),
      l("Product Analyst", "محلل منتجات"),
    ],
    courses: [
      {
        course: "databases",
        level: "beginner",
        why: l(
          "Analysts spend much of their day in SQL: selecting, joining and aggregating data stored in relational databases.",
          "يقضي المحللون جزءاً كبيراً من يومهم في SQL: اختيار البيانات المخزّنة في قواعد البيانات العلائقية وربطها وتجميعها."
        ),
      },
      {
        course: "data-science",
        level: "beginner",
        why: l(
          "Statistics, Python for data, visualization and an introduction to business intelligence.",
          "الإحصاء وبايثون للبيانات وتصوير البيانات ومدخل إلى ذكاء الأعمال."
        ),
      },
      {
        course: "bi-dashboards",
        level: "intermediate",
        why: l(
          "Designing dashboards and reports that decision-makers actually use.",
          "تصميم لوحات معلومات وتقارير يستخدمها صنّاع القرار فعلاً."
        ),
      },
    ],
  },
  {
    id: "data-scientist",
    title: l("Data Scientist", "عالم بيانات"),
    icon: "🔬",
    accent: "#4f46e5",
    category: "data-ai",
    description: l(
      "Data scientists use statistics, programming and machine learning to find patterns in data and build models that make predictions. Their work runs from collecting and preparing data to training, evaluating and explaining a model.",
      "يستخدم علماء البيانات الإحصاء والبرمجة وتعلّم الآلة لاكتشاف الأنماط في البيانات وبناء نماذج تتنبأ بالنتائج. يمتد عملهم من جمع البيانات وتجهيزها إلى تدريب النموذج وتقييمه وشرح نتائجه."
    ),
    ifYouLike: [
      l("Math and experiments", "الرياضيات والتجارب"),
      l("Asking questions nobody has answered yet", "طرح أسئلة لم يُجب عنها أحد بعد"),
      l("Writing code to test an idea", "كتابة الشيفرة لاختبار فكرة"),
    ],
    skills: [
      l("Python for data analysis", "بايثون لتحليل البيانات"),
      l("Statistics and probability", "الإحصاء والاحتمالات"),
      l("SQL", "SQL"),
      l("Machine learning", "تعلّم الآلة"),
      l("Deep learning basics", "أساسيات التعلّم العميق"),
      l("Algorithms and complexity", "الخوارزميات والتعقيد"),
      l("Data visualization", "تصوير البيانات"),
    ],
    jobs: [
      l("Data Scientist", "عالم بيانات"),
      l("Machine Learning Engineer", "مهندس تعلّم آلة"),
      l("Applied Scientist", "عالم تطبيقي"),
      l("Research Analyst", "محلل أبحاث"),
    ],
    courses: [
      {
        course: "data-structures-algorithms",
        level: "beginner",
        why: l(
          "Efficient code matters with large datasets: complexity, hash maps, sorting and graphs.",
          "الشيفرة الفعّالة مهمة مع البيانات الكبيرة: التعقيد وجداول التجزئة والترتيب والرسوم البيانية (Graphs)."
        ),
      },
      {
        course: "databases",
        level: "beginner",
        why: l(
          "Most data lives in databases: querying, joining and aggregating it with SQL.",
          "تعيش معظم البيانات في قواعد البيانات: الاستعلام عنها وربطها وتجميعها بلغة SQL."
        ),
      },
      {
        course: "data-science",
        level: "intermediate",
        why: l(
          "The heart of the role: statistics, Python for data, visualization and your first machine learning models.",
          "قلب الدور: الإحصاء وبايثون للبيانات وتصوير البيانات وأول نماذج تعلّم الآلة."
        ),
      },
      {
        course: "artificial-intelligence",
        level: "advanced",
        why: l(
          "Goes deeper into machine learning, deep learning, NLP and computer vision.",
          "يتعمق في تعلّم الآلة والتعلّم العميق ومعالجة اللغات الطبيعية والرؤية الحاسوبية."
        ),
      },
    ],
  },
  {
    id: "ai-engineer",
    title: l("AI Engineer", "مهندس ذكاء اصطناعي"),
    icon: "🧠",
    accent: "#9333ea",
    category: "data-ai",
    description: l(
      "AI engineers build software products around machine learning models. They prepare data, train or adapt models, including large language models, and put them into production as reliable services that can be monitored and improved.",
      "يبني مهندسو الذكاء الاصطناعي منتجات برمجية حول نماذج تعلّم الآلة. يجهّزون البيانات، ويدرّبون النماذج أو يكيّفونها، بما فيها النماذج اللغوية الكبيرة، ثم ينشرونها في بيئة الإنتاج كخدمات موثوقة يمكن مراقبتها وتحسينها."
    ),
    ifYouLike: [
      l("Building things that learn from data", "بناء أشياء تتعلّم من البيانات"),
      l("Programming and math together", "البرمجة والرياضيات معاً"),
      l("Following and trying new technology", "متابعة التقنيات الجديدة وتجربتها"),
    ],
    skills: [
      l("Python", "بايثون"),
      l("Machine learning", "تعلّم الآلة"),
      l("Deep learning", "التعلّم العميق"),
      l("NLP and large language models", "معالجة اللغات الطبيعية والنماذج اللغوية الكبيرة"),
      l("Data preparation", "تجهيز البيانات"),
      l("Model deployment and monitoring", "نشر النماذج ومراقبتها"),
      l("Algorithms and data structures", "الخوارزميات وهياكل البيانات"),
    ],
    jobs: [
      l("AI Engineer", "مهندس ذكاء اصطناعي"),
      l("Machine Learning Engineer", "مهندس تعلّم آلة"),
      l("MLOps Engineer", "مهندس MLOps"),
      l("Applied AI Developer", "مطوّر تطبيقات ذكاء اصطناعي"),
    ],
    courses: [
      {
        course: "data-structures-algorithms",
        level: "beginner",
        why: l(
          "AI engineers are software engineers first: complexity, data structures and algorithms.",
          "مهندسو الذكاء الاصطناعي مهندسو برمجيات أولاً: التعقيد وهياكل البيانات والخوارزميات."
        ),
      },
      {
        course: "data-science",
        level: "beginner",
        why: l(
          "Statistics, Python for data and visualization: the toolkit for preparing and understanding training data.",
          "الإحصاء وبايثون للبيانات وتصوير البيانات: أدوات تجهيز بيانات التدريب وفهمها."
        ),
      },
      {
        course: "artificial-intelligence",
        level: "intermediate",
        why: l(
          "Machine learning, deep learning, NLP, large language models and generative AI: the models you will build products with.",
          "تعلّم الآلة والتعلّم العميق ومعالجة اللغات والنماذج اللغوية الكبيرة والذكاء الاصطناعي التوليدي: النماذج التي ستبني بها المنتجات."
        ),
      },
      {
        course: "mlops",
        level: "advanced",
        why: l(
          "Taking a model to production: packaging, serving, monitoring and retraining.",
          "نقل النموذج إلى بيئة الإنتاج: تحزيمه وتقديمه كخدمة ومراقبته وإعادة تدريبه."
        ),
      },
    ],
  },
  {
    id: "cloud-engineer",
    title: l("Cloud Engineer", "مهندس سحابة"),
    icon: "🏗️",
    accent: "#0891b2",
    category: "cloud-devops",
    description: l(
      "Cloud engineers design, build and run the infrastructure that applications use on cloud platforms such as AWS, Azure and Google Cloud. They set up networks, compute and storage, automate them with infrastructure as code, and keep them secure, reliable and within budget.",
      "يصمّم مهندسو السحابة البنية التحتية التي تعمل عليها التطبيقات في منصات سحابية مثل AWS وAzure وGoogle Cloud، ويبنونها ويشغّلونها. يجهّزون الشبكات وموارد الحوسبة والتخزين، ويؤتمتونها بالبنية التحتية ككود، ويحافظون على أمانها وموثوقيتها وضبط تكلفتها."
    ),
    ifYouLike: [
      l("Designing systems that keep running", "تصميم أنظمة تستمر في العمل"),
      l("Automating repetitive work", "أتمتة الأعمال المتكررة"),
      l("Understanding how internet infrastructure works", "فهم طريقة عمل البنية التحتية للإنترنت"),
    ],
    skills: [
      l("Linux administration", "إدارة لينكس"),
      l("Cloud networking", "شبكات السحابة"),
      l("AWS core services", "خدمات AWS الأساسية"),
      l("Infrastructure as code", "البنية التحتية ككود"),
      l("Cloud security", "أمن السحابة"),
      l("Containers and Kubernetes", "الحاويات وKubernetes"),
      l("CI/CD pipelines", "خطوط CI/CD"),
    ],
    jobs: [
      l("Cloud Engineer", "مهندس سحابة"),
      l("Cloud Administrator", "مسؤول أنظمة سحابية"),
      l("Solutions Architect", "مهندس حلول"),
      l("Infrastructure Engineer", "مهندس بنية تحتية"),
    ],
    courses: [
      {
        course: "operating-systems",
        level: "beginner",
        why: l(
          "Cloud servers are mostly Linux machines: processes, memory, file systems and the shell.",
          "خوادم السحابة في معظمها أجهزة لينكس: العمليات والذاكرة وأنظمة الملفات وسطر الأوامر."
        ),
      },
      {
        course: "networking",
        level: "beginner",
        why: l(
          "Virtual networks, subnets, DNS and firewalls are the base of every cloud architecture.",
          "الشبكات الافتراضية والشبكات الفرعية وDNS والجدران النارية هي أساس كل بنية سحابية."
        ),
      },
      {
        course: "cloud-computing",
        level: "intermediate",
        why: l(
          "The core of the role: cloud concepts, AWS core services, cloud networking, security and architecture.",
          "جوهر الدور: مفاهيم السحابة وخدمات AWS الأساسية وشبكات السحابة والأمن والبنية المعمارية."
        ),
      },
      {
        course: "devops",
        level: "advanced",
        why: l(
          "Automate and operate what you build: Docker, Kubernetes, CI/CD, infrastructure as code and monitoring.",
          "أتمت ما تبنيه وشغّله: Docker وKubernetes وCI/CD والبنية التحتية ككود والمراقبة."
        ),
      },
    ],
  },
  {
    id: "devops-engineer",
    title: l("DevOps Engineer", "مهندس DevOps"),
    icon: "🚀",
    accent: "#ea580c",
    category: "cloud-devops",
    description: l(
      "DevOps engineers shorten the path from a code change to a running service. They build CI/CD pipelines, package applications in containers, manage infrastructure as code and set up the monitoring that tells a team when something breaks.",
      "يختصر مهندسو DevOps الطريق من تعديل الشيفرة إلى خدمة تعمل في بيئة الإنتاج. يبنون خطوط CI/CD، ويحزّمون التطبيقات في حاويات، ويديرون البنية التحتية ككود، ويجهّزون المراقبة التي تُعلم الفريق عندما يتعطل شيء ما."
    ),
    ifYouLike: [
      l("Automating anything you have to do twice", "أتمتة أي عمل تضطر إلى تكراره"),
      l("Helping teams ship faster", "مساعدة الفرق على الإنجاز بسرعة أكبر"),
      l("Troubleshooting systems under pressure", "تشخيص أعطال الأنظمة تحت الضغط"),
    ],
    skills: [
      l("Linux and shell scripting", "لينكس وكتابة سكربتات Shell"),
      l("Git", "Git"),
      l("Docker", "Docker"),
      l("Kubernetes", "Kubernetes"),
      l("CI/CD pipelines", "خطوط CI/CD"),
      l("Infrastructure as code", "البنية التحتية ككود"),
      l("Monitoring and observability", "المراقبة وقابلية الملاحظة"),
    ],
    jobs: [
      l("DevOps Engineer", "مهندس DevOps"),
      l("Site Reliability Engineer", "مهندس موثوقية المواقع (SRE)"),
      l("Platform Engineer", "مهندس منصات"),
      l("Build and Release Engineer", "مهندس بناء وإصدار"),
    ],
    courses: [
      {
        course: "operating-systems",
        level: "beginner",
        why: l(
          "Pipelines and containers run on Linux: processes, permissions, file systems and the shell.",
          "تعمل خطوط النشر والحاويات على لينكس: العمليات والصلاحيات وأنظمة الملفات وسطر الأوامر."
        ),
      },
      {
        course: "networking",
        level: "beginner",
        why: l(
          "Services talk over the network: ports, DNS, HTTP, TLS and the tools to troubleshoot them.",
          "تتواصل الخدمات عبر الشبكة: المنافذ وDNS وHTTP وTLS وأدوات تشخيص أعطالها."
        ),
      },
      {
        course: "devops",
        level: "intermediate",
        why: l(
          "The core of the role: Git, Docker, CI/CD, Kubernetes, infrastructure as code and monitoring.",
          "جوهر الدور: Git وDocker وCI/CD وKubernetes والبنية التحتية ككود والمراقبة."
        ),
      },
      {
        course: "cloud-computing",
        level: "advanced",
        why: l(
          "Most pipelines deploy to the cloud: core services, cloud networking, security and architecture.",
          "تنشر معظم خطوط النشر إلى السحابة: الخدمات الأساسية وشبكات السحابة والأمن والبنية المعمارية."
        ),
      },
    ],
  },
  {
    id: "ux-designer",
    title: l("UX Designer", "مصمم تجربة المستخدم"),
    icon: "🧭",
    accent: "#7c3aed",
    category: "design",
    description: l(
      "UX designers make products easy and pleasant to use. They research what users need, map out flows and wireframes, build prototypes to test ideas, and work with developers so the final product matches the design and is accessible to everyone.",
      "يجعل مصممو تجربة المستخدم المنتجات سهلة الاستخدام وممتعة. يبحثون في احتياجات المستخدمين، ويرسمون مسارات الاستخدام والإطارات السلكية، ويبنون نماذج أولية لاختبار الأفكار، ويعملون مع المطوّرين حتى يطابق المنتج النهائي التصميم ويكون في متناول الجميع."
    ),
    ifYouLike: [
      l("Understanding how people think and behave", "فهم طريقة تفكير الناس وسلوكهم"),
      l("Sketching and visual design", "الرسم والتصميم البصري"),
      l("Making confusing things simple", "تبسيط الأشياء المربكة"),
    ],
    skills: [
      l("User research", "أبحاث المستخدمين"),
      l("Wireframing and information architecture", "الإطارات السلكية وهندسة المعلومات"),
      l("Prototyping in Figma", "النماذج الأولية في Figma"),
      l("Design systems", "أنظمة التصميم"),
      l("Accessibility", "سهولة الوصول"),
      l("Typography and color", "الخطوط والألوان"),
      l("HTML and CSS basics", "أساسيات HTML وCSS"),
    ],
    jobs: [
      l("UX Designer", "مصمم تجربة المستخدم"),
      l("Product Designer", "مصمم منتجات"),
      l("UX Researcher", "باحث تجربة المستخدم"),
      l("Interaction Designer", "مصمم تفاعل"),
    ],
    courses: [
      {
        course: "ui-ux",
        level: "beginner",
        why: l(
          "The core of the role: design principles, Figma, user research, wireframes, prototypes, design systems and accessibility.",
          "جوهر الدور: مبادئ التصميم وFigma وأبحاث المستخدمين والإطارات السلكية والنماذج الأولية وأنظمة التصميم وسهولة الوصول."
        ),
      },
      {
        course: "frontend",
        level: "intermediate",
        why: l(
          "Knowing HTML, CSS and how React builds interfaces helps you design what can be built and talk with developers.",
          "معرفة HTML وCSS وطريقة بناء React للواجهات تساعدك على تصميم ما يمكن تنفيذه والتحاور مع المطوّرين."
        ),
      },
    ],
  },
  {
    id: "software-engineer",
    title: l("Software Engineer", "مهندس برمجيات"),
    icon: "⌨️",
    accent: "#059669",
    category: "software",
    description: l(
      "Software engineers design, write, test and maintain the programs that businesses run on. Beyond writing code that works, they choose the right data structures and algorithms, understand the systems their code runs on, and build services and data stores that stay correct and fast as they grow.",
      "يصمّم مهندسو البرمجيات البرامج التي تعتمد عليها الشركات، ويكتبونها ويختبرونها ويصونونها. وإلى جانب كتابة شيفرة تعمل، يختارون هياكل البيانات والخوارزميات المناسبة، ويفهمون الأنظمة التي تعمل عليها شيفرتهم، ويبنون خدمات ومخازن بيانات تبقى صحيحة وسريعة مع نموها."
    ),
    ifYouLike: [
      l("Solving logic puzzles", "حلّ الألغاز المنطقية"),
      l("Building tools other people rely on", "بناء أدوات يعتمد عليها الآخرون"),
      l("Understanding how things work under the hood", "فهم طريقة عمل الأشياء من الداخل"),
    ],
    skills: [
      l("Data structures and algorithms", "هياكل البيانات والخوارزميات"),
      l("Complexity analysis (Big-O)", "تحليل التعقيد (Big-O)"),
      l("Processes, memory and concurrency", "العمليات والذاكرة والتزامن"),
      l("API design", "تصميم واجهات البرمجة"),
      l("SQL and transactions", "SQL والمعاملات"),
      l("System design", "تصميم الأنظمة"),
      l("Testing and debugging", "الاختبار وتصحيح الأخطاء"),
    ],
    jobs: [
      l("Software Engineer", "مهندس برمجيات"),
      l("Software Developer", "مطوّر برمجيات"),
      l("Backend Developer", "مطوّر الواجهات الخلفية"),
      l("Systems Programmer", "مبرمج أنظمة"),
    ],
    courses: [
      {
        course: "data-structures-algorithms",
        level: "beginner",
        why: l(
          "The foundation of efficient code and coding interviews: Big-O, arrays, hash maps, sorting, trees and graphs.",
          "أساس الشيفرة الفعّالة ومقابلات البرمجة: Big-O والمصفوفات وجداول التجزئة والترتيب والأشجار والرسوم البيانية."
        ),
      },
      {
        course: "operating-systems",
        level: "intermediate",
        why: l(
          "Know what your program does at run time: processes, threads, scheduling, memory and concurrency.",
          "اعرف ما يفعله برنامجك وقت التشغيل: العمليات والخيوط والجدولة والذاكرة والتزامن."
        ),
      },
      {
        course: "backend",
        level: "intermediate",
        why: l(
          "Build real services: APIs, authentication, caching, queues, deployment and system design.",
          "ابنِ خدمات حقيقية: واجهات البرمجة والمصادقة والتخزين المؤقت وطوابير الرسائل والنشر وتصميم الأنظمة."
        ),
      },
      {
        course: "databases",
        level: "intermediate",
        why: l(
          "Design schemas, write efficient queries and reason about indexes and transactions.",
          "صمّم المخططات واكتب استعلامات فعّالة وافهم الفهارس والمعاملات."
        ),
      },
    ],
  },
];

export function getCareerPath(id: string): CareerPath | undefined {
  return careerPaths.find((p) => p.id === id);
}

export function getPlannedCourse(id: string): PlannedCourse | undefined {
  return plannedCourses.find((c) => c.id === id);
}
