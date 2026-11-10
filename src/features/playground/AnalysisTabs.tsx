"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@accessly-ui/react";
import { Badge } from "@/components/ui/Badge";
import { Maximize2, Minimize2, AlertCircle } from "lucide-react";
import { PanelBoundary } from "@/components/PanelBoundary";
import { A11yTreePanel } from "./A11yTreePanel";
import { IssuesPanel } from "./IssuesPanel";
import type { A11yNode, AxeFinding } from "@/types/a11y";
import type { ComputedFocusOrder } from "@/lib/focus-order";
import { normalizeFindings } from "@/lib/findings/normalize";
import { CompareView } from "./CompareView";
import { ManualTestsPanel } from "./ManualTestsPanel";
import type { BaselineData } from "@/hooks/useBaseline";
import type { CompareResult } from "@/lib/compare";

// Lazy-load heavy tab-gated panels (§B.6)
const AriaExplorerPanel = dynamic(
  () => import("./AriaExplorerPanel").then((m) => m.AriaExplorerPanel),
  {
    ssr: false,
    loading: () => <PanelLoading name="ARIA Explorer" />,
  }
);

const AccessibleNamePanel = dynamic(
  () => import("./AccessibleNamePanel").then((m) => m.AccessibleNamePanel),
  {
    ssr: false,
    loading: () => <PanelLoading name="Accessible Name" />,
  }
);

const FocusOrderPanel = dynamic(
  () => import("./FocusOrderPanel").then((m) => m.FocusOrderPanel),
  {
    ssr: false,
    loading: () => <PanelLoading name="Focus Order" />,
  }
);

const AnnouncementPanel = dynamic(
  () => import("./AnnouncementPanel").then((m) => m.AnnouncementPanel),
  {
    ssr: false,
    loading: () => <PanelLoading name="Announcement" />,
  }
);

function PanelLoading({ name }: { name: string }) {
  return (
    <div className="flex h-full items-center justify-center p-6 text-xs text-[var(--color-text-secondary)]">
      Loading {name}…
    </div>
  );
}

export interface AnalysisTabsProps {
  analysisTab: string;
  onTabChange: (tab: string) => void;
  maximizedPane: "editor" | "preview" | "analysis" | null;
  onToggleMaximize: () => void;
  ast: A11yNode | null;
  selectedNode: A11yNode | null;
  activeNodeId: string | null;
  onSelectNode: (id: string) => void;
  onUpdateAttribute: (attr: string, value: string) => void;
  onRemoveAttribute: (attr: string) => void;
  computedFocusOrder: ComputedFocusOrder | null;
  onSimulateFocus: (id: string) => void;
  mergedViolations: readonly AxeFinding[];
  axeIncomplete: readonly AxeFinding[];
  isScanning: boolean;
  scanError: string | null;
  hasHtml: boolean;
  onApplyFix: (
    finding: AxeFinding,
    options?: import("@/lib/auto-fix").ApplyAutoFixOptions
  ) => void;
  isOverSizeLimit?: boolean;
  baseline?: BaselineData | null;
  comparison?: CompareResult | null;
  rawHtml?: string;
  onSetBaseline?: () => void;
  onClearBaseline?: () => void;
  /** Active document ID ("default", challenge ID, or share ID) */
  documentId?: string;
}

const TAB_META = [
  { value: "tree", full: "A11y Tree", short: "Tree" },
  { value: "aria", full: "ARIA Explorer", short: "ARIA" },
  { value: "accname", full: "Accessible Name", short: "Name" },
  { value: "focus", full: "Focus Order", short: "Focus" },
  { value: "announce", full: "Announcement", short: "Speech" },
  { value: "issues", full: "Issues", short: "Issues" },
  { value: "compare", full: "Compare", short: "Diff" },
  { value: "manual", full: "Manual Tests", short: "Manual" },
] as const;

export const AnalysisTabs = React.memo(function AnalysisTabs({
  analysisTab,
  onTabChange,
  maximizedPane,
  onToggleMaximize,
  ast,
  selectedNode,
  activeNodeId,
  onSelectNode,
  onUpdateAttribute,
  onRemoveAttribute,
  computedFocusOrder,
  onSimulateFocus,
  mergedViolations,
  axeIncomplete,
  isScanning,
  scanError,
  hasHtml,
  onApplyFix,
  isOverSizeLimit = false,
  baseline = null,
  comparison = null,
  rawHtml = "",
  onSetBaseline,
  onClearBaseline,
  documentId = "default",
}: AnalysisTabsProps) {
  const normalizedFindings = React.useMemo(() => {
    return normalizeFindings([], mergedViolations, axeIncomplete);
  }, [mergedViolations, axeIncomplete]);

  const scrollerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLElement>(
      '[role="tab"][aria-selected="true"]'
    );
    if (!el || !scrollerRef.current) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.scrollIntoView({
      inline: "nearest",
      block: "nearest",
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [analysisTab]);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const updateOverflow = () => {
      const hasOverflowStart = el.scrollLeft > 2;
      const hasOverflowEnd =
        el.scrollLeft < el.scrollWidth - el.clientWidth - 2;
      el.setAttribute(
        "data-overflow-start",
        hasOverflowStart ? "true" : "false"
      );
      el.setAttribute("data-overflow-end", hasOverflowEnd ? "true" : "false");
    };

    updateOverflow();

    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateOverflow);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    const resizeObserver = new ResizeObserver(updateOverflow);
    resizeObserver.observe(el);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      el.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <Tabs
      value={analysisTab}
      onValueChange={onTabChange}
      className="flex h-full flex-col"
    >
      <div className="@container flex flex-none items-stretch border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/60">
        <div
          ref={scrollerRef}
          className="analysis-tabs-scroll min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto overscroll-x-contain px-2 pt-2 [&::-webkit-scrollbar]:hidden"
        >
          <TabsList className="inline-flex w-max flex-nowrap gap-1">
            {TAB_META.map((meta) => {
              let badgeNode: React.ReactNode = undefined;
              if (meta.value === "issues") {
                if (mergedViolations.length > 0 || axeIncomplete.length > 0) {
                  badgeNode = (
                    <Badge
                      variant={
                        mergedViolations.length > 0 ? "warning" : "default"
                      }
                      className="ml-1 shrink-0 px-1 py-0 text-[10px]"
                    >
                      {mergedViolations.length > 0 && axeIncomplete.length > 0
                        ? `${mergedViolations.length} · ${axeIncomplete.length}`
                        : mergedViolations.length > 0
                          ? `${mergedViolations.length}`
                          : `${axeIncomplete.length} to review`}
                    </Badge>
                  );
                }
              } else if (meta.value === "compare") {
                if (
                  comparison &&
                  (comparison.resolved.length > 0 ||
                    comparison.introduced.length > 0)
                ) {
                  badgeNode = (
                    <Badge
                      variant={
                        comparison.introduced.length > 0 ? "warning" : "default"
                      }
                      className="ml-1 shrink-0 px-1 py-0 text-[10px]"
                    >
                      {comparison.resolved.length > 0 &&
                        `-${comparison.resolved.length}`}
                      {comparison.resolved.length > 0 &&
                        comparison.introduced.length > 0 &&
                        " "}
                      {comparison.introduced.length > 0 &&
                        `+${comparison.introduced.length}`}
                    </Badge>
                  );
                }
              }

              return (
                <TabsTrigger
                  key={meta.value}
                  value={meta.value}
                  badge={badgeNode}
                  className="min-h-[2rem] shrink-0 whitespace-nowrap pointer-coarse:min-h-[2.5rem]"
                >
                  <span className="@[30rem]:hidden" aria-hidden="true">
                    {meta.short}
                  </span>
                  <span className="sr-only @[30rem]:hidden">{meta.full}</span>
                  <span className="hidden @[30rem]:inline">{meta.full}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <button
          type="button"
          onClick={onToggleMaximize}
          aria-label={
            maximizedPane === "analysis"
              ? "Restore pane size (Esc)"
              : "Maximize analysis"
          }
          aria-pressed={maximizedPane === "analysis"}
          className="m-1.5 inline-flex h-7 w-7 shrink-0 items-center justify-center self-center rounded text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] pointer-coarse:h-9 pointer-coarse:w-9"
        >
          {maximizedPane === "analysis" ? (
            <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {isOverSizeLimit && (
        <div
          role="status"
          className="flex items-center gap-2 border-b border-[var(--color-warning-border)] bg-[var(--color-warning-subtle)] px-3 py-1.5 text-xs text-[var(--color-warning-text)]"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Document exceeds 200KB limit. Live analysis is paused for
            performance.
          </span>
        </div>
      )}

      <div className="@container min-h-0 flex-1 overflow-y-auto">
        <TabsContent value="tree" className="m-0 h-full">
          <PanelBoundary name="A11y Tree">
            <A11yTreePanel
              ast={ast}
              selectedNode={selectedNode}
              selectedNodeId={activeNodeId}
              onSelectNode={onSelectNode}
              findings={normalizedFindings}
            />
          </PanelBoundary>
        </TabsContent>

        <TabsContent value="aria" className="m-0 h-full">
          <PanelBoundary name="ARIA Explorer">
            <AriaExplorerPanel
              selectedNode={selectedNode}
              onUpdateAttribute={onUpdateAttribute}
              onRemoveAttribute={onRemoveAttribute}
              findings={normalizedFindings}
            />
          </PanelBoundary>
        </TabsContent>

        <TabsContent value="accname" className="m-0 h-full">
          <PanelBoundary name="Accessible Name">
            <AccessibleNamePanel selectedNode={selectedNode} />
          </PanelBoundary>
        </TabsContent>

        <TabsContent value="focus" className="m-0 h-full">
          <PanelBoundary name="Focus Order">
            <FocusOrderPanel
              computedOrder={
                computedFocusOrder ?? {
                  sequence: [],
                  allFocusable: [],
                  findings: [],
                }
              }
              selectedNode={selectedNode}
              selectedNodeId={activeNodeId}
              onSelectNode={onSelectNode}
              onSimulateFocus={onSimulateFocus}
              findings={normalizedFindings}
            />
          </PanelBoundary>
        </TabsContent>

        <TabsContent value="announce" className="m-0 h-full">
          <PanelBoundary name="Announcement">
            <AnnouncementPanel selectedNode={selectedNode} />
          </PanelBoundary>
        </TabsContent>

        <TabsContent value="issues" className="m-0 h-full">
          <PanelBoundary name="Issues">
            <IssuesPanel
              findings={normalizedFindings}
              violations={mergedViolations}
              incomplete={axeIncomplete}
              isScanning={isScanning}
              scanError={scanError}
              hasHtml={hasHtml}
              onSelectNode={onSelectNode}
              onOpenInspector={(inspector, nodeId) => {
                onTabChange(inspector);
                if (nodeId) onSelectNode(nodeId);
              }}
              onApplyFix={onApplyFix}
            />
          </PanelBoundary>
        </TabsContent>

        <TabsContent value="compare" className="m-0 h-full">
          <PanelBoundary name="Compare">
            <CompareView
              baseline={baseline}
              comparison={comparison}
              currentFindings={normalizedFindings}
              currentHtml={rawHtml}
              onSetBaseline={onSetBaseline ?? (() => {})}
              onClearBaseline={onClearBaseline ?? (() => {})}
              onSelectNode={onSelectNode}
            />
          </PanelBoundary>
        </TabsContent>

        <TabsContent value="manual" className="m-0 h-full">
          <PanelBoundary name="Manual Tests">
            <ManualTestsPanel documentId={documentId} />
          </PanelBoundary>
        </TabsContent>
      </div>
    </Tabs>
  );
});
