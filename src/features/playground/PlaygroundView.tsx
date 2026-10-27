"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Editor } from "./Editor";
import { PreviewFrame } from "./PreviewFrame";
import { A11yTreePanel } from "./A11yTreePanel";
import { AriaExplorerPanel } from "./AriaExplorerPanel";
import { AccessibleNamePanel } from "./AccessibleNamePanel";
import { FocusOrderPanel } from "./FocusOrderPanel";
import { IssuesPanel } from "./IssuesPanel";
import { useDebounce } from "@/hooks/useDebounce";
import { parseHtmlToA11yTree, findA11yNodeById } from "@/lib/a11y-tree";
import { computeFocusOrder } from "@/lib/focus-order";
import { runCustomRules } from "@/lib/custom-rules";
import { STARTER_TEMPLATES, type StarterTemplate } from "@/data/templates";
import { PATTERNS } from "@/data/patterns";
import type { AxeFinding, FocusOrderPosition } from "@/types/a11y";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@accessly-ui/react";
import { Badge } from "@/components/ui/Badge";

const SESSION_STORAGE_KEY = "a11y-playground:last-html";
const SESSION_CSS_KEY = "a11y-playground:last-css";
const SPLIT_STORAGE_KEY = "a11y-playground:split-percent";

export function PlaygroundView() {
  const searchParams = useSearchParams();
  const patternParam = searchParams.get("pattern");

  // Initial HTML and CSS resolution
  const [rawHtml, setRawHtml] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      if (patternParam) {
        const foundPattern = PATTERNS.find((p) => p.slug === patternParam);
        if (foundPattern) return foundPattern.badCode;
      }
      try {
        const saved = localStorage.getItem(SESSION_STORAGE_KEY);
        if (saved) return saved;
      } catch {
        // Ignore localStorage error
      }
    }
    return STARTER_TEMPLATES[0]?.html ?? "";
  });

  const [rawCss, setRawCss] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      if (patternParam) {
        const foundTemplate = STARTER_TEMPLATES.find(
          (t) => t.id === patternParam
        );
        if (foundTemplate?.css) return foundTemplate.css;
      }
      try {
        const saved = localStorage.getItem(SESSION_CSS_KEY);
        if (saved) return saved;
      } catch {
        // Ignore localStorage error
      }
    }
    return STARTER_TEMPLATES[0]?.css ?? "";
  });

  const [restoredNotice, setRestoredNotice] = React.useState(() => {
    if (typeof window !== "undefined") {
      try {
        return Boolean(localStorage.getItem(SESSION_STORAGE_KEY));
      } catch {
        return false;
      }
    }
    return false;
  });

  const debouncedHtml = useDebounce(rawHtml, 400);
  const debouncedCss = useDebounce(rawCss, 400);

  // Persist session to localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined" && debouncedHtml) {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, debouncedHtml);
      } catch {
        // Ignore quota
      }
    }
  }, [debouncedHtml]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SESSION_CSS_KEY, debouncedCss);
      } catch {
        // Ignore quota
      }
    }
  }, [debouncedCss]);

  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(
    null
  );
  const [axeViolations, setAxeViolations] = React.useState<
    readonly AxeFinding[]
  >([]);
  const [axeIncomplete, setAxeIncomplete] = React.useState<
    readonly AxeFinding[]
  >([]);
  const [scanId, setScanId] = React.useState<string>("initial");
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanError, setScanError] = React.useState<string | null>(null);
  const [focusPositions, setFocusPositions] = React.useState<
    readonly FocusOrderPosition[]
  >([]);
  const [simulatedFocusId, setSimulatedFocusId] = React.useState<string | null>(
    null
  );

  // Split pane state & persistence (25% - 75%)
  const [splitPercent, setSplitPercent] = React.useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSplit = localStorage.getItem(SPLIT_STORAGE_KEY);
        if (savedSplit) {
          const val = parseFloat(savedSplit);
          if (!isNaN(val) && val >= 25 && val <= 75) {
            return val;
          }
        }
      } catch {
        // Ignore
      }
    }
    return 50;
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const updateSplit = React.useCallback((percent: number) => {
    const clamped = Math.max(25, Math.min(75, percent));
    setSplitPercent(clamped);
    try {
      localStorage.setItem(SPLIT_STORAGE_KEY, clamped.toFixed(1));
    } catch {
      // Ignore
    }
  }, []);

  // Pointer events for drag (unified mouse + touch)
  const handleSeparatorPointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handleSeparatorPointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
    updateSplit(newPercent);
  };

  const handleSeparatorPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  // Keyboard navigation for separator
  const handleSeparatorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 5 : 2;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      updateSplit(splitPercent - step);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      updateSplit(splitPercent + step);
    } else if (e.key === "Home") {
      e.preventDefault();
      updateSplit(25);
    } else if (e.key === "End") {
      e.preventDefault();
      updateSplit(75);
    }
  };

  // Parse AST whenever debouncedHtml changes
  const {
    ast,
    instrumentedHtml,
    error: parseError,
  } = React.useMemo(() => {
    return parseHtmlToA11yTree(debouncedHtml);
  }, [debouncedHtml]);

  // Derive computed focus sequence & findings
  const computedFocusOrder = React.useMemo(() => {
    return computeFocusOrder(ast);
  }, [ast]);

  // Run custom playground rules host-side immediately
  const customFindings = React.useMemo(() => {
    return runCustomRules(ast, debouncedCss);
  }, [ast, debouncedCss]);

  // Merge custom findings + focus order findings + axe-core findings
  const mergedViolations = React.useMemo(() => {
    const seen = new Set<string>();
    const list: AxeFinding[] = [];

    // 1. Add custom rules findings
    for (const f of customFindings) {
      const key = `${f.id}:${f.nodes[0]?.targetId || f.nodes[0]?.html}`;
      seen.add(key);
      list.push(f);
    }

    // 2. Add axe findings without duplicating overlapping custom checks
    for (const f of axeViolations) {
      const targetId = f.nodes[0]?.targetId;
      const key = `${f.id}:${targetId || f.nodes[0]?.html}`;
      const altKey =
        f.id === "image-alt" ? `img-missing-alt:${targetId}` : null;
      const tabKey =
        f.id === "tabindex" ? `positive-tabindex:${targetId}` : null;
      const linkKey =
        f.id === "link-name" ? `empty-interactive-name:${targetId}` : null;
      const buttonKey =
        f.id === "button-name" ? `empty-interactive-name:${targetId}` : null;
      const labelKey = f.id === "label" ? `input-no-label:${targetId}` : null;

      const isDuplicated =
        seen.has(key) ||
        (altKey && seen.has(altKey)) ||
        (tabKey && seen.has(tabKey)) ||
        (linkKey && seen.has(linkKey)) ||
        (buttonKey && seen.has(buttonKey)) ||
        (labelKey && seen.has(labelKey));

      if (!isDuplicated) {
        seen.add(key);
        list.push(f);
      }
    }

    return list;
  }, [customFindings, axeViolations]);

  // Derive effective selected node ID
  const activeNodeId = React.useMemo(() => {
    if (!ast) return null;
    if (selectedNodeId && findA11yNodeById(ast, selectedNodeId)) {
      return selectedNodeId;
    }
    return ast.children[0]?.id ?? ast.id;
  }, [ast, selectedNodeId]);

  const selectedNode = React.useMemo(() => {
    return findA11yNodeById(ast, activeNodeId ?? "");
  }, [ast, activeNodeId]);

  const handleSelectTemplate = (template: StarterTemplate) => {
    setRawHtml(template.html);
    setRawCss(template.css ?? "");
    setRestoredNotice(false);
    setIsScanning(true);
    setScanId(`scan-${Date.now()}`);
  };

  const handleStartFresh = () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(SESSION_CSS_KEY);
    } catch {
      // Ignore
    }
    setRawHtml(STARTER_TEMPLATES[0]?.html ?? "");
    setRawCss(STARTER_TEMPLATES[0]?.css ?? "");
    setRestoredNotice(false);
    setIsScanning(true);
    setScanId(`scan-${Date.now()}`);
  };

  const handleForceScan = React.useCallback(() => {
    setIsScanning(true);
    setScanId(`scan-${Date.now()}`);
  }, []);

  const handleScanResults = React.useCallback(
    (results: readonly AxeFinding[], inc?: readonly AxeFinding[]) => {
      setAxeViolations(results);
      setAxeIncomplete(inc || []);
      setIsScanning(false);
      setScanError(null);
    },
    []
  );

  const handleScanError = React.useCallback((error: string) => {
    setScanError(error);
    setIsScanning(false);
  }, []);

  const handleSimulateFocus = React.useCallback((id: string) => {
    setSimulatedFocusId(id);
    setSelectedNodeId(id);
  }, []);

  // Track desktop viewport for split pane
  const [isDesktop, setIsDesktop] = React.useState(false);
  React.useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] w-full flex-1 flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
      <h1 className="sr-only">Accessibility Playground — Live Workbench</h1>

      {/* Dismissible Session Restore Notice */}
      {restoredNotice && (
        <div className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-surface-sunken)]/60 px-3 py-2 text-sm text-[var(--color-text-secondary)]">
          <span>
            Restored your last session —{" "}
            <button
              type="button"
              onClick={handleStartFresh}
              className="font-medium text-[var(--color-text-primary)] underline hover:text-[var(--color-accent)]"
            >
              Start fresh
            </button>
          </span>
          <button
            type="button"
            onClick={() => setRestoredNotice(false)}
            aria-label="Dismiss restored session notice"
            className="rounded px-1.5 py-0.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Resizable Split Workbench Container */}
      <div
        ref={containerRef}
        className="flex flex-1 flex-col gap-4 lg:flex-row lg:gap-0"
      >
        {/* Left Column: Editor & Preview */}
        <div
          className="flex w-full flex-col gap-4 overflow-hidden lg:shrink-0 lg:grow-0"
          style={{
            width: isDesktop ? `calc(${splitPercent}% - 8px)` : "100%",
          }}
        >
          <Editor
            html={rawHtml}
            css={rawCss}
            onHtmlChange={(val) => {
              setRawHtml(val);
              setIsScanning(true);
            }}
            onCssChange={(val) => {
              setRawCss(val);
              setIsScanning(true);
            }}
            onSelectTemplate={handleSelectTemplate}
            selectionRange={selectedNode?.sourceRange ?? null}
            onForceScan={handleForceScan}
          />

          <PreviewFrame
            instrumentedHtml={instrumentedHtml}
            css={rawCss}
            selectedNodeId={activeNodeId}
            scanId={scanId}
            onSelectNodeId={(id) => setSelectedNodeId(id)}
            onScanResults={handleScanResults}
            onScanError={handleScanError}
            parseError={parseError}
            focusPositions={focusPositions}
            onFocusPositionsChange={setFocusPositions}
            focusedElementId={simulatedFocusId}
            showFocusBadges={true}
            isDragging={isDragging}
          />
        </div>

        {/* Resizable Separator Divider (Desktop) */}
        {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- WAI-ARIA 1.2 window splitter specification requires focusable role="separator" with aria-valuenow, aria-valuemin, aria-valuemax */}
        <div
          role="separator"
          tabIndex={0}
          aria-orientation="vertical"
          aria-valuenow={Math.round(splitPercent)}
          aria-valuemin={25}
          aria-valuemax={75}
          aria-label="Resize editor and analysis panels"
          onKeyDown={handleSeparatorKeyDown}
          onPointerDown={handleSeparatorPointerDown}
          onPointerMove={handleSeparatorPointerMove}
          onPointerUp={handleSeparatorPointerUp}
          className="hidden touch-none items-center justify-center select-none focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] lg:flex lg:w-4 lg:cursor-col-resize lg:hover:bg-[var(--color-accent)]/10"
        >
          <div className="h-12 w-1 rounded-full bg-[var(--color-border-strong)] transition-colors hover:bg-[var(--color-accent)]" />
        </div>
        {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}

        {/* Right Column: Analysis Tabs Panel */}
        <div
          className={`flex w-full flex-1 flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs lg:min-w-0 ${isDragging ? "pointer-events-none" : ""}`}
          style={{
            width: isDesktop ? `calc(${100 - splitPercent}% - 8px)` : "100%",
          }}
        >
          <Tabs defaultValue="tree" className="flex h-full flex-col">
            <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 px-3 pt-2">
              <TabsList className="flex-wrap gap-1">
                <TabsTrigger value="tree">A11y Tree</TabsTrigger>
                <TabsTrigger value="aria">ARIA Explorer</TabsTrigger>
                <TabsTrigger value="accname">Accessible Name</TabsTrigger>
                <TabsTrigger value="focus">Focus Order</TabsTrigger>
                <TabsTrigger
                  value="issues"
                  badge={
                    mergedViolations.length > 0 ? (
                      <Badge
                        variant="warning"
                        className="ml-1 px-1 py-0 text-[10px]"
                      >
                        {mergedViolations.length}
                      </Badge>
                    ) : undefined
                  }
                >
                  Issues
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="min-h-[400px] flex-1 overflow-y-auto">
              <TabsContent value="tree" className="m-0 h-full">
                <A11yTreePanel
                  ast={ast}
                  selectedNodeId={activeNodeId}
                  onSelectNode={(id) => setSelectedNodeId(id)}
                />
              </TabsContent>

              <TabsContent value="aria" className="m-0 h-full">
                <AriaExplorerPanel selectedNode={selectedNode} />
              </TabsContent>

              <TabsContent value="accname" className="m-0 h-full">
                <AccessibleNamePanel selectedNode={selectedNode} />
              </TabsContent>

              <TabsContent value="focus" className="m-0 h-full">
                <FocusOrderPanel
                  computedOrder={computedFocusOrder}
                  selectedNodeId={activeNodeId}
                  onSelectNode={(id) => setSelectedNodeId(id)}
                  onSimulateFocus={handleSimulateFocus}
                />
              </TabsContent>

              <TabsContent value="issues" className="m-0 h-full">
                <IssuesPanel
                  violations={mergedViolations}
                  incomplete={axeIncomplete}
                  isScanning={isScanning}
                  scanError={scanError}
                  hasHtml={rawHtml.trim().length > 0}
                  onSelectNode={(id) => setSelectedNodeId(id)}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
