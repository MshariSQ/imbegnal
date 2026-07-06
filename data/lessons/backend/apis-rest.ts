import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "apis-rest",
  title: { en: "APIs & REST — How Software Talks", ar: "APIs وREST — كيف تتحدث البرمجيات" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What an **API** is (the waiter analogy)
- HTTP methods (GET, POST, PUT, DELETE) and status codes
- What makes an API **RESTful**
- You'll build a mini request router in code`,
        ar: `## ماذا ستتعلم

- ما هو **API** (تشبيه النادل)
- طرق HTTP (GET، POST، PUT، DELETE) ورموز الحالة
- ما الذي يجعل الـ API **RESTful**
- ستبني موجّه طلبات مصغّراً بالكود`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The restaurant waiter 🧑‍🍳

You sit at a table (the frontend). You don't march into the kitchen (the database) and cook — you tell the **waiter** what you want, and they bring it back. An **API** (Application Programming Interface) is that waiter: a well-defined menu of requests one program can make to another.

**REST** is the most common style for web APIs. It maps actions to **HTTP methods** on **resources** (things, named by URL):

\`\`\`
GET    /users        → read the list of users
GET    /users/5      → read user #5
POST   /users        → create a new user (data in the body)
PUT    /users/5      → update user #5
DELETE /users/5      → delete user #5
\`\`\`

See the pattern? Same URL, different **method** = different action. That's the elegance of REST — it reuses HTTP's own verbs for CRUD.

Every response carries a **status code** — a 3-digit summary:

- **2xx = success.** \`200 OK\`, \`201 Created\`
- **4xx = you (the client) messed up.** \`400 Bad Request\`, \`401 Unauthorized\`, \`404 Not Found\`
- **5xx = the server messed up.** \`500 Internal Server Error\`

Data usually travels as **JSON** — the universal format for structured data:

\`\`\`json
{ "id": 5, "name": "Sara", "email": "sara@mail.com" }
\`\`\`

So a full exchange: frontend sends \`GET /users/5\`, server replies \`200\` with that JSON. Learn to read this and you can talk to any web service on earth.`,
        ar: `## نادل المطعم 🧑‍🍳

تجلس على طاولة (الواجهة). لا تقتحم المطبخ (قاعدة البيانات) لتطبخ — بل تخبر **النادل** بما تريد، فيحضره لك. **API** (واجهة برمجة التطبيقات) هو ذلك النادل: قائمة محددة جيداً من الطلبات التي يقدّمها برنامج لآخر.

**REST** أشيع أسلوب لواجهات الويب. يربط الأفعال بـ**طرق HTTP** على **موارد** (أشياء، تُسمّى بعناوين URL):

\`\`\`
GET    /users        → اقرأ قائمة المستخدمين
GET    /users/5      → اقرأ المستخدم رقم 5
POST   /users        → أنشئ مستخدماً جديداً (البيانات في الجسم)
PUT    /users/5      → حدّث المستخدم رقم 5
DELETE /users/5      → احذف المستخدم رقم 5
\`\`\`

أترى النمط؟ نفس العنوان، **طريقة** مختلفة = فعل مختلف. هذه أناقة REST — يعيد استخدام أفعال HTTP نفسها لـ CRUD.

كل استجابة تحمل **رمز حالة** — ملخّص من 3 أرقام:

- **2xx = نجاح.** \`200 OK\`، \`201 Created\`
- **4xx = أنت (العميل) أخطأت.** \`400 Bad Request\`، \`401 Unauthorized\`، \`404 Not Found\`
- **5xx = الخادم أخطأ.** \`500 Internal Server Error\`

البيانات تسافر عادة كـ**JSON** — الصيغة العالمية للبيانات المهيكلة:

\`\`\`json
{ "id": 5, "name": "Sara", "email": "sara@mail.com" }
\`\`\`

فالتبادل الكامل: الواجهة ترسل \`GET /users/5\`، والخادم يرد \`200\` مع ذلك JSON. أتقن قراءة هذا فتستطيع مخاطبة أي خدمة ويب على الأرض.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Build the heart of a REST router. Write \`route(method, path)\` that returns the right **status code**:
- \`GET\` + \`"/users"\` → \`200\`
- \`POST\` + \`"/users"\` → \`201\` (created)
- anything else → \`404\` (not found)`,
        ar: `ابنِ قلب موجّه REST. اكتب \`route(method, path)\` تعيد **رمز الحالة** الصحيح:
- \`GET\` + \`"/users"\` ← \`200\`
- \`POST\` + \`"/users"\` ← \`201\` (أُنشئ)
- أي شيء آخر ← \`404\` (غير موجود)`,
      },
      starterCode: `function route(method, path) {
  // GET /users -> 200
  // POST /users -> 201
  // else -> 404
}

console.log(route("GET", "/users"));   // 200
console.log(route("POST", "/users"));  // 201
console.log(route("GET", "/nope"));    // 404`,
      solution: `function route(method, path) {
  if (method === "GET" && path === "/users") return 200;
  if (method === "POST" && path === "/users") return 201;
  return 404;
}

console.log(route("GET", "/users"));   // 200
console.log(route("POST", "/users"));  // 201
console.log(route("GET", "/nope"));    // 404`,
      hints: [
        { en: `Combine method and path with &&: if (method === "GET" && path === "/users") return 200;`, ar: `اجمع الطريقة والمسار بـ &&: if (method === "GET" && path === "/users") return 200;` },
        { en: `End with return 404 to catch everything unmatched.`, ar: `اختم بـ return 404 لالتقاط كل ما لم يطابق.` },
      ],
      tests: [
        { name: { en: "GET /users → 200", ar: "GET /users ← 200" }, check: `route("GET","/users") === 200` },
        { name: { en: "POST /users → 201", ar: "POST /users ← 201" }, check: `route("POST","/users") === 201` },
        { name: { en: "Unknown → 404", ar: "غير معروف ← 404" }, check: `route("GET","/nope") === 404 && route("DELETE","/users") === 404` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Query parameters and pagination 📄

Not every request is "give me everything." A URL can carry extra details after a \`?\` — these are **query parameters**:

\`\`\`
GET /users?role=admin&sort=name
              ↑            ↑
        filter by role   sort by name
\`\`\`

Each \`key=value\` pair (joined by \`&\`) tells the server exactly what slice of data you want, without needing a different URL for every combination.

The most common use is **pagination**. Imagine \`/posts\` has 2 million rows — returning all of them in one response would be huge and slow, for both the server and the client. Instead, APIs return one **page** at a time:

\`\`\`
GET /posts?page=1&limit=20   → posts 1-20
GET /posts?page=2&limit=20   → posts 21-40
\`\`\`

The server uses \`limit\` (how many items) and \`page\` (which chunk) to slice the data — in SQL terms, this maps almost directly to \`LIMIT 20 OFFSET 20\`. A well-designed paginated response also tells the client how to get more:

\`\`\`json
{ "data": [ /* 20 posts */ ], "page": 2, "totalPages": 100000 }
\`\`\`

Query parameters are for **filtering, sorting, and paging** — optional details about *how* to fetch a resource. Contrast this with the URL *path* (\`/users/5\`), which identifies *which* resource. Mixing the two up is a common beginner mistake: the resource's identity goes in the path, everything else goes in the query string.`,
        ar: `## معاملات الاستعلام والترقيم 📄

ليس كل طلب "أعطني كل شيء". يمكن لعنوان URL أن يحمل تفاصيل إضافية بعد \`?\` — هذه **معاملات الاستعلام (query parameters)**:

\`\`\`
GET /users?role=admin&sort=name
              ↑            ↑
        صفّ حسب الدور   رتّب حسب الاسم
\`\`\`

كل زوج \`key=value\` (مربوط بـ \`&\`) يخبر الخادم بالضبط أي شريحة من البيانات تريدها، دون الحاجة لعنوان مختلف لكل توليفة.

الاستخدام الأشيع هو **الترقيم (pagination)**. تخيّل \`/posts\` فيه مليونا صف — إعادتها كلها في استجابة واحدة ستكون ضخمة وبطيئة، للخادم والعميل معاً. بدلاً من ذلك، تُعيد الواجهات **صفحة** واحدة في كل مرة:

\`\`\`
GET /posts?page=1&limit=20   → المنشورات 1-20
GET /posts?page=2&limit=20   → المنشورات 21-40
\`\`\`

يستخدم الخادم \`limit\` (عدد العناصر) و\`page\` (أي جزء) ليقطّع البيانات — بمصطلحات SQL، هذا يقابل تقريباً \`LIMIT 20 OFFSET 20\`. الاستجابة المُرقّمة جيدة التصميم تخبر العميل أيضاً كيف يحصل على المزيد:

\`\`\`json
{ "data": [ /* 20 منشوراً */ ], "page": 2, "totalPages": 100000 }
\`\`\`

معاملات الاستعلام مخصصة لـ**التصفية والترتيب والترقيم** — تفاصيل اختيارية حول *كيفية* جلب المورد. قارن هذا بـ*مسار* URL (\`/users/5\`)، الذي يحدد *أي* مورد. الخلط بينهما خطأ شائع للمبتدئين: هوية المورد تذهب في المسار، وكل شيء آخر يذهب في سلسلة الاستعلام.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Build a pagination slicer. Write \`paginate(items, page, limit)\` that returns the correct **slice** of an array for a given page — page numbers start at \`1\`.

Example: \`paginate([1,2,3,4,5], 1, 2)\` → \`[1,2]\`; \`paginate([1,2,3,4,5], 2, 2)\` → \`[3,4]\`.`,
        ar: `ابنِ مُقطِّع ترقيم. اكتب \`paginate(items, page, limit)\` تعيد **الشريحة** الصحيحة من مصفوفة لصفحة معطاة — أرقام الصفحات تبدأ من \`1\`.

مثال: \`paginate([1,2,3,4,5], 1, 2)\` ← \`[1,2]\`؛ \`paginate([1,2,3,4,5], 2, 2)\` ← \`[3,4]\`.`,
      },
      starterCode: `function paginate(items, page, limit) {
  // page 1 -> items[0..limit)
  // page 2 -> items[limit..2*limit)
  // hint: figure out the starting index from (page - 1) * limit
}

console.log(paginate([1,2,3,4,5], 1, 2)); // [1, 2]
console.log(paginate([1,2,3,4,5], 2, 2)); // [3, 4]
console.log(paginate([1,2,3,4,5], 3, 2)); // [5]`,
      solution: `function paginate(items, page, limit) {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

console.log(paginate([1,2,3,4,5], 1, 2)); // [1, 2]
console.log(paginate([1,2,3,4,5], 2, 2)); // [3, 4]
console.log(paginate([1,2,3,4,5], 3, 2)); // [5]`,
      hints: [
        { en: `The start index is (page - 1) * limit — page 1 starts at index 0.`, ar: `مؤشر البداية هو (page - 1) * limit — الصفحة 1 تبدأ من الفهرس 0.` },
        { en: `Use Array.prototype.slice(start, start + limit) to grab that chunk.`, ar: `استخدم Array.prototype.slice(start, start + limit) لأخذ ذلك الجزء.` },
      ],
      tests: [
        { name: { en: "Page 1 returns the first chunk", ar: "الصفحة 1 تعيد الجزء الأول" }, check: `JSON.stringify(paginate([1,2,3,4,5],1,2)) === JSON.stringify([1,2])` },
        { name: { en: "Page 2 returns the next chunk", ar: "الصفحة 2 تعيد الجزء التالي" }, check: `JSON.stringify(paginate([1,2,3,4,5],2,2)) === JSON.stringify([3,4])` },
        { name: { en: "Last partial page returns remaining items", ar: "الصفحة الأخيرة الجزئية تعيد العناصر المتبقية" }, check: `JSON.stringify(paginate([1,2,3,4,5],3,2)) === JSON.stringify([5])` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: this platform's own API 🔍

This isn't abstract — the very login system behind this site is a small REST API. Its backend (a Cloudflare Worker, in \`worker/src/index.ts\`) exposes real REST-style endpoints such as an OAuth callback, a \`GET\` endpoint returning the logged-in user's profile, and \`GET\`/\`POST\` endpoints for progress and bookmarks — each one reads the HTTP method and path, checks an \`Authorization\` header for a valid token, and returns JSON with an appropriate status code.

For example, a request for the current user's stats runs a query like:

\`\`\`
GET /api/me   (with header: Authorization: Bearer <token>)
→ 200 { "username": "...", "progress": {...}, "bookmarks": {...} }
\`\`\`

If the token is missing or invalid, the same endpoint returns \`401 Unauthorized\` instead — exactly the status-code discipline from this lesson. This is a real, deployed, minimal REST API doing exactly what you just learned: HTTP methods mapped to actions, resources identified by path, and status codes communicating success or failure — running right now, powering the account system on the page you're reading this lesson on.`,
        ar: `## دراسة حالة واقعية: واجهة API هذه المنصة نفسها 🔍

هذا ليس تجريدياً — نظام تسجيل الدخول وراء هذا الموقع نفسه واجهة REST صغيرة. خلفيته (Cloudflare Worker، في \`worker/src/index.ts\`) تعرض نقاط REST حقيقية مثل استدعاء عودة OAuth، ونقطة \`GET\` تعيد ملف المستخدم المسجّل دخوله، ونقاط \`GET\`/\`POST\` للتقدّم والمفضّلات — كل واحدة تقرأ طريقة HTTP والمسار، وتفحص ترويسة \`Authorization\` لرمز صالح، وتعيد JSON برمز حالة مناسب.

مثلاً، طلب إحصاءات المستخدم الحالي ينفّذ استعلاماً مثل:

\`\`\`
GET /api/me   (مع الترويسة: Authorization: Bearer <token>)
→ 200 { "username": "...", "progress": {...}, "bookmarks": {...} }
\`\`\`

وإن كان الرمز مفقوداً أو غير صالح، تعيد نفس النقطة \`401 Unauthorized\` بدلاً من ذلك — بالضبط انضباط رموز الحالة من هذا الدرس. هذه واجهة REST حقيقية ومنشورة وبسيطة تفعل بالضبط ما تعلّمته للتو: طرق HTTP تُربط بأفعال، والموارد تُحدَّد بالمسار، ورموز الحالة تُبلّغ عن النجاح أو الفشل — تعمل الآن، وتُشغّل نظام الحساب في الصفحة التي تقرأ فيها هذا الدرس.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Which HTTP method creates a new resource?", ar: "أي طريقة HTTP تنشئ مورداً جديداً؟" },
          choices: [
            { en: "GET", ar: "GET" },
            { en: "POST", ar: "POST" },
            { en: "DELETE", ar: "DELETE" },
          ],
          answer: 1,
          explain: {
            en: "POST creates (often replying 201). GET reads, PUT updates, DELETE removes.",
            ar: "POST ينشئ (غالباً بردّ 201). GET يقرأ، PUT يحدّث، DELETE يحذف.",
          },
        },
        {
          q: { en: "A 404 status code means…", ar: "رمز الحالة 404 يعني…" },
          choices: [
            { en: "Success", ar: "نجاح" },
            { en: "The requested resource was not found (client error)", ar: "المورد المطلوب غير موجود (خطأ العميل)" },
            { en: "The server crashed", ar: "الخادم انهار" },
          ],
          answer: 1,
          explain: {
            en: "4xx = client error; 404 specifically = not found. 5xx would be a server-side failure.",
            ar: "4xx = خطأ العميل؛ و404 تحديداً = غير موجود. أما 5xx فهو فشل من جهة الخادم.",
          },
        },
        {
          q: { en: "What format do most REST APIs use for data?", ar: "أي صيغة تستخدمها معظم واجهات REST للبيانات؟" },
          choices: [
            { en: "JSON", ar: "JSON" },
            { en: "PDF", ar: "PDF" },
            { en: "MP3", ar: "MP3" },
          ],
          answer: 0,
          explain: {
            en: "JSON is the universal, human-readable structured-data format for APIs.",
            ar: "JSON هي الصيغة العالمية المقروءة للبيانات المهيكلة في الواجهات.",
          },
        },
        {
          q: { en: "The core REST idea is…", ar: "فكرة REST الجوهرية هي…" },
          choices: [
            { en: "Same URL + different HTTP method = different action", ar: "نفس العنوان + طريقة HTTP مختلفة = فعل مختلف" },
            { en: "Every action needs a unique URL", ar: "كل فعل يحتاج عنواناً فريداً" },
            { en: "Only GET is allowed", ar: "GET فقط مسموحة" },
          ],
          answer: 0,
          explain: {
            en: "REST maps HTTP verbs onto resources: GET/POST/PUT/DELETE on /users covers all of CRUD cleanly.",
            ar: "REST يربط أفعال HTTP بالموارد: GET/POST/PUT/DELETE على /users يغطي كل CRUD بأناقة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- An API is a waiter: a defined way for programs to request things
- REST maps HTTP methods (GET/POST/PUT/DELETE) to resources
- Status codes: 2xx success, 4xx client error, 5xx server error; data is JSON
- You built a mini REST router

**Next:** Auth & Security — how the server knows *who* is making each request and whether they're allowed.`,
        ar: `## الخلاصة

- الـ API نادل: طريقة محددة لتطلب البرامج الأشياء
- REST يربط طرق HTTP (GET/POST/PUT/DELETE) بالموارد
- رموز الحالة: 2xx نجاح، 4xx خطأ العميل، 5xx خطأ الخادم؛ والبيانات JSON
- بنيت موجّه REST مصغّراً

**التالي:** المصادقة والأمن — كيف يعرف الخادم *من* يرسل كل طلب وهل هو مصرّح له.`,
      },
    },
  ],
};
