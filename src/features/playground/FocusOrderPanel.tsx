"use client";

import * as React from "react";
import type { ComputedFocusOrder } from "@/lib/focus-order";
import type { A11yNode, Finding } from "@/types/a11y";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@accessly-ui/react";
import {
  InspectorSelectedHeader,
  InspectorEmptyState,
} from "./InspectorSelectedHeader";
import { AlertOctagon, AlertTriangle, EyeOff } from "lucide-react";

export interface FocusOrderPanelProps {
  computedOrder: ComputedFocusOrder;
  selectedNode?: A11yNode | null;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onSimulateFocus: (id: string) => void;
  findings?: readonly Finding[];
}

export function FocusOrderPanel({
  computedOrder,
  selectedNode,
  selectedNodeId,
  onSelectNode,
  onSimulateFocus,
  findings = [],
}: FocusOrderPanelProps) {
  const { sequence, findings: focusFindings, allFocusable } = computedOrder;
  const [activeStepIndex, setActiveStepIndex] = React.useState<number | null>(
    null
  );

  const handleSimulateNext = () => {
    if (sequence.length === 0) return;
    const nextIndex =
      activeStepIndex === null || activeStepIndex >= sequence.length - 1
        ? 0
        : activeStepIndex + 1;
    setActiveStepIndex(nextIndex);
    const target = sequence[nextIndex];
    if (target) {
      onSelectNode(target.id);
      onSimulateFocus(target.id);
    }
  };

  const handleResetSimulation = () => {
    setActiveStepIndex(null);
  };

  if (sequence.length === 0) {
    return (
      <div className="flex flex-col">
        <InspectorSelectedHeader selectedNode={selectedNode ?? null} />
        <InspectorEmptyState
          title="No Keyboard Focusable Elements"
          description="This HTML does not contain any keyboard-reachable controls. Add native interactive elements (<button>, <a href>, <input>) or tabindex='0' to establish a tab sequence."
        />
      </div>
    );
  }

  // Set of node IDs flagged for outline-removed (§C2)
  const missingFocusOutlineIds = new Set<string>();
  for (const f of findings) {
    if (f.ruleId === "outline-removed") {
      for (const n of f.nodes) {
        if (n.targetId) missingFocusOutlineIds.add(n.targetId);
      }
    }
  }

  return (
    <div className="flex flex-col">
      <InspectorSelectedHeader selectedNode={selectedNode ?? null} />

      <div className="flex flex-col gap-5 p-4">
        {/* Controls & Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
          <div>
            <h4 className="text-md font-semibold text-[var(--color-text-primary)]">
              Sequential Tab Order ({sequence.length}{" "}
              {sequence.length === 1 ? "element" : "elements"})
            </h4>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Computed from DOM hierarchy and tabindex values
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeStepIndex !== null && (
              <Button
                variant="secondary"
                onClick={handleResetSimulation}
                className="text-md h-7 px-2"
              >
                Reset
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleSimulateNext}
              className="text-md h-7 px-3"
            >
              {activeStepIndex === null
                ? "Simulate Tab Key"
                : `Tab to Next (${activeStepIndex + 1}/${sequence.length})`}
            </Button>
          </div>
        </div>

        {/* Focus Findings / Anti-patterns */}
        {focusFindings.length > 0 && (
          <div className="flex flex-col gap-2">
            <h5 className="text-md font-mono font-semibold text-[var(--color-text-primary)]">
              Focus Order Findings ({focusFindings.length})
            </h5>
            <div className="space-y-2">
              {focusFindings.map((f) => (
                <div
                  key={f.id}
                  className="text-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-xs"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {f.impact === "critical" ? (
                        <Badge variant="critical">
                          <AlertOctagon className="h-3 w-3" aria-hidden="true" />
                          Critical
                        </Badge>
                      ) : (
                        <Badge variant="serious">
                          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                          Serious
                        </Badge>
                      )}
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {f.title}
                      </span>
                    </div>
                    {f.targetId && (
                      <button
                        type="button"
                        onClick={() => onSelectNode(f.targetId!)}
                        className="rounded font-mono text-[11px] text-[var(--color-focus-ring)] underline hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                      >
                        Inspect #{f.targetId}
                      </button>
                    )}
                  </div>
                  <p className="text-md leading-relaxed text-[var(--color-text-secondary)]">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Sequence Table (§C2: DOM order vs tab order, positive tabindex warnings, missing focus styles) */}
        <div className="flex flex-col gap-2">
          <h5 className="text-md font-mono font-semibold text-[var(--color-text-primary)]">
            Ordered Navigation Sequence
          </h5>
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
            <table className="text-md w-full text-left">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] font-mono text-[11px] text-[var(--color-text-secondary)]">
                <tr>
                  <th scope="col" className="w-14 p-2.5 text-center">
                    Tab #
                  </th>
                  <th scope="col" className="w-16 p-2.5 text-center">
                    DOM #
                  </th>
                  <th scope="col" className="p-2.5">
                    Element &amp; Role
                  </th>
                  <th scope="col" className="p-2.5">
                    Accessible Name
                  </th>
                  <th scope="col" className="p-2.5">
                    Tabindex &amp; Style
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                {sequence.map((el, idx) => {
                  const isSelected = selectedNodeId === el.id;
                  const isSimulated = activeStepIndex === idx;
                  const domIndex = allFocusable.findIndex((f) => f.id === el.id) + 1;
                  const hasMissingFocusStyle = missingFocusOutlineIds.has(el.id);

                  const handleSelect = () => {
                    setActiveStepIndex(idx);
                    onSelectNode(el.id);
                    onSimulateFocus(el.id);
                  };

                  return (
                    <tr
                      key={el.id}
                      onClick={handleSelect}
                      className={`cursor-pointer transition-colors ${
                        isSimulated
                          ? "bg-[var(--color-accent-subtle)] font-medium"
                          : isSelected
                            ? "bg-[var(--color-surface-raised)] font-medium"
                            : "hover:bg-[var(--color-surface-raised)]/50"
                      }`}
                    >
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect();
                          }}
                          aria-label={`Tab step ${el.orderIndex}: <${el.tagName}> ${el.accessibleName || el.role}`}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                            isSimulated
                              ? "bg-[var(--color-focus-ring)] text-white"
                              : "border border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] hover:border-[var(--color-focus-ring)]"
                          }`}
                        >
                          {el.orderIndex}
                        </button>
                      </td>
                      <td className="p-2.5 text-center font-mono text-[11px] text-[var(--color-text-secondary)]">
                        {domIndex > 0 ? domIndex : "-"}
                      </td>
                      <td className="text-md p-2.5 font-mono text-[var(--color-text-primary)]">
                        &lt;{el.tagName}&gt;{" "}
                        <span className="text-[var(--color-text-secondary)]">
                          ({el.role})
                        </span>
                      </td>
                      <td className="text-md p-2.5 text-[var(--color-text-secondary)]">
                        {el.accessibleName ? (
                          <span className="text-[var(--color-text-primary)]">
                            &quot;{el.accessibleName}&quot;
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-[var(--color-danger-default)] italic">
                            (No accessible name)
                          </span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {el.tabIndex > 0 ? (
                            <Badge variant="danger" className="text-[10px]">
                              positive (+{el.tabIndex})
                            </Badge>
                          ) : el.tabIndex === 0 ? (
                            <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                              tabindex=&quot;0&quot;
                            </span>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              {el.tabIndex}
                            </Badge>
                          )}
                          {hasMissingFocusStyle && (
                            <Badge variant="warning" className="text-[10px]">
                              <EyeOff className="h-2.5 w-2.5" aria-hidden="true" />
                              Missing visible focus style
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
