import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "computer-basics",
  title: { en: "Computer Basics — How Machines Really Work", ar: "أساسيات الحاسوب — كيف تعمل الأجهزة فعلاً" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What actually happens inside a computer (CPU, RAM, storage)
- Why everything is **1s and 0s** (binary) — and you'll convert some yourself
- **Hexadecimal** — the shorthand security tools use for everything from hashes to file signatures
- What an operating system does
- The words every security professional uses daily

Security is about protecting computers, so first you must understand what a computer *is*.`,
        ar: `## ماذا ستتعلم

- ما الذي يحدث فعلاً داخل الحاسوب (المعالج، الذاكرة، التخزين)
- لماذا كل شيء **أصفار وواحدات** (النظام الثنائي) — وستحوّل بعضها بنفسك
- **النظام الست عشري (Hex)** — الاختصار الذي تستخدمه أدوات الأمن لكل شيء من التجزئات إلى توقيعات الملفات
- ماذا يفعل نظام التشغيل
- الكلمات التي يستخدمها كل محترف أمن يومياً

الأمن يعني حماية الحواسيب، لذا عليك أولاً أن تفهم ما *هو* الحاسوب.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The kitchen analogy 🍳

A computer is like a kitchen:

- **CPU** (processor) = the **chef**. Does all the actual work, one step at a time — but incredibly fast (billions of steps per second).
- **RAM** (memory) = the **countertop**. Fast workspace for what you're cooking *right now*. Turn off the power and it's wiped clean.
- **Storage** (SSD/hard drive) = the **fridge/pantry**. Keeps things permanently, even when off — but slower to reach than the countertop.
- **Operating System** (Windows, Linux, macOS) = the **kitchen manager**. Decides who uses the chef, how the countertop is shared, and who's allowed in.

**Why binary?** A computer is millions of tiny switches. A switch is either ON (1) or OFF (0). That's it. Every photo, song, and password is ultimately a huge pattern of ON/OFF switches. We group 8 switches into a **byte**, and a byte can represent one letter.

Counting in binary is just like normal counting, but with only two digits (0 and 1) instead of ten:

\`\`\`
Decimal:  0  1  2  3  4  5  6  7  8
Binary:   0  1 10 11 100 101 110 111 1000
\`\`\`

Each position is a power of 2: …, 8, 4, 2, 1. So \`101\` = 4 + 0 + 1 = **5**.`,
        ar: `## تشبيه المطبخ 🍳

الحاسوب مثل المطبخ:

- **المعالج (CPU)** = **الطبّاخ**. ينفّذ كل العمل الفعلي، خطوة خطوة — لكن بسرعة مذهلة (مليارات الخطوات في الثانية).
- **الذاكرة (RAM)** = **سطح العمل**. مساحة سريعة لما تطبخه *الآن*. أطفئ الكهرباء فتُمحى بالكامل.
- **التخزين (SSD/القرص)** = **الثلاجة/المخزن**. يحفظ الأشياء بشكل دائم حتى عند الإطفاء — لكنه أبطأ من سطح العمل.
- **نظام التشغيل** (ويندوز، لينكس، ماك) = **مدير المطبخ**. يقرر من يستخدم الطبّاخ، وكيف يُقتسم سطح العمل، ومن يُسمح له بالدخول.

**لماذا النظام الثنائي؟** الحاسوب ملايين المفاتيح الصغيرة. المفتاح إما مُشغَّل (1) أو مُطفأ (0). هذا كل شيء. كل صورة وأغنية وكلمة مرور هي في النهاية نمط ضخم من مفاتيح تشغيل/إطفاء. نجمع 8 مفاتيح في **بايت**، والبايت يمثّل حرفاً واحداً.

العدّ بالنظام الثنائي مثل العدّ العادي، لكن برقمين فقط (0 و1) بدل عشرة:

\`\`\`
العشري:   0  1  2  3  4  5  6  7  8
الثنائي:  0  1 10 11 100 101 110 111 1000
\`\`\`

كل خانة قوة للعدد 2: …، 8، 4، 2، 1. إذن \`101\` = 4 + 0 + 1 = **5**.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# Python can convert between decimal and binary instantly
number = 5
print("5 in binary is:", bin(number))     # 0b101

# and back again
print("Binary 1010 is:", int("1010", 2))  # 10

# a byte holds 8 bits -> values 0 to 255
print("Max value of one byte:", 2**8 - 1) # 255`,
      explanation: {
        en: `Run this Python (the environment loads the first time — ~10 seconds). \`bin()\` shows the switches, \`int(x, 2)\` reads them back. Change the number and re-run.`,
        ar: `شغّل بايثون (تُحمَّل البيئة أول مرة — نحو 10 ثوانٍ). \`bin()\` يعرض المفاتيح، و\`int(x, 2)\` يقرؤها. غيّر الرقم وأعد التشغيل.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Write Python that:
1. Stores your age in a variable \`age\`
2. Prints its binary form using \`bin(age)\`
3. Prints how many **bytes** it takes to store the number 300 as a variable \`bytes_needed\` — hint: one byte holds up to 255, so 300 needs **2**.`,
        ar: `اكتب بايثون:
1. يخزّن عمرك في متغير \`age\`
2. يطبع صورته الثنائية بـ \`bin(age)\`
3. يخزّن في متغير \`bytes_needed\` عدد **البايتات** اللازمة لتخزين الرقم 300 — تلميح: البايت يحمل حتى 255، فالرقم 300 يحتاج **2**.`,
      },
      starterCode: `age = 20
# print its binary form

# how many bytes to store 300?
bytes_needed = 0`,
      solution: `age = 20
print(bin(age))

bytes_needed = 2
print(bytes_needed)`,
      hints: [
        { en: `bin(age) returns a string like "0b10100". Just print(bin(age)).`, ar: `bin(age) يعيد نصاً مثل "0b10100". فقط print(bin(age)).` },
        { en: `One byte = 0–255. 300 > 255, so you need 2 bytes. Set bytes_needed = 2.`, ar: `بايت واحد = 0–255. و300 > 255، فتحتاج 2 بايت. اجعل bytes_needed = 2.` },
      ],
      tests: [
        { name: { en: "age is defined as a number", ar: "age معرّف كرقم" }, check: `assert isinstance(age, int)` },
        { name: { en: "The binary form was printed", ar: "طُبعت الصورة الثنائية" }, check: `assert "0b" in _stdout` },
        { name: { en: "bytes_needed equals 2", ar: "bytes_needed يساوي 2" }, check: `assert bytes_needed == 2` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Hexadecimal — binary's shorthand 🔢

Binary is precise but painfully long — a single byte is 8 characters (\`11010110\`). Security tools almost never show you raw binary; they show **hexadecimal (base 16)** instead, because 2 hex digits pack exactly one byte:

\`\`\`
Binary:  11010110  →  Hex:  D6
\`\`\`

Hex uses 16 symbols: \`0-9\` then \`A-F\` (where A=10, B=11, … F=15). You'll recognize hex everywhere in security work:

- **MAC addresses**: \`3C:A6:F6:1E:2B:9D\` — each pair is one byte in hex
- **File signatures ("magic bytes")**: every file type starts with a fixed hex pattern regardless of its extension — a JPEG always starts \`FF D8 FF\`, a PDF starts \`25 50 44 46\`. Malware analysts rename suspicious files and check these bytes, because an attacker can label a program "photo.jpg" but can't hide its true magic bytes.
- **Hashes** (like MD5, SHA-256) are always displayed as long hex strings.
- **Colors in web design** (\`#FF5733\`) are hex too — same system, different use.

Python converts to hex just as easily as binary:

\`\`\`python
print(hex(214))          # '0xd6'
print(int("d6", 16))     # 214
\`\`\``,
        ar: `## النظام الست عشري — اختصار الثنائي 🔢

الثنائي دقيق لكنه طويل بشكل مؤلم — البايت الواحد 8 أحرف (\`11010110\`). أدوات الأمن نادراً ما تُظهر لك الثنائي الخام؛ تُظهر **النظام الست عشري (Hex، قاعدة 16)** بدلاً منه، لأن رقمين سداسيين عشريين يمثّلان بايتاً واحداً بالضبط:

\`\`\`
الثنائي:  11010110  ←  Hex:  D6
\`\`\`

يستخدم Hex 16 رمزاً: \`0-9\` ثم \`A-F\` (حيث A=10، B=11، … F=15). ستتعرّف على Hex في كل مكان بعمل الأمن:

- **عناوين MAC**: \`3C:A6:F6:1E:2B:9D\` — كل زوج بايت واحد بالـ hex
- **توقيعات الملفات ("magic bytes")**: كل نوع ملف يبدأ بنمط hex ثابت بغض النظر عن امتداده — ملف JPEG يبدأ دائماً بـ\`FF D8 FF\`، وPDF يبدأ بـ\`25 50 44 46\`. محللو البرمجيات الخبيثة يعيدون تسمية الملفات المشبوهة ويفحصون هذه البايتات، لأن المهاجم يستطيع تسمية برنامج "photo.jpg" لكن لا يستطيع إخفاء magic bytes الحقيقية.
- **التجزئات (hashes)** (مثل MD5، SHA-256) تُعرض دائماً كنصوص hex طويلة.
- **الألوان في تصميم الويب** (\`#FF5733\`) أيضاً hex — نفس النظام، استخدام مختلف.

تحوّل بايثون إلى hex بسهولة تحويلها للثنائي:

\`\`\`python
print(hex(214))          # '0xd6'
print(int("d6", 16))     # 214
\`\`\``,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Write Python that:
1. Converts the number \`255\` to hex and stores the string result in \`hex_value\`
2. Converts the hex string \`"ff"\` back to a decimal number, stored in \`decimal_value\`

(Use \`hex(x)\` and \`int(x, 16)\` — the same pattern you used for binary.)`,
        ar: `اكتب بايثون:
1. يحوّل الرقم \`255\` إلى hex ويخزّن النتيجة كنص في \`hex_value\`
2. يحوّل نص hex \`"ff"\` إلى رقم عشري، مخزّن في \`decimal_value\`

(استخدم \`hex(x)\` و\`int(x, 16)\` — نفس النمط الذي استخدمته للثنائي.)`,
      },
      starterCode: `hex_value = ""
decimal_value = 0

# hex_value = hex(255)
# decimal_value = int("ff", 16)
`,
      solution: `hex_value = hex(255)
decimal_value = int("ff", 16)

print(hex_value, decimal_value)`,
      hints: [
        { en: `hex_value = hex(255) gives '0xff'.`, ar: `hex_value = hex(255) تعطي '0xff'.` },
        { en: `decimal_value = int("ff", 16) gives 255.`, ar: `decimal_value = int("ff", 16) تعطي 255.` },
      ],
      tests: [
        { name: { en: "hex_value is the hex of 255", ar: "hex_value هو hex الرقم 255" }, check: `assert hex_value == hex(255)` },
        { name: { en: "decimal_value equals 255", ar: "decimal_value يساوي 255" }, check: `assert decimal_value == 255` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Which part loses its contents when the power goes off?", ar: "أي جزء يفقد محتواه عند انقطاع الكهرباء؟" },
          choices: [
            { en: "The SSD / hard drive", ar: "القرص الصلب / SSD" },
            { en: "RAM (memory)", ar: "الذاكرة RAM" },
            { en: "The CPU", ar: "المعالج" },
          ],
          answer: 1,
          explain: {
            en: "RAM is volatile — the fast countertop is wiped on shutdown. Storage (the pantry) keeps data permanently.",
            ar: "الذاكرة RAM متطايرة — سطح العمل السريع يُمحى عند الإطفاء. أما التخزين (المخزن) فيحفظ البيانات دائماً.",
          },
        },
        {
          q: { en: "What is the decimal value of binary 110?", ar: "ما القيمة العشرية للثنائي 110؟" },
          choices: [
            { en: "4", ar: "4" },
            { en: "6", ar: "6" },
            { en: "110", ar: "110" },
          ],
          answer: 1,
          explain: {
            en: "Positions are 4, 2, 1 → 1×4 + 1×2 + 0×1 = 6.",
            ar: "الخانات هي 4، 2، 1 ← 1×4 + 1×2 + 0×1 = 6.",
          },
        },
        {
          q: { en: "How many bits are in one byte?", ar: "كم بِت في البايت الواحد؟" },
          choices: [
            { en: "8", ar: "8" },
            { en: "16", ar: "16" },
            { en: "1024", ar: "1024" },
          ],
          answer: 0,
          explain: {
            en: "8 bits = 1 byte, giving 2⁸ = 256 possible values (0–255), enough for one character.",
            ar: "8 بِت = 1 بايت، ما يعطي 2⁸ = 256 قيمة ممكنة (0–255)، تكفي لحرف واحد.",
          },
        },
        {
          q: { en: "What does the operating system do?", ar: "ماذا يفعل نظام التشغيل؟" },
          choices: [
            { en: "Stores files permanently", ar: "يخزّن الملفات بشكل دائم" },
            { en: "Manages who gets the CPU, memory, and access — the kitchen manager", ar: "يدير من يحصل على المعالج والذاكرة والوصول — مدير المطبخ" },
            { en: "Converts binary to decimal", ar: "يحوّل الثنائي إلى عشري" },
          ],
          answer: 1,
          explain: {
            en: "The OS coordinates hardware and enforces permissions — which is exactly where much of security lives.",
            ar: "نظام التشغيل ينسّق العتاد ويفرض الصلاحيات — وهنا بالضبط يعيش جزء كبير من الأمن.",
          },
        },
        {
          q: { en: "Why do security tools display data in hex instead of raw binary?", ar: "لماذا تعرض أدوات الأمن البيانات بـ hex بدل الثنائي الخام؟" },
          choices: [
            { en: "Hex is far more compact — 2 hex digits represent a full byte", ar: "Hex أكثر إيجازاً بكثير — رقمان سداسيان يمثّلان بايتاً كاملاً" },
            { en: "Computers cannot process binary directly", ar: "الحواسيب لا تستطيع معالجة الثنائي مباشرة" },
            { en: "Hex is a newer replacement for binary", ar: "Hex بديل أحدث للثنائي" },
          ],
          answer: 0,
          explain: {
            en: "8-character binary (11010110) becomes 2-character hex (D6) — much easier for humans to read in logs, hashes, and memory dumps.",
            ar: "الثنائي بـ8 أحرف (11010110) يصبح hex بحرفين (D6) — أسهل بكثير على البشر قراءته في السجلّات والتجزئات وتفريغات الذاكرة.",
          },
        },
        {
          q: { en: "Why do malware analysts check a file's 'magic bytes' instead of trusting its file extension?", ar: "لماذا يفحص محللو البرمجيات الخبيثة 'magic bytes' الملف بدل الثقة بامتداده؟" },
          choices: [
            { en: "An attacker can rename a file's extension, but can't change its true starting hex pattern", ar: "يستطيع المهاجم إعادة تسمية امتداد الملف، لكن لا يستطيع تغيير نمط الـ hex الحقيقي في بدايته" },
            { en: "Magic bytes are just a legend, not real", ar: "الـ magic bytes مجرد أسطورة، ليست حقيقية" },
            { en: "File extensions are always accurate", ar: "امتدادات الملفات دقيقة دائماً" },
          ],
          answer: 0,
          explain: {
            en: "A malicious .exe renamed to 'invoice.pdf' still starts with the .exe's real magic bytes, not PDF's — a classic detection technique.",
            ar: "ملف exe. خبيث أُعيدت تسميته إلى 'invoice.pdf' يبدأ رغم ذلك بـ magic bytes الحقيقية لملف exe.، لا PDF — تقنية كشف كلاسيكية.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- CPU = chef, RAM = countertop (volatile), Storage = pantry (permanent), OS = manager
- Everything is binary: switches grouped into bytes (8 bits = 1 character)
- Hexadecimal is binary's compact shorthand — used in MAC addresses, hashes, and file signatures
- You converted numbers with Python's \`bin()\`/\`int(x, 2)\` and \`hex()\`/\`int(x, 16)\`

**Next:** Networking — how these computers talk to each other, and where attackers try to listen in.`,
        ar: `## الخلاصة

- المعالج = الطبّاخ، الذاكرة = سطح العمل (متطايرة)، التخزين = المخزن (دائم)، نظام التشغيل = المدير
- كل شيء ثنائي: مفاتيح مجمّعة في بايتات (8 بِت = حرف واحد)
- Hex اختصار الثنائي المُدمَج — يُستخدم في عناوين MAC والتجزئات وتوقيعات الملفات
- حوّلت الأرقام بـ \`bin()\`/\`int(x, 2)\` و\`hex()\`/\`int(x, 16)\` في بايثون

**التالي:** الشبكات — كيف تتحدث هذه الحواسيب فيما بينها، وأين يحاول المهاجمون التنصّت.`,
      },
    },
  ],
};
