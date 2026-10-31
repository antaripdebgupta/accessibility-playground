import type { Metadata } from "next";
import { ContrastChecker } from "@/features/contrast/ContrastChecker";

export const metadata: Metadata = {
  title: "Color-Contrast Checker — Accessibility Playground",
  description:
    "Enter a text color and background color to check the contrast ratio against WCAG 2.2 thresholds for normal text, large text, and non-text UI components.",
};

export default function ContrastPage() {
  return (
    <div className="contrast-page flex flex-1 flex-col">
      <section className="page-intro">
        <div className="wrap">
          <h1>Color-Contrast Checker</h1>
          <p>
            Enter a text color and background color to check the contrast ratio
            against WCAG 2.2 thresholds for normal text, large text, and
            non-text UI components.
          </p>
        </div>
      </section>

      <section className="checker-section">
        <div className="wrap">
          <ContrastChecker />
        </div>
      </section>
    </div>
  );
}
