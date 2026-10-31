"use client";

import * as React from "react";
import { Breadcrumb, BreadcrumbItem } from "@accessly-ui/react";
import { WcagBadge } from "@/components/WcagBadge";
import { PageContainer } from "@/components/PageContainer";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CopyCodeButton } from "./CopyCodeButton";
import type { PatternItem } from "@/types/pattern";
import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { htmlToJsx } from "@/lib/html-to-jsx";

export interface PatternDetailViewProps {
  pattern: PatternItem;
  badCodeHtml?: string;
  goodCodeHtml?: string;
}

export function PatternDetailView({
  pattern,
  badCodeHtml,
  goodCodeHtml,
}: PatternDetailViewProps) {
  const [badFormat, setBadFormat] = React.useState<"html" | "jsx">("html");
  const [goodFormat, setGoodFormat] = React.useState<"html" | "jsx">("html");

  return (
    <PageContainer className="flex flex-1 flex-col gap-4 py-4 sm:gap-6 sm:py-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem href="/patterns">Patterns</BreadcrumbItem>
          <BreadcrumbItem isCurrent>{pattern.title}</BreadcrumbItem>
        </Breadcrumb>
      </nav>

      {/* Header and WCAG mapping */}
      <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
            {pattern.title}
          </h1>
          <ButtonLink
            href={`/playground?pattern=${pattern.slug}`}
            variant="primary"
            size="sm"
            className="gap-1.5"
          >
            <span>Open in Playground</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </ButtonLink>
        </div>
        <p className="max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {pattern.summary}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-sm text-[var(--color-text-secondary)]">
            WCAG 2.2 Mapping:
          </span>
          {pattern.wcagCriteria.map((id) => (
            <WcagBadge key={id} criterionId={id} />
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Bad Example Column */}
        <section
          aria-labelledby="bad-example-title"
          className="flex flex-col overflow-hidden rounded-lg border border-[var(--color-warning-default)]/30 bg-[var(--color-surface)] shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-warning-default)]/20 bg-[var(--color-warning-subtle)]/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className="h-4 w-4 text-[var(--color-warning-default)]"
                aria-hidden="true"
              />
              <h2
                id="bad-example-title"
                className="font-mono text-sm font-bold tracking-wider text-[var(--color-warning-default)] uppercase"
              >
                Inaccessible Pattern
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div
                role="tablist"
                aria-label="Inaccessible code format"
                className="flex items-center gap-1 rounded-md bg-[var(--color-surface-sunken)] p-0.5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={badFormat === "html"}
                  onClick={() => setBadFormat("html")}
                  className={`rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                    badFormat === "html"
                      ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  HTML
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={badFormat === "jsx"}
                  onClick={() => setBadFormat("jsx")}
                  className={`rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                    badFormat === "jsx"
                      ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  JSX
                </button>
              </div>
              <CopyCodeButton
                code={
                  badFormat === "jsx"
                    ? htmlToJsx(pattern.badCode)
                    : pattern.badCode
                }
              />
            </div>
          </div>

          {/* Bad Code Block */}
          {badFormat === "html" && badCodeHtml ? (
            <div
              tabIndex={0}
              role="region"
              aria-label="Inaccessible code example (HTML)"
              className="border-b border-[var(--color-border)] [&>pre]:overflow-x-auto [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: badCodeHtml }}
            />
          ) : (
            <div
              className="border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-4"
              tabIndex={0}
              role="region"
              aria-label={`Inaccessible code example (${badFormat.toUpperCase()})`}
            >
              <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-[var(--color-text-primary)]">
                <code>
                  {badFormat === "jsx"
                    ? htmlToJsx(pattern.badCode)
                    : pattern.badCode}
                </code>
              </pre>
            </div>
          )}

          {/* Failure Explanation */}
          <div className="flex flex-1 flex-col gap-3 p-4 text-sm">
            <div>
              <h3 className="mb-1 flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
                <AlertTriangle
                  className="h-3.5 w-3.5 text-[var(--color-warning-default)]"
                  aria-hidden="true"
                />
                <span>What Breaks</span>
              </h3>
              <p className="leading-relaxed text-[var(--color-text-secondary)]">
                {pattern.badExplanation.whatBreaks}
              </p>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-[var(--color-text-primary)]">
                For Whom
              </h3>
              <p className="leading-relaxed text-[var(--color-text-secondary)]">
                {pattern.badExplanation.forWhom}
              </p>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-[var(--color-text-primary)]">
                Technical Reason
              </h3>
              <p className="rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-2.5 font-mono text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {pattern.badExplanation.technicalReason}
              </p>
            </div>
          </div>
        </section>

        {/* Good Example Column */}
        <section
          aria-labelledby="good-example-title"
          className="flex flex-col overflow-hidden rounded-lg border border-[var(--color-success-default)]/30 bg-[var(--color-surface)] shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-success-default)]/20 bg-[var(--color-success-subtle)]/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className="h-4 w-4 text-[var(--color-success-default)]"
                aria-hidden="true"
              />
              <h2
                id="good-example-title"
                className="font-mono text-sm font-bold tracking-wider text-[var(--color-success-default)] uppercase"
              >
                Accessible Standard
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div
                role="tablist"
                aria-label="Accessible code format"
                className="flex items-center gap-1 rounded-md bg-[var(--color-surface-sunken)] p-0.5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={goodFormat === "html"}
                  onClick={() => setGoodFormat("html")}
                  className={`rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                    goodFormat === "html"
                      ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  HTML
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={goodFormat === "jsx"}
                  onClick={() => setGoodFormat("jsx")}
                  className={`rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                    goodFormat === "jsx"
                      ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  JSX
                </button>
              </div>
              <CopyCodeButton
                code={
                  goodFormat === "jsx"
                    ? htmlToJsx(pattern.goodCode)
                    : pattern.goodCode
                }
              />
            </div>
          </div>

          {/* Good Code Block */}
          {goodFormat === "html" && goodCodeHtml ? (
            <div
              tabIndex={0}
              role="region"
              aria-label="Accessible code example (HTML)"
              className="border-b border-[var(--color-border)] [&>pre]:overflow-x-auto [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: goodCodeHtml }}
            />
          ) : (
            <div
              className="border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-4"
              tabIndex={0}
              role="region"
              aria-label={`Accessible code example (${goodFormat.toUpperCase()})`}
            >
              <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-[var(--color-text-primary)]">
                <code>
                  {goodFormat === "jsx"
                    ? htmlToJsx(pattern.goodCode)
                    : pattern.goodCode}
                </code>
              </pre>
            </div>
          )}

          {/* Good Explanation */}
          <div className="flex flex-1 flex-col gap-3 p-4 text-sm">
            <div>
              <h3 className="mb-1 flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
                <CheckCircle2
                  className="h-3.5 w-3.5 text-[var(--color-success-default)]"
                  aria-hidden="true"
                />
                <span>How It Fixes It</span>
              </h3>
              <p className="leading-relaxed text-[var(--color-text-secondary)]">
                {pattern.goodExplanation.howItFixes}
              </p>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-[var(--color-text-primary)]">
                Key Accessible Attributes
              </h3>
              <ul className="flex flex-col gap-1">
                {pattern.goodExplanation.keyAttributes.map((attr) => (
                  <li
                    key={attr}
                    className="flex items-start gap-2 text-xs leading-relaxed text-[var(--color-text-secondary)]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-success-default)]"
                    />
                    <span>{attr}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
