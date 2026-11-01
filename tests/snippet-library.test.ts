import { describe, it, expect, beforeEach } from "vitest";
import {
  listSnippets,
  saveSnippet,
  deleteSnippet,
  renameSnippet,
  duplicateSnippet,
  exportSnippets,
  importSnippets,
  formatRelativeTime,
} from "@/lib/snippet-library";

describe("Snippet Library storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and lists snippets without colliding with autosave keys", () => {
    localStorage.setItem("a11y-playground:last-html", "<p>Autosave</p>");
    localStorage.setItem("a11y-playground:last-css", "p { color: red; }");

    const snippet = saveSnippet(
      "My Custom Button",
      "<button>Click</button>",
      ".btn { font-size: 16px; }"
    );

    expect(snippet.id).toBeDefined();
    expect(snippet.name).toBe("My Custom Button");

    const list = listSnippets();
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe(snippet.id);
    expect(list[0]?.html).toBe("<button>Click</button>");

    // Autosave keys are completely untouched
    expect(localStorage.getItem("a11y-playground:last-html")).toBe(
      "<p>Autosave</p>"
    );
    expect(localStorage.getItem("a11y-playground:last-css")).toBe(
      "p { color: red; }"
    );
  });

  it("deletes a snippet cleanly", () => {
    const s1 = saveSnippet("First", "<h1>1</h1>", "");
    const s2 = saveSnippet("Second", "<h1>2</h1>", "");

    expect(listSnippets()).toHaveLength(2);

    deleteSnippet(s1.id);
    const afterDelete = listSnippets();
    expect(afterDelete).toHaveLength(1);
    expect(afterDelete[0]?.id).toBe(s2.id);
  });

  it("renames a snippet", () => {
    const snippet = saveSnippet("Original", "<p>Hello</p>", "");
    renameSnippet(snippet.id, "Renamed");
    const list = listSnippets();
    expect(list[0]?.name).toBe("Renamed");
  });

  it("renames to 'Untitled Snippet' if given empty string", () => {
    const snippet = saveSnippet("Original", "<p>Hello</p>", "");
    renameSnippet(snippet.id, "   ");
    const list = listSnippets();
    expect(list[0]?.name).toBe("Untitled Snippet");
  });

  it("duplicates a snippet with '(copy)' suffix", () => {
    const original = saveSnippet("My Form", "<form></form>", ".form {}");
    const copy = duplicateSnippet(original.id);

    expect(copy).not.toBeNull();
    expect(copy!.name).toBe("My Form (copy)");
    expect(copy!.html).toBe("<form></form>");
    expect(copy!.css).toBe(".form {}");
    expect(copy!.id).not.toBe(original.id);
    expect(listSnippets()).toHaveLength(2);
  });

  it("returns null when duplicating non-existent snippet", () => {
    expect(duplicateSnippet("non-existent")).toBeNull();
  });

  it("formats relative timestamps properly", () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 10 * 1000)).toBe("just now");
    expect(formatRelativeTime(now - 5 * 60 * 1000)).toBe("5m ago");
    expect(formatRelativeTime(now - 2 * 3600 * 1000)).toBe("2h ago");
    expect(formatRelativeTime(now - 4 * 86400 * 1000)).toBe("4d ago");
  });
});

describe("Snippet export/import", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exports all snippets as valid JSON", () => {
    saveSnippet("S1", "<p>1</p>", "p {}");
    saveSnippet("S2", "<p>2</p>", "");
    const exported = exportSnippets();
    const parsed = JSON.parse(exported);

    expect(parsed.version).toBe(1);
    expect(parsed.snippets).toHaveLength(2);
    expect(parsed.snippets[0].name).toBeDefined();
    expect(parsed.snippets[0].html).toBeDefined();
  });

  it("exports selected snippets only", () => {
    const s1 = saveSnippet("S1", "<p>1</p>", "");
    saveSnippet("S2", "<p>2</p>", "");
    const exported = exportSnippets([s1.id]);
    const parsed = JSON.parse(exported);

    expect(parsed.snippets).toHaveLength(1);
    expect(parsed.snippets[0].name).toBe("S1");
  });

  it("imports valid snippet file", () => {
    const payload = JSON.stringify({
      version: 1,
      snippets: [
        { name: "Imported", html: "<div>Hello</div>", css: ".x {}" },
      ],
    });
    const result = importSnippets(payload);

    expect(result.success).toBe(true);
    expect(result.imported).toBe(1);
    expect(listSnippets()).toHaveLength(1);
    expect(listSnippets()[0]?.name).toBe("Imported");
  });

  it("round-trips export → import", () => {
    saveSnippet("Round Trip", "<p>trip</p>", "p { margin: 0; }");
    const exported = exportSnippets();
    localStorage.clear();
    expect(listSnippets()).toHaveLength(0);

    const result = importSnippets(exported);
    expect(result.success).toBe(true);
    expect(result.imported).toBe(1);
    const list = listSnippets();
    expect(list[0]?.name).toBe("Round Trip");
    expect(list[0]?.html).toBe("<p>trip</p>");
  });

  it("rejects invalid JSON", () => {
    const result = importSnippets("not json{");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid JSON");
  });

  it("rejects missing version", () => {
    const result = importSnippets(JSON.stringify({ snippets: [] }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid snippet file format");
  });

  it("rejects wrong version", () => {
    const result = importSnippets(
      JSON.stringify({ version: 2, snippets: [{ name: "X", html: "Y" }] })
    );
    expect(result.success).toBe(false);
  });

  it("rejects oversized files", () => {
    const huge = "x".repeat(3 * 1024 * 1024);
    const result = importSnippets(huge);
    expect(result.success).toBe(false);
    expect(result.error).toContain("too large");
  });

  it("ignores unknown keys in import", () => {
    const payload = JSON.stringify({
      version: 1,
      snippets: [
        {
          name: "With Extra",
          html: "<p>extra</p>",
          unknownField: "ignored",
        },
      ],
      extraTopLevel: true,
    });
    const result = importSnippets(payload);
    expect(result.success).toBe(true);
    expect(result.imported).toBe(1);
  });
});
