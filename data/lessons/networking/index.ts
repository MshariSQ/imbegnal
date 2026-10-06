import type { Lesson } from "../types";

/** Lesson registry fragment for the networking track: add `"networking/<node-id>": () => import("./<file>")`. */
export const networkingLessons: Record<string, () => Promise<{ lesson: Lesson }>> = {
  "networking/osi-tcpip": () => import("./osi-tcpip"),
  "networking/ip-subnetting": () => import("./ip-subnetting"),
};
