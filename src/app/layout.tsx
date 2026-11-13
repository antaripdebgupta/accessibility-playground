import "@/lib/init-security";
import type { Metadata } from "next";
import { Space_Grotesk, Public_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://accessibility-playground.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Accessibility Playground — a WCAG 2.2 inspector for developers",
    template: "%s — Accessibility Playground",
  },
  description:
    "Paste HTML into a live editor and watch its accessibility tree, ARIA state, and screen-reader announcement compute in real time.",
  openGraph: {
    type: "website",
    siteName: "Accessibility Playground",
    title: "Accessibility Playground — a WCAG 2.2 inspector for developers",
    description:
      "Paste HTML into a live editor and watch its accessibility tree, ARIA state, and screen-reader announcement compute in real time.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility Playground — a WCAG 2.2 inspector for developers",
    description:
      "Live HTML inspector for WCAG 2.2 compliance. No signup required.",
  },
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Accessibility Playground",
  url: siteUrl,
  description:
    "Paste HTML into a live editor and inspect its accessibility tree, ARIA state, and screen-reader announcements in real time.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  browserRequirements: "Requires a modern web browser with JavaScript enabled",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      style={{ colorScheme: "light" }}
      className={`${spaceGrotesk.variable} ${publicSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-[var(--color-canvas)] font-sans text-sm text-[var(--color-text-primary)] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-[var(--color-surface)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--color-text-primary)] focus:shadow-md focus:ring-2 focus:ring-[var(--color-focus-ring)]"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
