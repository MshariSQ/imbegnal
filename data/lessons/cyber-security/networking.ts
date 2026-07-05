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
- Why networking is the #1 skill for security

If you can't read a network, you can't defend it.`,
        ar: `## ماذا ستتعلم

- ما هو **عنوان IP** و**المنفذ (port)** حقاً
- كيف تسافر البيانات في **حِزَم (packets)**
- البروتوكولات اليومية: HTTP، DNS، TCP
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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- IP = address, Port = service, Packet = envelope, Protocol = shared language
- DNS maps names → IPs (a favorite attacker target)
- You wrote a real IP validator in Python

**Practice:** open a terminal and try \`ping google.com\` and \`nslookup google.com\` to watch DNS and packets in action. **Next:** Linux, the operating system of servers and security tools.`,
        ar: `## الخلاصة

- IP = العنوان، المنفذ = الخدمة، الحزمة = المظروف، البروتوكول = اللغة المشتركة
- DNS يربط الأسماء ← عناوين IP (هدف مفضّل للمهاجمين)
- كتبت مدقّق IP حقيقياً ببايثون

**تدرّب:** افتح طرفية وجرّب \`ping google.com\` و\`nslookup google.com\` لترى DNS والحِزَم تعمل. **التالي:** لينكس، نظام تشغيل الخوادم وأدوات الأمن.`,
      },
    },
  ],
};
