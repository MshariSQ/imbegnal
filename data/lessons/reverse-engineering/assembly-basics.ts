import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "assembly-basics",
  title: { en: "Assembly Basics — Reading the CPU's Recipe Cards", ar: "أساسيات Assembly — قراءة بطاقات وصفات المعالج" },
  estMinutes: 46,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

By the end of this lesson you will be able to:

- Read short **x86-64** functions written in **Intel syntax** and say what they compute without running them
- Use **registers**, **memory operands**, **flags** and **conditional jumps** to follow loops and \`if\` statements
- Explain how the **stack**, \`call\` and \`ret\` work, and which registers carry arguments and results (**calling conventions**)
- Recognize the same ideas in **ARM64** assembly

## A kitchen with a tiny workbench 🧑‍🍳

Imagine a kitchen where the cook has a very small workbench with a handful of **bowls**. Every step of the recipe is a card that does one tiny thing: "put 5 in bowl A", "add the content of bowl B to bowl A", "if bowl A is empty, skip to card 12". Ingredients that do not fit on the bench live in the **pantry**, and the cook must walk there to fetch or store them.

That is a CPU. The bowls are **registers**: a few very fast slots inside the processor. The pantry is **memory**. The recipe cards are **instructions**, and the card number the cook is looking at is the **instruction pointer**. **Assembly** is simply the human-readable spelling of those cards. High-level code like \`total += i\` becomes two or three cards, and a reverse engineer's job is to read the cards and say "ah, that is a loop that adds up numbers".

Everything in this lesson uses tiny programs written for learning. You do not need to run real binaries to follow it.`,
        ar: `## ماذا ستتعلم

في نهاية هذا الدرس ستكون قادراً على:

- قراءة دوال **x86-64** قصيرة مكتوبة بـ **Intel syntax** وتحديد ما تحسبه دون تشغيلها
- استخدام **registers** و**memory operands** و**flags** و**conditional jumps** لمتابعة الحلقات وجمل \`if\`
- شرح كيف تعمل **stack** والتعليمتان \`call\` و\`ret\`، وأي registers تحمل الوسائط والنتائج (**calling conventions**)
- التعرّف على الأفكار نفسها في assembly الخاص بـ **ARM64**

## مطبخ بطاولة عمل صغيرة 🧑‍🍳

تخيّل مطبخاً فيه طاهٍ لديه طاولة عمل صغيرة جداً عليها بضع **أوعية**. كل خطوة في الوصفة بطاقة تفعل شيئاً صغيراً واحداً: "ضع 5 في الوعاء A"، "أضف محتوى الوعاء B إلى الوعاء A"، "إن كان الوعاء A فارغاً فاقفز إلى البطاقة 12". والمكونات التي لا تتسع لها الطاولة تبقى في **المخزن**، وعلى الطاهي أن يمشي إليه ليجلبها أو يحفظها.

هذا هو المعالج. الأوعية هي **registers**: خانات سريعة جداً داخل المعالج. المخزن هو **الذاكرة**. وبطاقات الوصفة هي **التعليمات (instructions)**، ورقم البطاقة التي ينظر إليها الطاهي هو **instruction pointer**. و**Assembly** مجرد الكتابة المقروءة لهذه البطاقات. كود عالي المستوى مثل \`total += i\` يصبح ببطاقتين أو ثلاث، ومهمة المهندس العكسي أن يقرأ البطاقات ويقول "آه، هذه حلقة تجمع أرقاماً".

كل ما في هذا الدرس يستخدم برامج صغيرة كُتبت للتعلّم. لا تحتاج إلى تشغيل ملفات تنفيذية حقيقية لتتابعه.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Registers, instructions and memory (x86-64, Intel syntax)

An x86-64 CPU has sixteen 64-bit general-purpose registers: \`rax\`, \`rbx\`, \`rcx\`, \`rdx\`, \`rsi\`, \`rdi\`, \`rbp\`, \`rsp\` and \`r8\` to \`r15\`. Each can be used in smaller pieces:

- \`rax\` is all 64 bits, \`eax\` the low 32 bits, \`ax\` the low 16 bits, \`al\` the low 8 bits
- \`rsp\` is the **stack pointer** and \`rbp\` is often the **frame pointer**; the others are mostly interchangeable
- \`rip\` is the instruction pointer; you cannot use it like a normal register

**Syntax.** Two spellings exist. **Intel syntax** (used in this track, and by Ghidra, IDA and \`objdump -M intel\`) writes **destination first**: \`mov rax, rbx\` copies \`rbx\` into \`rax\`. **AT&T syntax** (the default in GNU tools) reverses the order and decorates names: \`movq %rbx, %rax\`. When you read a listing, first check which one you are looking at.

The instructions you will see in almost every function:

- \`mov dst, src\`: copy. \`mov rax, 5\`, \`mov rax, rbx\`, \`mov rax, [rbx]\`
- \`add\`, \`sub\`, \`imul\`, \`and\`, \`or\`, \`xor\`, \`shl\`, \`shr\`, \`inc\`, \`dec\`, \`neg\`: arithmetic and logic on the destination
- \`xor eax, eax\`: the standard idiom for "set to zero" (shorter than \`mov eax, 0\`)
- \`lea dst, [expr]\`: **l**oad **e**ffective **a**ddress. It computes \`expr\` but **does not read memory**, so compilers also use it as a cheap calculator: \`lea eax, [rdi+rsi*4+3]\` means \`eax = rdi + rsi*4 + 3\`
- \`cmp\`, \`test\`, \`jmp\`, \`jcc\`, \`call\`, \`ret\`, \`push\`, \`pop\`: covered below

**Memory operands** use square brackets: \`[rbx]\` is "the value stored at the address in rbx", and \`[rbp-8]\` is "8 bytes below rbp", typical for a local variable. The assembler often adds a size: \`dword ptr [rbp-4]\` is a 4-byte (32-bit) access, \`qword ptr\` is 8 bytes, \`byte ptr\` is 1.

Two rules that confuse every beginner:

- Writing a **32-bit** register (\`mov eax, 1\`) **zeroes the upper 32 bits** of \`rax\`. Writing \`ax\` or \`al\` leaves the other bits alone.
- An x86 instruction can have at most **one** memory operand. To copy memory to memory you go through a register.

Here is a real function and its compilation. The C source:

\`\`\`c
int add3(int a, int b) { return a + b + 3; }
\`\`\`

Typical compiler output **without** optimization (the arguments are first saved to the stack, then reloaded):

\`\`\`
add3:
    push rbp
    mov  rbp, rsp
    mov  dword ptr [rbp-4], edi    ; save a
    mov  dword ptr [rbp-8], esi    ; save b
    mov  edx, dword ptr [rbp-4]
    mov  eax, dword ptr [rbp-8]
    add  eax, edx                  ; a + b
    add  eax, 3
    pop  rbp
    ret
\`\`\`

And **with** optimization (\`-O2\`) the whole function collapses to two instructions:

\`\`\`
add3:
    lea  eax, [rdi+rsi+3]
    ret
\`\`\`

Same behaviour, very different look. Reverse engineers read both: debug builds are noisy but literal; optimized builds are compact and clever.`,
        ar: `## Registers والتعليمات والذاكرة (‏x86-64 بـ Intel syntax)

يملك معالج x86-64 ستة عشر register عام الغرض بعرض 64 بت: ‏\`rax\` و\`rbx\` و\`rcx\` و\`rdx\` و\`rsi\` و\`rdi\` و\`rbp\` و\`rsp\` و\`r8\` حتى \`r15\`. ويمكن استخدام كل واحد منها بأجزاء أصغر:

- ‏\`rax\` كله 64 بت، و\`eax\` الـ32 بت الدنيا، و\`ax\` الـ16 بت الدنيا، و\`al\` الـ8 بت الدنيا
- ‏\`rsp\` هو **stack pointer** و\`rbp\` كثيراً ما يكون **frame pointer**؛ والباقي قابل للتبديل في الغالب
- ‏\`rip\` هو instruction pointer؛ ولا يمكنك استخدامه كـregister عادي

**الصياغة (syntax).** توجد طريقتان للكتابة. **Intel syntax** (المستخدمة في هذا المسار، وفي Ghidra وIDA و\`objdump -M intel\`) تكتب **الوجهة أولاً**: ‏\`mov rax, rbx\` تنسخ \`rbx\` إلى \`rax\`. أما **AT&T syntax** (الافتراضية في أدوات GNU) فتعكس الترتيب وتزيّن الأسماء: ‏\`movq %rbx, %rax\`. عندما تقرأ تفكيكاً، تحقق أولاً من أيهما أمامك.

التعليمات التي سترها في كل دالة تقريباً:

- ‏\`mov dst, src\`: نسخ. ‏\`mov rax, 5\` و\`mov rax, rbx\` و\`mov rax, [rbx]\`
- ‏\`add\` و\`sub\` و\`imul\` و\`and\` و\`or\` و\`xor\` و\`shl\` و\`shr\` و\`inc\` و\`dec\` و\`neg\`: حساب ومنطق على الوجهة
- ‏\`xor eax, eax\`: الصيغة المعتادة لـ"اجعله صفراً" (أقصر من \`mov eax, 0\`)
- ‏\`lea dst, [expr]\`: ‏**l**oad **e**ffective **a**ddress. تحسب \`expr\` لكنها **لا تقرأ الذاكرة**، ولذلك يستخدمها المصرِّف أيضاً كآلة حاسبة رخيصة: ‏\`lea eax, [rdi+rsi*4+3]\` تعني \`eax = rdi + rsi*4 + 3\`
- ‏\`cmp\` و\`test\` و\`jmp\` و\`jcc\` و\`call\` و\`ret\` و\`push\` و\`pop\`: نشرحها أدناه

**معاملات الذاكرة (memory operands)** تستخدم الأقواس المربعة: ‏\`[rbx]\` تعني "القيمة المخزّنة في العنوان الموجود في rbx"، و\`[rbp-8]\` تعني "8 بايت تحت rbp" وهو شائع للمتغيرات المحلية. وكثيراً ما يضيف المُجمِّع الحجم: ‏\`dword ptr [rbp-4]\` وصول بحجم 4 بايت (32 بت)، و\`qword ptr\` ‏8 بايت، و\`byte ptr\` بايت واحد.

قاعدتان تربكان كل مبتدئ:

- الكتابة في register بعرض **32 بت** (‏\`mov eax, 1\`) **تصفّر الـ32 بت العليا** من \`rax\`. أما الكتابة في \`ax\` أو \`al\` فتترك بقية البتات كما هي.
- تعليمة x86 الواحدة يمكن أن يكون فيها **معامل ذاكرة واحد** على الأكثر. ولنسخ ذاكرة إلى ذاكرة تمرّ عبر register.

هذه دالة حقيقية وتصريفها. كود C:

\`\`\`c
int add3(int a, int b) { return a + b + 3; }
\`\`\`

ناتج المصرِّف المعتاد **بدون** تحسين (تُحفظ الوسائط أولاً في stack ثم تُحمَّل من جديد):

\`\`\`
add3:
    push rbp
    mov  rbp, rsp
    mov  dword ptr [rbp-4], edi    ; save a
    mov  dword ptr [rbp-8], esi    ; save b
    mov  edx, dword ptr [rbp-4]
    mov  eax, dword ptr [rbp-8]
    add  eax, edx                  ; a + b
    add  eax, 3
    pop  rbp
    ret
\`\`\`

و**مع** التحسين (\`-O2\`) تنكمش الدالة كلها إلى تعليمتين:

\`\`\`
add3:
    lea  eax, [rdi+rsi+3]
    ret
\`\`\`

السلوك نفسه والشكل مختلف جداً. المهندس العكسي يقرأ الاثنين: النسخ غير المحسّنة مزدحمة لكنها حرفية، والمحسّنة مضغوطة وذكية.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# How the pieces of rax behave. Python integers stand in for the 64-bit register.
MASK64 = (1 << 64) - 1

rax = 0x1122334455667788
print("rax =", hex(rax))
print("eax =", hex(rax & 0xFFFFFFFF))   # low 32 bits
print("ax  =", hex(rax & 0xFFFF))       # low 16 bits
print("al  =", hex(rax & 0xFF))         # low 8 bits
print("ah  =", hex((rax >> 8) & 0xFF))  # bits 8-15

# mov eax, 1   -> writing a 32-bit register ZEROES the upper half
rax = 1
print("after mov eax, 1 :", hex(rax))

# mov al, 0xFF -> writing an 8-bit register keeps the other bits
rax = 0x1122334455667788
rax = (rax & ~0xFF & MASK64) | 0xFF
print("after mov al, 0xFF:", hex(rax))

# Two's complement: the same 64 bits can be read as a signed number
rax = MASK64                              # all bits set
signed = rax - (1 << 64) if rax >> 63 else rax
print("0xFFFFFFFFFFFFFFFF as signed:", signed)`,
      explanation: {
        en: "Run it and compare the three printed lines about writes. Then change `mov al, 0xFF` to a 16-bit write (mask `0xFFFF`) and predict the output before you run. The last lines show why a reverse engineer must always ask whether a value is signed or unsigned: the bits do not say.",
        ar: "شغّله وقارن بين الأسطر الثلاثة المطبوعة عن الكتابة. ثم غيّر `mov al, 0xFF` إلى كتابة 16 بت (القناع `0xFFFF`) وتوقّع الناتج قبل التشغيل. الأسطر الأخيرة توضح لماذا يجب على المهندس العكسي أن يسأل دائماً هل القيمة بإشارة أم بدونها: البتات لا تخبرك.",
      },
    },
    {
      type: "lab",
      id: "emulate-listing",
      lang: "python",
      prompt: {
        en: `## Emulate a listing

The fastest way to understand assembly is to be the CPU. Write a tiny emulator for straight-line code and report what the function returns.

The input is a listing, one instruction per line. Every register is 64 bits wide and starts at 0. The registers are \`rax\`, \`rbx\`, \`rcx\`, \`rdx\`, \`rsi\` and \`rdi\`.

- Text after \`;\` is a comment, blank lines are ignored, and mnemonics and registers are case-insensitive.
- Operands are separated by a comma. A source operand is a register or an integer immediate (decimal such as \`-5\`, or hex such as \`0xff\`).
- Instructions: \`mov\`, \`add\`, \`sub\`, \`imul\`, \`and\`, \`or\`, \`xor\` (two operands: \`op dst, src\`), \`shl\` and \`shr\` (\`op dst, count\` with an immediate count from 0 to 63; \`shr\` is a logical shift), \`inc\`, \`dec\`, \`neg\` (one operand), and \`ret\`.
- All arithmetic wraps around modulo 2^64.
- Execution stops at the first \`ret\` (or at the end of the listing). Print \`rax\` as a **signed** decimal number: \`rax = <value>\`.

**Example**

Input:

\`\`\`
mov rax, 7
imul rax, 5     ; rax = 35
add rax, 3
ret
\`\`\`

Output:

\`\`\`
rax = 38
\`\`\``,
        ar: `## حاكِ تنفيذ قائمة تعليمات

أسرع طريقة لفهم assembly أن تكون أنت المعالج. اكتب محاكياً صغيراً للكود المتسلسل وأخبرنا ماذا ترجع الدالة.

المدخل قائمة تعليمات، تعليمة في كل سطر. كل register بعرض 64 بت ويبدأ بصفر. الـregisters هي \`rax\` و\`rbx\` و\`rcx\` و\`rdx\` و\`rsi\` و\`rdi\`.

- النص بعد \`;\` تعليق، والأسطر الفارغة تُتجاهل، وأسماء التعليمات والـregisters غير حساسة لحالة الأحرف.
- تُفصل المعاملات بفاصلة. المعامل المصدر register أو عدد صحيح فوري (عشري مثل \`-5\` أو hex مثل \`0xff\`).
- التعليمات: ‏\`mov\` و\`add\` و\`sub\` و\`imul\` و\`and\` و\`or\` و\`xor\` (معاملان: \`op dst, src\`)، و\`shl\` و\`shr\` (‏\`op dst, count\` بعدد فوري من 0 إلى 63؛ و\`shr\` إزاحة منطقية)، و\`inc\` و\`dec\` و\`neg\` (معامل واحد)، و\`ret\`.
- كل العمليات الحسابية تلتف modulo 2^64.
- يتوقف التنفيذ عند أول \`ret\` (أو عند نهاية القائمة). اطبع \`rax\` كعدد عشري **بإشارة**: ‏\`rax = <value>\`.

**مثال**

المدخل:

\`\`\`
mov rax, 7
imul rax, 5     ; rax = 35
add rax, 3
ret
\`\`\`

المخرج:

\`\`\`
rax = 38
\`\`\``,
      },
      starterCode: `import sys

MASK = (1 << 64) - 1
regs = {name: 0 for name in ("rax", "rbx", "rcx", "rdx", "rsi", "rdi")}


def value(operand):
    """The content of a register, or an immediate as an unsigned 64-bit number."""
    return regs[operand] if operand in regs else int(operand, 0) & MASK


def to_signed(v):
    return v - (1 << 64) if v >> 63 else v


for raw in sys.stdin:
    # TODO 1: strip the comment (everything after ";"), the spaces, and lower-case the line.
    # TODO 2: split it into the mnemonic and the comma-separated operands; skip blank lines.
    # TODO 3: stop at "ret"; otherwise update regs[dst] for mov/add/sub/imul/and/or/xor/shl/shr/inc/dec/neg.
    #         Keep every result inside 64 bits with "& MASK".
    pass

print("rax =", to_signed(regs["rax"]))
`,
      solution: `import sys

MASK = (1 << 64) - 1
regs = {name: 0 for name in ("rax", "rbx", "rcx", "rdx", "rsi", "rdi")}


def value(operand):
    """The content of a register, or an immediate as an unsigned 64-bit number."""
    return regs[operand] if operand in regs else int(operand, 0) & MASK


def to_signed(v):
    return v - (1 << 64) if v >> 63 else v


for raw in sys.stdin:
    line = raw.split(";")[0].strip().lower()
    if not line:
        continue
    mnemonic, _, rest = line.partition(" ")
    ops = [o.strip() for o in rest.split(",")] if rest.strip() else []
    if mnemonic == "ret":
        break
    dst = ops[0]
    if mnemonic == "mov":
        regs[dst] = value(ops[1])
    elif mnemonic == "add":
        regs[dst] = (regs[dst] + value(ops[1])) & MASK
    elif mnemonic == "sub":
        regs[dst] = (regs[dst] - value(ops[1])) & MASK
    elif mnemonic == "imul":
        regs[dst] = (regs[dst] * value(ops[1])) & MASK
    elif mnemonic == "and":
        regs[dst] &= value(ops[1])
    elif mnemonic == "or":
        regs[dst] |= value(ops[1])
    elif mnemonic == "xor":
        regs[dst] ^= value(ops[1])
    elif mnemonic == "shl":
        regs[dst] = (regs[dst] << int(ops[1], 0)) & MASK
    elif mnemonic == "shr":
        regs[dst] >>= int(ops[1], 0)  # registers are kept unsigned, so this is a logical shift
    elif mnemonic == "inc":
        regs[dst] = (regs[dst] + 1) & MASK
    elif mnemonic == "dec":
        regs[dst] = (regs[dst] - 1) & MASK
    elif mnemonic == "neg":
        regs[dst] = (-regs[dst]) & MASK

print("rax =", to_signed(regs["rax"]))
`,
      hints: [
        { en: "Clean each line first: \`raw.split(\";\")[0].strip().lower()\`. If nothing is left, \`continue\`.", ar: "نظّف كل سطر أولاً: \`raw.split(\";\")[0].strip().lower()\`. وإن لم يتبقَّ شيء فاستخدم \`continue\`." },
        { en: "\`line.partition(\" \")\` splits the mnemonic from the rest; then split the rest on commas. Use the helper \`value()\` for the source operand so registers and immediates work the same way.", ar: "الدالة \`line.partition(\" \")\` تفصل اسم التعليمة عن الباقي؛ ثم قسّم الباقي عند الفواصل. استخدم الدالة المساعدة \`value()\` للمعامل المصدر ليعمل الـregister والعدد الفوري بالطريقة نفسها." },
        { en: "Registers are stored as unsigned numbers. Wrap results with \`& MASK\` (Python's \`-3 & MASK\` gives the 64-bit pattern of -3), and only convert to signed when printing.", ar: "تُخزَّن الـregisters كأعداد بدون إشارة. لُفّ النتائج بـ \`& MASK\` (الناتج \`-3 & MASK\` في Python هو نمط الـ64 بت للعدد -3)، ولا تحوّلها إلى عدد بإشارة إلا عند الطباعة." },
      ],
      tests: [
        { name: { en: "The worked example: 7 * 5 + 3", ar: "المثال المحلول: 7 * 5 + 3" }, stdin: `mov rax, 7
imul rax, 5     ; rax = 35
add rax, 3
ret
`, expected: `rax = 38
` },
        { name: { en: "Comments, blank lines, upper case, hex, and/or", ar: "تعليقات وأسطر فارغة وأحرف كبيرة وhex وand/or" }, stdin: `; compute (0xff & 0x3c) | 1
MOV RAX, 0xFF
AND RAX, 0x3c

or rax, 1   ; set the lowest bit
ret
`, expected: `rax = 61
` },
        { name: { en: "Register-to-register operations and a negative result", ar: "عمليات بين registers ونتيجة سالبة" }, stdin: `xor rcx, rcx
mov rax, 5
mov rbx, 8
sub rax, rbx      ; -3
imul rax, rbx     ; -24
add rax, rcx
ret
`, expected: `rax = -24
` },
        { name: { en: "Wrap-around: the largest signed value plus one", ar: "الالتفاف: أكبر قيمة بإشارة زائد واحد" }, stdin: `mov rax, 0x7fffffffffffffff
inc rax
ret
`, expected: `rax = -9223372036854775808
` },
        { name: { en: "Shifts, and nothing runs after ret", ar: "الإزاحات، ولا شيء يُنفَّذ بعد ret" }, stdin: `mov rax, 1
shl rax, 40
mov rbx, rax
shr rbx, 38
add rax, rbx
neg rdx
ret
mov rax, 99
`, expected: `rax = 1099511627780
` },
        { name: { en: "Empty listing: every register is zero", ar: "قائمة فارغة: كل الـregisters تساوي صفراً" }, stdin: "", expected: `rax = 0
` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Flags and jumps: how \`if\` and \`while\` look in assembly

A CPU has no \`if\` or \`while\`. It has **flags** and **jumps**.

Most arithmetic instructions leave a trace in the **FLAGS register**. The ones you need first:

- **ZF** (zero flag): the result was zero
- **SF** (sign flag): the top bit of the result is 1 (negative as a signed number)
- **CF** (carry flag): an unsigned carry or borrow happened
- **OF** (overflow flag): a signed overflow happened

The workhorse pair is **compare, then jump**:

- \`cmp a, b\` computes \`a - b\`, **throws the result away** and keeps only the flags
- \`test a, b\` computes \`a AND b\` and keeps the flags. \`test eax, eax\` is the idiom for "is eax zero (or negative)?"
- \`jmp label\` always jumps. \`jcc label\` jumps only if the condition holds

Memorize the conditions after \`cmp a, b\`:

- \`je\` / \`jz\`: equal (a == b), \`jne\` / \`jnz\`: not equal
- **Signed**: \`jl\` (a < b), \`jle\`, \`jg\` (a > b), \`jge\`
- **Unsigned**: \`jb\` (below), \`jbe\`, \`ja\` (above), \`jae\`

The signed and unsigned families exist because the same bits mean different things: the byte \`0xFF\` is 255 unsigned but -1 signed. When you see \`jl\` or \`jg\` the compiler saw **signed** types (such as \`int\`), and \`jb\` or \`ja\` means **unsigned** types or pointers. That is a free hint about the original source.

Now a loop. The C function adds the numbers from 1 to n:

\`\`\`c
long sum_to(long n) {
    long total = 0;
    while (n != 0) { total += n; n--; }
    return total;
}
\`\`\`

In assembly (n arrives in \`rdi\`, the result leaves in \`rax\`):

\`\`\`
sum_to:
    xor  eax, eax        ; total = 0
.loop:
    test rdi, rdi        ; n == 0 ?
    jz   .done           ; yes: leave the loop
    add  rax, rdi        ; total += n
    dec  rdi             ; n--
    jmp  .loop           ; go back to the test
.done:
    ret
\`\`\`

The pattern to recognize: a **label** that is jumped back to (a loop), a **compare or test followed by a conditional jump** (the loop condition), and a body in between. A forward jump that skips a few instructions is an \`if\`. Draw arrows from every jump to its target and the program's shape appears.`,
        ar: `## Flags والقفزات: كيف تبدو \`if\` و\`while\` في assembly

المعالج لا يعرف \`if\` ولا \`while\`. لديه **flags** و**قفزات (jumps)**.

معظم التعليمات الحسابية تترك أثراً في **سجل FLAGS**. أهمّها في البداية:

- **ZF** (zero flag): كانت النتيجة صفراً
- **SF** (sign flag): البت الأعلى في النتيجة يساوي 1 (سالب كعدد بإشارة)
- **CF** (carry flag): حدث carry أو borrow لأعداد بدون إشارة
- **OF** (overflow flag): حدث تجاوز (overflow) لأعداد بإشارة

والثنائي الأساسي هو **قارن ثم اقفز**:

- ‏\`cmp a, b\` تحسب \`a - b\` و**ترمي الناتج** وتحتفظ بالـflags فقط
- ‏\`test a, b\` تحسب \`a AND b\` وتحتفظ بالـflags. و\`test eax, eax\` هي الصيغة المعتادة لسؤال "هل eax صفر (أو سالب)؟"
- ‏\`jmp label\` تقفز دائماً. و\`jcc label\` تقفز فقط إذا تحقق الشرط

احفظ الشروط بعد \`cmp a, b\`:

- ‏\`je\` / \`jz\`: متساويان (a == b)، و\`jne\` / \`jnz\`: غير متساويين
- **بإشارة (signed)**: ‏\`jl\` (a < b) و\`jle\` و\`jg\` (a > b) و\`jge\`
- **بدون إشارة (unsigned)**: ‏\`jb\` (below) و\`jbe\` و\`ja\` (above) و\`jae\`

وُجدت العائلتان لأن البتات نفسها تعني أشياء مختلفة: البايت \`0xFF\` يساوي 255 بدون إشارة و-1 بإشارة. عندما ترى \`jl\` أو \`jg\` فالمصرِّف رأى أنواعاً **بإشارة** (مثل \`int\`)، وعندما ترى \`jb\` أو \`ja\` فالأنواع **بدون إشارة** أو مؤشرات. وهذا تلميح مجاني عن الكود الأصلي.

والآن حلقة. دالة C هذه تجمع الأعداد من 1 إلى n:

\`\`\`c
long sum_to(long n) {
    long total = 0;
    while (n != 0) { total += n; n--; }
    return total;
}
\`\`\`

وفي assembly (يصل n في \`rdi\` وتخرج النتيجة في \`rax\`):

\`\`\`
sum_to:
    xor  eax, eax        ; total = 0
.loop:
    test rdi, rdi        ; n == 0 ?
    jz   .done           ; yes: leave the loop
    add  rax, rdi        ; total += n
    dec  rdi             ; n--
    jmp  .loop           ; go back to the test
.done:
    ret
\`\`\`

النمط الذي يجب أن تتعرّف عليه: **label** تُعاد القفزة إليه (حلقة)، و**مقارنة أو test يتبعها قفز مشروط** (شرط الحلقة)، وجسم بينهما. أما القفز للأمام فوق بضع تعليمات فهو \`if\`. ارسم أسهماً من كل قفزة إلى هدفها وسيظهر شكل البرنامج.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// What does "cmp a, b" do to the flags? Emulated on 8-bit values.
function cmp8(a, b) {
  const result = (a - b) & 0xff;
  const sa = (a << 24) >> 24;            // a viewed as a signed byte
  const sb = (b << 24) >> 24;
  const diff = sa - sb;
  return {
    ZF: result === 0,
    SF: (result & 0x80) !== 0,
    CF: a < b,                           // unsigned borrow
    OF: diff < -128 || diff > 127,       // signed overflow
    sa, sb,
  };
}

const pairs = [[5, 5], [3, 200], [127, 255], [0x80, 1]];
for (const [a, b] of pairs) {
  const f = cmp8(a, b);
  const jl = f.SF !== f.OF;              // signed "less": SF != OF
  const jb = f.CF;                       // unsigned "below": CF
  console.log(
    "cmp " + a + ", " + b + "  signed view: " + f.sa + " vs " + f.sb +
    "  | je:" + f.ZF + "  jl:" + jl + "  jb:" + jb
  );
}`,
      explanation: {
        en: "Look at the last two pairs: `127 vs 255` is *below* as unsigned numbers but not *less* as signed ones (127 > -1), and `0x80 vs 1` is the reverse. Same bits, same `cmp`, different jump. Add your own pair and predict `jl` and `jb` before you run.",
        ar: "انظر إلى آخر زوجين: ‏`127 مقابل 255` هو *below* كأعداد بدون إشارة لكنه ليس *less* كأعداد بإشارة (127 > -1)، و`0x80 مقابل 1` عكس ذلك. البتات نفسها و`cmp` نفسها والقفزة مختلفة. أضف زوجاً من عندك وتوقّع `jl` و`jb` قبل التشغيل.",
      },
    },
    {
      type: "lab",
      id: "loop-jumps",
      lang: "python",
      prompt: {
        en: `## Add labels, flags and jumps

Extend the emulator so it can run **loops**. The arithmetic part is already written in the starter code (it is your solution of the previous lab in compact form). You add labels, the flags and the jumps.

New rules:

- A line ending with \`:\` is a **label** (for example \`top:\`). It is not an instruction and costs no step.
- \`cmp a, b\` sets the flags from \`a - b\` without changing a register. \`add\`, \`sub\`, \`and\`, \`or\`, \`xor\`, \`inc\`, \`dec\` and \`neg\` set the flags from their result. In this toy machine **no other instruction touches the flags**.
- Flags: **ZF** = the result is zero, **SF** = the result is negative (as a signed 64-bit number).
- Jumps: \`jmp\`; \`je\`/\`jz\` (ZF); \`jne\`/\`jnz\` (not ZF); \`jl\` (SF); \`jge\` (not SF); \`jle\` (ZF or SF); \`jg\` (not ZF and not SF). The target is a label name. (Real CPUs also look at OF; in these programs values stay small, so you may ignore it.)
- Execution starts at the first instruction and stops at \`ret\` or when it runs past the last instruction.
- Count **executed** instructions (\`ret\` counts, labels do not). If a program would execute more than **10000** instructions, print just \`step limit exceeded\`.

Otherwise print two lines: \`rax = <signed value>\` and \`steps = <count>\`.

**Example**

Input:

\`\`\`
mov rcx, 3
again:
dec rcx
jnz again
ret
\`\`\`

Output:

\`\`\`
rax = 0
steps = 8
\`\`\`

(\`mov\` once, then \`dec\` and \`jnz\` three times each, then \`ret\`: 1 + 6 + 1 = 8.)`,
        ar: `## أضف labels وflags وقفزات

وسّع المحاكي ليتمكن من تشغيل **الحلقات**. الجزء الحسابي مكتوب أصلاً في الكود الابتدائي (هو حلّ التمرين السابق بصيغة مختصرة). أنت تضيف الـlabels والـflags والقفزات.

القواعد الجديدة:

- السطر الذي ينتهي بـ \`:\` هو **label** (مثل \`top:\`). ليس تعليمة ولا يُحسب كخطوة.
- ‏\`cmp a, b\` تضبط الـflags من \`a - b\` دون تغيير أي register. و\`add\` و\`sub\` و\`and\` و\`or\` و\`xor\` و\`inc\` و\`dec\` و\`neg\` تضبط الـflags من نتيجتها. في هذه الآلة المبسّطة **لا تمسّ أي تعليمة أخرى الـflags**.
- الـflags: ‏**ZF** = النتيجة صفر، **SF** = النتيجة سالبة (كعدد 64 بت بإشارة).
- القفزات: ‏\`jmp\`؛ و\`je\`/\`jz\` (‏ZF)؛ و\`jne\`/\`jnz\` (ليس ZF)؛ و\`jl\` (‏SF)؛ و\`jge\` (ليس SF)؛ و\`jle\` (‏ZF أو SF)؛ و\`jg\` (ليس ZF وليس SF). الهدف اسم label. (المعالجات الحقيقية تنظر أيضاً إلى OF؛ هنا تبقى القيم صغيرة فيمكنك تجاهلها.)
- يبدأ التنفيذ من أول تعليمة ويتوقف عند \`ret\` أو عند تجاوز آخر تعليمة.
- عُدّ التعليمات **المنفَّذة** (‏\`ret\` تُحسب، والـlabels لا). إن كان البرنامج سينفّذ أكثر من **10000** تعليمة فاطبع \`step limit exceeded\` فقط.

وإلا فاطبع سطرين: ‏\`rax = <signed value>\` و\`steps = <count>\`.

**مثال**

المدخل:

\`\`\`
mov rcx, 3
again:
dec rcx
jnz again
ret
\`\`\`

المخرج:

\`\`\`
rax = 0
steps = 8
\`\`\`

(‏\`mov\` مرة، ثم \`dec\` و\`jnz\` ثلاث مرات لكل منهما، ثم \`ret\`: ‏1 + 6 + 1 = 8.)`,
      },
      starterCode: `import sys

MASK = (1 << 64) - 1
LIMIT = 10000
regs = {name: 0 for name in ("rax", "rbx", "rcx", "rdx", "rsi", "rdi")}
flags = {"zf": False, "sf": False}


def value(operand):
    return regs[operand] if operand in regs else int(operand, 0) & MASK


def to_signed(v):
    return v - (1 << 64) if v >> 63 else v


def set_flags(result):
    flags["zf"] = result == 0
    flags["sf"] = bool(result >> 63)


def arithmetic(mnemonic, ops):
    """Executes one non-jump instruction and sets the flags like the real CPU would."""
    dst = ops[0]
    if mnemonic == "mov":
        regs[dst] = value(ops[1])
        return
    if mnemonic == "imul":
        regs[dst] = (regs[dst] * value(ops[1])) & MASK
        return
    src = value(ops[1]) if len(ops) > 1 else 1
    if mnemonic in ("add", "inc"):
        result = (regs[dst] + src) & MASK
    elif mnemonic in ("sub", "dec"):
        result = (regs[dst] - src) & MASK
    elif mnemonic == "neg":
        result = (-regs[dst]) & MASK
    elif mnemonic == "and":
        result = regs[dst] & src
    elif mnemonic == "or":
        result = regs[dst] | src
    else:  # xor
        result = regs[dst] ^ src
    regs[dst] = result
    set_flags(result)


program = []   # list of (mnemonic, operands)
labels = {}    # label name -> index into program
for raw in sys.stdin:
    line = raw.split(";")[0].strip().lower()
    if not line:
        continue
    # TODO 1: a line that ends with ":" is a label: remember len(program) under its name.
    mnemonic, _, rest = line.partition(" ")
    ops = [o.strip() for o in rest.split(",")] if rest.strip() else []
    program.append((mnemonic, ops))

# TODO 2: run the program with a program counter "pc" and a step counter.
# TODO 3: "cmp" sets the flags from (a - b) & MASK; jumps read the flags and set pc to labels[target].
# TODO 4: stop at "ret" or past the end; if steps would exceed LIMIT print "step limit exceeded" and exit.

print("rax =", to_signed(regs["rax"]))
print("steps = 0")
`,
      solution: `import sys

MASK = (1 << 64) - 1
LIMIT = 10000
regs = {name: 0 for name in ("rax", "rbx", "rcx", "rdx", "rsi", "rdi")}
flags = {"zf": False, "sf": False}


def value(operand):
    return regs[operand] if operand in regs else int(operand, 0) & MASK


def to_signed(v):
    return v - (1 << 64) if v >> 63 else v


def set_flags(result):
    flags["zf"] = result == 0
    flags["sf"] = bool(result >> 63)


def arithmetic(mnemonic, ops):
    """Executes one non-jump instruction and sets the flags like the real CPU would."""
    dst = ops[0]
    if mnemonic == "mov":
        regs[dst] = value(ops[1])
        return
    if mnemonic == "imul":
        regs[dst] = (regs[dst] * value(ops[1])) & MASK
        return
    src = value(ops[1]) if len(ops) > 1 else 1
    if mnemonic in ("add", "inc"):
        result = (regs[dst] + src) & MASK
    elif mnemonic in ("sub", "dec"):
        result = (regs[dst] - src) & MASK
    elif mnemonic == "neg":
        result = (-regs[dst]) & MASK
    elif mnemonic == "and":
        result = regs[dst] & src
    elif mnemonic == "or":
        result = regs[dst] | src
    else:  # xor
        result = regs[dst] ^ src
    regs[dst] = result
    set_flags(result)


# Conditions of the jumps, as functions of the two flags.
CONDITIONS = {
    "jmp": lambda: True,
    "je": lambda: flags["zf"],
    "jz": lambda: flags["zf"],
    "jne": lambda: not flags["zf"],
    "jnz": lambda: not flags["zf"],
    "jl": lambda: flags["sf"],
    "jge": lambda: not flags["sf"],
    "jle": lambda: flags["zf"] or flags["sf"],
    "jg": lambda: not flags["zf"] and not flags["sf"],
}

program = []   # list of (mnemonic, operands)
labels = {}    # label name -> index into program
for raw in sys.stdin:
    line = raw.split(";")[0].strip().lower()
    if not line:
        continue
    if line.endswith(":"):
        labels[line[:-1]] = len(program)  # the label points at the NEXT instruction
        continue
    mnemonic, _, rest = line.partition(" ")
    ops = [o.strip() for o in rest.split(",")] if rest.strip() else []
    program.append((mnemonic, ops))

pc = 0
steps = 0
while pc < len(program):
    mnemonic, ops = program[pc]
    steps += 1
    if steps > LIMIT:
        print("step limit exceeded")
        sys.exit(0)
    if mnemonic == "ret":
        break
    pc += 1
    if mnemonic == "cmp":
        set_flags((value(ops[0]) - value(ops[1])) & MASK)
    elif mnemonic in CONDITIONS:
        if CONDITIONS[mnemonic]():
            pc = labels[ops[0]]
    else:
        arithmetic(mnemonic, ops)

print("rax =", to_signed(regs["rax"]))
print("steps =", steps)
`,
      hints: [
        { en: "While reading, when a line ends with \`:\` store \`labels[line[:-1]] = len(program)\` and \`continue\`: a label points at the next instruction that will be appended.", ar: "أثناء القراءة، عندما ينتهي السطر بـ \`:\` خزّن \`labels[line[:-1]] = len(program)\` ثم \`continue\`: الـlabel يشير إلى التعليمة التالية التي ستُضاف." },
        { en: "Run with \`pc = 0\` and \`while pc < len(program)\`. Increase \`pc\` by one before executing a jump, and overwrite it only when the jump is taken. Count a step for every instruction you start, including \`ret\`.", ar: "شغّل بـ \`pc = 0\` و\`while pc < len(program)\`. زد \`pc\` بواحد قبل تنفيذ القفزة، واستبدله فقط عندما تُنفَّذ القفزة. عُدّ خطوة لكل تعليمة تبدأها، ومنها \`ret\`." },
        { en: "\`cmp a, b\` is \`set_flags((value(a) - value(b)) & MASK)\`. The step limit is exceeded when \`steps\` becomes 10001, so exactly 10000 steps is still fine.", ar: "‏\`cmp a, b\` هي \`set_flags((value(a) - value(b)) & MASK)\`. يتجاوز البرنامج الحد عندما تصبح \`steps\` تساوي 10001، فبلوغ 10000 خطوة بالضبط ما زال مقبولاً." },
      ],
      tests: [
        { name: { en: "The worked example: a countdown loop", ar: "المثال المحلول: حلقة عدّ تنازلي" }, stdin: `mov rcx, 3
again:
dec rcx
jnz again
ret
`, expected: `rax = 0
steps = 8
` },
        { name: { en: "sum_to(5) with cmp and je", ar: "الدالة sum_to(5) باستخدام cmp وje" }, stdin: `mov rdi, 5
xor rax, rax
top:
cmp rdi, 0
je done
add rax, rdi
dec rdi
jmp top
done:
ret
`, expected: `rax = 15
steps = 30
` },
        { name: { en: "Factorial of 6 with a do-while loop", ar: "مضروب 6 بحلقة do-while" }, stdin: `mov rcx, 6
mov rax, 1
again:
imul rax, rcx
dec rcx
jnz again
ret
`, expected: `rax = 720
steps = 21
` },
        { name: { en: "Signed comparison: max(-7, 3) with a forward jump", ar: "مقارنة بإشارة: max(-7, 3) مع قفزة للأمام" }, stdin: `mov rax, -7
mov rbx, 3
cmp rax, rbx
jge keep
mov rax, rbx
keep:
ret
`, expected: `rax = 3
steps = 6
` },
        { name: { en: "An endless loop hits the step limit", ar: "حلقة لا نهائية تصل إلى حد الخطوات" }, stdin: `spin:
jmp spin
`, expected: `step limit exceeded
` },
        { name: { en: "Boundary: exactly 10000 steps is allowed", ar: "حد فاصل: 10000 خطوة بالضبط مسموحة" }, stdin: `mov rcx, 4999
l:
dec rcx
jnz l
ret
`, expected: `rax = 0
steps = 10000
` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## The stack, \`call\` and \`ret\`, and calling conventions

A function needs somewhere to keep temporary values and, above all, to remember **where to come back to**. That place is the **stack**: a region of memory that grows toward **lower addresses**, with \`rsp\` pointing at its top.

- \`push x\`: \`rsp\` decreases by 8, then \`x\` is stored at \`[rsp]\`
- \`pop x\`: the value at \`[rsp]\` is loaded into \`x\`, then \`rsp\` increases by 8
- \`call target\`: pushes the **return address** (the address of the next instruction) and jumps to \`target\`
- \`ret\`: pops the top of the stack into \`rip\`, so execution continues at whatever address was on top

That last line is the key to many bugs and attacks: \`ret\` trusts the top of the stack completely. If a function pushes something and forgets to pop it, or if data overwrites the saved return address, \`ret\` jumps to the wrong place. Understanding this is the first step to understanding stack-based vulnerabilities defensively, and the next lab shows the safe, simulated version of what happens.

A **stack frame** is the slice of stack one function call uses: the return address, saved registers and local variables. Unoptimized code builds it with the classic **prologue** and tears it down with an **epilogue**:

\`\`\`
    push rbp            ; save the caller's frame pointer
    mov  rbp, rsp       ; rbp now marks the base of this frame
    sub  rsp, 32        ; reserve room for locals (locals live at [rbp-8], [rbp-16], ...)
    ...
    leave               ; = mov rsp, rbp ; pop rbp
    ret
\`\`\`

Optimized code often skips the frame pointer and addresses locals relative to \`rsp\` instead, so do not rely on seeing \`push rbp\`.

**Calling conventions** are the agreement on where arguments and results travel. On **64-bit Linux, macOS and BSD** (the System V AMD64 ABI):

- integer and pointer arguments go in \`rdi\`, \`rsi\`, \`rdx\`, \`rcx\`, \`r8\`, \`r9\`, in that order; more arguments go on the stack
- the result comes back in \`rax\`
- \`rbx\`, \`rbp\` and \`r12\` to \`r15\` are **callee-saved** (a function must restore them); the other registers may be changed freely by a call

On **64-bit Windows** the first four integer arguments use \`rcx\`, \`rdx\`, \`r8\`, \`r9\` instead. When you open an unknown function, the first question is "which registers does it read before writing them?": those are its arguments. The second is "what is in \`rax\` at \`ret\`?": that is its result.

Example: a function that starts with \`lea eax, [rdi+rsi]\` reads \`rdi\` and \`rsi\` before writing them, so on Linux it takes at least two arguments, and it returns their sum in \`eax\`.`,
        ar: `## الـstack وتعليمتا \`call\` و\`ret\` وconventions الاستدعاء

تحتاج الدالة إلى مكان تحفظ فيه قيماً مؤقتة، وقبل كل شيء تتذكّر فيه **أين تعود**. هذا المكان هو **الـstack**: منطقة من الذاكرة تنمو باتجاه **العناوين الأدنى**، ويشير \`rsp\` إلى قمتها.

- ‏\`push x\`: ينقص \`rsp\` بمقدار 8 ثم تُخزَّن \`x\` في \`[rsp]\`
- ‏\`pop x\`: تُحمَّل القيمة الموجودة في \`[rsp]\` إلى \`x\` ثم يزيد \`rsp\` بمقدار 8
- ‏\`call target\`: تدفع **عنوان العودة** (عنوان التعليمة التالية) وتقفز إلى \`target\`
- ‏\`ret\`: تسحب قمة الـstack إلى \`rip\` فيستمر التنفيذ عند أي عنوان كان في القمة

هذا السطر الأخير مفتاح كثير من الأخطاء والهجمات: ‏\`ret\` تثق تماماً بقمة الـstack. إن دفعت دالة شيئاً ونسيت سحبه، أو كتبت بيانات فوق عنوان العودة المحفوظ، فستقفز \`ret\` إلى المكان الخطأ. فهم هذا هو الخطوة الأولى لفهم ثغرات الـstack من منظور دفاعي، والتمرين التالي يعرض النسخة الآمنة المحاكاة لما يحدث.

**الـstack frame** هو الشريحة من الـstack التي يستخدمها استدعاء دالة واحد: عنوان العودة والـregisters المحفوظة والمتغيرات المحلية. الكود غير المحسّن يبنيه بـ**prologue** الكلاسيكي ويهدمه بـ**epilogue**:

\`\`\`
    push rbp            ; save the caller's frame pointer
    mov  rbp, rsp       ; rbp now marks the base of this frame
    sub  rsp, 32        ; reserve room for locals (locals live at [rbp-8], [rbp-16], ...)
    ...
    leave               ; = mov rsp, rbp ; pop rbp
    ret
\`\`\`

الكود المحسّن كثيراً ما يتخطى frame pointer ويصل إلى المتغيرات المحلية بالنسبة إلى \`rsp\`، فلا تعتمد على رؤية \`push rbp\`.

**Calling conventions** هي الاتفاق على المكان الذي تنتقل عبره الوسائط والنتائج. في **Linux وmacOS وBSD بـ64 بت** (‏System V AMD64 ABI):

- وسائط الأعداد الصحيحة والمؤشرات تذهب في \`rdi\` ثم \`rsi\` ثم \`rdx\` ثم \`rcx\` ثم \`r8\` ثم \`r9\` بهذا الترتيب؛ والوسائط الزائدة تذهب في الـstack
- النتيجة تعود في \`rax\`
- ‏\`rbx\` و\`rbp\` و\`r12\` حتى \`r15\` هي **callee-saved** (يجب أن تعيدها الدالة كما كانت)؛ أما بقية الـregisters فيمكن للاستدعاء تغييرها بحرية

وفي **Windows بـ64 بت** تستخدم أول أربعة وسائط من الأعداد الصحيحة \`rcx\` و\`rdx\` و\`r8\` و\`r9\`. عندما تفتح دالة مجهولة، السؤال الأول هو "أي registers تقرؤها قبل أن تكتب فيها؟": تلك هي وسائطها. والثاني "ماذا يوجد في \`rax\` عند \`ret\`؟": تلك هي نتيجتها.

مثال: دالة تبدأ بـ \`lea eax, [rdi+rsi]\` تقرأ \`rdi\` و\`rsi\` قبل أن تكتب فيهما، فهي على Linux تأخذ وسيطين على الأقل، وترجع مجموعهما في \`eax\`.`,
      },
    },
    {
      type: "lab",
      id: "stack-frames",
      lang: "c",
      prompt: {
        en: `## Simulate the stack

Write a small simulator of \`push\`, \`pop\`, \`call\` and \`ret\`, and watch what happens when a function leaves the stack unbalanced. It is a harmless model: nothing is executed, you only track the stack.

The input has at most 100 lines, each one instruction:

- \`push N\`: put the integer \`N\` (can be negative) on the stack as **data**
- \`pop\`: remove the top entry (ignore its value)
- \`call NAME\`: put a **return address** on the stack. Instead of a real address, use the **number of this instruction line** (the first instruction is 1)
- \`ret\`: if the top is a return address \`R\`, remove it and print \`return to R\`. If the top is **data**, print \`crash: ret popped data V\` (V is the value) and stop immediately

If \`pop\` or \`ret\` finds the stack empty, print \`crash: stack empty\` and stop. When the input ends normally, print the remaining stack **from top to bottom** on one line: \`stack:\` followed by the entries, each \`d<value>\` for data or \`r<line>\` for a return address. An empty stack prints \`stack: empty\`.

**Example**

Input:

\`\`\`
push 7
call f
push 9
pop
ret
\`\`\`

Output:

\`\`\`
return to 2
stack: d7
\`\`\``,
        ar: `## حاكِ الـstack

اكتب محاكياً صغيراً لـ\`push\` و\`pop\` و\`call\` و\`ret\`، وشاهد ما يحدث عندما تترك دالة الـstack غير متوازن. إنه نموذج غير ضار: لا شيء يُنفَّذ، أنت فقط تتتبّع الـstack.

المدخل فيه 100 سطر على الأكثر، كل سطر تعليمة:

- ‏\`push N\`: ضع العدد الصحيح \`N\` (قد يكون سالباً) على الـstack كـ**بيانات**
- ‏\`pop\`: احذف العنصر الأعلى (تجاهل قيمته)
- ‏\`call NAME\`: ضع **عنوان عودة** على الـstack. بدل العنوان الحقيقي استخدم **رقم سطر هذه التعليمة** (أول تعليمة رقمها 1)
- ‏\`ret\`: إن كان الأعلى عنوان عودة \`R\` فاحذفه واطبع \`return to R\`. وإن كان الأعلى **بيانات** فاطبع \`crash: ret popped data V\` (‏V هي القيمة) وتوقف فوراً

إن وجدت \`pop\` أو \`ret\` الـstack فارغاً فاطبع \`crash: stack empty\` وتوقف. وعندما ينتهي المدخل طبيعياً، اطبع ما تبقى من الـstack **من الأعلى إلى الأسفل** في سطر واحد: ‏\`stack:\` ثم العناصر، كل عنصر \`d<value>\` للبيانات أو \`r<line>\` لعنوان العودة. والـstack الفارغ يطبع \`stack: empty\`.

**مثال**

المدخل:

\`\`\`
push 7
call f
push 9
pop
ret
\`\`\`

المخرج:

\`\`\`
return to 2
stack: d7
\`\`\``,
      },
      starterCode: `#include <stdio.h>
#include <stdlib.h>

#define MAX 256

typedef struct {
    int is_return;  /* 1 = return address, 0 = plain data */
    long value;     /* the data, or the line number of the call */
} Cell;

int main(void) {
    Cell stack[MAX];
    int top = 0;        /* how many cells are in use; stack[top - 1] is the top */
    int number = 0;     /* line number of the current instruction (first = 1) */
    char line[128];

    while (fgets(line, sizeof line, stdin)) {
        char op[16] = "", arg[64] = "";
        if (sscanf(line, "%15s %63s", op, arg) < 1) continue;  /* skip blank lines */
        number++;
        /* TODO 1: push N -> store a data cell. */
        /* TODO 2: call NAME -> store a return-address cell holding "number". */
        /* TODO 3: pop -> remove the top, or print "crash: stack empty" and stop. */
        /* TODO 4: ret -> print "return to R" for a return address; print the crash messages otherwise. */
    }

    /* TODO 5: print "stack:" and the cells from the top down (d<value> / r<line>), or "stack: empty". */
    printf("stack: empty\\n");
    (void)stack; (void)top; (void)number;
    return 0;
}
`,
      solution: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX 256

typedef struct {
    int is_return;  /* 1 = return address, 0 = plain data */
    long value;     /* the data, or the line number of the call */
} Cell;

int main(void) {
    Cell stack[MAX];
    int top = 0;        /* how many cells are in use; stack[top - 1] is the top */
    int number = 0;     /* line number of the current instruction (first = 1) */
    char line[128];

    while (fgets(line, sizeof line, stdin)) {
        char op[16] = "", arg[64] = "";
        if (sscanf(line, "%15s %63s", op, arg) < 1) continue;
        number++;

        if (strcmp(op, "push") == 0 && top < MAX) {
            stack[top].is_return = 0;
            stack[top].value = strtol(arg, NULL, 10);
            top++;
        } else if (strcmp(op, "call") == 0 && top < MAX) {
            stack[top].is_return = 1;
            stack[top].value = number;  /* the "address" of the call instruction */
            top++;
        } else if (strcmp(op, "pop") == 0) {
            if (top == 0) {
                printf("crash: stack empty\\n");
                return 0;
            }
            top--;
        } else if (strcmp(op, "ret") == 0) {
            if (top == 0) {
                printf("crash: stack empty\\n");
                return 0;
            }
            Cell c = stack[--top];
            if (!c.is_return) {
                /* ret trusts the top of the stack: here it is data, not an address */
                printf("crash: ret popped data %ld\\n", c.value);
                return 0;
            }
            printf("return to %ld\\n", c.value);
        }
    }

    if (top == 0) {
        printf("stack: empty\\n");
        return 0;
    }
    printf("stack:");
    for (int i = top - 1; i >= 0; i--) {
        printf(" %c%ld", stack[i].is_return ? 'r' : 'd', stack[i].value);
    }
    printf("\\n");
    return 0;
}
`,
      hints: [
        { en: "Keep an array of cells and an integer \`top\`. \`push\` and \`call\` write to \`stack[top]\` and increase \`top\`; \`pop\` and \`ret\` first check \`top == 0\`, then decrease it.", ar: "احتفظ بمصفوفة من الخلايا وعدد صحيح \`top\`. ‏\`push\` و\`call\` تكتبان في \`stack[top]\` وتزيدان \`top\`؛ و\`pop\` و\`ret\` تفحصان \`top == 0\` أولاً ثم تنقصانه." },
        { en: "Compare the operation with \`strcmp(op, \"ret\") == 0\`. Parse the number of \`push\` with \`strtol(arg, NULL, 10)\` so negative numbers work. For \`call\`, store the instruction counter \`number\`, not the argument.", ar: "قارن التعليمة بـ \`strcmp(op, \"ret\") == 0\`. حلّل عدد \`push\` بـ \`strtol(arg, NULL, 10)\` ليعمل مع الأعداد السالبة. وفي \`call\` خزّن عدّاد التعليمات \`number\` وليس الوسيط." },
        { en: "Print the remaining stack with a loop that runs from \`top - 1\` down to 0. Use \`%ld\` for the long values and print the prefix \`r\` or \`d\` depending on \`is_return\`.", ar: "اطبع الـstack المتبقي بحلقة تعدّ من \`top - 1\` نزولاً إلى 0. استخدم \`%ld\` للقيم من نوع long واطبع البادئة \`r\` أو \`d\` بحسب \`is_return\`." },
      ],
      tests: [
        { name: { en: "The worked example: a balanced call", ar: "المثال المحلول: استدعاء متوازن" }, stdin: `push 7
call f
push 9
pop
ret
`, expected: `return to 2
stack: d7
` },
        { name: { en: "Nested calls return in reverse order", ar: "الاستدعاءات المتداخلة تعود بترتيب معكوس" }, stdin: `call main
push 1
call helper
push 2
pop
ret
pop
ret
`, expected: `return to 3
return to 1
stack: empty
` },
        { name: { en: "An unbalanced push makes ret land on data", ar: "push غير متوازن يجعل ret تهبط على بيانات" }, stdin: `call vuln
push 4660
ret
`, expected: `crash: ret popped data 4660
` },
        { name: { en: "Empty input", ar: "مدخل فارغ" }, stdin: "", expected: `stack: empty
` },
        { name: { en: "ret on an empty stack", ar: "‏ret على stack فارغ" }, stdin: `ret
`, expected: `crash: stack empty
` },
        { name: { en: "Pending calls and a negative value, listed top first", ar: "استدعاءات معلّقة وقيمة سالبة، مرتبة من الأعلى" }, stdin: `push -5
call a
call b
push 99
`, expected: `stack: d99 r3 r2 d-5
` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## The same ideas on ARM64

Phones, recent Macs and many servers use **ARM64** (also called AArch64). The instructions differ, the concepts do not:

- **Registers**: \`x0\` to \`x30\` are 64 bits wide; \`w0\` to \`w30\` are their low 32 bits. \`sp\` is the stack pointer, \`x29\` is the usual frame pointer, \`x30\` is the **link register** (\`lr\`), and \`xzr\`/\`wzr\` always read as zero
- **Fixed-size instructions**: every instruction is 4 bytes, so addresses of instructions are multiples of 4. x86 instructions vary from 1 to 15 bytes
- **Load/store architecture**: arithmetic works only on registers. Memory is touched only by \`ldr\` (load) and \`str\` (store), such as \`ldr x0, [x1, #8]\`
- **Three-operand arithmetic**: \`add x0, x1, x2\` means \`x0 = x1 + x2\`. The destination is still written first
- **Compare and branch**: \`cmp x0, x1\` sets the flags, then \`b.eq\`, \`b.ne\`, \`b.lt\` (signed), \`b.lo\` (unsigned) branch. \`cbz x0, label\` branches if x0 is zero
- **Calls**: \`bl label\` puts the return address in **\`x30\`** and jumps; \`ret\` jumps to \`x30\`. There is no automatic push, so a function that calls another one must save \`x30\` on the stack first
- **Calling convention**: arguments in \`x0\` to \`x7\`, result in \`x0\`

The \`add3\` function from earlier on ARM64:

\`\`\`
add3:
    add  w0, w0, w1        ; a + b   (arguments arrive in w0 and w1)
    add  w0, w0, #3        ; + 3     (the result leaves in w0)
    ret
\`\`\`

Notice the habits that carry over: find the argument registers, find the result register, find the loops (backward branches) and the conditions (compare plus conditional branch).

## A method for reading any small function

1. **Identify the interface**: which registers are read before they are written (arguments) and what is in the result register at \`ret\` (return value)
2. **Mark the control flow**: draw an arrow for every jump or branch; backward arrows are loops
3. **Translate block by block** into plain words or pseudo-code. Name things as you learn their role (\`rdi\` becomes \`n\`)
4. **Test your idea** on a small input by hand, exactly like the emulator did
5. **Check the types**: signed or unsigned jumps? \`dword\` or \`qword\`? Is that a pointer or a number?

Use a tool such as **Compiler Explorer** (godbolt.org) to compile your own tiny C functions and compare them with what you read. Writing C and reading the output is the fastest way to build a feel for it.`,
        ar: `## الأفكار نفسها في ARM64

الهواتف وأجهزة Mac الحديثة وكثير من الخوادم تستخدم **ARM64** (ويسمى أيضاً AArch64). التعليمات تختلف لكن المفاهيم لا تختلف:

- **Registers**: من \`x0\` إلى \`x30\` بعرض 64 بت؛ ومن \`w0\` إلى \`w30\` هي الـ32 بت الدنيا منها. و\`sp\` هو stack pointer، و\`x29\` هو frame pointer المعتاد، و\`x30\` هو **link register** (‏\`lr\`)، و\`xzr\`/\`wzr\` تُقرأ دائماً صفراً
- **تعليمات ثابتة الحجم**: كل تعليمة 4 بايت، فعناوين التعليمات مضاعفات للعدد 4. أما تعليمات x86 فتتراوح من 1 إلى 15 بايت
- **معمارية load/store**: الحساب يعمل على الـregisters فقط. والذاكرة تُلمس فقط بـ\`ldr\` (تحميل) و\`str\` (تخزين) مثل \`ldr x0, [x1, #8]\`
- **حساب بثلاثة معاملات**: ‏\`add x0, x1, x2\` تعني \`x0 = x1 + x2\`. والوجهة ما زالت تُكتب أولاً
- **قارن وتفرّع**: ‏\`cmp x0, x1\` تضبط الـflags ثم تتفرّع \`b.eq\` و\`b.ne\` و\`b.lt\` (بإشارة) و\`b.lo\` (بدون إشارة). و\`cbz x0, label\` تتفرّع إن كانت x0 صفراً
- **الاستدعاءات**: ‏\`bl label\` تضع عنوان العودة في **\`x30\`** وتقفز؛ و\`ret\` تقفز إلى \`x30\`. لا يوجد push تلقائي، لذلك على الدالة التي تستدعي دالة أخرى أن تحفظ \`x30\` في الـstack أولاً
- **Calling convention**: الوسائط في \`x0\` حتى \`x7\`، والنتيجة في \`x0\`

دالة \`add3\` السابقة على ARM64:

\`\`\`
add3:
    add  w0, w0, w1        ; a + b   (arguments arrive in w0 and w1)
    add  w0, w0, #3        ; + 3     (the result leaves in w0)
    ret
\`\`\`

لاحظ العادات التي تنتقل معك: ابحث عن registers الوسائط، وregister النتيجة، والحلقات (تفرعات للخلف) والشروط (مقارنة وتفرّع مشروط).

## طريقة لقراءة أي دالة صغيرة

1. **حدّد الواجهة**: أي registers تُقرأ قبل أن يُكتب فيها (الوسائط) وماذا في register النتيجة عند \`ret\` (القيمة المرجعة)
2. **علّم تدفق التحكم**: ارسم سهماً لكل قفزة أو تفرّع؛ الأسهم الراجعة للخلف حلقات
3. **ترجم كتلة كتلة** إلى كلمات عادية أو pseudo-code. سمِّ الأشياء عندما تعرف دورها (يصبح \`rdi\` اسمه \`n\`)
4. **اختبر فكرتك** على مدخل صغير بيدك، تماماً كما فعل المحاكي
5. **افحص الأنواع**: قفزات بإشارة أم بدونها؟ ‏\`dword\` أم \`qword\`؟ هل هذا مؤشر أم عدد؟

استخدم أداة مثل **Compiler Explorer** (‏godbolt.org) لتصريف دوال C الصغيرة من تأليفك ومقارنتها بما تقرؤه. كتابة C وقراءة الناتج أسرع طريق لبناء الحدس.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "On 64-bit Linux (System V AMD64), where does a function receive its first two integer arguments?", ar: "في Linux بـ64 بت (‏System V AMD64)، أين تستلم الدالة أول وسيطين من الأعداد الصحيحة؟" },
          choices: [
            { en: "In rdi and rsi", ar: "في rdi وrsi" },
            { en: "In rax and rbx", ar: "في rax وrbx" },
            { en: "In rcx and rdx", ar: "في rcx وrdx" },
            { en: "On the stack, pushed in reverse order", ar: "في الـstack، مدفوعين بترتيب معكوس" },
          ],
          answer: 0,
          explain: {
            en: "The order is rdi, rsi, rdx, rcx, r8, r9, and only extra arguments go on the stack. rcx and rdx as the first two is the Windows x64 style (rcx, rdx, r8, r9), a common mix-up. rax carries the result, not an argument.",
            ar: "الترتيب هو rdi ثم rsi ثم rdx ثم rcx ثم r8 ثم r9، والوسائط الزائدة فقط تذهب إلى الـstack. أما rcx وrdx كأول وسيطين فهو أسلوب Windows x64 (‏rcx وrdx وr8 وr9) وهو خلط شائع. و rax تحمل النتيجة وليس الوسائط.",
          },
        },
        {
          q: { en: "What does `cmp rax, rbx` do?", ar: "ماذا تفعل `cmp rax, rbx`؟" },
          choices: [
            { en: "Copies rbx into rax", ar: "تنسخ rbx إلى rax" },
            { en: "Computes rax - rbx, discards the result and keeps only the flags", ar: "تحسب rax - rbx وترمي الناتج وتحتفظ بالـflags فقط" },
            { en: "Stores 1 in rax if they are equal and 0 otherwise", ar: "تخزّن 1 في rax إن تساويا و0 إن لم يتساويا" },
            { en: "Swaps the two registers if rax is larger", ar: "تبدّل الـregisterين إن كان rax أكبر" },
          ],
          answer: 1,
          explain: {
            en: "cmp is a subtraction whose result is thrown away; the flags (ZF, SF, CF, OF) record what happened and the next conditional jump reads them. No register changes, and nothing is stored as a 0/1 value (that would need an instruction such as sete).",
            ar: "‏cmp عملية طرح يُرمى ناتجها؛ والـflags (‏ZF وSF وCF وOF) تسجّل ما حدث والقفزة المشروطة التالية تقرؤها. لا يتغير أي register ولا يُخزَّن شيء كقيمة 0/1 (هذا يحتاج تعليمة مثل sete).",
          },
        },
        {
          q: { en: "What does `lea eax, [rdi+rsi*4+3]` do?", ar: "ماذا تفعل `lea eax, [rdi+rsi*4+3]`؟" },
          choices: [
            { en: "Reads the memory at address rdi+rsi*4+3 into eax", ar: "تقرأ الذاكرة عند العنوان rdi+rsi*4+3 إلى eax" },
            { en: "Writes eax to the memory at that address", ar: "تكتب eax في الذاكرة عند ذلك العنوان" },
            { en: "Computes rdi + rsi*4 + 3 into eax without touching memory", ar: "تحسب rdi + rsi*4 + 3 في eax دون لمس الذاكرة" },
          ],
          answer: 2,
          explain: {
            en: "lea only calculates the address expression, it never dereferences it. Compilers love it as a fast way to do add-and-multiply arithmetic. The square brackets look like a memory access, which is exactly why it is misread so often.",
            ar: "‏lea تحسب تعبير العنوان فقط ولا تقرأ ما عنده أبداً. المصرِّفات تحبها كطريقة سريعة لحساب الجمع والضرب. الأقواس المربعة تبدو كوصول إلى الذاكرة، ولهذا بالضبط يُساء فهمها كثيراً.",
          },
        },
        {
          q: { en: "How does a function call remember its return address on ARM64, compared with x86-64?", ar: "كيف يتذكّر استدعاء الدالة عنوان العودة في ARM64 مقارنةً بـ x86-64؟" },
          choices: [
            { en: "Both push the return address on the stack automatically", ar: "كلاهما يدفع عنوان العودة تلقائياً في الـstack" },
            { en: "ARM64 `bl` puts it in the link register x30, while x86-64 `call` pushes it on the stack", ar: "‏`bl` في ARM64 تضعه في link register ‏x30، بينما `call` في x86-64 تدفعه في الـstack" },
            { en: "ARM64 stores it in x0, which is also the result register", ar: "‏ARM64 تخزّنه في x0 وهو أيضاً register النتيجة" },
          ],
          answer: 1,
          explain: {
            en: "On ARM64, bl writes the return address into x30 and ret jumps to x30, so a function that calls another one must save x30 itself (often with stp x29, x30, [sp, #-16]!). On x86-64 the call instruction pushes it for you.",
            ar: "في ARM64، تكتب \`bl\` عنوان العودة في x30 وتقفز \`ret\` إلى x30، لذلك على الدالة التي تستدعي أخرى أن تحفظ x30 بنفسها (غالباً بـ stp x29, x30, [sp, #-16]!). أما في x86-64 فتدفعه لك تعليمة call.",
          },
        },
        {
          q: { en: "A function pushes a value on the stack, never pops it, and then executes `ret`. What happens?", ar: "دالة تدفع قيمة في الـstack ولا تسحبها أبداً ثم تنفّذ `ret`. ماذا يحدث؟" },
          choices: [
            { en: "ret still returns correctly because the CPU remembers the real return address", ar: "تعود ret بشكل صحيح لأن المعالج يتذكّر عنوان العودة الحقيقي" },
            { en: "ret pops the extra value and treats it as the return address, so execution jumps to a wrong place", ar: "تسحب ret القيمة الزائدة وتعاملها كعنوان عودة، فيقفز التنفيذ إلى مكان خاطئ" },
            { en: "The CPU refuses to run ret and raises a compile-time error", ar: "يرفض المعالج تنفيذ ret ويُصدر خطأ وقت التصريف" },
          ],
          answer: 1,
          explain: {
            en: "ret has no memory of its own: it simply loads whatever is on top of the stack into rip. An unbalanced stack therefore sends execution to a garbage address, typically a crash. That blind trust is also why overwriting a saved return address is so dangerous, and why modern systems add protections such as stack canaries.",
            ar: "لا ذاكرة لـ ret بذاتها: هي تحمّل ما في قمة الـstack إلى rip فحسب. لذلك يرسل الـstack غير المتوازن التنفيذ إلى عنوان عشوائي، وغالباً ينتهي بانهيار. هذه الثقة العمياء هي أيضاً سبب خطورة الكتابة فوق عنوان عودة محفوظ، ولماذا تضيف الأنظمة الحديثة حمايات مثل stack canaries.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary and what to practice next

- Assembly is the CPU's recipe cards: **registers** (bowls), **memory** (pantry), **instructions** (cards). In Intel syntax the **destination comes first**
- \`cmp\`/\`test\` set **flags**, conditional jumps read them: backward jumps are **loops**, forward jumps are **ifs**, and \`jl\`/\`jg\` (signed) versus \`jb\`/\`ja\` (unsigned) tell you the original types
- The **stack** grows down; \`call\` pushes the return address and \`ret\` blindly pops it
- **System V AMD64**: arguments in \`rdi, rsi, rdx, rcx, r8, r9\`, result in \`rax\`. **ARM64**: arguments in \`x0\`-\`x7\`, result in \`x0\`, return address in \`x30\`
- Reading method: interface, control flow, translate, test by hand, check types

**Practice next:** open godbolt.org, write five tiny C functions (max of two numbers, absolute value, sum of an array, string length, factorial) and compile them with \`-O0\` and \`-O2\`. For each, say in words what the assembly does before you read the C again. The next lesson moves from reading code to **analyzing whole files** statically, and to undoing layers of obfuscation.`,
        ar: `## الخلاصة وماذا تتدرّب عليه بعد ذلك

- Assembly هو بطاقات وصفات المعالج: **registers** (أوعية) و**ذاكرة** (مخزن) و**تعليمات** (بطاقات). وفي Intel syntax **تأتي الوجهة أولاً**
- ‏\`cmp\`/\`test\` تضبطان **flags** والقفزات المشروطة تقرؤها: القفزات للخلف **حلقات**، وللأمام **ifs**، و\`jl\`/\`jg\` (بإشارة) مقابل \`jb\`/\`ja\` (بدون إشارة) تخبرك بالأنواع الأصلية
- الـ**stack** ينمو للأسفل؛ و\`call\` تدفع عنوان العودة و\`ret\` تسحبه بلا تدقيق
- **System V AMD64**: الوسائط في \`rdi, rsi, rdx, rcx, r8, r9\` والنتيجة في \`rax\`. **ARM64**: الوسائط في \`x0\`-\`x7\` والنتيجة في \`x0\` وعنوان العودة في \`x30\`
- طريقة القراءة: الواجهة، تدفق التحكم، الترجمة، الاختبار بيدك، فحص الأنواع

**تدرّب بعد ذلك:** افتح godbolt.org واكتب خمس دوال C صغيرة (أكبر عددين، القيمة المطلقة، مجموع مصفوفة، طول نص، المضروب) وصرّفها بـ \`-O0\` و\`-O2\`. ولكل واحدة، قل بكلماتك ماذا يفعل الـassembly قبل أن تقرأ كود C من جديد. الدرس التالي ينتقل من قراءة الكود إلى **تحليل الملفات كاملة** بشكل ساكن (static)، وإلى فكّ طبقات التعتيم (obfuscation).`,
      },
    },
  ],
};
