import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { WorkbenchStatusBar } from "@/features/playground/WorkbenchStatusBar";
import { MobilePaneTabs } from "@/features/playground/MobilePaneTabs";
import { WorkbenchToolbar } from "@/features/playground/WorkbenchToolbar";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("WorkbenchStatusBar", () => {
  it("renders ready state and issue count", () => {
    const html = renderToStaticMarkup(
      <WorkbenchStatusBar
        isScanning={false}
        violationCount={3}
        maximizedPane={null}
        direction="row"
        outerPercent={50}
        onOpenIssues={() => {}}
      />
    );

    expect(html).toContain("Ready");
    expect(html).toContain("3 issues");
  });

  it("displays maximized notice when a pane is maximized", () => {
    const html = renderToStaticMarkup(
      <WorkbenchStatusBar
        isScanning={true}
        violationCount={1}
        maximizedPane="editor"
        direction="column"
        outerPercent={50}
        onOpenIssues={() => {}}
      />
    );

    expect(html).toContain("Scanning…");
    expect(html).toContain("Maximized: editor (Esc to exit)");
    expect(html).toContain("Layout: Stacked");
  });
});

describe("MobilePaneTabs", () => {
  it("renders 3 tabs with accessible tablist semantics", () => {
    const html = renderToStaticMarkup(
      <MobilePaneTabs activePane="editor" onChangePane={() => {}} />
    );

    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('aria-selected="false"');
    expect(html).toContain("editor");
    expect(html).toContain("preview");
    expect(html).toContain("analysis");
  });
});

describe("WorkbenchToolbar - Item 2: Rescan focus and aria-disabled", () => {
  it("uses aria-disabled instead of disabled when isScanning is true", () => {
    const onForceScan = vi.fn();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <WorkbenchToolbar isScanning={true} onForceScan={onForceScan} />
      );
    });

    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    // Must NOT have native disabled attribute (which causes browsers to drop focus to body)
    expect(button?.hasAttribute("disabled")).toBe(false);
    // Must have aria-disabled="true"
    expect(button?.getAttribute("aria-disabled")).toBe("true");
    // Accessible name must contain visible text "Scanning"
    expect(button?.getAttribute("aria-label")).toContain("Scanning");

    // Clicking while scanning must NOT trigger onForceScan
    act(() => {
      button?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true })
      );
    });
    expect(onForceScan).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
  });

  it("activates onForceScan when clicked and isScanning is false", () => {
    const onForceScan = vi.fn();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <WorkbenchToolbar isScanning={false} onForceScan={onForceScan} />
      );
    });

    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(button?.hasAttribute("disabled")).toBe(false);
    expect(button?.getAttribute("aria-disabled")).not.toBe("true");
    expect(button?.getAttribute("aria-label")).toContain("Rescan");

    act(() => {
      button?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true })
      );
    });
    expect(onForceScan).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
  });
});
