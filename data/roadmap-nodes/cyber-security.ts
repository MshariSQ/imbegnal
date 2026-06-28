export interface NodeResource {
  title: string;
  url: string;
  provider?: string;
  tags: string[];
  duration?: string;
}

export interface RoadmapNodeInfo {
  id: string;
  label: string;
  description: string;
  status: "required" | "important" | "optional";
  resources: {
    youtube?: NodeResource;
    course?: NodeResource;
    certification?: NodeResource;
    book?: NodeResource;
    docs?: NodeResource;
  };
}

export const cyberSecurityNodes: RoadmapNodeInfo[] = [
  {
    id: "computer-basics",
    label: "Computer Basics",
    description: "Understanding how computers work — hardware, OS, file systems, and networking fundamentals. The foundation for everything in cybersecurity.",
    status: "required",
    resources: {
      youtube: { title: "CS50x – Harvard Introduction", url: "https://www.youtube.com/watch?v=8mAITcNt710", provider: "Harvard", tags: ["Free", "Recommended"], duration: "12h" },
      course: { title: "Google IT Support Certificate", url: "https://www.coursera.org/professional-certificates/google-it-support", provider: "Coursera", tags: ["Free Audit", "Official", "Recommended"], duration: "6 months" },
      book: { title: "How Computers Work", url: "#", provider: "Ron White", tags: ["Recommended"] },
      docs: { title: "CompTIA IT Fundamentals", url: "https://www.comptia.org/certifications/it-fundamentals", tags: ["Official"] },
    },
  },
  {
    id: "networking",
    label: "Networking",
    description: "TCP/IP, DNS, HTTP, subnetting, routing, firewalls, and packet analysis. A solid networking foundation is essential for any cybersecurity role.",
    status: "required",
    resources: {
      youtube: { title: "Networking Fundamentals – Professor Messer", url: "https://www.youtube.com/watch?v=bj-Yfakjllc", provider: "Professor Messer", tags: ["Free", "Recommended"], duration: "8h" },
      course: { title: "Cisco Networking Basics", url: "https://skillsforall.com/course/networking-basics", provider: "Cisco NetAcad", tags: ["Free", "Official"], duration: "2 months" },
      certification: { title: "CompTIA Network+", url: "https://www.comptia.org/certifications/network", provider: "CompTIA", tags: ["Official", "Recommended"], duration: "3 months" },
      book: { title: "Computer Networking: A Top-Down Approach", url: "#", provider: "Kurose & Ross", tags: ["Recommended"] },
      docs: { title: "Cisco Networking Academy", url: "https://www.netacad.com", tags: ["Free", "Official"] },
    },
  },
  {
    id: "linux",
    label: "Linux",
    description: "Command line, file permissions, processes, bash scripting, and system administration. Most security tools run on Linux.",
    status: "required",
    resources: {
      youtube: { title: "Linux for Hackers – NetworkChuck", url: "https://www.youtube.com/watch?v=VbEx7B_PTOE", provider: "NetworkChuck", tags: ["Free", "Recommended"], duration: "5h" },
      course: { title: "Linux Essentials – Cisco NetAcad", url: "https://www.netacad.com/courses/os-it/ndg-linux-essentials", provider: "Cisco", tags: ["Free", "Official"], duration: "70h" },
      certification: { title: "CompTIA Linux+", url: "https://www.comptia.org/certifications/linux", provider: "CompTIA", tags: ["Official"], duration: "3 months" },
      book: { title: "The Linux Command Line", url: "https://linuxcommand.org/tlcl.php", provider: "William Shotts", tags: ["Free", "Recommended"] },
      docs: { title: "Linux Man Pages", url: "https://man7.org/linux/man-pages/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "python",
    label: "Python",
    description: "Scripting for automation, writing exploits, parsing logs, and building security tools. Python is the #1 language in cybersecurity.",
    status: "required",
    resources: {
      youtube: { title: "Python for Beginners – freeCodeCamp", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "4h" },
      course: { title: "Python for Everybody – University of Michigan", url: "https://www.coursera.org/specializations/python", provider: "Coursera", tags: ["Free Audit", "Recommended"], duration: "3 months" },
      book: { title: "Automate the Boring Stuff with Python", url: "https://automatetheboringstuff.com", provider: "Al Sweigart", tags: ["Free", "Recommended"] },
      docs: { title: "Python Official Docs", url: "https://docs.python.org/3/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "cyber-basics",
    label: "Cyber Security Basics",
    description: "Core concepts: CIA triad, threat modeling, common vulnerabilities, attack vectors, cryptography basics, and security frameworks like NIST.",
    status: "required",
    resources: {
      youtube: { title: "Cybersecurity for Beginners – IBM", url: "https://www.youtube.com/watch?v=inWWhr5tnEA", provider: "IBM", tags: ["Free", "Official"], duration: "3h" },
      course: { title: "Google Cybersecurity Certificate", url: "https://grow.google/certificates/cybersecurity/", provider: "Google / Coursera", tags: ["Free Audit", "Official", "Recommended"], duration: "6 months" },
      certification: { title: "CompTIA Security+", url: "https://www.comptia.org/certifications/security", provider: "CompTIA", tags: ["Official", "Recommended", "Industry Standard"], duration: "3 months" },
      book: { title: "Cybersecurity Essentials", url: "#", provider: "Cisco Press", tags: ["Official"] },
      docs: { title: "NIST Cybersecurity Framework", url: "https://www.nist.gov/cyberframework", tags: ["Free", "Official"] },
    },
  },
  {
    id: "web-security",
    label: "Web Security",
    description: "OWASP Top 10, SQL injection, XSS, CSRF, authentication flaws, and how to test and defend web applications.",
    status: "important",
    resources: {
      youtube: { title: "Web App Penetration Testing – TCM Security", url: "https://www.youtube.com/watch?v=2_lswM1S264", provider: "TCM Security", tags: ["Free", "Recommended"], duration: "10h" },
      course: { title: "Web Security Academy", url: "https://portswigger.net/web-security", provider: "PortSwigger", tags: ["Free", "Official", "Recommended"] },
      book: { title: "The Web Application Hacker's Handbook", url: "#", provider: "Stuttard & Pinto", tags: ["Recommended"] },
      docs: { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "soc",
    label: "SOC Analysis",
    description: "Security Operations Center: SIEM tools, log analysis, incident response, threat hunting, and alert triage. Entry-level cybersecurity career path.",
    status: "important",
    resources: {
      youtube: { title: "SOC Analyst Full Course – MyDFIR", url: "https://www.youtube.com/watch?v=Bt5fh3wQUAQ", provider: "MyDFIR", tags: ["Free", "Recommended"], duration: "8h" },
      course: { title: "IBM Cybersecurity Analyst", url: "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst", provider: "IBM / Coursera", tags: ["Free Audit", "Official"], duration: "8 months" },
      certification: { title: "CompTIA CySA+", url: "https://www.comptia.org/certifications/cybersecurity-analyst", provider: "CompTIA", tags: ["Official", "Recommended"] },
      docs: { title: "Splunk Free Training", url: "https://www.splunk.com/en_us/training/free-courses.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "penetration-testing",
    label: "Penetration Testing",
    description: "Ethical hacking methodology: reconnaissance, exploitation, post-exploitation, and reporting. The most exciting and high-paying path in cybersecurity.",
    status: "optional",
    resources: {
      youtube: { title: "Ethical Hacking Full Course – TCM Security", url: "https://www.youtube.com/watch?v=3FNYvj2U0HM", provider: "TCM Security", tags: ["Free", "Recommended"], duration: "15h" },
      course: { title: "TryHackMe – Jr Penetration Tester", url: "https://tryhackme.com/path/outline/jrpenetrationtester", provider: "TryHackMe", tags: ["Paid", "Recommended"], duration: "3 months" },
      certification: { title: "CEH – Certified Ethical Hacker", url: "https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/", provider: "EC-Council", tags: ["Official", "Paid"], duration: "4 months" },
      book: { title: "The Hacker Playbook 3", url: "#", provider: "Peter Kim", tags: ["Recommended"] },
      docs: { title: "PTES – Penetration Testing Standard", url: "http://www.pentest-standard.org", tags: ["Free", "Official"] },
    },
  },
];
