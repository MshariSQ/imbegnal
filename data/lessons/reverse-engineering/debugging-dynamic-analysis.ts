import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "debugging-dynamic-analysis",
  title: {
    en: "Debugging & Dynamic Analysis — Watching a Program in Slow Motion",
    ar: "التنقيح والتحليل الديناميكي — مشاهدة البرنامج بالحركة البطيئة",
  },
  estMinutes: 47,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

By the end of this lesson you will be able to:

- Set up a **disposable lab** for running code you are studying, and explain why dynamic analysis needs one
- Explain how a debugger works: **ptrace**, software breakpoints (\`int3\`), **single-stepping** and hardware breakpoints
- Drive **GDB**: breakpoints, stepping, registers, memory and the process map
- **Rebase** addresses between a debugger and a disassembler under **ASLR**
- Read a **system-call trace** from \`strace\` and summarize what a program touched
- Study a **bytecode virtual machine** by writing a small interpreter with breakpoints

## The slow-motion replay 🎬

A football referee who is unsure about a goal does not guess. They watch the replay: pause at the decisive moment, step forward one frame at a time, zoom in on the ball. Nothing about the match changes, but suddenly every detail is visible.

A **debugger** is that replay for a running program. You pause it at chosen places (**breakpoints**), advance one instruction at a time (**single-stepping**), and inspect the "frame": registers, memory, the stack. **Dynamic analysis** is the wider family of techniques that learn from a program *while it runs*: debugging, tracing its system calls, watching its files and network.

There is one big difference from static analysis: here the code **really runs**. So before any command, you need a safe place to run it.`,
        ar: `## ماذا ستتعلم

في نهاية هذا الدرس ستكون قادراً على:

- إعداد **مختبر يمكن التخلص منه (disposable lab)** لتشغيل الكود الذي تدرسه، وشرح لماذا يحتاج التحليل الديناميكي إليه
- شرح كيف يعمل المنقّح (debugger): ‏**ptrace**، ونقاط التوقف البرمجية (\`int3\`)، و**التنفيذ خطوة خطوة (single-stepping)**، ونقاط التوقف العتادية
- قيادة **GDB**: نقاط التوقف، والتقدّم خطوة خطوة، والـregisters، والذاكرة، وخريطة العملية
- **إعادة احتساب العناوين (rebase)** بين المنقّح والمفكِّك في ظل **ASLR**
- قراءة **تتبّع استدعاءات النظام (system-call trace)** من \`strace\` وتلخيص ما لمسه البرنامج
- دراسة **آلة افتراضية للـbytecode** بكتابة مفسِّر صغير بنقاط توقف

## إعادة اللقطة بالحركة البطيئة 🎬

حكم كرة القدم الذي يشكّ في هدف لا يخمّن. بل يشاهد الإعادة: يوقف الصورة عند اللحظة الحاسمة، ويتقدّم لقطة واحدة في كل مرة، ويقرّب الصورة على الكرة. لا يتغيّر شيء في المباراة، لكن كل تفصيلة تصبح فجأة مرئية.

**المنقّح (debugger)** هو هذه الإعادة لبرنامج يعمل. توقفه في مواضع تختارها (**نقاط التوقف breakpoints**)، وتتقدّم تعليمة واحدة في كل مرة (**single-stepping**)، وتفحص "اللقطة": الـregisters والذاكرة والـstack. و**التحليل الديناميكي** هو العائلة الأوسع من التقنيات التي تتعلّم من البرنامج *أثناء تشغيله*: التنقيح، وتتبّع استدعاءات النظام، ومراقبة ملفاته وشبكته.

وهناك فرق كبير واحد عن التحليل الساكن: هنا يعمل الكود **فعلاً**. لذلك تحتاج قبل أي أمر إلى مكان آمن لتشغيله.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The disposable lab 🧪

Static analysis only reads bytes. Dynamic analysis executes them, with your user's rights, on whatever machine you choose. Even a harmless crackme deserves good habits, because the habits are what protect you on the day a sample is not harmless.

- **Run it in a virtual machine**, never on your everyday computer. VirtualBox, VMware and QEMU/KVM all support **snapshots**: take one of a clean system, do your work, then **revert**. Nothing the program did survives.
- **Cut the links to the host:** no shared folders, no shared clipboard, no drag and drop. Copy files in once, then disconnect.
- **Control the network:** disabled, or a host-only network with no route to the internet or to your home or company network.
- **Use a separate, unprivileged account** inside the VM, and keep your real accounts, keys and browser sessions out of it.
- **Write down** the file's hash, the snapshot you started from and every command you ran.
- Only run programs that are **yours, open source, published for practice, or covered by written permission**, exactly as in the first lesson.

Two Linux settings explain behavior you will meet:

- \`/proc/sys/kernel/randomize_va_space\` controls ASLR: \`2\` (the usual default) randomizes the stack, libraries, the heap and PIE executables; \`0\` turns it off.
- The Yama module's \`/proc/sys/kernel/yama/ptrace_scope\` limits who may debug whom: \`0\` classic rules, \`1\` only your own descendants (the default on Ubuntu), \`2\` administrators only, \`3\` nobody. Starting a program *under* the debugger (\`gdb ./prog\`) makes it a descendant, so it works with \`1\`; attaching to an unrelated running process does not.

Every program run in this lesson was written for the lesson: a small checksum calculator and a program that copies a notes file.`,
        ar: `## المختبر الذي يمكن التخلص منه 🧪

التحليل الساكن يقرأ البايتات فقط. أما التحليل الديناميكي فينفّذها، بصلاحيات مستخدمك، على أي جهاز تختاره. وحتى crackme غير ضار يستحق عادات جيدة، لأن العادات هي ما يحميك في اليوم الذي لا تكون فيه العينة غير ضارة.

- **شغّله داخل جهاز افتراضي**، ولا تشغّله أبداً على حاسوبك اليومي. ‏VirtualBox وVMware وQEMU/KVM كلها تدعم **اللقطات (snapshots)**: خذ لقطة لنظام نظيف، وأنجز عملك، ثم **ارجع** إليها. لا يبقى شيء مما فعله البرنامج.
- **اقطع الروابط مع الجهاز المضيف:** لا مجلدات مشتركة، ولا حافظة مشتركة، ولا سحب وإفلات. انسخ الملفات إلى الداخل مرة واحدة ثم افصل.
- **تحكّم في الشبكة:** معطّلة، أو شبكة host-only بلا طريق إلى الإنترنت ولا إلى شبكة بيتك أو شركتك.
- **استخدم حساباً منفصلاً بلا صلاحيات إدارية** داخل الجهاز الافتراضي، وأبقِ حساباتك الحقيقية ومفاتيحك وجلسات متصفحك خارجه.
- **دوّن** الـhash الخاص بالملف، واللقطة التي بدأت منها، وكل أمر شغّلته.
- لا تشغّل إلا برامج هي **ملكك، أو مفتوحة المصدر، أو منشورة للتدريب، أو يغطيها إذن مكتوب**، تماماً كما في الدرس الأول.

إعدادان في Linux يفسّران سلوكاً ستقابله:

- ‏\`/proc/sys/kernel/randomize_va_space\` يتحكم في ASLR: القيمة \`2\` (الافتراضية المعتادة) تجعل الـstack والمكتبات والـheap والملفات التنفيذية PIE عشوائية المواضع؛ والقيمة \`0\` تعطّله.
- ‏\`/proc/sys/kernel/yama/ptrace_scope\` في وحدة Yama يحدّ من يحق له تنقيح من: ‏\`0\` القواعد التقليدية، و\`1\` ذريتك أنت فقط (الافتراضي في Ubuntu)، و\`2\` المسؤولون فقط، و\`3\` لا أحد. وتشغيل البرنامج *تحت* المنقّح (‏\`gdb ./prog\`) يجعله من الذرية فيعمل مع \`1\`؛ أما الالتصاق (attach) بعملية تعمل ولا صلة لها بك فلا يعمل.

كل برنامج شُغِّل في هذا الدرس كُتب لأجل الدرس: حاسبة checksum صغيرة، وبرنامج ينسخ ملف ملاحظات.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## How a debugger really works

On Linux, debuggers and tracers are built on one system call, **\`ptrace(2)\`**: it lets a *tracer* process stop a *tracee*, read and write its registers and memory, and resume it. GDB, \`strace\` and many other tools are ptrace clients.

**Software breakpoints.** To stop at an address, the debugger overwrites the first byte of the instruction there with \`0xCC\`, the one-byte x86 instruction \`int3\`, after saving the original byte. When the CPU executes it, the kernel stops the tracee with \`SIGTRAP\` and tells the debugger. At that moment \`rip\` already points one byte *past* the \`int3\`, so the debugger:

1. moves \`rip\` back by one
2. puts the original byte back
3. shows you the stopped program
4. when you continue, executes one instruction in **single-step** mode (the **trap flag**, TF, in RFLAGS makes the CPU stop after every instruction)
5. writes \`0xCC\` again so the breakpoint stays armed, and resumes

This is also why code that checksums itself notices software breakpoints: the bytes in memory really change.

**Hardware breakpoints** use the CPU's debug registers instead: on x86, \`DR0\` to \`DR3\` hold up to four addresses and \`DR7\` says what to watch (execution, writes, or reads and writes). They do not modify memory, and they power **watchpoints** (\`watch counter\` in GDB stops when a variable changes).`,
        ar: `## كيف يعمل المنقّح فعلاً

على Linux تُبنى المنقّحات وأدوات التتبّع على استدعاء نظام واحد هو **\`ptrace(2)\`**: يسمح لعملية *متتبِّعة (tracer)* بإيقاف عملية *متتبَّعة (tracee)*، وقراءة registers وذاكرتها والكتابة فيها، ثم استئنافها. ‏GDB و\`strace\` وأدوات كثيرة غيرها عملاء لـ ptrace.

**نقاط التوقف البرمجية.** ليتوقف المنقّح عند عنوان، يكتب فوق أول بايت من التعليمة هناك القيمة \`0xCC\`، وهي تعليمة x86 ذات البايت الواحد \`int3\`، بعد أن يحفظ البايت الأصلي. وعندما ينفّذها المعالج، يوقف النواة العملية المتتبَّعة بالإشارة \`SIGTRAP\` ويُعلم المنقّح. في تلك اللحظة يكون \`rip\` قد صار يشير إلى بايت واحد *بعد* \`int3\`، فيقوم المنقّح بما يلي:

1. يعيد \`rip\` إلى الخلف بايتاً واحداً
2. يعيد البايت الأصلي إلى مكانه
3. يعرض لك البرنامج المتوقف
4. عندما تتابع، ينفّذ تعليمة واحدة في وضع **single-step** (علم **trap flag** ‏TF في RFLAGS يجعل المعالج يتوقف بعد كل تعليمة)
5. يكتب \`0xCC\` من جديد لتبقى نقطة التوقف مفعّلة، ثم يستأنف

ولهذا أيضاً يلاحظ الكود الذي يحسب checksum لنفسه وجود نقاط التوقف البرمجية: البايتات في الذاكرة تتغير فعلاً.

أما **نقاط التوقف العتادية** فتستخدم سجلات التنقيح في المعالج بدلاً من ذلك: في x86 تحمل \`DR0\` حتى \`DR3\` ما يصل إلى أربعة عناوين، ويحدّد \`DR7\` ما يُراقَب (التنفيذ، أو الكتابة، أو القراءة والكتابة). وهي لا تعدّل الذاكرة، وعليها تقوم **نقاط المراقبة (watchpoints)** (‏\`watch counter\` في GDB يتوقف عندما يتغير المتغير).`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// A software breakpoint, simulated on real x86-64 bytes:
// 55 = push rbp | 48 89 e5 = mov rbp, rsp | 31 c0 = xor eax, eax | 5d = pop rbp | c3 = ret
const code = [0x55, 0x48, 0x89, 0xe5, 0x31, 0xc0, 0x5d, 0xc3];
const names = { 0: "push rbp", 1: "mov rbp, rsp", 4: "xor eax, eax", 6: "pop rbp", 7: "ret" };
const length = { 0: 1, 1: 3, 4: 2, 6: 1, 7: 1 };
const hex = (bytes) => bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");

const bp = 4;                    // break on "xor eax, eax"
const saved = code[bp];
code[bp] = 0xcc;                 // 1. the debugger writes int3 over the first byte
console.log("planted    :", hex(code));

let rip = 0;
let stepping = false;
while (rip < code.length) {
  if (code[rip] === 0xcc) {      // 2. the CPU runs int3: SIGTRAP, rip is now one byte past it
    rip += 1;
    console.log("SIGTRAP with rip =", rip, "-> rewind to", rip - 1);
    rip -= 1;                    // 3. rewind and restore the original byte
    code[rip] = saved;
    console.log("restored   :", hex(code));
    stepping = true;             // 4. single-step one instruction (trap flag)
    continue;
  }
  console.log("execute", rip + ":", names[rip]);
  rip += length[rip];
  if (stepping) {                // 5. re-arm the breakpoint after that one step
    stepping = false;
    code[bp] = 0xcc;
    console.log("re-armed   :", hex(code));
  }
}`,
      explanation: {
        en: "Run it and follow the five numbered steps in the output. Then move the breakpoint to offset 1 (`mov rbp, rsp`), or plant a second one at offset 6, and predict the trace before you run. Notice that while the program is stopped, the bytes in memory are the original ones: debuggers hide their own `0xCC` from you.",
        ar: "شغّله واتبع الخطوات الخمس المرقّمة في الناتج. ثم انقل نقطة التوقف إلى الإزاحة 1 (‏`mov rbp, rsp`)، أو ضع نقطة ثانية عند الإزاحة 6، وتوقّع التتبّع قبل التشغيل. لاحظ أن البايتات في الذاكرة أثناء توقف البرنامج هي الأصلية: المنقّحات تخفي عنك `0xCC` الخاص بها.",
      },
    },
    {
      type: "text",
      body: {
        en: `## GDB essentials

The commands you will use in almost every session:

\`\`\`
set disassembly-flavor intel   # Intel syntax, like the rest of this track
break checksum                 # breakpoint on a function (b for short)
break *0x555555555169          # breakpoint on an exact address
run lab                        # start the program with the argument "lab"
starti                         # or: stop at the very first instruction
x/6i $pc                       # examine 6 instructions at the program counter
stepi / nexti                  # one instruction; nexti steps over calls (si / ni)
info registers rip rsp rbp     # selected registers (i r)
x/2gx $rsp                     # 2 giant (8-byte) words in hex at the stack pointer
x/s $rdi                       # a string at the address in rdi
bt                             # backtrace: who called whom
finish                         # run until the current function returns
watch counter                  # stop when a variable changes
catch syscall write            # stop on a system call
info proc mappings             # the live memory map
continue                       # run until the next stop (c)
\`\`\`

A real session on the lesson's checksum program (built with \`-O0 -g\`, shortened):

\`\`\`
(gdb) break *0x555555555169
(gdb) run lab
Breakpoint 1, checksum (s=0x0) at checksum.c:5
(gdb) x/4i $pc
=> 0x555555555169 <checksum>:    endbr64
   0x55555555516d <checksum+4>:  push   rbp
   0x55555555516e <checksum+5>:  mov    rbp,rsp
   0x555555555171 <checksum+8>:  sub    rsp,0x20
(gdb) stepi
(gdb) stepi
(gdb) info registers rip rsp
rip            0x55555555516e      0x55555555516e <checksum+5>
rsp            0x7fffffffc6d0      0x7fffffffc6d0
(gdb) x/2gx $rsp
0x7fffffffc6d0: 0x00007fffffffc700      0x0000555555555202
(gdb) finish
Value returned is $1 = 106893
\`\`\`

Read the stack dump with the previous lesson in mind: after \`push rbp\`, the top of the stack holds the caller's saved \`rbp\`, and right above it is the **return address** \`0x555555555202\` that \`call\` pushed, a place inside \`main\`. (GDB shows \`s=0x0\` because the prologue has not yet copied the argument from \`rdi\` into the stack slot where the debug information says it lives.)

Notice the addresses: \`0x5555555...\`. GDB turns ASLR **off** for programs it starts (\`set disable-randomization on\` is the default), and a 64-bit PIE then lands at \`0x555555554000\`. Outside GDB the base changes on every run.`,
        ar: `## أساسيات GDB

الأوامر التي ستستخدمها في كل جلسة تقريباً:

\`\`\`
set disassembly-flavor intel   # Intel syntax, like the rest of this track
break checksum                 # breakpoint on a function (b for short)
break *0x555555555169          # breakpoint on an exact address
run lab                        # start the program with the argument "lab"
starti                         # or: stop at the very first instruction
x/6i $pc                       # examine 6 instructions at the program counter
stepi / nexti                  # one instruction; nexti steps over calls (si / ni)
info registers rip rsp rbp     # selected registers (i r)
x/2gx $rsp                     # 2 giant (8-byte) words in hex at the stack pointer
x/s $rdi                       # a string at the address in rdi
bt                             # backtrace: who called whom
finish                         # run until the current function returns
watch counter                  # stop when a variable changes
catch syscall write            # stop on a system call
info proc mappings             # the live memory map
continue                       # run until the next stop (c)
\`\`\`

جلسة حقيقية على برنامج الـchecksum في هذا الدرس (مبني بـ \`-O0 -g\`، مختصرة):

\`\`\`
(gdb) break *0x555555555169
(gdb) run lab
Breakpoint 1, checksum (s=0x0) at checksum.c:5
(gdb) x/4i $pc
=> 0x555555555169 <checksum>:    endbr64
   0x55555555516d <checksum+4>:  push   rbp
   0x55555555516e <checksum+5>:  mov    rbp,rsp
   0x555555555171 <checksum+8>:  sub    rsp,0x20
(gdb) stepi
(gdb) stepi
(gdb) info registers rip rsp
rip            0x55555555516e      0x55555555516e <checksum+5>
rsp            0x7fffffffc6d0      0x7fffffffc6d0
(gdb) x/2gx $rsp
0x7fffffffc6d0: 0x00007fffffffc700      0x0000555555555202
(gdb) finish
Value returned is $1 = 106893
\`\`\`

اقرأ تفريغ الـstack وأنت تتذكّر الدرس السابق: بعد \`push rbp\` تحمل قمة الـstack قيمة \`rbp\` المحفوظة للدالة المستدعية، وفوقها مباشرة **عنوان العودة** \`0x555555555202\` الذي دفعته \`call\`، وهو موضع داخل \`main\`. (يعرض GDB القيمة \`s=0x0\` لأن الـprologue لم ينسخ الوسيط بعدُ من \`rdi\` إلى خانة الـstack التي تقول معلومات التنقيح إنه يعيش فيها.)

لاحظ العناوين: ‏\`0x5555555...\`. يُعطّل GDB ميزة ASLR للبرامج التي يشغّلها (‏\`set disable-randomization on\` هو الافتراضي)، فيهبط ملف PIE بـ 64-bit عند \`0x555555554000\`. أما خارج GDB فتتغيّر القاعدة في كل تشغيل.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## ASLR and rebasing

You will constantly move between two views of the same code: the **disassembler** (Ghidra, static addresses) and the **debugger** (live addresses). They disagree because each one placed the module at a different **base**:

- the debugger shows **runtime** addresses: wherever the loader put the module in this run
- Ghidra usually loads a 64-bit PIE at \`0x100000\`, which is why its labels look like \`FUN_00101169\`; \`nm\` and \`readelf\` show plain file offsets from base 0

What never changes is the **offset inside the module**. So:

\`\`\`
offset  = runtime address - runtime base of the module
static  = static base + offset
runtime = runtime base + (static - static base)
\`\`\`

Example from the session above: the return address \`0x555555555202\` minus the base \`0x555555554000\` is offset \`0x1202\`, which is \`0x101202\` in Ghidra and \`0x1202\` in \`objdump\`. In the other direction, \`checksum\` is \`0x101169\` in Ghidra, so in this run you break at \`0x555555555169\`.

Find the runtime base in \`info proc mappings\` (or \`/proc/<pid>/maps\`): it is the start of the module's **first** mapping, the one with file offset 0. Real map lines from the session:

\`\`\`
      Start Addr           End Addr       Size     Offset  Perms  objfile
  0x555555554000     0x555555555000     0x1000        0x0  r--p   .../checksum
  0x555555555000     0x555555556000     0x1000     0x1000  r-xp   .../checksum
  0x555555558000     0x555555559000     0x1000     0x3000  rw-p   .../checksum
  0x7ffff7c00000     0x7ffff7c28000    0x28000        0x0  r--p   .../libc.so.6
  0x7ffff7c28000     0x7ffff7db0000   0x188000    0x28000  r-xp   .../libc.so.6
  0x7ffffffdc000     0x7ffffffff000    0x23000        0x0  rw-p   [stack]
\`\`\`

GDB, Ghidra and most disassemblers can also do this for you (in Ghidra, *Memory Map → Set Image Base*), but you should be able to do it by hand when the tools disagree or when you read a crash log.`,
        ar: `## ASLR وإعادة احتساب العناوين

ستتنقّل باستمرار بين منظورين للكود نفسه: **المفكِّك** (‏Ghidra، عناوين ساكنة) و**المنقّح** (عناوين حيّة). ويختلفان لأن كلاً منهما وضع الوحدة (module) عند **قاعدة (base)** مختلفة:

- المنقّح يعرض عناوين **وقت التشغيل**: حيثما وضع المُحمِّل الوحدة في هذا التشغيل
- يحمّل Ghidra عادةً ملف PIE بـ 64-bit عند \`0x100000\`، ولهذا تبدو أسماؤه مثل \`FUN_00101169\`؛ أما \`nm\` و\`readelf\` فيعرضان إزاحات الملف المجرّدة من القاعدة 0

والشيء الذي لا يتغير أبداً هو **الإزاحة داخل الوحدة**. إذن:

\`\`\`
offset  = runtime address - runtime base of the module
static  = static base + offset
runtime = runtime base + (static - static base)
\`\`\`

مثال من الجلسة أعلاه: عنوان العودة \`0x555555555202\` ناقص القاعدة \`0x555555554000\` يعطي الإزاحة \`0x1202\`، وهي \`0x101202\` في Ghidra و\`0x1202\` في \`objdump\`. وفي الاتجاه الآخر، الدالة \`checksum\` عنوانها \`0x101169\` في Ghidra، فتضع نقطة التوقف في هذا التشغيل عند \`0x555555555169\`.

تجد قاعدة وقت التشغيل في \`info proc mappings\` (أو \`/proc/<pid>/maps\`): إنها بداية **أول** منطقة للوحدة، وهي التي إزاحتها في الملف 0. هذه أسطر خريطة حقيقية من الجلسة:

\`\`\`
      Start Addr           End Addr       Size     Offset  Perms  objfile
  0x555555554000     0x555555555000     0x1000        0x0  r--p   .../checksum
  0x555555555000     0x555555556000     0x1000     0x1000  r-xp   .../checksum
  0x555555558000     0x555555559000     0x1000     0x3000  rw-p   .../checksum
  0x7ffff7c00000     0x7ffff7c28000    0x28000        0x0  r--p   .../libc.so.6
  0x7ffff7c28000     0x7ffff7db0000   0x188000    0x28000  r-xp   .../libc.so.6
  0x7ffffffdc000     0x7ffffffff000    0x23000        0x0  rw-p   [stack]
\`\`\`

يستطيع GDB وGhidra ومعظم المفكِّكات فعل هذا عنك (في Ghidra: ‏*Memory Map → Set Image Base*)، لكن يجب أن تستطيع فعله بيدك حين تختلف الأدوات أو حين تقرأ سجل انهيار (crash log).`,
      },
    },
    {
      type: "lab",
      id: "rebase-addresses",
      lang: "python",
      prompt: {
        en: `## Rebase addresses between GDB and Ghidra

Write the small calculator every analyst ends up writing: translate live addresses from a debugger or crash log into static addresses for the disassembler, and back.

**Input:** lines of three kinds, in any order (a module is always declared before it is used):

- \`module NAME START-END STATIC_BASE\`: the module occupies runtime addresses \`[START, END)\` (hex without \`0x\`, as in \`/proc/<pid>/maps\`), and your disassembler loaded it at \`STATIC_BASE\` (hex with \`0x\`)
- \`rt ADDR\`: a runtime address (hex with \`0x\`)
- \`st NAME ADDR\`: a static address inside module \`NAME\`

**Output**

- for \`rt\`: \`<addr> -> <name>+<offset> (static <static addr>)\`, or \`<addr> -> not in any module\`
- for \`st\`: \`<name> <addr> -> runtime <runtime addr>\`. If the offset \`ADDR - STATIC_BASE\` is negative or not smaller than the module size (\`END - START\`), print \`<name> <addr> -> outside <name>\`; if the module is unknown, \`<name> <addr> -> unknown module\`

All numbers are printed in lowercase hex with \`0x\` and no padding (Python's \`f"{n:#x}"\`).

**Example**

Input:

\`\`\`
module checksum 555555554000-555555559000 0x100000
rt 0x555555555202
st checksum 0x101169
\`\`\`

Output:

\`\`\`
0x555555555202 -> checksum+0x1202 (static 0x101202)
checksum 0x101169 -> runtime 0x555555555169
\`\`\``,
        ar: `## أعد احتساب العناوين بين GDB وGhidra

اكتب الحاسبة الصغيرة التي ينتهي كل محلل إلى كتابتها: ترجم العناوين الحيّة من المنقّح أو من سجل انهيار إلى عناوين ساكنة للمفكِّك، والعكس.

**المدخل:** أسطر من ثلاثة أنواع وبأي ترتيب (الوحدة تُعرَّف دائماً قبل استخدامها):

- ‏\`module NAME START-END STATIC_BASE\`: تشغل الوحدة عناوين وقت التشغيل \`[START, END)\` (‏hex بدون \`0x\` كما في \`/proc/<pid>/maps\`)، وقد حمّلها مفكِّكك عند \`STATIC_BASE\` (‏hex مع \`0x\`)
- ‏\`rt ADDR\`: عنوان وقت تشغيل (‏hex مع \`0x\`)
- ‏\`st NAME ADDR\`: عنوان ساكن داخل الوحدة \`NAME\`

**المخرج**

- لـ \`rt\`: ‏\`<addr> -> <name>+<offset> (static <static addr>)\`، أو \`<addr> -> not in any module\`
- لـ \`st\`: ‏\`<name> <addr> -> runtime <runtime addr>\`. وإن كانت الإزاحة \`ADDR - STATIC_BASE\` سالبة أو ليست أصغر من حجم الوحدة (‏\`END - START\`) فاطبع \`<name> <addr> -> outside <name>\`؛ وإن كانت الوحدة غير معروفة فاطبع \`<name> <addr> -> unknown module\`

تُطبع كل الأعداد بـ hex بأحرف صغيرة مع \`0x\` ودون حشو (‏\`f"{n:#x}"\` في Python).

**مثال**

المدخل:

\`\`\`
module checksum 555555554000-555555559000 0x100000
rt 0x555555555202
st checksum 0x101169
\`\`\`

المخرج:

\`\`\`
0x555555555202 -> checksum+0x1202 (static 0x101202)
checksum 0x101169 -> runtime 0x555555555169
\`\`\``,
      },
      starterCode: `import sys

modules = []   # (name, start, end, static_base)

for raw in sys.stdin:
    parts = raw.split()
    if not parts:
        continue
    if parts[0] == "module":
        _, name, span, static = parts
        start, end = (int(x, 16) for x in span.split("-"))
        modules.append((name, start, end, int(static, 16)))
    elif parts[0] == "rt":
        addr = int(parts[1], 16)
        # TODO 1: find the module with start <= addr < end.
        # TODO 2: offset = addr - start; print "<addr> -> <name>+<offset> (static <static_base + offset>)".
        # TODO 3: no module: "<addr> -> not in any module".
        print(f"{addr:#x} -> not in any module")
    elif parts[0] == "st":
        name, addr = parts[1], int(parts[2], 16)
        # TODO 4: offset = addr - static_base; check 0 <= offset < end - start;
        #         print the runtime address, "outside <name>" or "unknown module".
        print(f"{name} {addr:#x} -> unknown module")
`,
      solution: `import sys

modules = []   # (name, start, end, static_base)

for raw in sys.stdin:
    parts = raw.split()
    if not parts:
        continue
    if parts[0] == "module":
        _, name, span, static = parts
        start, end = (int(x, 16) for x in span.split("-"))
        modules.append((name, start, end, int(static, 16)))
    elif parts[0] == "rt":
        addr = int(parts[1], 16)
        hit = next((m for m in modules if m[1] <= addr < m[2]), None)
        if hit is None:
            print(f"{addr:#x} -> not in any module")
        else:
            offset = addr - hit[1]                  # the part ASLR does not change
            print(f"{addr:#x} -> {hit[0]}+{offset:#x} (static {hit[3] + offset:#x})")
    elif parts[0] == "st":
        name, addr = parts[1], int(parts[2], 16)
        mod = next((m for m in modules if m[0] == name), None)
        if mod is None:
            print(f"{name} {addr:#x} -> unknown module")
            continue
        offset = addr - mod[3]
        if 0 <= offset < mod[2] - mod[1]:
            print(f"{name} {addr:#x} -> runtime {mod[1] + offset:#x}")
        else:
            print(f"{name} {addr:#x} -> outside {name}")
`,
      hints: [
        { en: "`next((m for m in modules if m[1] <= addr < m[2]), None)` finds the first module containing the address, or `None`.", ar: "التعبير `next((m for m in modules if m[1] <= addr < m[2]), None)` يجد أول وحدة تحتوي العنوان، أو يعيد `None`." },
        { en: "The offset is the bridge: `offset = addr - start` for a runtime address, `offset = addr - static_base` for a static one. Add the other base to cross over.", ar: "الإزاحة هي الجسر: ‏`offset = addr - start` لعنوان وقت التشغيل، و`offset = addr - static_base` للعنوان الساكن. ثم أضف القاعدة الأخرى لتعبر إلى الجهة المقابلة." },
        { en: "For `st`, a valid offset satisfies `0 <= offset < end - start`. `f\"{n:#x}\"` prints `0x` plus lowercase hex, including `0x0`.", ar: "في \`st\` تحقق الإزاحة الصحيحة الشرط `0 <= offset < end - start`. والصيغة `f\"{n:#x}\"` تطبع `0x` ثم hex بأحرف صغيرة، بما في ذلك `0x0`." },
      ],
      tests: [
        { name: { en: "The worked example", ar: "المثال المحلول" }, stdin: `module checksum 555555554000-555555559000 0x100000
rt 0x555555555202
st checksum 0x101169
`, expected: `0x555555555202 -> checksum+0x1202 (static 0x101202)
checksum 0x101169 -> runtime 0x555555555169
` },
        { name: { en: "A backtrace through the program and libc, and a stack address", ar: "تتبّع رجوعي عبر البرنامج وlibc، وعنوان في الـstack" }, stdin: `module checksum 555555554000-555555559000 0x100000
module libc.so.6 7ffff7c00000-7ffff7e05000 0x0
rt 0x555555555179
rt 0x7ffff7c2a1ca
rt 0x7fffffffc6d0
`, expected: `0x555555555179 -> checksum+0x1179 (static 0x101179)
0x7ffff7c2a1ca -> libc.so.6+0x2a1ca (static 0x2a1ca)
0x7fffffffc6d0 -> not in any module
` },
        { name: { en: "Another run, another base: the static answer stays the same", ar: "تشغيل آخر وقاعدة أخرى: الجواب الساكن يبقى نفسه" }, stdin: `module checksum 5643a1b2e000-5643a1b33000 0x100000
rt 0x5643a1b2f202
st checksum 0x101169
`, expected: `0x5643a1b2f202 -> checksum+0x1202 (static 0x101202)
checksum 0x101169 -> runtime 0x5643a1b2f169
` },
        { name: { en: "Boundaries: the end address is outside, the start is inside", ar: "الحدود: عنوان النهاية خارج المدى والبداية داخله" }, stdin: `module demo 400000-401000 0x400000
rt 0x400000
rt 0x400fff
rt 0x401000
st demo 0x400fff
st demo 0x401000
st demo 0x3fffff
`, expected: `0x400000 -> demo+0x0 (static 0x400000)
0x400fff -> demo+0xfff (static 0x400fff)
0x401000 -> not in any module
demo 0x400fff -> runtime 0x400fff
demo 0x401000 -> outside demo
demo 0x3fffff -> outside demo
` },
        { name: { en: "Static addresses from objdump (base 0) and an unknown module", ar: "عناوين ساكنة من objdump (القاعدة 0) ووحدة غير معروفة" }, stdin: `module notes 55d0c4e4a000-55d0c4e4f000 0x0
st notes 0x1149
st ld.so 0x1000
module libc.so.6 7f12a3c00000-7f12a3e05000 0x0
st libc.so.6 0x87be0
`, expected: `notes 0x1149 -> runtime 0x55d0c4e4b149
ld.so 0x1000 -> unknown module
libc.so.6 0x87be0 -> runtime 0x7f12a3c87be0
` },
      ],
      sampleInput: `module checksum 555555554000-555555559000 0x100000
rt 0x555555555202
st checksum 0x101169
`,
    },
    {
      type: "text",
      body: {
        en: `## Tracing system calls with strace

A program can only touch files, the network or other processes by asking the kernel through **system calls**. Watching those calls gives you a summary of its behavior without reading a single instruction. On Linux the tool is \`strace\`; on Windows, Sysinternals **Process Monitor** plays a similar role for file, registry and process activity.

\`strace\` **runs the program**, so it belongs in the lab, never on a file you do not trust on your own machine. Real output (strace 6.8) for the lesson's notes program, which copies \`notes.txt\` to the screen and appends a line to \`log.txt\`:

\`\`\`
$ strace -e trace=openat,read,write,close ./notes
openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
read(3, "\\177ELF\\2\\1\\1\\3\\0\\0\\0\\0\\0\\0\\0\\0\\3\\0>\\0\\1\\0\\0\\0\\220\\243\\2\\0\\0\\0\\0\\0"..., 832) = 832
close(3)                                = 0
openat(AT_FDCWD, "notes.txt", O_RDONLY) = 3
read(3, "buy milk\\n", 64)               = 9
write(1, "buy milk\\n", 9)               = 9
close(3)                                = 0
openat(AT_FDCWD, "log.txt", O_WRONLY|O_CREAT|O_APPEND, 0644) = 3
write(3, "read notes\\n", 11)            = 11
close(3)                                = 0
+++ exited with 0 +++
\`\`\`

How to read a line: **name(arguments) = result**. \`openat\` returns a **file descriptor** (3), and later calls refer to that number, not to the name. Descriptors are **reused**: after \`close(3)\`, the next \`openat\` gets 3 again, so you must track which file each number means *at that moment*. Descriptors 0, 1 and 2 are stdin, stdout and stderr. A failure returns \`-1\` with an error name:

\`\`\`
openat(AT_FDCWD, "notes.txt", O_RDONLY) = -1 ENOENT (No such file or directory)
\`\`\`

Useful options: \`-f\` follows child processes, \`-e trace=file\` or \`-e trace=network\` selects families, \`-o trace.txt\` writes to a file (so the program's own output does not mix in), \`-s 200\` shows longer strings (the default is 32 characters), \`-p PID\` attaches to a running process, and \`-c\` prints a table of counts. The first lines of any dynamically linked program are the loader at work: opening libc, reading its ELF header, mapping it. Learn to skip them.`,
        ar: `## تتبّع استدعاءات النظام بـ strace

لا يستطيع البرنامج لمس الملفات أو الشبكة أو العمليات الأخرى إلا بأن يطلب ذلك من النواة عبر **استدعاءات النظام (system calls)**. ومراقبة هذه الاستدعاءات تعطيك ملخصاً لسلوكه دون قراءة تعليمة واحدة. على Linux الأداة هي \`strace\`؛ وعلى Windows يؤدي **Process Monitor** من Sysinternals دوراً مشابهاً لنشاط الملفات والسجل (registry) والعمليات.

الأداة \`strace\` **تشغّل البرنامج**، فمكانها المختبر، ولا تستخدمها أبداً على ملف لا تثق به في جهازك. هذا ناتج حقيقي (‏strace 6.8) لبرنامج الملاحظات في هذا الدرس، الذي ينسخ \`notes.txt\` إلى الشاشة ويضيف سطراً إلى \`log.txt\`:

\`\`\`
$ strace -e trace=openat,read,write,close ./notes
openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
read(3, "\\177ELF\\2\\1\\1\\3\\0\\0\\0\\0\\0\\0\\0\\0\\3\\0>\\0\\1\\0\\0\\0\\220\\243\\2\\0\\0\\0\\0\\0"..., 832) = 832
close(3)                                = 0
openat(AT_FDCWD, "notes.txt", O_RDONLY) = 3
read(3, "buy milk\\n", 64)               = 9
write(1, "buy milk\\n", 9)               = 9
close(3)                                = 0
openat(AT_FDCWD, "log.txt", O_WRONLY|O_CREAT|O_APPEND, 0644) = 3
write(3, "read notes\\n", 11)            = 11
close(3)                                = 0
+++ exited with 0 +++
\`\`\`

كيف تقرأ السطر: **الاسم(الوسائط) = النتيجة**. يعيد \`openat\` **واصف ملف (file descriptor)** هو 3، والاستدعاءات اللاحقة تشير إلى هذا الرقم لا إلى الاسم. والواصفات **يُعاد استخدامها**: بعد \`close(3)\` يحصل \`openat\` التالي على 3 من جديد، فعليك أن تتتبّع أي ملف يعنيه كل رقم *في تلك اللحظة*. والواصفات 0 و1 و2 هي stdin وstdout وstderr. والفشل يعيد \`-1\` مع اسم الخطأ:

\`\`\`
openat(AT_FDCWD, "notes.txt", O_RDONLY) = -1 ENOENT (No such file or directory)
\`\`\`

خيارات مفيدة: ‏\`-f\` يتبع العمليات الأبناء، و\`-e trace=file\` أو \`-e trace=network\` يختار عائلات من الاستدعاءات، و\`-o trace.txt\` يكتب في ملف (فلا يختلط ناتج البرنامج نفسه بالتتبّع)، و\`-s 200\` يعرض نصوصاً أطول (الافتراضي 32 محرفاً)، و\`-p PID\` يلتصق بعملية تعمل، و\`-c\` يطبع جدولاً بالأعداد. والأسطر الأولى في أي برنامج مربوط ديناميكياً هي عمل المُحمِّل: فتح libc وقراءة ترويسة ELF الخاصة بها وتحميلها. تعلّم أن تتخطاها.`,
      },
    },
    {
      type: "lab",
      id: "trace-report",
      lang: "javascript",
      prompt: {
        en: `## Summarize a system-call trace

Turn a raw \`strace -o\` log into the short report an analyst writes: which files were read or written, what failed, and how the program ended.

**Input:** the lines of a trace. Every call line looks like \`name(arguments) = result\`, possibly followed by an error name such as \`ENOENT\`. Other lines (signals starting with \`---\`, blank lines) are ignored, except the final \`+++ exited with N +++\` or \`+++ killed by SIGNAME ... +++\`.

**Rules**

- Descriptors 0, 1, 2 start as \`stdin\`, \`stdout\`, \`stderr\`.
- A successful \`open\` or \`openat\` maps the returned descriptor to its path (the first quoted string in the arguments) and adds the path to the report. \`close(fd)\` removes the mapping. A descriptor that was never opened is reported as \`fd N\`.
- A successful \`read\` or \`write\` adds its result (bytes) to the file its descriptor refers to **at that moment**.
- A failed call (result \`-1\` and an error name) does not change anything. Record \`failed: <name> <target> <ERROR>\`, where the target is the path for \`open\`, \`openat\` and \`access\`, the descriptor's file for \`read\`, \`write\` and \`close\`, and nothing for other calls (\`failed: <name> <ERROR>\`).

**Output**

1. one line per file, in the order they first appeared: \`<file>: read <bytes>, wrote <bytes>\`
2. the failures, in trace order
3. \`exit: <N>\`, \`exit: killed by <SIGNAME>\`, or \`exit: unknown\` if the trace has no final line

**Example**

Input:

\`\`\`
openat(AT_FDCWD, "notes.txt", O_RDONLY) = 3
read(3, "buy milk\\n", 64)               = 9
write(1, "buy milk\\n", 9)               = 9
close(3)                                = 0
openat(AT_FDCWD, "missing.txt", O_RDONLY) = -1 ENOENT (No such file or directory)
+++ exited with 0 +++
\`\`\`

Output:

\`\`\`
notes.txt: read 9, wrote 0
stdout: read 0, wrote 9
failed: openat missing.txt ENOENT
exit: 0
\`\`\``,
        ar: `## لخّص تتبّع استدعاءات النظام

حوّل سجل \`strace -o\` الخام إلى التقرير القصير الذي يكتبه المحلل: أي الملفات قُرئت أو كُتبت، وما الذي فشل، وكيف انتهى البرنامج.

**المدخل:** أسطر التتبّع. كل سطر استدعاء بالشكل \`name(arguments) = result\`، وقد يليه اسم خطأ مثل \`ENOENT\`. والأسطر الأخرى (الإشارات التي تبدأ بـ \`---\` والأسطر الفارغة) تُتجاهل، عدا السطر الأخير \`+++ exited with N +++\` أو \`+++ killed by SIGNAME ... +++\`.

**القواعد**

- تبدأ الواصفات 0 و1 و2 بالأسماء \`stdin\` و\`stdout\` و\`stderr\`.
- الاستدعاء الناجح لـ \`open\` أو \`openat\` يربط الواصف المُعاد بمساره (أول نص بين علامتي تنصيص في الوسائط) ويضيف المسار إلى التقرير. و\`close(fd)\` يزيل الربط. والواصف الذي لم يُفتح قط يظهر في التقرير باسم \`fd N\`.
- الاستدعاء الناجح لـ \`read\` أو \`write\` يضيف نتيجته (عدد البايتات) إلى الملف الذي يشير إليه واصفه **في تلك اللحظة**.
- الاستدعاء الفاشل (النتيجة \`-1\` مع اسم خطأ) لا يغيّر شيئاً. سجّل \`failed: <name> <target> <ERROR>\`، حيث الهدف هو المسار في \`open\` و\`openat\` و\`access\`، وملف الواصف في \`read\` و\`write\` و\`close\`، ولا شيء في بقية الاستدعاءات (‏\`failed: <name> <ERROR>\`).

**المخرج**

1. سطر لكل ملف بترتيب أول ظهور له: ‏\`<file>: read <bytes>, wrote <bytes>\`
2. حالات الفشل بترتيب التتبّع
3. ‏\`exit: <N>\`، أو \`exit: killed by <SIGNAME>\`، أو \`exit: unknown\` إن لم يكن في التتبّع سطر أخير

**مثال**

المدخل:

\`\`\`
openat(AT_FDCWD, "notes.txt", O_RDONLY) = 3
read(3, "buy milk\\n", 64)               = 9
write(1, "buy milk\\n", 9)               = 9
close(3)                                = 0
openat(AT_FDCWD, "missing.txt", O_RDONLY) = -1 ENOENT (No such file or directory)
+++ exited with 0 +++
\`\`\`

المخرج:

\`\`\`
notes.txt: read 9, wrote 0
stdout: read 0, wrote 9
failed: openat missing.txt ENOENT
exit: 0
\`\`\``,
      },
      starterCode: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");

const fds = new Map([[0, "stdin"], [1, "stdout"], [2, "stderr"]]); // descriptor -> what it refers to
const stats = new Map(); // file -> { read, wrote }; a Map remembers insertion order
const failures = [];
let exit = "unknown";

for (const line of lines) {
  // The last line: "+++ exited with 0 +++" or "+++ killed by SIGSEGV (core dumped) +++"
  const end = line.match(/^\\+\\+\\+ (?:exited with (\\d+)|killed by (\\w+)).*\\+\\+\\+$/);
  if (end) {
    exit = end[1] !== undefined ? end[1] : "killed by " + end[2];
    continue;
  }
  // A call line: name(args) = result [ERRNO ...]
  const call = line.match(/^(\\w+)\\((.*)\\)\\s+= (-?\\d+|\\?)(?: (E[A-Z0-9]+))?/);
  if (!call) continue;
  const [, name, args, ret, errno] = call;
  const path = (args.match(/"((?:[^"\\\\]|\\\\.)*)"/) || [])[1]; // first quoted string, if any
  const fd = Number(args.split(",")[0]);
  // TODO 1: if errno is set, push the "failed: ..." line (target depends on the call) and continue.
  // TODO 2: open/openat: map Number(ret) -> path and make sure the path has a stats entry.
  // TODO 3: read/write: add Number(ret) to the stats of fds.get(fd) (or "fd N").
  // TODO 4: close: delete the mapping.
  void name; void args; void ret; void errno; void path; void fd;
}

for (const [file, s] of stats) console.log(file + ": read " + s.read + ", wrote " + s.wrote);
for (const f of failures) console.log(f);
console.log("exit: " + exit);
`,
      solution: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");

const fds = new Map([[0, "stdin"], [1, "stdout"], [2, "stderr"]]); // descriptor -> what it refers to
const stats = new Map(); // file -> { read, wrote }; a Map remembers insertion order
const failures = [];
let exit = "unknown";

const statFor = (file) => {
  if (!stats.has(file)) stats.set(file, { read: 0, wrote: 0 });
  return stats.get(file);
};
const fdName = (fd) => fds.get(fd) ?? "fd " + fd;

for (const line of lines) {
  // The last line: "+++ exited with 0 +++" or "+++ killed by SIGSEGV (core dumped) +++"
  const end = line.match(/^\\+\\+\\+ (?:exited with (\\d+)|killed by (\\w+)).*\\+\\+\\+$/);
  if (end) {
    exit = end[1] !== undefined ? end[1] : "killed by " + end[2];
    continue;
  }
  // A call line: name(args) = result [ERRNO ...]
  const call = line.match(/^(\\w+)\\((.*)\\)\\s+= (-?\\d+|\\?)(?: (E[A-Z0-9]+))?/);
  if (!call) continue;
  const [, name, args, ret, errno] = call;
  const path = (args.match(/"((?:[^"\\\\]|\\\\.)*)"/) || [])[1]; // first quoted string, if any
  const fd = Number(args.split(",")[0]);
  const opens = name === "open" || name === "openat";

  if (errno) {
    let target = "";
    if (opens || name === "access") target = " " + path;
    else if (name === "read" || name === "write" || name === "close") target = " " + fdName(fd);
    failures.push("failed: " + name + target + " " + errno);
    continue; // a failed call changes nothing
  }
  const result = Number(ret);
  if (opens) {
    fds.set(result, path); // descriptors are reused: always overwrite
    statFor(path);
  } else if (name === "read") {
    statFor(fdName(fd)).read += result;
  } else if (name === "write") {
    statFor(fdName(fd)).wrote += result;
  } else if (name === "close") {
    fds.delete(fd);
  }
}

for (const [file, s] of stats) console.log(file + ": read " + s.read + ", wrote " + s.wrote);
for (const f of failures) console.log(f);
console.log("exit: " + exit);
`,
      hints: [
        { en: "Keep a `Map` from descriptor to file name and overwrite it on every successful open: descriptor 3 can mean three different files during one run.", ar: "احتفظ بـ `Map` من الواصف إلى اسم الملف واستبدل القيمة عند كل فتح ناجح: قد يعني الواصف 3 ثلاثة ملفات مختلفة خلال تشغيل واحد." },
        { en: "A small helper `statFor(file)` that creates `{ read: 0, wrote: 0 }` on first use keeps the report in first-seen order, because a `Map` iterates in insertion order.", ar: "دالة مساعدة صغيرة `statFor(file)` تنشئ `{ read: 0, wrote: 0 }` عند أول استخدام تحفظ التقرير بترتيب أول ظهور، لأن `Map` يمرّ على عناصره بترتيب إدخالها." },
        { en: "Check `errno` before anything else and `continue`: a failed `openat` must not map a descriptor, and a failed `write` must not add bytes.", ar: "افحص `errno` قبل أي شيء آخر ثم `continue`: لا يجوز لـ `openat` فاشل أن يربط واصفاً، ولا لـ `write` فاشل أن يضيف بايتات." },
      ],
      tests: [
        { name: { en: "The worked example", ar: "المثال المحلول" }, stdin: `openat(AT_FDCWD, "notes.txt", O_RDONLY) = 3
read(3, "buy milk\\n", 64)               = 9
write(1, "buy milk\\n", 9)               = 9
close(3)                                = 0
openat(AT_FDCWD, "missing.txt", O_RDONLY) = -1 ENOENT (No such file or directory)
+++ exited with 0 +++
`, expected: `notes.txt: read 9, wrote 0
stdout: read 0, wrote 9
failed: openat missing.txt ENOENT
exit: 0
` },
        { name: { en: "The lesson's real trace, loader lines included", ar: "التتبّع الحقيقي في الدرس، مع أسطر المُحمِّل" }, stdin: `execve("./notes", ["./notes"], 0x7ffd3c1a2b40 /* 24 vars */) = 0
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
read(3, "\\177ELF\\2\\1\\1\\3\\0\\0\\0\\0\\0\\0\\0\\0\\3\\0>\\0\\1\\0\\0\\0\\220\\243\\2\\0\\0\\0\\0\\0"..., 832) = 832
close(3)                                = 0
openat(AT_FDCWD, "notes.txt", O_RDONLY) = 3
read(3, "buy milk\\n", 64)               = 9
write(1, "buy milk\\n", 9)               = 9
close(3)                                = 0
openat(AT_FDCWD, "log.txt", O_WRONLY|O_CREAT|O_APPEND, 0644) = 3
write(3, "read notes\\n", 11)            = 11
close(3)                                = 0
exit_group(0)                           = ?
+++ exited with 0 +++
`, expected: `/lib/x86_64-linux-gnu/libc.so.6: read 832, wrote 0
notes.txt: read 9, wrote 0
stdout: read 0, wrote 9
log.txt: read 0, wrote 11
failed: access /etc/ld.so.preload ENOENT
exit: 0
` },
        { name: { en: "Reused descriptors, a file opened twice, an inherited fd and tricky strings", ar: "واصفات مُعاد استخدامها، وملف فُتح مرتين، وواصف موروث، ونصوص مخادعة" }, stdin: `openat(AT_FDCWD, "config.ini", O_RDONLY) = 3
read(3, "[app]\\nname=demo\\n", 4096)     = 16
read(3, "", 4096)                       = 0
close(3)                                = 0
openat(AT_FDCWD, "data.csv", O_RDONLY)  = 3
read(3, "a,b\\n1,2\\n", 4096)             = 8
close(3)                                = 0
openat(AT_FDCWD, "config.ini", O_RDONLY) = 4
read(4, "[app]\\nname=demo\\n", 4096)     = 16
close(4)                                = 0
write(5, "inherited\\n", 10)             = 10
write(1, "a, \\"b\\" = c\\n", 11)          = 11
exit_group(0)                           = ?
+++ exited with 0 +++
`, expected: `config.ini: read 32, wrote 0
data.csv: read 8, wrote 0
fd 5: read 0, wrote 10
stdout: read 0, wrote 11
exit: 0
` },
        { name: { en: "Failures of every kind and a non-zero exit", ar: "حالات فشل من كل نوع وخروج بقيمة غير صفرية" }, stdin: `openat(AT_FDCWD, "notes.txt", O_RDONLY) = -1 ENOENT (No such file or directory)
write(2, "notes.txt: No such file or directory\\n", 37) = 37
mkdir("out", 0755)                      = -1 EEXIST (File exists)
write(7, "x", 1)                        = -1 EBADF (Bad file descriptor)
close(9)                                = -1 EBADF (Bad file descriptor)
exit_group(1)                           = ?
+++ exited with 1 +++
`, expected: `stderr: read 0, wrote 37
failed: openat notes.txt ENOENT
failed: mkdir EEXIST
failed: write fd 7 EBADF
failed: close fd 9 EBADF
exit: 1
` },
        { name: { en: "Killed by a signal", ar: "أُنهي بإشارة" }, stdin: `openat(AT_FDCWD, "input.bin", O_RDONLY) = 3
read(3, "\\0\\0\\0\\20", 4)                 = 4
--- SIGSEGV {si_signo=SIGSEGV, si_code=SEGV_MAPERR, si_addr=NULL} ---
+++ killed by SIGSEGV (core dumped) +++
`, expected: `input.bin: read 4, wrote 0
exit: killed by SIGSEGV
` },
        { name: { en: "An empty trace", ar: "تتبّع فارغ" }, stdin: "", expected: `exit: unknown
` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Bytecode virtual machines

Not every program you analyze is machine code. Many run on a **virtual machine**: a program (the interpreter) that reads instructions for an imaginary CPU, one at a time, and carries them out. You already use several:

- **CPython** compiles \`.py\` files to bytecode (cached in \`.pyc\` files) and interprets it
- the **JVM** runs Java bytecode from \`.class\` files, and **.NET** runs CIL
- **Lua**, **WebAssembly** and Linux **eBPF** programs are bytecode too
- some commercial software protectors translate parts of a program into a **custom bytecode** with a private instruction set, executed by an interpreter they embed: the original x86 code no longer exists in the file

Every interpreter has the same heart, the **dispatch loop**:

\`\`\`
pc = 0
loop:
    opcode = code[pc]                  # fetch
    handler = table[opcode]            # decode: a switch or a jump table
    run handler, which reads operands  # execute
    and updates pc                     # then go back to "loop"
\`\`\`

In a disassembler this shape is easy to spot: one big loop around an indirect jump (\`jmp [table + rax*8]\`) or a long \`switch\`. A method that works:

1. **Find the dispatch loop** and the variable that acts as the virtual \`pc\`
2. **Recover the opcode table**: for each handler, what it reads and what it changes
3. **Write your own disassembler** for the bytecode, so you can read the program
4. **Write your own interpreter**, with tracing and **breakpoints**, so you can watch it run, safely and in slow motion, outside the original binary

The standard-library module \`dis\` shows CPython's own bytecode. The instructions you get depend on the Python version, which is a good lesson in itself: identify the exact VM version before you trust an opcode table.`,
        ar: `## الآلات الافتراضية للـbytecode

ليس كل برنامج تحلّله كود آلة. فبرامج كثيرة تعمل على **آلة افتراضية (virtual machine)**: برنامج (المفسِّر interpreter) يقرأ تعليمات لمعالج متخيَّل، واحدة في كل مرة، وينفّذها. وأنت تستخدم عدة آلات منها أصلاً:

- يصرّف **CPython** ملفات \`.py\` إلى bytecode (يُخزَّن مؤقتاً في ملفات \`.pyc\`) ثم يفسّره
- تشغّل **JVM** الـbytecode الخاص بـ Java من ملفات \`.class\`، وتشغّل **‎.NET** لغة CIL
- برامج **Lua** و**WebAssembly** و**eBPF** في Linux هي bytecode أيضاً
- بعض أدوات حماية البرمجيات التجارية تترجم أجزاء من البرنامج إلى **bytecode مخصّص** بمجموعة تعليمات خاصة، ينفّذه مفسِّر تضمّنه في الملف: كود x86 الأصلي لم يعد موجوداً في الملف

لكل مفسِّر القلب نفسه، **حلقة التوزيع (dispatch loop)**:

\`\`\`
pc = 0
loop:
    opcode = code[pc]                  # fetch
    handler = table[opcode]            # decode: a switch or a jump table
    run handler, which reads operands  # execute
    and updates pc                     # then go back to "loop"
\`\`\`

وفي المفكِّك يسهل التعرّف على هذا الشكل: حلقة كبيرة واحدة حول قفزة غير مباشرة (‏\`jmp [table + rax*8]\`) أو \`switch\` طويل. وهذه طريقة ناجحة:

1. **اعثر على حلقة التوزيع** وعلى المتغير الذي يؤدي دور \`pc\` الافتراضي
2. **استعد جدول رموز العمليات (opcode table)**: لكل معالج (handler)، ماذا يقرأ وماذا يغيّر
3. **اكتب مفكِّكك الخاص** للـbytecode لتستطيع قراءة البرنامج
4. **اكتب مفسِّرك الخاص** مع التتبّع و**نقاط التوقف**، لتشاهده يعمل بأمان وبالحركة البطيئة، خارج الملف الأصلي

الوحدة \`dis\` في المكتبة القياسية تعرض الـbytecode الخاص بـ CPython نفسه. والتعليمات التي تحصل عليها تعتمد على إصدار Python، وهذا درس مفيد بحد ذاته: حدّد إصدار الآلة الافتراضية بدقة قبل أن تثق بجدول رموز العمليات.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `import dis
import sys


def checksum(s):
    total = 0
    for ch in s:
        total = total * 31 + ord(ch)
    return total


print("Python", sys.version.split()[0])
print("checksum('lab') =", checksum("lab"))   # the same value as the C program under GDB
print()
dis.dis(checksum)                             # the bytecode CPython's VM really executes`,
      explanation: {
        en: "Run it and find the dispatch-loop idea in the listing: each line is one VM instruction with an offset (the virtual pc), an opcode name and an operand. Look for the backward jump that closes the `for` loop. If you run the same code on another Python version, the opcodes differ, while the result 106893 stays the same.",
        ar: "شغّله وابحث في القائمة عن فكرة حلقة التوزيع: كل سطر تعليمة واحدة للآلة الافتراضية مع إزاحة (الـpc الافتراضي) واسم رمز العملية ومعامل. ابحث عن القفزة للخلف التي تغلق حلقة `for`. وإن شغّلت الكود نفسه على إصدار آخر من Python فستختلف رموز العمليات، بينما تبقى النتيجة 106893 كما هي.",
      },
    },
    {
      type: "lab",
      id: "vm-breakpoints",
      lang: "c",
      prompt: {
        en: `## A bytecode VM with breakpoints

You recovered the opcode table of a tiny register machine. Write its interpreter, with debugger-style **breakpoints**, so you can watch the program run.

The machine has four registers \`r0\`-\`r3\` (signed 64-bit, starting at 0) and a program counter \`pc\` starting at 0. Instructions (operands are single bytes that follow the opcode):

\`\`\`
00          HALT          stop
01 r n      MOVI r, n     r = n            (n is 0-255)
02 r s      ADD  r, s     r = r + s
03 r s      SUB  r, s     r = r - s
04 r s      XOR  r, s     r = r ^ s
05 r        DEC  r        r = r - 1
06 r a      JNZ  r, a     if r != 0, pc = a
07 r        OUT  r        print r in decimal and a newline
08 a        JMP  a        pc = a
\`\`\`

**Input:** the first line is \`break\` followed by zero or more breakpoint addresses (\`0x05\` or \`5\`). The rest is the program as hex bytes. In every test, register operands are 0-3 and the last instruction is complete.

**Rules**

- **Before** executing the instruction at \`pc\`, if \`pc\` is a breakpoint print \`break 0x<pc as 2 hex digits>: r0=<v> r1=<v> r2=<v> r3=<v>\`.
- \`HALT\`, or running past the last byte, ends the run: print \`halted after <N> steps\` (N counts executed instructions, \`HALT\` included).
- Faults end the run at once: an unknown opcode prints \`fault at 0x<pc>: unknown opcode 0x<op>\`; a **taken** jump to an address at or beyond the program length prints \`fault at 0x<pc>: jump outside program\` (\`pc\` of the jump).
- A watchdog: when 10000 instructions have run and another one is due, print \`step limit reached\` and stop.

**Example**

Input (count down from 3; break before \`DEC\`):

\`\`\`
break 0x05
01 00 03 07 00 05 00 06 00 03 00
\`\`\`

Output:

\`\`\`
3
break 0x05: r0=3 r1=0 r2=0 r3=0
2
break 0x05: r0=2 r1=0 r2=0 r3=0
1
break 0x05: r0=1 r1=0 r2=0 r3=0
halted after 11 steps
\`\`\``,
        ar: `## آلة bytecode افتراضية بنقاط توقف

استعدت جدول رموز العمليات لآلة registers صغيرة جداً. اكتب مفسِّرها مع **نقاط توقف** على طريقة المنقّحات، لتشاهد البرنامج يعمل.

للآلة أربعة registers هي \`r0\`-\`r3\` (‏64-bit بإشارة، تبدأ بصفر) وعدّاد برنامج \`pc\` يبدأ بصفر. التعليمات (المعاملات بايتات مفردة تلي رمز العملية):

\`\`\`
00          HALT          stop
01 r n      MOVI r, n     r = n            (n is 0-255)
02 r s      ADD  r, s     r = r + s
03 r s      SUB  r, s     r = r - s
04 r s      XOR  r, s     r = r ^ s
05 r        DEC  r        r = r - 1
06 r a      JNZ  r, a     if r != 0, pc = a
07 r        OUT  r        print r in decimal and a newline
08 a        JMP  a        pc = a
\`\`\`

**المدخل:** السطر الأول هو \`break\` تتبعه صفر أو أكثر من عناوين نقاط التوقف (‏\`0x05\` أو \`5\`). والباقي هو البرنامج كبايتات hex. وفي كل الاختبارات تكون معاملات الـregisters من 0 إلى 3 وتكون آخر تعليمة كاملة.

**القواعد**

- **قبل** تنفيذ التعليمة عند \`pc\`، إن كان \`pc\` نقطة توقف فاطبع \`break 0x<pc as 2 hex digits>: r0=<v> r1=<v> r2=<v> r3=<v>\`.
- ‏\`HALT\`، أو تجاوز آخر بايت، ينهي التشغيل: اطبع \`halted after <N> steps\` (‏N عدد التعليمات المنفَّذة، ومنها \`HALT\`).
- الأعطال تنهي التشغيل فوراً: رمز عملية غير معروف يطبع \`fault at 0x<pc>: unknown opcode 0x<op>\`؛ والقفزة **المنفَّذة** إلى عنوان يساوي طول البرنامج أو يتجاوزه تطبع \`fault at 0x<pc>: jump outside program\` (‏\`pc\` الخاص بالقفزة).
- مؤقّت حراسة (watchdog): عندما تُنفَّذ 10000 تعليمة ويحين دور تعليمة أخرى، اطبع \`step limit reached\` وتوقف.

**مثال**

المدخل (عدّ تنازلي من 3، مع توقف قبل \`DEC\`):

\`\`\`
break 0x05
01 00 03 07 00 05 00 06 00 03 00
\`\`\`

المخرج:

\`\`\`
3
break 0x05: r0=3 r1=0 r2=0 r3=0
2
break 0x05: r0=2 r1=0 r2=0 r3=0
1
break 0x05: r0=1 r1=0 r2=0 r3=0
halted after 11 steps
\`\`\``,
      },
      starterCode: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define LIMIT 10000

static unsigned char prog[256];
static int len = 0;
static int is_break[256];
static long long r[4];

int main(void) {
    char line[1024];
    /* Line 1: "break" and the breakpoint addresses. */
    if (fgets(line, sizeof line, stdin)) {
        char *tok = strtok(line, " \\t\\r\\n");          /* the word "break" */
        while ((tok = strtok(NULL, " \\t\\r\\n")) != NULL) {
            long a = strtol(tok, NULL, 0);              /* base 0 accepts 0x05 and 5 */
            if (a >= 0 && a < 256) is_break[a] = 1;
        }
    }
    unsigned int byte;
    while (len < 256 && scanf("%x", &byte) == 1) prog[len++] = (unsigned char)byte;

    int pc = 0, steps = 0;
    while (pc < len) {
        /* TODO 1: the watchdog: if steps == LIMIT, print "step limit reached" and stop. */
        /* TODO 2: if is_break[pc], print the "break 0x..: r0=.. r1=.. r2=.. r3=.." line. */
        /* TODO 3: fetch prog[pc], count the step, and execute HALT, MOVI, ADD, SUB, XOR, DEC,
                   JNZ, OUT and JMP; advance pc by the instruction's length (1, 2 or 3 bytes). */
        /* TODO 4: the two faults: unknown opcode, and a taken jump to an address >= len. */
        pc++;
        steps++;
    }
    printf("halted after %d steps\\n", steps);
    (void)r;
    return 0;
}
`,
      solution: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define LIMIT 10000

static unsigned char prog[256];
static int len = 0;
static int is_break[256];
static long long r[4];

int main(void) {
    char line[1024];
    /* Line 1: "break" and the breakpoint addresses. */
    if (fgets(line, sizeof line, stdin)) {
        char *tok = strtok(line, " \\t\\r\\n");          /* the word "break" */
        while ((tok = strtok(NULL, " \\t\\r\\n")) != NULL) {
            long a = strtol(tok, NULL, 0);              /* base 0 accepts 0x05 and 5 */
            if (a >= 0 && a < 256) is_break[a] = 1;
        }
    }
    unsigned int byte;
    while (len < 256 && scanf("%x", &byte) == 1) prog[len++] = (unsigned char)byte;

    int pc = 0, steps = 0;
    while (pc < len) {
        if (steps == LIMIT) {                           /* the watchdog */
            printf("step limit reached\\n");
            return 0;
        }
        if (is_break[pc]) {                             /* stop BEFORE the instruction runs */
            printf("break 0x%02x: r0=%lld r1=%lld r2=%lld r3=%lld\\n", pc, r[0], r[1], r[2], r[3]);
        }
        int at = pc, op = prog[pc];
        steps++;
        if (op == 0x00) {                               /* HALT */
            break;
        } else if (op == 0x01) {                        /* MOVI r, n */
            r[prog[pc + 1]] = prog[pc + 2];
            pc += 3;
        } else if (op >= 0x02 && op <= 0x04) {          /* ADD / SUB / XOR r, s */
            long long *d = &r[prog[pc + 1]];
            long long s = r[prog[pc + 2]];
            *d = op == 0x02 ? *d + s : op == 0x03 ? *d - s : (*d ^ s);
            pc += 3;
        } else if (op == 0x05) {                        /* DEC r */
            r[prog[pc + 1]]--;
            pc += 2;
        } else if (op == 0x06 || op == 0x08) {          /* JNZ r, a  /  JMP a */
            int taken = op == 0x08 || r[prog[pc + 1]] != 0;
            int target = op == 0x08 ? prog[pc + 1] : prog[pc + 2];
            pc += op == 0x08 ? 2 : 3;
            if (taken) {
                if (target >= len) {
                    printf("fault at 0x%02x: jump outside program\\n", at);
                    return 0;
                }
                pc = target;
            }
        } else if (op == 0x07) {                        /* OUT r */
            printf("%lld\\n", r[prog[pc + 1]]);
            pc += 2;
        } else {
            printf("fault at 0x%02x: unknown opcode 0x%02x\\n", at, op);
            return 0;
        }
    }
    printf("halted after %d steps\\n", steps);           /* HALT, or ran past the last byte */
    return 0;
}
`,
      hints: [
        { en: "Print the breakpoint line at the top of the loop, before you fetch the opcode, and count the step right after the fetch, so `HALT` is counted too.", ar: "اطبع سطر نقطة التوقف في أعلى الحلقة قبل جلب رمز العملية، وعُدّ الخطوة بعد الجلب مباشرة، حتى تُحسب \`HALT\` أيضاً." },
        { en: "Instruction lengths: HALT 1; DEC, OUT, JMP 2; MOVI, ADD, SUB, XOR, JNZ 3. For jumps, first move `pc` past the instruction, then replace it with the target only when the jump is taken.", ar: "أطوال التعليمات: ‏HALT ‏1؛ وDEC وOUT وJMP ‏2؛ وMOVI وADD وSUB وXOR وJNZ ‏3. وفي القفزات، حرّك \`pc\` أولاً إلى ما بعد التعليمة، ثم استبدله بالهدف فقط حين تُنفَّذ القفزة." },
        { en: "Remember the address of the instruction (`int at = pc;`) before you change `pc`: the fault messages report where the faulty instruction started. A `break` out of the loop can share the final `halted after` line with running past the end.", ar: "احفظ عنوان التعليمة (‏`int at = pc;`) قبل أن تغيّر `pc`: رسائل الأعطال تذكر أين بدأت التعليمة المعطوبة. ويمكن أن يشترك الخروج من الحلقة بـ `break` في سطر `halted after` الأخير مع حالة تجاوز النهاية." },
      ],
      tests: [
        { name: { en: "The worked example: a countdown with a breakpoint", ar: "المثال المحلول: عدّ تنازلي مع نقطة توقف" }, stdin: `break 0x05
01 00 03 07 00 05 00 06 00 03 00
`, expected: `3
break 0x05: r0=3 r1=0 r2=0 r3=0
2
break 0x05: r0=2 r1=0 r2=0 r3=0
1
break 0x05: r0=1 r1=0 r2=0 r3=0
halted after 11 steps
` },
        { name: { en: "No breakpoints: the sum 5 + 4 + 3 + 2 + 1", ar: "بلا نقاط توقف: المجموع 5 + 4 + 3 + 2 + 1" }, stdin: `break
01 00 05 01 01 00 02 01 00 05 00 06 00 06 07 01 00
`, expected: `15
halted after 19 steps
` },
        { name: { en: "Watch an XOR decode a value; one breakpoint is never hit and the program runs off its end", ar: "راقب XOR وهو يفك قيمة؛ نقطة توقف لا تُصاب أبداً والبرنامج يتجاوز نهايته" }, stdin: `break 6 0x09 0x40
01 02 5a 01 03 2a 04 02 03 07 02
`, expected: `break 0x06: r0=0 r1=0 r2=90 r3=42
break 0x09: r0=0 r1=0 r2=112 r3=42
112
halted after 4 steps
` },
        { name: { en: "Output first, then an unknown opcode", ar: "مخرجات أولاً ثم رمز عملية غير معروف" }, stdin: `break 0x03
01 01 07 07 01 09 01
`, expected: `break 0x03: r0=0 r1=7 r2=0 r3=0
7
fault at 0x05: unknown opcode 0x09
` },
        { name: { en: "A jump that is not taken may point anywhere; a taken one may not", ar: "القفزة غير المنفَّذة قد تشير إلى أي مكان؛ أما المنفَّذة فلا" }, stdin: `break
01 00 00 06 00 ff 01 01 01 06 01 ff
`, expected: `fault at 0x09: jump outside program
` },
        { name: { en: "An endless loop meets the watchdog", ar: "حلقة لا نهائية تصطدم بمؤقّت الحراسة" }, stdin: `break
01 00 01 08 03
`, expected: `step limit reached
` },
      ],
      sampleInput: `break 0x05
01 00 03 07 00 05 00 06 00 03 00
`,
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "A software breakpoint (int3, 0xCC) has just trapped on x86-64. What must the debugger do before the program can continue correctly?", ar: "انطلقت للتوّ نقطة توقف برمجية (int3، ‏0xCC) على x86-64. ماذا يجب أن يفعل المنقّح قبل أن يتابع البرنامج بشكل صحيح؟" },
          choices: [
            { en: "Nothing: int3 is skipped automatically", ar: "لا شيء: تُتخطّى int3 تلقائياً" },
            { en: "Move rip back one byte, restore the original byte, single-step it, then write 0xCC again", ar: "يعيد rip بايتاً واحداً إلى الخلف، ويعيد البايت الأصلي، وينفّذه خطوة واحدة، ثم يكتب 0xCC من جديد" },
            { en: "Restart the program from the entry point", ar: "يعيد تشغيل البرنامج من نقطة الدخول" },
            { en: "Delete the instruction that was under the breakpoint", ar: "يحذف التعليمة التي كانت تحت نقطة التوقف" },
          ],
          answer: 1,
          explain: {
            en: "After int3 executes, rip points one byte past it, and the real instruction's first byte is still overwritten. The debugger rewinds, restores the byte, single-steps with the trap flag and re-arms the breakpoint, so the program behaves as if nothing happened.",
            ar: "بعد تنفيذ int3 يشير rip إلى ما بعدها ببايت واحد، وما زال أول بايت من التعليمة الحقيقية مكتوباً فوقه. فيعيد المنقّح rip إلى الخلف، ويعيد البايت، وينفّذ خطوة واحدة بعلم trap flag، ثم يعيد تفعيل نقطة التوقف، فيتصرف البرنامج كأن شيئاً لم يحدث.",
          },
        },
        {
          q: { en: "GDB reports a crash at 0x555555555202. The program's first mapping starts at 0x555555554000, and Ghidra loaded the file at 0x100000. Where do you look in Ghidra?", ar: "يبلّغ GDB عن انهيار عند 0x555555555202. تبدأ أول منطقة للبرنامج عند 0x555555554000، وقد حمّل Ghidra الملف عند 0x100000. أين تبحث في Ghidra؟" },
          choices: [
            { en: "0x555555555202", ar: "0x555555555202" },
            { en: "0x1202", ar: "0x1202" },
            { en: "0x101202", ar: "0x101202" },
            { en: "0x100000", ar: "0x100000" },
          ],
          answer: 2,
          explain: {
            en: "The offset inside the module survives ASLR: 0x555555555202 - 0x555555554000 = 0x1202. Add Ghidra's base 0x100000 to get 0x101202. 0x1202 is the right answer for objdump or nm, which use base 0, not for this Ghidra project.",
            ar: "الإزاحة داخل الوحدة تنجو من ASLR: ‏0x555555555202 - 0x555555554000 = 0x1202. أضف قاعدة Ghidra ‏0x100000 فتحصل على 0x101202. أما 0x1202 فهو الجواب الصحيح في objdump أو nm اللذين يستخدمان القاعدة 0، لا في مشروع Ghidra هذا.",
          },
        },
        {
          q: { en: "Which statement about strace is correct?", ar: "أي عبارة عن strace صحيحة؟" },
          choices: [
            { en: "It runs the program and reports each system call with its arguments and result, so it belongs in an isolated lab", ar: "يشغّل البرنامج ويبلّغ عن كل استدعاء نظام بوسائطه ونتيجته، فمكانه مختبر معزول" },
            { en: "It only reads the file, like readelf, so it is safe on any sample", ar: "يقرأ الملف فقط مثل readelf، فهو آمن على أي عينة" },
            { en: "It shows every machine instruction the program executes", ar: "يعرض كل تعليمة آلة ينفّذها البرنامج" },
            { en: "It can only be used on programs that have debug symbols", ar: "لا يُستخدم إلا مع برامج فيها رموز تنقيح" },
          ],
          answer: 0,
          explain: {
            en: "strace is a ptrace-based tracer that starts or attaches to a real process and logs its system calls, not its individual instructions. Because the program genuinely runs, the lab rules apply, and it needs no debug symbols at all.",
            ar: "‏strace متتبِّع مبني على ptrace يشغّل عملية حقيقية أو يلتصق بها ويسجّل استدعاءات النظام لا التعليمات المفردة. ولأن البرنامج يعمل فعلاً فقواعد المختبر تنطبق، وهو لا يحتاج إلى رموز تنقيح إطلاقاً.",
          },
        },
        {
          q: { en: "You must run a program you are studying. Which setup is the safest?", ar: "يجب أن تشغّل برنامجاً تدرسه. أي إعداد هو الأكثر أماناً؟" },
          choices: [
            { en: "Your everyday laptop, with the antivirus switched on", ar: "حاسوبك المحمول اليومي مع تشغيل برنامج مكافحة الفيروسات" },
            { en: "A container on your laptop with your home folder mounted inside", ar: "حاوية (container) على حاسوبك مع ربط مجلد المنزل بداخلها" },
            { en: "A cloud server that is logged in to your company accounts", ar: "خادم سحابي مسجّل الدخول إلى حسابات شركتك" },
            { en: "A virtual machine with a clean snapshot, no shared folders or clipboard, and no network route out", ar: "جهاز افتراضي بلقطة نظيفة، دون مجلدات أو حافظة مشتركة، ودون طريق شبكي إلى الخارج" },
          ],
          answer: 3,
          explain: {
            en: "The VM isolates the program from your real files, accounts and network, and reverting the snapshot erases whatever it changed. The other options all put real data or credentials within reach of the program you are running.",
            ar: "يعزل الجهاز الافتراضي البرنامج عن ملفاتك وحساباتك وشبكتك الحقيقية، والرجوع إلى اللقطة يمحو كل ما غيّره. أما الخيارات الأخرى فكلها تضع بيانات حقيقية أو بيانات اعتماد في متناول البرنامج الذي تشغّله.",
          },
        },
        {
          q: { en: "A protected program runs most of its logic inside an embedded bytecode interpreter. What is the best first goal?", ar: "برنامج محمي ينفّذ معظم منطقه داخل مفسِّر bytecode مضمَّن فيه. ما أفضل هدف أول؟" },
          choices: [
            { en: "Decompile the bytecode bytes as if they were x86 code", ar: "فك تجميع بايتات الـbytecode كأنها كود x86" },
            { en: "Find the dispatch loop and recover what each opcode handler does", ar: "العثور على حلقة التوزيع واستعادة ما يفعله كل معالج لرمز عملية" },
            { en: "Patch random bytes until the behavior changes", ar: "تعديل بايتات عشوائية حتى يتغيّر السلوك" },
            { en: "Give up, since virtual machines cannot be analyzed", ar: "الاستسلام لأن الآلات الافتراضية لا يمكن تحليلها" },
          ],
          answer: 1,
          explain: {
            en: "The bytecode only means something to its interpreter, so the interpreter is the key: locate its fetch-decode-execute loop, map each opcode to its handler, then write your own disassembler and tracer. Reading the bytecode as x86 produces nonsense.",
            ar: "لا معنى للـbytecode إلا عند مفسِّره، فالمفسِّر هو المفتاح: حدّد حلقة الجلب والفك والتنفيذ، واربط كل رمز عملية بمعالجه، ثم اكتب مفكِّكك ومتتبِّعك الخاصين. أما قراءة الـbytecode على أنه x86 فتنتج هراءً.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary and what to practice next

- Dynamic analysis **runs the code**: always in a disposable VM with snapshots, no shared folders and a controlled network, and only on permitted programs
- Debuggers use **ptrace**; a software breakpoint is \`int3\` (0xCC) written over an instruction, then rewind, restore, single-step and re-arm; hardware breakpoints use \`DR0\`-\`DR3\`
- In GDB: \`break\`, \`run\`, \`stepi\`/\`nexti\`, \`x/…\`, \`info registers\`, \`bt\`, \`finish\`, \`info proc mappings\`
- Under **ASLR**, convert with the module offset: static = static base + (runtime − runtime base)
- \`strace\` shows **system calls**: track descriptors carefully, since they are reused
- Bytecode VMs are studied through their **dispatch loop**: recover the opcodes, then write your own disassembler and interpreter with breakpoints

**Practice next:** compile the lesson's checksum program yourself, run it under GDB, and find the loop's backward jump with \`x/20i\`; set a \`watch\` on \`sum\` and watch it change. Trace your own small programs with \`strace -f -o trace.txt\` and feed the log to your trace-report tool. Extend your VM with a \`trace\` mode that prints every instruction, and a tiny disassembler for the same bytecode. Next: the rules of the road in depth, with law, ethics and responsible disclosure.`,
        ar: `## الخلاصة وماذا تتدرّب عليه بعد ذلك

- التحليل الديناميكي **يشغّل الكود**: دائماً داخل جهاز افتراضي يمكن التخلص منه مع لقطات، ودون مجلدات مشتركة، وبشبكة مضبوطة، وعلى برامج مصرَّح بها فقط
- تستخدم المنقّحات **ptrace**؛ ونقطة التوقف البرمجية هي \`int3\` ‏(0xCC) تُكتب فوق تعليمة، ثم إرجاع وإعادة البايت وخطوة واحدة وإعادة تفعيل؛ ونقاط التوقف العتادية تستخدم \`DR0\`-\`DR3\`
- في GDB: ‏\`break\` و\`run\` و\`stepi\`/\`nexti\` و\`x/…\` و\`info registers\` و\`bt\` و\`finish\` و\`info proc mappings\`
- في ظل **ASLR** حوّل بإزاحة الوحدة: العنوان الساكن = القاعدة الساكنة + (عنوان التشغيل − قاعدة التشغيل)
- يعرض \`strace\` **استدعاءات النظام**: تتبّع الواصفات بعناية لأنها يُعاد استخدامها
- تُدرس آلات الـbytecode الافتراضية عبر **حلقة التوزيع**: استعد رموز العمليات ثم اكتب مفكِّكك ومفسِّرك الخاصين بنقاط توقف

**تدرّب بعد ذلك:** صرّف برنامج الـchecksum في هذا الدرس بنفسك، وشغّله تحت GDB، وابحث عن قفزة الحلقة للخلف بالأمر \`x/20i\`؛ وضع \`watch\` على \`sum\` وشاهده يتغير. تتبّع برامجك الصغيرة بـ \`strace -f -o trace.txt\` وأعطِ السجل لأداة تلخيص التتبّع التي كتبتها. ووسّع آلتك الافتراضية بوضع \`trace\` يطبع كل تعليمة، وبمفكِّك صغير للـbytecode نفسه. والتالي: قواعد الطريق بالتفصيل، مع القانون والأخلاقيات والإفصاح المسؤول.`,
      },
    },
  ],
};
