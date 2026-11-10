"use client";

import * as React from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@accessly-ui/react";
import {
  Link2,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import { SnippetsMenu } from "./SnippetsMenu";
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

        <label className="hidden cursor-pointer items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] sm:flex">
          <input
            type="checkbox"
            checked={indentWithTab}
            onChange={(e) => onToggleIndentWithTab(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          />
          <span>Tab indents</span>
        </label>

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

        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 w-7 p-0"
                aria-label="Editor settings"
              >
                <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => onToggleIndentWithTab(!indentWithTab)}
                className="text-xs"
              >
                <span className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={indentWithTab}
                    readOnly
                    tabIndex={-1}
                    className="pointer-events-none h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                  />
                  Tab indents
                </span>
              </DropdownMenuItem>
              {onToggleTailwind && (
                <DropdownMenuItem
                  onClick={() => onToggleTailwind(!useTailwind)}
                  className="text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={useTailwind}
                      readOnly
                      tabIndex={-1}
                      className="pointer-events-none h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                    />
                    Tailwind CSS
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
