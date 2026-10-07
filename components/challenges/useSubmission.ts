"use client";

import { useCallback, useEffect, useState } from "react";
import type { SubmitRequest, SubmitResponse } from "@/shared/api";
import { getToken, useAuthUser } from "@/lib/auth";
import { submitChallenge } from "@/lib/ctf/api";
import { classifyFailure, type SubmitFailureKind } from "@/lib/ctf/errors";
import { recordAttempt, recordSolve } from "@/lib/ctf/use-ctf";

export type SubmissionState =
  | { phase: "idle" }
  | { phase: "pending" }
  | { phase: "done"; res: SubmitResponse }
  | { phase: "error"; kind: SubmitFailureKind; resetAt?: string };

/**
 * Submit to POST /api/challenges/:id/submit and keep the shared stats in sync.
 * Signed-out visitors never hit the network: they get the sign-in prompt.
 * A 429 rate_limited answer starts a visible countdown that blocks resubmits.
 */
export function useSubmission(challengeId: string) {
  const user = useAuthUser();
  const [state, setState] = useState<SubmissionState>({ phase: "idle" });
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const submit = useCallback(
    async (req: SubmitRequest) => {
      const token = user ? getToken() : null;
      if (!token) {
        setState({ phase: "error", kind: "signin" });
        return;
      }
      setState({ phase: "pending" });
      try {
        const res = await submitChallenge(challengeId, req, token);
        setState({ phase: "done", res });
        if (res.correct) recordSolve(challengeId, res, user ? { name: user.name, username: user.username } : undefined);
        else recordAttempt(challengeId);
      } catch (e) {
        const f = classifyFailure(e);
        if (f.kind === "rate" && f.retryAfterSec !== undefined) setCooldown(Math.ceil(f.retryAfterSec));
        const resetAt = (e as { body?: { resetAt?: string } }).body?.resetAt;
        setState({ phase: "error", kind: f.kind, resetAt });
      }
    },
    [challengeId, user]
  );

  return { state, submit, cooldown, signedIn: !!user };
}
