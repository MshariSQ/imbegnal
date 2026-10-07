import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "memory-management",
  title: { en: "Memory Management & Virtual Memory — A Private Map for Every Process", ar: "إدارة الذاكرة والذاكرة الافتراضية — خريطة خاصة لكل عملية" },
  estMinutes: 43,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why every process sees its own private **virtual address space**
- How **paging** splits an address into a **page number** and an **offset**, and how the **page table** maps pages to physical **frames**
- What the **TLB** and a **page fault** are, and why a page fault is not always an error
- How **page replacement** (FIFO vs LRU) decides what to evict, and what **Belady's anomaly** is
- **Fragmentation**, and how **first-fit** and **best-fit** allocation behave

You will code three exercises: an address translator in C, a FIFO vs LRU fault counter in Python and a first-fit/best-fit allocator in Go.`,
        ar: `## ماذا ستتعلم

- لماذا ترى كل عملية **فضاء عناوين افتراضياً (virtual address space)** خاصاً بها
- كيف يقسّم **التصفيح (paging)** العنوان إلى **رقم صفحة (page number)** و**إزاحة (offset)**، وكيف يربط **جدول الصفحات (page table)** الصفحات بـ**الإطارات (frames)** الفيزيائية
- ما هو **TLB** و**خطأ الصفحة (page fault)**، ولماذا ليس خطأ الصفحة خللاً دائماً
- كيف يقرر **استبدال الصفحات (page replacement)** (FIFO مقابل LRU) ما الذي يُطرد، وما هي **شذوذ بيلادي (Belady's anomaly)**
- **التجزؤ (fragmentation)**، وكيف تتصرف سياستا **first-fit** و**best-fit** في التخصيص

ستبرمج ثلاثة تمارين: مترجم عناوين بلغة C، وعدّاد أخطاء صفحات FIFO مقابل LRU بلغة Python، ومخصِّص ذاكرة first-fit/best-fit بلغة Go.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A library with a private catalog 📚

Imagine a huge library where **every reader gets their own private catalog**. In your catalog, books are numbered 0, 1, 2, 3... as if you owned the whole library. Another reader's catalog also starts at 0, and "book 0" there is a different book. A **librarian** keeps a ledger that says "your book 7 is on shelf 42, their book 7 is on shelf 9".

- Your **catalog numbers** are **virtual addresses**
- The **shelves** are **physical memory (RAM)**, divided into equal slots called **frames**
- The librarian's **ledger** is the **page table**, and the librarian is the **OS** together with the CPU's **MMU** (memory management unit)
- Only the books you are using sit on the reading desk (RAM); the rest live in the **storage room** (disk)

This gives three gifts:

1. **Isolation**: your catalog simply cannot name another reader's books, so one buggy program cannot overwrite another
2. **Convenience**: every program can be compiled as if it owned addresses starting from 0
3. **More than fits**: the sum of all address spaces can be larger than RAM, because rarely used parts wait on disk

### What lives in an address space

A process's virtual address space holds its **code**, **global data**, the **heap** (grows with \`malloc\`/\`new\`), the **stack** (grows with function calls) and memory-mapped files and libraries. On Linux you can see the real layout of a running process in \`/proc/<pid>/maps\`.`,
        ar: `## مكتبة لكل قارئ فيها فهرس خاص 📚

تخيّل مكتبة ضخمة **يحصل فيها كل قارئ على فهرس خاص به**. في فهرسك تُرقَّم الكتب 0 و1 و2 و3... كأنك تملك المكتبة كلها. وفهرس قارئ آخر يبدأ من 0 أيضاً، لكن "الكتاب 0" عنده كتاب مختلف. ويحتفظ **أمين المكتبة** بسجلّ يقول: "كتابك 7 على الرف 42، وكتابه 7 على الرف 9".

- **أرقام فهرسك** هي **العناوين الافتراضية (virtual addresses)**
- **الرفوف** هي **الذاكرة الفيزيائية (RAM)** مقسّمة إلى خانات متساوية تسمى **إطارات (frames)**
- **سجلّ** الأمين هو **جدول الصفحات (page table)**، والأمين هو **نظام التشغيل** مع وحدة إدارة الذاكرة **MMU** في المعالج
- الكتب التي تستخدمها فقط هي التي تكون على مكتب القراءة (RAM)؛ والبقية في **المخزن** (القرص)

وهذا يعطي ثلاث هبات:

1. **العزل**: فهرسك لا يستطيع ببساطة تسمية كتب قارئ آخر، فلا يمكن لبرنامج معطوب أن يكتب فوق برنامج آخر
2. **الراحة**: يمكن تصريف كل برنامج كأنه يملك عناوين تبدأ من 0
3. **أكثر مما تتسع له الذاكرة**: مجموع فضاءات العناوين قد يتجاوز الـRAM، لأن الأجزاء النادرة الاستخدام تنتظر على القرص

### ماذا يوجد في فضاء العناوين

يحتوي فضاء العناوين الافتراضي للعملية على **الكود** و**البيانات العامة** و**الكومة (heap)** (تنمو مع \`malloc\`/\`new\`) و**المكدّس (stack)** (ينمو مع استدعاءات الدوال) والملفات والمكتبات المربوطة بالذاكرة. وعلى لينكس يمكنك رؤية التخطيط الفعلي لعملية قيد التشغيل في \`/proc/<pid>/maps\`.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Paging: pages, frames and the page table

Virtual memory is cut into equal blocks called **pages**; physical memory is cut into blocks of the same size called **frames**. A common page size is **4 KiB (4096 bytes)**. Any page can sit in any frame, so the OS never needs one big contiguous hole.

A virtual address is split in two:

\`\`\`
virtual address = | page number | offset |
page number = address / page_size      (which page)
offset      = address % page_size      (which byte inside the page)
\`\`\`

When the page size is a power of two (4096 = 2^12) this is just bit slicing: the **low 12 bits are the offset** and the rest is the page number.

Example, address \`0x1A2B\` with 4 KiB pages: \`0x1A2B >> 12 = 0x1\` is page 1, and \`0x1A2B & 0xFFF = 0xA2B\` is the offset (2603).

The **page table** (one per process) maps page numbers to frame numbers. The MMU builds the **physical address** like this:

\`\`\`
physical address = frame number * page_size + offset
\`\`\`

The offset never changes; only the page number is replaced by a frame number. If page 1 lives in frame 2, then virtual \`0x1A2B\` becomes \`2 * 4096 + 2603 = 10795\`.

### Page tables are big, so they are trees

With 32-bit addresses and 4 KiB pages there are 2^20 pages; a flat table with 4-byte entries would take 4 MiB per process. For 64-bit machines it would be impossible. So real systems use **multi-level page tables** (for example 4 levels on x86-64 with 48-bit virtual addresses: 4 levels of 9 bits plus a 12-bit offset). Whole unused regions need no table at all.

### Entries carry more than a frame number

Each **page table entry (PTE)** also holds flag bits: **present/valid** (is the page in RAM?), **read/write/execute** permissions, **user/supervisor** and **dirty/accessed** bits. The hardware checks these on every access, which is how the OS makes code pages non-writable and keeps user programs out of kernel memory.

Translate some addresses yourself:`,
        ar: `## التصفيح: صفحات وإطارات وجدول الصفحات

تُقطَّع الذاكرة الافتراضية إلى كتل متساوية تسمى **صفحات (pages)**، وتُقطَّع الذاكرة الفيزيائية إلى كتل بالحجم نفسه تسمى **إطارات (frames)**. حجم الصفحة الشائع هو **4 KiB (أي 4096 بايت)**. يمكن لأي صفحة أن تقع في أي إطار، فلا يحتاج النظام إلى ثقب واحد كبير متصل.

يُقسَّم العنوان الافتراضي إلى جزأين:

\`\`\`
virtual address = | page number | offset |
page number = address / page_size      (أي صفحة)
offset      = address % page_size      (أي بايت داخل الصفحة)
\`\`\`

وحين يكون حجم الصفحة قوة للعدد 2 (4096 = 2^12) فإن العملية مجرد اقتطاع بتّات: **أدنى 12 بتّاً هي الإزاحة** والباقي هو رقم الصفحة.

مثال: العنوان \`0x1A2B\` مع صفحات 4 KiB: \`0x1A2B >> 12 = 0x1\` هي الصفحة 1، و\`0x1A2B & 0xFFF = 0xA2B\` هي الإزاحة (2603).

**جدول الصفحات** (واحد لكل عملية) يربط أرقام الصفحات بأرقام الإطارات. وتبني الـMMU **العنوان الفيزيائي** هكذا:

\`\`\`
physical address = frame number * page_size + offset
\`\`\`

الإزاحة لا تتغير أبداً؛ يُستبدل فقط رقم الصفحة برقم إطار. فإذا كانت الصفحة 1 في الإطار 2، يصبح العنوان الافتراضي \`0x1A2B\` هو \`2 * 4096 + 2603 = 10795\`.

### جداول الصفحات كبيرة، لذلك هي أشجار

مع عناوين 32 بتّاً وصفحات 4 KiB يوجد 2^20 صفحة؛ وجدول مسطّح بمداخل من 4 بايت سيأخذ 4 MiB لكل عملية. وعلى آلات 64 بتّاً سيكون ذلك مستحيلاً. لذا تستخدم الأنظمة الحقيقية **جداول صفحات متعددة المستويات** (مثلاً 4 مستويات على x86-64 بعناوين افتراضية من 48 بتّاً: 4 مستويات من 9 بتّات مع إزاحة من 12 بتّاً). والمناطق الفارغة الكبيرة لا تحتاج إلى جدول إطلاقاً.

### المدخل يحمل أكثر من رقم إطار

يحمل كل **مدخل في جدول الصفحات (PTE)** أيضاً بتّات علم: **present/valid** (هل الصفحة في الـRAM؟) وصلاحيات **القراءة/الكتابة/التنفيذ** وبتّات **user/supervisor** و**dirty/accessed**. وتفحصها العتاد عند كل وصول، وبهذا يجعل النظام صفحات الكود غير قابلة للكتابة ويُبعد برامج المستخدم عن ذاكرة النواة.

ترجم بعض العناوين بنفسك:`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `PAGE_SIZE = 4096                      # 4 KiB = 2**12 bytes
page_table = {0: 5, 1: 2, 3: 7}       # virtual page number -> physical frame number

def translate(vaddr):
    page, offset = divmod(vaddr, PAGE_SIZE)
    if page not in page_table:
        return f"{vaddr:>6} -> page {page}, offset {offset:>4}: PAGE FAULT (no mapping)"
    paddr = page_table[page] * PAGE_SIZE + offset
    return f"{vaddr:>6} -> page {page}, offset {offset:>4}: frame {page_table[page]} -> physical {paddr}"

for vaddr in [100, 4106, 8192, 16383, 0x1A2B]:
    print(translate(vaddr))
`,
      explanation: {
        en: "The offset is copied unchanged while the page number is swapped for a frame number. Address 8192 is page 2, which has no entry, so the access would trigger a page fault. Try adding 2: 9 to page_table or a bigger PAGE_SIZE.",
        ar: "تُنسخ الإزاحة كما هي بينما يُستبدل رقم الصفحة برقم إطار. العنوان 8192 يقع في الصفحة 2 التي لا مدخل لها، فيسبّب الوصول إليه خطأ صفحة. جرّب إضافة 2: 9 إلى page_table أو حجم PAGE_SIZE أكبر.",
      },
    },
    {
      type: "text",
      body: {
        en: `## The TLB and page faults

### Why we need a cache for translations

If every load and store needed several page-table reads in RAM, programs would crawl. The CPU therefore keeps a tiny, very fast cache of recent translations: the **TLB** (translation lookaside buffer). On a **TLB hit** the physical frame is known immediately. On a **TLB miss** the hardware (or the OS, on some architectures) walks the page table and refills the TLB. Because programs show **locality** (they reuse nearby addresses), hit rates are typically very high. When the OS switches to another process, TLB entries of the old one must be discarded or tagged with an address-space ID so they are not reused by mistake.

### Page faults

A **page fault** is an exception raised when the CPU touches a virtual page that has no usable mapping right now: the present bit is clear, or the access violates the permissions. The OS fault handler then decides:

- **Valid page, not in RAM yet** (a "minor/major" fault): find or free a frame, load the page from disk if needed, update the page table, and **restart the instruction**. The program never notices, apart from the delay. This is **demand paging**: a program's pages are loaded only when first touched.
- **Copy-on-write**: after \`fork\` parent and child share frames marked read-only; the first write faults and the kernel gives the writer its own copy. That is why \`fork\` is cheap.
- **Invalid access** (unmapped address or a write to read-only memory): the OS sends the process a **SIGSEGV**, the famous *segmentation fault*.

So "page fault" is a normal, frequent event, while "segmentation fault" is the fatal outcome of an invalid one.

### Thrashing

If the combined **working sets** of the running programs do not fit in RAM, pages are evicted just before they are needed again. The system spends its time swapping pages in and out instead of running code, which is **thrashing**. The cures are more RAM, fewer running programs, or better replacement.

Now practise the mapping logic you just saw in code:`,
        ar: `## الـTLB وأخطاء الصفحات

### لماذا نحتاج ذاكرة مخبئية للترجمات

لو احتاج كل تحميل وتخزين إلى عدة قراءات من جدول الصفحات في الـRAM لزحفت البرامج. لذلك يحتفظ المعالج بذاكرة مخبئية صغيرة وسريعة جداً للترجمات الأخيرة: هي **TLB** (translation lookaside buffer). عند **إصابة TLB (hit)** يُعرف الإطار الفيزيائي فوراً. وعند **إخفاقها (miss)** يتجول العتاد (أو النظام في بعض المعماريات) في جدول الصفحات ويعيد ملء الـTLB. ولأن البرامج تُظهر **محلية مرجعية (locality)** (تعيد استخدام عناوين متجاورة) فإن نسب الإصابة عالية جداً عادةً. وحين يبدّل النظام إلى عملية أخرى يجب تجاهل مداخل العملية القديمة أو وسمها بمعرّف فضاء عناوين كي لا يُعاد استخدامها خطأً.

### أخطاء الصفحات

**خطأ الصفحة (page fault)** استثناء يُرفع حين يلمس المعالج صفحة افتراضية لا ربط صالحاً لها الآن: بتّ present غير مضبوط، أو أن الوصول يخالف الصلاحيات. ثم يقرر معالج الأخطاء في النظام:

- **صفحة صالحة لكنها ليست في الـRAM بعد** (خطأ "minor/major"): يجد إطاراً أو يحرّر واحداً، ويحمّل الصفحة من القرص عند الحاجة، ويحدّث جدول الصفحات، و**يعيد تنفيذ التعليمة**. ولا يلاحظ البرنامج شيئاً سوى التأخير. وهذا هو **التصفيح عند الطلب (demand paging)**: لا تُحمَّل صفحات البرنامج إلا عند أول لمس لها.
- **النسخ عند الكتابة (copy-on-write)**: بعد \`fork\` يتشارك الأب والابن إطارات موسومة للقراءة فقط؛ وأول كتابة تسبّب خطأً فيعطي النواة الكاتب نسخته الخاصة. ولهذا فإن \`fork\` رخيصة.
- **وصول غير صالح** (عنوان غير مربوط أو كتابة في ذاكرة للقراءة فقط): يرسل النظام إلى العملية الإشارة **SIGSEGV**، وهي *segmentation fault* المشهور.

إذن "خطأ الصفحة" حدث عادي ومتكرر، أما "segmentation fault" فهو النتيجة القاتلة لخطأ غير صالح.

### الانهيار بالتبديل (Thrashing)

إذا لم تتسع **مجموعات العمل (working sets)** المجتمعة للبرامج العاملة في الـRAM، تُطرد الصفحات قبيل الحاجة إليها مجدداً. فيقضي النظام وقته في إدخال الصفحات وإخراجها بدل تنفيذ الكود، وهذا هو **thrashing**. وعلاجه: مزيد من الـRAM، أو برامج أقل، أو استبدال أفضل.

الآن تمرّن على منطق الربط الذي رأيته للتو بالكود:`,
      },
    },
    {
      type: "lab",
      id: "page-translate",
      lang: "c",
      prompt: {
        en: `Write an **address translator** for a single-level page table.

**Input:**
- Line 1: \`page_size m\`, the page size in bytes and the number of mappings (\`m\` is at most 1000)
- Next \`m\` lines: \`vpn frame\`, meaning virtual page \`vpn\` is stored in physical frame \`frame\`
- Then zero or more virtual addresses (decimal, one per line) until the end of input

**Output:** one line per address:

- \`<vaddr> -> <paddr>\` where \`paddr = frame * page_size + vaddr % page_size\`, if the page is mapped
- \`<vaddr> -> PAGE FAULT\` if the page has no mapping

Use \`unsigned long long\` so that large addresses work. **Example:**

\`\`\`
4096 3
0 5
1 2
3 7
100
4106
8192
16383
\`\`\`

prints

\`\`\`
100 -> 20580
4106 -> 8202
8192 -> PAGE FAULT
16383 -> 32767
\`\`\``,
        ar: `اكتب **مترجم عناوين** لجدول صفحات أحادي المستوى.

**المدخل:**
- السطر 1: \`page_size m\`، أي حجم الصفحة بالبايت وعدد الربوط (\`m\` لا تتجاوز 1000)
- ثم \`m\` سطراً: \`vpn frame\`، أي أن الصفحة الافتراضية \`vpn\` مخزّنة في الإطار الفيزيائي \`frame\`
- ثم صفر أو أكثر من العناوين الافتراضية (عشرية، واحد في كل سطر) حتى نهاية المدخل

**المخرج:** سطر لكل عنوان:

- \`<vaddr> -> <paddr>\` حيث \`paddr = frame * page_size + vaddr % page_size\`، إذا كانت الصفحة مربوطة
- \`<vaddr> -> PAGE FAULT\` إذا لم يكن للصفحة ربط

استخدم \`unsigned long long\` كي تعمل العناوين الكبيرة. **مثال:**

\`\`\`
4096 3
0 5
1 2
3 7
100
4106
8192
16383
\`\`\`

يطبع

\`\`\`
100 -> 20580
4106 -> 8202
8192 -> PAGE FAULT
16383 -> 32767
\`\`\``,
      },
      starterCode: `#include <stdio.h>

#define MAX_MAPPINGS 1000

int main(void) {
    unsigned long long page_size, m;
    unsigned long long vpn[MAX_MAPPINGS], frame[MAX_MAPPINGS];

    if (scanf("%llu %llu", &page_size, &m) != 2) return 0;

    // TODO 1: read the m "vpn frame" pairs into the two arrays

    unsigned long long vaddr;
    while (scanf("%llu", &vaddr) == 1) {
        // TODO 2: split vaddr into page (vaddr / page_size) and offset (vaddr % page_size)
        // TODO 3: look the page up in the table; if found print frame * page_size + offset
        printf("%llu -> PAGE FAULT\\n", vaddr);
    }
    return 0;
}
`,
      solution: `#include <stdio.h>

#define MAX_MAPPINGS 1000

int main(void) {
    unsigned long long page_size, m;
    unsigned long long vpn[MAX_MAPPINGS], frame[MAX_MAPPINGS];

    if (scanf("%llu %llu", &page_size, &m) != 2) return 0;
    for (unsigned long long i = 0; i < m; i++) {
        if (scanf("%llu %llu", &vpn[i], &frame[i]) != 2) return 1;
    }

    unsigned long long vaddr;
    while (scanf("%llu", &vaddr) == 1) {
        unsigned long long page = vaddr / page_size;
        unsigned long long offset = vaddr % page_size;

        int found = 0;
        for (unsigned long long i = 0; i < m; i++) {
            if (vpn[i] == page) {
                // The offset is copied unchanged; only the page number is replaced.
                printf("%llu -> %llu\\n", vaddr, frame[i] * page_size + offset);
                found = 1;
                break;
            }
        }
        if (!found) printf("%llu -> PAGE FAULT\\n", vaddr);
    }
    return 0;
}
`,
      hints: [
        {
          en: "Read the table first with a loop of m scanf calls, then keep reading addresses with `while (scanf(...) == 1)` until input ends.",
          ar: "اقرأ الجدول أولاً بحلقة من m استدعاء لـ scanf، ثم تابع قراءة العناوين بـ `while (scanf(...) == 1)` حتى ينتهي المدخل.",
        },
        {
          en: "page = vaddr / page_size and offset = vaddr % page_size. Scan the table for an entry whose vpn equals page.",
          ar: "page = vaddr / page_size وoffset = vaddr % page_size. ابحث في الجدول عن مدخل يساوي vpn فيه page.",
        },
        {
          en: "On a hit print frame * page_size + offset. If the loop finds nothing, print PAGE FAULT. Frame 0 is a valid frame, so do not use 0 to mean 'not found'; use a separate flag.",
          ar: "عند الإصابة اطبع frame * page_size + offset. وإن لم تجد الحلقة شيئاً فاطبع PAGE FAULT. الإطار 0 إطار صالح، فلا تستخدم 0 للدلالة على 'غير موجود'؛ استخدم علماً منفصلاً.",
        },
      ],
      tests: [
        {
          name: { en: "Lesson example", ar: "مثال الدرس" },
          stdin: "4096 3\n0 5\n1 2\n3 7\n100\n4106\n8192\n16383\n",
          expected: "100 -> 20580\n4106 -> 8202\n8192 -> PAGE FAULT\n16383 -> 32767",
        },
        {
          name: { en: "Page boundaries and frame 0", ar: "حدود الصفحات والإطار 0" },
          stdin: "4096 2\n0 1\n1 0\n0\n4095\n4096\n4097\n8192\n",
          expected: "0 -> 4096\n4095 -> 8191\n4096 -> 0\n4097 -> 1\n8192 -> PAGE FAULT",
        },
        {
          name: { en: "A different page size", ar: "حجم صفحة مختلف" },
          stdin: "256 1\n4 9\n1024\n1279\n1280\n",
          expected: "1024 -> 2304\n1279 -> 2559\n1280 -> PAGE FAULT",
        },
        {
          name: { en: "No addresses to translate", ar: "لا عناوين للترجمة" },
          stdin: "4096 1\n0 0\n",
          expected: "",
        },
        {
          name: { en: "Addresses beyond 32 bits", ar: "عناوين تتجاوز 32 بتّاً" },
          stdin: "4096 1\n1048576 3\n4294967296\n4294967297\n8589934592\n",
          expected: "4294967296 -> 12288\n4294967297 -> 12289\n8589934592 -> PAGE FAULT",
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## When RAM is full: page replacement

Eventually a page fault needs a free frame and there is none. The OS must **evict a victim** page (writing it to disk first if its dirty bit is set) and reuse its frame. The goal is the fewest page faults, because a fault costs about as much as millions of CPU instructions when it goes to disk.

We compare policies by running them on a **reference string**: the sequence of page numbers a program touches.

- **FIFO**: evict the page that has been in memory the longest. Trivial to implement, but it may throw out a page that is used all the time just because it was loaded early.
- **LRU** (Least Recently Used): evict the page not used for the longest time. It exploits locality and usually performs well, but exact LRU needs bookkeeping on every access.
- **Optimal** (Belady's MIN): evict the page that will not be needed for the longest time in the future. It cannot be built (nobody knows the future) but is the benchmark.
- **Clock** (second chance): the practical approximation of LRU used in real kernels. Pages sit in a circle with a **reference bit** set by hardware on access; the clock hand clears bits and evicts the first page whose bit is already 0.

### A worked example

With **3 frames** and the reference string \`7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1\`, FIFO causes **15** faults and LRU causes **12**.

### Belady's anomaly

Surprisingly, with FIFO **more frames can mean more faults**. This is **Belady's anomaly**. Run it:`,
        ar: `## حين تمتلئ الذاكرة: استبدال الصفحات

في النهاية يحتاج خطأ صفحة إلى إطار فارغ ولا يوجد. فيجب على النظام **طرد صفحة ضحية** (وكتابتها على القرص أولاً إن كان بتّ dirty مضبوطاً) وإعادة استخدام إطارها. والهدف أقل عدد من أخطاء الصفحات، لأن الخطأ الذي يذهب إلى القرص يكلّف ما يعادل ملايين تعليمات المعالج.

نقارن السياسات بتشغيلها على **سلسلة مراجع (reference string)**: وهي تسلسل أرقام الصفحات التي يلمسها البرنامج.

- **FIFO**: اطرد الصفحة التي مكثت في الذاكرة أطول وقت. سهلة التنفيذ جداً، لكنها قد تطرد صفحة تُستخدم طوال الوقت لمجرد أنها حُمّلت مبكراً.
- **LRU** (الأقل استخداماً مؤخراً): اطرد الصفحة التي لم تُستخدم منذ أطول مدة. تستفيد من المحلية المرجعية وتؤدي جيداً عادةً، لكن LRU الدقيقة تحتاج إلى مسك دفاتر عند كل وصول.
- **المثالية (Optimal / MIN لبيلادي)**: اطرد الصفحة التي لن تلزم لأطول وقت في المستقبل. لا يمكن بناؤها (لا أحد يعرف المستقبل) لكنها المعيار المرجعي.
- **الساعة (Clock / الفرصة الثانية)**: التقريب العملي لـLRU في النوى الحقيقية. تقع الصفحات في دائرة ولكلٍّ منها **بتّ مرجع (reference bit)** يضبطه العتاد عند الوصول؛ وتمسح عقرب الساعة البتّات وتطرد أول صفحة بتّها 0 أصلاً.

### مثال محلول

مع **3 إطارات** وسلسلة المراجع \`7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1\` تسبّب FIFO **15** خطأً وتسبّب LRU **12**.

### شذوذ بيلادي

من المدهش أن **زيادة الإطارات قد تعني أخطاء أكثر** مع FIFO. هذه هي **شذوذ بيلادي (Belady's anomaly)**. شغّل المثال:`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// Count FIFO page faults for a reference string and a number of frames.
function fifoFaults(refs, frames) {
  const memory = [];                 // oldest page first
  let faults = 0;
  for (const page of refs) {
    if (memory.includes(page)) continue;   // hit
    faults++;
    if (memory.length === frames) memory.shift();   // evict the oldest arrival
    memory.push(page);
  }
  return faults;
}

const refs = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];
for (const frames of [1, 2, 3, 4, 5]) {
  console.log(frames + " frames -> " + fifoFaults(refs, frames) + " faults");
}
`,
      explanation: {
        en: "Going from 3 to 4 frames raises the faults from 9 to 10, which is Belady's anomaly. LRU and the optimal policy never behave like this: more memory can only help them.",
        ar: "الانتقال من 3 إلى 4 إطارات يرفع الأخطاء من 9 إلى 10، وهذه شذوذ بيلادي. أما LRU والسياسة المثالية فلا تتصرفان هكذا أبداً: الذاكرة الأكبر لا يمكن إلا أن تفيدهما.",
      },
    },
    {
      type: "lab",
      id: "fifo-vs-lru",
      lang: "python",
      prompt: {
        en: `Count the page faults of **FIFO** and **LRU** on the same reference string.

**Input:** the number of frames \`k\` (an integer, at least 1) on the first line, then the reference string on the following lines: space-separated page numbers (it may be empty).

**Rules:**
- A reference is a **hit** if the page is already in memory, otherwise it is a **fault**.
- On a fault with all \`k\` frames full, evict one page, then load the new one. **FIFO** evicts the page that arrived first; **LRU** evicts the page whose last use is oldest. A hit changes the order for LRU only.

**Output:** two lines:

\`\`\`
FIFO faults=<n>
LRU faults=<n>
\`\`\`

**Example:** \`k = 3\` and the reference string \`1 2 3 4 1 2 5 1 2 3 4 5\` print \`FIFO faults=9\` and \`LRU faults=10\`.`,
        ar: `احسب أخطاء الصفحات لسياستي **FIFO** و**LRU** على سلسلة المراجع نفسها.

**المدخل:** عدد الإطارات \`k\` (عدد صحيح، 1 على الأقل) في السطر الأول، ثم سلسلة المراجع في الأسطر التالية: أرقام صفحات تفصل بينها مسافات (وقد تكون فارغة).

**القواعد:**
- المرجع **إصابة (hit)** إن كانت الصفحة في الذاكرة أصلاً، وإلا فهو **خطأ (fault)**.
- عند الخطأ وكل الإطارات الـ\`k\` ممتلئة، اطرد صفحة ثم حمّل الجديدة. **FIFO** تطرد الصفحة التي وصلت أولاً؛ و**LRU** تطرد الصفحة الأقدم استخداماً. والإصابة تغيّر الترتيب في LRU فقط.

**المخرج:** سطران:

\`\`\`
FIFO faults=<n>
LRU faults=<n>
\`\`\`

**مثال:** \`k = 3\` وسلسلة المراجع \`1 2 3 4 1 2 5 1 2 3 4 5\` تطبع \`FIFO faults=9\` و\`LRU faults=10\`.`,
      },
      starterCode: `import sys

tokens = sys.stdin.read().split()
k = int(tokens[0])
refs = [int(t) for t in tokens[1:]]

def fifo_faults(refs, k):
    # TODO 1: keep a list of the pages in memory (oldest arrival first)
    # TODO 2: on a hit do nothing; on a fault count it, evict the oldest if full, then add the page
    return 0

def lru_faults(refs, k):
    # TODO 3: like FIFO, but a hit must also mark the page as most recently used
    # (hint: remove it from the list and append it again)
    return 0

print(f"FIFO faults={fifo_faults(refs, k)}")
print(f"LRU faults={lru_faults(refs, k)}")
`,
      solution: `import sys

tokens = sys.stdin.read().split()
k = int(tokens[0])
refs = [int(t) for t in tokens[1:]]

def fifo_faults(refs, k):
    memory = []                       # oldest arrival first
    faults = 0
    for page in refs:
        if page in memory:
            continue                  # hit: FIFO ignores it
        faults += 1
        if len(memory) == k:
            memory.pop(0)             # evict the page that arrived first
        memory.append(page)
    return faults

def lru_faults(refs, k):
    memory = []                       # least recently used first
    faults = 0
    for page in refs:
        if page in memory:
            memory.remove(page)       # hit: move to the most-recent end
        else:
            faults += 1
            if len(memory) == k:
                memory.pop(0)         # evict the least recently used page
        memory.append(page)
    return faults

print(f"FIFO faults={fifo_faults(refs, k)}")
print(f"LRU faults={lru_faults(refs, k)}")
`,
      hints: [
        {
          en: "Use a Python list as the set of frames. \`page in memory\` tells you hit or fault, and \`memory.pop(0)\` removes the oldest entry.",
          ar: "استخدم قائمة Python كمجموعة للإطارات. \`page in memory\` تخبرك إصابة أم خطأ، و\`memory.pop(0)\` تزيل أقدم مدخل.",
        },
        {
          en: "FIFO and LRU differ in exactly one place: on a hit, LRU must move the page to the 'most recent' end of the list (remove it, then append it); FIFO leaves the order alone.",
          ar: "تختلف FIFO وLRU في موضع واحد فقط: عند الإصابة يجب على LRU نقل الصفحة إلى طرف 'الأحدث' من القائمة (احذفها ثم أضفها)؛ أما FIFO فتترك الترتيب كما هو.",
        },
        {
          en: "Remember the empty reference string: tokens then holds only k, so refs is empty and both counts are 0.",
          ar: "تذكّر سلسلة المراجع الفارغة: عندها لا تحتوي tokens إلا على k، فتكون refs فارغة ويكون العدّان صفراً.",
        },
      ],
      tests: [
        {
          name: { en: "Belady string, 3 frames (FIFO wins)", ar: "سلسلة بيلادي، 3 إطارات (تفوز FIFO)" },
          stdin: "3\n1 2 3 4 1 2 5 1 2 3 4 5\n",
          expected: "FIFO faults=9\nLRU faults=10",
        },
        {
          name: { en: "Belady string, 4 frames (anomaly)", ar: "سلسلة بيلادي، 4 إطارات (الشذوذ)" },
          stdin: "4\n1 2 3 4 1 2 5 1 2 3 4 5\n",
          expected: "FIFO faults=10\nLRU faults=8",
        },
        {
          name: { en: "Textbook string, 3 frames", ar: "سلسلة الكتاب المدرسي، 3 إطارات" },
          stdin: "3\n7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1\n",
          expected: "FIFO faults=15\nLRU faults=12",
        },
        {
          name: { en: "Empty reference string", ar: "سلسلة مراجع فارغة" },
          stdin: "3\n",
          expected: "FIFO faults=0\nLRU faults=0",
        },
        {
          name: { en: "One frame and repeated pages", ar: "إطار واحد وصفحات متكررة" },
          stdin: "1\n1 1 2 2 1\n",
          expected: "FIFO faults=3\nLRU faults=3",
        },
        {
          name: { en: "A single page, plenty of frames", ar: "صفحة واحدة وإطارات وفيرة" },
          stdin: "5\n9 9 9 9 9 9\n",
          expected: "FIFO faults=1\nLRU faults=1",
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Fragmentation and allocation

Memory gets wasted in two different ways:

- **Internal fragmentation**: space wasted *inside* an allocated block. With 4096-byte pages, a 10,000-byte program needs 3 pages (12,288 bytes), so 2,288 bytes in the last page are wasted. On average about half a page per region is lost.
- **External fragmentation**: enough free memory exists in total, but only in small scattered **holes**, so a large request fails. Imagine 30 free bytes as three holes of 10: a request for 15 cannot be served.

**Paging removes external fragmentation** for process memory (any free frame will do) at the price of a little internal fragmentation. Allocators that need *contiguous* regions (a \`malloc\` heap, a kernel buffer pool, simple partition schemes) still face external fragmentation, and use placement policies:

- **First-fit**: take the first hole (lowest address) that is big enough. Fast.
- **Best-fit**: take the *smallest* hole that is big enough, leaving the biggest holes intact. It must search every hole and tends to leave many tiny, useless slivers.
- **Worst-fit**: take the largest hole, hoping the leftover is still useful. It usually performs worse in practice.

None of them wins in every case; first-fit is often as good as best-fit and faster. **Compaction** (moving allocations together) fixes external fragmentation but is expensive and needs relocation.

### Classic example

Holes in address order are 100, 500, 200, 300, 600 KB. Requests are 212, 417, 112, 426 KB:

- **First-fit**: 212 goes to the 500 hole (288 left), 417 to the 600 hole (183 left), 112 to the 288 hole (176 left), and 426 **fails** although plenty is free in total
- **Best-fit**: 212 to 300, 417 to 500, 112 to 200 and 426 to 600: **everything fits**

Simulate such an allocator in the last lab.`,
        ar: `## التجزؤ والتخصيص

تُهدَر الذاكرة بطريقتين مختلفتين:

- **التجزؤ الداخلي (internal fragmentation)**: مساحة مهدورة *داخل* كتلة مخصَّصة. مع صفحات من 4096 بايت يحتاج برنامج من 10,000 بايت إلى 3 صفحات (12,288 بايتاً)، فيُهدَر 2,288 بايتاً في الصفحة الأخيرة. ويضيع في المتوسط نحو نصف صفحة لكل منطقة.
- **التجزؤ الخارجي (external fragmentation)**: توجد ذاكرة حرة كافية في المجموع، لكنها في **ثقوب** صغيرة متفرقة، فيفشل طلب كبير. تخيّل 30 بايتاً حراً على هيئة ثلاثة ثقوب من 10: طلب 15 لا يمكن تلبيته.

**التصفيح يزيل التجزؤ الخارجي** لذاكرة العمليات (يصلح أي إطار حر) مقابل قليل من التجزؤ الداخلي. أما المخصِّصات التي تحتاج مناطق *متصلة* (كومة \`malloc\`، أو مجمّع مخازن النواة، أو مخططات التقسيم البسيطة) فما تزال تواجه التجزؤ الخارجي وتستخدم سياسات للوضع:

- **First-fit**: خذ أول ثقب (أدنى عنوان) يكفي. سريعة.
- **Best-fit**: خذ *أصغر* ثقب يكفي، فتبقى أكبر الثقوب سليمة. يجب أن تفحص كل الثقوب وتميل إلى ترك شظايا صغيرة جداً عديمة النفع.
- **Worst-fit**: خذ أكبر ثقب أملاً في أن يبقى الباقي مفيداً. وتؤدي عملياً أسوأ عادةً.

لا واحدة منها تفوز دائماً؛ وغالباً تكون first-fit بجودة best-fit وأسرع. و**الضغط (compaction)** (تحريك التخصيصات لتتجاور) يعالج التجزؤ الخارجي لكنه مكلف ويحتاج إلى إعادة تموضع.

### مثال كلاسيكي

الثقوب بترتيب العناوين: 100 و500 و200 و300 و600 KB. والطلبات: 212 و417 و112 و426 KB:

- **First-fit**: الطلب 212 يذهب إلى الثقب 500 (يبقى 288)، و417 إلى الثقب 600 (يبقى 183)، و112 إلى الثقب 288 (يبقى 176)، و426 **يفشل** مع أن الحر كبير في المجموع
- **Best-fit**: 212 إلى 300، و417 إلى 500، و112 إلى 200، و426 إلى 600: **كل شيء يتسع**

حاكِ مخصِّصاً كهذا في المختبر الأخير.`,
      },
    },
    {
      type: "lab",
      id: "first-fit-best-fit",
      lang: "go",
      prompt: {
        en: `Simulate a contiguous-memory allocator that serves requests with **first-fit** or **best-fit**.

**Input** (whitespace-separated tokens, spread over any number of lines):
- the policy: \`first\` or \`best\`
- \`h\`, the number of free holes, then \`h\` hole sizes **in address order** (\`h\` may be 0)
- then zero or more request sizes (positive integers) until the end of input

**Rules:**
- **first**: use the lowest-index hole whose size is at least the request.
- **best**: use the smallest hole that is big enough; on a tie take the lowest index.
- The chosen hole shrinks by the request size (a hole of size 0 stays in the list and never fits anything). Nothing is ever freed or merged.

**Output:** one line per request, \`<size> -> hole <index>\` (0-based) or \`<size> -> FAIL\`. Finish with one line \`free=<total free> largest=<largest hole>\` (both 0 when there are no holes).

**Example:** \`best\`, holes \`100 500 200 300 600\`, requests \`212 417 112 426\` print

\`\`\`
212 -> hole 3
417 -> hole 1
112 -> hole 2
426 -> hole 4
free=533 largest=174
\`\`\``,
        ar: `حاكِ مخصِّص ذاكرة متصلة يلبّي الطلبات بسياسة **first-fit** أو **best-fit**.

**المدخل** (رموز تفصل بينها مسافات بيضاء، على أي عدد من الأسطر):
- السياسة: \`first\` أو \`best\`
- \`h\`، عدد الثقوب الحرة، ثم \`h\` من أحجام الثقوب **بترتيب العناوين** (قد تكون \`h\` صفراً)
- ثم صفر أو أكثر من أحجام الطلبات (أعداد صحيحة موجبة) حتى نهاية المدخل

**القواعد:**
- **first**: استخدم الثقب ذا أدنى فهرس يكون حجمه مساوياً للطلب أو أكبر.
- **best**: استخدم أصغر ثقب يكفي؛ وعند التعادل خذ أدنى فهرس.
- يتقلص الثقب المختار بمقدار حجم الطلب (الثقب ذو الحجم 0 يبقى في القائمة ولا يتسع لشيء). لا يُحرَّر شيء ولا يُدمَج.

**المخرج:** سطر لكل طلب، \`<size> -> hole <index>\` (من الصفر) أو \`<size> -> FAIL\`. وتُنهيه بسطر \`free=<total free> largest=<largest hole>\` (كلاهما 0 إن لم توجد ثقوب).

**مثال:** \`best\` والثقوب \`100 500 200 300 600\` والطلبات \`212 417 112 426\` تطبع

\`\`\`
212 -> hole 3
417 -> hole 1
112 -> hole 2
426 -> hole 4
free=533 largest=174
\`\`\``,
      },
      starterCode: `package main

import "fmt"

// pickHole returns the index of the hole that serves a request of the given
// size under the policy ("first" or "best"), or -1 if no hole is big enough.
func pickHole(policy string, holes []int, size int) int {
	// TODO 1: first-fit - return the first index whose hole is >= size
	// TODO 2: best-fit - return the index of the smallest hole that is >= size
	//         (on a tie keep the lowest index)
	return -1
}

func main() {
	var policy string
	var h int
	if _, err := fmt.Scan(&policy, &h); err != nil {
		return
	}
	holes := make([]int, h)
	for i := range holes {
		fmt.Scan(&holes[i])
	}

	var size int
	for {
		if _, err := fmt.Scan(&size); err != nil {
			break
		}
		idx := pickHole(policy, holes, size)
		if idx < 0 {
			fmt.Printf("%d -> FAIL\\n", size)
			continue
		}
		fmt.Printf("%d -> hole %d\\n", size, idx)
		holes[idx] -= size
	}

	free, largest := 0, 0
	for _, hole := range holes {
		free += hole
		if hole > largest {
			largest = hole
		}
	}
	fmt.Printf("free=%d largest=%d\\n", free, largest)
}
`,
      solution: `package main

import "fmt"

// pickHole returns the index of the hole that serves a request of the given
// size under the policy ("first" or "best"), or -1 if no hole is big enough.
func pickHole(policy string, holes []int, size int) int {
	chosen := -1
	for i, hole := range holes {
		if hole < size {
			continue
		}
		if policy == "first" {
			return i // lowest address that fits
		}
		// best-fit: a strictly smaller hole wins, so ties keep the lowest index
		if chosen == -1 || hole < holes[chosen] {
			chosen = i
		}
	}
	return chosen
}

func main() {
	var policy string
	var h int
	if _, err := fmt.Scan(&policy, &h); err != nil {
		return
	}
	holes := make([]int, h)
	for i := range holes {
		fmt.Scan(&holes[i])
	}

	var size int
	for {
		if _, err := fmt.Scan(&size); err != nil {
			break
		}
		idx := pickHole(policy, holes, size)
		if idx < 0 {
			fmt.Printf("%d -> FAIL\\n", size)
			continue
		}
		fmt.Printf("%d -> hole %d\\n", size, idx)
		holes[idx] -= size
	}

	free, largest := 0, 0
	for _, hole := range holes {
		free += hole
		if hole > largest {
			largest = hole
		}
	}
	fmt.Printf("free=%d largest=%d\\n", free, largest)
}
`,
      hints: [
        {
          en: "Loop over the holes with their index. Skip any hole smaller than the request. For first-fit you can return the index immediately.",
          ar: "مرّ على الثقوب مع فهارسها. تجاوز أي ثقب أصغر من الطلب. وفي first-fit يمكنك إرجاع الفهرس فوراً.",
        },
        {
          en: "For best-fit remember the best index so far and replace it only when you find a strictly smaller hole that still fits. A strict '<' keeps the lowest index on ties.",
          ar: "في best-fit تذكّر أفضل فهرس حتى الآن ولا تستبدله إلا إذا وجدت ثقباً أصغر تماماً ما زال يكفي. استخدام '<' الصارمة يُبقي أدنى فهرس عند التعادل.",
        },
        {
          en: "Return -1 when nothing fits; main already prints FAIL and the final free/largest line for you.",
          ar: "أرجع -1 إذا لم يتسع شيء؛ فـ main تطبع FAIL وسطر free/largest الأخير عنك.",
        },
      ],
      tests: [
        {
          name: { en: "Classic example, best-fit", ar: "المثال الكلاسيكي، best-fit" },
          stdin: "best 5\n100 500 200 300 600\n212 417 112 426\n",
          expected: "212 -> hole 3\n417 -> hole 1\n112 -> hole 2\n426 -> hole 4\nfree=533 largest=174",
        },
        {
          name: { en: "Classic example, first-fit", ar: "المثال الكلاسيكي، first-fit" },
          stdin: "first 5\n100 500 200 300 600\n212 417 112 426\n",
          expected: "212 -> hole 1\n417 -> hole 4\n112 -> hole 1\n426 -> FAIL\nfree=959 largest=300",
        },
        {
          name: { en: "External fragmentation", ar: "التجزؤ الخارجي" },
          stdin: "first 3\n10 10 10\n15\n",
          expected: "15 -> FAIL\nfree=30 largest=10",
        },
        {
          name: { en: "Exact fit leaves an empty hole; best-fit tie", ar: "ملاءمة تامة تترك ثقباً فارغاً؛ وتعادل في best-fit" },
          stdin: "best 3\n8 4 4\n4 4 5\n",
          expected: "4 -> hole 1\n4 -> hole 2\n5 -> hole 0\nfree=3 largest=3",
        },
        {
          name: { en: "No holes at all", ar: "لا ثقوب إطلاقاً" },
          stdin: "best 0\n7\n",
          expected: "7 -> FAIL\nfree=0 largest=0",
        },
        {
          name: { en: "No requests", ar: "لا طلبات" },
          stdin: "first 2\n64 32\n",
          expected: "free=96 largest=64",
        },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: {
            en: "With 4 KiB (4096-byte) pages, what are the page number and offset of virtual address 0x3FFF?",
            ar: "مع صفحات بحجم 4 KiB (4096 بايت)، ما رقم الصفحة والإزاحة للعنوان الافتراضي 0x3FFF؟",
          },
          choices: [
            { en: "Page 0x3F, offset 0xFF", ar: "الصفحة 0x3F، الإزاحة 0xFF" },
            { en: "Page 3, offset 0xFFF", ar: "الصفحة 3، الإزاحة 0xFFF" },
            { en: "Page 4, offset 0", ar: "الصفحة 4، الإزاحة 0" },
            { en: "Page 0x3FFF, offset 0", ar: "الصفحة 0x3FFF، الإزاحة 0" },
          ],
          answer: 1,
          explain: {
            en: "4096 = 2^12, so the low 12 bits (0xFFF) are the offset and the rest (0x3) is the page number. 0x3FFF is the very last byte of page 3; the next address, 0x4000, starts page 4.",
            ar: "بما أن 4096 = 2^12 فأدنى 12 بتّاً (0xFFF) هي الإزاحة والباقي (0x3) هو رقم الصفحة. العنوان 0x3FFF هو آخر بايت في الصفحة 3؛ والعنوان التالي 0x4000 يبدأ الصفحة 4.",
          },
        },
        {
          q: { en: "What does the TLB cache?", ar: "ماذا يخزّن الـTLB مؤقتاً؟" },
          choices: [
            { en: "Recently read disk blocks", ar: "كتل القرص المقروءة حديثاً" },
            { en: "Recently executed instructions", ar: "التعليمات المنفَّذة حديثاً" },
            { en: "Recent virtual-page to physical-frame translations", ar: "ترجمات حديثة من الصفحة الافتراضية إلى الإطار الفيزيائي" },
            { en: "The contents of recently used physical frames", ar: "محتويات الإطارات الفيزيائية المستخدمة حديثاً" },
          ],
          answer: 2,
          explain: {
            en: "The TLB holds page-table entries (page to frame mappings plus permissions), so most accesses skip the multi-level page-table walk. Instructions and data are cached elsewhere, in the CPU caches.",
            ar: "يحتفظ الـTLB بمداخل جدول الصفحات (ربط الصفحة بالإطار مع الصلاحيات)، فتتجاوز معظم عمليات الوصول التجوال في جدول الصفحات متعدد المستويات. أما التعليمات والبيانات فتُخزَّن مؤقتاً في مكان آخر، في ذواكر المعالج المخبئية (CPU caches).",
          },
        },
        {
          q: { en: "What is a page fault?", ar: "ما هو خطأ الصفحة (page fault)؟" },
          choices: [
            { en: "An exception raised when a page has no usable mapping at that moment; the OS may load it and resume the program", ar: "استثناء يُرفع حين لا يكون للصفحة ربط صالح في تلك اللحظة؛ وقد يحمّلها النظام ويستأنف البرنامج" },
            { en: "A failure of a RAM chip", ar: "عطل في شريحة RAM" },
            { en: "A bug that always kills the process", ar: "علّة تقتل العملية دائماً" },
            { en: "The page table running out of entries", ar: "نفاد مداخل جدول الصفحات" },
          ],
          answer: 0,
          explain: {
            en: "Page faults are routine: demand paging, swapping and copy-on-write all rely on them. Only a fault on an invalid access (unmapped address, write to read-only memory) ends in SIGSEGV.",
            ar: "أخطاء الصفحات أمر روتيني: يعتمد عليها التصفيح عند الطلب والتبديل والنسخ عند الكتابة. وحده الخطأ الناتج عن وصول غير صالح (عنوان غير مربوط، كتابة في ذاكرة للقراءة فقط) ينتهي بـ SIGSEGV.",
          },
        },
        {
          q: { en: "Which statement about Belady's anomaly is true?", ar: "أي العبارات الآتية عن شذوذ بيلادي صحيحة؟" },
          choices: [
            { en: "LRU can show it but FIFO never does", ar: "قد تظهر مع LRU ولا تظهر مع FIFO أبداً" },
            { en: "It means a page fault takes longer when memory is nearly full", ar: "تعني أن خطأ الصفحة يستغرق وقتاً أطول حين تقارب الذاكرة الامتلاء" },
            { en: "More frames always reduce faults for every policy", ar: "زيادة الإطارات تقلّل الأخطاء دائماً مع كل سياسة" },
            { en: "With FIFO, giving a program more frames can increase its page faults", ar: "مع FIFO قد تؤدي زيادة إطارات البرنامج إلى زيادة أخطاء صفحاته" },
          ],
          answer: 3,
          explain: {
            en: "FIFO ignores how recently a page was used, so extra frames can change the eviction order for the worse (9 faults with 3 frames, 10 with 4 on the classic string). LRU and optimal are 'stack algorithms': the pages kept with n frames are always a subset of those kept with n+1.",
            ar: "تتجاهل FIFO مدى حداثة استخدام الصفحة، فقد تغيّر الإطارات الإضافية ترتيب الطرد إلى الأسوأ (9 أخطاء مع 3 إطارات و10 مع 4 على السلسلة الكلاسيكية). أما LRU والمثالية فهما 'خوارزميتا مكدّس': الصفحات المحفوظة مع n إطاراً مجموعة جزئية دائماً من المحفوظة مع n+1.",
          },
        },
        {
          q: {
            en: "A program needs 10,000 bytes and pages are 4096 bytes. How many pages does it use and how much memory is wasted?",
            ar: "يحتاج برنامج إلى 10,000 بايت وحجم الصفحة 4096 بايتاً. كم صفحة يستخدم وكم من الذاكرة يُهدَر؟",
          },
          choices: [
            { en: "2 pages, nothing wasted", ar: "صفحتان، دون هدر" },
            { en: "3 pages, 2,288 bytes of internal fragmentation", ar: "3 صفحات، و2,288 بايتاً من التجزؤ الداخلي" },
            { en: "3 pages, 4,096 bytes of external fragmentation", ar: "3 صفحات، و4,096 بايتاً من التجزؤ الخارجي" },
            { en: "4 pages, 6,384 bytes wasted", ar: "4 صفحات، و6,384 بايتاً مهدورة" },
          ],
          answer: 1,
          explain: {
            en: "ceil(10000 / 4096) = 3 pages = 12,288 bytes, so 12,288 - 10,000 = 2,288 bytes are unused in the last page. That waste is inside an allocated unit, which is internal fragmentation; paging has no external fragmentation.",
            ar: "ceil(10000 / 4096) = 3 صفحات = 12,288 بايتاً، فيبقى 12,288 - 10,000 = 2,288 بايتاً غير مستخدمة في الصفحة الأخيرة. وهذا الهدر داخل وحدة مخصَّصة، أي تجزؤ داخلي؛ والتصفيح لا يعاني من تجزؤ خارجي.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Every process has a private **virtual address space**; the **MMU** and the OS translate it to physical memory, which gives **isolation**, convenience and more address space than RAM
- **Paging**: address = page number + offset; the **page table** maps pages to **frames**; the offset is copied unchanged. Real page tables are multi-level trees, and the **TLB** caches translations
- A **page fault** is routine (demand paging, copy-on-write, swapping); an invalid access ends in **SIGSEGV**. Too much paging is **thrashing**
- **Replacement**: FIFO is simple but can suffer **Belady's anomaly**; **LRU** exploits locality; real kernels approximate it with **Clock**
- **Internal** fragmentation is waste inside blocks, **external** fragmentation is scattered holes; **first-fit** is fast, **best-fit** keeps big holes but leaves slivers
- You wrote an address translator, a FIFO vs LRU fault counter and a first-fit/best-fit allocator

**Practice:** run \`cat /proc/self/maps\` and \`free -h\` on a Linux machine, and add an *optimal* policy to the replacement lab to see how far FIFO and LRU are from the best possible. **Next:** the shell, files and permissions, or concurrency and locks.`,
        ar: `## الخلاصة

- لكل عملية **فضاء عناوين افتراضي** خاص؛ وتترجمه الـ**MMU** والنظام إلى الذاكرة الفيزيائية، وهذا يعطي **العزل** والراحة وفضاء عناوين أكبر من الـRAM
- **التصفيح**: العنوان = رقم صفحة + إزاحة؛ و**جدول الصفحات** يربط الصفحات بـ**الإطارات**؛ وتُنسخ الإزاحة كما هي. وجداول الصفحات الحقيقية أشجار متعددة المستويات، و**TLB** يخزّن الترجمات مؤقتاً
- **خطأ الصفحة** أمر روتيني (التصفيح عند الطلب، النسخ عند الكتابة، التبديل)؛ والوصول غير الصالح ينتهي بـ **SIGSEGV**. والإفراط في التصفيح هو **thrashing**
- **الاستبدال**: FIFO بسيطة لكنها قد تعاني **شذوذ بيلادي**؛ و**LRU** تستفيد من المحلية المرجعية؛ والنوى الحقيقية تقرّبها بـ**Clock**
- التجزؤ **الداخلي** هدر داخل الكتل، والتجزؤ **الخارجي** ثقوب متفرقة؛ و**first-fit** سريعة، و**best-fit** تُبقي الثقوب الكبيرة لكنها تترك شظايا
- كتبت مترجم عناوين وعدّاد أخطاء FIFO مقابل LRU ومخصِّص first-fit/best-fit

**تدرّب:** نفّذ \`cat /proc/self/maps\` و\`free -h\` على جهاز لينكس، وأضف سياسة *مثالية (optimal)* إلى مختبر الاستبدال لترى كم تبعد FIFO وLRU عن الأفضل الممكن. **التالي:** الصدفة والملفات والصلاحيات، أو التزامن والأقفال.`,
      },
    },
  ],
};
