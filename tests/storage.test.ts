import { describe, it, expect, beforeEach, vi } from "vitest";
import { z } from "zod";
import { storage, STORAGE_KEYS } from "@/lib/storage";

describe("storage utility (local and session)", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
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

  it("migrates from legacy unversioned keys seamlessly", () => {
    localStorage.setItem("a11y-playground:last-html", "<main>Legacy</main>");
    expect(storage.get(STORAGE_KEYS.html)).toBe("<main>Legacy</main>");
    // Should now be migrated to the versioned key and removed from legacy
    expect(localStorage.getItem(STORAGE_KEYS.html)).toBe("<main>Legacy</main>");
    expect(localStorage.getItem("a11y-playground:last-html")).toBeNull();
  });

  it("validates getJSON with custom type guard", () => {
    interface LayoutState {
      preset: string;
    }
    const isLayout = (x: unknown): x is LayoutState =>
      typeof x === "object" && x !== null && "preset" in x;

    storage.set(STORAGE_KEYS.layout, JSON.stringify({ preset: "split-50" }));
    const result = storage.getJSON(STORAGE_KEYS.layout, isLayout);
    expect(result).toEqual({ preset: "split-50" });

    // Corrupted JSON returns null
    storage.set(STORAGE_KEYS.layout, "{not-valid-json");
    expect(storage.getJSON(STORAGE_KEYS.layout, isLayout)).toBeNull();

    // Wrong shape returns null
    storage.set(STORAGE_KEYS.layout, JSON.stringify({ invalid: true }));
    expect(storage.getJSON(STORAGE_KEYS.layout, isLayout)).toBeNull();
  });

  it("validates getJSON with Zod schemas", () => {
    const TestSchema = z.object({
      count: z.number(),
      label: z.string(),
    });

    storage.setJSON("test:zod", { count: 42, label: "audit" });
    const result = storage.getJSON("test:zod", TestSchema);
    expect(result).toEqual({ count: 42, label: "audit" });

    // Wrong shape returns null
    storage.setJSON("test:zod", { count: "invalid", label: 123 });
    expect(storage.getJSON("test:zod", TestSchema)).toBeNull();

    // Corrupt JSON returns null
    storage.set("test:zod", "{bad: json");
    expect(storage.getJSON("test:zod", TestSchema)).toBeNull();
  });

  it("supports sessionStorage wrapper identically", () => {
    const SessionSchema = z.object({
      id: z.string(),
      active: z.boolean(),
    });

    storage.session.setJSON("session:test", { id: "s1", active: true });
    expect(storage.session.getJSON("session:test", SessionSchema)).toEqual({
      id: "s1",
      active: true,
    });

    storage.session.remove("session:test");
    expect(storage.session.get("session:test")).toBeNull();
  });

  it("exposes isAvailable and handles storage quota errors safely", () => {
    expect(storage.isAvailable()).toBe(true);
    expect(storage.session.isAvailable()).toBe(true);

    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

    // Should return false and not throw
    const success = storage.set("quota:test", "large data");
    expect(success).toBe(false);

    setItemSpy.mockRestore();
  });
});
