import { describe, it, expect, beforeEach } from "vitest";
import {
  listSnippets,
  saveSnippet,
  deleteSnippet,
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

  it("formats relative timestamps properly", () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 10 * 1000)).toBe("just now");
    expect(formatRelativeTime(now - 5 * 60 * 1000)).toBe("5m ago");
    expect(formatRelativeTime(now - 2 * 3600 * 1000)).toBe("2h ago");
    expect(formatRelativeTime(now - 4 * 86400 * 1000)).toBe("4d ago");
  });
});
