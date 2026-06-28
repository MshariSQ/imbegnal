import type { RoadmapNodeInfo } from "./cyber-security";

export const cloudComputingNodes: RoadmapNodeInfo[] = [
  {
    id: "it-fundamentals",
    label: "IT Fundamentals",
    description: "Networking basics (TCP/IP, DNS, HTTP), virtualization, operating systems, and how servers work. You need this foundation before cloud concepts make sense.",
    status: "required",
    resources: {
      youtube: { title: "Networking Fundamentals – Professor Messer", url: "https://www.youtube.com/watch?v=bj-Yfakjllc", provider: "Professor Messer", tags: ["Free", "Recommended"], duration: "8h" },
      course: { title: "Google IT Support Certificate", url: "https://www.coursera.org/professional-certificates/google-it-support", provider: "Google / Coursera", tags: ["Free Audit", "Recommended"], duration: "6 months" },
      certification: { title: "CompTIA IT Fundamentals (ITF+)", url: "https://www.comptia.org/certifications/it-fundamentals", provider: "CompTIA", tags: ["Official", "Entry Level"] },
      docs: { title: "Cisco NetAcad – IT Essentials", url: "https://www.netacad.com/courses/os-it/it-essentials", tags: ["Free", "Official"] },
    },
  },
  {
    id: "cloud-concepts",
    label: "Cloud Concepts",
    description: "IaaS, PaaS, SaaS, public/private/hybrid cloud, the shared responsibility model, high availability, fault tolerance, and cloud economics. These concepts apply to AWS, Azure, and GCP equally.",
    status: "required",
    resources: {
      youtube: { title: "Cloud Computing Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=M988_fsOSWo", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "4h" },
      course: { title: "AWS Cloud Practitioner Essentials", url: "https://aws.amazon.com/training/learn-about/cloud-practitioner/", provider: "AWS Training", tags: ["Free", "Official"], duration: "6h" },
      certification: { title: "AWS Cloud Practitioner", url: "https://aws.amazon.com/certification/certified-cloud-practitioner/", provider: "AWS", tags: ["Official", "Entry Level"] },
      docs: { title: "Azure Fundamentals Learning Path", url: "https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "aws-core",
    label: "AWS Core Services",
    description: "EC2, S3, RDS, Lambda, VPC, IAM, CloudWatch, and Route 53. AWS has 200+ services — these 8 cover 90% of real-world use cases. AWS is the #1 cloud provider with 33% market share.",
    status: "required",
    resources: {
      youtube: { title: "AWS Certified Cloud Practitioner – freeCodeCamp", url: "https://www.youtube.com/watch?v=SOTamWNgDKc", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "14h" },
      course: { title: "Ultimate AWS Certified Solutions Architect Associate", url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/", provider: "Udemy · Stephane Maarek", tags: ["Paid", "Best Seller"], duration: "27h" },
      certification: { title: "AWS Solutions Architect Associate", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", provider: "AWS", tags: ["Official", "High Demand"] },
      docs: { title: "AWS Documentation", url: "https://docs.aws.amazon.com", tags: ["Free", "Official"] },
    },
  },
  {
    id: "networking-cloud",
    label: "Cloud Networking",
    description: "VPCs, subnets, security groups, load balancers, CDNs (CloudFront), and VPN/Direct Connect. Cloud networking is how you isolate, secure, and connect your cloud resources.",
    status: "required",
    resources: {
      youtube: { title: "AWS VPC Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=g2JOHLHh4rI", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "3h" },
      course: { title: "Architecting with Google Compute Engine", url: "https://www.coursera.org/specializations/gcp-architecture", provider: "Coursera / Google", tags: ["Free Audit"], duration: "3 months" },
      docs: { title: "AWS VPC User Guide", url: "https://docs.aws.amazon.com/vpc/latest/userguide/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "iac",
    label: "Infrastructure as Code",
    description: "Terraform and AWS CloudFormation — define your cloud infrastructure in code, version it, and deploy it automatically. IaC is how professional cloud teams manage infrastructure at scale.",
    status: "important",
    resources: {
      youtube: { title: "Terraform Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=SLB_c_ayRMo", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "13h" },
      course: { title: "HashiCorp Terraform Associate Prep", url: "https://developer.hashicorp.com/terraform/tutorials/certification-003", provider: "HashiCorp", tags: ["Free", "Official"] },
      certification: { title: "HashiCorp Terraform Associate", url: "https://www.hashicorp.com/certification/terraform-associate", provider: "HashiCorp", tags: ["Official"] },
      docs: { title: "Terraform Documentation", url: "https://developer.hashicorp.com/terraform/docs", tags: ["Free", "Official"] },
    },
  },
  {
    id: "cloud-security",
    label: "Cloud Security",
    description: "IAM policies, least privilege, secrets management, encryption at rest/transit, compliance (SOC2, HIPAA), and security auditing with AWS Config and CloudTrail.",
    status: "important",
    resources: {
      youtube: { title: "AWS Security Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=oBf5lrmquYI", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "11h" },
      course: { title: "Security in Google Cloud Specialization", url: "https://www.coursera.org/specializations/security-google-cloud-platform", provider: "Coursera / Google", tags: ["Free Audit"], duration: "3 months" },
      docs: { title: "AWS Security Best Practices", url: "https://aws.amazon.com/architecture/security-identity-compliance/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "serverless-containers",
    label: "Serverless & Containers",
    description: "AWS Lambda, API Gateway, ECS, EKS, and Fargate. Serverless and containers are the modern deployment model — no more managing EC2 instances yourself.",
    status: "important",
    resources: {
      youtube: { title: "AWS Lambda Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=eOBq__h4OJ4", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "6h" },
      course: { title: "Developing on AWS", url: "https://aws.amazon.com/training/learn-about/developer/", provider: "AWS Training", tags: ["Official"] },
      docs: { title: "AWS Lambda Docs", url: "https://docs.aws.amazon.com/lambda/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "cloud-architecture",
    label: "Cloud Architecture",
    description: "AWS Well-Architected Framework, multi-region deployments, disaster recovery, cost optimization, and designing for millions of users. The skills that turn an engineer into an architect.",
    status: "optional",
    resources: {
      youtube: { title: "AWS Well-Architected Framework – AWS", url: "https://www.youtube.com/watch?v=MfxF-FYEFjY", provider: "AWS", tags: ["Free", "Official"] },
      course: { title: "Google Cloud Professional Cloud Architect Prep", url: "https://www.cloudskillsboost.google/paths/12", provider: "Google Cloud Skills Boost", tags: ["Free Credits", "Official"] },
      certification: { title: "AWS Solutions Architect Professional", url: "https://aws.amazon.com/certification/certified-solutions-architect-professional/", provider: "AWS", tags: ["Official", "Advanced"] },
      docs: { title: "AWS Well-Architected Framework", url: "https://aws.amazon.com/architecture/well-architected/", tags: ["Free", "Official"] },
    },
  },
];
