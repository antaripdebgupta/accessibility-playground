import { describe, it, expect } from "vitest";
import {
  safeParseIframeMessage,
  HostSelectNodeMessageSchema,
  HostRunScanMessageSchema,
  HostFocusElementMessageSchema,
} from "@/lib/postmessage-schema";

describe("PostMessage Schema Validation (Task 5d)", () => {
  it("parses valid iframe 'ready' message", () => {
    const msg = safeParseIframeMessage({ type: "ready" });
    expect(msg).not.toBeNull();
    expect(msg!.type).toBe("ready");
  });

  it("parses valid 'element-clicked' message", () => {
    const msg = safeParseIframeMessage({
      type: "element-clicked",
      id: "a11y-3",
    });
    expect(msg).not.toBeNull();
    expect(msg!.type).toBe("element-clicked");
    if (msg?.type === "element-clicked") {
      expect(msg.id).toBe("a11y-3");
    }
  });

  it("parses 'scan-results' message with scanId and findings", () => {
    const payload = {
      type: "scan-results",
      scanId: "scan-12345",
      violations: [
        {
          id: "color-contrast",
          impact: "serious",
          description: "Ensures contrast is sufficient",
          help: "Elements must have sufficient color contrast",
          helpUrl: "https://dequeuniversity.com/rules/axe/4.4/color-contrast",
          nodes: [
            {
              html: "<p>Text</p>",
              target: ["p"],
              failureSummary: "Fix contrast",
              targetId: "a11y-1",
            },
          ],
        },
      ],
      incomplete: [],
    };

    const msg = safeParseIframeMessage(payload);
    expect(msg).not.toBeNull();
    expect(msg!.type).toBe("scan-results");
    if (msg?.type === "scan-results") {
      expect(msg.scanId).toBe("scan-12345");
      expect(msg.violations).toHaveLength(1);
      expect(msg.violations[0]!.id).toBe("color-contrast");
    }
  });

  it("parses 'scan-error' message with scanId", () => {
    const payload = {
      type: "scan-error",
      scanId: "scan-999",
      message: "Timeout occurred",
    };
    const msg = safeParseIframeMessage(payload);
    expect(msg).not.toBeNull();
    expect(msg!.type).toBe("scan-error");
    if (msg?.type === "scan-error") {
      expect(msg.message).toBe("Timeout occurred");
    }
  });

  it("parses 'focus-order' message", () => {
    const payload = {
      type: "focus-order",
      elements: [
        {
          id: "a11y-1",
          tabIndex: 0,
          orderIndex: 1,
          rect: { top: 10, left: 20, width: 100, height: 40 },
        },
      ],
    };
    const msg = safeParseIframeMessage(payload);
    expect(msg).not.toBeNull();
    expect(msg!.type).toBe("focus-order");
  });

  it("parses 'runtime-error' message with error details", () => {
    const payload = {
      type: "runtime-error",
      message: "Uncaught ReferenceError: foo is not defined",
      lineno: 12,
      colno: 5,
      timestamp: new Date().toISOString(),
    };
    const msg = safeParseIframeMessage(payload);
    expect(msg).not.toBeNull();
    expect(msg!.type).toBe("runtime-error");
    if (msg?.type === "runtime-error") {
      expect(msg.message).toContain("foo is not defined");
      expect(msg.lineno).toBe(12);
    }
  });

  it("returns null for malformed or unknown message types", () => {
    expect(safeParseIframeMessage(null)).toBeNull();
    expect(safeParseIframeMessage({})).toBeNull();
    expect(safeParseIframeMessage({ type: "unknown-type" })).toBeNull();
    expect(safeParseIframeMessage({ type: "element-clicked" })).toBeNull(); // missing id
  });

  it("validates host to iframe message schemas", () => {
    const selectMsg = HostSelectNodeMessageSchema.safeParse({
      type: "select-node",
      id: "a11y-2",
    });
    expect(selectMsg.success).toBe(true);

    const scanMsg = HostRunScanMessageSchema.safeParse({
      type: "run-scan",
      scanId: "scan-456",
    });
    expect(scanMsg.success).toBe(true);

    const focusMsg = HostFocusElementMessageSchema.safeParse({
      type: "focus-element",
      id: "a11y-5",
    });
    expect(focusMsg.success).toBe(true);
  });
});
