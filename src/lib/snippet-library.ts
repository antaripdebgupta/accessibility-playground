export interface SavedSnippet {
  id: string;
  name: string;
  html: string;
  css: string;
  savedAt: number;
}

const STORAGE_KEY = "a11y-playground:snippets";

export function listSnippets(): SavedSnippet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
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
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota error
    }
  }

  return newSnippet;
}

export function deleteSnippet(id: string): void {
  const snippets = listSnippets();
  const updated = snippets.filter((s) => s.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota error
    }
  }
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
