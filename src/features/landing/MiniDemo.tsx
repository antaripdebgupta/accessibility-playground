"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, AlertTriangle, Eye } from "lucide-react";

export function MiniDemo() {
  const [activeElement, setActiveElement] = React.useState<"div" | "button">(
    "button"
  );
  const [clickCount, setClickCount] = React.useState({ div: 0, button: 0 });

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2">
          <Eye
            className="h-4 w-4 text-[var(--color-accent)]"
            aria-hidden="true"
          />
          <span className="font-mono text-sm font-semibold tracking-wider text-[var(--color-text-primary)] uppercase">
            Live Accessibility Inspector
          </span>
          <span className="text-sm text-[var(--color-text-secondary)]">
            — Select either element to observe how the accessibility tree
            interprets them
          </span>
        </div>
        <div
          role="tablist"
          aria-label="Demo inspection selector"
          className="flex gap-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeElement === "div"}
            onClick={() => setActiveElement("div")}
            className={`text-md rounded px-2.5 py-1 font-mono font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
              activeElement === "div"
                ? "border border-[var(--color-warning-default)]/30 bg-[var(--color-warning-subtle)] font-semibold text-[var(--color-warning-default)]"
                : "bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            &lt;div&gt; anti-pattern
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeElement === "button"}
            onClick={() => setActiveElement("button")}
            className={`text-md rounded px-2.5 py-1 font-mono font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
              activeElement === "button"
                ? "border border-[var(--color-success-default)]/30 bg-[var(--color-success-subtle)] font-semibold text-[var(--color-success-default)]"
                : "bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            &lt;button&gt; accessible
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Bad: Div fake button */}
        <div
          className={`flex flex-col rounded-lg border p-4 transition-all ${
            activeElement === "div"
              ? "border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)] ring-1 ring-[var(--color-border-strong)]"
              : "border-[var(--color-border)] bg-[var(--color-surface-raised)]"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-md font-mono text-[var(--color-text-secondary)]">
              &lt;div class=&quot;fake-btn&quot;&gt;
            </span>
            <Badge variant="warning">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              Anti-pattern
            </Badge>
          </div>

          <div className="my-2 flex min-h-[60px] items-center justify-center">
            {/* The actual bad div demonstration */}
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- Intentional demonstration of div-button anti-pattern */}
            <div
              className="text-md cursor-pointer rounded bg-zinc-200 px-4 py-2 font-medium text-zinc-800 transition-colors select-none hover:bg-zinc-300"
              onClick={() => {
                setActiveElement("div");
                setClickCount((prev) => ({ ...prev, div: prev.div + 1 }));
              }}
            >
              Save Changes (Div) {clickCount.div > 0 && `(${clickCount.div})`}
            </div>
          </div>

          <div className="text-md mt-3 space-y-1.5 border-t border-[var(--color-border)] pt-3 font-mono">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Computed Role:
              </span>
              <span className="font-bold text-[var(--color-danger-default)]">
                generic (None)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Accessible Name:
              </span>
              <span className="text-[var(--color-danger-default)]">
                — (Not exposed as control)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Keyboard Focusable:
              </span>
              <span className="text-[var(--color-danger-default)]">
                No (Skipped by Tab key)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Space/Enter Trigger:
              </span>
              <span className="text-[var(--color-danger-default)]">
                No (Mouse only)
              </span>
            </div>
          </div>
        </div>

        {/* Good: Native button */}
        <div
          className={`flex flex-col rounded-lg border p-4 transition-all ${
            activeElement === "button"
              ? "border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)] ring-1 ring-[var(--color-border-strong)]"
              : "border-[var(--color-border)] bg-[var(--color-surface-raised)]"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-md font-mono text-[var(--color-text-secondary)]">
              &lt;button type=&quot;button&quot;&gt;
            </span>
            <Badge variant="success">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Accessible
            </Badge>
          </div>

          <div className="my-2 flex min-h-[60px] items-center justify-center">
            {/* The actual good native button */}
            <button
              type="button"
              onFocus={() => setActiveElement("button")}
              onClick={() => {
                setActiveElement("button");
                setClickCount((prev) => ({ ...prev, button: prev.button + 1 }));
              }}
              className="text-md rounded bg-[var(--color-accent)] px-4 py-2 font-medium text-white shadow-xs transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
            >
              Save Changes (Native Button){" "}
              {clickCount.button > 0 && `(${clickCount.button})`}
            </button>
          </div>

          <div className="text-md mt-3 space-y-1.5 border-t border-[var(--color-border)] pt-3 font-mono">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Computed Role:
              </span>
              <span className="font-bold text-[var(--color-success-default)]">
                button
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Accessible Name:
              </span>
              <span className="text-[var(--color-success-default)]">
                &quot;Save Changes (Native Button)&quot;
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Keyboard Focusable:
              </span>
              <span className="text-[var(--color-success-default)]">
                Yes (Default tab index)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Space/Enter Trigger:
              </span>
              <span className="text-[var(--color-success-default)]">
                Yes (Built-in dispatch)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-md mt-4 flex items-center justify-between rounded bg-[var(--color-surface-sunken)] px-3 py-2 text-[var(--color-text-secondary)]">
        <span>Screen reader announcement preview:</span>
        <span className="font-mono font-medium text-[var(--color-text-primary)]">
          {activeElement === "button"
            ? "“Save Changes, button”"
            : "“Save Changes” (Read as plain static text with no hint of interactivity)"}
        </span>
      </div>
    </div>
  );
}
