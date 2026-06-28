import type { RoadmapNodeInfo } from "./cyber-security";

export const devopsNodes: RoadmapNodeInfo[] = [
  {
    id: "linux-devops",
    label: "Linux & Shell",
    description: "Command line, bash scripting, cron jobs, file permissions, and process management. DevOps engineers live in the terminal — Linux is the operating system of the cloud.",
    status: "required",
    resources: {
      youtube: { title: "Linux for DevOps – TechWorld with Nana", url: "https://www.youtube.com/watch?v=rrB13utjYV4", provider: "TechWorld with Nana", tags: ["Free", "Recommended"], duration: "7h" },
      course: { title: "Linux Fundamentals – KodeKloud", url: "https://kodekloud.com/courses/linux-basics/", provider: "KodeKloud", tags: ["Free", "Hands-on"], duration: "10h" },
      book: { title: "The Linux Command Line", url: "https://linuxcommand.org/tlcl.php", provider: "William Shotts", tags: ["Free", "Recommended"] },
      docs: { title: "Linux Man Pages Online", url: "https://man7.org/linux/man-pages/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "git-devops",
    label: "Git & Version Control",
    description: "Branching strategies (GitFlow, trunk-based), pull requests, merge conflicts, tagging releases, and monorepos. DevOps starts with solid version control practices.",
    status: "required",
    resources: {
      youtube: { title: "Git Branching Strategies – TechWorld with Nana", url: "https://www.youtube.com/watch?v=U_IFGpJDbeU", provider: "TechWorld with Nana", tags: ["Free", "Recommended"], duration: "45m" },
      course: { title: "Introduction to Git & GitHub – Google", url: "https://www.coursera.org/learn/introduction-git-github", provider: "Coursera / Google", tags: ["Free Audit", "Official"], duration: "4 weeks" },
      book: { title: "Pro Git", url: "https://git-scm.com/book/en/v2", provider: "Scott Chacon", tags: ["Free", "Official"] },
      docs: { title: "Git Documentation", url: "https://git-scm.com/doc", tags: ["Free", "Official"] },
    },
  },
  {
    id: "docker",
    label: "Docker",
    description: "Containers, Dockerfiles, images, volumes, networking, and docker-compose. Docker changed software deployment forever — it's the foundation of all modern DevOps.",
    status: "required",
    resources: {
      youtube: { title: "Docker Full Course – TechWorld with Nana", url: "https://www.youtube.com/watch?v=3c-iBn73dDE", provider: "TechWorld with Nana", tags: ["Free", "Recommended"], duration: "3h" },
      course: { title: "Docker & Kubernetes – The Complete Guide", url: "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/", provider: "Udemy · Stephen Grider", tags: ["Paid", "Best Seller"], duration: "22h" },
      book: { title: "Docker Deep Dive", url: "https://www.amazon.com/Docker-Deep-Dive-Nigel-Poulton/dp/1916585256", provider: "Nigel Poulton", tags: ["Recommended"] },
      docs: { title: "Docker Official Docs", url: "https://docs.docker.com", tags: ["Free", "Official"] },
    },
  },
  {
    id: "cicd",
    label: "CI/CD Pipelines",
    description: "GitHub Actions, GitLab CI, Jenkins — automate testing, building, and deploying on every commit. CI/CD is the core practice of DevOps: ship code faster and safer.",
    status: "required",
    resources: {
      youtube: { title: "GitHub Actions Full Course – TechWorld with Nana", url: "https://www.youtube.com/watch?v=R8_veQiYBjI", provider: "TechWorld with Nana", tags: ["Free", "Recommended"], duration: "2h" },
      course: { title: "DevOps, CI/CD with Jenkins – Udemy", url: "https://www.udemy.com/course/devops-ci-cd-pipelines-using-docker-ansible-kubernetes/", provider: "Udemy", tags: ["Paid"], duration: "16h" },
      docs: { title: "GitHub Actions Documentation", url: "https://docs.github.com/en/actions", tags: ["Free", "Official"] },
    },
  },
  {
    id: "kubernetes",
    label: "Kubernetes",
    description: "Pods, deployments, services, ingress, ConfigMaps, Secrets, Helm charts, and cluster management. Kubernetes is the industry standard for container orchestration at scale.",
    status: "important",
    resources: {
      youtube: { title: "Kubernetes Full Course – TechWorld with Nana", url: "https://www.youtube.com/watch?v=X48VuDVv0do", provider: "TechWorld with Nana", tags: ["Free", "Recommended"], duration: "4h" },
      course: { title: "Certified Kubernetes Administrator (CKA) Prep", url: "https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/", provider: "Udemy · Mumshad Mannambeth", tags: ["Paid", "Best Seller"], duration: "19h" },
      certification: { title: "CKA – Certified Kubernetes Administrator", url: "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", provider: "CNCF", tags: ["Official", "High Demand"] },
      docs: { title: "Kubernetes Official Docs", url: "https://kubernetes.io/docs/home/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "iac-devops",
    label: "Infrastructure as Code",
    description: "Terraform for provisioning infrastructure, Ansible for configuration management. Write infrastructure like software: version it, test it, and deploy it automatically.",
    status: "important",
    resources: {
      youtube: { title: "Terraform Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=SLB_c_ayRMo", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "13h" },
      course: { title: "Terraform Zero to Hero – KodeKloud", url: "https://kodekloud.com/courses/terraform-for-beginners/", provider: "KodeKloud", tags: ["Free", "Hands-on"] },
      certification: { title: "HashiCorp Terraform Associate", url: "https://www.hashicorp.com/certification/terraform-associate", provider: "HashiCorp", tags: ["Official"] },
      docs: { title: "Terraform Documentation", url: "https://developer.hashicorp.com/terraform/docs", tags: ["Free", "Official"] },
    },
  },
  {
    id: "monitoring",
    label: "Monitoring & Observability",
    description: "Prometheus, Grafana, ELK Stack (Elasticsearch, Logstash, Kibana), and distributed tracing. If you can't observe it, you can't fix it. Monitoring is what separates DevOps from ops.",
    status: "important",
    resources: {
      youtube: { title: "Prometheus & Grafana – TechWorld with Nana", url: "https://www.youtube.com/watch?v=QoDqxm7ybLc", provider: "TechWorld with Nana", tags: ["Free", "Recommended"], duration: "1h" },
      course: { title: "Monitoring and Observability – KodeKloud", url: "https://kodekloud.com/courses/prometheus-certified-associate/", provider: "KodeKloud", tags: ["Paid", "Hands-on"] },
      docs: { title: "Prometheus Documentation", url: "https://prometheus.io/docs/introduction/overview/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "devsecops",
    label: "DevSecOps",
    description: "Shift security left: SAST/DAST scanning in CI, secrets detection, container image scanning (Trivy), and compliance as code. Security is now a shared DevOps responsibility.",
    status: "optional",
    resources: {
      youtube: { title: "DevSecOps Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=F5KJVuii0Yw", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "6h" },
      course: { title: "DevSecOps – KodeKloud", url: "https://kodekloud.com/courses/devsecops/", provider: "KodeKloud", tags: ["Paid", "Hands-on"] },
      docs: { title: "OWASP DevSecOps Guideline", url: "https://owasp.org/www-project-devsecops-guideline/", tags: ["Free", "Official"] },
    },
  },
];
