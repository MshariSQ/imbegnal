/**
 * SPOILER VAULT for the "web" challenge group (frontend, backend, ui-ux).
 *
 * Reference solutions used ONLY by tests/unit/challenges-web.test.ts to prove every challenge is solvable.
 * This repository is public: these are spoilers by design. They are never imported by the site or the Worker.
 * Flag solvers must DERIVE the flag from the public challenge files, never store it as a constant.
 */
import type { ChallengeReference } from "../../../shared/challenges";

export const webReferences: ChallengeReference[] = [
  {
    id: "fe-specificity-duel",
    solutions: {
      python: String.raw`
import re
import sys

TOKEN = re.compile(r'\[[^\]]*\]|::[\w-]+|:[\w-]+(?:\([^)]*\))?|#[\w-]+|\.[\w-]+|[A-Za-z][\w-]*')


def specificity(selector):
    a = b = c = 0
    for token in TOKEN.findall(selector):
        if token[0] == '#':
            a += 1
        elif token[0] in '.[' or (token[0] == ':' and token[1] != ':'):
            b += 1
        else:  # type selector or ::pseudo-element
            c += 1
    return (a, b, c)


lines = sys.stdin.read().split("\n")
n = int(lines[0])
best, winner = None, 0
for i, selector in enumerate(lines[1:1 + n], start=1):
    s = specificity(selector)
    if best is None or s >= best:  # >= : the later rule wins ties
        best, winner = s, i
print(winner, "%d,%d,%d" % best)
`,
      javascript: String.raw`
const lines = require("fs").readFileSync(0, "utf8").split("\n");
const n = parseInt(lines[0], 10);
const TOKEN = /\[[^\]]*\]|::[\w-]+|:[\w-]+(?:\([^)]*\))?|#[\w-]+|\.[\w-]+|[A-Za-z][\w-]*/g;

function specificity(selector) {
  const s = [0, 0, 0];
  for (const token of selector.match(TOKEN) || []) {
    if (token[0] === "#") s[0]++;
    else if (token[0] === "." || token[0] === "[" || (token[0] === ":" && token[1] !== ":")) s[1]++;
    else s[2]++; // type selector or ::pseudo-element
  }
  return s;
}

const cmp = (x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
let best = null;
let winner = 0;
for (let i = 1; i <= n; i++) {
  const s = specificity(lines[i]);
  if (best === null || cmp(s, best) >= 0) {
    best = s;
    winner = i;
  }
}
console.log(winner + " " + best.join(","));
`,
    },
  },
  {
    id: "be-http-status",
    solutions: {
      python: String.raw`
import sys

lines = sys.stdin.read().split("\n")
n = int(lines[0])


def status(f):
    body_methods = f["method"] in ("POST", "PUT", "PATCH")
    if f["route"] == "unknown":
        return 404
    if f["route"] == "wrong-method":
        return 405
    if f["rate"] == "exceeded":
        return 429
    if f["auth"] != "valid":
        return 401
    if f["perm"] == "no":
        return 403
    if f["item"] == "missing":
        return 404
    if f["item"] == "deleted":
        return 410
    if body_methods and f["media"] == "other":
        return 415
    if body_methods and f["body"] == "malformed":
        return 400
    if body_methods and f["body"] == "invalid":
        return 422
    if f["conflict"] == "yes":
        return 409
    return {"POST": 201, "DELETE": 204}.get(f["method"], 200)


for line in lines[1:1 + n]:
    print(status(dict(pair.split("=") for pair in line.split())))
`,
      javascript: String.raw`
const lines = require("fs").readFileSync(0, "utf8").split("\n");
const n = parseInt(lines[0], 10);

function status(f) {
  const bodyMethods = ["POST", "PUT", "PATCH"].includes(f.method);
  if (f.route === "unknown") return 404;
  if (f.route === "wrong-method") return 405;
  if (f.rate === "exceeded") return 429;
  if (f.auth !== "valid") return 401;
  if (f.perm === "no") return 403;
  if (f.item === "missing") return 404;
  if (f.item === "deleted") return 410;
  if (bodyMethods && f.media === "other") return 415;
  if (bodyMethods && f.body === "malformed") return 400;
  if (bodyMethods && f.body === "invalid") return 422;
  if (f.conflict === "yes") return 409;
  if (f.method === "POST") return 201;
  if (f.method === "DELETE") return 204;
  return 200;
}

for (const line of lines.slice(1, 1 + n)) {
  console.log(status(Object.fromEntries(line.split(" ").map((pair) => pair.split("=")))));
}
`,
    },
  },
  {
    id: "ux-contrast-ratio",
    solutions: {
      python: String.raw`
import sys


def channel(v):
    c = v / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(color):
    h = color[1:]
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


lines = sys.stdin.read().split("\n")
n = int(lines[0])
for line in lines[1:1 + n]:
    la, lb = (luminance(c) for c in line.split())
    ratio = (max(la, lb) + 0.05) / (min(la, lb) + 0.05)
    verdict = lambda ok: "PASS" if ok else "FAIL"
    print("%.2f %s %s %s" % (ratio, verdict(ratio >= 4.5), verdict(ratio >= 3), verdict(ratio >= 7)))
`,
      javascript: String.raw`
const lines = require("fs").readFileSync(0, "utf8").split("\n");
const n = parseInt(lines[0], 10);

function channel(v) {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(color) {
  let h = color.slice(1);
  if (h.length === 3) h = h.split("").map((ch) => ch + ch).join("");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

const verdict = (ok) => (ok ? "PASS" : "FAIL");
for (const line of lines.slice(1, 1 + n)) {
  const [la, lb] = line.split(" ").map(luminance);
  const ratio = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  console.log(ratio.toFixed(2) + " " + verdict(ratio >= 4.5) + " " + verdict(ratio >= 3) + " " + verdict(ratio >= 7));
}
`,
    },
  },
  {
    id: "be-jwt-expiry",
    solutions: {
      python: String.raw`
def _is_int(value):
    return isinstance(value, int) and not isinstance(value, bool)


def token_status(claims, now, leeway):
    if "exp" not in claims or not _is_int(claims["exp"]):
        return "malformed"
    if "nbf" in claims and not _is_int(claims["nbf"]):
        return "malformed"
    if claims.get("iss") != "imbegnal":
        return "wrong_issuer"
    aud = claims.get("aud")
    if isinstance(aud, str):
        audience_ok = aud == "api"
    elif isinstance(aud, list):
        audience_ok = "api" in aud
    else:
        audience_ok = False
    if not audience_ok:
        return "wrong_audience"
    if "nbf" in claims and now + leeway < claims["nbf"]:
        return "not_yet_valid"
    if now >= claims["exp"] + leeway:
        return "expired"
    return "valid"
`,
      javascript: String.raw`
function tokenStatus(claims, now, leeway) {
  const has = (key) => Object.prototype.hasOwnProperty.call(claims, key);
  if (!has("exp") || !Number.isInteger(claims.exp)) return "malformed";
  if (has("nbf") && !Number.isInteger(claims.nbf)) return "malformed";
  if (claims.iss !== "imbegnal") return "wrong_issuer";
  const aud = claims.aud;
  const audienceOk = typeof aud === "string" ? aud === "api" : Array.isArray(aud) && aud.includes("api");
  if (!audienceOk) return "wrong_audience";
  if (has("nbf") && now + leeway < claims.nbf) return "not_yet_valid";
  if (now >= claims.exp + leeway) return "expired";
  return "valid";
}
`,
    },
  },
];
