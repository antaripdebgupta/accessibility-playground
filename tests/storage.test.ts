import { describe, it, expect, beforeEach } from "vitest";
import { storage, STORAGE_KEYS } from "@/lib/storage";

describe("storage utility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves raw strings", () => {
    storage.set(STORAGE_KEYS.html, "<p>hello</p>");
    expect(storage.get(STORAGE_KEYS.html)).toBe("<p>hello</p>");
  });

  it("removes items cleanly", () => {
    storage.set(STORAGE_KEYS.css, "body {}");
    storage.remove(STORAGE_KEYS.css);
    expect(storage.get(STORAGE_KEYS.css)).toBeNull();
  });

  it("validates getJSON with custom guard", () => {
    interface LayoutState {
      preset: string;
    }
    const isLayout = (x: unknown): x is LayoutState =>
      typeof x === "object" && x !== null && "preset" in x;

    storage.set(STORAGE_KEYS.layout, JSON.stringify({ preset: "split-50" }));
    const result = storage.getJSON(STORAGE_KEYS.layout, isLayout);
    expect(result).toEqual({ preset: "split-50" });

    // Corrupted JSON or invalid shape returns null
    storage.set(STORAGE_KEYS.layout, "{not-valid-json");
    expect(storage.getJSON(STORAGE_KEYS.layout, isLayout)).toBeNull();

    storage.set(STORAGE_KEYS.layout, JSON.stringify({ invalid: true }));
    expect(storage.getJSON(STORAGE_KEYS.layout, isLayout)).toBeNull();
  });
});
