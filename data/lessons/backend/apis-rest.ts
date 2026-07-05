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
