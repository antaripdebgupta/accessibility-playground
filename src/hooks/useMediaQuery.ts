"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns whether a CSS media query currently matches.
 * Uses useSyncExternalStore with a server snapshot of `false`
 * so the mobile layout is the SSR default.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false // server snapshot — mobile layout is SSR default
  );
}
