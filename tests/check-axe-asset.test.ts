import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Build-time axe asset guard", () => {
  it("verifies public/axe.min.js exists, has sufficient size, and contains axe.version", () => {
    const axePath = path.resolve(process.cwd(), "public/axe.min.js");
    expect(fs.existsSync(axePath), "public/axe.min.js must exist").toBe(true);

    const stats = fs.statSync(axePath);
    expect(
      stats.size,
      "public/axe.min.js must be larger than 100KB"
    ).toBeGreaterThan(100_000);

    const content = fs.readFileSync(axePath, "utf8");
    expect(content).toContain("axe.version");
  });
});
