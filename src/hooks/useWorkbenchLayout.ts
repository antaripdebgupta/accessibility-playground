"use client";

import * as React from "react";

import { storage, STORAGE_KEYS } from "@/lib/storage";

export type WorkbenchLayoutPreset =
  "balanced" | "editor-focus" | "preview-focus" | "analysis-focus" | "stacked";

export type MaximizedPane = null | "editor" | "preview" | "analysis";

export interface WorkbenchLayoutState {
  outerPercent: number; // outer split: editor+preview vs analysis (or top vs bottom if stacked)
  innerPercent: number; // inner split: editor vs preview
  direction: "row" | "column";
  maximizedPane: MaximizedPane;
}

const STORAGE_KEY = STORAGE_KEYS.layout;
const LEGACY_SPLIT_KEY = "a11y-playground:split-percent";

const DEFAULT_LAYOUT: WorkbenchLayoutState = {
  outerPercent: 50,
  innerPercent: 55,
  direction: "row",
  maximizedPane: null,
};

let memoryLayout: WorkbenchLayoutState = { ...DEFAULT_LAYOUT };
let isInitialized = false;
const listeners = new Set<() => void>();

function initFromStorage(): WorkbenchLayoutState {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  if (isInitialized) return memoryLayout;

  try {
    let legacyOuter: number | null = null;
    const legacy = storage.get(LEGACY_SPLIT_KEY);
    if (legacy !== null) {
      const parsed = parseFloat(legacy);
      if (!Number.isNaN(parsed) && parsed >= 20 && parsed <= 80) {
        legacyOuter = parsed;
      }
      storage.remove(LEGACY_SPLIT_KEY);
    }

    const raw = storage.get(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryLayout = {
        outerPercent:
          typeof parsed.outerPercent === "number"
            ? parsed.outerPercent
            : (legacyOuter ?? DEFAULT_LAYOUT.outerPercent),
        innerPercent:
          typeof parsed.innerPercent === "number"
            ? parsed.innerPercent
            : DEFAULT_LAYOUT.innerPercent,
        direction: parsed.direction === "column" ? "column" : "row",
        maximizedPane:
          parsed.maximizedPane === "editor" ||
          parsed.maximizedPane === "preview" ||
          parsed.maximizedPane === "analysis"
            ? parsed.maximizedPane
            : null,
      };
    } else if (legacyOuter !== null) {
      memoryLayout = { ...DEFAULT_LAYOUT, outerPercent: legacyOuter };
    }
  } catch {
    // Keep defaults if localStorage is unavailable
  }

  isInitialized = true;
  return memoryLayout;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function updateLayout(
  updater: (prev: WorkbenchLayoutState) => WorkbenchLayoutState
) {
  memoryLayout = updater(memoryLayout);
  storage.set(STORAGE_KEY, JSON.stringify(memoryLayout));
  notify();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): WorkbenchLayoutState {
  initFromStorage();
  return memoryLayout;
}

function getServerSnapshot(): WorkbenchLayoutState {
  return DEFAULT_LAYOUT;
}

export function useWorkbenchLayout() {
  const layout = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setOuterPercent = React.useCallback((value: number) => {
    updateLayout((prev) => ({ ...prev, outerPercent: value }));
  }, []);

  const setInnerPercent = React.useCallback((value: number) => {
    updateLayout((prev) => ({ ...prev, innerPercent: value }));
  }, []);

  const setDirection = React.useCallback((direction: "row" | "column") => {
    updateLayout((prev) => ({ ...prev, direction }));
  }, []);

  const setMaximizedPane = React.useCallback((pane: MaximizedPane) => {
    updateLayout((prev) => ({ ...prev, maximizedPane: pane }));
  }, []);

  const toggleMaximize = React.useCallback(
    (pane: "editor" | "preview" | "analysis") => {
      updateLayout((prev) => ({
        ...prev,
        maximizedPane: prev.maximizedPane === pane ? null : pane,
      }));
    },
    []
  );

  const applyPreset = React.useCallback((preset: WorkbenchLayoutPreset) => {
    switch (preset) {
      case "balanced":
        updateLayout(() => ({
          outerPercent: 50,
          innerPercent: 55,
          direction: "row",
          maximizedPane: null,
        }));
        break;
      case "editor-focus":
        updateLayout(() => ({
          outerPercent: 70,
          innerPercent: 75,
          direction: "row",
          maximizedPane: null,
        }));
        break;
      case "preview-focus":
        updateLayout(() => ({
          outerPercent: 70,
          innerPercent: 30,
          direction: "row",
          maximizedPane: null,
        }));
        break;
      case "analysis-focus":
        updateLayout(() => ({
          outerPercent: 30,
          innerPercent: 50,
          direction: "row",
          maximizedPane: null,
        }));
        break;
      case "stacked":
        updateLayout((prev) => ({
          ...prev,
          outerPercent: 50,
          innerPercent: 50,
          direction: "column",
          maximizedPane: null,
        }));
        break;
    }
  }, []);

  const resetLayout = React.useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    updateLayout(() => ({ ...DEFAULT_LAYOUT }));
  }, []);

  return {
    ...layout,
    setOuterPercent,
    setInnerPercent,
    setDirection,
    setMaximizedPane,
    toggleMaximize,
    applyPreset,
    resetLayout,
  };
}
