import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "static-analysis-deobfuscation",
  title: {
    en: "Static Analysis & Deobfuscation — Examine the Package Before You Open It",
    ar: "التحليل الساكن وفك التعتيم — افحص الطرد قبل أن تفتحه",
  },
  estMinutes: 45,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

By the end of this lesson you will be able to:

- Run a **static triage** on an unknown file: identify it, fingerprint it, list its **strings** and **imports**, and judge its **entropy**, all without executing it
- Read **disassembler and decompiler** output with the right amount of suspicion
- Tell **encoding**, **obfuscation** and **encryption** apart
- Peel layered encodings such as **Base64**, **XOR** and **ROT13** to reach the real content, and write the small tools that do it

## The suspicious parcel 📦

A parcel arrives and you do not know what is inside. A sensible person does not tear it open on the kitchen table. First you look at the outside: the label, the weight, the shape. You might shake it gently or put it through an X-ray. Only after you have a good guess do you open it, and then only in a safe place.

**Static analysis** is everything you do to a program *without running it*: inspecting the label (file type), the contents list (strings and imports), the X-ray (entropy and structure) and the blueprints (disassembly). It is safe, repeatable and always the first step. Its weakness is that a program can hide its real content behind layers of wrapping. **Deobfuscation** is the art of unwrapping those layers.

A reminder from the first lesson: only analyze files that are yours, open source, made for practice, or that you have permission to examine. Every sample in this lesson is a harmless text written for teaching.`,
        ar: `## ماذا ستتعلم

في نهاية هذا الدرس ستكون قادراً على:

- إجراء **فرز ساكن (static triage)** لملف مجهول: تحديد نوعه، وأخذ بصمته، وسرد **strings** و**imports** فيه، وتقدير **entropy**، كل ذلك دون تشغيله
- قراءة ناتج **المفكِّك (disassembler)** و**المُفكِّك إلى كود عالٍ (decompiler)** بالقدر الصحيح من الحذر
- التمييز بين **الترميز (encoding)** و**التعتيم (obfuscation)** و**التشفير (encryption)**
- فك طبقات الترميز مثل **Base64** و**XOR** و**ROT13** للوصول إلى المحتوى الحقيقي، وكتابة الأدوات الصغيرة التي تفعل ذلك

## الطرد المشبوه 📦

يصلك طرد ولا تعرف ما بداخله. الشخص العاقل لا يمزّقه على طاولة المطبخ. أولاً تنظر إلى الخارج: الملصق والوزن والشكل. قد تهزّه بلطف أو تمرّره في جهاز أشعة. وبعد أن يصبح لديك تخمين جيد تفتحه، وفي مكان آمن فقط.

**التحليل الساكن (Static analysis)** هو كل ما تفعله ببرنامج *دون تشغيله*: فحص الملصق (نوع الملف)، وقائمة المحتويات (strings وimports)، والأشعة (entropy والبنية)، والمخططات (التفكيك disassembly). إنه آمن وقابل للتكرار وهو دائماً الخطوة الأولى. ونقطة ضعفه أن البرنامج قد يخفي محتواه الحقيقي خلف طبقات من التغليف. و**فك التعتيم (Deobfuscation)** هو فن إزالة هذه الطبقات.

تذكير من الدرس الأول: حلّل فقط الملفات التي هي ملكك، أو المفتوحة المصدر، أو المصنوعة للتدريب، أو التي لديك إذن بفحصها. كل عينة في هذا الدرس نص غير ضار كُتب للتعليم.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A static triage checklist

Work from the cheapest, safest question to the most expensive one. Each command below only *reads* the file.

**1. What is it?** The extension lies; the magic bytes do not.

\`\`\`bash
file sample                 # ELF 64-bit LSB pie executable, x86-64, dynamically linked, stripped
sha256sum sample            # a fingerprint to name this exact file in your notes
\`\`\`

A **hash** identifies a file: change one byte and the hash changes completely. Analysts record it in their notes and compare it with public reputation databases instead of uploading private files. A hash cannot be "decoded" back into the file, it is one-way.

**2. What does it say?** Text hides in binaries: messages, file paths, URLs, error strings, format strings.

\`\`\`bash
strings -n 6 sample         # printable runs of at least 6 characters (the default minimum is 4)
strings -e l sample         # 16-bit little-endian text (Windows programs often use UTF-16)
\`\`\`

**3. What does it use?** Programs reach the outside world through library functions, so the **imports** are a summary of its abilities.

\`\`\`bash
readelf -d sample | grep NEEDED   # shared libraries it loads
nm -D sample                      # dynamic symbols; "U" marks functions it imports
\`\`\`

An import list with \`socket\`, \`connect\` and \`send\` suggests networking. \`fopen\` and \`unlink\` mean files. \`ptrace\` often means a debugger or an anti-debugger. One import proves nothing, but the whole list sketches a profile.

**4. Is it wrapped?** A packed or encrypted section looks like random noise. **Shannon entropy** measures that on a scale from 0 to 8 bits per byte: zero padding is about 0, English text and normal code sit roughly between 4 and 6, and compressed or encrypted data approaches 7.5 to 8. One high-entropy region inside a mostly normal file is a flag to investigate.

**5. Then read it:** the section list (\`readelf -S\`), then the disassembly (\`objdump -d -M intel\`) or a decompiler.

Keep a notebook: file name, hash, what you tried, what you learned, what you still wonder. Static analysis is detective work, and detectives write things down.`,
        ar: `## قائمة فحص للفرز الساكن

اعمل من أرخص الأسئلة وأكثرها أماناً إلى أغلاها. كل أمر أدناه *يقرأ* الملف فقط.

**1. ما هو؟** الامتداد قد يكذب؛ أما magic bytes فلا.

\`\`\`bash
file sample                 # ELF 64-bit LSB pie executable, x86-64, dynamically linked, stripped
sha256sum sample            # a fingerprint to name this exact file in your notes
\`\`\`

الـ**hash** يعرّف الملف: غيّر بايتاً واحداً فيتغير الـhash كلياً. يسجّله المحللون في ملاحظاتهم ويقارنونه بقواعد بيانات السمعة العامة بدل رفع ملفات خاصة. ولا يمكن "فك" الـhash لاسترجاع الملف، فهو باتجاه واحد.

**2. ماذا يقول؟** النصوص تختبئ داخل الملفات التنفيذية: رسائل ومسارات وعناوين URL ونصوص أخطاء وصيغ تنسيق.

\`\`\`bash
strings -n 6 sample         # printable runs of at least 6 characters (the default minimum is 4)
strings -e l sample         # 16-bit little-endian text (Windows programs often use UTF-16)
\`\`\`

**3. ماذا يستخدم؟** البرامج تصل إلى العالم الخارجي عبر دوال المكتبات، فـ**imports** تلخّص قدراتها.

\`\`\`bash
readelf -d sample | grep NEEDED   # shared libraries it loads
nm -D sample                      # dynamic symbols; "U" marks functions it imports
\`\`\`

قائمة imports فيها \`socket\` و\`connect\` و\`send\` توحي بالشبكات. و\`fopen\` و\`unlink\` تعنيان ملفات. و\`ptrace\` كثيراً ما تعني منقّحاً أو مضاداً للمنقّحات. استيراد واحد لا يثبت شيئاً، لكن القائمة كلها ترسم ملامح.

**4. هل هو مغلَّف؟** القسم المضغوط أو المشفّر يبدو كضوضاء عشوائية. و**Shannon entropy** تقيس ذلك على مقياس من 0 إلى 8 بت لكل بايت: الحشو الصفري قرابة 0، والنص الإنجليزي والكود العادي يقعان تقريباً بين 4 و6، والبيانات المضغوطة أو المشفّرة تقترب من 7.5 إلى 8. منطقة واحدة عالية الـentropy داخل ملف عادي في معظمه علامة تستدعي التحقيق.

**5. ثم اقرأه:** قائمة الأقسام (\`readelf -S\`)، ثم التفكيك (\`objdump -d -M intel\`) أو decompiler.

احتفظ بدفتر: اسم الملف، والـhash، وما جرّبته، وما تعلمته، وما زلت تتساءل عنه. التحليل الساكن عمل مخبرين، والمخبرون يدوّنون.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `import hashlib
import math
from collections import Counter


def entropy(data: bytes) -> float:
    """Shannon entropy in bits per byte: 0 = one repeated value, 8 = looks perfectly random."""
    n = len(data)
    h = 0.0
    for count in Counter(data).values():
        p = count / n
        h -= p * math.log2(p)
    return h


text = b"The quick brown fox jumps over the lazy dog. " * 20
padding = bytes(900)

# Deterministic noise: chained SHA-256 digests look like encrypted or compressed data.
noise = b""
block = b"seed"
while len(noise) < 900:
    block = hashlib.sha256(block).digest()
    noise += block

for name, blob in [("zero padding", padding), ("English text", text), ("hash-like noise", noise[:900])]:
    print(f"{name:16} {len(blob):4} bytes   entropy = {entropy(blob):.2f} bits/byte")`,
      explanation: {
        en: "Run it: padding scores 0, text lands around 4.4, and the noise comes close to 8. Now try `text.upper()` or a text twice as long and watch the number barely move: entropy depends on the *mix* of byte values, not on the length. Real tools such as `binwalk -E` apply exactly this idea block by block.",
        ar: "شغّله: الحشو يسجّل 0، والنص يقع قرابة 4.4، والضوضاء تقترب من 8. جرّب الآن `text.upper()` أو نصاً بطول الضعف وشاهد الرقم بالكاد يتحرك: الـentropy تعتمد على *توزيع* قيم البايتات وليس على الطول. أدوات حقيقية مثل `binwalk -E` تطبّق هذه الفكرة نفسها كتلةً كتلة.",
      },
    },
    {
      type: "lab",
      id: "extract-strings",
      lang: "go",
      prompt: {
        en: `## Write a \`strings\` extractor

The first tool of every triage is \`strings\`. Build a small version of it. Go is a popular choice for analyst tooling because it compiles to one fast, dependency-free program.

The input is the bytes of a file written as hex. The **first line** is the minimum length \`N\`. The rest of the input is whitespace-separated hex bytes (any case, spread over any number of lines).

Find every **run of printable ASCII**: consecutive bytes in the range \`0x20\` to \`0x7e\` (space through \`~\`). For every run of **at least N** bytes print one line:

\`\`\`
0x<offset>  <the text>
\`\`\`

The offset is where the run starts, in lowercase hex padded to at least 4 digits (\`%04x\`), followed by **two spaces**. A run that reaches the end of the input still counts. If nothing qualifies print nothing.

**Example**

Input:

\`\`\`
4
00 48 65 6c 6c 6f 00 01 41 42 00 70 61 73 73 77 6f 72 64 ff
\`\`\`

Output:

\`\`\`
0x0001  Hello
0x000b  password
\`\`\`

(\`AB\` is only 2 bytes long, so it is skipped.)`,
        ar: `## اكتب مستخرِج \`strings\`

أول أداة في كل فرز هي \`strings\`. ابنِ نسخة صغيرة منها. Go خيار شائع لأدوات المحللين لأنه يُصرَّف إلى برنامج واحد سريع بلا اعتماديات.

المدخل هو بايتات ملف مكتوبة بصيغة hex. **السطر الأول** هو الحد الأدنى للطول \`N\`. وباقي المدخل بايتات hex تفصل بينها مسافات (بأي حالة أحرف، وموزعة على أي عدد من الأسطر).

ابحث عن كل **سلسلة من ASCII القابل للطباعة**: بايتات متتالية في المدى \`0x20\` إلى \`0x7e\` (من المسافة إلى \`~\`). ولكل سلسلة طولها **N على الأقل** اطبع سطراً:

\`\`\`
0x<offset>  <the text>
\`\`\`

الإزاحة (offset) هي موضع بداية السلسلة، بـ hex بأحرف صغيرة ومحشوّة إلى 4 خانات على الأقل (‏\`%04x\`)، يليها **مسافتان**. والسلسلة التي تصل إلى نهاية المدخل تُحسب أيضاً. وإن لم تتحقق أي سلسلة فلا تطبع شيئاً.

**مثال**

المدخل:

\`\`\`
4
00 48 65 6c 6c 6f 00 01 41 42 00 70 61 73 73 77 6f 72 64 ff
\`\`\`

المخرج:

\`\`\`
0x0001  Hello
0x000b  password
\`\`\`

(‏\`AB\` طولها بايتان فقط، فتُتجاهل.)`,
      },
      starterCode: `package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
)

func main() {
	reader := bufio.NewReader(os.Stdin)

	// First token: the minimum run length.
	var minLen int
	fmt.Fscan(reader, &minLen)

	// Every following token is one byte in hex.
	var data []byte
	for {
		var token string
		if _, err := fmt.Fscan(reader, &token); err != nil {
			break
		}
		if v, err := strconv.ParseUint(token, 16, 8); err == nil {
			data = append(data, byte(v))
		}
	}

	// TODO 1: walk through data and remember where the current printable run (0x20..0x7e) started.
	// TODO 2: when the run ends (a non-printable byte, or the end of data) and it is at least minLen long,
	//         print it with fmt.Printf("0x%04x  %s\\n", start, data[start:end]).
	_ = minLen
	_ = data
}
`,
      solution: `package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
)

func printable(b byte) bool {
	return b >= 0x20 && b <= 0x7e
}

func main() {
	reader := bufio.NewReader(os.Stdin)

	var minLen int
	fmt.Fscan(reader, &minLen)

	var data []byte
	for {
		var token string
		if _, err := fmt.Fscan(reader, &token); err != nil {
			break
		}
		if v, err := strconv.ParseUint(token, 16, 8); err == nil {
			data = append(data, byte(v))
		}
	}

	start := -1 // index where the current printable run began, -1 when not inside a run
	report := func(end int) {
		if start >= 0 && end-start >= minLen {
			fmt.Printf("0x%04x  %s\\n", start, data[start:end])
		}
		start = -1
	}
	for i, b := range data {
		if printable(b) {
			if start < 0 {
				start = i
			}
		} else {
			report(i)
		}
	}
	report(len(data)) // a run can touch the end of the input
}
`,
      hints: [
        { en: "Keep an integer \`start\` that is -1 while you are outside a run. When you meet a printable byte and \`start < 0\`, set \`start = i\`.", ar: "احتفظ بعدد صحيح \`start\` قيمته -1 عندما تكون خارج أي سلسلة. وعندما تصادف بايتاً قابلاً للطباعة و\`start < 0\` اجعل \`start = i\`." },
        { en: "A non-printable byte at index \`i\` ends the run \`data[start:i]\`. Its length is \`i - start\`; print it only if that is at least \`minLen\`, then set \`start\` back to -1.", ar: "البايت غير القابل للطباعة عند الفهرس \`i\` ينهي السلسلة \`data[start:i]\`. طولها \`i - start\`؛ اطبعها فقط إن كان الطول \`minLen\` على الأقل، ثم أعد \`start\` إلى -1." },
        { en: "Do not forget the last run: after the loop, run the same end-of-run check with \`end = len(data)\`. A small closure that you call in both places keeps the code short.", ar: "لا تنسَ السلسلة الأخيرة: بعد الحلقة نفّذ فحص نهاية السلسلة نفسه مع \`end = len(data)\`. دالة صغيرة (closure) تستدعيها في الموضعين تُبقي الكود قصيراً." },
      ],
      tests: [
        { name: { en: "The worked example", ar: "المثال المحلول" }, stdin: `4
00 48 65 6c 6c 6f 00 01 41 42 00 70 61 73 73 77 6f 72 64 ff
`, expected: `0x0001  Hello
0x000b  password
` },
        { name: { en: "A run of exactly N is kept, N-1 is dropped, and a run may end the input", ar: "السلسلة التي طولها N بالضبط تبقى، وN-1 تُحذف، وقد تنتهي سلسلة بنهاية المدخل" }, stdin: `3
41 42 00 43 44 45 00 46 47 48 49
`, expected: `0x0003  CDE
0x0007  FGHI
` },
        { name: { en: "Space and tilde are printable, 0x7f and 0x80 are not", ar: "المسافة و~ قابلتان للطباعة، أما 0x7f و0x80 فلا" }, stdin: `1
7f 20 7e 80 41
`, expected: `0x0001   ~
0x0004  A
` },
        { name: { en: "No run is long enough: no output", ar: "لا توجد سلسلة بالطول الكافي: لا مخرجات" }, stdin: `4
00 01 02 41 42 43 00
`, expected: "" },
        { name: { en: "Strings inside an ELF-like dump (mixed-case hex, several lines)", ar: "نصوص داخل مخرجات تشبه ELF (‏hex بحالات أحرف مختلطة وعدة أسطر)" }, stdin: `6
7f 45 4c 46 02 01 01 00 00 00 2e 74 65 78 74 00
2e 64 61 74 61 00 2f 6C 69 62 36 34 2f 6C 64 2D
6c 69 6e 75 78 2D 78 38 36 2D 36 34 2e 73 6f 2E
32 00 47 4C 49 42 43 5F 32 2E 32 2E 35 00 55 73
61 67 65 3A 20 25 73 20 3c 66 69 6C 65 3E 0a 00
ff FE
`, expected: `0x0016  /lib64/ld-linux-x86-64.so.2
0x0032  GLIBC_2.2.5
0x003e  Usage: %s <file>
` },
        { name: { en: "A larger input: 120 repeated records", ar: "مدخل أكبر: 120 سجلاً متكرراً" }, stdin: `4
${"41 42 43 44 00 ".repeat(120).trim()}
`, expected: `${Array.from({ length: 120 }, (_, i) => `0x${(i * 5).toString(16).padStart(4, "0")}  ABCD`).join("\n")}
` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Reading disassembly and decompiler output

When the triage says "this is worth a closer look", you open the file in a **disassembler** (\`objdump -d\`, **Ghidra**, **radare2** / Cutter, IDA, Binary Ninja). Ghidra is free and open source, which makes it a great place to learn. A good disassembler gives you much more than a text dump:

- **Cross-references (xrefs):** "who uses this string?" and "who calls this function?" are the two questions you will ask most
- A **function list**, a **call graph** and a **control-flow graph** that draws the jumps from the previous lesson as boxes and arrows
- A **decompiler** that turns assembly back into C-like pseudo-code

A classic workflow is to **start from a clue and work outward**: find an interesting string (an error message, a path), follow its xref to the code that prints it, and read the few instructions *before* the message. That code is usually the check or the feature you wanted to understand, found in minutes instead of hours.

**A decompiler is a guess, not the truth.** Compilation throws away names, comments, types and structure, so the decompiler reconstructs what is probably there. It can be wrong in small ways (a \`long\` that was really a pointer, a loop shown as a \`goto\`) and it can fail completely on unusual code. Use it for the big picture, **rename variables and retype them as you learn**, and when something looks impossible, go back and read the assembly. Disassembly is what the CPU will do; decompiled code is a reading aid.

In a **stripped** binary the function names are gone and you will meet names like \`FUN_00101189\`. Give them meaningful names as you understand them (\`check_password\`, \`parse_header\`). Your renamed project is the real product of the analysis.`,
        ar: `## قراءة التفكيك وناتج الـdecompiler

عندما يقول الفرز "هذا يستحق نظرة أقرب" تفتح الملف في **disassembler** (‏\`objdump -d\` أو **Ghidra** أو **radare2** / Cutter أو IDA أو Binary Ninja). برنامج Ghidra مجاني ومفتوح المصدر، وهذا يجعله مكاناً ممتازاً للتعلّم. والمفكِّك الجيد يعطيك أكثر بكثير من نص مفرّغ:

- **المراجع المتقاطعة (xrefs):** "من يستخدم هذا النص؟" و"من يستدعي هذه الدالة؟" هما أكثر سؤالين ستطرحهما
- **قائمة بالدوال** و**call graph** و**control-flow graph** يرسم قفزات الدرس السابق على شكل صناديق وأسهم
- **decompiler** يحوّل الـassembly إلى كود شبيه بـ C

وطريقة العمل الكلاسيكية أن **تبدأ من دليل وتتوسع للخارج**: اعثر على نص مثير (رسالة خطأ، مسار)، واتبع الـxref إلى الكود الذي يطبعه، واقرأ التعليمات القليلة *التي قبل* الرسالة. هذا الكود غالباً هو الفحص أو الميزة التي أردت فهمها، وجدتها في دقائق بدل ساعات.

**الـdecompiler تخمين وليس الحقيقة.** التصريف يرمي الأسماء والتعليقات والأنواع والبنية، فيعيد الـdecompiler بناء ما يُرجَّح أنه كان موجوداً. وقد يخطئ أخطاءً صغيرة (‏\`long\` كان في الحقيقة مؤشراً، حلقة تظهر كـ\`goto\`) وقد يفشل كلياً مع الكود غير المعتاد. استخدمه لرؤية الصورة الكبيرة، و**غيّر أسماء المتغيرات وأنواعها كلما تعلّمت**، وعندما يبدو شيء مستحيلاً فارجع واقرأ الـassembly. التفكيك هو ما سينفّذه المعالج؛ أما الكود المُفكَّك فمساعد على القراءة.

في الملف **المجرَّد (stripped)** تختفي أسماء الدوال وستقابل أسماء مثل \`FUN_00101189\`. أعطها أسماء ذات معنى كلما فهمتها (‏\`check_password\`، \`parse_header\`). مشروعك بعد إعادة التسمية هو الناتج الحقيقي للتحليل.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Encoding, obfuscation, encryption: three different things

People mix these up, and the confusion causes real mistakes.

- **Encoding** changes the *representation* of data so it fits somewhere, with a public, keyless recipe. Base64 and hex are encodings. They hide nothing from anyone who recognizes them.
- **Obfuscation** makes data or code *harder to read* but still recoverable by anyone with enough patience. ROT13 and a single-byte XOR are obfuscation. Malware authors and software vendors use it to slow analysis down.
- **Encryption** makes data unreadable without a **secret key**, with security that rests on the key and not on keeping the method secret. Done properly (for example AES with a random key), you cannot recover the data by analysis alone.

Seeing \`Base64\` in an analysis is therefore good news: it is a speed bump, not a lock.

**The layers you will meet most often**

- **Hex**: each byte becomes two characters \`0-9a-f\`. The text is twice as long as the data.
- **Base64**: every 3 bytes become 4 characters from \`A-Z a-z 0-9 + /\`. If the length is not a multiple of 3, the end is padded with \`=\`. So Base64 text has a length divisible by 4 and may end with one or two \`=\`. For example \`Man\` becomes \`TWFu\`.
- **ROT13**: every letter moves 13 places in the alphabet, wrapping around. Because the alphabet has 26 letters, applying ROT13 twice gives back the original, so one function both encodes and decodes. Digits and punctuation are untouched.
- **XOR with a key byte**: \`byte ^ key\`. XOR has a beautiful property: \`(x ^ k) ^ k = x\`. Applying the same key again undoes it, so again one function does both jobs. A one-byte key has only **256** possibilities, so it can simply be brute-forced.
- **Repeating-key XOR** cycles through a short key. It is harder, but the same tricks scale up.

**How to decide which layer you are looking at**

- Only \`0-9a-f\` and an even length: probably hex
- Letters, digits, \`+\` and \`/\`, length divisible by 4, maybe \`=\` at the end: probably Base64
- Readable-looking letters but nonsense words (\`Uryyb, jbeyq\`): probably ROT13 or a Caesar shift
- Random-looking bytes with no pattern: XOR, compression or encryption. Compare against a **crib**, a word you expect inside (\`http\`, \`password\`, \`This program\`)

**Two XOR tricks.** In English text the **space** character (\`0x20\`) is the most common byte, so the most common byte in the ciphertext is probably \`0x20 ^ key\`. And in binary data **zero bytes** are everywhere: a long run of one repeated byte is often the key itself.

**Peel one layer at a time.** Decode, look at the result, decide what it is, repeat. Undo layers in the **reverse order** the author applied them, like unwrapping nested boxes from the outside in.`,
        ar: `## الترميز والتعتيم والتشفير: ثلاثة أشياء مختلفة

يخلط الناس بينها، وهذا الخلط يسبب أخطاء حقيقية.

- **الترميز (Encoding)** يغيّر *تمثيل* البيانات لتناسب مكاناً ما، بوصفة علنية بلا مفتاح. ‏Base64 وhex ترميزان. لا يخفيان شيئاً عمّن يتعرّف عليهما.
- **التعتيم (Obfuscation)** يجعل البيانات أو الكود *أصعب قراءةً* لكنها تبقى قابلة للاسترجاع لمن يملك صبراً كافياً. ‏ROT13 وXOR بمفتاح بايت واحد تعتيم. يستخدمه مؤلفو البرمجيات الخبيثة وشركات البرمجيات لإبطاء التحليل.
- **التشفير (Encryption)** يجعل البيانات غير مقروءة دون **مفتاح سري**، وأمنه قائم على المفتاح وليس على إخفاء الطريقة. إذا نُفِّذ جيداً (مثل AES بمفتاح عشوائي) فلا يمكنك استرجاع البيانات بالتحليل وحده.

لذلك فرؤية \`Base64\` في تحليل خبر جيد: إنها مطبّ سرعة وليست قفلاً.

**الطبقات التي ستقابلها أكثر**

- **Hex**: كل بايت يصبح حرفين من \`0-9a-f\`. النص ضعف طول البيانات.
- **Base64**: كل 3 بايتات تصبح 4 أحرف من \`A-Z a-z 0-9 + /\`. وإن لم يكن الطول من مضاعفات 3 يُحشى الطرف بـ\`=\`. فنص Base64 طوله يقبل القسمة على 4 وقد ينتهي بعلامة \`=\` أو علامتين. مثلاً \`Man\` تصبح \`TWFu\`.
- **ROT13**: كل حرف يتحرك 13 موضعاً في الأبجدية مع الالتفاف. ولأن الأبجدية 26 حرفاً فتطبيق ROT13 مرتين يعيد الأصل، فدالة واحدة ترمّز وتفك. الأرقام وعلامات الترقيم لا تتأثر.
- **XOR بمفتاح بايت**: ‏\`byte ^ key\`. لـXOR خاصية جميلة: ‏\`(x ^ k) ^ k = x\`. تطبيق المفتاح نفسه مرة أخرى يلغيه، فدالة واحدة تقوم بالمهمتين. والمفتاح ذو البايت الواحد له **256** احتمالاً فقط، فيمكن تجربته كله بالقوة الغاشمة (brute force).
- **XOR بمفتاح متكرر** يدور على مفتاح قصير. هو أصعب، لكن الحيل نفسها تتسع له.

**كيف تقرر أي طبقة أمامك**

- أحرف \`0-9a-f\` فقط وطول زوجي: غالباً hex
- حروف وأرقام و\`+\` و\`/\` وطول يقبل القسمة على 4 وربما \`=\` في النهاية: غالباً Base64
- حروف تبدو مقروءة لكن الكلمات بلا معنى (‏\`Uryyb, jbeyq\`): غالباً ROT13 أو إزاحة Caesar
- بايتات عشوائية المظهر بلا نمط: XOR أو ضغط أو تشفير. قارنها بـ**crib**، كلمة تتوقع وجودها (‏\`http\` أو \`password\` أو \`This program\`)

**حيلتان في XOR.** في النص الإنجليزي **المسافة** (‏\`0x20\`) أكثر البايتات تكراراً، فالبايت الأكثر تكراراً في النص المشفّر غالباً هو \`0x20 ^ key\`. وفي البيانات الثنائية **البايتات الصفرية** في كل مكان: فسلسلة طويلة من بايت واحد متكرر هي في الغالب المفتاح نفسه.

**فكّ طبقة واحدة في كل مرة.** فكّ، وانظر إلى الناتج، وقرر ما هو، وكرّر. وألغِ الطبقات بـ**الترتيب المعكوس** لما طبّقه المؤلف، كمن يفتح صناديق متداخلة من الخارج إلى الداخل.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// Peeling an onion: every layer is a tiny reversible function.
const rot13 = (s) =>
  s.replace(/[a-z]/gi, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
const xor = (s, key) => Array.from(s, (c) => String.fromCharCode(c.charCodeAt(0) ^ key)).join("");

const secret = "meet at dawn";
// The author's recipe: ROT13, then XOR with 0x2a, then Base64.
const encoded = btoa(xor(rot13(secret), 0x2a));
console.log("encoded   :", encoded);

// The analyst undoes the layers in the REVERSE order.
const afterBase64 = atob(encoded);
console.log("after b64 :", JSON.stringify(afterBase64)); // odd characters appear: that is the XOR layer
const afterXor = xor(afterBase64, 0x2a); // XOR is its own inverse
console.log("after xor :", afterXor);
console.log("plaintext :", rot13(afterXor)); // ROT13 is its own inverse too`,
      explanation: {
        en: "Notice the `\\n` inside the middle value: spaces became newline characters because `0x20 ^ 0x2a = 0x0a`. Try decoding with the layers in the wrong order and see the nonsense you get. Then change the key and write down which output changes and which does not.",
        ar: "لاحظ `\\n` داخل القيمة الوسطى: تحولت المسافات إلى محارف سطر جديد لأن `0x20 ^ 0x2a = 0x0a`. جرّب فك الطبقات بالترتيب الخاطئ وانظر إلى الهراء الذي ينتج. ثم غيّر المفتاح ودوّن أي ناتج يتغير وأي ناتج لا يتغير.",
      },
    },
    {
      type: "lab",
      id: "peel-layers",
      lang: "python",
      prompt: {
        en: `## Peel the layers

You were handed a message that an author wrapped in several layers. The **first line** of the input lists the layers in the order the **author applied them**, separated by commas. The **second line** is the final wrapped text. Undo the layers (last one first) and print the original message.

The data is a sequence of **bytes** at every step. The layers are:

- \`b64\`: the data was replaced by its Base64 text
- \`hex\`: the data was replaced by its lowercase hex text
- \`rot13\`: every ASCII letter was rotated by 13 places (other bytes unchanged)
- \`rev\`: the bytes were reversed
- \`xor:K\`: every byte was XORed with \`K\`, which is a decimal number (\`42\`) or hex (\`0x5a\`) from 0 to 255

The original message is ASCII text. Print it (an empty message prints an empty line).

**Example**

Input:

\`\`\`
xor:42,b64
QkM=
\`\`\`

The author XORed the message with 42 and then Base64-encoded it. Undo Base64 first (the bytes \`42 43\`), then undo the XOR with 42.

Output:

\`\`\`
hi
\`\`\``,
        ar: `## فكّ الطبقات

وصلتك رسالة غلّفها مؤلفها بعدة طبقات. **السطر الأول** من المدخل يسرد الطبقات بالترتيب الذي **طبّقه المؤلف**، مفصولة بفواصل. و**السطر الثاني** هو النص النهائي المغلَّف. ألغِ الطبقات (الأخيرة أولاً) واطبع الرسالة الأصلية.

البيانات في كل خطوة **سلسلة بايتات**. والطبقات هي:

- ‏\`b64\`: استُبدلت البيانات بنص Base64 الخاص بها
- ‏\`hex\`: استُبدلت البيانات بنص hex الخاص بها بأحرف صغيرة
- ‏\`rot13\`: دُوِّر كل حرف ASCII بمقدار 13 موضعاً (والبايتات الأخرى لا تتغير)
- ‏\`rev\`: عُكس ترتيب البايتات
- ‏\`xor:K\`: طُبّق XOR على كل بايت مع \`K\` وهو عدد عشري (‏\`42\`) أو hex (‏\`0x5a\`) من 0 إلى 255

الرسالة الأصلية نص ASCII. اطبعها (والرسالة الفارغة تطبع سطراً فارغاً).

**مثال**

المدخل:

\`\`\`
xor:42,b64
QkM=
\`\`\`

طبّق المؤلف XOR مع 42 على الرسالة ثم رمّزها بـ Base64. ألغِ Base64 أولاً (البايتان \`42 43\`)، ثم ألغِ XOR مع 42.

المخرج:

\`\`\`
hi
\`\`\``,
      },
      starterCode: `import base64
import sys

lines = sys.stdin.read().split("\\n")
layers = lines[0].strip().split(",")
data = lines[1].strip().encode() if len(lines) > 1 else b""


def rot13(raw):
    """ROT13 on bytes: rotate ASCII letters, keep everything else."""
    out = bytearray()
    for b in raw:
        if 65 <= b <= 90:
            out.append((b - 65 + 13) % 26 + 65)
        elif 97 <= b <= 122:
            out.append((b - 97 + 13) % 26 + 97)
        else:
            out.append(b)
    return bytes(out)


# TODO 1: go through the layers in REVERSE order (the last layer the author applied comes off first).
# TODO 2: undo each one: b64 -> base64.b64decode, hex -> bytes.fromhex, rot13 -> rot13,
#         rev -> reverse the bytes, xor:K -> XOR every byte with int(K, 0).
# TODO 3: print the final bytes as text.

print(data.decode("ascii"))
`,
      solution: `import base64
import sys

lines = sys.stdin.read().split("\\n")
layers = lines[0].strip().split(",")
data = lines[1].strip().encode() if len(lines) > 1 else b""


def rot13(raw):
    """ROT13 on bytes: rotate ASCII letters, keep everything else."""
    out = bytearray()
    for b in raw:
        if 65 <= b <= 90:
            out.append((b - 65 + 13) % 26 + 65)
        elif 97 <= b <= 122:
            out.append((b - 97 + 13) % 26 + 97)
        else:
            out.append(b)
    return bytes(out)


for layer in reversed(layers):  # undo the last layer first
    if layer == "b64":
        data = base64.b64decode(data)
    elif layer == "hex":
        data = bytes.fromhex(data.decode("ascii"))
    elif layer == "rot13":
        data = rot13(data)  # ROT13 is its own inverse
    elif layer == "rev":
        data = data[::-1]
    elif layer.startswith("xor:"):
        key = int(layer[4:], 0)
        data = bytes(b ^ key for b in data)  # XOR with the same key undoes itself

print(data.decode("ascii"))
`,
      hints: [
        { en: "The author applied the layers left to right, so you must undo them right to left: \`for layer in reversed(layers):\`.", ar: "طبّق المؤلف الطبقات من اليسار إلى اليمين، فعليك إلغاؤها من اليمين إلى اليسار: \`for layer in reversed(layers):\`." },
        { en: "Useful one-liners: \`base64.b64decode(data)\`, \`bytes.fromhex(data.decode())\`, \`data[::-1]\`, and \`bytes(b ^ key for b in data)\` where \`key = int(layer[4:], 0)\` accepts both \`42\` and \`0x5a\`.", ar: "سطور مفيدة: ‏\`base64.b64decode(data)\` و\`bytes.fromhex(data.decode())\` و\`data[::-1]\` و\`bytes(b ^ key for b in data)\` حيث \`key = int(layer[4:], 0)\` تقبل \`42\` و\`0x5a\` معاً." },
        { en: "ROT13 undoes itself, so the provided \`rot13()\` helper is also the decoder. Check your layer order on the 'order matters' test: Base64 first, then reverse, means you must un-reverse before you Base64-decode.", ar: "‏ROT13 تلغي نفسها، فالدالة المساعدة \`rot13()\` هي أيضاً المُفكِّك. افحص ترتيب الطبقات على اختبار 'الترتيب مهم': ‏Base64 أولاً ثم العكس يعني أن عليك إلغاء العكس قبل فك Base64." },
      ],
      tests: [
        { name: { en: "The worked example: xor then Base64", ar: "المثال المحلول: ‏xor ثم Base64" }, stdin: `xor:42,b64
QkM=
`, expected: `hi
` },
        { name: { en: "Three layers: rot13, xor with a hex key, Base64", ar: "ثلاث طبقات: ‏rot13 ثم xor بمفتاح hex ثم Base64" }, stdin: `rot13,xor:0x5a,b64
ICgoPXo0PXo9Lyh6OCMrejU/LCsuKA==
`, expected: `meet at the old bridge
` },
        { name: { en: "Reverse then hex", ar: "عكس ثم hex" }, stdin: `rev,hex
6465737365727473
`, expected: `stressed
` },
        { name: { en: "ROT13 applied on top of hex text (letters a-f change too)", ar: "‏ROT13 فوق نص hex (حروف a-f تتغير أيضاً)" }, stdin: `b64,hex,rot13
533256354s6941304q6n51794p55394p49513q3q
`, expected: `Key: 4242-OK!
` },
        { name: { en: "Order matters: Base64, then reverse", ar: "الترتيب مهم: ‏Base64 ثم عكس" }, stdin: `b64,rev
==wcyVGd0FWbgIXZkJ3b
`, expected: `order matters
` },
        { name: { en: "An empty message", ar: "رسالة فارغة" }, stdin: `b64

`, expected: "" },
      ],
    },
    {
      type: "lab",
      id: "xor-crib",
      lang: "javascript",
      prompt: {
        en: `## Break a one-byte XOR with a crib

A configuration string was obfuscated with a **single-byte XOR key**. You do not know the key, but you know a word that must appear in the plaintext: the **crib**. Try all 256 keys and keep the first that reveals the crib.

Input:

- Line 1: the crib (lowercase ASCII, case-sensitive match)
- The remaining lines: the ciphertext as hex bytes. Any case, with or without spaces, possibly across several lines.

For every key from \`0\` to \`255\` decrypt every byte (\`byte ^ key\`) and check whether the plaintext **contains the crib**. Use the **smallest** key that does and print:

\`\`\`
key = 0x<two hex digits, lowercase>
text = <the plaintext>
\`\`\`

If no key works (or the ciphertext is empty) print \`no key found\`.

**Example**

Input:

\`\`\`
net
44 4f 5e
\`\`\`

Output:

\`\`\`
key = 0x2a
text = net
\`\`\`

(\`0x44 ^ 0x2a\` is \`n\`, \`0x4f ^ 0x2a\` is \`e\`, \`0x5e ^ 0x2a\` is \`t\`.)`,
        ar: `## اكسر XOR بمفتاح بايت واحد باستخدام crib

عُتِّمت سلسلة إعدادات بـ**XOR بمفتاح بايت واحد**. لا تعرف المفتاح، لكنك تعرف كلمة لا بد أن تظهر في النص الأصلي: هي الـ**crib**. جرّب المفاتيح الـ256 كلها واحتفظ بأول مفتاح يكشف الـcrib.

المدخل:

- السطر 1: الـcrib (ASCII بأحرف صغيرة، والمطابقة حساسة لحالة الأحرف)
- بقية الأسطر: النص المشفّر كبايتات hex. بأي حالة أحرف، بمسافات أو بدونها، وربما على عدة أسطر.

لكل مفتاح من \`0\` إلى \`255\` فكّ كل بايت (‏\`byte ^ key\`) وافحص هل النص الناتج **يحتوي الـcrib**. استخدم **أصغر** مفتاح يحقق ذلك واطبع:

\`\`\`
key = 0x<two hex digits, lowercase>
text = <the plaintext>
\`\`\`

وإن لم ينجح أي مفتاح (أو كان النص المشفّر فارغاً) فاطبع \`no key found\`.

**مثال**

المدخل:

\`\`\`
net
44 4f 5e
\`\`\`

المخرج:

\`\`\`
key = 0x2a
text = net
\`\`\`

(‏\`0x44 ^ 0x2a\` هو \`n\`، و\`0x4f ^ 0x2a\` هو \`e\`، و\`0x5e ^ 0x2a\` هو \`t\`.)`,
      },
      starterCode: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const crib = (lines[0] || "").trim();

// The ciphertext: join the remaining lines, drop every whitespace character, read the hex in pairs.
const hex = lines.slice(1).join("").replace(/\\s+/g, "");
const bytes = [];
for (let i = 0; i + 1 < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));

// TODO 1: loop over every key from 0 to 255.
// TODO 2: build the plaintext for that key: String.fromCharCode(byte ^ key) for every byte.
// TODO 3: if it contains the crib, print "key = 0x.." (two lowercase hex digits) and "text = ..." and stop.

console.log("no key found");
`,
      solution: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const crib = (lines[0] || "").trim();

const hex = lines.slice(1).join("").replace(/\\s+/g, "");
const bytes = [];
for (let i = 0; i + 1 < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));

let found = false;
for (let key = 0; key < 256 && !found && bytes.length > 0; key++) {
  const text = bytes.map((b) => String.fromCharCode(b ^ key)).join("");
  if (text.includes(crib)) {
    console.log("key = 0x" + key.toString(16).padStart(2, "0"));
    console.log("text = " + text);
    found = true; // the smallest matching key wins
  }
}
if (!found) console.log("no key found");
`,
      hints: [
        { en: "Write a \`for (let key = 0; key < 256; key++)\` loop and build the candidate with \`bytes.map((b) => String.fromCharCode(b ^ key)).join(\"\")\`.", ar: "اكتب حلقة \`for (let key = 0; key < 256; key++)\` وابنِ النص المرشّح بـ \`bytes.map((b) => String.fromCharCode(b ^ key)).join(\"\")\`." },
        { en: "\`text.includes(crib)\` tells you whether the key is right. Print and stop at the first hit, because you want the smallest key.", ar: "‏\`text.includes(crib)\` تخبرك هل المفتاح صحيح. اطبع وتوقف عند أول إصابة، لأنك تريد أصغر مفتاح." },
        { en: "Format the key with \`key.toString(16).padStart(2, \"0\")\`. With an empty ciphertext every key 'contains' nothing useful, so make sure you print \`no key found\` instead.", ar: "نسّق المفتاح بـ \`key.toString(16).padStart(2, \"0\")\`. ومع نص مشفّر فارغ لا يفيد أي مفتاح، فتأكد أن تطبع \`no key found\` بدلاً من ذلك." },
      ],
      tests: [
        { name: { en: "The worked example", ar: "المثال المحلول" }, stdin: `net
44 4f 5e
`, expected: `key = 0x2a
text = net
` },
        { name: { en: "A configuration line, continuous lowercase hex", ar: "سطر إعدادات، hex متصل بأحرف صغيرة" }, stdin: `password
545859515e500d1747564444405845530a545f565950525a52
`, expected: `key = 0x37
text = config: password=changeme
` },
        { name: { en: "Key 0x00: the text was never changed", ar: "المفتاح 0x00: النص لم يتغير أصلاً" }, stdin: `plain
706c61696e20746578742c206e6f20656e636f64696e6720617420616c6c
`, expected: `key = 0x00
text = plain text, no encoding at all
` },
        { name: { en: "Key 0xff, the top of the range", ar: "المفتاح 0xff، أعلى المدى" }, stdin: `build
899a8d8c969091dfcdd1cedfd2df9d8a96939bdf9094
`, expected: `key = 0xff
text = version 2.1 - build ok
` },
        { name: { en: "Upper-case hex split over two lines", ar: "‏hex بأحرف كبيرة موزّع على سطرين" }, stdin: `example
34 28 28 2C 66 73 73 29 2C 38 3D 28 39 2F 72
39 24 3D 31 2C 30 39 72 33 2E 3B 73 3F 34 39 3F 37
`, expected: `key = 0x5c
text = http://updates.example.org/check
` },
        { name: { en: "No key reveals the crib", ar: "لا مفتاح يكشف الـcrib" }, stdin: `zebra
2f2e3529282f266129243324
`, expected: `no key found
` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Putting it together

A realistic static-analysis session on a small, permitted practice binary goes like this:

1. \`file\` and \`sha256sum\`: record what it is
2. \`strings -n 6\`: you notice a long string made only of letters, digits and \`=\`, and a message \`Access denied\`
3. You decode the long string: Base64 gives bytes that look random, so you suspect XOR. You guess the crib \`http\` and brute-force the key, and a URL-like text appears. Nothing was executed.
4. In the disassembler you follow the xref of \`Access denied\` back to the function that prints it and read the comparison just above it
5. You rename functions and variables as you learn, and write down what you found

**Limits of static analysis.** When the real content is encrypted with a key the program only creates while it runs, or when the code is unpacked into memory at runtime, a static view shows only the wrapper. That is when you move on to **dynamic analysis**, running the program under control in a disposable lab, and to the next roadmap topics on binary formats and anti-analysis tricks.

**Be a good citizen with what you decode.** If the decoded content holds credentials, personal data or a vulnerability in someone's product, do not use or spread it. Report it responsibly, as the first lesson explained.`,
        ar: `## نجمع كل شيء

جلسة تحليل ساكن واقعية على ملف تدريب صغير مصرَّح به تسير هكذا:

1. ‏\`file\` و\`sha256sum\`: سجّل ما هو
2. ‏\`strings -n 6\`: تلاحظ سلسلة طويلة مكوّنة من حروف وأرقام و\`=\` فقط، ورسالة \`Access denied\`
3. تفكّ السلسلة الطويلة: ‏Base64 يعطيك بايتات تبدو عشوائية فتشتبه في XOR. تخمّن الـcrib ‏\`http\` وتجرّب المفاتيح كلها فيظهر نص يشبه عنوان URL. لم يُنفَّذ شيء.
4. في المفكِّك تتبع xref الخاص بـ\`Access denied\` إلى الدالة التي تطبعه وتقرأ المقارنة التي فوقه مباشرة
5. تعيد تسمية الدوال والمتغيرات كلما تعلّمت، وتدوّن ما وجدته

**حدود التحليل الساكن.** عندما يكون المحتوى الحقيقي مشفّراً بمفتاح لا ينشئه البرنامج إلا أثناء التشغيل، أو عندما يُفكّ الكود إلى الذاكرة وقت التشغيل، فالنظرة الساكنة ترى الغلاف فقط. عندها تنتقل إلى **التحليل الديناميكي**، أي تشغيل البرنامج تحت السيطرة في مختبر يمكن التخلص منه، وإلى موضوعات المسار التالية عن صيغ الملفات الثنائية وحيل مقاومة التحليل.

**كن مواطناً صالحاً مع ما تفكّه.** إن احتوى المحتوى المفكوك على بيانات اعتماد أو بيانات شخصية أو ثغرة في منتج أحد، فلا تستخدمه ولا تنشره. بلّغ عنه بمسؤولية كما شرح الدرس الأول.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Which of these is static analysis?", ar: "أيٌّ من هذه تحليل ساكن؟" },
          choices: [
            { en: "Stepping through the program in a debugger", ar: "التنقل في البرنامج خطوة خطوة داخل منقّح" },
            { en: "Watching the system calls the program makes while it runs", ar: "مراقبة استدعاءات النظام التي يجريها البرنامج أثناء تشغيله" },
            { en: "Reading its strings, imports and disassembly without executing it", ar: "قراءة strings وimports والتفكيك دون تنفيذه" },
            { en: "Running it in a virtual machine and taking a snapshot", ar: "تشغيله في جهاز افتراضي وأخذ snapshot" },
          ],
          answer: 2,
          explain: {
            en: "Static analysis never executes the sample: it inspects the file itself. A debugger, system-call tracing and watching a VM all run the program, so they are dynamic analysis, which needs a disposable, isolated lab.",
            ar: "التحليل الساكن لا ينفّذ العينة أبداً: هو يفحص الملف نفسه. المنقّح وتتبّع استدعاءات النظام ومراقبة جهاز افتراضي كلها تشغّل البرنامج، فهي تحليل ديناميكي يحتاج إلى مختبر معزول يمكن التخلص منه.",
          },
        },
        {
          q: { en: "You find the string `TWFuIGlzIGRpc3Rpbmd1aXNoZWQ=` in a sample. What is the best first guess?", ar: "وجدت النص `TWFuIGlzIGRpc3Rpbmd1aXNoZWQ=` في عينة. ما أفضل تخمين أولي؟" },
          choices: [
            { en: "AES-encrypted data, which needs the key", ar: "بيانات مشفّرة بـ AES وتحتاج إلى المفتاح" },
            { en: "Base64: the alphabet, the length divisible by 4 and the trailing = fit, and it decodes without any key", ar: "‏Base64: الأبجدية والطول القابل للقسمة على 4 وعلامة = في النهاية تناسبه، ويُفك دون أي مفتاح" },
            { en: "A SHA-256 hash that can be reversed with enough time", ar: "‏hash من نوع SHA-256 يمكن عكسه إن توفر الوقت" },
            { en: "ROT13 text, because it contains letters", ar: "نص ROT13 لأنه يحتوي حروفاً" },
          ],
          answer: 1,
          explain: {
            en: "Mixed-case letters, digits and a padding = with a length divisible by 4 are the fingerprint of Base64 (this one decodes to the words 'Man is distinguished'). It is an encoding, not encryption. A SHA-256 hash is one-way and is usually shown as 64 hex characters, and ROT13 leaves digits alone and has no = padding.",
            ar: "حروف بحالتين وأرقام وعلامة حشو = مع طول يقبل القسمة على 4 هي بصمة Base64 (وهذه تُفك إلى العبارة 'Man is distinguished'). إنه ترميز وليس تشفيراً. أما hash من نوع SHA-256 فاتجاهه واحد ويُعرض عادةً كـ64 حرف hex، و ROT13 لا تمسّ الأرقام وليس فيها حشو =.",
          },
        },
        {
          q: { en: "Why is a one-byte XOR key considered weak obfuscation?", ar: "لماذا يُعدّ مفتاح XOR من بايت واحد تعتيماً ضعيفاً؟" },
          choices: [
            { en: "There are only 256 possible keys, so an analyst can try them all and look for readable text or a known word", ar: "يوجد 256 مفتاحاً محتملاً فقط، فيستطيع المحلل تجربتها كلها والبحث عن نص مقروء أو كلمة معروفة" },
            { en: "XOR cannot be undone once it has been applied", ar: "لا يمكن عكس XOR بعد تطبيقه" },
            { en: "The key is always stored in the file header", ar: "المفتاح مخزَّن دائماً في ترويسة الملف" },
            { en: "XOR only works on letters, not on other bytes", ar: "‏XOR يعمل على الحروف فقط وليس على بقية البايتات" },
          ],
          answer: 0,
          explain: {
            en: "A key space of 256 is trivial to brute-force, and a crib or the 'space is the most common byte' trick narrows it further. XOR is perfectly reversible (x ^ k ^ k = x), it works on any byte, and the key is not placed in a header; it is weak simply because the key space is tiny.",
            ar: "فضاء مفاتيح من 256 تافه أمام القوة الغاشمة، والـcrib أو حيلة 'المسافة أكثر البايتات تكراراً' تضيّقه أكثر. ‏XOR قابل للعكس تماماً (‏x ^ k ^ k = x) ويعمل على أي بايت، والمفتاح لا يوضع في ترويسة؛ هو ضعيف لأن فضاء المفاتيح صغير جداً.",
          },
        },
        {
          q: { en: "One section of an executable has an entropy of about 7.9 bits per byte, while the rest is around 5. What does that most likely mean?", ar: "قسم واحد في ملف تنفيذي له entropy قرابة 7.9 بت لكل بايت بينما الباقي قرابة 5. ماذا يعني هذا غالباً؟" },
          choices: [
            { en: "That section holds plain English text", ar: "هذا القسم يحوي نصاً إنجليزياً عادياً" },
            { en: "That section is just zero padding", ar: "هذا القسم مجرد حشو صفري" },
            { en: "The file is corrupted and should be deleted", ar: "الملف تالف ويجب حذفه" },
            { en: "That section is probably compressed or encrypted, for example packed code", ar: "هذا القسم مضغوط أو مشفّر على الأرجح، مثل كود مُعبَّأ (packed)" },
          ],
          answer: 3,
          explain: {
            en: "Values close to 8 mean the bytes look random, which is what compression and encryption produce. Plain text sits around 4 to 5 and zero padding near 0. High entropy is a clue, not a proof (some legitimate data such as images is compressed too), so you confirm it with other evidence.",
            ar: "القيم القريبة من 8 تعني أن البايتات تبدو عشوائية، وهذا ما ينتجه الضغط والتشفير. النص العادي يقع قرابة 4 إلى 5 والحشو الصفري قرب 0. الـentropy العالية دليل وليست إثباتاً (بعض البيانات المشروعة مثل الصور مضغوطة أيضاً)، فتؤكد ذلك بأدلة أخرى.",
          },
        },
        {
          q: { en: "A decompiler shows a variable as `long`, but the assembly clearly uses it as an address. What should you do?", ar: "يعرض الـdecompiler متغيراً كنوع `long` لكن الـassembly يستخدمه بوضوح كعنوان. ماذا تفعل؟" },
          choices: [
            { en: "Trust the decompiler: its output is the original source code", ar: "تثق بالـdecompiler: ناتجه هو الكود المصدري الأصلي" },
            { en: "Retype the variable as a pointer and keep checking the assembly, because decompiled code is a reconstruction", ar: "تغيّر نوع المتغير إلى مؤشر وتواصل مراجعة الـassembly، لأن الكود المُفكَّك إعادة بناء" },
            { en: "Delete the function from the project", ar: "تحذف الدالة من المشروع" },
            { en: "Stop the analysis, since decompilers are never useful", ar: "توقف عن التحليل لأن الـdecompilers لا تفيد أبداً" },
          ],
          answer: 1,
          explain: {
            en: "Types and names are lost at compile time, so the decompiler guesses them, and good analysts correct the guesses as they learn (retyping, renaming) and verify against the disassembly. Decompilers are very useful for the big picture, but they are not the original source.",
            ar: "الأنواع والأسماء تضيع وقت التصريف، فيخمّنها الـdecompiler، والمحللون الجيدون يصححون التخمينات كلما تعلموا (إعادة تحديد النوع وإعادة التسمية) ويتحققون مقابل التفكيك. الـdecompilers مفيدة جداً للصورة الكبيرة لكنها ليست الكود الأصلي.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary and what to practice next

- **Static analysis** examines a file without running it: **\`file\`, hash, \`strings\`, imports, entropy**, then disassembly
- Start from a **clue** (a string) and follow **xrefs**; treat decompiler output as a **reconstruction** to be corrected, not as the truth
- **Encoding** (Base64, hex) hides nothing, **obfuscation** (ROT13, one-byte XOR) only slows you down, **encryption** needs a key
- Peel layers **one at a time, in reverse order**; recognize them by alphabet, length, padding and by using a **crib**
- Static analysis has limits: when content only exists at run time, you need dynamic analysis

**Practice next:** build your own small obfuscation chain for a sentence (ROT13, then XOR, then Base64) and write the decoder; extend your \`strings\` tool to report UTF-16LE text; and run the triage checklist on a small program you compiled yourself, then check your findings against the source code. Next up: running programs under a debugger, safely.`,
        ar: `## الخلاصة وماذا تتدرّب عليه بعد ذلك

- **التحليل الساكن** يفحص الملف دون تشغيله: **\`file\` وhash و\`strings\` وimports وentropy**، ثم التفكيك
- ابدأ من **دليل** (نص) واتبع **xrefs**؛ وعامل ناتج الـdecompiler على أنه **إعادة بناء** يجب تصحيحها وليس الحقيقة
- **الترميز** (‏Base64 وhex) لا يخفي شيئاً، و**التعتيم** (‏ROT13 وXOR بمفتاح بايت) يبطئك فقط، و**التشفير** يحتاج مفتاحاً
- فكّ الطبقات **واحدة واحدة وبترتيب معكوس**؛ وتعرّف عليها من الأبجدية والطول والحشو وباستخدام **crib**
- للتحليل الساكن حدود: عندما لا يوجد المحتوى إلا وقت التشغيل تحتاج إلى التحليل الديناميكي

**تدرّب بعد ذلك:** ابنِ سلسلة تعتيم صغيرة من عندك لجملة (‏ROT13 ثم XOR ثم Base64) واكتب لها مفكِّكاً؛ وطوّر أداة \`strings\` لديك لتُبلغ عن نصوص UTF-16LE؛ ونفّذ قائمة الفرز على برنامج صغير صرّفته بنفسك، ثم قارن ما وجدته بالكود المصدري. والتالي: تشغيل البرامج تحت منقّح، بأمان.`,
      },
    },
  ],
};
