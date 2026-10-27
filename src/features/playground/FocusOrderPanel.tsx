"use client";

import * as React from "react";
import type { ComputedFocusOrder } from "@/lib/focus-order";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@accessly-ui/react";
import { AlertOctagon, AlertTriangle } from "lucide-react";

export interface FocusOrderPanelProps {
  computedOrder: ComputedFocusOrder;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onSimulateFocus: (id: string) => void;
}

export function FocusOrderPanel({
  computedOrder,
  selectedNodeId,
  onSelectNode,
  onSimulateFocus,
}: FocusOrderPanelProps) {
  const { sequence, findings } = computedOrder;
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
      <div className="text-md flex h-64 flex-col items-center justify-center p-6 text-center text-[var(--color-text-secondary)]">
        <p className="mb-1 font-medium text-[var(--color-text-primary)]">
          No Keyboard Focusable Elements
        </p>
        <p className="max-w-xs">
          This HTML does not contain any keyboard-reachable controls. Add native
          interactive elements (
          <code className="font-mono">&lt;button&gt;</code>,{" "}
          <code className="font-mono">&lt;a href&gt;</code>,{" "}
          <code className="font-mono">&lt;input&gt;</code>) or{" "}
          <code className="font-mono">tabindex=&quot;0&quot;</code> to establish
          a tab sequence.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Controls & Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <h4 className="text-md font-semibold text-[var(--color-text-primary)]">
            Sequential Tab Order ({sequence.length}{" "}
            {sequence.length === 1 ? "element" : "elements"})
          </h4>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Computed from native elements and tabindex values
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

      {/* Focus Findings / Anti-patterns (if any) */}
      {findings.length > 0 && (
        <div className="flex flex-col gap-2">
          <h5 className="text-md font-mono font-semibold text-[var(--color-text-primary)]">
            Focus Order Findings ({findings.length})
          </h5>
          <div className="space-y-2">
            {findings.map((f) => (
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

      {/* Tab Sequence Table */}
      <div className="flex flex-col gap-2">
        <h5 className="text-md font-mono font-semibold text-[var(--color-text-primary)]">
          Ordered Navigation Sequence
        </h5>
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="text-md w-full text-left">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] font-mono text-[11px] text-[var(--color-text-secondary)]">
              <tr>
                <th scope="col" className="w-14 p-2.5 text-center">
                  #
                </th>
                <th scope="col" className="p-2.5">
                  Element &amp; Role
                </th>
                <th scope="col" className="p-2.5">
                  Accessible Name
                </th>
                <th scope="col" className="p-2.5">
                  Tabindex
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
              {sequence.map((el, idx) => {
                const isSelected = selectedNodeId === el.id;
                const isSimulated = activeStepIndex === idx;

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
                        aria-label={`Step ${el.orderIndex}: <${el.tagName}> ${el.accessibleName || el.role}`}
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                          isSimulated
                            ? "bg-[var(--color-focus-ring)] text-white"
                            : "border border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] hover:border-[var(--color-focus-ring)]"
                        }`}
                      >
                        {el.orderIndex}
                      </button>
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
                      {el.tabIndex > 0 ? (
                        <Badge variant="warning" className="text-[10px]">
                          tabindex=&quot;{el.tabIndex}&quot;
                        </Badge>
                      ) : el.tabIndex === 0 ? (
                        <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                          0
                        </span>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          {el.tabIndex}
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
