import React from "react";

export interface FooterProps {
  tagline?: string;
}

export function Footer({ tagline }: FooterProps = {}) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <span>
          {tagline ??
            "Accessibility Playground — a WCAG 2.2 inspector, built for developers."}
        </span>
        <a
          href="https://www.w3.org/WAI/WCAG22/quickref/"
          target="_blank"
          rel="noreferrer"
        >
          WCAG 2.2 Quick Reference
        </a>
      </div>
    </footer>
  );
}
