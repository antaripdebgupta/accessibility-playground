"use client";

import * as React from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  ZapOff,
  Eye,
  Minimize2,
  Maximize2,
  RefreshCw,
} from "lucide-react";

export type ViewportWidth = "full" | "320" | "768" | "1280";

export interface PreviewToolbarProps {
  viewportWidth: ViewportWidth;
  setViewportWidth: (w: ViewportWidth) => void;
  reducedMotion: boolean;
  setReducedMotion: React.Dispatch<React.SetStateAction<boolean>>;
  forcedColors: boolean;
  setForcedColors: React.Dispatch<React.SetStateAction<boolean>>;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onReload: () => void;
}

export function PreviewToolbar({
  viewportWidth,
  setViewportWidth,
  reducedMotion,
  setReducedMotion,
  forcedColors,
  setForcedColors,
  isMaximized = false,
  onToggleMaximize,
  onReload,
}: PreviewToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 px-3 py-1.5">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-semibold text-[var(--color-text-primary)]">
          Live Preview
        </span>

        {/* Viewport Presets */}
        <div
          className="flex items-center rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5"
          role="toolbar"
          aria-label="Viewport size presets"
        >
          <button
            type="button"
            onClick={() => setViewportWidth("full")}
            aria-pressed={viewportWidth === "full"}
            title="Full responsive width"
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
              viewportWidth === "full"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Monitor className="h-3 w-3" aria-hidden="true" />
            <span>Full</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportWidth("768")}
            aria-pressed={viewportWidth === "768"}
            title="768px Tablet viewport"
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
              viewportWidth === "768"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Tablet className="h-3 w-3" aria-hidden="true" />
            <span>768px</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportWidth("320")}
            aria-pressed={viewportWidth === "320"}
            title="320px Reflow / Mobile viewport (WCAG 1.4.10)"
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
              viewportWidth === "320"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Smartphone className="h-3 w-3" aria-hidden="true" />
            <span>320px</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Simulations */}
        <div
          className="flex items-center gap-1"
          role="toolbar"
          aria-label="Accessibility media simulations"
        >
          <button
            type="button"
            onClick={() => setReducedMotion((v) => !v)}
            aria-pressed={reducedMotion}
            title="Simulate prefers-reduced-motion: reduce"
            className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
              reducedMotion
                ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]/50 text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <ZapOff className="h-3 w-3" aria-hidden="true" />
            <span className="hidden sm:inline">Reduced Motion</span>
          </button>

          <button
            type="button"
            onClick={() => setForcedColors((v) => !v)}
            aria-pressed={forcedColors}
            title="Simulate forced-colors: active (High Contrast Mode)"
            className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
              forcedColors
                ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]/50 text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Eye className="h-3 w-3" aria-hidden="true" />
            <span className="hidden sm:inline">Forced Colors</span>
          </button>
        </div>

        <div
          className="h-3.5 w-px bg-[var(--color-border)]"
          aria-hidden="true"
        />

        {onToggleMaximize && (
          <button
            type="button"
            onClick={onToggleMaximize}
            aria-label={
              isMaximized ? "Restore pane size (Esc)" : "Maximize live preview"
            }
            aria-pressed={isMaximized}
            className="inline-flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            {isMaximized ? (
              <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onReload}
          aria-label="Reload preview frame"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
