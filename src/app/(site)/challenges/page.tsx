import type { Metadata } from "next";
import { ChallengesClient } from "./ChallengesClient";

export const metadata: Metadata = {
  title: "Accessibility Challenges",
  description:
    "Practice fixing real-world accessibility issues. 10 hands-on challenges covering images, forms, ARIA, keyboard navigation, and more.",
  openGraph: {
    title: "Accessibility Challenges — Accessibility Playground",
    description:
      "Practice fixing real-world accessibility issues with 10 hands-on challenges.",
  },
};

export default function ChallengesPage() {
  return <ChallengesClient />;
}
