import * as React from "react";
import type { Compartment, Extension } from "@codemirror/state";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";

/**
 * Reconfigures a CodeMirror compartment when its extension changes.
 * Skips the initial render to prevent redundant reconfiguration on mount.
 */
export function useCompartment(
  viewRef: React.RefObject<ReactCodeMirrorRef | null>,
  compartment: Compartment,
  extension: Extension
): void {
  const isFirstRender = React.useRef(true);
  const prevExtensionRef = React.useRef(extension);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevExtensionRef.current = extension;
      return;
    }

    if (prevExtensionRef.current === extension) {
      return;
    }
    prevExtensionRef.current = extension;

    const view = viewRef.current?.view;
    if (!view) return;

    view.dispatch({
      effects: compartment.reconfigure(extension),
    });
  }, [viewRef, compartment, extension]);
}
