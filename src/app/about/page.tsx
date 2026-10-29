import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About — Accessibility Playground",
  description:
    "Why Accessibility Playground runs user-provided HTML inside a sandboxed iframe, and the WCAG 2.2 AA commitments the tool holds itself to.",
};

const COMMITMENTS = [
  {
    index: "01",
    title: "Full keyboard operability",
    description:
      "Every interactive element — tree navigation, template selectors, split panes, copy actions — is fully operable using keyboard alone.",
    sc: "SC 2.1.1 · 2.1.2",
  },
  {
    index: "02",
    title: "Visible, unobscured focus rings",
    description:
      "Interactive controls use high-contrast focus rings with outline offsets, so focus is never ambiguous and never hidden behind sticky elements.",
    sc: "SC 2.4.7 · 2.4.11",
  },
  {
    index: "03",
    title: "Direct skip navigation",
    description:
      "A skip link is the first focusable element on every page, letting keyboard users bypass global navigation straight to main content.",
    sc: "SC 2.4.1",
  },
  {
    index: "04",
    title: "Semantic landmarks & heading structure",
    description:
      "Every page uses valid landmarks (header, nav, main, footer where present) and a strictly sequential, non-skipping heading hierarchy.",
    sc: "SC 1.3.1",
  },
  {
    index: "05",
    title: "Zero color-only signals",
    description:
      "Outcomes, severity badges, and status indicators pair text labels with semantic styling — no information is conveyed through color alone.",
    sc: "SC 1.4.1",
  },
  {
    index: "06",
    title: "Minimum 24 × 24px targets",
    description:
      "Buttons, tree rows, color pickers, and other controls keep at least a 24 × 24 CSS pixel target for reliable pointer and touch accuracy.",
    sc: "SC 2.5.8",
  },
  {
    index: "07",
    title: "Universal motion reduction",
    description: (
      <>
        Smooth scrolling and non-essential animation are disabled automatically
        whenever <code>prefers-reduced-motion: reduce</code> is signaled.
      </>
    ),
    sc: "SC 2.2.2 · 2.3.3",
  },
  {
    index: "08",
    title: "Assistive live announcements",
    description:
      "Asynchronous events — clipboard copies, scan completions — are announced programmatically through ARIA live regions and toasts.",
    sc: "SC 4.1.3",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Page Intro */}
      <section className="page-intro">
        <div className="wrap">
          <span className="eyebrow">About &amp; security model</span>
          <h1>An accessibility tool that is itself accessible.</h1>
          <p className="lede">
            Accessibility Playground is a precision developer tool for teaching,
            demonstrating, and testing WCAG 2.2 in real time — through a
            computed accessibility tree, ARIA validation, and client-side
            automated auditing. Here&apos;s how it&apos;s built, and what it
            holds itself to.
          </p>
        </div>
      </section>

      {/* Sandboxed iframe section */}
      <section className="block" aria-labelledby="sandbox-heading">
        <div className="wrap">
          <div className="section-head">
            <h2 id="sandbox-heading">Why the sandboxed iframe matters</h2>
            <p>
              When you paste user-provided or legacy HTML into the Playground,
              that markup is treated as untrusted by default. Three boundaries
              keep it that way.
            </p>
          </div>

          <div className="boundary-grid">
            <div className="boundary-card">
              <div className="icon-chip">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"
                    stroke="#1d4ed8"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>sandbox=&quot;allow-scripts&quot; only</h3>
              <p>
                <code>allow-same-origin</code> is explicitly omitted. Previewed
                HTML cannot read the parent application&apos;s cookies, local
                storage, or session tokens.
              </p>
            </div>

            <div className="boundary-card">
              <div className="icon-chip">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="3"
                    stroke="#1d4ed8"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8 12l2.5 2.5L16 9"
                    stroke="#1d4ed8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Vendored axe-core execution</h3>
              <p>
                <code>axe-core</code> is vendored locally inside{" "}
                <code>public/</code>. No external CDN request is made during
                auditing, so scans work offline and stay private.
              </p>
            </div>

            <div className="boundary-card">
              <div className="icon-chip">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7 12h10M7 8h10M7 16h6"
                    stroke="#1d4ed8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3>Zod-validated postMessage</h3>
              <p>
                Every message between the sandbox and the host panels passes a
                strictly typed Zod discriminated union before the parent trusts
                the payload.
              </p>
            </div>
          </div>

          <div className="caveat-note" role="note">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 9v4M12 16.5h.01"
                stroke="#92400e"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="#92400e"
                strokeWidth="1.8"
              />
            </svg>
            <span>
              Automated tools such as axe-core catch roughly 30–50% of WCAG
              issues. Manual keyboard testing, screen-reader verification, and
              human review remain indispensable for full conformance.
            </span>
          </div>
        </div>
      </section>

      {/* Commitments list section */}
      <section className="block" aria-labelledby="commitments-heading">
        <div className="wrap">
          <div className="commitments-head">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <h2 id="commitments-heading">
                This application&apos;s own WCAG 2.2 AA commitments
              </h2>
              <p>
                An accessibility tool cannot itself be inaccessible. Every
                screen and interaction is held to these standards.
              </p>
            </div>
            <span className="verified-chip">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 12l2.5 2.5L16 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              WCAG 2.2 AA verified
            </span>
          </div>

          <div className="commitments-list">
            {COMMITMENTS.map((item) => (
              <div key={item.index} className="commitment-row">
                <span className="index">{item.index}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <span className="sc">{item.sc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="cta-band">
        <div className="wrap">
          <div>
            <h2>Put it to the test on your own markup.</h2>
            <p>No signup. Paste HTML, get an answer in under a second.</p>
          </div>
          <Link className="btn btn-primary" href="/playground">
            Open the Playground
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer tagline="Accessibility Playground — a WCAG 2.2 learning tool. Built with Next.js." />
    </div>
  );
}
