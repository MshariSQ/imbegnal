import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "how-programs-run",
  title: { en: "How Programs Run — From Source Code to a Live Process", ar: "كيف تعمل البرامج — من الكود المصدري إلى عملية حيّة" },
  estMinutes: 45,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

By the end of this lesson you will be able to:

- Explain what happens between a line of source code and a running process: **compile → assemble → link → load**
- Recognize an executable by its **magic bytes** and read the key fields of an **ELF header**
- Describe how a process is laid out in memory (**.text, .data, .bss, heap, stack**) and why **byte order** matters
- Follow the **rules of the road**: what you may analyze, and how to report what you find

## Tasting a cake to learn the recipe 🍰

Imagine someone hands you a baked cake and asks, "What's in it?" There is no recipe. So you taste it, inspect the crumbs, check the texture, and slowly work out the ingredients and the steps. That is **reverse engineering**: starting from a finished product (a program, a file format, a device) and working backwards to understand how it was made and what it does.

A compiler is the oven: it turns a human-readable recipe (source code) into something only the machine can eat (machine code). In this track you learn to read the cake.`,
        ar: `## ماذا ستتعلم

في نهاية هذا الدرس ستكون قادراً على:

- شرح ما يحدث بين سطر الكود المصدري والعملية العاملة: **compile ← assemble ← link ← load**
- التعرّف على الملف التنفيذي من **magic bytes** وقراءة الحقول الأساسية في **ELF header**
- وصف كيف تُوزَّع العملية في الذاكرة (**.text, .data, .bss, heap, stack**) ولماذا يهمّ **ترتيب البايتات**
- الالتزام بـ**قواعد الطريق**: ما الذي يجوز لك تحليله، وكيف تبلّغ عمّا تجده

## تذوّق الكعكة لمعرفة الوصفة 🍰

تخيّل أن أحدهم أعطاك كعكة جاهزة وسألك: "مما صُنعت؟" لا توجد وصفة. فتتذوقها، وتفحص الفتات، وتختبر قوامها، وتستنتج المكونات والخطوات شيئاً فشيئاً. هذه هي **الهندسة العكسية**: تبدأ من منتج جاهز (برنامج، صيغة ملف، جهاز) وتعمل إلى الخلف لتفهم كيف صُنع وماذا يفعل.

المُصرِّف (compiler) هو الفرن: يحوّل وصفة مقروءة للبشر (الكود المصدري) إلى شيء لا تأكله إلا الآلة (كود الآلة). في هذا المسار تتعلّم كيف تقرأ الكعكة.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Rules of the road — before you open any binary ⚖️

Reverse engineering is a normal, valuable skill: defenders use it to understand malware, engineers use it to make systems work together, and researchers use it to find and fix security bugs. It is also an area where **the law and licenses really matter**. Read this section twice.

**Practice only on targets that are clearly yours or clearly offered for practice:**

- programs you wrote yourself
- open-source software, within what its license allows
- binaries from **CTFs, crackmes and training platforms** made for exactly this purpose
- anything you have **written permission** to analyze

**Rules differ by country and by contract:**

- Software licenses (EULAs) often forbid reverse engineering. Breaking a contract can have consequences even where the law allows analysis.
- Many countries restrict **circumventing technical protection measures** (for example the DMCA in the United States). There are usually narrow exemptions, such as good-faith security research or interoperability, and they change over time.
- In the EU, the Software Directive allows limited decompilation for **interoperability**, under conditions.
- Accessing a system you do not own, or taking data from it, is a crime almost everywhere, even if you only "looked around".
- This lesson is general education, **not legal advice**. If you are unsure, ask the owner or a lawyer before you start.

**If you find a vulnerability:** tell the vendor privately and give them time to fix it (**coordinated disclosure**). Do not publish exploit details for unpatched bugs, never use what you find against real people, and never keep or share other people's data. The roadmap node *Law, Ethics & Responsible Disclosure* covers this in depth.

Every exercise in this track runs on tiny programs written for the lessons. Nothing here touches a real product or a real network.`,
        ar: `## قواعد الطريق — قبل أن تفتح أي ملف تنفيذي ⚖️

الهندسة العكسية مهارة عادية وقيّمة: المدافعون يستخدمونها لفهم البرمجيات الخبيثة، والمهندسون ليجعلوا الأنظمة تعمل معاً، والباحثون ليجدوا الثغرات الأمنية ويصلحوها. وهي أيضاً مجال **يهمّ فيه القانون والترخيص فعلاً**. اقرأ هذا القسم مرتين.

**تدرّب فقط على أهداف هي ملكك بوضوح أو معروضة للتدريب بوضوح:**

- برامج كتبتها بنفسك
- برمجيات مفتوحة المصدر، ضمن ما يسمح به ترخيصها
- ملفات تنفيذية من **CTFs وcrackmes ومنصات التدريب** المصنوعة لهذا الغرض بالذات
- أي شيء لديك **إذن مكتوب** بتحليله

**القواعد تختلف باختلاف البلد والعقد:**

- تراخيص البرامج (EULAs) كثيراً ما تمنع الهندسة العكسية. وخرق العقد قد تترتب عليه عواقب حتى لو سمح القانون بالتحليل.
- كثير من الدول تقيّد **تجاوز إجراءات الحماية التقنية** (مثل قانون DMCA في الولايات المتحدة). وتوجد عادةً استثناءات ضيقة مثل البحث الأمني بحسن نية أو التشغيل البيني (interoperability)، وهي تتغيّر مع الزمن.
- في الاتحاد الأوروبي، يسمح Software Directive بفك التجميع (decompilation) بشكل محدود لأجل **التشغيل البيني** وبشروط.
- الدخول إلى نظام لا تملكه، أو أخذ بيانات منه، جريمة تقريباً في كل مكان، حتى لو كنت "تتفرّج فقط".
- هذا الدرس تثقيف عام، **وليس استشارة قانونية**. إن لم تكن متأكداً، اسأل المالك أو محامياً قبل أن تبدأ.

**إن وجدت ثغرة:** أبلغ الجهة المصنِّعة سراً وامنحها وقتاً لإصلاحها (**coordinated disclosure**). لا تنشر تفاصيل استغلال لثغرات لم تُصلَح، ولا تستخدم ما وجدته ضد أشخاص حقيقيين، ولا تحتفظ ببيانات الآخرين أو تشاركها. عقدة المسار *Law, Ethics & Responsible Disclosure* تتناول هذا بالتفصيل.

كل تمرين في هذا المسار يعمل على برامج صغيرة كُتبت للدروس. لا شيء هنا يلمس منتجاً حقيقياً أو شبكة حقيقية.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## From source code to a running process

A program is born in five steps, and each step leaves clues that an analyst can read later.

\`\`\`
 hello.c ──compile──▶ hello.s ──assemble──▶ hello.o ──link──▶ hello ──load──▶ process
  source        assembly            object file        executable      running in memory
\`\`\`

(In practice \`gcc\` also runs a preprocessor first, which expands \`#include\` and macros.)

1. **Compile** turns C into **assembly**: readable names for the CPU's instructions.
2. **Assemble** turns assembly into an **object file**: real machine code, but with holes where the addresses of other functions are not known yet.
3. **Link** glues object files and libraries together and fills in the holes. A **static** link copies library code into the executable. A **dynamic** link only records "I need \`puts\` from libc" and leaves the lookup for later.
4. **Load**: the operating system's **loader** maps the file into memory, chooses addresses, resolves the dynamic libraries and jumps to the **entry point**.
5. **Run**: the CPU executes the machine code.

When your code calls a library function such as \`puts\`, it usually calls a small stub in the \`.plt\` section, which jumps through a slot in the \`.got\` table that the dynamic loader filled in with the real address. You will see those names in every disassembly.

You can watch the steps yourself on Linux:

\`\`\`bash
gcc -S hello.c           # stop after compiling: writes hello.s
gcc -c hello.c           # stop after assembling: writes hello.o
gcc hello.c -o hello     # full build
file hello               # what kind of file is this?
readelf -h hello         # print the ELF header
nm hello.o               # list symbols (the names the linker uses)
\`\`\`

**Safety tip:** \`ldd\` lists the libraries a program needs, but on some systems it works by actually *running* the program's loader. Never run \`ldd\` on a file you do not trust. \`readelf -d\` gives similar information without executing anything.`,
        ar: `## من الكود المصدري إلى عملية حيّة

يولد البرنامج في خمس خطوات، وكل خطوة تترك أدلة يمكن للمحلّل قراءتها لاحقاً.

\`\`\`
 hello.c ──compile──▶ hello.s ──assemble──▶ hello.o ──link──▶ hello ──load──▶ process
  source        assembly            object file        executable      running in memory
\`\`\`

(عملياً يشغّل \`gcc\` أولاً مُعالِجاً مسبقاً (preprocessor) يوسّع \`#include\` والماكرو.)

1. **Compile** يحوّل لغة C إلى **assembly**: أسماء مقروءة لتعليمات المعالج.
2. **Assemble** يحوّل الـassembly إلى **object file**: كود آلة حقيقي، لكن فيه فراغات حيث عناوين الدوال الأخرى لم تُعرف بعد.
3. **Link** يلصق ملفات الـobject والمكتبات معاً ويملأ الفراغات. الربط **الساكن (static)** ينسخ كود المكتبة داخل الملف التنفيذي. أما الربط **الديناميكي (dynamic)** فيسجّل فقط "أحتاج \`puts\` من libc" ويترك البحث لوقت لاحق.
4. **Load**: **المُحمِّل (loader)** في نظام التشغيل يُحمّل الملف في الذاكرة، ويختار العناوين، ويحلّ المكتبات الديناميكية، ثم يقفز إلى **نقطة الدخول (entry point)**.
5. **Run**: المعالج ينفّذ كود الآلة.

عندما يستدعي كودك دالة مكتبة مثل \`puts\`، فهو عادةً يستدعي شيفرة صغيرة في قسم \`.plt\`، تقفز عبر خانة في جدول \`.got\` ملأها المُحمِّل الديناميكي بالعنوان الحقيقي. سترى هذه الأسماء في كل تفكيك (disassembly).

يمكنك مشاهدة الخطوات بنفسك على Linux:

\`\`\`bash
gcc -S hello.c           # stop after compiling: writes hello.s
gcc -c hello.c           # stop after assembling: writes hello.o
gcc hello.c -o hello     # full build
file hello               # what kind of file is this?
readelf -h hello         # print the ELF header
nm hello.o               # list symbols (the names the linker uses)
\`\`\`

**نصيحة أمان:** أمر \`ldd\` يعرض المكتبات التي يحتاجها البرنامج، لكنه في بعض الأنظمة يعمل فعلياً بتشغيل مُحمِّل البرنامج. لا تشغّل \`ldd\` أبداً على ملف لا تثق به. أمر \`readelf -d\` يعطي معلومات مشابهة دون تنفيذ أي شيء.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// A toy linker. Each object file has a size and exports named functions at offsets.
const objects = [
  { name: "main.o",  size: 32, exports: { main: 0 },  imports: ["greet", "puts"] },
  { name: "greet.o", size: 20, exports: { greet: 0 }, imports: ["puts"] },
];
const libc = { puts: 0x7f0000 }; // supplied later by the dynamic loader
let cursor = 0x401000;            // where .text starts

// Pass 1: lay the objects out one after another and record where every name lives.
const symbols = {};
for (const o of objects) {
  for (const [fn, offset] of Object.entries(o.exports)) symbols[fn] = cursor + offset;
  cursor += o.size;
}

// Pass 2: fill in the "holes", the references to names defined elsewhere.
for (const o of objects) {
  for (const sym of o.imports) {
    const addr = symbols[sym] ?? libc[sym];
    console.log(o.name, "calls", sym, "->", addr === undefined ? "UNDEFINED REFERENCE" : "0x" + addr.toString(16));
  }
}`,
      explanation: {
        en: "Run it, then delete `greet.o` from the list and run again: you will see the famous linker error **undefined reference**. The linker's real job is exactly this: place pieces, remember where each name landed, then patch every reference. Add a third object of your own to watch the addresses shift.",
        ar: "شغّله، ثم احذف `greet.o` من القائمة وشغّله ثانية: سترى خطأ الرابط الشهير **undefined reference**. عمل الرابط الحقيقي هو هذا بالضبط: يضع القطع، ويتذكّر أين استقر كل اسم، ثم يصحّح كل إشارة. أضف كائناً ثالثاً من عندك لترى العناوين تتحرّك.",
      },
    },
    {
      type: "text",
      body: {
        en: `## Inside an executable: formats and magic bytes

Every operating system has a container format for programs:

- **ELF** (Linux, BSD, Android native code) starts with \`7f 45 4c 46\`: the byte \`7f\` followed by the letters "ELF"
- **PE** (Windows \`.exe\` and \`.dll\`) starts with \`4d 5a\`, the letters "MZ", and then points to a \`PE\` header further in
- **Mach-O** (macOS, iOS): 64-bit files start with \`cf fa ed fe\`

The first bytes are called **magic numbers**. Tools such as \`file\` read them instead of trusting the file extension, and so should you: a file named \`invoice.pdf\` can be a program.

An ELF file is organized into **sections** (used by linkers and analysts) and **segments** (used by the loader). The sections you will meet most often:

- \`.text\`: the machine code (read + execute)
- \`.rodata\`: read-only data such as string constants
- \`.data\`: initialized global variables (read + write)
- \`.bss\`: global variables that start as zero. It takes no space in the file, only in memory
- \`.symtab\` / \`.strtab\`: function and variable names. A **stripped** binary has them removed. It runs the same, but you lose helpful names
- \`.plt\` / \`.got\`: the stubs and tables used to call shared-library functions

The **ELF header** at the start of the file is a fixed-size table of facts:

- byte 4 is the **class** (1 = 32-bit, 2 = 64-bit)
- byte 5 is the **byte order** (1 = little-endian, 2 = big-endian)
- \`e_type\` at offset 16 (2 = executable, 3 = shared object, which includes PIE executables)
- \`e_machine\` at offset 18 (62 = x86-64, 183 = AArch64)
- \`e_entry\` at offset 24: the **entry point**, the address where execution starts. It is usually \`_start\`, small startup code that sets things up and then calls \`main\`

You will parse a real header in the first lab.`,
        ar: `## داخل الملف التنفيذي: الصيغ والـ magic bytes

لكل نظام تشغيل صيغة حاوية للبرامج:

- **ELF** (‏Linux وBSD وكود Android الأصلي) يبدأ بـ \`7f 45 4c 46\`: البايت \`7f\` ثم الحروف "ELF"
- **PE** (ملفات Windows ‏\`.exe\` و\`.dll\`) يبدأ بـ \`4d 5a\` أي الحرفين "MZ"، ثم يشير إلى ترويسة \`PE\` في موضع أبعد
- **Mach-O** (‏macOS وiOS): الملفات 64-bit تبدأ بـ \`cf fa ed fe\`

تُسمّى البايتات الأولى **magic numbers**. أدوات مثل \`file\` تقرؤها بدل الوثوق بامتداد الملف، وعليك أن تفعل مثلها: ملف اسمه \`invoice.pdf\` قد يكون برنامجاً.

يُنظَّم ملف ELF في **sections** (يستخدمها الروابط والمحلّلون) و**segments** (يستخدمها المُحمِّل). أكثر الأقسام التي ستقابلها:

- \`.text\`: كود الآلة (قراءة + تنفيذ)
- \`.rodata\`: بيانات للقراءة فقط مثل ثوابت النصوص
- \`.data\`: المتغيرات العامة المُهيّأة (قراءة + كتابة)
- \`.bss\`: المتغيرات العامة التي تبدأ بصفر. لا تأخذ مساحة في الملف، بل في الذاكرة فقط
- \`.symtab\` / \`.strtab\`: أسماء الدوال والمتغيرات. الملف **المُجرَّد (stripped)** حُذفت منه. يعمل بالطريقة نفسها لكنك تخسر أسماء مفيدة
- \`.plt\` / \`.got\`: الشيفرات والجداول المستخدمة لاستدعاء دوال المكتبات المشتركة

**ELF header** في بداية الملف جدول ثابت الحجم من الحقائق:

- البايت 4 هو **class** ‏(1 = 32-bit، 2 = 64-bit)
- البايت 5 هو **ترتيب البايتات** ‏(1 = little-endian، 2 = big-endian)
- \`e_type\` عند الإزاحة 16 (‏2 = تنفيذي، 3 = shared object ويشمل ملفات PIE التنفيذية)
- \`e_machine\` عند الإزاحة 18 (‏62 = x86-64، 183 = AArch64)
- \`e_entry\` عند الإزاحة 24: **نقطة الدخول**، العنوان الذي يبدأ منه التنفيذ. وهي عادةً \`_start\`، شيفرة بدء صغيرة تجهّز البيئة ثم تستدعي \`main\`

ستحلّل ترويسة حقيقية في أول تمرين.`,
      },
    },
    {
      type: "lab",
      id: "elf-header",
      lang: "python",
      prompt: {
        en: `## Read an ELF header

You receive the first bytes of an unknown file as hex, separated by whitespace (possibly over several lines). Decide whether it is an ELF file and print its key header fields.

Layout recap (offsets in bytes):

- 0–3: magic \`7f 45 4c 46\`
- 4: class (\`1\` = 32-bit, \`2\` = 64-bit)
- 5: byte order (\`1\` = little-endian, \`2\` = big-endian)
- 16–17: \`e_type\`, 18–19: \`e_machine\` (both in the file's byte order)
- 24 and on: \`e_entry\`, the entry point: 4 bytes in a 32-bit file, 8 bytes in a 64-bit file

Names: \`e_type\` 1 = REL, 2 = EXEC, 3 = DYN, 4 = CORE, anything else \`other\`. \`e_machine\` 3 = x86, 40 = ARM, 62 = x86-64, 183 = AArch64, anything else \`other\`.

**Example**

Input (32 bytes):

\`\`\`
7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
03 00 3e 00 01 00 00 00 40 10 00 00 00 00 00 00
\`\`\`

Output (entry in lowercase hex):

\`\`\`
class: 64-bit
endian: little
type: DYN
machine: x86-64
entry: 0x1040
\`\`\`

If the magic is wrong (or there are fewer than 4 bytes) print \`not an ELF file\`. If the magic is right but the class or byte order is invalid, or there are too few bytes to read the entry point, print \`truncated or corrupt ELF header\`.`,
        ar: `## اقرأ ترويسة ELF

تصلك أولى بايتات ملف مجهول بصيغة hex تفصل بينها مسافات (وقد تمتد على عدة أسطر). قرّر هل هو ملف ELF واطبع حقول الترويسة الأساسية.

تذكير بالتخطيط (الإزاحات بالبايت):

- 0–3: الـmagic وهو \`7f 45 4c 46\`
- 4: class ‏(\`1\` = 32-bit، \`2\` = 64-bit)
- 5: ترتيب البايتات (\`1\` = little-endian، \`2\` = big-endian)
- 16–17: ‏\`e_type\`، و18–19: ‏\`e_machine\` (كلاهما بترتيب بايتات الملف)
- من 24 فصاعداً: ‏\`e_entry\` نقطة الدخول: 4 بايت في ملف 32-bit، و8 بايت في ملف 64-bit

الأسماء: ‏\`e_type\` ‏1 = REL، ‏2 = EXEC، ‏3 = DYN، ‏4 = CORE، وأي قيمة أخرى \`other\`. ‏\`e_machine\` ‏3 = x86، ‏40 = ARM، ‏62 = x86-64، ‏183 = AArch64، وأي قيمة أخرى \`other\`.

**مثال**

المدخل (32 بايت):

\`\`\`
7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
03 00 3e 00 01 00 00 00 40 10 00 00 00 00 00 00
\`\`\`

المخرج (نقطة الدخول بحروف hex صغيرة):

\`\`\`
class: 64-bit
endian: little
type: DYN
machine: x86-64
entry: 0x1040
\`\`\`

إن كان الـmagic خاطئاً (أو البايتات أقل من 4) اطبع \`not an ELF file\`. وإن كان الـmagic صحيحاً لكن الـclass أو ترتيب البايتات غير صالح، أو لا توجد بايتات كافية لقراءة نقطة الدخول، فاطبع \`truncated or corrupt ELF header\`.`,
      },
      starterCode: `import sys

# The input is hex text such as "7f 45 4c 46 ..." -> a bytes object.
data = bytes(int(tok, 16) for tok in sys.stdin.read().split())

MAGIC = bytes([0x7F, 0x45, 0x4C, 0x46])
TYPES = {1: "REL", 2: "EXEC", 3: "DYN", 4: "CORE"}
MACHINES = {3: "x86", 40: "ARM", 62: "x86-64", 183: "AArch64"}

# TODO 1: if data does not start with MAGIC, print "not an ELF file" and stop.
# TODO 2: read the class (byte 4) and the byte order (byte 5); validate them and the length.
# TODO 3: decode e_type, e_machine and e_entry with int.from_bytes(..., "little" or "big").
# TODO 4: print the five lines in the required format.

print("not an ELF file")
`,
      solution: `import sys

data = bytes(int(tok, 16) for tok in sys.stdin.read().split())

MAGIC = bytes([0x7F, 0x45, 0x4C, 0x46])
TYPES = {1: "REL", 2: "EXEC", 3: "DYN", 4: "CORE"}
MACHINES = {3: "x86", 40: "ARM", 62: "x86-64", 183: "AArch64"}

if data[:4] != MAGIC:
    print("not an ELF file")
    sys.exit(0)

cls = data[4] if len(data) > 4 else 0
enc = data[5] if len(data) > 5 else 0
entry_size = {1: 4, 2: 8}.get(cls)  # e_entry is as wide as a pointer
if entry_size is None or enc not in (1, 2) or len(data) < 24 + entry_size:
    print("truncated or corrupt ELF header")
    sys.exit(0)

order = "little" if enc == 1 else "big"
e_type = int.from_bytes(data[16:18], order)
e_machine = int.from_bytes(data[18:20], order)
entry = int.from_bytes(data[24:24 + entry_size], order)

print("class:", "32-bit" if cls == 1 else "64-bit")
print("endian:", order)
print("type:", TYPES.get(e_type, "other"))
print("machine:", MACHINES.get(e_machine, "other"))
print(f"entry: 0x{entry:x}")
`,
      hints: [
        { en: "Start with the magic: slice the first four bytes and compare them with `MAGIC`.", ar: "ابدأ بالـmagic: اقتطع أول أربعة بايتات وقارنها بـ `MAGIC`." },
        { en: "`int.from_bytes(data[16:18], order)` reads two bytes in the right byte order. For the entry point the width depends on the class: 4 or 8 bytes starting at offset 24.", ar: "الدالة `int.from_bytes(data[16:18], order)` تقرأ بايتين بترتيب البايتات الصحيح. أما نقطة الدخول فعرضها يتبع الـclass: 4 أو 8 بايت ابتداءً من الإزاحة 24." },
        { en: "Check the length last: you need at least `24 + entry_size` bytes. Format the address with `f\"0x{entry:x}\"`.", ar: "افحص الطول أخيراً: تحتاج على الأقل `24 + entry_size` بايت. نسّق العنوان بـ `f\"0x{entry:x}\"`." },
      ],
      tests: [
        { name: { en: "A 64-bit little-endian shared object (x86-64)", ar: "كائن مشترك 64-bit بترتيب little-endian (x86-64)" }, stdin: `7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
03 00 3e 00 01 00 00 00 40 10 00 00 00 00 00 00
`, expected: `class: 64-bit
endian: little
type: DYN
machine: x86-64
entry: 0x1040
` },
        { name: { en: "A 32-bit little-endian ARM executable", ar: "ملف تنفيذي ARM بـ 32-bit وترتيب little-endian" }, stdin: `7f 45 4c 46 01 01 01 00 00 00 00 00 00 00 00 00
02 00 28 00 01 00 00 00 f4 82 00 00
`, expected: `class: 32-bit
endian: little
type: EXEC
machine: ARM
entry: 0x82f4
` },
        { name: { en: "A 32-bit big-endian file with an unknown machine", ar: "ملف 32-bit بترتيب big-endian وآلة غير معروفة" }, stdin: `7f 45 4c 46 01 02 01 00 00 00 00 00 00 00 00 00
00 02 00 08 00 00 00 01 00 40 01 00
`, expected: `class: 32-bit
endian: big
type: EXEC
machine: other
entry: 0x400100
` },
        { name: { en: "A Windows program (MZ) is not an ELF file", ar: "برنامج Windows (‏MZ) ليس ملف ELF" }, stdin: `4d 5a 90 00 03 00 00 00
`, expected: `not an ELF file
` },
        { name: { en: "Empty input", ar: "مدخل فارغ" }, stdin: "", expected: `not an ELF file
` },
        { name: { en: "Right magic but cut off before the entry point", ar: "الـmagic صحيح لكن الملف مقطوع قبل نقطة الدخول" }, stdin: `7f 45 4c 46 02 01 01 00
`, expected: `truncated or corrupt ELF header
` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## A process in memory — and byte order

When the loader has finished, the program lives in a **virtual address space**: a private map of the memory the process may touch.

\`\`\`
high addresses   ┌───────────────┐
                 │     stack     │  local variables, return addresses (grows down)
                 ├───────────────┤
                 │      ...      │  shared libraries and other mappings
                 ├───────────────┤
                 │     heap      │  malloc'ed memory (grows up)
                 ├───────────────┤
                 │  .bss / .data │  global variables
                 ├───────────────┤
                 │    .rodata    │  constants (read-only)
                 │     .text     │  code (read + execute)
low addresses    └───────────────┘
\`\`\`

Each region has permissions: **r**ead, **w**rite, e**x**ecute. Code is normally \`r-x\`, data and stack \`rw-\`, and a well-configured system avoids regions that are both writable and executable. On Linux you can see the map of a live process in \`/proc/<pid>/maps\`: your third lab reads a simplified version of it.

Modern systems also use **ASLR** (address space layout randomization): the base addresses of the stack, heap, libraries and position-independent executables (**PIE**) change on every run. The same instruction has a different absolute address each time, but its **offset from the module's base** stays the same. The debugging lesson uses this to rebase addresses.

### Byte order (endianness)

A 32-bit number takes four bytes. Which one goes first in memory?

- **Little-endian** (x86-64, and ARM as normally run) stores the *least significant* byte first. \`0x12345678\` is stored as \`78 56 34 12\`.
- **Big-endian** stores \`12 34 56 78\`. Network protocols use big-endian (called *network byte order*), and so do some file formats.

When you read a hex dump you must know which one applies: the little-endian bytes \`40 10 00 00\` are the number \`0x1040\`, not \`0x40100000\`. Mixing this up is the most common beginner mistake in binary analysis.`,
        ar: `## عملية في الذاكرة — وترتيب البايتات

حين ينتهي المُحمِّل، يعيش البرنامج في **فضاء عناوين افتراضي (virtual address space)**: خريطة خاصة بالذاكرة التي يحق للعملية لمسها.

\`\`\`
high addresses   ┌───────────────┐
                 │     stack     │  local variables, return addresses (grows down)
                 ├───────────────┤
                 │      ...      │  shared libraries and other mappings
                 ├───────────────┤
                 │     heap      │  malloc'ed memory (grows up)
                 ├───────────────┤
                 │  .bss / .data │  global variables
                 ├───────────────┤
                 │    .rodata    │  constants (read-only)
                 │     .text     │  code (read + execute)
low addresses    └───────────────┘
\`\`\`

لكل منطقة صلاحيات: **r** قراءة، **w** كتابة، e**x** تنفيذ. الكود عادةً \`r-x\`، والبيانات والـstack بصلاحية \`rw-\`، والنظام المُعَدّ جيداً يتجنّب المناطق التي تكون قابلة للكتابة والتنفيذ معاً. في Linux تستطيع رؤية خريطة عملية حيّة في \`/proc/<pid>/maps\`: تمرينك الثالث يقرأ نسخة مبسّطة منها.

الأنظمة الحديثة تستخدم أيضاً **ASLR** (عشوائية تخطيط فضاء العناوين): عناوين بداية الـstack والـheap والمكتبات والملفات التنفيذية المستقلة عن الموضع (**PIE**) تتغيّر في كل تشغيل. التعليمة نفسها يكون لها عنوان مطلق مختلف كل مرة، لكن **إزاحتها عن قاعدة الوحدة** تبقى ثابتة. سيستخدم درس التنقيح هذا لإعادة احتساب العناوين (rebase).

### ترتيب البايتات (Endianness)

الرقم 32-bit يشغل أربعة بايتات. أيّها يأتي أولاً في الذاكرة؟

- **Little-endian** ‏(x86-64، وARM بالشكل المعتاد) يخزّن البايت *الأقل أهمية* أولاً. العدد \`0x12345678\` يُخزَّن هكذا: \`78 56 34 12\`.
- **Big-endian** يخزّنه \`12 34 56 78\`. بروتوكولات الشبكة تستخدم big-endian (يسمّى *network byte order*)، وبعض صيغ الملفات كذلك.

حين تقرأ hex dump يجب أن تعرف أيّهما ينطبق: البايتات little-endian التالية \`40 10 00 00\` هي العدد \`0x1040\` وليس \`0x40100000\`. الخلط هنا هو أشيع أخطاء المبتدئين في تحليل الملفات التنفيذية.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `import struct

n = 0x12345678
print("little-endian:", struct.pack("<I", n).hex(" "))
print("big-endian:   ", struct.pack(">I", n).hex(" "))

# The same four bytes mean different numbers depending on how you read them.
raw = bytes([0x40, 0x10, 0x00, 0x00])
print("read as little:", hex(int.from_bytes(raw, "little")))
print("read as big:   ", hex(int.from_bytes(raw, "big")))`,
      explanation: {
        en: "`struct.pack(\"<I\", n)` packs an unsigned 32-bit integer as little-endian (`<`), and `>` means big-endian. Run it and compare the two byte sequences, then change `n` and predict the output before you run it.",
        ar: "`struct.pack(\"<I\", n)` تحزم عدداً صحيحاً 32-bit غير مُشارَك الإشارة بترتيب little-endian (الرمز `<`)، والرمز `>` يعني big-endian. شغّله وقارن التسلسلين، ثم غيّر `n` وتوقّع الناتج قبل أن تشغّل.",
      },
    },
    {
      type: "lab",
      id: "endianness",
      lang: "c",
      prompt: {
        en: `## Swap the bytes

Network protocols and many file formats use big-endian, while your CPU is little-endian, so analysts constantly convert. For each number you must show how it sits in memory on a little-endian machine, and then its byte-swapped value.

**Input:** a first line \`N\`, then \`N\` lines, each an unsigned 32-bit number in decimal.

**Output:** one line per number: the value in hex (\`0x\` + 8 lowercase digits), \`->\`, the four bytes in little-endian memory order as two-digit hex separated by spaces, \`->\`, the byte-swapped value in the same hex style.

Use shifts and masks (not a cast of the host memory), so your answer does not depend on the machine.

**Example**

Input:

\`\`\`
1
305419896
\`\`\`

Output:

\`\`\`
0x12345678 -> 78 56 34 12 -> 0x78563412
\`\`\``,
        ar: `## بدّل ترتيب البايتات

بروتوكولات الشبكة وكثير من صيغ الملفات تستخدم big-endian بينما معالجك little-endian، لذلك يحوّل المحلّلون بينهما باستمرار. لكل عدد عليك أن تُظهر كيف يقع في الذاكرة على جهاز little-endian، ثم قيمته بعد عكس ترتيب البايتات.

**المدخل:** سطر أول \`N\`، ثم \`N\` سطراً، في كل منها عدد 32-bit غير مُشارَك الإشارة بالنظام العشري.

**المخرج:** سطر لكل عدد: القيمة بصيغة hex ‏(\`0x\` + 8 خانات صغيرة)، ثم \`->\`، ثم البايتات الأربعة بترتيب الذاكرة little-endian كخانتين hex تفصل بينها مسافات، ثم \`->\`، ثم القيمة بعد عكس البايتات بالأسلوب نفسه.

استخدم الإزاحات (shifts) والأقنعة (masks) لا تحويلاً مباشراً لذاكرة الجهاز، حتى لا تعتمد إجابتك على الجهاز.

**مثال**

المدخل:

\`\`\`
1
305419896
\`\`\`

المخرج:

\`\`\`
0x12345678 -> 78 56 34 12 -> 0x78563412
\`\`\``,
      },
      starterCode: `#include <stdio.h>
#include <stdint.h>

/* TODO: return v with its four bytes in reverse order. */
static uint32_t swap32(uint32_t v) {
    return v;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++) {
        unsigned int v;
        if (scanf("%u", &v) != 1) break;
        /* TODO: print v, then its bytes least-significant first (use shifts and & 0xff), then swap32(v). */
        printf("0x%08x -> ?? ?? ?? ?? -> 0x%08x\\n", v, swap32(v));
    }
    return 0;
}
`,
      solution: `#include <stdio.h>
#include <stdint.h>

/* Move each byte to the mirror position: byte 0 <-> byte 3, byte 1 <-> byte 2. */
static uint32_t swap32(uint32_t v) {
    return (v >> 24) | ((v >> 8) & 0x0000ff00u) | ((v << 8) & 0x00ff0000u) | (v << 24);
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++) {
        unsigned int v;
        if (scanf("%u", &v) != 1) break;
        /* Little-endian memory order: the least significant byte comes first. */
        printf("0x%08x -> %02x %02x %02x %02x -> 0x%08x\\n", v,
               v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff, swap32(v));
    }
    return 0;
}
`,
      hints: [
        { en: "`v & 0xff` keeps only the lowest byte, `(v >> 8) & 0xff` gives the next one, and so on.", ar: "العبارة `v & 0xff` تُبقي أخفض بايت فقط، و`(v >> 8) & 0xff` تعطي البايت التالي، وهكذا." },
        { en: "For `swap32`, move each byte to its mirror position with shifts (`>> 24`, `>> 8`, `<< 8`, `<< 24`), mask the two middle bytes, and combine the parts with `|`.", ar: "في `swap32` انقل كل بايت إلى موضعه المقابل بالإزاحات (`>> 24` و`>> 8` و`<< 8` و`<< 24`)، وقنّع البايتين الأوسطين، ثم ادمج الأجزاء بـ `|`." },
      ],
      tests: [
        { name: { en: "The classic 0x12345678", ar: "العدد الكلاسيكي 0x12345678" }, stdin: `1
305419896
`, expected: `0x12345678 -> 78 56 34 12 -> 0x78563412
` },
        { name: { en: "Boundaries: zero and the largest 32-bit value", ar: "الحدود: الصفر وأكبر قيمة 32-bit" }, stdin: `2
0
4294967295
`, expected: `0x00000000 -> 00 00 00 00 -> 0x00000000
0xffffffff -> ff ff ff ff -> 0xffffffff
` },
        { name: { en: "A small number ends up in the top byte", ar: "عدد صغير ينتهي في البايت الأعلى" }, stdin: `2
1
66051
`, expected: `0x00000001 -> 01 00 00 00 -> 0x01000000
0x00010203 -> 03 02 01 00 -> 0x03020100
` },
        { name: { en: "Values with the high bit set", ar: "قيم بيت الإشارة فيها مضبوط" }, stdin: `1
3735928559
`, expected: `0xdeadbeef -> ef be ad de -> 0xefbeadde
` },
        { name: { en: "No numbers at all", ar: "لا أعداد إطلاقاً" }, stdin: `0
`, expected: "" },
      ],
      sampleInput: `1
305419896
`,
    },
    {
      type: "lab",
      id: "memory-map",
      lang: "javascript",
      prompt: {
        en: `## Which region is that address in?

A debugger just stopped at an address, and you want to know whether it is code, heap, stack or a library. You have the process's memory map (simplified from \`/proc/<pid>/maps\`) and a list of addresses to look up.

**Input**

- a line \`M\`, then \`M\` region lines: \`start-end perms name\` (hex numbers without \`0x\`; \`end\` is **exclusive**; the name has no spaces)
- a line \`Q\`, then \`Q\` lines, each an address like \`0x401a2b\`

**Output:** one line per query: \`<address as given> -> <name> (<perms>)\`, or \`<address as given> -> unmapped\` when no region contains it.

Addresses can be larger than 32 bits, so use \`BigInt\`.

**Example**

Input:

\`\`\`
2
00400000-00401000 r-xp demo
7ffd5a3c0000-7ffd5a3e1000 rw-p [stack]
2
0x400fff
0x401000
\`\`\`

Output:

\`\`\`
0x400fff -> demo (r-xp)
0x401000 -> unmapped
\`\`\``,
        ar: `## في أي منطقة يقع هذا العنوان؟

توقّف المنقّح (debugger) للتوّ عند عنوان، وتريد أن تعرف هل هو كود أم heap أم stack أم مكتبة. لديك خريطة ذاكرة العملية (مبسّطة من \`/proc/<pid>/maps\`) وقائمة عناوين للبحث عنها.

**المدخل**

- سطر \`M\`، ثم \`M\` سطراً للمناطق بالشكل: \`start-end perms name\` (أعداد hex بدون \`0x\`؛ و\`end\` **غير مشمول**؛ والاسم بلا مسافات)
- سطر \`Q\`، ثم \`Q\` سطراً، في كل منها عنوان مثل \`0x401a2b\`

**المخرج:** سطر لكل استعلام: \`<العنوان كما ورد> -> <name> (<perms>)\`، أو \`<العنوان كما ورد> -> unmapped\` إن لم تحتوه أي منطقة.

العناوين قد تتجاوز 32-bit، فاستخدم \`BigInt\`.

**مثال**

المدخل:

\`\`\`
2
00400000-00401000 r-xp demo
7ffd5a3c0000-7ffd5a3e1000 rw-p [stack]
2
0x400fff
0x401000
\`\`\`

المخرج:

\`\`\`
0x400fff -> demo (r-xp)
0x401000 -> unmapped
\`\`\``,
      },
      starterCode: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
let pos = 0;

const regionCount = Number(lines[pos++]);
const regions = [];
for (let i = 0; i < regionCount; i++) {
  const [range, perms, name] = lines[pos++].trim().split(/\\s+/);
  const [start, end] = range.split("-");
  // TODO 1: store start and end as BigInt (BigInt("0x" + start)), plus perms and name.
  regions.push({ perms, name });
}

const queryCount = Number(lines[pos++]);
for (let i = 0; i < queryCount; i++) {
  const text = lines[pos++].trim();
  // TODO 2: find the region with start <= address < end and print "<text> -> <name> (<perms>)".
  // TODO 3: when there is none, print "<text> -> unmapped".
  console.log(text + " -> ???");
}
`,
      solution: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
let pos = 0;

const regionCount = Number(lines[pos++]);
const regions = [];
for (let i = 0; i < regionCount; i++) {
  const [range, perms, name] = lines[pos++].trim().split(/\\s+/);
  const [start, end] = range.split("-");
  regions.push({ start: BigInt("0x" + start), end: BigInt("0x" + end), perms, name });
}

const queryCount = Number(lines[pos++]);
for (let i = 0; i < queryCount; i++) {
  const text = lines[pos++].trim();
  const address = BigInt(text); // BigInt understands the 0x prefix
  // The end of a region is exclusive: the first byte after it belongs to something else.
  const hit = regions.find((r) => address >= r.start && address < r.end);
  console.log(hit ? \`\${text} -> \${hit.name} (\${hit.perms})\` : \`\${text} -> unmapped\`);
}
`,
      hints: [
        { en: "Regions are stored with `BigInt` limits, and `BigInt(\"0x401000\")` parses a hex string, so you can compare addresses with `>=` and `<` directly.", ar: "خزّن حدود المناطق بـ `BigInt`، والتعبير `BigInt(\"0x401000\")` يحلّل نص hex، فتستطيع مقارنة العناوين بـ `>=` و`<` مباشرة." },
        { en: "`regions.find(...)` returns the first region that matches, or `undefined`. Remember the interval is half-open: `start <= address < end`.", ar: "الدالة `regions.find(...)` تعيد أول منطقة مطابقة أو `undefined`. وتذكّر أن المجال نصف مفتوح: `start <= address < end`." },
      ],
      tests: [
        { name: { en: "Hits in code, data and stack", ar: "إصابات في الكود والبيانات والـ stack" }, stdin: `4
00400000-00401000 r-xp demo
00600000-00601000 rw-p demo
01d3a000-01d5b000 rw-p [heap]
7ffd5a3c0000-7ffd5a3e1000 rw-p [stack]
4
0x400100
0x600abc
0x1d40000
0x7ffd5a3d0000
`, expected: `0x400100 -> demo (r-xp)
0x600abc -> demo (rw-p)
0x1d40000 -> [heap] (rw-p)
0x7ffd5a3d0000 -> [stack] (rw-p)
` },
        { name: { en: "Boundaries: start is inside, end is outside", ar: "الحدود: البداية داخل المجال والنهاية خارجه" }, stdin: `2
00400000-00401000 r-xp demo
00600000-00601000 rw-p demo
5
0x400000
0x400fff
0x401000
0x5fffff
0x601000
`, expected: `0x400000 -> demo (r-xp)
0x400fff -> demo (r-xp)
0x401000 -> unmapped
0x5fffff -> unmapped
0x601000 -> unmapped
` },
        { name: { en: "Addresses above 32 bits and below the first region", ar: "عناوين فوق 32-bit وأخرى تحت أول منطقة" }, stdin: `2
7f3a10000000-7f3a101c0000 r-xp libc.so
7f3a101c0000-7f3a101c4000 r--p libc.so
3
0x7f3a100a1b2c
0x7f3a101c0000
0x0
`, expected: `0x7f3a100a1b2c -> libc.so (r-xp)
0x7f3a101c0000 -> libc.so (r--p)
0x0 -> unmapped
` },
        { name: { en: "An empty memory map", ar: "خريطة ذاكرة فارغة" }, stdin: `0
2
0x1
0x7ffd5a3d0000
`, expected: `0x1 -> unmapped
0x7ffd5a3d0000 -> unmapped
` },
      ],
      sampleInput: `2
00400000-00401000 r-xp demo
7ffd5a3c0000-7ffd5a3e1000 rw-p [stack]
2
0x400fff
0x401000
`,
    },
    {
      type: "text",
      body: {
        en: `## Reading the clues

Every stage you met leaves evidence you will use later:

- **Compile** leaves the program's *logic*: loops, branches and constants survive, even though names are gone
- **Link** leaves *imports*: the library functions a program calls tell you a lot about what it does (files? sockets? crypto?)
- **Load** explains *why addresses differ*: ASLR and PIE are why you rebase before comparing a debugger with a disassembler
- **Strings and sections** (\`.rodata\`, \`.data\`) hold messages, paths and configuration

Before you move on, make a habit of asking three questions about any file you analyze: *What is it?* (magic bytes, \`file\`), *Am I allowed to analyze it?* (rules of the road), and *Where will I run it, if at all?* (a disposable virtual machine, never your everyday computer).`,
        ar: `## قراءة الأدلة

كل مرحلة مرّت بك تترك أدلة ستستخدمها لاحقاً:

- **Compile** يترك *منطق* البرنامج: الحلقات والتفرّعات والثوابت تبقى حتى لو اختفت الأسماء
- **Link** يترك *الاستيرادات (imports)*: دوال المكتبات التي يستدعيها البرنامج تخبرك الكثير عمّا يفعله (ملفات؟ مقابس شبكة؟ تشفير؟)
- **Load** يفسّر *لماذا تختلف العناوين*: ASLR وPIE هما السبب في أنك تعيد احتساب العناوين قبل مقارنة المنقّح بالمفكِّك
- **النصوص والأقسام** (\`.rodata\` و\`.data\`) تحوي رسائل ومسارات وإعدادات

قبل أن تنتقل، اعتد أن تسأل ثلاثة أسئلة عن أي ملف تحلله: *ما هو؟* (magic bytes، أمر \`file\`)، و*هل يحق لي تحليله؟* (قواعد الطريق)، و*أين سأشغّله إن شغّلته؟* (جهاز افتراضي يمكن التخلص منه، وليس حاسوبك اليومي أبداً).`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "In which order do the build steps happen?", ar: "بأي ترتيب تحدث خطوات البناء؟" },
          choices: [
            { en: "Compile, assemble, link, load", ar: "Compile ثم assemble ثم link ثم load" },
            { en: "Link, compile, assemble, load", ar: "Link ثم compile ثم assemble ثم load" },
            { en: "Assemble, compile, load, link", ar: "Assemble ثم compile ثم load ثم link" },
          ],
          answer: 0,
          explain: {
            en: "Source is compiled to assembly, assembled into object files, linked into one executable, and finally loaded into memory by the OS. The linker needs object files, so it cannot come first, and loading always comes last.",
            ar: "يُصرَّف الكود المصدري إلى assembly، ثم يُجمَّع إلى ملفات object، ثم تُربط في ملف تنفيذي واحد، وأخيراً يحمّله نظام التشغيل في الذاكرة. الرابط يحتاج ملفات object فلا يمكن أن يأتي أولاً، والتحميل يأتي دائماً في النهاية.",
          },
        },
        {
          q: { en: "A little-endian CPU stores the 32-bit value 0x12345678. What are the bytes in memory, lowest address first?", ar: "معالج little-endian يخزّن القيمة 32-bit ‏0x12345678. ما البايتات في الذاكرة بدءاً من أخفض عنوان؟" },
          choices: [
            { en: "12 34 56 78", ar: "12 34 56 78" },
            { en: "78 56 34 12", ar: "78 56 34 12" },
            { en: "87 65 43 21", ar: "87 65 43 21" },
          ],
          answer: 1,
          explain: {
            en: "Little-endian puts the least significant byte first. The third option swaps the hex digits inside each byte (nibbles), which is a common misreading: the unit that moves is the whole byte.",
            ar: "ترتيب little-endian يضع البايت الأقل أهمية أولاً. الخيار الثالث يعكس خانات hex داخل كل بايت (nibbles) وهذا سوء فهم شائع: الوحدة التي تتحرّك هي البايت الكامل.",
          },
        },
        {
          q: { en: "What is special about the .bss section?", ar: "ما الخاص في قسم .bss؟" },
          choices: [
            { en: "It holds the compiled machine code", ar: "يحوي كود الآلة المُصرَّف" },
            { en: "It holds string constants", ar: "يحوي ثوابت النصوص" },
            { en: "It holds zero-initialized globals and takes no space in the file", ar: "يحوي المتغيرات العامة المُهيّأة بالصفر ولا يأخذ مساحة في الملف" },
            { en: "It holds the debug symbols", ar: "يحوي رموز التنقيح" },
          ],
          answer: 2,
          explain: {
            en: "`.bss` describes memory that starts as zeros, so the file only records its size and the loader allocates it. Code lives in `.text`, string constants usually in `.rodata`, and symbol names in `.symtab`.",
            ar: "يصف `.bss` ذاكرة تبدأ أصفاراً، فيسجّل الملف حجمها فقط ويخصّصها المُحمِّل. الكود في `.text` وثوابت النصوص عادةً في `.rodata` وأسماء الرموز في `.symtab`.",
          },
        },
        {
          q: { en: "You receive a file named invoice.pdf from an unknown sender. What is the sensible first step?", ar: "وصلك ملف باسم invoice.pdf من مرسل مجهول. ما أول خطوة معقولة؟" },
          choices: [
            { en: "Trust the extension and double-click it", ar: "الوثوق بالامتداد والنقر عليه مرتين" },
            { en: "Check its magic bytes with a tool like `file`, without running it", ar: "فحص magic bytes بأداة مثل `file` دون تشغيله" },
            { en: "Rename it to .txt, which makes it safe", ar: "إعادة تسميته إلى .txt فهذا يجعله آمناً" },
          ],
          answer: 1,
          explain: {
            en: "The extension is only a label anyone can change. The first bytes tell you what the file really is, and reading them does not execute anything. Renaming never changes what the content is.",
            ar: "الامتداد مجرد ملصق يستطيع أي شخص تغييره. أول البايتات تخبرك بما هو الملف فعلاً، وقراءتها لا تنفّذ شيئاً. إعادة التسمية لا تغيّر طبيعة المحتوى أبداً.",
          },
        },
        {
          q: { en: "Which of these is an appropriate practice target for a beginner?", ar: "أي مما يلي هدف تدريب مناسب لمبتدئ؟" },
          choices: [
            { en: "A crackme or CTF binary published for practice", ar: "برنامج crackme أو CTF نُشر للتدريب" },
            { en: "A paid desktop app, to remove its license check", ar: "تطبيق مكتبي مدفوع، لإزالة فحص الترخيص فيه" },
            { en: "A friend's phone app, just to look, without asking", ar: "تطبيق هاتف صديق، للاطلاع فقط ودون سؤاله" },
            { en: "A company website, from home, to see what happens", ar: "موقع شركة من البيت لنرى ماذا يحدث" },
          ],
          answer: 0,
          explain: {
            en: "Practice material made for exactly this purpose (or your own code, or open source within its license, or anything with written permission) is the safe lane. The other three involve other people's property or systems, which can break licenses and laws regardless of your curiosity.",
            ar: "المواد المصنوعة لهذا الغرض بالذات (أو كودك أنت، أو المفتوح المصدر ضمن ترخيصه، أو أي شيء لديك إذن مكتوب به) هي المسار الآمن. الثلاثة الأخرى تمسّ ممتلكات أو أنظمة آخرين، وقد تخرق التراخيص والقوانين مهما كان فضولك.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary and what to practice next

- A program travels **source → assembly → object file → executable → process** and every step leaves clues
- An executable starts with **magic bytes** (\`7f 45 4c 46\` for ELF); the header tells you class, byte order, type, machine and entry point
- A process has **.text, .rodata, .data, .bss, heap and stack**, each with its own permissions, and **ASLR** moves them around on every run
- **Byte order** decides what a hex dump means: little-endian \`40 10 00 00\` is \`0x1040\`
- Stay on **your own, open-source, practice or permitted targets**, respect licenses, and disclose problems responsibly

**Practice next:** write a tiny C program, compile it with \`gcc -S\`, \`-c\` and a full build, and run \`readelf -h\`, \`nm\` and \`file\` on each output. Then look at the same program built with \`-O0\` and \`-O2\` and notice what changes. The next lesson reads the assembly you just produced.`,
        ar: `## الخلاصة وماذا تتدرّب عليه بعد ذلك

- يمرّ البرنامج بـ **source ← assembly ← object file ← executable ← process** وكل خطوة تترك أدلة
- يبدأ الملف التنفيذي بـ **magic bytes** ‏(\`7f 45 4c 46\` لـ ELF)؛ والترويسة تخبرك بالـclass وترتيب البايتات والنوع والآلة ونقطة الدخول
- للعملية **.text و.rodata و.data و.bss وheap وstack**، لكل منها صلاحياته، و**ASLR** يحرّكها في كل تشغيل
- **ترتيب البايتات** يحدّد معنى hex dump: القيمة little-endian ‏\`40 10 00 00\` هي \`0x1040\`
- ابقَ على **أهدافك أنت، أو المفتوحة المصدر، أو أهداف التدريب، أو المصرَّح بها**، واحترم التراخيص، وبلّغ عن المشكلات بمسؤولية

**تدرّب بعد ذلك:** اكتب برنامج C صغيراً جداً، وصرّفه بـ \`gcc -S\` و\`-c\` وبناء كامل، ثم شغّل \`readelf -h\` و\`nm\` و\`file\` على كل ناتج. ثم انظر إلى البرنامج نفسه مبنياً بـ \`-O0\` و\`-O2\` ولاحظ ما الذي يتغيّر. الدرس التالي يقرأ الـassembly الذي أنتجته للتوّ.`,
      },
    },
  ],
};
