"use client";

import { PageContainer } from "@/components/PageContainer";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function NotFound() {
  return (
    <PageContainer className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
        404 — Page Not Found
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)]">
        The route you navigated to could not be found. Check the URL or use the
        navigation links below.
      </p>
      <div className="mt-2">
        <ButtonLink href="/" variant="secondary">
          Back to Home
        </ButtonLink>
      </div>
    </PageContainer>
  );
}
