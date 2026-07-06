import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "setup",
  title: { en: "Setup & Prerequisites — Build Your Lab", ar: "الإعداد والمتطلبات — ابنِ مختبرك" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll set up

Before you touch a single security tool, you need your own workbench. In this lesson you will:

1. Install a **code editor** (VS Code) — where you'll write every script in this roadmap
2. Install **Python** itself on your machine — not just in the browser
3. Build a **safe, legal virtual lab** (VirtualBox + Kali Linux) — your own private "shooting range"
4. Create free accounts on two hands-on practice platforms for later
5. Prove it all works with a real, checked script — your first working result today

Twenty minutes of setup now saves you hours of confusion later. Let's go.`,
        ar: `## ما الذي ستجهّزه

قبل أن تلمس أي أداة أمنية، تحتاج طاولة عمل خاصة بك. في هذا الدرس ستقوم بـ:

1. تثبيت **محرر أكواد** (VS Code) — حيث ستكتب كل سكربت في هذا المسار
2. تثبيت **بايثون** نفسه على جهازك — لا في المتصفح فقط
3. بناء **مختبر افتراضي آمن وقانوني** (VirtualBox + Kali Linux) — "ميدان رماية" خاص بك
4. إنشاء حسابين مجانيين في منصتي تدريب عملي لاستخدامهما لاحقاً
5. إثبات أن كل شيء يعمل بسكربت حقيقي مُصحَّح — أول نتيجة عملية لك اليوم

عشرون دقيقة من الإعداد الآن توفّر عليك ساعات من الحيرة لاحقاً. لنبدأ.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Why a locksmith owns their own locks 🔧

A locksmith practices on locks they bought — never on a stranger's front door. Cybersecurity works the same way: you need your own **private lab** to safely practice attacking and defending, without ever touching a system you don't own or have written permission to test. That's not just good practice — it's the line between "student" and "criminal" (you'll revisit this in the Penetration Testing lesson).

Three tools make up your workbench:

- **A code editor** (VS Code) — a smart text editor for writing Python scripts, reading config files, and editing code with color-highlighting and autocomplete. Notepad works; VS Code works *much* better.
- **Python** — the automation language you'll use throughout this roadmap (you met it in the Python lesson). You need it installed on your actual computer, not just running in this browser.
- **A Virtual Machine (VM)** — a "computer inside your computer." It runs a separate operating system in a sandboxed window. If you break it, misconfigure it, or even get it infected while practicing — your real computer is completely untouched. This is where you'll safely run **Kali Linux**, the standard operating system built specifically for security work (loaded with hundreds of pre-installed tools).`,
        ar: `## لماذا يملك صانع الأقفال أقفاله الخاصة 🔧

صانع الأقفال يتدرّب على أقفال اشتراها — لا على باب منزل شخص غريب. الأمن السيبراني يعمل بنفس المنطق: تحتاج **مختبراً خاصاً** لتتدرّب بأمان على الهجوم والدفاع، دون أن تلمس أبداً نظاماً لا تملكه أو لا تملك إذناً مكتوباً لاختباره. هذا ليس مجرد ممارسة جيدة — إنه الخط الفاصل بين "طالب" و"مجرم" (ستعود لهذه النقطة في درس اختبار الاختراق).

ثلاث أدوات تُشكّل طاولة عملك:

- **محرر أكواد** (VS Code) — محرر نصوص ذكي لكتابة سكربتات بايثون وقراءة ملفات الإعداد وتحرير الكود مع تلوين وإكمال تلقائي. المفكرة (Notepad) تعمل؛ لكن VS Code يعمل بشكل *أفضل بكثير*.
- **بايثون** — لغة الأتمتة التي ستستخدمها طوال هذا المسار (قابلتها في درس بايثون). تحتاج تثبيتها على جهازك الفعلي، لا تشغيلها في هذا المتصفح فقط.
- **جهاز افتراضي (VM)** — "حاسوب داخل حاسوبك." يشغّل نظام تشغيل منفصلاً في نافذة معزولة. إن كسرته، أو أسأت إعداده، أو حتى أصابته عدوى أثناء التدريب — يبقى حاسوبك الحقيقي سليماً تماماً. هنا ستشغّل بأمان **Kali Linux**، نظام التشغيل المعياري المصمم خصيصاً لعمل الأمن (محمّل بمئات الأدوات المثبّتة مسبقاً).`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Step 1 — Install a code editor

Download and install **[Visual Studio Code](https://code.visualstudio.com/download)** — it's free, and works on Windows, macOS, and Linux.

1. Click the link above and download the installer for your operating system
2. Run it and accept the defaults — no special options needed
3. Open VS Code once installed. You'll use it to write every Python script in this roadmap

That's it — you now have a real development environment, the same one professional security engineers use.`,
        ar: `## الخطوة 1 — ثبّت محرر أكواد

نزّل وثبّت **[Visual Studio Code](https://code.visualstudio.com/download)** — مجاني، ويعمل على Windows وmacOS وLinux.

1. اضغط الرابط أعلاه ونزّل المثبّت المناسب لنظام تشغيلك
2. شغّله واقبل الإعدادات الافتراضية — لا حاجة لخيارات خاصة
3. افتح VS Code بعد التثبيت. ستستخدمه لكتابة كل سكربت بايثون في هذا المسار

هذا كل شيء — لديك الآن بيئة تطوير حقيقية، نفسها التي يستخدمها مهندسو الأمن المحترفون.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Step 2 — Install Python on your machine

Go to **[python.org/downloads](https://www.python.org/downloads/)** and download the latest version for your OS.

⚠️ **On Windows, this matters:** on the first installer screen, tick the checkbox **"Add python.exe to PATH"** *before* clicking Install. Skip this and your terminal won't find Python later.

To confirm it worked, open a terminal (Command Prompt / Terminal app) and type:

\`\`\`
python --version
\`\`\`

If it prints something like \`Python 3.12.x\`, you're done. (On some systems the command is \`python3\` instead of \`python\`.)`,
        ar: `## الخطوة 2 — ثبّت بايثون على جهازك

اذهب إلى **[python.org/downloads](https://www.python.org/downloads/)** ونزّل أحدث إصدار لنظام تشغيلك.

⚠️ **على ويندوز، هذا مهم:** في شاشة المثبّت الأولى، فعّل مربّع **"Add python.exe to PATH"** *قبل* الضغط على Install. إن تجاوزت هذه الخطوة، لن تجد الطرفية بايثون لاحقاً.

للتأكد أنه نجح، افتح طرفية (Command Prompt / Terminal) واكتب:

\`\`\`
python --version
\`\`\`

إن ظهر شيء مثل \`Python 3.12.x\`، فقد انتهيت. (في بعض الأنظمة الأمر هو \`python3\` بدل \`python\`.)`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Step 3 — Build your safe hacking lab

1. Download **[VirtualBox](https://www.virtualbox.org/wiki/Downloads)** (free, by Oracle) and install it — this is the program that runs virtual machines.
2. Download the official **[Kali Linux VirtualBox image](https://www.kali.org/get-kali/#kali-virtual-machines)** — a ready-made Kali VM, no manual OS install needed.
3. Open VirtualBox → **Import** the downloaded Kali file → start it. Default login is usually \`kali\` / \`kali\`.

You now have an isolated, disposable security lab. Anything you do inside Kali stays inside Kali — practice freely, break things on purpose, and reset it anytime by re-importing the image.

**The one rule that matters most:** only ever scan, attack, or test systems you own (like this VM) or have *explicit written permission* to test. Everything else is illegal — no exceptions.`,
        ar: `## الخطوة 3 — ابنِ مختبر القرصنة الآمن

1. نزّل **[VirtualBox](https://www.virtualbox.org/wiki/Downloads)** (مجاني، من Oracle) وثبّته — هذا البرنامج الذي يشغّل الأجهزة الافتراضية.
2. نزّل **[نسخة Kali Linux الرسمية لـ VirtualBox](https://www.kali.org/get-kali/#kali-virtual-machines)** — جهاز Kali جاهز، بلا حاجة لتثبيت نظام تشغيل يدوياً.
3. افتح VirtualBox ← **استورد (Import)** ملف Kali الذي نزّلته ← شغّله. بيانات الدخول الافتراضية عادة \`kali\` / \`kali\`.

الآن لديك مختبر أمني معزول وقابل للتصفير. أي شيء تفعله داخل Kali يبقى داخل Kali — تدرّب بحرية، اكسر الأشياء عمداً، وأعِد ضبطه في أي وقت بإعادة استيراد الملف.

**القاعدة الوحيدة الأهم:** لا تفحص أو تهاجم أو تختبر إلا أنظمة تملكها (كهذا الجهاز الافتراضي) أو لديك *إذن مكتوب صريح* لاختبارها. أي شيء آخر غير قانوني — بلا استثناءات.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Step 4 (optional but recommended) — Free practice accounts

Later in this roadmap (especially the Penetration Testing lesson) you'll want deliberately-vulnerable machines to practice on legally. Create free accounts now so they're ready when you need them:

- **[TryHackMe](https://tryhackme.com/)** — guided, beginner-friendly hands-on labs
- **[Hack The Box](https://www.hackthebox.com/)** — more advanced, unguided challenges

Both have generous free tiers — no payment needed to start learning.`,
        ar: `## الخطوة 4 (اختيارية لكن مُوصى بها) — حسابات تدريب مجانية

لاحقاً في هذا المسار (خصوصاً درس اختبار الاختراق) ستحتاج أجهزة هشّة عمداً للتدرّب عليها بشكل قانوني. أنشئ حسابات مجانية الآن لتكون جاهزة عند الحاجة:

- **[TryHackMe](https://tryhackme.com/)** — تمارين عملية موجّهة، مناسبة للمبتدئين
- **[Hack The Box](https://www.hackthebox.com/)** — تحديات أكثر تقدماً وغير موجّهة

كلاهما لهما مستوى مجاني سخي — لا حاجة للدفع لتبدأ التعلّم.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `**Prove your setup works.** This exercise runs right here in your browser (via an in-browser Python engine) — a preview of the real Python you just installed locally.

Write code that:
1. Stores your name in a variable called \`my_name\`
2. Stores your target job title (e.g. \`"SOC Analyst"\`) in a variable called \`goal\`
3. Prints: \`"<my_name> is ready to become a <goal>."\`

This is your first checked, working result on this roadmap — small, but real.`,
        ar: `**أثبِت أن إعدادك يعمل.** هذا التمرين يعمل هنا مباشرة في متصفحك (عبر محرك بايثون داخل المتصفح) — معاينة لبايثون الحقيقي الذي ثبّته للتو على جهازك.

اكتب كوداً:
1. يخزّن اسمك في متغير اسمه \`my_name\`
2. يخزّن وظيفتك المستهدفة (مثل \`"SOC Analyst"\`) في متغير اسمه \`goal\`
3. يطبع: \`"<my_name> is ready to become a <goal>."\`

هذه أول نتيجة حقيقية مُصحَّحة لك في هذا المسار — صغيرة، لكنها حقيقية.`,
      },
      starterCode: `my_name = ""
goal = ""

# print: "<my_name> is ready to become a <goal>."
`,
      solution: `my_name = "Alex"
goal = "SOC Analyst"

print(my_name + " is ready to become a " + goal + ".")`,
      hints: [
        { en: `Set my_name and goal to any non-empty text, in quotes.`, ar: `اجعل my_name وgoal أي نص غير فارغ، بين علامتي اقتباس.` },
        { en: `Build the sentence with +: print(my_name + " is ready to become a " + goal + ".")`, ar: `ابنِ الجملة بعلامة +: print(my_name + " is ready to become a " + goal + ".")` },
      ],
      tests: [
        { name: { en: "my_name is set to real text", ar: "my_name يحمل نصاً حقيقياً" }, check: `assert isinstance(my_name, str) and len(my_name) > 0` },
        { name: { en: "goal is set to real text", ar: "goal يحمل نصاً حقيقياً" }, check: `assert isinstance(goal, str) and len(goal) > 0` },
        { name: { en: "The full sentence was printed", ar: "طُبعت الجملة كاملة" }, check: `assert my_name in _stdout and goal in _stdout and "ready to become a" in _stdout` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Why practice inside a Virtual Machine instead of directly on your main computer?", ar: "لماذا تتدرّب داخل جهاز افتراضي بدل جهازك الرئيسي مباشرة؟" },
          choices: [
            { en: "If something breaks or gets infected, your real computer stays completely safe", ar: "إن انكسر شيء أو أصابته عدوى، يبقى حاسوبك الحقيقي سليماً تماماً" },
            { en: "VMs make Python run faster", ar: "الأجهزة الافتراضية تجعل بايثون أسرع" },
            { en: "It's required to install VS Code", ar: "مطلوب لتثبيت VS Code" },
          ],
          answer: 0,
          explain: {
            en: "A VM is a disposable sandbox — mistakes, malware, or broken configs stay isolated inside it, never touching your host machine.",
            ar: "الجهاز الافتراضي صندوق رملي قابل للتصفير — الأخطاء أو البرمجيات الخبيثة أو الإعدادات المكسورة تبقى معزولة بداخله، ولا تلمس جهازك المضيف أبداً.",
          },
        },
        {
          q: { en: "On Windows, what must you check during the Python installer's first screen?", ar: "على ويندوز، ما الذي يجب تفعيله في الشاشة الأولى لمثبّت بايثون؟" },
          choices: [
            { en: `"Add python.exe to PATH"`, ar: `"Add python.exe to PATH"` },
            { en: "Install for all browsers", ar: "التثبيت لكل المتصفحات" },
            { en: "Nothing, defaults are fine", ar: "لا شيء، الافتراضي يكفي" },
          ],
          answer: 0,
          explain: {
            en: "Skipping this means your terminal won't recognize the `python` command afterward — a very common beginner snag.",
            ar: "تجاوز هذا يعني أن طرفيتك لن تتعرّف على أمر `python` لاحقاً — مشكلة شائعة جداً للمبتدئين.",
          },
        },
        {
          q: { en: "Which of these is it legal and ethical to scan or attack?", ar: "أي من هذه قانوني وأخلاقي فحصه أو مهاجمته؟" },
          choices: [
            { en: "A random company's website you found online", ar: "موقع شركة عشوائية وجدتها على الإنترنت" },
            { en: "Your own Kali Linux virtual machine", ar: "جهازك الافتراضي الخاص بـ Kali Linux" },
            { en: "A neighbor's WiFi network", ar: "شبكة WiFi الجار" },
          ],
          answer: 1,
          explain: {
            en: "Only systems you own or have explicit written permission to test are fair game. Everything else is a crime — no exceptions.",
            ar: "فقط الأنظمة التي تملكها أو لديك إذن مكتوب صريح لاختبارها مسموحة. أي شيء آخر جريمة — بلا استثناءات.",
          },
        },
        {
          q: { en: "What is Kali Linux?", ar: "ما هو Kali Linux؟" },
          choices: [
            { en: "A code editor", ar: "محرر أكواد" },
            { en: "An operating system pre-loaded with security tools", ar: "نظام تشغيل محمّل مسبقاً بأدوات أمنية" },
            { en: "A certification exam", ar: "امتحان شهادة" },
          ],
          answer: 1,
          explain: {
            en: "Kali is a Linux distribution built specifically for security work, with hundreds of tools ready to use — the standard practice OS.",
            ar: "Kali توزيعة لينكس مبنية خصيصاً لعمل الأمن، بمئات الأدوات الجاهزة للاستخدام — نظام التشغيل المعياري للتدريب.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## You're ready ✅

Your checklist:

- [x] Code editor installed (VS Code)
- [x] Python installed on your machine
- [x] VirtualBox + Kali Linux — your private lab
- [x] TryHackMe / Hack The Box accounts created
- [x] Your first working, checked script ran successfully

Nothing left standing between you and the rest of this roadmap. **Next up: Computer Basics** — the foundations everything else builds on.`,
        ar: `## أنت جاهز ✅

قائمتك:

- [x] محرر الأكواد مثبَّت (VS Code)
- [x] بايثون مثبَّت على جهازك
- [x] VirtualBox + Kali Linux — مختبرك الخاص
- [x] حسابا TryHackMe / Hack The Box جاهزان
- [x] أول سكربت حقيقي مُصحَّح عمل بنجاح

لم يعد هناك ما يقف بينك وبين بقية هذا المسار. **التالي: أساسيات الحاسوب** — الأساس الذي يُبنى عليه كل شيء آخر.`,
      },
    },
  ],
};
