import type { RoadmapNodeInfo } from "./cyber-security";

export const reverseEngineeringNodes: RoadmapNodeInfo[] = [
  {
    id: "how-programs-run",
    label: "How Programs Run: Compile, Link, Load",
    description: "The journey from source code to a live process: compiling, assembling, linking, loading, memory layout, byte order and the ELF container. Everything you reverse later is a product of these steps, and this node also sets the legal and ethical ground rules.",
    status: "required",
    resources: {
      course: { title: "CS50x: Introduction to Computer Science", url: "https://cs50.harvard.edu/x/", provider: "Harvard", tags: ["Free", "Recommended"] },
      book: { title: "Computer Systems: A Programmer's Perspective", url: "https://csapp.cs.cmu.edu/", provider: "Bryant & O'Hallaron", tags: ["Recommended"] },
      docs: { title: "Beej's Guide to C Programming", url: "https://beej.us/guide/bgc/", provider: "Beej", tags: ["Free"] },
    },
  },
  {
    id: "assembly-basics",
    label: "Assembly Basics (x86-64 & ARM64 concepts)",
    description: "Registers, memory operands, flags, jumps, the stack and calling conventions on x86-64, with the matching ideas on ARM64. You learn to read a small function and say what it computes without running it.",
    status: "required",
    resources: {
      book: { title: "Reverse Engineering for Beginners", url: "https://beginners.re/", provider: "Dennis Yurichev", tags: ["Free", "Recommended"] },
      docs: { title: "Compiler Explorer", url: "https://godbolt.org/", tags: ["Free", "Hands-on"] },
    },
  },
  {
    id: "static-analysis-deobfuscation",
    label: "Static Analysis & Deobfuscation",
    description: "Triage a file without running it: identify it, list its strings and imports, and read disassembly and decompiler output. Then peel layered encodings such as Base64, XOR and ROT13 to reach the real content.",
    status: "required",
    resources: {
      docs: { title: "Ghidra (NSA open-source reverse engineering suite)", url: "https://ghidra-sre.org/", tags: ["Free", "Official"] },
      book: { title: "The Radare2 Book", url: "https://book.rada.re/", tags: ["Free"] },
    },
  },
  {
    id: "debugging-dynamic-analysis",
    label: "Debugging & Dynamic Analysis",
    description: "Run a program under control in a disposable lab: breakpoints, single-stepping, registers and memory, system-call tracing and address rebasing under ASLR. You also meet bytecode virtual machines and learn to write a tiny interpreter to study them.",
    status: "required",
    resources: {
      docs: { title: "GDB Documentation", url: "https://sourceware.org/gdb/documentation/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "binary-formats-tools",
    label: "Binary Formats & Tools (ELF/PE, objdump, Ghidra)",
    description: "Read ELF and PE structure by hand and with tools such as readelf, objdump, nm and a disassembler or decompiler. Learn what sections, segments, imports, exports and relocations tell you about a program.",
    status: "important",
    resources: {
      docs: { title: "elf(5): Executable and Linking Format (man page)", url: "https://man7.org/linux/man-pages/man5/elf.5.html", provider: "man7.org", tags: ["Free", "Official"] },
    },
  },
  {
    id: "malware-analysis-basics",
    label: "Malware Analysis Basics (safe lab practice)",
    description: "How defenders study malicious software safely: an isolated virtual lab with snapshots, static triage first, then behavior observation, and writing down indicators of compromise. The focus is defense and safe handling, never building or deploying malware.",
    status: "optional",
    resources: {
      docs: { title: "MITRE ATT&CK", url: "https://attack.mitre.org/", provider: "MITRE", tags: ["Free", "Official"] },
    },
  },
  {
    id: "legal-ethics-reporting",
    label: "Law, Ethics & Responsible Disclosure",
    description: "What you may analyze, how licenses and anti-circumvention laws shape the work, and how to report a vulnerability responsibly through coordinated disclosure. Law differs by country, so you also learn when to stop and ask for permission or advice.",
    status: "required",
    resources: {
      docs: { title: "EFF Coders' Rights Project", url: "https://www.eff.org/issues/coders", provider: "Electronic Frontier Foundation", tags: ["Free"] },
    },
  },
  {
    id: "anti-reversing-tricks",
    label: "Packers, Anti-Debugging & Obfuscators",
    description: "How software hides its logic and resists analysis: packers, control-flow obfuscation and debugger checks, and how analysts recognize and study them. The emphasis is on spotting these techniques in samples you are permitted to analyze.",
    status: "optional",
    resources: {
      docs: { title: "UPX, the Ultimate Packer for eXecutables", url: "https://upx.github.io/", tags: ["Free", "Official"] },
    },
  },
];
