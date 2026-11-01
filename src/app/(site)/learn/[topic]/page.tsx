import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  LEARN_TOPICS,
  getLearnTopicBySlug,
  getPlaygroundUrlForExample,
} from "@/data/learn-topics";
import { WcagBadge } from "@/components/WcagBadge";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Play,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
} from "lucide-react";

interface TopicPageProps {
  params: Promise<{ topic: string }>;
}

export async function generateStaticParams() {
  return LEARN_TOPICS.map((topic) => ({
    topic: topic.slug,
  }));
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { topic: slug } = await params;
  const topic = getLearnTopicBySlug(slug);
  if (!topic) {
    return {
      title: "Topic Not Found — Accessibility Playground",
    };
  }
  return {
    title: `${topic.title} — Accessibility Knowledge Centre`,
    description: topic.summary,
  };
}

export default async function TopicDetailPage({ params }: TopicPageProps) {
  const { topic: slug } = await params;
  const topic = getLearnTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const badPlaygroundUrl = getPlaygroundUrlForExample(topic.badExample);
  const goodPlaygroundUrl = getPlaygroundUrlForExample(topic.goodExample);

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Knowledge Centre</span>
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-8 border-b border-[var(--color-border)] pb-8">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-[var(--color-accent)]/10 px-2 py-0.5 font-mono text-xs font-semibold text-[var(--color-accent)]">
            GUIDE
          </span>
          <div className="flex flex-wrap gap-1.5">
            {topic.wcagCriteria.map((sc) => (
              <WcagBadge key={sc} criterionId={sc} />
            ))}
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
          {topic.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--color-text-secondary)]">
          {topic.summary}
        </p>

        {topic.challengeId && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs">
            <Trophy className="h-4 w-4 text-[var(--amber)] flex-shrink-0" aria-hidden="true" />
            <span className="text-[var(--color-text-secondary)]">
              Want to practice this topic interactively?
            </span>
            <Link
              href={`/playground?challenge=${topic.challengeId}`}
              className="ml-auto inline-flex items-center gap-1 font-semibold text-[var(--color-accent)] hover:underline"
            >
              <span>Start Challenge</span>
              <Play className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        )}
      </header>

      <div className="flex flex-col gap-10">
        {/* 1. Explanations */}
        <section aria-labelledby="section-explanations" className="flex flex-col gap-4">
          <h2
            id="section-explanations"
            className="text-xl font-bold text-[var(--color-text-primary)]"
          >
            How it works
          </h2>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
              Plain Explanation
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {topic.plainExplanation}
            </p>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
              Technical Mechanics
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {topic.technicalExplanation}
            </p>
          </div>
        </section>

        {/* 2. Why it matters */}
        <section aria-labelledby="section-why-it-matters" className="flex flex-col gap-3">
          <h2
            id="section-why-it-matters"
            className="text-xl font-bold text-[var(--color-text-primary)]"
          >
            Why it matters
          </h2>
          <div className="rounded-lg border-l-4 border-l-[var(--color-accent)] bg-[var(--color-surface)] p-5 border border-[var(--color-border)]">
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {topic.whyItMatters}
            </p>
          </div>
        </section>

        {/* 3. Bad vs Good Example */}
        <section aria-labelledby="section-examples" className="flex flex-col gap-4">
          <h2
            id="section-examples"
            className="text-xl font-bold text-[var(--color-text-primary)]"
          >
            Code Examples
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Bad Example */}
            <div className="flex flex-col justify-between rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)]/30 p-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--color-danger-default)]">
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    <span>Inaccessible (Avoid)</span>
                  </div>
                </div>
                <p className="mb-3 text-xs text-[var(--color-text-secondary)]">
                  {topic.badExample.description}
                </p>
                <div className="overflow-x-auto rounded-md bg-[#1e1e1e] p-3 text-xs text-white font-mono">
                  <pre>
                    <code>{topic.badExample.html}</code>
                  </pre>
                </div>
                {topic.badExample.css && (
                  <div className="mt-2 overflow-x-auto rounded-md bg-[#1e1e1e] p-3 text-xs text-zinc-300 font-mono">
                    <pre>
                      <code>{topic.badExample.css}</code>
                    </pre>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                <Link
                  href={badPlaygroundUrl}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                >
                  <Play className="h-3 w-3 text-[var(--color-accent)]" aria-hidden="true" />
                  <span>Open bad example in playground</span>
                </Link>
              </div>
            </div>

            {/* Good Example */}
            <div className="flex flex-col justify-between rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-bg)]/30 p-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--color-success-default)]">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>Accessible (Recommended)</span>
                  </div>
                </div>
                <p className="mb-3 text-xs text-[var(--color-text-secondary)]">
                  {topic.goodExample.description}
                </p>
                <div className="overflow-x-auto rounded-md bg-[#1e1e1e] p-3 text-xs text-white font-mono">
                  <pre>
                    <code>{topic.goodExample.html}</code>
                  </pre>
                </div>
                {topic.goodExample.css && (
                  <div className="mt-2 overflow-x-auto rounded-md bg-[#1e1e1e] p-3 text-xs text-zinc-300 font-mono">
                    <pre>
                      <code>{topic.goodExample.css}</code>
                    </pre>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                <Link
                  href={goodPlaygroundUrl}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                >
                  <Play className="h-3 w-3" aria-hidden="true" />
                  <span>Open accessible example in playground</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Common Mistakes */}
        <section aria-labelledby="section-mistakes" className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[var(--amber)]" aria-hidden="true" />
            <h2
              id="section-mistakes"
              className="text-xl font-bold text-[var(--color-text-primary)]"
            >
              Common Mistakes
            </h2>
          </div>
          <ul className="space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-text-secondary)] list-disc pl-9">
            {topic.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="leading-relaxed">
                {mistake}
              </li>
            ))}
          </ul>
        </section>

        {/* 5. Browser Behaviour */}
        <section aria-labelledby="section-browser" className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[var(--color-accent)]" aria-hidden="true" />
            <h2
              id="section-browser"
              className="text-xl font-bold text-[var(--color-text-primary)]"
            >
              Browser & Accessibility API Behaviour
            </h2>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            <p>{topic.browserBehaviour}</p>
          </div>
        </section>

        {/* 6. Manual Testing */}
        <section aria-labelledby="section-testing" className="flex flex-col gap-3">
          <h2
            id="section-testing"
            className="text-xl font-bold text-[var(--color-text-primary)]"
          >
            How to verify manually
          </h2>
          <ol className="space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-text-secondary)] list-decimal pl-9">
            {topic.manualTest.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </section>

        {/* 7. Official References */}
        <section aria-labelledby="section-references" className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-8">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[var(--color-accent)]" aria-hidden="true" />
            <h2
              id="section-references"
              className="text-lg font-bold text-[var(--color-text-primary)]"
            >
              Official References & Guidelines
            </h2>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {topic.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs font-medium text-[var(--color-text-primary)] hover:border-[var(--color-focus-ring)]/40 hover:bg-[var(--color-surface-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{link.title}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)] uppercase">
                      {link.source}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
