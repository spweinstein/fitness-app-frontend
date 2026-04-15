import { useEffect, useState } from "react";

/**
 * Returns a version of `value` that updates only after `delayMs` of stability.
 * @param {string} value
 * @param {number} delayMs
 */
export function useDebounced(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
