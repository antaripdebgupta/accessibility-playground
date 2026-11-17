import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { useWorkbenchKeys } from "@/features/playground/hooks/useWorkbenchKeys";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function mountHook<T>(hook: () => T): {
  result: { current: T };
  unmount: () => void;
} {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const result: { current: T } = {} as unknown as { current: T };

  function Test() {
    result.current = hook();
    return null;
  }

  act(() => {
    root.render(React.createElement(Test));
  });

  return {
    result,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      document.body.removeChild(container);
    },
  };
}

describe("useWorkbenchKeys", () => {
  it("exits maximized pane on Escape key", () => {
    const setMaximizedPane = vi.fn();
    const { unmount } = mountHook(() =>
      useWorkbenchKeys({
        maximizedPane: "editor",
        setMaximizedPane,
      })
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(setMaximizedPane).toHaveBeenCalledWith(null);
    unmount();
  });

  it("does nothing on Escape if no pane is maximized", () => {
    const setMaximizedPane = vi.fn();
    const { unmount } = mountHook(() =>
      useWorkbenchKeys({
        maximizedPane: null,
        setMaximizedPane,
      })
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(setMaximizedPane).not.toHaveBeenCalled();
    unmount();
  });

  it("cycles targets on F6 key", () => {
    const target1 = document.createElement("div");
    target1.className = "cm-content";
    const parent1 = document.createElement("div");
    parent1.id = "code-editor-pane";
    parent1.appendChild(target1);
    document.body.appendChild(parent1);

    const target2 = document.createElement("button");
    target2.setAttribute("aria-label", "Reload preview");
    document.body.appendChild(target2);

    target1.focus = vi.fn();
    target2.focus = vi.fn();

    const { unmount } = mountHook(() =>
      useWorkbenchKeys({
        maximizedPane: null,
        setMaximizedPane: vi.fn(),
      })
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "F6" }));
    expect(target1.focus).toHaveBeenCalled();

    unmount();
    document.body.removeChild(parent1);
    document.body.removeChild(target2);
  });

  it("Shift+F6 cycles backwards", () => {
    const target1 = document.createElement("div");
    target1.className = "cm-content";
    const parent1 = document.createElement("div");
    parent1.id = "code-editor-pane";
    parent1.appendChild(target1);
    document.body.appendChild(parent1);

    const target2 = document.createElement("button");
    target2.setAttribute("aria-label", "Reload preview");
    document.body.appendChild(target2);

    const tabList = document.createElement("div");
    tabList.setAttribute("role", "tablist");
    const tab = document.createElement("button");
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", "true");
    tabList.appendChild(tab);
    document.body.appendChild(tabList);

    target1.focus = vi.fn();
    target2.focus = vi.fn();
    tab.focus = vi.fn();

    const { unmount } = mountHook(() =>
      useWorkbenchKeys({
        maximizedPane: null,
        setMaximizedPane: vi.fn(),
      })
    );

    // Shift+F6 from index 0 should wrap to last
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "F6", shiftKey: true })
    );
    expect(tab.focus).toHaveBeenCalled();

    unmount();
    document.body.removeChild(parent1);
    document.body.removeChild(target2);
    document.body.removeChild(tabList);
  });

  it("triggers scan on Ctrl+Enter from window", () => {
    const onForceScan = vi.fn();
    const { unmount } = mountHook(() =>
      useWorkbenchKeys({
        maximizedPane: null,
        setMaximizedPane: vi.fn(),
        onForceScan,
        isScanning: false,
      })
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        ctrlKey: true,
        bubbles: true,
      })
    );
    expect(onForceScan).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("does not trigger scan on Ctrl+Enter when already scanning", () => {
    const onForceScan = vi.fn();
    const { unmount } = mountHook(() =>
      useWorkbenchKeys({
        maximizedPane: null,
        setMaximizedPane: vi.fn(),
        onForceScan,
        isScanning: true,
      })
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        ctrlKey: true,
        bubbles: true,
      })
    );
    expect(onForceScan).not.toHaveBeenCalled();
    unmount();
  });

  it("does not trigger scan on Ctrl+Enter when modal is open", () => {
    const onForceScan = vi.fn();
    const { unmount } = mountHook(() =>
      useWorkbenchKeys({
        maximizedPane: null,
        setMaximizedPane: vi.fn(),
        onForceScan,
        isScanning: false,
        isModalOpen: true,
      })
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        ctrlKey: true,
        bubbles: true,
      })
    );
    expect(onForceScan).not.toHaveBeenCalled();
    unmount();
  });

  it("iframe shortcut handler triggers scan on Ctrl+Enter", () => {
    const onForceScan = vi.fn();
    const { result, unmount } = mountHook(() =>
      useWorkbenchKeys({
        maximizedPane: null,
        setMaximizedPane: vi.fn(),
        onForceScan,
        isScanning: false,
      })
    );

    act(() => {
      result.current("Enter", false, true, false);
    });
    expect(onForceScan).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("iframe shortcut handler does not scan when already scanning", () => {
    const onForceScan = vi.fn();
    const { result, unmount } = mountHook(() =>
      useWorkbenchKeys({
        maximizedPane: null,
        setMaximizedPane: vi.fn(),
        onForceScan,
        isScanning: true,
      })
    );

    act(() => {
      result.current("Enter", false, true, false);
    });
    expect(onForceScan).not.toHaveBeenCalled();
    unmount();
  });

  it("iframe F6 shortcut moves focus to next pane (skipping preview which sent it)", () => {
    const target1 = document.createElement("div");
    target1.className = "cm-content";
    const parent1 = document.createElement("div");
    parent1.id = "code-editor-pane";
    parent1.appendChild(target1);
    document.body.appendChild(parent1);

    const target2 = document.createElement("button");
    target2.setAttribute("aria-label", "Reload preview");
    document.body.appendChild(target2);

    const tabList = document.createElement("div");
    tabList.setAttribute("role", "tablist");
    const tab = document.createElement("button");
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", "true");
    tabList.appendChild(tab);
    document.body.appendChild(tabList);

    tab.focus = vi.fn();

    const { result, unmount } = mountHook(() =>
      useWorkbenchKeys({
        maximizedPane: null,
        setMaximizedPane: vi.fn(),
        isDesktop: true,
      })
    );

    // F6 from inside the iframe (preview = index 1) → should move to analysis (index 2)
    act(() => {
      result.current("F6", false, false, false);
    });
    expect(tab.focus).toHaveBeenCalled();

    unmount();
    document.body.removeChild(parent1);
    document.body.removeChild(target2);
    document.body.removeChild(tabList);
  });

  // Unit test for pane-resolution: hidden panes (no DOM node) are skipped
  it("F6 skips panes with no focusable DOM node", () => {
    // Only analysis tab exists, no editor or preview button
    const tabList = document.createElement("div");
    tabList.setAttribute("role", "tablist");
    const tab = document.createElement("button");
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", "true");
    tabList.appendChild(tab);
    document.body.appendChild(tabList);

    tab.focus = vi.fn();

    const { unmount } = mountHook(() =>
      useWorkbenchKeys({
        maximizedPane: null,
        setMaximizedPane: vi.fn(),
      })
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "F6" }));
    expect(tab.focus).toHaveBeenCalled();

    unmount();
    document.body.removeChild(tabList);
  });
});
