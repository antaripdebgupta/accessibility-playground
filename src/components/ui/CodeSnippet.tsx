import * as React from "react";

export interface CodeSnippetProps {
  code: string;
  className?: string;
}

export function CodeSnippet({ code, className = "" }: CodeSnippetProps) {
  return (
    <pre
      tabIndex={0}
      role="region"
      aria-label="Code snippet"
      className={`overflow-x-auto rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-2 font-mono text-xs leading-relaxed text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${className}`}
    >
      <code>{code}</code>
    </pre>
  );
}
