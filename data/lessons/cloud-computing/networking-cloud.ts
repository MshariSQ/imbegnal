import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "networking-cloud",
  title: { en: "Cloud Networking — Connecting Safely", ar: "الشبكات السحابية — الربط بأمان" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a **VPC** is (your private cloud neighborhood)
- Subnets, security groups, and firewalls
- How traffic flows in and out safely
- The networking that keeps cloud apps secure`,
        ar: `## ماذا ستتعلم

- ما هي **VPC** (حيّك الخاص في السحابة)
- الشبكات الفرعية، مجموعات الأمان، والجدران النارية
- كيف تتدفق البيانات داخلاً وخارجاً بأمان
- الشبكات التي تُبقي تطبيقات السحابة آمنة`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Your own gated neighborhood 🏘️

When you rent servers in a shared data center, you need your own private, isolated space — otherwise your database would sit on the open internet next to strangers. That private space is a **VPC (Virtual Private Cloud)**: your own walled-off section of the cloud, like a gated neighborhood where only your buildings live.

Inside your VPC you organize things into **subnets** (streets within the neighborhood):
- **Public subnet** — has a door to the internet. Your web server lives here (users must reach it).
- **Private subnet** — no direct internet access. Your **database** lives here, hidden. It can only be reached by your web server *inside* the VPC, never directly from outside. This is a core security pattern: never expose your database to the internet.

Controlling who can talk to what, you use **security groups** — virtual firewalls wrapped around each server. A security group is a list of allow-rules:
\`\`\`
Web server security group:
  ✅ allow port 443 (HTTPS) from anywhere    → users can load the site
  ✅ allow port 22 (SSH) from my office IP    → only I can log in
  ❌ everything else is denied by default
\`\`\`

This is **least privilege** (from the security track) applied to networking: open only the exact ports you need, only to the sources that need them. The default-deny stance is what keeps attackers out.

Putting it together — a secure cloud app:
\`\`\`
Internet → [public subnet: web server, ports 443 open]
                    ↓ (internal only)
           [private subnet: database, no internet access]
\`\`\`

Master VPCs, subnets, and security groups and you can design cloud systems that are open where they must be and locked down everywhere else — which is exactly what a cloud engineer is paid to do.`,
        ar: `## حيّك المسوّر الخاص 🏘️

حين تستأجر خوادم في مركز بيانات مشترك، تحتاج مساحتك الخاصة المعزولة — وإلا جلست قاعدة بياناتك على الإنترنت المفتوح بجوار الغرباء. تلك المساحة الخاصة **VPC (السحابة الخاصة الافتراضية)**: قسمك المسوّر من السحابة، كحيّ مغلق تعيش فيه مبانيك فقط.

داخل VPC تنظّم الأشياء في **شبكات فرعية (subnets)** (شوارع داخل الحيّ):
- **شبكة فرعية عامة** — لها باب إلى الإنترنت. خادم الويب يعيش هنا (المستخدمون يجب أن يصلوه).
- **شبكة فرعية خاصة** — بلا وصول مباشر للإنترنت. **قاعدة بياناتك** تعيش هنا، مخفية. لا يصلها إلا خادم الويب *داخل* VPC، أبداً من الخارج مباشرة. هذا نمط أمني جوهري: لا تكشف قاعدة بياناتك للإنترنت أبداً.

للتحكّم بمن يكلّم من، تستخدم **مجموعات الأمان (security groups)** — جدراناً نارية افتراضية حول كل خادم. مجموعة الأمان قائمة قواعد سماح:
\`\`\`
مجموعة أمان خادم الويب:
  ✅ اسمح بالمنفذ 443 (HTTPS) من أي مكان    → المستخدمون يحمّلون الموقع
  ✅ اسمح بالمنفذ 22 (SSH) من IP مكتبي     → أنا فقط أسجّل الدخول
  ❌ كل ما عداه مرفوض افتراضياً
\`\`\`

هذه **أقل صلاحية** (من مسار الأمن) مطبّقة على الشبكات: افتح فقط المنافذ التي تحتاجها بالضبط، فقط للمصادر التي تحتاجها. موقف الرفض الافتراضي هو ما يُبقي المهاجمين خارجاً.

تجميعاً — تطبيق سحابي آمن:
\`\`\`
الإنترنت → [شبكة عامة: خادم ويب، المنفذ 443 مفتوح]
                    ↓ (داخلياً فقط)
           [شبكة خاصة: قاعدة بيانات، بلا وصول إنترنت]
\`\`\`

أتقن VPCs والشبكات الفرعية ومجموعات الأمان فتصمّم أنظمة سحابية مفتوحة حيث يجب ومقفلة في كل مكان آخر — وهو بالضبط ما يُدفع لمهندس السحابة مقابله.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Load balancers and CDNs: spreading and shortening the trip 🌐

Two more networking pieces round out a real cloud app: one spreads traffic *across* your servers, the other shortens the *distance* traffic has to travel at all.

**A load balancer** sits in front of multiple identical web servers and distributes incoming requests across them — like a host at a restaurant door directing guests to whichever table has room. Benefits stack up quickly:
- **No single overloaded server** — traffic spreads evenly.
- **Survives a server crash** — the load balancer stops sending traffic to a server that fails its health check, routing everyone else to the healthy ones instead. This is *exactly* the redundancy concept from cloud architecture, implemented at the network layer.
- **Enables auto-scaling** — add or remove servers behind it as demand changes, invisibly to users.

**A CDN (Content Delivery Network)** solves a different problem: physical distance. Without one, every user worldwide fetches your images and files from one origin server — slow for anyone far from it. A CDN caches copies of your static content on servers spread across the globe, so a user in Singapore gets served from a nearby CDN node instead of crossing the ocean to your origin server every time.

Together, a typical flow looks like: **user → CDN (static files, cached nearby) → load balancer (spreads dynamic requests) → your servers in their VPC**. Every piece you've learned in this lesson — VPC, subnets, security groups, load balancers, CDNs — is a real, named layer in almost every production web architecture you'll ever touch.`,
        ar: `## موازِنات الحِمل وCDNs: توزيع الرحلة وتقصيرها 🌐

قطعتا شبكات إضافيتان تكمّلان تطبيقاً سحابياً حقيقياً: واحدة توزّع الحركة *عبر* خوادمك، والأخرى تقصّر *المسافة* التي يجب أن تقطعها الحركة أصلاً.

**موازِن الحِمل** يجلس أمام خوادم ويب متطابقة متعددة ويوزّع الطلبات الواردة عبرها — كمضيف في باب مطعم يوجّه الضيوف لأي طاولة فيها مكان. الفوائد تتراكم بسرعة:
- **لا خادم واحد مثقل** — الحركة تتوزّع بالتساوي.
- **ينجو من عطل خادم** — يتوقف موازِن الحِمل عن إرسال حركة لخادم يفشل فحص صحته، ويوجّه البقية للخوادم السليمة بدلاً منه. هذا *بالضبط* مفهوم التكرار من معمارية السحابة، مطبّقاً على طبقة الشبكة.
- **يمكّن التوسّع التلقائي** — أضف أو أزل خوادم خلفه مع تغيّر الطلب، بشكل خفي عن المستخدمين.

**CDN (شبكة توصيل المحتوى)** تحل مشكلة مختلفة: المسافة الفيزيائية. بدونها، كل مستخدم حول العالم يجلب صورك وملفاتك من خادم أصل واحد — بطيء لأي شخص بعيد عنه. CDN تخزّن نسخاً من محتواك الثابت مؤقتاً على خوادم منتشرة حول العالم، فيُخدم مستخدم في سنغافورة من عقدة CDN قريبة بدل عبور المحيط لخادم الأصل كل مرة.

معاً، التدفق النموذجي يبدو: **مستخدم ← CDN (ملفات ثابتة، مخزّنة قريباً) ← موازِن حِمل (يوزّع الطلبات الديناميكية) ← خوادمك في VPC الخاص بها**. كل قطعة تعلمتها في هذا الدرس — VPC، الشبكات الفرعية، مجموعات الأمان، موازِنات الحِمل، CDNs — طبقة حقيقية مسمّاة في كل معمارية ويب إنتاجية تقريباً ستلمسها.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: "**Build a security-group rule checker.** Write `isRuleSafe(port, source)` — `port` is a number, `source` is a string like `\"0.0.0.0/0\"` (anywhere) or an office IP like `\"203.0.113.5/32\"`. Return `false` if `port === 22` (SSH) AND `source === \"0.0.0.0/0\"` (SSH open to the whole internet is a classic misconfiguration). Otherwise return `true`.",
        ar: "**ابنِ فاحص قواعد مجموعة أمان.** اكتب `isRuleSafe(port, source)` — `port` رقم، و`source` نص مثل `\"0.0.0.0/0\"` (أي مكان) أو IP مكتب مثل `\"203.0.113.5/32\"`. أعِد `false` إذا كان `port === 22` (SSH) و`source === \"0.0.0.0/0\"` (فتح SSH لكل الإنترنت خطأ إعداد كلاسيكي). وإلا أعِد `true`.",
      },
      starterCode: `function isRuleSafe(port, source) {
  // TODO: return false only if port 22 is open to 0.0.0.0/0
}
`,
      solution: `function isRuleSafe(port, source) {
  if (port === 22 && source === "0.0.0.0/0") return false;
  return true;
}
`,
      hints: [
        { en: "Only flag the specific dangerous combo: port 22 AND source is the wildcard \"0.0.0.0/0\".", ar: "لا تُبلّغ إلا عن التركيبة الخطرة تحديداً: المنفذ 22 والمصدر هو الحرف البدل \"0.0.0.0/0\"." },
        { en: "Any other port, or SSH restricted to a specific IP, is fine — return true.", ar: "أي منفذ آخر، أو SSH مقيّد بـ IP محدد، مقبول — أعِد true." },
      ],
      tests: [
        { name: { en: "SSH open to the world is unsafe", ar: "SSH مفتوح للعالم غير آمن" }, check: `isRuleSafe(22, "0.0.0.0/0") === false` },
        { name: { en: "SSH restricted to an office IP is safe", ar: "SSH مقيّد بـ IP مكتب آمن" }, check: `isRuleSafe(22, "203.0.113.5/32") === true` },
        { name: { en: "HTTPS open to the world is safe", ar: "HTTPS مفتوح للعالم آمن" }, check: `isRuleSafe(443, "0.0.0.0/0") === true` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: The 2016 Dyn DNS attack 🔍

On October 21, 2016, attackers used a botnet of hijacked internet-of-things devices (compromised cameras, DVRs, and routers infected with the Mirai malware) to launch a massive DDoS attack against Dyn, a company providing DNS services — the "phone book" that translates website names into the IP addresses browsers actually connect to.

Because so many major sites relied on Dyn for DNS, the attack's effect spread far beyond Dyn itself: Twitter, Netflix, Reddit, Spotify, GitHub, and Amazon all became unreachable or badly degraded for large parts of the day across the US and Europe, even though none of *their* own servers were touched.

The attack is one of the clearest illustrations of why networking infrastructure — not just your own VPC and security groups, but shared services like DNS providers and CDNs — is a single point of failure if you rely on only one. It also demonstrated how ordinary consumer devices with poor security (default passwords never changed) can be hijacked at massive scale into a weapon against core internet infrastructure, reinforcing why the security-group discipline in this lesson (default-deny, minimum necessary access) matters at every layer, from a single server up to the entire internet's addressing system.`,
        ar: `## دراسة حالة واقعية: هجوم Dyn DNS عام 2016 🔍

في 21 أكتوبر 2016، استخدم مهاجمون شبكة روبوتات من أجهزة إنترنت الأشياء المخترقة (كاميرات وأجهزة DVR وموجّهات مصابة ببرمجية Mirai الخبيثة) لشنّ هجوم DDoS ضخم على Dyn، شركة تقدّم خدمات DNS — "دليل الهاتف" الذي يترجم أسماء المواقع إلى عناوين IP التي تتصل بها المتصفحات فعلياً.

ولأن مواقع كبرى كثيرة اعتمدت على Dyn لخدمة DNS، امتد أثر الهجوم إلى أبعد بكثير من Dyn نفسها: أصبحت Twitter وNetflix وReddit وSpotify وGitHub وAmazon جميعاً غير قابلة للوصول أو بأداء سيئ جداً لأجزاء كبيرة من اليوم عبر أمريكا وأوروبا، رغم أن خوادمها الخاصة لم تُمسّ إطلاقاً.

الهجوم من أوضح الأمثلة على لماذا بنية الشبكات التحتية — لا VPC ومجموعات الأمان الخاصة بك فقط، بل خدمات مشتركة مثل مزوّدي DNS وCDNs — نقطة فشل واحدة إن اعتمدت على واحد فقط. أظهر أيضاً كيف يمكن اختطاف أجهزة استهلاكية عادية ضعيفة الأمان (كلمات مرور افتراضية لم تُغيّر أبداً) بمقياس هائل لتصبح سلاحاً ضد بنية الإنترنت الأساسية، ما يعزّز أهمية انضباط مجموعات الأمان في هذا الدرس (رفض افتراضي، أقل وصول ضروري) في كل طبقة، من خادم واحد حتى نظام عنونة الإنترنت بأكمله.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a VPC?", ar: "ما هي VPC؟" },
          choices: [
            { en: "Your own private, isolated network within the cloud", ar: "شبكتك الخاصة المعزولة داخل السحابة" },
            { en: "A type of database", ar: "نوع قاعدة بيانات" },
            { en: "A programming language", ar: "لغة برمجة" },
          ],
          answer: 0,
          explain: {
            en: "A Virtual Private Cloud is your walled-off section of the provider's cloud — a gated neighborhood for your resources.",
            ar: "السحابة الخاصة الافتراضية قسمك المسوّر من سحابة المزوّد — حيّ مغلق لمواردك.",
          },
        },
        {
          q: { en: "Where should a database live for security?", ar: "أين يجب أن تعيش قاعدة البيانات للأمان؟" },
          choices: [
            { en: "A private subnet with no direct internet access", ar: "شبكة فرعية خاصة بلا وصول مباشر للإنترنت" },
            { en: "A public subnet open to everyone", ar: "شبكة فرعية عامة مفتوحة للجميع" },
            { en: "On the user's phone", ar: "على هاتف المستخدم" },
          ],
          answer: 0,
          explain: {
            en: "Keep databases in private subnets reachable only from inside the VPC. Never expose them directly to the internet.",
            ar: "أبقِ قواعد البيانات في شبكات خاصة تُصل فقط من داخل VPC. لا تكشفها للإنترنت مباشرة أبداً.",
          },
        },
        {
          q: { en: "A security group is basically…", ar: "مجموعة الأمان هي أساساً…" },
          choices: [
            { en: "A firewall with allow-rules for ports and sources", ar: "جدار ناري بقواعد سماح للمنافذ والمصادر" },
            { en: "A team of security guards", ar: "فريق حرّاس أمن" },
            { en: "An encryption key", ar: "مفتاح تشفير" },
          ],
          answer: 0,
          explain: {
            en: "It wraps a server and allows only specified ports from specified sources; everything else is denied by default (least privilege).",
            ar: "تحيط بخادم وتسمح فقط بمنافذ محددة من مصادر محددة؛ وكل ما عداه مرفوض افتراضياً (أقل صلاحية).",
          },
        },
        {
          q: { en: "What does a CDN mainly solve?", ar: "ما الذي تحلّه CDN أساساً؟" },
          choices: [
            { en: "Physical distance — it caches content on servers around the world, closer to users", ar: "المسافة الفيزيائية — تخزّن المحتوى مؤقتاً على خوادم حول العالم، أقرب للمستخدمين" },
            { en: "It replaces the need for a database", ar: "تلغي الحاجة لقاعدة بيانات" },
            { en: "It encrypts passwords", ar: "تشفّر كلمات المرور" },
          ],
          answer: 0,
          explain: {
            en: "Without a CDN, every user fetches static files from one origin server. A CDN serves cached copies from a nearby node instead, cutting travel distance.",
            ar: "بلا CDN، كل مستخدم يجلب ملفات ثابتة من خادم أصل واحد. CDN تخدم نسخاً مخزّنة مؤقتاً من عقدة قريبة بدلاً من ذلك، فتقلّل مسافة السفر.",
          },
        },
        {
          q: { en: "Why did the 2016 Dyn DNS attack take down sites like Twitter and Netflix even though their own servers weren't touched?", ar: "لماذا أسقط هجوم Dyn DNS عام 2016 مواقع مثل Twitter وNetflix رغم أن خوادمها الخاصة لم تُمسّ؟" },
          choices: [
            { en: "They all relied on Dyn as a shared DNS provider, which the DDoS attack overwhelmed", ar: "اعتمدت جميعها على Dyn كمزوّد DNS مشترك، والذي أغرقه هجوم DDoS" },
            { en: "Their servers were physically destroyed", ar: "دُمّرت خوادمها فيزيائياً" },
            { en: "They all shared the same VPC", ar: "شاركت جميعها نفس VPC" },
          ],
          answer: 0,
          explain: {
            en: "A botnet-driven DDoS against shared DNS infrastructure made site names unresolvable, showing that shared networking dependencies are a single point of failure.",
            ar: "هجوم DDoS مدفوع بشبكة روبوتات ضد بنية DNS مشتركة جعل أسماء المواقع غير قابلة للحل، ما أظهر أن اعتمادات الشبكات المشتركة نقطة فشل واحدة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A VPC is your isolated private network in the cloud
- Public subnets face the internet (web servers); private subnets stay hidden (databases)
- Security groups are per-server firewalls — allow only what's needed (least privilege)
- Never expose your database to the internet
- Load balancers spread traffic and survive server failures; CDNs shorten the distance to users
- The 2016 Dyn DNS attack shows how shared networking dependencies can be a single point of failure

**Next:** Infrastructure as Code — defining all this networking in code instead of clicking.`,
        ar: `## الخلاصة

- VPC شبكتك الخاصة المعزولة في السحابة
- الشبكات العامة تواجه الإنترنت (خوادم ويب)؛ والخاصة تبقى مخفية (قواعد بيانات)
- مجموعات الأمان جدران نارية لكل خادم — اسمح فقط بما يلزم (أقل صلاحية)
- لا تكشف قاعدة بياناتك للإنترنت أبداً
- موازِنات الحِمل توزّع الحركة وتنجو من أعطال الخوادم؛ وCDNs تقصّر المسافة للمستخدمين
- هجوم Dyn DNS عام 2016 يُظهر كيف يمكن لاعتمادات الشبكات المشتركة أن تكون نقطة فشل واحدة

**التالي:** البنية التحتية ككود — تعريف كل هذه الشبكات بالكود بدل النقر.`,
      },
    },
  ],
};
