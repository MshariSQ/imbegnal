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
];
