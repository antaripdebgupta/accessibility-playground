import { reportError } from "./report-error";

export const STORAGE_KEYS = {
  html: "a11y-playground:last-html:v1",
  css: "a11y-playground:last-css:v1",
  tailwind: "a11y-playground:use-tailwind:v1",
  layout: "a11y-playground:layout:v1",
  snippets: "a11y-playground:snippets:v1",
  editorSettings: "a11y-playground:editor-settings:v1",
} as const;

// Legacy key aliases for seamless migration without losing user data
const LEGACY_STORAGE_KEYS: Record<string, string> = {
  "a11y-playground:last-html:v1": "a11y-playground:last-html",
  "a11y-playground:last-css:v1": "a11y-playground:last-css",
  "a11y-playground:use-tailwind:v1": "a11y-playground:use-tailwind",
  "a11y-playground:snippets:v1": "a11y-playground:snippets",
};

type ZodLikeSchema<T> = {
  safeParse: (
    data: unknown
  ) => { success: true; data: T } | { success: false; error?: unknown };
};

type SchemaOrGuard<T> = ZodLikeSchema<T> | ((x: unknown) => x is T);

function isStorageAvailable(type: "local" | "session"): boolean {
  if (typeof window === "undefined") return false;
  try {
    const s = type === "local" ? window.localStorage : window.sessionStorage;
    const testKey = "__ap_storage_probe__";
    s.setItem(testKey, "1");
    s.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function parseWithSchemaOrGuard<T>(
  raw: string | null,
  schemaOrGuard: SchemaOrGuard<T>,
  key: string
): T | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof schemaOrGuard === "function") {
      return schemaOrGuard(parsed) ? parsed : null;
    }
    const result = schemaOrGuard.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    reportError(new Error(`Storage shape mismatch for key "${key}"`), {
      key,
      error: result.error,
    });
    return null;
  } catch (err) {
    reportError(err, { operation: "storage.parse", key });
    return null;
  }
}

function createStorageWrapper(type: "local" | "session") {
  const getBackend = (): Storage | null => {
    if (typeof window === "undefined") return null;
    try {
      return type === "local" ? window.localStorage : window.sessionStorage;
    } catch (err) {
      reportError(err, { operation: "storage.access", type });
      return null;
    }
  };

  return {
    isAvailable: (): boolean => isStorageAvailable(type),

    get: (k: string): string | null => {
      try {
        const backend = getBackend();
        if (!backend) return null;
        const val = backend.getItem(k);
        if (val !== null) return val;
        // Check legacy unversioned fallback if applicable
        const legacyKey = LEGACY_STORAGE_KEYS[k];
        if (legacyKey) {
          const legacyVal = backend.getItem(legacyKey);
          if (legacyVal !== null) {
            // Migrate to versioned key
            try {
              backend.setItem(k, legacyVal);
              backend.removeItem(legacyKey);
            } catch {
              // ignore
            }
            return legacyVal;
          }
        }
        return null;
      } catch (err) {
        reportError(err, { operation: "storage.get", key: k, type });
        return null;
      }
    },

    set: (k: string, v: string): boolean => {
      try {
        const backend = getBackend();
        if (!backend) return false;
        backend.setItem(k, v);
        return true;
      } catch (err) {
        reportError(err, { operation: "storage.set", key: k, type });
        return false;
      }
    },

    remove: (k: string): boolean => {
      try {
        const backend = getBackend();
        if (!backend) return false;
        backend.removeItem(k);
        const legacyKey = LEGACY_STORAGE_KEYS[k];
        if (legacyKey) {
          backend.removeItem(legacyKey);
        }
        return true;
      } catch (err) {
        reportError(err, { operation: "storage.remove", key: k, type });
        return false;
      }
    },

    getJSON<T>(k: string, schemaOrGuard: SchemaOrGuard<T>): T | null {
      try {
        const backend = getBackend();
        if (!backend) return null;
        let raw = backend.getItem(k);
        if (raw === null && LEGACY_STORAGE_KEYS[k]) {
          raw = backend.getItem(LEGACY_STORAGE_KEYS[k]!);
        }
        return parseWithSchemaOrGuard(raw, schemaOrGuard, k);
      } catch (err) {
        reportError(err, { operation: "storage.getJSON", key: k, type });
        return null;
      }
    },

    setJSON<T>(k: string, value: T): boolean {
      try {
        const backend = getBackend();
        if (!backend) return false;
        backend.setItem(k, JSON.stringify(value));
        return true;
      } catch (err) {
        reportError(err, { operation: "storage.setJSON", key: k, type });
        return false;
      }
    },
  };
}

const localStorageWrapper = createStorageWrapper("local");
const sessionStorageWrapper = createStorageWrapper("session");

export const storage = {
  ...localStorageWrapper,
  local: localStorageWrapper,
  session: sessionStorageWrapper,
};
