import type { RoadmapNodeInfo } from "./cyber-security";

const OSTEP = {
  title: "Operating Systems: Three Easy Pieces",
  url: "https://pages.cs.wisc.edu/~remzi/OSTEP/",
  provider: "Remzi & Andrea Arpaci-Dusseau",
  tags: ["Free", "Recommended"],
};

export const operatingSystemsNodes: RoadmapNodeInfo[] = [
  {
    id: "processes-threads",
    label: "Processes & Threads",
    description:
      "What a process really is (address space, process control block, states), how fork, exec and wait create and reap processes, and how threads share memory inside one process. Learn to read a process table and reason about zombies and orphans.",
    status: "required",
    resources: {
      book: OSTEP,
      course: { title: "MIT 6.S081: Operating System Engineering (xv6)", url: "https://pdos.csail.mit.edu/6.S081/", provider: "MIT", tags: ["Free", "Hands-on"] },
      docs: { title: "fork(2): Linux manual page", url: "https://man7.org/linux/man-pages/man2/fork.2.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "cpu-scheduling",
    label: "CPU Scheduling",
    description:
      "How the OS decides which ready process runs next: FCFS, SJF, Round Robin, priorities and aging. Compare policies with the standard metrics: waiting time, turnaround time and response time.",
    status: "required",
    resources: {
      book: OSTEP,
      docs: { title: "sched(7): overview of CPU scheduling in Linux", url: "https://man7.org/linux/man-pages/man7/sched.7.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "memory-management",
    label: "Memory Management & Virtual Memory",
    description:
      "Virtual address spaces, paging and page tables, the TLB and page faults, page replacement policies (FIFO, LRU), fragmentation, and allocation strategies such as first-fit and best-fit.",
    status: "required",
    resources: {
      book: OSTEP,
      course: { title: "MIT 6.S081: Operating System Engineering (xv6)", url: "https://pdos.csail.mit.edu/6.S081/", provider: "MIT", tags: ["Free", "Hands-on"] },
      docs: { title: "mmap(2): Linux manual page", url: "https://man7.org/linux/man-pages/man2/mmap.2.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "files-linux-shell",
    label: "Files, Permissions & the Linux Shell",
    description:
      "The Linux directory tree, absolute and relative paths, users, groups and permission bits, redirection and pipes, and the text tools (sort, uniq, cut, awk) that make the shell productive.",
    status: "required",
    resources: {
      book: { title: "The Linux Command Line", url: "https://linuxcommand.org/tlcl.php", provider: "William Shotts", tags: ["Free", "Recommended"] },
      docs: { title: "GNU Bash Reference Manual", url: "https://www.gnu.org/software/bash/manual/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "concurrency-sync",
    label: "Concurrency, Locks & Deadlocks",
    description:
      "Race conditions and critical sections, mutexes, semaphores and condition variables, and how deadlocks arise and are prevented (the four Coffman conditions, consistent lock ordering).",
    status: "important",
    resources: {
      book: OSTEP,
      docs: { title: "pthreads(7): POSIX threads overview", url: "https://man7.org/linux/man-pages/man7/pthreads.7.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "file-systems",
    label: "File Systems & Storage",
    description:
      "How files and directories map onto disk blocks: inodes, directory entries, hard and symbolic links, the page cache and journaling, and the trade-offs between common Linux file systems.",
    status: "important",
    resources: {
      book: OSTEP,
      docs: { title: "inode(7): inode characteristics", url: "https://man7.org/linux/man-pages/man7/inode.7.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "virtualization-containers",
    label: "Virtualization & Containers",
    description:
      "How hypervisors and virtual machines differ from containers, and the Linux kernel features (namespaces and cgroups) that make containers possible. Understand what isolation each approach does and does not give you.",
    status: "important",
    resources: {
      docs: { title: "namespaces(7): Linux namespaces overview", url: "https://man7.org/linux/man-pages/man7/namespaces.7.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "io-devices",
    label: "I/O & Device Drivers",
    description:
      "How the OS talks to hardware: device files, interrupts, DMA, polling versus interrupt-driven I/O, and the role of drivers for block and character devices.",
    status: "optional",
    resources: {
      book: { title: "Linux Device Drivers, Third Edition", url: "https://lwn.net/Kernel/LDD3/", provider: "Corbet, Rubini, Kroah-Hartman", tags: ["Free"] },
      docs: { title: "The Linux Kernel documentation", url: "https://docs.kernel.org/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "os-security",
    label: "OS Security & Hardening",
    description:
      "Users and privileges, least privilege, Linux capabilities, sandboxing with seccomp and namespaces, memory protections such as ASLR and non-executable stacks, and practical hardening: patching, minimal services and auditing.",
    status: "optional",
    resources: {
      docs: { title: "capabilities(7): Linux capabilities", url: "https://man7.org/linux/man-pages/man7/capabilities.7.html", tags: ["Free", "Official"] },
    },
  },
];
