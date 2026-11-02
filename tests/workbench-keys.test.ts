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
});
