import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { roadmaps, type Roadmap } from "../../data/roadmaps";
import { NODE_DATA } from "../../data/roadmap-nodes";
import { curricula } from "../../data/curricula";
import { courses as directory } from "../../data/courses";
import { certifications } from "../../data/certifications";
import { FIELD_TO_TRACK, UNMAPPED_FIELD_LABELS, fieldKey, fieldTrack } from "../../data/field-map";
import { challenges } from "../../data/challenges";
import { catalog } from "../../worker/src/generated/catalog";
import { trackMeta, trackTitle } from "../../lib/catalog";

const ROOT = resolve(import.meta.dirname ?? __dirname, "../..");
const ids = new Set(roadmaps.map((r) => r.id));

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

test("every roadmap has a curriculum and a node list", () => {
  for (const r of roadmaps) {
    assert.ok(curricula[r.id], `${r.id}: no curriculum`);
    assert.ok((NODE_DATA[r.id] ?? []).length > 0, `${r.id}: no roadmap nodes`);
  }
});

test("every track id referenced by curricula is a roadmap id", () => {
  for (const [id, c] of Object.entries(curricula)) {
    assert.ok(ids.has(id), `curricula key ${id}`);
    for (const p of c.prerequisites) if ("track" in p) assert.ok(ids.has(p.track), `${id} prerequisite ${p.track}`);
    for (const t of c.recommendedAfter) assert.ok(ids.has(t), `${id} recommendedAfter ${t}`);
  }
});

test("lessonLinks and lesson registry keys point at real tracks and nodes", () => {
  for (const [id, c] of Object.entries(curricula)) {
    for (const lesson of Object.keys(c.lessonLinks ?? {})) assert.ok((NODE_DATA[id] ?? []).some((n) => n.id === lesson), `${id}/${lesson}`);
    for (const ref of Object.values(c.lessonLinks ?? {}).flatMap((l) => l.challenges ?? [])) {
      if (challenges.length > 0) assert.ok(challenges.some((x) => x.id === ref), `lessonLinks challenge ${ref} is not in the registry`);
    }
  }
  // Registry keys are "<track>/<node>": scan the source, the registry itself is private.
  const keyRe = /"([a-z0-9-]+)\/([a-z0-9-]+)"\s*:\s*\(\)\s*=>\s*import/g;
  let found = 0;
  for (const file of walk(join(ROOT, "data/lessons"))) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(keyRe)) {
      found++;
      assert.ok(ids.has(m[1]), `${relative(ROOT, file)}: unknown track in registry key ${m[1]}/${m[2]}`);
      assert.ok((NODE_DATA[m[1]] ?? []).some((n) => n.id === m[2]), `${relative(ROOT, file)}: registry key ${m[1]}/${m[2]} has no roadmap node`);
    }
  }
  assert.ok(found >= 60, `only ${found} lesson registry keys found (scanner out of date?)`);
});

test("challenge tracks and lesson references are roadmap/lesson ids", () => {
  for (const c of challenges) {
    assert.ok(ids.has(c.track), `challenge ${c.id}: track ${c.track}`);
    for (const key of c.lessons ?? []) {
      const [t, l] = key.split("/");
      assert.ok(ids.has(t) && (NODE_DATA[t] ?? []).some((n) => n.id === l), `challenge ${c.id}: lesson ${key}`);
    }
  }
});

test("the generated Worker catalog only knows roadmap ids and is current", () => {
  for (const t of catalog.tracks) assert.ok(ids.has(t.id), `catalog track ${t.id}`);
  for (const l of catalog.labs) assert.ok(ids.has(l.track), `catalog lab ${l.ref}`);
  assert.deepEqual(catalog.tracks.map((t) => t.id), roadmaps.map((r) => r.id));
  const r = spawnSync(process.execPath, ["--import", "tsx", "scripts/gen-catalog.mts", "--check"], { cwd: ROOT, encoding: "utf8" });
  assert.equal(r.status, 0, `npm run check:catalog failed: ${r.stderr}${r.stdout}`);
});

test("every directory field maps to a roadmap id or a localized 'other' label", () => {
  const fields = new Set([...directory.map((c) => c.field), ...certifications.map((c) => c.field)]);
  for (const f of fields) assert.ok(f in FIELD_TO_TRACK, `field "${f}" is missing from data/field-map.ts`);
  for (const [field, track] of Object.entries(FIELD_TO_TRACK)) {
    if (track === null) {
      const label = UNMAPPED_FIELD_LABELS[field];
      assert.ok(label && label.en && label.ar, `unmapped field "${field}" needs a bilingual label`);
      assert.equal(fieldKey(field), `other:${field}`);
      assert.equal(fieldTrack(field), null);
    } else {
      assert.ok(ids.has(track), `field "${field}" maps to unknown roadmap ${track}`);
      assert.equal(fieldKey(field), track);
    }
  }
  for (const field of Object.keys(UNMAPPED_FIELD_LABELS)) assert.equal(FIELD_TO_TRACK[field], null, `${field} has a label but is mapped`);
});

test("no data file other than roadmaps.ts spells a roadmap title as a display string (except the directory field)", () => {
  const titles = roadmaps.map((r) => r.title);
  const offenders: string[] = [];
  for (const file of walk(join(ROOT, "data"))) {
    const rel = relative(ROOT, file);
    if (rel === "data/roadmaps.ts" || rel === "data/field-map.ts") continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const title of titles) {
        const lit = new RegExp(`(["'\`])${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\1`);
        if (!lit.test(line)) continue;
        if (/^\s*field:\s*["']/.test(line) && /data\/(courses|certifications)\.ts$/.test(rel)) continue; // free-text field, mapped by field-map.ts
        if (/^\s*tags:/.test(line)) continue; // topic tags of external listings, not track names
        if (/^\s*label:/.test(line) && rel.startsWith("data/roadmap-nodes/")) continue; // a topic node ("Networking" inside Cyber Security)
        if (rel === "data/curricula.ts" && /^\s*arabic:/.test(line)) continue; // the Arabic rendering of the name ("DevOps" is not translated)
        if (rel.startsWith("data/lessons/") && !/^\s*(title|name)\s*:/.test(line)) continue; // lesson prose and code samples may use any word
        offenders.push(`${rel}:${i + 1}  ${line.trim().slice(0, 100)}`);
      }
    });
  }
  assert.deepEqual(offenders, [], "route these through roadmaps[] (lib/catalog trackTitle) or the field map");
});

test("renaming a roadmap changes every rendered track title (title helper with a modified copy)", () => {
  const renamed: Roadmap[] = roadmaps.map((r) => (r.id === "devops" ? { ...r, title: "Platform Engineering", icon: "🧰", accent: "#123456" } : r));
  assert.equal(trackTitle("devops"), roadmaps.find((r) => r.id === "devops")?.title);
  assert.equal(trackTitle("devops", "en", renamed), "Platform Engineering");
  assert.equal(trackMeta("devops", renamed)?.title.en, "Platform Engineering");
  assert.equal(trackMeta("devops", renamed)?.icon, "🧰");
  assert.equal(trackMeta("devops", renamed)?.accent, "#123456");
  // other tracks are untouched and every Arabic name comes from the curriculum
  assert.equal(trackTitle("frontend", "en", renamed), trackTitle("frontend"));
  for (const r of roadmaps) {
    assert.equal(trackTitle(r.id, "en"), r.title);
    assert.equal(trackTitle(r.id, "ar"), curricula[r.id].arabic.title);
  }
  assert.equal(trackTitle("no-such-track"), "no-such-track");
  assert.equal(trackMeta("no-such-track"), null);
});
