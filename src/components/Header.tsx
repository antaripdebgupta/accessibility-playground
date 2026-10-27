"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Accessibility, Menu, X } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/playground", label: "Playground" },
  { href: "/contrast", label: "Contrast Checker" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Handle Escape key and outside clicks
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <PageContainer className="flex h-14 items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded py-1 text-sm font-semibold tracking-tight text-[var(--color-text-primary)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          <Accessibility
            className="h-5 w-5 text-[var(--color-accent)]"
            aria-hidden="true"
          />
          <span>Accessibility Playground</span>
        </Link>

        {/* Single Navigation Landmark */}
        <nav aria-label="Main" className="flex items-center">
          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex items-center rounded px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]",
                    active
                      ? "border-b-2 border-[var(--color-accent)] font-semibold text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Disclosure Menu */}
          <div className="relative md:hidden">
            <button
              ref={buttonRef}
              type="button"
              aria-expanded={isOpen}
              aria-controls="mobile-nav-menu"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            >
              {isOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            {isOpen && (
              <div
                id="mobile-nav-menu"
                ref={menuRef}
                className="absolute top-full right-0 mt-2 w-52 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg"
              >
                <div className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => {
                    const active = isItemActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]",
                          active
                            ? "border-l-2 border-[var(--color-accent)] bg-[var(--color-surface-raised)] font-semibold text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]"
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>
      </PageContainer>
    </header>
  );
}
