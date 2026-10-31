import { storage, STORAGE_KEYS } from "@/lib/storage";

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
