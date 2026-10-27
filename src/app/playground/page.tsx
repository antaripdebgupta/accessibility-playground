import { Suspense } from "react";
import type { Metadata } from "next";
import { PlaygroundView } from "@/features/playground/PlaygroundView";
import PlaygroundLoading from "./loading";

export const metadata: Metadata = {
  title: "Accessibility Playground — Live HTML Inspection & axe-core Scan",
  description:
    "Test HTML accessibility with live preview, computed accessibility tree, ARIA attribute validity checks, and automated axe-core scans.",
};

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundLoading />}>
      <PlaygroundView />
    </Suspense>
  );
}
