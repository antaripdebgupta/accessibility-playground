/**
 * Centralized error reporting utility.
 * Can be hooked into Sentry, Datadog, or other telemetry in production.
 */
export function reportError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV !== "production") {
    console.error("Accessibility Playground captured error:", error, context);
  }
  // Production reporting service can be integrated here.
}
