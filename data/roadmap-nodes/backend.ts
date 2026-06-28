import type { RoadmapNodeInfo } from "./cyber-security";

export const backendNodes: RoadmapNodeInfo[] = [
  {
    id: "programming-basics",
    label: "Programming Basics",
    description: "Pick one language and master it: Python or JavaScript (Node.js) are the best starting points. Variables, loops, functions, OOP, and data structures — everything else builds on this.",
    status: "required",
    resources: {
      youtube: { title: "Python for Beginners – freeCodeCamp", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "4h" },
      course: { title: "CS50x – Introduction to Computer Science", url: "https://cs50.harvard.edu/x/", provider: "Harvard / edX", tags: ["Free Audit", "Harvard", "Recommended"], duration: "11 weeks" },
      book: { title: "Automate the Boring Stuff with Python", url: "https://automatetheboringstuff.com", provider: "Al Sweigart", tags: ["Free", "Recommended"] },
      docs: { title: "Python Official Docs", url: "https://docs.python.org/3/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "databases",
    label: "Databases & SQL",
    description: "Relational databases (PostgreSQL, MySQL), SQL queries, joins, indexes, and transactions. Then NoSQL (MongoDB, Redis). Data storage is at the core of every backend application.",
    status: "required",
    resources: {
      youtube: { title: "SQL Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "4h" },
      course: { title: "Databases and SQL for Data Science – IBM", url: "https://www.coursera.org/learn/sql-data-science", provider: "Coursera / IBM", tags: ["Free Audit", "Official"], duration: "6 weeks" },
      book: { title: "Learning SQL", url: "https://www.oreilly.com/library/view/learning-sql-3rd/9781492057604/", provider: "O'Reilly", tags: ["Recommended"] },
      docs: { title: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "apis-rest",
    label: "APIs & REST",
    description: "Build and consume REST APIs: HTTP methods, status codes, JSON, authentication headers, rate limiting, and API versioning. REST APIs are the backbone of modern web services.",
    status: "required",
    resources: {
      youtube: { title: "REST API Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=-MTSQjw5DrM", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "2h" },
      course: { title: "Node.js, Express & MongoDB Bootcamp", url: "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/", provider: "Udemy · Jonas Schmedtmann", tags: ["Paid", "Best Seller"], duration: "42h" },
      book: { title: "REST API Design Rulebook", url: "https://www.oreilly.com/library/view/rest-api-design/9781449317904/", provider: "O'Reilly", tags: ["Recommended"] },
      docs: { title: "HTTP MDN Reference", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP", tags: ["Free", "Official"] },
    },
  },
  {
    id: "authentication",
    label: "Auth & Security",
    description: "JWT, OAuth 2.0, sessions, bcrypt password hashing, CORS, HTTPS, and security headers. Building secure authentication is one of the most critical backend responsibilities.",
    status: "required",
    resources: {
      youtube: { title: "JWT Authentication – Web Dev Simplified", url: "https://www.youtube.com/watch?v=mbsmsi7l3r4", provider: "Web Dev Simplified", tags: ["Free", "Recommended"], duration: "1h" },
      course: { title: "Node.js Security Course – Troy Hunt", url: "https://www.pluralsight.com/courses/nodejs-security-pluralsight", provider: "Pluralsight", tags: ["Paid"], duration: "4h" },
      docs: { title: "OWASP Authentication Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "nodejs",
    label: "Node.js Runtime",
    description: "Event loop, async programming, streams, modules (CommonJS & ESM), the npm ecosystem, and performance. Understanding how Node.js works under the hood makes you a better backend developer.",
    status: "important",
    resources: {
      youtube: { title: "Node.js Full Course – Traversy Media", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", provider: "Traversy Media", tags: ["Free", "Recommended"], duration: "90m" },
      course: { title: "The Complete Node.js Developer Course", url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/", provider: "Udemy · Andrew Mead", tags: ["Paid"], duration: "35h" },
      book: { title: "Node.js Design Patterns", url: "https://www.nodejsdesignpatterns.com", provider: "Mario Casciaro", tags: ["Recommended"] },
      docs: { title: "Node.js Official Docs", url: "https://nodejs.org/en/docs", tags: ["Free", "Official"] },
    },
  },
  {
    id: "caching-queues",
    label: "Caching & Queues",
    description: "Redis for caching and session storage, message queues (RabbitMQ, BullMQ), and background jobs. These are the tools that make backends fast and scalable.",
    status: "important",
    resources: {
      youtube: { title: "Redis Crash Course – Traversy Media", url: "https://www.youtube.com/watch?v=jgpVdJB2sKQ", provider: "Traversy Media", tags: ["Free", "Recommended"], duration: "40m" },
      course: { title: "Redis University – RU101", url: "https://university.redis.com/courses/ru101/", provider: "Redis", tags: ["Free", "Official"], duration: "8h" },
      docs: { title: "Redis Official Docs", url: "https://redis.io/docs/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "devops-backend",
    label: "Docker & Deployment",
    description: "Containerize your app with Docker, write Dockerfiles, use docker-compose for local dev, and deploy to a cloud provider. Modern backend devs are expected to ship their own code.",
    status: "important",
    resources: {
      youtube: { title: "Docker Tutorial for Beginners – TechWorld with Nana", url: "https://www.youtube.com/watch?v=3c-iBn73dDE", provider: "TechWorld with Nana", tags: ["Free", "Recommended"], duration: "3h" },
      course: { title: "Docker & Kubernetes: The Complete Guide", url: "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/", provider: "Udemy · Stephen Grider", tags: ["Paid"], duration: "22h" },
      docs: { title: "Docker Official Docs", url: "https://docs.docker.com", tags: ["Free", "Official"] },
    },
  },
  {
    id: "system-design",
    label: "System Design",
    description: "Design scalable systems: load balancers, horizontal scaling, database replication, CAP theorem, microservices vs monoliths. Asked in every senior backend interview.",
    status: "optional",
    resources: {
      youtube: { title: "System Design – ByteByteGo", url: "https://www.youtube.com/@ByteByteGo", provider: "ByteByteGo", tags: ["Free", "Recommended"] },
      course: { title: "Grokking the System Design Interview", url: "https://www.designgurus.io/course/grokking-the-system-design-interview", provider: "Design Gurus", tags: ["Paid", "Recommended"] },
      book: { title: "Designing Data-Intensive Applications", url: "https://dataintensive.net", provider: "Martin Kleppmann", tags: ["Recommended"] },
      docs: { title: "The System Design Primer", url: "https://github.com/donnemartin/system-design-primer", tags: ["Free"] },
    },
  },
];
