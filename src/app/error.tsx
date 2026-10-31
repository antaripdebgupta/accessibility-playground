"use client";

import * as React from "react";
import { Button } from "@accessly-ui/react";
import { RotateCcw } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { reportError } from "@/lib/report-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    reportError(error, { digest: error.digest, context: "GlobalError" });
  }, [error]);

  return (
    <PageContainer className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
        Something unexpected occurred
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)]">
        An error was caught while rendering this view. You can attempt to
        recover or navigate back to the home page.
      </p>
      <Button
        variant="secondary"
        onClick={() => reset()}
        className="mt-2 gap-2"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Try again
      </Button>
    </PageContainer>
  );
}
