import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-md flex items-center gap-1 font-medium text-[var(--color-text-secondary)] select-none",
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span
            className="text-[var(--color-danger-default)]"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>
    );
  }
);
Label.displayName = "Label";
