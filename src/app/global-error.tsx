"use client";

import * as React from "react";
import { reportError } from "@/lib/report-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    reportError(error, { digest: error.digest, context: "RootGlobalError" });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-white p-6 font-sans text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <main
          id="main-content"
          role="alert"
          className="w-full max-w-md rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h1 className="mb-2 text-xl font-bold tracking-tight">
            Application Error
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            A critical error prevented the application from loading. You can try
            to recover the session or reload the page.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-neutral-300 bg-transparent px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Reload application
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
