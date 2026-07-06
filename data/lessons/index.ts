import type { Lesson } from "./types";

const registry: Record<string, () => Promise<{ lesson: Lesson }>> = {
  "frontend/html-css": () => import("./frontend/html-css"),
  "frontend/javascript": () => import("./frontend/javascript"),
  "frontend/git": () => import("./frontend/git"),
  "frontend/react": () => import("./frontend/react"),
  "frontend/typescript": () => import("./frontend/typescript"),
  "frontend/css-frameworks": () => import("./frontend/css-frameworks"),
  "frontend/nextjs": () => import("./frontend/nextjs"),
  "frontend/frontend-testing": () => import("./frontend/frontend-testing"),
  "frontend/getting-paid": () => import("./frontend/getting-paid"),

  "cyber-security/setup": () => import("./cyber-security/setup"),
  "cyber-security/computer-basics": () => import("./cyber-security/computer-basics"),
  "cyber-security/networking": () => import("./cyber-security/networking"),
  "cyber-security/linux": () => import("./cyber-security/linux"),
  "cyber-security/python": () => import("./cyber-security/python"),
  "cyber-security/cyber-basics": () => import("./cyber-security/cyber-basics"),
  "cyber-security/web-security": () => import("./cyber-security/web-security"),
  "cyber-security/soc": () => import("./cyber-security/soc"),
  "cyber-security/penetration-testing": () => import("./cyber-security/penetration-testing"),

  "backend/programming-basics": () => import("./backend/programming-basics"),
  "backend/databases": () => import("./backend/databases"),
  "backend/apis-rest": () => import("./backend/apis-rest"),
  "backend/authentication": () => import("./backend/authentication"),
  "backend/nodejs": () => import("./backend/nodejs"),
  "backend/caching-queues": () => import("./backend/caching-queues"),
  "backend/devops-backend": () => import("./backend/devops-backend"),
  "backend/system-design": () => import("./backend/system-design"),

  "artificial-intelligence/python-for-ai": () => import("./artificial-intelligence/python-for-ai"),
  "artificial-intelligence/math-for-ml": () => import("./artificial-intelligence/math-for-ml"),
  "artificial-intelligence/machine-learning": () => import("./artificial-intelligence/machine-learning"),
  "artificial-intelligence/deep-learning": () => import("./artificial-intelligence/deep-learning"),
  "artificial-intelligence/nlp": () => import("./artificial-intelligence/nlp"),
  "artificial-intelligence/computer-vision": () => import("./artificial-intelligence/computer-vision"),
  "artificial-intelligence/mlops": () => import("./artificial-intelligence/mlops"),
  "artificial-intelligence/generative-ai": () => import("./artificial-intelligence/generative-ai"),

  "data-science/statistics": () => import("./data-science/statistics"),
  "data-science/python-data": () => import("./data-science/python-data"),
  "data-science/sql-data-science": () => import("./data-science/sql-data-science"),
  "data-science/data-visualization": () => import("./data-science/data-visualization"),
  "data-science/machine-learning-ds": () => import("./data-science/machine-learning-ds"),
  "data-science/data-engineering": () => import("./data-science/data-engineering"),
  "data-science/bi-tools": () => import("./data-science/bi-tools"),
  "data-science/data-science-portfolio": () => import("./data-science/data-science-portfolio"),

  "cloud-computing/it-fundamentals": () => import("./cloud-computing/it-fundamentals"),
  "cloud-computing/cloud-concepts": () => import("./cloud-computing/cloud-concepts"),
  "cloud-computing/aws-core": () => import("./cloud-computing/aws-core"),
  "cloud-computing/networking-cloud": () => import("./cloud-computing/networking-cloud"),
  "cloud-computing/iac": () => import("./cloud-computing/iac"),
  "cloud-computing/cloud-security": () => import("./cloud-computing/cloud-security"),
  "cloud-computing/serverless-containers": () => import("./cloud-computing/serverless-containers"),
  "cloud-computing/cloud-architecture": () => import("./cloud-computing/cloud-architecture"),

  "devops/linux-devops": () => import("./devops/linux-devops"),
  "devops/git-devops": () => import("./devops/git-devops"),
  "devops/docker": () => import("./devops/docker"),
  "devops/cicd": () => import("./devops/cicd"),
  "devops/kubernetes": () => import("./devops/kubernetes"),
  "devops/iac-devops": () => import("./devops/iac-devops"),
  "devops/monitoring": () => import("./devops/monitoring"),
  "devops/devsecops": () => import("./devops/devsecops"),

  "ui-ux/design-basics": () => import("./ui-ux/design-basics"),
  "ui-ux/typography-color": () => import("./ui-ux/typography-color"),
  "ui-ux/figma": () => import("./ui-ux/figma"),
  "ui-ux/user-research": () => import("./ui-ux/user-research"),
  "ui-ux/wireframing": () => import("./ui-ux/wireframing"),
  "ui-ux/prototyping": () => import("./ui-ux/prototyping"),
  "ui-ux/design-systems": () => import("./ui-ux/design-systems"),
  "ui-ux/accessibility": () => import("./ui-ux/accessibility"),
};

export function hasLesson(roadmapId: string, nodeId: string): boolean {
  return `${roadmapId}/${nodeId}` in registry;
}

export async function loadLesson(roadmapId: string, nodeId: string): Promise<Lesson | null> {
  const loader = registry[`${roadmapId}/${nodeId}`];
  if (!loader) return null;
  const mod = await loader();
  return mod.lesson;
}
