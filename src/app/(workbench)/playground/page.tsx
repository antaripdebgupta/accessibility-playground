import { Suspense } from "react";
import type { Metadata } from "next";
import { PlaygroundClient } from "./PlaygroundClient";
import PlaygroundLoading from "./loading";

interface PlaygroundPageProps {
  searchParams: Promise<{ s?: string; challenge?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PlaygroundPageProps): Promise<Metadata> {
  const params = await searchParams;
  const isShareLink = typeof params.s === "string" && params.s.length > 0;

  return {
    title: "Live HTML Inspection & axe-core Scan",
    description:
      "Test HTML accessibility with live preview, computed accessibility tree, ARIA attribute validity checks, and automated axe-core scans.",
    openGraph: {
      title: "Accessibility Playground — Live HTML Inspection & axe-core Scan",
      description:
        "Test HTML accessibility with live preview, computed accessibility tree, and automated axe-core scans.",
    },
    ...(isShareLink && {
      robots: { index: false, follow: false },
    }),
  };
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundLoading />}>
      <PlaygroundClient />
    </Suspense>
  );
}
