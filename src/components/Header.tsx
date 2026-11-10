"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/playground", label: "Playground" },
  { href: "/challenges", label: "Challenges" },
  { href: "/learn", label: "Learn" },
  { href: "/contrast", label: "Contrast Checker" },
  { href: "/about", label: "About" },
];

const emptySubscribe = () => () => {};

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [prevPathname, setPrevPathname] = React.useState(pathname);

  // Close menu during render if pathname changes
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Hydration state without cascading render
  const isHydrated = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const headerRef = React.useRef<HTMLElement>(null);

  // Esc closes and returns focus to the button
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Clicking outside closes
  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Resize to desktop closes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 901px)");
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setIsOpen(false);
      }
    };
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    const basePath = href.split("?")[0];
    return pathname === basePath || pathname.startsWith(basePath + "/");
  };

  return (
    <header
      className="site-header"
      ref={headerRef}
      data-hydrated={isHydrated ? "true" : "false"}
    >
      <div className="wrap">
        <Link
          className="brand"
          href="/"
          aria-label="Accessibility Playground — home"
        >
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
          <span className="brand-text">
            <span className="brand-prefix">Accessibility </span>
            Playground
          </span>
        </Link>

        {isHydrated && (
          <button
            ref={buttonRef}
            type="button"
            className="menu-toggle"
            aria-expanded={isOpen}
            aria-controls="primary-nav-list"
            aria-label={
              isOpen
                ? "Close main navigation menu"
                : "Open main navigation menu"
            }
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span className="menu-toggle-icon" aria-hidden="true">
              {isOpen ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              )}
            </span>
            <span className="menu-toggle-text">Menu</span>
          </button>
        )}

        <nav
          className={`primary-nav ${isOpen ? "is-open" : ""}`}
          aria-label="Main"
        >
          <ul id="primary-nav-list">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="inline-flex min-h-[36px] items-center"
                    onClick={() => setIsOpen(false)}
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
