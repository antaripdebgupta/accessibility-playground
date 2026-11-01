import type { Metadata } from "next";
import Link from "next/link";
import { LEARN_TOPICS } from "@/data/learn-topics";
import { WcagBadge } from "@/components/WcagBadge";
import { BookOpen, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Accessibility Knowledge Centre — Accessibility Playground",
  description:
    "Comprehensive, practical guides to web accessibility topics: semantic HTML, ARIA, keyboard navigation, focus management, color contrast, and more.",
};

export default function LearnIndexPage() {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <header className="mb-10 flex flex-col gap-3 border-b border-[var(--color-border)] pb-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          <span>Knowledge Centre</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
          Core Accessibility Topics
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-[var(--color-text-secondary)]">
          Short, actionable guides on modern web accessibility. Each topic covers plain and technical
          explanations, why it matters, bad versus good code examples you can open live in the
          playground, browser behaviors, and manual verification steps.
        </p>
      </header>

      {/* Grid of Topics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {LEARN_TOPICS.map((topic, index) => (
          <article
            key={topic.slug}
            className="flex flex-col justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs transition-shadow hover:shadow-md"
          >
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)]">
                <span>TOPIC {String(index + 1).padStart(2, "0")}</span>
                {topic.challengeId && (
                  <span className="rounded bg-[var(--color-accent)]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">
                    Has Challenge
                  </span>
                )}
              </div>
              <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">
                <Link
                  href={`/learn/${topic.slug}`}
                  className="hover:text-[var(--color-accent)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                >
                  {topic.title}
                </Link>
              </h2>
              <p className="mb-4 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {topic.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--color-border)] flex flex-col gap-3">
              <div className="flex flex-wrap gap-1">
                {topic.wcagCriteria.map((sc) => (
                  <WcagBadge key={sc} criterionId={sc} asLink={false} />
                ))}
              </div>
              <Link
                href={`/learn/${topic.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
              >
                <span>Read topic guide</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
