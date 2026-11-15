import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { IssuesPanel } from "@/features/playground/IssuesPanel";
import { AnalysisTabs } from "@/features/playground/AnalysisTabs";
import type { Finding } from "@/types/a11y";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createDummyFinding(id: string): Finding {
  return {
    fingerprint: `fp-${id}`,
    ruleId: `custom-rule-${id}`,
    engine: "playground",
    status: "violation",
    confidence: "high",
    impact: "serious",
    wcag: [{ id: "1.1.1", version: "2.1", level: "A" }],
    help: `Custom issue ${id}`,
    helpUrl: `https://accessly.dev/docs/rules/custom-${id}`,
    description: `Description of custom issue ${id}`,
    nodes: [
      {
        html: `<div data-test="${id}">element</div>`,
        target: [`div[data-test="${id}"]`],
        targetId: `node-${id}`,
      },
    ],
  };
}

describe("IssuesPanel degraded mode & state honesty", () => {
  it("with scanError + 3 custom findings renders banner and 3 rows, with matching badge count", () => {
    const findings: Finding[] = [
      createDummyFinding("1"),
      createDummyFinding("2"),
      createDummyFinding("3"),
    ];

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <IssuesPanel
          findings={findings}
          isScanning={false}
          scanError="axe-core script failed to load"
          hasHtml={true}
        />
      );
    });

    const alertBanner = container.querySelector('[role="alert"]');
    expect(alertBanner).not.toBeNull();
    expect(alertBanner?.textContent).toContain(
      "Automated axe-core scan unavailable"
    );
    expect(alertBanner?.textContent).toContain(
      "axe-core script failed to load"
    );

    // Renders finding rows
    const rows = container.querySelectorAll(
      '[role="article"], .issues-finding-row, button'
    );
    expect(rows.length).toBeGreaterThanOrEqual(3);
    // Verify row contents are present
    expect(container.textContent).toContain("Custom issue 1");
    expect(container.textContent).toContain("Custom issue 2");
    expect(container.textContent).toContain("Custom issue 3");
    expect(container.textContent).toContain("3 violations");

    // Also verify AnalysisTabs tab badge equals the count of 3
    const tabsContainer = document.createElement("div");
    document.body.appendChild(tabsContainer);
    const tabsRoot = createRoot(tabsContainer);

    act(() => {
      tabsRoot.render(
        <AnalysisTabs
          analysisTab="issues"
          onTabChange={() => {}}
          maximizedPane={null}
          onToggleMaximize={() => {}}
          ast={null}
          selectedNode={null}
          activeNodeId={null}
          onSelectNode={() => {}}
          onUpdateAttribute={() => {}}
          onRemoveAttribute={() => {}}
          computedFocusOrder={null}
          onSimulateFocus={() => {}}
          mergedViolations={[]}
          axeIncomplete={[]}
          findings={findings}
          isScanning={false}
          scanError="axe-core script failed to load"
          hasHtml={true}
          onApplyFix={() => {}}
        />
      );
    });

    const tabs = Array.from(
      tabsContainer.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    );
    const issuesTab = tabs.find((t) => t.textContent?.includes("Issues"));
    expect(issuesTab).toBeDefined();
    expect(issuesTab?.textContent).toContain("3");

    act(() => {
      root.unmount();
      tabsRoot.unmount();
    });
    document.body.removeChild(container);
    document.body.removeChild(tabsContainer);
  });

  it("with scanError and 0 findings shows failure message, NOT 'No automated issues detected'", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <IssuesPanel
          findings={[]}
          isScanning={false}
          scanError="Network error loading axe.min.js"
          hasHtml={true}
        />
      );
    });

    expect(container.textContent).not.toContain("No automated issues detected");
    expect(container.textContent).not.toContain("Automated checks passed");
    expect(container.textContent).toContain(
      "Automated scan could not complete"
    );
    expect(container.textContent).toContain("Network error loading axe.min.js");

    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
  });

  it("Retry button calls onForceScan once and uses aria-disabled (not disabled) while scanning", () => {
    const forceScanSpy = vi.fn();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <IssuesPanel
          findings={[]}
          isScanning={false}
          scanError="axe-core failed to load"
          hasHtml={true}
          onForceScan={forceScanSpy}
        />
      );
    });

    const retryButton = container.querySelector(
      'button[aria-label="Retry scan"]'
    ) as HTMLButtonElement;
    expect(retryButton).not.toBeNull();
    expect(retryButton.getAttribute("aria-disabled")).toBe("false");
    expect(retryButton.hasAttribute("disabled")).toBe(false);

    act(() => {
      retryButton.click();
    });

    expect(forceScanSpy).toHaveBeenCalledTimes(1);

    // Now re-render with isScanning=true
    act(() => {
      root.render(
        <IssuesPanel
          findings={[createDummyFinding("1")]}
          isScanning={true}
          scanError="axe-core failed to load"
          hasHtml={true}
          onForceScan={forceScanSpy}
        />
      );
    });

    const scanningRetryButton = container.querySelector(
      'button[aria-label="Retrying scan…"]'
    ) as HTMLButtonElement;
    expect(scanningRetryButton).not.toBeNull();
    expect(scanningRetryButton.getAttribute("aria-disabled")).toBe("true");
    expect(scanningRetryButton.hasAttribute("disabled")).toBe(false);

    // Clicking while aria-disabled does not trigger onForceScan again
    act(() => {
      scanningRetryButton.click();
    });
    expect(forceScanSpy).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
  });
});
