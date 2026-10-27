import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "critical"
  | "serious"
  | "moderate"
  | "minor"
  | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-border)]",
  secondary:
    "bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
  success:
    "bg-[var(--color-success-subtle)] text-[var(--color-success-default)] border-[var(--color-success-default)]/20",
  warning:
    "bg-[var(--color-warning-subtle)] text-[var(--color-warning-default)] border-[var(--color-warning-default)]/20",
  danger:
    "bg-[var(--color-danger-subtle)] text-[var(--color-danger-default)] border-[var(--color-danger-default)]/20",
  critical:
    "bg-[var(--color-danger-subtle)] text-[var(--color-danger-default)] font-semibold border-[var(--color-danger-default)]/30",
  serious:
    "bg-[var(--color-warning-subtle)] text-[var(--color-warning-default)] font-semibold border-[var(--color-warning-default)]/30",
  moderate:
    "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-accent)]/25",
  minor:
    "bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
  outline:
    "bg-transparent text-[var(--color-text-primary)] border-[var(--color-border-strong)]",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "text-md inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono font-medium tracking-tight",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
