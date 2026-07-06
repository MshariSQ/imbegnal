import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "networking",
  title: { en: "Networking — How Computers Talk", ar: "الشبكات — كيف تتحدث الحواسيب" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What an **IP address** and a **port** really are
- How data travels in **packets**
- The everyday protocols: HTTP, DNS, TCP
- **TCP vs UDP** — reliable delivery vs raw speed
- A real DNS-attack case study that took down half the internet
- Why networking is the #1 skill for security

If you can't read a network, you can't defend it.`,
        ar: `## ماذا ستتعلم

- ما هو **عنوان IP** و**المنفذ (port)** حقاً
- كيف تسافر البيانات في **حِزَم (packets)**
- البروتوكولات اليومية: HTTP، DNS، TCP
- **TCP مقابل UDP** — توصيل موثوق مقابل سرعة خام
- دراسة حالة هجوم DNS حقيقي أسقط نصف الإنترنت
- لماذا الشبكات هي المهارة رقم 1 في الأمن

إن لم تستطع قراءة الشبكة، لا تستطيع الدفاع عنها.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The postal system 📮

The internet is a giant postal service for data.

- **IP address** = a building's **street address**, like \`142.250.185.78\`. Every device online has one so mail can find it.
- **Port** = the **apartment number** inside the building. One computer runs many services; the port says which one. Web = port 80/443, email = 25, SSH = 22.
- **Packet** = one **envelope**. Big data (a video) is chopped into thousands of small envelopes, each stamped with source + destination, sent separately, and reassembled at the other end.
- **Protocol** = the **language/rules** both sides agree on. HTTP for web pages, DNS for looking up names, TCP for reliable delivery.

**DNS** is the internet's phone book. You type \`google.com\` (easy for humans); DNS translates it to \`142.250.185.78\` (what machines need). Attackers love DNS because if they poison that translation, they can send you to a fake site.

**A web request, start to finish:**
1. You type \`google.com\`
2. DNS turns it into an IP address
3. Your computer opens a TCP connection to that IP on port 443
4. It sends an HTTP request: "GET me the homepage"
5. Google's server replies with packets of HTML
6. Your browser reassembles and renders them`,
        ar: `## نظام البريد 📮

الإنترنت خدمة بريد عملاقة للبيانات.

- **عنوان IP** = **عنوان الشارع** للمبنى، مثل \`142.250.185.78\`. كل جهاز متصل له عنوان ليصله البريد.
- **المنفذ (port)** = **رقم الشقة** داخل المبنى. الحاسوب الواحد يشغّل خدمات كثيرة؛ المنفذ يحدد أيها. الويب = 80/443، البريد = 25، SSH = 22.
- **الحزمة (packet)** = **مظروف** واحد. البيانات الكبيرة (فيديو) تُقطَّع إلى آلاف المظاريف الصغيرة، كل منها مختوم بالمصدر والوجهة، تُرسَل منفصلة، وتُجمَّع في الطرف الآخر.
- **البروتوكول** = **اللغة/القواعد** المتفق عليها بين الطرفين. HTTP لصفحات الويب، DNS للبحث عن الأسماء، TCP للتوصيل الموثوق.

**DNS** هو دليل هاتف الإنترنت. تكتب \`google.com\` (سهل للبشر)؛ يترجمه DNS إلى \`142.250.185.78\` (ما تحتاجه الآلات). المهاجمون يعشقون DNS لأنهم إن سمّموا هذه الترجمة، أرسلوك إلى موقع مزيّف.

**طلب ويب من البداية للنهاية:**
1. تكتب \`google.com\`
2. يحوّله DNS إلى عنوان IP
3. يفتح حاسوبك اتصال TCP إلى ذلك العنوان على المنفذ 443
4. يرسل طلب HTTP: "أعطني الصفحة الرئيسية"
5. يرد خادم قوقل بحِزَم من HTML
6. يجمّعها متصفحك ويعرضها`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Security analysts constantly validate IP addresses. Write a function \`is_valid_ipv4(ip)\` that returns \`True\` only if \`ip\` is four numbers 0–255 separated by dots (e.g. \`"192.168.1.1"\`).

Rules: exactly 4 parts, each part is digits, each value 0–255.`,
        ar: `محللو الأمن يتحققون من عناوين IP باستمرار. اكتب دالة \`is_valid_ipv4(ip)\` تعيد \`True\` فقط إذا كان \`ip\` أربعة أرقام بين 0 و255 مفصولة بنقاط (مثل \`"192.168.1.1"\`).

القواعد: 4 أجزاء بالضبط، كل جزء أرقام، وكل قيمة بين 0 و255.`,
      },
      starterCode: `def is_valid_ipv4(ip):
    # split on ".", check 4 parts, each 0-255
    pass

print(is_valid_ipv4("192.168.1.1"))   # True
print(is_valid_ipv4("999.1.1.1"))     # False
print(is_valid_ipv4("10.0.0"))        # False`,
      solution: `def is_valid_ipv4(ip):
    parts = ip.split(".")
    if len(parts) != 4:
        return False
    for p in parts:
        if not p.isdigit():
            return False
        if int(p) < 0 or int(p) > 255:
            return False
    return True

print(is_valid_ipv4("192.168.1.1"))   # True
print(is_valid_ipv4("999.1.1.1"))     # False
print(is_valid_ipv4("10.0.0"))        # False`,
      hints: [
        { en: `Use ip.split(".") to get the parts, then check len(parts) == 4.`, ar: `استخدم ip.split(".") للأجزاء، ثم تحقق len(parts) == 4.` },
        { en: `For each part: p.isdigit() must be True and 0 <= int(p) <= 255.`, ar: `لكل جزء: p.isdigit() يجب أن تكون True و 0 <= int(p) <= 255.` },
      ],
      tests: [
        { name: { en: "Valid IP returns True", ar: "IP صحيح يعيد True" }, check: `assert is_valid_ipv4("192.168.1.1") == True` },
        { name: { en: "Value over 255 returns False", ar: "قيمة أكبر من 255 تعيد False" }, check: `assert is_valid_ipv4("999.1.1.1") == False` },
        { name: { en: "Wrong number of parts returns False", ar: "عدد أجزاء خاطئ يعيد False" }, check: `assert is_valid_ipv4("10.0.0") == False` },
        { name: { en: "Handles 0.0.0.0 and 255.255.255.255", ar: "يتعامل مع 0.0.0.0 و255.255.255.255" }, check: `assert is_valid_ipv4("0.0.0.0") == True and is_valid_ipv4("255.255.255.255") == True` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## TCP vs UDP — careful courier or shouting into the wind 📢

Packets travel using one of two delivery styles, and picking the right one matters:

**TCP (Transmission Control Protocol)** — the careful courier. Before sending anything, it shakes hands with the other side, numbers every packet, waits for confirmation each arrived, and re-sends anything lost. Slower, but **nothing goes missing and nothing arrives out of order**. Used for web pages (HTTP), email, file transfers — anywhere a missing or scrambled piece would break things.

**UDP (User Datagram Protocol)** — shouting into the wind. No handshake, no confirmation, no re-sending. Just fire packets and hope. Much faster and lower overhead, but packets can arrive late, out of order, or not at all. Used for video calls, live streaming, and online games — where a dropped frame is fine, but *waiting* for a resend would make the call laggy and useless.

**The one-line test:** if losing a piece of data would break the whole thing (a bank transfer, a webpage), use TCP. If a missing piece just means one blip and moving on (a video call), UDP is faster and good enough.`,
        ar: `## TCP مقابل UDP — ساعي بريد حذر أم صراخ في الريح 📢

تسافر الحِزَم بأحد أسلوبي توصيل، واختيار الصحيح منهما يهم:

**TCP (بروتوكول التحكّم بالإرسال)** — ساعي البريد الحذر. قبل إرسال أي شيء، يصافح الطرف الآخر، يرقّم كل حزمة، ينتظر تأكيد وصول كل واحدة، ويعيد إرسال أي شيء ضاع. أبطأ، لكن **لا شيء يضيع ولا شيء يصل بترتيب خاطئ**. يُستخدم لصفحات الويب (HTTP)، البريد، نقل الملفات — أي مكان تكسر فيه قطعة مفقودة أو مشوّشة الأمور.

**UDP (بروتوكول حزم بيانات المستخدم)** — الصراخ في الريح. بلا مصافحة، بلا تأكيد، بلا إعادة إرسال. فقط أطلق الحِزَم واتمنَّ. أسرع بكثير وعبء أقل، لكن الحِزَم قد تصل متأخرة أو بترتيب خاطئ أو لا تصل إطلاقاً. يُستخدم لمكالمات الفيديو والبث المباشر والألعاب عبر الإنترنت — حيث إطار مفقود لا بأس به، لكن *الانتظار* لإعادة إرسال يجعل المكالمة بطيئة عديمة الفائدة.

**الاختبار بسطر واحد:** إن كان فقدان قطعة بيانات سيكسر كل شيء (تحويل بنكي، صفحة ويب)، استخدم TCP. وإن كانت قطعة مفقودة تعني مجرد وميض عابر ثم المتابعة (مكالمة فيديو)، فـUDP أسرع وكافٍ.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Write \`identify_service(port)\` that returns the common service name for a port:
- \`80\` → \`"HTTP"\`
- \`443\` → \`"HTTPS"\`
- \`22\` → \`"SSH"\`
- \`53\` → \`"DNS"\`
- anything else → \`"Unknown"\``,
        ar: `اكتب \`identify_service(port)\` تعيد اسم الخدمة الشائعة لمنفذ:
- \`80\` ← \`"HTTP"\`
- \`443\` ← \`"HTTPS"\`
- \`22\` ← \`"SSH"\`
- \`53\` ← \`"DNS"\`
- أي شيء آخر ← \`"Unknown"\``,
      },
      starterCode: `def identify_service(port):
    known = {80: "HTTP", 443: "HTTPS", 22: "SSH", 53: "DNS"}
    # return known.get(port, "Unknown")


print(identify_service(443))  # HTTPS
print(identify_service(9999)) # Unknown`,
      solution: `def identify_service(port):
    known = {80: "HTTP", 443: "HTTPS", 22: "SSH", 53: "DNS"}
    return known.get(port, "Unknown")


print(identify_service(443))  # HTTPS
print(identify_service(9999)) # Unknown`,
      hints: [
        { en: `A dictionary's .get(key, default) returns default when the key isn't found — exactly what you need.`, ar: `دالة .get(key, default) للقاموس تعيد القيمة الافتراضية إن لم يوجد المفتاح — بالضبط ما تحتاجه.` },
        { en: `return known.get(port, "Unknown")`, ar: `return known.get(port, "Unknown")` },
      ],
      tests: [
        { name: { en: "443 is HTTPS", ar: "443 هي HTTPS" }, check: `assert identify_service(443) == "HTTPS"` },
        { name: { en: "22 is SSH", ar: "22 هي SSH" }, check: `assert identify_service(22) == "SSH"` },
        { name: { en: "Unknown port returns \"Unknown\"", ar: "منفذ غير معروف يعيد \"Unknown\"" }, check: `assert identify_service(9999) == "Unknown"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the 2016 Dyn DNS attack 🔍

In October 2016, attackers used the **Mirai botnet** — hundreds of thousands of hacked security cameras and routers — to flood **Dyn**, a company providing DNS service for major websites, with junk traffic (a DDoS attack). Because so many sites relied on Dyn's DNS, when Dyn went down, the *translation service itself* stopped working — even though Twitter, Netflix, Reddit, PayPal, and Spotify's actual servers were perfectly fine, users worldwide couldn't reach them, because their browsers couldn't turn the domain names into IP addresses anymore.

This is exactly why the earlier lesson called DNS "a favorite attacker target": it's a single point of failure that, if broken, takes down services that never actually failed themselves. It's also why large sites now use multiple DNS providers as backup.`,
        ar: `## دراسة حالة واقعية: هجوم Dyn DNS عام 2016 🔍

في أكتوبر 2016، استخدم مهاجمون **شبكة Mirai الروبوتية** — مئات آلاف كاميرات المراقبة وأجهزة التوجيه المخترقة — لإغراق **Dyn**، شركة تقدّم خدمة DNS لمواقع كبرى، ببيانات مزعجة (هجوم DDoS). ولأن مواقع كثيرة جداً اعتمدت على DNS الخاص بـDyn، حين توقف Dyn، توقفت *خدمة الترجمة نفسها* — رغم أن خوادم Twitter وNetflix وReddit وPayPal وSpotify الفعلية كانت سليمة تماماً، عجز المستخدمون حول العالم عن الوصول إليها، لأن متصفحاتهم لم تعد تستطيع تحويل أسماء النطاقات إلى عناوين IP.

هذا بالضبط لماذا وصف الدرس السابق DNS بـ"هدف مفضّل للمهاجمين": إنه نقطة فشل واحدة، إن انكسرت، تُسقط خدمات لم تفشل هي نفسها إطلاقاً. ولهذا أيضاً تستخدم المواقع الكبرى الآن عدة مزوّدي DNS كنسخة احتياطية.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What does DNS do?", ar: "ماذا يفعل DNS؟" },
          choices: [
            { en: "Translates domain names to IP addresses", ar: "يترجم أسماء النطاقات إلى عناوين IP" },
            { en: "Encrypts your traffic", ar: "يشفّر بياناتك" },
            { en: "Blocks viruses", ar: "يحجب الفيروسات" },
          ],
          answer: 0,
          explain: {
            en: "DNS is the phone book: google.com → 142.250.185.78. Poisoning it can redirect victims to fake sites.",
            ar: "DNS دليل الهاتف: google.com ← 142.250.185.78. تسميمه قد يوجّه الضحايا إلى مواقع مزيّفة.",
          },
        },
        {
          q: { en: "A port number identifies…", ar: "رقم المنفذ يحدد…" },
          choices: [
            { en: "Which building (computer)", ar: "أي مبنى (حاسوب)" },
            { en: "Which service/app inside the computer", ar: "أي خدمة/تطبيق داخل الحاسوب" },
            { en: "The speed of the connection", ar: "سرعة الاتصال" },
          ],
          answer: 1,
          explain: {
            en: "IP = the building, port = the apartment. Port 443 = HTTPS, 22 = SSH, 25 = email.",
            ar: "IP = المبنى، المنفذ = الشقة. المنفذ 443 = HTTPS، و22 = SSH، و25 = البريد.",
          },
        },
        {
          q: { en: "Why is big data split into packets?", ar: "لماذا تُقسَّم البيانات الكبيرة إلى حِزَم؟" },
          choices: [
            { en: "To send small pieces that can travel independently and be reassembled", ar: "لإرسال قطع صغيرة تسافر مستقلة ثم تُجمَّع" },
            { en: "To make it slower and safer", ar: "لجعلها أبطأ وأكثر أماناً" },
            { en: "Because computers can't send big files", ar: "لأن الحواسيب لا تستطيع إرسال ملفات كبيرة" },
          ],
          answer: 0,
          explain: {
            en: "Packets can take different routes and be re-sent if lost — this is what makes the internet resilient.",
            ar: "الحِزَم تسلك مسارات مختلفة ويُعاد إرسالها إن فُقدت — وهذا ما يجعل الإنترنت مرناً.",
          },
        },
        {
          q: { en: "Why does a webpage use TCP instead of UDP?", ar: "لماذا تستخدم صفحة الويب TCP بدل UDP؟" },
          choices: [
            { en: "A missing or scrambled piece would break the page, so guaranteed delivery matters", ar: "قطعة مفقودة أو مشوّشة تكسر الصفحة، فالتوصيل المضمون يهم" },
            { en: "TCP is always faster than UDP", ar: "TCP أسرع دائماً من UDP" },
            { en: "Webpages cannot use UDP at all", ar: "لا يمكن لصفحات الويب استخدام UDP إطلاقاً" },
          ],
          answer: 0,
          explain: {
            en: "TCP trades speed for reliability — exactly what you need when every byte of a page must arrive intact and in order.",
            ar: "TCP يقايض السرعة بالموثوقية — بالضبط ما تحتاجه حين يجب أن يصل كل بايت من الصفحة سليماً وبالترتيب.",
          },
        },
        {
          q: { en: "Why would a video call use UDP instead of TCP?", ar: "لماذا تستخدم مكالمة فيديو UDP بدل TCP؟" },
          choices: [
            { en: "A dropped frame is fine; waiting to re-send it would make the call laggy", ar: "إطار مفقود لا بأس به؛ انتظار إعادة إرساله يجعل المكالمة بطيئة" },
            { en: "UDP encrypts video better", ar: "UDP يشفّر الفيديو أفضل" },
            { en: "TCP cannot handle video at all", ar: "TCP لا يستطيع التعامل مع الفيديو إطلاقاً" },
          ],
          answer: 0,
          explain: {
            en: "Live video favors speed over perfection — UDP skips the handshake and re-send delays that would make a call feel laggy.",
            ar: "الفيديو المباشر يفضّل السرعة على الكمال — UDP يتخطّى تأخيرات المصافحة وإعادة الإرسال التي تجعل المكالمة تبدو بطيئة.",
          },
        },
        {
          q: { en: "In the 2016 Dyn attack, why did Twitter and Netflix become unreachable even though their own servers were fine?", ar: "في هجوم Dyn عام 2016، لماذا أصبح Twitter وNetflix غير قابلين للوصول رغم سلامة خوادمهما؟" },
          choices: [
            { en: "The DNS provider they relied on was knocked offline, so domain names couldn't be translated to IPs", ar: "مزوّد DNS الذي اعتمدوا عليه أُسقط، فتعذّرت ترجمة أسماء النطاقات إلى IP" },
            { en: "Their servers were hacked directly", ar: "خوادمهم اخترقت مباشرة" },
            { en: "It was a coincidence unrelated to DNS", ar: "كانت مصادفة لا علاقة لها بـDNS" },
          ],
          answer: 0,
          explain: {
            en: "A DDoS on a shared DNS provider (Dyn) shows how a single point of failure in the 'phone book' layer can take down many unrelated services at once.",
            ar: "هجوم DDoS على مزوّد DNS مشترك (Dyn) يُظهر كيف يمكن لنقطة فشل واحدة في طبقة 'دليل الهاتف' أن تُسقط خدمات كثيرة غير مترابطة دفعة واحدة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- IP = address, Port = service, Packet = envelope, Protocol = shared language
- TCP = reliable but slower (web, email); UDP = fast but no guarantees (calls, gaming)
- DNS maps names → IPs (a favorite attacker target — as the 2016 Dyn attack proved at scale)
- You wrote a real IP validator and a port-service identifier in Python

**Practice:** open a terminal and try \`ping google.com\` and \`nslookup google.com\` to watch DNS and packets in action. **Next:** Linux, the operating system of servers and security tools.`,
        ar: `## الخلاصة

- IP = العنوان، المنفذ = الخدمة، الحزمة = المظروف، البروتوكول = اللغة المشتركة
- TCP = موثوق لكن أبطأ (الويب، البريد)؛ UDP = سريع لكن بلا ضمانات (المكالمات، الألعاب)
- DNS يربط الأسماء ← عناوين IP (هدف مفضّل للمهاجمين — كما أثبت هجوم Dyn عام 2016 على نطاق واسع)
- كتبت مدقّق IP ومُعرِّف خدمة منفذ حقيقيَّين ببايثون

**تدرّب:** افتح طرفية وجرّب \`ping google.com\` و\`nslookup google.com\` لترى DNS والحِزَم تعمل. **التالي:** لينكس، نظام تشغيل الخوادم وأدوات الأمن.`,
      },
    },
  ],
};
