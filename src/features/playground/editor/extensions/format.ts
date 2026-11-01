import type { EditorView } from "@codemirror/view";

export interface FormatOptions {
  language: "html" | "css";
  tabSize?: number;
  maxBytes?: number;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

const DEFAULT_MAX_BYTES = 200 * 1024; // 200KB

/**
 * Format document using Prettier standalone with parser-html or parser-postcss.
 * Preserves caret position via formatWithCursor, single undo step, size capped.
 */
export async function formatDocument(
  view: EditorView,
  options: FormatOptions
): Promise<boolean> {
  const currentDoc = view.state.doc.toString();
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;

  if (currentDoc.length > maxBytes) {
    options.onError?.(
      new Error(
        `Document exceeds ${Math.round(maxBytes / 1024)}KB limit for auto-formatting.`
      )
    );
    return false;
  }

  const cursorOffset = view.state.selection.main.head;
  const tabSize = options.tabSize ?? 2;

  try {
    const [prettierModule, htmlPluginModule, postcssPluginModule] =
      await Promise.all([
        import("prettier/standalone"),
        import("prettier/plugins/html"),
        import("prettier/plugins/postcss"),
      ]);

    const prettier = prettierModule.default || prettierModule;
    const htmlPlugin = htmlPluginModule.default || htmlPluginModule;
    const postcssPlugin = postcssPluginModule.default || postcssPluginModule;

    const isHtml = options.language === "html";
    const parser = isHtml ? "html" : "css";
    const plugins = isHtml ? [htmlPlugin] : [postcssPlugin];

    const result = await prettier.formatWithCursor(currentDoc, {
      cursorOffset,
      parser,
      plugins,
      tabWidth: tabSize,
      useTabs: false,
    });

    if (result.formatted === currentDoc) {
      return false;
    }

    const safeCursor = Math.max(
      0,
      Math.min(result.cursorOffset, result.formatted.length)
    );

    view.dispatch({
      changes: { from: 0, to: currentDoc.length, insert: result.formatted },
      selection: { anchor: safeCursor },
      scrollIntoView: true,
      userEvent: "format",
    });

    options.onSuccess?.();
    return true;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    options.onError?.(error);
    return false;
  }
}
