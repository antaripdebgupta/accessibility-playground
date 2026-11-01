import { describe, it, expect, vi } from "vitest";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import {
  computeMinimalDiff,
  applyExternalValue,
  isExternalChange,
} from "@/features/playground/editor/extensions/external-value";
import {
  revealRange,
  revealStateField,
  clearRevealEffect,
} from "@/features/playground/editor/extensions/reveal";
import {
  tabSizeCompartment,
  wrapCompartment,
  fontSizeCompartment,
  createTabSizeExtension,
  createFontSizeExtension,
} from "@/features/playground/editor/compartments";
import { handleWrapSelection } from "@/features/playground/editor/extensions/keymaps";
import {
  createEditorBaseExtensions,
  createHtmlLanguageExtension,
} from "@/features/playground/editor/createEditor";
import { ariaCompletionSource } from "@/features/playground/editor/extensions/completions/aria";
import { idRefCompletionSource } from "@/features/playground/editor/extensions/completions/id-refs";
import { tailwindCompletionSource } from "@/features/playground/editor/extensions/completions/tailwind";
import { CompletionContext } from "@codemirror/autocomplete";
import { buildDiagnostics } from "@/features/playground/editor/extensions/diagnostics";
import { parseHtmlToA11yTree } from "@/lib/a11y-tree";
import type { Finding } from "@/types/a11y";

describe("Part A & B: CodeMirror Editor Enhancements", () => {
  describe("A5: applyExternalValue minimal diff", () => {
    it("returns null for identical values", () => {
      expect(computeMinimalDiff("hello", "hello")).toBeNull();
      expect(computeMinimalDiff("", "")).toBeNull();
    });

    it("computes minimal prefix and suffix diff accurately", () => {
      // Insertion in the middle
      const diff1 = computeMinimalDiff("<p>hello</p>", "<p>hello world</p>");
      expect(diff1).toEqual({
        from: 8,
        to: 8,
        insert: " world",
      });

      // Replacement in the middle
      const diff2 = computeMinimalDiff("<p>old</p>", "<p>new</p>");
      expect(diff2).toEqual({
        from: 3,
        to: 6,
        insert: "new",
      });

      // Deletion at the end
      const diff3 = computeMinimalDiff("abcdef", "abc");
      expect(diff3).toEqual({
        from: 3,
        to: 6,
        insert: "",
      });

      // Insertion at the start
      const diff4 = computeMinimalDiff("world", "hello world");
      expect(diff4).toEqual({
        from: 0,
        to: 0,
        insert: "hello ",
      });
    });

    it("applies minimal diff to view and maps selection intact without reset", () => {
      const container = document.createElement("div");
      const state = EditorState.create({
        doc: "<p>hello</p>",
        selection: { anchor: 8 }, // cursor right after "hello"
      });
      const view = new EditorView({ state, parent: container });

      // Apply external value: change "hello" to "hello world"
      const applied = applyExternalValue(view, "<p>hello world</p>");
      expect(applied).toBe(true);
      expect(view.state.doc.toString()).toBe("<p>hello world</p>");
      // Cursor should be mapped cleanly (still at index 8 or after insertion)
      expect(view.state.selection.main.head).toBe(8);

      // Same value should return false
      const reapplied = applyExternalValue(view, "<p>hello world</p>");
      expect(reapplied).toBe(false);

      view.destroy();
    });

    it("supports full replacement for templates and snippets with undo", () => {
      const container = document.createElement("div");
      const state = EditorState.create({
        doc: "<p>template 1</p>",
      });
      const view = new EditorView({ state, parent: container });

      const applied = applyExternalValue(
        view,
        "<main><h1>Template 2</h1></main>",
        { isFullReplace: true }
      );
      expect(applied).toBe(true);
      expect(view.state.doc.toString()).toBe(
        "<main><h1>Template 2</h1></main>"
      );
      expect(view.state.selection.main.anchor).toBe(0);

      view.destroy();
    });
  });

  describe("A1: Reveal command (leaves selection unchanged)", () => {
    it("dispatches decoration without altering state.selection", () => {
      const container = document.createElement("div");
      const initialDoc = '<main>\n  <button id="btn">Click</button>\n</main>';
      const state = EditorState.create({
        doc: initialDoc,
        extensions: [revealStateField],
        selection: { anchor: 2 }, // User caret at index 2
      });
      const view = new EditorView({ state, parent: container });

      expect(view.state.selection.main.head).toBe(2);

      // Reveal button range [9, 39]
      revealRange(view, [9, 39]);

      // Selection must NOT be changed! User still owns caret at 2!
      expect(view.state.selection.main.head).toBe(2);
      expect(view.state.selection.main.anchor).toBe(2);

      // Decoration must exist
      const decos = view.state.field(revealStateField);
      expect(decos.size).toBe(1);

      let foundFrom = -1;
      let foundTo = -1;
      decos.between(0, initialDoc.length, (from, to) => {
        foundFrom = from;
        foundTo = to;
      });
      expect(foundFrom).toBe(9);
      expect(foundTo).toBe(39);

      // Clear on Escape effect
      view.dispatch({ effects: clearRevealEffect.of() });
      expect(view.state.field(revealStateField).size).toBe(0);

      view.destroy();
    });

    it("clears reveal decoration when user types or edits over the range", () => {
      const container = document.createElement("div");
      const initialDoc = '<div><span id="item">Text</span></div>';
      const state = EditorState.create({
        doc: initialDoc,
        extensions: [revealStateField],
      });
      const view = new EditorView({ state, parent: container });

      revealRange(view, [5, 20]);
      expect(view.state.field(revealStateField).size).toBe(1);

      // User types inside or touches the range
      view.dispatch({
        changes: { from: 7, to: 7, insert: "x" },
      });

      // Decoration should be cleared
      expect(view.state.field(revealStateField).size).toBe(0);

      view.destroy();
    });
  });

  describe("A2: Compartments reconfiguration", () => {
    it("reconfigures tabSize, fontSize, wrap without recreating view or losing doc", () => {
      const container = document.createElement("div");
      const initialDoc = "function test() {\n  return true;\n}";
      const state = EditorState.create({
        doc: initialDoc,
        extensions: [
          tabSizeCompartment.of(createTabSizeExtension(2)),
          fontSizeCompartment.of(createFontSizeExtension(13)),
          wrapCompartment.of([]),
        ],
      });
      const view = new EditorView({ state, parent: container });

      expect(view.state.tabSize).toBe(2);
      expect(view.state.doc.toString()).toBe(initialDoc);

      // Reconfigure tabSize to 4
      view.dispatch({
        effects: tabSizeCompartment.reconfigure(createTabSizeExtension(4)),
      });
      expect(view.state.tabSize).toBe(4);
      expect(view.state.doc.toString()).toBe(initialDoc);

      // Reconfigure fontSize to 16
      view.dispatch({
        effects: fontSizeCompartment.reconfigure(createFontSizeExtension(16)),
      });
      expect(view.state.doc.toString()).toBe(initialDoc);

      // Reconfigure wrap
      view.dispatch({
        effects: wrapCompartment.reconfigure(EditorView.lineWrapping),
      });
      expect(view.state.doc.toString()).toBe(initialDoc);

      view.destroy();
    });
  });

  describe("B3: Completion sources and embedded syntax", () => {
    it("custom completion sources return null outside their valid contexts", () => {
      const state = EditorState.create({
        doc: "Just plain text without tags",
        selection: { anchor: 10 },
      });

      const ctx = new CompletionContext(state, 10, false);

      expect(ariaCompletionSource(ctx)).toBeNull();
      expect(idRefCompletionSource(ctx)).toBeNull();
      expect(tailwindCompletionSource(ctx)).toBeNull();
    });

    it("completions do not throw on malformed HTML", () => {
      const malformed = '<div <<< id=">>> <span aria- unclosed';
      const state = EditorState.create({
        doc: malformed,
        selection: { anchor: 15 },
        extensions: [createHtmlLanguageExtension()],
      });

      const ctx = new CompletionContext(state, 15, false);

      expect(() => ariaCompletionSource(ctx)).not.toThrow();
      expect(() => idRefCompletionSource(ctx)).not.toThrow();
      expect(() => tailwindCompletionSource(ctx)).not.toThrow();
    });
  });

  describe("B7: Inline Diagnostics mapping", () => {
    it("maps findings to valid diagnostics with range bounds and quick fix", () => {
      const html = '<button id="btn-1">Click</button>';
      const { ast } = parseHtmlToA11yTree(html);

      const fakeFinding: Finding = {
        fingerprint: "test-fp",
        ruleId: "button-name",
        engine: "axe-core",
        status: "violation",
        confidence: "high",
        impact: "critical",
        wcag: [{ id: "4.1.2", version: "2.1", level: "A" }],
        help: "Buttons must have discernible text",
        description: "Buttons without text are inaccessible",
        helpUrl: "https://dequeuniversity.com",
        fix: "Add aria-label",
        nodes: [{ targetId: "btn-1", target: ["#btn-1"], html }],
      };

      const onApplyFix = vi.fn();
      const diagnostics = buildDiagnostics(html.length, {
        ast,
        findings: [fakeFinding],
        onApplyFix,
      });

      expect(diagnostics.length).toBe(1);
      expect(diagnostics[0]?.severity).toBe("error");
      expect(diagnostics[0]?.message).toContain("button-name");
      expect(diagnostics[0]?.actions?.length).toBe(1);

      // Execute quick fix action
      diagnostics[0]?.actions?.[0]?.apply(
        {} as EditorView,
        diagnostics[0].from,
        diagnostics[0].to
      );
      expect(onApplyFix).toHaveBeenCalledWith(fakeFinding);
    });

    it("handles HTML parse warnings gracefully as warning diagnostics", () => {
      const diagnostics = buildDiagnostics(10, {
        ast: null,
        findings: [],
        parseError: "Unclosed tag at line 1",
      });

      expect(diagnostics.length).toBe(1);
      expect(diagnostics[0]?.severity).toBe("warning");
      expect(diagnostics[0]?.message).toContain("Unclosed tag");
    });
  });

  describe("B1 & B2: Keymaps, selection wrapping, and base extensions", () => {
    it("assembles base extensions and handles external change isolation", () => {
      const bus = new EventTarget();
      const docChangeSpy = vi.fn();
      bus.addEventListener("docChange", (e) =>
        docChangeSpy((e as CustomEvent).detail)
      );

      const container = document.createElement("div");
      const extensions = createEditorBaseExtensions({
        language: "html",
        settings: {
          autocomplete: true,
          fontSize: 13,
          tabSize: 2,
          lineWrapping: true,
          lineNumbers: true,
        },
        ariaLabel: "Test HTML Editor",
        bus,
      });

      const state = EditorState.create({
        doc: "<p>Hello</p>",
        extensions,
      });
      const view = new EditorView({ state, parent: container });

      // User change triggers docChange on bus
      view.dispatch({
        changes: { from: 8, to: 8, insert: "!" },
      });
      expect(docChangeSpy).toHaveBeenCalledWith("<p>Hello!</p>");
      docChangeSpy.mockClear();

      // External change with isExternalChange annotation does NOT emit docChange
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: "<p>External</p>",
        },
        annotations: [isExternalChange.of(true)],
      });
      expect(docChangeSpy).not.toHaveBeenCalled();

      view.destroy();
    });

    it("wraps selection when typing quotes, brackets, or angle brackets", () => {
      const bus = new EventTarget();
      const container = document.createElement("div");
      const extensions = createEditorBaseExtensions({
        language: "html",
        settings: {
          autocomplete: false,
          fontSize: 13,
          tabSize: 2,
          lineWrapping: true,
          lineNumbers: true,
        },
        ariaLabel: "Test Editor",
        bus,
      });

      const state = EditorState.create({
        doc: "Hello World",
        selection: { anchor: 6, head: 11 }, // "World" selected
        extensions,
      });
      const view = new EditorView({ state, parent: container });

      // Simulate typing '"' via handleWrapSelection
      const handled = handleWrapSelection(view, 6, 11, '"');
      expect(handled).toBe(true);
      expect(view.state.doc.toString()).toBe('Hello "World"');
      // Selection is wrapped inside quotes
      expect(view.state.selection.main.from).toBe(7);
      expect(view.state.selection.main.to).toBe(12);

      view.destroy();
    });
  });
});
