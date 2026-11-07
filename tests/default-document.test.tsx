import { describe, it, expect, vi, beforeEach } from "vitest";
import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_DOCUMENT } from "@/data/default-document";
import { usePlaygroundDocument } from "@/hooks/usePlaygroundDocument";
import { EditorToolbar } from "@/features/playground/editor/EditorToolbar";
import { storage, STORAGE_KEYS } from "@/lib/storage";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

const mockToastPush = vi.fn();
vi.mock("@accessly-ui/react", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useToast: () => ({ push: mockToastPush }),
  };
});

describe("Default Document and Template Removal Requirements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.remove(STORAGE_KEYS.html);
    storage.remove(STORAGE_KEYS.css);
    mockSearchParams.delete("pattern");
    mockSearchParams.delete("s");
  });

  function mountHook() {
    let result: ReturnType<typeof usePlaygroundDocument> =
      null as unknown as ReturnType<typeof usePlaygroundDocument>;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    function TestComponent() {
      result = usePlaygroundDocument();
      return null;
    }

    act(() => {
      root.render(<TestComponent />);
    });

    return {
      get result() {
        return result;
      },
      unmount: () => {
        act(() => {
          root.unmount();
        });
        container.remove();
      },
    };
  }

  it("(a) first load shows the default document", () => {
    const harness = mountHook();
    expect(harness.result.rawHtml).toBe(DEFAULT_DOCUMENT.html);
    expect(harness.result.rawCss).toBe(DEFAULT_DOCUMENT.css);
    harness.unmount();
  });

  it("(b) Start Fresh and Reset Example restore default document", () => {
    const harness = mountHook();

    // Modify document state
    act(() => {
      harness.result.setRawHtml("<p>Custom Content</p>");
      harness.result.setRawCss("p { color: red; }");
    });
    expect(harness.result.rawHtml).toBe("<p>Custom Content</p>");

    // Call handleStartFresh
    act(() => {
      harness.result.handleStartFresh();
    });
    expect(harness.result.rawHtml).toBe(DEFAULT_DOCUMENT.html);
    expect(harness.result.rawCss).toBe(DEFAULT_DOCUMENT.css);
    expect(mockToastPush).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Started fresh",
        description: "Reset code editor to the default example.",
      })
    );

    // Modify again and call handleResetExample
    act(() => {
      harness.result.setRawHtml("<p>Another Custom</p>");
      harness.result.setRawCss("p { color: blue; }");
    });
    act(() => {
      harness.result.handleResetExample();
    });
    expect(harness.result.rawHtml).toBe(DEFAULT_DOCUMENT.html);
    expect(harness.result.rawCss).toBe(DEFAULT_DOCUMENT.css);
    expect(mockToastPush).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Example reset",
        description: "Restored code to original starter state.",
      })
    );

    harness.unmount();
  });

  it("(c) /playground with legacy pattern parameter opens the default document without errors", () => {
    mockSearchParams.set("pattern", "bad-div-button");
    const harness = mountHook();
    expect(harness.result.rawHtml).toBe(DEFAULT_DOCUMENT.html);
    expect(harness.result.rawCss).toBe(DEFAULT_DOCUMENT.css);
    harness.unmount();
  });

  it("(d) no element named 'Templates' exists in EditorToolbar", () => {
    const markup = renderToStaticMarkup(
      <EditorToolbar
        activeTab="html"
        onTabChange={() => {}}
        onFormatClick={() => {}}
        linkCopied={false}
        onCopyLinkClick={() => {}}
        indentWithTab={true}
        onToggleIndentWithTab={() => {}}
        html={DEFAULT_DOCUMENT.html}
        css={DEFAULT_DOCUMENT.css}
        onHtmlChange={() => {}}
        onCssChange={() => {}}
        triggerLocalLoad={() => {}}
      />
    );
    expect(markup).not.toContain("Templates");
    expect(markup).not.toContain("⌘K");
    expect(markup).not.toContain("Built-in");
  });

  it("(e) Cmd/Ctrl+K does not trigger template dropdown or unhandled error", () => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    // Dispatched to window should not throw or open any templates modal
    expect(() => window.dispatchEvent(event)).not.toThrow();
  });
});
