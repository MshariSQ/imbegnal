// Entry point used by worker/src/index.ts.
import type { Env } from "../util";
import { defaultDeps } from "./deps";
import { routeChallengesApi } from "./routes";

/** Handles the Challenges / leaderboard / certificate / instructor routes; null when the path is not one of them. */
export function handleChallengesApi(req: Request, env: Env, origin: string): Promise<Response | null> {
  return routeChallengesApi(req, env, origin, defaultDeps);
}
