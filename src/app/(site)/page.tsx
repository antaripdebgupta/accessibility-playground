import React from "react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { InspectorDemo } from "@/features/home/InspectorDemo";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-inner">
            <h1>You can&apos;t fix what you can&apos;t see.</h1>
            <p className="lede">
              Paste HTML into a live editor and watch its accessibility tree,
              ARIA state, and screen-reader announcement compute in real time —
              inside a sandboxed, standards-driven inspector.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/playground">
                Open the Playground
              </Link>
              <Link className="btn btn-ghost" href="/challenges">
                Try the challenges
              </Link>
            </div>
            <p className="hero-micro">
              Runs entirely in your browser · no account · <kbd>Tab</kbd> works
              everywhere on this page
            </p>
          </div>
        </div>
      </section>

      {/* Inspector Section */}
      <section className="inspector-section" aria-label="Live demonstration">
        <div className="inspector-canvas">
          <div className="wrap">
            <InspectorDemo />

            <p className="inspector-caption">
              Try pressing <kbd>Tab</kbd> from the buttons above — notice the
              left one is physically impossible to reach. That&apos;s not a bug
              in this demo. That&apos;s the bug.
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="capabilities">
        <div className="wrap">
          <div className="cap-heading">
            <h2>What the inspector shows you</h2>
            <p>
              Six views into the same markup, each answering a question a screen
              reader user is already asking.
            </p>
          </div>
          <div className="cap-list">
            <div className="cap-row">
              <div>
                <h3>Computed accessibility tree</h3>
                <p>
                  The hierarchy a screen reader actually constructs from your
                  markup — not the visual DOM you see in the inspector.
                </p>
              </div>
              <span className="cap-sc">SC 1.3.1</span>
            </div>

            <div className="cap-row">
              <div>
                <h3>ARIA validity</h3>
                <p>
                  Every attribute checked against its role model, and flagged
                  the moment it&apos;s invalid, redundant, or missing something
                  required.
                </p>
              </div>
              <span className="cap-sc">SC 4.1.2</span>
            </div>

            <div className="cap-row">
              <div>
                <h3>Accessible name trace</h3>
                <p>
                  Step through the exact algorithm a browser runs to decide what
                  gets spoken aloud for any element you select.
                </p>
              </div>
              <span className="cap-sc">SC 4.1.2</span>
            </div>

            <div className="cap-row">
              <div>
                <h3>Keyboard &amp; focus order</h3>
                <p>
                  See the real tab sequence your markup produces, and catch a
                  focus trap before a keyboard user finds it for you.
                </p>
              </div>
              <span className="cap-sc">SC 2.1.1</span>
            </div>

            <div className="cap-row">
              <div>
                <h3>Contrast engine</h3>
                <p>
                  Exact ratios for any two colors against AA and AAA thresholds,
                  with a one-click nearest passing suggestion.
                </p>
              </div>
              <span className="cap-sc">SC 1.4.3</span>
            </div>

            <div className="cap-row">
              <div>
                <h3>Sandboxed axe-core scan</h3>
                <p>
                  Automated checks run locally against the rendered preview,
                  isolated in a sandboxed frame with no external calls.
                </p>
              </div>
              <span className="cap-sc">Automated</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="cta-band">
        <div className="wrap">
          <div>
            <h2>See what&apos;s invisible in your own markup.</h2>
            <p>No signup. Paste HTML, get an answer in under a second.</p>
          </div>
          <Link className="btn btn-primary" href="/playground">
            Open the Playground
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
