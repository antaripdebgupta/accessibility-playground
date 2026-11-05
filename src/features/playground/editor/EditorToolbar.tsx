"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
} from "@accessly-ui/react";
import { STARTER_TEMPLATES, type StarterTemplate } from "@/data/templates";
import {
  ChevronDown,
  FileCode,
  Link2,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { SnippetsMenu } from "./SnippetsMenu";
import { Badge } from "@/components/ui/Badge";
import { EditorTabs } from "./EditorTabs";

export interface EditorToolbarProps {
  activeTab: "html" | "css";
  onTabChange: (tab: "html" | "css") => void;
  onFormatClick: () => void;
  onCopyLink?: () => string;
  linkCopied: boolean;
  onCopyLinkClick: () => void;
  indentWithTab: boolean;
  onToggleIndentWithTab: (checked: boolean) => void;
  useTailwind?: boolean;
  onToggleTailwind?: (enabled: boolean) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onSelectTemplate: (template: StarterTemplate) => void;
  html: string;
  css: string;
  onHtmlChange: (value: string) => void;
  onCssChange: (value: string) => void;
  triggerLocalLoad: (text: string) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export function EditorToolbar({
  activeTab,
  onTabChange,
  onFormatClick,
  onCopyLink,
  linkCopied,
  onCopyLinkClick,
  indentWithTab,
  onToggleIndentWithTab,
  useTailwind,
  onToggleTailwind,
  isMenuOpen,
  setIsMenuOpen,
  onSelectTemplate,
  html,
  css,
  onHtmlChange,
  onCssChange,
  triggerLocalLoad,
  isMaximized,
  onToggleMaximize,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 px-3 py-2">
      {/* HTML / CSS Tabs */}
      <EditorTabs activeTab={activeTab} onTabChange={onTabChange} />

      {/* Right Toolbar Controls */}
      <div className="flex items-center gap-2">
        {/* Format Document Button */}
        <Button
          variant="secondary"
          size="sm"
          className="h-7 gap-1 px-2.5 text-xs font-medium"
          onClick={onFormatClick}
          title="Format document (Shift+Alt+F)"
          aria-label="Format — format document with Prettier (Shift+Alt+F)"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Format</span>
        </Button>

        {/* Copy Link Button: Name matches visible text (WCAG 2.5.3 Level A) */}
        {onCopyLink && (
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1 px-2.5 text-xs font-medium"
            onClick={onCopyLinkClick}
            title={
              linkCopied
                ? "Permalink copied to clipboard"
                : "Copy shareable permalink to clipboard"
            }
          >
            {linkCopied ? (
              <>
                <Check
                  className="h-3.5 w-3.5 text-[var(--color-success-default)]"
                  aria-hidden="true"
                />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Copy link</span>
              </>
            )}
          </Button>
        )}

        {/* Tab Indent Toggle */}
        <label className="hidden cursor-pointer items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] sm:flex">
          <input
            type="checkbox"
            checked={indentWithTab}
            onChange={(e) => onToggleIndentWithTab(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          />
          <span>Tab indents</span>
        </label>

        {/* Tailwind CSS Toggle */}
        {onToggleTailwind && (
          <label className="hidden cursor-pointer items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] md:flex">
            <input
              type="checkbox"
              checked={useTailwind}
              onChange={(e) => onToggleTailwind(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            />
            <span>Tailwind CSS</span>
          </label>
        )}

        {/* Starter Templates Dropdown */}
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger>
            <Button
              variant="secondary"
              size="sm"
              className="h-7 gap-1 px-2.5 text-xs font-medium"
            >
              <FileCode className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Templates</span>
              <span
                className="hidden font-mono text-[10px] opacity-60 sm:inline"
                aria-hidden="true"
              >
                ⌘K
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="max-h-72 w-64 overflow-y-auto"
          >
            {STARTER_TEMPLATES.map((tmpl) => (
              <DropdownMenuItem
                key={tmpl.id}
                onClick={() => {
                  onSelectTemplate(tmpl);
                  setIsMenuOpen(false);
                }}
                className="flex flex-col items-start gap-0.5 p-2"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    {tmpl.label}
                  </span>
                  <Badge
                    variant="default"
                    className="px-1 py-0 text-[8px] font-normal"
                  >
                    Built-in
                  </Badge>
                </div>
                <span className="line-clamp-1 text-[11px] text-[var(--color-text-secondary)]">
                  {tmpl.description}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Snippets Menu Component */}
        <SnippetsMenu
          html={html}
          css={css}
          onHtmlChange={(val) => {
            triggerLocalLoad(val);
            onHtmlChange(val);
          }}
          onCssChange={onCssChange}
        />

        {onToggleMaximize && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleMaximize}
            className="h-7 w-7 p-0"
            aria-label={
              isMaximized ? "Restore pane size (Esc)" : "Maximize code editor"
            }
            aria-pressed={isMaximized}
          >
            {isMaximized ? (
              <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
