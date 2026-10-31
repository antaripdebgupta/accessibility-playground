export const STORAGE_KEYS = {
  html: "a11y-playground:last-html",
  css: "a11y-playground:last-css",
  tailwind: "a11y-playground:use-tailwind",
  layout: "a11y-playground:layout:v1",
  snippets: "a11y-playground:snippets",
  editorSettings: "a11y-playground:editor-settings:v1",
} as const;

export const storage = {
  get: (k: string): string | null => {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string): void => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(k, v);
      }
    } catch {}
  },
  remove: (k: string): void => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(k);
      }
    } catch {}
  },
  getJSON<T>(k: string, guard: (x: unknown) => x is T): T | null {
    try {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem(k);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      return guard(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },
};
