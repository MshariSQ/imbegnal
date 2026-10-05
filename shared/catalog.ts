/**
 * Compact, server-side view of the course catalog, GENERATED from the canonical
 * data (data/roadmaps.ts, lib/catalog.ts, data/lessons/**) by
 * scripts/gen-catalog.mts into worker/src/generated/catalog.ts.
 *
 * Why generate instead of importing lessons into the Worker: lesson bodies are
 * ~2 MB of text the Worker never needs. The Worker only needs ids, lesson
 * order (certificates, completion analytics) and the lab-exercise tests it
 * grades against. `npm run check:catalog` fails when this file is stale.
 */
import type { LangId } from "./languages";
import type { MatchMode } from "./challenges";

export interface CatalogLabTest {
  name: string; // English test name (feedback is localized client-side by index)
  stdin: string;
  expected: string;
  mode: MatchMode;
  epsilon?: number;
}

export interface CatalogLab {
  /** `${track}/${lesson}/${id}` */
  ref: string;
  track: string;
  lesson: string;
  id: string;
  lang: LangId;
  tests: CatalogLabTest[];
}

export interface CatalogTrack {
  /** Roadmap id: the canonical track id used by courses, challenges and Code Lab. */
  id: string;
  title: string;
  /** Lesson ids in study order. */
  lessons: string[];
}

export interface Catalog {
  tracks: CatalogTrack[];
  labs: CatalogLab[];
}
