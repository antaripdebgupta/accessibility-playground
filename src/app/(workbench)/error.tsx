"use client";

import * as React from "react";
import { Button } from "@accessly-ui/react";
import { RotateCcw } from "lucide-react";
import { reportError } from "@/lib/report-error";

export default function WorkbenchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    reportError(error, { digest: error.digest, context: "WorkbenchError" });
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
        Workbench error encountered
      </h1>
      <p className="max-w-md text-xs leading-relaxed text-[var(--color-text-secondary)]">
        An error occurred while loading or updating the workbench. Your saved
        snippets and editor settings are preserved in local storage.
      </p>
      <Button
        variant="secondary"
        onClick={() => reset()}
        className="mt-2 gap-2 text-xs"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reload workbench
      </Button>
    </div>
  );
}
