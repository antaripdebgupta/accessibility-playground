import * as React from "react";
import { loadChallenge, type Challenge } from "@/data/challenges";
import { useChallengeMode } from "@/hooks/useChallengeMode";
import { useLatest } from "@/hooks/useLatest";
import type { ExternalEdit } from "@/features/playground/CodeEditor";
import { useToast } from "@accessly-ui/react";
import { reportError } from "@/lib/report-error";
import { DEFAULT_DOCUMENT } from "@/data/default-document";

type ChallengeLoadingStatus = "idle" | "loading" | "ready" | "error";

export interface UseActiveChallengeResult {
  activeChallenge: Challenge | null;
  status: ChallengeLoadingStatus;
  challengeMode: ReturnType<typeof useChallengeMode>;
  handleLoadSolution: (challenge: Challenge) => void;
  handleResetStarter: (challenge: Challenge) => void;
}

export function useActiveChallenge(
  challengeParam: string | null,
  setRawHtml: (html: string) => void,
  setRawCss: (css: string) => void,
  pushExternalEdit?: (kind: ExternalEdit["kind"], text: string) => void
): UseActiveChallengeResult {
  const toast = useToast();
  const toastRef = useLatest(toast);
  const callbacksRef = useLatest({
    setRawHtml,
    setRawCss,
    pushExternalEdit,
  });

  const [activeChallenge, setActiveChallenge] =
    React.useState<Challenge | null>(null);
  const [status, setStatus] = React.useState<ChallengeLoadingStatus>(
    challengeParam ? "loading" : "idle"
  );
  const [prevParam, setPrevParam] = React.useState<string | null>(
    challengeParam
  );

  if (prevParam !== challengeParam) {
    setPrevParam(challengeParam);
    if (!challengeParam) {
      setActiveChallenge(null);
      setStatus("idle");
    } else {
      setStatus("loading");
    }
  }

  // Load challenge content asynchronously when the param changes
  React.useEffect(() => {
    if (!challengeParam) return;
    let cancelled = false;

    const handleFailure = (
      err?: unknown,
      reason: "unknown-id" | "load-failed" = "load-failed"
    ) => {
      if (cancelled) return;
      setActiveChallenge(null);
      setStatus("error");
      reportError(
        err ?? new Error(`Failed to load challenge: ${challengeParam}`),
        {
          challengeId: challengeParam,
          reason,
        }
      );
      toastRef.current.push({
        title: "Challenge error",
        description:
          "Couldn't load this challenge. Showing the default example.",
        variant: "danger",
      });
      callbacksRef.current.setRawHtml(DEFAULT_DOCUMENT.html);
      callbacksRef.current.setRawCss(DEFAULT_DOCUMENT.css);
      callbacksRef.current.pushExternalEdit?.("replace", DEFAULT_DOCUMENT.html);
    };

    loadChallenge(challengeParam)
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setActiveChallenge(res.challenge);
          setStatus("ready");
        } else {
          handleFailure(undefined, res.reason);
        }
      })
      .catch((err) => {
        handleFailure(err, "load-failed");
      });

    return () => {
      cancelled = true;
    };
  }, [challengeParam, callbacksRef, toastRef]);

  const challengeMode = useChallengeMode(activeChallenge);

  const loadedChallengeRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (activeChallenge && loadedChallengeRef.current !== activeChallenge.id) {
      loadedChallengeRef.current = activeChallenge.id;
      setRawHtml(activeChallenge.startHtml);
      setRawCss(activeChallenge.startCss ?? "");
      pushExternalEdit?.("replace", activeChallenge.startHtml);
    }
  }, [activeChallenge, setRawHtml, setRawCss, pushExternalEdit]);

  const handleLoadSolution = React.useCallback(
    (c: Challenge) => {
      setRawHtml(c.solutionHtml);
      setRawCss(c.solutionCss ?? "");
      pushExternalEdit?.("replace", c.solutionHtml);
    },
    [setRawHtml, setRawCss, pushExternalEdit]
  );

  const handleResetStarter = React.useCallback(
    (c: Challenge) => {
      setRawHtml(c.startHtml);
      setRawCss(c.startCss ?? "");
      pushExternalEdit?.("replace", c.startHtml);
    },
    [setRawHtml, setRawCss, pushExternalEdit]
  );

  return {
    activeChallenge,
    status,
    challengeMode,
    handleLoadSolution,
    handleResetStarter,
  };
}
