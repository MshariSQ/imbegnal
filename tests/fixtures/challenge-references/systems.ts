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
];
