"use client";

import { Skeleton } from "@accessly-ui/react";
import { PageContainer } from "@/components/PageContainer";

export default function PlaygroundLoading() {
  return (
    <PageContainer className="flex flex-1 animate-pulse flex-col gap-4 py-4 sm:py-6">
      <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-3">
        <Skeleton className="h-7 w-64 rounded" />
        <Skeleton className="h-4 w-96 rounded" />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-6">
          <Skeleton className="h-72 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-6">
          <Skeleton className="h-[550px] w-full rounded-lg" />
        </div>
      </div>
    </PageContainer>
  );
}
