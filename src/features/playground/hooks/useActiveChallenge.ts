// Challenge lifecycle loading (dynamic code-splitting of content, loading status, and starter/solution editor synchronization).
import * as React from "react";
import { loadChallenge, type Challenge } from "@/data/challenges";
import { useChallengeMode } from "@/hooks/useChallengeMode";
import type { ExternalEdit } from "@/features/playground/CodeEditor";

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
    loadChallenge(challengeParam)
      .then((challenge) => {
        if (cancelled) return;
        if (challenge) {
          setActiveChallenge(challenge);
          setStatus("ready");
        } else {
          setActiveChallenge(null);
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setActiveChallenge(null);
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [challengeParam]);

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
