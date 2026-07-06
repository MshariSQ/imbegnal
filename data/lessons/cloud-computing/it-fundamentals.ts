import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "it-fundamentals",
  title: { en: "IT Fundamentals — The Ground Floor", ar: "أساسيات تقنية المعلومات — الطابق الأرضي" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What "a server" really is
- Clients, servers, and how they connect
- Operating systems, storage, and networks in one picture
- The vocabulary the rest of cloud builds on`,
        ar: `## ماذا ستتعلم

- ما هو "الخادم" حقاً
- العملاء، الخوادم، وكيف يتصلون
- أنظمة التشغيل والتخزين والشبكات في صورة واحدة
- المفردات التي تبني عليها بقية السحابة`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A server is just a computer 🖥️

The word "server" sounds mysterious. It isn't. A **server is simply a computer that provides something to other computers** — usually running 24/7 in a data center instead of on a desk. Your laptop asking for a web page is the **client**; the computer that sends it back is the **server**. That's the whole client–server model, and the entire internet is built on it.

Quick reminder of the pieces (from the very first computer basics, now in an IT frame):
- **CPU + RAM** — the server's brain and short-term memory.
- **Storage** — hard drives (HDD, cheap/slow) and SSDs (fast) holding data permanently.
- **Operating System** — usually **Linux** on servers (you saw why in the security track): stable, free, scriptable.
- **Network** — how servers talk: IP addresses, ports, DNS (from the networking lesson).

A **data center** is a warehouse full of thousands of these servers, with massive internet connections, backup power, and cooling. When you "use the cloud," you're really renting a slice of someone's data center.

**Two words you'll hear constantly:**
- **On-premises ("on-prem")** — a company buys and runs its *own* servers in its *own* building. You own the hardware and all its headaches.
- **Cloud** — you rent computing from a provider (AWS, Azure, Google) over the internet and pay only for what you use.

Understanding cloud starts with this: it's not magic, it's *someone else's computers* that you rent instead of buy. Everything else — scaling, services, pricing — is built on that one shift from **owning** to **renting**.`,
        ar: `## الخادم مجرد حاسوب 🖥️

كلمة "خادم" تبدو غامضة. ليست كذلك. **الخادم ببساطة حاسوب يقدّم شيئاً لحواسيب أخرى** — يعمل عادة 24/7 في مركز بيانات بدل مكتب. حاسوبك يطلب صفحة ويب هو **العميل**؛ والحاسوب الذي يرسلها هو **الخادم**. هذا نموذج العميل–الخادم كله، والإنترنت كلها مبنية عليه.

تذكير سريع بالأجزاء (من أول أساسيات الحاسوب، الآن بإطار تقني):
- **المعالج + الذاكرة** — دماغ الخادم وذاكرته قصيرة المدى.
- **التخزين** — أقراص صلبة (HDD رخيص/بطيء) وSSD (سريع) تحفظ البيانات دائماً.
- **نظام التشغيل** — عادة **لينكس** على الخوادم (رأيت لماذا في مسار الأمن): مستقر، مجاني، قابل للبرمجة.
- **الشبكة** — كيف تتحدث الخوادم: عناوين IP، منافذ، DNS (من درس الشبكات).

**مركز البيانات** مستودع مليء بآلاف هذه الخوادم، باتصالات إنترنت ضخمة وطاقة احتياطية وتبريد. حين "تستخدم السحابة"، أنت فعلياً تستأجر شريحة من مركز بيانات أحدهم.

**كلمتان ستسمعهما باستمرار:**
- **في الموقع (On-premises)** — الشركة تشتري وتشغّل خوادمها *الخاصة* في مبناها *الخاص*. تملك العتاد وكل صداعه.
- **السحابة (Cloud)** — تستأجر الحوسبة من مزوّد (AWS، Azure، Google) عبر الإنترنت وتدفع فقط مقابل ما تستخدم.

فهم السحابة يبدأ من هذا: ليست سحراً، بل *حواسيب شخص آخر* تستأجرها بدل شرائها. وكل ما عداها — التوسّع، الخدمات، التسعير — مبنيّ على هذا التحوّل الواحد من **الامتلاك** إلى **الاستئجار**.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Virtualization: one machine pretending to be many 🧩

Here's the trick that made the entire cloud industry possible: **virtualization**. A single physical server has one CPU, one pool of RAM, one set of disks. But a piece of software called a **hypervisor** sits on top of that hardware and slices it into several independent **virtual machines (VMs)**, each believing it has its own private computer.

Think of a hypervisor like a landlord who converts one big house into several separate apartments. Each tenant (VM) gets their own locked door, their own furniture (operating system), and their own utilities bill (allocated CPU/RAM) — but they're all sharing the same building's foundation, walls, and plumbing (the physical hardware).

There are two main types of hypervisor:
- **Type 1 ("bare-metal")** — runs directly on the hardware, with no host OS underneath. Used in data centers because it's fast and efficient. Examples: VMware ESXi, Microsoft Hyper-V, Xen (which AWS used for years).
- **Type 2 ("hosted")** — runs as an app on top of a normal OS, like VirtualBox on your Windows laptop. Great for personal testing, too slow and wasteful for a data center serving thousands of customers.

Why this matters for the cloud: when you launch an EC2 instance, AWS isn't handing you a whole physical machine — it's carving out a VM from a much bigger physical server, alongside potentially dozens of other customers' VMs on that same hardware. That's *exactly* how a cloud provider can rent you "a fraction of a computer" cheaply, safely isolated from your neighbors, and how they pack thousands of customers onto a comparatively small number of physical machines. Virtualization is the invisible foundation everything else in this course is built on top of.`,
        ar: `## المحاكاة الافتراضية: جهاز واحد يتظاهر بأنه عدة أجهزة 🧩

هذه هي الحيلة التي جعلت صناعة السحابة كلها ممكنة: **المحاكاة الافتراضية (Virtualization)**. الخادم الفيزيائي الواحد لديه معالج واحد، وذاكرة واحدة، ومجموعة أقراص واحدة. لكن برنامجاً يُسمّى **المُراقِب (hypervisor)** يجلس فوق ذلك العتاد ويقطّعه إلى عدة **أجهزة افتراضية (VMs)** مستقلة، كل واحد منها يظن أن له حاسوبه الخاص.

فكّر في المُراقِب كمالك عقار يحوّل بيتاً كبيراً إلى عدة شقق منفصلة. كل مستأجر (جهاز افتراضي) يحصل على بابه المقفل الخاص، وأثاثه الخاص (نظام التشغيل)، وفاتورة مرافقه الخاصة (معالج/ذاكرة مخصّصة) — لكنهم جميعاً يتشاركون أساس المبنى وجدرانه وأنابيبه (العتاد الفيزيائي).

هناك نوعان رئيسيان من المُراقِبات:
- **النوع 1 ("المعدني الخام")** — يعمل مباشرة على العتاد، بلا نظام تشغيل مضيف تحته. يُستخدم في مراكز البيانات لأنه سريع وفعّال. أمثلة: VMware ESXi، وMicrosoft Hyper-V، وXen (الذي استخدمته AWS لسنوات).
- **النوع 2 ("المُستضاف")** — يعمل كتطبيق فوق نظام تشغيل عادي، كـ VirtualBox على حاسوبك المحمول بويندوز. رائع للاختبار الشخصي، لكنه بطيء ومُهدر جداً لمركز بيانات يخدم آلاف العملاء.

لماذا يهم هذا للسحابة: حين تُطلق نسخة EC2، لا تمنحك AWS جهازاً فيزيائياً كاملاً — بل تقتطع جهازاً افتراضياً من خادم فيزيائي أكبر بكثير، بجانب عشرات الأجهزة الافتراضية المحتملة لعملاء آخرين على نفس العتاد. هذا بالضبط كيف يستطيع مزوّد السحابة تأجيرك "جزءاً من حاسوب" بثمن رخيص، معزولاً بأمان عن جيرانك، وكيف يحشرون آلاف العملاء على عدد صغير نسبياً من الأجهزة الفيزيائية. المحاكاة الافتراضية هي الأساس غير المرئي الذي يُبنى فوقه كل شيء آخر في هذه الدورة.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: "**Build a VM resource allocator.** A hypervisor must reject a new VM request if it would exceed the physical host's capacity. Write `canAllocate(hostFreeRAM, requestedRAM)` that returns `true` if `requestedRAM` is less than or equal to `hostFreeRAM`, and `false` otherwise. This is the exact yes/no check a hypervisor performs before carving out a new virtual machine.",
        ar: "**ابنِ مخصِّص موارد لجهاز افتراضي.** يجب أن يرفض المُراقِب طلب جهاز افتراضي جديد إذا كان سيتجاوز سعة المضيف الفيزيائي. اكتب `canAllocate(hostFreeRAM, requestedRAM)` تُعيد `true` إذا كانت `requestedRAM` أقل من أو تساوي `hostFreeRAM`، و`false` غير ذلك. هذا بالضبط فحص نعم/لا الذي يجريه المُراقِب قبل اقتطاع جهاز افتراضي جديد.",
      },
      starterCode: `function canAllocate(hostFreeRAM, requestedRAM) {
  // TODO: return true if requestedRAM fits in hostFreeRAM
}
`,
      solution: `function canAllocate(hostFreeRAM, requestedRAM) {
  return requestedRAM <= hostFreeRAM;
}
`,
      hints: [
        { en: "This is a single comparison — no loops or extra logic needed.", ar: "هذه مقارنة واحدة فقط — لا حاجة لحلقات أو منطق إضافي." },
        { en: "Return the boolean result of requestedRAM <= hostFreeRAM directly.", ar: "أعِد نتيجة المقارنة requestedRAM <= hostFreeRAM مباشرة كقيمة منطقية." },
      ],
      tests: [
        { name: { en: "8GB fits in 16GB free", ar: "8GB تناسب 16GB حرة" }, check: `canAllocate(16, 8) === true` },
        { name: { en: "Exact fit is allowed", ar: "التطابق التام مسموح" }, check: `canAllocate(8, 8) === true` },
        { name: { en: "32GB does not fit in 16GB free", ar: "32GB لا تناسب 16GB حرة" }, check: `canAllocate(16, 32) === false` },
        { name: { en: "Zero request always fits", ar: "طلب صفري يناسب دائماً" }, check: `canAllocate(4, 0) === true` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the launch of AWS EC2 (2006) 🔍

Before 2006, if a startup wanted a server, it bought or leased physical hardware — a slow process involving vendors, shipping, and racking machines in a data center, often taking weeks. Amazon had built massive virtualized data centers to handle its own retail traffic spikes (like the holiday shopping season) and realized most of that capacity sat idle the rest of the year.

In August 2006, Amazon launched **EC2 (Elastic Compute Cloud)**, letting anyone rent a virtual machine by the hour with a credit card and no contract. This was only possible because of mature hypervisor technology (AWS used a modified version of the Xen hypervisor): Amazon could safely slice its physical servers into isolated VMs and rent them to thousands of unrelated customers side-by-side.

EC2's launch is widely regarded as the beginning of modern cloud computing as an industry. It turned infrastructure from a slow, capital-intensive purchase into an instant, pay-as-you-go rental — exactly the shift from "owning" to "renting" this lesson opened with, made real by virtualization.`,
        ar: `## دراسة حالة واقعية: إطلاق AWS EC2 (2006) 🔍

قبل 2006، إذا أرادت شركة ناشئة خادماً، كانت تشتري أو تستأجر عتاداً فيزيائياً — عملية بطيئة تشمل موردين وشحناً وتركيب أجهزة في مركز بيانات، وتستغرق أسابيع غالباً. كانت أمازون قد بنت مراكز بيانات افتراضية ضخمة للتعامل مع موجات ضغط تجارتها بالتجزئة (كموسم تسوق الأعياد)، وأدركت أن معظم تلك السعة تبقى خاملة بقية العام.

في أغسطس 2006، أطلقت أمازون **EC2 (سحابة الحوسبة المرنة)**، لتتيح لأي شخص استئجار جهاز افتراضي بالساعة ببطاقة ائتمان وبلا عقد. لم يكن هذا ممكناً إلا بفضل تقنية المُراقِب الناضجة (استخدمت AWS نسخة معدّلة من مُراقِب Xen): استطاعت أمازون تقطيع خوادمها الفيزيائية بأمان إلى أجهزة افتراضية معزولة وتأجيرها لآلاف العملاء غير المرتبطين جنباً إلى جنب.

يُعدّ إطلاق EC2 على نطاق واسع بداية الحوسبة السحابية الحديثة كصناعة. حوّل البنية التحتية من شراء بطيء كثيف رأس المال إلى استئجار فوري بالدفع حسب الاستخدام — بالضبط التحوّل من "الامتلاك" إلى "الاستئجار" الذي افتتح به هذا الدرس، وجعلته المحاكاة الافتراضية حقيقة واقعة.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a server?", ar: "ما هو الخادم؟" },
          choices: [
            { en: "A computer that provides services to other computers", ar: "حاسوب يقدّم خدمات لحواسيب أخرى" },
            { en: "A special kind of monitor", ar: "نوع خاص من الشاشات" },
            { en: "A programming language", ar: "لغة برمجة" },
          ],
          answer: 0,
          explain: {
            en: "A server is just a computer serving others (usually always-on in a data center). Your device is the client.",
            ar: "الخادم مجرد حاسوب يخدم غيره (يعمل دائماً عادة في مركز بيانات). وجهازك هو العميل.",
          },
        },
        {
          q: { en: "On-premises vs cloud — the core difference?", ar: "في الموقع مقابل السحابة — الفرق الجوهري؟" },
          choices: [
            { en: "On-prem = you own the servers; cloud = you rent them", ar: "في الموقع = تملك الخوادم؛ السحابة = تستأجرها" },
            { en: "Cloud has no servers at all", ar: "السحابة بلا خوادم إطلاقاً" },
            { en: "They're the same", ar: "متطابقان" },
          ],
          answer: 0,
          explain: {
            en: "The cloud is someone else's data center that you rent over the internet, paying only for what you use.",
            ar: "السحابة مركز بيانات شخص آخر تستأجره عبر الإنترنت، وتدفع فقط مقابل ما تستخدم.",
          },
        },
        {
          q: { en: "Which OS runs most servers?", ar: "أي نظام تشغيل يشغّل معظم الخوادم؟" },
          choices: [
            { en: "Linux", ar: "Linux" },
            { en: "A phone OS", ar: "نظام هاتف" },
            { en: "None — servers have no OS", ar: "لا شيء — الخوادم بلا نظام تشغيل" },
          ],
          answer: 0,
          explain: {
            en: "Linux dominates servers: stable, free, and scriptable — exactly why it's central to cloud and security work.",
            ar: "لينكس يهيمن على الخوادم: مستقر، مجاني، وقابل للبرمجة — بالضبط لماذا هو محوري في عمل السحابة والأمن.",
          },
        },
        {
          q: { en: "What does a hypervisor do?", ar: "ماذا يفعل المُراقِب (hypervisor)؟" },
          choices: [
            { en: "Slices one physical server into several isolated virtual machines", ar: "يقطّع خادماً فيزيائياً واحداً إلى عدة أجهزة افتراضية معزولة" },
            { en: "Physically connects two data centers with a cable", ar: "يوصل مركزي بيانات فيزيائياً بكابل" },
            { en: "Deletes unused files to save space", ar: "يحذف الملفات غير المستخدمة لتوفير المساحة" },
          ],
          answer: 0,
          explain: {
            en: "A hypervisor is the software layer that carves one physical machine into multiple independent VMs, each with its own OS.",
            ar: "المُراقِب طبقة برمجية تقطّع جهازاً فيزيائياً واحداً إلى عدة أجهزة افتراضية مستقلة، لكل منها نظام تشغيله الخاص.",
          },
        },
        {
          q: { en: "Why was AWS EC2's 2006 launch so significant?", ar: "لماذا كان إطلاق AWS EC2 عام 2006 مهماً جداً؟" },
          choices: [
            { en: "It let anyone rent a virtual machine by the hour, starting the modern cloud industry", ar: "أتاح لأي شخص استئجار جهاز افتراضي بالساعة، وبدأ صناعة السحابة الحديثة" },
            { en: "It was the first website ever created", ar: "كان أول موقع ويب يُنشأ إطلاقاً" },
            { en: "It replaced the need for the internet", ar: "ألغى الحاجة إلى الإنترنت" },
          ],
          answer: 0,
          explain: {
            en: "EC2 turned buying physical hardware into instant, pay-as-you-go virtual machine rental, made possible by mature hypervisor technology.",
            ar: "حوّل EC2 شراء العتاد الفيزيائي إلى استئجار فوري لأجهزة افتراضية بالدفع حسب الاستخدام، بفضل تقنية المُراقِب الناضجة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A server is just a computer that serves others (client–server model)
- Pieces: CPU/RAM, storage, OS (usually Linux), network
- Data centers house thousands of servers; the cloud rents you a slice
- On-prem = own; cloud = rent
- Virtualization (hypervisors) slices one physical server into many isolated VMs — the invisible foundation of the cloud
- You built a VM resource allocator that checks if a request fits the host's free capacity
- AWS EC2's 2006 launch turned that virtualization technology into the modern, pay-as-you-go cloud industry

**Next:** Cloud Concepts — the models (IaaS/PaaS/SaaS) and why the cloud took over.`,
        ar: `## الخلاصة

- الخادم مجرد حاسوب يخدم غيره (نموذج العميل–الخادم)
- الأجزاء: المعالج/الذاكرة، التخزين، نظام التشغيل (لينكس عادة)، الشبكة
- مراكز البيانات تضم آلاف الخوادم؛ والسحابة تؤجّرك شريحة
- في الموقع = امتلاك؛ السحابة = استئجار
- المحاكاة الافتراضية (المُراقِبات) تقطّع خادماً فيزيائياً واحداً إلى أجهزة افتراضية معزولة كثيرة — الأساس غير المرئي للسحابة
- بنيت مخصِّص موارد لجهاز افتراضي يتحقق من ملاءمة طلب لسعة المضيف الحرة
- إطلاق AWS EC2 عام 2006 حوّل تقنية المحاكاة الافتراضية تلك إلى صناعة السحابة الحديثة بالدفع حسب الاستخدام

**التالي:** مفاهيم السحابة — النماذج (IaaS/PaaS/SaaS) ولماذا اجتاحت السحابة كل شيء.`,
      },
    },
  ],
};
