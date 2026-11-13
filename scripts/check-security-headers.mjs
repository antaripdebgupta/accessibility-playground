import { spawn } from "node:child_process";

const customBaseUrl = process.env.BASE_URL;

const routesToCheck = [
  { path: "/", expectSiteHeaders: true },
  { path: "/playground", expectSiteHeaders: true },
  { path: "/preview-frame", expectPreviewHeaders: true },
  { path: "/axe.min.js", expectAxeHeaders: true },
];

async function checkRoute(baseUrl, route) {
  const url = `${baseUrl}${route.path}`;
  const res = await fetch(url);
  const headers = Object.fromEntries(res.headers.entries());

  const results = {
    path: route.path,
    status: res.status,
    headers,
    issues: [],
    grade: "A+",
  };

  if (route.expectSiteHeaders) {
    const csp = headers["content-security-policy"];
    if (!csp) {
      results.issues.push("Missing Content-Security-Policy");
    } else {
      if (!csp.includes("frame-ancestors 'none'"))
        results.issues.push("CSP missing frame-ancestors 'none'");
      if (!csp.includes("object-src 'none'"))
        results.issues.push("CSP missing object-src 'none'");
      if (!csp.includes("base-uri 'self'"))
        results.issues.push("CSP missing base-uri 'self'");
    }

    if (!headers["strict-transport-security"]) {
      results.issues.push("Missing Strict-Transport-Security");
    }

    if (headers["x-content-type-options"] !== "nosniff") {
      results.issues.push("Missing or invalid X-Content-Type-Options");
    }

    if (headers["x-frame-options"] !== "DENY") {
      results.issues.push("Missing or invalid X-Frame-Options (expected DENY)");
    }

    if (headers["referrer-policy"] !== "strict-origin-when-cross-origin") {
      results.issues.push("Missing or invalid Referrer-Policy");
    }

    if (!headers["permissions-policy"]) {
      results.issues.push("Missing Permissions-Policy");
    }

    if (headers["cross-origin-opener-policy"] !== "same-origin") {
      results.issues.push("Missing Cross-Origin-Opener-Policy");
    }

    if (headers["x-powered-by"]) {
      results.issues.push("x-powered-by header is present");
    }
  }

  if (route.expectPreviewHeaders) {
    const csp = headers["content-security-policy"];
    if (!csp) {
      results.issues.push("Missing Content-Security-Policy on preview-frame");
    } else {
      if (!csp.includes("frame-ancestors 'self'"))
        results.issues.push("Preview CSP missing frame-ancestors 'self'");
      if (!csp.includes("connect-src 'none'"))
        results.issues.push("Preview CSP missing connect-src 'none'");
    }

    if (headers["x-frame-options"] !== "SAMEORIGIN") {
      results.issues.push(
        "Missing or invalid X-Frame-Options on preview-frame (expected SAMEORIGIN)"
      );
    }

    if (headers["x-content-type-options"] !== "nosniff") {
      results.issues.push("Missing X-Content-Type-Options on preview-frame");
    }
  }

  if (route.expectAxeHeaders) {
    const cacheControl = headers["cache-control"];
    if (!cacheControl || !cacheControl.includes("max-age=31536000")) {
      results.issues.push(
        "Missing immutable 1-year Cache-Control on /axe.min.js"
      );
    }
    if (headers["cross-origin-resource-policy"] !== "same-origin") {
      results.issues.push(
        "Missing Cross-Origin-Resource-Policy on /axe.min.js"
      );
    }
  }

  if (results.issues.length > 0) {
    results.grade = results.issues.length > 2 ? "F" : "B";
  }

  return results;
}

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status > 0) return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  return false;
}

async function main() {
  let serverProcess = null;
  let baseUrl = customBaseUrl;

  if (!baseUrl) {
    const port = 3456;
    baseUrl = `http://localhost:${port}`;
    serverProcess = spawn("npx", ["next", "start", "-p", String(port)], {
      stdio: "ignore",
    });

    const isUp = await waitForServer(baseUrl);
    if (!isUp) {
      if (serverProcess) serverProcess.kill();
      console.error(`Failed to start test server at ${baseUrl}`);
      process.exit(1);
    }
  }

  console.log(`Checking security headers against ${baseUrl}...`);
  let hasFailures = false;

  try {
    for (const route of routesToCheck) {
      const res = await checkRoute(baseUrl, route);
      console.log(
        `\nRoute: ${res.path} [HTTP ${res.status}] - Grade: ${res.grade}`
      );
      if (res.issues.length === 0) {
        console.log(`  All verified security headers present and valid.`);
      } else {
        hasFailures = true;
        for (const issue of res.issues) {
          console.error(`  - FAIL: ${issue}`);
        }
      }
    }
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }

  if (hasFailures) {
    process.exit(1);
  } else {
    console.log(
      `\nAll route checks passed with Grade A+. Meets securityheaders.com criteria.`
    );
  }
}

main();
