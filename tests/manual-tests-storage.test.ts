import { describe, it, expect, beforeEach } from "vitest";
import {
  saveManualTestResult,
  loadManualTestResults,
  clearManualTestResults,
  ManualTestRecordSchema,
} from "@/lib/manual-tests-storage";

describe("Manual Tests Storage and Validation (P1-B)", () => {
  const templateId = "test-tmpl-1";

  beforeEach(() => {
    localStorage.clear();
  });

  it("validates that passed status requires no note", () => {
    const res = ManualTestRecordSchema.safeParse({
      testId: "kb-tab-navigation",
      status: "passed",
      updatedAt: new Date().toISOString(),
    });
    expect(res.success).toBe(true);
  });

  it("rejects failed status without a note", () => {
    const res = ManualTestRecordSchema.safeParse({
      testId: "kb-tab-navigation",
      status: "failed",
      updatedAt: new Date().toISOString(),
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toContain("note is required");
    }
  });

  it("rejects failed status with whitespace-only note", () => {
    const res = ManualTestRecordSchema.safeParse({
      testId: "kb-tab-navigation",
      status: "failed",
      note: "   ",
      updatedAt: new Date().toISOString(),
    });
    expect(res.success).toBe(false);
  });

  it("accepts failed status with valid explanation note", () => {
    const res = ManualTestRecordSchema.safeParse({
      testId: "kb-tab-navigation",
      status: "failed",
      note: "Tab order skips the submit button inside the nested form fieldset.",
      updatedAt: new Date().toISOString(),
    });
    expect(res.success).toBe(true);
  });

  it("saves and loads manual test records in localStorage", () => {
    const saveResult = saveManualTestResult(templateId, {
      testId: "kb-focus-visible",
      status: "passed",
      updatedAt: new Date().toISOString(),
    });
    expect(saveResult.success).toBe(true);

    const loaded = loadManualTestResults(templateId);
    expect(loaded["kb-focus-visible"]?.status).toBe("passed");
  });

  it("clears manual test records for a template", () => {
    saveManualTestResult(templateId, {
      testId: "kb-focus-visible",
      status: "passed",
      updatedAt: new Date().toISOString(),
    });
    clearManualTestResults(templateId);
    const loaded = loadManualTestResults(templateId);
    expect(Object.keys(loaded)).toHaveLength(0);
  });
});
