"use client";

import dynamic from "next/dynamic";
import PlaygroundLoading from "./loading";

// ssr:false must live in a Client Component (Next 15/16).
const PlaygroundView = dynamic(
  () =>
    import("@/features/playground/PlaygroundView").then(
      (m) => m.PlaygroundView
    ),
  { ssr: false, loading: () => <PlaygroundLoading /> }
);

export function PlaygroundClient() {
  return <PlaygroundView />;
}
