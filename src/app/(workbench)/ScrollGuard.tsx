"use client";

import * as React from "react";

/**
 * 1. Locks html/body to overflow:hidden while the workbench is mounted so
 *    absolutely-positioned descendants (sr-only, focus badges, etc.) that
 *    escape their containing block cannot grow the document scroll height.
 * 2. Resets main#main-content if anything scrolls it (overflow-clip should
 *    prevent this, but acts as a safety net).
 * 3. Resets document.scrollingElement if its scrollTop/scrollLeft is non-zero.
 */
export function ScrollGuard() {
  React.useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const resetScrollingElement = () => {
      const se = document.scrollingElement;
      if (se && (se.scrollTop !== 0 || se.scrollLeft !== 0)) {
        se.scrollTop = 0;
        se.scrollLeft = 0;
      }
    };

    const el = document.getElementById("main-content");
    const resetMain = () => {
      if (!el) return;
      if (el.scrollLeft !== 0) el.scrollLeft = 0;
      if (el.scrollTop !== 0) el.scrollTop = 0;
    };

    resetScrollingElement();

    el?.addEventListener("scroll", resetMain, { passive: true });
    window.addEventListener("scroll", resetScrollingElement, { passive: true });

    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
      el?.removeEventListener("scroll", resetMain);
      window.removeEventListener("scroll", resetScrollingElement);
    };
  }, []);

  return null;
}
