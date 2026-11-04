import * as React from "react";
import { getChallengeById, type Challenge } from "@/data/challenges";
import { useChallengeMode } from "@/hooks/useChallengeMode";

export interface UseActiveChallengeResult {
  activeChallenge: Challenge | null;
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
  const activeChallenge = React.useMemo<Challenge | null>(
    () => (challengeParam ? (getChallengeById(challengeParam) ?? null) : null),
    [challengeParam]
  );
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
    challengeMode,
    handleLoadSolution,
    handleResetStarter,
  };
}
