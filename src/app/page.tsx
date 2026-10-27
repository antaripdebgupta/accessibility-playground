"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  ButtonLink,
} from "@/components/ui";
import { PageContainer } from "@/components/PageContainer";
import { Footer } from "@/components/Footer";
import { MiniDemo } from "@/features/landing/MiniDemo";

export default function HomePage() {
  const features = [
    {
      title: "Computed Accessibility Tree",
      description:
        "See the exact hierarchical tree screen readers construct from your HTML structure, not just the visual DOM.",
      href: "/playground",
    },
    {
      title: "ARIA Explorer",
      description:
        "See exactly which ARIA attributes a screen reader will use, and which ones you added for nothing.",
      href: "/playground",
    },
    {
      title: "Accessible Name Trace",
      description:
        "Trace the step-by-step algorithm that determines what assistive technology actually speaks aloud.",
      href: "/playground",
    },
    {
      title: "Sandboxed axe-core Scanner",
      description:
        "Catch WCAG violations locally inside an isolated iframe sandbox with zero external server dependencies.",
      href: "/playground",
    },
    {
      title: "Color Contrast Engine",
      description:
        "Calculate exact contrast ratios, verify AA/AAA compliance, and auto-suggest the nearest passing color with one click.",
      href: "/contrast",
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <PageContainer className="flex flex-1 flex-col gap-6 py-4 sm:gap-8 sm:py-6">
        {/* Hero / Orientation section */}
        <section className="flex flex-col items-start gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl md:text-4xl">
            Accessibility is mostly invisible. <br />
            <span className="text-[var(--color-accent)]">
              Our job is to make it visible.
            </span>
          </h1>

          <p className="max-w-3xl text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
            Paste or write HTML into a live editor to immediately inspect its
            computed accessibility tree, ARIA validity, accessible name
            algorithm trace, and automated axe-core violations in a sandboxed,
            standards-focused workflow.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <ButtonLink href="/playground" variant="primary">
              Open the Playground
            </ButtonLink>
          </div>
        </section>

        {/* Live Mini-Demo */}
        <section aria-labelledby="mini-demo-heading" className="w-full">
          <h2 id="mini-demo-heading" className="sr-only">
            Live Interactive Demonstration: Button vs Div
          </h2>
          <MiniDemo />
        </section>

        {/* Compact Feature Index */}
        <section aria-labelledby="tools-heading" className="w-full">
          <div className="mb-4 flex flex-col gap-1">
            <h2
              id="tools-heading"
              className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]"
            >
              Precision inspection tools
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Engineered specifically for frontend developers and QA engineers
              who care about genuine accessibility.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
              >
                <Card className="h-full transition-all group-hover:border-[var(--color-border-strong)] group-hover:bg-[var(--color-surface-raised)]/60">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">
                      {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </PageContainer>
      <Footer />
    </div>
  );
}
