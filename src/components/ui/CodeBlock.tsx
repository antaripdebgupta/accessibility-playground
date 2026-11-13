interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  label?: string;
}

export function CodeBlock({
  code,
  language = "html",
  className = "",
  label,
}: CodeBlockProps) {
  return (
    <div className={`overflow-x-auto rounded-md bg-[#1e1e1e] p-3 ${className}`}>
      <pre
        tabIndex={0}
        role="region"
        aria-label={label ?? `${language.toUpperCase()} code block`}
        className="font-mono text-xs text-white focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
