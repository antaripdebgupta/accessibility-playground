import { test, expect } from "@playwright/test";

test.describe("Monitoring and Error Reporting Endpoints", () => {
  test("GET /api/health returns 200 with status ok and version", async ({
    request,
  }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);

    const cacheControl = res.headers()["cache-control"] || "";
    expect(cacheControl).toContain("no-store");

    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.version).toBe("0.1.0");
    expect(data.timestamp).toBeTruthy();
  });

  test("POST /api/report accepts valid scrubbed client error report", async ({
    request,
  }) => {
    const validPayload = {
      name: "TypeError",
      message: "Cannot read property of undefined",
      route: "/playground",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
      context: {
        rule: "img-missing-alt",
        panel: "editor",
      },
    };

    const res = await request.post("/api/report", {
      data: validPayload,
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test("POST /api/report rejects report containing query parameters in route with 400", async ({
    request,
  }) => {
    const invalidPayload = {
      name: "Error",
      message: "Uncaught failure",
      route: "/playground?s=sensitiveData123",
    };

    const res = await request.post("/api/report", {
      data: invalidPayload,
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.ok).toBe(false);
  });
});
