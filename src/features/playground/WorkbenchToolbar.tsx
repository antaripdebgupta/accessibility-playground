"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@accessly-ui/react";
import { Play, FileX, BookmarkCheck, Undo2 } from "lucide-react";
import { WorkbenchLayoutMenu } from "./toolbar/WorkbenchLayoutMenu";
import { WorkbenchExportMenu } from "./toolbar/WorkbenchExportMenu";

interface WorkbenchToolbarProps {
  onForceScan?: () => void;
  isScanning?: boolean;
  onStartFresh?: () => void;
  onSetBaseline?: () => void;
  hasBaseline?: boolean;
  onExportJson?: () => void;
  onExportCsv?: () => void;
  onExportMarkdown?: () => void;
  onCopyReport?: () => void;
  onResetExample?: () => void;
}

export function WorkbenchToolbar({
  onForceScan,
  isScanning = false,
  onStartFresh,
  onSetBaseline,
  hasBaseline = false,
  onExportJson,
  onExportCsv,
  onExportMarkdown,
  onCopyReport,
  onResetExample,
}: WorkbenchToolbarProps) {
  return (
    <header className="flex h-11 flex-none items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/90 px-3 backdrop-blur-sm sm:gap-3">
      {/* Home link — the only way out; first in tab order after skip link */}
      <Link
        href="/"
        aria-label="Accessibility Playground — back to home"
        className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-sunken)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 26 26"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="1"
            y="1"
            width="24"
            height="24"
            rx="6"
            stroke="#1d4ed8"
            strokeWidth="1.6"
          />
          <circle cx="13" cy="8.4" r="1.9" fill="#1d4ed8" />
          <path
            d="M5.6 11.2c3.2 1.4 11.6 1.4 14.8 0"
            stroke="#1d4ed8"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M13 12v5.4M13 17.4l-3.4 4.6M13 17.4l3.4 4.6"
            stroke="#1d4ed8"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-display font-bold tracking-tight text-[var(--color-text-primary)]">
          Playground
        </span>
      </Link>

      <div className="h-4 w-px bg-[var(--color-border)]" aria-hidden="true" />

      {/* Rescan Button */}
      {onForceScan && (
        <button
          type="button"
          onClick={() => {
            if (!isScanning) {
              onForceScan();
            }
          }}
          aria-disabled={isScanning}
          className="focus-ring-safe inline-flex h-7 items-center justify-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2.5 text-xs font-medium text-[var(--color-text-primary)] shadow-xs transition-[color,background-color,border-color,box-shadow,scale] duration-150 ease-out hover:bg-[var(--color-surface-raised)] active:scale-[0.98] aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:active:scale-100"
          aria-label={
            isScanning
              ? "Scanning in progress"
              : "Rescan — run accessibility scan (Ctrl+Enter)"
          }
        >
          <Play
            className={`h-3.5 w-3.5 fill-current text-[var(--color-accent)] ${
              isScanning ? "animate-spin" : ""
            }`}
            aria-hidden="true"
          />
          <span>{isScanning ? "Scanning…" : "Rescan"}</span>
        </button>
      )}

      {/* Layout Menu */}
      <WorkbenchLayoutMenu />

      {/* Start Fresh Action */}
      {onStartFresh && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onStartFresh}
          className="hidden h-7 gap-1 px-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] md:inline-flex"
          aria-label="Start Fresh — with default template"
        >
          <FileX className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Start Fresh</span>
        </Button>
      )}

      {/* Reset Example Action */}
      {onResetExample && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onResetExample}
          className="hidden h-7 gap-1 px-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] md:inline-flex"
          aria-label="Reset Example — reset current example to its original state"
        >
          <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reset Example</span>
        </Button>
      )}

      {/* Set Baseline Button */}
      {onSetBaseline && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onSetBaseline}
          className="h-7 gap-1.5 px-2.5 text-xs font-medium"
          aria-label={
            hasBaseline
              ? "Baseline Set — update baseline snapshot"
              : "Set Baseline — snapshot current findings as baseline"
          }
        >
          <BookmarkCheck
            className={`h-3.5 w-3.5 ${hasBaseline ? "text-[var(--color-accent)]" : "opacity-70"}`}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">
            {hasBaseline ? "Baseline Set" : "Set Baseline"}
          </span>
        </Button>
      )}

      {/* Export Report Menu */}
      <WorkbenchExportMenu
        onExportJson={onExportJson}
        onExportCsv={onExportCsv}
        onExportMarkdown={onExportMarkdown}
        onCopyReport={onCopyReport}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Keyboard hints */}
      <div className="hidden items-center gap-3 text-[11px] text-[var(--color-text-secondary)] lg:flex">
        <span>
          <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5 font-mono text-[10px]">
            F6
          </kbd>{" "}
          switch pane
        </span>
        <span>
          <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5 font-mono text-[10px]">
            ⌘/Ctrl+Enter
          </kbd>{" "}
          rescan
        </span>
      </div>
    </header>
  );
}
