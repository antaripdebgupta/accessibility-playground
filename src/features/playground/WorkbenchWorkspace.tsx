import * as React from "react";
import { SplitPane } from "@/components/workbench/SplitPane";
import { MobilePaneTabs, type MobilePaneId } from "./MobilePaneTabs";
import { ChallengeStrip } from "./ChallengeStrip";
import type { Challenge } from "@/data/challenges";
import type { useChallengeMode } from "@/hooks/useChallengeMode";

export interface WorkbenchWorkspaceProps {
  isDesktop: boolean;
  maximizedPane: "editor" | "preview" | "analysis" | null;
  direction: "row" | "column";
  outerPercent: number;
  innerPercent: number;
  setOuterPercent: (val: number) => void;
  setInnerPercent: (val: number) => void;
  mobilePane: MobilePaneId;
  setMobilePane: (pane: MobilePaneId) => void;
  editorPane: React.ReactNode;
  previewPane: React.ReactNode;
  analysisPane: React.ReactNode;
  activeChallenge: Challenge | null;
  challengeMode: ReturnType<typeof useChallengeMode>;
  currentViolationRuleIds: string[];
  onLoadSolution: (challenge: Challenge) => void;
  onResetStarter: (challenge: Challenge) => void;
}

export function WorkbenchWorkspace({
  isDesktop,
  maximizedPane,
  direction,
  outerPercent,
  innerPercent,
  setOuterPercent,
  setInnerPercent,
  mobilePane,
  setMobilePane,
  editorPane,
  previewPane,
  analysisPane,
  activeChallenge,
  challengeMode,
  currentViolationRuleIds,
  onLoadSolution,
  onResetStarter,
}: WorkbenchWorkspaceProps) {
  const [mobileChallengeOpen, setMobileChallengeOpen] = React.useState(false);

  if (isDesktop) {
    return (
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col">
          {maximizedPane === "editor" ? (
            <div className="min-h-0 flex-1 p-2">{editorPane}</div>
          ) : maximizedPane === "preview" ? (
            <div className="min-h-0 flex-1 p-2">{previewPane}</div>
          ) : maximizedPane === "analysis" ? (
            <div className="min-h-0 flex-1 p-2">{analysisPane}</div>
          ) : (
            <SplitPane
              direction={direction}
              size={outerPercent}
              onSizeChange={setOuterPercent}
              min={25}
              max={75}
              primaryId="pane-left"
              primaryLabel="Editor and Preview"
              secondaryLabel="Analysis"
              className="min-h-0 flex-1"
              primary={
                <SplitPane
                  direction="column"
                  size={innerPercent}
                  onSizeChange={setInnerPercent}
                  min={25}
                  max={80}
                  primaryId="pane-editor"
                  primaryLabel="Code editor"
                  secondaryLabel="Live preview"
                  className="h-full"
                  primary={editorPane}
                  secondary={previewPane}
                />
              }
              secondary={analysisPane}
            />
          )}
        </div>
        {activeChallenge && (
          <ChallengeStrip
            challengeMode={challengeMode}
            currentViolationRuleIds={currentViolationRuleIds}
            onLoadSolution={onLoadSolution}
            onResetStarter={onResetStarter}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {activeChallenge && (
        <div className="flex-none border-b border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setMobileChallengeOpen((v) => !v)}
            aria-expanded={mobileChallengeOpen}
            className="flex w-full items-center justify-between gap-2 bg-[var(--color-surface-raised)]/60 px-3 py-2 text-xs font-semibold text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            <span>Challenge: {activeChallenge.title}</span>
            <svg
              className={`h-4 w-4 shrink-0 transition-transform ${mobileChallengeOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {mobileChallengeOpen && (
            <div className="max-h-[50dvh] overflow-y-auto">
              <ChallengeStrip
                challengeMode={challengeMode}
                currentViolationRuleIds={currentViolationRuleIds}
                onLoadSolution={onLoadSolution}
                onResetStarter={onResetStarter}
              />
            </div>
          )}
        </div>
      )}
      <MobilePaneTabs activePane={mobilePane} onChangePane={setMobilePane} />
      <div
        id={`mobile-pane-${mobilePane}`}
        role="tabpanel"
        aria-labelledby={`mobile-tab-${mobilePane}`}
        tabIndex={0}
        className="min-h-0 flex-1 overflow-auto p-2 focus-visible:outline-none"
      >
        {mobilePane === "editor" && editorPane}
        {mobilePane === "preview" && previewPane}
        {mobilePane === "analysis" && analysisPane}
      </div>
    </div>
  );
}
