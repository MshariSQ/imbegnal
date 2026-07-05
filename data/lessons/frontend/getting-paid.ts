import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "getting-paid",
  title: { en: "Getting Paid — Turn Skills into Income", ar: "كسب المال — حوّل مهاراتك إلى دخل" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The 3-project portfolio that gets replies
- Where the actual paid work is (Arabic + global platforms)
- How to price yourself as a beginner (with real numbers)
- Landing client #1 — and the scams to dodge

You've built skills through this whole track. This lesson is about converting them into money. It's a skill of its own — treat it like one.`,
        ar: `## ماذا ستتعلم

- معرض الأعمال ذو الثلاثة مشاريع الذي يجلب الردود
- أين العمل المدفوع فعلاً (منصات عربية + عالمية)
- كيف تسعّر نفسك كمبتدئ (بأرقام حقيقية)
- الوصول للعميل الأول — والاحتيالات التي تتجنبها

بنيت مهاراتك عبر هذا المسار كاملاً. هذا الدرس عن تحويلها إلى مال. وهذه مهارة بذاتها — تعامل معها كذلك.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Your shop window — the portfolio 🏪

Nobody pays a stranger who *says* they can build websites. They pay someone who **shows** websites they built. Your portfolio is your shop window, and it needs exactly **three things**:

**1. A personal site** (one page is enough): who you are, what you build, your 3 projects, contact button. Build it with Next.js + Tailwind, deploy free on Vercel or GitHub Pages.

**2. Three real-looking projects.** Not tutorials — things a client could imagine buying:

- **A business/restaurant site** — menu, map, WhatsApp contact button. (This is *the* most sold freelance item in the Arab market.)
- **A dashboard or web app** — your React skills: search, filters, charts.
- **An online store front** — product grid, cart UI. Even without real payments it proves the hardest UI skills.

**3. A clean GitHub profile:** pin those 3 repos, write a README for each **with a screenshot and a live link**. A README with a screenshot doubles the chance anyone looks further.

**The golden rule:** finished and deployed beats fancy and half-done. Three polished projects > ten broken experiments.`,
        ar: `## واجهة متجرك — معرض الأعمال 🏪

لا أحد يدفع لغريب *يقول* إنه يبني مواقع. يدفعون لمن **يريهم** مواقع بناها. معرض أعمالك هو واجهة متجرك، ويحتاج **ثلاثة أشياء** بالضبط:

**١. موقع شخصي** (صفحة واحدة تكفي): من أنت، ماذا تبني، مشاريعك الثلاثة، زر تواصل. ابنه بـ Next.js + Tailwind وانشره مجاناً على Vercel أو GitHub Pages.

**٢. ثلاثة مشاريع تبدو حقيقية.** ليست دروساً منسوخة — أشياء يتخيل العميل شراءها:

- **موقع شركة/مطعم** — قائمة طعام، خريطة، زر تواصل واتساب. (هذا *أكثر* منتج مبيعاً في سوق العمل الحر العربي.)
- **لوحة تحكم أو تطبيق ويب** — مهارات React: بحث، فلاتر، رسوم بيانية.
- **واجهة متجر إلكتروني** — شبكة منتجات، سلة مشتريات. حتى بدون دفع حقيقي تثبت أصعب مهارات الواجهات.

**٣. ملف GitHub نظيف:** ثبّت المستودعات الثلاثة، واكتب README لكل واحد **مع لقطة شاشة ورابط مباشر**. الـ README مع لقطة شاشة يضاعف احتمال أن يكمل أحد النظر.

**القاعدة الذهبية:** مكتمل ومنشور يتفوق على مبهر ونصف جاهز. ثلاثة مشاريع متقنة > عشر تجارب مكسورة.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Where the money is 💰

**Arabic platforms** (less competition, your language advantage):

- **Mostaql (مستقل)** — the biggest Arabic freelance marketplace; project-based. Serious clients from the Gulf.
- **Khamsat (خمسات)** — sell fixed "gigs" starting at $5 (e.g. "landing page for $50").
- **Baaeed / LinkedIn** — Gulf remote jobs; keep your LinkedIn in both languages.

**Global platforms** (more work, more competition, better rates):

- **Upwork** — the largest. Hard to start, gold once you have 5+ reviews.
- **Fiverr** — gig-based like Khamsat but worldwide.

**And don't skip the street-level route:** local businesses near you with no website or a terrible one. A message like "I noticed your restaurant's menu is a blurry photo — I build fast mobile-friendly sites, here are three examples" converts better than any platform bid, because you have zero competition in that conversation.

**Pricing for your first 3 months (guidance, not law):**

- First 2–3 projects: **$50–150** per small site — you're buying *reviews*, and reviews are worth more than the money
- After 5 reviews: **$200–500** per site; raise ~20% every few projects until people start saying no
- Hourly on Upwork: start **$10–15/h**, raise after each contract

Never work for "exposure". Free work is only acceptable for a real charity you choose, delivered at full quality, counted as portfolio.`,
        ar: `## أين المال 💰

**المنصات العربية** (منافسة أقل، ولغتك ميزة):

- **مستقل (Mostaql)** — أكبر سوق عمل حر عربي؛ قائم على المشاريع. عملاء جادّون من الخليج.
- **خمسات (Khamsat)** — بيع "خدمات" ثابتة تبدأ من 5$ (مثلاً "صفحة هبوط بـ 50$").
- **بعيد / LinkedIn** — وظائف الخليج عن بعد؛ اجعل حسابك على LinkedIn باللغتين.

**المنصات العالمية** (عمل أكثر، منافسة أكثر، أسعار أفضل):

- **Upwork** — الأكبر عالمياً. صعب البداية، ذهبٌ بعد 5 تقييمات.
- **Fiverr** — خدمات مثل خمسات لكن عالمياً.

**ولا تهمل الطريق المباشر:** المحلات القريبة منك بلا موقع أو بموقع سيئ. رسالة مثل "لاحظت أن قائمة مطعمكم صورة غير واضحة — أبني مواقع سريعة تعمل على الجوال، هذه ثلاثة أمثلة" تنجح أكثر من أي عرض على منصة، لأنك بلا منافسين في تلك المحادثة.

**التسعير لأول 3 أشهر (إرشاد لا قانون):**

- أول 2–3 مشاريع: **50–150$** للموقع الصغير — أنت تشتري *التقييمات*، والتقييمات أثمن من المال
- بعد 5 تقييمات: **200–500$** للموقع؛ ارفع ~20% كل بضعة مشاريع حتى يبدأ الرفض
- بالساعة على Upwork: ابدأ **10–15$/ساعة** وارفع بعد كل عقد

لا تعمل مقابل "الانتشار" أبداً. العمل المجاني مقبول فقط لجمعية خيرية حقيقية تختارها أنت، بجودة كاملة، ويُحسب ضمن معرض أعمالك.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Client #1 — the playbook 🎯

**Writing a proposal that gets replies** (clients receive 50; they read 3):

1. **First line about THEM, not you:** "Your bakery's site doesn't open properly on phones — that's costing you orders."
2. **Proof:** "Here's a similar site I built: [link]"
3. **Concrete promise:** "5 pages, mobile-first, loads under 2 seconds, delivered in 7 days for $X."
4. **Easy next step:** "15-minute call this week?"

Four sentences. No autobiography, no "I am hardworking and passionate".

**Protect yourself (memorize these):**

- **50% upfront**, 50% on delivery. A client who refuses any deposit is a red flag.
- **Scope in writing** before starting: pages, features, revision count (e.g. 2 rounds). "Small change" creep is how projects die.
- Show work on **your** staging link; hand over final files/hosting **after** final payment.
- On platforms, keep chat and payment **inside the platform** — moving to WhatsApp kills your protection.
- "I'll pay you next month after profits" = no. "Overpayment by check, refund the difference" = classic scam, run.

**The rhythm that works:** apply/reach out to 5 opportunities a day, every day, for 30 days. Most people send 10 total and quit. Volume + a real portfolio beats talent that doesn't show up.`,
        ar: `## العميل الأول — خطة اللعب 🎯

**كتابة عرض يجلب الردود** (يستلم العميل 50 عرضاً؛ يقرأ 3):

1. **أول سطر عنه هو، لا عنك أنت:** "موقع مخبزكم لا يفتح جيداً على الجوال — وهذا يكلفكم طلبات."
2. **الدليل:** "هذا موقع مشابه بنيته: [رابط]"
3. **وعد ملموس:** "5 صفحات، متوافق مع الجوال، يفتح بأقل من ثانيتين، تسليم خلال 7 أيام مقابل X$."
4. **خطوة تالية سهلة:** "مكالمة 15 دقيقة هذا الأسبوع؟"

أربع جمل. بلا سيرة ذاتية، بلا "أنا مجتهد وشغوف".

**احمِ نفسك (احفظها):**

- **50% مقدماً** و50% عند التسليم. عميل يرفض أي دفعة مقدمة علامة خطر.
- **نطاق العمل مكتوباً** قبل البدء: الصفحات، الميزات، عدد التعديلات (مثلاً جولتان). تسلل "تعديل بسيط" هو ما يقتل المشاريع.
- اعرض العمل على رابط تجريبي **عندك**؛ وسلّم الملفات/الاستضافة النهائية **بعد** الدفعة الأخيرة.
- على المنصات، أبقِ المحادثة والدفع **داخل المنصة** — الانتقال للواتساب يلغي حمايتك.
- "أدفع لك الشهر القادم بعد الأرباح" = لا. "دفع زائد بشيك وتعيد الفرق" = احتيال كلاسيكي، اهرب.

**الإيقاع الذي ينجح:** قدّم/تواصل مع 5 فرص يومياً، كل يوم، لمدة 30 يوماً. معظم الناس يرسلون 10 إجمالاً ثم ينسحبون. الاستمرارية + معرض حقيقي يتفوقان على موهبة لا تظهر.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What's the strongest portfolio for a beginner?", ar: "ما أقوى معرض أعمال للمبتدئ؟" },
          choices: [
            { en: "3 finished, deployed, client-like projects with READMEs", ar: "3 مشاريع مكتملة ومنشورة تشبه طلبات العملاء مع READMEs" },
            { en: "10 half-finished experiments", ar: "10 تجارب نصف مكتملة" },
            { en: "A list of courses completed", ar: "قائمة بالدورات المكتملة" },
          ],
          answer: 0,
          explain: {
            en: "Clients buy outcomes they can see. Deployed + screenshot + live link beats any certificate list.",
            ar: "العملاء يشترون نتائج يرونها. منشور + لقطة شاشة + رابط مباشر يتفوق على أي قائمة شهادات.",
          },
        },
        {
          q: { en: "Why accept low prices ($50–150) for your first projects?", ar: "لماذا تقبل أسعاراً منخفضة (50–150$) في مشاريعك الأولى؟" },
          choices: [
            { en: "Because your work has no value", ar: "لأن عملك بلا قيمة" },
            { en: "You're buying reviews — they unlock the real rates", ar: "أنت تشتري التقييمات — وهي تفتح الأسعار الحقيقية" },
            { en: "Clients never pay more", ar: "العملاء لا يدفعون أكثر أبداً" },
          ],
          answer: 1,
          explain: {
            en: "Platforms run on ratings. 5 five-star reviews change everything; then you raise prices ~20% repeatedly.",
            ar: "المنصات تعمل بالتقييمات. خمس تقييمات خمس نجوم تغيّر كل شيء؛ بعدها ترفع السعر ~20% مراراً.",
          },
        },
        {
          q: { en: "A new client refuses any upfront payment. You should…", ar: "عميل جديد يرفض أي دفعة مقدمة. عليك أن…" },
          choices: [
            { en: "Start anyway to build trust", ar: "تبدأ رغم ذلك لبناء الثقة" },
            { en: "Politely decline or insist on a deposit — it's a red flag", ar: "تعتذر بلطف أو تصر على المقدم — إنها علامة خطر" },
            { en: "Deliver everything first, then invoice", ar: "تسلّم كل شيء أولاً ثم تفوتر" },
          ],
          answer: 1,
          explain: {
            en: "50/50 is standard worldwide. Someone unwilling to commit anything is far more likely to vanish at delivery time.",
            ar: "50/50 هو المعيار عالمياً. من لا يلتزم بشيء أكثر عرضة للاختفاء وقت التسليم.",
          },
        },
        {
          q: { en: "The best first line of a proposal is about…", ar: "أفضل سطر أول في العرض يكون عن…" },
          choices: [
            { en: "Your years of study and passion", ar: "سنوات دراستك وشغفك" },
            { en: "The client's specific problem", ar: "مشكلة العميل تحديداً" },
            { en: "Your lowest possible price", ar: "أدنى سعر ممكن لديك" },
          ],
          answer: 1,
          explain: {
            en: "Clients scan for \"does this person understand MY problem?\" Lead with their issue, prove with your link, promise concretely.",
            ar: "العميل يبحث عن \"هل يفهم هذا الشخص مشكلتي أنا؟\" ابدأ بمشكلته، أثبت برابطك، وعِد بشكل ملموس.",
          },
        },
        {
          q: { en: "A client offers overpayment by check, asking you to refund the difference…", ar: "عميل يعرض دفعاً زائداً بشيك ويطلب إعادة الفرق…" },
          choices: [
            { en: "Great — extra trust!", ar: "رائع — ثقة إضافية!" },
            { en: "Classic scam — the check bounces after you refund. Refuse.", ar: "احتيال كلاسيكي — يرتد الشيك بعد إعادتك الفرق. ارفض." },
            { en: "Accept but refund half only", ar: "اقبل لكن أعد النصف فقط" },
          ],
          answer: 1,
          explain: {
            en: "The fake-check overpayment is one of the oldest freelancer scams. Real clients pay exact amounts through traceable channels.",
            ar: "الدفع الزائد بشيك مزيف من أقدم احتيالات العمل الحر. العملاء الحقيقيون يدفعون مبالغ مضبوطة عبر قنوات موثوقة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Your 30-day launch plan 🚀

- **Week 1:** finish + deploy the 3 portfolio projects, personal site live, GitHub pinned & README'd
- **Week 2:** profiles on Mostaql + Khamsat + Upwork (bilingual bio, link everything); LinkedIn updated
- **Weeks 3–4:** 5 tailored applications/outreaches per day; iterate your proposal whenever you get no reply

When the first money lands — and it will — remember the number that matters isn't the $50. It's the review, the case study, and the proof that strangers pay for your skills. From there it compounds.

مبروك مقدماً — والآن اذهب وابنِ. 🚀`,
        ar: `## خطة الإطلاق — 30 يوماً 🚀

- **الأسبوع 1:** أكمل وانشر المشاريع الثلاثة، الموقع الشخصي حي، GitHub مثبّت ومُوثّق
- **الأسبوع 2:** حسابات على مستقل + خمسات + Upwork (نبذة بلغتين، اربط كل شيء)؛ حدّث LinkedIn
- **الأسبوعان 3–4:** 5 عروض/مراسلات مخصصة يومياً؛ طوّر عرضك كلما غاب الرد

عندما يصل أول مبلغ — وسيصل — تذكر أن الرقم المهم ليس الـ 50$. بل التقييم، ودراسة الحالة، والدليل أن الغرباء يدفعون مقابل مهاراتك. ومن هناك يتضاعف كل شيء.

مبروك مقدماً — والآن اذهب وابنِ. 🚀`,
      },
    },
  ],
};
