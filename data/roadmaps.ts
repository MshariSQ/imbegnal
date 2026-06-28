export interface Roadmap {
  id: string;
  title: string;
  icon: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  duration: string;
  jobs: string[];
  color: string;
  accent: string;
  category: "tech" | "business";
  learners: string;
}

export const roadmaps: Roadmap[] = [
  {
    id: "cyber-security",
    title: "Cyber Security",
    icon: "🛡️",
    description: "From network basics to penetration testing, SOC, and security engineering",
    level: "All Levels",
    duration: "6–12 months",
    jobs: ["SOC Analyst", "Security Engineer", "Penetration Tester"],
    color: "from-red-500/10 to-transparent",
    accent: "#ef4444",
    category: "tech",
    learners: "12.4k",
  },
  {
    id: "artificial-intelligence",
    title: "Artificial Intelligence",
    icon: "🤖",
    description: "Machine learning, deep learning, NLP, and real-world AI applications",
    level: "Intermediate",
    duration: "8–14 months",
    jobs: ["ML Engineer", "AI Researcher", "Data Scientist"],
    color: "from-purple-500/10 to-transparent",
    accent: "#a855f7",
    category: "tech",
    learners: "18.2k",
  },
  {
    id: "data-science",
    title: "Data Science",
    icon: "📊",
    description: "Statistics, Python, SQL, visualization, and business intelligence",
    level: "Beginner",
    duration: "6–10 months",
    jobs: ["Data Analyst", "Data Scientist", "BI Developer"],
    color: "from-blue-500/10 to-transparent",
    accent: "#3b82f6",
    category: "tech",
    learners: "21.7k",
  },
  {
    id: "cloud-computing",
    title: "Cloud Computing",
    icon: "☁️",
    description: "AWS, Azure, GCP — architecture, deployment, and cloud-native services",
    level: "Intermediate",
    duration: "4–8 months",
    jobs: ["Cloud Architect", "Cloud Engineer", "DevOps Engineer"],
    color: "from-cyan-500/10 to-transparent",
    accent: "#06b6d4",
    category: "tech",
    learners: "9.8k",
  },
  {
    id: "devops",
    title: "DevOps",
    icon: "⚙️",
    description: "CI/CD, Docker, Kubernetes, monitoring, and infrastructure as code",
    level: "Intermediate",
    duration: "5–9 months",
    jobs: ["DevOps Engineer", "SRE", "Platform Engineer"],
    color: "from-orange-500/10 to-transparent",
    accent: "#f97316",
    category: "tech",
    learners: "8.3k",
  },
  {
    id: "frontend",
    title: "Frontend Development",
    icon: "🎨",
    description: "HTML, CSS, JavaScript, React, and modern web development",
    level: "Beginner",
    duration: "4–7 months",
    jobs: ["Frontend Developer", "UI Engineer", "React Developer"],
    color: "from-pink-500/10 to-transparent",
    accent: "#ec4899",
    category: "tech",
    learners: "34.5k",
  },
  {
    id: "backend",
    title: "Backend Development",
    icon: "🖥️",
    description: "APIs, databases, authentication, and server-side architecture",
    level: "Intermediate",
    duration: "5–9 months",
    jobs: ["Backend Developer", "API Engineer", "Software Engineer"],
    color: "from-green-500/10 to-transparent",
    accent: "#22c55e",
    category: "tech",
    learners: "27.1k",
  },
  {
    id: "ui-ux",
    title: "UI/UX Design",
    icon: "✏️",
    description: "User research, wireframing, Figma, prototyping, and design systems",
    level: "Beginner",
    duration: "3–6 months",
    jobs: ["UI Designer", "UX Researcher", "Product Designer"],
    color: "from-violet-500/10 to-transparent",
    accent: "#8b5cf6",
    category: "tech",
    learners: "15.9k",
  },
];
