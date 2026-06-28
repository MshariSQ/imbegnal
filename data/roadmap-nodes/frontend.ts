import type { RoadmapNodeInfo } from "./cyber-security";

export const frontendNodes: RoadmapNodeInfo[] = [
  {
    id: "html-css",
    label: "HTML & CSS",
    description: "The building blocks of the web. Learn semantic HTML5, CSS selectors, the box model, flexbox, grid, and responsive design. Every frontend developer starts here.",
    status: "required",
    resources: {
      youtube: { title: "HTML & CSS Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=mU6anWqZJcc", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "11h" },
      course: { title: "Responsive Web Design – freeCodeCamp", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", provider: "freeCodeCamp", tags: ["Free", "Certificate"], duration: "300h" },
      book: { title: "HTML and CSS: Design and Build Websites", url: "https://www.amazon.com/HTML-CSS-Design-Build-Websites/dp/1118008189", provider: "Jon Duckett", tags: ["Recommended"] },
      docs: { title: "MDN Web Docs – HTML", url: "https://developer.mozilla.org/en-US/docs/Web/HTML", tags: ["Free", "Official"] },
    },
  },
  {
    id: "javascript",
    label: "JavaScript",
    description: "The language of the web. Variables, functions, DOM manipulation, events, async/await, promises, and ES6+ features. JavaScript makes websites interactive.",
    status: "required",
    resources: {
      youtube: { title: "JavaScript Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "3h" },
      course: { title: "The Complete JavaScript Course", url: "https://www.udemy.com/course/the-complete-javascript-course/", provider: "Udemy · Jonas Schmedtmann", tags: ["Paid", "Best Seller"], duration: "69h" },
      book: { title: "Eloquent JavaScript", url: "https://eloquentjavascript.net", provider: "Marijn Haverbeke", tags: ["Free", "Recommended"] },
      docs: { title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", tags: ["Free", "Official"] },
    },
  },
  {
    id: "git",
    label: "Git & GitHub",
    description: "Version control is non-negotiable. Learn git init, commit, push, pull, branching, merging, and resolving conflicts. GitHub is where all your code will live.",
    status: "required",
    resources: {
      youtube: { title: "Git & GitHub Crash Course – Traversy Media", url: "https://www.youtube.com/watch?v=SWYqp7iY_Tc", provider: "Traversy Media", tags: ["Free", "Recommended"], duration: "32m" },
      course: { title: "Introduction to Git & GitHub – Google", url: "https://www.coursera.org/learn/introduction-git-github", provider: "Coursera / Google", tags: ["Free Audit", "Official"], duration: "4 weeks" },
      book: { title: "Pro Git", url: "https://git-scm.com/book/en/v2", provider: "Scott Chacon", tags: ["Free", "Official"] },
      docs: { title: "Git Official Documentation", url: "https://git-scm.com/doc", tags: ["Free", "Official"] },
    },
  },
  {
    id: "react",
    label: "React",
    description: "The most popular JavaScript library for building UIs. Components, props, state, hooks (useState, useEffect, useContext), and the virtual DOM. Used by Meta, Netflix, and thousands of companies.",
    status: "required",
    resources: {
      youtube: { title: "React Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "12h" },
      course: { title: "React – The Complete Guide 2024", url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", provider: "Udemy · Maximilian S.", tags: ["Paid", "Best Seller"], duration: "68h" },
      book: { title: "Learning React", url: "https://www.oreilly.com/library/view/learning-react-2nd/9781492051718/", provider: "O'Reilly", tags: ["Recommended"] },
      docs: { title: "React Official Docs", url: "https://react.dev", tags: ["Free", "Official"] },
    },
  },
  {
    id: "typescript",
    label: "TypeScript",
    description: "JavaScript with types. TypeScript catches bugs at compile time, improves IDE support, and makes large codebases maintainable. Now required at most tech companies.",
    status: "important",
    resources: {
      youtube: { title: "TypeScript Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=30LWjhZzg50", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "9h" },
      course: { title: "Understanding TypeScript", url: "https://www.udemy.com/course/understanding-typescript/", provider: "Udemy · Maximilian S.", tags: ["Paid"], duration: "22h" },
      book: { title: "Programming TypeScript", url: "https://www.oreilly.com/library/view/programming-typescript/9781492037644/", provider: "O'Reilly", tags: ["Recommended"] },
      docs: { title: "TypeScript Official Handbook", url: "https://www.typescriptlang.org/docs/handbook/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "css-frameworks",
    label: "CSS Frameworks",
    description: "Tailwind CSS and component libraries like shadcn/ui. Tailwind is now the industry standard for rapid UI development — learn utility-first CSS deeply.",
    status: "important",
    resources: {
      youtube: { title: "Tailwind CSS Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=ft30zcMlFa8", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "4h" },
      course: { title: "Tailwind CSS From Scratch", url: "https://www.udemy.com/course/tailwind-from-scratch/", provider: "Udemy · Brad Traversy", tags: ["Paid"], duration: "12h" },
      docs: { title: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs", tags: ["Free", "Official"] },
    },
  },
  {
    id: "nextjs",
    label: "Next.js",
    description: "The React framework for production. App Router, server components, file-based routing, API routes, image optimization, and static/dynamic rendering. The top choice for full-stack React apps.",
    status: "important",
    resources: {
      youtube: { title: "Next.js 14 Full Course – Dave Gray", url: "https://www.youtube.com/watch?v=wm5gMKuwSYk", provider: "Dave Gray", tags: ["Free", "Recommended"], duration: "8h" },
      course: { title: "Next.js & React – The Complete Guide", url: "https://www.udemy.com/course/nextjs-react-the-complete-guide/", provider: "Udemy · Maximilian S.", tags: ["Paid", "Best Seller"], duration: "25h" },
      docs: { title: "Next.js Official Docs", url: "https://nextjs.org/docs", tags: ["Free", "Official"] },
    },
  },
  {
    id: "frontend-testing",
    label: "Testing & Performance",
    description: "Jest, React Testing Library, Lighthouse, Core Web Vitals, and bundle optimization. Untested and slow frontends don't survive production — these skills separate juniors from seniors.",
    status: "optional",
    resources: {
      youtube: { title: "React Testing Library – Codevolution", url: "https://www.youtube.com/watch?v=T2sv8jXoP4s", provider: "Codevolution", tags: ["Free", "Recommended"], duration: "3h" },
      course: { title: "JavaScript Unit Testing – Udemy", url: "https://www.udemy.com/course/javascript-unit-testing-the-practical-guide/", provider: "Udemy", tags: ["Paid"], duration: "8h" },
      docs: { title: "Web.dev – Core Web Vitals", url: "https://web.dev/vitals/", tags: ["Free", "Official"] },
    },
  },
];
