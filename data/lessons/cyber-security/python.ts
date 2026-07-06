import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "python",
  title: { en: "Python — The Security Automation Language", ar: "بايثون — لغة أتمتة الأمن" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why Python is the #1 language for security work
- Variables, lists, loops, and functions — the core toolkit
- **Regular expressions (regex)** — finding patterns like IPs and emails in a sea of text
- Write real security-flavored scripts, checked live
- Everything runs in your browser via Python (Pyodide)`,
        ar: `## ماذا ستتعلم

- لماذا بايثون اللغة رقم 1 في عمل الأمن
- المتغيرات والقوائم والحلقات والدوال — العدّة الأساسية
- **التعابير النمطية (Regex)** — إيجاد أنماط مثل عناوين IP والبريد في بحر من النص
- تكتب سكربتات أمنية حقيقية، تُصحَّح مباشرة
- كل شيء يعمل في متصفحك عبر بايثون (Pyodide)`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The Swiss Army knife 🔪

Security people automate everything: scan 10,000 IPs, parse a million log lines, test 500 passwords. No one does that by hand. **Python** is the tool of choice because it reads almost like English and has a library for everything.

The essentials, fast:

\`\`\`python
# variables
target = "10.0.0.5"
port = 443

# lists — an ordered box of things
ports = [22, 80, 443, 3306]

# loops — do something for each item
for p in ports:
    print("Checking port", p)

# conditions
if port == 443:
    print("This is HTTPS")

# functions — reusable recipes
def is_common_port(p):
    return p in [22, 80, 443]
\`\`\`

Notice Python uses **indentation** (spaces) to group code — the lines inside a loop or function are shifted right. No curly braces.

For security specifically, you'll constantly loop over lists (IPs, ports, users), check conditions (is this suspicious?), and wrap it in functions you reuse. Master those four and you can automate 80% of grunt work.`,
        ar: `## سكين الجيش السويسري 🔪

أهل الأمن يؤتمتون كل شيء: فحص 10,000 عنوان IP، تحليل مليون سطر سجلّ، تجربة 500 كلمة مرور. لا أحد يفعل ذلك يدوياً. **بايثون** الأداة المفضّلة لأنها تُقرأ كالإنجليزية تقريباً ولها مكتبة لكل شيء.

الأساسيات بسرعة:

\`\`\`python
# المتغيرات
target = "10.0.0.5"
port = 443

# القوائم — صندوق مرتّب من الأشياء
ports = [22, 80, 443, 3306]

# الحلقات — افعل شيئاً لكل عنصر
for p in ports:
    print("Checking port", p)

# الشروط
if port == 443:
    print("This is HTTPS")

# الدوال — وصفات قابلة لإعادة الاستخدام
def is_common_port(p):
    return p in [22, 80, 443]
\`\`\`

لاحظ أن بايثون تستخدم **الإزاحة** (المسافات) لتجميع الكود — الأسطر داخل الحلقة أو الدالة مُزاحة لليمين. بلا أقواس معقوفة.

للأمن تحديداً، ستكرّر باستمرار على القوائم (عناوين IP، منافذ، مستخدمين)، وتفحص الشروط (هل هذا مشبوه؟)، وتغلّفها في دوال تعيد استخدامها. أتقن هذه الأربعة فتؤتمت 80% من العمل الممل.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Write a function \`find_open_ports(scan)\` where \`scan\` is a dictionary mapping port numbers to \`"open"\` or \`"closed"\`. Return a **list of the port numbers that are open**.

Example: \`{22: "open", 80: "closed", 443: "open"}\` → \`[22, 443]\``,
        ar: `اكتب دالة \`find_open_ports(scan)\` حيث \`scan\` قاموس يربط أرقام المنافذ بـ \`"open"\` أو \`"closed"\`. أعِد **قائمة بأرقام المنافذ المفتوحة**.

مثال: \`{22: "open", 80: "closed", 443: "open"}\` ← \`[22, 443]\``,
      },
      starterCode: `def find_open_ports(scan):
    open_ports = []
    # loop over scan.items(), keep the open ones
    return open_ports

result = find_open_ports({22: "open", 80: "closed", 443: "open"})
print(result)  # [22, 443]`,
      solution: `def find_open_ports(scan):
    open_ports = []
    for port, state in scan.items():
        if state == "open":
            open_ports.append(port)
    return open_ports

result = find_open_ports({22: "open", 80: "closed", 443: "open"})
print(result)  # [22, 443]`,
      hints: [
        { en: `Loop with: for port, state in scan.items():`, ar: `كرّر بـ: for port, state in scan.items():` },
        { en: `If state == "open", do open_ports.append(port).`, ar: `إذا state == "open"، نفّذ open_ports.append(port).` },
      ],
      tests: [
        { name: { en: "Returns [22, 443] for the example", ar: "يعيد [22, 443] للمثال" }, check: `assert find_open_ports({22: "open", 80: "closed", 443: "open"}) == [22, 443]` },
        { name: { en: "Returns empty list when none open", ar: "يعيد قائمة فارغة عند عدم وجود مفتوح" }, check: `assert find_open_ports({80: "closed"}) == []` },
        { name: { en: "Returns all when all open", ar: "يعيد الكل عندما الكل مفتوح" }, check: `assert find_open_ports({1: "open", 2: "open"}) == [1, 2]` },
      ],
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `**Password strength checker** — a real security utility. Write \`is_strong(pw)\` that returns \`True\` only if the password:
1. Is at least 8 characters long
2. Contains at least one digit
3. Contains at least one uppercase letter`,
        ar: `**فاحص قوة كلمة المرور** — أداة أمنية حقيقية. اكتب \`is_strong(pw)\` تعيد \`True\` فقط إذا كانت كلمة المرور:
1. طولها 8 أحرف على الأقل
2. تحتوي رقماً واحداً على الأقل
3. تحتوي حرفاً كبيراً واحداً على الأقل`,
      },
      starterCode: `def is_strong(pw):
    # length >= 8, has a digit, has an uppercase letter
    pass

print(is_strong("abc"))         # False
print(is_strong("password1"))   # False (no uppercase)
print(is_strong("Password1"))   # True`,
      solution: `def is_strong(pw):
    if len(pw) < 8:
        return False
    has_digit = any(c.isdigit() for c in pw)
    has_upper = any(c.isupper() for c in pw)
    return has_digit and has_upper

print(is_strong("abc"))         # False
print(is_strong("password1"))   # False
print(is_strong("Password1"))   # True`,
      hints: [
        { en: `len(pw) >= 8 handles length. For a digit: any(c.isdigit() for c in pw).`, ar: `len(pw) >= 8 للطول. وللرقم: any(c.isdigit() for c in pw).` },
        { en: `Uppercase check: any(c.isupper() for c in pw). Return all three combined with 'and'.`, ar: `فحص الحرف الكبير: any(c.isupper() for c in pw). أعِد الثلاثة مجموعة بـ 'and'.` },
      ],
      tests: [
        { name: { en: "Short password is weak", ar: "كلمة قصيرة ضعيفة" }, check: `assert is_strong("abc") == False` },
        { name: { en: "No uppercase is weak", ar: "بلا حرف كبير ضعيفة" }, check: `assert is_strong("password1") == False` },
        { name: { en: "Strong password passes", ar: "الكلمة القوية تنجح" }, check: `assert is_strong("Password1") == True` },
        { name: { en: "No digit is weak", ar: "بلا رقم ضعيفة" }, check: `assert is_strong("PasswordX") == False` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Regex — finding needles in a haystack of text 🔍

Log files are huge and messy. Searching for an exact word (like \`"ERROR"\`) is easy — but what if you need to find *any* IP address, without knowing which ones appear? **Regular expressions (regex)** describe a *pattern* instead of exact text:

\`\`\`python
import re

text = "Login from 192.168.1.5 failed, then 10.0.0.9 succeeded"
ips = re.findall(r"\\d+\\.\\d+\\.\\d+\\.\\d+", text)
print(ips)   # ['192.168.1.5', '10.0.0.9']
\`\`\`

Read the pattern \`\\d+\\.\\d+\\.\\d+\\.\\d+\` piece by piece: \`\\d\` means "any digit," \`+\` means "one or more of those," and \`\\.\` means "a literal dot" (a plain dot in regex means "any character," so it must be escaped). Put together: "one or more digits, a dot, one or more digits, a dot…" — exactly the shape of an IPv4 address.

This is a genuinely core security skill: SOC analysts and SIEM tools (you'll meet these in the SOC lesson) run regex patterns like this over millions of log lines to pull out **IOCs** (Indicators of Compromise) — suspicious IPs, email addresses, file hashes — automatically, instead of reading every line by eye.`,
        ar: `## Regex — إيجاد إبرة في كومة نص 🔍

ملفات السجلّات ضخمة وفوضوية. البحث عن كلمة محددة (مثل \`"ERROR"\`) سهل — لكن ماذا لو احتجت إيجاد *أي* عنوان IP، دون معرفة أيها سيظهر؟ **التعابير النمطية (regex)** تصف *نمطاً* بدل نص محدد:

\`\`\`python
import re

text = "Login from 192.168.1.5 failed, then 10.0.0.9 succeeded"
ips = re.findall(r"\\d+\\.\\d+\\.\\d+\\.\\d+", text)
print(ips)   # ['192.168.1.5', '10.0.0.9']
\`\`\`

اقرأ النمط \`\\d+\\.\\d+\\.\\d+\\.\\d+\` قطعة بقطعة: \`\\d\` تعني "أي رقم،" و\`+\` تعني "واحد أو أكثر من ذلك،" و\`\\.\` تعني "نقطة حرفية" (النقطة العادية في regex تعني "أي حرف،" فيجب الهروب منها). مجتمعة: "رقم أو أكثر، نقطة، رقم أو أكثر، نقطة…" — بالضبط شكل عنوان IPv4.

هذه مهارة أمنية جوهرية حقاً: محللو SOC وأدوات SIEM (ستقابلهم في درس SOC) يشغّلون أنماط regex كهذه على ملايين أسطر السجلّات لاستخراج **مؤشرات الاختراق (IOCs)** — عناوين IP مشبوهة، عناوين بريد، تجزئات ملفات — تلقائياً، بدل قراءة كل سطر بالعين.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Write \`extract_ips(text)\` using \`re.findall\` that returns a list of every IP address found in \`text\`.`,
        ar: `اكتب \`extract_ips(text)\` باستخدام \`re.findall\` تعيد قائمة بكل عنوان IP موجود في \`text\`.`,
      },
      starterCode: `import re

def extract_ips(text):
    # use re.findall with the IPv4 pattern
    pass

log = "Connections from 192.168.1.5 and 10.0.0.9, blocked 203.0.113.7"
print(extract_ips(log))  # ['192.168.1.5', '10.0.0.9', '203.0.113.7']`,
      solution: `import re

def extract_ips(text):
    return re.findall(r"\\d+\\.\\d+\\.\\d+\\.\\d+", text)

log = "Connections from 192.168.1.5 and 10.0.0.9, blocked 203.0.113.7"
print(extract_ips(log))  # ['192.168.1.5', '10.0.0.9', '203.0.113.7']`,
      hints: [
        { en: `re.findall(pattern, text) returns every match as a list.`, ar: `re.findall(pattern, text) تعيد كل تطابق كقائمة.` },
        { en: `Pattern: r"\\d+\\.\\d+\\.\\d+\\.\\d+"`, ar: `النمط: r"\\d+\\.\\d+\\.\\d+\\.\\d+"` },
      ],
      tests: [
        { name: { en: "Finds all 3 IPs in the log", ar: "يجد كل الـ3 عناوين IP في السجلّ" }, check: `assert extract_ips(log) == ["192.168.1.5", "10.0.0.9", "203.0.113.7"]` },
        { name: { en: "Returns empty list when no IPs present", ar: "يعيد قائمة فارغة عند عدم وجود عناوين IP" }, check: `assert extract_ips("no addresses here") == []` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "How does Python group code inside a loop or function?", ar: "كيف تجمّع بايثون الكود داخل حلقة أو دالة؟" },
          choices: [
            { en: "Curly braces { }", ar: "الأقواس المعقوفة { }" },
            { en: "Indentation (spaces)", ar: "الإزاحة (المسافات)" },
            { en: "Semicolons", ar: "الفواصل المنقوطة" },
          ],
          answer: 1,
          explain: {
            en: "Python uses indentation instead of braces. Consistent spacing isn't optional — it defines the structure.",
            ar: "بايثون تستخدم الإزاحة بدل الأقواس. الاتساق في المسافات ليس اختيارياً — بل يحدد البنية.",
          },
        },
        {
          q: { en: "What does any(c.isdigit() for c in pw) check?", ar: "ماذا يفحص any(c.isdigit() for c in pw)؟" },
          choices: [
            { en: "Whether every character is a digit", ar: "هل كل حرف رقم" },
            { en: "Whether at least one character is a digit", ar: "هل حرف واحد على الأقل رقم" },
            { en: "The total number of digits", ar: "العدد الكلي للأرقام" },
          ],
          answer: 1,
          explain: {
            en: "any() is True if at least one item matches. Its partner all() is True only if every item matches.",
            ar: "any() تكون True إذا تطابق عنصر واحد على الأقل. ورفيقتها all() تكون True فقط إذا تطابق كل عنصر.",
          },
        },
        {
          q: { en: "Why is Python popular for security automation?", ar: "لماذا تشيع بايثون في أتمتة الأمن؟" },
          choices: [
            { en: "It's the fastest language", ar: "أسرع لغة" },
            { en: "It's readable and has libraries for almost everything", ar: "سهلة القراءة ولها مكتبات لكل شيء تقريباً" },
            { en: "It only runs on Kali Linux", ar: "تعمل فقط على Kali Linux" },
          ],
          answer: 1,
          explain: {
            en: "Readability + a massive ecosystem (requests, scapy, etc.) makes writing scanners and parsers fast. Speed isn't its selling point.",
            ar: "سهولة القراءة + نظام مكتبات ضخم (requests، scapy…) يجعل كتابة الفاحصات والمحلّلات سريعة. السرعة ليست ميزتها.",
          },
        },
        {
          q: { en: "What does \\d+ mean in a regex pattern?", ar: "ماذا تعني \\d+ في نمط regex؟" },
          choices: [
            { en: "One or more digits", ar: "رقم واحد أو أكثر" },
            { en: "Exactly one letter", ar: "حرف واحد بالضبط" },
            { en: "Any punctuation mark", ar: "أي علامة ترقيم" },
          ],
          answer: 0,
          explain: {
            en: "\\d matches a single digit; + means 'one or more of the previous thing' — together, any run of digits.",
            ar: "\\d تطابق رقماً واحداً؛ و+ تعني 'واحد أو أكثر مما قبلها' — معاً، أي سلسلة أرقام.",
          },
        },
        {
          q: { en: "Why do SOC analysts use regex on log files?", ar: "لماذا يستخدم محللو SOC الـ regex على ملفات السجلّات؟" },
          choices: [
            { en: "To automatically pull out patterns like IPs or hashes from millions of lines", ar: "لاستخراج أنماط مثل عناوين IP أو التجزئات تلقائياً من ملايين الأسطر" },
            { en: "Regex deletes log files", ar: "الـ regex يحذف ملفات السجلّات" },
            { en: "It only works on images", ar: "يعمل فقط على الصور" },
          ],
          answer: 0,
          explain: {
            en: "Regex finds patterns, not exact text — exactly what's needed to hunt for indicators of compromise across massive logs without reading every line.",
            ar: "الـ regex يجد أنماطاً، لا نصاً محدداً — بالضبط ما يلزم لتصيّد مؤشرات الاختراق عبر سجلّات ضخمة دون قراءة كل سطر.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Python = the automation language of security
- You mastered variables, lists, loops, conditions, functions
- Regex finds patterns (IPs, emails, hashes) instead of exact text — the engine behind SIEM log analysis
- You built a port filter, a password-strength checker, and an IP extractor — all real tools

**Next:** Cyber Security Basics — the core concepts (CIA triad, threats, defense) that turn these skills into a security mindset.`,
        ar: `## الخلاصة

- بايثون = لغة أتمتة الأمن
- أتقنت المتغيرات والقوائم والحلقات والشروط والدوال
- الـ regex يجد أنماطاً (عناوين IP، بريد، تجزئات) بدل نص محدد — المحرك خلف تحليل سجلّات SIEM
- بنيت مُرشِّح منافذ وفاحص قوة كلمات مرور ومستخرج عناوين IP — أدوات حقيقية

**التالي:** أساسيات الأمن السيبراني — المفاهيم الجوهرية (ثالوث CIA، التهديدات، الدفاع) التي تحوّل هذه المهارات إلى عقلية أمنية.`,
      },
    },
  ],
};
