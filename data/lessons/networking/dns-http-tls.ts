import type { Lesson, LabTest } from "../types";

// Shared chain for the certificate lab: a leaf certificate and the intermediate CA that signed it.
const certChain =
  "root Example Root CA\n" +
  "cert www.example.com|Example Issuing CA 1|2026-06-01|2026-12-28|no|www.example.com,example.com\n" +
  "cert Example Issuing CA 1|Example Root CA|2024-01-01|2030-12-31|yes|\n";

const certTests: LabTest[] = [
  {
    name: { en: "The worked example: names, the last valid day, expired and not yet valid", ar: "المثال المحلول: الأسماء وآخر يوم صالح والمنتهية وغير السارية بعد" },
    stdin:
      certChain +
      "check www.example.com 2026-10-17\ncheck EXAMPLE.com 2026-10-17\ncheck shop.example.com 2026-10-17\ncheck www.example.com 2026-12-28\ncheck www.example.com 2026-12-29\ncheck www.example.com 2026-05-31\n",
    expected:
      "www.example.com 2026-10-17: OK\nEXAMPLE.com 2026-10-17: OK\nshop.example.com 2026-10-17: FAIL hostname mismatch\nwww.example.com 2026-12-28: OK\nwww.example.com 2026-12-29: FAIL expired: www.example.com\nwww.example.com 2026-05-31: FAIL not yet valid: www.example.com\n",
  },
  {
    name: { en: "A wildcard covers exactly one label; a partial wildcard covers nothing", ar: "النجمة تغطي جزءاً واحداً بالضبط؛ والنجمة الجزئية لا تغطي شيئاً" },
    stdin:
      "root Example Root CA\ncert *.example.com|Example Issuing CA 1|2026-01-01|2026-12-31|no|*.example.com,w*.example.net\ncert Example Issuing CA 1|Example Root CA|2024-01-01|2030-12-31|yes|\n" +
      "check api.example.com 2026-03-01\ncheck API.Example.COM 2026-03-01\ncheck example.com 2026-03-01\ncheck a.b.example.com 2026-03-01\ncheck www.example.net 2026-03-01\n",
    expected:
      "api.example.com 2026-03-01: OK\nAPI.Example.COM 2026-03-01: OK\nexample.com 2026-03-01: FAIL hostname mismatch\na.b.example.com 2026-03-01: FAIL hostname mismatch\nwww.example.net 2026-03-01: FAIL hostname mismatch\n",
  },
  {
    name: { en: "A missing intermediate breaks the chain", ar: "غياب الشهادة الوسيطة يكسر السلسلة" },
    stdin:
      "root Example Root CA\ncert www.example.com|Example Issuing CA 2|2026-01-01|2026-12-31|no|www.example.com\ncert Example Issuing CA 1|Example Root CA|2024-01-01|2030-12-31|yes|\n" +
      "check www.example.com 2026-03-01\ncheck mail.example.com 2026-03-01\n",
    expected: "www.example.com 2026-03-01: FAIL broken chain after: www.example.com\nmail.example.com 2026-03-01: FAIL hostname mismatch\n",
  },
  {
    name: { en: "An expired intermediate fails the whole chain; sending the root as well is fine", ar: "انتهاء الشهادة الوسيطة يُسقط السلسلة كلها؛ وإرسال الجذر معها لا بأس به" },
    stdin:
      "root Other Root\nroot Example Root CA\ncert www.example.com|Example Issuing CA 1|2025-01-01|2026-12-31|no|www.example.com\ncert Example Issuing CA 1|Example Root CA|2024-01-01|2025-12-31|yes|\ncert Example Root CA|Example Root CA|2020-01-01|2040-12-31|yes|\n" +
      "check www.example.com 2026-03-01\ncheck www.example.com 2025-06-01\n",
    expected: "www.example.com 2026-03-01: FAIL expired: Example Issuing CA 1\nwww.example.com 2025-06-01: OK\n",
  },
  {
    name: { en: "A certificate that is not a CA cannot sign another one", ar: "الشهادة التي ليست CA لا يحق لها توقيع غيرها" },
    stdin:
      "root Example Root CA\ncert www.example.com|shop.example.org|2026-01-01|2026-12-31|no|www.example.com\ncert shop.example.org|Example Root CA|2026-01-01|2026-12-31|no|shop.example.org\n" +
      "check www.example.com 2026-03-01\n",
    expected: "www.example.com 2026-03-01: FAIL not a CA: shop.example.org\n",
  },
  {
    name: { en: "Unknown root: a self-signed certificate is not trusted", ar: "جذر غير معروف: الشهادة الموقّعة ذاتياً غير موثوقة" },
    stdin: "root Example Root CA\ncert dev.example.com|dev.example.com|2026-01-01|2026-12-31|no|dev.example.com\ncheck dev.example.com 2026-03-01\n",
    expected: "dev.example.com 2026-03-01: FAIL untrusted root: dev.example.com\n",
  },
];

export const lesson: Lesson = {
  nodeId: "dns-http-tls",
  title: { en: "DNS, HTTP & TLS — From a URL to a Page", ar: "DNS وHTTP وTLS — من الرابط إلى الصفحة" },
  estMinutes: 46,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- How **DNS** turns a name such as \`www.example.com\` into an address, and the record types you will meet (A, AAAA, CNAME, MX, NS, TXT and more)
- What an **HTTP** request and response really look like on the wire: the request line, headers, status codes and the body
- How **TLS** proves you are talking to the real server with a **certificate**, and then encrypts the conversation
- How to read the errors each step produces, from \`NXDOMAIN\` to "certificate expired"
- You will build three tools: a DNS lookup that follows aliases, an HTTP response parser and a certificate chain checker

## The phone book, the letter and the sealed envelope ✉️

You want to send a letter to "Example Bookshop", but the post office only understands street addresses. So first you look the name up in a **phone book**: that is **DNS**. Then you write the letter in a format the shop understands, with a clear subject line and your request: that is **HTTP**. Finally, because the letter travels through many hands, you put it in a **sealed envelope** that only the shop can open, and you check the shop's official stamp before you trust the reply: that is **TLS**.

Every time you open a page, your device does these three things in order, usually in well under a second:

\`\`\`text
https://www.example.com/docs/
  |      |               |
  |      |               +-- path: which page on that server
  |      +------------------ host: looked up in DNS
  +------------------------- scheme: https = HTTP inside TLS, port 443 by default

1. DNS      www.example.com  ->  192.0.2.10
2. TCP      three-way handshake with 192.0.2.10:443
3. TLS      check the certificate, agree on keys
4. HTTP     GET /docs/  ->  200 OK + the HTML
5. Repeat   for every image, script and stylesheet the page needs
\`\`\`

You already know step 2 from the TCP lesson. This lesson covers the other three.`,
        ar: `## ماذا ستتعلم

- كيف يحوّل **DNS** اسماً مثل \`www.example.com\` إلى عنوان، وأنواع السجلات التي ستقابلها (A وAAAA وCNAME وMX وNS وTXT وغيرها)
- كيف يبدو **طلب HTTP** و**استجابته** فعلياً على الشبكة: سطر الطلب والترويسات ورموز الحالة وجسم الرسالة
- كيف يثبت **TLS** أنك تتحدث مع الخادم الحقيقي بواسطة **شهادة (certificate)**، ثم يشفّر الحوار
- كيف تقرأ الأخطاء التي تنتج عن كل خطوة، من \`NXDOMAIN\` إلى "انتهت صلاحية الشهادة"
- ستبني ثلاث أدوات: بحث DNS يتتبع الأسماء المستعارة، ومحلّلاً لاستجابات HTTP، وفاحصاً لسلسلة الشهادات

## دليل الهاتف والرسالة والظرف المختوم ✉️

تريد أن ترسل رسالة إلى "مكتبة المثال"، لكن مكتب البريد لا يفهم إلا عناوين الشوارع. فتبحث أولاً عن الاسم في **دليل الهاتف**: هذا هو **DNS**. ثم تكتب الرسالة بصيغة تفهمها المكتبة، بسطر موضوع واضح وطلبك: هذا هو **HTTP**. وأخيراً، لأن الرسالة تمر عبر أيدٍ كثيرة، تضعها في **ظرف مختوم** لا تفتحه إلا المكتبة، وتتحقق من الختم الرسمي للمكتبة قبل أن تثق بالرد: هذا هو **TLS**.

في كل مرة تفتح صفحة، يقوم جهازك بهذه الأشياء الثلاثة بالترتيب، وغالباً في أقل من ثانية بكثير:

\`\`\`text
https://www.example.com/docs/
  |      |               |
  |      |               +-- المسار: أي صفحة على ذلك الخادم
  |      +------------------ المضيف: يُبحث عنه في DNS
  +------------------------- المخطط: https تعني HTTP داخل TLS، والمنفذ 443 افتراضياً

1. DNS      www.example.com  ->  192.0.2.10
2. TCP      المصافحة الثلاثية مع 192.0.2.10:443
3. TLS      فحص الشهادة والاتفاق على المفاتيح
4. HTTP     GET /docs/  ->  200 OK + صفحة HTML
5. التكرار  لكل صورة وسكربت وملف تنسيق تحتاجه الصفحة
\`\`\`

أنت تعرف الخطوة 2 من درس TCP. وهذا الدرس يغطي الخطوات الثلاث الأخرى.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## DNS: the Internet's phone book

**DNS** (Domain Name System, RFC 1034 and RFC 1035) is a distributed database. No single server knows every name. Instead, names form a tree read from right to left:

\`\`\`text
                    .  (root)
          /         |          \\
       com         org          sa        <- top-level domains (TLDs)
        |
     example                              <- example.com, delegated to its owner
      /    \\
    www    mail                           <- www.example.com, mail.example.com
\`\`\`

Each level **delegates** the level below it. The root knows who runs \`com\`; the \`com\` servers know which servers are **authoritative** for \`example.com\`; those servers hold the actual records. The root is served by 13 named server identities, \`a.root-servers.net\` to \`m.root-servers.net\`, each replicated in many places around the world.

### How a lookup travels

Your computer runs a small **stub resolver** that asks one **recursive resolver** (from your ISP, your company, or a public one) to do the work. If the answer is not in its cache, the recursive resolver walks the tree with **iterative** queries:

\`\`\`text
you -> recursive resolver: "www.example.com, type A?"
  resolver -> root server:       "ask the com servers"           (referral)
  resolver -> com server:        "ask ns1.example.com"           (referral)
  resolver -> ns1.example.com:   "www.example.com A 192.0.2.10"  (answer, TTL 300)
you <- recursive resolver: 192.0.2.10
\`\`\`

Every answer carries a **TTL** (time to live) in seconds: how long it may be cached. That is why DNS is fast (most lookups never leave the resolver) and also why a change to a record takes time to reach everyone. Even "this name does not exist" is cached, for a time taken from the zone's SOA record (RFC 2308).

DNS normally uses **UDP port 53**: one small question, one small answer. It falls back to **TCP port 53** for large responses and zone transfers. Classic DNS is neither encrypted nor authenticated, so two additions exist: **DNSSEC** (RFC 4033) signs records so a resolver can detect forged answers, and **DNS over TLS** (port 853, RFC 7858) and **DNS over HTTPS** (RFC 8484) hide your queries from people on the network path.`,
        ar: `## DNS: دليل هاتف الإنترنت

**DNS** (نظام أسماء النطاقات، RFC 1034 وRFC 1035) قاعدة بيانات موزّعة. لا يوجد خادم واحد يعرف كل الأسماء. بل تشكّل الأسماء شجرة تُقرأ من اليمين إلى اليسار:

\`\`\`text
                    .  (root)
          /         |          \\
       com         org          sa        <- النطاقات العليا (TLDs)
        |
     example                              <- example.com، مفوَّض إلى مالكه
      /    \\
    www    mail                           <- www.example.com و mail.example.com
\`\`\`

كل مستوى **يفوّض (delegates)** المستوى الذي تحته. الجذر يعرف من يدير \`com\`؛ وخوادم \`com\` تعرف أي الخوادم **مخوَّلة (authoritative)** بالنطاق \`example.com\`؛ وتلك الخوادم تحمل السجلات الفعلية. ويخدم الجذرَ 13 هويةً مسمّاة من \`a.root-servers.net\` إلى \`m.root-servers.net\`، وكل منها منسوخ في أماكن كثيرة حول العالم.

### كيف يسير البحث

يشغّل حاسوبك **محلّلاً بسيطاً (stub resolver)** يطلب من **محلّل تكراري (recursive resolver)** واحد (من مزوّد الخدمة أو من شركتك أو محلّل عام) أن يقوم بالعمل. وإذا لم يكن الجواب في ذاكرته المؤقتة، يمشي المحلّل التكراري في الشجرة باستعلامات **متتابعة (iterative)**:

\`\`\`text
أنت -> المحلّل التكراري: "www.example.com، النوع A؟"
  المحلّل -> خادم الجذر:          "اسأل خوادم com"                 (إحالة)
  المحلّل -> خادم com:            "اسأل ns1.example.com"           (إحالة)
  المحلّل -> ns1.example.com:     "www.example.com A 192.0.2.10"  (جواب، TTL 300)
أنت <- المحلّل التكراري: 192.0.2.10
\`\`\`

كل جواب يحمل **TTL** (مدة البقاء) بالثواني: أي المدة التي يجوز تخزينه فيها مؤقتاً. لهذا كان DNS سريعاً (فأغلب عمليات البحث لا تغادر المحلّل)، ولهذا أيضاً يستغرق تغيير سجلٍّ وقتاً حتى يصل إلى الجميع. وحتى جواب "هذا الاسم غير موجود" يُخزَّن مؤقتاً، لمدة تؤخذ من سجل SOA الخاص بالمنطقة (RFC 2308).

يستخدم DNS عادةً **منفذ UDP رقم 53**: سؤال صغير وجواب صغير. ويرجع إلى **منفذ TCP رقم 53** للاستجابات الكبيرة ونقل المناطق. وDNS التقليدي غير مشفّر وغير موثَّق، لذلك توجد إضافتان: **DNSSEC** (RFC 4033) يوقّع السجلات ليكتشف المحلّل الأجوبة المزوّرة، و**DNS over TLS** (المنفذ 853، RFC 7858) و**DNS over HTTPS** (RFC 8484) يخفيان استعلاماتك عمّن هم على مسار الشبكة.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: String.raw`# A toy DNS tree. Names and addresses come from ranges reserved for documentation
# (RFC 2606, RFC 5737), so nothing here points at a real machine.
SERVERS = {
    "a.root-servers.net": {"com.": ("referral", "a.gtld-servers.net")},
    "a.gtld-servers.net": {"example.com.": ("referral", "ns1.example.com")},
    "ns1.example.com": {"www.example.com.": ("answer", "192.0.2.10"),
                        "mail.example.com.": ("answer", "192.0.2.25")},
}
TTL = 300
cache = {}  # name -> (address, expires_at)


def ask(server, name):
    """The server answers from the most specific zone it knows about."""
    best = None
    for suffix, reply in SERVERS[server].items():
        if name == suffix or name.endswith("." + suffix):
            if best is None or len(suffix) > len(best[0]):
                best = (suffix, reply)
    return best[1] if best else ("nxdomain", None)


def resolve(name, now):
    if name in cache and cache[name][1] > now:
        print("  cache hit, expires in", cache[name][1] - now, "s ->", cache[name][0])
        return cache[name][0]
    server = "a.root-servers.net"  # every resolver starts from the root hints
    while True:
        kind, data = ask(server, name)
        print("  ask " + server.ljust(19) + " -> " + kind + (" " + data if data else ""))
        if kind == "referral":
            server = data
            continue
        if kind == "answer":
            cache[name] = (data, now + TTL)
        return data


for now, name in [(0, "www.example.com."), (60, "www.example.com."), (400, "www.example.com."), (400, "shop.example.com.")]:
    print("t=" + str(now) + "s resolve " + name)
    resolve(name, now)
`,
      explanation: {
        en: "The first lookup walks root, com and the authoritative server. Sixty seconds later the answer comes straight from the cache. At 400 s the TTL of 300 s has run out, so the resolver walks the tree again. The last name has no record at the authoritative server: that is NXDOMAIN. A real resolver also caches the referrals, so it would skip root and com and ask ns1.example.com directly. Try a TTL of 30 and watch the second lookup miss the cache.",
        ar: "البحث الأول يمر بالجذر ثم com ثم الخادم المخوَّل. وبعد ستين ثانية يأتي الجواب مباشرة من الذاكرة المؤقتة. وعند الثانية 400 تكون مدة TTL البالغة 300 ثانية قد انتهت، فيمشي المحلّل في الشجرة من جديد. أما الاسم الأخير فلا سجل له عند الخادم المخوَّل: وهذا هو NXDOMAIN. والمحلّل الحقيقي يخزّن الإحالات أيضاً، فكان سيتخطى الجذر وcom ويسأل ns1.example.com مباشرة. جرّب TTL قيمته 30 وشاهد البحث الثاني يفوّت الذاكرة المؤقتة.",
      },
    },
    {
      type: "text",
      body: {
        en: `## Record types and answers

A zone is a list of **resource records**: \`name  TTL  class  type  data\`. The types you will use most:

- **A**: an IPv4 address. **AAAA**: an IPv6 address (RFC 3596). A name can have several of each; clients pick one and try the others if it fails.
- **CNAME**: "this name is an alias of that one". The resolver restarts the lookup at the target. A name that has a CNAME must have no other records (RFC 1034), which is why the bare zone name (\`example.com\`) cannot be a CNAME.
- **MX**: mail servers for the domain, each with a preference number; lower is tried first.
- **NS**: the authoritative name servers of a zone (this is how delegation is written down).
- **TXT**: free text, used for things like SPF mail policy and proving domain ownership.
- **PTR**: reverse lookup, address to name, under \`in-addr.arpa\` and \`ip6.arpa\`.
- **SOA**: start of authority: the zone's serial number and timers.
- **CAA**: which certificate authorities may issue certificates for the domain (RFC 8659).

\`dig\` shows the whole answer. A typical session (the addresses are from documentation ranges):

\`\`\`text
$ dig www.example.com A
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 4721
;; QUESTION SECTION:
;www.example.com.            IN  A
;; ANSWER SECTION:
www.example.com.     300  IN  CNAME  web.example.net.
web.example.net.      60  IN  A      192.0.2.10
;; Query time: 23 msec
\`\`\`

Learn to read the **status**:

- **NOERROR** with records: success. **NOERROR with an empty answer** is called **NODATA**: the name exists but has no record of that type (for example a domain with MX records but no A record).
- **NXDOMAIN**: the name does not exist at all. Check for typos first.
- **SERVFAIL**: the resolver could not get a usable answer: the authoritative servers are unreachable, misconfigured, or DNSSEC validation failed.
- **REFUSED**: the server will not answer you, for example a resolver that only serves its own network.

Useful variants: \`dig +short name\` for just the data, \`dig @192.0.2.53 name\` to ask a specific server, \`dig +trace name\` to walk the tree yourself, and \`dig -x 192.0.2.10\` for reverse lookups.`,
        ar: `## أنواع السجلات والأجوبة

المنطقة (zone) قائمة من **سجلات الموارد (resource records)**: \`name  TTL  class  type  data\`. وأكثر الأنواع التي ستستخدمها:

- **A**: عنوان IPv4. و**AAAA**: عنوان IPv6 (RFC 3596). ويمكن أن يكون للاسم عدة سجلات من كل نوع؛ فيختار العميل واحداً ويجرّب الباقي إن فشل.
- **CNAME**: "هذا الاسم اسم مستعار لذلك الاسم". فيعيد المحلّل البحث من الاسم الهدف. والاسم الذي له CNAME يجب ألّا يكون له أي سجل آخر (RFC 1034)، ولهذا لا يمكن أن يكون اسم المنطقة المجرد (\`example.com\`) سجل CNAME.
- **MX**: خوادم البريد للنطاق، ولكل منها رقم أفضلية؛ والأصغر يُجرَّب أولاً.
- **NS**: خوادم الأسماء المخوَّلة بالمنطقة (وهكذا يُكتب التفويض).
- **TXT**: نص حر، يُستخدم لأمور مثل سياسة البريد SPF وإثبات ملكية النطاق.
- **PTR**: البحث العكسي، من العنوان إلى الاسم، تحت \`in-addr.arpa\` و\`ip6.arpa\`.
- **SOA**: بداية السلطة (start of authority): الرقم التسلسلي للمنطقة ومؤقّتاتها.
- **CAA**: جهات إصدار الشهادات المسموح لها بإصدار شهادات للنطاق (RFC 8659).

يعرض \`dig\` الجواب كاملاً. وهذه جلسة نموذجية (العناوين من نطاقات التوثيق):

\`\`\`text
$ dig www.example.com A
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 4721
;; QUESTION SECTION:
;www.example.com.            IN  A
;; ANSWER SECTION:
www.example.com.     300  IN  CNAME  web.example.net.
web.example.net.      60  IN  A      192.0.2.10
;; Query time: 23 msec
\`\`\`

تعلّم قراءة **الحالة (status)**:

- **NOERROR** مع سجلات: نجاح. و**NOERROR مع جواب فارغ** يسمى **NODATA**: الاسم موجود لكن لا سجل له من ذلك النوع (مثل نطاق له سجلات MX ولا سجل A له).
- **NXDOMAIN**: الاسم غير موجود أصلاً. ابحث عن الأخطاء الإملائية أولاً.
- **SERVFAIL**: لم يستطع المحلّل الحصول على جواب صالح: الخوادم المخوَّلة لا يمكن الوصول إليها أو إعدادها خاطئ، أو فشل التحقق بـ DNSSEC.
- **REFUSED**: الخادم يرفض أن يجيبك، مثل محلّل لا يخدم إلا شبكته.

صيغ مفيدة: \`dig +short name\` للبيانات وحدها، و\`dig @192.0.2.53 name\` لسؤال خادم بعينه، و\`dig +trace name\` لتمشي في الشجرة بنفسك، و\`dig -x 192.0.2.10\` للبحث العكسي.`,
      },
    },
    {
      type: "lab",
      id: "dns-lookup",
      lang: "python",
      prompt: {
        en: `Write the answering logic of a small **DNS server** that follows **CNAME** aliases.

**Input:** the first line is \`N\`, the number of records. The next N lines are records \`<name> <TYPE> <value>\` (the value is the rest of the line, so an MX value such as \`10 mail.example.com\` keeps its space). Every following non-blank line is a query \`<name> <TYPE>\`.

**Rules**

- Names are **case-insensitive** and a trailing dot is ignored: \`WWW.Example.COM.\` is \`www.example.com\`. Print names in lower case without the trailing dot. Print values exactly as given.
- If the name has records of the asked type, the answer is all their values in input order, joined with \`, \`. (A query for type \`CNAME\` therefore returns the alias itself.)
- Otherwise, if the name has a CNAME, continue with its target and remember it in the chain.
- Otherwise, if the name has no records at all, the answer is \`NXDOMAIN\`; if it has records of other types only, the answer is \`NODATA\`.
- If the chain comes back to a name already visited, the answer is \`SERVFAIL (cname loop)\` (and no chain is printed).

**Output**, one line per query: \`<name> <TYPE>: <answer>\`, followed by \` (via <target1> -> <target2> ...)\` when at least one CNAME was followed.

**Example**

\`\`\`text
Input:
3
shop.example.com CNAME edge.example.net
edge.example.net A 198.51.100.7
example.com MX 10 mail.example.com
shop.example.com A
example.com A
nope.example.com A

Output:
shop.example.com A: 198.51.100.7 (via edge.example.net)
example.com A: NODATA
nope.example.com A: NXDOMAIN
\`\`\``,
        ar: `اكتب منطق الإجابة في **خادم DNS** صغير يتتبع الأسماء المستعارة **CNAME**.

**الإدخال:** السطر الأول هو \`N\`، أي عدد السجلات. والأسطر الـ N التالية سجلات \`<name> <TYPE> <value>\` (القيمة هي بقية السطر، فقيمة MX مثل \`10 mail.example.com\` تحتفظ بمسافتها). وكل سطر غير فارغ بعدها استعلام \`<name> <TYPE>\`.

**القواعد**

- الأسماء **لا تميّز حالة الأحرف**، والنقطة في آخرها تُتجاهل: \`WWW.Example.COM.\` هو \`www.example.com\`. اطبع الأسماء بأحرف صغيرة دون النقطة الأخيرة. واطبع القيم كما وردت تماماً.
- إذا كان للاسم سجلات من النوع المطلوب، فالجواب هو كل قيمها بترتيب الإدخال، مفصولة بـ \`, \`. (ولذلك يعيد الاستعلام عن النوع \`CNAME\` الاسم المستعار نفسه.)
- وإلا، فإذا كان للاسم سجل CNAME، تابع بالاسم الهدف وأضفه إلى السلسلة.
- وإلا، فإذا لم يكن للاسم أي سجل على الإطلاق فالجواب \`NXDOMAIN\`؛ وإن كانت له سجلات من أنواع أخرى فقط فالجواب \`NODATA\`.
- إذا عادت السلسلة إلى اسم سبقت زيارته، فالجواب \`SERVFAIL (cname loop)\` (ولا تُطبع السلسلة).

**الإخراج**، سطر لكل استعلام: \`<name> <TYPE>: <answer>\`، يتبعه \` (via <target1> -> <target2> ...)\` إذا تُتُبِّع سجل CNAME واحد على الأقل.

**مثال**

\`\`\`text
الإدخال:
3
shop.example.com CNAME edge.example.net
edge.example.net A 198.51.100.7
example.com MX 10 mail.example.com
shop.example.com A
example.com A
nope.example.com A

الإخراج:
shop.example.com A: 198.51.100.7 (via edge.example.net)
example.com A: NODATA
nope.example.com A: NXDOMAIN
\`\`\``,
      },
      starterCode: String.raw`import sys

lines = sys.stdin.read().split("\n")
count = int(lines[0]) if lines and lines[0].strip() else 0

# name -> list of (TYPE, value), in input order. Names are case-insensitive; a trailing dot is dropped.
records = {}
for line in lines[1:1 + count]:
    name, rtype, value = line.split(None, 2)
    records.setdefault(name.lower().rstrip("."), []).append((rtype.upper(), value.strip()))


def lookup(name, qtype):
    """Returns (result, chain): chain lists the CNAME targets that were followed."""
    chain = []
    rrset = records.get(name)
    if rrset is None:
        return "NXDOMAIN", chain
    values = [v for t, v in rrset if t == qtype]
    if values:
        return ", ".join(values), chain
    # TODO: if the name has a CNAME, continue the lookup at its target (in a loop) and add
    # the target to 'chain'. Return "SERVFAIL (cname loop)" when a name comes back.
    # TODO: a name that exists but has no record of this type is "NODATA", not "NXDOMAIN".
    return "NXDOMAIN", chain


for line in lines[1 + count:]:
    if not line.strip():
        continue
    qname, qtype = line.split()
    qname, qtype = qname.lower().rstrip("."), qtype.upper()
    result, chain = lookup(qname, qtype)
    out = qname + " " + qtype + ": " + result
    if chain:
        out += " (via " + " -> ".join(chain) + ")"
    print(out)
`,
      solution: String.raw`import sys

lines = sys.stdin.read().split("\n")
count = int(lines[0]) if lines and lines[0].strip() else 0

# name -> list of (TYPE, value), in input order. Names are case-insensitive; a trailing dot is dropped.
records = {}
for line in lines[1:1 + count]:
    name, rtype, value = line.split(None, 2)
    records.setdefault(name.lower().rstrip("."), []).append((rtype.upper(), value.strip()))


def lookup(name, qtype):
    """Returns (result, chain): chain lists the CNAME targets that were followed."""
    chain = []
    seen = {name}
    while True:
        rrset = records.get(name)
        if rrset is None:
            return "NXDOMAIN", chain          # the name does not exist at all
        values = [v for t, v in rrset if t == qtype]
        if values:
            return ", ".join(values), chain   # a CNAME query stops here and returns the alias itself
        aliases = [v for t, v in rrset if t == "CNAME"]
        if not aliases:
            return "NODATA", chain            # the name exists, but has no record of this type
        name = aliases[0].lower().rstrip(".")
        if name in seen:
            return "SERVFAIL (cname loop)", []
        seen.add(name)
        chain.append(name)


for line in lines[1 + count:]:
    if not line.strip():
        continue
    qname, qtype = line.split()
    qname, qtype = qname.lower().rstrip("."), qtype.upper()
    result, chain = lookup(qname, qtype)
    out = qname + " " + qtype + ": " + result
    if chain:
        out += " (via " + " -> ".join(chain) + ")"
    print(out)
`,
      hints: [
        { en: "Turn the body of `lookup` into a `while True:` loop. Each turn looks at the records of the current `name`: an exact type match ends the loop, a CNAME moves `name` to the target and appends it to `chain`.", ar: "حوّل جسم الدالة `lookup` إلى حلقة `while True:`. كل دورة تنظر في سجلات `name` الحالي: تطابق النوع ينهي الحلقة، وسجل CNAME ينقل `name` إلى الهدف ويضيفه إلى `chain`." },
        { en: "Keep a set `seen` of every name you have visited, starting with the query name. Normalise each CNAME target with `.lower().rstrip(\".\")` before you look it up or compare it.", ar: "احتفظ بمجموعة `seen` لكل اسم زرته، تبدأ باسم الاستعلام. ووحّد كل هدف CNAME بـ `.lower().rstrip(\".\")` قبل أن تبحث عنه أو تقارنه." },
        { en: "`records.get(name)` is `None` only when the name has no records at all (NXDOMAIN). If it returns a list without the asked type and without a CNAME, the answer is NODATA.", ar: "تكون `records.get(name)` مساوية لـ `None` فقط حين لا يكون للاسم أي سجل (NXDOMAIN). وإذا أعادت قائمة ليس فيها النوع المطلوب ولا CNAME فالجواب NODATA." },
      ],
      tests: [
        {
          name: { en: "Direct answers, several values in input order", ar: "أجوبة مباشرة، وعدة قيم بترتيب الإدخال" },
          stdin: "5\nwww.example.com A 192.0.2.10\nwww.example.com A 192.0.2.11\nwww.example.com AAAA 2001:db8::10\nexample.com MX 10 mail.example.com\nexample.com MX 20 backup.example.net\nwww.example.com A\nwww.example.com AAAA\nexample.com MX\n",
          expected: "www.example.com A: 192.0.2.10, 192.0.2.11\nwww.example.com AAAA: 2001:db8::10\nexample.com MX: 10 mail.example.com, 20 backup.example.net\n",
        },
        {
          name: { en: "A two-step CNAME chain; a CNAME query returns the alias itself", ar: "سلسلة CNAME من خطوتين؛ واستعلام CNAME يعيد الاسم المستعار نفسه" },
          stdin: "4\nshop.example.com CNAME shop.cdn.example.net\nshop.cdn.example.net CNAME edge7.cdn.example.net\nedge7.cdn.example.net A 198.51.100.7\nedge7.cdn.example.net AAAA 2001:db8:7::1\nshop.example.com A\nshop.example.com AAAA\nshop.example.com CNAME\nshop.cdn.example.net A\n",
          expected: "shop.example.com A: 198.51.100.7 (via shop.cdn.example.net -> edge7.cdn.example.net)\nshop.example.com AAAA: 2001:db8:7::1 (via shop.cdn.example.net -> edge7.cdn.example.net)\nshop.example.com CNAME: shop.cdn.example.net\nshop.cdn.example.net A: 198.51.100.7 (via edge7.cdn.example.net)\n",
        },
        {
          name: { en: "NODATA versus NXDOMAIN, also at the end of a chain", ar: "الفرق بين NODATA وNXDOMAIN، حتى في نهاية سلسلة" },
          stdin: "3\nexample.com MX 10 mail.example.com\nexample.com TXT v=spf1 -all\nold.example.com CNAME gone.example.net\nexample.com A\nexample.com TXT\nnope.example.com A\nold.example.com A\n",
          expected: "example.com A: NODATA\nexample.com TXT: v=spf1 -all\nnope.example.com A: NXDOMAIN\nold.example.com A: NXDOMAIN (via gone.example.net)\n",
        },
        {
          name: { en: "Names ignore case and a trailing dot", ar: "الأسماء لا تتأثر بحالة الأحرف ولا بالنقطة الأخيرة" },
          stdin: "2\nWWW.Example.COM. A 192.0.2.80\napi.example.com CNAME www.example.com.\nwww.EXAMPLE.com A\napi.example.com. A\n",
          expected: "www.example.com A: 192.0.2.80\napi.example.com A: 192.0.2.80 (via www.example.com)\n",
        },
        {
          name: { en: "A CNAME loop is a SERVFAIL", ar: "حلقة CNAME تعني SERVFAIL" },
          stdin: "3\na.example.com CNAME b.example.com\nb.example.com CNAME c.example.com\nc.example.com CNAME a.example.com\na.example.com A\nc.example.com MX\nc.example.com CNAME\n",
          expected: "a.example.com A: SERVFAIL (cname loop)\nc.example.com MX: SERVFAIL (cname loop)\nc.example.com CNAME: a.example.com\n",
        },
        {
          name: { en: "Empty zone: every name is NXDOMAIN", ar: "منطقة فارغة: كل اسم NXDOMAIN" },
          stdin: "0\nwww.example.com A\nexample.com NS\n",
          expected: "www.example.com A: NXDOMAIN\nexample.com NS: NXDOMAIN\n",
        },
      ],
      sampleInput: "3\nshop.example.com CNAME edge.example.net\nedge.example.net A 198.51.100.7\nexample.com MX 10 mail.example.com\nshop.example.com A\nexample.com A\nnope.example.com A\n",
    },
    {
      type: "text",
      body: {
        en: `## HTTP: a conversation in plain text

**HTTP** is the request/response protocol of the web. Its meaning (methods, status codes, headers) is defined once in RFC 9110 and carried by three wire formats: **HTTP/1.1** (RFC 9112, text over TCP), **HTTP/2** (RFC 9113, binary frames over one TCP connection) and **HTTP/3** (RFC 9114, over QUIC on UDP). HTTP/1.1 is the easiest to read, so we start there. Every line ends with **CRLF** (\`\\r\\n\`), and an **empty line** ends the headers:

\`\`\`text
GET /docs/ HTTP/1.1                    <- request line: method, target, version
Host: www.example.com                  <- required in HTTP/1.1
User-Agent: curl/8.5.0
Accept: text/html
                                       <- empty line: end of the headers

HTTP/1.1 200 OK                        <- status line: version, status code, reason
Content-Type: text/html; charset=utf-8
Content-Length: 1256                   <- the body is exactly 1256 bytes
Cache-Control: max-age=3600
                                       <- empty line
<!doctype html> ...                    <- the body
\`\`\`

**Methods** say what you want: \`GET\` reads, \`HEAD\` reads only the headers, \`POST\` submits data, \`PUT\` replaces, \`PATCH\` modifies, \`DELETE\` removes. \`GET\` and \`HEAD\` are **safe** (they must not change anything), and \`PUT\` and \`DELETE\` are **idempotent** (repeating them has the same effect as doing them once), which is why a client may retry them.

**Status codes** are grouped by their first digit:

- **1xx informational**: for example \`101 Switching Protocols\` when a connection upgrades to WebSocket.
- **2xx success**: \`200 OK\`, \`201 Created\`, \`204 No Content\`.
- **3xx redirection**: \`301 Moved Permanently\`, \`302 Found\`, \`304 Not Modified\` (your cached copy is still good), \`307\` and \`308\`. The new address is in the \`Location\` header.
- **4xx client error**: \`400 Bad Request\`, \`401 Unauthorized\` (you are not logged in), \`403 Forbidden\` (you are logged in but not allowed), \`404 Not Found\`, \`429 Too Many Requests\`.
- **5xx server error**: \`500 Internal Server Error\`, \`502 Bad Gateway\` and \`504 Gateway Timeout\` (a proxy could not get a good answer from the server behind it), \`503 Service Unavailable\`.

**Headers** are \`Name: value\` lines, and their names are **case-insensitive**: \`content-length\` and \`Content-Length\` are the same field. The reason phrase after the code is informational only; programs must decide by the number. How long is the body? \`Content-Length\` gives its size in **bytes** (not characters: an Arabic letter is two bytes in UTF-8); \`Transfer-Encoding: chunked\` sends it in pieces; with neither, the body ends when the server closes the connection. Responses to \`HEAD\`, and \`1xx\`, \`204\` and \`304\` responses never have a body. Getting this framing wrong is dangerous: when a proxy and a server disagree about where a message ends, an attacker can hide a second request inside the first (**request smuggling**), which is why a message with two different \`Content-Length\` values must be rejected.

HTTP itself is **stateless**: each request stands alone. Logins and shopping carts work because the server sets a **cookie** (\`Set-Cookie\`) and the browser sends it back (\`Cookie\`) with every later request.`,
        ar: `## HTTP: حوار بنص عادي

**HTTP** هو بروتوكول الطلب والاستجابة في الويب. ومعناه (الطرائق ورموز الحالة والترويسات) معرَّف مرة واحدة في RFC 9110، وتحمله ثلاث صيغ على الشبكة: **HTTP/1.1** (RFC 9112، نص فوق TCP)، و**HTTP/2** (RFC 9113، إطارات ثنائية فوق اتصال TCP واحد)، و**HTTP/3** (RFC 9114، فوق QUIC على UDP). وHTTP/1.1 أسهلها قراءة، فنبدأ به. كل سطر ينتهي بـ **CRLF** (\`\\r\\n\`)، و**السطر الفارغ** ينهي الترويسات:

\`\`\`text
GET /docs/ HTTP/1.1                    <- سطر الطلب: الطريقة والهدف والإصدار
Host: www.example.com                  <- إلزامية في HTTP/1.1
User-Agent: curl/8.5.0
Accept: text/html
                                       <- سطر فارغ: نهاية الترويسات

HTTP/1.1 200 OK                        <- سطر الحالة: الإصدار ورمز الحالة والعبارة
Content-Type: text/html; charset=utf-8
Content-Length: 1256                   <- جسم الرسالة 1256 بايتاً بالضبط
Cache-Control: max-age=3600
                                       <- سطر فارغ
<!doctype html> ...                    <- جسم الرسالة
\`\`\`

**الطرائق (methods)** تقول ماذا تريد: \`GET\` يقرأ، و\`HEAD\` يقرأ الترويسات فقط، و\`POST\` يرسل بيانات، و\`PUT\` يستبدل، و\`PATCH\` يعدّل، و\`DELETE\` يحذف. والطريقتان \`GET\` و\`HEAD\` **آمنتان (safe)** (يجب ألّا تغيّرا شيئاً)، و\`PUT\` و\`DELETE\` **متساويتا الأثر (idempotent)** (تكرارهما له أثر تنفيذهما مرة واحدة نفسه)، ولهذا يجوز للعميل أن يعيد محاولتهما.

**رموز الحالة** مجمّعة بحسب رقمها الأول:

- **1xx معلوماتية**: مثل \`101 Switching Protocols\` حين يتحول الاتصال إلى WebSocket.
- **2xx نجاح**: \`200 OK\` و\`201 Created\` و\`204 No Content\`.
- **3xx إعادة توجيه**: \`301 Moved Permanently\` و\`302 Found\` و\`304 Not Modified\` (نسختك المخزّنة ما زالت صالحة) و\`307\` و\`308\`. والعنوان الجديد في الترويسة \`Location\`.
- **4xx خطأ من العميل**: \`400 Bad Request\` و\`401 Unauthorized\` (لم تسجّل الدخول) و\`403 Forbidden\` (سجّلت الدخول لكنك غير مسموح لك) و\`404 Not Found\` و\`429 Too Many Requests\`.
- **5xx خطأ من الخادم**: \`500 Internal Server Error\`، و\`502 Bad Gateway\` و\`504 Gateway Timeout\` (لم يحصل وسيط على جواب سليم من الخادم الذي خلفه)، و\`503 Service Unavailable\`.

**الترويسات** أسطر \`Name: value\`، وأسماؤها **لا تميّز حالة الأحرف**: \`content-length\` و\`Content-Length\` حقل واحد. والعبارة التي تلي الرمز للعلم فقط؛ وعلى البرامج أن تقرّر بحسب الرقم. وما طول جسم الرسالة؟ \`Content-Length\` يعطي حجمه **بالبايتات** (لا بالمحارف: الحرف العربي بايتان في UTF-8)؛ و\`Transfer-Encoding: chunked\` يرسله على قطع؛ ومن دونهما ينتهي الجسم حين يغلق الخادم الاتصال. واستجابات \`HEAD\`، والاستجابات \`1xx\` و\`204\` و\`304\` لا جسم لها أبداً. والخطأ في هذا التأطير خطير: فحين يختلف وسيط وخادم على موضع نهاية الرسالة يستطيع المهاجم أن يخفي طلباً ثانياً داخل الأول (**تهريب الطلبات / request smuggling**)، ولهذا يجب رفض الرسالة التي تحمل قيمتين مختلفتين لـ \`Content-Length\`.

وHTTP بحد ذاته **عديم الحالة (stateless)**: كل طلب قائم بذاته. وتعمل عمليات تسجيل الدخول وسلال التسوق لأن الخادم يضع **ملف تعريف ارتباط (cookie)** عبر \`Set-Cookie\`، فيعيده المتصفح (\`Cookie\`) مع كل طلب لاحق.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: String.raw`// HTTP/1.1 is text: build a request exactly as it travels, CRLF line endings included.
const CRLF = "\r\n";
const request = ["GET /docs/ HTTP/1.1", "Host: www.example.com", "Accept: text/html", "", ""].join(CRLF);
console.log("request bytes:", request.length);
console.log(JSON.stringify(request));

// A response the server might send back, parsed the way a client does it.
const response = "HTTP/1.1 301 Moved Permanently\r\nLOCATION: /docs/start/\r\ncontent-length: 0\r\n\r\n";
const head = response.split("\r\n\r\n")[0].split("\r\n");
const statusLine = head[0].split(" ");
const headers = {};
head.slice(1).forEach(function (line) {
  const colon = line.indexOf(":");
  headers[line.slice(0, colon).toLowerCase()] = line.slice(colon + 1).trim(); // names are case-insensitive
});

const classes = { 1: "informational", 2: "success", 3: "redirection", 4: "client error", 5: "server error" };
const code = statusLine[1];
console.log("version " + statusLine[0] + ", status " + code + " -> " + classes[code[0]]);
console.log("follow the redirect to:", headers["location"]);
console.log("body length:", headers["content-length"], "bytes");
console.log("'مرحبا' is", "مرحبا".length, "characters but", new TextEncoder().encode("مرحبا").length, "bytes in UTF-8");
`,
      explanation: {
        en: "The JSON form shows the invisible `\\r\\n` pairs and the empty line that ends the request. The parser lowercases header names, so `LOCATION` and `Location` are found the same way, and it decides by the number 301, not by the words after it. The last line is why `Content-Length` must count bytes. Change the status to `404 Not Found` and run it again.",
        ar: "تُظهر صيغة JSON أزواج `\\r\\n` غير المرئية والسطر الفارغ الذي ينهي الطلب. ويحوّل المحلّل أسماء الترويسات إلى أحرف صغيرة، فيُعثر على `LOCATION` و`Location` بالطريقة نفسها، ويقرّر بحسب الرقم 301 لا بالكلمات التي بعده. والسطر الأخير يوضح لماذا يجب أن يَعُدّ `Content-Length` البايتات. غيّر الحالة إلى `404 Not Found` وشغّل المثال من جديد.",
      },
    },
    {
      type: "lab",
      id: "http-response",
      lang: "javascript",
      prompt: {
        en: `Write the first thing every HTTP client does: **parse a raw HTTP/1.1 response** read from stdin.

The header block ends at the first empty line; everything after that line is the body, exactly as it arrived. Lines end with \`\\n\`, possibly preceded by \`\\r\` (remove the \`\\r\`). The starter already splits the input into \`head\` (the header lines) and \`body\`.

**Rules**

- The status line must look like \`HTTP/<digit>.<digit> <3-digit code>\`, optionally followed by a space and a reason phrase. The first digit of the code must be 1 to 5. Otherwise print only \`error: bad status line\`.
- Class names: 1 \`informational\`, 2 \`success\`, 3 \`redirection\`, 4 \`client error\`, 5 \`server error\`. Ignore the reason phrase.
- Header names are case-insensitive; values are trimmed. If a header repeats, the first one counts.
- The body: \`none\` for 1xx, 204 and 304 responses. Otherwise, with a \`Content-Length\` of L: if at least L **bytes** (UTF-8) arrived, \`<L> bytes\`; if fewer, \`incomplete (<got>/<L> bytes)\`. Without Content-Length: \`<got> bytes (until close)\`.

**Output**

\`\`\`text
status=<code> class=<class>
headers=<number of header lines>
content-type=<value, or none>
location=<value>            (only when there is a Location header)
body=<description>
\`\`\`

**Example**

\`\`\`text
Input:
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 12

<p>Hello</p>

Output:
status=200 class=success
headers=2
content-type=text/html
body=12 bytes
\`\`\``,
        ar: `اكتب أول ما يفعله كل عميل HTTP: **حلّل استجابة HTTP/1.1 خاماً** تُقرأ من الإدخال القياسي.

كتلة الترويسات تنتهي عند أول سطر فارغ؛ وكل ما بعد ذلك السطر هو جسم الرسالة كما وصل تماماً. والأسطر تنتهي بـ \`\\n\`، وقد يسبقه \`\\r\` (احذف \`\\r\`). والمسودة تقسّم الإدخال أصلاً إلى \`head\` (أسطر الترويسات) و\`body\`.

**القواعد**

- يجب أن يكون سطر الحالة على شكل \`HTTP/<رقم>.<رقم> <رمز من 3 أرقام>\`، وقد تتبعه مسافة وعبارة. ويجب أن يكون الرقم الأول من الرمز بين 1 و5. وإلا فاطبع \`error: bad status line\` وحده.
- أسماء الفئات: 1 \`informational\`، و2 \`success\`، و3 \`redirection\`، و4 \`client error\`، و5 \`server error\`. وتجاهل العبارة.
- أسماء الترويسات لا تميّز حالة الأحرف؛ وتُقص المسافات من القيم. وإذا تكررت ترويسة فالأولى هي المعتمدة.
- جسم الرسالة: \`none\` للاستجابات 1xx و204 و304. وإلا، فمع \`Content-Length\` قيمته L: إذا وصل L **بايتاً** على الأقل (بترميز UTF-8) فاطبع \`<L> bytes\`؛ وإن وصل أقل فاطبع \`incomplete (<got>/<L> bytes)\`. ومن دون Content-Length اطبع: \`<got> bytes (until close)\`.

**الإخراج**

\`\`\`text
status=<code> class=<class>
headers=<عدد أسطر الترويسات>
content-type=<القيمة، أو none>
location=<القيمة>            (فقط حين توجد ترويسة Location)
body=<الوصف>
\`\`\`

**مثال**

\`\`\`text
الإدخال:
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 12

<p>Hello</p>

الإخراج:
status=200 class=success
headers=2
content-type=text/html
body=12 bytes
\`\`\``,
      },
      starterCode: String.raw`const raw = require("fs").readFileSync(0, "utf8");

const CLASSES = { 1: "informational", 2: "success", 3: "redirection", 4: "client error", 5: "server error" };

// Split the message into header lines and the body: the header block ends at the first empty line.
// Lines may end with "\r\n" (real HTTP) or "\n"; the body is kept exactly as it arrived.
const head = [];
let pos = 0;
let body = "";
while (pos < raw.length) {
  let nl = raw.indexOf("\n", pos);
  if (nl === -1) nl = raw.length;
  const line = raw.slice(pos, nl).replace(/\r$/, "");
  pos = nl + 1;
  if (line === "") {
    body = raw.slice(pos);
    break;
  }
  head.push(line);
}

function main() {
  // TODO: check the status line with a regular expression; print "error: bad status line" and stop if it is wrong.
  const code = Number((head[0] || "").split(" ")[1]);
  console.log("status=" + code + " class=" + CLASSES[String(code)[0]]);

  // TODO: collect the headers into an object keyed by the lower-cased name (first occurrence wins),
  // then print headers=, content-type= and (only if present) location=.

  // TODO: describe the body. Content-Length counts BYTES: use Buffer.byteLength(body, "utf8").
  console.log("body=" + body.length + " bytes");
}

main();
`,
      solution: String.raw`const raw = require("fs").readFileSync(0, "utf8");

const CLASSES = { 1: "informational", 2: "success", 3: "redirection", 4: "client error", 5: "server error" };

// Split the message into header lines and the body: the header block ends at the first empty line.
// Lines may end with "\r\n" (real HTTP) or "\n"; the body is kept exactly as it arrived.
const head = [];
let pos = 0;
let body = "";
while (pos < raw.length) {
  let nl = raw.indexOf("\n", pos);
  if (nl === -1) nl = raw.length;
  const line = raw.slice(pos, nl).replace(/\r$/, "");
  pos = nl + 1;
  if (line === "") {
    body = raw.slice(pos);
    break;
  }
  head.push(line);
}

function main() {
  const m = /^HTTP\/\d\.\d (\d{3})(?: .*)?$/.exec(head[0] || "");
  if (!m || !CLASSES[m[1][0]]) {
    console.log("error: bad status line");
    return;
  }
  const code = Number(m[1]);
  console.log("status=" + code + " class=" + CLASSES[m[1][0]]);

  // Field names are case-insensitive: store them in lower case. The first occurrence wins here.
  const fields = {};
  for (const line of head.slice(1)) {
    const colon = line.indexOf(":");
    if (colon <= 0) continue;
    const name = line.slice(0, colon).toLowerCase();
    if (!(name in fields)) fields[name] = line.slice(colon + 1).trim();
  }
  console.log("headers=" + (head.length - 1));
  console.log("content-type=" + (fields["content-type"] || "none"));
  if ("location" in fields) console.log("location=" + fields["location"]);

  if (code < 200 || code === 204 || code === 304) {
    console.log("body=none");
  } else if ("content-length" in fields) {
    const want = Number(fields["content-length"]);
    const got = Buffer.byteLength(body, "utf8"); // Content-Length counts bytes, not characters
    console.log(got >= want ? "body=" + want + " bytes" : "body=incomplete (" + got + "/" + want + " bytes)");
  } else {
    console.log("body=" + Buffer.byteLength(body, "utf8") + " bytes (until close)");
  }
}

main();
`,
      hints: [
        { en: "`/^HTTP\\/\\d\\.\\d (\\d{3})(?: .*)?$/` matches a valid status line and captures the code. Check `CLASSES[code[0]]` too, so `600` is rejected.", ar: "التعبير `/^HTTP\\/\\d\\.\\d (\\d{3})(?: .*)?$/` يطابق سطر حالة صالحاً ويلتقط الرمز. وافحص `CLASSES[code[0]]` أيضاً حتى يُرفض `600`." },
        { en: "For each header line, split at the first `:` with `indexOf`. Lower-case the name, trim the value, and only store it if the name is not there yet.", ar: "قسّم كل سطر ترويسة عند أول `:` باستخدام `indexOf`. حوّل الاسم إلى أحرف صغيرة، وقُص المسافات من القيمة، ولا تخزّنها إلا إذا لم يكن الاسم موجوداً بعد." },
        { en: "Order the body rules: first `code < 200 || code === 204 || code === 304` gives `none`; then Content-Length (compare it with `Buffer.byteLength(body, \"utf8\")`); otherwise `(until close)`.", ar: "رتّب قواعد الجسم: أولاً `code < 200 || code === 204 || code === 304` تعطي `none`؛ ثم Content-Length (قارنه بـ `Buffer.byteLength(body, \"utf8\")`)؛ وإلا `(until close)`." },
      ],
      tests: [
        {
          name: { en: "The worked example", ar: "المثال المحلول" },
          stdin: "HTTP/1.1 200 OK\nContent-Type: text/html\nContent-Length: 12\n\n<p>Hello</p>\n",
          expected: "status=200 class=success\nheaders=2\ncontent-type=text/html\nbody=12 bytes\n",
        },
        {
          name: { en: "A redirect with CRLF line endings, odd capitals and extra spaces", ar: "إعادة توجيه بنهايات أسطر CRLF وأحرف كبيرة غريبة ومسافات زائدة" },
          stdin: "HTTP/1.1 301 Moved Permanently\r\nLOCATION:   /new-home  \r\ncontent-LENGTH: 0\r\nServer: demo\r\n\r\n",
          expected: "status=301 class=redirection\nheaders=3\ncontent-type=none\nlocation=/new-home\nbody=0 bytes\n",
        },
        {
          name: { en: "304 Not Modified never has a body, whatever Content-Length says", ar: "الاستجابة 304 Not Modified لا جسم لها أبداً مهما قال Content-Length" },
          stdin: "HTTP/1.1 304 Not Modified\nETag: \"v2\"\nContent-Length: 1234\nCache-Control: max-age=60\n\n",
          expected: "status=304 class=redirection\nheaders=3\ncontent-type=none\nbody=none\n",
        },
        {
          name: { en: "Content-Length counts bytes: 5 Arabic letters are 10 bytes, so 12 is incomplete", ar: "يَعُدّ Content-Length البايتات: 5 أحرف عربية تساوي 10 بايتات، فالقيمة 12 ناقصة" },
          stdin: "HTTP/1.1 200 OK\nContent-Type: text/plain; charset=utf-8\nContent-Length: 12\n\nمرحبا",
          expected: "status=200 class=success\nheaders=2\ncontent-type=text/plain; charset=utf-8\nbody=incomplete (10/12 bytes)\n",
        },
        {
          name: { en: "No Content-Length: the body runs until the connection closes", ar: "بلا Content-Length: يمتد الجسم حتى يُغلق الاتصال" },
          stdin: "HTTP/1.0 500 Internal Server Error\nContent-Type: text/plain\n\nsomething broke\n",
          expected: "status=500 class=server error\nheaders=1\ncontent-type=text/plain\nbody=16 bytes (until close)\n",
        },
        {
          name: { en: "An invalid status line is an error", ar: "سطر الحالة غير الصالح خطأ" },
          stdin: "HTP/1.1 200 OK\nContent-Length: 0\n\n",
          expected: "error: bad status line\n",
        },
      ],
      sampleInput: "HTTP/1.1 200 OK\nContent-Type: text/html\nContent-Length: 12\n\n<p>Hello</p>\n",
    },
    {
      type: "text",
      body: {
        en: `## TLS: who are you, and can anyone listen?

Plain HTTP crosses every router, Wi-Fi access point and proxy in clear text: anyone on the path can read it or change it. **TLS** (Transport Layer Security) fixes three things at once: **confidentiality** (nobody can read the data), **integrity** (nobody can change it unnoticed) and **authentication** (you are talking to the real \`www.example.com\`, not an impostor). **HTTPS** is simply HTTP inside TLS, on port 443. The current version is **TLS 1.3** (RFC 8446); TLS 1.2 (RFC 5246) is still common, while TLS 1.0 and 1.1 are deprecated (RFC 8996), SSL even longer ago, and all of them should be switched off.

### The TLS 1.3 handshake

After the TCP handshake, client and server need **one round trip** to set up TLS 1.3:

\`\`\`text
Client                                              Server
ClientHello                                -------->
  supported versions, cipher suites,
  key_share (client's public DH key),
  server_name = www.example.com (SNI)
                                           <--------  ServerHello
                                                        key_share (server's public DH key)
                                                      {EncryptedExtensions}
                                                      {Certificate}
                                                      {CertificateVerify}
                                                      {Finished}
{Finished}                                 -------->
[GET /docs/ HTTP/1.1 ...]                  <------->  [HTTP/1.1 200 OK ...]

{ } encrypted with handshake keys     [ ] encrypted with application keys
\`\`\`

1. Both sides send a fresh **ephemeral Diffie-Hellman** public key (\`key_share\`, typically X25519). From the two, each side computes the same secret without it ever crossing the wire. Because the keys are thrown away afterwards, recording the traffic and stealing the server's private key later still does not decrypt it: this is **forward secrecy**.
2. The server sends its **certificate** and a **CertificateVerify**: a signature over the handshake made with the private key that belongs to the certificate. Only the real owner of that key can produce it.
3. Both send **Finished**, a MAC over the whole handshake, so any tampering with the earlier messages is detected.
4. Application data is protected with an **AEAD** cipher (AES-GCM or ChaCha20-Poly1305), which encrypts and authenticates every record.

One detail matters for privacy: the **SNI** (the host name) is sent in the ClientHello before encryption starts, so an observer can see *which site* you visit, though not which pages. An extension called Encrypted Client Hello (ECH) is designed to hide it.

### Certificates and the chain of trust

A **certificate** (X.509, RFC 5280) binds a public key to names. Its key fields are the **subject**, the **issuer** (who signed it), the validity period (**notBefore** and **notAfter**), the public key, and the **Subject Alternative Name** (SAN) list of DNS names it is valid for. A **certificate authority** (CA) signs it. Your operating system or browser ships a **trust store** of root CA certificates. Servers send their own (**leaf**) certificate plus the **intermediate** certificates, and the client builds the chain:

\`\`\`text
www.example.com          issuer: Example Issuing CA 1      (leaf, sent by the server)
  ^ signed by
Example Issuing CA 1     issuer: Example Root CA           (intermediate, sent by the server)
  ^ signed by
Example Root CA          self-signed                       (root, already in the trust store)
\`\`\`

The client accepts the server only if **all** of these hold:

- Every signature in the chain verifies, and every certificate that signs another one is marked as a **CA**.
- The chain ends at a root in the trust store.
- Today's date is inside every certificate's validity period.
- The host name matches one of the leaf's **SAN** entries. Matching ignores case, and a **wildcard** such as \`*.example.com\` stands for exactly **one whole label** on the left: it matches \`api.example.com\` but not \`example.com\` or \`a.b.example.com\` (RFC 9525). Browsers no longer look at the old Common Name field.
- The certificate has not been revoked (checked with OCSP or CRLs, or with the browser's own revocation lists).

Public certificates are deliberately short-lived. The CA/Browser Forum is cutting their maximum lifetime in steps, from 398 days to 200 days in March 2026 and down to 47 days by 2029, so renewal must be automatic, usually with the **ACME** protocol (RFC 8555) used by CAs such as Let's Encrypt. The classic outage is still "the certificate expired on Sunday". The \`openssl s_client -connect www.example.com:443 -servername www.example.com\` command prints the chain a server sends, and \`curl -v\` shows the handshake and any validation error.`,
        ar: `## TLS: من أنت، وهل يستطيع أحد أن يتنصّت؟

يعبر HTTP العادي كل راوتر ونقطة وصول Wi-Fi ووسيط بنص واضح: يستطيع أي أحد على المسار أن يقرأه أو يغيّره. ويعالج **TLS** (أمن طبقة النقل) ثلاثة أمور في آن واحد: **السرية** (لا يستطيع أحد قراءة البيانات)، و**السلامة** (لا يستطيع أحد تغييرها دون أن يُكتشف)، و**التوثيق** (أنت تتحدث مع \`www.example.com\` الحقيقي لا مع منتحل). و**HTTPS** ببساطة هو HTTP داخل TLS على المنفذ 443. والإصدار الحالي هو **TLS 1.3** (RFC 8446)؛ وما زال TLS 1.2 (RFC 5246) شائعاً، أما TLS 1.0 و1.1 فمُهملان (RFC 8996)، وSSL أُهمل قبلهما بزمن، ويجب إيقافها كلها.

### مصافحة TLS 1.3

بعد مصافحة TCP يحتاج العميل والخادم إلى **ذهاب وإياب واحد** لإعداد TLS 1.3:

\`\`\`text
Client                                              Server
ClientHello                                -------->
  الإصدارات المدعومة ومجموعات التشفير،
  key_share (مفتاح DH العام للعميل)،
  server_name = www.example.com (SNI)
                                           <--------  ServerHello
                                                        key_share (مفتاح DH العام للخادم)
                                                      {EncryptedExtensions}
                                                      {Certificate}
                                                      {CertificateVerify}
                                                      {Finished}
{Finished}                                 -------->
[GET /docs/ HTTP/1.1 ...]                  <------->  [HTTP/1.1 200 OK ...]

{ } مشفّر بمفاتيح المصافحة     [ ] مشفّر بمفاتيح التطبيق
\`\`\`

1. يرسل كل طرف مفتاحاً عاماً جديداً من نوع **Diffie-Hellman مؤقت (ephemeral)** (\`key_share\`، وعادةً X25519). ومن المفتاحين يحسب كل طرف السر نفسه دون أن يعبر الشبكة أبداً. ولأن المفاتيح تُرمى بعد ذلك، فإن تسجيل الحركة ثم سرقة المفتاح الخاص للخادم لاحقاً لا يكفي لفك تشفيرها: وهذه هي **السرية الأمامية (forward secrecy)**.
2. يرسل الخادم **شهادته** ورسالة **CertificateVerify**: توقيعاً على المصافحة يُنشأ بالمفتاح الخاص المرتبط بالشهادة. ولا يستطيع إنتاجه إلا المالك الحقيقي لذلك المفتاح.
3. يرسل الطرفان **Finished**، وهي MAC على المصافحة كلها، فيُكتشف أي عبث بالرسائل السابقة.
4. تُحمى بيانات التطبيق بتشفير من نوع **AEAD** (مثل AES-GCM أو ChaCha20-Poly1305)، يشفّر كل سجل ويوثّقه.

وهناك تفصيل مهم للخصوصية: يُرسل **SNI** (اسم المضيف) في ClientHello قبل بدء التشفير، فيستطيع المراقب أن يرى *أي موقع* تزوره، لا أي الصفحات. وقد صُمّم امتداد يسمى Encrypted Client Hello (ECH) لإخفائه.

### الشهادات وسلسلة الثقة

**الشهادة** (X.509، RFC 5280) تربط مفتاحاً عاماً بأسماء. وأهم حقولها: **الموضوع (subject)**، و**المُصدِر (issuer)** (من وقّعها)، وفترة الصلاحية (**notBefore** و**notAfter**)، والمفتاح العام، وقائمة **الأسماء البديلة للموضوع (SAN)** وهي أسماء DNS التي تصلح لها. وتوقّعها **جهة إصدار شهادات** (CA). ويأتي نظام تشغيلك أو متصفحك مع **مخزن ثقة (trust store)** فيه شهادات الجهات الجذرية. ويرسل الخادم شهادته (**الطرفية / leaf**) مع الشهادات **الوسيطة (intermediate)**، ويبني العميل السلسلة:

\`\`\`text
www.example.com          issuer: Example Issuing CA 1      (طرفية، يرسلها الخادم)
  ^ موقَّعة من
Example Issuing CA 1     issuer: Example Root CA           (وسيطة، يرسلها الخادم)
  ^ موقَّعة من
Example Root CA          موقَّعة ذاتياً                       (جذرية، موجودة أصلاً في مخزن الثقة)
\`\`\`

لا يقبل العميل الخادم إلا إذا تحققت **كل** هذه الشروط:

- كل توقيع في السلسلة صحيح، وكل شهادة توقّع غيرها معلَّمة على أنها **CA**.
- تنتهي السلسلة بجذر موجود في مخزن الثقة.
- تاريخ اليوم داخل فترة صلاحية كل شهادة.
- اسم المضيف يطابق أحد مدخلات **SAN** في الشهادة الطرفية. والمطابقة لا تميّز حالة الأحرف، و**النجمة (wildcard)** مثل \`*.example.com\` تمثّل **جزءاً كاملاً واحداً** بالضبط من اليسار: فتطابق \`api.example.com\` لكنها لا تطابق \`example.com\` ولا \`a.b.example.com\` (RFC 9525). ولم تعد المتصفحات تنظر إلى حقل Common Name القديم.
- لم تُلغَ الشهادة (يُفحص ذلك بـ OCSP أو بقوائم CRL، أو بقوائم الإلغاء الخاصة بالمتصفح).

والشهادات العامة قصيرة العمر عن قصد. فمنتدى CA/Browser يخفّض مدتها القصوى على مراحل، من 398 يوماً إلى 200 يوم في مارس 2026، ثم حتى 47 يوماً بحلول عام 2029، فيجب أن يكون التجديد آلياً، وغالباً ببروتوكول **ACME** (RFC 8555) الذي تستخدمه جهات مثل Let's Encrypt. وما زال العطل الكلاسيكي هو "انتهت صلاحية الشهادة يوم الأحد". والأمر \`openssl s_client -connect www.example.com:443 -servername www.example.com\` يطبع السلسلة التي يرسلها الخادم، و\`curl -v\` يعرض المصافحة وأي خطأ في التحقق.`,
      },
    },
    {
      type: "lab",
      id: "cert-check",
      lang: "go",
      prompt: {
        en: `Write the **certificate checks** a TLS client runs before it trusts a server. Real clients also verify every cryptographic signature; here the subject and issuer names stand in for those signatures.

**Input**, one item per line:

- \`root <name>\`: a root CA in the trust store (there may be several).
- \`cert <subject>|<issuer>|<notBefore>|<notAfter>|<yes or no: is it a CA>|<SANs, comma-separated, may be empty>\`: the chain the server sent, **leaf first**. Dates are \`YYYY-MM-DD\`, valid from notBefore to notAfter **inclusive**.
- \`check <host> <date>\`: validate the chain for that host name on that day.

For each \`check\`, report the **first** problem found, testing in this order:

1. No \`cert\` lines at all: \`FAIL no certificate\`.
2. The host must match one SAN of the leaf: case-insensitive, and \`*.\` at the start stands for exactly one whole label (anything else, such as \`w*.example.com\`, only matches literally). Otherwise \`FAIL hostname mismatch\`.
3. For each certificate in order: \`FAIL not yet valid: <subject>\` or \`FAIL expired: <subject>\`.
4. For each certificate after the leaf: its subject must equal the issuer of the one before it, otherwise \`FAIL broken chain after: <subject of the one before>\`; and it must be a CA, otherwise \`FAIL not a CA: <subject>\`.
5. The issuer of the last certificate must be a trusted root, otherwise \`FAIL untrusted root: <issuer>\`.

If everything passes, the result is \`OK\`. **Output** one line per check: \`<host> <date>: <result>\`.

**Example**

\`\`\`text
Input:
root Example Root CA
cert www.example.com|Example Issuing CA 1|2026-06-01|2026-12-28|no|www.example.com,example.com
cert Example Issuing CA 1|Example Root CA|2024-01-01|2030-12-31|yes|
check www.example.com 2026-10-17
check shop.example.com 2026-10-17
check www.example.com 2026-12-29

Output:
www.example.com 2026-10-17: OK
shop.example.com 2026-10-17: FAIL hostname mismatch
www.example.com 2026-12-29: FAIL expired: www.example.com
\`\`\``,
        ar: `اكتب **فحوص الشهادة** التي يجريها عميل TLS قبل أن يثق بالخادم. والعملاء الحقيقيون يتحققون أيضاً من كل توقيع تشفيري؛ أما هنا فتقوم أسماء الموضوع والمُصدِر مقام تلك التواقيع.

**الإدخال**، عنصر في كل سطر:

- \`root <name>\`: جهة جذرية في مخزن الثقة (وقد توجد عدة جهات).
- \`cert <subject>|<issuer>|<notBefore>|<notAfter>|<yes أو no: هل هي CA>|<أسماء SAN مفصولة بفواصل، وقد تكون فارغة>\`: السلسلة التي أرسلها الخادم، **الطرفية أولاً**. والتواريخ بصيغة \`YYYY-MM-DD\`، والشهادة صالحة من notBefore إلى notAfter **شاملةً الطرفين**.
- \`check <host> <date>\`: تحقق من السلسلة لاسم المضيف هذا في ذلك اليوم.

لكل سطر \`check\` أبلغ عن **أول** مشكلة تجدها، بهذا الترتيب:

1. لا توجد أسطر \`cert\` إطلاقاً: \`FAIL no certificate\`.
2. يجب أن يطابق المضيف أحد أسماء SAN في الشهادة الطرفية: دون تمييز حالة الأحرف، و\`*.\` في البداية تمثّل جزءاً كاملاً واحداً بالضبط (وأي شكل آخر مثل \`w*.example.com\` لا يطابق إلا حرفياً). وإلا \`FAIL hostname mismatch\`.
3. لكل شهادة بالترتيب: \`FAIL not yet valid: <subject>\` أو \`FAIL expired: <subject>\`.
4. لكل شهادة بعد الطرفية: يجب أن يساوي موضوعها مُصدِر الشهادة التي قبلها، وإلا \`FAIL broken chain after: <موضوع الشهادة التي قبلها>\`؛ ويجب أن تكون CA، وإلا \`FAIL not a CA: <subject>\`.
5. يجب أن يكون مُصدِر آخر شهادة جذراً موثوقاً، وإلا \`FAIL untrusted root: <issuer>\`.

إذا نجح كل شيء فالنتيجة \`OK\`. **الإخراج** سطر لكل فحص: \`<host> <date>: <result>\`.

**مثال**

\`\`\`text
الإدخال:
root Example Root CA
cert www.example.com|Example Issuing CA 1|2026-06-01|2026-12-28|no|www.example.com,example.com
cert Example Issuing CA 1|Example Root CA|2024-01-01|2030-12-31|yes|
check www.example.com 2026-10-17
check shop.example.com 2026-10-17
check www.example.com 2026-12-29

الإخراج:
www.example.com 2026-10-17: OK
shop.example.com 2026-10-17: FAIL hostname mismatch
www.example.com 2026-12-29: FAIL expired: www.example.com
\`\`\``,
      },
      starterCode: String.raw`package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

type cert struct {
	subject, issuer     string
	notBefore, notAfter string // YYYY-MM-DD, so plain string comparison orders them correctly
	ca                  bool
	sans                []string
}

// matches reports whether one SAN entry (possibly a wildcard) covers the host name.
func matches(pattern, host string) bool {
	// TODO: compare without case, and let a leading "*." stand for exactly one whole label.
	return pattern == host
}

// check returns "OK" or the first problem, in a fixed order: name, dates, chain links, root.
func check(host, date string, roots map[string]bool, chain []cert) string {
	if len(chain) == 0 {
		return "FAIL no certificate"
	}
	named := false
	for _, san := range chain[0].sans {
		if matches(san, host) {
			named = true
			break
		}
	}
	if !named {
		return "FAIL hostname mismatch"
	}
	// TODO: dates of every certificate, then the chain links (subject == previous issuer, must be a CA),
	// then the issuer of the last certificate must be in roots.
	return "OK"
}

func main() {
	roots := map[string]bool{}
	var chain []cert
	in := bufio.NewScanner(os.Stdin)
	for in.Scan() {
		line := strings.TrimSpace(in.Text())
		keyword, rest, _ := strings.Cut(line, " ")
		switch keyword {
		case "root":
			roots[rest] = true
		case "cert":
			f := strings.Split(rest, "|")
			if len(f) != 6 {
				continue
			}
			var sans []string
			for _, s := range strings.Split(f[5], ",") {
				if s = strings.TrimSpace(s); s != "" {
					sans = append(sans, s)
				}
			}
			chain = append(chain, cert{f[0], f[1], f[2], f[3], f[4] == "yes", sans})
		case "check":
			host, date, _ := strings.Cut(rest, " ")
			fmt.Println(host + " " + date + ": " + check(host, date, roots, chain))
		}
	}
}
`,
      solution: String.raw`package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

type cert struct {
	subject, issuer     string
	notBefore, notAfter string // YYYY-MM-DD, so plain string comparison orders them correctly
	ca                  bool
	sans                []string
}

// matches reports whether one SAN entry (possibly a wildcard) covers the host name.
func matches(pattern, host string) bool {
	pattern, host = strings.ToLower(pattern), strings.ToLower(host)
	if strings.HasPrefix(pattern, "*.") {
		rest := pattern[1:] // ".example.com"
		if !strings.HasSuffix(host, rest) {
			return false
		}
		label := host[:len(host)-len(rest)]
		// The wildcard stands for exactly one whole label: not empty, no dots inside.
		return label != "" && !strings.Contains(label, ".")
	}
	return pattern == host
}

// check returns "OK" or the first problem, in a fixed order: name, dates, chain links, root.
func check(host, date string, roots map[string]bool, chain []cert) string {
	if len(chain) == 0 {
		return "FAIL no certificate"
	}
	named := false
	for _, san := range chain[0].sans {
		if matches(san, host) {
			named = true
			break
		}
	}
	if !named {
		return "FAIL hostname mismatch"
	}
	for _, c := range chain {
		if date < c.notBefore {
			return "FAIL not yet valid: " + c.subject
		}
		if date > c.notAfter {
			return "FAIL expired: " + c.subject
		}
	}
	for i := 1; i < len(chain); i++ {
		if chain[i].subject != chain[i-1].issuer {
			return "FAIL broken chain after: " + chain[i-1].subject
		}
		if !chain[i].ca {
			return "FAIL not a CA: " + chain[i].subject
		}
	}
	if last := chain[len(chain)-1]; !roots[last.issuer] {
		return "FAIL untrusted root: " + last.issuer
	}
	return "OK"
}

func main() {
	roots := map[string]bool{}
	var chain []cert
	in := bufio.NewScanner(os.Stdin)
	for in.Scan() {
		line := strings.TrimSpace(in.Text())
		keyword, rest, _ := strings.Cut(line, " ")
		switch keyword {
		case "root":
			roots[rest] = true
		case "cert":
			f := strings.Split(rest, "|")
			if len(f) != 6 {
				continue
			}
			var sans []string
			for _, s := range strings.Split(f[5], ",") {
				if s = strings.TrimSpace(s); s != "" {
					sans = append(sans, s)
				}
			}
			chain = append(chain, cert{f[0], f[1], f[2], f[3], f[4] == "yes", sans})
		case "check":
			host, date, _ := strings.Cut(rest, " ")
			fmt.Println(host + " " + date + ": " + check(host, date, roots, chain))
		}
	}
}
`,
      hints: [
        { en: "Wildcards: lower-case both strings first. If the pattern starts with `*.`, keep `rest := pattern[1:]` (for example `.example.com`). The host must end with `rest`, and what is left in front of it must be non-empty and contain no dot.", ar: "النجمة: حوّل النصين إلى أحرف صغيرة أولاً. إذا بدأ النمط بـ `*.` فاحتفظ بـ `rest := pattern[1:]` (مثل `.example.com`). يجب أن ينتهي المضيف بـ `rest`، وما يبقى قبله يجب ألّا يكون فارغاً وألّا يحتوي نقطة." },
        { en: "Dates in `YYYY-MM-DD` compare correctly as plain strings: `date < c.notBefore` means not yet valid, `date > c.notAfter` means expired.", ar: "التواريخ بصيغة `YYYY-MM-DD` تُقارن مقارنة صحيحة كنصوص عادية: `date < c.notBefore` تعني غير سارية بعد، و`date > c.notAfter` تعني منتهية." },
        { en: "Walk `for i := 1; i < len(chain); i++` and compare `chain[i].subject` with `chain[i-1].issuer` before checking `chain[i].ca`. Finally look up `chain[len(chain)-1].issuer` in `roots`.", ar: "امشِ بـ `for i := 1; i < len(chain); i++` وقارن `chain[i].subject` بـ `chain[i-1].issuer` قبل فحص `chain[i].ca`. وأخيراً ابحث عن `chain[len(chain)-1].issuer` في `roots`." },
      ],
      tests: certTests,
      sampleInput: certChain + "check www.example.com 2026-10-17\ncheck shop.example.com 2026-10-17\ncheck www.example.com 2026-12-29\n",
    },
    {
      type: "text",
      body: {
        en: `## When the page does not load: which step failed?

Because the steps happen in order, the error tells you where to look:

- **"Server not found" / \`NXDOMAIN\`**: DNS. Check the spelling, then \`dig name\`. A \`SERVFAIL\` points at the domain's name servers or DNSSEC, not at you.
- **"Connection refused" or a timeout**: TCP. The name resolved, but nothing listens on that port, or a firewall drops the packets (you met this difference in the TCP lesson).
- **Certificate errors**: TLS. *Expired* means renewal failed; *name mismatch* means the certificate does not list this host (often a missing \`www\` or a wildcard used one level too deep); *unknown issuer* means the server forgot to send its intermediate, or the certificate is self-signed.
- **A 4xx or 5xx status**: HTTP. The connection worked; the server answered with an error. 4xx says the request is wrong (bad URL, missing login); 5xx says the server or something behind it failed.

The \`curl -v https://www.example.com/\` command shows all four stages in one go: the resolved address, the TCP connection, the TLS handshake with the certificate subject and issuer, and the raw request and response headers.`,
        ar: `## حين لا تُحمَّل الصفحة: أي خطوة فشلت؟

لأن الخطوات تحدث بالترتيب، فإن الخطأ يخبرك أين تبحث:

- **"Server not found" أو \`NXDOMAIN\`**: المشكلة في DNS. تحقق من الإملاء، ثم نفّذ \`dig name\`. أما \`SERVFAIL\` فيشير إلى خوادم أسماء النطاق أو إلى DNSSEC، لا إليك.
- **"Connection refused" أو انتهاء المهلة**: المشكلة في TCP. حُلّ الاسم، لكن لا شيء يستمع على ذلك المنفذ، أو أن جداراً نارياً يُسقط الحزم (وقد قابلت هذا الفرق في درس TCP).
- **أخطاء الشهادة**: المشكلة في TLS. *منتهية الصلاحية* تعني أن التجديد فشل؛ و*عدم تطابق الاسم* يعني أن الشهادة لا تذكر هذا المضيف (وكثيراً ما يكون السبب غياب \`www\` أو نجمة استُخدمت أعمق بمستوى)؛ و*مُصدِر غير معروف* يعني أن الخادم نسي إرسال شهادته الوسيطة، أو أن الشهادة موقّعة ذاتياً.
- **رمز حالة 4xx أو 5xx**: المشكلة في HTTP. نجح الاتصال؛ وأجاب الخادم بخطأ. 4xx تقول إن الطلب خاطئ (رابط خاطئ أو تسجيل دخول مفقود)؛ و5xx تقول إن الخادم أو شيئاً خلفه قد فشل.

والأمر \`curl -v https://www.example.com/\` يعرض المراحل الأربع دفعة واحدة: العنوان الذي حُلّ إليه الاسم، واتصال TCP، ومصافحة TLS مع موضوع الشهادة ومُصدِرها، وترويسات الطلب والاستجابة الخام.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "`dig example.com A` returns status NOERROR with an empty answer section. What does that mean?", ar: "يعيد الأمر `dig example.com A` الحالة NOERROR مع قسم أجوبة فارغ. ما معنى ذلك؟" },
          choices: [
            { en: "The domain does not exist", ar: "النطاق غير موجود" },
            { en: "The name exists but has no A record (NODATA)", ar: "الاسم موجود لكن لا سجل A له (NODATA)" },
            { en: "The resolver could not reach the authoritative servers", ar: "لم يستطع المحلّل الوصول إلى الخوادم المخوَّلة" },
            { en: "The answer was blocked by DNSSEC", ar: "حُجب الجواب بسبب DNSSEC" },
          ],
          answer: 1,
          explain: {
            en: "A name that does not exist gives NXDOMAIN, and a resolver that cannot get an answer gives SERVFAIL. NOERROR with nothing in the answer is NODATA: the name exists (it may have MX or TXT records) but has no record of the type you asked for.",
            ar: "الاسم غير الموجود يعطي NXDOMAIN، والمحلّل الذي لا يستطيع الحصول على جواب يعطي SERVFAIL. أما NOERROR بلا شيء في الأجوبة فهو NODATA: الاسم موجود (وقد تكون له سجلات MX أو TXT) لكن لا سجل له من النوع الذي سألت عنه.",
          },
        },
        {
          q: { en: "You changed the A record of your site an hour ago, but some users still reach the old server. What is the most likely reason?", ar: "غيّرت سجل A لموقعك قبل ساعة، لكن بعض المستخدمين ما زالوا يصلون إلى الخادم القديم. ما السبب الأرجح؟" },
          choices: [
            { en: "DNS changes need a server reboot to take effect", ar: "تغييرات DNS تحتاج إعادة تشغيل الخادم لتسري" },
            { en: "Their browsers are using HTTP/1.1 instead of HTTP/2", ar: "متصفحاتهم تستخدم HTTP/1.1 بدلاً من HTTP/2" },
            { en: "Resolvers are still serving the old record from cache until its TTL runs out", ar: "المحلّلات ما زالت تقدّم السجل القديم من ذاكرتها المؤقتة حتى تنتهي مدة TTL" },
            { en: "The root servers have not been told about the change yet", ar: "لم تُبلَّغ خوادم الجذر بالتغيير بعد" },
          ],
          answer: 2,
          explain: {
            en: "Every DNS answer carries a TTL, and recursive resolvers keep it that long. Until the old TTL expires they answer from cache. Lowering the TTL a day before a planned move makes the switch fast. The root servers only know the TLD servers, never your A record.",
            ar: "كل جواب DNS يحمل مدة TTL، وتحتفظ به المحلّلات التكرارية طوال تلك المدة. وحتى تنتهي مدة TTL القديمة تجيب من ذاكرتها المؤقتة. وتخفيض TTL قبل يوم من نقل مخطط له يجعل التحويل سريعاً. أما خوادم الجذر فلا تعرف إلا خوادم النطاقات العليا، ولا تعرف سجل A الخاص بك أبداً.",
          },
        },
        {
          q: { en: "A user is logged in but opens a page they are not allowed to see. Which status code fits best?", ar: "مستخدم سجّل دخوله لكنه فتح صفحة غير مسموح له برؤيتها. أي رمز حالة هو الأنسب؟" },
          choices: [
            { en: "403 Forbidden", ar: "403 Forbidden (محظور)" },
            { en: "401 Unauthorized", ar: "401 Unauthorized (غير مصرَّح)" },
            { en: "404 Not Found", ar: "404 Not Found (غير موجود)" },
            { en: "500 Internal Server Error", ar: "500 Internal Server Error (خطأ داخلي في الخادم)" },
          ],
          answer: 0,
          explain: {
            en: "Despite its name, 401 means the request is not authenticated: log in first. 403 means the server knows who you are and still refuses. 404 is for a resource that does not exist (some sites use it to hide private pages), and 5xx codes are for server failures.",
            ar: "رغم اسمه، يعني 401 أن الطلب غير موثَّق: سجّل الدخول أولاً. أما 403 فيعني أن الخادم يعرف من أنت ومع ذلك يرفض. و404 لمورد غير موجود (وبعض المواقع تستخدمه لإخفاء الصفحات الخاصة)، ورموز 5xx لأعطال الخادم.",
          },
        },
        {
          q: { en: "A certificate lists only `*.example.com` in its SAN. For which host name is it valid?", ar: "شهادة لا تذكر في SAN إلا `*.example.com`. لأي اسم مضيف تصلح؟" },
          choices: [
            { en: "example.com", ar: "الاسم example.com" },
            { en: "a.b.example.com", ar: "الاسم a.b.example.com" },
            { en: "example.com.evil.test", ar: "الاسم example.com.evil.test" },
            { en: "shop.example.com", ar: "الاسم shop.example.com" },
          ],
          answer: 3,
          explain: {
            en: "A wildcard replaces exactly one whole label on the left. It matches shop.example.com, but not the bare example.com (no label to replace) and not a.b.example.com (two labels). A name that merely contains example.com somewhere else never matches.",
            ar: "النجمة تحل محل جزء كامل واحد بالضبط من اليسار. فهي تطابق shop.example.com، ولا تطابق example.com المجرد (فلا جزء يُستبدل) ولا a.b.example.com (جزءان). أما الاسم الذي يحتوي example.com في موضع آخر فلا يطابق أبداً.",
          },
        },
        {
          q: { en: "Why does TLS 1.3 use ephemeral Diffie-Hellman keys for every connection?", ar: "لماذا يستخدم TLS 1.3 مفاتيح Diffie-Hellman مؤقتة لكل اتصال؟" },
          choices: [
            { en: "So that the server does not need a certificate", ar: "حتى لا يحتاج الخادم إلى شهادة" },
            { en: "So that recorded traffic stays secret even if the server's private key is stolen later (forward secrecy)", ar: "حتى تبقى الحركة المسجَّلة سرية حتى لو سُرق المفتاح الخاص للخادم لاحقاً (السرية الأمامية)" },
            { en: "Because ephemeral keys compress HTTP headers", ar: "لأن المفاتيح المؤقتة تضغط ترويسات HTTP" },
            { en: "So that the SNI is encrypted", ar: "حتى يُشفَّر SNI" },
          ],
          answer: 1,
          explain: {
            en: "The session keys come from a Diffie-Hellman exchange whose private values are thrown away, so the certificate's long-term key is only used to sign the handshake. Stealing it later does not reveal old sessions. The certificate is still needed to prove identity, and the SNI travels before any key is agreed.",
            ar: "تأتي مفاتيح الجلسة من تبادل Diffie-Hellman تُرمى قيمه الخاصة، فلا يُستخدم مفتاح الشهادة طويل الأمد إلا لتوقيع المصافحة. وسرقته لاحقاً لا تكشف الجلسات القديمة. وما زالت الشهادة لازمة لإثبات الهوية، أما SNI فيُرسل قبل الاتفاق على أي مفتاح.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap

- **DNS** is a distributed tree: root, TLD, authoritative servers. A recursive resolver walks it and caches every answer for its **TTL**. Know **A, AAAA, CNAME, MX, NS, TXT, PTR, SOA, CAA**, and the statuses **NOERROR, NODATA, NXDOMAIN, SERVFAIL, REFUSED**.
- **HTTP** is request/response: method, target, headers, empty line, body. Status codes group by first digit; header names ignore case; \`Content-Length\` counts bytes; 1xx, 204 and 304 have no body.
- **TLS 1.3** needs one round trip, uses ephemeral Diffie-Hellman for **forward secrecy**, and authenticates the server with a **certificate** checked for chain, CA flags, dates, SAN name and revocation.
- The error tells you the step: name, connection, certificate or HTTP status.

**Practice next:** run \`dig +trace\` on a domain you use every day, then \`curl -v\` on its home page and find the TLS version, the certificate issuer and the response headers. Next lesson: how routers and switches move all of this traffic.`,
        ar: `## الخلاصة

- **DNS** شجرة موزّعة: الجذر، والنطاق الأعلى، والخوادم المخوَّلة. يمشي فيها المحلّل التكراري ويخزّن كل جواب طوال مدة **TTL**. اعرف **A وAAAA وCNAME وMX وNS وTXT وPTR وSOA وCAA**، والحالات **NOERROR وNODATA وNXDOMAIN وSERVFAIL وREFUSED**.
- **HTTP** طلب واستجابة: الطريقة والهدف والترويسات وسطر فارغ والجسم. ورموز الحالة تُجمَّع بحسب رقمها الأول؛ وأسماء الترويسات لا تميّز حالة الأحرف؛ و\`Content-Length\` يَعُدّ البايتات؛ والاستجابات 1xx و204 و304 لا جسم لها.
- **TLS 1.3** يحتاج ذهاباً وإياباً واحداً، ويستخدم Diffie-Hellman المؤقت من أجل **السرية الأمامية**، ويوثّق الخادم بـ **شهادة** تُفحص سلسلتها وعلامات CA فيها وتواريخها واسم SAN وحالة إلغائها.
- الخطأ يدلّك على الخطوة: الاسم، أو الاتصال، أو الشهادة، أو رمز حالة HTTP.

**تدرّب بعد ذلك:** نفّذ \`dig +trace\` على نطاق تستخدمه كل يوم، ثم \`curl -v\` على صفحته الرئيسية، وابحث عن إصدار TLS ومُصدِر الشهادة وترويسات الاستجابة. والدرس التالي: كيف تنقل الراوترات والسويتشات كل هذه الحركة.`,
      },
    },
  ],
};
