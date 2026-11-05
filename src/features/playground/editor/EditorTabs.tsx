"use client";

import * as React from "react";

export interface EditorTabsProps {
  activeTab: "html" | "css";
  onTabChange: (tab: "html" | "css") => void;
}

export function EditorTabs({ activeTab, onTabChange }: EditorTabsProps) {
  const htmlTabRef = React.useRef<HTMLButtonElement>(null);
  const cssTabRef = React.useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      onTabChange("css");
      cssTabRef.current?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      onTabChange("html");
      htmlTabRef.current?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      onTabChange("html");
      htmlTabRef.current?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      onTabChange("css");
      cssTabRef.current?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Editor modes"
      className="flex items-center gap-1 rounded-md bg-[var(--color-surface-sunken)] p-0.5"
    >
      <button
        ref={htmlTabRef}
        type="button"
        role="tab"
        id="tab-editor-html"
        tabIndex={activeTab === "html" ? 0 : -1}
        aria-selected={activeTab === "html"}
        aria-controls="panel-editor-html"
        onClick={() => onTabChange("html")}
        onKeyDown={handleKeyDown}
        className={`rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
          activeTab === "html"
            ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        }`}
      >
        HTML
      </button>
      <button
        ref={cssTabRef}
        type="button"
        role="tab"
        id="tab-editor-css"
        tabIndex={activeTab === "css" ? 0 : -1}
        aria-selected={activeTab === "css"}
        aria-controls="panel-editor-css"
        onClick={() => onTabChange("css")}
        onKeyDown={handleKeyDown}
        className={`rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
          activeTab === "css"
            ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        }`}
      >
        CSS
      </button>
    </div>
  );
}
