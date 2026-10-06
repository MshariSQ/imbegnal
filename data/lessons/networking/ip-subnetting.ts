import type { Lesson, LabTest } from "../types";

// A larger routing table for the "big table" test, built from a simple rule so the
// expected answers are obvious by inspection: 10.<i>.0.0/16 goes to hop r<i>.
const bigTableRoutes = Array.from({ length: 200 }, (_, i) => "10." + i + ".0.0/16 r" + i);
const bigTableProbes = [0, 7, 99, 150, 199];
const bigTableStdin =
  "201 " + (bigTableProbes.length + 2) + "\n" +
  "0.0.0.0/0 gw\n" +
  bigTableRoutes.join("\n") + "\n" +
  bigTableProbes.map((i) => "10." + i + "." + (i % 7) + ".1").join("\n") + "\n" +
  "10.200.0.1\n" +
  "11.0.0.1\n";
const bigTableExpected = bigTableProbes.map((i) => "r" + i).join("\n") + "\ngw\ngw\n";

const routeTests: LabTest[] = [
  {
    name: { en: "Most specific route wins", ar: "المسار الأكثر تحديداً يفوز" },
    stdin: "5 4\n0.0.0.0/0 203.0.113.1\n10.0.0.0/8 10.0.0.1\n10.1.0.0/16 10.1.0.254\n10.1.2.0/24 eth2\n192.168.1.0/24 eth1\n10.1.2.77\n10.1.9.9\n10.200.0.1\n198.51.100.7\n",
    expected: "eth2\n10.1.0.254\n10.0.0.1\n203.0.113.1\n",
  },
  {
    name: { en: "No default route: unmatched destinations have no route", ar: "بلا مسار افتراضي: الوجهات غير المطابقة لا مسار لها" },
    stdin: "2 2\n192.0.2.0/24 eth0\n198.51.100.0/24 eth1\n192.0.2.200\n203.0.113.5\n",
    expected: "eth0\nno route\n",
  },
  {
    name: { en: "Host route (/32) and the edges of a /24", ar: "مسار مضيف (/32) وحدود شبكة /24" },
    stdin: "2 4\n192.0.2.0/24 eth0\n192.0.2.10/32 lo\n192.0.2.10\n192.0.2.11\n192.0.3.0\n192.0.1.255\n",
    expected: "lo\neth0\nno route\nno route\n",
  },
  {
    name: { en: "Order in the table does not matter (a /12 containing a /18)", ar: "ترتيب الجدول لا يهم (شبكة /12 تحتوي /18)" },
    stdin: "2 4\n172.16.64.0/18 dc\n172.16.0.0/12 core\n172.16.127.255\n172.16.128.0\n172.31.255.255\n172.32.0.0\n",
    expected: "dc\ncore\ncore\nno route\n",
  },
  {
    name: { en: "Empty table: every lookup is no route", ar: "جدول فارغ: كل بحث ينتهي بـ no route" },
    stdin: "0 2\n1.2.3.4\n5.6.7.8\n",
    expected: "no route\nno route\n",
  },
  {
    name: { en: "A table with 201 routes", ar: "جدول فيه 201 مساراً" },
    stdin: bigTableStdin,
    expected: bigTableExpected,
  },
];

export const lesson: Lesson = {
  nodeId: "ip-subnetting",
  title: { en: "IP Addressing & Subnetting — Carving Up the Network", ar: "عنونة IP وتقسيم الشبكات — كيف نُقطّع الشبكة" },
  estMinutes: 41,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- How an **IPv4 address** is really just a 32-bit number, and how to read it in binary
- What **CIDR notation** (\`192.168.10.77/26\`) and a **subnet mask** mean
- How to find the **network address**, **broadcast address** and **usable host range** with two bit operations
- How to **split** a network into subnets (including different sizes: **VLSM**) and **merge** them again
- How a router picks a route with **longest-prefix match**
- A first look at **IPv6**
- You will build three tools: a CIDR calculator, a VLSM planner and a routing-table lookup

## The street address analogy 🏠

A postal address has two parts: the **street** and the **house number**. The street tells the mail truck which neighbourhood to drive to. The house number only matters once it has arrived. Nobody needs a list of every house on Earth: the truck first matches the street, then the number.

An IP address works the same way. One part says **which network** (the street), the other says **which host** on that network (the house number). A **subnet mask** is a stencil laid over the address that shows which digits are the street. Routers only look at the street part, so a router in another country needs one entry for a whole network instead of one for every computer in it.`,
        ar: `## ماذا ستتعلم

- كيف أن **عنوان IPv4** ليس إلا رقماً من 32 بتاً، وكيف تقرؤه بالنظام الثنائي
- ما معنى **صيغة CIDR** (\`192.168.10.77/26\`) و**قناع الشبكة الفرعية (subnet mask)**
- كيف تجد **عنوان الشبكة** و**عنوان البث (broadcast)** و**نطاق المضيفين المتاح** بعمليتين على البتات
- كيف **تقسّم** شبكة إلى شبكات فرعية (بأحجام مختلفة أيضاً: **VLSM**) و**تدمجها** من جديد
- كيف يختار الراوتر المسار بقاعدة **أطول بادئة مطابقة (longest-prefix match)**
- نظرة أولى على **IPv6**
- ستبني ثلاث أدوات: حاسبة CIDR، ومخطِّط VLSM، وبحثاً في جدول التوجيه

## تشبيه عنوان البيت 🏠

العنوان البريدي له جزآن: **الشارع** و**رقم البيت**. الشارع يخبر سائق البريد إلى أي حيّ يتجه، ورقم البيت لا يهمّ إلا بعد الوصول. لا أحد يحتاج قائمة بكل بيت على الأرض: تطابق الشاحنة الشارع أولاً ثم الرقم.

وعنوان IP يعمل بالطريقة نفسها. جزء منه يحدد **أي شبكة** (الشارع)، والجزء الآخر يحدد **أي مضيف** في تلك الشبكة (رقم البيت). و**قناع الشبكة** أشبه بقالب شفاف يوضع فوق العنوان فيُظهر أي الأرقام هي الشارع. الراوترات تنظر إلى جزء الشارع فقط، لذلك يكفي راوتر في بلد بعيد سطر واحد لشبكة كاملة بدلاً من سطر لكل حاسوب فيها.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## An IPv4 address is 32 bits

We write an IPv4 address as four decimal numbers separated by dots, each from 0 to 255. Each number is one **octet**, which is 8 bits. In binary the weights inside an octet are:

\`\`\`text
128  64  32  16   8   4   2   1
\`\`\`

So \`192.168.10.77\` is:

\`\`\`text
192      168      10       77
11000000.10101000.00001010.01001101
\`\`\`

(192 = 128 + 64, 168 = 128 + 32 + 8, 10 = 8 + 2, 77 = 64 + 8 + 4 + 1.) There are 2^32 = 4,294,967,296 possible addresses, and the whole address is just one big integer. That is how computers store it.

## Addresses with a special meaning

Not every address is a normal public one. Learn these by heart; you will meet them daily:

- **Private ranges** (RFC 1918), never routed on the public Internet: \`10.0.0.0/8\`, \`172.16.0.0/12\` (that is 172.16.0.0 to 172.31.255.255, not all of 172.x), and \`192.168.0.0/16\`. Your home Wi-Fi uses one of them, and **NAT** shares one public address among all those private ones.
- **Loopback**: \`127.0.0.0/8\`, usually \`127.0.0.1\`, "this very computer".
- **Link-local**: \`169.254.0.0/16\`, self-assigned when no DHCP server answers. Seeing one usually means "DHCP failed".
- **Shared address space**: \`100.64.0.0/10\`, used by ISPs for carrier-grade NAT.
- **Documentation**: \`192.0.2.0/24\`, \`198.51.100.0/24\`, \`203.0.113.0/24\`. Safe to use in examples, like in this lesson.
- **Multicast**: \`224.0.0.0/4\`. **Unspecified**: \`0.0.0.0\`. **Limited broadcast**: \`255.255.255.255\`.`,
        ar: `## عنوان IPv4 هو 32 بتاً

نكتب عنوان IPv4 على شكل أربعة أرقام عشرية تفصل بينها نقاط، كل رقم من 0 إلى 255. كل رقم هو **octet** أي 8 بتات. وأوزان البتات داخل الـ octet بالنظام الثنائي هي:

\`\`\`text
128  64  32  16   8   4   2   1
\`\`\`

فالعنوان \`192.168.10.77\` هو:

\`\`\`text
192      168      10       77
11000000.10101000.00001010.01001101
\`\`\`

(192 = 128 + 64، و168 = 128 + 32 + 8، و10 = 8 + 2، و77 = 64 + 8 + 4 + 1.) عدد العناوين الممكنة 2^32 = 4,294,967,296، والعنوان كله مجرد عدد صحيح كبير واحد. وهكذا تخزّنه الحواسيب.

## عناوين لها معنى خاص

ليست كل العناوين عامة وعادية. احفظ هذه جيداً فستقابلها كل يوم:

- **النطاقات الخاصة (Private)** حسب RFC 1918، ولا تُوجَّه أبداً على الإنترنت العام: \`10.0.0.0/8\` و\`172.16.0.0/12\` (أي من 172.16.0.0 إلى 172.31.255.255 وليس كل 172.x) و\`192.168.0.0/16\`. شبكة Wi-Fi في بيتك تستخدم أحدها، وترجمة **NAT** تجعل عنواناً عاماً واحداً يخدم كل تلك العناوين الخاصة.
- **Loopback**: \`127.0.0.0/8\` وعادةً \`127.0.0.1\`، أي "هذا الحاسوب نفسه".
- **Link-local**: \`169.254.0.0/16\`، يعيّنه الجهاز لنفسه حين لا يرد خادم DHCP. رؤيتك له تعني غالباً أن "DHCP فشل".
- **المساحة المشتركة**: \`100.64.0.0/10\`، يستخدمها مزوّدو الإنترنت في NAT على مستوى المزوّد.
- **التوثيق**: \`192.0.2.0/24\` و\`198.51.100.0/24\` و\`203.0.113.0/24\`. آمنة للاستخدام في الأمثلة، كما في هذا الدرس.
- **Multicast**: \`224.0.0.0/4\`. **غير المحدد**: \`0.0.0.0\`. **البث المحدود**: \`255.255.255.255\`.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## CIDR and the subnet mask

In the early 1990s the Internet was running out of addresses because networks came only in three fixed sizes. **CIDR** (Classless Inter-Domain Routing) fixed that by letting the boundary between network and host sit at **any bit**. We write it as **address/prefix length**:

\`\`\`text
192.168.10.77/26
\`\`\`

The first **26** bits are the network part, the remaining 32 - 26 = **6** bits identify the host. The same idea written as a **mask** is 26 one-bits followed by 6 zero-bits:

\`\`\`text
11111111.11111111.11111111.11000000  =  255.255.255.192
\`\`\`

Two bit operations give you everything:

- **network address** = address AND mask (clear all host bits)
- **broadcast address** = network OR (NOT mask) (set all host bits)
- addresses in the subnet = 2^(32 - prefix); **usable hosts** = that number minus 2, because the network and broadcast addresses cannot be given to a host

Worked example for \`192.168.10.77/26\`: the last octet is 77 = \`01001101\`, the mask octet is 192 = \`11000000\`, AND gives \`01000000\` = 64. So the network is **192.168.10.64**; setting the 6 host bits gives **192.168.10.127** as the broadcast; the usable range is **.65 to .126**, which is 2^6 - 2 = **62 hosts**.

**A shortcut for exams:** block size = 256 - mask octet = 256 - 192 = 64. Subnets start at multiples of 64 (0, 64, 128, 192), and 77 falls inside the block that starts at 64.

Handy sizes to remember: \`/24\` = 256 addresses (254 usable), \`/25\` = 128 (126), \`/26\` = 64 (62), \`/27\` = 32 (30), \`/28\` = 16 (14), \`/29\` = 8 (6), \`/30\` = 4 (2). Two exceptions: a **/31** has 2 addresses and both are usable on a point-to-point link (RFC 3021), and a **/32** is exactly one host.

Run the same maths in code:`,
        ar: `## CIDR وقناع الشبكة الفرعية

في بداية التسعينيات كاد الإنترنت ينفد من العناوين لأن الشبكات كانت تأتي بثلاثة أحجام ثابتة فقط. حلّ **CIDR** (التوجيه بين النطاقات بلا فئات) المشكلة بأن جعل الحد الفاصل بين الشبكة والمضيف عند **أي بت**. ونكتبه على شكل **العنوان/طول البادئة**:

\`\`\`text
192.168.10.77/26
\`\`\`

أول **26** بتاً هي جزء الشبكة، والبتات الباقية 32 - 26 = **6** تحدد المضيف. والفكرة نفسها مكتوبة على شكل **قناع** هي 26 بتاً من الواحدات يليها 6 بتات من الأصفار:

\`\`\`text
11111111.11111111.11111111.11000000  =  255.255.255.192
\`\`\`

عمليتان على البتات تعطيانك كل شيء:

- **عنوان الشبكة** = العنوان AND القناع (تصفير كل بتات المضيف)
- **عنوان البث (broadcast)** = عنوان الشبكة OR (NOT القناع) (جعل كل بتات المضيف واحدات)
- عدد العناوين في الشبكة الفرعية = 2^(32 - prefix)؛ و**عدد المضيفين المتاح** = هذا العدد ناقص 2، لأن عنواني الشبكة والبث لا يُعطيان لمضيف

مثال محلول للعنوان \`192.168.10.77/26\`: الـ octet الأخير 77 = \`01001101\`، وقناعه 192 = \`11000000\`، والـ AND يعطي \`01000000\` = 64. إذن الشبكة هي **192.168.10.64**؛ وجعل بتات المضيف الستة واحدات يعطي **192.168.10.127** عنواناً للبث؛ والنطاق المتاح من **.65 إلى .126**، أي 2^6 - 2 = **62 مضيفاً**.

**اختصار للامتحانات:** حجم الكتلة = 256 - octet القناع = 256 - 192 = 64. تبدأ الشبكات الفرعية عند مضاعفات 64 (أي 0 و64 و128 و192)، والعدد 77 يقع داخل الكتلة التي تبدأ عند 64.

أحجام يسهل تذكرها: \`/24\` = 256 عنواناً (254 متاحاً)، و\`/25\` = 128 (126)، و\`/26\` = 64 (62)، و\`/27\` = 32 (30)، و\`/28\` = 16 (14)، و\`/29\` = 8 (6)، و\`/30\` = 4 (2). واستثناءان: شبكة **/31** فيها عنوانان وكلاهما متاح على رابط نقطة إلى نقطة (RFC 3021)، وشبكة **/32** هي مضيف واحد بالضبط.

شغّل الحساب نفسه بالكود:`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: String.raw`// The whole subnet calculation is two bit operations on a 32-bit integer.
function toInt(ip) {
  return ip.split(".").reduce(function (acc, octet) {
    return ((acc << 8) | Number(octet)) >>> 0; // >>> 0 keeps the result unsigned
  }, 0);
}
function toDotted(n) {
  return [24, 16, 8, 0].map(function (shift) { return (n >>> shift) & 255; }).join(".");
}
function toBinary(n) {
  return n.toString(2).padStart(32, "0").match(/.{8}/g).join(".");
}

const ip = toInt("192.168.10.77");
const prefix = 26;
const mask = (0xffffffff << (32 - prefix)) >>> 0;
const network = (ip & mask) >>> 0;
const broadcast = (network | ~mask) >>> 0;

console.log("address   ", toBinary(ip), toDotted(ip));
console.log("mask      ", toBinary(mask), toDotted(mask));
console.log("network   ", toBinary(network), toDotted(network));
console.log("broadcast ", toBinary(broadcast), toDotted(broadcast));
console.log("usable hosts:", Math.pow(2, 32 - prefix) - 2);
`,
      explanation: {
        en: "Compare the binary lines: the network address keeps the first 26 bits and zeroes the rest, the broadcast address keeps them and sets the rest to 1. Try prefix 24 or 30, or another address. Notice the `>>> 0` after every operation: JavaScript bit operators work on signed 32-bit numbers, and `>>> 0` turns the result back into an unsigned one.",
        ar: "قارن الأسطر الثنائية: عنوان الشبكة يحتفظ بأول 26 بتاً ويصفّر الباقي، وعنوان البث يحتفظ بها ويجعل الباقي واحدات. جرّب البادئة 24 أو 30 أو عنواناً آخر. لاحظ `>>> 0` بعد كل عملية: عوامل البتات في JavaScript تعمل على أعداد 32 بتاً بإشارة، و`>>> 0` يعيد النتيجة إلى عدد بلا إشارة.",
      },
    },
    {
      type: "lab",
      id: "cidr-calc",
      lang: "python",
      prompt: {
        en: `Build a **CIDR calculator**. Each input line is an address in CIDR notation. Use **shifts and bit masks** to compute the answer; do not use Python's \`ipaddress\` module (you will meet it in a moment).

**Output**, one line per input line:

\`\`\`text
network=<a.b.c.d> broadcast=<a.b.c.d> mask=<a.b.c.d> first=<a.b.c.d> last=<a.b.c.d> hosts=<n>
\`\`\`

- \`first\` and \`last\` are the first and last **usable** addresses, and \`hosts\` is how many there are: 2^(32 - prefix) - 2.
- **Special cases:** \`/31\` has two usable addresses (\`first\` is the network address, \`last\` the broadcast address, \`hosts=2\`). \`/32\` is a single host: network, broadcast, first and last are all the address itself and \`hosts=1\`.
- The address may have host bits set (\`192.168.10.77/26\`); the network address is what you get after masking.
- Invalid input (not four numbers 0-255, a prefix above 32, a missing prefix, anything else) prints \`error: invalid CIDR\`. Blank lines are skipped.

The starter already parses the text and gives you \`dotted()\` to turn an integer back into \`a.b.c.d\`.

**Example**

\`\`\`text
Input:
192.168.10.77/26

Output:
network=192.168.10.64 broadcast=192.168.10.127 mask=255.255.255.192 first=192.168.10.65 last=192.168.10.126 hosts=62
\`\`\``,
        ar: `ابنِ **حاسبة CIDR**. كل سطر إدخال هو عنوان بصيغة CIDR. استخدم **الإزاحة وأقنعة البتات** للحساب؛ ولا تستخدم وحدة \`ipaddress\` في بايثون (ستقابلها بعد قليل).

**الإخراج**، سطر لكل سطر إدخال:

\`\`\`text
network=<a.b.c.d> broadcast=<a.b.c.d> mask=<a.b.c.d> first=<a.b.c.d> last=<a.b.c.d> hosts=<n>
\`\`\`

- \`first\` و\`last\` هما أول وآخر عنوانين **متاحين**، و\`hosts\` عددها: 2^(32 - prefix) - 2.
- **حالات خاصة:** شبكة \`/31\` فيها عنوانان متاحان (\`first\` هو عنوان الشبكة و\`last\` هو عنوان البث و\`hosts=2\`). وشبكة \`/32\` مضيف واحد: الشبكة والبث وfirst وlast كلها هي العنوان نفسه و\`hosts=1\`.
- قد تكون بتات المضيف في العنوان مضبوطة (\`192.168.10.77/26\`)؛ وعنوان الشبكة هو ما تحصل عليه بعد تطبيق القناع.
- المدخل غير الصالح (ليس أربعة أرقام بين 0 و255، أو بادئة فوق 32، أو بلا بادئة، أو أي شيء آخر) يطبع \`error: invalid CIDR\`. وتُتجاهل الأسطر الفارغة.

المسودة تحلّل النص أصلاً وتعطيك \`dotted()\` لتحويل العدد الصحيح إلى \`a.b.c.d\`.

**مثال**

\`\`\`text
الإدخال:
192.168.10.77/26

الإخراج:
network=192.168.10.64 broadcast=192.168.10.127 mask=255.255.255.192 first=192.168.10.65 last=192.168.10.126 hosts=62
\`\`\``,
      },
      starterCode: String.raw`import re
import sys

PATTERN = re.compile(r"(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/(\d{1,2})", re.ASCII)


def parse_cidr(text):
    """Return (address, prefix) as integers, or None if the text is not a valid CIDR."""
    m = PATTERN.fullmatch(text)
    if m is None:
        return None
    a, b, c, d, prefix = (int(g) for g in m.groups())
    if max(a, b, c, d) > 255 or prefix > 32:
        return None
    return (a << 24) | (b << 16) | (c << 8) | d, prefix


def dotted(n):
    """Turn a 32-bit integer into 'a.b.c.d'."""
    return ".".join(str((n >> shift) & 0xFF) for shift in (24, 16, 8, 0))


for line in sys.stdin:
    text = line.strip()
    if not text:
        continue
    parsed = parse_cidr(text)
    if parsed is None:
        print("error: invalid CIDR")
        continue
    address, prefix = parsed
    # TODO: build the 32-bit mask: 'prefix' one-bits followed by zeros
    # TODO: network = address AND mask, broadcast = network OR (NOT mask)
    # TODO: first, last and hosts (remember the special cases /31 and /32)
    # TODO: print network=... broadcast=... mask=... first=... last=... hosts=...
`,
      solution: String.raw`import re
import sys

PATTERN = re.compile(r"(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/(\d{1,2})", re.ASCII)


def parse_cidr(text):
    """Return (address, prefix) as integers, or None if the text is not a valid CIDR."""
    m = PATTERN.fullmatch(text)
    if m is None:
        return None
    a, b, c, d, prefix = (int(g) for g in m.groups())
    if max(a, b, c, d) > 255 or prefix > 32:
        return None
    return (a << 24) | (b << 16) | (c << 8) | d, prefix


def dotted(n):
    """Turn a 32-bit integer into 'a.b.c.d'."""
    return ".".join(str((n >> shift) & 0xFF) for shift in (24, 16, 8, 0))


for line in sys.stdin:
    text = line.strip()
    if not text:
        continue
    parsed = parse_cidr(text)
    if parsed is None:
        print("error: invalid CIDR")
        continue
    address, prefix = parsed

    ALL_ONES = 0xFFFFFFFF
    mask = (ALL_ONES << (32 - prefix)) & ALL_ONES   # /0 shifts everything out: mask 0
    network = address & mask                        # clear the host bits
    broadcast = network | (~mask & ALL_ONES)        # set the host bits

    if prefix <= 30:
        first, last = network + 1, broadcast - 1
        hosts = 2 ** (32 - prefix) - 2
    elif prefix == 31:                              # point-to-point link (RFC 3021)
        first, last, hosts = network, broadcast, 2
    else:                                           # /32: a single host
        first, last, hosts = network, network, 1

    print(
        "network=" + dotted(network),
        "broadcast=" + dotted(broadcast),
        "mask=" + dotted(mask),
        "first=" + dotted(first),
        "last=" + dotted(last),
        "hosts=" + str(hosts),
    )
`,
      hints: [
        { en: "The mask is 32 ones with the last `32 - prefix` bits cleared: `(0xFFFFFFFF << (32 - prefix)) & 0xFFFFFFFF`. The final `& 0xFFFFFFFF` is needed because Python integers never overflow.", ar: "القناع هو 32 واحداً مع تصفير آخر `32 - prefix` بتاً: `(0xFFFFFFFF << (32 - prefix)) & 0xFFFFFFFF`. و`& 0xFFFFFFFF` الأخيرة ضرورية لأن الأعداد الصحيحة في بايثون لا تفيض أبداً." },
        { en: "`network = address & mask`. For the broadcast, flip the mask with `~mask & 0xFFFFFFFF` (`~mask` alone is negative in Python, so the AND brings it back to 32 bits) and OR it with the network.", ar: "`network = address & mask`. وللبث اقلب القناع بـ `~mask & 0xFFFFFFFF` (فالتعبير `~mask` وحده سالب في بايثون، والـ AND يعيده إلى 32 بتاً) ثم طبّق OR مع عنوان الشبكة." },
        { en: "For prefixes up to /30: first = network + 1, last = broadcast - 1, hosts = 2 ** (32 - prefix) - 2. Handle `prefix == 31` and `prefix == 32` separately, as the prompt describes.", ar: "للبادئات حتى /30: first = network + 1 و last = broadcast - 1 و hosts = 2 ** (32 - prefix) - 2. وعالج `prefix == 31` و`prefix == 32` على حدة كما يصف النص." },
      ],
      tests: [
        { name: { en: "The worked example, /26", ar: "المثال المحلول، /26" }, stdin: "192.168.10.77/26\n", expected: "network=192.168.10.64 broadcast=192.168.10.127 mask=255.255.255.192 first=192.168.10.65 last=192.168.10.126 hosts=62\n" },
        { name: { en: "Classic /8, /16 and /24 networks", ar: "شبكات /8 و/16 و/24 الكلاسيكية" }, stdin: "10.1.2.3/8\n172.16.5.130/16\n192.0.2.1/24\n", expected: "network=10.0.0.0 broadcast=10.255.255.255 mask=255.0.0.0 first=10.0.0.1 last=10.255.255.254 hosts=16777214\nnetwork=172.16.0.0 broadcast=172.16.255.255 mask=255.255.0.0 first=172.16.0.1 last=172.16.255.254 hosts=65534\nnetwork=192.0.2.0 broadcast=192.0.2.255 mask=255.255.255.0 first=192.0.2.1 last=192.0.2.254 hosts=254\n" },
        { name: { en: "A boundary inside the third octet (/20)", ar: "حد داخل الـ octet الثالث (/20)" }, stdin: "172.16.37.200/20\n", expected: "network=172.16.32.0 broadcast=172.16.47.255 mask=255.255.240.0 first=172.16.32.1 last=172.16.47.254 hosts=4094\n" },
        { name: { en: "Tiny subnets: /30, /31 and /32", ar: "شبكات صغيرة جداً: /30 و/31 و/32" }, stdin: "192.0.2.5/30\n192.0.2.6/31\n198.51.100.9/32\n", expected: "network=192.0.2.4 broadcast=192.0.2.7 mask=255.255.255.252 first=192.0.2.5 last=192.0.2.6 hosts=2\nnetwork=192.0.2.6 broadcast=192.0.2.7 mask=255.255.255.254 first=192.0.2.6 last=192.0.2.7 hosts=2\nnetwork=198.51.100.9 broadcast=198.51.100.9 mask=255.255.255.255 first=198.51.100.9 last=198.51.100.9 hosts=1\n" },
        { name: { en: "The whole address space, /0", ar: "فضاء العناوين كله، /0" }, stdin: "203.0.113.50/0\n", expected: "network=0.0.0.0 broadcast=255.255.255.255 mask=0.0.0.0 first=0.0.0.1 last=255.255.255.254 hosts=4294967294\n" },
        { name: { en: "Invalid input is reported and blank lines are skipped", ar: "المدخلات غير الصالحة يُبلَّغ عنها والأسطر الفارغة تُتجاهل" }, stdin: "192.168.1.0/33\n300.1.1.1/24\n10.0.0/8\n\nhello\n1.2.3.4\n", expected: "error: invalid CIDR\nerror: invalid CIDR\nerror: invalid CIDR\nerror: invalid CIDR\nerror: invalid CIDR\n" },
      ],
      sampleInput: "192.168.10.77/26\n",
    },
    {
      type: "text",
      body: {
        en: `## Is the destination on my network?

Every host with an address and a mask makes one decision before sending: **is the destination in my own subnet?** It ANDs the destination address with *its own* mask. If the result equals its own network address, the destination is on the same link and the host delivers directly (it finds the MAC address with ARP). Otherwise it hands the packet to the **default gateway**, which must be an address inside the host's own subnet.

Example: host \`192.168.10.77/26\`, gateway \`192.168.10.65\`. A packet to \`192.168.10.100\` stays local (it is inside 64-127). A packet to \`192.168.10.200\` is **not** (that is the 192-255 block), even though the first three octets match, so it goes to the gateway. A wrong mask is a classic cause of "I can reach some machines but not others".

## Splitting a network into subnets

To make smaller subnets you **borrow host bits** and add them to the network part. Each borrowed bit doubles the number of subnets and halves the size of each. Splitting \`192.168.10.0/24\` by borrowing 2 bits gives four **/26** subnets:

\`\`\`text
192.168.10.0/26     hosts .1   - .62
192.168.10.64/26    hosts .65  - .126
192.168.10.128/26   hosts .129 - .190
192.168.10.192/26   hosts .193 - .254
\`\`\`

Equal-sized subnets waste addresses when needs differ: a point-to-point link between two routers needs 2 addresses, a floor of offices needs 100. **VLSM** (variable-length subnet masks) gives each subnet the smallest block that fits, and the usual method is: sort by size, **largest first**, and place the blocks one after another. Starting with the biggest keeps every block aligned on its own size boundary. Each block is a power of two that holds the hosts **plus** the network and broadcast addresses.

The reverse of splitting is **summarisation**: two adjacent, aligned subnets of equal size can be advertised as one bigger prefix. \`192.168.0.0/24\` and \`192.168.1.0/24\` become \`192.168.0.0/23\`, which keeps routing tables small. (\`192.168.1.0/24\` and \`192.168.2.0/24\` cannot be merged: that block does not start on a /23 boundary.)

Python ships with the \`ipaddress\` module, which does all of this for you once you understand the maths:`,
        ar: `## هل الوجهة في شبكتي؟

كل مضيف لديه عنوان وقناع يتخذ قراراً واحداً قبل الإرسال: **هل الوجهة داخل شبكتي الفرعية؟** يطبّق AND بين عنوان الوجهة و*قناعه هو*. فإذا ساوت النتيجة عنوان شبكته فالوجهة على الرابط نفسه ويسلّمها مباشرة (ويعرف عنوان MAC عبر ARP). وإلا سلّم الحزمة إلى **البوابة الافتراضية (default gateway)** التي يجب أن يكون عنوانها داخل شبكة المضيف نفسها.

مثال: المضيف \`192.168.10.77/26\` والبوابة \`192.168.10.65\`. حزمة إلى \`192.168.10.100\` تبقى محلية (فهي داخل 64-127). وحزمة إلى \`192.168.10.200\` **ليست** كذلك (فهذه كتلة 192-255) مع أن الأرقام الثلاثة الأولى متطابقة، لذلك تذهب إلى البوابة. وقناع خاطئ سبب كلاسيكي لشكوى "أصل إلى بعض الأجهزة ولا أصل إلى بعضها".

## تقسيم الشبكة إلى شبكات فرعية

لصنع شبكات فرعية أصغر **تستعير بتات من جزء المضيف** وتضيفها إلى جزء الشبكة. كل بت مستعار يضاعف عدد الشبكات الفرعية ويُنصّف حجم كل واحدة. تقسيم \`192.168.10.0/24\` باستعارة بتين يعطي أربع شبكات **/26**:

\`\`\`text
192.168.10.0/26     hosts .1   - .62
192.168.10.64/26    hosts .65  - .126
192.168.10.128/26   hosts .129 - .190
192.168.10.192/26   hosts .193 - .254
\`\`\`

الشبكات المتساوية الحجم تهدر العناوين حين تختلف الحاجات: رابط نقطة إلى نقطة بين راوترين يحتاج عنوانين، وطابق من المكاتب يحتاج 100. تعطي **VLSM** (أقنعة شبكات فرعية متغيرة الطول) كل شبكة أصغر كتلة تتسع لها، والطريقة المعتادة: رتّب الطلبات تنازلياً، **الأكبر أولاً**، وضع الكتل واحدة بعد الأخرى. والبدء بالأكبر يُبقي كل كتلة محاذية لحدود حجمها. وكل كتلة هي قوة للعدد 2 تتسع للمضيفين **زائد** عنواني الشبكة والبث.

عكس التقسيم هو **التجميع (summarisation)**: شبكتان فرعيتان متجاورتان ومحاذيتان ومتساويتا الحجم يمكن الإعلان عنهما ببادئة واحدة أكبر. فـ \`192.168.0.0/24\` و\`192.168.1.0/24\` تصبحان \`192.168.0.0/23\`، وهذا يُبقي جداول التوجيه صغيرة. (أما \`192.168.1.0/24\` و\`192.168.2.0/24\` فلا يمكن دمجهما: تلك الكتلة لا تبدأ عند حد /23.)

تأتي بايثون بوحدة \`ipaddress\` التي تفعل ذلك كله عنك حين تفهم الحساب:`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: String.raw`import ipaddress

net = ipaddress.ip_network("192.168.10.0/24")
print("Splitting", net, "into /26 subnets:")
for sub in net.subnets(new_prefix=26):
    print(" ", sub, "mask", sub.netmask, "usable", sub.num_addresses - 2)

host = ipaddress.ip_interface("192.168.10.77/26")
print("network of", host, "is", host.network)
print("192.168.10.100 is local:", ipaddress.ip_address("192.168.10.100") in host.network)
print("192.168.10.200 is local:", ipaddress.ip_address("192.168.10.200") in host.network)

print("merge two /24s:", ipaddress.ip_network("192.168.0.0/24").supernet())
print("172.20.5.9 private?", ipaddress.ip_address("172.20.5.9").is_private)
print("1.1.1.1 private?", ipaddress.ip_address("1.1.1.1").is_private)
`,
      explanation: {
        en: "The library agrees with your hand calculation: four /26 subnets of 62 usable hosts, 192.168.10.100 is inside the 64-127 block and .200 is not. In real work you use the library (or `ipcalc` on the command line) and keep the bit-level maths for understanding and for checking surprising results.",
        ar: "المكتبة توافق حسابك اليدوي: أربع شبكات /26 في كل منها 62 مضيفاً متاحاً، والعنوان 192.168.10.100 داخل كتلة 64-127 والعنوان .200 خارجها. في العمل الحقيقي تستخدم المكتبة (أو الأمر `ipcalc` في سطر الأوامر) وتحتفظ بالحساب على مستوى البتات للفهم وللتحقق من النتائج المفاجئة.",
      },
    },
    {
      type: "lab",
      id: "vlsm-plan",
      lang: "c",
      prompt: {
        en: `Write a **VLSM planner** in C. The first input line is the network you may use, in CIDR notation (a proper network address such as \`192.168.10.0/24\`). Every following line is \`<name> <hosts>\`: a subnet that must hold that many hosts.

How to allocate:

1. Sort the requests by \`hosts\`, **largest first**. Requests with the same size keep their input order.
2. Each subnet gets the smallest block (a power of two, **at least 4 addresses**) that holds \`hosts\` plus the network and broadcast addresses.
3. Place the blocks one after another starting at the network address.
4. If a block no longer fits inside the network, print \`<name> no space\` and carry on with the next request.

**Output**, one line per request in allocation order: \`<name> <network>/<prefix> hosts=<usable>\`, where \`usable\` is the block size minus 2.

The starter reads and sorts the input for you. You write the allocation loop.

**Example**

\`\`\`text
Input:
192.168.10.0/24
WAN 2
Sales 50
Office 100

Output:
Office 192.168.10.0/25 hosts=126
Sales 192.168.10.128/26 hosts=62
WAN 192.168.10.192/30 hosts=2
\`\`\``,
        ar: `اكتب **مخطِّط VLSM** بلغة C. سطر الإدخال الأول هو الشبكة المسموح لك باستخدامها بصيغة CIDR (عنوان شبكة صحيح مثل \`192.168.10.0/24\`). وكل سطر بعده هو \`<name> <hosts>\`: شبكة فرعية يجب أن تتسع لهذا العدد من المضيفين.

طريقة التخصيص:

1. رتّب الطلبات حسب \`hosts\`، **الأكبر أولاً**. والطلبات المتساوية الحجم تبقى بترتيب إدخالها.
2. تأخذ كل شبكة فرعية أصغر كتلة (قوة للعدد 2، و**لا تقل عن 4 عناوين**) تتسع لعدد \`hosts\` زائد عنواني الشبكة والبث.
3. ضع الكتل واحدة بعد الأخرى بدءاً من عنوان الشبكة.
4. إذا لم تعد الكتلة تتسع داخل الشبكة فاطبع \`<name> no space\` وتابع الطلب التالي.

**الإخراج**، سطر لكل طلب بترتيب التخصيص: \`<name> <network>/<prefix> hosts=<usable>\`، حيث \`usable\` هو حجم الكتلة ناقص 2.

المسودة تقرأ المدخلات وتفرزها لك. وأنت تكتب حلقة التخصيص.

**مثال**

\`\`\`text
الإدخال:
192.168.10.0/24
WAN 2
Sales 50
Office 100

الإخراج:
Office 192.168.10.0/25 hosts=126
Sales 192.168.10.128/26 hosts=62
WAN 192.168.10.192/30 hosts=2
\`\`\``,
      },
      starterCode: String.raw`#include <stdio.h>
#include <stdlib.h>

#define MAX_REQUESTS 256

typedef struct {
    char name[64];
    unsigned long long hosts; /* hosts this subnet must hold */
    int order;                /* position in the input, used to break ties */
} Request;

/* Largest requirement first; equal sizes keep their input order. */
static int by_hosts_desc(const void *pa, const void *pb) {
    const Request *a = pa, *b = pb;
    if (a->hosts != b->hosts) return a->hosts < b->hosts ? 1 : -1;
    return a->order - b->order;
}

static void print_ip(unsigned long long ip) {
    printf("%llu.%llu.%llu.%llu", (ip >> 24) & 255, (ip >> 16) & 255, (ip >> 8) & 255, ip & 255);
}

int main(void) {
    char line[256];
    unsigned a, b, c, d, prefix;
    if (!fgets(line, sizeof line, stdin) || sscanf(line, "%u.%u.%u.%u/%u", &a, &b, &c, &d, &prefix) != 5 || prefix > 32) {
        return 0;
    }
    unsigned long long total = 1ULL << (32 - prefix);
    unsigned long long start = ((((unsigned long long)a << 24) | (b << 16) | (c << 8) | d)) & ~(total - 1);
    unsigned long long end = start + total; /* first address after the network */

    Request reqs[MAX_REQUESTS];
    int n = 0;
    while (n < MAX_REQUESTS && fgets(line, sizeof line, stdin)) {
        Request r;
        if (sscanf(line, "%63s %llu", r.name, &r.hosts) != 2) continue; /* skip blank lines */
        r.order = n;
        reqs[n++] = r;
    }
    qsort(reqs, n, sizeof reqs[0], by_hosts_desc);

    unsigned long long next = start; /* next free address */
    for (int i = 0; i < n; i++) {
        /* TODO: find the smallest power-of-two block size (>= 4) that holds reqs[i].hosts + 2 addresses */
        /* TODO: if next + size would go past 'end', print "<name> no space" and continue */
        /* TODO: otherwise print "<name> <next>/<prefix> hosts=<size - 2>" (use print_ip) and advance 'next' by size */
    }
    (void)end;
    (void)next;
    (void)print_ip;
    return 0;
}
`,
      solution: String.raw`#include <stdio.h>
#include <stdlib.h>

#define MAX_REQUESTS 256

typedef struct {
    char name[64];
    unsigned long long hosts; /* hosts this subnet must hold */
    int order;                /* position in the input, used to break ties */
} Request;

/* Largest requirement first; equal sizes keep their input order. */
static int by_hosts_desc(const void *pa, const void *pb) {
    const Request *a = pa, *b = pb;
    if (a->hosts != b->hosts) return a->hosts < b->hosts ? 1 : -1;
    return a->order - b->order;
}

static void print_ip(unsigned long long ip) {
    printf("%llu.%llu.%llu.%llu", (ip >> 24) & 255, (ip >> 16) & 255, (ip >> 8) & 255, ip & 255);
}

int main(void) {
    char line[256];
    unsigned a, b, c, d, prefix;
    if (!fgets(line, sizeof line, stdin) || sscanf(line, "%u.%u.%u.%u/%u", &a, &b, &c, &d, &prefix) != 5 || prefix > 32) {
        return 0;
    }
    unsigned long long total = 1ULL << (32 - prefix);
    unsigned long long start = ((((unsigned long long)a << 24) | (b << 16) | (c << 8) | d)) & ~(total - 1);
    unsigned long long end = start + total; /* first address after the network */

    Request reqs[MAX_REQUESTS];
    int n = 0;
    while (n < MAX_REQUESTS && fgets(line, sizeof line, stdin)) {
        Request r;
        if (sscanf(line, "%63s %llu", r.name, &r.hosts) != 2) continue; /* skip blank lines */
        r.order = n;
        reqs[n++] = r;
    }
    qsort(reqs, n, sizeof reqs[0], by_hosts_desc);

    unsigned long long next = start; /* next free address */
    for (int i = 0; i < n; i++) {
        /* smallest power of two that holds the hosts plus network and broadcast */
        unsigned long long size = 4;
        int host_bits = 2;
        while (size - 2 < reqs[i].hosts && host_bits < 33) {
            size <<= 1;
            host_bits++;
        }
        if (size - 2 < reqs[i].hosts || next + size > end) {
            printf("%s no space\n", reqs[i].name);
            continue;
        }
        printf("%s ", reqs[i].name);
        print_ip(next);
        printf("/%d hosts=%llu\n", 32 - host_bits, size - 2);
        next += size; /* largest-first keeps 'next' aligned to every later (smaller) block */
    }
    return 0;
}
`,
      hints: [
        { en: "Start with `size = 4` and double it (`size <<= 1`) while `size - 2 < reqs[i].hosts`. Keep a counter `host_bits` that starts at 2 (a block of 4) and grows with every doubling: a block of 2^h addresses has `h` host bits, so its prefix length is `32 - host_bits`.", ar: "ابدأ بـ `size = 4` وضاعفه (`size <<= 1`) ما دام `size - 2 < reqs[i].hosts`. واحتفظ بعدّاد `host_bits` يبدأ من 2 (كتلة من 4) ويزيد مع كل مضاعفة: كتلة من 2^h عنواناً فيها `h` بتاً للمضيف، فطول بادئتها `32 - host_bits`." },
        { en: "The block fits only if `next + size <= end`. Otherwise print `<name> no space` and `continue` without moving `next`.", ar: "الكتلة تتسع فقط إذا كان `next + size <= end`. وإلا فاطبع `<name> no space` واستخدم `continue` دون تحريك `next`." },
        { en: "Print with `printf(\"%s \", reqs[i].name); print_ip(next); printf(\"/%d hosts=%llu\\n\", 32 - host_bits, size - 2);` then `next += size;`.", ar: "اطبع بـ `printf(\"%s \", reqs[i].name); print_ip(next); printf(\"/%d hosts=%llu\\n\", 32 - host_bits, size - 2);` ثم `next += size;`." },
      ],
      tests: [
        { name: { en: "Five subnets of different sizes (input is unsorted)", ar: "خمس شبكات فرعية بأحجام مختلفة (المدخلات غير مرتبة)" }, stdin: "192.168.10.0/24\nWAN-1 2\nLAN-B 50\nLAN-A 100\nWAN-2 2\nLAN-C 25\n", expected: "LAN-A 192.168.10.0/25 hosts=126\nLAN-B 192.168.10.128/26 hosts=62\nLAN-C 192.168.10.192/27 hosts=30\nWAN-1 192.168.10.224/30 hosts=2\nWAN-2 192.168.10.228/30 hosts=2\n" },
        { name: { en: "The worked example from the prompt", ar: "المثال المحلول في نص التمرين" }, stdin: "192.168.10.0/24\nWAN 2\nSales 50\nOffice 100\n", expected: "Office 192.168.10.0/25 hosts=126\nSales 192.168.10.128/26 hosts=62\nWAN 192.168.10.192/30 hosts=2\n" },
        { name: { en: "Out of space: the second request has no room", ar: "نفاد المساحة: الطلب الثاني لا مكان له" }, stdin: "10.0.0.0/24\nA 200\nB 10\n", expected: "A 10.0.0.0/24 hosts=254\nB no space\n" },
        { name: { en: "254 hosts fit a /24 but 255 need a /23", ar: "254 مضيفاً تناسب /24 لكن 255 تحتاج /23" }, stdin: "10.9.0.0/22\nsmall 254\nbig 255\n", expected: "big 10.9.0.0/23 hosts=510\nsmall 10.9.2.0/24 hosts=254\n" },
        { name: { en: "Minimum block is a /30, even for one host", ar: "أصغر كتلة هي /30 حتى لمضيف واحد" }, stdin: "203.0.113.0/29\nP2P 2\nHost 1\n", expected: "P2P 203.0.113.0/30 hosts=2\nHost 203.0.113.4/30 hosts=2\n" },
        { name: { en: "Empty request list prints nothing", ar: "قائمة طلبات فارغة لا تطبع شيئاً" }, stdin: "192.0.2.0/24\n", expected: "" },
      ],
      sampleInput: "192.168.10.0/24\nWAN 2\nSales 50\nOffice 100\n",
    },
    {
      type: "text",
      body: {
        en: `## How a router picks a route: longest-prefix match

A router's **routing table** maps destination prefixes to a **next hop** (or an outgoing interface):

\`\`\`text
destination        next hop
0.0.0.0/0          203.0.113.1     (default route)
10.0.0.0/8         10.0.0.1
10.1.0.0/16        10.1.0.254
10.1.2.0/24        eth2
\`\`\`

A packet for \`10.1.2.77\` matches **all four** lines, because every one of those prefixes contains it. The router must pick one, and the rule is **longest-prefix match**: the matching route with the **largest prefix length** wins, because it is the most specific. Here that is \`10.1.2.0/24\` (interface eth2). A packet for \`10.1.9.9\` matches the default route, the /8 and the /16, so it follows the /16. The **default route** \`0.0.0.0/0\` matches everything with prefix length 0, so it is only used when nothing more specific matches. Without any default route, an unmatched packet is dropped (the router usually answers with an ICMP "destination unreachable").

This is why aggregation is so powerful: a small ISP can announce one /16 while a customer's /24 inside it still gets its own more specific route. When two routes have the same prefix length, other rules (route type, metric) break the tie.

Let's implement the lookup yourself, with bit operations only.`,
        ar: `## كيف يختار الراوتر المسار: أطول بادئة مطابقة

**جدول التوجيه (routing table)** في الراوتر يربط بادئات الوجهات بـ**القفزة التالية (next hop)** (أو بواجهة خروج):

\`\`\`text
destination        next hop
0.0.0.0/0          203.0.113.1     (default route)
10.0.0.0/8         10.0.0.1
10.1.0.0/16        10.1.0.254
10.1.2.0/24        eth2
\`\`\`

حزمة موجهة إلى \`10.1.2.77\` تطابق **الأسطر الأربعة كلها** لأن كل بادئة منها تحتويها. وعلى الراوتر أن يختار واحداً، والقاعدة هي **أطول بادئة مطابقة**: المسار المطابق ذو **أكبر طول للبادئة** يفوز لأنه الأكثر تحديداً. وهنا هو \`10.1.2.0/24\` (الواجهة eth2). وحزمة إلى \`10.1.9.9\` تطابق المسار الافتراضي وشبكة /8 وشبكة /16، فتتبع مسار /16. أما **المسار الافتراضي** \`0.0.0.0/0\` فيطابق كل شيء بطول بادئة 0، ولذلك لا يُستخدم إلا حين لا يطابق شيء أكثر تحديداً. وبلا مسار افتراضي تُسقط الحزمة غير المطابقة (ويرد الراوتر عادةً برسالة ICMP من نوع "destination unreachable").

لهذا كان التجميع قوياً جداً: يستطيع مزوّد صغير أن يعلن شبكة /16 واحدة بينما تحصل شبكة /24 لأحد عملائه داخلها على مسارها الأكثر تحديداً. وحين يتساوى طولا بادئتين تحسم الأمر قواعد أخرى (نوع المسار، والمقياس metric).

لنبنِ عملية البحث بأنفسنا، بعمليات البتات فقط.`,
      },
    },
    {
      type: "lab",
      id: "route-lookup",
      lang: "javascript",
      prompt: {
        en: `Implement a **routing-table lookup** with longest-prefix match.

**Input:** the first line is \`N M\`. The next N lines are routes \`<CIDR> <next-hop>\` (the next hop is a single word: an address or an interface name; prefixes are proper network addresses; if two routes have identical prefixes the first one listed wins). The next M lines are destination IPv4 addresses.

**Output:** one line per destination: the next hop of the matching route with the **longest prefix**, or \`no route\` if no route matches. Use bit operations; do not scan strings.

**Example**

\`\`\`text
Input:
3 3
0.0.0.0/0 gw
10.0.0.0/8 core
10.1.2.0/24 eth2
10.1.2.7
10.9.9.9
172.16.0.1

Output:
eth2
core
gw
\`\`\``,
        ar: `نفّذ **بحثاً في جدول التوجيه** بقاعدة أطول بادئة مطابقة.

**الإدخال:** السطر الأول هو \`N M\`. والأسطر N التالية هي مسارات \`<CIDR> <next-hop>\` (القفزة التالية كلمة واحدة: عنوان أو اسم واجهة؛ والبادئات عناوين شبكات صحيحة؛ وإذا تطابقت بادئتان تماماً فالمسار الأول في القائمة هو الفائز). والأسطر M التالية هي عناوين IPv4 للوجهات.

**الإخراج:** سطر لكل وجهة: القفزة التالية للمسار المطابق ذي **أطول بادئة**، أو \`no route\` إن لم يطابق أي مسار. استخدم عمليات البتات؛ ولا تقارن نصوصاً.

**مثال**

\`\`\`text
الإدخال:
3 3
0.0.0.0/0 gw
10.0.0.0/8 core
10.1.2.0/24 eth2
10.1.2.7
10.9.9.9
172.16.0.1

الإخراج:
eth2
core
gw
\`\`\``,
      },
      starterCode: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n").map((l) => l.trim()).filter((l) => l !== "");

// "a.b.c.d" -> unsigned 32-bit integer
function toInt(ip) {
  return ip.split(".").reduce((acc, octet) => ((acc << 8) | Number(octet)) >>> 0, 0);
}

if (lines.length > 0) {
  const [n, m] = lines[0].split(/\s+/).map(Number);

  const routes = [];
  for (const line of lines.slice(1, 1 + n)) {
    const [cidr, hop] = line.split(/\s+/);
    const [net, prefix] = cidr.split("/");
    // TODO: build the mask for Number(prefix) and store
    // { network, mask, prefix, hop } in routes.
    // Careful: in JavaScript x << 32 behaves like x << 0, so /0 needs its own case.
  }

  for (const dest of lines.slice(1 + n, 1 + n + m)) {
    const address = toInt(dest);
    // TODO: among the routes where (address & mask) equals the route's network,
    // pick the one with the longest prefix and print its hop, or "no route".
  }
}
`,
      solution: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n").map((l) => l.trim()).filter((l) => l !== "");

// "a.b.c.d" -> unsigned 32-bit integer
function toInt(ip) {
  return ip.split(".").reduce((acc, octet) => ((acc << 8) | Number(octet)) >>> 0, 0);
}

if (lines.length > 0) {
  const [n, m] = lines[0].split(/\s+/).map(Number);

  const routes = [];
  for (const line of lines.slice(1, 1 + n)) {
    const [cidr, hop] = line.split(/\s+/);
    const [net, prefixText] = cidr.split("/");
    const prefix = Number(prefixText);
    // x << 32 would behave like x << 0, so the default route (/0) gets mask 0 explicitly
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    routes.push({ network: (toInt(net) & mask) >>> 0, mask, prefix, hop });
  }

  for (const dest of lines.slice(1 + n, 1 + n + m)) {
    const address = toInt(dest);
    let best = null;
    for (const route of routes) {
      // >>> 0 turns the signed result of & back into an unsigned number before comparing
      const matches = ((address & route.mask) >>> 0) === route.network;
      if (matches && (best === null || route.prefix > best.prefix)) best = route;
    }
    console.log(best === null ? "no route" : best.hop);
  }
}
`,
      hints: [
        { en: "The mask for prefix `p` is `(0xffffffff << (32 - p)) >>> 0`, except `p === 0`, where the mask is simply `0`. Store `network: (toInt(net) & mask) >>> 0`.", ar: "قناع البادئة `p` هو `(0xffffffff << (32 - p)) >>> 0`، عدا حالة `p === 0` فالقناع هو `0` ببساطة. وخزّن `network: (toInt(net) & mask) >>> 0`." },
        { en: "A route matches when `((address & route.mask) >>> 0) === route.network`. The `>>> 0` matters: `&` returns a signed number in JavaScript, so without it addresses above 128.0.0.0 would never match.", ar: "المسار يطابق حين يكون `((address & route.mask) >>> 0) === route.network`. و`>>> 0` مهمة: فالعامل `&` يعيد عدداً بإشارة في JavaScript، ومن دونها لن تطابق العناوين التي فوق 128.0.0.0 أبداً." },
        { en: "Keep a variable `best` (start with `null`). Whenever a matching route has a larger `prefix` than `best`, replace `best`. At the end print `best.hop`, or `no route` when `best` is still `null`.", ar: "احتفظ بمتغير `best` (يبدأ بـ `null`). كلما كان لمسار مطابق `prefix` أكبر من `best` استبدل `best`. وفي النهاية اطبع `best.hop` أو `no route` إذا بقي `best` يساوي `null`." },
      ],
      tests: routeTests,
      sampleInput: "3 3\n0.0.0.0/0 gw\n10.0.0.0/8 core\n10.1.2.0/24 eth2\n10.1.2.7\n10.9.9.9\n172.16.0.1\n",
    },
    {
      type: "text",
      body: {
        en: `## A first look at IPv6

IPv4 has about 4.3 billion addresses, and the free pool at the top of the hierarchy ran out in 2011. **IPv6** uses **128-bit** addresses (about 3.4 x 10^38), written as eight groups of four hex digits:

\`\`\`text
2001:0db8:0000:0000:0000:0000:0000:0001
\`\`\`

Two shortening rules make that readable:

1. Drop leading zeros in each group: \`0db8\` becomes \`db8\`, \`0000\` becomes \`0\`.
2. Replace **one** run of all-zero groups with \`::\`. You may do this only once per address, otherwise it would be ambiguous.

So the address above is \`2001:db8::1\`. Prefixes work exactly like CIDR: \`2001:db8:abcd:12::/64\` means "the first 64 bits are the network". A normal LAN is a **/64**, and an organisation is typically given a /48 to /56 to split into many /64s.

Things to remember:

- \`::1\` is loopback. \`fe80::/10\` is **link-local**: every interface has one automatically. \`fc00::/7\` is **unique local** (the private-ish range). \`2001:db8::/32\` is for documentation. \`ff00::/8\` is multicast.
- IPv6 has **no broadcast**: it uses multicast instead. There is also no "network and broadcast address are unusable" rule.
- Because there are so many addresses, every device can have a public one and NAT is not needed. In practice most networks run IPv4 and IPv6 side by side (**dual stack**), so you need to understand both.`,
        ar: `## نظرة أولى على IPv6

يملك IPv4 نحو 4.3 مليار عنوان، وقد نفدت المجموعة الحرة على رأس التسلسل الهرمي في عام 2011. أما **IPv6** فيستخدم عناوين من **128 بتاً** (نحو 3.4 × 10^38) تُكتب على شكل ثماني مجموعات من أربعة أرقام ست عشرية:

\`\`\`text
2001:0db8:0000:0000:0000:0000:0000:0001
\`\`\`

قاعدتان للاختصار تجعلانه مقروءاً:

1. احذف الأصفار البادئة في كل مجموعة: \`0db8\` تصبح \`db8\` و\`0000\` تصبح \`0\`.
2. استبدل **سلسلة واحدة** من المجموعات الصفرية بـ \`::\`. ولا يجوز فعل ذلك إلا مرة واحدة في العنوان، وإلا صار غامضاً.

فالعنوان أعلاه هو \`2001:db8::1\`. والبادئات تعمل تماماً مثل CIDR: \`2001:db8:abcd:12::/64\` تعني "أول 64 بتاً هي الشبكة". والشبكة المحلية العادية تكون عادةً **/64**، وتُعطى المؤسسة عادةً شبكة من /48 إلى /56 لتقسمها إلى شبكات /64 كثيرة.

أشياء تحفظها:

- \`::1\` هو loopback. و\`fe80::/10\` هو **link-local**: لكل واجهة عنوان منه تلقائياً. و\`fc00::/7\` هو **unique local** (ما يشبه النطاق الخاص). و\`2001:db8::/32\` للتوثيق. و\`ff00::/8\` هو multicast.
- IPv6 **لا يحتوي بثاً (broadcast)**: يستخدم multicast بدلاً منه. ولا توجد أيضاً قاعدة "عنوانا الشبكة والبث غير صالحين للاستخدام".
- ولأن العناوين كثيرة جداً يمكن لكل جهاز أن يملك عنواناً عاماً فلا حاجة إلى NAT. وعملياً تشغّل أغلب الشبكات IPv4 وIPv6 معاً (**dual stack**)، لذلك يجب أن تفهم الاثنين.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "How many usable host addresses does 192.168.10.0/27 contain?", ar: "كم عدد عناوين المضيفين المتاحة في الشبكة 192.168.10.0/27؟" },
          choices: [
            { en: "28", ar: "28" },
            { en: "32", ar: "32" },
            { en: "30", ar: "30" },
            { en: "31", ar: "31" },
          ],
          answer: 2,
          explain: {
            en: "A /27 leaves 32 - 27 = 5 host bits, so the subnet has 2^5 = 32 addresses. The first (network address) and last (broadcast) cannot be assigned to hosts, leaving 30. The answer 32 forgets those two reserved addresses.",
            ar: "الشبكة /27 تترك 32 - 27 = 5 بتات للمضيف، فيها 2^5 = 32 عنواناً. أول عنوان (عنوان الشبكة) وآخره (البث) لا يُعطيان لمضيف، فيبقى 30. والجواب 32 ينسى هذين العنوانين المحجوزين.",
          },
        },
        {
          q: { en: "What is the network address of 172.16.37.200/20?", ar: "ما عنوان الشبكة للعنوان 172.16.37.200/20؟" },
          choices: [
            { en: "172.16.0.0", ar: "172.16.0.0" },
            { en: "172.16.32.0", ar: "172.16.32.0" },
            { en: "172.16.37.0", ar: "172.16.37.0" },
            { en: "172.16.16.0", ar: "172.16.16.0" },
          ],
          answer: 1,
          explain: {
            en: "/20 means the mask is 255.255.240.0, so the boundary falls inside the third octet. 37 is 00100101 in binary; keeping only the top 4 bits (AND 240) gives 00100000 = 32. Subnets here start at multiples of 16 (0, 16, 32, 48 ...), and 37 sits in the block that begins at 32.",
            ar: "البادئة /20 تعني أن القناع 255.255.240.0، فالحد يقع داخل الـ octet الثالث. العدد 37 يساوي 00100101 ثنائياً؛ وإبقاء أعلى 4 بتات فقط (AND 240) يعطي 00100000 = 32. تبدأ الشبكات هنا عند مضاعفات 16 (0 و16 و32 و48 ...)، والعدد 37 يقع في الكتلة التي تبدأ عند 32.",
          },
        },
        {
          q: { en: "Which of these addresses is NOT in a private (RFC 1918) range?", ar: "أي هذه العناوين ليس ضمن نطاق خاص (RFC 1918)؟" },
          choices: [
            { en: "172.32.0.1", ar: "172.32.0.1" },
            { en: "10.200.1.1", ar: "10.200.1.1" },
            { en: "172.31.255.254", ar: "172.31.255.254" },
            { en: "192.168.100.5", ar: "192.168.100.5" },
          ],
          answer: 0,
          explain: {
            en: "The private block is 172.16.0.0/12, which covers 172.16.0.0 to 172.31.255.255 only. 172.32.0.1 is just outside it and is a public address. Many people wrongly assume that all of 172.x is private.",
            ar: "الكتلة الخاصة هي 172.16.0.0/12 وتغطي من 172.16.0.0 إلى 172.31.255.255 فقط. والعنوان 172.32.0.1 خارجها بقليل وهو عنوان عام. ويظن كثيرون خطأً أن كل 172.x خاص.",
          },
        },
        {
          q: { en: "A router has routes 10.0.0.0/8 via A, 10.20.0.0/16 via B and 0.0.0.0/0 via C. Where does a packet for 10.20.30.40 go?", ar: "لدى راوتر المسارات: 10.0.0.0/8 عبر A، و10.20.0.0/16 عبر B، و0.0.0.0/0 عبر C. إلى أين تذهب حزمة موجهة إلى 10.20.30.40؟" },
          choices: [
            { en: "Via A, because it is listed first", ar: "عبر A لأنه الأول في القائمة" },
            { en: "Via B, because /16 is the longest matching prefix", ar: "عبر B لأن /16 هي أطول بادئة مطابقة" },
            { en: "Via C, because the default route always has priority", ar: "عبر C لأن المسار الافتراضي له الأولوية دائماً" },
            { en: "It is dropped because more than one route matches", ar: "تُسقط لأن أكثر من مسار يطابقها" },
          ],
          answer: 1,
          explain: {
            en: "All three routes match, and that is normal. The router chooses the most specific one, the longest prefix, which is 10.20.0.0/16. The order of the table does not matter, and the default route is the least specific route, used only when nothing else matches.",
            ar: "المسارات الثلاثة كلها تطابق، وهذا أمر طبيعي. يختار الراوتر الأكثر تحديداً، أي أطول بادئة، وهو 10.20.0.0/16. وترتيب الجدول لا يهم، والمسار الافتراضي هو الأقل تحديداً ولا يُستخدم إلا حين لا يطابق غيره.",
          },
        },
        {
          q: { en: "Which one is a correct shortened form of 2001:0db8:0000:0000:0000:0000:0000:0001?", ar: "أي مما يلي صيغة مختصرة صحيحة للعنوان 2001:0db8:0000:0000:0000:0000:0000:0001؟" },
          choices: [
            { en: "2001:db8::0::1", ar: "2001:db8::0::1" },
            { en: "2001:8::1", ar: "2001:8::1" },
            { en: "2001:db8:1", ar: "2001:db8:1" },
            { en: "2001:db8::1", ar: "2001:db8::1" },
          ],
          answer: 3,
          explain: {
            en: "You may drop leading zeros of a group (0db8 becomes db8) and replace one run of all-zero groups with ::. Using :: twice is ambiguous and invalid, cutting digits from inside a group (db8 becomes 8) changes the value, and \"2001:db8:1\" has only three groups and no ::, so it is not a full address.",
            ar: "يمكنك حذف الأصفار البادئة من المجموعة (تصبح 0db8 مثل db8) واستبدال سلسلة واحدة من المجموعات الصفرية بـ ::. واستخدام :: مرتين غامض وغير صالح، وحذف أرقام من داخل المجموعة (db8 إلى 8) يغيّر القيمة، و\"2001:db8:1\" فيه ثلاث مجموعات فقط بلا :: فليس عنواناً كاملاً.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap

- An IPv4 address is a **32-bit number**; **CIDR** (\`/prefix\`) says how many leading bits are the network.
- **network = address AND mask**, **broadcast = network OR NOT mask**, **usable hosts = 2^(32 - prefix) - 2** (except /31 and /32).
- Private ranges: \`10.0.0.0/8\`, \`172.16.0.0/12\`, \`192.168.0.0/16\`. Know loopback, link-local and the documentation ranges too.
- **VLSM**: sort requests largest first and place power-of-two blocks one after another. **Summarisation** merges aligned neighbours into a shorter prefix.
- Routers use **longest-prefix match**; the default route \`0.0.0.0/0\` is the least specific.
- **IPv6**: 128 bits, \`::\` compression, /64 LANs, no broadcast.

**Practice next:** on Linux run \`ip addr\` and \`ip route\` and explain every line with what you learned here. Subnet a /24 for an imaginary office on paper, then check yourself with the lab code or Python's \`ipaddress\`. Then continue with TCP, UDP and ports.`,
        ar: `## الخلاصة

- عنوان IPv4 هو **عدد من 32 بتاً**؛ و**CIDR** (\`/prefix\`) يقول كم بتاً من البداية هي الشبكة.
- **الشبكة = العنوان AND القناع**، و**البث = الشبكة OR NOT القناع**، و**المضيفون المتاحون = 2^(32 - prefix) - 2** (عدا /31 و/32).
- النطاقات الخاصة: \`10.0.0.0/8\` و\`172.16.0.0/12\` و\`192.168.0.0/16\`. واعرف أيضاً loopback وlink-local ونطاقات التوثيق.
- **VLSM**: رتّب الطلبات من الأكبر إلى الأصغر وضع كتلاً من قوى العدد 2 واحدة بعد الأخرى. و**التجميع** يدمج الجارتين المحاذيتين في بادئة أقصر.
- الراوترات تستخدم **أطول بادئة مطابقة**؛ والمسار الافتراضي \`0.0.0.0/0\` هو الأقل تحديداً.
- **IPv6**: 128 بتاً، واختصار \`::\`، وشبكات محلية /64، ولا بث.

**تدرّب بعد ذلك:** على Linux شغّل \`ip addr\` و\`ip route\` واشرح كل سطر بما تعلمته هنا. وقسّم شبكة /24 لمكتب متخيَّل على الورق، ثم تحقق من نفسك بكود التمرين أو بوحدة \`ipaddress\` في بايثون. بعدها تابع مع TCP وUDP والمنافذ.`,
      },
    },
  ],
};
