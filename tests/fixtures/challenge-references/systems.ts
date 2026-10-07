/**
 * SPOILER VAULT for the "systems" challenge group (networking, operating-systems, devops,
 * cloud-computing). Reference solutions that prove every challenge is solvable. They are
 * used ONLY by tests/unit/challenges-systems.test.ts and are intentionally public in this
 * open-source repo; they must never be imported by site or Worker code.
 *
 * Flag challenges ship a SOLVER that derives the flag from the public puzzle files (decode,
 * parse, decrypt), never a constant: the tests hash the derived flag against the grader.
 */
import type { ChallengeFile, ChallengeReference } from "../../../shared/challenges";
import { systemsChallenges } from "../../../data/challenges/systems";

export const systemsFlagSolvers: Record<string, (files: ChallengeFile[]) => string> = {};

function solveFlag(id: string): string {
  const meta = systemsChallenges.find((c) => c.id === id);
  const solver = systemsFlagSolvers[id];
  if (!meta || !solver) throw new Error(`no flag solver for ${id}`);
  return solver(meta.files ?? []);
}

export const systemsReferences: ChallengeReference[] = [
  {
    id: "cloud-cost-estimator",
    solutions: {
      python: `import sys


def main():
    tokens = sys.stdin.read().split()
    pos = 0
    tier_count = int(tokens[pos])
    pos += 1
    tiers = []  # (cumulative upper bound in GB, price per GB inside the tier)
    for _ in range(tier_count):
        limit = float("inf") if tokens[pos] == "inf" else float(tokens[pos])
        tiers.append((limit, float(tokens[pos + 1])))
        pos += 2
    customers = int(tokens[pos])
    pos += 1
    for _ in range(customers):
        name, gb = tokens[pos], float(tokens[pos + 1])
        pos += 2
        cost, floor = 0.0, 0.0
        for limit, price in tiers:
            if gb <= floor:
                break
            cost += (min(gb, limit) - floor) * price  # only the slice of usage inside this tier
            floor = limit
        print(f"{name} {cost:.2f}")


main()
`,
      javascript: `const tokens = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean);
let pos = 0;
const tierCount = Number(tokens[pos++]);
const tiers = []; // [cumulative upper bound in GB, price per GB inside the tier]
for (let i = 0; i < tierCount; i++) {
  const limit = tokens[pos] === "inf" ? Infinity : Number(tokens[pos]);
  tiers.push([limit, Number(tokens[pos + 1])]);
  pos += 2;
}
const customers = Number(tokens[pos++]);
for (let i = 0; i < customers; i++) {
  const name = tokens[pos];
  const gb = Number(tokens[pos + 1]);
  pos += 2;
  let cost = 0;
  let floor = 0;
  for (const [limit, price] of tiers) {
    if (gb <= floor) break;
    cost += (Math.min(gb, limit) - floor) * price; // only the slice of usage inside this tier
    floor = limit;
  }
  console.log(name + " " + cost.toFixed(2));
}
`,
    },
  },
  {
    id: "os-clock-faults",
    solutions: {
      python: `def clock_faults(k, refs):
    frames = [None] * k  # page held by each frame
    bits = [0] * k       # reference bits
    hand = 0
    faults = 0
    for page in refs:
        if page in frames:
            bits[frames.index(page)] = 1  # a hit only sets the bit; the hand stays
            continue
        faults += 1
        while frames[hand] is not None and bits[hand] == 1:
            bits[hand] = 0                # second chance: clear the bit and move on
            hand = (hand + 1) % k
        frames[hand] = page
        bits[hand] = 1
        hand = (hand + 1) % k
    return faults
`,
      javascript: `function clockFaults(k, refs) {
  const frames = new Array(k).fill(null); // page held by each frame
  const bits = new Array(k).fill(0); // reference bits
  let hand = 0;
  let faults = 0;
  for (const page of refs) {
    const at = frames.indexOf(page);
    if (at !== -1) {
      bits[at] = 1; // a hit only sets the bit; the hand stays
      continue;
    }
    faults += 1;
    while (frames[hand] !== null && bits[hand] === 1) {
      bits[hand] = 0; // second chance: clear the bit and move on
      hand = (hand + 1) % k;
    }
    frames[hand] = page;
    bits[hand] = 1;
    hand = (hand + 1) % k;
  }
  return faults;
}
`,
    },
  },
  {
    id: "devops-pipeline-order",
    solutions: {
      python: `import sys

jobs = []  # [name, needs] in definition order
for raw in sys.stdin.read().splitlines():
    line = raw.split("#", 1)[0].rstrip()
    text = line.strip()
    if not text:
        continue
    indent = len(line) - len(line.lstrip(" "))
    if indent == 2 and text.endswith(":"):
        jobs.append([text[:-1], []])
    elif indent >= 4 and jobs and text.startswith("needs:"):
        inner = text[len("needs:"):].strip().strip("[]")
        jobs[-1][1] = [part.strip() for part in inner.split(",") if part.strip()]

known = {name for name, _ in jobs}
for name, needs in jobs:
    for dep in needs:
        if dep not in known:
            print(f"error: unknown job {dep}")
            sys.exit(0)

done, order = set(), []
while len(order) < len(jobs):
    for name, needs in jobs:
        if name not in done and all(dep in done for dep in needs):
            done.add(name)
            order.append(name)
            break  # rescan from the top: the earliest defined ready job always wins
    else:
        print("error: cycle")
        sys.exit(0)
print("\\n".join(order))
`,
      javascript: `const jobs = []; // { name, needs } in definition order
for (const raw of require("fs").readFileSync(0, "utf8").split(/\\r?\\n/)) {
  const line = raw.split("#")[0].trimEnd();
  const text = line.trim();
  if (!text) continue;
  const indent = line.length - line.trimStart().length;
  if (indent === 2 && text.endsWith(":")) {
    jobs.push({ name: text.slice(0, -1), needs: [] });
  } else if (indent >= 4 && jobs.length > 0 && text.startsWith("needs:")) {
    const inner = text.slice("needs:".length).trim().replace(/^\\[|\\]$/g, "");
    jobs[jobs.length - 1].needs = inner.split(",").map((part) => part.trim()).filter(Boolean);
  }
}

const known = new Set(jobs.map((job) => job.name));
for (const job of jobs) {
  for (const dep of job.needs) {
    if (!known.has(dep)) {
      console.log("error: unknown job " + dep);
      process.exit(0);
    }
  }
}

const done = new Set();
const order = [];
while (order.length < jobs.length) {
  // the earliest defined ready job always wins
  const next = jobs.find((job) => !done.has(job.name) && job.needs.every((dep) => done.has(dep)));
  if (!next) {
    console.log("error: cycle");
    process.exit(0);
  }
  done.add(next.name);
  order.push(next.name);
}
console.log(order.join("\\n"));
`,
    },
  },
  {
    id: "net-route-aggregator",
    solutions: {
      python: `import sys

tokens = sys.stdin.read().split()
count = int(tokens[0])

intervals = []
for text in tokens[1:1 + count]:
    address, prefix = text.split("/")
    a, b, c, d = (int(part) for part in address.split("."))
    first = (a << 24) | (b << 16) | (c << 8) | d
    intervals.append((first, first + (1 << (32 - int(prefix))) - 1))
intervals.sort()

merged = []
for first, last in intervals:
    if merged and first <= merged[-1][1] + 1:  # overlapping or touching
        merged[-1][1] = max(merged[-1][1], last)
    else:
        merged.append([first, last])

for first, last in merged:
    while first <= last:
        size = 1 << 32
        while first % size != 0 or size > last - first + 1:  # aligned and not past the end
            size >>= 1
        prefix = 32 - (size.bit_length() - 1)
        octets = [(first >> shift) & 255 for shift in (24, 16, 8, 0)]
        print(".".join(map(str, octets)) + "/" + str(prefix))
        first += size
`,
      javascript: `const tokens = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean);
const count = Number(tokens[0]);

// Plain arithmetic: bit operators would wrap at 32 bits.
const intervals = [];
for (const text of tokens.slice(1, 1 + count)) {
  const [address, prefix] = text.split("/");
  const [a, b, c, d] = address.split(".").map(Number);
  const first = ((a * 256 + b) * 256 + c) * 256 + d;
  intervals.push([first, first + 2 ** (32 - Number(prefix)) - 1]);
}
intervals.sort((x, y) => x[0] - y[0]);

const merged = [];
for (const [first, last] of intervals) {
  const top = merged[merged.length - 1];
  if (top && first <= top[1] + 1) top[1] = Math.max(top[1], last); // overlapping or touching
  else merged.push([first, last]);
}

const lines = [];
for (const [start, last] of merged) {
  let first = start;
  while (first <= last) {
    let size = 2 ** 32;
    while (first % size !== 0 || size > last - first + 1) size /= 2; // aligned and not past the end
    const octets = [24, 16, 8, 0].map((shift) => Math.floor(first / 2 ** shift) % 256);
    lines.push(octets.join(".") + "/" + (32 - Math.log2(size)));
    first += size;
  }
}
console.log(lines.join("\\n"));
`,
    },
  },
  {
    id: "os-mlfq",
    solutions: {
      python: `import sys
from collections import deque

tokens = sys.stdin.read().split()
pos = 0
levels = int(tokens[pos]); pos += 1
quanta = [int(tokens[pos + i]) for i in range(levels)]; pos += levels
count = int(tokens[pos]); pos += 1
names, arrival, burst = [], [], []
for _ in range(count):
    names.append(tokens[pos])
    arrival.append(int(tokens[pos + 1]))
    burst.append(int(tokens[pos + 2]))
    pos += 3

order = sorted(range(count), key=lambda i: (arrival[i], i))  # arrival order, ties by input order
queues = [deque() for _ in range(levels)]
remaining = burst[:]
finish = [0] * count
clock, next_arrival, done = 0, 0, 0


def admit(until):
    global next_arrival
    while next_arrival < count and arrival[order[next_arrival]] <= until:
        queues[0].append(order[next_arrival])
        next_arrival += 1


while done < count:
    admit(clock)
    level = next((i for i, q in enumerate(queues) if q), None)
    if level is None:
        clock = arrival[order[next_arrival]]  # idle until the next arrival
        continue
    proc = queues[level].popleft()
    run = min(quanta[level], remaining[proc])
    clock += run
    remaining[proc] -= run
    admit(clock)  # arrivals during the slice enter BEFORE the preempted job is re-queued
    if remaining[proc] == 0:
        finish[proc] = clock
        done += 1
    else:
        queues[min(level + 1, levels - 1)].append(proc)  # used its whole quantum: demote

total = 0
for i in range(count):
    wait = finish[i] - arrival[i] - burst[i]
    total += wait
    print(names[i], finish[i], wait)
print(f"average_wait {total / count:.2f}")
`,
      javascript: `const tokens = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean);
let pos = 0;
const levels = Number(tokens[pos++]);
const quanta = [];
for (let i = 0; i < levels; i++) quanta.push(Number(tokens[pos++]));
const count = Number(tokens[pos++]);
const names = [];
const arrival = [];
const burst = [];
for (let i = 0; i < count; i++) {
  names.push(tokens[pos]);
  arrival.push(Number(tokens[pos + 1]));
  burst.push(Number(tokens[pos + 2]));
  pos += 3;
}

// arrival order, ties by input order
const order = [...Array(count).keys()].sort((a, b) => arrival[a] - arrival[b] || a - b);
const queues = Array.from({ length: levels }, () => []);
const remaining = burst.slice();
const finish = new Array(count).fill(0);
let clock = 0;
let nextArrival = 0;
let done = 0;

function admit(until) {
  while (nextArrival < count && arrival[order[nextArrival]] <= until) queues[0].push(order[nextArrival++]);
}

while (done < count) {
  admit(clock);
  const level = queues.findIndex((q) => q.length > 0);
  if (level === -1) {
    clock = arrival[order[nextArrival]]; // idle until the next arrival
    continue;
  }
  const proc = queues[level].shift();
  const run = Math.min(quanta[level], remaining[proc]);
  clock += run;
  remaining[proc] -= run;
  admit(clock); // arrivals during the slice enter BEFORE the preempted job is re-queued
  if (remaining[proc] === 0) {
    finish[proc] = clock;
    done += 1;
  } else {
    queues[Math.min(level + 1, levels - 1)].push(proc); // used its whole quantum: demote
  }
}

let total = 0;
const lines = [];
for (let i = 0; i < count; i++) {
  const wait = finish[i] - arrival[i] - burst[i];
  total += wait;
  lines.push(names[i] + " " + finish[i] + " " + wait);
}
lines.push("average_wait " + (total / count).toFixed(2));
console.log(lines.join("\\n"));
`,
    },
  },
  {
    id: "cloud-iam-evaluate",
    solutions: {
      python: `import sys


def matches(pattern, text):
    """Glob match: '*' = any run of characters (even empty), '?' = exactly one, all else literal."""
    p = s = 0
    star = -1  # index of the last '*' seen in the pattern
    mark = 0   # where in the text that star currently stops swallowing
    while s < len(text):
        if p < len(pattern) and pattern[p] == "*":
            star, mark = p, s
            p += 1
        elif p < len(pattern) and (pattern[p] == "?" or pattern[p] == text[s]):
            p += 1
            s += 1
        elif star != -1:
            mark += 1  # let the star swallow one more character and retry
            p, s = star + 1, mark
        else:
            return False
    while p < len(pattern) and pattern[p] == "*":
        p += 1
    return p == len(pattern)


statements = []  # (effect, principal, action, resource, [(key, pattern)])
requests = []    # (principal, action, resource, {key: value})
in_requests = False
for raw in sys.stdin.read().splitlines():
    line = raw.strip()
    if not line or line.startswith("#"):
        continue
    if line == "---":
        in_requests = True
        continue
    parts = line.split()
    if in_requests:
        attrs = dict(token.split("=", 1) for token in parts[3:])
        requests.append((parts[0], parts[1], parts[2], attrs))
    else:
        conditions = [tuple(token.split("=", 1)) for token in parts[5:]] if len(parts) > 4 and parts[4] == "when" else []
        statements.append((parts[0], parts[1], parts[2], parts[3], conditions))

for principal, action, resource, attrs in requests:
    allowed = denied = False
    for effect, p_pat, a_pat, r_pat, conditions in statements:
        if not (matches(p_pat, principal) and matches(a_pat, action) and matches(r_pat, resource)):
            continue
        if not all(key in attrs and matches(pat, attrs[key]) for key, pat in conditions):
            continue
        if effect == "DENY":
            denied = True
        else:
            allowed = True
    print("DENY explicit" if denied else "ALLOW" if allowed else "DENY implicit")
`,
      javascript: `// Glob match: '*' = any run of characters (even empty), '?' = exactly one, all else literal.
function matches(pattern, text) {
  let p = 0;
  let s = 0;
  let star = -1; // index of the last '*' seen in the pattern
  let mark = 0; // where in the text that star currently stops swallowing
  while (s < text.length) {
    if (p < pattern.length && pattern[p] === "*") {
      star = p;
      mark = s;
      p += 1;
    } else if (p < pattern.length && (pattern[p] === "?" || pattern[p] === text[s])) {
      p += 1;
      s += 1;
    } else if (star !== -1) {
      mark += 1; // let the star swallow one more character and retry
      p = star + 1;
      s = mark;
    } else {
      return false;
    }
  }
  while (p < pattern.length && pattern[p] === "*") p += 1;
  return p === pattern.length;
}

const split = (token) => {
  const at = token.indexOf("=");
  return [token.slice(0, at), token.slice(at + 1)];
};

const statements = [];
const requests = [];
let inRequests = false;
for (const raw of require("fs").readFileSync(0, "utf8").split(/\\r?\\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  if (line === "---") {
    inRequests = true;
    continue;
  }
  const parts = line.split(/\\s+/);
  if (inRequests) {
    requests.push({ principal: parts[0], action: parts[1], resource: parts[2], attrs: new Map(parts.slice(3).map(split)) });
  } else {
    const conditions = parts.length > 4 && parts[4] === "when" ? parts.slice(5).map(split) : [];
    statements.push({ effect: parts[0], principal: parts[1], action: parts[2], resource: parts[3], conditions });
  }
}

const out = [];
for (const req of requests) {
  let allowed = false;
  let denied = false;
  for (const st of statements) {
    if (!(matches(st.principal, req.principal) && matches(st.action, req.action) && matches(st.resource, req.resource))) continue;
    if (!st.conditions.every(([key, pat]) => req.attrs.has(key) && matches(pat, req.attrs.get(key)))) continue;
    if (st.effect === "DENY") denied = true;
    else allowed = true;
  }
  out.push(denied ? "DENY explicit" : allowed ? "ALLOW" : "DENY implicit");
}
console.log(out.join("\\n"));
`,
    },
  },
];
