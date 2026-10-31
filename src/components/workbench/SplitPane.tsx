"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SplitPaneProps {
  direction?: "row" | "column";
  /** Controlled percentage size (0-100) of the primary pane. */
  size?: number;
  /** Callback fired when size changes via drag, keyboard, or collapse. */
  onSizeChange?: (size: number) => void;
  /** Storage key for uncontrolled persistence (optional). */
  storageKey?: string;
  defaultSize?: number;
  min?: number;
  max?: number;
  /** Enter on the separator toggles the primary pane between collapsed and its last size. */
  collapsible?: boolean;
  /** id placed on the primary pane; referenced by the separator's aria-controls. */
  primaryId: string;
  primaryLabel: string;
  secondaryLabel: string;
  primary: React.ReactNode;
  secondary: React.ReactNode;
  className?: string;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export function SplitPane({
  direction = "row",
  size: controlledSize,
  onSizeChange,
  storageKey,
  defaultSize = 50,
  min = 20,
  max = 80,
  collapsible = false,
  primaryId,
  primaryLabel,
  secondaryLabel,
  primary,
  secondary,
  className,
}: SplitPaneProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lastExpanded = React.useRef(defaultSize);

  // Uncontrolled fallback state if size is not controlled
  const [internalSize, setInternalSize] = React.useState(defaultSize);
  const [dragging, setDragging] = React.useState(false);

  const isControlled = controlledSize !== undefined;
  const currentSize = isControlled ? controlledSize : internalSize;

  const isRow = direction === "row";
  const collapsed = currentSize === 0;

  const setSize = React.useCallback(
    (newVal: number) => {
      const clamped = clamp(newVal, collapsible ? 0 : min, max);
      if (clamped > 0) {
        lastExpanded.current = clamped;
      }
      if (isControlled) {
        onSizeChange?.(clamped);
      } else {
        setInternalSize(clamped);
        if (storageKey && typeof window !== "undefined") {
          try {
            localStorage.setItem(storageKey, String(clamped));
          } catch {
            // ignore
          }
        }
      }
    },
    [collapsible, min, max, isControlled, onSizeChange, storageKey]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const dec = isRow ? "ArrowLeft" : "ArrowUp";
    const inc = isRow ? "ArrowRight" : "ArrowDown";
    if (e.key === dec) setSize(currentSize - step);
    else if (e.key === inc) setSize(currentSize + step);
    else if (e.key === "Home") setSize(min);
    else if (e.key === "End") setSize(max);
    else if (e.key === "Enter" && collapsible)
      setSize(collapsed ? lastExpanded.current : 0);
    else return;
    e.preventDefault();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId); // keeps events flowing even over the iframe
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const pct = isRow
      ? ((e.clientX - r.left) / r.width) * 100
      : ((e.clientY - r.top) / r.height) * 100;
    setSize(pct);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if pointer capture was already released
    }
    setDragging(false);
  };

  const rounded = Math.round(currentSize);

  return (
    <div
      ref={containerRef}
      data-dragging={dragging}
      className={cn(
        "flex min-h-0 min-w-0 flex-1",
        isRow ? "flex-row" : "flex-col",
        className
      )}
    >
      <div
        id={primaryId}
        className="min-h-0 min-w-0 overflow-hidden"
        style={{ flex: `0 0 ${currentSize}%` }}
        hidden={collapsed}
      >
        {primary}
      </div>

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions --
          WAI-ARIA 1.2: a separator with aria-valuenow is an interactive window splitter. */}
      <div
        role="separator"
        tabIndex={0}
        aria-orientation={isRow ? "vertical" : "horizontal"}
        aria-controls={primaryId}
        aria-label={`Resize ${primaryLabel} and ${secondaryLabel}`}
        aria-valuenow={rounded}
        aria-valuemin={collapsible ? 0 : min}
        aria-valuemax={max}
        aria-valuetext={
          collapsed
            ? `${primaryLabel} collapsed`
            : `${primaryLabel} ${rounded}%, ${secondaryLabel} ${100 - rounded}%`
        }
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => setSize(defaultSize)}
        className={cn(
          "group relative z-10 flex flex-none touch-none items-center justify-center select-none",
          "bg-[var(--color-border)] hover:bg-[var(--color-focus-ring)] focus-visible:bg-[var(--color-focus-ring)]",
          "data-[active=true]:bg-[var(--color-focus-ring)] forced-colors:bg-[ButtonText] forced-colors:focus-visible:bg-[Highlight]",
          // 24px-minimum hit area (SC 2.5.8) without a fat visible bar:
          isRow
            ? "w-px cursor-col-resize before:absolute before:-inset-x-3 before:inset-y-0 before:content-['']"
            : "h-px cursor-row-resize before:absolute before:inset-x-0 before:-inset-y-3 before:content-['']"
        )}
        data-active={dragging}
      />

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{secondary}</div>
    </div>
  );
}
