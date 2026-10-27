import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  primary:
    "bg-[var(--color-accent-default)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)] active:bg-[var(--color-accent-active)] shadow-xs",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-raised)] shadow-xs",
  danger:
    "bg-[var(--color-danger-default)] text-[var(--color-text-inverse)] hover:bg-[var(--color-danger-hover)] active:bg-[var(--color-danger-active)] shadow-xs",
};

const sizeStyles = {
  sm: "h-[1.875rem] px-2 text-sm",
  md: "h-[2.25rem] px-3 text-sm",
  lg: "h-[2.75rem] px-4 text-base",
};

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    { href, variant = "primary", size = "md", className, children, ...props },
    ref
  ) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          "focus-ring-safe inline-flex items-center justify-center gap-2 rounded-[6px] font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,scale] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </Link>
    );
  }
);
ButtonLink.displayName = "ButtonLink";
