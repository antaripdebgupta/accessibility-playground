export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#code-editor-pane"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-48 focus:z-50 focus:rounded-md focus:bg-[var(--color-surface)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--color-text-primary)] focus:shadow-md focus:ring-2 focus:ring-[var(--color-focus-ring)]"
      >
        Skip to code editor
      </a>
      <main
        id="main-content"
        className="flex h-dvh min-h-0 flex-col overflow-hidden"
      >
        {children}
      </main>
    </>
  );
}
