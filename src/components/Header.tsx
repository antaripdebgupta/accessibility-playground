"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/playground", label: "Playground" },
  { href: "/contrast", label: "Contrast Checker" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    const basePath = href.split("?")[0];
    return pathname === basePath || pathname.startsWith(basePath + "/");
  };

  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="brand" href="/">
          <svg
            className="brand-mark"
            viewBox="0 0 26 26"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="1"
              y="1"
              width="24"
              height="24"
              rx="6"
              stroke="#1d4ed8"
              strokeWidth="1.6"
            />
            <circle cx="13" cy="8.4" r="1.9" fill="#1d4ed8" />
            <path
              d="M5.6 11.2c3.2 1.4 11.6 1.4 14.8 0"
              stroke="#1d4ed8"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M13 12v5.4M13 17.4l-3.4 4.6M13 17.4l3.4 4.6"
              stroke="#1d4ed8"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Accessibility Playground</span>
        </Link>
        <nav className="primary-nav" aria-label="Main">
          <ul>
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="inline-flex min-h-[36px] items-center"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
