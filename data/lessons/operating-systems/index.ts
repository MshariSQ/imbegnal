import type { Lesson } from "../types";

/** Lesson registry fragment for the operating-systems track: add `"operating-systems/<node-id>": () => import("./<file>")`. */
export const operatingSystemsLessons: Record<string, () => Promise<{ lesson: Lesson }>> = {
  "operating-systems/processes-threads": () => import("./processes-threads"),
  "operating-systems/cpu-scheduling": () => import("./cpu-scheduling"),
  "operating-systems/memory-management": () => import("./memory-management"),
  "operating-systems/files-linux-shell": () => import("./files-linux-shell"),
  "operating-systems/file-systems": () => import("./file-systems"),
  "operating-systems/concurrency-sync": () => import("./concurrency-sync"),
  "operating-systems/virtualization-containers": () => import("./virtualization-containers"),
  "operating-systems/os-security": () => import("./os-security"),
};
