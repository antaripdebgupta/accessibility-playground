import type { Metadata } from "next";
import { ContrastChecker } from "@/features/contrast/ContrastChecker";
import { PageContainer } from "@/components/PageContainer";

export const metadata: Metadata = {
  title: "Color-Contrast Checker — Accessibility Playground",
  description:
    "Enter a text color and background color to check the contrast ratio against WCAG 2.2 thresholds for normal text, large text, and non-text UI components.",
};

export default function ContrastPage() {
  return (
    <PageContainer className="flex flex-1 flex-col gap-4 py-4 sm:gap-6 sm:py-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
          Color-Contrast Checker
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Enter a text color and background color to check the contrast ratio
          against WCAG 2.2 thresholds for normal text, large text, and non-text
          UI components.
        </p>
      </div>

      <ContrastChecker />
    </PageContainer>
  );
}
