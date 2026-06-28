export interface Certification {
  id: string;
  name: string;
  provider: string;
  providerLogo: string;
  description: string;
  price: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  field: string;
  tags: string[];
  url: string;
  popular: boolean;
}

export const certifications: Certification[] = [
  {
    id: "comptia-security-plus",
    name: "CompTIA Security+",
    provider: "CompTIA",
    providerLogo: "🔐",
    description: "The most recognized entry-level cybersecurity certification worldwide",
    price: "$392",
    difficulty: "Beginner",
    duration: "3–4 months",
    field: "Cyber Security",
    tags: ["Official", "Recommended", "Industry Standard"],
    url: "https://www.comptia.org/certifications/security",
    popular: true,
  },
  {
    id: "aws-solutions-architect",
    name: "AWS Solutions Architect",
    provider: "Amazon",
    providerLogo: "☁️",
    description: "Design and deploy scalable systems on AWS cloud infrastructure",
    price: "$300",
    difficulty: "Intermediate",
    duration: "2–4 months",
    field: "Cloud Computing",
    tags: ["Official", "High Demand", "Top Paying"],
    url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    popular: true,
  },
  {
    id: "google-data-analytics",
    name: "Google Data Analytics",
    provider: "Google",
    providerLogo: "📊",
    description: "Job-ready data analytics skills by Google on Coursera",
    price: "~$200",
    difficulty: "Beginner",
    duration: "6 months",
    field: "Data Science",
    tags: ["Free Audit", "Recommended", "Certificate"],
    url: "https://grow.google/certificates/data-analytics/",
    popular: true,
  },
  {
    id: "cissp",
    name: "CISSP",
    provider: "ISC2",
    providerLogo: "🏆",
    description: "The gold standard for senior information security professionals",
    price: "$749",
    difficulty: "Advanced",
    duration: "6–12 months",
    field: "Cyber Security",
    tags: ["Official", "Senior Level", "High Salary"],
    url: "https://www.isc2.org/certifications/cissp",
    popular: false,
  },
  {
    id: "azure-fundamentals",
    name: "Microsoft Azure Fundamentals",
    provider: "Microsoft",
    providerLogo: "🪟",
    description: "Core cloud concepts and Azure services — perfect starting point",
    price: "$165",
    difficulty: "Beginner",
    duration: "1–2 months",
    field: "Cloud Computing",
    tags: ["Official", "Free Study Materials", "Entry Level"],
    url: "https://learn.microsoft.com/en-us/certifications/azure-fundamentals/",
    popular: true,
  },
  {
    id: "pmp",
    name: "PMP Certification",
    provider: "PMI",
    providerLogo: "📋",
    description: "The world's leading project management certification",
    price: "$555",
    difficulty: "Advanced",
    duration: "3–6 months",
    field: "Project Management",
    tags: ["Official", "High Demand", "Business"],
    url: "https://www.pmi.org/certifications/project-management-pmp",
    popular: true,
  },
];
