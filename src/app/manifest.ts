import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Accessibility Playground",
    short_name: "A11y Playground",
    description:
      "Paste HTML into a live editor and inspect its accessibility tree, ARIA state, and screen-reader announcements in real time.",
    start_url: "/",
    display: "browser",
    theme_color: "#1d4ed8",
    background_color: "#ffffff",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
