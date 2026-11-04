import * as React from "react";
import { loadChallenge, type Challenge } from "@/data/challenges";
import { useChallengeMode } from "@/hooks/useChallengeMode";

export type ChallengeLoadingStatus = "idle" | "loading" | "ready" | "error";

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
  onLoadChallenge?: () => void
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
      onLoadChallenge?.();
      setRawHtml(activeChallenge.startHtml);
      setRawCss(activeChallenge.startCss ?? "");
    }
  }, [activeChallenge, setRawHtml, setRawCss, onLoadChallenge]);

  const handleLoadSolution = React.useCallback(
    (c: Challenge) => {
      onLoadChallenge?.();
      setRawHtml(c.solutionHtml);
      setRawCss(c.solutionCss ?? "");
    },
    [setRawHtml, setRawCss, onLoadChallenge]
  );

  const handleResetStarter = React.useCallback(
    (c: Challenge) => {
      onLoadChallenge?.();
      setRawHtml(c.startHtml);
      setRawCss(c.startCss ?? "");
    },
    [setRawHtml, setRawCss, onLoadChallenge]
  );

  return {
    activeChallenge,
    status,
    challengeMode,
    handleLoadSolution,
    handleResetStarter,
  };
}
