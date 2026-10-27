import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageContainer } from "@/components/PageContainer";

export const metadata: Metadata = {
  title: "About & Security Sandbox — Accessibility Playground",
  description:
    "Learn about Accessibility Playground's sandboxed iframe architecture, client-side axe-core isolation, and our own verified WCAG 2.2 AA commitments.",
};

export default function AboutPage() {
  const commitments = [
    {
      title: "1. Full Keyboard Operability (SC 2.1.1, 2.1.2)",
      description:
        "Every interactive element—including tree navigation, template selectors, split panes, and copy actions—is fully operable using keyboard alone.",
    },
    {
      title: "2. Visible & Unobscured Focus Rings (SC 2.4.7, 2.4.11)",
      description:
        "Interactive controls feature high-contrast focus rings with outline offsets ensuring unambiguous visual indication.",
    },
    {
      title: "3. Direct Skip Navigation (SC 2.4.1)",
      description:
        "A skip link is positioned as the first focusable element on every page, allowing keyboard users to bypass global navigation directly to main content.",
    },
    {
      title: "4. Semantic Landmark & Heading Structure (SC 1.3.1)",
      description:
        "Every page adheres to valid landmark structure (<header>, <nav>, <main>, and <footer> where present) and a strictly sequential, non-skipping heading hierarchy.",
    },
    {
      title: "5. Multi-modal Status & Zero Color-Only Signals (SC 1.4.1)",
      description:
        "Outcomes, severity badges, and status indicators combine text labels with semantic styling so no information is conveyed through color alone.",
    },
    {
      title: "6. Minimum 24 × 24px Target Sizes (SC 2.5.8)",
      description:
        "Buttons, tree rows, color pickers, and interactive controls maintain at least 24 × 24 CSS pixel targets to ensure reliable pointer and touch accuracy.",
    },
    {
      title: "7. Universal Motion Reduction (SC 2.2.2, 2.3.3)",
      description:
        "Smooth scrolling and non-essential animations are automatically disabled when prefers-reduced-motion: reduce is signaled by the system.",
    },
    {
      title: "8. Assistive Live Announcements (SC 4.1.3)",
      description:
        "Asynchronous events such as clipboard copies and scan completions are announced programmatically via ARIA live regions and toasts.",
    },
  ];

  return (
    <PageContainer
      prose
      className="flex flex-1 flex-col gap-6 py-4 sm:gap-6 sm:py-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
          About Accessibility Playground
        </h1>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          A precision developer tool built to teach, demonstrate, and test WCAG
          2.2 accessibility in real time through computed accessibility trees,
          ARIA validation, and client-side automated auditing.
        </p>
      </div>

      {/* Sandboxed Architecture Explanation */}
      <section
        aria-labelledby="sandbox-heading"
        className="flex flex-col gap-3"
      >
        <h2
          id="sandbox-heading"
          className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]"
        >
          Why the Sandboxed Iframe Architecture Matters
        </h2>

        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          When developers test user-provided or legacy HTML, treating that
          markup as untrusted is fundamental to security. Accessibility
          Playground employs a strict sandboxed-iframe boundary:
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                sandbox=&quot;allow-scripts&quot; Only
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              We explicitly omit{" "}
              <code className="font-mono text-[var(--color-text-primary)]">
                allow-same-origin
              </code>
              . The previewed HTML cannot access the parent application&apos;s
              cookies, local storage, or session tokens.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Vendored axe-core Execution
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              <code className="font-mono text-[var(--color-text-primary)]">
                axe-core
              </code>{" "}
              is vendored locally inside{" "}
              <code className="font-mono text-[var(--color-text-primary)]">
                public/
              </code>
              . No external CDN requests are made during runtime auditing,
              guaranteeing offline capability and privacy.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Zod-Validated postMessage
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Communication between the sandbox and parent analysis panels
              passes through a strictly typed Zod discriminated union schema
              before the host trusts any payload.
            </CardContent>
          </Card>
        </div>

        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Note: Automated auditing tools such as axe-core detect approximately
          30–50% of WCAG issues; manual keyboard testing, screen reader
          verification, and human inspection remain indispensable for
          comprehensive conformance.
        </p>
      </section>

      {/* App's Own Accessibility Commitments */}
      <section
        aria-labelledby="commitments-heading"
        className="flex flex-col gap-3"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
          <h2
            id="commitments-heading"
            className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]"
          >
            This Application&apos;s Own WCAG 2.2 AA Commitments
          </h2>
          <Badge variant="success">WCAG 2.2 AA Verified</Badge>
        </div>

        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          An accessibility tool cannot lack accessibility. Every screen,
          component, and interaction within Accessibility Playground is held to
          the following non-negotiable standards:
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {commitments.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 shadow-xs"
            >
              <h3 className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
