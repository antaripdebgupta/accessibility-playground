import React from "react";
import { cn } from "@/lib/utils";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  prose?: boolean;
  as?: React.ElementType;
}

export function PageContainer({
  children,
  className,
  prose = false,
  as: Component = "div",
  ...props
}: PageContainerProps) {
  return (
    <Component
      className={cn(
        "w-full px-3 sm:px-4 lg:px-5",
        prose && "[&_p]:max-w-prose",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
