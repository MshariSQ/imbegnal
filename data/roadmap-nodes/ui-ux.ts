import type { RoadmapNodeInfo } from "./cyber-security";

export const uiUxNodes: RoadmapNodeInfo[] = [
  {
    id: "design-basics",
    label: "Design Principles",
    description: "Visual hierarchy, alignment, contrast, repetition, and proximity (CARP). Gestalt principles and how the human eye processes visual information. These fundamentals underpin every good design decision.",
    status: "required",
    resources: {
      youtube: { title: "Design Principles Full Course – DesignCourse", url: "https://www.youtube.com/watch?v=_Hp_dI0DzY4", provider: "DesignCourse", tags: ["Free", "Recommended"], duration: "2h" },
      course: { title: "Design Fundamentals – California Institute of the Arts", url: "https://www.coursera.org/learn/fundamentals-of-graphic-design", provider: "Coursera", tags: ["Free Audit"], duration: "4 weeks" },
      book: { title: "The Non-Designer's Design Book", url: "https://www.amazon.com/Non-Designers-Design-Book-4th/dp/0133966151", provider: "Robin Williams", tags: ["Recommended"] },
      docs: { title: "Nielsen Norman Group Articles", url: "https://www.nngroup.com/articles/", tags: ["Free"] },
    },
  },
  {
    id: "typography-color",
    label: "Typography & Color",
    description: "Font pairing, type scale, line height, color theory, color palettes, accessibility contrast ratios (WCAG AA/AAA). Color and type set the tone for every interface.",
    status: "required",
    resources: {
      youtube: { title: "Typography for Beginners – Google Fonts", url: "https://www.youtube.com/watch?v=agbh1wbfJt8", provider: "Google Fonts", tags: ["Free", "Official"], duration: "45m" },
      course: { title: "Typography – California Institute of the Arts", url: "https://www.coursera.org/learn/typography", provider: "Coursera / CalArts", tags: ["Free Audit"], duration: "4 weeks" },
      docs: { title: "Google Fonts", url: "https://fonts.google.com", tags: ["Free", "Official"] },
    },
  },
  {
    id: "figma",
    label: "Figma",
    description: "The industry-standard design tool. Components, variants, auto-layout, prototyping, design tokens, and collaboration. Figma is used by design teams at Google, Airbnb, Stripe, and thousands of companies.",
    status: "required",
    resources: {
      youtube: { title: "Figma Full Course – DesignCourse", url: "https://www.youtube.com/watch?v=FTFaQWZBqQ8", provider: "DesignCourse", tags: ["Free", "Recommended"], duration: "6h" },
      course: { title: "Google UX Design Certificate", url: "https://grow.google/certificates/ux-design/", provider: "Google / Coursera", tags: ["Free Audit", "Recommended"], duration: "6 months" },
      book: { title: "Figma Handbook", url: "https://www.designsystems.com/figma-handbook/", provider: "Design Systems", tags: ["Free"] },
      docs: { title: "Figma Official Documentation", url: "https://help.figma.com/hc/en-us", tags: ["Free", "Official"] },
    },
  },
  {
    id: "user-research",
    label: "User Research",
    description: "User interviews, surveys, usability testing, competitive analysis, and creating personas. Design without research is just guessing. Research turns assumptions into evidence.",
    status: "required",
    resources: {
      youtube: { title: "UX Research Methods – NNGroup", url: "https://www.youtube.com/watch?v=7_sFVYfatXY", provider: "Nielsen Norman Group", tags: ["Free", "Recommended"], duration: "1h" },
      course: { title: "UX Research and Design – University of Michigan", url: "https://www.coursera.org/specializations/michiganux", provider: "Coursera", tags: ["Free Audit"], duration: "4 months" },
      book: { title: "Just Enough Research", url: "https://abookapart.com/products/just-enough-research", provider: "Erika Hall", tags: ["Recommended"] },
      docs: { title: "NNGroup – UX Research Methods", url: "https://www.nngroup.com/articles/which-ux-research-methods/", tags: ["Free"] },
    },
  },
  {
    id: "wireframing",
    label: "Wireframing & IA",
    description: "Information architecture, user flows, low-fidelity wireframes, and sitemaps. Plan before you design. Wireframes answer 'what goes where' before asking 'what does it look like.'",
    status: "important",
    resources: {
      youtube: { title: "Wireframing for UX – AJ&Smart", url: "https://www.youtube.com/watch?v=MwidSAlbEB8", provider: "AJ&Smart", tags: ["Free", "Recommended"], duration: "30m" },
      course: { title: "UX Design Process – Interaction Design Foundation", url: "https://www.interaction-design.org/courses/design-thinking-the-ultimate-guide", provider: "IDF", tags: ["Paid", "Recommended"] },
      docs: { title: "Interaction Design Foundation – IA", url: "https://www.interaction-design.org/literature/topics/information-architecture", tags: ["Free"] },
    },
  },
  {
    id: "prototyping",
    label: "Prototyping",
    description: "High-fidelity interactive prototypes in Figma, micro-interactions, transitions, and user testing your prototypes. Prototypes let you validate ideas before writing a single line of code.",
    status: "important",
    resources: {
      youtube: { title: "Figma Prototyping Full Tutorial – DesignCourse", url: "https://www.youtube.com/watch?v=iBkXf6u8htI", provider: "DesignCourse", tags: ["Free", "Recommended"], duration: "1h" },
      course: { title: "Prototyping and Design – UC San Diego", url: "https://www.coursera.org/learn/interaction-design-capstone", provider: "Coursera", tags: ["Free Audit"] },
      docs: { title: "Figma – Prototyping Guide", url: "https://help.figma.com/hc/en-us/categories/360002042553-Prototyping", tags: ["Free", "Official"] },
    },
  },
  {
    id: "design-systems",
    label: "Design Systems",
    description: "Component libraries, design tokens, documentation, and maintaining consistency across products. Design systems are how companies like Airbnb and IBM design at scale.",
    status: "optional",
    resources: {
      youtube: { title: "Building a Design System – Figma", url: "https://www.youtube.com/watch?v=Dtd40cHQQlk", provider: "Figma", tags: ["Free", "Official"], duration: "1h" },
      course: { title: "Design Systems with Figma – Udemy", url: "https://www.udemy.com/course/design-systems-with-figma/", provider: "Udemy", tags: ["Paid"], duration: "8h" },
      docs: { title: "Design Systems Repo", url: "https://designsystemsrepo.com", tags: ["Free"] },
    },
  },
  {
    id: "accessibility",
    label: "Accessibility (a11y)",
    description: "WCAG 2.1 guidelines, color contrast, screen readers, keyboard navigation, and inclusive design patterns. Accessible design is both a legal requirement and the right thing to do.",
    status: "optional",
    resources: {
      youtube: { title: "Web Accessibility – Google", url: "https://www.youtube.com/playlist?list=PLNYkxOF6rcICWx0C9LVWWVqvHlYJyqw7g", provider: "Google", tags: ["Free", "Official"] },
      course: { title: "Web Accessibility – Google / Udacity", url: "https://www.udacity.com/course/web-accessibility--ud891", provider: "Udacity / Google", tags: ["Free", "Official"] },
      docs: { title: "WCAG 2.1 Guidelines", url: "https://www.w3.org/TR/WCAG21/", tags: ["Free", "Official"] },
    },
  },
];
