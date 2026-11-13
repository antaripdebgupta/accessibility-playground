export interface ScrubbedErrorReport {
  name: string;
  message: string;
  stack?: string;
  route: string;
  version: string;
  timestamp: string;
  context?: Record<string, string>;
}

const MAX_MESSAGE_LENGTH = 300;
const MAX_STACK_LENGTH = 2000;
const MAX_REPORTS_PER_MINUTE = 10;
const DEDUPE_WINDOW_MS = 30000;
const ALLOWED_CONTEXT_KEYS = new Set([
  "digest",
  "context",
  "rule",
  "panel",
  "tab",
  "component",
  "action",
]);

const reportTimestamps: number[] = [];
const recentFingerprints = new Map<string, number>();

function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "[REDACTED_TAG]")
    .replace(/\{[^}]*\}/g, "[REDACTED_BLOCK]")
    .replace(/\?s=[A-Za-z0-9+/=_-]+/g, "?s=[REDACTED]")
    .replace(/#.*$/g, "")
    .replace(/[a-zA-Z0-9_-]{32,}/g, "[REDACTED_HASH]");
}

export function buildScrubbedErrorReport(
  error: unknown,
  context?: Record<string, unknown>,
  pathname?: string
): ScrubbedErrorReport {
  let name = "Error";
  let message = "An unknown error occurred";
  let rawStack: string | undefined;

  if (error instanceof Error) {
    name = error.name || "Error";
    message = error.message || message;
    rawStack = error.stack;
  } else if (typeof error === "string") {
    message = error;
  } else if (error && typeof error === "object") {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.message === "string") {
      message = errObj.message;
    }
    if (typeof errObj.name === "string") {
      name = errObj.name;
    }
  }

  const cleanName = sanitizeText(name).slice(0, 80);
  const cleanMessage = sanitizeText(message).slice(0, MAX_MESSAGE_LENGTH);
  const cleanStack = rawStack
    ? sanitizeText(rawStack).slice(0, MAX_STACK_LENGTH)
    : undefined;

  let route = "/";
  if (typeof pathname === "string" && pathname.startsWith("/")) {
    const rawPath = pathname.split("?")[0] ?? "/";
    route = rawPath.split("#")[0] ?? "/";
  } else if (typeof window !== "undefined" && window.location?.pathname) {
    route = window.location.pathname;
  }

  const cleanContext: Record<string, string> = {};
  if (context && typeof context === "object") {
    for (const [key, value] of Object.entries(context)) {
      if (
        ALLOWED_CONTEXT_KEYS.has(key) &&
        value !== undefined &&
        value !== null
      ) {
        const valStr = sanitizeText(String(value)).slice(0, 100);
        cleanContext[key] = valStr;
      }
    }
  }

  return {
    name: cleanName,
    message: cleanMessage,
    ...(cleanStack ? { stack: cleanStack } : {}),
    route: route.slice(0, 120),
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    ...(Object.keys(cleanContext).length > 0 ? { context: cleanContext } : {}),
  };
}

function shouldThrottle(fingerprint: string, now: number): boolean {
  while (
    reportTimestamps.length > 0 &&
    (reportTimestamps[0] ?? 0) < now - 60000
  ) {
    reportTimestamps.shift();
  }
  if (reportTimestamps.length >= MAX_REPORTS_PER_MINUTE) {
    return true;
  }

  const lastSeen = recentFingerprints.get(fingerprint);
  if (lastSeen !== undefined && now - lastSeen < DEDUPE_WINDOW_MS) {
    return true;
  }

  reportTimestamps.push(now);
  recentFingerprints.set(fingerprint, now);

  if (recentFingerprints.size > 100) {
    for (const [fp, time] of recentFingerprints.entries()) {
      if (now - time > DEDUPE_WINDOW_MS) {
        recentFingerprints.delete(fp);
      }
    }
  }

  return false;
}

export function reportError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  try {
    if (process.env.NODE_ENV !== "production") {
      console.error("Accessibility Playground captured error:", error, context);
    }

    if (typeof window === "undefined") {
      return;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return;
    }

    const payload = buildScrubbedErrorReport(error, context);
    const fingerprint = `${payload.name}:${payload.message.slice(0, 40)}:${payload.route}`;
    const now = Date.now();

    if (shouldThrottle(fingerprint, now)) {
      return;
    }

    void fetch("/api/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
