"use client";

import * as React from "react";
import { storage, STORAGE_KEYS } from "@/lib/storage";

export interface EditorSettings {
  autocomplete: boolean;
  fontSize: number; // 12-20
  tabSize: 2 | 4;
  lineWrapping: boolean;
  lineNumbers: boolean;
}

const DEFAULT_SETTINGS: EditorSettings = {
  autocomplete: true,
  fontSize: 13,
  tabSize: 2,
  lineWrapping: true,
  lineNumbers: true,
};

function isEditorSettings(x: unknown): x is EditorSettings {
  if (!x || typeof x !== "object") return false;
  const s = x as Record<string, unknown>;
  return (
    typeof s.autocomplete === "boolean" &&
    typeof s.fontSize === "number" &&
    s.fontSize >= 10 &&
    s.fontSize <= 24 &&
    (s.tabSize === 2 || s.tabSize === 4) &&
    typeof s.lineWrapping === "boolean" &&
    typeof s.lineNumbers === "boolean"
  );
}

export function useEditorSettings() {
  const [settings, setSettings] = React.useState<EditorSettings>(() => {
    return (
      storage.getJSON(STORAGE_KEYS.editorSettings, isEditorSettings) ??
      DEFAULT_SETTINGS
    );
  });

  const updateSetting = React.useCallback(
    <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        storage.set(STORAGE_KEYS.editorSettings, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  return {
    settings,
    updateSetting,
  };
}
