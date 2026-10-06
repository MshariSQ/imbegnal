// Production wiring of the Challenges handlers: the real Code Lab, abuse-protection and role
// modules, the generated catalog and the joined challenge registry. Tests do not import this
// file; they build a ChallengeDeps from doubles (worker/tests/challenges/helpers).
import { roadmaps } from "../../../data/roadmaps";
import { defaultRegistry } from "../graders/registry";
import { catalog } from "../generated/catalog";
import { recordAbuseSignal, isSuspended } from "../abuse";
import { recordRun, reserveQuota, runOnRunner, settleQuota, toPublicResult } from "../lab/execute";
import { requireRole } from "../roles";
import type { ChallengeDeps } from "./types";

export const defaultDeps: ChallengeDeps = {
  registry: defaultRegistry,
  lab: { reserveQuota, settleQuota, runOnRunner, recordRun, toPublicResult },
  abuse: { recordAbuseSignal, isSuspended },
  requireRole,
  catalog,
  roadmapIds: new Set(roadmaps.map((r) => r.id)),
  now: () => Date.now(),
};
