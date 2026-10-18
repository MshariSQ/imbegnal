import type { Lesson } from "../types";

/** Lesson registry fragment for the networking track: add `"networking/<node-id>": () => import("./<file>")`. */
export const networkingLessons: Record<string, () => Promise<{ lesson: Lesson }>> = {
  "networking/osi-tcpip": () => import("./osi-tcpip"),
  "networking/ip-subnetting": () => import("./ip-subnetting"),
  "networking/transport-tcp-udp": () => import("./transport-tcp-udp"),
  "networking/dns-http-tls": () => import("./dns-http-tls"),
  "networking/routing-switching": () => import("./routing-switching"),
  "networking/network-troubleshooting": () => import("./network-troubleshooting"),
  "networking/wireless-vpn-firewalls": () => import("./wireless-vpn-firewalls"),
  "networking/network-security-basics": () => import("./network-security-basics"),
};
