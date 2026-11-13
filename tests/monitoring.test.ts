import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildScrubbedErrorReport, reportError } from "@/lib/report-error";
import { POST as reportRoute } from "@/app/api/report/route";
import { GET as healthRoute } from "@/app/api/health/route";

describe("Error Scrubbing and Sanitization", () => {
  it("scrubs HTML tags, CSS blocks, and share payloads from error messages", () => {
    const maliciousMsg =
      'SyntaxError: <img src="x" onerror="alert(1)"> in <div class="secret">user code</div> { color: red; } ?s=eyJsecretPayload==';
    const error = new Error(maliciousMsg);

    const report = buildScrubbedErrorReport(
      error,
      undefined,
      "/playground?s=secret123#hash"
    );

    expect(report.message).not.toContain("<img");
    expect(report.message).not.toContain("<div");
    expect(report.message).not.toContain("{ color: red; }");
    expect(report.message).not.toContain("eyJsecretPayload==");
    expect(report.message).toContain("[REDACTED_TAG]");
    expect(report.message).toContain("[REDACTED_BLOCK]");
  });

  it("strips query parameters and hashes from the route", () => {
    const error = new Error("Test error");
    const report = buildScrubbedErrorReport(
      error,
      undefined,
      "/playground?s=secretPayload1234567890#section"
    );

    expect(report.route).toBe("/playground");
    expect(report.route).not.toContain("?");
    expect(report.route).not.toContain("#");
  });

  it("whitelists allowed context keys and drops unsafe or user-provided keys", () => {
    const error = new Error("Parser failure");
    const rawContext = {
      rule: "img-missing-alt",
      panel: "editor",
      digest: "12345",
      userHtml: "<button>Secret</button>",
      customCode: "console.log('leaked')",
      token: "secret-token-value",
    };

    const report = buildScrubbedErrorReport(error, rawContext, "/playground");

    expect(report.context).toBeDefined();
    expect(report.context?.rule).toBe("img-missing-alt");
    expect(report.context?.panel).toBe("editor");
    expect(report.context?.digest).toBe("12345");
    expect(report.context).not.toHaveProperty("userHtml");
    expect(report.context).not.toHaveProperty("customCode");
    expect(report.context).not.toHaveProperty("token");
  });

  it("handles non-Error objects and primitives safely", () => {
    const stringReport = buildScrubbedErrorReport("Literal string error");
    expect(stringReport.name).toBe("Error");
    expect(stringReport.message).toBe("Literal string error");

    const objectReport = buildScrubbedErrorReport({
      name: "CustomNamedError",
      message: "Custom message",
    });
    expect(objectReport.name).toBe("CustomNamedError");
    expect(objectReport.message).toBe("Custom message");

    const nullReport = buildScrubbedErrorReport(null);
    expect(nullReport.message).toBe("An unknown error occurred");
  });
});

describe("Client Rate Limiting and Offline Handling", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true })));
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("does not throw when fetch rejects or fails", () => {
    fetchSpy.mockRejectedValue(new Error("Network failure"));
    expect(() => {
      reportError(new Error("Uncaught boom"));
    }).not.toThrow();
  });

  it("does not report errors when navigator is offline", () => {
    const originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, "navigator", {
      value: { onLine: false },
      configurable: true,
    });

    reportError(new Error("Offline error"));
    expect(fetchSpy).not.toHaveBeenCalled();

    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      configurable: true,
    });
  });
});

describe("/api/report Route Handler", () => {
  it("accepts valid scrubbed error reports and returns 200", async () => {
    const validReport = {
      name: "TypeError",
      message: "Cannot read properties of undefined",
      route: "/playground",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
      context: { rule: "img-missing-alt" },
    };

    const req = new Request("http://localhost:3000/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReport),
    });

    const res = await reportRoute(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("rejects payloads with query parameters in route with 400", async () => {
    const invalidReport = {
      name: "Error",
      message: "Some error",
      route: "/playground?s=leak",
    };

    const req = new Request("http://localhost:3000/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidReport),
    });

    const res = await reportRoute(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  it("rejects malformed non-JSON requests with 500", async () => {
    const req = new Request("http://localhost:3000/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await reportRoute(req);
    expect(res.status).toBe(500);
  });
});

describe("/api/health Route Handler", () => {
  it("returns ok status, version, and no-store headers", async () => {
    const res = await healthRoute();
    expect(res.status).toBe(200);

    const cacheControl = res.headers.get("Cache-Control");
    expect(cacheControl).toContain("no-store");

    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.version).toBe("0.1.0");
    expect(data.timestamp).toBeTruthy();
  });
});
