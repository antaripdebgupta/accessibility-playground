"use client";

import { Skeleton } from "@accessly-ui/react";

export default function PlaygroundLoading() {
  return (
    <div className="flex min-h-0 flex-1 animate-pulse flex-col">
      {/* Toolbar skeleton */}
      <div className="flex h-11 flex-none items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 px-3">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>

      {/* Main content skeleton — two columns */}
      <div className="flex min-h-0 flex-1">
        {/* Left column */}
        <div className="flex w-1/2 flex-col">
          <Skeleton className="flex-[55] rounded-none" />
          <div className="h-px bg-[var(--color-border)]" />
          <Skeleton className="flex-[45] rounded-none" />
        </div>

        <div className="w-px bg-[var(--color-border)]" />

        {/* Right column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex gap-2 border-b border-[var(--color-border)] px-3 py-2">
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-6 w-24 rounded" />
          </div>
          <Skeleton className="min-h-0 flex-1 rounded-none" />
        </div>
      </div>

      {/* Status bar skeleton */}
      <div className="flex h-7 flex-none items-center border-t border-[var(--color-border)] px-3">
        <Skeleton className="h-3 w-32 rounded" />
      </div>
    </div>
  );
}
