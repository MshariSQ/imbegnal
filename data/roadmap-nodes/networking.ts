import type { RoadmapNodeInfo } from "./cyber-security";

export const networkingNodes: RoadmapNodeInfo[] = [
  {
    id: "osi-tcpip",
    label: "The OSI & TCP/IP Models",
    description: "The layered models that explain how a message travels from one application to another: physical links, frames, packets, segments and data. Learn what each layer does, which protocols and devices live there, and how encapsulation wraps your data on the way down and unwraps it on the way up.",
    status: "required",
    resources: {
      book: { title: "Computer Networking: A Top-Down Approach", url: "https://gaia.cs.umass.edu/kurose_ross/", provider: "Kurose & Ross", tags: ["Recommended"] },
      docs: { title: "RFC 1122 – Requirements for Internet Hosts: Communication Layers", url: "https://www.rfc-editor.org/rfc/rfc1122", provider: "IETF", tags: ["Free", "Official"] },
    },
  },
  {
    id: "ip-subnetting",
    label: "IP Addressing & Subnetting",
    description: "IPv4 and IPv6 addresses, private vs public ranges, CIDR notation, subnet masks and gateways. Learn to work out a network address, broadcast address and usable host range by hand, split a network into subnets (VLSM), and see how routers choose a route with longest-prefix match.",
    status: "required",
    resources: {
      docs: { title: "RFC 4632 – Classless Inter-domain Routing (CIDR)", url: "https://www.rfc-editor.org/rfc/rfc4632", provider: "IETF", tags: ["Free", "Official"] },
      book: { title: "Computer Networking: A Top-Down Approach", url: "https://gaia.cs.umass.edu/kurose_ross/", provider: "Kurose & Ross", tags: ["Recommended"] },
    },
  },
  {
    id: "transport-tcp-udp",
    label: "TCP, UDP & Ports",
    description: "How the transport layer turns raw packet delivery into conversations between programs. Covers ports and sockets, the TCP three-way handshake, reliability, flow and congestion control, connection teardown, the Internet checksum, and when UDP is the better choice.",
    status: "required",
    resources: {
      book: { title: "Beej's Guide to Network Programming", url: "https://beej.us/guide/bgnet/", provider: "Brian \"Beej\" Hall", tags: ["Free", "Recommended"] },
      course: { title: "CS 144: Introduction to Computer Networking", url: "https://cs144.github.io/", provider: "Stanford University", tags: ["Free", "Hands-on"] },
      docs: { title: "RFC 9293 – Transmission Control Protocol (TCP)", url: "https://www.rfc-editor.org/rfc/rfc9293", provider: "IETF", tags: ["Free", "Official"] },
    },
  },
  {
    id: "dns-http-tls",
    label: "DNS, HTTP & TLS",
    description: "What happens between typing a URL and seeing a page: DNS resolution and record types, the HTTP request/response format, status codes and headers, and how TLS authenticates servers with certificates and encrypts the conversation.",
    status: "required",
    resources: {
      docs: { title: "HTTP – MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP", provider: "Mozilla", tags: ["Free", "Official"] },
      book: { title: "High Performance Browser Networking", url: "https://hpbn.co/", provider: "Ilya Grigorik", tags: ["Free", "Recommended"] },
    },
  },
  {
    id: "routing-switching",
    label: "Routing & Switching",
    description: "How traffic moves inside and between networks: Ethernet switches and MAC learning, VLANs, ARP, static and dynamic routing, and the idea behind protocols such as OSPF and BGP. This is the core knowledge behind network engineering roles.",
    status: "important",
    resources: {
      course: { title: "Cisco Networking Academy", url: "https://www.netacad.com/", provider: "Cisco", tags: ["Hands-on"] },
      certification: { title: "CompTIA Network+", url: "https://www.comptia.org/certifications/network", provider: "CompTIA", tags: ["Official", "Vendor-neutral"] },
      docs: { title: "ip(8) – show / manipulate routing, devices and tunnels", url: "https://man7.org/linux/man-pages/man8/ip.8.html", provider: "Linux man-pages", tags: ["Free", "Official"] },
    },
  },
  {
    id: "network-troubleshooting",
    label: "Troubleshooting Tools (ping, traceroute, dig, Wireshark)",
    description: "A practical method for finding where a connection breaks: check the link, the address, the route, the name and the service in turn. Learn ping, traceroute, dig, ss and packet capture with Wireshark or tcpdump, and how to read what they tell you.",
    status: "important",
    resources: {
      book: { title: "Wireshark User's Guide", url: "https://www.wireshark.org/docs/wsug_html_chunked/", provider: "Wireshark Foundation", tags: ["Free", "Official"] },
      docs: { title: "Wireshark Documentation", url: "https://www.wireshark.org/docs/", provider: "Wireshark Foundation", tags: ["Free", "Official"] },
    },
  },
  {
    id: "wireless-vpn-firewalls",
    label: "Wireless, VPNs & Firewalls",
    description: "How Wi-Fi works and how to secure it (WPA2/WPA3), how a VPN builds an encrypted tunnel across an untrusted network, and how stateless and stateful firewalls decide which packets to allow. Includes NAT and the role of DMZs and network segmentation.",
    status: "important",
    resources: {
      docs: { title: "WireGuard – a fast, modern VPN", url: "https://www.wireguard.com/", provider: "WireGuard", tags: ["Free", "Official"] },
    },
  },
  {
    id: "network-security-basics",
    label: "Network Security Basics",
    description: "Common network attacks and the defences that stop them: spoofing, man-in-the-middle, denial of service, port scanning detection, and the principles of least privilege, segmentation and defence in depth. Builds the vocabulary you need before any security specialty.",
    status: "optional",
    resources: {
      docs: { title: "OWASP Foundation", url: "https://owasp.org/", provider: "OWASP", tags: ["Free", "Official"] },
      certification: { title: "CompTIA Security+", url: "https://www.comptia.org/certifications/security", provider: "CompTIA", tags: ["Official", "Vendor-neutral"] },
    },
  },
  {
    id: "cloud-networking-sdn",
    label: "Cloud Networking & SDN",
    description: "Virtual networks in the cloud: VPCs, subnets, route tables, security groups, load balancers and peering, plus the idea of software-defined networking that separates the control plane from the data plane.",
    status: "optional",
    resources: {
      docs: { title: "Amazon VPC Documentation", url: "https://docs.aws.amazon.com/vpc/", provider: "AWS", tags: ["Free", "Official"] },
    },
  },
];
