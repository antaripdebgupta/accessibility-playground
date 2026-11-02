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
      <MobilePaneTabs activePane={mobilePane} onChangePane={setMobilePane} />
      <div className="min-h-0 flex-1 overflow-auto p-2">
        {mobilePane === "editor" && editorPane}
        {mobilePane === "preview" && previewPane}
        {mobilePane === "analysis" && analysisPane}
      </div>
    </div>
  );
}
