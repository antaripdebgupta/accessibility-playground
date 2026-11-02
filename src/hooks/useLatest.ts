import * as React from "react";

/**
 * Keeps a ref synchronised with the latest value.
 * Useful for accessing volatile callbacks/props inside effects and event handlers
 * without adding them to dependency arrays.
 */
export function useLatest<T>(value: T): { readonly current: T } {
  const ref = React.useRef(value);
  React.useInsertionEffect(() => {
    ref.current = value;
  });
  return ref;
}
