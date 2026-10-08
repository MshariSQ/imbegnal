// Cheap, advisory scan for code that looks like it probes the network. The
// sandbox (no network namespace, see docs/CODE_LAB.md section 4) is the real
// control; this only feeds the abuse counter, so it must stay conservative:
// ordinary socket programming against localhost, or a URL inside a string that
// is merely printed, must NOT match. It never blocks a run by itself.

const PATTERNS: readonly RegExp[] = [
  // Bash raw-socket pseudo files
  /\/dev\/(?:tcp|udp)\//,
  // Network CLI tools pointed at a URL, host name or IPv4 address
  /\b(?:curl|wget|nc|ncat|netcat|nmap|telnet)\s+(?:-\S+\s+)*(?:https?:\/\/|\d{1,3}(?:\.\d{1,3}){3}\b|[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}\b)/i,
  // Cloud metadata endpoints
  /169\.254\.169\.254|metadata\.google\.internal/i,
  // HTTP client call whose argument is a non-local http(s) URL
  /\b(?:requests\.(?:get|post|put|head|request)|urllib\.request\.urlopen|urlopen|fetch|axios(?:\.\w+)?|https?\.(?:get|request)|http\.(?:Get|Post)|file_get_contents|curl_init|Net::HTTP\.\w+|URI\.open|open-uri|reqwest::\w+|HttpClient\w*|WebClient|new URL|URL\()\s*[(\s:]\s*[@rf]?["'`]https?:\/\/(?!localhost\b|127\.0\.0\.1\b|\[::1\])/i,
  // Raw socket connect to an IPv4 literal that is not loopback
  /\b(?:connect|connect_ex|Dial|DialTimeout|Socket|TcpStream::connect|TCPSocket\.new|fsockopen)\s*\(?[^\n]{0,40}?["'(\s,]((?:\d{1,3}\.){3}\d{1,3})\b(?<!(?:127\.0\.0\.1|0\.0\.0\.0))/,
];

/** True when `code` matches an obvious network-probe signature. */
export function looksLikeNetworkProbe(code: string): boolean {
  // Only look at a bounded prefix: the scan must stay cheap on a 64 KiB submission.
  const text = code.length > 32_768 ? code.slice(0, 32_768) : code;
  return PATTERNS.some((re) => re.test(text));
}
