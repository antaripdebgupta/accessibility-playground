"use client";

import * as React from "react";
import { Keyboard, Volume2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MANUAL_TESTS, type ManualTestCategory } from "@/data/manual-tests";

export type FilterCategory = "all" | ManualTestCategory;

interface CategoryTabConfig {
  id: FilterCategory;
  label: string;
  icon?: React.ComponentType<{
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  count?: number;
}

const CATEGORY_TABS: readonly CategoryTabConfig[] = [
  { id: "all", label: "All Tests", count: MANUAL_TESTS.length },
  { id: "keyboard", label: "Keyboard", icon: Keyboard },
  { id: "screen-reader", label: "Screen Reader", icon: Volume2 },
  { id: "visual", label: "Visual", icon: Eye },
];

export interface ManualTestFiltersProps {
  selectedCategory: FilterCategory;
  onSelectCategory: (cat: FilterCategory) => void;
}

export function ManualTestFilters({
  selectedCategory,
  onSelectCategory,
}: ManualTestFiltersProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter manual test categories"
      className="flex flex-wrap gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-1"
    >
      {CATEGORY_TABS.map((tab) => {
        const Icon = tab.icon;
        const isSelected = selectedCategory === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectCategory(tab.id)}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
              isSelected
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <Badge variant="default" className="px-1 py-0 text-[9px]">
                {tab.count}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
