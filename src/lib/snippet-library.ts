import { storage, STORAGE_KEYS } from "@/lib/storage";
import { z } from "zod";

export interface SavedSnippet {
  id: string;
  name: string;
  html: string;
  css: string;
  savedAt: number;
}

function isSavedSnippetArray(x: unknown): x is SavedSnippet[] {
  return (
    Array.isArray(x) &&
    x.every(
      (item) =>
        item &&
        typeof item === "object" &&
        "id" in item &&
        "name" in item &&
        "html" in item
    )
  );
}

export function listSnippets(): SavedSnippet[] {
  return storage.getJSON(STORAGE_KEYS.snippets, isSavedSnippetArray) ?? [];
}

export function saveSnippet(
  name: string,
  html: string,
  css: string
): SavedSnippet {
  const snippets = listSnippets();
  const newSnippet: SavedSnippet = {
    id: `snippet-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || "Untitled Snippet",
    html,
    css,
    savedAt: Date.now(),
  };

  const updated = [newSnippet, ...snippets];
  storage.set(STORAGE_KEYS.snippets, JSON.stringify(updated));

  return newSnippet;
}

export function deleteSnippet(id: string): void {
  const snippets = listSnippets();
  const updated = snippets.filter((s) => s.id !== id);
  storage.set(STORAGE_KEYS.snippets, JSON.stringify(updated));
}

export function renameSnippet(id: string, newName: string): void {
  const snippets = listSnippets();
  const updated = snippets.map((s) =>
    s.id === id ? { ...s, name: newName.trim() || "Untitled Snippet" } : s
  );
  storage.set(STORAGE_KEYS.snippets, JSON.stringify(updated));
}

export function duplicateSnippet(id: string): SavedSnippet | null {
  const snippets = listSnippets();
  const original = snippets.find((s) => s.id === id);
  if (!original) return null;
  return saveSnippet(`${original.name} (copy)`, original.html, original.css);
}

/* ────────────────────────────────────────────────────────────
 * Snippet export / import (JSON, zod-validated, size-capped)
 * ──────────────────────────────────────────────────────────── */

/** Max import file size: 2 MB */
export const MAX_IMPORT_SIZE = 2 * 1024 * 1024;

const SnippetExportItemSchema = z.object({
  name: z.string().max(200),
  html: z.string().max(200_000),
  css: z.string().max(200_000).optional().default(""),
});

export const SnippetExportSchema = z.object({
  version: z.literal(1),
  snippets: z.array(SnippetExportItemSchema).min(1).max(500),
});

export type SnippetExportPayload = z.infer<typeof SnippetExportSchema>;

/**
 * Export selected snippets (or all) as a JSON string.
 */
export function exportSnippets(snippetIds?: readonly string[]): string {
  let snippets = listSnippets();
  if (snippetIds) {
    const idSet = new Set(snippetIds);
    snippets = snippets.filter((s) => idSet.has(s.id));
  }
  const payload: SnippetExportPayload = {
    version: 1,
    snippets: snippets.map((s) => ({
      name: s.name,
      html: s.html,
      css: s.css,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

export interface SnippetImportResult {
  readonly success: boolean;
  readonly imported: number;
  readonly error?: string;
}

/**
 * Import snippets from a JSON string. Validates schema and size.
 * Unknown keys are silently ignored per spec.
 */
export function importSnippets(raw: string): SnippetImportResult {
  if (raw.length > MAX_IMPORT_SIZE) {
    return {
      success: false,
      imported: 0,
      error: `File too large (${Math.round(raw.length / 1024)} KB). Maximum is ${MAX_IMPORT_SIZE / 1024} KB.`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { success: false, imported: 0, error: "Invalid JSON file." };
  }

  const result = SnippetExportSchema.safeParse(parsed);
  if (!result.success) {
    return {
      success: false,
      imported: 0,
      error: `Invalid snippet file format: ${result.error.issues[0]?.message ?? "unknown error"}.`,
    };
  }

  const existing = listSnippets();
  const newSnippets: SavedSnippet[] = result.data.snippets.map((s) => ({
    id: `snippet-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: s.name,
    html: s.html,
    css: s.css ?? "",
    savedAt: Date.now(),
  }));

  const updated = [...newSnippets, ...existing];
  storage.set(STORAGE_KEYS.snippets, JSON.stringify(updated));

  return { success: true, imported: newSnippets.length };
}

export function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
