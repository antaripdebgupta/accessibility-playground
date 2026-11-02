import { describe, it, expect } from "vitest";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WorkbenchStatusBar } from "@/features/playground/WorkbenchStatusBar";
import { MobilePaneTabs } from "@/features/playground/MobilePaneTabs";

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
