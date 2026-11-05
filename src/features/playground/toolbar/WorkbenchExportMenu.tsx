"use client";

import * as React from "react";
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
  Download,
  ChevronDown,
  FileCode,
  Table,
  FileText,
  Copy,
} from "lucide-react";

export interface WorkbenchExportMenuProps {
  onExportJson?: () => void;
  onExportCsv?: () => void;
  onExportMarkdown?: () => void;
  onCopyReport?: () => void;
}

export function WorkbenchExportMenu({
  onExportJson,
  onExportCsv,
  onExportMarkdown,
  onCopyReport,
}: WorkbenchExportMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!onExportJson && !onExportCsv && !onExportMarkdown && !onCopyReport) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-xs font-medium"
          aria-label="Export — export accessibility report"
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
              setIsOpen(false);
            }}
            className="text-xs"
          >
            <FileCode
              className="mr-1.5 h-3.5 w-3.5 text-[var(--color-text-secondary)]"
              aria-hidden="true"
            />
            JSON (.json)
          </DropdownMenuItem>
        )}
        {onExportCsv && (
          <DropdownMenuItem
            onClick={() => {
              onExportCsv();
              setIsOpen(false);
            }}
            className="text-xs"
          >
            <Table
              className="mr-1.5 h-3.5 w-3.5 text-[var(--color-text-secondary)]"
              aria-hidden="true"
            />
            Spreadsheet (.csv)
          </DropdownMenuItem>
        )}
        {onExportMarkdown && (
          <DropdownMenuItem
            onClick={() => {
              onExportMarkdown();
              setIsOpen(false);
            }}
            className="text-xs"
          >
            <FileText
              className="mr-1.5 h-3.5 w-3.5 text-[var(--color-text-secondary)]"
              aria-hidden="true"
            />
            Markdown (.md)
          </DropdownMenuItem>
        )}
        {onCopyReport && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                onCopyReport();
                setIsOpen(false);
              }}
              className="text-xs"
            >
              <Copy
                className="mr-1.5 h-3.5 w-3.5 text-[var(--color-text-secondary)]"
                aria-hidden="true"
              />
              Copy Markdown
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
