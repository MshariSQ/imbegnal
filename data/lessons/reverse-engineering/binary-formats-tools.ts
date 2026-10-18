import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "binary-formats-tools",
  title: {
    en: "Binary Formats & Tools — Reading ELF and PE Like a Map",
    ar: "صيغ الملفات الثنائية وأدواتها — قراءة ELF وPE كما تُقرأ الخريطة",
  },
  estMinutes: 50,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

By the end of this lesson you will be able to:

- Read the structure of an **ELF** file by hand and with \`readelf\`: the header, the **sections** (the linker's view) and the **segments** (the loader's view)
- Explain what **symbols**, **imports**, **exports** and **relocations** tell you about a program, using \`nm\`, \`readelf\` and \`objdump\`
- Find your way through a Windows **PE** file: the MZ header, the PE signature, the COFF and optional headers, the section table, and convert an **RVA** into a file offset
- Pick the right tool for each question, from \`file\` up to a disassembler and decompiler such as **Ghidra**

## A book is more than its pages 📚

Pick up a library book. Before chapter one there is a cover with the title, then a table of contents that says where every chapter starts. At the back you find an index of names and a bibliography of the other books it relies on. The binder may also have sewn the pages into a few thick bundles that are easier to handle than loose sheets.

An executable is built the same way. The **header** is the cover. The **section table** is the table of contents. The **symbol table** is the index, the **imports** are the bibliography, and the **segments** are the sewn bundles that the loader actually carries into memory. In the first lesson you read the cover; in this one you read the rest of the book.

As in every lesson of this track, the files here are a tiny program compiled for the lesson or byte dumps written by hand. Apply these skills only to files you are allowed to analyze.`,
        ar: `## ماذا ستتعلم

في نهاية هذا الدرس ستكون قادراً على:

- قراءة بنية ملف **ELF** يدوياً وبالأمر \`readelf\`: الترويسة، و**sections** (منظور الرابط)، و**segments** (منظور المُحمِّل)
- شرح ما تخبرك به **الرموز (symbols)** و**الاستيرادات (imports)** و**التصديرات (exports)** و**إعادة التموضع (relocations)** عن البرنامج، باستخدام \`nm\` و\`readelf\` و\`objdump\`
- التنقّل داخل ملف **PE** الخاص بـ Windows: ترويسة MZ، وتوقيع PE، وترويسة COFF والترويسة الاختيارية (optional header)، وجدول الأقسام، وتحويل **RVA** إلى إزاحة داخل الملف
- اختيار الأداة المناسبة لكل سؤال، من \`file\` وصولاً إلى المفكِّك (disassembler) والـdecompiler مثل **Ghidra**

## الكتاب أكثر من صفحاته 📚

خذ كتاباً من المكتبة. قبل الفصل الأول ستجد غلافاً عليه العنوان، ثم فهرساً للمحتويات يحدد أين يبدأ كل فصل. وفي آخره كشّاف بالأسماء وقائمة مراجع بالكتب الأخرى التي يعتمد عليها. وربما خاط المجلِّد الصفحات في بضع حزم سميكة أسهل في التداول من الأوراق المتفرقة.

الملف التنفيذي مبني بالطريقة نفسها. **الترويسة (header)** هي الغلاف. و**جدول الأقسام (section table)** هو فهرس المحتويات. و**جدول الرموز** هو الكشّاف، و**الاستيرادات** هي قائمة المراجع، و**segments** هي الحزم المخيطة التي يحملها المُحمِّل فعلاً إلى الذاكرة. في الدرس الأول قرأت الغلاف؛ وفي هذا الدرس تقرأ بقية الكتاب.

وكما في كل دروس هذا المسار، الملفات هنا برنامج صغير صُرِّف لأجل الدرس أو بايتات مكتوبة يدوياً. لا تطبّق هذه المهارات إلا على ملفات يحق لك تحليلها.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## ELF: one file, two views

ELF is defined by the System V ABI and documented on Linux in the \`elf(5)\` manual page. The same file is described twice, for two different readers:

\`\`\`
 offset 0   ┌──────────────────────────┐
            │ ELF header (64 bytes)    │  says where the two tables are
 e_phoff    ├──────────────────────────┤
            │ program header table     │  segments: what the LOADER maps
            ├──────────────────────────┤
            │ .interp .dynsym .rela.*  │ ┐
            │ .text .plt               │ │ bytes covered by LOAD segments
            │ .rodata .eh_frame        │ │
            │ .data .got               │ ┘
            │ .comment .symtab .strtab │   for tools only, never mapped
 e_shoff    ├──────────────────────────┤
            │ section header table     │  sections: what LINKERS and analysts use
            └──────────────────────────┘
\`\`\`

- A **section** is a unit for the linker: a name, a type, flags, an address, a file offset and a size. Common types are \`PROGBITS\` (bytes stored in the file), \`NOBITS\` (\`.bss\`: no bytes in the file), \`SYMTAB\`/\`DYNSYM\`, \`STRTAB\`, \`RELA\` and \`DYNAMIC\`. Flags: **A** (alloc: occupies memory at run time), **W** (write), **X** (execute).
- A **segment** (one program header) is a unit for the loader: a type (\`LOAD\`, \`INTERP\`, \`DYNAMIC\`, \`GNU_STACK\`, \`GNU_RELRO\`...), a file offset, a virtual address, a size in the file (\`p_filesz\`), a size in memory (\`p_memsz\`) and flags **R W E**. One segment usually holds several sections that need the same permissions. When \`p_memsz\` is larger than \`p_filesz\`, the loader fills the difference with zeros: that is where \`.bss\` lives.

The loader needs only the program headers. The section table is optional for running a program, which is why a stripped, or deliberately damaged, section table does not stop a binary from working, and why you should never trust section names blindly.

Here is real output for this lesson's small program (a 16064-byte PIE built by gcc 13 on Ubuntu 24.04), shortened:

\`\`\`
$ readelf -h hello
  Type:                              DYN (Position-Independent Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Entry point address:               0x1060
  Start of program headers:          64 (bytes into file)
  Start of section headers:          14080 (bytes into file)
  Size of program headers:           56 (bytes)
  Number of program headers:         13
  Size of section headers:           64 (bytes)
  Number of section headers:         31
  Section header string table index: 30
\`\`\`

Section names are not stored in the section headers themselves but as offsets into a string table; the last field says which section holds those names (\`.shstrtab\`, number 30). Note that 14080 + 31 × 64 = 16064, the size of the file: the section header table sits at the very end.

\`\`\`
$ readelf -lW hello                       (the four LOAD segments and GNU_STACK)
  Type       Offset   VirtAddr           FileSiz  MemSiz   Flg
  LOAD       0x000000 0x0000000000000000 0x000628 0x000628 R
  LOAD       0x001000 0x0000000000001000 0x00018d 0x00018d R E
  LOAD       0x002000 0x0000000000002000 0x000100 0x000100 R
  LOAD       0x002db8 0x0000000000003db8 0x00025c 0x000268 RW
  GNU_STACK  0x000000 0x0000000000000000 0x000000 0x000000 RW

 Section to Segment mapping:      (readelf's numbers: 00 is PHDR, 01 is INTERP)
   02     .interp .note.gnu.property ... .dynsym .dynstr ... .rela.dyn .rela.plt
   03     .init .plt .plt.got .plt.sec .text .fini
   04     .rodata .eh_frame_hdr .eh_frame
   05     .init_array .fini_array .dynamic .got .data .bss
\`\`\`

How to read it: segment 03 is the only executable one and holds all the code. Segment 05 has a FileSiz of 0x25c but a MemSiz of 0x268; the extra 0xc bytes are \`.bss\`, zero-filled at load time. \`GNU_STACK\` with \`RW\` and no \`E\` means the stack is **not executable**; an \`RWE\` stack would be a red flag. The type \`DYN\` with addresses starting near 0 means the file is position-independent: the loader chooses a random base (ASLR) and every address above is an offset from it.`,
        ar: `## ELF: ملف واحد ومنظوران

صيغة ELF معرَّفة في System V ABI وموثّقة على Linux في صفحة الدليل \`elf(5)\`. يوصف الملف نفسه مرتين، لقارئين مختلفين:

\`\`\`
 offset 0   ┌──────────────────────────┐
            │ ELF header (64 bytes)    │  says where the two tables are
 e_phoff    ├──────────────────────────┤
            │ program header table     │  segments: what the LOADER maps
            ├──────────────────────────┤
            │ .interp .dynsym .rela.*  │ ┐
            │ .text .plt               │ │ bytes covered by LOAD segments
            │ .rodata .eh_frame        │ │
            │ .data .got               │ ┘
            │ .comment .symtab .strtab │   for tools only, never mapped
 e_shoff    ├──────────────────────────┤
            │ section header table     │  sections: what LINKERS and analysts use
            └──────────────────────────┘
\`\`\`

- الـ**section** وحدة يتعامل معها الرابط: له اسم ونوع وأعلام (flags) وعنوان وإزاحة في الملف وحجم. أشهر الأنواع \`PROGBITS\` (بايتات مخزّنة في الملف)، و\`NOBITS\` (‏\`.bss\`: لا بايتات له في الملف)، و\`SYMTAB\`/\`DYNSYM\`، و\`STRTAB\`، و\`RELA\`، و\`DYNAMIC\`. والأعلام: **A** (‏alloc: يشغل ذاكرة وقت التشغيل)، و**W** (كتابة)، و**X** (تنفيذ).
- الـ**segment** (أي program header واحد) وحدة يتعامل معها المُحمِّل: له نوع (‏\`LOAD\` و\`INTERP\` و\`DYNAMIC\` و\`GNU_STACK\` و\`GNU_RELRO\`...)، وإزاحة في الملف، وعنوان افتراضي، وحجم في الملف (‏\`p_filesz\`)، وحجم في الذاكرة (‏\`p_memsz\`)، وأعلام **R W E**. والـsegment الواحد يضم عادةً عدة sections تحتاج الصلاحيات نفسها. وعندما يكون \`p_memsz\` أكبر من \`p_filesz\` يملأ المُحمِّل الفرق بأصفار: هناك يعيش \`.bss\`.

المُحمِّل لا يحتاج إلا إلى program headers. أما جدول الأقسام فاختياري لتشغيل البرنامج، ولهذا لا يمنع جدولُ أقسام محذوفٌ أو مُتلَفٌ عمداً الملفَ من العمل، ولهذا أيضاً لا يجوز أن تثق بأسماء الأقسام ثقة عمياء.

هذا ناتج حقيقي لبرنامج هذا الدرس الصغير (ملف PIE حجمه 16064 بايت بناه gcc 13 على Ubuntu 24.04)، مختصراً:

\`\`\`
$ readelf -h hello
  Type:                              DYN (Position-Independent Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Entry point address:               0x1060
  Start of program headers:          64 (bytes into file)
  Start of section headers:          14080 (bytes into file)
  Size of program headers:           56 (bytes)
  Number of program headers:         13
  Size of section headers:           64 (bytes)
  Number of section headers:         31
  Section header string table index: 30
\`\`\`

أسماء الأقسام لا تُخزَّن داخل section headers نفسها، بل كإزاحات داخل جدول نصوص (string table)؛ والحقل الأخير يحدد أي قسم يحمل هذه الأسماء (‏\`.shstrtab\` ورقمه 30). ولاحظ أن 14080 + 31 × 64 = 16064 وهو حجم الملف: جدول section headers يقع في آخر الملف تماماً.

\`\`\`
$ readelf -lW hello                       (the four LOAD segments and GNU_STACK)
  Type       Offset   VirtAddr           FileSiz  MemSiz   Flg
  LOAD       0x000000 0x0000000000000000 0x000628 0x000628 R
  LOAD       0x001000 0x0000000000001000 0x00018d 0x00018d R E
  LOAD       0x002000 0x0000000000002000 0x000100 0x000100 R
  LOAD       0x002db8 0x0000000000003db8 0x00025c 0x000268 RW
  GNU_STACK  0x000000 0x0000000000000000 0x000000 0x000000 RW

 Section to Segment mapping:      (readelf's numbers: 00 is PHDR, 01 is INTERP)
   02     .interp .note.gnu.property ... .dynsym .dynstr ... .rela.dyn .rela.plt
   03     .init .plt .plt.got .plt.sec .text .fini
   04     .rodata .eh_frame_hdr .eh_frame
   05     .init_array .fini_array .dynamic .got .data .bss
\`\`\`

كيف تقرؤه: الـsegment رقم 03 هو الوحيد القابل للتنفيذ ويضم الكود كله. والـsegment رقم 05 حجمه في الملف 0x25c لكن حجمه في الذاكرة 0x268؛ والبايتات الـ0xc الزائدة هي \`.bss\` وتُملأ أصفاراً عند التحميل. و\`GNU_STACK\` بصلاحية \`RW\` دون \`E\` يعني أن الـstack **غير قابل للتنفيذ**؛ أما stack بصلاحية \`RWE\` فعلامة تحذير. والنوع \`DYN\` مع عناوين تبدأ قرب الصفر يعني أن الملف مستقل عن الموضع: يختار المُحمِّل قاعدة عشوائية (ASLR) وكل عنوان أعلاه إزاحة عنها.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `import struct

# The 64-byte ELF header of this lesson's program, rebuilt from its readelf -h output.
ident = b"\\x7fELF" + bytes([2, 1, 1, 0]) + bytes(8)       # magic, 64-bit, little-endian, version, padding
header = ident + struct.pack(
    "<HHIQQQIHHHHHH",
    3, 62, 1,            # e_type = DYN, e_machine = x86-64, e_version
    0x1060,              # e_entry
    64, 14080,           # e_phoff, e_shoff
    0,                   # e_flags
    64, 56, 13,          # e_ehsize, e_phentsize, e_phnum
    64, 31, 30,          # e_shentsize, e_shnum, e_shstrndx
)

names = ("e_type e_machine e_version e_entry e_phoff e_shoff e_flags "
         "e_ehsize e_phentsize e_phnum e_shentsize e_shnum e_shstrndx").split()
h = dict(zip(names, struct.unpack_from("<HHIQQQIHHHHHH", header, 16)))

print("header size:", len(header), "bytes")
print("entry point:", hex(h["e_entry"]))
ph_end = h["e_phoff"] + h["e_phnum"] * h["e_phentsize"]
sh_end = h["e_shoff"] + h["e_shnum"] * h["e_shentsize"]
print(f"program header table: bytes {h['e_phoff']}..{ph_end - 1}")
print(f"section header table: bytes {h['e_shoff']}..{sh_end - 1}")
print("so the file is at least", sh_end, "bytes long")`,
      explanation: {
        en: "`struct` reads a binary layout from a format string: `<` is little-endian, `H` 2 bytes, `I` 4 bytes, `Q` 8 bytes. Unpacking starts at offset 16, right after `e_ident`. Run it and check that the numbers match the `readelf -h` output above, including the 16064-byte file size. Then change `e_phnum` and predict where the program header table ends.",
        ar: "تقرأ `struct` تخطيطاً ثنائياً من نص تنسيق: الرمز `<` يعني little-endian، و`H` بايتان، و`I` أربعة بايتات، و`Q` ثمانية. يبدأ فك الحزم من الإزاحة 16 مباشرة بعد `e_ident`. شغّله وتحقق أن الأرقام تطابق ناتج `readelf -h` أعلاه، بما فيها حجم الملف 16064 بايت. ثم غيّر `e_phnum` وتوقّع أين ينتهي جدول program headers.",
      },
    },
    {
      type: "lab",
      id: "segment-map",
      lang: "python",
      prompt: {
        en: `## Map sections to segments

\`readelf -l\` ends with a "Section to Segment mapping". Rebuild it from the two tables, and flag dangerous permissions while you are at it.

**Input**

- a line \`segments N\`, then \`N\` lines \`TYPE VADDR MEMSZ FLAGS\` (FLAGS is any of the letters \`R\`, \`W\`, \`E\` written together, such as \`RE\` or \`RW\`)
- a line \`sections M\`, then \`M\` lines \`NAME ADDR SIZE SFLAGS\` (SFLAGS as in \`readelf -S\`, such as \`A\`, \`AX\`, \`WA\`, \`MS\`; a single \`-\` means no flags)

Numbers are hex with a \`0x\` prefix.

**Rules**

- A section belongs to a segment when its flags contain \`A\`, its size is not 0, and \`[ADDR, ADDR+SIZE)\` lies completely inside \`[VADDR, VADDR+MEMSZ)\`. A section may belong to several segments.
- For each segment, in input order, print \`<index as two digits> <TYPE> <perms>: <its sections in input order>\`, or \`(none)\`. Perms are \`r\`, \`w\`, \`x\` or \`-\` (for \`R\`, \`W\`, \`E\`).
- Then print \`not loaded:\` and every section of non-zero size that is in no **LOAD** segment, or \`(none)\`.
- Last, for every segment whose flags contain both \`W\` and \`E\`, print \`warning: <index> <TYPE> is writable and executable\`, with the index as two digits again.

**Example**

Input:

\`\`\`
segments 3
LOAD 0x1000 0x200 RE
LOAD 0x3000 0x100 RW
GNU_STACK 0x0 0x0 RW
sections 4
.text 0x1000 0x1f0 AX
.data 0x3000 0x20 WA
.bss 0x3020 0x10 WA
.comment 0x0 0x2d MS
\`\`\`

Output:

\`\`\`
00 LOAD r-x: .text
01 LOAD rw-: .data .bss
02 GNU_STACK rw-: (none)
not loaded: .comment
\`\`\``,
        ar: `## اربط الأقسام بالـsegments

ينتهي ناتج \`readelf -l\` بجدول "Section to Segment mapping". أعد بناءه من الجدولين، ونبّه إلى الصلاحيات الخطرة في الطريق.

**المدخل**

- سطر \`segments N\`، ثم \`N\` سطراً بالشكل \`TYPE VADDR MEMSZ FLAGS\` (‏FLAGS أي من الحروف \`R\` و\`W\` و\`E\` مكتوبة متلاصقة مثل \`RE\` أو \`RW\`)
- سطر \`sections M\`، ثم \`M\` سطراً بالشكل \`NAME ADDR SIZE SFLAGS\` (‏SFLAGS كما في \`readelf -S\` مثل \`A\` و\`AX\` و\`WA\` و\`MS\`؛ والعلامة \`-\` وحدها تعني لا أعلام)

الأعداد بصيغة hex مع البادئة \`0x\`.

**القواعد**

- ينتمي القسم إلى segment عندما تحتوي أعلامه على \`A\`، ولا يكون حجمه 0، ويقع \`[ADDR, ADDR+SIZE)\` بكامله داخل \`[VADDR, VADDR+MEMSZ)\`. وقد ينتمي القسم إلى أكثر من segment.
- لكل segment، بترتيب المدخل، اطبع \`<الرقم بخانتين> <TYPE> <perms>: <أقسامه بترتيب المدخل>\`، أو \`(none)\`. والصلاحيات \`r\` و\`w\` و\`x\` أو \`-\` (مقابل \`R\` و\`W\` و\`E\`).
- ثم اطبع \`not loaded:\` وبعدها كل قسم حجمه غير صفري ولا يقع في أي segment من نوع **LOAD**، أو \`(none)\`.
- وأخيراً، لكل segment تحتوي أعلامه على \`W\` و\`E\` معاً اطبع \`warning: <index> <TYPE> is writable and executable\`، والرقم بخانتين كما سبق.

**مثال**

المدخل:

\`\`\`
segments 3
LOAD 0x1000 0x200 RE
LOAD 0x3000 0x100 RW
GNU_STACK 0x0 0x0 RW
sections 4
.text 0x1000 0x1f0 AX
.data 0x3000 0x20 WA
.bss 0x3020 0x10 WA
.comment 0x0 0x2d MS
\`\`\`

المخرج:

\`\`\`
00 LOAD r-x: .text
01 LOAD rw-: .data .bss
02 GNU_STACK rw-: (none)
not loaded: .comment
\`\`\``,
      },
      starterCode: `import sys

rows = [line.split() for line in sys.stdin.read().split("\\n") if line.strip()]
pos = 0

segments = []                       # (type, vaddr, memsz, flags)
count = int(rows[pos][1]); pos += 1
for _ in range(count):
    kind, vaddr, memsz, flags = rows[pos]; pos += 1
    segments.append((kind, int(vaddr, 16), int(memsz, 16), flags))

sections = []                       # (name, addr, size, sflags)
count = int(rows[pos][1]); pos += 1
for _ in range(count):
    name, addr, size, sflags = rows[pos]; pos += 1
    sections.append((name, int(addr, 16), int(size, 16), sflags))

# TODO 1: write perms(flags) that turns "RE" into "r-x".
# TODO 2: write inside(section, segment): "A" in the section flags, size > 0, and fully inside the segment.
# TODO 3: print one line per segment, then "not loaded: ...", then the W+E warnings.

for i, seg in enumerate(segments):
    print(f"{i:02d} {seg[0]} ???: (none)")
`,
      solution: `import sys

rows = [line.split() for line in sys.stdin.read().split("\\n") if line.strip()]
pos = 0

segments = []                       # (type, vaddr, memsz, flags)
count = int(rows[pos][1]); pos += 1
for _ in range(count):
    kind, vaddr, memsz, flags = rows[pos]; pos += 1
    segments.append((kind, int(vaddr, 16), int(memsz, 16), flags))

sections = []                       # (name, addr, size, sflags)
count = int(rows[pos][1]); pos += 1
for _ in range(count):
    name, addr, size, sflags = rows[pos]; pos += 1
    sections.append((name, int(addr, 16), int(size, 16), sflags))


def perms(flags):
    return ("r" if "R" in flags else "-") + ("w" if "W" in flags else "-") + ("x" if "E" in flags else "-")


def inside(sec, seg):
    """Allocated, non-empty, and completely inside the segment's memory range."""
    _, addr, size, sflags = sec
    _, vaddr, memsz, _ = seg
    return "A" in sflags and size > 0 and vaddr <= addr and addr + size <= vaddr + memsz


loaded = set()
for i, seg in enumerate(segments):
    names = [s[0] for s in sections if inside(s, seg)]
    if seg[0] == "LOAD":
        loaded.update(names)
    print(f"{i:02d} {seg[0]} {perms(seg[3])}: {' '.join(names) if names else '(none)'}")

rest = [s[0] for s in sections if s[2] > 0 and s[0] not in loaded]
print("not loaded:", " ".join(rest) if rest else "(none)")

for i, seg in enumerate(segments):
    if "W" in seg[3] and "E" in seg[3]:
        print(f"warning: {i:02d} {seg[0]} is writable and executable")
`,
      hints: [
        { en: "`perms` is three conditional characters: `(\"r\" if \"R\" in flags else \"-\")` and the same for `W`/`w` and `E`/`x`.", ar: "الدالة `perms` ثلاثة محارف شرطية: `(\"r\" if \"R\" in flags else \"-\")` والشيء نفسه لـ `W`/`w` و`E`/`x`." },
        { en: "Fully inside means `vaddr <= addr` and `addr + size <= vaddr + memsz` (the end is exclusive, so a section that ends exactly at the segment's end still fits). Remember the `\"A\" in sflags` and `size > 0` conditions.", ar: "داخلٌ بالكامل يعني `vaddr <= addr` و`addr + size <= vaddr + memsz` (النهاية غير مشمولة، فالقسم الذي ينتهي عند نهاية الـsegment تماماً يبقى داخله). ولا تنسَ الشرطين `\"A\" in sflags` و`size > 0`." },
        { en: "Collect the names you place in LOAD segments in a set while printing; afterwards every non-empty section missing from that set is \"not loaded\".", ar: "اجمع أسماء الأقسام التي تضعها في segments من نوع LOAD في مجموعة (set) أثناء الطباعة؛ وبعدها يكون كل قسم غير فارغ غائب عن هذه المجموعة \"not loaded\"." },
      ],
      tests: [
        { name: { en: "The worked example", ar: "المثال المحلول" }, stdin: `segments 3
LOAD 0x1000 0x200 RE
LOAD 0x3000 0x100 RW
GNU_STACK 0x0 0x0 RW
sections 4
.text 0x1000 0x1f0 AX
.data 0x3000 0x20 WA
.bss 0x3020 0x10 WA
.comment 0x0 0x2d MS
`, expected: `00 LOAD r-x: .text
01 LOAD rw-: .data .bss
02 GNU_STACK rw-: (none)
not loaded: .comment
` },
        { name: { en: "The lesson's real PIE: sections in several segments at once", ar: "ملف PIE الحقيقي في الدرس: أقسام في عدة segments في آن واحد" }, stdin: `segments 8
INTERP 0x318 0x1c R
LOAD 0x0 0x628 R
LOAD 0x1000 0x18d RE
LOAD 0x2000 0x100 R
LOAD 0x3db8 0x268 RW
DYNAMIC 0x3dc8 0x1f0 RW
GNU_STACK 0x0 0x0 RW
GNU_RELRO 0x3db8 0x248 R
sections 15
.interp 0x318 0x1c A
.dynsym 0x3d8 0xa8 A
.rela.plt 0x610 0x18 AI
.plt 0x1020 0x20 AX
.text 0x1060 0x11f AX
.rodata 0x2000 0xa A
.eh_frame 0x2048 0xb8 A
.init_array 0x3db8 0x8 WA
.dynamic 0x3dc8 0x1f0 WA
.got 0x3fb8 0x48 WA
.data 0x4000 0x14 WA
.bss 0x4014 0xc WA
.comment 0x0 0x2d MS
.symtab 0x0 0x3a8 -
.shstrtab 0x0 0x11a -
`, expected: `00 INTERP r--: .interp
01 LOAD r--: .interp .dynsym .rela.plt
02 LOAD r-x: .plt .text
03 LOAD r--: .rodata .eh_frame
04 LOAD rw-: .init_array .dynamic .got .data .bss
05 DYNAMIC rw-: .dynamic
06 GNU_STACK rw-: (none)
07 GNU_RELRO r--: .init_array .dynamic .got
not loaded: .comment .symtab .shstrtab
` },
        { name: { en: "One writable and executable segment, and an executable stack", ar: "segment واحد قابل للكتابة والتنفيذ، وstack قابل للتنفيذ" }, stdin: `segments 2
LOAD 0x400000 0x1000 RWE
GNU_STACK 0x0 0x0 RWE
sections 2
.text 0x400080 0x40 AX
.data 0x4000c0 0x10 WA
`, expected: `00 LOAD rwx: .text .data
01 GNU_STACK rwx: (none)
not loaded: (none)
warning: 00 LOAD is writable and executable
warning: 01 GNU_STACK is writable and executable
` },
        { name: { en: "Boundaries: an exact fit, one byte too many, and a zero-size section", ar: "الحدود: ملاءمة تامة، وبايت واحد زائد، وقسم حجمه صفر" }, stdin: `segments 2
LOAD 0x1000 0x100 RE
LOAD 0x2000 0x100 RW
sections 4
.text 0x1000 0x100 AX
.tm_clone_table 0x2000 0x0 WA
.data 0x2000 0x100 WA
.got 0x20f8 0x10 WA
`, expected: `00 LOAD r-x: .text
01 LOAD rw-: .data
not loaded: .got
` },
        { name: { en: "An object file (.o) has no program headers at all", ar: "ملف object ‏(.o) لا يحوي program headers أصلاً" }, stdin: `segments 0
sections 9
.text 0x0 0x51 AX
.rela.text 0x0 0x78 I
.data 0x0 0x4 WA
.bss 0x0 0x4 WA
.rodata 0x0 0x6 A
.comment 0x0 0x2e MS
.note.GNU-stack 0x0 0x0 -
.symtab 0x0 0xd8 -
.strtab 0x0 0x27 -
`, expected: `not loaded: .text .rela.text .data .bss .rodata .comment .symtab .strtab
` },
        { name: { en: "Only LOAD segments are loaded: a section covered by nothing but a NOTE segment", ar: "الـsegments من نوع LOAD وحدها تُحمَّل: قسم لا يغطيه إلا segment من نوع NOTE" }, stdin: `segments 2
LOAD 0x1000 0x100 RE
NOTE 0x2000 0x20 R
sections 2
.text 0x1000 0x80 AX
.note.example 0x2000 0x20 A
`, expected: `00 LOAD r-x: .text
01 NOTE r--: .note.example
not loaded: .note.example
` },
      ],
      sampleInput: `segments 3
LOAD 0x1000 0x200 RE
LOAD 0x3000 0x100 RW
GNU_STACK 0x0 0x0 RW
sections 4
.text 0x1000 0x1f0 AX
.data 0x3000 0x20 WA
.bss 0x3020 0x10 WA
.comment 0x0 0x2d MS
`,
    },
    {
      type: "text",
      body: {
        en: `## Symbols, imports and exports

A **symbol** is a name with a value (usually an address), a size, a type (function or object) and a binding (local, global or weak). An ELF executable can carry two symbol tables:

- \`.symtab\`: every name the linker knew, including \`static\` functions. It is only for tools, and \`strip\` removes it
- \`.dynsym\`: only the names needed for **dynamic linking**, that is the functions the program **imports** from shared libraries and the ones a library **exports**. It is allocated memory and must survive stripping, or the program could not be linked at run time

\`nm\` prints symbols with a one-letter type; upper case means global, lower case local. Real output for our program, shortened:

\`\`\`
$ nm hello
0000000000001149 T add3
0000000000004010 D counter
0000000000001152 T main
                 U puts@GLIBC_2.2.5
0000000000002000 R _IO_stdin_used
0000000000004018 B zeroed
0000000000001090 t deregister_tm_clones
                 w __gmon_start__
\`\`\`

- \`T\`/\`t\` code in \`.text\`; \`D\`/\`d\` initialized data; \`B\`/\`b\` \`.bss\`; \`R\`/\`r\` read-only data
- \`U\` means **undefined here**: it lives in another file, so it is an **import**. \`w\` is a weak reference that may stay unresolved
- \`@GLIBC_2.2.5\` is a **symbol version**: the program needs the \`puts\` that glibc's interface has offered since version 2.2.5

Now strip a copy. \`nm\` answers *no symbols*, yet \`nm -D\` still lists \`puts\` and \`__libc_start_main\`: imports cannot be stripped, which is why the import list is such a reliable clue in triage. Our own names \`add3\` and \`main\` are gone, and Ghidra would show them as \`FUN_00101149\`-style labels.

A symbol is not proof that code is used. This build used \`-O1\`, and the compiler inlined \`add3\` into \`main\`:

\`\`\`
$ objdump -d -M intel --no-show-raw-insn hello      (main, shortened)
    115a:  mov    eax,DWORD PTR [rip+0x2eb0]   # 4010 <counter>
    1160:  add    eax,0x5                      # add3(counter, 2) = counter + 2 + 3
    1163:  mov    DWORD PTR [rip+0x2eaf],eax   # 4018 <zeroed>
    1170:  call   1050 <puts@plt>
\`\`\`

**Exports** go the other way: the functions a shared library offers to others. \`nm -D --defined-only libfoo.so\` or \`readelf --dyn-syms libfoo.so\` lists them, and a library exporting names such as \`compress_block\` and \`verify_signature\` tells a story before you read any code. C++ names arrive **mangled** (\`_ZN3Foo3barEv\`); \`nm -C\` or \`c++filt\` turns them back into \`Foo::bar()\`.`,
        ar: `## الرموز والاستيرادات والتصديرات

**الرمز (symbol)** اسم له قيمة (عنوان في الغالب)، وحجم، ونوع (دالة أو كائن)، وربط (binding) محلي أو عام أو ضعيف (weak). ويمكن أن يحمل ملف ELF التنفيذي جدولَي رموز:

- ‏\`.symtab\`: كل اسم عرفه الرابط، بما فيها الدوال \`static\`. وهو للأدوات فقط، ويحذفه الأمر \`strip\`
- ‏\`.dynsym\`: الأسماء اللازمة لـ**الربط الديناميكي** فقط، أي الدوال التي **يستوردها** البرنامج من المكتبات المشتركة والدوال التي **تصدّرها** المكتبة. وهو يشغل ذاكرة عند التحميل ويجب أن يبقى بعد التجريد، وإلا تعذّر ربط البرنامج وقت التشغيل

يطبع \`nm\` الرموز مع نوع من حرف واحد؛ الحرف الكبير يعني عاماً والصغير محلياً. هذا ناتج حقيقي لبرنامجنا، مختصراً:

\`\`\`
$ nm hello
0000000000001149 T add3
0000000000004010 D counter
0000000000001152 T main
                 U puts@GLIBC_2.2.5
0000000000002000 R _IO_stdin_used
0000000000004018 B zeroed
0000000000001090 t deregister_tm_clones
                 w __gmon_start__
\`\`\`

- ‏\`T\`/\`t\` كود في \`.text\`؛ و\`D\`/\`d\` بيانات مُهيّأة؛ و\`B\`/\`b\` في \`.bss\`؛ و\`R\`/\`r\` بيانات للقراءة فقط
- ‏\`U\` تعني **غير معرَّف هنا**: يعيش في ملف آخر، فهو **استيراد**. و\`w\` إشارة ضعيفة قد تبقى دون حلّ
- ‏\`@GLIBC_2.2.5\` هو **إصدار الرمز (symbol version)**: يحتاج البرنامج إلى \`puts\` التي تقدّمها واجهة glibc منذ الإصدار 2.2.5

جرّد الآن نسخة من الملف. سيجيب \`nm\` بعبارة *no symbols*، لكن \`nm -D\` ما زال يعرض \`puts\` و\`__libc_start_main\`: الاستيرادات لا يمكن تجريدها، ولهذا تُعدّ قائمة الاستيرادات دليلاً موثوقاً جداً في الفرز. أما أسماؤنا \`add3\` و\`main\` فقد اختفت، وسيعرضها Ghidra بأسماء مثل \`FUN_00101149\`.

وجود الرمز ليس دليلاً على أن الكود مستخدم. بُني هذا الملف بالخيار \`-O1\`، فدمج المصرِّف الدالة \`add3\` داخل \`main\` (‏inlining):

\`\`\`
$ objdump -d -M intel --no-show-raw-insn hello      (main, shortened)
    115a:  mov    eax,DWORD PTR [rip+0x2eb0]   # 4010 <counter>
    1160:  add    eax,0x5                      # add3(counter, 2) = counter + 2 + 3
    1163:  mov    DWORD PTR [rip+0x2eaf],eax   # 4018 <zeroed>
    1170:  call   1050 <puts@plt>
\`\`\`

أما **التصديرات** فتسير في الاتجاه المعاكس: الدوال التي تقدّمها مكتبة مشتركة لغيرها. يعرضها \`nm -D --defined-only libfoo.so\` أو \`readelf --dyn-syms libfoo.so\`، ومكتبة تصدّر أسماء مثل \`compress_block\` و\`verify_signature\` تحكي قصة قبل أن تقرأ أي كود. وأسماء C++‎ تصل **مشوَّهة (mangled)** مثل \`_ZN3Foo3barEv\`؛ ويعيدها \`nm -C\` أو \`c++filt\` إلى \`Foo::bar()\`.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Relocations: the loader's to-do list

When the linker writes a file it cannot know everything: where the program will be loaded (ASLR picks a random base) or where \`puts\` will sit inside libc. Every such hole is recorded as a **relocation**: "at this address, write this value". \`readelf -r\` lists them:

\`\`\`
$ readelf -rW hello      (shortened)
Relocation section '.rela.dyn' at offset 0x550 contains 8 entries:
    Offset             Info             Type               Symbol's Value  Symbol's Name + Addend
0000000000003db8  0000000000000008 R_X86_64_RELATIVE                         1140
0000000000003fd8  0000000100000006 R_X86_64_GLOB_DAT      0000000000000000 __libc_start_main@GLIBC_2.34 + 0
Relocation section '.rela.plt' at offset 0x610 contains 1 entry:
0000000000003fd0  0000000300000007 R_X86_64_JUMP_SLOT     0000000000000000 puts@GLIBC_2.2.5 + 0
\`\`\`

The three types you meet in almost every x86-64 executable (the formulas come from the x86-64 psABI, where B is the load base, S the symbol's address and A the addend):

- \`R_X86_64_RELATIVE\` writes **B + A**. Slot 0x3db8 is in \`.init_array\` and must hold the run-time address of the function at offset 0x1140, which only exists once the base is chosen
- \`R_X86_64_GLOB_DAT\` writes **S** into a \`.got\` slot, for global data and function pointers
- \`R_X86_64_JUMP_SLOT\` writes **S** into the \`.got\` slot that the \`.plt\` stub of \`puts\` jumps through: \`call 1050 <puts@plt>\` lands on that stub
- (In object files you will also see \`R_X86_64_64\`, **S + A**, and PC-relative types that the static linker resolves.)

**Lazy or immediate binding.** Traditionally \`JUMP_SLOT\` entries were resolved lazily, the first time each function is called. Linking with \`-z now\` (the dynamic flag \`BIND_NOW\`, which this Ubuntu build has by default: \`readelf -d\` shows \`FLAGS BIND_NOW\`) resolves everything at start-up, and **RELRO** then makes those GOT pages read-only, so a memory-corruption bug cannot redirect them. The \`GNU_RELRO\` segment marks exactly that range.

For an analyst, relocations are gold. In a stripped binary, the relocation that names \`puts\` tells you that slot 0x3fd0 means "puts", so every indirect call through it is a call to \`puts\`. Disassemblers use exactly this to print \`call puts@plt\` instead of a bare address.`,
        ar: `## إعادة التموضع (Relocations): قائمة مهام المُحمِّل

عندما يكتب الرابط الملف لا يمكنه أن يعرف كل شيء: أين سيُحمَّل البرنامج (ASLR يختار قاعدة عشوائية)، أو أين ستقع \`puts\` داخل libc. كل فراغ من هذا النوع يُسجَّل كـ**relocation**: "عند هذا العنوان اكتب هذه القيمة". ويعرضها \`readelf -r\`:

\`\`\`
$ readelf -rW hello      (shortened)
Relocation section '.rela.dyn' at offset 0x550 contains 8 entries:
    Offset             Info             Type               Symbol's Value  Symbol's Name + Addend
0000000000003db8  0000000000000008 R_X86_64_RELATIVE                         1140
0000000000003fd8  0000000100000006 R_X86_64_GLOB_DAT      0000000000000000 __libc_start_main@GLIBC_2.34 + 0
Relocation section '.rela.plt' at offset 0x610 contains 1 entry:
0000000000003fd0  0000000300000007 R_X86_64_JUMP_SLOT     0000000000000000 puts@GLIBC_2.2.5 + 0
\`\`\`

الأنواع الثلاثة التي تقابلها في كل ملف x86-64 تنفيذي تقريباً (الصيغ من x86-64 psABI، حيث B قاعدة التحميل وS عنوان الرمز وA الإضافة addend):

- ‏\`R_X86_64_RELATIVE\` تكتب **B + A**. الخانة 0x3db8 في \`.init_array\` ويجب أن تحمل عنوان الدالة الواقعة عند الإزاحة 0x1140 وقت التشغيل، وهو عنوان لا يوجد إلا بعد اختيار القاعدة
- ‏\`R_X86_64_GLOB_DAT\` تكتب **S** في خانة من \`.got\`، للبيانات العامة ومؤشرات الدوال
- ‏\`R_X86_64_JUMP_SLOT\` تكتب **S** في خانة \`.got\` التي يقفز عبرها مقطع \`.plt\` الخاص بـ \`puts\`: التعليمة \`call 1050 <puts@plt>\` تهبط على ذلك المقطع
- (وفي ملفات object سترى أيضاً \`R_X86_64_64\` أي **S + A**، وأنواعاً نسبية إلى PC يحلّها الرابط الساكن.)

**الربط الكسول أو الفوري.** تقليدياً كانت مدخلات \`JUMP_SLOT\` تُحلّ بكسل (lazily)، أي عند أول استدعاء لكل دالة. أما الربط بالخيار \`-z now\` (العلم الديناميكي \`BIND_NOW\`، وهو مفعّل افتراضياً في بناء Ubuntu هذا: يعرض \`readelf -d\` السطر \`FLAGS BIND_NOW\`) فيحلّ كل شيء عند بدء التشغيل، ثم تجعل **RELRO** صفحات GOT تلك للقراءة فقط، فلا يستطيع خطأ إفساد ذاكرة أن يعيد توجيهها. والـsegment ‏\`GNU_RELRO\` يحدّد هذا المدى بالضبط.

بالنسبة للمحلل، إعادة التموضع كنز. ففي الملف المجرَّد، الـrelocation الذي يسمّي \`puts\` يخبرك أن الخانة 0x3fd0 تعني "puts"، فكل استدعاء غير مباشر عبرها هو استدعاء لـ \`puts\`. والمفكِّكات تستخدم هذا بالضبط لتكتب \`call puts@plt\` بدل عنوان مجرد.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// A toy dynamic loader applying the relocations readelf printed for our program.
const base = 0x555555554000n;            // GDB's usual base for a PIE when ASLR is off
const libc = { puts: 0x7ffff7c80e50n, __libc_start_main: 0x7ffff7c29dc0n }; // made-up libc addresses

const relocs = [
  { offset: 0x3db8n, type: "R_X86_64_RELATIVE", addend: 0x1140n },
  { offset: 0x3dc0n, type: "R_X86_64_RELATIVE", addend: 0x1100n },
  { offset: 0x3fd8n, type: "R_X86_64_GLOB_DAT", symbol: "__libc_start_main" },
  { offset: 0x3fe8n, type: "R_X86_64_GLOB_DAT", symbol: "__gmon_start__" },
  { offset: 0x3fd0n, type: "R_X86_64_JUMP_SLOT", symbol: "puts" },
];

const hex = (v) => "0x" + v.toString(16);
for (const r of relocs) {
  const slot = base + r.offset;                       // the slot itself moves with the base
  const value = r.type === "R_X86_64_RELATIVE" ? base + r.addend : libc[r.symbol];
  if (value === undefined) {
    console.log(hex(slot), r.type.padEnd(19), "<- 0 (weak symbol, not found)");
  } else {
    console.log(hex(slot), r.type.padEnd(19), "<-", hex(value), r.symbol ?? "");
  }
}`,
      explanation: {
        en: "Run it, then change `base` to another value, as if ASLR had chosen a different address: every `RELATIVE` result moves with it, while the imports depend only on where libc was loaded. `__gmon_start__` is a weak reference (`w` in `nm`), so a missing definition becomes 0 instead of an error.",
        ar: "شغّله ثم غيّر `base` إلى قيمة أخرى كأن ASLR اختار عنواناً مختلفاً: كل نتيجة `RELATIVE` تتحرك معها، بينما الاستيرادات تعتمد فقط على المكان الذي حُمِّلت فيه libc. و`__gmon_start__` إشارة ضعيفة (الحرف `w` في `nm`)، فغياب تعريفها يصبح 0 بدل أن يكون خطأ.",
      },
    },
    {
      type: "text",
      body: {
        en: `## PE: the Windows container

Windows programs (\`.exe\`, \`.dll\`, \`.sys\`) use the **Portable Executable** format, specified by Microsoft in the *PE Format* documentation. It descends from COFF and keeps an MS-DOS header at the front for compatibility.

\`\`\`
 offset 0    ┌─────────────────────────────┐
             │ DOS header "MZ"             │  e_lfanew (4 bytes at 0x3C) = offset of the PE signature
             │ DOS stub                    │  prints "This program cannot be run in DOS mode."
 e_lfanew    ├─────────────────────────────┤
             │ "PE\\0\\0" signature          │
             │ COFF file header (20 bytes) │  Machine, NumberOfSections, TimeDateStamp,
             │                             │  SizeOfOptionalHeader, Characteristics
             │ optional header             │  Magic, AddressOfEntryPoint, ImageBase, alignments,
             │                             │  SizeOfHeaders, data directories
             ├─────────────────────────────┤
             │ section table (40 B each)   │  Name, VirtualSize, VirtualAddress,
             │                             │  SizeOfRawData, PointerToRawData, Characteristics
             ├─────────────────────────────┤
             │ .text .rdata .data .rsrc    │
             │ .reloc ...                  │
             └─────────────────────────────┘
\`\`\`

- **COFF file header.** \`Machine\` is 0x14c for x86, 0x8664 for x64 and 0xaa64 for ARM64. \`Characteristics\` is a bit set: 0x0002 means an executable image, 0x2000 a DLL. \`TimeDateStamp\` is meant to be the link time, but deterministic builds may store a hash there, so do not treat it as evidence on its own.
- **Optional header** (required for images despite the name). \`Magic\` is 0x10b for **PE32** (32-bit) and 0x20b for **PE32+** (64-bit). \`AddressOfEntryPoint\` is at offset 16 of this header; \`ImageBase\` is at offset 28 (4 bytes) in PE32 and at offset 24 (8 bytes) in PE32+. Microsoft's linker defaults to 0x400000 for 32-bit EXEs, 0x10000000 for 32-bit DLLs, 0x140000000 for 64-bit EXEs and 0x180000000 for 64-bit DLLs.
- **RVA** (relative virtual address). Almost every address inside a PE is an offset from the image base *after loading*: VA = ImageBase + RVA. To find the bytes of an RVA in the file you need the section table: file offset = PointerToRawData + (RVA − VirtualAddress). Sections are aligned to \`FileAlignment\` on disk (default 0x200) and to \`SectionAlignment\` in memory (default: the page size, 0x1000 on x86), which is why offsets and RVAs differ.
- **Data directories.** Sixteen (RVA, size) pairs at the end of the optional header point to the export table, import table, resources, base relocations, debug data, the Import Address Table (IAT), the .NET header and more.
- **Imports.** For every DLL (\`KERNEL32.dll\`, \`WS2_32.dll\`...) the import table lists functions by name or by **ordinal** number. At load time the loader writes their real addresses into the **IAT**, and code calls through it (\`call qword ptr [rip+...]\`). The IAT is PE's equivalent of the GOT.
- **Exports.** A DLL's export directory lists the names and ordinals it offers.
- **Base relocations** (\`.reloc\`). The places to patch when the image is not loaded at its preferred \`ImageBase\`; with ASLR (the \`DYNAMIC_BASE\` flag) that is the normal case.

On Linux you can read PE files with \`objdump -x program.exe\` (binutils understands PE), Python's **pefile** library, \`rabin2 -I -i -E\` from radare2, or Ghidra. None of these runs the file.`,
        ar: `## PE: حاوية Windows

تستخدم برامج Windows ‏(\`.exe\` و\`.dll\` و\`.sys\`) صيغة **Portable Executable** التي تحدّدها Microsoft في وثيقة *PE Format*. وهي منحدرة من COFF وتُبقي ترويسة MS-DOS في مقدمتها لأجل التوافق.

\`\`\`
 offset 0    ┌─────────────────────────────┐
             │ DOS header "MZ"             │  e_lfanew (4 bytes at 0x3C) = offset of the PE signature
             │ DOS stub                    │  prints "This program cannot be run in DOS mode."
 e_lfanew    ├─────────────────────────────┤
             │ "PE\\0\\0" signature          │
             │ COFF file header (20 bytes) │  Machine, NumberOfSections, TimeDateStamp,
             │                             │  SizeOfOptionalHeader, Characteristics
             │ optional header             │  Magic, AddressOfEntryPoint, ImageBase, alignments,
             │                             │  SizeOfHeaders, data directories
             ├─────────────────────────────┤
             │ section table (40 B each)   │  Name, VirtualSize, VirtualAddress,
             │                             │  SizeOfRawData, PointerToRawData, Characteristics
             ├─────────────────────────────┤
             │ .text .rdata .data .rsrc    │
             │ .reloc ...                  │
             └─────────────────────────────┘
\`\`\`

- **ترويسة COFF.** الحقل \`Machine\` قيمته 0x14c لـ x86، و0x8664 لـ x64، و0xaa64 لـ ARM64. و\`Characteristics\` مجموعة بتات: 0x0002 تعني صورة قابلة للتنفيذ (executable image)، و0x2000 تعني DLL. ويُفترض أن يكون \`TimeDateStamp\` وقت الربط، لكن عمليات البناء الحتمية (deterministic) قد تخزّن فيه قيمة hash، فلا تعامله دليلاً بمفرده.
- **الترويسة الاختيارية** (وهي إلزامية للصور التنفيذية رغم اسمها). الحقل \`Magic\` قيمته 0x10b لـ **PE32** ‏(32-bit) و0x20b لـ **PE32+** ‏(64-bit). ويقع \`AddressOfEntryPoint\` عند الإزاحة 16 من هذه الترويسة؛ ويقع \`ImageBase\` عند الإزاحة 28 (‏4 بايت) في PE32، وعند الإزاحة 24 (‏8 بايت) في PE32+. والقيم الافتراضية لرابط Microsoft هي 0x400000 لملفات EXE ‏32-bit، و0x10000000 لملفات DLL ‏32-bit، و0x140000000 لملفات EXE ‏64-bit، و0x180000000 لملفات DLL ‏64-bit.
- **RVA** (العنوان الافتراضي النسبي). كل عنوان تقريباً داخل PE إزاحة عن قاعدة الصورة *بعد التحميل*: ‏VA = ImageBase + RVA. ولتجد بايتات RVA داخل الملف تحتاج إلى جدول الأقسام: إزاحة الملف = PointerToRawData + (RVA − VirtualAddress). تُحاذى الأقسام على القرص إلى \`FileAlignment\` (الافتراضي 0x200) وفي الذاكرة إلى \`SectionAlignment\` (الافتراضي حجم الصفحة، 0x1000 في x86)، ولهذا تختلف الإزاحات عن قيم RVA.
- **Data directories.** ستة عشر زوجاً (‏RVA، حجم) في آخر الترويسة الاختيارية تشير إلى جدول التصديرات، وجدول الاستيرادات، والموارد (resources)، وإعادة التموضع الأساسية، وبيانات التنقيح، وجدول Import Address Table ‏(IAT)، وترويسة ‎.NET وغيرها.
- **الاستيرادات.** لكل DLL ‏(\`KERNEL32.dll\` و\`WS2_32.dll\`...) يسرد جدول الاستيرادات الدوال بأسمائها أو بأرقام **ordinal**. وعند التحميل يكتب المُحمِّل عناوينها الحقيقية في **IAT**، ويستدعي الكود عبره (‏\`call qword ptr [rip+...]\`). فـ IAT هو مقابل GOT في صيغة PE.
- **التصديرات.** يسرد export directory في ملف DLL الأسماء وأرقام ordinal التي يقدّمها.
- **إعادة التموضع الأساسية** (‏\`.reloc\`). المواضع التي يجب تصحيحها حين لا تُحمَّل الصورة عند \`ImageBase\` المفضّل لها؛ ومع ASLR (العلم \`DYNAMIC_BASE\`) هذه هي الحالة المعتادة.

على Linux يمكنك قراءة ملفات PE بالأمر \`objdump -x program.exe\` (أدوات binutils تفهم PE)، أو بمكتبة **pefile** في Python، أو بالأمر \`rabin2 -I -i -E\` من radare2، أو بـ Ghidra. ولا يشغّل أيٌّ منها الملف.`,
      },
    },
    {
      type: "lab",
      id: "pe-header",
      lang: "c",
      prompt: {
        en: `## Read a PE header by hand

Write the first step of every PE parser: follow \`e_lfanew\` to the PE header and print the key facts. PE files are always little-endian.

**Input:** one or more files, each given as its first bytes in whitespace-separated hex (any number per line). A line \`===\` separates two files. The starter code already reads the files one by one, calls \`report()\` for each, and prints \`===\` between two reports: you write \`report()\`.

**Layout**

- bytes 0-1: \`4d 5a\` ("MZ"); bytes 0x3c-0x3f: \`e_lfanew\`, a 32-bit offset
- at \`e_lfanew\`: the signature \`50 45 00 00\` ("PE\\0\\0")
- right after it, the 20-byte **COFF header**: \`Machine\` (2 bytes, offset 0), \`NumberOfSections\` (2, offset 2), \`Characteristics\` (2, offset 18)
- right after that, the **optional header**: \`Magic\` (2 bytes, offset 0), \`AddressOfEntryPoint\` (4, offset 16), and \`ImageBase\`: 4 bytes at offset 28 for PE32 (\`0x10b\`) or 8 bytes at offset 24 for PE32+ (\`0x20b\`)

**Output:** for each file, seven lines:

\`\`\`
format: PE32 | PE32+
machine: x86 | x64 | ARM64 | other (0x<hex>)     (0x14c, 0x8664, 0xaa64)
sections: <decimal>
kind: DLL | EXE | not executable                  (bit 0x2000 set, else bit 0x0002 set, else neither)
entry RVA: 0x<hex>
image base: 0x<hex>
entry VA: 0x<hex>                                 (image base + entry RVA)
\`\`\`

Hex is lowercase without padding. Errors: if the file does not start with "MZ", print \`not an MZ file\`. If the signature at \`e_lfanew\` is not "PE\\0\\0", print \`MZ file without a PE header\`. If a needed byte is missing (the input must reach 32 bytes into the optional header) or \`Magic\` is neither value, print \`truncated or corrupt PE header\`.

**Example** (a 64-bit EXE, \`e_lfanew\` = 0x40)

\`\`\`
4d 5a 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 40 00 00 00
50 45 00 00 64 86 03 00 00 00 00 00 00 00 00 00
00 00 00 00 f0 00 22 00 0b 02 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 14 00 00 00 00 00 00
00 00 00 40 01 00 00 00
\`\`\`

Output:

\`\`\`
format: PE32+
machine: x64
sections: 3
kind: EXE
entry RVA: 0x1400
image base: 0x140000000
entry VA: 0x140001400
\`\`\`

(Real files have a DOS stub between the DOS header and the PE signature, so \`e_lfanew\` is usually larger.)`,
        ar: `## اقرأ ترويسة PE يدوياً

اكتب الخطوة الأولى في كل محلّل PE: اتبع \`e_lfanew\` إلى ترويسة PE واطبع الحقائق الأساسية. ملفات PE دائماً little-endian.

**المدخل:** ملف واحد أو أكثر، كل منها أولى بايتاته بصيغة hex تفصل بينها مسافات (بأي عدد في السطر). ويفصل سطر \`===\` بين كل ملفين. والكود الابتدائي يقرأ الملفات واحداً تلو الآخر أصلاً، ويستدعي \`report()\` لكل منها، ويطبع \`===\` بين كل تقريرين: وعليك أنت كتابة \`report()\`.

**التخطيط**

- البايتان 0-1: ‏\`4d 5a\` ("MZ")؛ والبايتات 0x3c-0x3f: ‏\`e_lfanew\` وهي إزاحة 32-bit
- عند \`e_lfanew\`: التوقيع \`50 45 00 00\` ("PE\\0\\0")
- بعده مباشرة **ترويسة COFF** ذات الـ20 بايت: ‏\`Machine\` (بايتان، الإزاحة 0)، و\`NumberOfSections\` (‏2، الإزاحة 2)، و\`Characteristics\` (‏2، الإزاحة 18)
- وبعدها مباشرة **الترويسة الاختيارية**: ‏\`Magic\` (بايتان، الإزاحة 0)، و\`AddressOfEntryPoint\` (‏4، الإزاحة 16)، و\`ImageBase\`: ‏4 بايت عند الإزاحة 28 في PE32 ‏(\`0x10b\`) أو 8 بايت عند الإزاحة 24 في PE32+ ‏(\`0x20b\`)

**المخرج:** لكل ملف سبعة أسطر:

\`\`\`
format: PE32 | PE32+
machine: x86 | x64 | ARM64 | other (0x<hex>)     (0x14c, 0x8664, 0xaa64)
sections: <decimal>
kind: DLL | EXE | not executable                  (bit 0x2000 set, else bit 0x0002 set, else neither)
entry RVA: 0x<hex>
image base: 0x<hex>
entry VA: 0x<hex>                                 (image base + entry RVA)
\`\`\`

الـhex بأحرف صغيرة ودون حشو. الأخطاء: إن لم يبدأ الملف بـ "MZ" فاطبع \`not an MZ file\`. وإن لم يكن التوقيع عند \`e_lfanew\` هو "PE\\0\\0" فاطبع \`MZ file without a PE header\`. وإن نقص بايت مطلوب (يجب أن يصل المدخل إلى 32 بايتاً داخل الترويسة الاختيارية) أو لم يكن \`Magic\` إحدى القيمتين فاطبع \`truncated or corrupt PE header\`.

**مثال** (ملف EXE بـ 64-bit، و\`e_lfanew\` = 0x40)

\`\`\`
4d 5a 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 40 00 00 00
50 45 00 00 64 86 03 00 00 00 00 00 00 00 00 00
00 00 00 00 f0 00 22 00 0b 02 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 14 00 00 00 00 00 00
00 00 00 40 01 00 00 00
\`\`\`

المخرج:

\`\`\`
format: PE32+
machine: x64
sections: 3
kind: EXE
entry RVA: 0x1400
image base: 0x140000000
entry VA: 0x140001400
\`\`\`

(الملفات الحقيقية فيها DOS stub بين ترويسة DOS وتوقيع PE، لذلك تكون \`e_lfanew\` عادةً أكبر.)`,
      },
      starterCode: `#include <stdio.h>
#include <stdint.h>
#include <string.h>

#define MAX 4096

static unsigned char data[MAX];
static size_t len = 0;

/* Little-endian readers: PE files are always little-endian. */
static uint32_t u16(size_t off) { return data[off] | (data[off + 1] << 8); }
static uint32_t u32(size_t off) { return u16(off) | ((uint32_t)u16(off + 2) << 16); }
static uint64_t u64(size_t off) { return u32(off) | ((uint64_t)u32(off + 4) << 32); }

/* Prints the report of one file: its bytes are data[0] .. data[len - 1]. */
static void report(void) {
    /* TODO 1: check "MZ" (else "not an MZ file") and that len >= 0x40. */
    /* TODO 2: pe = u32(0x3c); check the "PE\\0\\0" signature (else "MZ file without a PE header"). */
    /* TODO 3: coff = pe + 4, opt = coff + 20; make sure opt + 32 <= len and Magic is 0x10b or 0x20b. */
    /* TODO 4: read Machine, NumberOfSections, Characteristics, AddressOfEntryPoint and ImageBase,
               then print the seven lines (use %llx with a cast for the 64-bit values). */
    (void)u64;
    printf("not an MZ file\\n");
}

int main(void) {
    char sep[8];
    for (;;) {
        unsigned int byte;
        memset(data, 0, sizeof data);
        len = 0;
        while (scanf("%x", &byte) == 1)
            if (len < MAX) data[len++] = (unsigned char)byte;
        report();
        if (scanf("%7s", sep) != 1) break;   /* the "===" line between two files, or the end */
        printf("===\\n");
    }
    return 0;
}
`,
      solution: `#include <stdio.h>
#include <stdint.h>
#include <string.h>

#define MAX 4096

static unsigned char data[MAX];
static size_t len = 0;

/* Little-endian readers: PE files are always little-endian. */
static uint32_t u16(size_t off) { return data[off] | (data[off + 1] << 8); }
static uint32_t u32(size_t off) { return u16(off) | ((uint32_t)u16(off + 2) << 16); }
static uint64_t u64(size_t off) { return u32(off) | ((uint64_t)u32(off + 4) << 32); }

static const char *machine_name(uint32_t m) {
    switch (m) {
    case 0x14c: return "x86";
    case 0x8664: return "x64";
    case 0xaa64: return "ARM64";
    default: return NULL;
    }
}

static void report(void) {
    if (len < 2 || data[0] != 'M' || data[1] != 'Z') {
        printf("not an MZ file\\n");
        return;
    }
    if (len < 0x40) {
        printf("truncated or corrupt PE header\\n");
        return;
    }
    size_t pe = u32(0x3c);                 /* e_lfanew: where the PE signature starts */
    if (pe + 4 > len) {
        printf("truncated or corrupt PE header\\n");
        return;
    }
    if (data[pe] != 'P' || data[pe + 1] != 'E' || data[pe + 2] != 0 || data[pe + 3] != 0) {
        printf("MZ file without a PE header\\n");
        return;
    }
    size_t coff = pe + 4;                  /* COFF file header, 20 bytes */
    size_t opt = coff + 20;                /* optional header */
    if (opt + 32 > len) {
        printf("truncated or corrupt PE header\\n");
        return;
    }
    uint32_t magic = u16(opt);
    if (magic != 0x10b && magic != 0x20b) {
        printf("truncated or corrupt PE header\\n");
        return;
    }
    uint32_t machine = u16(coff);
    uint32_t sections = u16(coff + 2);
    uint32_t chars = u16(coff + 18);
    uint32_t entry = u32(opt + 16);
    uint64_t base = magic == 0x20b ? u64(opt + 24) : u32(opt + 28);

    printf("format: %s\\n", magic == 0x20b ? "PE32+" : "PE32");
    const char *name = machine_name(machine);
    if (name) printf("machine: %s\\n", name);
    else printf("machine: other (0x%x)\\n", machine);
    printf("sections: %u\\n", sections);
    printf("kind: %s\\n", (chars & 0x2000) ? "DLL" : (chars & 0x0002) ? "EXE" : "not executable");
    printf("entry RVA: 0x%x\\n", entry);
    printf("image base: 0x%llx\\n", (unsigned long long)base);
    printf("entry VA: 0x%llx\\n", (unsigned long long)(base + entry));
}

int main(void) {
    char sep[8];
    for (;;) {
        unsigned int byte;
        memset(data, 0, sizeof data);
        len = 0;
        while (scanf("%x", &byte) == 1)
            if (len < MAX) data[len++] = (unsigned char)byte;
        report();
        if (scanf("%7s", sep) != 1) break;   /* the "===" line between two files, or the end */
        printf("===\\n");
    }
    return 0;
}
`,
      hints: [
        { en: "The helpers already read little-endian numbers. `size_t pe = u32(0x3c);` gives you `e_lfanew`; check `pe + 4 <= len` before you look at the signature bytes.", ar: "الدوال المساعدة تقرأ الأعداد little-endian أصلاً. السطر `size_t pe = u32(0x3c);` يعطيك `e_lfanew`؛ وافحص `pe + 4 <= len` قبل أن تنظر إلى بايتات التوقيع." },
        { en: "The COFF header starts at `pe + 4` and the optional header at `pe + 24`. Both PE32 and PE32+ need 32 bytes of optional header for the fields of this lab.", ar: "تبدأ ترويسة COFF عند `pe + 4` والترويسة الاختيارية عند `pe + 24`. ويحتاج PE32 وPE32+ كلاهما إلى 32 بايتاً من الترويسة الاختيارية لحقول هذا التمرين." },
        { en: "`ImageBase` is `magic == 0x20b ? u64(opt + 24) : u32(opt + 28)`. Print it with `printf(\"0x%llx\", (unsigned long long)base)`; test the DLL bit (0x2000) before the executable bit (0x0002), because a DLL has both.", ar: "قيمة `ImageBase` هي `magic == 0x20b ? u64(opt + 24) : u32(opt + 28)`. اطبعها بـ `printf(\"0x%llx\", (unsigned long long)base)`؛ وافحص بت DLL ‏(0x2000) قبل بت التنفيذ (0x0002) لأن ملف DLL يحمل الاثنين." },
      ],
      tests: [
        { name: { en: "The worked example: a 64-bit EXE", ar: "المثال المحلول: ملف EXE بـ 64-bit" }, stdin: `4d 5a 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 40 00 00 00
50 45 00 00 64 86 03 00 00 00 00 00 00 00 00 00
00 00 00 00 f0 00 22 00 0b 02 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 14 00 00 00 00 00 00
00 00 00 40 01 00 00 00
`, expected: `format: PE32+
machine: x64
sections: 3
kind: EXE
entry RVA: 0x1400
image base: 0x140000000
entry VA: 0x140001400
` },
        { name: { en: "A 32-bit DLL: ImageBase moves to offset 28", ar: "ملف DLL بـ 32-bit: ينتقل ImageBase إلى الإزاحة 28" }, stdin: `4d 5a 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 40 00 00 00
50 45 00 00 4c 01 05 00 00 00 00 00 00 00 00 00
00 00 00 00 e0 00 02 21 0b 01 00 00 00 00 00 00
00 00 00 00 00 00 00 00 a0 12 00 00 00 00 00 00
00 00 00 00 00 00 00 10
`, expected: `format: PE32
machine: x86
sections: 5
kind: DLL
entry RVA: 0x12a0
image base: 0x10000000
entry VA: 0x100012a0
` },
        { name: { en: "An ARM64 EXE whose PE header starts at 0x80", ar: "ملف EXE لـ ARM64 تبدأ ترويسة PE فيه عند 0x80" }, stdin: `4d 5a 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 80 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
50 45 00 00 64 aa 04 00 00 00 00 00 00 00 00 00
00 00 00 00 f0 00 22 00 0b 02 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 20 00 00 00 00 00 00
00 00 00 40 01 00 00 00
`, expected: `format: PE32+
machine: ARM64
sections: 4
kind: EXE
entry RVA: 0x2000
image base: 0x140000000
entry VA: 0x140002000
` },
        { name: { en: "Not PE files: an old 16-bit NE file (MZ, but no PE signature), then an ELF file", ar: "ملفان ليسا PE: ملف NE قديم بـ 16 بت (فيه MZ لكن بلا توقيع PE)، ثم ملف ELF" }, stdin: `4d 5a 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 40 00 00 00
4e 45 00 00 64 86 03 00 00 00 00 00 00 00 00 00
===
7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
`, expected: `MZ file without a PE header
===
not an MZ file
` },
        { name: { en: "Another machine (0x1c4, ARM Thumb-2) whose linker did not set the executable bit", ar: "جهاز آخر (0x1c4، أي ARM Thumb-2) لم يضع الرابط بت التنفيذ في ملفه" }, stdin: `4d 5a 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 40 00 00 00
50 45 00 00 c4 01 02 00 00 00 00 00 00 00 00 00
00 00 00 00 e0 00 00 01 0b 01 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 10 00 00 00 00 00 00
00 00 00 00 00 00 40 00
`, expected: `format: PE32
machine: other (0x1c4)
sections: 2
kind: not executable
entry RVA: 0x1000
image base: 0x400000
entry VA: 0x401000
` },
        { name: { en: "Damaged headers: cut off inside the optional header, then an unknown Magic (0x107)", ar: "ترويسات تالفة: ملف مقطوع داخل الترويسة الاختيارية، ثم قيمة Magic غير معروفة (0x107)" }, stdin: `4d 5a 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 40 00 00 00
50 45 00 00 64 86 03 00 00 00 00 00 00 00 00 00
00 00 00 00 f0 00 22 00 0b 02 00 00 00 00 00 00
00 00 00 00
===
4d 5a 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 40 00 00 00
50 45 00 00 64 86 03 00 00 00 00 00 00 00 00 00
00 00 00 00 f0 00 22 00 07 01 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 14 00 00 00 00 00 00
00 00 00 40 01 00 00 00
`, expected: `truncated or corrupt PE header
===
truncated or corrupt PE header
` },
      ],
    },
    {
      type: "lab",
      id: "rva-to-offset",
      lang: "go",
      prompt: {
        en: `## From RVA to file offset

A string reference in a disassembler says "RVA 0x3100", but you want to patch or extract the bytes from the file on disk. Convert RVAs to file offsets using the section table: the core calculation behind pefile's \`get_offset_from_rva\` (real tools also round some fields to the file alignment, which this lab leaves out).

**Input**

- \`headers H\`: \`SizeOfHeaders\`. RVAs below \`H\` are inside the headers, which are mapped 1:1 (offset = RVA)
- \`sections N\`, then \`N\` lines: \`NAME VirtualAddress VirtualSize PointerToRawData SizeOfRawData\`
- \`queries Q\`, then \`Q\` RVAs, one per line

All numbers are hex with a \`0x\` prefix.

**Rules**

- A section covers the RVAs \`[VirtualAddress, VirtualAddress + VirtualSize)\`. If \`VirtualSize\` is 0 (some linkers leave it empty) use \`SizeOfRawData\` instead.
- Inside a section, \`delta = RVA - VirtualAddress\`. If \`delta < SizeOfRawData\` the byte is in the file at \`PointerToRawData + delta\`. Otherwise it exists only in memory (the loader zero-fills it, like \`.bss\`).

**Output:** one line per query, numbers in lowercase hex with \`0x\`:

\`\`\`
<rva> -> headers at file offset <rva>
<rva> -> <name>+<delta> at file offset <offset>
<rva> -> <name>+<delta> not in the file (zero-filled at load)
<rva> -> not in any section
\`\`\`

**Example**

Input:

\`\`\`
headers 0x400
sections 3
.text 0x1000 0x1a2c 0x400 0x1c00
.rdata 0x3000 0x7f0 0x2000 0x800
.data 0x4000 0x2000 0x2800 0x200
queries 4
0x1010
0x3100
0x4500
0x9000
\`\`\`

Output:

\`\`\`
0x1010 -> .text+0x10 at file offset 0x410
0x3100 -> .rdata+0x100 at file offset 0x2100
0x4500 -> .data+0x500 not in the file (zero-filled at load)
0x9000 -> not in any section
\`\`\``,
        ar: `## من RVA إلى إزاحة في الملف

إشارة نصية في المفكِّك تقول "RVA 0x3100"، لكنك تريد استخراج البايتات من الملف على القرص أو تعديلها. حوّل قيم RVA إلى إزاحات داخل الملف باستخدام جدول الأقسام: وهو الحساب الجوهري خلف الدالة \`get_offset_from_rva\` في pefile (والأدوات الحقيقية تقرّب أيضاً بعض الحقول إلى محاذاة الملف، وهو ما يتركه هذا التمرين).

**المدخل**

- ‏\`headers H\`: قيمة \`SizeOfHeaders\`. قيم RVA الأصغر من \`H\` تقع داخل الترويسات، وهي مُحمَّلة 1:1 (الإزاحة = RVA)
- ‏\`sections N\` ثم \`N\` سطراً: ‏\`NAME VirtualAddress VirtualSize PointerToRawData SizeOfRawData\`
- ‏\`queries Q\` ثم \`Q\` قيمة RVA، واحدة في كل سطر

كل الأعداد بصيغة hex مع البادئة \`0x\`.

**القواعد**

- يغطي القسم قيم RVA في المدى \`[VirtualAddress, VirtualAddress + VirtualSize)\`. وإن كانت \`VirtualSize\` تساوي 0 (بعض الروابط تتركها فارغة) فاستخدم \`SizeOfRawData\` بدلاً منها.
- داخل القسم: ‏\`delta = RVA - VirtualAddress\`. إن كان \`delta < SizeOfRawData\` فالبايت موجود في الملف عند \`PointerToRawData + delta\`. وإلا فهو موجود في الذاكرة فقط (يملؤه المُحمِّل أصفاراً مثل \`.bss\`).

**المخرج:** سطر لكل استعلام، والأعداد hex بأحرف صغيرة مع \`0x\`:

\`\`\`
<rva> -> headers at file offset <rva>
<rva> -> <name>+<delta> at file offset <offset>
<rva> -> <name>+<delta> not in the file (zero-filled at load)
<rva> -> not in any section
\`\`\`

**مثال**

المدخل:

\`\`\`
headers 0x400
sections 3
.text 0x1000 0x1a2c 0x400 0x1c00
.rdata 0x3000 0x7f0 0x2000 0x800
.data 0x4000 0x2000 0x2800 0x200
queries 4
0x1010
0x3100
0x4500
0x9000
\`\`\`

المخرج:

\`\`\`
0x1010 -> .text+0x10 at file offset 0x410
0x3100 -> .rdata+0x100 at file offset 0x2100
0x4500 -> .data+0x500 not in the file (zero-filled at load)
0x9000 -> not in any section
\`\`\``,
      },
      starterCode: `package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
)

type section struct {
	name                        string
	rva, vsize, rawOff, rawSize uint64
}

func num(s string) uint64 {
	v, _ := strconv.ParseUint(s, 0, 64) // base 0 understands the 0x prefix
	return v
}

func main() {
	in := bufio.NewReader(os.Stdin)
	var word, text string
	var count int

	fmt.Fscan(in, &word, &text) // "headers 0x400"
	headers := num(text)

	fmt.Fscan(in, &word, &count) // "sections N"
	sections := make([]section, 0, count)
	for i := 0; i < count; i++ {
		var s section
		var a, b, c, d string
		fmt.Fscan(in, &s.name, &a, &b, &c, &d)
		s.rva, s.vsize, s.rawOff, s.rawSize = num(a), num(b), num(c), num(d)
		// TODO 1: if s.vsize is 0, use s.rawSize instead.
		sections = append(sections, s)
	}

	fmt.Fscan(in, &word, &count) // "queries Q"
	for i := 0; i < count; i++ {
		fmt.Fscan(in, &text)
		rva := num(text)
		// TODO 2: below "headers" -> headers line.
		// TODO 3: find the section that covers rva; print the file offset, or "not in the file" when delta >= rawSize.
		// TODO 4: otherwise print "not in any section". Format numbers with %#x.
		_ = headers
		_ = sections
		fmt.Printf("%#x -> not in any section\\n", rva)
	}
}
`,
      solution: `package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
)

type section struct {
	name                        string
	rva, vsize, rawOff, rawSize uint64
}

func num(s string) uint64 {
	v, _ := strconv.ParseUint(s, 0, 64) // base 0 understands the 0x prefix
	return v
}

func main() {
	in := bufio.NewReader(os.Stdin)
	var word, text string
	var count int

	fmt.Fscan(in, &word, &text) // "headers 0x400"
	headers := num(text)

	fmt.Fscan(in, &word, &count) // "sections N"
	sections := make([]section, 0, count)
	for i := 0; i < count; i++ {
		var s section
		var a, b, c, d string
		fmt.Fscan(in, &s.name, &a, &b, &c, &d)
		s.rva, s.vsize, s.rawOff, s.rawSize = num(a), num(b), num(c), num(d)
		if s.vsize == 0 {
			s.vsize = s.rawSize // some linkers leave VirtualSize at 0
		}
		sections = append(sections, s)
	}

	fmt.Fscan(in, &word, &count) // "queries Q"
	for i := 0; i < count; i++ {
		fmt.Fscan(in, &text)
		rva := num(text)
		if rva < headers {
			fmt.Printf("%#x -> headers at file offset %#x\\n", rva, rva)
			continue
		}
		found := false
		for _, s := range sections {
			if rva >= s.rva && rva < s.rva+s.vsize {
				delta := rva - s.rva
				if delta < s.rawSize {
					fmt.Printf("%#x -> %s+%#x at file offset %#x\\n", rva, s.name, delta, s.rawOff+delta)
				} else {
					fmt.Printf("%#x -> %s+%#x not in the file (zero-filled at load)\\n", rva, s.name, delta)
				}
				found = true
				break
			}
		}
		if !found {
			fmt.Printf("%#x -> not in any section\\n", rva)
		}
	}
}
`,
      hints: [
        { en: "Go's `%#x` verb prints a number in hex with the `0x` prefix (`0x0` for zero), which is exactly the format you need for every number.", ar: "الصيغة `%#x` في Go تطبع العدد بصيغة hex مع البادئة `0x` (و`0x0` للصفر)، وهذا بالضبط ما تحتاجه لكل الأعداد." },
        { en: "Test `rva >= s.rva && rva < s.rva+s.vsize` for each section; the end is exclusive. Then `delta := rva - s.rva` decides between the file offset `s.rawOff+delta` and the zero-filled case.", ar: "اختبر `rva >= s.rva && rva < s.rva+s.vsize` لكل قسم؛ والنهاية غير مشمولة. ثم يحسم `delta := rva - s.rva` بين إزاحة الملف `s.rawOff+delta` وحالة الملء بالأصفار." },
        { en: "Handle the headers first (`rva < headers`), and remember the `VirtualSize == 0` rule while reading the section table, not while answering queries.", ar: "عالج الترويسات أولاً (‏`rva < headers`)، وتذكّر قاعدة `VirtualSize == 0` أثناء قراءة جدول الأقسام لا أثناء الإجابة عن الاستعلامات." },
      ],
      tests: [
        { name: { en: "The worked example", ar: "المثال المحلول" }, stdin: `headers 0x400
sections 3
.text 0x1000 0x1a2c 0x400 0x1c00
.rdata 0x3000 0x7f0 0x2000 0x800
.data 0x4000 0x2000 0x2800 0x200
queries 4
0x1010
0x3100
0x4500
0x9000
`, expected: `0x1010 -> .text+0x10 at file offset 0x410
0x3100 -> .rdata+0x100 at file offset 0x2100
0x4500 -> .data+0x500 not in the file (zero-filled at load)
0x9000 -> not in any section
` },
        { name: { en: "Headers and the edges of a section", ar: "الترويسات وحواف القسم" }, stdin: `headers 0x400
sections 1
.text 0x1000 0xa2c 0x400 0xc00
queries 6
0x0
0x3ff
0x400
0x1000
0x1a2b
0x1a2c
`, expected: `0x0 -> headers at file offset 0x0
0x3ff -> headers at file offset 0x3ff
0x400 -> not in any section
0x1000 -> .text+0x0 at file offset 0x400
0x1a2b -> .text+0xa2b at file offset 0xe2b
0x1a2c -> not in any section
` },
        { name: { en: "A section with no bytes in the file", ar: "قسم لا بايتات له في الملف" }, stdin: `headers 0x400
sections 2
.text 0x1000 0x800 0x400 0x800
.bss 0x2000 0x1000 0x0 0x0
queries 3
0x2000
0x2fff
0x3000
`, expected: `0x2000 -> .bss+0x0 not in the file (zero-filled at load)
0x2fff -> .bss+0xfff not in the file (zero-filled at load)
0x3000 -> not in any section
` },
        { name: { en: "VirtualSize 0: fall back to SizeOfRawData", ar: "‏VirtualSize تساوي 0: الرجوع إلى SizeOfRawData" }, stdin: `headers 0x200
sections 2
CODE 0x1000 0x0 0x200 0x600
DATA 0x2000 0x0 0x800 0x200
queries 4
0x15ff
0x1600
0x21ff
0x2200
`, expected: `0x15ff -> CODE+0x5ff at file offset 0x7ff
0x1600 -> not in any section
0x21ff -> DATA+0x1ff at file offset 0x9ff
0x2200 -> not in any section
` },
        { name: { en: "A larger image, with upper-case hex in the queries", ar: "صورة أكبر، مع hex بأحرف كبيرة في الاستعلامات" }, stdin: `headers 0x1000
sections 2
.text 0x1000 0x1f2e40 0x1000 0x1f3000
.rsrc 0x3a0000 0x4a2b0 0x2b4000 0x4a400
queries 3
0X1F2E3F
0x3EA2AF
0x3ea2b0
`, expected: `0x1f2e3f -> .text+0x1f1e3f at file offset 0x1f2e3f
0x3ea2af -> .rsrc+0x4a2af at file offset 0x2fe2af
0x3ea2b0 -> not in any section
` },
      ],
      sampleInput: `headers 0x400
sections 3
.text 0x1000 0x1a2c 0x400 0x1c00
.rdata 0x3000 0x7f0 0x2000 0x800
.data 0x4000 0x2000 0x2800 0x200
queries 4
0x1010
0x3100
0x4500
0x9000
`,
    },
    {
      type: "text",
      body: {
        en: `## Your toolbelt: which tool answers which question

- **What is it?** \`file\` reads the magic bytes and the header.
- **How is it built?** \`readelf -h -l -S\` for ELF; \`objdump -x\` for ELF and PE. \`readelf\` parses ELF directly, while \`objdump\` goes through the BFD library, which understands many formats.
- **What does it need and offer?** \`readelf -d\` (look for \`NEEDED\`), \`nm -D\`, \`readelf --dyn-syms\`; for PE the import and export directories (\`objdump -x\`, pefile, \`rabin2 -i\` / \`-E\`).
- **What does the loader patch?** \`readelf -r\`, and for PE the base relocation directory.
- **What does the code do?** \`objdump -d -M intel\` for a quick look, then a disassembler and decompiler: **Ghidra** (free, released as open source by the NSA in 2019), radare2, Cutter (the graphical interface of Rizin, a fork of radare2), IDA or Binary Ninja.

A first session in Ghidra: create a project, import the file (it recognizes ELF or PE and the CPU), accept the auto-analysis, then use the **Symbol Tree** (Imports, Exports, Functions), the **Defined Strings** window, the **Memory Map** (it shows the segments and sections from this lesson, with their permissions) and the cross-references from the static-analysis lesson. Rename things as you understand them.

A practical order for an unknown ELF:

\`\`\`bash
file sample                      # format, architecture, PIE, stripped?
readelf -h sample                # entry point, table positions
readelf -lW sample               # segments and permissions: anything RWE?
readelf -SW sample               # sections: odd names, huge or high-entropy sections?
readelf -d sample | grep NEEDED  # libraries
nm -D sample                     # imports and exports
readelf -rW sample               # which slots get which symbols
objdump -d -M intel sample | less
\`\`\`

None of these commands executes the file. The exception to remember from the first lesson is \`ldd\`, which may run the program's loader: prefer \`readelf -d\`. Unusual structure is itself a finding: a writable and executable segment, a section table that disagrees with the segments, an entry point outside \`.text\`, or almost no imports in a large file (a common sign of packing) are all worth a note.`,
        ar: `## عدّتك: أي أداة تجيب عن أي سؤال

- **ما هو؟** الأمر \`file\` يقرأ magic bytes والترويسة.
- **كيف بُني؟** ‏\`readelf -h -l -S\` لملفات ELF؛ و\`objdump -x\` لملفات ELF وPE. يحلّل \`readelf\` صيغة ELF مباشرة، بينما يمرّ \`objdump\` عبر مكتبة BFD التي تفهم صيغاً كثيرة.
- **ماذا يحتاج وماذا يقدّم؟** ‏\`readelf -d\` (ابحث عن \`NEEDED\`)، و\`nm -D\`، و\`readelf --dyn-syms\`؛ وفي PE جدولا الاستيرادات والتصديرات (‏\`objdump -x\` أو pefile أو \`rabin2 -i\` / \`-E\`).
- **ماذا يصحّح المُحمِّل؟** ‏\`readelf -r\`، وفي PE جدول إعادة التموضع الأساسية (base relocations).
- **ماذا يفعل الكود؟** ‏\`objdump -d -M intel\` لنظرة سريعة، ثم مفكِّك وdecompiler: ‏**Ghidra** (مجاني، نشرته NSA مفتوح المصدر عام 2019)، أو radare2، أو Cutter (الواجهة الرسومية لـ Rizin، وهو تفرّع من radare2)، أو IDA، أو Binary Ninja.

جلسة أولى في Ghidra: أنشئ مشروعاً، واستورد الملف (يتعرّف على ELF أو PE وعلى المعالج)، واقبل التحليل التلقائي، ثم استخدم **Symbol Tree** (‏Imports وExports وFunctions)، ونافذة **Defined Strings**، و**Memory Map** (تعرض segments والأقسام التي تعلمتها في هذا الدرس مع صلاحياتها)، والمراجع المتقاطعة من درس التحليل الساكن. وأعد تسمية الأشياء كلما فهمتها.

ترتيب عملي لملف ELF مجهول:

\`\`\`bash
file sample                      # format, architecture, PIE, stripped?
readelf -h sample                # entry point, table positions
readelf -lW sample               # segments and permissions: anything RWE?
readelf -SW sample               # sections: odd names, huge or high-entropy sections?
readelf -d sample | grep NEEDED  # libraries
nm -D sample                     # imports and exports
readelf -rW sample               # which slots get which symbols
objdump -d -M intel sample | less
\`\`\`

لا ينفّذ أيٌّ من هذه الأوامر الملف. والاستثناء الذي يجب تذكّره من الدرس الأول هو \`ldd\` الذي قد يشغّل مُحمِّل البرنامج: فضّل عليه \`readelf -d\`. والبنية غير المعتادة اكتشاف بحد ذاتها: segment قابل للكتابة والتنفيذ، أو جدول أقسام يناقض الـsegments، أو نقطة دخول خارج \`.text\`، أو استيرادات شبه معدومة في ملف كبير (علامة شائعة على التعبئة packing)، كلها تستحق أن تُدوَّن.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Which table does the loader need in order to run an ELF program?", ar: "أي جدول يحتاجه المُحمِّل ليشغّل برنامج ELF؟" },
          choices: [
            { en: "The section header table", ar: "جدول section headers" },
            { en: "The program header table (the segments)", ar: "جدول program headers (أي الـsegments)" },
            { en: "The .symtab symbol table", ar: "جدول الرموز .symtab" },
            { en: "The .comment section", ar: "القسم .comment" },
          ],
          answer: 1,
          explain: {
            en: "The loader maps segments described by the program headers. Sections exist for linkers and analysts, so a binary still runs with its section table removed, and .symtab and .comment are not even loaded into memory.",
            ar: "يُحمِّل المُحمِّل الـsegments التي تصفها program headers. أما الأقسام فهي للروابط والمحللين، فيبقى الملف قابلاً للتشغيل حتى لو حُذف جدول أقسامه، و.symtab و.comment لا يُحمَّلان إلى الذاكرة أصلاً.",
          },
        },
        {
          q: { en: "A LOAD segment has FileSiz 0x25c and MemSiz 0x268. What happens to the extra 0xc bytes?", ar: "segment من نوع LOAD حجمه في الملف 0x25c وفي الذاكرة 0x268. ماذا يحدث للبايتات الـ0xc الزائدة؟" },
          choices: [
            { en: "The loader reads them from the next segment in the file", ar: "يقرؤها المُحمِّل من الـsegment التالي في الملف" },
            { en: "The program crashes because the sizes disagree", ar: "ينهار البرنامج لأن الحجمين مختلفان" },
            { en: "They are zero-filled memory, typically holding .bss", ar: "هي ذاكرة تُملأ أصفاراً، وتحمل عادةً .bss" },
          ],
          answer: 2,
          explain: {
            en: "When p_memsz is larger than p_filesz the loader allocates the difference and fills it with zeros. That is exactly how .bss (zero-initialized globals) occupies memory without taking any space in the file.",
            ar: "عندما يكون p_memsz أكبر من p_filesz يخصّص المُحمِّل الفرق ويملؤه بالأصفار. وبهذا بالضبط يشغل .bss (المتغيرات العامة المُهيّأة بالصفر) ذاكرةً دون أن يأخذ أي مساحة في الملف.",
          },
        },
        {
          q: { en: "After `strip`, `nm hello` prints \"no symbols\" but `nm -D hello` still lists puts. Why?", ar: "بعد `strip` يطبع `nm hello` عبارة \"no symbols\" لكن `nm -D hello` ما زال يعرض puts. لماذا؟" },
          choices: [
            { en: "strip removes .symtab, but .dynsym is needed for dynamic linking at run time and must stay", ar: "يحذف strip القسم .symtab، أما .dynsym فلازم للربط الديناميكي وقت التشغيل ويجب أن يبقى" },
            { en: "nm -D reads the symbols from the source code", ar: "يقرأ nm -D الرموز من الكود المصدري" },
            { en: "strip failed and should be run twice", ar: "فشل strip ويجب تشغيله مرتين" },
            { en: "puts is compiled into the program, so it can never be removed", ar: "‏puts مُصرَّفة داخل البرنامج فلا يمكن حذفها أبداً" },
          ],
          answer: 0,
          explain: {
            en: "The dynamic loader resolves imports by name through .dynsym, so removing it would break the program. That is why imports survive stripping and are such a dependable triage clue, while local names such as main disappear.",
            ar: "يحلّ المُحمِّل الديناميكي الاستيرادات بأسمائها عبر .dynsym، فحذفه يكسر البرنامج. ولهذا تنجو الاستيرادات من التجريد وتُعدّ دليلاً موثوقاً في الفرز، بينما تختفي الأسماء المحلية مثل main.",
          },
        },
        {
          q: { en: "A PIE is loaded at base 0x555555554000. What does an R_X86_64_RELATIVE relocation with addend 0x1140 write?", ar: "حُمِّل ملف PIE عند القاعدة 0x555555554000. ماذا يكتب relocation من نوع R_X86_64_RELATIVE إضافته 0x1140؟" },
          choices: [
            { en: "0x1140", ar: "0x1140" },
            { en: "0x555555555140", ar: "0x555555555140" },
            { en: "The address of puts inside libc", ar: "عنوان puts داخل libc" },
            { en: "0x555555554000", ar: "0x555555554000" },
          ],
          answer: 1,
          explain: {
            en: "RELATIVE means base plus addend: 0x555555554000 + 0x1140 = 0x555555555140. It needs no symbol at all, which is why it is used for pointers into the program itself; symbol addresses such as puts come from GLOB_DAT or JUMP_SLOT.",
            ar: "‏RELATIVE تعني القاعدة زائد الإضافة: ‏0x555555554000 + 0x1140 = 0x555555555140. ولا تحتاج إلى أي رمز، ولهذا تُستخدم للمؤشرات إلى داخل البرنامج نفسه؛ أما عناوين الرموز مثل puts فتأتي من GLOB_DAT أو JUMP_SLOT.",
          },
        },
        {
          q: { en: "A PE's .text section has VirtualAddress 0x1000 and PointerToRawData 0x400. At which file offset are the bytes of RVA 0x1234?", ar: "قسم .text في ملف PE له VirtualAddress ‏0x1000 وPointerToRawData ‏0x400. عند أي إزاحة في الملف توجد بايتات RVA ‏0x1234؟" },
          choices: [
            { en: "0x1234", ar: "0x1234" },
            { en: "0x1634", ar: "0x1634" },
            { en: "0x834", ar: "0x834" },
            { en: "0x634", ar: "0x634" },
          ],
          answer: 3,
          explain: {
            en: "Offset = PointerToRawData + (RVA - VirtualAddress) = 0x400 + 0x234 = 0x634. Using the RVA directly as an offset is the classic mistake: sections are aligned differently on disk and in memory, so the two numbering systems differ.",
            ar: "الإزاحة = PointerToRawData + (RVA - VirtualAddress) = 0x400 + 0x234 = 0x634. واستخدام RVA مباشرة كإزاحة هو الخطأ الكلاسيكي: الأقسام تُحاذى على القرص بشكل مختلف عنها في الذاكرة، فيختلف نظاما الترقيم.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary and what to practice next

- An ELF file has two views: **sections** for linkers and analysts, **segments** for the loader; only the segments are needed to run it
- \`p_memsz > p_filesz\` means zero-filled memory (\`.bss\`); segment **permissions** matter, and writable plus executable is a red flag
- **Imports** live in \`.dynsym\` and survive stripping; **exports** are what a library offers; **relocations** say which slot receives which address (RELATIVE = base + addend)
- A **PE** starts with MZ, \`e_lfanew\` points to "PE\\0\\0", then the COFF header, the optional header (PE32 or PE32+) and the section table; convert an **RVA** with PointerToRawData + (RVA − VirtualAddress)
- Use \`file\`, \`readelf\`, \`nm\`, \`objdump\` first, then a disassembler such as **Ghidra**; none of them runs the file

**Practice next:** compile a small C program twice, once with \`-O0\` and once with \`-O2 -s\` (stripped), and compare \`readelf -lW\`, \`nm\` and \`nm -D\` for both. Build a tiny shared library with one exported function and find it with \`nm -D --defined-only\`. If you have a Windows SDK sample or an open-source Windows program you are allowed to study, load it with pefile and walk its import table. Next: how defenders use all of this to study malicious software safely.`,
        ar: `## الخلاصة وماذا تتدرّب عليه بعد ذلك

- لملف ELF منظوران: **الأقسام (sections)** للروابط والمحللين، و**segments** للمُحمِّل؛ والـsegments وحدها لازمة للتشغيل
- ‏\`p_memsz > p_filesz\` تعني ذاكرة تُملأ أصفاراً (‏\`.bss\`)؛ و**صلاحيات** الـsegments مهمة، والجمع بين الكتابة والتنفيذ علامة تحذير
- **الاستيرادات** تعيش في \`.dynsym\` وتنجو من التجريد؛ و**التصديرات** ما تقدّمه المكتبة؛ و**إعادة التموضع** تحدّد أي خانة تتلقى أي عنوان (‏RELATIVE = القاعدة + الإضافة)
- يبدأ ملف **PE** بـ MZ، وتشير \`e_lfanew\` إلى "PE\\0\\0"، ثم ترويسة COFF، ثم الترويسة الاختيارية (‏PE32 أو PE32+)، ثم جدول الأقسام؛ وتحوّل **RVA** بالصيغة PointerToRawData + (RVA − VirtualAddress)
- استخدم \`file\` و\`readelf\` و\`nm\` و\`objdump\` أولاً، ثم مفكِّكاً مثل **Ghidra**؛ ولا يشغّل أيٌّ منها الملف

**تدرّب بعد ذلك:** صرّف برنامج C صغيراً مرتين، مرة بـ \`-O0\` ومرة بـ \`-O2 -s\` (مجرَّداً)، وقارن \`readelf -lW\` و\`nm\` و\`nm -D\` للنسختين. ابنِ مكتبة مشتركة صغيرة فيها دالة واحدة مُصدَّرة وابحث عنها بـ \`nm -D --defined-only\`. وإن كان لديك مثال من Windows SDK أو برنامج Windows مفتوح المصدر يحق لك دراسته، فحمّله بمكتبة pefile وتجوّل في جدول استيراداته. والتالي: كيف يستخدم المدافعون كل هذا لدراسة البرمجيات الخبيثة بأمان.`,
      },
    },
  ],
};
