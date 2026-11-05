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
import { Columns2, ChevronDown, RotateCcw, Maximize2 } from "lucide-react";
import {
  useWorkbenchLayout,
  type WorkbenchLayoutPreset,
} from "@/hooks/useWorkbenchLayout";

export function WorkbenchLayoutMenu() {
  const {
    direction,
    maximizedPane,
    setMaximizedPane,
    applyPreset,
    resetLayout,
  } = useWorkbenchLayout();

  const [isOpen, setIsOpen] = React.useState(false);

  const handlePresetSelect = (preset: WorkbenchLayoutPreset) => {
    applyPreset(preset);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-xs font-medium"
          aria-label="Layout — change workbench layout"
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
                setIsOpen(false);
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
            setIsOpen(false);
          }}
          className="text-xs text-[var(--color-text-secondary)]"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Reset Layout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
