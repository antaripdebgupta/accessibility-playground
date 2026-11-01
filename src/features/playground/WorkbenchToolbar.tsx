"use client";

import * as React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Button,
} from "@accessly-ui/react";
import {
  Columns2,
  ChevronDown,
  RotateCcw,
  Play,
  FileX,
  Maximize2,
  BookmarkCheck,
  Download,
  FileCode,
  Table,
  FileText,
  Copy,
  Undo2,
} from "lucide-react";
import {
  useWorkbenchLayout,
  type WorkbenchLayoutPreset,
} from "@/hooks/useWorkbenchLayout";

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
  const {
    direction,
    maximizedPane,
    setMaximizedPane,
    applyPreset,
    resetLayout,
  } = useWorkbenchLayout();

  const [isLayoutOpen, setIsLayoutOpen] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = React.useState(false);

  const handlePresetSelect = (preset: WorkbenchLayoutPreset) => {
    applyPreset(preset);
    setIsLayoutOpen(false);
  };

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
        <Button
          variant="secondary"
          size="sm"
          onClick={onForceScan}
          disabled={isScanning}
          className="h-7 gap-1.5 px-2.5 text-xs font-medium"
          aria-label={
            isScanning
              ? "Scanning in progress"
              : "Run accessibility scan (Ctrl+Enter)"
          }
        >
          <Play
            className={`h-3.5 w-3.5 fill-current text-[var(--color-accent)] ${
              isScanning ? "animate-spin" : ""
            }`}
            aria-hidden="true"
          />
          <span>{isScanning ? "Scanning…" : "Rescan"}</span>
        </Button>
      )}

      {/* Layout Menu (Single-pointer alternative to dragging per WCAG 2.2 SC 2.5.7) */}
      <DropdownMenu open={isLayoutOpen} onOpenChange={setIsLayoutOpen}>
        <DropdownMenuTrigger>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-xs font-medium"
            aria-label="Change workbench layout"
          >
            <Columns2 className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            <span className="hidden sm:inline">Layout</span>
            <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
            Layout Presets (SC 2.5.7)
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => handlePresetSelect("balanced")}
            className="text-xs"
          >
            Balanced (50/50)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handlePresetSelect("editor-focus")}
            className="text-xs"
          >
            Editor Focus (70/30)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handlePresetSelect("preview-focus")}
            className="text-xs"
          >
            Preview Focus (70% Preview)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handlePresetSelect("analysis-focus")}
            className="text-xs"
          >
            Analysis Focus (70% Analysis)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handlePresetSelect("stacked")}
            className="text-xs"
          >
            Stacked Rows {direction === "column" && "✓"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {maximizedPane && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  setMaximizedPane(null);
                  setIsLayoutOpen(false);
                }}
                className="text-xs"
              >
                <Maximize2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Exit Maximized View (Esc)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={() => {
              resetLayout();
              setIsLayoutOpen(false);
            }}
            className="text-xs text-[var(--color-text-secondary)]"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Reset Layout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Start Fresh Action */}
      {onStartFresh && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onStartFresh}
          className="hidden h-7 gap-1 px-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] md:inline-flex"
          aria-label="Start fresh with default template"
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
          aria-label="Reset current example to its original state"
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
          aria-label={hasBaseline ? "Update baseline snapshot" : "Snapshot current findings as baseline"}
        >
          <BookmarkCheck
            className={`h-3.5 w-3.5 ${hasBaseline ? "text-[var(--color-accent)]" : "opacity-70"}`}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">{hasBaseline ? "Baseline Set" : "Set Baseline"}</span>
        </Button>
      )}

      {/* Export Report Menu */}
      {(onExportJson || onExportCsv || onExportMarkdown || onCopyReport) && (
        <DropdownMenu open={isExportOpen} onOpenChange={setIsExportOpen}>
          <DropdownMenuTrigger>
            <Button
              variant="secondary"
              size="sm"
              className="h-7 gap-1.5 px-2.5 text-xs font-medium"
              aria-label="Export accessibility report"
            >
              <Download className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
              Export Report
            </DropdownMenuLabel>
            {onExportJson && (
              <DropdownMenuItem
                onClick={() => {
                  onExportJson();
                  setIsExportOpen(false);
                }}
                className="text-xs"
              >
                <FileCode className="mr-1.5 h-3.5 w-3.5 text-[var(--color-text-secondary)]" aria-hidden="true" />
                JSON (.json)
              </DropdownMenuItem>
            )}
            {onExportCsv && (
              <DropdownMenuItem
                onClick={() => {
                  onExportCsv();
                  setIsExportOpen(false);
                }}
                className="text-xs"
              >
                <Table className="mr-1.5 h-3.5 w-3.5 text-[var(--color-text-secondary)]" aria-hidden="true" />
                Spreadsheet (.csv)
              </DropdownMenuItem>
            )}
            {onExportMarkdown && (
              <DropdownMenuItem
                onClick={() => {
                  onExportMarkdown();
                  setIsExportOpen(false);
                }}
                className="text-xs"
              >
                <FileText className="mr-1.5 h-3.5 w-3.5 text-[var(--color-text-secondary)]" aria-hidden="true" />
                Markdown (.md)
              </DropdownMenuItem>
            )}
            {onCopyReport && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    onCopyReport();
                    setIsExportOpen(false);
                  }}
                  className="text-xs"
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5 text-[var(--color-text-secondary)]" aria-hidden="true" />
                  Copy Markdown
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

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
