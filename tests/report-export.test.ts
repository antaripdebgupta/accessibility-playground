import { describe, it, expect, vi, beforeEach } from "vitest";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { useReportExport } from "@/features/playground/hooks/useReportExport";
import * as reportLib from "@/lib/report";
import * as toastLib from "@accessly-ui/react";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("@accessly-ui/react", () => ({
  useToast: vi.fn(),
}));

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

describe("useReportExport", () => {
  const pushToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(toastLib.useToast).mockReturnValue({
      push: pushToast,
      dismiss: vi.fn(),
      toasts: [],
    } as unknown as ReturnType<typeof toastLib.useToast>);
  });

  it("exports JSON report and pushes success toast", () => {
    const downloadSpy = vi
      .spyOn(reportLib, "downloadBlob")
      .mockImplementation(() => {});

    const { result, unmount } = mountHook(() =>
      useReportExport({
        activeDocumentId: "test-document",
        findings: [],
        comparison: null,
      })
    );

    act(() => {
      result.current.handleExportJson();
    });

    expect(downloadSpy).toHaveBeenCalled();
    expect(pushToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Report exported", variant: "success" })
    );
    unmount();
  });

  it("exports CSV report and pushes success toast", () => {
    const downloadSpy = vi
      .spyOn(reportLib, "downloadBlob")
      .mockImplementation(() => {});

    const { result, unmount } = mountHook(() =>
      useReportExport({
        activeDocumentId: "test-document",
        findings: [],
        comparison: null,
      })
    );

    act(() => {
      result.current.handleExportCsv();
    });

    expect(downloadSpy).toHaveBeenCalled();
    expect(pushToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Report exported", variant: "success" })
    );
    unmount();
  });
});
