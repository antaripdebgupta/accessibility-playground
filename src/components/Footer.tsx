import React from "react";
import { PageContainer } from "@/components/PageContainer";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)] py-4">
      <PageContainer className="flex flex-col items-center justify-between gap-3 text-sm text-[var(--color-text-secondary)] sm:flex-row">
        <p>
          Accessibility Playground — a WCAG 2.2 learning tool. Built with
          Next.js.
        </p>
        <div>
          <a
            href="https://www.w3.org/WAI/WCAG22/quickref/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded underline underline-offset-4 hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            WCAG 2.2 Quick Reference
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </div>
      </PageContainer>
    </footer>
  );
}
